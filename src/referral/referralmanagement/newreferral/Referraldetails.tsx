"use client";

import React from "react";
import { Plus } from "lucide-react";

import SignupDropdown, { type DropdownOption } from "@/components/SignupDropdown";
import DatePicker from "@/components/Datepicker";
import TogglableSwitch from "@/components/Togglableswitch";
import type { TagTone } from "@/components/Tags";
import { ModalRadioGroup } from "@/components/Modalshell";
import {
  Opt,
  Req,
  TextArea,
  cardCls,
  todayISO,
  toOptions,
  type Errors,
  type StepProps,
} from "@/providers/Shared";
import type { AttachedDoc } from "./Attachdocuments";

/* ---------------------------------------------------------------- */
/*  Shared form model (all 4 steps edit the same values object)      */
/* ---------------------------------------------------------------- */
export type ReferralValues = {
  /* step 1 */
  patient: string;
  specialty: string;
  priority: string;
  referralType: string;
  location: string;
  reason: string;
  history: string;
  medications: string;
  appointmentDate: string;
  followUp: boolean;
  notes: string;
  /* step 2 */
  provider: string;
  consultationRequest: string;
  /* step 3 */
  documents: AttachedDoc[];
  /* step 4 */
  notifyPatient: boolean;
};

export type Patient = {
  id: string;
  name: string;
  age: number;
  gender: "M" | "F";
  mrn: string;
  dob: string;
  phone: string;
  address: string;
  allergies: string;
};

/** Static demo patients (replace with API data later). */
export const PATIENTS: Patient[] = [
  { id: "olivia", name: "Olivia Martin", age: 34, gender: "F", mrn: "MRN-004852", dob: "May 12, 1992", phone: "+1 415-555-0123", address: "742 Pine Street, San Francisco, CA 94108", allergies: "No known drug allergies." },
  { id: "noah", name: "Noah Williams", age: 28, gender: "M", mrn: "MRN-006371", dob: "Mar 3, 1998", phone: "+1 415-555-0147", address: "18 Market Street, San Francisco, CA 94105", allergies: "Penicillin." },
  { id: "ava", name: "Ava Thompson", age: 42, gender: "F", mrn: "MRN-008152", dob: "Jan 22, 1984", phone: "+1 415-555-0162", address: "95 Mission Street, San Francisco, CA 94103", allergies: "No known drug allergies." },
  { id: "liam", name: "Liam Anderson", age: 50, gender: "M", mrn: "MRN-005619", dob: "Aug 9, 1976", phone: "+1 415-555-0178", address: "310 Folsom Street, San Francisco, CA 94107", allergies: "Latex." },
  { id: "sophia", name: "Sophia Garcia", age: 37, gender: "F", mrn: "MRN-007284", dob: "Nov 30, 1989", phone: "+1 415-555-0189", address: "52 Howard Street, San Francisco, CA 94105", allergies: "No known drug allergies." },
];

export const getPatient = (id: string) => PATIENTS.find((p) => p.id === id);

export const initials = (name: string) =>
  name
    .replace(/^Dr\.?\s+/i, "")
    .split(" ")
    .map((n) => n[0]?.toUpperCase())
    .slice(0, 2)
    .join("");

export const PRIORITY_OPTIONS = [
  { value: "Routine", label: "Routine" },
  { value: "Urgent", label: "Urgent" },
  { value: "Stat", label: "Stat" },
];

export const TYPE_OPTIONS = [
  { value: "Internal", label: "Internal (Within Network)" },
  { value: "External", label: "External (Outside Network)" },
];

export const PRIORITY_TONE: Record<string, TagTone> = {
  Routine: "info",
  Urgent: "danger",
  Stat: "danger",
};

export const typeLabel = (value: string) => TYPE_OPTIONS.find((o) => o.value === value)?.label ?? value;

export const formatDate = (iso: string) => {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const SPECIALTIES = toOptions([
  "Cardiology",
  "Dermatology",
  "Orthopedics",
  "Neurology",
  "Radiology",
  "Endocrinology",
  "Gastroenterology",
]);

const LOCATIONS = toOptions([
  "Northside Cardiology",
  "SkinCare Clinic",
  "City Orthopedic Center",
  "Central Neuro Clinic",
  "West Imaging Center",
]);

const PATIENT_OPTIONS: DropdownOption[] = PATIENTS.map((p) => ({
  value: p.id,
  label: `${p.name} • ${p.mrn} • ${p.dob}`,
}));

/* ---------------------------------------------------------------- */
/*  Validation                                                       */
/* ---------------------------------------------------------------- */
export const validateReferralDetails = (v: ReferralValues): Errors => {
  const e: Errors = {};
  if (!v.patient) e.patient = "Select a patient.";
  if (!v.specialty) e.specialty = "Select a referral specialty.";
  if (!v.reason.trim()) e.reason = "Reason for referral is required.";
  return e;
};

/* ---------------------------------------------------------------- */
/*  Small pieces                                                     */
/* ---------------------------------------------------------------- */
/** Patient summary box (used on steps 1 and 3). */
export const PatientSummaryCard = ({ patient, className = "" }: { patient: Patient; className?: string }) => (
  <div className={`flex items-center gap-4 rounded-xl bg-primary/[0.06] dark:bg-primary/15 p-4 ${className}`}>
    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-pink/15 text-base font-semibold text-pink">
      {initials(patient.name)}
    </span>
    <div className="min-w-0">
      <p className="truncate text-sm font-semibold text-heading">{patient.name}</p>
      <p className="text-xs text-body">
        {patient.age}
        {patient.gender} • {patient.mrn}
      </p>
      <p className="text-xs text-body">
        {patient.dob} <span className="mx-1 text-border">|</span> {patient.phone}
      </p>
    </div>
  </div>
);

const SectionHeader = ({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle: string;
  action?: React.ReactNode;
}) => (
  <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
    <div className="min-w-0">
      <h3 className="text-base font-semibold text-heading sm:text-lg">{title}</h3>
      <p className="mt-0.5 text-xs text-body sm:text-sm">{subtitle}</p>
    </div>
    {action}
  </div>
);

/* ---------------------------------------------------------------- */
/*  Component                                                        */
/* ---------------------------------------------------------------- */
const ReferralDetails = ({ values: v, errors, onChange }: StepProps<ReferralValues>) => {
  const patient = getPatient(v.patient);

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Patient information */}
      <section className={`${cardCls} sm:p-6`}>
        <SectionHeader
          title="Patient Information"
          subtitle="Select the patient for this referral."
          action={
            <button
              type="button"
              className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 sm:text-sm"
            >
              <Plus className="h-4 w-4" />
              Add New Patient
            </button>
          }
        />
        <div className="grid items-start gap-4 lg:grid-cols-2">
          <SignupDropdown
            name="patient"
            label={<>Patient<Req /></>}
            placeholder="Search patient by name, MRN or DOB..."
            options={PATIENT_OPTIONS}
            value={v.patient}
            onChange={(val) => onChange({ patient: val })}
            error={errors.patient}
          />
          {patient && <PatientSummaryCard patient={patient} />}
        </div>
      </section>

      {/* Referral details */}
      <section className={`${cardCls} sm:p-6`}>
        <SectionHeader title="Referral Details" subtitle="Enter referral specialty, location and other details." />
        <div className="grid gap-x-6 gap-y-4 md:grid-cols-2">
          <SignupDropdown
            name="specialty"
            label={<>Referral Specialty<Req /></>}
            placeholder="Select specialty"
            options={SPECIALTIES}
            value={v.specialty}
            onChange={(val) => onChange({ specialty: val })}
            error={errors.specialty}
          />
          <ModalRadioGroup
            name="priority"
            label={<>Priority<Req /></>}
            value={v.priority}
            onChange={(val) => onChange({ priority: val })}
            options={PRIORITY_OPTIONS}
            className="h-12"
          />
          <ModalRadioGroup
            name="referralType"
            label={<>Referral Type<Req /></>}
            value={v.referralType}
            onChange={(val) => onChange({ referralType: val })}
            options={TYPE_OPTIONS}
            className="h-12"
          />
          <SignupDropdown
            name="location"
            label="Referral Location"
            placeholder="Select location / facility (optional)"
            options={LOCATIONS}
            value={v.location}
            onChange={(val) => onChange({ location: val })}
          />
          <div className="md:col-span-2">
            <TextArea
              name="reason"
              label={<>Reason for Referral<Req /></>}
              placeholder="Enter reason for referral, clinical details, or specific consultation request..."
              value={v.reason}
              onChange={(val) => onChange({ reason: val })}
              maxLength={1000}
              rows={3}
              error={errors.reason}
            />
          </div>
        </div>
      </section>

      {/* Clinical information */}
      <section className={`${cardCls} sm:p-6`}>
        <SectionHeader title="Clinical Information" subtitle="Add relevant clinical details to support the referral." />
        <div className="grid gap-4 md:grid-cols-2">
          <TextArea
            name="history"
            label="Relevant History"
            placeholder="Enter relevant medical history, current condition, or notes..."
            value={v.history}
            onChange={(val) => onChange({ history: val })}
            maxLength={1000}
            rows={3}
          />
          <TextArea
            name="medications"
            label="Current Medications"
            placeholder="List current medications (optional)..."
            value={v.medications}
            onChange={(val) => onChange({ medications: val })}
            maxLength={1000}
            rows={3}
          />
        </div>
      </section>

      {/* Referral settings */}
      <section className={`${cardCls} sm:p-6`}>
        <SectionHeader title="Referral Settings" subtitle="Add additional information for the referral." />
        <div className="grid gap-4 md:grid-cols-3 2xl:grid-cols-[1.1fr_0.8fr_1fr]">
          <DatePicker
            name="appointmentDate"
            label="Requested Appointment Date"
            placeholder="Select date (optional)"
            value={v.appointmentDate}
            onChange={(val) => onChange({ appointmentDate: val })}
            minDate={todayISO()}
          />
          <div>
            <p className="mb-2 text-sm font-medium text-label">Follow-up Required</p>
            <div className="flex h-12 items-center">
              <TogglableSwitch
                id="followUp"
                checked={v.followUp}
                onChange={(arg: any) =>
                  onChange({ followUp: typeof arg === "boolean" ? arg : Boolean(arg?.target?.checked) })
                }
                ariaLabel="Track follow-up status"
                label={<span className="text-sm text-heading">Yes, track follow-up status</span>}
              />
            </div>
          </div>
          <TextArea
            name="notes"
            label={<>Notes<Opt /></>}
            placeholder="Add any additional notes or special instructions..."
            value={v.notes}
            onChange={(val) => onChange({ notes: val })}
            maxLength={500}
            rows={3}
          />
        </div>
      </section>
    </div>
  );
};

export default ReferralDetails;
