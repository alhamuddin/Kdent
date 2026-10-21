"use client";

import { useMemo, useState } from "react";
import { Activity, CalendarCheck2, ClipboardPlus, UsersRound } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DashboardPatient, DashboardVisit } from "../dashboard-data";
import { DateRangeControls, presetRange } from "./DateRangeControls";
import type { DatePreset, DateRange } from "./DateRangeControls";

const palette = ["#35d2c3", "#ffbd59", "#ff6f91", "#69aefc", "#b693ff", "#57d99b"];
const dateInRange = (value: string, range: DateRange) => {
  const date = value.slice(0, 10);
  return (!range.start || date >= range.start) && (!range.end || date <= range.end);
};
const ageBand = (age: number | null) => age === null ? "Unknown" : age < 13 ? "Child" : age < 20 ? "Teen" : age < 60 ? "Adult" : "60+";

function groupVisits(visits: DashboardVisit[], preset: DatePreset, range: DateRange) {
  const dayCount = range.start && range.end ? (Date.parse(`${range.end}T00:00:00`) - Date.parse(`${range.start}T00:00:00`)) / 86_400_000 : 365;
  const groupByMonth = preset === "yearly" || (preset === "custom" && dayCount > 45);
  const buckets = new Map<string, number>();
  if (preset === "yearly") {
    for (let month = 0; month < 12; month += 1) buckets.set(new Date(2000, month, 1).toLocaleString(undefined, { month: "short" }), 0);
  } else if (preset === "weekly" && range.start && range.end) {
    const start = new Date(`${range.start}T00:00:00`);
    const end = new Date(`${range.end}T00:00:00`);
    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      buckets.set(date.toLocaleString(undefined, { weekday: "short" }), 0);
    }
  }
  for (const visit of visits) {
    const date = new Date(visit.date);
    const label = groupByMonth
      ? date.toLocaleString(undefined, { month: "short", year: preset === "custom" ? "2-digit" : undefined })
      : preset === "weekly"
        ? date.toLocaleString(undefined, { weekday: "short" })
        : date.toLocaleString(undefined, { day: "2-digit", month: "short" });
    buckets.set(label, (buckets.get(label) ?? 0) + 1);
  }
  return [...buckets].map(([label, count]) => ({ label, visits: count }));
}

export default function PatientDashboard({ patients, visits }: { patients: DashboardPatient[]; visits: DashboardVisit[] }) {
  const [preset, setPreset] = useState<DatePreset>("monthly");
  const [range, setRange] = useState<DateRange>(() => presetRange("monthly"));
  const filteredVisits = useMemo(() => visits.filter((visit) => dateInRange(visit.date, range)), [visits, range]);
  const newPatients = useMemo(() => patients.filter((patient) => dateInRange(patient.createdAt, range)), [patients, range]);
  const returningPatients = useMemo(() => {
    const visitCounts = new Map<string, number>();
    for (const visit of visits) visitCounts.set(visit.patientId, (visitCounts.get(visit.patientId) ?? 0) + 1);
    return new Set(filteredVisits.filter((visit) => (visitCounts.get(visit.patientId) ?? 0) > 1).map((visit) => visit.patientId)).size;
  }, [filteredVisits, visits]);
  const visitTrend = useMemo(() => groupVisits(filteredVisits, preset, range), [filteredVisits, preset, range]);
  const diagnosisData = useMemo(() => {
    const counts = new Map<string, number>();
    for (const visit of filteredVisits) for (const diagnosis of visit.diagnoses) counts.set(diagnosis, (counts.get(diagnosis) ?? 0) + 1);
    return [...counts].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 6);
  }, [filteredVisits]);
  const ageData = useMemo(() => {
    const counts = new Map<string, number>([["Child", 0], ["Teen", 0], ["Adult", 0], ["60+", 0], ["Unknown", 0]]);
    for (const patient of patients) counts.set(ageBand(patient.age), (counts.get(ageBand(patient.age)) ?? 0) + 1);
    return [...counts].map(([name, value]) => ({ name, value })).filter((entry) => entry.value > 0);
  }, [patients]);

  const cards = [
    { label: "Patient records", value: patients.length, detail: "All registered patients", icon: UsersRound },
    { label: "New patients", value: newPatients.length, detail: "Registered in selected dates", icon: ClipboardPlus },
    { label: "Visits", value: filteredVisits.length, detail: "Visits in selected dates", icon: CalendarCheck2 },
    { label: "Returning patients", value: returningPatients, detail: "More than one recorded visit", icon: Activity },
  ];

  return (
    <div className="space-y-4 pb-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Clinic analytics</p>
          <h1 className="mt-1 text-2xl font-semibold text-white">Dashboard</h1>
          <p className="mt-1 text-sm text-white/55">Patient activity and visit trends from your clinic records.</p>
        </div>
      </header>
      <DateRangeControls preset={preset} range={range} onPresetChange={(value) => { setPreset(value); if (value !== "custom") setRange(presetRange(value)); }} onRangeChange={setRange} />
      <section aria-label="Clinic metrics" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, detail, icon: Icon }) => (
          <article className="rounded-xl border border-white/10 bg-secondary/55 p-4" key={label}>
            <div className="flex items-center justify-between"><span className="text-sm text-white/60">{label}</span><Icon className="size-4 text-primary" /></div>
            <p className="mt-3 text-3xl font-semibold text-white">{value.toLocaleString()}</p>
            <p className="mt-1 text-xs text-white/45">{detail}</p>
          </article>
        ))}
      </section>
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(280px,1fr)]">
        <article className="rounded-xl border border-white/10 bg-secondary/55 p-4">
          <div className="mb-4"><h2 className="font-semibold text-white">Visit activity</h2><p className="text-xs text-white/50">Visits within the selected date range.</p></div>
          <div className="h-72">
            {visitTrend.some((point) => point.visits > 0) ? <ResponsiveContainer height="100%" width="100%" initialDimension={{ width: 640, height: 288 }}><AreaChart data={visitTrend} margin={{ top: 8, right: 12, left: -20, bottom: 0 }}><defs><linearGradient id="visitFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#20b2a6" stopOpacity={0.4} /><stop offset="95%" stopColor="#20b2a6" stopOpacity={0.02} /></linearGradient></defs><CartesianGrid stroke="rgba(255,255,255,.08)" vertical={false} /><XAxis axisLine={false} dataKey="label" tick={{ fill: "#aab3bd", fontSize: 11 }} tickLine={false} /><YAxis allowDecimals={false} axisLine={false} tick={{ fill: "#aab3bd", fontSize: 11 }} tickLine={false} /><Tooltip contentStyle={{ background: "#141a1f", border: "1px solid #303943", borderRadius: 10, color: "#fff" }} /><Area dataKey="visits" fill="url(#visitFill)" stroke="#20b2a6" strokeWidth={2} type="monotone" /></AreaChart></ResponsiveContainer> : <div className="grid h-full place-items-center text-sm text-white/45">No visits in this date range.</div>}
          </div>
        </article>
        <article className="rounded-xl border border-white/10 bg-secondary/55 p-4">
          <div className="mb-4"><h2 className="font-semibold text-white">Patient age profile</h2><p className="text-xs text-white/50">Age bands across registered patients.</p></div>
          <div className="relative mx-auto h-60 max-w-72">
            {ageData.length ? <><ResponsiveContainer height="100%" width="100%" initialDimension={{ width: 288, height: 240 }}><PieChart><Pie data={ageData} dataKey="value" innerRadius={67} nameKey="name" outerRadius={91} paddingAngle={2} stroke="#202a32" strokeWidth={2}>{ageData.map((entry, index) => <Cell fill={palette[index % palette.length]} key={entry.name} />)}</Pie><Tooltip contentStyle={{ background: "#141a1f", border: "1px solid #303943", borderRadius: 10, color: "#fff" }} /></PieChart></ResponsiveContainer><div className="pointer-events-none absolute inset-0 grid place-items-center text-center"><div><p className="text-3xl font-semibold tracking-tight text-white">{patients.length.toLocaleString()}</p><p className="mt-1 text-[10px] font-semibold uppercase tracking-[.16em] text-white/45">Patients</p></div></div></> : <div className="grid h-full place-items-center text-sm text-white/45">No patient records.</div>}
          </div>
          <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2">
            {ageData.map((entry, index) => {
              const share = patients.length ? Math.round((entry.value / patients.length) * 100) : 0;
              return <div className="flex min-w-0 items-center gap-2 text-xs" key={entry.name}>
                <i aria-hidden="true" className="size-2.5 shrink-0 rounded-sm" style={{ backgroundColor: palette[index % palette.length] }} />
                <span className="min-w-0 flex-1 truncate text-white/65">{entry.name}</span>
                <span className="shrink-0 font-medium text-white">{entry.value} <span className="font-normal text-white/40">{share}%</span></span>
              </div>;
            })}
          </div>
        </article>
      </section>
      <section className="rounded-xl border border-white/10 bg-secondary/55 p-4">
        <div className="mb-3 flex items-end justify-between gap-3"><div><h2 className="font-semibold text-white">Common diagnoses</h2><p className="text-xs text-white/50">Most recorded diagnoses in the selected dates.</p></div><span className="text-xs text-white/45">{filteredVisits.length} visits</span></div>
        {diagnosisData.length ? <div className="h-64"><ResponsiveContainer height="100%" width="100%" initialDimension={{ width: 640, height: 256 }}><BarChart data={diagnosisData} layout="vertical" margin={{ top: 4, right: 20, left: 16, bottom: 0 }}><CartesianGrid stroke="rgba(255,255,255,.08)" horizontal={false} /><XAxis allowDecimals={false} axisLine={false} tick={{ fill: "#aab3bd", fontSize: 11 }} tickLine={false} type="number" /><YAxis axisLine={false} dataKey="name" tick={{ fill: "#dce2e8", fontSize: 11 }} tickLine={false} type="category" width={145} /><Tooltip contentStyle={{ background: "#141a1f", border: "1px solid #303943", borderRadius: 10, color: "#fff" }} /><Bar dataKey="count" fill="#20b2a6" radius={[0, 5, 5, 0]} /></BarChart></ResponsiveContainer></div> : <p className="py-10 text-center text-sm text-white/45">No diagnosis data in this date range.</p>}
      </section>
    </div>
  );
}
