"use client";

import React, { useState, type ReactNode } from "react";
import ModalShell, { ModalDateField, ModalTextarea, OptLabel, ReqLabel } from "@/components/Modalshell";

/** API rule for clinical status reasons. */
const MIN_REASON_LENGTH = 3;
const MAX_REASON_LENGTH = 1000;

interface ReasonModalProps {
  title: ReactNode;
  subtitle?: ReactNode;
  submitText: string;
  reasonLabel?: string;
  /** Adds an optional date field (e.g. the end date when stopping a medication). */
  dateLabel?: string;
  /** Latest selectable date, "YYYY-MM-DD". */
  maxDate?: string;
  /** Earliest selectable date, "YYYY-MM-DD". */
  minDate?: string;
  /** Resolves to an error message to show, or null when the change was saved. */
  onSubmit: (values: { reason: string; date: string }) => Promise<string | null>;
  onClose: () => void;
}

/**
 * Asks for the reason of a clinical status change (stop, entered in error, …). Records are never
 * deleted, so the reason is what explains the change in the chart. Mount only while open.
 */
const ReasonModal = ({
  title,
  subtitle,
  submitText,
  reasonLabel = "Reason",
  dateLabel,
  maxDate,
  minDate,
  onSubmit,
  onClose,
}: ReasonModalProps) => {
  const [reason, setReason] = useState("");
  const [date, setDate] = useState("");
  const [reasonError, setReasonError] = useState<string | undefined>();
  const [dateError, setDateError] = useState<string | undefined>();
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (reason.trim().length < MIN_REASON_LENGTH) {
      setReasonError(`Enter at least ${MIN_REASON_LENGTH} characters.`);
      return;
    }
    if (dateLabel && date && minDate && date < minDate) {
      setDateError("End date cannot be before the start date.");
      return;
    }
    if (dateLabel && date && maxDate && date > maxDate) {
      setDateError("End date cannot be in the future.");
      return;
    }
    setIsSaving(true);
    setSaveError(null);
    const errorMessage = await onSubmit({ reason: reason.trim(), date });
    setIsSaving(false);
    if (errorMessage) setSaveError(errorMessage);
    else onClose();
  };

  return (
    <ModalShell
      open
      onClose={() => !isSaving && onClose()}
      onSubmit={handleSubmit}
      title={title}
      subtitle={subtitle}
      submitText={submitText}
      isSubmitting={isSaving}
      errorMessage={saveError}
      width={520}
    >
      <ModalTextarea
        id="reason"
        label={<ReqLabel>{reasonLabel}</ReqLabel>}
        placeholder="Explain why, for the chart"
        value={reason}
        onChange={(value) => {
          setReason(value);
          setReasonError(undefined);
        }}
        error={reasonError}
        maxLength={MAX_REASON_LENGTH}
      />
      {dateLabel && (
        <ModalDateField
          id="reasonDate"
          label={<OptLabel>{dateLabel}</OptLabel>}
          value={date}
          onChange={(value) => {
            setDate(value);
            setDateError(undefined);
          }}
          error={dateError}
          max={maxDate}
          min={minDate}
        />
      )}
    </ModalShell>
  );
};

export default ReasonModal;
