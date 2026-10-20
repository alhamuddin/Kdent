"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, CalendarDays, Clock3, Search, ShieldAlert, UsersRound, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DashboardPatient } from "../dashboard-data";
import type { PatientSection } from "./left";
import { useDebouncedValue } from "@/app/hooks/useDebouncedValue";
import type { DashboardRole } from "@/app/libs/authorization";

function PatientInitials({ patient }: { patient: DashboardPatient }) {
  return <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/15 text-xs font-semibold text-primary">{patient.firstName[0]}{patient.lastName[0] ?? ""}</span>;
}

export default function RightSidebar({ onNavigate, patients, role }: { onNavigate: (section: PatientSection) => void; patients: DashboardPatient[]; role: DashboardRole }) {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 300);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const duePatients = useMemo(() => patients.filter((patient) => patient.status === "Follow-up due").slice(0, 4), [patients]);
  const matchingPatients = useMemo(() => {
    const normalized = debouncedQuery.trim().toLowerCase();
    if (!normalized) return [];
    return patients.filter((patient) => `${patient.firstName} ${patient.lastName} ${patient.patientNumber} ${patient.lastDiagnosis}`.toLowerCase().includes(normalized)).slice(0, 5);
  }, [patients, debouncedQuery]);
  const selectedPatient = patients.find((patient) => patient.id === selectedId);

  return (
    <aside className="flex h-[calc(100dvh-2.5rem)] min-w-0 flex-col gap-4 overflow-y-auto rounded-xl border border-white/5 bg-secondary/60 p-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      <section className="space-y-3">
        <div className="flex items-center justify-between"><div><p className="text-xs font-medium uppercase tracking-[0.16em] text-white/45">Workspace</p><h2 className="mt-1 text-lg font-semibold text-white">Clinic overview</h2></div><span className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary"><CalendarDays className="size-4" /></span></div>
        <div className="rounded-xl border border-white/10 bg-background/40 p-3"><div className="flex items-center gap-2 text-xs text-white/55"><Clock3 className="size-3.5" />Patient directory</div><div className="mt-2 flex items-end justify-between"><p className="text-2xl font-semibold text-white">{patients.length.toLocaleString()}</p><p className="text-xs text-white/50">records available</p></div><div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3"><span className="flex items-center gap-2 text-xs text-white/65"><ShieldAlert className="size-3.5 text-amber-300" />Follow-up due</span><span className="rounded-full bg-amber-400/10 px-2 py-0.5 text-xs font-medium text-amber-200">{patients.filter((patient) => patient.status === "Follow-up due").length}</span></div></div>
      </section>

      <section className="space-y-3">
        <div><h2 className="text-sm font-semibold text-white">Find a patient</h2><p className="mt-1 text-xs text-white/45">Search by name, record number, or diagnosis.</p></div>
        <label className="flex items-center gap-2 rounded-lg border border-white/10 bg-background/40 px-3 focus-within:border-primary/60"><Search aria-hidden="true" className="size-4 shrink-0 text-white/40" /><input aria-label="Search patients" className="h-10 min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/35" onChange={(event) => setQuery(event.target.value)} placeholder="Name, number, or diagnosis" value={query} /></label>
        {debouncedQuery.trim() ? <div className="space-y-1">{matchingPatients.length ? matchingPatients.map((patient) => <button className="flex w-full items-center gap-2 rounded-lg p-2 text-left hover:bg-white/5" key={patient.id} onClick={() => { setSelectedId(patient.id); setQuery(""); }} type="button"><PatientInitials patient={patient} /><span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium text-white">{patient.firstName} {patient.lastName}</span><span className="block truncate text-xs text-white/50">{patient.lastDiagnosis}</span></span></button>) : <p className="px-2 py-3 text-xs text-white/50">No matching patients.</p>}</div> : null}
      </section>

      {selectedPatient ? <section className="rounded-xl border border-primary/20 bg-primary/5 p-3"><div className="flex items-center gap-2"><PatientInitials patient={selectedPatient} /><div className="min-w-0 flex-1"><h2 className="truncate text-sm font-semibold text-white">{selectedPatient.firstName} {selectedPatient.lastName}</h2><p className="text-xs text-white/50">{selectedPatient.patientNumber}</p></div><button aria-label="Clear selected patient" className="rounded px-1 text-white/45 hover:text-white" onClick={() => setSelectedId(null)} type="button"><X className="size-3.5" /></button></div><p className="mt-3 text-xs text-white/65">{selectedPatient.lastDiagnosis} · {selectedPatient.visitCount} visits</p><Link className="mt-3 inline-flex text-xs font-medium text-primary hover:underline" href={`/dashboard/patients/${selectedPatient.id}`} rel="noreferrer" target="_blank">Open patient details <ArrowRight className="ml-1 size-3.5" /></Link></section> : null}

      <section className="space-y-2"><div className="flex items-center justify-between"><h2 className="text-sm font-semibold text-white">Follow-up review</h2><span className="text-xs text-white/45">Due</span></div>{duePatients.length ? duePatients.map((patient) => <Link className="flex w-full items-center gap-2 rounded-lg border border-white/5 bg-background/25 p-2 text-left transition hover:border-primary/20 hover:bg-background/50" href={`/dashboard/patients/${patient.id}`} key={patient.id} rel="noreferrer" target="_blank"><PatientInitials patient={patient} /><span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium text-white">{patient.firstName} {patient.lastName}</span><span className="block truncate text-xs text-white/50">{patient.lastDiagnosis} · {patient.patientNumber}</span></span><UsersRound className="size-3.5 shrink-0 text-amber-200/70" /></Link>) : <p className="rounded-lg bg-background/25 p-3 text-xs text-white/50">No patients currently due for review.</p>}<Button className="w-full justify-between text-white/70" onClick={() => onNavigate("patients")} variant="ghost">Open patient directory <ArrowRight className="size-4" /></Button></section>

      <section className="mt-auto rounded-xl border border-white/10 bg-background/35 p-3"><p className="text-sm font-medium text-white">Quick navigation</p><p className="mt-1 text-xs leading-5 text-white/50">{role === "ASSISTANT" ? "Jump to clinic reports." : "Jump to appointments or clinic reports."}</p><div className={`mt-3 grid gap-2 ${role === "ASSISTANT" ? "grid-cols-1" : "grid-cols-2"}`}>{role !== "ASSISTANT" && <Button onClick={() => onNavigate("appointments")} size="sm" variant="outline">Appointments</Button>}<Button onClick={() => onNavigate("reports")} size="sm" variant="outline">Reports</Button></div></section>
    </aside>
  );
}
