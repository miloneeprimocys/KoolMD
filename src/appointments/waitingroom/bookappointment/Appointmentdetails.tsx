"use client";

import React from "react";

import EditButton from "@/components/EditButton";
import SignupDropdown, { type DropdownOption } from "@/components/SignupDropdown";
import RadioCheckButtonh from "@/components/RadioCheckButtonh";
import { ModalTextarea } from "@/components/Modalshell";
import type { PatientSummary } from "./Selectpatient";

/* ---------------------------------------------------------------- */
/*  Options                                                          */
/* ---------------------------------------------------------------- */
export const APPOINTMENT_TYPES: DropdownOption[] = [
  { value: "in-person", label: "In-Person (Clinic)" },
  { value: "video", label: "Video Visit (Telemedicine)" },
  { value: "phone", label: "Phone Call" },
];

export const REASONS: DropdownOption[] = [
  { value: "general", label: "General Consultation" },
  { value: "follow-up", label: "Follow-up Visit" },
  { value: "annual", label: "Annual Physical" },
  { value: "lab-review", label: "Lab Results Review" },
  { value: "vaccination", label: "Vaccination" },
  { value: "urgent", label: "Urgent / Sick Visit" },
  { value: "other", label: "Other" },
];

export const getTypeLabel = (value: string) => APPOINTMENT_TYPES.find((o) => o.value === value)?.label ?? "—";
export const getReasonLabel = (value: string) => REASONS.find((o) => o.value === value)?.label ?? "—";

/* ---------------------------------------------------------------- */
/*  Form model                                                       */
/* ---------------------------------------------------------------- */
export type AppointmentDetailsValues = {
  type: string;
  reason: string;
  notes: string;
  newPatientVisit: boolean;
  longerDuration: boolean;
};

export type AppointmentDetailsErrors = Partial<Record<"type" | "reason", string>>;

export const initialAppointmentDetails = (): AppointmentDetailsValues => ({
  type: "in-person",
  reason: "general",
  notes: "",
  newPatientVisit: true,
  longerDuration: false,
});

export const validateAppointmentDetails = (v: AppointmentDetailsValues): AppointmentDetailsErrors => {
  const e: AppointmentDetailsErrors = {};
  if (!v.type) e.type = "Select an appointment type.";
  if (!v.reason) e.reason = "Select a reason for the visit.";
  return e;
};

/* ---------------------------------------------------------------- */
/*  Step 2 — Appointment Details                                     */
/* ---------------------------------------------------------------- */
type Props = {
  patient: PatientSummary | null;
  values: AppointmentDetailsValues;
  errors: AppointmentDetailsErrors;
  onChange: (patch: Partial<AppointmentDetailsValues>) => void;
  /** Goes back to step 1 to change the patient. */
  onEditPatient: () => void;
};

const AppointmentDetails = ({ patient, values, errors, onChange, onEditPatient }: Props) => (
  <div className="space-y-5">
    {/* Selected patient */}
    {patient && (
      <div className="flex items-center justify-between gap-3 rounded-xl bg-primary/[0.06] px-4 py-3.5">
        <div className="flex min-w-0 items-center gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
            {patient.initials}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-heading">{patient.name}</p>
            <p className="text-xs text-body">
              DOB: {patient.dob} ({patient.age}) <span className="mx-1.5 text-border">|</span> MRN: {patient.mrn}
            </p>
          </div>
        </div>
        <EditButton
          section="patient"
          onEdit={onEditPatient}
          label="Edit Patient"
        />
      </div>
    )}

    <SignupDropdown
      name="type"
      label={<>Appointment Type <span className="text-danger">*</span></>}
      placeholder="Select appointment type"
      searchable={false}
      options={APPOINTMENT_TYPES}
      value={values.type}
      onChange={(v) => onChange({ type: v })}
      error={errors.type}
    />

    <SignupDropdown
      name="reason"
      label={<>Reason for Visit <span className="text-danger">*</span></>}
      placeholder="Select reason for visit"
      options={REASONS}
      value={values.reason}
      onChange={(v) => onChange({ reason: v })}
      error={errors.reason}
    />

    <ModalTextarea
      id="appointmentNotes"
      label={<>Appointment Notes <span className="font-normal text-body">(Optional)</span></>}
      placeholder="Add notes..."
      value={values.notes}
      maxLength={250}
      onChange={(v) => onChange({ notes: v })}
    />

    <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
      <label className="flex cursor-pointer items-center gap-2.5 text-sm text-heading">
        <RadioCheckButtonh
          type="checkbox"
          checked={values.newPatientVisit}
          onChange={(e) => onChange({ newPatientVisit: e.target.checked })}
        />
        New Patient Visit
      </label>
      <label className="flex cursor-pointer items-center gap-2.5 text-sm text-heading">
        <RadioCheckButtonh
          type="checkbox"
          checked={values.longerDuration}
          onChange={(e) => onChange({ longerDuration: e.target.checked })}
        />
        Requires Longer Duration
      </label>
    </div>
  </div>
);

export default AppointmentDetails;