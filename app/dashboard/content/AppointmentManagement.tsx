"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import {
  createOfflineAppointment,
  editAppointment,
  getManageableAppointmentDoctors,
  listAppointmentRequests,
  respondToAppointment,
} from "@/app/actions/appointment-portal";
import PatientDetailsFields from "@/components/appointments/PatientDetailsFields";
import { LoaderCircle, X } from "lucide-react";
import DoctorScheduleEditor, {
  type ScheduleDoctor,
} from "./DoctorScheduleEditor";
import OfflineAppointmentForm from "./OfflineAppointmentForm";

type AppointmentRequest = Awaited<
  ReturnType<typeof listAppointmentRequests>
>[number];
type DashboardRole = "DOCTOR" | "ASSISTANT" | "ADMIN";
type StatusFilter = "ALL" | "PENDING" | "ACCEPTED" | "CANCELLED";

function clinicDateTime(value: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(value));
  const part = (type: string) =>
    parts.find((item) => item.type === type)?.value ?? "00";
  return `${part("year")}-${part("month")}-${part("day")}T${part("hour")}:${part("minute")}`;
}

function AppointmentCard({
  item,
  role,
  pending,
  onDecision,
  onEdit,
}: {
  item: AppointmentRequest;
  role: DashboardRole;
  pending: boolean;
  onDecision: (
    item: AppointmentRequest,
    decision: "ACCEPTED" | "REJECTED",
  ) => void;
  onEdit: (item: AppointmentRequest) => void;
}) {
  const date = new Date(item.scheduledAt).toLocaleString("en-GB", {
    timeZone: "Asia/Dhaka",
  });
  const location = [item.clinicName, item.clinicAddress]
    .filter(Boolean)
    .join(" · ");

  return (
    <article className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 p-4">
      <div className="min-w-60">
        <p className="font-medium text-white">
          {item.patient.firstName} {item.patient.lastName ?? ""}
          <span className="ml-2 text-xs text-white/45">
            ({item.source.toLowerCase()})
          </span>
        </p>
        <p className="text-sm text-white/55">
          {date} · Dr. {item.doctor.firstName} {item.doctor.lastName ?? ""}
          {location ? ` · ${location}` : ""}
        </p>
        <p className="text-xs text-white/45">
          {item.patient.phone ?? "No phone"}
          {item.patient.email ? ` · ${item.patient.email}` : ""} ·{" "}
          {item.chiefComplaint ?? "Visit"}
        </p>
        <p className="text-primary mt-1 text-xs uppercase">
          {item.status}
          {item.serialNumber ? ` · Serial ${item.serialNumber}` : ""}
        </p>
      </div>

      <div className="flex gap-2">
        {item.status === "PENDING" && role === "DOCTOR" && (
          <button
            className="bg-primary text-primary-foreground rounded-lg px-3 py-2 text-sm font-semibold disabled:opacity-50"
            disabled={pending}
            onClick={() => onDecision(item, "ACCEPTED")}
            type="button"
          >
            {pending && <LoaderCircle aria-hidden="true" className="mr-1 inline size-4 animate-spin" />}
            Accept
          </button>
        )}
        {item.status === "PENDING" && (role === "DOCTOR" || role === "ADMIN") && (
          <>
            <button
              className="rounded-lg border border-rose-400/20 px-3 py-2 text-sm text-rose-200 disabled:opacity-50"
              disabled={pending}
              onClick={() => onDecision(item, "REJECTED")}
              type="button"
            >
              {pending && <LoaderCircle aria-hidden="true" className="mr-1 inline size-4 animate-spin" />}
              Reject
            </button>
          </>
        )}
        {item.status !== "CANCELLED" &&
          (role !== "ASSISTANT" || item.status === "PENDING") && <button
          className="rounded-lg border border-white/15 px-3 py-2 text-sm text-white/80 disabled:opacity-50"
          disabled={pending}
          onClick={() => onEdit(item)}
          type="button"
        >
          Edit
        </button>}
      </div>
    </article>
  );
}

export default function AppointmentManagement({
  role,
}: {
  role: DashboardRole;
}) {
  const [requests, setRequests] = useState<AppointmentRequest[]>([]);
  const [doctors, setDoctors] = useState<ScheduleDoctor[]>([]);
  const [notice, setNotice] = useState("");
  const [pending, startTransition] = useTransition();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("PENDING");
  const [sortOrder, setSortOrder] = useState<"NEWEST" | "OLDEST">("NEWEST");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [editingAppointment, setEditingAppointment] =
    useState<AppointmentRequest | null>(null);
  const [rejectingAppointment, setRejectingAppointment] =
    useState<AppointmentRequest | null>(null);

  const reload = async () => {
    const [items, options] = await Promise.all([
      listAppointmentRequests(),
      getManageableAppointmentDoctors(),
    ]);
    setRequests(items);
    setDoctors(options);
  };

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const [items, options] = await Promise.all([
          listAppointmentRequests(),
          getManageableAppointmentDoctors(),
        ]);
        if (!active) return;
        setRequests(items);
        setDoctors(options);
      } catch {
        if (active) setNotice("Could not load appointment data.");
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, []);

  const decide = (
    item: AppointmentRequest,
    decision: "ACCEPTED" | "REJECTED",
  ) => {
    if (decision === "REJECTED") {
      setRejectingAppointment(item);
      return;
    }
    startDecision(item, decision);
  };

  const startDecision = (
    item: AppointmentRequest,
    decision: "ACCEPTED" | "REJECTED",
  ) => {
    startTransition(async () => {
      const result = await respondToAppointment(item.id, decision);
      setNotice(
        "error" in result
          ? (result.error ?? "Update failed.")
          : (result.success ?? "Updated."),
      );
      if (!("error" in result)) await reload();
    });
  };

  const edit = (item: AppointmentRequest) => {
    setEditingAppointment(item);
  };

  const saveEdit = (formData: FormData) => {
    if (!editingAppointment) return;
    const dateTime = String(formData.get("scheduledAt") ?? "");
    startTransition(async () => {
      const result = await editAppointment({
        appointmentId: editingAppointment.id,
        doctorId: formData.get("doctorId"),
        scheduledAt: new Date(`${dateTime}:00+06:00`).toISOString(),
        chiefComplaint: formData.get("chiefComplaint"),
        firstName: formData.get("firstName"),
        lastName: formData.get("lastName"),
        phone: formData.get("phone"),
        email: formData.get("email"),
        dateOfBirth: formData.get("dateOfBirth"),
        sex: formData.get("sex"),
        bloodGroup: formData.get("bloodGroup"),
        heightCm: formData.get("heightCm") || "",
        weightKg: formData.get("weightKg") || "",
        clinicName: formData.get("clinicName"),
        clinicAddress: formData.get("clinicAddress"),
        notes: formData.get("notes"),
      });
      setNotice(
        "error" in result
          ? (result.error ?? "Could not update appointment.")
          : (result.success ?? "Updated."),
      );
      if (!("error" in result)) {
        setEditingAppointment(null);
        await reload();
      }
    });
  };

  const addOfflineAppointment = (form: FormData) =>
    startTransition(async () => {
      const date = String(form.get("date") ?? "");
      const time = String(form.get("time") ?? "");
      const scheduledAt =
        date && time ? new Date(`${date}T${time}:00+06:00`).toISOString() : "";
      const patientId = form.get("patientId") ? String(form.get("patientId")) : undefined;
      const result = await createOfflineAppointment({
        patientId,
        firstName: form.get("firstName"),
        lastName: form.get("lastName"),
        phone: form.get("phone"),
        email: form.get("email"),
        heightCm: form.get("heightCm") || "",
        weightKg: form.get("weightKg") || "",
        doctorId: form.get("doctorId"),
        scheduledAt,
        chiefComplaint: form.get("chiefComplaint"),
      });
      setNotice(
        "error" in result
          ? (result.error ?? "Could not add appointment.")
          : (result.success ?? "Added."),
      );
      if (!("error" in result)) await reload();
    });

  const filteredRequests = useMemo(() => {
    const direction = sortOrder === "NEWEST" ? -1 : 1;
    return requests
      .filter((item) => statusFilter === "ALL" || item.status === statusFilter)
      .filter((item) => {
        const date = clinicDateTime(item.scheduledAt).slice(0, 10);
        return (!dateFrom || date >= dateFrom) && (!dateTo || date <= dateTo);
      })
      .sort((a, b) => direction * (Date.parse(a.createdAt) - Date.parse(b.createdAt)));
  }, [requests, statusFilter, sortOrder, dateFrom, dateTo]);
  const pageCount = Math.max(1, Math.ceil(filteredRequests.length / 20));
  const visibleRequests = filteredRequests.slice((page - 1) * 20, page * 20);
  const resetFilters = () => {
    setStatusFilter("PENDING");
    setSortOrder("NEWEST");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <header>
        <p className="text-primary text-xs font-semibold tracking-[.16em] uppercase">
          Clinic workflow
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-white">
          Appointment requests
        </h1>
        <p className="mt-1 text-sm text-white/55">
          Review appointment requests and scheduled visits. Acceptance assigns
          a serial for the visit date.
        </p>
      </header>

      {notice && (
        <p aria-live="polite" className="text-primary text-sm" role="status">
          {notice}
        </p>
      )}

      {role !== "DOCTOR" && (
        <OfflineAppointmentForm
          action={addOfflineAppointment}
          doctors={doctors}
          pending={pending}
        />
      )}

      <section className="bg-secondary/35 rounded-2xl border border-white/10 p-4">
        <h2 className="font-semibold text-white">
          Requests and upcoming appointments
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <label className="space-y-1 text-xs text-white/60">
            <span>Status</span>
            <select className="bg-background h-10 w-full rounded-lg border border-white/10 px-3 text-sm text-white" onChange={(event) => { setStatusFilter(event.target.value as StatusFilter); setPage(1); }} value={statusFilter}>
              <option value="ALL">All statuses</option>
              <option value="PENDING">Pending</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </label>
          <label className="space-y-1 text-xs text-white/60">
            <span>Order</span>
            <select className="bg-background h-10 w-full rounded-lg border border-white/10 px-3 text-sm text-white" onChange={(event) => { setSortOrder(event.target.value as "NEWEST" | "OLDEST"); setPage(1); }} value={sortOrder}>
              <option value="OLDEST">Oldest first</option>
              <option value="NEWEST">Newest first</option>
            </select>
          </label>
          <label className="space-y-1 text-xs text-white/60">
            <span>From date</span>
            <input aria-label="Appointments from date" className="bg-background h-10 w-full rounded-lg border border-white/10 px-3 text-sm text-white" max={dateTo || undefined} onChange={(event) => { setDateFrom(event.target.value); setPage(1); }} type="date" value={dateFrom} />
          </label>
          <label className="space-y-1 text-xs text-white/60">
            <span>To date</span>
            <input aria-label="Appointments to date" className="bg-background h-10 w-full rounded-lg border border-white/10 px-3 text-sm text-white" min={dateFrom || undefined} onChange={(event) => { setDateTo(event.target.value); setPage(1); }} type="date" value={dateTo} />
          </label>
          <div className="flex items-end">
            <button className="h-10 rounded-lg border border-white/15 px-3 text-sm font-medium text-white/75 transition hover:bg-white/5" onClick={resetFilters} type="button">
              Reset filters
            </button>
          </div>
        </div>
        <p className="mt-3 text-xs text-white/50">Showing {filteredRequests.length ? (page - 1) * 20 + 1 : 0}–{Math.min(page * 20, filteredRequests.length)} of {filteredRequests.length} appointments</p>
        <div className="mt-3 space-y-3">
          {visibleRequests.map((item) => (
            <AppointmentCard
              key={item.id}
              item={item}
              onDecision={decide}
              onEdit={edit}
              pending={pending}
              role={role}
            />
          ))}
          {filteredRequests.length === 0 && (
            <p className="py-5 text-sm text-white/50">
              No appointments match these filters.
            </p>
          )}
        </div>
        {filteredRequests.length > 0 && (
          <nav aria-label="Appointment pages" className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
            <button className="rounded-lg border border-white/10 px-3 py-2 text-sm text-white/75 disabled:opacity-40" disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))} type="button">Previous</button>
            <span aria-live="polite" className="text-xs text-white/55">Page {page} of {pageCount}</span>
            <button className="rounded-lg border border-white/10 px-3 py-2 text-sm text-white/75 disabled:opacity-40" disabled={page >= pageCount} onClick={() => setPage((current) => Math.min(pageCount, current + 1))} type="button">Next</button>
          </nav>
        )}
      </section>

      {role !== "ASSISTANT" && doctors.length > 0 && (
        <DoctorScheduleEditor doctors={doctors} />
      )}

      {editingAppointment && (
        <div className="fixed inset-0 z-[80] grid place-items-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm">
          <section
            aria-labelledby="edit-appointment-title"
            aria-modal="true"
            className="my-auto max-h-[95dvh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-white/10 bg-secondary p-5 shadow-2xl"
            role="dialog"
          >
            <header className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[.16em] text-primary">{editingAppointment.status.toLowerCase()} appointment</p>
                <h2 className="mt-1 text-xl font-semibold text-white" id="edit-appointment-title">Edit appointment details</h2>
                <p className="mt-1 text-sm text-white/55">Update the patient and visit information before saving.</p>
              </div>
              <button aria-label="Close appointment editor" className="rounded-lg p-2 text-white/60 hover:bg-white/10 hover:text-white" onClick={() => setEditingAppointment(null)} type="button">
                <X className="size-4" />
              </button>
            </header>
            <form action={saveEdit} className="mt-5 grid gap-3 sm:grid-cols-2">
              <label className="space-y-1 text-sm">
                <span>Doctor</span>
                <select className="bg-background w-full rounded-lg border border-white/10 px-3 py-2" name="doctorId" required defaultValue={editingAppointment.doctor.id}>
                  {doctors.map((doctor) => <option key={doctor.id} value={doctor.id}>Dr. {doctor.firstName} {doctor.lastName ?? ""}</option>)}
                </select>
              </label>
              <label className="space-y-1 text-sm">
                <span>Visit date and time</span>
                <input className="bg-background w-full rounded-lg border border-white/10 px-3 py-2" defaultValue={clinicDateTime(editingAppointment.scheduledAt)} name="scheduledAt" required type="datetime-local" />
              </label>
              <PatientDetailsFields
                email={editingAppointment.patient.email ?? ""}
                firstName={editingAppointment.patient.firstName}
                heightCm={editingAppointment.patient.heightCm}
                lastName={editingAppointment.patient.lastName ?? ""}
                phone={editingAppointment.patient.phone ?? ""}
                weightKg={editingAppointment.patient.weightKg}
                fieldClassName="text-sm"
              />
              <label className="space-y-1 text-sm">
                <span>Date of birth</span>
                <input className="bg-background w-full rounded-lg border border-white/10 px-3 py-2" defaultValue={editingAppointment.patient.dateOfBirth} name="dateOfBirth" type="date" />
              </label>
              <label className="space-y-1 text-sm">
                <span>Sex</span>
                <select className="bg-background w-full rounded-lg border border-white/10 px-3 py-2" defaultValue={editingAppointment.patient.sex} name="sex" required>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                  <option value="UNKNOWN">Unknown</option>
                </select>
              </label>
              <label className="space-y-1 text-sm">
                <span>Blood group</span>
                <input className="bg-background w-full rounded-lg border border-white/10 px-3 py-2" defaultValue={editingAppointment.patient.bloodGroup ?? ""} maxLength={5} name="bloodGroup" />
              </label>
              <label className="space-y-1 text-sm">
                <span>Clinic</span>
                <input className="bg-background w-full rounded-lg border border-white/10 px-3 py-2" defaultValue={editingAppointment.clinicName ?? ""} name="clinicName" />
              </label>
              <label className="space-y-1 text-sm">
                <span>Clinic address</span>
                <input className="bg-background w-full rounded-lg border border-white/10 px-3 py-2" defaultValue={editingAppointment.clinicAddress ?? ""} name="clinicAddress" />
              </label>
              <label className="space-y-1 text-sm sm:col-span-2">
                <span>Reason for visit</span>
                <textarea className="bg-background min-h-24 w-full rounded-lg border border-white/10 px-3 py-2" defaultValue={editingAppointment.chiefComplaint ?? ""} name="chiefComplaint" required />
              </label>
              <label className="space-y-1 text-sm sm:col-span-2">
                <span>Appointment notes</span>
                <textarea className="bg-background min-h-20 w-full rounded-lg border border-white/10 px-3 py-2" defaultValue={editingAppointment.notes ?? ""} name="notes" />
              </label>
              <footer className="flex justify-end gap-2 sm:col-span-2">
                <button className="rounded-lg border border-white/15 px-4 py-2 text-sm text-white/75" onClick={() => setEditingAppointment(null)} type="button">Cancel</button>
        <button className="bg-primary text-primary-foreground rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-50" disabled={pending} type="submit">{pending && <LoaderCircle aria-hidden="true" className="mr-1 inline size-4 animate-spin" />}{pending ? "Saving…" : "Save changes"}</button>
              </footer>
            </form>
          </section>
        </div>
      )}

      {rejectingAppointment && (
        <div className="fixed inset-0 z-[90] grid place-items-center bg-black/70 p-4 backdrop-blur-sm">
          <section aria-labelledby="reject-appointment-title" aria-modal="true" className="w-full max-w-md rounded-2xl border border-white/10 bg-secondary p-5 shadow-2xl" role="dialog">
            <header className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[.16em] text-rose-200">Confirm rejection</p>
                <h2 className="mt-1 text-lg font-semibold text-white" id="reject-appointment-title">Reject this appointment request?</h2>
              </div>
              <button aria-label="Close rejection confirmation" className="rounded-lg p-2 text-white/60 hover:bg-white/10 hover:text-white" onClick={() => setRejectingAppointment(null)} type="button"><X className="size-4" /></button>
            </header>
            <p className="mt-3 text-sm text-white/65">{rejectingAppointment.patient.firstName} {rejectingAppointment.patient.lastName ?? ""} will be notified that the request was not accepted.</p>
            <footer className="mt-6 flex justify-end gap-2">
              <button className="rounded-lg border border-white/15 px-4 py-2 text-sm text-white/75" onClick={() => setRejectingAppointment(null)} type="button">Keep request</button>
              <button className="rounded-lg bg-rose-500/15 px-4 py-2 text-sm font-semibold text-rose-200 disabled:opacity-50" disabled={pending} onClick={() => { startDecision(rejectingAppointment, "REJECTED"); setRejectingAppointment(null); }} type="button">{pending && <LoaderCircle aria-hidden="true" className="mr-1 inline size-4 animate-spin" />}{pending ? "Rejecting…" : "Confirm rejection"}</button>
            </footer>
          </section>
        </div>
      )}
    </div>
  );
}
