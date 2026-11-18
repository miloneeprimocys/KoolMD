"use client";

import React from "react";

import RadioCheckButtonh from "@/components/RadioCheckButtonh";
import SignupDropdown from "@/components/SignupDropdown";
import { FieldError } from "@/components/SignupField";
import { Opt, TextArea, toOptions, type Errors } from "@/providers/Shared";

import { REASON_OPTIONS } from "../BookAppointment";

/* ---------------------------------------------------------------- */
/*  Model                                                            */
/* ---------------------------------------------------------------- */
export type ReasonValues = {
  reason: string;
  symptoms: string[];
  onset: string;
  severity: string;
  notes: string;
};

export const initialReason = (reason = ""): ReasonValues => ({
  reason,
  symptoms: [],
  onset: "",
  severity: "",
  notes: "",
});

export const validateReason = (v: ReasonValues): Errors => {
  const e: Errors = {};
  if (!v.reason) e.reason = "Select a reason for your visit.";
  if (v.symptoms.length === 0) e.symptoms = "Select at least one symptom.";
  if (!v.onset) e.onset = "Tell us when your symptoms started.";
  if (!v.severity) e.severity = "Select a severity.";
  return e;
};

const SYMPTOMS = ["Cough", "Congestion", "Fatigue", "Shortness of breath", "Fever", "Sore throat", "Headache", "Other"];
const ONSET_OPTIONS = toOptions(["Today", "1-2 days ago", "3-4 days ago", "5 days ago", "1 week ago", "More than a week ago"]);
const SEVERITY = [
  { value: "mild", label: "Mild" },
  { value: "moderate", label: "Moderate" },
  { value: "severe", label: "Severe" },
];

/* ---------------------------------------------------------------- */
/*  Local helpers                                                    */
/* ---------------------------------------------------------------- */
const toggleIn = (list: string[], value: string) =>
  list.includes(value) ? list.filter((x) => x !== value) : [...list, value];

const SubTitle = ({ title, hint }: { title: string; hint?: string }) => (
  <div>
    <h4 className="text-sm font-semibold text-heading sm:text-base">{title}</h4>
    {hint && <p className="mt-0.5 text-xs text-body">{hint}</p>}
  </div>
);

const CheckChip = ({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) => (
  <label
    className={`flex min-w-0 cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2.5 text-sm text-heading transition-colors ${
      checked ? "border-primary/40 bg-primary/10" : "border-border bg-card hover:bg-primary/5"
    }`}
  >
    <RadioCheckButtonh type="checkbox" checked={checked} onChange={onChange} aria-label={label} />
    <span className="truncate">{label}</span>
  </label>
);

const RadioRow = ({
  name,
  value,
  options,
  onChange,
  error,
}: {
  name: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  error?: string;
}) => (
  <div>
    <div role="radiogroup" className="flex flex-wrap gap-x-6 gap-y-2">
      {options.map((o) => (
        <label key={o.value} className="flex cursor-pointer items-center gap-2 text-sm text-heading">
          <RadioCheckButtonh type="radio" name={name} checked={value === o.value} onChange={() => onChange(o.value)} />
          {o.label}
        </label>
      ))}
    </div>
    <FieldError message={error} />
  </div>
);

/* ---------------------------------------------------------------- */
/*  Tab 1: Reason & Symptoms                                         */
/* ---------------------------------------------------------------- */
const IntakeReasonSymptoms = ({
  values,
  errors,
  onChange,
}: {
  values: ReasonValues;
  errors: Errors;
  onChange: (patch: Partial<ReasonValues>) => void;
}) => (
  <div className="space-y-6">
    <div className="space-y-3">
      <SubTitle title="Reason for Visit" hint="Tell us the main reason for your appointment." />
      <div className="[&_label]:sr-only">
        <SignupDropdown
          name="intakeReason"
          label="Reason for Visit"
          placeholder="Select reason"
          searchable={false}
          options={REASON_OPTIONS}
          value={values.reason}
          onChange={(v) => onChange({ reason: v })}
          error={errors.reason}
        />
      </div>
    </div>

    <div className="space-y-3">
      <SubTitle title="Current Symptoms" hint="Select the symptoms you're experiencing." />
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {SYMPTOMS.map((s) => (
          <CheckChip
            key={s}
            label={s}
            checked={values.symptoms.includes(s)}
            onChange={() => onChange({ symptoms: toggleIn(values.symptoms, s) })}
          />
        ))}
      </div>
      <FieldError message={errors.symptoms} />
    </div>

    <div className="space-y-3">
      <SubTitle title="Symptom Details" />
      <div className="grid gap-4 md:grid-cols-2">
        <SignupDropdown
          name="onset"
          label="When did your symptoms start?"
          placeholder="Select"
          searchable={false}
          options={ONSET_OPTIONS}
          value={values.onset}
          onChange={(v) => onChange({ onset: v })}
          error={errors.onset}
        />
        <div>
          <p className="mb-2 block text-sm font-medium text-label">How would you rate the severity?</p>
          <RadioRow
            name="severity"
            value={values.severity}
            options={SEVERITY}
            onChange={(v) => onChange({ severity: v })}
            error={errors.severity}
          />
        </div>
      </div>
    </div>

    <TextArea
      name="reasonNotes"
      label={<>Additional Notes<Opt /></>}
      placeholder="Anything else about your symptoms?"
      value={values.notes}
      onChange={(v) => onChange({ notes: v })}
      maxLength={500}
      rows={3}
    />
  </div>
);

export default IntakeReasonSymptoms;