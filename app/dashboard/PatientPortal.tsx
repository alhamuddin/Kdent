"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { LoaderCircle } from "lucide-react";
import { cancelPatientAppointment } from "@/app/actions/appointment-portal";
import UserGreeting from "./UserGreeting";
import PatientPortalNavigation from "./PatientPortalNavigation";

type Data = Awaited<
  ReturnType<
    typeof import("@/app/actions/appointment-portal").loadPatientPortal
  >
>;
export default function PatientPortal({ data, userName }: { data: Data; userName: string }) {
  const [appointments, setAppointments] = useState(data.appointments);
  const [notice, setNotice] = useState("");
  const [pending, startTransition] = useTransition();
  const cancel = (id: string) =>
    startTransition(async () => {
      const result = await cancelPatientAppointment(id);
      if ("error" in result) setNotice(result.error ?? "Cancellation failed.");
      else {
        setAppointments((items) =>
          items.map((item) =>
            item.id === id ? { ...item, status: "CANCELLED" } : item,
          ),
        );
        setNotice("Appointment cancelled.");
      }
    });
  return (
    <main className="bg-background min-h-screen px-4 py-10 text-white sm:px-8">
      <div className="mx-auto max-w-5xl">
        <UserGreeting name={userName} role="USER" />
        <PatientPortalNavigation activePage="dashboard" />
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-primary text-xs font-semibold tracking-[.16em] uppercase">
              Patient dashboard
            </p>
            <h1 className="mt-1 text-3xl font-semibold">Your care</h1>
          </div>
          <Link
            className="bg-primary text-primary-foreground rounded-lg px-4 py-2 font-semibold"
            href="/book-appointment"
          >
            Book an appointment
          </Link>
        </header>
        <section className="bg-secondary/35 mt-8 rounded-2xl border border-white/10 p-5">
          <h2 className="text-lg font-semibold">
            Appointment status and history
          </h2>
          {appointments.length ? (
            <div className="mt-4 space-y-3">
              {appointments.map((item) => (
                <article
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 p-4"
                  key={item.id}
                >
                  <div>
                    <p className="font-medium">
                      {new Date(item.scheduledAt).toLocaleString()}
                    </p>
                    <p className="mt-1 text-sm text-white/55">
                      Dr. {item.doctor.firstName} {item.doctor.lastName ?? ""} ·{" "}
                      {item.chiefComplaint ?? "Appointment"}
                    </p>
                    {(item.clinicName || item.clinicAddress) && (
                      <p className="mt-1 text-xs text-white/45">
                        {[item.clinicName, item.clinicAddress]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    )}
                    <p className="text-primary mt-1 text-xs tracking-wide uppercase">
                      {item.status}
                      {item.serialNumber
                        ? ` · Serial ${item.serialNumber}`
                        : ""}
                    </p>
                  </div>
                  {item.canCancel && item.status === "ACCEPTED" && (
                    <button
                      className="rounded-lg border border-white/15 px-3 py-2 text-sm disabled:opacity-50"
                      disabled={pending}
                      onClick={() => cancel(item.id)}
                      type="button"
                    >
                      {pending && <LoaderCircle aria-hidden="true" className="mr-1 inline size-4 animate-spin" />}
                      Cancel appointment
                    </button>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-white/55">
              No appointment history yet.
            </p>
          )}
        </section>
        {notice && (
          <p
            aria-live="polite"
            className="text-primary mt-3 text-sm"
            role="status"
          >
            {notice}
          </p>
        )}
        <section className="bg-secondary/35 mt-6 rounded-2xl border border-white/10 p-5">
          <h2 className="text-lg font-semibold">Previous prescriptions</h2>
          {data.visits.length ? (
            <div className="mt-4 space-y-3">
              {data.visits.map((visit) => (
                <article
                  className="rounded-xl border border-white/10 p-4"
                  key={visit.id}
                >
                  <div className="flex flex-wrap justify-between gap-2">
                    <b>{visit.prescriptionNo}</b>
                    <span className="text-sm text-white/50">
                      {new Date(visit.issuedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-white/65">
                    {visit.chiefComplaint ?? "Visit"}
                  </p>
                  {visit.diagnoses.length > 0 && (
                    <p className="mt-2 text-sm text-white/75">
                      Diagnosis:{" "}
                      {visit.diagnoses.map((d) => d.diagnosis.name).join(", ")}
                    </p>
                  )}
                  <ul className="mt-2 list-inside list-disc text-sm text-white/55">
                    {visit.medications.map((medicine, index) => (
                      <li key={`${medicine.medicineName}-${index}`}>
                        {medicine.medicineName} · {medicine.dose} ·{" "}
                        {medicine.frequency}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-white/55">
              No prescriptions available yet.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
