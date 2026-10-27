"use client";

import React, { useState } from "react";
import { Info } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppHooks";
import { hideModal } from "@/redux/slices/dialogslice";

import RadioCheckButtonh from "@/components/RadioCheckButtonh";
import InputActions from "@/components/InputActions";
import { FieldError } from "@/components/SignupField";
import ModalShell, {
  AttachmentField,
  FormGrid,
  FullRow,
  ModalDateField,
  ModalSection,
  OptLabel,
  ReqLabel,
  SignupDropdown,
  SignupField,
  todayISO,
  toOptions,
} from "@/components/Modalshell";

/* ---------- Options ---------- */
const PROVIDERS = toOptions(["Dr. Sarah Lee", "Dr. James Wilson", "Dr. Emily Davis", "Dr. Michael Brown"]);
const NOTE_TYPES = toOptions(["Follow-up Visit", "Progress Note", "Consultation", "Phone Call", "Procedure Note", "Other"]);
const VISIBILITY = toOptions(["Visible to all care providers", "Visible to me only", "Visible to my team"]);

/* ---------- Form types ---------- */
export type ClinicalNoteValues = {
  date: string;
  provider: string;
  noteType: string;
  subject: string;
  details: string;
  attachment: File | null;
  visibility: string;
  important: boolean;
};
type Errors = Partial<Record<keyof ClinicalNoteValues, string>>;

const initial = (): ClinicalNoteValues => ({
  date: todayISO(),
  provider: "Dr. Sarah Lee",
  noteType: "Follow-up Visit",
  subject: "",
  details: "",
  attachment: null,
  visibility: "Visible to all care providers",
  important: false,
});

interface AddClinicalNoteModalProps {
  open?: boolean;
  onClose?: () => void;
  onSave?: (values: ClinicalNoteValues) => void;
}

/* ---------- Component ---------- */
const AddClinicalNoteModal = ({
  open: propOpen,
  onClose: propOnClose,
  onSave,
}: AddClinicalNoteModalProps) => {
  const dispatch = useAppDispatch();
  const reduxOpen = useAppSelector((s) => s.dialog.AddClinicalNote);
  const open = propOpen !== undefined ? propOpen : reduxOpen;

  const [values, setValues] = useState<ClinicalNoteValues>(initial());
  const [errors, setErrors] = useState<Errors>({});

  const set = <K extends keyof ClinicalNoteValues>(key: K, val: ClinicalNoteValues[K]) => {
    setValues((p) => ({ ...p, [key]: val }));
    setErrors((p) => ({ ...p, [key]: undefined }));
  };

  const handleClose = () => {
    if (propOnClose) {
      propOnClose();
    } else {
      dispatch(hideModal("AddClinicalNote"));
    }
    setValues(initial());
    setErrors({});
  };

  const handleSave = () => {
    const e: Errors = {};
    if (!values.date) e.date = "Date is required";
    else if (values.date > todayISO()) e.date = "Date cannot be in the future";
    if (!values.provider) e.provider = "Select a provider";
    if (!values.noteType) e.noteType = "Select a note type";
    const textOnly = values.details.replace(/<[^>]*>/g, "").trim();
    if (!textOnly) e.details = "Note details are required";
    setErrors(e);
    if (Object.keys(e).length) return;

    // TODO: call your API here
    console.log("Clinical note saved:", values);
    onSave?.(values);
    handleClose();
  };

  return (
    <ModalShell
      open={open}
      onClose={handleClose}
      onSubmit={handleSave}
      title="Clinical Notes"
      subtitle="Add, view and manage clinical notes for this patient."
      submitText="Save Note"
      width={760}
    >
      <ModalSection title="Add Clinical Note">
        <div className="space-y-3">
          <div className="grid gap-x-4 gap-y-3 sm:grid-cols-3">
            <ModalDateField
              id="cn-date"
              label={<ReqLabel>Date</ReqLabel>}
              value={values.date}
              max={todayISO()}
              onChange={(v) => set("date", v)}
              error={errors.date}
            />
            <SignupDropdown
              name="provider"
              label={<ReqLabel>Provider</ReqLabel>}
              placeholder="Select provider"
              searchable={false}
              options={PROVIDERS}
              value={values.provider}
              onChange={(v) => set("provider", v)}
              error={errors.provider}
              portalMenu
              portalMenuZIndex={1000}
            />
            <SignupDropdown
              name="noteType"
              label={<ReqLabel>Note Type</ReqLabel>}
              placeholder="Select note type"
              searchable={false}
              options={NOTE_TYPES}
              value={values.noteType}
              onChange={(v) => set("noteType", v)}
              error={errors.noteType}
              portalMenu
              portalMenuZIndex={1000}
            />
          </div>

          <SignupField
            name="subject"
            label={<OptLabel>Subject</OptLabel>}
            placeholder="Enter note subject (optional)"
            value={values.subject}
            onChange={(e) => set("subject", e.target.value)}
          />

          {/* Rich text editor using InputActions */}
          <div className="w-full">
            <p className="mb-2 text-sm font-medium text-label">
              <ReqLabel>Note Details</ReqLabel>
            </p>
            <InputActions
              value={values.details}
              onChange={(v) => set("details", v)}
              placeholder="Enter clinical note details here..."
              rows={4}
              image={false}
            />
            <FieldError message={errors.details} />
          </div>

          <FormGrid>
            <AttachmentField
              title="Click to upload or drag and drop (PDF, JPG, PNG, Max 10 MB)"
              file={values.attachment}
              onChange={(f) => set("attachment", f)}
            />
            <div className="space-y-3">
              <SignupDropdown
                name="visibility"
                label="Visibility"
                placeholder="Select visibility"
                searchable={false}
                options={VISIBILITY}
                value={values.visibility}
                onChange={(v) => set("visibility", v)}
                portalMenu
                portalMenuZIndex={1000}
              />
              <label className="flex w-fit cursor-pointer items-center gap-2 text-sm text-heading">
                <RadioCheckButtonh
                  type="checkbox"
                  checked={values.important}
                  onChange={(e) => set("important", e.target.checked)}
                />
                Mark as important
                <Info className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
              </label>
            </div>
          </FormGrid>
        </div>
      </ModalSection>
    </ModalShell>
  );
};

export default AddClinicalNoteModal;