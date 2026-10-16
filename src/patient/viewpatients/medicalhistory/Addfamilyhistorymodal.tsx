"use client";

import React, { useState } from "react";
import { Search } from "lucide-react";

import { useAppDispatch, useAppSelector } from "@/hooks/useAppHooks";
import { hideModal } from "@/redux/slices/dialogslice";

import ModalShell, {
  AttachmentField,
  FormGrid,
  FullRow,
  ModalRadioGroup,
  ModalTextarea,
    SignupDropdown,
  SignupField,
  OptLabel,
  ReqLabel,
  toOptions,
} from "@/components/Modalshell";

/* ---------- Options ---------- */
const CONDITIONS = toOptions([
  "Diabetes",
  "Hypertension",
  "Asthma",
  "Cancer",
  "Heart Disease",
  "Stroke",
  "High Cholesterol",
  "Thyroid Disorder",
  "Depression",
  "Alzheimer's Disease",
  "Arthritis",
  "Kidney Disease",
]);
const FAMILY_MEMBERS = toOptions([
  "Father",
  "Mother",
  "Brother",
  "Sister",
  "Sibling",
  "Grandfather",
  "Grandmother",
  "Uncle",
  "Aunt",
  "Child",
]);
const STATUS_OPTIONS = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "unknown", label: "Unknown" },
];

/* ---------- Form types ---------- */
export type FamilyHistoryValues = {
  condition: string;
  familyMember: string;
  relationDetails: string;
  ageAtDiagnosis: string;
  status: string;
  notes: string;
  attachment: File | null;
};
type Errors = Partial<Record<keyof FamilyHistoryValues, string>>;

const initial = (): FamilyHistoryValues => ({
  condition: "",
  familyMember: "",
  relationDetails: "",
  ageAtDiagnosis: "",
  status: "yes",
  notes: "",
  attachment: null,
});

/* ---------- Component ---------- */
const AddFamilyHistoryModal = ({
  onSave,
}: {
  onSave?: (values: FamilyHistoryValues) => void;
}) => {
  const dispatch = useAppDispatch();
  const open = useAppSelector((s) => s.dialog.AddFamilyHistory);

  const [values, setValues] = useState<FamilyHistoryValues>(initial());
  const [errors, setErrors] = useState<Errors>({});

  const set = <K extends keyof FamilyHistoryValues>(key: K, val: FamilyHistoryValues[K]) => {
    setValues((p) => ({ ...p, [key]: val }));
    setErrors((p) => ({ ...p, [key]: undefined }));
  };

  const handleClose = () => {
    dispatch(hideModal("AddFamilyHistory"));
    setValues(initial());
    setErrors({});
  };

  const handleSave = () => {
    const e: Errors = {};
    if (!values.condition) e.condition = "Please select a condition";
    if (!values.familyMember) e.familyMember = "Please select a family member";
    if (values.ageAtDiagnosis) {
      const age = Number(values.ageAtDiagnosis);
      if (!Number.isInteger(age) || age < 0 || age > 120) e.ageAtDiagnosis = "Enter an age between 0 and 120";
    }
    if (!values.status) e.status = "Please select a status";
    setErrors(e);
    if (Object.keys(e).length) return;

    // TODO: call your API here
    console.log("Family history saved:", values);
    onSave?.(values);
    handleClose();
  };

  return (
    <ModalShell
      open={open}
      onClose={handleClose}
      onSubmit={handleSave}
      title="Add Family History"
      subtitle="Add a family member's medical history to the patient's record."
      submitText="Save Family History"
    >
      <FormGrid>
        <SignupDropdown
          id="fh-condition"
          name="condition"
          label={<ReqLabel>Condition</ReqLabel>}
          icon={<Search className="h-4 w-4" />}
          placeholder="Search or select condition..."
          hint="Examples: Diabetes, Hypertension, Asthma, Cancer, etc."
          options={CONDITIONS}
          value={values.condition}
          onChange={(v) => set("condition", v)}
          error={errors.condition}
        />
        <SignupDropdown
          id="fh-member"
          name="familyMember"
          label={<ReqLabel>Family Member</ReqLabel>}
          placeholder="Select family member"
          searchable={false}
          options={FAMILY_MEMBERS}
          value={values.familyMember}
          onChange={(v) => set("familyMember", v)}
          error={errors.familyMember}
        />

        <SignupField
          name="relationDetails"
          label={<OptLabel>Relation Details</OptLabel>}
          placeholder="e.g. Paternal, Maternal"
          hint="Specify side of family if relevant."
          value={values.relationDetails}
          onChange={(e) => set("relationDetails", e.target.value)}
        />
        <SignupField
          name="ageAtDiagnosis"
          type="number"
          min={0}
          max={120}
          label={<OptLabel>Age at Diagnosis</OptLabel>}
          placeholder="Enter age"
          trailing={<span className="text-sm text-body">years</span>}
          value={values.ageAtDiagnosis}
          onChange={(e) => set("ageAtDiagnosis", e.target.value)}
          error={errors.ageAtDiagnosis}
        />

        <FullRow>
          <ModalRadioGroup
            name="fh-status"
            label={<ReqLabel>Status</ReqLabel>}
            options={STATUS_OPTIONS}
            value={values.status}
            onChange={(v) => set("status", v)}
            error={errors.status}
          />
        </FullRow>

        <FullRow>
          <ModalTextarea
            id="fh-notes"
            label={<OptLabel>Notes</OptLabel>}
            placeholder="Add any additional details (e.g. treatment, comments, etc.)"
            value={values.notes}
            onChange={(v) => set("notes", v)}
          />
        </FullRow>

        <FullRow>
          <AttachmentField
            title="Upload related documents (reports, family medical history, etc.)"
            file={values.attachment}
            onChange={(f) => set("attachment", f)}
          />
        </FullRow>
      </FormGrid>
    </ModalShell>
  );
};

export default AddFamilyHistoryModal;