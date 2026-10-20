"use client";

import PatientDetailsFields from "@/components/appointments/PatientDetailsFields";
import { LoaderCircle } from "lucide-react";
import type { ScheduleDoctor } from "./DoctorScheduleEditor";

type OfflineAppointmentFormProps = {
  doctors: Pick<ScheduleDoctor, "id" | "firstName" | "lastName">[];
  pending: boolean;
  action: (formData: FormData) => void;
};

const inputClassName =
  "w-full rounded-lg border border-white/10 bg-background px-3 py-2 text-sm";

export default function OfflineAppointmentForm({
  doctors,
  pending,
  action,
}: OfflineAppointmentFormProps) {
  return (
    <section className="bg-secondary/35 rounded-2xl border border-white/10 p-4">
      <h2 className="font-semibold text-white">Add offline appointment</h2>
      <p className="mt-1 text-xs text-white/50">
        The patient record and pending request are created together. A doctor or
        admin must accept it.
      </p>
      <form action={action} className="mt-4 grid gap-3 sm:grid-cols-2">
        <PatientDetailsFields fieldClassName="text-sm" />
        <label className="space-y-1 text-sm">
          <span>Doctor</span>
          <select className={inputClassName} name="doctorId" required>
            <option value="">Select a doctor</option>
            {doctors.map((doctor) => (
              <option key={doctor.id} value={doctor.id}>
                Dr. {doctor.firstName} {doctor.lastName ?? ""}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-sm">
          <span>Date</span>
          <input className={inputClassName} name="date" required type="date" />
        </label>
        <label className="space-y-1 text-sm">
          <span>Time</span>
          <input className={inputClassName} name="time" required type="time" />
        </label>
        <label className="space-y-1 text-sm sm:col-span-2">
          <span>Reason for visit</span>
          <input className={inputClassName} name="chiefComplaint" required />
        </label>
        <button
          className="bg-primary text-primary-foreground rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-50 sm:col-span-2"
          disabled={pending || !doctors.length}
          type="submit"
        >
          {pending && <LoaderCircle aria-hidden="true" className="mr-2 inline size-4 animate-spin" />}
          {pending ? "Adding…" : "Add appointment request"}
        </button>
      </form>
    </section>
  );
}
