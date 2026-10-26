"use client";

import { useEffect, useRef, useState } from "react";
import PatientDetailsFields from "@/components/appointments/PatientDetailsFields";
import { History, LoaderCircle, Search, UserCheck, UserPlus, X } from "lucide-react";
import type { ScheduleDoctor } from "./DoctorScheduleEditor";
import { searchPatientsForOfflineBooking } from "@/app/actions/appointment-portal";
import { useDebouncedValue } from "@/app/hooks/useDebouncedValue";

type OfflineAppointmentFormProps = {
  doctors: Pick<ScheduleDoctor, "id" | "firstName" | "lastName">[];
  pending: boolean;
  action: (formData: FormData) => void;
};

type SearchedPatient = {
  id: string;
  patientNumber: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  dateOfBirth: string;
  sex: string;
  bloodGroup: string;
  heightCm: string;
  weightKg: string;
  visitCount: number;
};

const inputClassName =
  "w-full rounded-lg border border-white/10 bg-background px-3 py-2 text-sm";

const emptyFormValues = {
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  heightCm: "",
  weightKg: "",
};

export default function OfflineAppointmentForm({
  doctors,
  pending,
  action,
}: OfflineAppointmentFormProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebouncedValue(searchQuery, 250);
  const [searchResults, setSearchResults] = useState<SearchedPatient[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<SearchedPatient | null>(null);
  const [formValues, setFormValues] = useState(emptyFormValues);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const trimmed = debouncedQuery.trim();
    if (!trimmed) return;

    let active = true;
    void searchPatientsForOfflineBooking(trimmed)
      .then((res) => {
        if (!active) return;
        setIsSearching(false);
        if ("patients" in res && Array.isArray(res.patients)) {
          setSearchResults(res.patients as SearchedPatient[]);
          setShowDropdown(true);
        } else {
          setSearchResults([]);
        }
      })
      .catch(() => {
        if (active) {
          setIsSearching(false);
          setSearchResults([]);
        }
      });

    return () => {
      active = false;
    };
  }, [debouncedQuery]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const selectPatient = (patient: SearchedPatient) => {
    setSelectedPatient(patient);
    setFormValues({
      firstName: patient.firstName,
      lastName: patient.lastName ?? "",
      phone: patient.phone ?? "",
      email: patient.email ?? "",
      heightCm: patient.heightCm ?? "",
      weightKg: patient.weightKg ?? "",
    });
    setSearchQuery("");
    setShowDropdown(false);
  };

  const clearSelectedPatient = () => {
    setSelectedPatient(null);
    setFormValues(emptyFormValues);
    setSearchQuery("");
  };

  const handleFieldChange = (field: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <section className="bg-secondary/35 rounded-2xl border border-white/10 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-semibold text-white">Add offline appointment</h2>
          <p className="mt-1 text-xs text-white/50">
            Search for an existing patient or register a new one. A doctor or admin must accept the request.
          </p>
        </div>
        {selectedPatient && (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-300 ring-1 ring-emerald-500/30">
            <UserCheck className="size-3.5" />
            Existing ID will be reused: {selectedPatient.patientNumber}
          </span>
        )}
      </div>

      {/* Patient Search Bar */}
      <div className="relative mt-4" ref={searchContainerRef}>
        <label className="block text-xs font-medium text-white/75" htmlFor="patient-search-input">
          Find previously visited patient
        </label>
        <div className="relative mt-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-white/40" />
          <input
            id="patient-search-input"
            aria-autocomplete="list"
            aria-controls="patient-search-results"
            aria-expanded={Boolean(showDropdown && searchResults.length > 0)}
            className="w-full rounded-lg border border-white/10 bg-background py-2 pr-10 pl-9 text-sm text-white placeholder:text-white/40 focus:border-primary focus:outline-none"
            onChange={(e) => {
              const val = e.target.value;
              setSearchQuery(val);
              if (!val.trim()) {
                setSearchResults([]);
                setIsSearching(false);
                setShowDropdown(false);
              } else {
                setIsSearching(true);
                setShowDropdown(true);
              }
            }}
            onFocus={() => {
              if (searchResults.length > 0) setShowDropdown(true);
            }}
            placeholder="Search patient by name or phone number..."
            role="combobox"
            type="text"
            value={searchQuery}
          />
          {isSearching && (
            <div className="absolute top-1/2 right-3 -translate-y-1/2">
              <LoaderCircle className="size-4 animate-spin text-white/50" />
            </div>
          )}
          {!isSearching && searchQuery && (
            <button
              aria-label="Clear search input"
              className="absolute top-1/2 right-3 -translate-y-1/2 rounded p-0.5 text-white/40 hover:text-white"
              onClick={() => {
                setSearchQuery("");
                setSearchResults([]);
                setShowDropdown(false);
              }}
              type="button"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {showDropdown && searchQuery.trim().length > 0 && (
          <div
            className="absolute top-full z-30 mt-1 max-h-72 w-full overflow-y-auto rounded-xl border border-white/15 bg-secondary shadow-2xl backdrop-blur-md"
            id="patient-search-results"
            role="listbox"
          >
            {searchResults.length > 0 ? (
              <ul className="divide-y divide-white/5 p-1">
                {searchResults.map((patient) => (
                  <li key={patient.id}>
                    <button
                      className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-white transition hover:bg-white/10"
                      onClick={() => selectPatient(patient)}
                      type="button"
                    >
                      <div>
                        <p className="font-medium text-white">
                          {patient.firstName} {patient.lastName}
                          <span className="ml-2 font-mono text-xs text-primary">
                            {patient.patientNumber}
                          </span>
                        </p>
                        <p className="mt-0.5 text-xs text-white/60">
                          Phone: {patient.phone || "No phone"}
                          {patient.email ? ` · ${patient.email}` : ""}
                        </p>
                      </div>
                      <div className="text-right">
                        {patient.visitCount > 0 ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-white/10 px-2 py-0.5 text-xs text-white/80">
                            <History className="size-3 text-primary" />
                            {patient.visitCount} {patient.visitCount === 1 ? "visit" : "visits"}
                          </span>
                        ) : (
                          <span className="rounded-md bg-white/5 px-2 py-0.5 text-xs text-white/50">
                            Registered
                          </span>
                        )}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            ) : !isSearching ? (
              <div className="px-4 py-3 text-xs text-white/60">
                No matching patients found. You can enter details below to register a new patient.
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* Selected Patient Banner */}
      {selectedPatient && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-3 text-sm text-emerald-100">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-500/20 p-2 text-emerald-300">
              <UserCheck className="size-5" />
            </div>
            <div>
              <p className="font-medium text-white">
                {selectedPatient.firstName} {selectedPatient.lastName}
                <span className="ml-2 font-mono text-xs text-emerald-300">
                  {selectedPatient.patientNumber}
                </span>
              </p>
              <p className="text-xs text-emerald-200/70">
                Reusing existing record · Phone: {selectedPatient.phone || "N/A"}
                {selectedPatient.visitCount > 0 && ` · ${selectedPatient.visitCount} previous visit(s)`}
              </p>
            </div>
          </div>
          <button
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 bg-background/50 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/10"
            onClick={clearSelectedPatient}
            type="button"
          >
            <UserPlus className="size-3.5" />
            Switch to New Patient
          </button>
        </div>
      )}

      {/* Offline Appointment Booking Form */}
      <form action={action} className="mt-4 grid gap-3 sm:grid-cols-2">
        {/* Pass selected patientId to reuse their existing ID */}
        {selectedPatient && (
          <input name="patientId" type="hidden" value={selectedPatient.id} />
        )}

        <PatientDetailsFields
          fieldClassName="text-sm"
          onChange={handleFieldChange}
          values={formValues}
        />

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
          {pending && (
            <LoaderCircle aria-hidden="true" className="mr-2 inline size-4 animate-spin" />
          )}
          {pending
            ? "Adding…"
            : selectedPatient
              ? "Add appointment for existing patient"
              : "Add appointment request"}
        </button>
      </form>
    </section>
  );
}
