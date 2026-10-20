"use client";

import { useEffect, useState, useTransition } from "react";
import { CheckCircle2, LoaderCircle, Plus, Search, ShieldAlert, Stethoscope, Trash2, X } from "lucide-react";
import {
  listUsersForDoctorManagement,
  promoteUserToDoctor,
  removeDoctorAccess,
  addAssistant,
  removeAssistant,
  deleteUserFromDatabase,
} from "@/app/actions/user-management";

type ManagedUser = {
  id: string;
  name: string;
  email: string;
  role: "USER" | "DOCTOR" | "ASSISTANT" | "ADMIN";
  createdAt: Date | string;
  doctor: { id: string } | null;
};

export default function UserRoleManagement({ role }: { role: "DOCTOR" | "ADMIN" }) {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [confirmUser, setConfirmUser] = useState<ManagedUser | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ManagedUser | null>(null);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState<{ error: boolean; text: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(() => {
      listUsersForDoctorManagement(search)
        .then((result) => {
          if (active) setUsers(result);
        })
        .catch(() => {
          if (active) setMessage({ error: true, text: "Could not load user accounts." });
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    }, 300);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [search]);

  const updateRole = (user: ManagedUser) => {
    setPendingId(user.id);
    setMessage(null);
    startTransition(async () => {
      try {
        const result = user.role === "USER"
          ? await promoteUserToDoctor(user.id)
          : await removeDoctorAccess(user.id);
        if (result.error) {
          setMessage({ error: true, text: result.error });
          setConfirmUser(null);
        } else {
          setMessage({ error: false, text: result.success ?? "Account role updated." });
          setUsers((current) => current.map((entry) =>
            entry.id === user.id
              ? { ...entry, role: user.role === "USER" ? "DOCTOR" : "USER" }
              : entry,
          ));
          setConfirmUser(null);
        }
      } catch {
        setMessage({ error: true, text: "Could not update this account. Please try again." });
        setConfirmUser(null);
      } finally {
        setPendingId(null);
      }
    });
  };

  const updateAssistant = (user: ManagedUser) => {
    setPendingId(user.id); setMessage(null);
    startTransition(async () => {
      try {
        const result = user.role === "ASSISTANT" ? await removeAssistant(user.id) : await addAssistant(user.id);
        if (result.error) setMessage({ error: true, text: result.error });
        else { setMessage({ error: false, text: result.success ?? "Assistant role updated." }); setUsers((current) => current.map((entry) => entry.id === user.id ? { ...entry, role: user.role === "ASSISTANT" ? "USER" : "ASSISTANT" } : entry)); }
      } catch { setMessage({ error: true, text: "Could not update assistant access." }); }
      finally { setPendingId(null); }
    });
  };

  const deleteAccount = (user: ManagedUser) => {
    setPendingId(user.id);
    setMessage(null);
    startTransition(async () => {
      try {
        const result = await deleteUserFromDatabase(user.id);
        if (result.error) setMessage({ error: true, text: result.error });
        else {
          setMessage({ error: false, text: result.success ?? "Account deleted." });
          setUsers((current) => current.filter((entry) => entry.id !== user.id));
          setDeleteTarget(null);
        }
      } catch {
        setMessage({ error: true, text: "Could not delete this account." });
      } finally {
        setPendingId(null);
      }
    });
  };

  return (
    <section className="rounded-xl border border-white/10 bg-background/45 p-4 sm:p-5">
      <div className="mb-5 flex items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
          <Stethoscope className="size-4" />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Doctor and admin</p>
          <h2 className="mt-1 font-semibold text-white">Team access</h2>
          <p className="mt-1 text-sm leading-5 text-white/60">
            Doctors and admins can add or remove assistants. Admins also manage doctor access.
          </p>
        </div>
      </div>

      <label className="relative mb-4 block">
        <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-white/40" />
        <span className="sr-only">Search users by name or email</span>
        <input
          autoComplete="off"
          className="w-full rounded-lg border border-white/10 bg-background py-2.5 pr-3 pl-9 text-sm text-white outline-none placeholder:text-white/35 focus:border-primary"
          onChange={(event) => {
            setLoading(true);
            setMessage(null);
            setSearch(event.target.value);
          }}
          placeholder="Search by name or email"
          type="search"
          value={search}
        />
      </label>

      {message && (
        <p aria-live="polite" className={`mb-3 flex items-center gap-2 text-sm ${message.error ? "text-rose-300" : "text-emerald-300"}`} role="status">
          {message.error ? <ShieldAlert className="size-4" /> : <CheckCircle2 className="size-4" />}
          {message.text}
        </p>
      )}

      <div className="overflow-x-auto rounded-lg border border-white/10">
        <table className="w-full min-w-[38rem] border-collapse text-left text-sm">
          <thead className="bg-white/[0.03] text-xs uppercase tracking-wide text-white/50">
            <tr>
              <th className="px-3 py-3 font-medium">User</th>
              <th className="px-3 py-3 font-medium">Joined</th>
              <th className="px-3 py-3 font-medium">Role</th>
              <th className="px-3 py-3 text-right font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {loading ? (
              <tr><td className="p-4 text-white/55" colSpan={4}><span className="inline-flex items-center gap-2"><LoaderCircle className="size-4 animate-spin" /> Searching users…</span></td></tr>
            ) : users.length ? users.map((user) => (
              <tr className="text-white/85" key={user.id}>
                <td className="max-w-64 px-3 py-3">
                  <p className="truncate font-medium text-white">{user.name}</p>
                  <p className="truncate text-xs text-white/50">{user.email}</p>
                </td>
                <td className="whitespace-nowrap px-3 py-3 text-xs text-white/60">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-3 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${user.role === "ADMIN" ? "bg-amber-400/10 text-amber-200" : user.role === "DOCTOR" ? "bg-primary/10 text-primary" : user.role === "ASSISTANT" ? "bg-violet-400/10 text-violet-200" : "bg-white/5 text-white/60"}`}>
                    {user.role.toLowerCase()}
                  </span>
                </td>
                <td className="px-3 py-3 text-right">
                  {user.role === "ADMIN" ? (
                    <span className="text-xs text-white/40">Admin account</span>
                  ) : (
                    <div className="inline-flex flex-wrap justify-end gap-2">
                      {user.role === "ASSISTANT" && (
                        <button className="rounded-lg border border-rose-400/20 px-3 py-2 text-xs font-semibold text-rose-200 disabled:opacity-50" disabled={isPending} onClick={() => updateAssistant(user)} type="button">Remove assistant</button>
                      )}
                      {user.role === "DOCTOR" && role === "ADMIN" && (
                        <button className="rounded-lg border border-rose-400/20 px-3 py-2 text-xs font-semibold text-rose-200 disabled:opacity-50" disabled={isPending} onClick={() => setConfirmUser(user)} type="button">Remove doctor</button>
                      )}
                      {user.role === "USER" && role === "ADMIN" && (
                        <button className="inline-flex items-center gap-1.5 rounded-lg border border-primary/25 bg-primary/10 px-3 py-2 text-xs font-semibold text-primary disabled:opacity-50" disabled={isPending} onClick={() => setConfirmUser(user)} type="button"><Plus className="size-3.5" />Add as doctor</button>
                      )}
                      {user.role === "USER" && (
                        <button className="rounded-lg border border-violet-400/20 px-3 py-2 text-xs font-semibold text-violet-200 disabled:opacity-50" disabled={isPending} onClick={() => updateAssistant(user)} type="button">Add assistant</button>
                      )}
                      {role === "ADMIN" && (
                        <button aria-label={`Delete account for ${user.name}`} className="inline-flex items-center gap-1.5 rounded-lg border border-rose-400/20 px-3 py-2 text-xs font-semibold text-rose-200 disabled:opacity-50" disabled={isPending} onClick={() => setDeleteTarget(user)} type="button"><Trash2 className="size-3.5" />Delete</button>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            )) : (
              <tr><td className="p-4 text-sm text-white/55" colSpan={4}>{search ? "No matching users found." : "No user accounts found."}</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-white/40">Showing up to 100 matching accounts. Search to narrow the list.</p>

      {confirmUser && (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-black/70 p-4 backdrop-blur-sm" onMouseDown={(event) => {
          if (event.target === event.currentTarget && !isPending) setConfirmUser(null);
        }}>
          <section
            aria-labelledby="doctor-access-confirm-title"
            aria-modal="true"
            className="w-full max-w-md rounded-2xl border border-white/10 bg-secondary p-5 shadow-2xl"
            role="dialog"
          >
            <header className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Confirm role change</p>
                <h3 className="mt-2 text-lg font-semibold text-white" id="doctor-access-confirm-title">
                  {confirmUser.role === "USER" ? "Add as doctor?" : "Delete doctor access?"}
                </h3>
              </div>
              <button
                aria-label="Close confirmation"
                className="rounded-lg p-2 text-white/60 hover:bg-white/10 hover:text-white disabled:opacity-40"
                disabled={isPending}
                onClick={() => setConfirmUser(null)}
                type="button"
              >
                <X className="size-4" />
              </button>
            </header>
            <p className="mt-4 text-sm text-white">
              {confirmUser.name} <span className="text-white/55">({confirmUser.email})</span>
            </p>
            <p className="mt-2 text-sm leading-6 text-white/60">
              {confirmUser.role === "USER"
                ? "This account will be able to sign in to the doctor dashboard and use clinical features."
                : "This account will lose doctor dashboard access. The account and its clinical history will be kept."}
            </p>
            <footer className="mt-6 flex justify-end gap-2">
              <button
                className="rounded-lg border border-white/15 px-4 py-2.5 text-sm font-medium text-white/75 hover:bg-white/5 disabled:opacity-50"
                disabled={isPending}
                onClick={() => setConfirmUser(null)}
                type="button"
              >
                Cancel
              </button>
              <button
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold disabled:cursor-wait disabled:opacity-50 ${confirmUser.role === "USER" ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-rose-500/15 text-rose-200 hover:bg-rose-500/25"}`}
                disabled={isPending}
                onClick={() => updateRole(confirmUser)}
                type="button"
              >
                {isPending && pendingId === confirmUser.id && <LoaderCircle className="size-4 animate-spin" />}
                {confirmUser.role === "USER" ? "Confirm add" : "Confirm delete"}
              </button>
            </footer>
          </section>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-[90] grid place-items-center bg-black/70 p-4 backdrop-blur-sm" onMouseDown={(event) => {
          if (event.target === event.currentTarget && !isPending) setDeleteTarget(null);
        }}>
          <section aria-labelledby="delete-account-title" aria-modal="true" className="w-full max-w-md rounded-2xl border border-rose-400/20 bg-secondary p-5 shadow-2xl" role="dialog">
            <header className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-rose-200">Permanent deletion</p>
                <h3 className="mt-2 text-lg font-semibold text-white" id="delete-account-title">Delete this account?</h3>
              </div>
              <button aria-label="Close delete confirmation" className="rounded-lg p-2 text-white/60 hover:bg-white/10 hover:text-white" disabled={isPending} onClick={() => setDeleteTarget(null)} type="button"><X className="size-4" /></button>
            </header>
            <p className="mt-4 text-sm text-white">{deleteTarget.name} <span className="text-white/55">({deleteTarget.email})</span></p>
            <p className="mt-2 text-sm leading-6 text-white/60">
              {deleteTarget.doctor
                ? "This permanently deletes the login, doctor profile, appointments, and prescriptions for this doctor. Patient records remain in the database."
                : "This permanently deletes the login and active sessions. Any patient record remains in the database."}
            </p>
            <footer className="mt-6 flex justify-end gap-2">
              <button className="rounded-lg border border-white/15 px-4 py-2.5 text-sm text-white/75 disabled:opacity-50" disabled={isPending} onClick={() => setDeleteTarget(null)} type="button">Cancel</button>
              <button className="rounded-lg bg-rose-500/15 px-4 py-2.5 text-sm font-semibold text-rose-200 disabled:opacity-50" disabled={isPending} onClick={() => deleteAccount(deleteTarget)} type="button">{isPending && pendingId === deleteTarget.id && <LoaderCircle aria-hidden="true" className="mr-1 inline size-4 animate-spin" />}{isPending && pendingId === deleteTarget.id ? "Deleting…" : "Delete permanently"}</button>
            </footer>
          </section>
        </div>
      )}
    </section>
  );
}
