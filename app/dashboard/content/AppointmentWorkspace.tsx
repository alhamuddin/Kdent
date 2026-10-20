"use client";

import Image from "next/image";
import { useEffect, useId, useState, useTransition } from "react";
import type { FormEvent } from "react";
import { CalendarDays, FilePlus2, History, LoaderCircle, Pencil, Plus, Printer, Search, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDebouncedValue } from "@/app/hooks/useDebouncedValue";
import { clinicDetails } from "../../libs/clinic";
import { visitValidationSchema } from "../../utils/appointment-validation";
import { createPatient, deletePatient, deletePreviousVisit, getPatientHistory, loadAppointmentWorkspace, loadInitialPatients, savePrescription, searchDrugCatalog, searchPatients, updatePatient } from "../../actions/appointments";

type Patient = { id: string; patientNumber: string; firstName: string; lastName: string | null; dateOfBirth: string | null; sex: string; phone: string | null; email?: string | null; heightCm?: string | null; weightKg?: string | null; bloodGroup: string | null };
type Doctor = { firstName: string; lastName: string | null; qualifications: string | null; specialty: string | null; designation: string | null; bmdcRegistration: string | null; phone: string | null; email: string | null; chamberName: string | null; chamberAddress: string | null; digitalSignature: string | null };
type Visit = { id: string; prescriptionNo: string; issuedAt: string; appointmentAt: string | null; status: string; doctorName: string; chiefComplaint: string | null; medicalHistory: string | null; examination: string | null; investigationNotes: string | null; treatmentPlan: string | null; clinicalNotes: string | null; patientInstructions: string | null; weightKg: string; bmi: string; bloodPressure: string; diagnoses: string[]; medications: { id: string; medicineName: string; dose: string; frequency: string; durationValue: number | null; durationUnit: string | null; instructions?: string | null }[]; investigations: { id: string; investigationName: string; status: string; priority: string }[] };
type PatientFields = { id?: string; firstName: string; lastName: string; dateOfBirth: string; sex: string; phone: string; email: string; heightCm: string; weightKg: string; bloodGroup: string };
type Medicine = { medicineName: string; dose: string; route: string; frequency: string; durationValue: string; durationUnit: string; instructions: string };
type Test = { investigationName: string; type: string; priority: string; clinicalReason: string; instructions: string };
type PrintSnapshot = { patient: Patient; issuedAt: string; prescriptionNo: string; complaint: string; medicalHistory: string; examination: string; investigationNotes: string; treatmentPlan: string; comment: string; instructions: string; diagnosis: string; medicines: Medicine[]; tests: Test[]; weight: string; bmi?: string; bloodPressure: string; doctorName?: string };

const patientSearchCache = new Map<string, Patient[]>();
let initialPatientCache: Patient[] | null = null;
let initialPatientRequest: Promise<Patient[]> | null = null;

function getInitialPatients() {
  if (initialPatientCache) return Promise.resolve(initialPatientCache);
  if (!initialPatientRequest) {
    initialPatientRequest = loadInitialPatients()
      .then((result) => {
        if ("error" in result) throw new Error(result.error);
        initialPatientCache = result.patients as Patient[];
        return initialPatientCache;
      })
      .finally(() => {
        initialPatientRequest = null;
      });
  }
  return initialPatientRequest;
}

function retryInitialPatients() {
  initialPatientCache = null;
  initialPatientRequest = null;
  return getInitialPatients();
}

const emptyPatient = (): PatientFields => ({ firstName: "", lastName: "", dateOfBirth: "", sex: "", phone: "", email: "", heightCm: "", weightKg: "", bloodGroup: "" });
const emptyMedicine = (): Medicine => ({ medicineName: "", dose: "", route: "ORAL", frequency: "", durationValue: "", durationUnit: "days", instructions: "" });
const emptyTest = (): Test => ({ investigationName: "", type: "LABORATORY", priority: "ROUTINE", clinicalReason: "", instructions: "" });
const localDateTime = () => { const now = new Date(); return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16); };
const patientName = (p: Pick<Patient, "firstName" | "lastName">) => `${p.firstName} ${p.lastName ?? ""}`.trim();
const dateLabel = (value: string | null) => value ? new Date(value).toLocaleDateString(undefined, { dateStyle: "medium" }) : "-";

function Input({ label, value, onChange, type = "text", required = false, placeholder }: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean; placeholder?: string }) {
  return <label className="block space-y-1.5"><span className="text-xs font-medium text-white/75">{label}{required && <span className="ml-1 text-rose-300">*</span>}</span><input className="h-10 w-full rounded-lg border border-white/10 bg-background/60 px-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-primary" onChange={(e) => onChange(e.target.value)} placeholder={placeholder} required={required} type={type} value={value} /></label>;
}

function TextArea({ label, value, onChange, required = false, placeholder }: { label: string; value: string; onChange: (v: string) => void; required?: boolean; placeholder?: string }) {
  return <label className="block space-y-1.5"><span className="text-xs font-medium text-white/75">{label}{required && <span className="ml-1 text-rose-300">*</span>}</span><textarea className="min-h-24 w-full rounded-lg border border-white/10 bg-background/60 p-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-primary" onChange={(e) => onChange(e.target.value)} placeholder={placeholder} required={required} value={value}/></label>;
}

function Select({ label, value, onChange, options, required = false }: { label: string; value: string; onChange: (v: string) => void; options: [string, string][]; required?: boolean }) {
  return <label className="block space-y-1.5"><span className="text-xs font-medium text-white/75">{label}{required && <span className="ml-1 text-rose-300">*</span>}</span><select className="h-10 w-full rounded-lg border border-white/10 bg-background px-3 text-sm text-white outline-none focus:border-primary" onChange={(e) => onChange(e.target.value)} required={required} value={value}><option value="">Select {label.toLowerCase()}</option>{options.map(([v, name]) => <option key={v} value={v}>{name}</option>)}</select></label>;
}

function MedicineNameInput({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const suggestionsId = useId();
  const [suggestions, setSuggestions] = useState<{ id: string; name: string }[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lookupError, setLookupError] = useState("");
  const debouncedValue = useDebouncedValue(value, 300);
  const query = debouncedValue.trim();

  useEffect(() => {
    if (query.length < 2) return;

    let active = true;
    searchDrugCatalog(query)
      .then((result) => {
        if (!active) return;
        setIsLoading(false);
        if ("error" in result) {
          setSuggestions([]);
          setLookupError(result.error ?? "Drug suggestions are temporarily unavailable.");
        } else {
          setSuggestions(result.medications);
        }
      })
      .catch(() => {
        if (active) {
          setIsLoading(false);
          setSuggestions([]);
          setLookupError("Drug suggestions are temporarily unavailable.");
        }
      });

    return () => { active = false; };
  }, [query]);

  const showSuggestions = isOpen && query.length >= 2;

  return <div className="relative space-y-1.5">
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-white/75">Medicine name<span className="ml-1 text-rose-300">*</span></span>
      <input
        aria-autocomplete="list"
        aria-controls={suggestionsId}
        aria-expanded={showSuggestions}
        autoComplete="off"
        className="h-10 w-full rounded-lg border border-white/10 bg-background/60 px-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-primary"
        onChange={(event) => {
          const nextValue = event.target.value;
          onChange(nextValue);
          setIsOpen(true);
          setIsLoading(nextValue.trim().length >= 2);
          setLookupError("");
          if (nextValue.trim().length < 2) setSuggestions([]);
        }}
        onFocus={() => setIsOpen(true)}
        onBlur={() => window.setTimeout(() => setIsOpen(false), 120)}
        placeholder="Type a medicine name"
        required
        role="combobox"
        value={value}
      />
    </label>
    {showSuggestions && <div className="absolute inset-x-0 top-full z-30 mt-1 max-h-64 overflow-y-auto rounded-lg border border-white/10 bg-secondary p-1 shadow-xl" id={suggestionsId} role="listbox" aria-label="DGHS medicine suggestions">
      {isLoading ? <p className="px-3 py-2 text-xs text-white/50">Searching DGHS drug catalogâ€¦</p>
        : lookupError ? <p className="px-3 py-2 text-xs text-rose-300">{lookupError}</p>
          : suggestions.length ? suggestions.slice(0, 10).map((suggestion) => <button
            aria-selected="false"
            className="block w-full rounded-md px-3 py-2 text-left text-sm text-white/85 hover:bg-primary/15 hover:text-white focus:bg-primary/15 focus:outline-none"
            key={suggestion.id}
            onClick={() => { onChange(suggestion.name); setIsOpen(false); }}
            onMouseDown={(event) => event.preventDefault()}
            role="option"
            type="button"
          >{suggestion.name}</button>)
            : <p className="px-3 py-2 text-xs text-white/50">No matching medicines.</p>}
    </div>}
  </div>;
}

export default function AppointmentWorkspace() {
  const [patients, setPatients] = useState<Patient[]>(initialPatientCache ?? []);
  const [initialLoading, setInitialLoading] = useState(initialPatientCache === null);
  const [initialLoadError, setInitialLoadError] = useState(false);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [query, setQuery] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [patientModal, setPatientModal] = useState(false);
  const [editing, setEditing] = useState(false);
  const [patientFields, setPatientFields] = useState<PatientFields>(emptyPatient);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [showVisitForm, setShowVisitForm] = useState(false);
  const [appointmentAt, setAppointmentAt] = useState(localDateTime);
  const [complaint, setComplaint] = useState("");
  const [medicalHistory, setMedicalHistory] = useState("");
  const [examination, setExamination] = useState("");
  const [investigationNotes, setInvestigationNotes] = useState("");
  const [treatmentPlan, setTreatmentPlan] = useState("");
  const [comment, setComment] = useState("");
  const [instructions, setInstructions] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [weight, setWeight] = useState("");
  const [bloodPressure, setBloodPressure] = useState("");
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [tests, setTests] = useState<Test[]>([]);
  const [notice, setNotice] = useState("");
  const [noticeType, setNoticeType] = useState<"error" | "success" | "info">("info");
  const [printSnapshot, setPrintSnapshot] = useState<PrintSnapshot | null>(null);
  const [isPending, startTransition] = useTransition();
  const debouncedQuery = useDebouncedValue(query, 350);
  const debouncedSearchKey = debouncedQuery.trim().toLowerCase();

  const showError = (message: string) => { setNoticeType("error"); setNotice(message); };
  const showSuccess = (message: string) => { setNoticeType("success"); setNotice(message); };

  useEffect(() => { loadAppointmentWorkspace().then((result) => { if ("error" in result) showError(result.error ?? "Could not load doctor details."); else setDoctor(result.doctor); }).catch(() => showError("Could not load doctor details.")); }, []);
  useEffect(() => {
    let active = true;
    getInitialPatients()
      .then((found) => {
        if (active) setPatients(found);
      })
      .catch((error: unknown) => {
        if (active) {
          setInitialLoadError(true);
          showError(error instanceof Error ? error.message : "Patient records could not be loaded.");
        }
      })
      .finally(() => {
        if (active) setInitialLoading(false);
      });
    return () => { active = false; };
  }, []);
  const retryPatientLoad = () => {
    setInitialLoadError(false);
    setInitialLoading(true);
    retryInitialPatients()
      .then((found) => setPatients(found))
      .catch((error: unknown) => {
        setInitialLoadError(true);
        showError(error instanceof Error ? error.message : "Patient records could not be loaded.");
      })
      .finally(() => setInitialLoading(false));
  };
  useEffect(() => {
    const normalized = debouncedQuery.trim().toLowerCase();
    if (selectedPatient || normalized.length < 2) return;
    const cached = patientSearchCache.get(normalized);
    if (cached) return;
    let active = true;
    searchPatients(normalized).then((result) => {
      if (!active) return;
      if ("error" in result) showError(result.error ?? "Patient search failed.");
      else {
        const found = result.patients as Patient[];
        patientSearchCache.set(normalized, found);
        setPatients(found);
      }
      setSearchLoading(false);
    }).catch(() => { if (active) { setSearchLoading(false); showError("Patient search failed."); } });
    return () => { active = false; };
  }, [debouncedQuery, selectedPatient]);
  useEffect(() => {
    if (!selectedPatient) return;
    let active = true;
    getPatientHistory(selectedPatient.id).then((result) => { if (!active) return; if ("error" in result) showError(result.error ?? "Could not load visit history."); else setVisits(result.visits as Visit[]); setHistoryLoading(false); }).catch(() => { if (active) { setHistoryLoading(false); showError("Could not load visit history."); } });
    return () => { active = false; };
  }, [selectedPatient]);

  const closePatientModal = () => { setPatientModal(false); setEditing(false); setPatientFields(emptyPatient()); };
  const openCreate = () => { setPatientFields(emptyPatient()); setEditing(false); setPatientModal(true); };
  const openEdit = () => { if (!selectedPatient) return; setPatientFields({ id: selectedPatient.id, firstName: selectedPatient.firstName, lastName: selectedPatient.lastName ?? "", dateOfBirth: selectedPatient.dateOfBirth ?? "", sex: selectedPatient.sex === "UNKNOWN" ? "" : selectedPatient.sex, phone: selectedPatient.phone ?? "", email: selectedPatient.email ?? "", heightCm: selectedPatient.heightCm ?? "", weightKg: selectedPatient.weightKg ?? "", bloodGroup: selectedPatient.bloodGroup ?? "" }); setEditing(true); setPatientModal(true); };
  const submitPatient = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setNotice("");
    startTransition(async () => {
      const result = editing ? await updatePatient(patientFields) : await createPatient(patientFields);
      if ("error" in result) { showError(result.error ?? "Could not save patient."); return; }
      const saved = result.patient as Patient;
      patientSearchCache.clear();
      setPatients((current) => editing ? current.map((p) => p.id === saved.id ? saved : p) : [saved, ...current]);
      if (initialPatientCache) {
        initialPatientCache = editing
          ? initialPatientCache.map((patient) => patient.id === saved.id ? saved : patient)
          : [saved, ...initialPatientCache.filter((patient) => patient.id !== saved.id)].slice(0, 20);
      }
      setVisits([]); setHistoryLoading(true); setSelectedPatient(saved);
      closePatientModal(); showSuccess(editing ? "Patient record updated." : "Patient registered.");
    });
  };
  const removePatient = () => {
    if (!selectedPatient || !window.confirm(`Delete ${patientName(selectedPatient)}? Patients with clinical history cannot be deleted.`)) return;
    startTransition(async () => { const result = await deletePatient(selectedPatient.id); if ("error" in result) { showError(result.error ?? "Could not delete patient."); return; } patientSearchCache.clear(); setPatients((current) => current.filter((p) => p.id !== selectedPatient.id)); if (initialPatientCache) initialPatientCache = initialPatientCache.filter((p) => p.id !== selectedPatient.id); setSelectedPatient(null); setShowVisitForm(false); showSuccess("Patient record deleted."); });
  };
  const startNewVisit = () => { setAppointmentAt(localDateTime()); setComplaint(""); setMedicalHistory(""); setExamination(""); setInvestigationNotes(""); setTreatmentPlan(""); setComment(""); setInstructions(""); setDiagnosis(""); setWeight(selectedPatient?.weightKg ?? ""); setBloodPressure(""); setMedicines([]); setTests([]); setShowVisitForm(true); };
  const printPreviousVisit = (visit: Visit) => {
    if (!selectedPatient) return;
    setPrintSnapshot({
      patient: selectedPatient,
      issuedAt: visit.issuedAt,
      prescriptionNo: visit.prescriptionNo,
      complaint: visit.chiefComplaint ?? "",
      medicalHistory: visit.medicalHistory ?? "",
      examination: visit.examination ?? "",
      investigationNotes: visit.investigationNotes ?? "",
      treatmentPlan: visit.treatmentPlan ?? "",
      comment: visit.clinicalNotes ?? "",
      instructions: visit.patientInstructions ?? "",
      diagnosis: visit.diagnoses.join(", "),
      medicines: visit.medications.map((medicine) => ({ medicineName: medicine.medicineName, dose: medicine.dose, route: "ORAL", frequency: medicine.frequency, durationValue: medicine.durationValue?.toString() ?? "", durationUnit: medicine.durationUnit ?? "days", instructions: medicine.instructions ?? "" })),
      tests: visit.investigations.map((test) => ({ investigationName: test.investigationName, type: "OTHER", priority: test.priority, clinicalReason: "", instructions: "" })),
      weight: visit.weightKg,
      bmi: visit.bmi,
      bloodPressure: visit.bloodPressure,
      doctorName: visit.doctorName,
    });
    window.setTimeout(() => window.print(), 200);
  };
  const removeVisit = (visit: Visit) => {
    if (!window.confirm(`Delete visit ${visit.prescriptionNo}? Its prescription and clinical details will also be removed.`)) return;
    startTransition(async () => {
      const result = await deletePreviousVisit(visit.id);
      if ("error" in result) { showError(result.error ?? "Could not delete visit."); return; }
      if (selectedPatient) {
        const refreshed = await getPatientHistory(selectedPatient.id);
        if ("visits" in refreshed) setVisits(refreshed.visits as Visit[]);
      }
      showSuccess("Previous visit deleted.");
    });
  };
  const issuePrescription = () => {
    if (!selectedPatient) return;
    const parsedAppointmentAt = new Date(appointmentAt);
    if (Number.isNaN(parsedAppointmentAt.getTime())) { showError("Enter a valid visit date and time."); return; }
    const visitCheck = visitValidationSchema.safeParse({
      appointmentAt: parsedAppointmentAt.toISOString(), chiefComplaint: complaint,
      medicalHistory, examination, investigationNotes, treatmentPlan,
      clinicalNotes: comment, patientInstructions: instructions,
      medications: medicines, investigations: tests,
    });
    if (!visitCheck.success) { showError(visitCheck.error.issues[0]?.message ?? "Complete the required visit fields."); return; }
    startTransition(async () => {
      const payload = {
        patientId: selectedPatient.id,
        appointmentAt: parsedAppointmentAt.toISOString(),
        chiefComplaint: complaint,
        medicalHistory,
        examination,
        investigationNotes,
        treatmentPlan,
        clinicalNotes: comment,
        patientInstructions: instructions,
        weightKg: weight,
        systolicBP: bloodPressure.split("/")[0]?.trim() ?? "",
        diastolicBP: bloodPressure.split("/")[1]?.trim() ?? "",
        diagnoses: diagnosis.trim() ? [{ name: diagnosis }] : [],
        medications: medicines.map((medicine) => ({ ...medicine, durationValue: medicine.durationValue ? Number(medicine.durationValue) : null })),
        investigations: tests.map(({ investigationName, type, priority }) => ({ investigationName, type, priority })),
      };
      const result = await savePrescription(payload);
      if ("error" in result) { showError(result.error ?? "Could not issue prescription."); return; }
      const bmiWeight = Number(weight || selectedPatient.weightKg || 0);
      const bmiValue = selectedPatient.heightCm && bmiWeight > 0 ? (bmiWeight / Math.pow(Number(selectedPatient.heightCm) / 100, 2)).toFixed(2) : "";
      setPrintSnapshot({ patient: selectedPatient, issuedAt: result.prescription.issuedAt, prescriptionNo: result.prescription.prescriptionNo, complaint, medicalHistory, examination, investigationNotes, treatmentPlan, comment, instructions, diagnosis, medicines: medicines.map((m) => ({ ...m })), tests: tests.map((t) => ({ ...t })), weight, bmi: bmiValue, bloodPressure, doctorName: doctor ? `Dr. ${doctor.firstName} ${doctor.lastName ?? ""}`.trim() : undefined });
      showSuccess(`Prescription ${result.prescription.prescriptionNo} issued.`); setShowVisitForm(false);
      const refreshed = await getPatientHistory(selectedPatient.id); if ("visits" in refreshed) setVisits(refreshed.visits as Visit[]);
      window.setTimeout(() => window.print(), 200);
    });
  };
  const isSearchQuery = query.trim().length >= 2;
  const filtered = !selectedPatient
    ? isSearchQuery && query.trim().toLowerCase() === debouncedSearchKey
      ? patientSearchCache.get(debouncedSearchKey) ?? patients
      : isSearchQuery ? [] : initialPatientCache ?? patients
    : [];

  return <div className="appointment-workspace flex h-full min-h-0 flex-col gap-4 overflow-y-auto pr-1">
    <header className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-gradient-to-br from-secondary/95 to-background/75 p-4 sm:p-5">
      <div><p className="text-[10px] font-semibold uppercase tracking-[.18em] text-primary">K-Dent clinic</p><h1 className="mt-1 text-xl font-semibold text-white sm:text-2xl">Appointments & prescriptions</h1><p className="mt-1 text-xs text-white/50">Patient records, visit history, and printable prescriptions.</p></div>
      <Button onClick={openCreate}><Plus className="size-4" /> Register patient</Button>
    </header>
    {notice && <div className={`flex items-center justify-between rounded-xl border px-3 py-2 text-sm ${noticeType === "error" ? "border-rose-400/30 bg-rose-950/40 text-rose-300" : noticeType === "success" ? "border-emerald-400/25 bg-emerald-950/30 text-emerald-300" : "border-white/10 bg-secondary/60 text-white/80"}`} role={noticeType === "error" ? "alert" : "status"}><span>{notice}</span><button aria-label="Dismiss" onClick={() => setNotice("")}><X className="size-4" /></button></div>}

    {!selectedPatient ? <section className="rounded-2xl border border-white/10 bg-secondary/55 p-4 sm:p-5">
      <div className="mb-4 flex items-center gap-2"><Search className="size-4 text-primary"/><input className="h-10 min-w-0 flex-1 rounded-lg border border-white/10 bg-background/60 px-3 text-sm text-white outline-none focus:border-primary" onChange={(e) => { const value = e.target.value; const key = value.trim().toLowerCase(); setQuery(value); setSearchLoading(key.length >= 2 && !patientSearchCache.has(key)); }} placeholder="Search patient name, number, phone" value={query}/></div>
      <h2 className="mb-3 text-sm font-semibold text-white">{isSearchQuery ? "Search results" : "Recent patient records"} <span className="text-xs font-normal text-white/45">{!initialLoading && !searchLoading ? `(${filtered.length})` : ""}</span></h2>
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">{filtered.map((p) => <button key={p.id} className="flex items-center gap-3 rounded-xl border border-white/8 bg-background/30 p-3 text-left hover:border-primary/40" onClick={() => { setVisits([]); setHistoryLoading(true); setSelectedPatient(p); setShowVisitForm(false); }}><span className="grid size-9 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary">{p.firstName[0]}{p.lastName?.[0] ?? ""}</span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium text-white">{patientName(p)}</span><span className="block truncate text-xs text-white/45">{p.patientNumber} | {p.phone}</span></span></button>)}</div>
      {initialLoading && !isSearchQuery ? <p className="flex items-center justify-center gap-2 py-10 text-sm text-white/45"><LoaderCircle className="size-4 animate-spin"/>Loading patient recordsâ€¦</p> : searchLoading ? <p className="flex items-center justify-center gap-2 py-10 text-sm text-white/45"><LoaderCircle className="size-4 animate-spin"/>Searching patientsâ€¦</p> : initialLoadError && !isSearchQuery ? <div className="flex flex-col items-center gap-3 py-8 text-center text-sm text-white/55"><p>Patient records could not be loaded.</p><Button onClick={retryPatientLoad} size="sm" variant="outline">Try again</Button></div> : !filtered.length ? <p className="py-10 text-center text-sm text-white/45">{isSearchQuery ? "No matching patient records." : "No patient records found. Register a patient to get started."}</p> : null}
    </section> : <div className="grid min-h-0 flex-1 items-start gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
      <main className="space-y-4">
        <section className="rounded-2xl border border-white/10 bg-secondary/55 p-4 sm:p-5"><div className="flex flex-wrap items-center gap-3"><span className="grid size-11 place-items-center rounded-full bg-primary/15 font-semibold text-primary">{selectedPatient.firstName[0]}{selectedPatient.lastName?.[0] ?? ""}</span><div className="min-w-0 flex-1"><h2 className="font-semibold text-white">{patientName(selectedPatient)}</h2><p className="mt-1 text-xs text-white/55">{selectedPatient.patientNumber} | DOB {dateLabel(selectedPatient.dateOfBirth)} | {selectedPatient.sex === "UNKNOWN" ? "Sex needs updating" : selectedPatient.sex.toLowerCase()} | {selectedPatient.phone ?? "Phone needs updating"} | {selectedPatient.bloodGroup ?? "Blood group needs updating"}</p></div><Button onClick={openEdit} size="sm" variant="outline"><Pencil className="size-3.5"/> Edit</Button><Button onClick={removePatient} size="sm" variant="outline"><Trash2 className="size-3.5"/> Delete</Button><Button onClick={() => { setSelectedPatient(null); setShowVisitForm(false); }} size="sm" variant="ghost"><X className="size-4"/> Close</Button></div></section>
        {!showVisitForm ? <section className="rounded-2xl border border-white/10 bg-secondary/35 p-5"><div className="flex items-center justify-between gap-4"><div><h2 className="font-semibold text-white">Patient record</h2><p className="mt-1 text-sm text-white/50">Review this patient&apos;s visit history or begin a new visit.</p></div><Button onClick={startNewVisit}><FilePlus2 className="size-4"/> New visit</Button></div></section> : <>
          <section className="rounded-2xl border border-white/10 bg-secondary/40 p-4 sm:p-5"><div className="mb-4 flex items-center gap-2"><CalendarDays className="size-4 text-primary"/><div><h2 className="text-sm font-semibold text-white">Visit details</h2><p className="text-xs text-white/45">Complete the required clinical details.</p></div></div><div className="grid gap-3 sm:grid-cols-2"><Input label="Visit date and time" onChange={setAppointmentAt} required type="datetime-local" value={appointmentAt}/><Input label="Chief complaint" onChange={setComplaint} required placeholder="Reason for today's visit" value={complaint}/><Input label="Diagnosis" onChange={setDiagnosis} placeholder="Primary diagnosis" value={diagnosis}/><Input label="Weight (kg)" onChange={setWeight} type="number" value={weight}/><p className="self-end pb-2 text-xs text-white/55">Height: {selectedPatient.heightCm ? `${selectedPatient.heightCm} cm` : "not recorded"} · BMI: {selectedPatient.heightCm && Number(weight || selectedPatient.weightKg) > 0 ? (Number(weight || selectedPatient.weightKg) / Math.pow(Number(selectedPatient.heightCm) / 100, 2)).toFixed(2) : "add height and weight"} kg/m²</p><Input label="Blood pressure (mmHg)" onChange={setBloodPressure} placeholder="120/80" value={bloodPressure}/><TextArea label="Past medical history (PMH/Nil)" onChange={setMedicalHistory} placeholder="Relevant history or Nil" value={medicalHistory}/><TextArea label="Examination (O/E)" onChange={setExamination} placeholder="Clinical examination findings" value={examination}/><TextArea label="Investigation notes" onChange={setInvestigationNotes} placeholder="Investigation findings or requested tests" value={investigationNotes}/><TextArea label="Treatment plan" onChange={setTreatmentPlan} placeholder="Planned treatment" value={treatmentPlan}/><TextArea label="Clinical note" onChange={setComment} required placeholder="Additional clinical note" value={comment}/><TextArea label="Advice" onChange={setInstructions} required placeholder="Instructions and advice for the patient" value={instructions}/></div></section>
          <section className="rounded-2xl border border-white/10 bg-secondary/40 p-4 sm:p-5"><div className="mb-4 flex items-center justify-between"><div><h2 className="text-sm font-semibold text-white">Medicines</h2><p className="text-xs text-white/45">Add prescribed medicine and dose instructions.</p></div><Button onClick={() => setMedicines((rows) => [...rows, emptyMedicine()])} size="sm" variant="outline"><Plus className="size-3.5"/> Add medicine</Button></div><div className="space-y-3">{medicines.map((m, i) => <div key={i} className="grid gap-3 rounded-xl border border-white/8 bg-background/25 p-3 sm:grid-cols-2 xl:grid-cols-3"><MedicineNameInput onChange={(v) => setMedicines((rows) => rows.map((x, n) => n === i ? {...x, medicineName:v} : x))} value={m.medicineName}/><Input label="Dose" onChange={(v) => setMedicines((rows) => rows.map((x, n) => n === i ? {...x, dose:v} : x))} placeholder="e.g. 1 tablet" required value={m.dose}/><Input label="Frequency" onChange={(v) => setMedicines((rows) => rows.map((x, n) => n === i ? {...x, frequency:v} : x))} placeholder="e.g. twice daily" required value={m.frequency}/><Select label="Route" onChange={(v) => setMedicines((rows) => rows.map((x, n) => n === i ? {...x, route:v} : x))} options={[["ORAL","Oral"],["TOPICAL","Topical"],["OTHER","Other"]]} value={m.route}/><div className="grid grid-cols-2 gap-2"><Input label="Duration" onChange={(v) => setMedicines((rows) => rows.map((x, n) => n === i ? {...x, durationValue:v} : x))} type="number" value={m.durationValue}/><Select label="Unit" onChange={(v) => setMedicines((rows) => rows.map((x, n) => n === i ? {...x, durationUnit:v} : x))} options={[["days","Days"],["weeks","Weeks"],["months","Months"]]} value={m.durationUnit}/></div><Input label="Instructions" onChange={(v) => setMedicines((rows) => rows.map((x, n) => n === i ? {...x, instructions:v} : x))} placeholder="Optional" value={m.instructions}/><button aria-label="Remove medicine" className="justify-self-end text-white/45 hover:text-rose-300" onClick={() => setMedicines((rows) => rows.filter((_, n) => n !== i))}><Trash2 className="size-4"/></button></div>)}</div></section>
          <section className="rounded-2xl border border-white/10 bg-secondary/40 p-4 sm:p-5"><div className="mb-4 flex items-center justify-between"><div><h2 className="text-sm font-semibold text-white">Recommended tests</h2><p className="text-xs text-white/45">Add investigations requested for this patient.</p></div><Button onClick={() => setTests((rows) => [...rows, emptyTest()])} size="sm" variant="outline"><Plus className="size-3.5"/> Add test</Button></div><div className="space-y-3">{tests.map((t, i) => <div key={i} className="grid gap-3 rounded-xl border border-white/8 bg-background/25 p-3 sm:grid-cols-2"><Input label="Test name" onChange={(v) => setTests((rows) => rows.map((x, n) => n === i ? {...x, investigationName:v} : x))} required value={t.investigationName}/><Select label="Type" onChange={(v) => setTests((rows) => rows.map((x, n) => n === i ? {...x, type:v} : x))} options={[["LABORATORY","Laboratory"],["IMAGING","Imaging"],["PROCEDURE","Procedure"],["OTHER","Other"]]} value={t.type}/><button aria-label="Remove test" className="justify-self-end text-white/45 hover:text-rose-300" onClick={() => setTests((rows) => rows.filter((_, n) => n !== i))}><Trash2 className="size-4"/></button></div>)}</div></section>
          <div className="sticky bottom-2 flex justify-end gap-2 rounded-xl border border-white/10 bg-background/95 p-3"><Button disabled={isPending} onClick={() => setShowVisitForm(false)} variant="outline">Cancel</Button><Button disabled={isPending} onClick={issuePrescription}>{isPending ? <LoaderCircle className="size-4 animate-spin"/> : <Printer className="size-4"/>} Issue & print</Button></div>
        </>}
      </main>
      <aside className="space-y-3 xl:sticky xl:top-0"><section className="rounded-2xl border border-white/10 bg-secondary/55 p-4"><div className="flex items-center gap-2"><History className="size-4 text-primary"/><h2 className="text-sm font-semibold text-white">Previous visits</h2></div>{historyLoading ? <p className="flex items-center gap-2 py-6 text-xs text-white/50"><LoaderCircle className="size-4 animate-spin"/> Loading history</p> : visits.length ? <div className="mt-3 space-y-2">{visits.map((visit) => <article key={visit.id} className="rounded-lg border border-white/8 bg-background/25 p-3"><div className="flex items-start justify-between gap-2"><div className="min-w-0"><p className="text-xs font-medium text-white">{dateLabel(visit.appointmentAt ?? visit.issuedAt)} <span className="ml-1 text-[10px] text-white/45">{visit.status}</span></p><p className="mt-1 truncate text-xs text-white/50">{visit.chiefComplaint || visit.prescriptionNo}</p></div><div className="flex shrink-0 gap-1"><Button aria-label={`Print visit ${visit.prescriptionNo}`} onClick={() => printPreviousVisit(visit)} size="sm" type="button" variant="outline"><Printer className="size-3.5"/><span className="sr-only">Print</span></Button><Button aria-label={`Delete visit ${visit.prescriptionNo}`} disabled={isPending} onClick={() => removeVisit(visit)} size="sm" type="button" variant="outline"><Trash2 className="size-3.5"/><span className="sr-only">Delete</span></Button></div></div><details className="mt-2"><summary className="cursor-pointer text-[11px] text-primary">View record</summary><div className="mt-2 space-y-2 border-t border-white/10 pt-2 text-xs text-white/60">{visit.diagnoses.length > 0 && <p><b className="text-white/80">Diagnosis:</b> {visit.diagnoses.join(", ")}</p>}{visit.medicalHistory && <p><b className="text-white/80">PMH:</b> {visit.medicalHistory}</p>}{visit.examination && <p><b className="text-white/80">O/E:</b> {visit.examination}</p>}{visit.investigationNotes && <p><b className="text-white/80">Investigation:</b> {visit.investigationNotes}</p>}{visit.treatmentPlan && <p><b className="text-white/80">Treatment plan:</b> {visit.treatmentPlan}</p>}{visit.clinicalNotes && <p><b className="text-white/80">Clinical note:</b> {visit.clinicalNotes}</p>}{visit.patientInstructions && <p><b className="text-white/80">Advice:</b> {visit.patientInstructions}</p>}{visit.medications.length > 0 && <p><b className="text-white/80">Medicines:</b> {visit.medications.map((m) => `${m.medicineName}, ${m.dose}, ${m.frequency}`).join("; ")}</p>}{visit.investigations.length > 0 && <p><b className="text-white/80">Recommended tests:</b> {visit.investigations.map((t) => t.investigationName).join(", ")}</p>}<p><b className="text-white/80">Doctor:</b> {visit.doctorName}</p></div></details></article>)}</div> : <p className="py-6 text-xs text-white/45">No previous visits recorded.</p>}</section></aside>
    </div>}

    {patientModal && <div className="fixed inset-0 z-50 flex min-h-[100dvh] items-center justify-center bg-background/75 p-4 backdrop-blur-sm"><section aria-labelledby="patient-modal-title" aria-modal="true" className="relative flex max-h-[calc(100dvh-2rem)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-secondary shadow-2xl shadow-black/50" role="dialog"><header className="flex items-center justify-between border-b border-white/10 px-5 py-4 sm:px-8"><div><p className="text-[10px] font-semibold uppercase tracking-widest text-primary">Patient registration</p><h2 className="mt-1 text-lg font-semibold text-white" id="patient-modal-title">{editing ? "Edit patient record" : "Register a patient"}</h2></div><button aria-label="Close" className="rounded-lg p-2 text-white/60 hover:bg-white/10 hover:text-white" onClick={closePatientModal} type="button"><X className="size-5"/></button></header><form className="flex min-h-0 flex-1 flex-col" onSubmit={submitPatient}><div className="grid content-start gap-4 overflow-y-auto p-5 sm:grid-cols-2 sm:p-7"><Input label="First name" onChange={(v) => setPatientFields((f) => ({...f, firstName:v}))} required value={patientFields.firstName}/><Input label="Last name" onChange={(v) => setPatientFields((f) => ({...f, lastName:v}))} value={patientFields.lastName}/><Input label="Date of birth" onChange={(v) => setPatientFields((f) => ({...f, dateOfBirth:v}))} required type="date" value={patientFields.dateOfBirth}/><Select label="Sex" onChange={(v) => setPatientFields((f) => ({...f, sex:v}))} options={[["FEMALE","Female"],["MALE","Male"],["OTHER","Other"]]} required value={patientFields.sex}/><Input label="Phone number" onChange={(v) => setPatientFields((f) => ({...f, phone:v}))} required type="tel" value={patientFields.phone}/><Input label="Email (optional)" onChange={(v) => setPatientFields((f) => ({...f, email:v}))} type="email" value={patientFields.email}/><Input label="Height (cm, optional)" onChange={(v) => setPatientFields((f) => ({...f, heightCm:v}))} type="number" value={patientFields.heightCm}/><Input label="Weight (kg, optional)" onChange={(v) => setPatientFields((f) => ({...f, weightKg:v}))} type="number" value={patientFields.weightKg}/><Select label="Blood group" onChange={(v) => setPatientFields((f) => ({...f, bloodGroup:v}))} options={[["A+","A+"],["A-","A-"],["B+","B+"],["B-","B-"],["AB+","AB+"],["AB-","AB-"],["O+","O+"],["O-","O-"],["Unknown","Unknown"]]} required value={patientFields.bloodGroup}/><p className="text-xs text-white/45 sm:col-span-2">Email, height, and weight are optional. A prescription PDF will be emailed when an email address is provided.</p></div><footer className="flex justify-end gap-2 border-t border-white/10 p-4 sm:px-7"><Button onClick={closePatientModal} type="button" variant="ghost">Cancel</Button><Button disabled={isPending} type="submit">{isPending && <LoaderCircle className="size-4 animate-spin"/>}{editing ? "Save changes" : "Create patient"}</Button></footer></form></section></div>}

    {printSnapshot && <div className="rx-print-sheet" aria-hidden="true"><div className="rx-paper"><header className="rx-paper-header"><div className="rx-paper-clinic"><b>{clinicDetails.name}</b><span>{clinicDetails.address}</span><span>{clinicDetails.email}</span></div><Image alt="K-Dent" height={64} src="/kdent-logo.svg" width={86}/><div className="rx-paper-doctor"><strong>{printSnapshot.doctorName || (doctor ? `Dr. ${doctor.firstName} ${doctor.lastName ?? ""}`.trim() : "Doctor")}</strong><span>{doctor?.qualifications}</span><span>{doctor?.specialty}</span><span>{doctor?.designation}</span><span>{doctor?.chamberName || "Oral & Dental Surgeon"}</span><span>BMDC Regn. No.: {doctor?.bmdcRegistration || "-"}</span></div></header><div className="rx-paper-patient"><span><b>Name:</b> {patientName(printSnapshot.patient)}</span><span><b>Age:</b> {printSnapshot.patient.dateOfBirth ? `${Math.max(0, new Date().getFullYear() - new Date(printSnapshot.patient.dateOfBirth).getFullYear())} yrs` : "-"}</span><span><b>Sex:</b> {printSnapshot.patient.sex.toLowerCase()}</span><span><b>Date:</b> {dateLabel(printSnapshot.issuedAt)}</span><span><b>Patient No.:</b> {printSnapshot.patient.patientNumber}</span></div><main className="rx-paper-body"><div className="rx-paper-clinical"><section><h2>C.C.</h2><p>{printSnapshot.complaint || "-"}</p></section><section><h2>PMH / Nil</h2><p>{printSnapshot.medicalHistory || "-"}</p></section><section><h2>O/E</h2><p>{printSnapshot.examination || printSnapshot.comment || "-"}</p></section><section><h2>Investigation</h2><p>{printSnapshot.investigationNotes || printSnapshot.tests.map((test) => test.investigationName).filter(Boolean).join(", ") || "-"}</p></section><section><h2>Diagnosis</h2><p>{printSnapshot.diagnosis || "-"}</p></section><section><h2>Treatment Plan</h2><p>{printSnapshot.treatmentPlan || "-"}</p></section><section><h2>Advice</h2><p>{printSnapshot.instructions || "-"}</p></section></div><div className="rx-paper-rx"><div className="rx-mark">Rx</div><div className="rx-paper-meta">{printSnapshot.prescriptionNo}{(printSnapshot.weight || printSnapshot.bloodPressure) && <span>{[printSnapshot.weight && `Wt ${printSnapshot.weight} kg`, printSnapshot.bmi && `BMI ${printSnapshot.bmi}`, printSnapshot.bloodPressure && `BP ${printSnapshot.bloodPressure}`].filter(Boolean).join(" | ")}</span>}</div>{printSnapshot.medicines.length > 0 ? <ol>{printSnapshot.medicines.filter((medicine) => medicine.medicineName).map((medicine, index) => <li key={index}><b>{medicine.medicineName}</b><p>{medicine.dose} | {medicine.frequency}{medicine.durationValue ? ` | ${medicine.durationValue} ${medicine.durationUnit}` : ""}{medicine.instructions ? ` | ${medicine.instructions}` : ""}</p></li>)}</ol> : <p className="rx-paper-empty">Medicines</p>}{printSnapshot.tests.some((test) => test.investigationName) && <section><h2>Recommended tests</h2><ul>{printSnapshot.tests.filter((test) => test.investigationName).map((test, index) => <li key={index}>{test.investigationName}</li>)}</ul></section>}<div className="rx-paper-signature"><span>{doctor?.digitalSignature ? <Image alt="Doctor signature" height={64} src={doctor.digitalSignature} unoptimized width={160}/> : null}</span><b>{printSnapshot.doctorName || "Doctor's signature"}</b><small>Signature</small></div></div></main><footer className="rx-paper-footer"><div className="rx-paper-footer-cols"><div><b>{clinicDetails.name}</b><span>{clinicDetails.address}</span><span>For appointments: {clinicDetails.phone}</span></div><div><b>{doctor?.chamberName || "Chamber"}</b><span>{doctor?.chamberAddress || clinicDetails.address}</span><span>Consultation: Contact clinic for schedule</span></div></div><div className="rx-paper-hotline">For appointments, contact: {clinicDetails.phone}</div></footer></div></div>}
  </div>;
}
