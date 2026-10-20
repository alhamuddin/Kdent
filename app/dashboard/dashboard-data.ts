import "server-only";
import { prisma } from "@/app/libs/prisma";
import { getCurrentDoctor } from "@/app/libs/current-doctor";
import { requireDashboardAccess } from "@/app/libs/authorization";

export type DashboardPatient = {
  id: string;
  patientNumber: string;
  firstName: string;
  lastName: string;
  age: number | null;
  sex: string;
  bloodGroup: string;
  phone: string;
  createdAt: string;
  lastVisit: string | null;
  visitCount: number;
  lastDiagnosis: string;
  status: "New" | "Recently seen" | "Follow-up due";
};

export type DashboardVisit = {
  id: string;
  patientId: string;
  patientName: string;
  patientNumber: string;
  date: string;
  prescriptionNo: string;
  chiefComplaint: string;
  diagnoses: string[];
  medicines: string[];
  investigations: string[];
};

function ageAt(dateOfBirth: Date | null) {
  if (!dateOfBirth) return null;
  const now = new Date();
  let age = now.getUTCFullYear() - dateOfBirth.getUTCFullYear();
  const monthDifference = now.getUTCMonth() - dateOfBirth.getUTCMonth();
  if (monthDifference < 0 || (monthDifference === 0 && now.getUTCDate() < dateOfBirth.getUTCDate())) age -= 1;
  return Math.max(0, age);
}

export async function getDashboardData() {
  const { role } = await requireDashboardAccess();
  const doctor = await getCurrentDoctor();
  if (!doctor) return { patients: [] as DashboardPatient[], visits: [] as DashboardVisit[] };
  const visitScope = role === "ADMIN" ? {} : { doctorId: doctor.id };

  const [records, standalonePrescriptions, patients] = await Promise.all([
    prisma.appointment.findMany({
      where: { ...visitScope, status: "ACCEPTED" },
      orderBy: { scheduledAt: "desc" },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true, patientNumber: true } },
        prescription: {
          include: {
            diagnoses: { include: { diagnosis: { select: { name: true } } } },
            medications: { orderBy: { sortOrder: "asc" }, select: { medicineName: true } },
            investigations: { select: { investigationName: true } },
          },
        },
      },
    }),
    prisma.prescription.findMany({
      where: { ...visitScope, appointmentId: null },
      orderBy: { issuedAt: "desc" },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true, patientNumber: true } },
        diagnoses: { include: { diagnosis: { select: { name: true } } } },
        medications: { orderBy: { sortOrder: "asc" }, select: { medicineName: true } },
        investigations: { select: { investigationName: true } },
      },
    }),
    prisma.patient.findMany({
      where: { isRegistered: true },
      orderBy: [{ createdAt: "desc" }, { patientNumber: "asc" }],
      select: { id: true, patientNumber: true, firstName: true, lastName: true, dateOfBirth: true, sex: true, bloodGroup: true, phone: true, createdAt: true },
    }),
  ]);

  const visits: DashboardVisit[] = [
    ...records.map((record) => ({
      id: record.prescription?.id ?? record.id,
      patientId: record.patient.id,
      patientName: `${record.patient.firstName} ${record.patient.lastName ?? ""}`.trim(),
      patientNumber: record.patient.patientNumber,
      date: (record.prescription?.issuedAt ?? record.scheduledAt).toISOString(),
      prescriptionNo: record.prescription?.prescriptionNo ?? "Visit record",
      chiefComplaint: record.prescription?.chiefComplaint ?? record.chiefComplaint ?? "",
      diagnoses: record.prescription?.diagnoses.map((entry) => entry.diagnosis.name) ?? [],
      medicines: record.prescription?.medications.map((entry) => entry.medicineName) ?? [],
      investigations: record.prescription?.investigations.map((entry) => entry.investigationName) ?? [],
    })),
    ...standalonePrescriptions.map((record) => ({
      id: record.id,
      patientId: record.patient.id,
      patientName: `${record.patient.firstName} ${record.patient.lastName ?? ""}`.trim(),
      patientNumber: record.patient.patientNumber,
      date: record.issuedAt.toISOString(),
      prescriptionNo: record.prescriptionNo,
      chiefComplaint: record.chiefComplaint ?? "",
      diagnoses: record.diagnoses.map((entry) => entry.diagnosis.name),
      medicines: record.medications.map((entry) => entry.medicineName),
      investigations: record.investigations.map((entry) => entry.investigationName),
    })),
  ].sort((a, b) => Date.parse(b.date) - Date.parse(a.date));

  const visitsByPatient = new Map<string, DashboardVisit[]>();
  for (const visit of visits) {
    const patientVisits = visitsByPatient.get(visit.patientId) ?? [];
    patientVisits.push(visit);
    visitsByPatient.set(visit.patientId, patientVisits);
  }

  const patientSummaries = patients.map((patient): DashboardPatient => {
    const patientVisits = visitsByPatient.get(patient.id) ?? [];
    const lastVisit = patientVisits[0]?.date ?? null;
    const daysSinceVisit = lastVisit ? (Date.now() - Date.parse(lastVisit)) / 86_400_000 : Infinity;
    return {
      id: patient.id,
      patientNumber: patient.patientNumber,
      firstName: patient.firstName,
      lastName: patient.lastName ?? "",
      age: ageAt(patient.dateOfBirth),
      sex: patient.sex,
      bloodGroup: patient.bloodGroup ?? "Unknown",
      phone: patient.phone ?? "",
      createdAt: patient.createdAt.toISOString(),
      lastVisit,
      visitCount: patientVisits.length,
      lastDiagnosis: patientVisits[0]?.diagnoses[0] ?? "Not recorded",
      status: patientVisits.length === 0 ? "New" : daysSinceVisit > 180 ? "Follow-up due" : "Recently seen",
    };
  });

  return { patients: patientSummaries, visits };
}
