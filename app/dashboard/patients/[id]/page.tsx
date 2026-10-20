import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/app/libs/prisma";
import { getCurrentDoctor } from "@/app/libs/current-doctor";
import { requireDashboardAccess } from "@/app/libs/authorization";
import PatientVisitHistory from "./PatientVisitHistory";

export default async function PatientDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { role } = await requireDashboardAccess();

  const { id } = await params;
  const doctor = await getCurrentDoctor();
  if (!doctor) notFound();
  const patient = await prisma.patient.findUnique({
    where: { id },
    include: {
      allergies: { where: { isActive: true }, orderBy: { createdAt: "desc" } },
      appointments: {
        where: { ...(role === "ADMIN" ? {} : { doctorId: doctor.id }), status: "ACCEPTED" },
        orderBy: { scheduledAt: "desc" },
        include: {
          doctor: { select: { firstName: true, lastName: true } },
          prescription: {
            include: {
              diagnoses: { include: { diagnosis: true } },
              medications: { orderBy: { sortOrder: "asc" } },
              investigations: true,
            },
          },
        },
      },
      prescriptions: {
        where: { ...(role === "ADMIN" ? {} : { doctorId: doctor.id }), appointmentId: null },
        orderBy: { issuedAt: "desc" },
        include: {
          doctor: { select: { firstName: true, lastName: true } },
          diagnoses: { include: { diagnosis: true } },
          medications: { orderBy: { sortOrder: "asc" } },
          investigations: true,
        },
      },
    },
  });
  if (!patient) notFound();

  const visits = [
    ...patient.appointments.map((appointment) => ({
      id: appointment.prescription?.id ?? appointment.id,
      date: appointment.prescription?.issuedAt ?? appointment.scheduledAt,
      complaint: appointment.prescription?.chiefComplaint ?? appointment.chiefComplaint ?? "Visit",
      prescriptionNo: appointment.prescription?.prescriptionNo ?? "Visit record",
      medicalHistory: appointment.prescription?.medicalHistory,
      examination: appointment.prescription?.examination,
      investigationNotes: appointment.prescription?.investigationNotes,
      treatmentPlan: appointment.prescription?.treatmentPlan,
      clinicalNotes: appointment.prescription?.clinicalNotes ?? appointment.notes,
      instructions: appointment.prescription?.patientInstructions,
      doctorName: `Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName ?? ""}`.trim(),
      diagnoses: appointment.prescription?.diagnoses ?? [],
      medications: appointment.prescription?.medications ?? [],
      investigations: appointment.prescription?.investigations ?? [],
    })),
    ...patient.prescriptions.map((prescription) => ({
      id: prescription.id,
      date: prescription.issuedAt,
      complaint: prescription.chiefComplaint ?? "Visit",
      prescriptionNo: prescription.prescriptionNo,
      medicalHistory: prescription.medicalHistory,
      examination: prescription.examination,
      investigationNotes: prescription.investigationNotes,
      treatmentPlan: prescription.treatmentPlan,
      clinicalNotes: prescription.clinicalNotes,
      instructions: prescription.patientInstructions,
      doctorName: `Dr. ${prescription.doctor.firstName} ${prescription.doctor.lastName ?? ""}`.trim(),
      diagnoses: prescription.diagnoses,
      medications: prescription.medications,
      investigations: prescription.investigations,
    })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  const age = patient.dateOfBirth
    ? Math.max(0, new Date().getFullYear() - patient.dateOfBirth.getFullYear() - (new Date() < new Date(new Date().getFullYear(), patient.dateOfBirth.getMonth(), patient.dateOfBirth.getDate()) ? 1 : 0))
    : null;

  return (
    <main className="min-h-screen bg-background px-4 py-6 text-white sm:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <Link className="text-sm text-primary hover:underline" href="/dashboard">← Back to dashboard</Link>
        <header className="rounded-2xl border border-white/10 bg-secondary/60 p-5 sm:p-7">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Patient record · {patient.patientNumber}</p>
          <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">{patient.firstName} {patient.lastName ?? ""}</h1>
          <div className="mt-5 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
            <div><p className="text-white/50">Age</p><p className="mt-1">{age === null ? "Not recorded" : `${age} years`}</p></div>
            <div><p className="text-white/50">Sex</p><p className="mt-1">{patient.sex}</p></div>
            <div><p className="text-white/50">Blood group</p><p className="mt-1">{patient.bloodGroup ?? "Not recorded"}</p></div>
            <div><p className="text-white/50">Phone</p><p className="mt-1">{patient.phone ?? "Not recorded"}</p></div>
          </div>
        </header>

        {patient.allergies.length > 0 && <section className="rounded-xl border border-rose-400/30 bg-rose-400/5 p-4"><h2 className="font-semibold text-rose-200">Active allergies</h2><p className="mt-2 text-sm">{patient.allergies.map((allergy) => `${allergy.substance}${allergy.reaction ? ` (${allergy.reaction})` : ""}`).join(" · ")}</p></section>}

        <section className="space-y-4">
          <div><h2 className="text-xl font-semibold">Visit history</h2><p className="mt-1 text-sm text-white/55">{visits.length} recorded visit{visits.length === 1 ? "" : "s"}, newest first.</p></div>
          {visits.length === 0 ? <div className="rounded-xl border border-white/10 bg-secondary/50 p-6 text-sm text-white/60">No previous visits are recorded for this patient.</div> : <PatientVisitHistory patient={{ name: `${patient.firstName} ${patient.lastName ?? ""}`.trim(), patientNumber: patient.patientNumber, age, sex: patient.sex }} visits={visits.map((visit) => ({
            id: visit.id,
            date: visit.date.toISOString(),
            complaint: visit.complaint,
            prescriptionNo: visit.prescriptionNo,
            medicalHistory: visit.medicalHistory ?? "",
            examination: visit.examination ?? "",
            investigationNotes: visit.investigationNotes ?? "",
            treatmentPlan: visit.treatmentPlan ?? "",
            clinicalNotes: visit.clinicalNotes ?? "",
            instructions: visit.instructions ?? "",
            doctorName: visit.doctorName,
            diagnoses: visit.diagnoses.map((entry) => entry.diagnosis.name),
            medicines: visit.medications.map((medicine) => ({ medicineName: medicine.medicineName, dose: medicine.dose, frequency: medicine.frequency, durationValue: medicine.durationValue, durationUnit: medicine.durationUnit, instructions: medicine.instructions })),
            investigations: visit.investigations.map((entry) => entry.investigationName),
          }))}/>}
        </section>
      </div>
    </main>
  );
}
