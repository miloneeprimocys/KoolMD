"use client";

import React, { useState } from "react";
import ModalShell, {
  FormGrid,
  FullRow,
  ModalDateField,
  ModalTextarea,
  OptLabel,
  ReqLabel,
  SignupField,
  todayISO,
} from "@/components/Modalshell";
import type { SurgicalHistoryEntry } from "@/types/patient";
import { useHistoryChange } from "./useHistoryChange";

type FormValues = {
  procedureName: string;
  performedDate: string;
  surgeonName: string;
  facilityName: string;
  reason: string;
  outcome: string;
  complications: string;
  note: string;
};

const toFormValues = (entry: SurgicalHistoryEntry | null): FormValues => ({
  procedureName: entry?.procedureName ?? "",
  performedDate: entry?.performedDate ?? "",
  surgeonName: entry?.surgeonName ?? "",
  facilityName: entry?.facilityName ?? "",
  reason: entry?.reason ?? "",
  outcome: entry?.outcome ?? "",
  complications: entry?.complications ?? "",
  note: entry?.note ?? "",
});

const OPTIONAL_TEXT_FIELDS: { key: Exclude<keyof FormValues, "procedureName" | "performedDate" | "note">; label: string; placeholder: string; maxLength: number }[] = [
  { key: "surgeonName", label: "Surgeon", placeholder: "e.g. Dr. Grey", maxLength: 200 },
  { key: "facilityName", label: "Hospital / Facility", placeholder: "e.g. General Hospital", maxLength: 200 },
  { key: "reason", label: "Reason", placeholder: "e.g. Acute appendicitis", maxLength: 500 },
  { key: "outcome", label: "Outcome", placeholder: "e.g. Full recovery", maxLength: 500 },
  { key: "complications", label: "Complications", placeholder: "e.g. None", maxLength: 500 },
];

interface SurgeryModalProps {
  patientId: string;
  /** Entry being edited; null records a new one. */
  entry: SurgicalHistoryEntry | null;
  onClose: () => void;
}

/** Records or corrects a past surgery. Mount only while open, with a `key` per entry. */
const SurgeryModal = ({ patientId, entry, onClose }: SurgeryModalProps) => {
  const { save, isSaving, saveError, fieldErrors } = useHistoryChange();
  const [values, setValues] = useState<FormValues>(() => toFormValues(entry));
  const [errors, setErrors] = useState<Partial<Record<keyof FormValues, string>>>({});

  const setField = (key: keyof FormValues, value: string) => {
    setValues((previous) => ({ ...previous, [key]: value }));
    setErrors((previous) => ({ ...previous, [key]: undefined }));
  };

  const handleSave = async () => {
    const nextErrors: Partial<Record<keyof FormValues, string>> = {};
    if (!values.procedureName.trim()) nextErrors.procedureName = "Procedure is required.";
    if (values.performedDate && values.performedDate > todayISO()) {
      nextErrors.performedDate = "Date cannot be in the future.";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    // Empty optional fields are cleared on edit (null) and left out when creating.
    const optional = (value: string) => value.trim() || (entry ? null : undefined);
    const payload = {
      procedureName: values.procedureName.trim(),
      performedDate: values.performedDate || (entry ? null : undefined),
      surgeonName: optional(values.surgeonName),
      facilityName: optional(values.facilityName),
      reason: optional(values.reason),
      outcome: optional(values.outcome),
      complications: optional(values.complications),
      note: optional(values.note),
    };
    const saved = entry
      ? await save({ patientId, kind: "updateEntry", section: "surgicalHistory", entryId: entry.id, payload })
      : await save({ patientId, kind: "createEntry", section: "surgicalHistory", payload });
    if (saved) onClose();
  };

  const errorFor = (field: keyof FormValues) => errors[field] ?? fieldErrors[field];

  return (
    <ModalShell
      open
      onClose={() => !isSaving && onClose()}
      onSubmit={handleSave}
      title={entry ? "Edit Surgery" : "Add Surgery"}
      subtitle="A past surgery or procedure."
      submitText={entry ? "Save Changes" : "Add Surgery"}
      isSubmitting={isSaving}
      errorMessage={saveError}
    >
      <FormGrid>
        <SignupField
          name="procedureName"
          label={<ReqLabel>Procedure</ReqLabel>}
          placeholder="e.g. Appendectomy"
          value={values.procedureName}
          onChange={(event) => setField("procedureName", event.target.value)}
          error={errorFor("procedureName")}
          maxLength={300}
        />
        <ModalDateField
          id="performedDate"
          label={<OptLabel>Date</OptLabel>}
          value={values.performedDate}
          onChange={(value) => setField("performedDate", value)}
          error={errorFor("performedDate")}
          max={todayISO()}
        />
        {OPTIONAL_TEXT_FIELDS.map((field) => (
          <SignupField
            key={field.key}
            name={field.key}
            label={<OptLabel>{field.label}</OptLabel>}
            placeholder={field.placeholder}
            value={values[field.key]}
            onChange={(event) => setField(field.key, event.target.value)}
            error={errorFor(field.key)}
            maxLength={field.maxLength}
          />
        ))}
        <FullRow>
          <ModalTextarea
            id="note"
            label={<OptLabel>Notes</OptLabel>}
            value={values.note}
            onChange={(value) => setField("note", value)}
            error={errorFor("note")}
            maxLength={2000}
          />
        </FullRow>
      </FormGrid>
    </ModalShell>
  );
};

export default SurgeryModal;
