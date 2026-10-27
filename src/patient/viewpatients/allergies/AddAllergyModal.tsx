"use client";

import React, { useState } from "react";
import { AlertCircle, AlertTriangle, Calendar, Droplet, Info, Search } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppHooks";
import { hideModal } from "@/redux/slices/dialogslice";

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
  todayISO,
  toOptions,
} from "@/components/Modalshell";

/* ---------- Options ---------- */
const ALLERGENS = toOptions([
  "Penicillin",
  "Peanuts",
  "Pollen",
  "Dust Mites",
  "Shellfish",
  "Latex",
  "Aspirin",
  "Eggs",
  "Milk",
  "Bee Stings",
]);
const TYPES = toOptions(["Medication", "Food", "Environmental", "Insect", "Latex", "Other"]);
const REACTIONS = toOptions([
  "Rash",
  "Hives",
  "Anaphylaxis",
  "Swelling",
  "Sneezing",
  "Itchy eyes",
  "Runny nose",
  "Cough",
  "Nausea",
  "Shortness of breath",
]);
const STATUSES = toOptions(["Active", "Inactive", "Resolved"]);

type Severity = "High" | "Moderate" | "Mild";

const SEVERITIES: { value: Severity; icon: React.ElementType; cls: string; ring: string }[] = [
  { value: "High", icon: AlertCircle, cls: "bg-danger/10 text-danger", ring: "ring-danger" },
  { value: "Moderate", icon: AlertTriangle, cls: "bg-warning/10 text-warning", ring: "ring-warning" },
  { value: "Mild", icon: Droplet, cls: "bg-primary/10 text-primary", ring: "ring-primary" },
];

/* ---------- Form types ---------- */
export type AllergyValues = {
  allergen: string;
  type: string;
  severity: Severity | "";
  reaction: string;
  dateIdentified: string;
  status: string;
  notes: string;
};
type Errors = Partial<Record<keyof AllergyValues, string>>;

const initial = (): AllergyValues => ({
  allergen: "",
  type: "",
  severity: "",
  reaction: "",
  dateIdentified: "",
  status: "Active",
  notes: "",
});

interface AddAllergyModalProps {
  open?: boolean;
  onClose?: () => void;
  onSave?: (values: AllergyValues) => void;
}

/* ---------- Component ---------- */
const AddAllergyModal = ({
  open: propOpen,
  onClose: propOnClose,
  onSave,
}: AddAllergyModalProps) => {
  const dispatch = useAppDispatch();
  const reduxOpen = useAppSelector((s) => s.dialog.AddAllergy);
  const open = propOpen !== undefined ? propOpen : reduxOpen;

  const [values, setValues] = useState<AllergyValues>(initial());
  const [errors, setErrors] = useState<Errors>({});

  const set = <K extends keyof AllergyValues>(key: K, val: AllergyValues[K]) => {
    setValues((p) => ({ ...p, [key]: val }));
    setErrors((p) => ({ ...p, [key]: undefined }));
  };

  const handleClose = () => {
    if (propOnClose) {
      propOnClose();
    } else {
      dispatch(hideModal("AddAllergy"));
    }
    setValues(initial());
    setErrors({});
  };

  const handleSave = () => {
    const e: Errors = {};
    if (!values.allergen) e.allergen = "Select or enter an allergen";
    if (!values.type) e.type = "Select an allergy type";
    if (!values.severity) e.severity = "Select a severity";
    if (!values.reaction) e.reaction = "Select a reaction";
    if (values.dateIdentified && values.dateIdentified > todayISO()) e.dateIdentified = "Date cannot be in the future";
    setErrors(e);
    if (Object.keys(e).length) return;

    // TODO: call your API here
    console.log("Allergy saved:", values);
    onSave?.(values);
    handleClose();
  };

  return (
    <ModalShell
      open={open}
      onClose={handleClose}
      onSubmit={handleSave}
      title="Add Allergy"
      subtitle="Enter the allergy details and reaction information for this patient."
      submitText="Save Allergy"
      width={760}
    >
      <div className="space-y-3">
        {/* Allergy information */}
        <ModalSection icon={<AlertTriangle className="h-4 w-4" />} title="Allergy Information">
          <FormGrid>
            <FullRow>
              <SignupDropdown
                name="allergen"
                label={<ReqLabel>Allergen Name</ReqLabel>}
                icon={<Search className="h-4 w-4" />}
                placeholder="Search or enter allergen name (e.g., Penicillin, Peanuts, Pollen)"
                options={ALLERGENS}
                value={values.allergen}
                onChange={(v) => set("allergen", v)}
                error={errors.allergen}
                portalMenu
                portalMenuZIndex={1000}
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
              <SignupDropdown
                name="reaction"
                label={<ReqLabel>Reaction</ReqLabel>}
                placeholder="Select reaction"
                options={REACTIONS}
                value={values.reaction}
                onChange={(v) => set("reaction", v)}
                error={errors.reaction}
                portalMenu
                portalMenuZIndex={1000}
              />
            </FullRow>
          </FormGrid>
        </ModalSection>

        {/* Status & Timeline */}
        <ModalSection icon={<Calendar className="h-4 w-4" />} title="Status & Timeline">
          <FormGrid>
            <ModalDateField
              id="al-date"
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
              onChange={(v) => set("status", v)}
              portalMenu
              portalMenuZIndex={1000}
            />
          </FormGrid>
        </ModalSection>

        {/* Notes */}
        <ModalSection icon={<Info className="h-4 w-4" />} title="Additional Notes">
          <ModalTextarea
            id="al-notes"
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

export default AddAllergyModal;