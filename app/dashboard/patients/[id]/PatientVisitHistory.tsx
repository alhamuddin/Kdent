"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { Printer, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deletePreviousVisit } from "@/app/actions/appointments";
import { clinicDetails } from "@/app/libs/clinic";

type Visit = {
  id: string;
  date: string;
  complaint: string;
  prescriptionNo: string;
  medicalHistory: string;
  examination: string;
  investigationNotes: string;
  treatmentPlan: string;
  clinicalNotes: string;
  instructions: string;
  doctorName: string;
  diagnoses: string[];
  medicines: { medicineName: string; dose: string; frequency: string; durationValue: number | null; durationUnit: string | null; instructions: string | null }[];
  investigations: string[];
};

type Patient = { name: string; patientNumber: string; age: number | null; sex: string };

export default function PatientVisitHistory({ patient, visits: initialVisits }: { patient: Patient; visits: Visit[] }) {
  const [visits, setVisits] = useState(initialVisits);
  const [printVisit, setPrintVisit] = useState<Visit | null>(null);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const print = (visit: Visit) => {
    setPrintVisit(visit);
    window.setTimeout(() => window.print(), 200);
  };

  const remove = (visit: Visit) => {
    if (!window.confirm(`Delete visit ${visit.prescriptionNo}? Its prescription and clinical details will also be removed.`)) return;
    startTransition(async () => {
      const result = await deletePreviousVisit(visit.id);
      if ("error" in result) {
        setMessage(result.error ?? "Could not delete this visit.");
        return;
      }
      setVisits((current) => current.filter((item) => item.id !== visit.id));
      setMessage("Visit deleted.");
    });
  };

  return (
    <>
      {message && <p aria-live="polite" className="rounded-lg border border-white/10 bg-secondary/60 px-3 py-2 text-sm text-white/75">{message}</p>}
      {visits.map((visit) => (
        <article className="rounded-xl border border-white/10 bg-secondary/50 p-4 sm:p-5" key={visit.id}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div><h3 className="font-semibold">{visit.complaint}</h3><p className="mt-1 text-xs text-white/50">{new Date(visit.date).toLocaleDateString()} · {visit.prescriptionNo}</p></div>
            <div className="flex gap-2">
              <Button onClick={() => print(visit)} size="sm" type="button" variant="outline"><Printer className="size-3.5"/> Print</Button>
              <Button disabled={isPending} onClick={() => remove(visit)} size="sm" type="button" variant="outline"><Trash2 className="size-3.5"/> Delete</Button>
            </div>
          </div>
          <div className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
            <div><p className="text-xs font-medium uppercase tracking-wide text-white/45">Diagnosis</p><p className="mt-1">{visit.diagnoses.join(", ") || "Not recorded"}</p></div>
            <div><p className="text-xs font-medium uppercase tracking-wide text-white/45">Treatment plan</p><p className="mt-1">{visit.treatmentPlan || "Not recorded"}</p></div>
            <div><p className="text-xs font-medium uppercase tracking-wide text-white/45">Examination</p><p className="mt-1">{visit.examination || "Not recorded"}</p></div>
            <div><p className="text-xs font-medium uppercase tracking-wide text-white/45">Medical history</p><p className="mt-1">{visit.medicalHistory || "Not recorded"}</p></div>
            <div><p className="text-xs font-medium uppercase tracking-wide text-white/45">Medicines</p><p className="mt-1">{visit.medicines.map((medicine) => `${medicine.medicineName} — ${medicine.dose}, ${medicine.frequency}`).join("; ") || "None recorded"}</p></div>
            <div><p className="text-xs font-medium uppercase tracking-wide text-white/45">Investigations</p><p className="mt-1">{[...visit.investigations, visit.investigationNotes].filter(Boolean).join("; ") || "None recorded"}</p></div>
          </div>
        </article>
      ))}

      {printVisit && <div aria-hidden="true" className="rx-print-sheet"><div className="rx-paper">
        <header className="rx-paper-header"><div className="rx-paper-clinic"><b>{clinicDetails.name}</b><span>{clinicDetails.address}</span><span>{clinicDetails.email}</span></div><Image alt="K-Dent" height={64} src="/kdent-logo.svg" width={86}/><div className="rx-paper-doctor"><strong>{printVisit.doctorName || "Doctor"}</strong><span>Oral &amp; Dental Surgeon</span></div></header>
        <div className="rx-paper-patient"><span><b>Name:</b> {patient.name}</span><span><b>Age:</b> {patient.age === null ? "—" : `${patient.age} yrs`}</span><span><b>Sex:</b> {patient.sex}</span><span><b>Date:</b> {new Date(printVisit.date).toLocaleDateString()}</span><span><b>Patient No.:</b> {patient.patientNumber}</span></div>
        <main className="rx-paper-body"><div className="rx-paper-clinical"><section><h2>C.C.</h2><p>{printVisit.complaint || "—"}</p></section><section><h2>PMH / Nil</h2><p>{printVisit.medicalHistory || "—"}</p></section><section><h2>O/E</h2><p>{printVisit.examination || printVisit.clinicalNotes || "—"}</p></section><section><h2>Investigation</h2><p>{printVisit.investigationNotes || printVisit.investigations.join(", ") || "—"}</p></section><section><h2>Diagnosis</h2><p>{printVisit.diagnoses.join(", ") || "—"}</p></section><section><h2>Treatment Plan</h2><p>{printVisit.treatmentPlan || "—"}</p></section><section><h2>Advice</h2><p>{printVisit.instructions || "—"}</p></section></div>
          <div className="rx-paper-rx"><div className="rx-mark">℞</div><div className="rx-paper-meta">{printVisit.prescriptionNo}</div>{printVisit.medicines.length ? <ol>{printVisit.medicines.map((medicine, index) => <li key={`${medicine.medicineName}-${index}`}><b>{medicine.medicineName}</b><p>{medicine.dose} · {medicine.frequency}{medicine.durationValue ? ` · ${medicine.durationValue} ${medicine.durationUnit ?? "days"}` : ""}{medicine.instructions ? ` · ${medicine.instructions}` : ""}</p></li>)}</ol> : <p className="rx-paper-empty">Medicines</p>}<div className="rx-paper-signature"><span/><b>{printVisit.doctorName || "Doctor's signature"}</b><small>Signature</small></div></div>
        </main>
        <footer className="rx-paper-footer"><div className="rx-paper-footer-cols"><div><b>{clinicDetails.name}</b><span>{clinicDetails.address}</span><span>For appointments: {clinicDetails.phone}</span></div><div><b>Clinic</b><span>{clinicDetails.address}</span><span>Consultation: Contact clinic for schedule</span></div></div><div className="rx-paper-hotline">For appointments, contact: {clinicDetails.phone}</div></footer>
      </div></div>}
    </>
  );
}
