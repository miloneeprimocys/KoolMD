"use client";

import React from "react";
import { HeartPulse } from "lucide-react";

import RadioCheckButtonh from "@/components/RadioCheckButtonh";
import { Opt, TextArea, type Errors } from "@/providers/Shared";

/* ---------------------------------------------------------------- */
/*  Model                                                            */
/* ---------------------------------------------------------------- */
export type HistoryValues = {
  conditions: string[];
  surgeries: "yes" | "no";
  surgeryDetails: string;
  otherConcerns: string;
};

export const initialHistory = (): HistoryValues => ({
  conditions: [],
  surgeries: "no",
  surgeryDetails: "",
  otherConcerns: "",
});

/** Everything on this tab is optional, so there is nothing to block on. */
export const validateHistory = (_v: HistoryValues): Errors => ({});

const CONDITIONS = [
  "Hypertension",
  "Diabetes",
  "Heart Disease",
  "Asthma",
  "COPD",
  "Kidney Disease",
  "Liver Disease",
  "Thyroid Disorder",
  "High Cholesterol",
  "Cancer",
  "Stroke",
  "Other",
];

/* ---------------------------------------------------------------- */
/*  Local helpers                                                    */
/* ---------------------------------------------------------------- */
const toggleIn = (list: string[], value: string) =>
  list.includes(value) ? list.filter((x) => x !== value) : [...list, value];

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

const YES_NO = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
];

/* ---------------------------------------------------------------- */
/*  Tab 2: Medical History                                           */
/* ---------------------------------------------------------------- */
const IntakeMedicalHistory = ({
  values,
  onChange,
}: {
  values: HistoryValues;
  errors: Errors;
  onChange: (patch: Partial<HistoryValues>) => void;
}) => (
  <div className="space-y-6">
    <h4 className="flex items-center gap-2 text-sm font-semibold text-heading sm:text-base">
      <HeartPulse className="h-5 w-5 text-primary" />
      Medical History
    </h4>

    <div className="space-y-3">
      <p className="text-sm font-medium text-heading">Do you have any of the following conditions? Select all that apply.</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {CONDITIONS.map((c) => (
          <CheckChip
            key={c}
            label={c}
            checked={values.conditions.includes(c)}
            onChange={() => onChange({ conditions: toggleIn(values.conditions, c) })}
          />
        ))}
      </div>
    </div>

    <div className="space-y-3">
      <p className="text-sm font-medium text-heading">Have you had any major surgeries or hospitalizations?</p>
      <div role="radiogroup" className="flex flex-wrap gap-x-6 gap-y-2">
        {YES_NO.map((o) => (
          <label key={o.value} className="flex cursor-pointer items-center gap-2 text-sm text-heading">
            <RadioCheckButtonh
              type="radio"
              name="surgeries"
              checked={values.surgeries === o.value}
              onChange={() => onChange({ surgeries: o.value as HistoryValues["surgeries"] })}
            />
            {o.label}
          </label>
        ))}
      </div>
      {values.surgeries === "yes" && (
        <TextArea
          name="surgeryDetails"
          label={<>Please provide details<Opt /></>}
          placeholder="e.g. Appendectomy in 2018."
          value={values.surgeryDetails}
          onChange={(v) => onChange({ surgeryDetails: v })}
          maxLength={500}
          rows={3}
        />
      )}
    </div>

    <TextArea
      name="otherConcerns"
      label="Any other significant medical conditions or health concerns?"
      placeholder="e.g. chronic pain, mental health conditions, etc."
      value={values.otherConcerns}
      onChange={(v) => onChange({ otherConcerns: v })}
      maxLength={500}
      rows={3}
    />
  </div>
);

export default IntakeMedicalHistory;