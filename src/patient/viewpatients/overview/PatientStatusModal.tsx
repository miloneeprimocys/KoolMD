"use client";

import React, { useState } from "react";
import ModalShell, {
  ModalDateField,
  ModalRadioGroup,
  ModalTextarea,
  ReqLabel,
  todayISO,
} from "@/components/Modalshell";
import { useAppDispatch } from "@/hooks/useAppHooks";
import { changePatientStatus } from "@/redux/thunks/patientThunks";
import type { PatientDetail, PatientStatus } from "@/types/patient";

/** Same transitions the API allows. */
const NEXT_STATUSES: Record<PatientStatus, PatientStatus[]> = {
  ACTIVE: ["INACTIVE", "DECEASED"],
  INACTIVE: ["ACTIVE", "DECEASED"],
  DECEASED: ["ACTIVE"],
};
const STATUS_LABELS: Record<PatientStatus, string> = {
  ACTIVE: "Active (reactivate)",
  INACTIVE: "Inactive",
  DECEASED: "Deceased",
};

interface PatientStatusModalProps {
  patient: PatientDetail;
  onClose: () => void;
}

/**
 * Changes a patient's status with an audited reason. Marking a patient deceased needs the date
 * of death and signs out their online account. Mount only while open.
 */
const PatientStatusModal = ({ patient, onClose }: PatientStatusModalProps) => {
  const dispatch = useAppDispatch();
  const options = NEXT_STATUSES[patient.status];
  const [status, setStatus] = useState<PatientStatus>(options[0]);
  const [reason, setReason] = useState("");
  const [dateOfDeath, setDateOfDeath] = useState("");
  const [errors, setErrors] = useState<{ reason?: string; dateOfDeath?: string }>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const isDeceased = status === "DECEASED";

  const handleSave = async () => {
    const nextErrors: typeof errors = {};
    if (reason.trim().length < 3) nextErrors.reason = "Enter at least 3 characters.";
    if (isDeceased && !dateOfDeath) nextErrors.dateOfDeath = "Date of death is required.";
    else if (isDeceased && dateOfDeath > todayISO()) nextErrors.dateOfDeath = "Date cannot be in the future.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setIsSaving(true);
    setSaveError(null);
    const result = await dispatch(
      changePatientStatus({
        patientId: patient.id,
        payload: { status, reason: reason.trim(), ...(isDeceased ? { dateOfDeath } : {}) },
      }),
    );
    setIsSaving(false);
    if (changePatientStatus.fulfilled.match(result)) onClose();
    else setSaveError(result.payload?.message ?? "The status could not be changed.");
  };

  return (
    <ModalShell
      open
      onClose={() => !isSaving && onClose()}
      onSubmit={handleSave}
      title="Change Patient Status"
      subtitle={`Currently ${patient.status.toLowerCase()}. The reason is kept in the audit log.`}
      submitText="Change Status"
      isSubmitting={isSaving}
      errorMessage={saveError}
      width={520}
    >
      <ModalRadioGroup
        name="status"
        label={<ReqLabel>New Status</ReqLabel>}
        options={options.map((value) => ({ value, label: STATUS_LABELS[value] }))}
        value={status}
        onChange={(value) => setStatus(value as PatientStatus)}
        className="flex flex-wrap gap-x-5 gap-y-2"
      />
      {isDeceased && (
        <>
          <ModalDateField
            id="dateOfDeath"
            label={<ReqLabel>Date of Death</ReqLabel>}
            value={dateOfDeath}
            onChange={(value) => {
              setDateOfDeath(value);
              setErrors((previous) => ({ ...previous, dateOfDeath: undefined }));
            }}
            error={errors.dateOfDeath}
            max={todayISO()}
          />
          {patient.hasPortalAccount && (
            <p className="text-xs text-body">
              The patient&apos;s online account will be suspended and signed out.
            </p>
          )}
        </>
      )}
      <ModalTextarea
        id="reason"
        label={<ReqLabel>Reason</ReqLabel>}
        placeholder="Why the status is changing"
        value={reason}
        onChange={(value) => {
          setReason(value);
          setErrors((previous) => ({ ...previous, reason: undefined }));
        }}
        error={errors.reason}
        maxLength={1000}
      />
    </ModalShell>
  );
};

export default PatientStatusModal;
