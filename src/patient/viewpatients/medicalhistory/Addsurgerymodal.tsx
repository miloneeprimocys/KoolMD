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
  SignupField,
  OptLabel,
  ReqLabel,
  todayISO,
  toOptions,
} from "@/components/Modalshell";

/* ---------- Options ---------- */
const PROCEDURES = toOptions([
  "Appendectomy",
  "Tonsillectomy",
  "Knee Replacement",
  "Hip Replacement",
  "Cholecystectomy",
  "Hernia Repair",
  "Cesarean Section",
  "Cataract Surgery",
  "Coronary Bypass",
  "Spinal Fusion",
  "Thyroidectomy",
  "Hysterectomy",
]);
const SURGERY_TYPES = toOptions([
  "General",
  "Orthopedic",
  "ENT",
  "Cardiac",
  "Neurological",
  "Gynecological",
  "Ophthalmic",
  "Urological",
  "Other",
]);
const OUTCOMES = toOptions(["Successful", "Successful with complications", "Partially successful", "Unsuccessful"]);
const COMPLICATIONS = toOptions(["None", "Infection", "Bleeding", "Anesthesia reaction", "Delayed healing", "Other"]);

/* ---------- Form types ---------- */
export type SurgeryValues = {
  procedure: string;
  surgeryType: string;
  surgeryDate: string;
  surgeon: string;
  hospital: string;
  reason: string;
  outcome: string;
  complications: string;
  notes: string;
  attachment: File | null;
};
type Errors = Partial<Record<keyof SurgeryValues, string>>;

const initial = (): SurgeryValues => ({
  procedure: "",
  surgeryType: "",
  surgeryDate: "",
  surgeon: "",
  hospital: "",
  reason: "",
  outcome: "",
  complications: "",
  notes: "",
  attachment: null,
});

/* ---------- Component ---------- */
const AddSurgeryModal = ({
  onSave,
}: {
  onSave?: (values: SurgeryValues) => void;
}) => {
  const dispatch = useAppDispatch();
  const open = useAppSelector((s) => s.dialog.AddSurgery);

  const [values, setValues] = useState<SurgeryValues>(initial());
  const [errors, setErrors] = useState<Errors>({});

  const set = <K extends keyof SurgeryValues>(key: K, val: SurgeryValues[K]) => {
    setValues((p) => ({ ...p, [key]: val }));
    setErrors((p) => ({ ...p, [key]: undefined }));
  };

  const handleClose = () => {
    dispatch(hideModal("AddSurgery"));
    setValues(initial());
    setErrors({});
  };

  const handleSave = () => {
    const e: Errors = {};
    if (!values.procedure) e.procedure = "Please select a procedure";
    if (!values.surgeryDate) e.surgeryDate = "Date of surgery is required";
    else if (values.surgeryDate > todayISO()) e.surgeryDate = "Date cannot be in the future";
    if (!values.outcome) e.outcome = "Please select an outcome";
    setErrors(e);
    if (Object.keys(e).length) return;

    // TODO: call your API here
    console.log("Surgery saved:", values);
    onSave?.(values);
    handleClose();
  };

  return (
    <ModalShell
      open={open}
      onClose={handleClose}
      onSubmit={handleSave}
      title="Add Surgery"
      subtitle="Add a surgical procedure to the patient's record."
      submitText="Save Surgery"
    >
      <FormGrid>
        <SignupDropdown
          id="sg-procedure"
          name="procedure"
          label="Procedure / Surgery Name *"
          icon={<Search className="h-4 w-4" />}
          placeholder="Search or select procedure..."
          hint="Examples: Appendectomy, Tonsillectomy, Knee Replacement, etc."
          options={PROCEDURES}
          value={values.procedure}
          onChange={(v) => set("procedure", v)}
          error={errors.procedure}
        />
        <SignupDropdown
          id="sg-type"
          name="surgeryType"
          label="Surgery Type"
          placeholder="Select surgery type"
          hint="e.g. General, Orthopedic, ENT, Cardiac, etc."
          searchable={false}
          options={SURGERY_TYPES}
          value={values.surgeryType}
          onChange={(v) => set("surgeryType", v)}
        />

        <ModalDateField
          id="sg-date"
          label={<ReqLabel>Date of Surgery</ReqLabel>}
          value={values.surgeryDate}
          max={todayISO()}
          onChange={(v) => set("surgeryDate", v)}
          error={errors.surgeryDate}
        />
        <SignupField
          name="surgeon"
          label="Surgeon (Optional)"
          placeholder="Enter surgeon name"
          value={values.surgeon}
          onChange={(e) => set("surgeon", e.target.value)}
        />

        <SignupField
          name="hospital"
          label="Hospital / Facility (Optional)"
          placeholder="Enter hospital or clinic name"
          value={values.hospital}
          onChange={(e) => set("hospital", e.target.value)}
        />
        <SignupField
          name="reason"
          label="Reason for Surgery (Optional)"
          placeholder="E.g. chronic pain, infection, injury, etc."
          value={values.reason}
          onChange={(e) => set("reason", e.target.value)}
        />

        <SignupDropdown
          id="sg-outcome"
          name="outcome"
          label={<ReqLabel>Outcome / Status</ReqLabel>}
          placeholder="Select status"
          searchable={false}
          options={OUTCOMES}
          value={values.outcome}
          onChange={(v) => set("outcome", v)}
          error={errors.outcome}
        />
        <SignupDropdown
          id="sg-complications"
          name="complications"
          label={<OptLabel>Complications</OptLabel>}
          placeholder="Select option"
          searchable={false}
          options={COMPLICATIONS}
          value={values.complications}
          onChange={(v) => set("complications", v)}
        />

        <FullRow>
          <ModalTextarea
            id="sg-notes"
            label={<OptLabel>Notes</OptLabel>}
            placeholder="Add any additional details about the surgery (e.g. recovery, follow-up, etc.)"
            value={values.notes}
            onChange={(v) => set("notes", v)}
          />
        </FullRow>

        <FullRow>
          <AttachmentField
            title="Upload related documents (surgical report, discharge summary, etc.)"
            file={values.attachment}
            onChange={(f) => set("attachment", f)}
          />
        </FullRow>
      </FormGrid>
    </ModalShell>
  );
};

export default AddSurgeryModal;