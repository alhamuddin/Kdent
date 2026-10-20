"use client";

import {
  Activity,
  CalendarDays,
  Download,
  FileBarChart2,
  Printer,
  Search,
  UsersRound,
} from "lucide-react";
import { useMemo, useState } from "react";
import type { DashboardPatient, DashboardVisit } from "../dashboard-data";
import { DateRangeControls, presetRange } from "./DateRangeControls";
import type { DatePreset, DateRange } from "./DateRangeControls";

const inRange = (value: string, range: DateRange) => {
  const day = value.slice(0, 10);
  return (!range.start || day >= range.start) && (!range.end || day <= range.end);
};
const ageGroup = (age: number | null) =>
  age === null ? "Unknown" : age < 13 ? "Child" : age < 20 ? "Teen" : age < 60 ? "Adult" : "60+";
const csvCell = (value: string) => `"${value.replaceAll('"', '""')}"`;

function Breakdown({ title, rows }: { title: string; rows: [string, number][] }) {
  const total = rows.reduce((sum, [, value]) => sum + value, 0);
  return (
    <section className="rounded-xl border border-white/10 bg-secondary/55 p-4">
      <h2 className="font-semibold text-white">{title}</h2>
      {rows.length ? (
        <div className="mt-3 space-y-3">
          {rows.map(([label, value]) => (
            <div key={label}>
              <div className="mb-1 flex justify-between gap-2 text-xs">
                <span className="truncate text-white/75">{label}</span>
                <span className="text-white/55">
                  {value} <span className="text-white/35">({total ? Math.round((value / total) * 100) : 0}%)</span>
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-primary" style={{ width: `${total ? (value / total) * 100 : 0}%` }} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-sm text-white/45">No data in this range.</p>
      )}
    </section>
  );
}

export default function Reports({ patients, visits }: { patients: DashboardPatient[]; visits: DashboardVisit[] }) {
  const [preset, setPreset] = useState<DatePreset>("yearly");
  const [range, setRange] = useState<DateRange>(() => presetRange("yearly"));
  const [visitQuery, setVisitQuery] = useState("");
  const [visitSort, setVisitSort] = useState<"NEWEST" | "OLDEST">("NEWEST");
  const [visitFrom, setVisitFrom] = useState("");
  const [visitTo, setVisitTo] = useState("");
  const [visitPage, setVisitPage] = useState(1);
  const [printedAt, setPrintedAt] = useState("");

  const filteredVisits = useMemo(
    () => visits.filter((visit) => inRange(visit.date, range)),
    [visits, range],
  );
  const filteredPatients = useMemo(
    () => patients.filter((patient) => inRange(patient.createdAt, range)),
    [patients, range],
  );
  const detailedVisits = useMemo(() => {
    const query = visitQuery.trim().toLowerCase();
    const direction = visitSort === "NEWEST" ? -1 : 1;
    return filteredVisits
      .filter(
        (visit) =>
          (!visitFrom || visit.date.slice(0, 10) >= visitFrom) &&
          (!visitTo || visit.date.slice(0, 10) <= visitTo),
      )
      .filter(
        (visit) =>
          !query ||
          [
            visit.patientName,
            visit.patientNumber,
            visit.chiefComplaint,
            ...visit.diagnoses,
            ...visit.medicines,
            ...visit.investigations,
          ].some((value) => value.toLowerCase().includes(query)),
      )
      .sort((a, b) => direction * (Date.parse(a.date) - Date.parse(b.date)));
  }, [filteredVisits, visitQuery, visitSort, visitFrom, visitTo]);
  const visitPageCount = Math.max(1, Math.ceil(detailedVisits.length / 20));
  const visibleDetailedVisits = detailedVisits.slice((visitPage - 1) * 20, visitPage * 20);

  const resetVisitFilters = () => {
    setVisitQuery("");
    setVisitSort("NEWEST");
    setVisitFrom("");
    setVisitTo("");
    setVisitPage(1);
  };

  const printReport = () => {
    const date = new Intl.DateTimeFormat("en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Asia/Dhaka",
    }).format(new Date());
    setPrintedAt(date);
    window.setTimeout(() => window.print(), 0);
  };

  const uniquePatientCount = new Set(filteredVisits.map((visit) => visit.patientId)).size;
  const diagnosisRows = useMemo(() => {
    const count = new Map<string, number>();
    for (const visit of filteredVisits)
      for (const name of visit.diagnoses) count.set(name, (count.get(name) ?? 0) + 1);
    return [...count].sort((a, b) => b[1] - a[1]);
  }, [filteredVisits]);
  const medicineRows = useMemo(() => {
    const count = new Map<string, number>();
    for (const visit of filteredVisits)
      for (const name of visit.medicines) count.set(name, (count.get(name) ?? 0) + 1);
    return [...count].sort((a, b) => b[1] - a[1]).slice(0, 8);
  }, [filteredVisits]);
  const testRows = useMemo(() => {
    const count = new Map<string, number>();
    for (const visit of filteredVisits)
      for (const name of visit.investigations) count.set(name, (count.get(name) ?? 0) + 1);
    return [...count].sort((a, b) => b[1] - a[1]).slice(0, 8);
  }, [filteredVisits]);
  const sexRows = useMemo(() => {
    const count = new Map<string, number>();
    for (const patient of filteredPatients) count.set(patient.sex, (count.get(patient.sex) ?? 0) + 1);
    return [...count].sort((a, b) => b[1] - a[1]);
  }, [filteredPatients]);
  const ageRows = useMemo(() => {
    const count = new Map<string, number>();
    for (const patient of filteredPatients) {
      const label = ageGroup(patient.age);
      count.set(label, (count.get(label) ?? 0) + 1);
    }
    return [...count].sort((a, b) => b[1] - a[1]);
  }, [filteredPatients]);
  const statusRows = useMemo(() => {
    const count = new Map<string, number>();
    for (const patient of filteredPatients) count.set(patient.status, (count.get(patient.status) ?? 0) + 1);
    return [...count].sort((a, b) => b[1] - a[1]);
  }, [filteredPatients]);

  const downloadCsv = () => {
    const header = ["Date", "Patient", "Patient number", "Visit / prescription", "Chief complaint", "Diagnoses", "Medicines", "Investigations"];
    const records = filteredVisits.map((visit) => [new Date(visit.date).toLocaleDateString(), visit.patientName, visit.patientNumber, visit.prescriptionNo, visit.chiefComplaint, visit.diagnoses.join("; "), visit.medicines.join("; "), visit.investigations.join("; ")]);
    const csv = [header, ...records].map((record) => record.map(csvCell).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `kdent-visits-${range.start || "all"}-to-${range.end || "all"}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const summary = [
    { label: "Visits", value: filteredVisits.length, icon: CalendarDays },
    { label: "Patients seen", value: uniquePatientCount, icon: UsersRound },
    { label: "New registrations", value: filteredPatients.length, icon: Activity },
    { label: "Prescriptions", value: filteredVisits.filter((visit) => visit.prescriptionNo !== "Visit record").length, icon: FileBarChart2 },
  ];
  const columns = ["Date", "Patient", "Patient no.", "Complaint", "Diagnosis", "Medicines", "Tests"];

  return (
    <div className="space-y-4 pb-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Clinic analytics</p><h1 className="mt-1 text-2xl font-semibold text-white">Reports</h1><p className="mt-1 text-sm text-white/55">Operational, patient, diagnosis, prescription, and investigation reports.</p></div>
        <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90" onClick={downloadCsv} type="button"><Download className="size-4" /> Export visit CSV</button>
      </header>
      <DateRangeControls preset={preset} range={range} onPresetChange={(value) => { setPreset(value); if (value !== "custom") { setRange(presetRange(value)); setVisitPage(1); } }} onRangeChange={(nextRange) => { setRange(nextRange); setVisitPage(1); }} />
      <section aria-label="Report summary" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{summary.map(({ label, value, icon: Icon }) => <article className="rounded-xl border border-white/10 bg-secondary/55 p-4" key={label}><div className="flex items-center justify-between text-sm text-white/60">{label}<Icon className="size-4 text-primary" /></div><p className="mt-3 text-3xl font-semibold text-white">{value.toLocaleString()}</p></article>)}</section>
      <section className="grid gap-4 lg:grid-cols-3">
        <Breakdown title="Diagnoses" rows={diagnosisRows.slice(0, 10)} />
        <Breakdown title="Patient age profile" rows={ageRows} />
        <Breakdown title="Patient sex" rows={sexRows} />
        <Breakdown title="Follow-up status" rows={statusRows} />
        <Breakdown title="Most prescribed medicines" rows={medicineRows} />
        <Breakdown title="Most requested investigations" rows={testRows} />
      </section>

      <section className="overflow-hidden rounded-xl border border-white/10 bg-secondary/55" id="detailed-visit-report">
        <header className="flex flex-wrap items-end justify-between gap-3 border-b border-white/10 p-4">
          <div>
            <h2 className="font-semibold text-white">Detailed visit report</h2>
            <p className="mt-1 text-xs text-white/50">{detailedVisits.length} visit records match the filters.</p>
            <p className="print-date mt-1 text-xs">Printed: {printedAt}</p>
          </div>
          <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 print-hidden" onClick={printReport} type="button"><Printer className="size-4" />Print report</button>
        </header>
        <div className="grid gap-3 border-b border-white/10 p-4 sm:grid-cols-2 xl:grid-cols-5 print-hidden">
          <label className="relative sm:col-span-2 xl:col-span-1">
            <Search aria-hidden="true" className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-white/40" />
            <input aria-label="Search visit report" className="bg-background h-10 w-full rounded-lg border border-white/10 pr-3 pl-9 text-sm text-white" onChange={(event) => { setVisitQuery(event.target.value); setVisitPage(1); }} placeholder="Patient, diagnosis, medicine" value={visitQuery} />
          </label>
          <label className="space-y-1 text-xs text-white/60"><span>Order</span><select className="bg-background h-10 w-full rounded-lg border border-white/10 px-3 text-sm text-white" onChange={(event) => { setVisitSort(event.target.value as "NEWEST" | "OLDEST"); setVisitPage(1); }} value={visitSort}><option value="NEWEST">Newest first</option><option value="OLDEST">Oldest first</option></select></label>
          <label className="space-y-1 text-xs text-white/60"><span>From date</span><input aria-label="Visit report from date" className="bg-background h-10 w-full rounded-lg border border-white/10 px-3 text-sm text-white" max={visitTo || undefined} onChange={(event) => { setVisitFrom(event.target.value); setVisitPage(1); }} type="date" value={visitFrom} /></label>
          <label className="space-y-1 text-xs text-white/60"><span>To date</span><input aria-label="Visit report to date" className="bg-background h-10 w-full rounded-lg border border-white/10 px-3 text-sm text-white" min={visitFrom || undefined} onChange={(event) => { setVisitTo(event.target.value); setVisitPage(1); }} type="date" value={visitTo} /></label>
          <div className="flex items-end"><button className="h-10 rounded-lg border border-white/15 px-3 text-sm font-medium text-white/75 hover:bg-white/5" onClick={resetVisitFilters} type="button">Reset filters</button></div>
        </div>
        <div className="border-b border-white/10 px-4 py-2 text-xs text-white/50 print-hidden">Showing {detailedVisits.length ? (visitPage - 1) * 20 + 1 : 0}–{Math.min(visitPage * 20, detailedVisits.length)} of {detailedVisits.length} visits</div>
        <div className="max-h-[32rem] overflow-auto print-report-table">
          <table className="screen-only-visits w-full min-w-[900px] border-collapse text-left text-xs">
            <thead className="sticky top-0 bg-background text-[10px] uppercase tracking-wide text-white/60"><tr>{columns.map((name) => <th className="border-b border-white/10 px-3 py-3 font-semibold" key={name}>{name}</th>)}</tr></thead>
            <tbody className="divide-y divide-white/10 text-white/75">{visibleDetailedVisits.length ? visibleDetailedVisits.map((visit) => <tr className="hover:bg-white/5" key={visit.id}><td className="whitespace-nowrap px-3 py-3">{new Date(visit.date).toLocaleDateString()}</td><td className="px-3 py-3 font-medium text-white">{visit.patientName}</td><td className="whitespace-nowrap px-3 py-3">{visit.patientNumber}</td><td className="max-w-48 truncate px-3 py-3" title={visit.chiefComplaint}>{visit.chiefComplaint || "—"}</td><td className="max-w-48 px-3 py-3">{visit.diagnoses.join(", ") || "—"}</td><td className="max-w-48 px-3 py-3">{visit.medicines.join(", ") || "—"}</td><td className="max-w-48 px-3 py-3">{visit.investigations.join(", ") || "—"}</td></tr>) : <tr><td className="px-3 py-12 text-center text-white/45" colSpan={7}>No visit records match these filters.</td></tr>}</tbody>
          </table>
          <table className="print-only-visits w-full border-collapse text-left text-xs">
            <thead><tr>{columns.map((name) => <th className="border-b border-black/20 px-2 py-2 font-semibold" key={name}>{name}</th>)}</tr></thead>
            <tbody>{detailedVisits.map((visit) => <tr key={visit.id}><td className="whitespace-nowrap px-2 py-2">{new Date(visit.date).toLocaleDateString()}</td><td className="px-2 py-2">{visit.patientName}</td><td className="whitespace-nowrap px-2 py-2">{visit.patientNumber}</td><td className="px-2 py-2">{visit.chiefComplaint || "—"}</td><td className="px-2 py-2">{visit.diagnoses.join(", ") || "—"}</td><td className="px-2 py-2">{visit.medicines.join(", ") || "—"}</td><td className="px-2 py-2">{visit.investigations.join(", ") || "—"}</td></tr>)}</tbody>
          </table>
        </div>
        {detailedVisits.length > 0 && <nav aria-label="Detailed visit report pages" className="flex items-center justify-between border-t border-white/10 p-4 print-hidden"><button className="rounded-lg border border-white/10 px-3 py-2 text-sm text-white/75 disabled:opacity-40" disabled={visitPage <= 1} onClick={() => setVisitPage((current) => Math.max(1, current - 1))} type="button">Previous</button><span aria-live="polite" className="text-xs text-white/55">Page {visitPage} of {visitPageCount}</span><button className="rounded-lg border border-white/10 px-3 py-2 text-sm text-white/75 disabled:opacity-40" disabled={visitPage >= visitPageCount} onClick={() => setVisitPage((current) => Math.min(visitPageCount, current + 1))} type="button">Next</button></nav>}
      </section>
    </div>
  );
}
