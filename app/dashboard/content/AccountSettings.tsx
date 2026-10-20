"use client";

import { useState, useTransition } from "react";
import type { FormEvent, ReactNode } from "react";
import {
  AlertCircle,
  BadgeCheck,
  CheckCircle2,
  KeyRound,
  Link2,
  LoaderCircle,
  Mail,
  MonitorSmartphone,
  ShieldCheck,
  Stethoscope,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import {
  requestAccountDeletion,
  requestAccountEmailChange,
  saveAccountPassword,
  signOutOtherSessions,
  updateAccountProfile,
} from "../../actions/account-settings";
import { loadDoctorProfile, saveDoctorProfile } from "../../actions/doctor-profile";
import { clinicDetails } from "../../libs/clinic";
import UserRoleManagement from "./UserRoleManagement";

export type AccountSettingsProps = {
  user: {
    name: string;
    email: string;
    image: string | null;
    emailVerified: boolean;
    createdAt: string;
  };
  providers: string[];
  hasPassword: boolean;
  sessionCount: number;
  role: "USER" | "DOCTOR" | "ASSISTANT" | "ADMIN";
};

type Notice = { kind: "success" | "error"; text: string } | null;

function Field({
  label,
  id,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
  autoComplete,
}: {
  label: string;
  id: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
}) {
  return (
    <label className="block space-y-1.5" htmlFor={id}>
      <span className="text-sm font-medium text-white/90">{label}</span>
      <input
        autoComplete={autoComplete}
        className="w-full rounded-lg border border-white/10 bg-background px-3 py-2.5 text-sm text-foreground outline-none transition placeholder:text-white/35 focus:border-primary focus:ring-2 focus:ring-primary/20"
        id={id}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        type={type}
        value={value}
      />
    </label>
  );
}

function Feedback({ notice }: { notice: Notice }) {
  if (!notice) return null;
  const isSuccess = notice.kind === "success";
  const Icon = isSuccess ? CheckCircle2 : AlertCircle;

  return (
    <p
      aria-live="polite"
      className={`mt-3 flex items-start gap-2 text-sm ${isSuccess ? "text-emerald-300" : "text-rose-300"}`}
      role="status"
    >
      <Icon className="mt-0.5 size-4 shrink-0" />
      <span>{notice.text}</span>
    </p>
  );
}

function SectionCard({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: typeof UserRound;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-white/10 bg-background/45 p-4 sm:p-5">
      <div className="mb-5 flex items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-4" />
        </span>
        <div>
          <h2 className="font-semibold text-white">{title}</h2>
          <p className="mt-1 text-sm leading-5 text-white/60">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

export default function AccountSettings({
  user,
  providers,
  hasPassword,
  sessionCount: initialSessionCount,
  role,
}: AccountSettingsProps) {
  const [name, setName] = useState(user.name);
  const [image, setImage] = useState(user.image ?? "");
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [sessionCount, setSessionCount] = useState(initialSessionCount);
  const [profileNotice, setProfileNotice] = useState<Notice>(null);
  const [emailNotice, setEmailNotice] = useState<Notice>(null);
  const [passwordNotice, setPasswordNotice] = useState<Notice>(null);
  const [sessionNotice, setSessionNotice] = useState<Notice>(null);
  const [deleteNotice, setDeleteNotice] = useState<Notice>(null);
  const [doctorModal, setDoctorModal] = useState(false);
  const [doctorLoading, setDoctorLoading] = useState(false);
  const [doctorSaving, setDoctorSaving] = useState(false);
  const [doctorNotice, setDoctorNotice] = useState<Notice>(null);
  const [doctorFields, setDoctorFields] = useState({ firstName: "", lastName: "", qualifications: "", specialty: "", designation: "", bmdcRegistration: "", phone: "", email: "", chamberName: "", chamberAddress: "", digitalSignature: "" });
  const [isPending, startTransition] = useTransition();

  const run = (
    action: () => Promise<{ success?: string; error?: string }>,
    setNotice: (notice: Notice) => void,
    afterSuccess?: () => void,
  ) => {
    setNotice(null);
    startTransition(async () => {
      const result = await action();
      if (result.success) {
        setNotice({ kind: "success", text: result.success });
        afterSuccess?.();
      } else {
        setNotice({ kind: "error", text: result.error ?? "Something went wrong." });
      }
    });
  };

  const saveProfile = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    run(() => updateAccountProfile({ name, image }), setProfileNotice);
  };

  const changeEmail = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    run(() => requestAccountEmailChange(newEmail), setEmailNotice);
  };

  const changePassword = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordNotice({ kind: "error", text: "The new passwords do not match." });
      return;
    }
    run(
      () => saveAccountPassword({ currentPassword, newPassword }),
      setPasswordNotice,
      () => {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      },
    );
  };

  const revokeSessions = () =>
    run(() => signOutOtherSessions(), setSessionNotice, () => setSessionCount(1));

  const deleteAccount = () =>
    run(() => requestAccountDeletion(), setDeleteNotice, () => setDeleteConfirmation(""));

  const openDoctorModal = async () => {
    setDoctorModal(true);
    setDoctorLoading(true);
    setDoctorNotice(null);
    const result = await loadDoctorProfile();
    if ("error" in result) setDoctorNotice({ kind: "error", text: result.error ?? "Could not load doctor details." });
    else setDoctorFields({
      firstName: result.doctor.firstName ?? "", lastName: result.doctor.lastName ?? "", qualifications: result.doctor.qualifications ?? "", specialty: result.doctor.specialty ?? "", designation: result.doctor.designation ?? "", bmdcRegistration: result.doctor.bmdcRegistration ?? "", phone: result.doctor.phone ?? clinicDetails.phone, email: result.doctor.email ?? clinicDetails.email, chamberName: result.doctor.chamberName ?? clinicDetails.name, chamberAddress: result.doctor.chamberAddress ?? clinicDetails.address, digitalSignature: result.doctor.digitalSignature ?? "",
    });
    setDoctorLoading(false);
  };

  const submitDoctorProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setDoctorSaving(true); setDoctorNotice(null);
    const result = await saveDoctorProfile(doctorFields);
    if ("error" in result) setDoctorNotice({ kind: "error", text: result.error ?? "Could not save doctor details." });
    else { setDoctorNotice({ kind: "success", text: "Doctor and prescription header details saved." }); window.setTimeout(() => setDoctorModal(false), 700); }
    setDoctorSaving(false);
  };

  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "KD";

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5">
      <header className="flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">
            Workspace settings
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Account settings
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/60">
            Manage your profile, sign-in details, and account security.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
        {(role === "ADMIN" || role === "DOCTOR") && <button className="inline-flex items-center gap-2 rounded-xl border border-primary/25 bg-primary/10 px-3 py-2.5 text-sm font-medium text-primary transition hover:bg-primary/15" onClick={openDoctorModal} type="button"><Stethoscope className="size-4"/> Doctor & prescription header</button>}
        <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-background/40 p-3 sm:min-w-56">
          <span className="grid size-11 shrink-0 place-items-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
            {initials}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium text-white">{name}</span>
            <span className="block truncate text-xs text-white/55">{user.email}</span>
          </span>
        </div>
        </div>
      </header>

      <div className="grid items-start gap-4 xl:grid-cols-2">
        <SectionCard
          description="Update the name and profile image URL shown with your account."
          icon={UserRound}
          title="Personal information"
        >
          <form className="space-y-4" onSubmit={saveProfile}>
            <Field
              autoComplete="name"
              id="account-name"
              label="Display name"
              onChange={setName}
              required
              value={name}
            />
            <Field
              id="account-image"
              label="Profile image URL"
              onChange={setImage}
              placeholder="https://example.com/profile.jpg"
              type="url"
              value={image}
            />
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <p className="text-xs text-white/50">
                Member since {new Date(user.createdAt).toLocaleDateString()}
              </p>
              <button
                className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
                disabled={isPending}
                type="submit"
              >
                {isPending && <LoaderCircle aria-hidden="true" className="mr-1 inline size-4 animate-spin" />}
                Save profile
              </button>
            </div>
            <Feedback notice={profileNotice} />
          </form>
        </SectionCard>

        <SectionCard
          description="Your email is used for sign-in and account recovery. Changes require email confirmation."
          icon={Mail}
          title="Email address"
        >
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/10 bg-background/60 p-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-white">{user.email}</p>
              <p className="mt-1 text-xs text-white/50">Current account email</p>
            </div>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${user.emailVerified ? "bg-emerald-400/10 text-emerald-300" : "bg-amber-400/10 text-amber-200"}`}
            >
              <BadgeCheck className="size-3.5" />
              {user.emailVerified ? "Verified" : "Unverified"}
            </span>
          </div>
          <form className="space-y-4" onSubmit={changeEmail}>
            <Field
              autoComplete="email"
              id="new-account-email"
              label="New email address"
              onChange={setNewEmail}
              required
              type="email"
              value={newEmail}
            />
            <div className="flex justify-end">
              <button
                className="rounded-lg border border-white/15 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/5 disabled:opacity-50"
                disabled={isPending}
                type="submit"
              >
                {isPending && <LoaderCircle aria-hidden="true" className="mr-1 inline size-4 animate-spin" />}
                Send confirmation
              </button>
            </div>
            <Feedback notice={emailNotice} />
          </form>
        </SectionCard>

        <SectionCard
          description={
            hasPassword
              ? "Use a strong password you do not use for another account. Other sessions are signed out after a change."
              : "Add a password so you can also sign in with your email address."
          }
          icon={KeyRound}
          title={hasPassword ? "Change password" : "Add a password"}
        >
          <form className="space-y-4" onSubmit={changePassword}>
            {hasPassword && (
              <Field
                autoComplete="current-password"
                id="current-password"
                label="Current password"
                onChange={setCurrentPassword}
                required
                type="password"
                value={currentPassword}
              />
            )}
            <Field
              autoComplete="new-password"
              id="new-password"
              label="New password"
              onChange={setNewPassword}
              required
              type="password"
              value={newPassword}
            />
            <Field
              autoComplete="new-password"
              id="confirm-password"
              label="Confirm new password"
              onChange={setConfirmPassword}
              required
              type="password"
              value={confirmPassword}
            />
            <div className="flex justify-end">
              <button
                className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
                disabled={isPending}
                type="submit"
              >
                {isPending && <LoaderCircle aria-hidden="true" className="mr-1 inline size-4 animate-spin" />}
                {hasPassword ? "Update password" : "Add password"}
              </button>
            </div>
            <p className="text-xs leading-5 text-white/50">
              At least 8 characters, with uppercase and lowercase letters, a number, and a symbol.
            </p>
            <Feedback notice={passwordNotice} />
          </form>
        </SectionCard>

        <SectionCard
          description="Review the sign-in methods connected to your account and protect active sessions."
          icon={ShieldCheck}
          title="Security and sign-in"
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-lg border border-white/10 bg-background/60 p-3">
              <Link2 className="mt-0.5 size-4 shrink-0 text-primary" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-white">Connected sign-in methods</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {providers.map((provider) => (
                    <span
                      className="rounded-full border border-white/10 px-2.5 py-1 text-xs capitalize text-white/75"
                      key={provider}
                    >
                      {provider === "credential" ? "Email and password" : provider}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-3 rounded-lg border border-white/10 bg-background/60 p-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <MonitorSmartphone className="mt-0.5 size-4 shrink-0 text-primary" />
                <div>
                  <p className="text-sm font-medium text-white">Active sessions</p>
                  <p className="mt-1 text-xs text-white/55">
                    {sessionCount} session{sessionCount === 1 ? "" : "s"} currently signed in
                  </p>
                </div>
              </div>
              <button
                className="shrink-0 rounded-lg border border-white/15 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/5 disabled:opacity-50 sm:text-sm"
                disabled={isPending || sessionCount < 2}
                onClick={revokeSessions}
                type="button"
              >
                {isPending && <LoaderCircle aria-hidden="true" className="mr-1 inline size-4 animate-spin" />}
                Sign out other sessions
              </button>
            </div>
            <Feedback notice={sessionNotice} />
          </div>
        </SectionCard>
      </div>

      {(role === "ADMIN" || role === "DOCTOR") && <UserRoleManagement role={role} />}

      <section className="rounded-xl border border-rose-400/25 bg-rose-400/[0.04] p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-rose-400/10 text-rose-300">
            <Trash2 className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="font-semibold text-white">Delete account</h2>
            <p className="mt-1 max-w-3xl text-sm leading-5 text-white/60">
              Permanently remove your K-Dent account. We will email a confirmation link to {user.email}; deletion happens only after you open that link.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
              <Field
                id="confirm-account-deletion"
                label={'Type "DELETE" to request deletion'}
                onChange={setDeleteConfirmation}
                value={deleteConfirmation}
              />
              <button
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-rose-400/30 px-4 py-2.5 text-sm font-semibold text-rose-200 transition hover:bg-rose-400/10 disabled:cursor-not-allowed disabled:opacity-40"
                disabled={isPending || deleteConfirmation !== "DELETE"}
                onClick={deleteAccount}
                type="button"
              >
                <Trash2 className="size-4" />
                {isPending && <LoaderCircle aria-hidden="true" className="mr-1 inline size-4 animate-spin" />}
                Request deletion
              </button>
            </div>
            <Feedback notice={deleteNotice} />
          </div>
        </div>
      </section>

      {doctorModal && (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-black/70 p-3 backdrop-blur-sm sm:p-6">
          <section aria-labelledby="doctor-profile-title" aria-modal="true" className="flex max-h-[95dvh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-secondary shadow-2xl" role="dialog">
            <header className="flex items-center justify-between border-b border-white/10 p-4 sm:p-5">
              <div><p className="text-[10px] font-semibold uppercase tracking-widest text-primary">Prescription setup</p><h2 className="mt-1 text-lg font-semibold text-white" id="doctor-profile-title">Doctor & clinic details</h2><p className="mt-1 text-xs text-white/50">These details appear around the centered K-Dent logo on printed prescriptions.</p></div>
              <button aria-label="Close doctor details" className="rounded-lg p-2 text-white/60 hover:bg-white/10 hover:text-white" onClick={() => setDoctorModal(false)} type="button"><X className="size-5"/></button>
            </header>
            {doctorLoading ? <div className="flex items-center justify-center gap-2 p-12 text-sm text-white/60"><LoaderCircle className="size-4 animate-spin"/> Loading doctor details</div> : <form className="min-h-0 overflow-y-auto p-4 sm:p-5" onSubmit={submitDoctorProfile}>
              <div className="grid gap-3 sm:grid-cols-2">
                {([
                  ["firstName", "First name", true], ["lastName", "Last name", false], ["qualifications", "Education / qualifications", true], ["specialty", "Specialty", false], ["designation", "Designation", false], ["bmdcRegistration", "BMDC registration", false], ["phone", "Clinic phone", false], ["email", "Clinic email", false], ["chamberName", "Clinic name", false],
                ] as const).map(([key, label, required]) => <label className="block space-y-1.5" key={key}><span className="text-xs font-medium text-white/75">{label}{required && <span className="ml-1 text-rose-300">*</span>}</span><input className="h-10 w-full rounded-lg border border-white/10 bg-background/60 px-3 text-sm text-white outline-none focus:border-primary" onChange={(event) => setDoctorFields((current) => ({ ...current, [key]: event.target.value }))} required={required} value={doctorFields[key]}/></label>)}
                <label className="block space-y-1.5 sm:col-span-2"><span className="text-xs font-medium text-white/75">K-Dent clinic address</span><textarea className="min-h-20 w-full rounded-lg border border-white/10 bg-background/60 p-3 text-sm text-white outline-none focus:border-primary" onChange={(event) => setDoctorFields((current) => ({ ...current, chamberAddress: event.target.value }))} value={doctorFields.chamberAddress}/></label>
                <label className="block space-y-1.5 sm:col-span-2"><span className="text-xs font-medium text-white/75">Digital signature (name or image URL)</span><input className="h-10 w-full rounded-lg border border-white/10 bg-background/60 px-3 text-sm text-white outline-none focus:border-primary" onChange={(event) => setDoctorFields((current) => ({ ...current, digitalSignature: event.target.value }))} value={doctorFields.digitalSignature}/></label>
              </div>
              <Feedback notice={doctorNotice}/>
              <footer className="mt-5 flex justify-end gap-2"><button className="rounded-lg px-4 py-2 text-sm text-white/70 hover:bg-white/5" onClick={() => setDoctorModal(false)} type="button">Cancel</button><button className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50" disabled={doctorSaving} type="submit">{doctorSaving && <LoaderCircle aria-hidden="true" className="mr-1 inline size-4 animate-spin" />}{doctorSaving ? "Saving…" : "Save doctor details"}</button></footer>
            </form>}
          </section>
        </div>
      )}

      {isPending && (
        <span className="sr-only" role="status">
          <LoaderCircle className="animate-spin" /> Saving account settings
        </span>
      )}
    </div>
  );
}
