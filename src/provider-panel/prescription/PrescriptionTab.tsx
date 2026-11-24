"use client";

import React from "react";
import { Plus, Trash2 } from "lucide-react";

import ImportButton from "@/components/ImportButton";
import SignupDropdown from "@/components/SignupDropdown";
import { FieldError } from "@/components/SignupField";
import { TextArea, Req, toOptions, uid, type Errors, type StepProps } from "@/providers/Shared";

/* ---------------------------------------------------------------- */
/*  Values + validation (used by Prescription)                       */
/* ---------------------------------------------------------------- */
export type MedicationRow = { id: string; medication: string; dosage: string; frequency: string; duration: string };

export interface PrescriptionValues {
  medications: MedicationRow[];
  instructions: string;
}

export const newMedication = (): MedicationRow => ({ id: uid(), medication: "", dosage: "", frequency: "", duration: "" });

/** Static starting values (replace with the saved draft). */
export const initialPrescription = (): PrescriptionValues => ({
  medications: [{ id: uid(), medication: "Ibuprofen 400 mg", dosage: "1 tablet", frequency: "Twice daily", duration: "5 days" }],
  instructions: "Take after meals. Stay hydrated. Return if symptoms persist or worsen.",
});

const MEDICATIONS = toOptions([
  "Ibuprofen 400 mg",
  "Paracetamol 500 mg",
  "Amoxicillin 500 mg",
  "Metformin 500 mg",
  "Amlodipine 5 mg",
  "Atorvastatin 20 mg",
  "Omeprazole 20 mg",
  "Cetirizine 10 mg",
]);
const DOSAGES = toOptions(["1 tablet", "2 tablets", "1 capsule", "5 ml", "10 ml"]);
const FREQUENCIES = toOptions(["Once daily", "Twice daily", "Three times daily", "Every 8 hours", "As needed"]);
const DURATIONS = toOptions(["3 days", "5 days", "7 days", "10 days", "14 days", "30 days"]);
const MAX_MEDICATIONS = 5;

export const validatePrescription = (v: PrescriptionValues): Errors => {
  const e: Errors = {};
  v.medications.forEach((m, i) => {
    if (!m.medication) e[`med_${i}_medication`] = "Select a medication.";
    if (!m.dosage) e[`med_${i}_dosage`] = "Select a dosage.";
    if (!m.frequency) e[`med_${i}_frequency`] = "Select a frequency.";
    if (!m.duration) e[`med_${i}_duration`] = "Select a duration.";
  });
  if (v.medications.length === 0) e.medications = "Add at least one medication.";
  return e;
};

/* ---------------------------------------------------------------- */
/*  Tab – Prescription                                               */
/* ---------------------------------------------------------------- */
const PrescriptionTab = ({ values, errors, onChange }: StepProps<PrescriptionValues>) => {
  const update = (id: string, patch: Partial<MedicationRow>) =>
    onChange({ medications: values.medications.map((m) => (m.id === id ? { ...m, ...patch } : m)) });

  const columns: { key: keyof Omit<MedicationRow, "id">; label: string; placeholder: string; options: typeof MEDICATIONS }[] = [
    { key: "medication", label: "Medication", placeholder: "Select medication", options: MEDICATIONS },
    { key: "dosage", label: "Dosage", placeholder: "Select dosage", options: DOSAGES },
    { key: "frequency", label: "Frequency", placeholder: "Select frequency", options: FREQUENCIES },
    { key: "duration", label: "Duration", placeholder: "Select duration", options: DURATIONS },
  ];

  return (
    <div className="space-y-4">
      <ul className="space-y-4">
        {values.medications.map((m, i) => (
          <li key={m.id} className="grid items-start gap-3 sm:grid-cols-2 xl:grid-cols-[repeat(4,minmax(0,1fr))_2.5rem]">
            {columns.map((c) => (
              <SignupDropdown
                key={c.key}
                name={`med_${i}_${c.key}`}
                label={<>{c.label}<Req /></>}
                placeholder={c.placeholder}
                options={c.options}
                value={m[c.key]}
                onChange={(v) => update(m.id, { [c.key]: v })}
                error={errors[`med_${i}_${c.key}`]}
                searchable={c.key === "medication"}
                portalMenu
                portalMenuZIndex={100}
              />
            ))}
            <div className="flex h-full items-end sm:col-span-2 xl:col-span-1">
              {values.medications.length > 1 && (
                <button
                  type="button"
                  aria-label={`Remove medication ${i + 1}`}
                  onClick={() => onChange({ medications: values.medications.filter((x) => x.id !== m.id) })}
                  className="flex h-12 w-10 cursor-pointer items-center justify-center rounded-lg text-danger transition-colors hover:bg-danger/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
      <FieldError message={errors.medications} />

      {values.medications.length < MAX_MEDICATIONS && (
        <ImportButton
          text="Add Medication"
          icon={<Plus className="h-4 w-4" />}
          onClick={() => onChange({ medications: [...values.medications, newMedication()] })}
          className="whitespace-nowrap"
        />
      )}

      <TextArea
        name="instructions"
        label="Instructions for Patient"
        value={values.instructions}
        onChange={(instructions) => onChange({ instructions })}
        placeholder="Add instructions for the patient"
        maxLength={500}
        rows={4}
        error={errors.instructions}
      />
    </div>
  );
};

export default PrescriptionTab;