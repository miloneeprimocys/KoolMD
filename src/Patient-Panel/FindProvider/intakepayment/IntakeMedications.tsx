"use client";

import React from "react";
import { Pill, Plus, Trash2 } from "lucide-react";

import ImportButton from "@/components/ImportButton";
import RadioCheckButtonh from "@/components/RadioCheckButtonh";
import SignupField from "@/components/SignupField";
import SignupDropdown from "@/components/SignupDropdown";
import { Opt, TextArea, toOptions, uid, type Errors } from "@/providers/Shared";

/* ---------------------------------------------------------------- */
/*  Model                                                            */
/* ---------------------------------------------------------------- */
export type MedRow = { id: string; name: string; dosage: string; frequency: string; type: string };

export type MedicationsValues = {
  takes: "yes" | "no";
  meds: MedRow[];
  otc: "yes" | "no";
  notes: string;
};

export const newMed = (): MedRow => ({ id: uid(), name: "", dosage: "", frequency: "", type: "Prescription" });

export const initialMedications = (): MedicationsValues => ({ takes: "no", meds: [], otc: "no", notes: "" });

export const validateMedications = (v: MedicationsValues): Errors => {
  const e: Errors = {};
  if (v.takes === "yes") {
    if (v.meds.length === 0) e.meds = "Add at least one medication.";
    v.meds.forEach((m) => {
      if (!m.name.trim()) e[`${m.id}-name`] = "Required";
      if (!m.dosage.trim()) e[`${m.id}-dosage`] = "Required";
      if (!m.frequency) e[`${m.id}-frequency`] = "Required";
    });
  }
  return e;
};

const FREQUENCY = toOptions(["Once daily", "Twice daily", "Three times daily", "Weekly", "As needed"]);
const TYPES = toOptions(["Prescription", "Over the counter", "Supplement"]);

const GRID = "grid gap-3 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_36px] md:items-start";

/* ---------------------------------------------------------------- */
/*  Local helpers                                                    */
/* ---------------------------------------------------------------- */
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

const YES_NO = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
];

/* ---------------------------------------------------------------- */
/*  Tab 3: Medications                                               */
/* ---------------------------------------------------------------- */
const IntakeMedications = ({
  values,
  errors,
  onChange,
}: {
  values: MedicationsValues;
  errors: Errors;
  onChange: (patch: Partial<MedicationsValues>) => void;
}) => {
  const setMed = (id: string, patch: Partial<MedRow>) =>
    onChange({ meds: values.meds.map((m) => (m.id === id ? { ...m, ...patch } : m)) });

  return (
    <div className="space-y-6">
      <h4 className="flex items-center gap-2 text-sm font-semibold text-heading sm:text-base">
        <Pill className="h-5 w-5 text-primary" />
        Medications
      </h4>

      <div className="space-y-3">
        <p className="text-sm font-medium text-heading">Are you currently taking any medications?</p>
        <RadioRow
          name="takesMeds"
          value={values.takes}
          options={[
            { value: "yes", label: "Yes, I am taking medications" },
            { value: "no", label: "No, I am not taking any medications" },
          ]}
          onChange={(v) =>
            onChange({
              takes: v as MedicationsValues["takes"],
              meds: v === "yes" && values.meds.length === 0 ? [newMed()] : values.meds,
            })
          }
        />
      </div>

      {values.takes === "yes" && (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-heading">Your Medications</p>

          <div className="space-y-3 rounded-xl border border-border bg-primary/[0.03] p-3">
            <div className={`${GRID} hidden text-xs font-semibold text-heading md:grid`}>
              <span>Medication Name *</span>
              <span>Dosage *</span>
              <span>Frequency *</span>
              <span>Type</span>
              <span />
            </div>

            {values.meds.map((m, i) => (
              <div key={m.id} className={GRID}>
                <SignupField
                  name={`med-name-${m.id}`}
                  placeholder="e.g. Amlodipine"
                  aria-label={`Medication ${i + 1} name`}
                  value={m.name}
                  onChange={(e) => setMed(m.id, { name: e.target.value })}
                  error={errors[`${m.id}-name`]}
                />
                <SignupField
                  name={`med-dosage-${m.id}`}
                  placeholder="e.g. 5 mg"
                  aria-label={`Medication ${i + 1} dosage`}
                  value={m.dosage}
                  onChange={(e) => setMed(m.id, { dosage: e.target.value })}
                  error={errors[`${m.id}-dosage`]}
                />
                <div className="[&_label]:sr-only">
                  <SignupDropdown
                    name={`med-frequency-${m.id}`}
                    label={`Medication ${i + 1} frequency`}
                    placeholder="Frequency"
                    searchable={false}
                    options={FREQUENCY}
                    value={m.frequency}
                    onChange={(v) => setMed(m.id, { frequency: v })}
                    error={errors[`${m.id}-frequency`]}
                  />
                </div>
                <div className="[&_label]:sr-only">
                  <SignupDropdown
                    name={`med-type-${m.id}`}
                    label={`Medication ${i + 1} type`}
                    placeholder="Type"
                    searchable={false}
                    options={TYPES}
                    value={m.type}
                    onChange={(v) => setMed(m.id, { type: v })}
                  />
                </div>
                <button
                  type="button"
                  aria-label={`Remove medication ${i + 1}`}
                  onClick={() => onChange({ meds: values.meds.filter((x) => x.id !== m.id) })}
                  className="flex h-12 w-9 cursor-pointer items-center justify-center rounded-lg text-body transition-colors hover:bg-danger/10 hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          {errors.meds && <p className="text-xs text-danger">{errors.meds}</p>}

          <ImportButton
            text="Add Medication"
            icon={<Plus className="h-4 w-4" />}
            onClick={() => onChange({ meds: [...values.meds, newMed()] })}
            className="w-fit text-primary"
          />
        </div>
      )}

      <div className="space-y-3">
        <p className="text-sm font-medium text-heading">Do you take any over-the-counter medications, vitamins or supplements?</p>
        <RadioRow name="otc" value={values.otc} options={YES_NO} onChange={(v) => onChange({ otc: v as MedicationsValues["otc"] })} />
      </div>

      <TextArea
        name="medNotes"
        label={<>Additional Notes<Opt /></>}
        placeholder="e.g. any recent changes in dosage, side effects, or other relevant details."
        value={values.notes}
        onChange={(v) => onChange({ notes: v })}
        maxLength={500}
        rows={3}
      />
    </div>
  );
};

export default IntakeMedications;