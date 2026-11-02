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
import { useAppDispatch } from "@/hooks/useAppHooks";
import { changeMedication } from "@/redux/thunks/patientRecordsThunks";
import type { EditableMedicationStatus, MedicationStatement } from "@/types/patient";
import { humanizeEnum } from "@/utils/formatters";

const EDITABLE_STATUSES: EditableMedicationStatus[] = ["ACTIVE", "ON_HOLD", "COMPLETED"];
const STATUS_OPTIONS = EDITABLE_STATUSES.map((value) => ({ value, label: humanizeEnum(value) }));

type FormValues = {
  medicationName: string;
  dosageText: string;
  status: EditableMedicationStatus;
  startDate: string;
  endDate: string;
  note: string;
};
type FormErrors = Partial<Record<keyof FormValues, string>>;

const isEditableStatus = (status: string): status is EditableMedicationStatus =>
  (EDITABLE_STATUSES as string[]).includes(status);

const toFormValues = (statement: MedicationStatement | null): FormValues => ({
  medicationName: statement?.medicationName ?? "",
  dosageText: statement?.dosageText ?? "",
  status: statement && isEditableStatus(statement.status) ? statement.status : "ACTIVE",
  startDate: statement?.startDate ?? "",
  endDate: statement?.endDate ?? "",
  note: statement?.note ?? "",
});

interface MedicationModalProps {
  patientId: string;
  /** Entry being edited; null adds a new one. */
  statement: MedicationStatement | null;
  onClose: () => void;
}

/**
 * Adds a medication the patient takes, or edits an entry. The name is fixed once recorded, and a
 * prescribed entry's dosage can only change through a new prescription. Mount only while open.
 */
const MedicationModal = ({ patientId, statement, onClose }: MedicationModalProps) => {
  const dispatch = useAppDispatch();
  const isEdit = statement !== null;
  const isPrescribed = statement?.medicationRequestId != null;
  const [values, setValues] = useState<FormValues>(() => toFormValues(statement));
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const setField = <K extends keyof FormValues>(key: K, value: FormValues[K]) => {
    setValues((previous) => ({ ...previous, [key]: value }));
    setErrors((previous) => ({ ...previous, [key]: undefined }));
  };

  const validate = (): FormErrors => {
    const nextErrors: FormErrors = {};
    if (!isEdit && values.medicationName.trim().length < 2) {
      nextErrors.medicationName = "Enter the medication name (at least 2 characters).";
    }
    if (values.startDate && values.startDate > todayISO()) {
      nextErrors.startDate = "Start date cannot be in the future.";
    }
    if (values.startDate && values.endDate && values.endDate < values.startDate) {
      nextErrors.endDate = "End date cannot be before the start date.";
    }
    return nextErrors;
  };

  const handleSave = async () => {
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length) return;

    const dosageText = values.dosageText.trim();
    const note = values.note.trim();

    setIsSaving(true);
    setSaveError(null);
    const result = await dispatch(
      statement
        ? changeMedication({
            patientId,
            kind: "update",
            statementId: statement.id,
            payload: {
              ...(isPrescribed ? {} : { dosageText: dosageText || null }),
              status: values.status,
              startDate: values.startDate || null,
              endDate: values.endDate || null,
              note: note || null,
            },
          })
        : changeMedication({
            patientId,
            kind: "create",
            payload: {
              medicationName: values.medicationName.trim(),
              ...(dosageText ? { dosageText } : {}),
              ...(values.startDate ? { startDate: values.startDate } : {}),
              ...(note ? { note } : {}),
            },
          }),
    );
    setIsSaving(false);

    if (changeMedication.fulfilled.match(result)) {
      onClose();
      return;
    }
    const serverErrors: FormErrors = {};
    for (const [apiField, message] of Object.entries(result.payload?.fieldErrors ?? {})) {
      if (apiField in values) serverErrors[apiField as keyof FormValues] = message;
    }
    setErrors(serverErrors);
    setSaveError(result.payload?.message ?? "The medication could not be saved.");
  };

  return (
    <ModalShell
      open
      onClose={() => !isSaving && onClose()}
      onSubmit={handleSave}
      title={isEdit ? "Edit Medication" : "Add Medication"}
      subtitle={isEdit ? statement.medicationName : "A medication the patient currently takes."}
      submitText={isEdit ? "Save Changes" : "Add Medication"}
      isSubmitting={isSaving}
      errorMessage={saveError}
    >
      <FormGrid>
        {!isEdit && (
          <FullRow>
            <SignupField
              name="medicationName"
              label={<ReqLabel>Medication</ReqLabel>}
              placeholder="e.g. Vitamin D3 1000 IU"
              value={values.medicationName}
              onChange={(event) => setField("medicationName", event.target.value)}
              error={errors.medicationName}
              maxLength={300}
            />
          </FullRow>
        )}
        <FullRow>
          <SignupField
            name="dosageText"
            label={<OptLabel>Dosage & Frequency</OptLabel>}
            placeholder="e.g. 1 tablet by mouth once daily"
            value={values.dosageText}
            onChange={(event) => setField("dosageText", event.target.value)}
            error={errors.dosageText}
            hint={isPrescribed ? "Prescribed dosage changes need a new prescription." : undefined}
            disabled={isPrescribed}
            maxLength={1000}
          />
        </FullRow>
        {isEdit && (
          <FullRow>
            <SignupDropdown
              name="status"
              label={<ReqLabel>Status</ReqLabel>}
              options={STATUS_OPTIONS}
              value={values.status}
              onChange={(value) => setField("status", value as EditableMedicationStatus)}
              portalMenu
              portalMenuZIndex={1000}
            />
          </FullRow>
        )}
        <ModalDateField
          id="startDate"
          label={<OptLabel>Start Date</OptLabel>}
          value={values.startDate}
          onChange={(value) => setField("startDate", value)}
          error={errors.startDate}
          max={todayISO()}
        />
        {isEdit ? (
          <ModalDateField
            id="endDate"
            label={<OptLabel>End Date</OptLabel>}
            value={values.endDate}
            onChange={(value) => setField("endDate", value)}
            error={errors.endDate}
            min={values.startDate || undefined}
          />
        ) : (
          <div className="hidden sm:block" />
        )}
        <FullRow>
          <ModalTextarea
            id="note"
            label={<OptLabel>Note</OptLabel>}
            placeholder="Anything the care team should know"
            value={values.note}
            onChange={(value) => setField("note", value)}
            error={errors.note}
            maxLength={2000}
          />
        </FullRow>
      </FormGrid>
    </ModalShell>
  );
};

export default MedicationModal;
