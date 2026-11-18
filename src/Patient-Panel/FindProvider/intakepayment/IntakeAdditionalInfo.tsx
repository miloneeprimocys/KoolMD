"use client";

import React, { useState } from "react";
import { Baby, FileText, Flame, Info, ShieldAlert, Users, Wine, X } from "lucide-react";

import RadioCheckButtonh from "@/components/RadioCheckButtonh";
import SignupField from "@/components/SignupField";
import SignupDropdown from "@/components/SignupDropdown";
import { Opt, TextArea, toOptions, type Errors } from "@/providers/Shared";

/* ---------------------------------------------------------------- */
/*  Model                                                            */
/* ---------------------------------------------------------------- */
export type AdditionalValues = {
  smoke: "yes" | "no";
  smokeFreq: string;
  alcohol: "yes" | "no";
  alcoholFreq: string;
  pregnant: "yes" | "no" | "na";
  hasAllergies: "yes" | "no";
  allergies: string[];
  family: string[];
  notes: string;
};

export const initialAdditional = (): AdditionalValues => ({
  smoke: "no",
  smokeFreq: "",
  alcohol: "no",
  alcoholFreq: "",
  pregnant: "na",
  hasAllergies: "no",
  allergies: [],
  family: [],
  notes: "",
});

export const validateAdditional = (v: AdditionalValues): Errors => {
  const e: Errors = {};
  if (v.smoke === "yes" && !v.smokeFreq) e.smokeFreq = "Select how often.";
  if (v.alcohol === "yes" && !v.alcoholFreq) e.alcoholFreq = "Select how often.";
  if (v.hasAllergies === "yes" && v.allergies.length === 0) e.allergies = "Add at least one allergy.";
  return e;
};

const SMOKE_FREQ = toOptions(["Occasionally", "Weekly", "Daily", "Multiple times a day"]);
const ALCOHOL_FREQ = toOptions(["Rarely", "Occasionally", "Weekly", "Daily"]);
const YES_NO = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
];
const PREGNANT = [...YES_NO, { value: "na", label: "Not Applicable" }];
const FAMILY = ["Heart Disease", "Diabetes", "High Blood Pressure", "Cancer", "Stroke", "Asthma", "Thyroid Disorder", "Other"];

const boxCls = "min-w-0 space-y-3 rounded-xl border border-border bg-card p-3 sm:p-4";

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

const RadioRow = ({
  name,
  value,
  options,
  onChange,
}: {
  name: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) => (
  <div role="radiogroup" className="flex flex-wrap gap-x-6 gap-y-2">
    {options.map((o) => (
      <label key={o.value} className="flex cursor-pointer items-center gap-2 text-sm text-heading">
        <RadioCheckButtonh type="radio" name={name} checked={value === o.value} onChange={() => onChange(o.value)} />
        {o.label}
      </label>
    ))}
  </div>
);

/* ---------------------------------------------------------------- */
/*  Tab 4: Additional Info                                           */
/* ---------------------------------------------------------------- */
const IntakeAdditionalInfo = ({
  values,
  errors,
  onChange,
}: {
  values: AdditionalValues;
  errors: Errors;
  onChange: (patch: Partial<AdditionalValues>) => void;
}) => {
  const [allergyInput, setAllergyInput] = useState("");

  const addAllergy = () => {
    const a = allergyInput.trim();
    if (!a) return;
    if (!values.allergies.some((x) => x.toLowerCase() === a.toLowerCase())) {
      onChange({ allergies: [...values.allergies, a] });
    }
    setAllergyInput("");
  };

  return (
    <div className="space-y-5">
      <h4 className="flex items-center gap-2 text-sm font-semibold text-heading sm:text-base">
        <Info className="h-5 w-5 text-primary" />
        Additional Information
      </h4>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Smoking */}
        <div className={boxCls}>
          <div className="grid gap-3 sm:grid-cols-2 sm:items-start">
            <div className="space-y-2">
              <p className="flex items-center gap-2 text-sm font-semibold text-heading">
                <Flame className="h-4 w-4 text-primary" />
                Do you smoke?
              </p>
              <RadioRow
                name="smoke"
                value={values.smoke}
                options={YES_NO}
                onChange={(v) => onChange({ smoke: v as AdditionalValues["smoke"], smokeFreq: v === "no" ? "" : values.smokeFreq })}
              />
            </div>
            <SignupDropdown
              name="smokeFreq"
              label="If yes, how often?"
              placeholder="Select frequency"
              searchable={false}
              options={SMOKE_FREQ}
              value={values.smokeFreq}
              onChange={(v) => onChange({ smokeFreq: v })}
              disabled={values.smoke !== "yes"}
              error={errors.smokeFreq}
            />
          </div>
        </div>

        {/* Alcohol */}
        <div className={boxCls}>
          <div className="grid gap-3 sm:grid-cols-2 sm:items-start">
            <div className="space-y-2">
              <p className="flex items-center gap-2 text-sm font-semibold text-heading">
                <Wine className="h-4 w-4 text-primary" />
                Do you consume alcohol?
              </p>
              <RadioRow
                name="alcohol"
                value={values.alcohol}
                options={YES_NO}
                onChange={(v) =>
                  onChange({ alcohol: v as AdditionalValues["alcohol"], alcoholFreq: v === "no" ? "" : values.alcoholFreq })
                }
              />
            </div>
            <SignupDropdown
              name="alcoholFreq"
              label="If yes, how often?"
              placeholder="Select frequency"
              searchable={false}
              options={ALCOHOL_FREQ}
              value={values.alcoholFreq}
              onChange={(v) => onChange({ alcoholFreq: v })}
              disabled={values.alcohol !== "yes"}
              error={errors.alcoholFreq}
            />
          </div>
        </div>

        {/* Pregnancy */}
        <div className={boxCls}>
          <p className="flex items-center gap-2 text-sm font-semibold text-heading">
            <Baby className="h-4 w-4 text-primary" />
            Are you pregnant?
          </p>
          <RadioRow
            name="pregnant"
            value={values.pregnant}
            options={PREGNANT}
            onChange={(v) => onChange({ pregnant: v as AdditionalValues["pregnant"] })}
          />
        </div>

        {/* Allergies */}
        <div className={boxCls}>
          <p className="flex items-center gap-2 text-sm font-semibold text-heading">
            <ShieldAlert className="h-4 w-4 text-primary" />
            Do you have any allergies?
          </p>
          <RadioRow
            name="hasAllergies"
            value={values.hasAllergies}
            options={YES_NO}
            onChange={(v) =>
              onChange({
                hasAllergies: v as AdditionalValues["hasAllergies"],
                allergies: v === "no" ? [] : values.allergies,
              })
            }
          />
          {values.hasAllergies === "yes" && (
            <div className="space-y-2">
              {values.allergies.length > 0 && (
                <ul className="flex flex-wrap gap-2">
                  {values.allergies.map((a) => (
                    <li
                      key={a}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 py-1 pl-2.5 pr-1.5 text-xs font-medium text-heading"
                    >
                      {a}
                      <button
                        type="button"
                        aria-label={`Remove ${a}`}
                        onClick={() => onChange({ allergies: values.allergies.filter((x) => x !== a) })}
                        className="flex h-4 w-4 cursor-pointer items-center justify-center rounded text-body transition-colors hover:bg-danger/10 hover:text-danger"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <div
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addAllergy();
                  }
                }}
                onBlurCapture={addAllergy}
              >
                <SignupField
                  name="allergyInput"
                  placeholder="Add allergy (e.g. pollen, food, etc.) and press Enter"
                  aria-label="Add allergy"
                  value={allergyInput}
                  onChange={(e) => setAllergyInput(e.target.value)}
                  error={errors.allergies}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Family history */}
      <div className="space-y-3">
        <div>
          <h4 className="flex items-center gap-2 text-sm font-semibold text-heading sm:text-base">
            <Users className="h-4 w-4 text-primary" />
            Family History
          </h4>
          <p className="mt-0.5 text-xs text-body">Does your immediate family have a history of any of the following conditions?</p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {FAMILY.map((f) => (
            <CheckChip
              key={f}
              label={f}
              checked={values.family.includes(f)}
              onChange={() => onChange({ family: toggleIn(values.family, f) })}
            />
          ))}
        </div>
      </div>

      <TextArea
        name="additionalNotes"
        label={
          <span className="inline-flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            Additional Notes<Opt />
          </span>
        }
        placeholder="Any other health information, lifestyle details, or concerns you'd like your provider to know."
        value={values.notes}
        onChange={(v) => onChange({ notes: v })}
        maxLength={500}
        rows={3}
      />
    </div>
  );
};

export default IntakeAdditionalInfo;