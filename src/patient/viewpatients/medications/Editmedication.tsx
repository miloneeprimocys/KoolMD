"use client";

import React, { useEffect, useState } from "react";

import ModalShell, {
  FormGrid,
  FullRow,
  ModalDateField,
  ModalTextarea,
  OptLabel,
  ReqLabel,
  SignupDropdown,
  SignupField,
  toOptions,
} from "@/components/Modalshell";
import type { Medication } from "./ViewMedication";

/* ---------- Options ---------- */
const TYPES = toOptions(["Inhaler", "Tablet", "Capsule", "Syrup", "Injection", "Cream", "Drops", "Supplement", "Other"]);
const ROUTES = toOptions(["Oral", "Inhalation", "Topical", "Injection", "Sublingual", "Ophthalmic", "Other"]);
const FREQUENCIES = toOptions([
  "Once daily",
  "Twice daily",
  "3 times daily",
  "4 times daily",
  "Every 8 hours",
  "Weekly",
  "As needed",
]);

/* TODO: load providers from your API */
const PROVIDERS = [
  { name: "Dr. Sarah Lee", code: "KMD-1001" },
  { name: "Dr. James Wilson", code: "KMD-1002" },
  { name: "Dr. Emily Davis", code: "KMD-1003" },
  { name: "Dr. Michael Brown", code: "KMD-1004" },
];
const PROVIDER_OPTIONS = toOptions(PROVIDERS.map((p) => p.name));

/* ---------- Form types ---------- */
type Values = {
  name: string;
  type: string;
  dosage: string;
  frequency: string;
  route: string;
  startDate: string;
  endDate: string;
  provider: string;
  instructions: string;
  notes: string;
};
type Errors = Partial<Record<keyof Values, string>>;

const toValues = (m: Medication): Values => ({
  name: m.name,
  type: m.type,
  dosage: m.dosage,
  frequency: m.frequency,
  route: m.route,
  startDate: m.startDate,
  endDate: m.endDate,
  provider: m.provider,
  instructions: m.instructions,
  notes: m.notes,
});

const validate = (v: Values): Errors => {
  const e: Errors = {};
  if (!v.name.trim()) e.name = "Medication name is required";
  if (!v.type) e.type = "Select a medication type";
  if (!v.dosage.trim()) e.dosage = "Dosage is required";
  if (!v.frequency) e.frequency = "Select a frequency";
  if (!v.route) e.route = "Select a route";
  if (!v.startDate) e.startDate = "Start date is required";
  if (v.endDate && v.startDate && v.endDate < v.startDate) e.endDate = "End date cannot be before the start date";
  if (!v.provider) e.provider = "Select a prescribing provider";
  return e;
};

/* ---------- Component ---------- */
type Props = {
  open: boolean;
  onClose: () => void;
  medication: Medication | null;
  onSave?: (medication: Medication) => void;
};

const EditMedication = ({ open, onClose, medication, onSave }: Props) => {
  const [values, setValues] = useState<Values | null>(medication ? toValues(medication) : null);
  const [errors, setErrors] = useState<Errors>({});

  /* Re-fill the form every time the modal opens for a medication */
  useEffect(() => {
    if (open && medication) {
      setValues(toValues(medication));
      setErrors({});
    }
  }, [open, medication]);

  if (!medication || !values) return null;

  const set = <K extends keyof Values>(key: K, val: Values[K]) => {
    setValues((p) => (p ? { ...p, [key]: val } : p));
    setErrors((p) => ({ ...p, [key]: undefined }));
  };

  const handleSave = () => {
    const errs = validate(values);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const providerCode = PROVIDERS.find((p) => p.name === values.provider)?.code ?? medication.providerCode;
    const updated: Medication = {
      ...medication,
      ...values,
      name: values.name.trim(),
      dosage: values.dosage.trim(),
      providerCode,
    };

    // TODO: call your update-medication API here
    onSave?.(updated);
    onClose();
  };

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      onSubmit={handleSave}
      title="Edit Medication"
      subtitle="Update the medication details."
      submitText="Save Changes"
      width={760}
    >
      <FormGrid>
        <SignupField
          name="name"
          label={<ReqLabel>Medication Name</ReqLabel>}
          placeholder="Enter medication name"
          value={values.name}
          onChange={(e) => set("name", e.target.value)}
          error={errors.name}
        />
        <SignupDropdown
          name="type"
          label={<ReqLabel>Medication Type</ReqLabel>}
          placeholder="Select type"
          searchable={false}
          options={TYPES}
          value={values.type}
          onChange={(v) => set("type", v)}
          error={errors.type}
          portalMenu
          portalMenuZIndex={1000}
        />

        <SignupField
          name="dosage"
          label={<ReqLabel>Dosage</ReqLabel>}
          placeholder="e.g., 2 puffs"
          value={values.dosage}
          onChange={(e) => set("dosage", e.target.value)}
          error={errors.dosage}
        />
        <SignupDropdown
          name="frequency"
          label={<ReqLabel>Frequency</ReqLabel>}
          placeholder="Select frequency"
          searchable={false}
          options={FREQUENCIES}
          value={values.frequency}
          onChange={(v) => set("frequency", v)}
          error={errors.frequency}
          portalMenu
          portalMenuZIndex={1000}
        />

        <FullRow>
          <SignupDropdown
            name="route"
            label={<ReqLabel>Route</ReqLabel>}
            placeholder="Select route"
            searchable={false}
            options={ROUTES}
            value={values.route}
            onChange={(v) => set("route", v)}
            error={errors.route}
            portalMenu
            portalMenuZIndex={1000}
          />
        </FullRow>

        <ModalDateField
          id="med-start"
          label={<ReqLabel>Start Date</ReqLabel>}
          value={values.startDate}
          onChange={(v) => set("startDate", v)}
          error={errors.startDate}
        />
        <ModalDateField
          id="med-end"
          label={<OptLabel>End Date</OptLabel>}
          value={values.endDate}
          min={values.startDate || undefined}
          onChange={(v) => set("endDate", v)}
          error={errors.endDate}
        />

        <FullRow>
          <SignupDropdown
            name="provider"
            label={<ReqLabel>Prescribing Provider</ReqLabel>}
            placeholder="Select provider"
            searchable={false}
            options={PROVIDER_OPTIONS}
            value={values.provider}
            onChange={(v) => set("provider", v)}
            error={errors.provider}
            portalMenu
            portalMenuZIndex={1000}
          />
        </FullRow>

        <FullRow>
          <ModalTextarea
            id="med-instructions"
            label={<OptLabel>Instructions</OptLabel>}
            placeholder="Add instructions..."
            value={values.instructions}
            onChange={(v) => set("instructions", v)}
            maxLength={250}
          />
        </FullRow>
        <FullRow>
          <ModalTextarea
            id="med-notes"
            label={<OptLabel>Notes</OptLabel>}
            placeholder="Add additional notes..."
            value={values.notes}
            onChange={(v) => set("notes", v)}
            maxLength={250}
          />
        </FullRow>
      </FormGrid>
    </ModalShell>
  );
};

export default EditMedication;