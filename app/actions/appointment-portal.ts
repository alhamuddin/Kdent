"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/auth";
import { prisma } from "@/app/libs/prisma";
import {
  requireAppointmentManager,
  getCurrentUserRole,
  requireStaffAccess,
} from "@/app/libs/authorization";
import { transporter } from "@/app/libs/nodemailer";
import * as z from "zod";

const bookingSchema = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().max(80).optional().default(""),
  phone: z.string().trim().min(1).max(40),
  email: z
    .union([z.literal(""), z.email()])
    .optional()
    .default(""),
  heightCm: z
    .union([z.literal(""), z.coerce.number().min(30).max(250)])
    .optional(),
  weightKg: z
    .union([z.literal(""), z.coerce.number().min(1).max(400)])
    .optional(),
  doctorId: z.string().min(1),
  scheduledAt: z.iso.datetime(),
  chiefComplaint: z.string().trim().min(1).max(1000),
});

const offlineBookingSchema = bookingSchema.extend({
  patientId: z.string().trim().optional(),
});

async function findScheduleForAppointment(doctorId: string, scheduledAt: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Dhaka",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(scheduledAt);
  const weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(
    parts.find((part) => part.type === "weekday")?.value ?? "",
  );
  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? "0");
  const minute = Number(
    parts.find((part) => part.type === "minute")?.value ?? "0",
  );
  const minuteOfDay = hour * 60 + minute;
  const schedules = await prisma.doctorSchedule.findMany({
    where: { doctorId, weekday, enabled: true },
    orderBy: { startTime: "asc" },
  });

  return schedules.find((schedule) => {
    const start =
      Number(schedule.startTime.slice(0, 2)) * 60 +
      Number(schedule.startTime.slice(3));
    const end =
      Number(schedule.endTime.slice(0, 2)) * 60 +
      Number(schedule.endTime.slice(3));
    return (
      minuteOfDay >= start &&
      minuteOfDay + schedule.slotMinutes <= end
    );
  });
}

function clinicDateRange(scheduledAt: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(scheduledAt);
  const date = `${parts.find((part) => part.type === "year")?.value}-${parts.find((part) => part.type === "month")?.value}-${parts.find((part) => part.type === "day")?.value}`;
  const start = new Date(`${date}T00:00:00+06:00`);
  return { start, end: new Date(start.getTime() + 86400000) };
}

async function reindexAcceptedSerials(
  client: Pick<typeof prisma, "appointment">,
  doctorId: string,
  scheduledAt: Date,
  targetAppointmentId?: string,
): Promise<number | null> {
  const { start, end } = clinicDateRange(scheduledAt);
  const appointments = await client.appointment.findMany({
    where: {
      doctorId,
      status: "ACCEPTED",
      scheduledAt: { gte: start, lt: end },
    },
    select: { id: true, acceptedAt: true, createdAt: true },
  });
  appointments.sort((a, b) => {
    const acceptanceTime = (a.acceptedAt ?? a.createdAt).getTime() -
      (b.acceptedAt ?? b.createdAt).getTime();
    return acceptanceTime || a.id.localeCompare(b.id);
  });
  let targetSerial: number | null = null;
  for (const [index, appointment] of appointments.entries()) {
    const serialNumber = index + 1;
    if (appointment.id === targetAppointmentId) targetSerial = serialNumber;
    await client.appointment.update({
      where: { id: appointment.id },
      data: { serialNumber },
    });
  }
  return targetSerial;
}

export async function getPublicAppointmentOptions() {
  const doctors = await prisma.doctor.findMany({
    where: { schedules: { some: { enabled: true } } },
    orderBy: [{ firstName: "asc" }],
    select: {
      id: true,
      firstName: true,
      lastName: true,
      specialty: true,
      schedules: {
        orderBy: [{ weekday: "asc" }, { startTime: "asc" }],
      },
    },
  });
  return { doctors: doctors.map((d) => ({ ...d, schedules: d.schedules })) };
}

export async function getManageableAppointmentDoctors() {
  const { session, role } = await requireAppointmentManager();
  if (role === "ASSISTANT") {
    const doctors = await prisma.doctor.findMany({
      orderBy: [{ firstName: "asc" }],
      select: { id: true, firstName: true, lastName: true },
    });
    return doctors.map((doctor) => ({ ...doctor, schedules: [] }));
  }

  const doctors = await prisma.doctor.findMany({
    where: role === "DOCTOR" ? { userId: session.user.id } : undefined,
    orderBy: [{ firstName: "asc" }],
    select: {
      id: true,
      firstName: true,
      lastName: true,
      schedules: {
        orderBy: [{ weekday: "asc" }, { startTime: "asc" }],
      },
    },
  });
  return doctors;
}

export async function submitOnlineAppointment(input: unknown) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return { error: "Sign in to request an appointment." };
  const parsed = bookingSchema.safeParse(input);
  if (!parsed.success)
    return {
      error:
        parsed.error.issues[0]?.message ?? "Check the appointment details.",
    };
  const data = parsed.data;
  const scheduledAt = new Date(data.scheduledAt);
  if (scheduledAt <= new Date())
    return { error: "Choose a future appointment time." };
  if (
    scheduledAt.getUTCSeconds() !== 0 ||
    scheduledAt.getUTCMilliseconds() !== 0
  )
    return { error: "Choose an exact schedule time." };
  const doctor = await prisma.doctor.findUnique({
    where: { id: data.doctorId },
    select: { id: true },
  });
  if (!doctor) return { error: "Choose an available doctor." };
  const schedule = await findScheduleForAppointment(doctor.id, scheduledAt);
  if (!schedule)
    return { error: "Choose a time within the doctor's published schedule." };
  const existingRequest = await prisma.appointment.findFirst({
    where: {
      doctorId: doctor.id,
      scheduledAt,
      status: { in: ["PENDING", "ACCEPTED"] },
    },
    select: { id: true },
  });
  if (existingRequest)
    return {
      error: "That time was just booked. Choose another available time.",
    };

  try {
    let patient = await prisma.patient.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!patient) {
      const existingUnlinked = await prisma.patient.findFirst({
        where: {
          userId: null,
          OR: [
            { email: session.user.email },
            ...(data.email ? [{ email: data.email }] : []),
            ...(data.phone ? [{ phone: data.phone }] : []),
          ],
        },
        orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
        select: { id: true },
      });

      if (existingUnlinked) {
        patient = await prisma.patient.update({
          where: { id: existingUnlinked.id },
          data: {
            userId: session.user.id,
            firstName: data.firstName,
            lastName: data.lastName || null,
            phone: data.phone,
            email: data.email || session.user.email,
            ...(data.heightCm !== "" && data.heightCm !== undefined
              ? { heightCm: data.heightCm }
              : {}),
            ...(data.weightKg !== "" && data.weightKg !== undefined
              ? { weightKg: data.weightKg }
              : {}),
          },
          select: { id: true },
        });
      }
    }

    if (patient) {
      await prisma.patient.update({
        where: { id: patient.id },
        data: {
          firstName: data.firstName,
          lastName: data.lastName || null,
          phone: data.phone,
          email: data.email || session.user.email,
          ...(data.heightCm !== "" && data.heightCm !== undefined
            ? { heightCm: data.heightCm }
            : {}),
          ...(data.weightKg !== "" && data.weightKg !== undefined
            ? { weightKg: data.weightKg }
            : {}),
        },
      });
    } else {
      patient = await prisma.patient.create({
        data: {
          patientNumber: `KD-${new Date().getFullYear()}-${randomUUID().slice(0, 8).toUpperCase()}`,
          firstName: data.firstName,
          lastName: data.lastName || null,
          phone: data.phone,
          email: data.email || session.user.email,
          heightCm: data.heightCm === "" ? null : data.heightCm,
          weightKg: data.weightKg === "" ? null : data.weightKg,
          userId: session.user.id,
        },
        select: { id: true },
      });
    }

    await prisma.appointment.create({
      data: {
        patientId: patient.id,
        doctorId: doctor.id,
        scheduledAt,
        chiefComplaint: data.chiefComplaint,
        status: "PENDING",
        source: "ONLINE",
        requestedByUserId: session.user.id,
        clinicName: schedule.clinicName,
        clinicAddress: schedule.clinicAddress,
      },
    });
    revalidatePath("/dashboard");
    return {
      success:
        "Appointment request sent. You will receive an email after the doctor responds.",
    };
  } catch (error) {
    console.error("Online appointment request failed", error);
    return { error: "Your appointment request could not be saved." };
  }
}

export async function loadPatientPortal() {
  const { session, role } = await getCurrentUserRole();
  if (role !== "USER")
    return { isPatient: false, appointments: [], visits: [] };
  const [firstName, ...lastNameParts] = session.user.name.trim().split(/\s+/);
  let patient = await prisma.patient.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!patient) {
    const unlinked = await prisma.patient.findFirst({
      where: { userId: null, email: session.user.email },
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
      select: { id: true },
    });
    if (unlinked) {
      patient = await prisma.patient.update({
        where: { id: unlinked.id },
        data: { userId: session.user.id, isRegistered: true },
        select: { id: true },
      });
    } else {
      patient = await prisma.patient.create({
        data: {
          patientNumber: `KD-${new Date().getFullYear()}-${randomUUID().slice(0, 8).toUpperCase()}`,
          firstName: firstName || session.user.email,
          lastName: lastNameParts.join(" ") || null,
          email: session.user.email,
          userId: session.user.id,
          isRegistered: true,
        },
        select: { id: true },
      });
    }
  }
  const [appointments, visits] = await Promise.all([
    prisma.appointment.findMany({
      where: { patientId: patient.id },
      orderBy: { scheduledAt: "desc" },
      select: {
        id: true,
        scheduledAt: true,
        status: true,
        serialNumber: true,
        chiefComplaint: true,
        clinicName: true,
        clinicAddress: true,
        doctor: { select: { firstName: true, lastName: true } },
      },
    }),
    prisma.prescription.findMany({
      where: { patientId: patient.id, status: "ISSUED" },
      orderBy: { issuedAt: "desc" },
      select: {
        id: true,
        prescriptionNo: true,
        issuedAt: true,
        chiefComplaint: true,
        diagnoses: { select: { diagnosis: { select: { name: true } } } },
        medications: {
          select: { medicineName: true, dose: true, frequency: true },
        },
      },
    }),
  ]);
  const now = Date.now();
  return {
    isPatient: true,
    appointments: appointments.map((a) => ({
      ...a,
      scheduledAt: a.scheduledAt.toISOString(),
      canCancel:
        a.status === "ACCEPTED" &&
        a.scheduledAt.getTime() - now >= 6 * 60 * 60 * 1000,
    })),
    visits: visits.map((v) => ({ ...v, issuedAt: v.issuedAt.toISOString() })),
  };
}

export async function cancelPatientAppointment(appointmentId: string) {
  const { session, role } = await getCurrentUserRole();
  if (role !== "USER") return { error: "Patient access is required." };
  const appointment = await prisma.appointment.findFirst({
    where: {
      id: appointmentId,
      patient: { userId: session.user.id },
      status: { in: ["PENDING", "ACCEPTED"] },
    },
    select: { id: true, scheduledAt: true },
  });
  if (
    !appointment ||
    appointment.scheduledAt.getTime() - Date.now() < 6 * 60 * 60 * 1000
  )
    return {
      error: "Appointments can be cancelled up to 6 hours before the visit.",
    };
  await prisma.appointment.update({
    where: { id: appointment.id },
    data: { status: "CANCELLED" },
  });
  revalidatePath("/dashboard");
  return { success: true };
}

export async function listAppointmentRequests() {
  const { session, role } = await requireStaffAccess();
  const doctor =
    role === "DOCTOR"
      ? await prisma.doctor.findUnique({
          where: { userId: session.user.id },
          select: { id: true },
        })
      : null;
  const scope = role === "DOCTOR" ? { doctorId: doctor?.id ?? "" } : {};
  const include = {
    patient: {
      select: {
        id: true,
        patientNumber: true,
        firstName: true,
        lastName: true,
        phone: true,
        email: true,
        dateOfBirth: true,
        sex: true,
        bloodGroup: true,
        heightCm: true,
        weightKg: true,
      },
    },
    doctor: { select: { id: true, firstName: true, lastName: true } },
  } as const;
  const appointments = await prisma.appointment.findMany({
    where: scope,
    orderBy: { createdAt: "asc" },
    include,
  });
  return appointments.map((a) => ({
    ...a,
    scheduledAt: a.scheduledAt.toISOString(),
    createdAt: a.createdAt.toISOString(),
    acceptedAt: a.acceptedAt?.toISOString() ?? null,
    patient: {
      ...a.patient,
      dateOfBirth: a.patient.dateOfBirth?.toISOString().slice(0, 10) ?? "",
      heightCm: a.patient.heightCm?.toString() ?? "",
      weightKg: a.patient.weightKg?.toString() ?? "",
    },
  }));
}

export async function respondToAppointment(
  appointmentId: string,
  decision: "ACCEPTED" | "REJECTED",
) {
  if (decision !== "ACCEPTED" && decision !== "REJECTED")
    return { error: "Choose accept or reject." };
  const { session, role } = await getCurrentUserRole();
  if (decision === "ACCEPTED" && role !== "DOCTOR")
    return { error: "Only the assigned doctor can accept an appointment." };
  if (decision === "REJECTED" && role !== "ADMIN" && role !== "DOCTOR")
    return { error: "Only a doctor or admin can reject an appointment." };
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: { patient: true, doctor: true },
  });
  if (!appointment || appointment.status !== "PENDING")
    return { error: "This request is no longer pending." };
  if (role === "DOCTOR" && appointment.doctor.userId !== session.user.id)
    return { error: "You can only respond to appointments assigned to you." };
  const acceptedAt = new Date();
  let serialNumber: number | null = null;
  await prisma.$transaction(async (transaction) => {
    await transaction.appointment.update({
      where: { id: appointment.id },
      data: {
        status: decision,
        acceptedAt: decision === "ACCEPTED" ? acceptedAt : null,
        serialNumber: null,
      },
    });
    if (decision === "ACCEPTED") {
      await transaction.patient.update({
        where: { id: appointment.patientId },
        data: { isRegistered: true },
      });
      serialNumber = await reindexAcceptedSerials(
        transaction,
        appointment.doctorId,
        appointment.scheduledAt,
        appointment.id,
      );
    }
  });
  let emailDelivered = false;
  if (appointment.patient.email) {
    try {
      await transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: appointment.patient.email,
        subject: `Appointment ${decision === "ACCEPTED" ? "accepted" : "update"} - K-Dent`,
        text:
          decision === "ACCEPTED"
            ? `Your appointment with Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName ?? ""} is accepted for ${appointment.scheduledAt.toLocaleString()}${appointment.clinicName ? ` at ${appointment.clinicName}` : ""}${appointment.clinicAddress ? `, ${appointment.clinicAddress}` : ""}. Your serial number is ${serialNumber}.`
            : `Your appointment request for ${appointment.scheduledAt.toLocaleString()} was not accepted. Please contact the clinic to arrange another time.`,
      });
      emailDelivered = true;
    } catch (emailError) {
      console.error(
        "Appointment status saved, but email delivery failed:",
        emailError,
      );
    }
  }
  revalidatePath("/dashboard");
  return {
    success:
      decision === "ACCEPTED"
        ? emailDelivered
          ? "Appointment accepted and patient emailed."
          : "Appointment accepted. Email delivery could not be confirmed."
        : "Appointment request rejected.",
  };
}

export async function searchPatientsForOfflineBooking(query: string) {
  await requireStaffAccess();
  const normalized = typeof query === "string" ? query.trim().slice(0, 100) : "";
  if (normalized.length < 1) return { patients: [] };

  const terms = normalized.split(/\s+/).filter(Boolean).slice(0, 4);

  try {
    const patients = await prisma.patient.findMany({
      where: {
        AND: terms.map((term) => ({
          OR: [
            { firstName: { contains: term, mode: "insensitive" } },
            { lastName: { contains: term, mode: "insensitive" } },
            { phone: { contains: term, mode: "insensitive" } },
            { patientNumber: { contains: term, mode: "insensitive" } },
          ],
        })),
      },
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
      take: 20,
      select: {
        id: true,
        patientNumber: true,
        firstName: true,
        lastName: true,
        phone: true,
        email: true,
        dateOfBirth: true,
        sex: true,
        bloodGroup: true,
        heightCm: true,
        weightKg: true,
        _count: {
          select: {
            appointments: true,
            prescriptions: true,
          },
        },
      },
    });

    return {
      patients: patients.map((patient) => ({
        id: patient.id,
        patientNumber: patient.patientNumber,
        firstName: patient.firstName,
        lastName: patient.lastName ?? "",
        phone: patient.phone ?? "",
        email: patient.email ?? "",
        dateOfBirth: patient.dateOfBirth?.toISOString().slice(0, 10) ?? "",
        sex: patient.sex,
        bloodGroup: patient.bloodGroup ?? "",
        heightCm: patient.heightCm?.toString() ?? "",
        weightKg: patient.weightKg?.toString() ?? "",
        visitCount: patient._count.appointments + patient._count.prescriptions,
      })),
    };
  } catch (error) {
    console.error("Patient search for offline booking failed:", error);
    return { error: "Patient search failed. Please try again." };
  }
}

export async function createOfflineAppointment(input: unknown) {
  const access = await requireStaffAccess();
  if (access.role !== "ADMIN" && access.role !== "ASSISTANT") {
    return {
      error: "Only an assistant or admin can add an offline appointment.",
    };
  }
  const parsed = offlineBookingSchema.safeParse(input);
  if (!parsed.success)
    return {
      error:
        parsed.error.issues[0]?.message ??
        "Check the patient and appointment details.",
    };
  const d = parsed.data;
  const scheduledAt = new Date(d.scheduledAt);
  if (scheduledAt <= new Date())
    return { error: "Choose a future appointment time." };
  const matchingSchedule = await findScheduleForAppointment(
    d.doctorId,
    scheduledAt,
  );
  const conflict = await prisma.appointment.findFirst({
    where: {
      doctorId: d.doctorId,
      scheduledAt,
      status: { in: ["PENDING", "ACCEPTED"] },
    },
    select: { id: true },
  });
  if (conflict) return { error: "Another appointment already uses that time." };

  let existingPatient = null;
  if (d.patientId) {
    existingPatient = await prisma.patient.findUnique({
      where: { id: d.patientId },
      select: { id: true },
    });
  }

  if (!existingPatient && d.phone) {
    existingPatient = await prisma.patient.findFirst({
      where: { phone: d.phone },
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
      select: { id: true },
    });
  }

  let patientId: string;
  if (existingPatient) {
    patientId = existingPatient.id;
    await prisma.patient.update({
      where: { id: patientId },
      data: {
        firstName: d.firstName,
        lastName: d.lastName || null,
        phone: d.phone,
        email: d.email || null,
        ...(d.heightCm !== "" && d.heightCm !== undefined ? { heightCm: d.heightCm } : {}),
        ...(d.weightKg !== "" && d.weightKg !== undefined ? { weightKg: d.weightKg } : {}),
      },
    });
  } else {
    const patient = await prisma.patient.create({
      data: {
        patientNumber: `KD-${new Date().getFullYear()}-${randomUUID().slice(0, 8).toUpperCase()}`,
        firstName: d.firstName,
        lastName: d.lastName || null,
        phone: d.phone,
        email: d.email || null,
        heightCm: d.heightCm === "" ? null : d.heightCm,
        weightKg: d.weightKg === "" ? null : d.weightKg,
        isRegistered: false,
      },
      select: { id: true },
    });
    patientId = patient.id;
  }

  await prisma.appointment.create({
    data: {
      patientId,
      doctorId: d.doctorId,
      scheduledAt,
      chiefComplaint: d.chiefComplaint,
      status: "PENDING",
      source: "OFFLINE",
      clinicName: matchingSchedule?.clinicName ?? null,
      clinicAddress: matchingSchedule?.clinicAddress ?? null,
    },
  });
  revalidatePath("/dashboard");
  return {
    success: "Offline appointment added to the doctor's pending requests.",
  };
}

export async function editAppointment(input: unknown) {
  const access = await requireAppointmentManager();
  const parsed = z
    .object({
      appointmentId: z.string().min(1),
      doctorId: z.string().min(1),
      scheduledAt: z.iso.datetime(),
      chiefComplaint: z.string().trim().min(1).max(1000),
      firstName: z.string().trim().min(1).max(80),
      lastName: z.string().trim().max(80),
      phone: z.string().trim().max(40),
      email: z.union([z.literal(""), z.email()]),
      dateOfBirth: z.union([z.literal(""), z.iso.date()]),
      sex: z.enum(["MALE", "FEMALE", "OTHER", "UNKNOWN"]),
      bloodGroup: z.string().trim().max(5),
      heightCm: z.union([z.literal(""), z.coerce.number().min(30).max(250)]),
      weightKg: z.union([z.literal(""), z.coerce.number().min(1).max(400)]),
      clinicName: z.string().trim().max(120),
      clinicAddress: z.string().trim().max(240),
      notes: z.string().trim().max(1000),
    })
    .safeParse(input);
  if (!parsed.success)
    return {
      error: parsed.error.issues[0]?.message ?? "Check appointment details.",
    };
  const { appointmentId, scheduledAt, doctorId, ...data } = parsed.data;
  const nextScheduledAt = new Date(scheduledAt);
  if (nextScheduledAt <= new Date())
    return { error: "Choose a future appointment time." };
  const targetDoctor = await prisma.doctor.findUnique({
    where: { id: doctorId },
    select: { id: true, userId: true },
  });
  if (!targetDoctor) return { error: "Select a valid doctor." };
  if (access.role === "DOCTOR" && targetDoctor.userId !== access.session.user.id)
    return { error: "You can only assign appointments to yourself." };
  const current = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    select: {
      patientId: true,
      doctorId: true,
      status: true,
      scheduledAt: true,
      doctor: { select: { userId: true } },
    },
  });
  if (!current || current.status === "CANCELLED")
    return { error: "This appointment can no longer be edited." };
  if (access.role === "ASSISTANT" && current.status !== "PENDING")
    return { error: "Assistants can only edit pending appointments." };
  if (access.role === "DOCTOR" && current.doctor.userId !== access.session.user.id)
    return { error: "You can only edit appointments assigned to you." };
  const conflict = await prisma.appointment.findFirst({
    where: {
      id: { not: appointmentId },
      doctorId: targetDoctor.id,
      scheduledAt: nextScheduledAt,
      status: { in: ["PENDING", "ACCEPTED"] },
    },
    select: { id: true },
  });
  if (conflict) return { error: "Another appointment already uses that time." };
  await prisma.$transaction(async (transaction) => {
    await transaction.patient.update({
      where: { id: current.patientId },
      data: {
        firstName: data.firstName,
        lastName: data.lastName || null,
        phone: data.phone || null,
        email: data.email || null,
        dateOfBirth: data.dateOfBirth ? new Date(`${data.dateOfBirth}T00:00:00.000Z`) : null,
        sex: data.sex,
        bloodGroup: data.bloodGroup || null,
        heightCm: data.heightCm === "" ? null : data.heightCm,
        weightKg: data.weightKg === "" ? null : data.weightKg,
      },
    });
    await transaction.appointment.update({
      where: { id: appointmentId },
      data: {
        doctorId: targetDoctor.id,
        scheduledAt: nextScheduledAt,
        chiefComplaint: data.chiefComplaint,
        notes: data.notes || null,
        clinicName: data.clinicName || null,
        clinicAddress: data.clinicAddress || null,
      },
    });
    if (current.status === "ACCEPTED") {
      await reindexAcceptedSerials(
        transaction,
        current.doctorId,
        current.scheduledAt,
      );
      await reindexAcceptedSerials(
        transaction,
        targetDoctor.id,
        nextScheduledAt,
      );
    }
  });
  revalidatePath("/dashboard");
  revalidatePath("/book-appointment");
  return { success: "Appointment details updated." };
}

export async function updateAppointmentSchedule(input: unknown) {
  const access = await requireAppointmentManager();
  if (access.role === "ASSISTANT")
    return { error: "Only doctors and admins can manage schedules." };
  const scheduleSchema = z
    .array(
      z.object({
        weekday: z.number().int().min(0).max(6),
        clinicName: z.string().trim().min(1).max(120),
        clinicAddress: z.string().trim().max(240),
        startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
        endTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
        slotMinutes: z.number().int().min(5).max(180),
        enabled: z.boolean(),
      }),
    )
    .max(100)
    .superRefine((rows, context) => {
      rows.forEach((row, index) => {
        if (row.enabled && row.endTime <= row.startTime) {
          context.addIssue({
            code: "custom",
            path: [index, "endTime"],
            message: "End time must be after start time.",
          });
        }
        if (!row.enabled || row.endTime <= row.startTime) return;
        const start =
          Number(row.startTime.slice(0, 2)) * 60 +
          Number(row.startTime.slice(3));
        const end =
          Number(row.endTime.slice(0, 2)) * 60 + Number(row.endTime.slice(3));
        const overlaps = rows.slice(0, index).some((previous) => {
          if (
            !previous.enabled ||
            previous.weekday !== row.weekday ||
            previous.endTime <= previous.startTime
          )
            return false;
          const previousStart =
            Number(previous.startTime.slice(0, 2)) * 60 +
            Number(previous.startTime.slice(3));
          const previousEnd =
            Number(previous.endTime.slice(0, 2)) * 60 +
            Number(previous.endTime.slice(3));
          return start < previousEnd && previousStart < end;
        });
        if (overlaps)
          context.addIssue({
            code: "custom",
            path: [index, "startTime"],
            message: "Schedule times on the same day cannot overlap.",
          });
      });
    });
  const parsed = z
    .object({ doctorId: z.string().min(1), schedules: scheduleSchema })
    .safeParse(input);
  if (!parsed.success)
    return {
      error:
        parsed.error.issues[0]?.message ??
        "Provide valid appointment schedule details.",
    };
  const doctor = await prisma.doctor.findUnique({
    where: { id: parsed.data.doctorId },
    select: { id: true, userId: true },
  });
  if (!doctor) return { error: "Create a doctor profile first." };
  if (access.role === "DOCTOR" && doctor.userId !== access.session.user.id)
    return { error: "You can only change your own schedule." };
  await prisma.$transaction(async (transaction) => {
    await transaction.doctorSchedule.deleteMany({
      where: { doctorId: doctor.id },
    });
    if (parsed.data.schedules.length > 0) {
      await transaction.doctorSchedule.createMany({
        data: parsed.data.schedules.map((schedule) => ({
          ...schedule,
          doctorId: doctor.id,
        })),
      });
    }
  });
  revalidatePath("/dashboard");
  revalidatePath("/book-appointment");
  return { success: "Appointment schedule saved." };
}
