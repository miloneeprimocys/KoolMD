"use client";

import React, { useState } from "react";
import ModalShell, {
  FormGrid,
  FullRow,
  ModalDateField,
  ModalRadioGroup,
  ModalTextarea,
  OptLabel,
  ReqLabel,
  SignupDropdown,
  SignupField,
  todayISO,
} from "@/components/Modalshell";
import { useAppDispatch } from "@/hooks/useAppHooks";
import { saveAllergy } from "@/redux/thunks/patientRecordsThunks";
import type {
  AllergyCategory,
  AllergyClinicalStatus,
  AllergySeverity,
  PatientAllergy,
} from "@/types/patient";
import { humanizeEnum } from "@/utils/formatters";

const toOptions = <T extends string>(values: T[]) =>
  values.map((value) => ({ value, label: humanizeEnum(value) }));

export const ALLERGY_CATEGORIES: AllergyCategory[] = ["MEDICATION", "FOOD", "ENVIRONMENTAL", "OTHER"];
const SEVERITIES: AllergySeverity[] = ["MILD", "MODERATE", "SEVERE", "UNKNOWN"];
const CLINICAL_STATUSES: AllergyClinicalStatus[] = ["ACTIVE", "INACTIVE", "RESOLVED"];

type FormValues = {
  allergen: string;
  category: AllergyCategory | "";
  severity: AllergySeverity;
  reaction: string;
  onsetDate: string;
  clinicalStatus: AllergyClinicalStatus;
  notes: string;
};
type FormErrors = Partial<Record<keyof FormValues, string>>;

const toFormValues = (allergy: PatientAllergy | null): FormValues => ({
  allergen: allergy?.allergen ?? "",
  category: allergy?.category ?? "",
  severity: allergy?.severity ?? "UNKNOWN",
  reaction: allergy?.reaction ?? "",
  onsetDate: allergy?.onsetDate ?? "",
  clinicalStatus: allergy?.clinicalStatus ?? "ACTIVE",
  notes: allergy?.notes ?? "",
});

interface AllergyModalProps {
  patientId: string;
  /** Allergy being edited; null records a new one. */
  allergy: PatientAllergy | null;
  onClose: () => void;
}

/**
 * Records or edits an allergy. The allergen and category are fixed once recorded (the API keeps
 * them for clinical safety); allergies are never deleted but marked Inactive or Resolved.
 * Mount only while open, with a `key` per allergy.
 */
const AllergyModal = ({ patientId, allergy, onClose }: AllergyModalProps) => {
  const dispatch = useAppDispatch();
  const isEdit = allergy !== null;
  const [values, setValues] = useState<FormValues>(() => toFormValues(allergy));
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const setField = <K extends keyof FormValues>(key: K, value: FormValues[K]) => {
    setValues((previous) => ({ ...previous, [key]: value }));
    setErrors((previous) => ({ ...previous, [key]: undefined }));
  };

  const validate = (): FormErrors => {
    const nextErrors: FormErrors = {};
    if (!isEdit) {
      if (!values.allergen.trim()) nextErrors.allergen = "Allergen is required.";
      if (!values.category) nextErrors.category = "Category is required.";
    }
    if (values.onsetDate && values.onsetDate > todayISO()) {
      nextErrors.onsetDate = "Onset date cannot be in the future.";
    }
    return nextErrors;
  };

  const handleClose = () => {
    if (!isSaving) onClose();
  };

  const handleSave = async () => {
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length) return;

    const reaction = values.reaction.trim();
    const notes = values.notes.trim();

    setIsSaving(true);
    setSaveError(null);
    const result = await dispatch(
      allergy
        ? saveAllergy({
            patientId,
            allergyId: allergy.id,
            payload: {
              severity: values.severity,
              clinicalStatus: values.clinicalStatus,
              reaction: reaction || null,
              onsetDate: values.onsetDate || null,
              notes: notes || null,
            },
          })
        : saveAllergy({
            patientId,
            payload: {
              allergen: values.allergen.trim(),
              category: values.category as AllergyCategory,
              severity: values.severity,
              ...(reaction ? { reaction } : {}),
              ...(values.onsetDate ? { onsetDate: values.onsetDate } : {}),
              ...(notes ? { notes } : {}),
            },
          }),
    );
    setIsSaving(false);

    if (saveAllergy.fulfilled.match(result)) {
      onClose();
      return;
    }
    const serverErrors: FormErrors = {};
    for (const [apiField, message] of Object.entries(result.payload?.fieldErrors ?? {})) {
      if (apiField in values) serverErrors[apiField as keyof FormValues] = message;
    }
    setErrors(serverErrors);
    setSaveError(result.payload?.message ?? "The allergy could not be saved.");
  };

  return (
    <ModalShell
      open
      onClose={handleClose}
      onSubmit={handleSave}
      title={isEdit ? "Edit Allergy" : "Add Allergy"}
      subtitle={isEdit ? `${allergy.allergen} · ${humanizeEnum(allergy.category)}` : "Record an allergy or adverse reaction."}
      submitText={isEdit ? "Save Changes" : "Add Allergy"}
      isSubmitting={isSaving}
      errorMessage={saveError}
    >
      <FormGrid>
        {!isEdit && (
          <>
            <SignupField
              name="allergen"
              label={<ReqLabel>Allergen</ReqLabel>}
              placeholder="e.g. Penicillin, Peanuts"
              value={values.allergen}
              onChange={(event) => setField("allergen", event.target.value)}
              error={errors.allergen}
              maxLength={200}
            />
            <SignupDropdown
              name="category"
              label={<ReqLabel>Category</ReqLabel>}
              placeholder="Select category"
              options={toOptions(ALLERGY_CATEGORIES)}
              value={values.category}
              onChange={(value) => setField("category", value as AllergyCategory)}
              error={errors.category}
              portalMenu
              portalMenuZIndex={1000}
            />
          </>
        )}
        <FullRow>
          <ModalRadioGroup
            name="severity"
            label={<ReqLabel>Severity</ReqLabel>}
            options={toOptions(SEVERITIES)}
            value={values.severity}
            onChange={(value) => setField("severity", value as AllergySeverity)}
            error={errors.severity}
            className="flex flex-wrap gap-x-5 gap-y-2"
          />
        </FullRow>
        <SignupField
          name="reaction"
          label={<OptLabel>Reaction</OptLabel>}
          placeholder="e.g. Hives, swelling"
          value={values.reaction}
          onChange={(event) => setField("reaction", event.target.value)}
          error={errors.reaction}
          maxLength={500}
        />
        <ModalDateField
          id="onsetDate"
          label={<OptLabel>Onset Date</OptLabel>}
          value={values.onsetDate}
          onChange={(value) => setField("onsetDate", value)}
          error={errors.onsetDate}
          max={todayISO()}
        />
        {isEdit && (
          <FullRow>
            <SignupDropdown
              name="clinicalStatus"
              label={<ReqLabel>Status</ReqLabel>}
              options={toOptions(CLINICAL_STATUSES)}
              value={values.clinicalStatus}
              onChange={(value) => setField("clinicalStatus", value as AllergyClinicalStatus)}
              portalMenu
              portalMenuZIndex={1000}
            />
          </FullRow>
        )}
        <FullRow>
          <ModalTextarea
            id="notes"
            label={<OptLabel>Notes</OptLabel>}
            placeholder="Anything the care team should know"
            value={values.notes}
            onChange={(value) => setField("notes", value)}
            error={errors.notes}
            maxLength={2000}
          />
        </FullRow>
      </FormGrid>
    </ModalShell>
  );
};

export default AllergyModal;
