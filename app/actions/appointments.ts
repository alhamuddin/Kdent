"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import * as z from "zod";
import { getCurrentDoctor } from "../libs/current-doctor";
import { getCurrentUserRole, requireDashboardAccess } from "../libs/authorization";
import { prisma } from "../libs/prisma";
import { visitValidationSchema } from "../utils/appointment-validation";
import { transporter } from "../libs/nodemailer";
import { makePrescriptionPdf } from "../libs/prescription-pdf";

const patientSchema = z.object({
  id: z.string().optional(),
  firstName: z.string().trim().min(1, "First name is required.").max(80),
  lastName: z.string().trim().max(80).optional().default(""),
  dateOfBirth: z.string().optional().default(""),
  sex: z.enum(["MALE", "FEMALE", "OTHER"], { error: "Select a sex." }),
  phone: z.string().trim().max(40).optional().default(""),
  email: z.union([z.literal(""), z.email()]).optional().default(""),
  heightCm: z.union([z.literal(""), z.string().regex(/^\d{2,3}(?:\.\d{1,2})?$/)]).optional().default(""),
  weightKg: z.union([z.literal(""), z.string().regex(/^\d{1,3}(?:\.\d{1,2})?$/)]).optional().default(""),
  bloodGroup: z.string().trim().max(5).optional().default(""),
});

const text = (max = 2000) => z.string().trim().max(max).optional().default("");
const decimalText = z.union([
  z.literal(""),
  z.string().regex(/^\d{1,4}(?:\.\d{1,2})?$/, "Enter a valid number."),
]);
const integerText = z.union([
  z.literal(""),
  z.string().regex(/^\d{1,3}$/, "Enter a valid whole number."),
]);

const prescriptionSchema = z.object({
  patientId: z.string().min(1),
  appointmentAt: z.string().datetime(),
  chiefComplaint: z.string().trim().min(1, "Chief complaint is required.").max(1000),
  medicalHistory: text(2000),
  examination: text(2000),
  investigationNotes: text(2000),
  treatmentPlan: text(2000),
  clinicalNotes: z.string().trim().min(1, "Comment is required.").max(2000),
  patientInstructions: z.string().trim().min(1, "Instructions are required.").max(2000),
  weightKg: decimalText,
  systolicBP: integerText,
  diastolicBP: integerText,
  diagnoses: z.array(z.object({ name: z.string().trim().min(1).max(160) })).max(12),
  medications: z.array(z.object({
    medicineName: z.string().trim().min(1, "Medicine name is required.").max(160),
    dose: z.string().trim().min(1, "Medicine dose is required.").max(100),
    route: z.enum(["ORAL", "TOPICAL", "INTRAVENOUS", "INTRAMUSCULAR", "SUBCUTANEOUS", "INHALATION", "NASAL", "OPHTHALMIC", "OTIC", "RECTAL", "VAGINAL", "SUBLINGUAL", "TRANSDERMAL", "OTHER"]),
    frequency: z.string().trim().min(1, "Medicine frequency is required.").max(120),
    durationValue: z.number().int().positive().nullable(),
    durationUnit: z.string().trim().max(30),
    instructions: text(1000),
  })).max(30),
  investigations: z.array(z.object({
    investigationName: z.string().trim().min(1, "Test name is required.").max(160),
    type: z.enum(["LABORATORY", "IMAGING", "PROCEDURE", "OTHER"]),
    priority: z.enum(["ROUTINE", "URGENT", "STAT"]),
  })).max(20),
});

function optionalNumber(value: string) {
  return value ? Number(value) : null;
}


export async function loadAppointmentWorkspace() {
  const doctor = await getCurrentDoctor();
  if (!doctor) return { error: "Please sign in again." };

  return { doctor };
}

export async function loadInitialPatients() {
  await requireDashboardAccess();

  try {
    const patients = await prisma.patient.findMany({
      where: { isRegistered: true },
      orderBy: [{ updatedAt: "desc" }, { patientNumber: "asc" }],
      take: 20,
      select: {
        id: true,
        patientNumber: true,
        firstName: true,
        lastName: true,
        dateOfBirth: true,
        sex: true,
        phone: true,
        email: true,
        heightCm: true,
        weightKg: true,
        bloodGroup: true,
      },
    });
    return {
      patients: patients.map((patient) => ({
        ...patient,
        dateOfBirth: patient.dateOfBirth?.toISOString().slice(0, 10) ?? null,
        heightCm: patient.heightCm?.toString() ?? null,
        weightKg: patient.weightKg?.toString() ?? null,
      })),
    };
  } catch (error) {
    console.error("Failed to load initial appointment patients:", error);
    return { error: "Patient records could not be loaded. Please try again." };
  }
}

export async function searchDrugCatalog(query: string) {
  await requireDashboardAccess();

  const normalized = typeof query === "string" ? query.trim().slice(0, 100) : "";
  if (normalized.length < 2) return { medications: [] as { id: string; name: string }[] };

  const url = new URL(
    "https://api.tr.ocl.dghs.gov.bd/concepts/",
  );
  url.searchParams.set("q", normalized);
  url.searchParams.set("limit", "10");
  url.searchParams.set("locale", "en");
  url.searchParams.set("conceptClass", "Drug");
  url.searchParams.set("org", "MoHFW");
  url.searchParams.set("source", "DGDA-Drugs");
  url.searchParams.set("includeRetired", "0");

  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(8000),
      cache: "no-store",
    });
    if (!response.ok) {
      console.error("DGHS drug catalog request failed:", response.status);
      return { error: "Drug suggestions are temporarily unavailable." };
    }

    const payload: unknown = await response.json();
    const results = Array.isArray(payload)
      ? payload
      : payload && typeof payload === "object" && "value" in payload && Array.isArray(payload.value)
        ? payload.value
        : [];

    const medications = results.flatMap((result: unknown) => {
      if (!result || typeof result !== "object") return [];
      const item = result as { id?: unknown; display_name?: unknown; name?: unknown };
      const name = typeof item.display_name === "string"
        ? item.display_name
        : typeof item.name === "string" ? item.name : "";
      if (!name) return [];
      return [{ id: typeof item.id === "string" ? item.id : name, name }];
    }).slice(0, 10);

    return { medications };
  } catch (error) {
    console.error("DGHS drug catalog lookup failed:", error);
    return { error: "Drug suggestions are temporarily unavailable." };
  }
}

export async function searchPatients(query: string) {
  const doctor = await getCurrentDoctor();
  if (!doctor) return { error: "Please sign in again." };
  const normalized = typeof query === "string" ? query.trim().slice(0, 100) : "";
  if (normalized.length < 2) return { patients: [] };

  const terms = normalized.split(/\s+/).filter(Boolean).slice(0, 4);

  try {
    const patients = await prisma.patient.findMany({
      where: {
        isRegistered: true,
        AND: terms.map((term) => ({
          OR: [
            { firstName: { contains: term, mode: "insensitive" } },
            { lastName: { contains: term, mode: "insensitive" } },
            { patientNumber: { contains: term, mode: "insensitive" } },
            { phone: { contains: term, mode: "insensitive" } },
          ],
        })),
      },
      orderBy: [{ updatedAt: "desc" }, { patientNumber: "asc" }],
      take: 20,
      select: {
        id: true,
        patientNumber: true,
        firstName: true,
        lastName: true,
        dateOfBirth: true,
        sex: true,
        phone: true,
        email: true,
        heightCm: true,
        weightKg: true,
        bloodGroup: true,
      },
    });

    return {
      patients: patients.map((patient) => ({
        ...patient,
        dateOfBirth: patient.dateOfBirth?.toISOString().slice(0, 10) ?? null,
        heightCm: patient.heightCm?.toString() ?? null,
        weightKg: patient.weightKg?.toString() ?? null,
      })),
    };
  } catch {
    return { error: "Patient search failed. Please try again." };
  }
}

export async function createPatient(input: unknown) {
  const doctor = await getCurrentDoctor();
  if (!doctor) return { error: "Please sign in again." };

  const validation = patientSchema.safeParse(input);
  if (!validation.success) {
    return { error: validation.error.issues[0]?.message ?? "Check the patient details." };
  }

  const data = validation.data;
  if (data.dateOfBirth) {
    const date = new Date(`${data.dateOfBirth}T00:00:00.000Z`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data.dateOfBirth) || Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== data.dateOfBirth) {
      return { error: "Enter a valid date of birth." };
    }
  }

  try {
    const patient = await prisma.patient.create({
      data: {
        patientNumber: `KD-${new Date().getFullYear()}-${randomUUID().slice(0, 8).toUpperCase()}`,
        firstName: data.firstName,
        lastName: data.lastName || null,
        dateOfBirth: data.dateOfBirth ? new Date(`${data.dateOfBirth}T00:00:00.000Z`) : null,
        sex: data.sex,
        phone: data.phone || null,
        email: data.email || null,
        heightCm: data.heightCm ? Number(data.heightCm) : null,
        weightKg: data.weightKg ? Number(data.weightKg) : null,
        bloodGroup: data.bloodGroup || null,
      },
      select: {
        id: true,
        patientNumber: true,
        firstName: true,
        lastName: true,
        dateOfBirth: true,
        sex: true,
        phone: true,
        email: true,
        heightCm: true,
        weightKg: true,
        bloodGroup: true,
      },
    });
    revalidatePath("/dashboard");
    return {
      patient: {
        ...patient,
        dateOfBirth: patient.dateOfBirth?.toISOString().slice(0, 10) ?? null,
        heightCm: patient.heightCm?.toString() ?? null,
        weightKg: patient.weightKg?.toString() ?? null,
      },
    };
  } catch {
    return { error: "The patient record could not be created. Please try again." };
  }
}

export async function updatePatient(input: unknown) {
  const doctor = await getCurrentDoctor();
  if (!doctor) return { error: "Please sign in again." };
  const validation = patientSchema.safeParse(input);
  if (!validation.success || !validation.data.id) {
    return { error: validation.success ? "Select a patient to update." : validation.error.issues[0]?.message };
  }
  const data = validation.data;
  const date = data.dateOfBirth ? new Date(`${data.dateOfBirth}T00:00:00.000Z`) : null;
  if (data.dateOfBirth && (!/^\d{4}-\d{2}-\d{2}$/.test(data.dateOfBirth) || Number.isNaN(date?.getTime()) || date?.toISOString().slice(0, 10) !== data.dateOfBirth)) {
    return { error: "Enter a valid date of birth." };
  }
  try {
    const patient = await prisma.patient.update({
      where: { id: data.id },
      data: { firstName: data.firstName, lastName: data.lastName || null, dateOfBirth: date, sex: data.sex, phone: data.phone || null, email: data.email || null, heightCm: data.heightCm ? Number(data.heightCm) : null, weightKg: data.weightKg ? Number(data.weightKg) : null, bloodGroup: data.bloodGroup || null },
      select: { id: true, patientNumber: true, firstName: true, lastName: true, dateOfBirth: true, sex: true, phone: true, email: true, heightCm: true, weightKg: true, bloodGroup: true },
    });
    revalidatePath("/dashboard");
    return { patient: { ...patient, dateOfBirth: patient.dateOfBirth?.toISOString().slice(0, 10) ?? null, heightCm: patient.heightCm?.toString() ?? null, weightKg: patient.weightKg?.toString() ?? null } };
  } catch {
    return { error: "The patient record could not be updated." };
  }
}

export async function deletePatient(patientId: string) {
  const doctor = await getCurrentDoctor();
  if (!doctor) return { error: "Please sign in again." };
  try {
    const patient = await prisma.patient.findUnique({ where: { id: patientId }, select: { _count: { select: { prescriptions: true, appointments: true, allergies: true } } } });
    if (!patient) return { error: "Patient record not found." };
    if (patient._count.prescriptions || patient._count.appointments || patient._count.allergies) {
      return { error: "This patient has clinical history and cannot be deleted." };
    }
    await prisma.patient.delete({ where: { id: patientId } });
    revalidatePath("/dashboard");
    return { success: true };
  } catch {
    return { error: "The patient record could not be deleted." };
  }
}

export async function getPatientHistory(patientId: string) {
  const doctor = await getCurrentDoctor();
  if (!doctor) return { error: "Please sign in again." };
  if (typeof patientId !== "string" || patientId.length > 40) {
    return { error: "Select a valid patient." };
  }

  try {
    const [appointments, standalonePrescriptions] = await Promise.all([
      prisma.appointment.findMany({
        where: { patientId, status: "ACCEPTED" },
        orderBy: { scheduledAt: "desc" },
        take: 50,
        include: {
          doctor: { select: { firstName: true, lastName: true } },
          prescription: {
            include: {
              diagnoses: { include: { diagnosis: { select: { name: true } } } },
              medications: { orderBy: { sortOrder: "asc" }, select: { id: true, medicineName: true, dose: true, frequency: true, durationValue: true, durationUnit: true, instructions: true } },
              investigations: { select: { id: true, investigationName: true, status: true, priority: true } },
            },
          },
        },
      }),
      prisma.prescription.findMany({
        where: { patientId, appointmentId: null },
        orderBy: { issuedAt: "desc" },
        take: 50,
        include: {
          doctor: { select: { firstName: true, lastName: true } },
          diagnoses: { include: { diagnosis: { select: { name: true } } } },
          medications: { orderBy: { sortOrder: "asc" }, select: { id: true, medicineName: true, dose: true, frequency: true, durationValue: true, durationUnit: true, instructions: true } },
          investigations: { select: { id: true, investigationName: true, status: true, priority: true } },
        },
      }),
    ]);

    const fromAppointment = appointments.map((appointment) => {
      const prescription = appointment.prescription;
      return {
        id: prescription?.id ?? appointment.id,
        prescriptionNo: prescription?.prescriptionNo ?? "Visit record",
        issuedAt: (prescription?.issuedAt ?? appointment.scheduledAt).toISOString(),
        appointmentAt: appointment.scheduledAt.toISOString(),
        weightKg: prescription?.weightKg?.toString() ?? "",
        bmi: prescription?.bmi?.toString() ?? "",
        bloodPressure: prescription?.systolicBP && prescription?.diastolicBP ? `${prescription.systolicBP}/${prescription.diastolicBP}` : "",
        status: prescription?.status ?? "VISIT",
        doctorName: `${appointment.doctor.firstName} ${appointment.doctor.lastName ?? ""}`.trim(),
        chiefComplaint: prescription?.chiefComplaint ?? appointment.chiefComplaint,
        medicalHistory: prescription?.medicalHistory ?? null,
        examination: prescription?.examination ?? null,
        investigationNotes: prescription?.investigationNotes ?? null,
        treatmentPlan: prescription?.treatmentPlan ?? null,
        clinicalNotes: prescription?.clinicalNotes ?? appointment.notes,
        patientInstructions: prescription?.patientInstructions ?? null,
        diagnoses: prescription?.diagnoses.map((item) => item.diagnosis.name) ?? [],
        medications: prescription?.medications ?? [],
        investigations: prescription?.investigations ?? [],
      };
    });
    const fromPrescription = standalonePrescriptions.map((prescription) => ({
      id: prescription.id,
      prescriptionNo: prescription.prescriptionNo,
      issuedAt: prescription.issuedAt.toISOString(),
      appointmentAt: null,
      weightKg: prescription.weightKg?.toString() ?? "",
      bmi: prescription.bmi?.toString() ?? "",
      bloodPressure: prescription.systolicBP && prescription.diastolicBP ? `${prescription.systolicBP}/${prescription.diastolicBP}` : "",
      status: prescription.status,
      doctorName: `${prescription.doctor.firstName} ${prescription.doctor.lastName ?? ""}`.trim(),
      chiefComplaint: prescription.chiefComplaint,
      medicalHistory: prescription.medicalHistory,
      examination: prescription.examination,
      investigationNotes: prescription.investigationNotes,
      treatmentPlan: prescription.treatmentPlan,
      clinicalNotes: prescription.clinicalNotes,
      patientInstructions: prescription.patientInstructions,
      diagnoses: prescription.diagnoses.map((item) => item.diagnosis.name),
      medications: prescription.medications,
      investigations: prescription.investigations,
    }));
    const visits = [...fromAppointment, ...fromPrescription]
      .sort((a, b) => Date.parse(b.issuedAt) - Date.parse(a.issuedAt))
      .slice(0, 50);
    return { visits };
  } catch (error) {
    console.error("Patient visit history could not be loaded", error);
    return { error: "Previous visits could not be loaded." };
  }
}

export async function deletePreviousVisit(recordId: string) {
  const doctor = await getCurrentDoctor();
  if (!doctor) return { error: "Please sign in again." };
  const { role } = await getCurrentUserRole();
  const visitScope = role === "ADMIN" ? {} : { doctorId: doctor.id };
  if (typeof recordId !== "string" || recordId.length > 40) {
    return { error: "Select a valid visit record." };
  }

  try {
    const prescription = await prisma.prescription.findFirst({
      where: { id: recordId, ...visitScope },
      select: { id: true, appointmentId: true },
    });

    if (prescription) {
      await prisma.$transaction(async (transaction) => {
        await transaction.prescription.delete({ where: { id: prescription.id } });
        if (prescription.appointmentId) {
          await transaction.appointment.delete({ where: { id: prescription.appointmentId } });
        }
      });
    } else {
      const appointment = await prisma.appointment.findFirst({
        where: { id: recordId, ...visitScope, prescription: null },
        select: { id: true },
      });
      if (!appointment) return { error: "Visit record not found." };
      await prisma.appointment.delete({ where: { id: appointment.id } });
    }

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Previous visit could not be deleted", error);
    return { error: "The visit record could not be deleted." };
  }
}

export async function savePrescription(input: unknown) {
  const { role } = await getCurrentUserRole();
  if (role !== "DOCTOR" && role !== "ADMIN") return { error: "Only a doctor or admin can issue prescriptions." };
  const doctor = await getCurrentDoctor();
  if (!doctor) return { error: "Please sign in again." };

  const validation = prescriptionSchema.safeParse(input);
  if (!validation.success) {
    return { error: validation.error.issues[0]?.message ?? "Check the prescription details." };
  }

  const data = validation.data;
  const visitValidation = visitValidationSchema.safeParse({
    appointmentAt: data.appointmentAt,
    chiefComplaint: data.chiefComplaint,
    medicalHistory: data.medicalHistory,
    examination: data.examination,
    investigationNotes: data.investigationNotes,
    treatmentPlan: data.treatmentPlan,
    clinicalNotes: data.clinicalNotes,
    patientInstructions: data.patientInstructions,
    medications: data.medications,
    investigations: data.investigations,
  });
  if (!visitValidation.success) return { error: visitValidation.error.issues[0]?.message ?? "Complete the required visit details." };
  const activePatient = await prisma.patient.findUnique({
    where: { id: data.patientId },
    select: { id: true, firstName: true, lastName: true, email: true, heightCm: true, weightKg: true },
  });
  if (!activePatient) return { error: "The selected patient could not be found." };

  const appointmentDate = new Date(data.appointmentAt);
  if (Number.isNaN(appointmentDate.getTime())) return { error: "Enter a valid visit date and time." };
  const issuedAt = new Date();
  const measuredWeight = optionalNumber(data.weightKg) ?? (Number(activePatient.weightKg ?? 0) || null);
  const bmi = activePatient.heightCm && measuredWeight
    ? Math.round((measuredWeight / Math.pow(Number(activePatient.heightCm) / 100, 2)) * 100) / 100
    : null;
  const prescriptionNo = `KD-RX-${issuedAt.toISOString().slice(0, 10).replaceAll("-", "")}-${randomUUID().slice(0, 6).toUpperCase()}`;

  try {
    const prescription = await prisma.$transaction(async (transaction) => {
      const appointment = await transaction.appointment.create({
        data: {
          patientId: data.patientId,
          doctorId: doctor.id,
          scheduledAt: appointmentDate,
          chiefComplaint: data.chiefComplaint,
          notes: data.clinicalNotes,
        },
      });

      const diagnosisItems = [];
      for (const item of data.diagnoses) {
        const name = item.name.trim();
        const diagnosis = await transaction.diagnosis.findFirst({
          where: { name: { equals: name, mode: "insensitive" } },
          select: { id: true },
        }) ?? await transaction.diagnosis.create({ data: { name }, select: { id: true } });
        diagnosisItems.push({ diagnosisId: diagnosis.id, type: "CONFIRMED" as const, isPrimary: diagnosisItems.length === 0 });
      }

      return transaction.prescription.create({
        data: {
          prescriptionNo,
          patientId: data.patientId,
          doctorId: doctor.id,
          appointmentId: appointment.id,
          issuedAt,
          status: "ISSUED",
          signedAt: issuedAt,
          chiefComplaint: data.chiefComplaint,
          medicalHistory: data.medicalHistory,
          examination: data.examination,
          investigationNotes: data.investigationNotes,
          treatmentPlan: data.treatmentPlan,
          clinicalNotes: data.clinicalNotes,
          patientInstructions: data.patientInstructions,
          weightKg: measuredWeight,
          bmi,
          systolicBP: data.systolicBP ? Number(data.systolicBP) : null,
          diastolicBP: data.diastolicBP ? Number(data.diastolicBP) : null,
          diagnoses: { create: diagnosisItems },
          medications: { create: data.medications.map((item, index) => ({ ...item, durationUnit: item.durationUnit || null, instructions: item.instructions || null, sortOrder: index })) },
          investigations: { create: data.investigations },
        },
        select: { id: true, prescriptionNo: true, status: true, issuedAt: true },
      });
    });

    if (activePatient.email) {
      const lines = [
        "K-Dent Prescription",
        `Patient: ${activePatient.firstName} ${activePatient.lastName ?? ""}`.trim(),
        `Prescription: ${prescription.prescriptionNo}`,
        `Date: ${issuedAt.toLocaleString()}`,
        `Chief complaint: ${data.chiefComplaint}`,
        ...(data.medicalHistory ? [`Medical history: ${data.medicalHistory}`] : []),
        ...(data.examination ? [`Examination: ${data.examination}`] : []),
        ...(data.investigationNotes ? [`Investigation notes: ${data.investigationNotes}`] : []),
        ...(data.treatmentPlan ? [`Treatment plan: ${data.treatmentPlan}`] : []),
        ...(data.clinicalNotes ? [`Clinical note: ${data.clinicalNotes}`] : []),
        ...(data.diagnoses.length ? [`Diagnosis: ${data.diagnoses.map((item) => item.name).join(", ")}`] : []),
        ...(activePatient.heightCm ? [`Height: ${activePatient.heightCm.toString()} cm`] : []),
        ...(measuredWeight ? [`Weight: ${measuredWeight} kg`] : []),
        ...(bmi ? [`BMI: ${bmi} kg/m2`] : []),
        ...(data.systolicBP && data.diastolicBP ? [`Blood pressure: ${data.systolicBP}/${data.diastolicBP} mmHg`] : []),
        ...data.medications.map((item) => `${item.medicineName}: ${item.dose}; ${item.frequency}${item.durationValue ? ` for ${item.durationValue} ${item.durationUnit || "days"}` : ""}`),
        ...data.investigations.map((item) => `Investigation: ${item.investigationName}`),
        `Advice: ${data.patientInstructions}`,
        `Doctor: ${doctor.firstName} ${doctor.lastName ?? ""}`.trim(),
      ];
      try {
        await transporter.sendMail({
          from: process.env.SMTP_FROM || process.env.SMTP_USER,
          to: activePatient.email,
          subject: `Your K-Dent prescription ${prescription.prescriptionNo}`,
          text: "Your prescription is attached as a PDF.",
          attachments: [{ filename: `${prescription.prescriptionNo}.pdf`, content: makePrescriptionPdf(lines), contentType: "application/pdf" }],
        });
      } catch (emailError) {
        console.error("Prescription saved, but email delivery failed:", emailError);
      }
    }

    revalidatePath("/dashboard");
    return { prescription: { ...prescription, issuedAt: prescription.issuedAt.toISOString() } };
  } catch (error) {
    console.error("Prescription save failed", error instanceof Error ? { name: error.name, message: error.message, stack: error.stack } : error);
    return { error: "The prescription could not be saved. Please review the details and try again." };
  }
}
