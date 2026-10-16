"use client";

import React, { useState } from "react";
import { Search } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppHooks";
import { hideModal } from "@/redux/slices/dialogslice";

import ModalShell, {
  AttachmentField,
  FormGrid,
  FullRow,
  ModalDateField,
  ModalTextarea,
  SignupDropdown,
  OptLabel,
  ReqLabel,
  todayISO,
  toOptions,
} from "@/components/Modalshell";

/* ---------- Options ---------- */
const CONDITIONS = toOptions([
  "Asthma",
  "Allergic Rhinitis",
  "Eczema",
  "Diabetes (Type 1)",
  "Diabetes (Type 2)",
  "Hypertension",
  "Hyperlipidemia",
  "Migraine",
  "Anxiety Disorder",
  "Depression",
  "Hypothyroidism",
  "Chronic Kidney Disease",
  "Osteoarthritis",
  "GERD",
]);
const STATUSES = toOptions(["Active", "Resolved", "Chronic", "Inactive"]);
const SOURCES = toOptions(["Patient reported", "Provider diagnosed", "Medical records", "Other"]);

/* ---------- Form types ---------- */
export type MedicalConditionValues = {
  condition: string;
  diagnosisDate: string;
  status: string;
  source: string;
  notes: string;
  attachment: File | null;
};
type Errors = Partial<Record<keyof MedicalConditionValues, string>>;

const initial = (): MedicalConditionValues => ({
  condition: "",
  diagnosisDate: "",
  status: "Active",
  source: "Patient reported",
  notes: "",
  attachment: null,
});

/* ---------- Component ---------- */
const AddMedicalConditionModal = ({
  onSave,
}: {
  onSave?: (values: MedicalConditionValues) => void;
}) => {
  const dispatch = useAppDispatch();
  const open = useAppSelector((s) => s.dialog.AddMedicalCondition);

  const [values, setValues] = useState<MedicalConditionValues>(initial());
  const [errors, setErrors] = useState<Errors>({});

  const set = <K extends keyof MedicalConditionValues>(key: K, val: MedicalConditionValues[K]) => {
    setValues((p) => ({ ...p, [key]: val }));
    setErrors((p) => ({ ...p, [key]: undefined }));
  };

  const handleClose = () => {
    dispatch(hideModal("AddMedicalCondition"));
    setValues(initial());
    setErrors({});
  };

  const handleSave = () => {
    const e: Errors = {};
    if (!values.condition) e.condition = "Please select a condition";
    if (!values.diagnosisDate) e.diagnosisDate = "Diagnosis date is required";
    else if (values.diagnosisDate > todayISO()) e.diagnosisDate = "Date cannot be in the future";
    if (!values.status) e.status = "Please select a status";
    setErrors(e);
    if (Object.keys(e).length) return;

    // TODO: call your API here
    console.log("Medical condition saved:", values);
    onSave?.(values);
    handleClose();
  };

  return (
    <ModalShell
      open={open}
      onClose={handleClose}
      onSubmit={handleSave}
      title="Add Medical Condition"
      subtitle="Add a new medical condition to the patient's record."
      submitText="Save Condition"
    >
      <FormGrid>
        <SignupDropdown
          id="mc-condition"
          name="condition"
          label={<ReqLabel>Condition</ReqLabel>}
          icon={<Search className="h-4 w-4" />}
          placeholder="Search or select condition..."
          options={CONDITIONS}
          value={values.condition}
          onChange={(v) => set("condition", v)}
          error={errors.condition}
        />
        <ModalDateField
          id="mc-diagnosis-date"
          label={<ReqLabel>Diagnosis Date</ReqLabel>}
          value={values.diagnosisDate}
          max={todayISO()}
          onChange={(v) => set("diagnosisDate", v)}
          error={errors.diagnosisDate}
        />

        <SignupDropdown
          id="mc-status"
          name="status"
          label={<ReqLabel>Status</ReqLabel>}
          placeholder="Select status"
          searchable={false}
          options={STATUSES}
          value={values.status}
          onChange={(v) => set("status", v)}
          error={errors.status}
        />
        <SignupDropdown
          id="mc-source"
          name="source"
          label="Source"
          placeholder="Select source"
          searchable={false}
          options={SOURCES}
          value={values.source}
          onChange={(v) => set("source", v)}
        />

        <FullRow>
          <ModalTextarea
            id="mc-notes"
            label={<OptLabel>Notes</OptLabel>}
            placeholder="Add additional details about the condition (e.g. onset, symptoms, treatment, etc.)"
            value={values.notes}
            onChange={(v) => set("notes", v)}
          />
        </FullRow>
        <FullRow>
          <AttachmentField
            title="Upload related documents (reports, test results, etc.)"
            file={values.attachment}
            onChange={(f) => set("attachment", f)}
          />
        </FullRow>
      </FormGrid>
    </ModalShell>
  );
};

export default AddMedicalConditionModal;