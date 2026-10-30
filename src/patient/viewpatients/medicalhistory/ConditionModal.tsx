"use client";

import React, { useState } from "react";
import ModalShell, {
  FormGrid,
  FullRow,
  ModalDateField,
  ModalTextarea,
  OptLabel,
  ReqLabel,
  SignupDropdown,
  SignupField,
  todayISO,
} from "@/components/Modalshell";
import type {
  ConditionClinicalStatus,
  ConditionVerificationStatus,
  PatientCondition,
} from "@/types/patient";
import { humanizeEnum } from "@/utils/formatters";
import { useHistoryChange } from "./useHistoryChange";

/** Same rule as the API (ICD-10-CM, e.g. E11.9). */
const ICD10_PATTERN = /^[A-TV-Z][0-9][0-9AB](\.[0-9A-TV-Z]{1,4})?$/;

const toOptions = <T extends string>(values: T[]) =>
  values.map((value) => ({ value, label: humanizeEnum(value) }));
const CLINICAL_STATUSES: ConditionClinicalStatus[] = ["ACTIVE", "RESOLVED", "INACTIVE"];
const OPEN_VERIFICATION: ConditionVerificationStatus[] = ["CONFIRMED", "PROVISIONAL"];
const ALL_VERIFICATION: ConditionVerificationStatus[] = [...OPEN_VERIFICATION, "REFUTED", "ENTERED_IN_ERROR"];

interface ConditionModalProps {
  patientId: string;
  /** Condition being edited; null adds one to the problem list. */
  condition: PatientCondition | null;
  onClose: () => void;
}

/**
 * Adds a problem-list entry (ICD-10-CM) or updates its status. The code and name are fixed once
 * recorded; a wrong entry is set to "Entered in error" rather than deleted. Mount only while open.
 */
const ConditionModal = ({ patientId, condition, onClose }: ConditionModalProps) => {
  const isEdit = condition !== null;
  const { save, isSaving, saveError, fieldErrors } = useHistoryChange();
  const [code, setCode] = useState(condition?.code ?? "");
  const [display, setDisplay] = useState(condition?.display ?? "");
  const [clinicalStatus, setClinicalStatus] = useState<ConditionClinicalStatus>(
    condition?.clinicalStatus ?? "ACTIVE",
  );
  const [verificationStatus, setVerificationStatus] = useState<ConditionVerificationStatus>(
    condition?.verificationStatus ?? "CONFIRMED",
  );
  const [onsetDate, setOnsetDate] = useState(condition?.onsetDate ?? "");
  const [abatementDate, setAbatementDate] = useState(condition?.abatementDate ?? "");
  const [note, setNote] = useState(condition?.note ?? "");
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!isEdit) {
      if (!ICD10_PATTERN.test(code.trim().toUpperCase())) {
        nextErrors.code = "Enter an ICD-10-CM code, e.g. E11.9.";
      }
      if (!display.trim()) nextErrors.display = "Condition name is required.";
    }
    if (onsetDate && onsetDate > todayISO()) nextErrors.onsetDate = "Onset date cannot be in the future.";
    if (abatementDate && onsetDate && abatementDate < onsetDate) {
      nextErrors.abatementDate = "Resolved date cannot be before the onset date.";
    }
    return nextErrors;
  };

  const handleSave = async () => {
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length) return;

    const trimmedNote = note.trim();
    const saved = condition
      ? await save({
          patientId,
          kind: "updateCondition",
          entryId: condition.id,
          payload: {
            clinicalStatus,
            verificationStatus,
            onsetDate: onsetDate || null,
            // Left empty when resolving: the API fills in today.
            ...(abatementDate ? { abatementDate } : clinicalStatus === "RESOLVED" ? {} : { abatementDate: null }),
            note: trimmedNote || null,
          },
        })
      : await save({
          patientId,
          kind: "createCondition",
          payload: {
            code: code.trim().toUpperCase(),
            display: display.trim(),
            verificationStatus: verificationStatus === "PROVISIONAL" ? "PROVISIONAL" : "CONFIRMED",
            ...(onsetDate ? { onsetDate } : {}),
            ...(trimmedNote ? { note: trimmedNote } : {}),
          },
        });
    if (saved) onClose();
  };

  const errorFor = (field: string) => errors[field] ?? fieldErrors[field];

  return (
    <ModalShell
      open
      onClose={() => !isSaving && onClose()}
      onSubmit={handleSave}
      title={isEdit ? "Update Condition" : "Add Condition"}
      subtitle={isEdit ? `${condition.display} (${condition.code})` : "Add an entry to the problem list."}
      submitText={isEdit ? "Save Changes" : "Add Condition"}
      isSubmitting={isSaving}
      errorMessage={saveError}
    >
      <FormGrid>
        {!isEdit && (
          <>
            <SignupField
              name="code"
              label={<ReqLabel>ICD-10-CM Code</ReqLabel>}
              placeholder="e.g. E11.9"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              error={errorFor("code")}
              maxLength={8}
            />
            <SignupField
              name="display"
              label={<ReqLabel>Condition</ReqLabel>}
              placeholder="e.g. Type 2 diabetes mellitus"
              value={display}
              onChange={(event) => setDisplay(event.target.value)}
              error={errorFor("display")}
              maxLength={300}
            />
          </>
        )}
        {isEdit && (
          <SignupDropdown
            name="clinicalStatus"
            label={<ReqLabel>Clinical Status</ReqLabel>}
            options={toOptions(CLINICAL_STATUSES)}
            value={clinicalStatus}
            onChange={(value) => setClinicalStatus(value as ConditionClinicalStatus)}
            portalMenu
            portalMenuZIndex={1000}
          />
        )}
        <SignupDropdown
          name="verificationStatus"
          label={<ReqLabel>Verification</ReqLabel>}
          options={toOptions(isEdit ? ALL_VERIFICATION : OPEN_VERIFICATION)}
          value={verificationStatus}
          onChange={(value) => setVerificationStatus(value as ConditionVerificationStatus)}
          portalMenu
          portalMenuZIndex={1000}
        />
        <ModalDateField
          id="onsetDate"
          label={<OptLabel>Onset Date</OptLabel>}
          value={onsetDate}
          onChange={setOnsetDate}
          error={errorFor("onsetDate")}
          max={todayISO()}
        />
        {isEdit ? (
          <ModalDateField
            id="abatementDate"
            label={<OptLabel>Resolved Date</OptLabel>}
            value={abatementDate}
            onChange={setAbatementDate}
            error={errorFor("abatementDate")}
            min={onsetDate || undefined}
            max={todayISO()}
          />
        ) : (
          <div className="hidden sm:block" />
        )}
        <FullRow>
          <ModalTextarea
            id="note"
            label={<OptLabel>Note</OptLabel>}
            value={note}
            onChange={setNote}
            error={errorFor("note")}
            maxLength={2000}
          />
        </FullRow>
      </FormGrid>
    </ModalShell>
  );
};

export default ConditionModal;
