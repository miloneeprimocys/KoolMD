"use client";

import React, { useState } from "react";
import { Calendar, ClipboardList, Info, Pill, Search, FileText } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppHooks";
import { hideModal } from "@/redux/slices/dialogslice";

import ModalShell, {
  FormGrid,
  FullRow,
  ModalDateField,
  ModalRadioGroup,
  ModalSection,
  ModalTextarea,
  OptLabel,
  ReqLabel,
  SignupDropdown,
  SignupField,
  todayISO,
  toOptions,
} from "@/components/Modalshell";

/* ---------- Options ---------- */
const MEDICATIONS = toOptions([
  "Albuterol Inhaler",
  "Cetirizine",
  "Montelukast",
  "Vitamin D3",
  "Amoxicillin",
  "Prednisone",
  "Ibuprofen",
  "Metformin",
  "Lisinopril",
  "Atorvastatin",
]);
const TYPES = toOptions(["Prescription", "Over-the-counter", "Supplement", "Herbal"]);
const FORMS = toOptions(["Tablet", "Capsule", "Inhaler", "Liquid", "Injection", "Cream", "Drops"]);
const FREQUENCIES = toOptions(["Once daily", "Twice daily", "Three times daily", "Four times daily", "Weekly", "As needed"]);
const PROVIDERS = toOptions([
  "Dr. Sarah Lee (KMD-1001)",
  "Dr. James Wilson (KMD-1002)",
  "Dr. Emily Davis (KMD-1003)",
  "Dr. Michael Brown (KMD-1004)",
]);
const STATUSES = [
  { value: "Active", label: "Active" },
  { value: "Inactive", label: "Inactive" },
  { value: "On Hold", label: "On Hold" },
];

/* ---------- Form types ---------- */
export type MedicationValues = {
  name: string;
  type: string;
  strength: string;
  form: string;
  frequency: string;
  dose: string;
  instructions: string;
  startDate: string;
  endDate: string;
  provider: string;
  status: string;
  notes: string;
};
type Errors = Partial<Record<keyof MedicationValues, string>>;

const initial = (): MedicationValues => ({
  name: "",
  type: "",
  strength: "",
  form: "",
  frequency: "",
  dose: "",
  instructions: "",
  startDate: todayISO(),
  endDate: "",
  provider: "Dr. Sarah Lee (KMD-1001)",
  status: "Active",
  notes: "",
});

interface AddMedicationModalProps {
  open?: boolean;
  onClose?: () => void;
  onSave?: (values: MedicationValues) => void;
}

/* ---------- Component ---------- */
const AddMedicationModal = ({
  open: propOpen,
  onClose: propOnClose,
  onSave,
}: AddMedicationModalProps) => {
  const dispatch = useAppDispatch();
  const reduxOpen = useAppSelector((s) => s.dialog.AddMedication);
  const open = propOpen !== undefined ? propOpen : reduxOpen;

  const [values, setValues] = useState<MedicationValues>(initial());
  const [errors, setErrors] = useState<Errors>({});

  const set = <K extends keyof MedicationValues>(key: K, val: MedicationValues[K]) => {
    setValues((p) => ({ ...p, [key]: val }));
    setErrors((p) => ({ ...p, [key]: undefined }));
  };

  const handleClose = () => {
    if (propOnClose) {
      propOnClose();
    } else {
      dispatch(hideModal("AddMedication"));
    }
    setValues(initial());
    setErrors({});
  };

  const handleSave = () => {
    const e: Errors = {};
    if (!values.name) e.name = "Select a medication";
    if (!values.type) e.type = "Select a medication type";
    if (!values.strength.trim()) e.strength = "Strength / dosage is required";
    if (!values.form) e.form = "Select a form";
    if (!values.frequency) e.frequency = "Select a frequency";
    if (!values.dose.trim()) e.dose = "Dose is required";
    if (!values.startDate) e.startDate = "Start date is required";
    if (values.endDate && values.startDate && values.endDate < values.startDate) {
      e.endDate = "End date cannot be before the start date";
    }
    if (!values.provider) e.provider = "Select a provider";
    if (!values.status) e.status = "Select a status";
    setErrors(e);
    if (Object.keys(e).length) return;

    // TODO: call your API here
    console.log("Medication saved:", values);
    onSave?.(values);
    handleClose();
  };

  return (
    <ModalShell
      open={open}
      onClose={handleClose}
      onSubmit={handleSave}
      title="Add Medication"
      subtitle="Enter the medication details the patient is currently taking."
      submitText="Save Medication"
      width={760}
    >
      <div className="space-y-3">
        {/* Medication information */}
        <ModalSection icon={<Pill className="h-4 w-4" />} title="Medication Information">
          <FormGrid>
            <SignupDropdown
              name="medicationName"
              label={<ReqLabel>Medication Name</ReqLabel>}
              icon={<Search className="h-4 w-4" />}
              placeholder="Search medication name..."
              options={MEDICATIONS}
              value={values.name}
              onChange={(v) => set("name", v)}
              error={errors.name}
            />
            <SignupDropdown
              name="medicationType"
              label={<ReqLabel>Medication Type</ReqLabel>}
              placeholder="Select medication type"
              searchable={false}
              options={TYPES}
              value={values.type}
              onChange={(v) => set("type", v)}
              error={errors.type}
            />
            <SignupField
              name="strength"
              label={<ReqLabel>Strength / Dosage</ReqLabel>}
              placeholder="e.g., 10 mg, 500 mcg"
              value={values.strength}
              onChange={(e) => set("strength", e.target.value)}
              error={errors.strength}
            />
            <SignupDropdown
              name="form"
              label={<ReqLabel>Form</ReqLabel>}
              placeholder="Select form"
              searchable={false}
              options={FORMS}
              value={values.form}
              onChange={(v) => set("form", v)}
              error={errors.form}
            />
          </FormGrid>
        </ModalSection>

        {/* Directions */}
        <ModalSection icon={<ClipboardList className="h-4 w-4" />} title="Directions">
          <FormGrid>
            <SignupDropdown
              name="frequency"
              label={<ReqLabel>Frequency</ReqLabel>}
              placeholder="Select frequency"
              searchable={false}
              options={FREQUENCIES}
              value={values.frequency}
              onChange={(v) => set("frequency", v)}
              error={errors.frequency}
            />
            <SignupField
              name="dose"
              label={<ReqLabel>Dose</ReqLabel>}
              placeholder="e.g., 1 tablet, 2 puffs"
              value={values.dose}
              onChange={(e) => set("dose", e.target.value)}
              error={errors.dose}
            />
            <FullRow>
              <ModalTextarea
                id="med-instructions"
                label={<OptLabel>Instructions</OptLabel>}
                placeholder="e.g., Take with food, Use before exercise, etc."
                value={values.instructions}
                onChange={(v) => set("instructions", v)}
                maxLength={250}
              />
            </FullRow>
          </FormGrid>
        </ModalSection>

        {/* Dates & provider */}
        <ModalSection icon={<Calendar className="h-4 w-4" />} title="Dates & Provider">
          <div className="grid gap-x-4 gap-y-3 sm:grid-cols-3">
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
              min={values.startDate}
              onChange={(v) => set("endDate", v)}
              error={errors.endDate}
            />
            <SignupDropdown
              name="prescribingProvider"
              label={<ReqLabel>Prescribing Provider</ReqLabel>}
              placeholder="Select provider"
              searchable={false}
              options={PROVIDERS}
              value={values.provider}
              onChange={(v) => set("provider", v)}
              error={errors.provider}
            />
          </div>
        </ModalSection>

        {/* Status & notes */}
        <ModalSection icon={<Info className="h-4 w-4" />} title="Status & Notes">
          <FormGrid>
            <ModalRadioGroup
              name="medStatus"
              label={<ReqLabel>Status</ReqLabel>}
              value={values.status}
              onChange={(v) => set("status", v)}
              options={STATUSES}
              error={errors.status}
            />
            <ModalTextarea
              id="med-notes"
              label={<OptLabel>Notes</OptLabel>}
              placeholder="Add any additional notes..."
              value={values.notes}
              onChange={(v) => set("notes", v)}
              maxLength={250}
            />
          </FormGrid>
        </ModalSection>
      </div>
    </ModalShell>
  );
};

export default AddMedicationModal;