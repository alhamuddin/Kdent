"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { submitOnlineAppointment } from "@/app/actions/appointment-portal";
import PatientDetailsFields from "@/components/appointments/PatientDetailsFields";

type ScheduleOption = {
  id: string;
  weekday: number;
  clinicName: string;
  clinicAddress: string | null;
  startTime: string;
  endTime: string;
  slotMinutes: number;
  enabled: boolean;
};

type DoctorOption = {
  id: string;
  firstName: string;
  lastName: string | null;
  specialty: string | null;
  schedules: ScheduleOption[];
};

type BookingFormProps = {
  doctors: DoctorOption[];
  loggedIn: boolean;
  email: string;
  name: string;
};

function clinicDateToday() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const value = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? "";
  return `${value("year")}-${value("month")}-${value("day")}`;
}

export default function BookingForm({
  doctors,
  loggedIn,
  email,
  name,
}: BookingFormProps) {
  const router = useRouter();
  const [doctorId, setDoctorId] = useState(doctors[0]?.id ?? "");
  const [date, setDate] = useState("");
  const [scheduleId, setScheduleId] = useState("");
  const [time, setTime] = useState("");
  const [notice, setNotice] = useState("");
  const [isPending, startTransition] = useTransition();
  const doctor = doctors.find((item) => item.id === doctorId);

  const availableBlocks = useMemo(() => {
    if (!date || !doctor) return [];

    const weekday = new Date(`${date}T12:00:00Z`).getUTCDay();
    return doctor.schedules
      .filter((schedule) => schedule.weekday === weekday)
      .filter((schedule) => schedule.enabled)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [date, doctor]);
  const selectedBlock = availableBlocks.find((block) => block.id === scheduleId);
  const latestStartTime = selectedBlock
    ? (() => {
        const [hour, minute] = selectedBlock.endTime.split(":").map(Number);
        const lastMinute = hour * 60 + minute - selectedBlock.slotMinutes;
        return `${String(Math.floor(lastMinute / 60)).padStart(2, "0")}:${String(lastMinute % 60).padStart(2, "0")}`;
      })()
    : undefined;

  const submit = (formData: FormData) => {
    if (!loggedIn) return;
    if (!date || !time) {
      setNotice("Choose a published appointment date and time.");
      return;
    }

    const scheduledAt = new Date(`${date}T${time}:00+06:00`).toISOString();
    const input = Object.fromEntries(formData.entries());
    startTransition(async () => {
      const result = await submitOnlineAppointment({
        ...input,
        doctorId,
        scheduledAt,
      });
      setNotice(
        "error" in result
          ? (result.error ?? "Request failed.")
          : (result.success ?? "Request sent."),
      );
      if (!("error" in result)) {
        setDate("");
        setTime("");
        router.refresh();
      }
    });
  };

  if (!loggedIn) {
    return (
      <section className="bg-secondary/45 mt-8 rounded-2xl border border-white/10 p-6">
        <p>Sign in to request an appointment and track its status.</p>
        <Link
          className="bg-primary text-primary-foreground mt-4 inline-flex rounded-lg px-4 py-2 font-semibold"
          href="/login?callbackURL=/book-appointment"
        >
          Sign in to continue
        </Link>
      </section>
    );
  }

  return (
    <form
      action={submit}
      className="bg-secondary/45 mt-8 grid gap-4 rounded-2xl border border-white/10 p-5 sm:grid-cols-2 sm:p-7"
    >
      <PatientDetailsFields
        email={email}
        firstName={name.trim().split(/\s+/)[0] ?? ""}
        lastName={name.trim().split(/\s+/).slice(1).join(" ")}
      />

      <label className="space-y-1 text-sm">
        <span>Doctor</span>
        <select
          className="bg-background w-full rounded-lg border border-white/10 px-3 py-2"
          onChange={(event) => {
            setDoctorId(event.target.value);
            setDate("");
            setScheduleId("");
            setTime("");
          }}
          required
          value={doctorId}
        >
          <option value="">Select a doctor</option>
          {doctors.map((item) => (
            <option key={item.id} value={item.id}>
              Dr. {item.firstName} {item.lastName ?? ""}
              {item.specialty ? ` · ${item.specialty}` : ""}
            </option>
          ))}
        </select>
      </label>

      <label className="space-y-1 text-sm">
        <span>Date</span>
        <input
          className="bg-background w-full rounded-lg border border-white/10 px-3 py-2"
          min={clinicDateToday()}
          onChange={(event) => {
            setDate(event.target.value);
            setScheduleId("");
            setTime("");
          }}
          required
          type="date"
          value={date}
        />
      </label>

      <label className="space-y-1 text-sm">
        <span>Available time and clinic</span>
        <select
          className="bg-background w-full rounded-lg border border-white/10 px-3 py-2"
          onChange={(event) => {
            setScheduleId(event.target.value);
            setTime("");
          }}
          required
          value={scheduleId}
        >
          <option value="">
            {!date
              ? "Select a date first"
              : availableBlocks.length
                ? "Select a clinic time block"
                : "No published times for this date"}
          </option>
          {availableBlocks.map((block) => (
            <option key={block.id} value={block.id}>
              {block.startTime}–{block.endTime} · {block.clinicName}
              {block.clinicAddress ? ` — ${block.clinicAddress}` : ""}
            </option>
          ))}
        </select>
        {date && availableBlocks.length === 0 && (
          <span className="block text-xs text-white/55">
            No published hours for this day. Try another date or doctor.
          </span>
        )}
        {!date && (
          <span className="block text-xs text-white/55">
            Choose a date to see the doctor’s published clinic times.
          </span>
        )}
      </label>

      <label className="space-y-1 text-sm">
        <span>Appointment time</span>
        <input
          className="bg-background w-full rounded-lg border border-white/10 px-3 py-2"
          disabled={!selectedBlock}
          max={latestStartTime}
          min={selectedBlock?.startTime}
          onChange={(event) => setTime(event.target.value)}
          required
          type="time"
          value={time}
        />
        <span className="block text-xs text-white/55">
          {selectedBlock
            ? `Choose a time in ${selectedBlock.clinicName}’s ${selectedBlock.startTime}–${selectedBlock.endTime} block.`
            : "Select a published clinic block first."}
        </span>
      </label>

      <label className="space-y-1 text-sm sm:col-span-2">
        <span>Reason for visit</span>
        <textarea
          className="bg-background min-h-24 w-full rounded-lg border border-white/10 px-3 py-2"
          name="chiefComplaint"
          required
        />
      </label>

      {notice && (
        <p
          aria-live="polite"
          className="text-primary text-sm sm:col-span-2"
          role="status"
        >
          {notice}
        </p>
      )}
      {doctors.length === 0 && (
        <p className="text-sm text-white/60 sm:col-span-2">
          No doctors have published appointment hours yet.
        </p>
      )}
      <button
        className="bg-primary text-primary-foreground rounded-lg px-4 py-3 font-semibold disabled:opacity-50 sm:col-span-2"
        disabled={isPending || !doctors.length}
        type="submit"
      >
        {isPending && <LoaderCircle aria-hidden="true" className="mr-2 inline size-4 animate-spin" />}
        {isPending ? "Sending request…" : "Request appointment"}
      </button>
    </form>
  );
}
