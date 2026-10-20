"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { updateAppointmentSchedule } from "@/app/actions/appointment-portal";

const weekdays = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export type ScheduleDoctor = {
  id: string;
  firstName: string;
  lastName: string | null;
  schedules: {
    id: string;
    weekday: number;
    clinicName: string;
    clinicAddress: string | null;
    startTime: string;
    endTime: string;
    slotMinutes: number;
    enabled: boolean;
  }[];
};

type ScheduleRow = {
  key: string;
  weekday: number;
  clinicName: string;
  clinicAddress: string;
  startTime: string;
  endTime: string;
  slotMinutes: number;
  enabled: boolean;
};

function toScheduleRows(doctor?: ScheduleDoctor): ScheduleRow[] {
  return (doctor?.schedules ?? []).map((schedule) => ({
    key: schedule.id,
    ...schedule,
    clinicAddress: schedule.clinicAddress ?? "",
  }));
}

function newScheduleRow(): ScheduleRow {
  return {
    key: `new-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    weekday: 1,
    clinicName: "Main clinic",
    clinicAddress: "",
    startTime: "09:00",
    endTime: "17:00",
    slotMinutes: 20,
    enabled: true,
  };
}

export default function DoctorScheduleEditor({
  doctors,
}: {
  doctors: ScheduleDoctor[];
}) {
  const router = useRouter();
  const [doctorId, setDoctorId] = useState(doctors[0]?.id ?? "");
  const [schedules, setSchedules] = useState<ScheduleRow[]>(
    toScheduleRows(doctors[0]),
  );
  const [scheduleCache, setScheduleCache] = useState<
    Record<string, ScheduleRow[]>
  >({});
  const [notice, setNotice] = useState("");
  const [pending, startTransition] = useTransition();

  const updateRow = (key: string, changes: Partial<ScheduleRow>) => {
    setSchedules((current) =>
      current.map((row) => (row.key === key ? { ...row, ...changes } : row)),
    );
  };

  const selectDoctor = (id: string) => {
    const selectedDoctor = doctors.find((doctor) => doctor.id === id);
    setDoctorId(id);
    setSchedules(scheduleCache[id] ?? toScheduleRows(selectedDoctor));
    setNotice("");
  };

  const save = () =>
    startTransition(async () => {
      const result = await updateAppointmentSchedule({
        doctorId,
        schedules: schedules.map(
          ({
            weekday,
            clinicName,
            clinicAddress,
            startTime,
            endTime,
            slotMinutes,
            enabled,
          }) => ({
            weekday,
            clinicName,
            clinicAddress,
            startTime,
            endTime,
            slotMinutes,
            enabled,
          }),
        ),
      });
      setNotice(
        "error" in result
          ? (result.error ?? "Could not save schedule.")
          : (result.success ?? "Schedule saved."),
      );
      if (!("error" in result)) {
        setScheduleCache((current) => ({ ...current, [doctorId]: schedules }));
        router.refresh();
      }
    });

  if (doctors.length === 0) return null;

  return (
    <section className="bg-secondary/35 rounded-2xl border border-white/10 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold text-white">Doctor schedule</h2>
          <p className="mt-1 text-xs text-white/50">
            Add a time block for each clinic and day. Published times appear on
            the booking page.
          </p>
        </div>
        {doctors.length > 1 && (
          <label className="space-y-1 text-xs text-white/60">
            <span>Doctor</span>
            <select
              aria-label="Select doctor schedule"
              className="bg-background block rounded-lg border border-white/10 px-3 py-2 text-sm text-white"
              onChange={(event) => selectDoctor(event.target.value)}
              value={doctorId}
            >
              {doctors.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  Dr. {doctor.firstName} {doctor.lastName ?? ""}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full min-w-[900px] border-collapse text-left text-sm">
          <thead className="bg-background/80 text-xs tracking-wide text-white/60 uppercase">
            <tr>
              <th className="px-3 py-3">Day</th>
              <th className="px-3 py-3">Clinic</th>
              <th className="px-3 py-3">Address</th>
              <th className="px-3 py-3">Starts</th>
              <th className="px-3 py-3">Ends</th>
              <th className="px-3 py-3">Slot (min)</th>
              <th className="px-3 py-3">Published</th>
              <th className="px-3 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {schedules.map((schedule) => (
              <tr key={schedule.key}>
                <td className="px-3 py-2">
                  <select
                    aria-label="Schedule day"
                    className="bg-background rounded-md border border-white/10 px-2 py-2"
                    onChange={(event) =>
                      updateRow(schedule.key, {
                        weekday: Number(event.target.value),
                      })
                    }
                    value={schedule.weekday}
                  >
                    {weekdays.map((day, weekday) => (
                      <option key={day} value={weekday}>
                        {day}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-3 py-2">
                  <input
                    aria-label="Clinic name"
                    className="bg-background w-36 rounded-md border border-white/10 px-2 py-2"
                    maxLength={120}
                    onChange={(event) =>
                      updateRow(schedule.key, {
                        clinicName: event.target.value,
                      })
                    }
                    value={schedule.clinicName}
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    aria-label="Clinic address"
                    className="bg-background w-48 rounded-md border border-white/10 px-2 py-2"
                    maxLength={240}
                    onChange={(event) =>
                      updateRow(schedule.key, {
                        clinicAddress: event.target.value,
                      })
                    }
                    value={schedule.clinicAddress}
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    aria-label="Starts at"
                    className="bg-background rounded-md border border-white/10 px-2 py-2"
                    onChange={(event) =>
                      updateRow(schedule.key, { startTime: event.target.value })
                    }
                    type="time"
                    value={schedule.startTime}
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    aria-label="Ends at"
                    className="bg-background rounded-md border border-white/10 px-2 py-2"
                    onChange={(event) =>
                      updateRow(schedule.key, { endTime: event.target.value })
                    }
                    type="time"
                    value={schedule.endTime}
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    aria-label="Slot length in minutes"
                    className="bg-background w-24 rounded-md border border-white/10 px-2 py-2"
                    max={180}
                    min={5}
                    onChange={(event) =>
                      updateRow(schedule.key, {
                        slotMinutes: Number(event.target.value),
                      })
                    }
                    type="number"
                    value={schedule.slotMinutes}
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    aria-label="Publish schedule"
                    checked={schedule.enabled}
                    onChange={(event) =>
                      updateRow(schedule.key, { enabled: event.target.checked })
                    }
                    type="checkbox"
                  />
                </td>
                <td className="px-3 py-2">
                  <button
                    className="rounded-md border border-white/15 px-2 py-1 text-xs text-white/75 hover:bg-white/5"
                    onClick={() =>
                      setSchedules((current) =>
                        current.filter((row) => row.key !== schedule.key),
                      )
                    }
                    type="button"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
            {schedules.length === 0 && (
              <tr>
                <td className="px-3 py-5 text-center text-white/50" colSpan={8}>
                  No schedule times yet. Add a clinic time to publish
                  appointment availability.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          className="rounded-lg border border-white/15 px-3 py-2 text-sm text-white/80 hover:bg-white/5"
          onClick={() =>
            setSchedules((current) => [...current, newScheduleRow()])
          }
          type="button"
        >
          Add time block
        </button>
        <button
          className="bg-primary text-primary-foreground rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-50"
          disabled={pending || !doctorId}
          onClick={save}
          type="button"
        >
          {pending && <LoaderCircle aria-hidden="true" className="mr-2 inline size-4 animate-spin" />}
          {pending ? "Saving…" : "Save schedule"}
        </button>
        {notice && (
          <p aria-live="polite" className="text-primary text-sm" role="status">
            {notice}
          </p>
        )}
      </div>
    </section>
  );
}
