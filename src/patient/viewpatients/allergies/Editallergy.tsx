"use client";

import React, { useEffect, useState } from "react";
import { AlertCircle, AlertTriangle, Calendar, Droplet, Info } from "lucide-react";

import { FieldError } from "@/components/SignupField";
import ModalShell, {
  FormGrid,
  FullRow,
  ModalDateField,
  ModalSection,
  ModalTextarea,
  OptLabel,
  ReqLabel,
  SignupDropdown,
  SignupField,
  todayISO,
  toOptions,
} from "@/components/Modalshell";
import type { Allergy, AllergySeverity } from "./ViewAllergy";

/* ---------- Options ---------- */
const TYPES = toOptions(["Medication", "Food", "Environmental", "Insect", "Latex", "Other"]);
const STATUSES = toOptions(["Active", "Inactive"]);

/* Same coloured severity pills as the Add Allergy modal */
const SEVERITIES: { value: AllergySeverity; icon: React.ElementType; cls: string; ring: string }[] = [
  { value: "High", icon: AlertCircle, cls: "bg-danger/10 text-danger", ring: "ring-danger" },
  { value: "Moderate", icon: AlertTriangle, cls: "bg-warning/10 text-warning", ring: "ring-warning" },
  { value: "Mild", icon: Droplet, cls: "bg-primary/10 text-primary", ring: "ring-primary" },
];

/* ---------- Form types ---------- */
type Values = Omit<Allergy, "id">;
type Errors = Partial<Record<keyof Values, string>>;

const toValues = (a: Allergy): Values => {
  const { id: _id, ...rest } = a;
  return rest;
};

const validate = (v: Values): Errors => {
  const e: Errors = {};
  if (!v.allergen.trim()) e.allergen = "Select or enter an allergen";
  if (!v.type) e.type = "Select an allergy type";
  if (!v.severity) e.severity = "Select a severity";
  if (!v.reaction.trim()) e.reaction = "Enter a reaction";
  if (v.dateIdentified && v.dateIdentified > todayISO()) e.dateIdentified = "Date cannot be in the future";
  return e;
};

/* ---------- Component ---------- */
type Props = {
  open: boolean;
  onClose: () => void;
  allergy: Allergy | null;
  onSave?: (allergy: Allergy) => void;
};

const EditAllergy = ({ open, onClose, allergy, onSave }: Props) => {
  const [values, setValues] = useState<Values | null>(allergy ? toValues(allergy) : null);
  const [errors, setErrors] = useState<Errors>({});

  /* Re-fill the form every time the modal opens */
  useEffect(() => {
    if (open && allergy) {
      setValues(toValues(allergy));
      setErrors({});
    }
  }, [open, allergy]);

  if (!allergy || !values) return null;

  const set = <K extends keyof Values>(key: K, val: Values[K]) => {
    setValues((p) => (p ? { ...p, [key]: val } : p));
    setErrors((p) => ({ ...p, [key]: undefined }));
  };

  const handleSave = () => {
    const errs = validate(values);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    // TODO: call your update-allergy API here
    onSave?.({ ...allergy, ...values, allergen: values.allergen.trim(), reaction: values.reaction.trim() });
    onClose();
  };

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      onSubmit={handleSave}
      title="Edit Allergy"
      subtitle="Update the allergy details and reaction information for this patient."
      submitText="Save Changes"
      width={760}
    >
      <div className="space-y-3">
        {/* Allergy information */}
        <ModalSection icon={<AlertTriangle className="h-4 w-4" />} title="Allergy Information">
          <FormGrid>
            <FullRow>
              <SignupField
                name="allergen"
                label={<ReqLabel>Allergen Name</ReqLabel>}
                placeholder="Enter allergen name (e.g., Penicillin, Peanuts, Pollen)"
                value={values.allergen}
                onChange={(e) => set("allergen", e.target.value)}
                error={errors.allergen}
              />
            </FullRow>

            <SignupDropdown
              name="allergyType"
              label={<ReqLabel>Allergy Type</ReqLabel>}
              placeholder="Select type"
              searchable={false}
              options={TYPES}
              value={values.type}
              onChange={(v) => set("type", v)}
              error={errors.type}
              portalMenu
              portalMenuZIndex={1000}
            />

            {/* Severity pills */}
            <div className="w-full">
              <p className="mb-2 text-sm font-medium text-label">
                <ReqLabel>Severity</ReqLabel>
              </p>
              <div role="radiogroup" aria-label="Severity" className="flex flex-wrap items-center gap-2 pt-1">
                {SEVERITIES.map(({ value, icon: Icon, cls, ring }) => {
                  const active = values.severity === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => set("severity", value)}
                      className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 ${cls} ${
                        active ? `ring-1 ${ring}` : "opacity-80 hover:opacity-100"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {value}
                    </button>
                  );
                })}
              </div>
              <FieldError message={errors.severity} />
            </div>
          </FormGrid>
        </ModalSection>

        {/* Reaction details */}
        <ModalSection icon={<AlertCircle className="h-4 w-4" />} title="Reaction Details">
          <FormGrid>
            <FullRow>
              <SignupField
                name="reaction"
                label={<ReqLabel>Reaction</ReqLabel>}
                placeholder="e.g., Rash, Hives"
                value={values.reaction}
                onChange={(e) => set("reaction", e.target.value)}
                error={errors.reaction}
              />
            </FullRow>
          </FormGrid>
        </ModalSection>

        {/* Status & Timeline */}
        <ModalSection icon={<Calendar className="h-4 w-4" />} title="Status & Timeline">
          <FormGrid>
            <ModalDateField
              id="allergy-date"
              label="Date Identified"
              value={values.dateIdentified}
              max={todayISO()}
              onChange={(v) => set("dateIdentified", v)}
              error={errors.dateIdentified}
            />
            <SignupDropdown
              name="allergyStatus"
              label="Status"
              placeholder="Select status"
              searchable={false}
              options={STATUSES}
              value={values.status}
              onChange={(v) => set("status", v as Values["status"])}
              portalMenu
              portalMenuZIndex={1000}
            />
          </FormGrid>
        </ModalSection>

        {/* Notes */}
        <ModalSection icon={<Info className="h-4 w-4" />} title="Additional Notes">
          <ModalTextarea
            id="allergy-notes"
            label={<OptLabel>Notes</OptLabel>}
            placeholder="Add any additional notes (e.g., triggers, management instructions)..."
            value={values.notes}
            onChange={(v) => set("notes", v)}
            maxLength={250}
          />
        </ModalSection>
      </div>
    </ModalShell>
  );
};

export default EditAllergy;