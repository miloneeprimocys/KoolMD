"use client";

import React, { useMemo } from "react";
import { Check, Search } from "lucide-react";

import SignupField, { FieldError } from "@/components/SignupField";
import SignupDropdown, { type DropdownOption } from "@/components/SignupDropdown";
import DatePicker from "@/components/Datepicker";
import ImportButton from "@/components/ImportButton";

import {
  DEFAULT_COUNTRY,
  PhoneField,
  validatePhone,
} from "@/providers/Shared";

/* ---------------------------------------------------------------- */
/*  Static data (replace with API data later)                        */
/* ---------------------------------------------------------------- */
export type PatientRecord = {
  id: string;
  name: string;
  dob: string; // ISO yyyy-mm-dd
  mrn: string;
  phone: string;
};

export const PATIENTS: PatientRecord[] = [
  { id: "p1", name: "John Smith", dob: "1985-05-12", mrn: "123456", phone: "+1 555 123 4567" },
  { id: "p2", name: "Emily Parker", dob: "1992-10-08", mrn: "234567", phone: "+1 555 234 5678" },
  { id: "p3", name: "Robert Wilson", dob: "1978-03-14", mrn: "345678", phone: "+1 555 345 6789" },
  { id: "p4", name: "Susan Kim", dob: "1990-07-21", mrn: "456789", phone: "+1 555 456 7890" },
  { id: "p5", name: "David Lee", dob: "1965-11-30", mrn: "567890", phone: "+1 555 567 8901" },
];

const GENDERS: DropdownOption[] = ["Male", "Female", "Other", "Prefer not to say"].map((v) => ({
  value: v,
  label: v,
}));

/* ---------------------------------------------------------------- */
/*  Helpers (also used by the other steps)                           */
/* ---------------------------------------------------------------- */
export const initials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0]?.toUpperCase())
    .slice(0, 2)
    .join("");

/** "1985-05-12" → "05/12/1985" */
export const formatDob = (iso: string) => {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${m}/${d}/${y}`;
};

export const ageFromISO = (iso: string) => {
  if (!iso) return 0;
  const [y, m, d] = iso.split("-").map(Number);
  const now = new Date();
  let age = now.getFullYear() - y;
  if (now.getMonth() + 1 < m || (now.getMonth() + 1 === m && now.getDate() < d)) age -= 1;
  return age;
};

/* ---------------------------------------------------------------- */
/*  Form model                                                       */
/* ---------------------------------------------------------------- */
export type NewPatientValues = {
  firstName: string;
  lastName: string;
  dob: string;
  gender: string;
  phoneCountry: string;
  phone: string;
  email: string;
};

export type PatientStepValues = {
  mode: "existing" | "new";
  patientId: string;
  search: string;
  newPatient: NewPatientValues;
};

export type PatientStepErrors = Partial<
  Record<"patientId" | "firstName" | "lastName" | "dob" | "gender" | "phone", string>
>;

export const initialPatientStep = (): PatientStepValues => ({
  mode: "existing",
  patientId: "",
  search: "",
  newPatient: { firstName: "", lastName: "", dob: "", gender: "", phoneCountry: DEFAULT_COUNTRY, phone: "", email: "" },
});

export const validatePatientStep = (v: PatientStepValues): PatientStepErrors => {
  const e: PatientStepErrors = {};
  if (v.mode === "existing") {
    if (!v.patientId) e.patientId = "Select a patient to continue.";
    return e;
  }
  const p = v.newPatient;
  if (!p.firstName.trim()) e.firstName = "First name is required.";
  if (!p.lastName.trim()) e.lastName = "Last name is required.";
  if (!p.dob) e.dob = "Date of birth is required.";
  if (!p.gender) e.gender = "Gender is required.";
  const phoneErr = validatePhone(p.phone, p.phoneCountry, true);
  if (phoneErr) e.phone = phoneErr;
  return e;
};

export type PatientSummary = {
  name: string;
  dob: string; // MM/DD/YYYY
  age: number;
  mrn: string;
  initials: string;
};

/** The patient picked (or entered) in step 1, ready to display. */
export const getPatientSummary = (v: PatientStepValues): PatientSummary | null => {
  if (v.mode === "existing") {
    const p = PATIENTS.find((x) => x.id === v.patientId);
    return p
      ? { name: p.name, dob: formatDob(p.dob), age: ageFromISO(p.dob), mrn: p.mrn, initials: initials(p.name) }
      : null;
  }
  const n = v.newPatient;
  const name = `${n.firstName} ${n.lastName}`.trim();
  if (!name) return null;
  return { name, dob: formatDob(n.dob), age: ageFromISO(n.dob), mrn: "New patient", initials: initials(name) };
};

/* ---------------------------------------------------------------- */
/*  Step 1 — Patient                                                 */
/* ---------------------------------------------------------------- */
type Props = {
  values: PatientStepValues;
  errors: PatientStepErrors;
  onChange: (patch: Partial<PatientStepValues>) => void;
};

const TABS = [
  { key: "existing", label: "Search Existing Patient" },
  { key: "new", label: "Add New Patient" },
] as const;

const SelectPatient = ({ values, errors, onChange }: Props) => {
  const setNew = (patch: Partial<NewPatientValues>) =>
    onChange({ newPatient: { ...values.newPatient, ...patch } });

  const results = useMemo(() => {
    const q = values.search.trim().toLowerCase();
    if (!q) return PATIENTS;
    return PATIENTS.filter((p) =>
      `${p.name} ${p.mrn} ${p.phone} ${formatDob(p.dob)}`.toLowerCase().includes(q),
    );
  }, [values.search]);

  return (
    <div>
      <h3 className="text-base font-semibold text-heading">Select Patient</h3>

      {/* Tabs */}
      <div role="tablist" aria-label="Patient type" className="mt-3 flex gap-6 border-b border-border">
        {TABS.map((t) => {
          const active = values.mode === t.key;
          return (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onChange({ mode: t.key })}
              className={`-mb-px cursor-pointer whitespace-nowrap border-b-2 px-1 pb-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${
                active ? "border-primary text-primary" : "border-transparent text-body hover:text-heading"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="mt-4">
        {values.mode === "existing" ? (
          <div id="patientId" tabIndex={-1} className="outline-none">
            <SignupField
              name="patientSearch"
              icon={<Search className="h-4 w-4" />}
              placeholder="Search by name, DOB, phone or patient ID..."
              value={values.search}
              onChange={(e) => onChange({ search: e.target.value })}
            />

            <ul className="hide-scrollbar mt-1 max-h-[360px] space-y-1 overflow-y-auto">
              {results.length === 0 && (
                <li className="py-10 text-center text-sm text-body">No patients match your search.</li>
              )}
              {results.map((p) => {
                const selected = values.patientId === p.id;
                return (
                  <li
                    key={p.id}
                    className={`flex items-center gap-4 rounded-xl border px-3 py-3 transition-colors sm:px-4 ${
                      selected ? "border-primary bg-primary/5" : "border-transparent hover:bg-primary/[0.03]"
                    }`}
                  >
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                      {initials(p.name)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-heading">{p.name}</p>
                      <p className="text-xs text-body">
                        DOB: {formatDob(p.dob)} <span className="mx-1.5 text-border">|</span> MRN: {p.mrn}
                      </p>
                    </div>
                    <ImportButton
                      text={selected ? "Selected" : "Select"}
                      icon={selected ? <Check className="h-4 w-4" /> : null}
                      onClick={() => onChange({ patientId: p.id })}
                      className={`shrink-0 ${selected ? "!border-primary !bg-primary/10 text-primary" : ""}`}
                    />
                  </li>
                );
              })}
            </ul>
            <FieldError message={errors.patientId} />
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <SignupField
              name="firstName"
              label={<>First Name <span className="text-danger">*</span></>}
              placeholder="Enter first name"
              value={values.newPatient.firstName}
              onChange={(e) => setNew({ firstName: e.target.value })}
              error={errors.firstName}
            />
            <SignupField
              name="lastName"
              label={<>Last Name <span className="text-danger">*</span></>}
              placeholder="Enter last name"
              value={values.newPatient.lastName}
              onChange={(e) => setNew({ lastName: e.target.value })}
              error={errors.lastName}
            />
            <DatePicker
              name="dob"
              label={<>Date of Birth <span className="text-danger">*</span></>}
              placeholder="Select date of birth"
              value={values.newPatient.dob}
              onChange={(v) => setNew({ dob: v })}
              maxDate={new Date().toISOString().slice(0, 10)}
              error={errors.dob}
            />
            <SignupDropdown
              name="gender"
              label={<>Gender <span className="text-danger">*</span></>}
              placeholder="Select gender"
              searchable={false}
              options={GENDERS}
              value={values.newPatient.gender}
              onChange={(v) => setNew({ gender: v })}
              error={errors.gender}
            />
            <PhoneField
              name="phone"
              label={<>Phone Number <span className="text-danger">*</span></>}
              placeholder="Enter phone number"
              value={values.newPatient.phone}
              onChange={(v) => setNew({ phone: v })}
              countryCode={values.newPatient.phoneCountry}
              onCountryChange={(iso) => setNew({ phoneCountry: iso })}
              error={errors.phone}
            />
            <SignupField
              name="email"
              type="email"
              label={<>Email Address <span className="font-normal text-body">(Optional)</span></>}
              placeholder="Enter email address"
              value={values.newPatient.email}
              onChange={(e) => setNew({ email: e.target.value })}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default SelectPatient;