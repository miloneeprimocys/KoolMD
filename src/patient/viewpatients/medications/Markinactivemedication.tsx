"use client";

import React, { useEffect, useState } from "react";

import ImportButton from "@/components/ImportButton";
import DeleteButton from "@/components/DeleteButton";
import ModalShell, {
  ModalDateField,
  ModalTextarea,
  OptLabel,
  ReqLabel,
  SignupDropdown,
  todayISO,
  toOptions,
} from "@/components/Modalshell";
import { MedicationSummary, type Medication } from "./ViewMedication";

/* ---------- Options ---------- */
const REASONS = toOptions([
  "Completed course",
  "Improved condition",
  "Side effects",
  "Ineffective",
  "Patient stopped",
  "Other",
]);

export type StopMedicationData = {
  stopDate: string;
  reason: string;
  notes: string;
};
type Errors = Partial<Record<keyof StopMedicationData, string>>;

const initial = (): StopMedicationData => ({ stopDate: todayISO(), reason: "", notes: "" });

type Props = {
  open: boolean;
  onClose: () => void;
  medication: Medication | null;
  /** Called with the form data – move the medication to "Past Medications" here. */
  onConfirm?: (id: string, data: StopMedicationData) => void;
};

const MarkInactiveMedication = ({ open, onClose, medication, onConfirm }: Props) => {
  const [values, setValues] = useState<StopMedicationData>(initial());
  const [errors, setErrors] = useState<Errors>({});

  /* Fresh form every time the modal opens */
  useEffect(() => {
    if (open) {
      setValues(initial());
      setErrors({});
    }
  }, [open, medication?.id]);

  if (!medication) return null;

  const set = <K extends keyof StopMedicationData>(key: K, val: StopMedicationData[K]) => {
    setValues((p) => ({ ...p, [key]: val }));
    setErrors((p) => ({ ...p, [key]: undefined }));
  };

  const handleConfirm = () => {
    const e: Errors = {};
    if (!values.stopDate) e.stopDate = "Stop date is required";
    else if (medication.startDate && values.stopDate < medication.startDate)
      e.stopDate = "Stop date cannot be before the start date";
    if (!values.reason) e.reason = "Select a reason for discontinuation";
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    // TODO: call your mark-inactive API here
    onConfirm?.(medication.id, values);
    onClose();
  };

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title="Stop / Inactivate Medication"
      subtitle="This will mark the medication as inactive in the current medications list."
      width={760}
      footer={
        <div className="flex items-center justify-center gap-3 sm:justify-end">
          <ImportButton text="Cancel" icon={null} onClick={onClose} />
          <DeleteButton text="Mark as Inactive" icon={null} onClick={handleConfirm} className="sm:w-auto sm:min-w-[160px]" />
        </div>
      }
    >
      <MedicationSummary medication={medication} />

      <ModalDateField
        id="med-stop-date"
        label={<ReqLabel>Stop Date</ReqLabel>}
        value={values.stopDate}
        min={medication.startDate || undefined}
        onChange={(v) => set("stopDate", v)}
        error={errors.stopDate}
      />

      <SignupDropdown
        name="reason"
        label={<ReqLabel>Reason for Discontinuation</ReqLabel>}
        placeholder="Select reason"
        searchable={false}
        options={REASONS}
        value={values.reason}
        onChange={(v) => set("reason", v)}
        error={errors.reason}
        portalMenu
        portalMenuZIndex={1000}
      />

      <ModalTextarea
        id="med-stop-notes"
        label={<OptLabel>Notes</OptLabel>}
        placeholder="Add any additional notes..."
        value={values.notes}
        onChange={(v) => set("notes", v)}
        maxLength={250}
      />
    </ModalShell>
  );
};

export default MarkInactiveMedication;