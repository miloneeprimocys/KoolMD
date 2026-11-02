"use client";

import React from "react";
import { Pill } from "lucide-react";

import SignupField, { FieldError } from "@/components/SignupField";
import SignupDropdown from "@/components/SignupDropdown";
import { ModalDateField } from "@/components/Modalshell";
import { Errors, Opt, Req, SectionCard, StepProps, TextArea, todayISO, toOptions } from "@/providers/Shared";
import { type CatalogMed } from "../medicationlist/Selectmedicationmodal";

const p2 = (n: number) => String(n).padStart(2, "0");
export const addDays = (iso: string, days: number) => {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`;
};
export const fmtDate = (iso: string) =>
  iso ? new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }) : "-";
export const DURATION_DAYS: Record<string, number> = {
  "3 days": 3, "5 days": 5, "7 days": 7, "10 days": 10, "14 days": 14, "30 days": 30, "90 days": 90,
};

/* ---------- Values ---------- */
export interface MedValues {
  medId: string;
  dosage: string;
  route: string;
  frequency: string;
  duration: string;
  quantity: string;
  unit: string;
  refills: string;
  startDate: string;
  endDate: string;
  instructions: string;
  notes: string;
}

export const initialMed = (medId = ""): MedValues => ({
  medId,
  dosage: "",
  route: "Oral",
  frequency: "Three times daily (TID)",
  duration: "7 days",
  quantity: "",
  unit: "Capsule",
  refills: "0",
  startDate: todayISO(),
  endDate: addDays(todayISO(), 7),
  instructions: "",
  notes: "",
});

const ROUTE_OPTS = toOptions(["Oral", "Topical", "Inhalation", "Intravenous", "Intramuscular", "Subcutaneous", "Ophthalmic"]);
const FREQ_OPTS = toOptions(["Once daily", "Twice daily (BID)", "Three times daily (TID)", "Four times daily (QID)", "As needed (PRN)"]);
const DURATION_OPTS = toOptions(Object.keys(DURATION_DAYS));
const UNIT_OPTS = toOptions(["Capsule", "Tablet", "mL", "Inhaler", "Vial", "Patch"]);

/* ---------- Validation ---------- */
export const validateMed = (v: MedValues, endOptional = false): Errors => {
  const e: Errors = {};
  if (!v.medId) e.medId = "Select a medication.";
  if (!v.dosage) e.dosage = "Dosage is required.";
  if (!v.route) e.route = "Route is required.";
  if (!v.frequency) e.frequency = "Frequency is required.";
  if (!v.duration) e.duration = "Duration is required.";
  if (!v.quantity.trim()) e.quantity = "Quantity is required.";
  else if (!/^[1-9]\d{0,3}$/.test(v.quantity.trim())) e.quantity = "Enter a whole number greater than 0.";
  if (v.refills === "" || !/^\d{1,2}$/.test(v.refills) || Number(v.refills) > 12) e.refills = "Refills must be 0 to 12.";
  if (!v.startDate) e.startDate = "Start date is required.";
  if (!v.endDate && !endOptional) e.endDate = "End date is required.";
  else if (v.endDate && v.startDate && v.endDate < v.startDate) e.endDate = "End date cannot be before start date.";
  if (!v.instructions.trim()) e.instructions = "Instructions for patient are required.";
  return e;
};

/* ---------- Component ---------- */
type Props = StepProps<MedValues> & {
  med?: CatalogMed;
  onChangeMedication: () => void;
  endOptional?: boolean;
};

const MedicationStep = ({ values: v, errors, onChange, med, onChangeMedication, endOptional = false }: Props) => {
  const dosageOptions = toOptions(med?.strengths ?? []);

  const setDuration = (duration: string) =>
    onChange({ duration, endDate: v.startDate ? addDays(v.startDate, DURATION_DAYS[duration] ?? 0) : v.endDate });

  const setStart = (startDate: string) =>
    onChange({
      startDate,
      endDate: startDate && DURATION_DAYS[v.duration] ? addDays(startDate, DURATION_DAYS[v.duration]) : v.endDate,
    });

  return (
    <SectionCard step={1} title="Medication" subtitle="Selected medication and dosing details.">
      <div className="space-y-4">
        {/* Selected medication */}
        <div>
          <p className="mb-2 text-sm font-medium text-label">Selected Medication<Req /></p>
          <div className="flex items-center justify-between gap-3 rounded-xl border border-border p-3">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-12 w-16 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Pill className="h-6 w-6" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-heading">{med?.name ?? "No medication selected"}</p>
                <p className="text-xs text-body">{med?.category ?? "Choose a medication to continue"}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onChangeMedication}
              className="cursor-pointer text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
            >
              {med ? "Change" : "Select"}
            </button>
          </div>
          <FieldError message={errors.medId} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <SignupDropdown name="dosage" label="Dosage *" placeholder="Select dosage" searchable={false}
            options={dosageOptions} value={v.dosage} onChange={(val) => onChange({ dosage: val })} error={errors.dosage} />
          <SignupDropdown name="route" label="Route *" placeholder="Select route" searchable={false}
            options={ROUTE_OPTS} value={v.route} onChange={(val) => onChange({ route: val })} error={errors.route} />
          <SignupDropdown name="frequency" label="Frequency *" placeholder="Select frequency" searchable={false}
            options={FREQ_OPTS} value={v.frequency} onChange={(val) => onChange({ frequency: val })} error={errors.frequency} />
          <SignupDropdown name="duration" label="Duration *" placeholder="Select duration" searchable={false}
            options={DURATION_OPTS} value={v.duration} onChange={setDuration} error={errors.duration} />

          <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-3">
            <SignupField
              name="quantity"
              label={<>Quantity<Req /></>}
              placeholder="e.g. 21"
              inputMode="numeric"
              value={v.quantity}
              onChange={(e) => onChange({ quantity: e.target.value.replace(/\D/g, "").slice(0, 4) })}
              error={errors.quantity}
            />
            <SignupDropdown name="unit" label="Unit" placeholder="Unit" searchable={false}
              options={UNIT_OPTS} value={v.unit} onChange={(val) => onChange({ unit: val })} />
          </div>

          <SignupField
            name="refills"
            label={<>Refills<Req /></>}
            placeholder="0"
            inputMode="numeric"
            value={v.refills}
            onChange={(e) => onChange({ refills: e.target.value.replace(/\D/g, "").slice(0, 2) })}
            error={errors.refills}
          />

          <ModalDateField id="startDate" label={<>Start Date<Req /></>} value={v.startDate} onChange={setStart} error={errors.startDate} />
          <ModalDateField
            id="endDate"
            label={endOptional ? <>End Date<Opt /></> : <>End Date<Req /></>}
            value={v.endDate}
            min={v.startDate}
            onChange={(val) => onChange({ endDate: val })}
            error={errors.endDate}
          />
        </div>

        <TextArea
          name="instructions"
          label={<>Instructions for Patient<Req /></>}
          placeholder="Enter instructions for the patient"
          value={v.instructions}
          onChange={(val) => onChange({ instructions: val })}
          maxLength={500}
          rows={3}
          error={errors.instructions}
        />
        <TextArea
          name="notes"
          label={<>Additional Notes (Internal)<Opt /></>}
          placeholder="Enter internal notes"
          value={v.notes}
          onChange={(val) => onChange({ notes: val })}
          maxLength={500}
          rows={3}
        />
      </div>
    </SectionCard>
  );
};

export default MedicationStep;