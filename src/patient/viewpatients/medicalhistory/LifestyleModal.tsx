"use client";

import React, { useState } from "react";
import ModalShell, {
  FormGrid,
  FullRow,
  ModalRadioGroup,
  ModalTextarea,
  OptLabel,
  ReqLabel,
  SignupDropdown,
  SignupField,
} from "@/components/Modalshell";
import type {
  AlcoholFrequency,
  AlcoholUse,
  ExerciseFrequency,
  MaritalStatus,
  SocialHistory,
  SocialHistoryPayload,
  TobaccoUse,
} from "@/types/patient";
import { humanizeEnum } from "@/utils/formatters";
import { useHistoryChange } from "./useHistoryChange";

export const TOBACCO_LABELS: Record<TobaccoUse, string> = {
  NEVER: "Never smoked",
  FORMER: "Former smoker",
  CURRENT: "Current smoker",
  UNKNOWN: "Unknown",
};
export const ALCOHOL_LABELS: Record<AlcoholUse, string> = {
  NONE: "Does not drink",
  OCCASIONAL: "Occasional",
  REGULAR: "Regular",
  UNKNOWN: "Unknown",
};
export const EXERCISE_LABELS: Record<ExerciseFrequency, string> = {
  NONE: "Does not exercise",
  ONE_TO_TWO_PER_WEEK: "1–2 times per week",
  THREE_TO_FOUR_PER_WEEK: "3–4 times per week",
  FIVE_OR_MORE_PER_WEEK: "5+ times per week",
};
const ALCOHOL_FREQUENCIES: AlcoholFrequency[] = ["DAILY", "WEEKLY", "MONTHLY", "SPECIAL_OCCASIONS"];
const MARITAL_STATUSES: MaritalStatus[] = [
  "SINGLE",
  "MARRIED",
  "DOMESTIC_PARTNER",
  "SEPARATED",
  "DIVORCED",
  "WIDOWED",
  "UNKNOWN",
];

const optionsFrom = <T extends string>(labels: Record<T, string>) =>
  (Object.keys(labels) as T[]).map((value) => ({ value, label: labels[value] }));
const withNone = (options: { value: string; label: string }[]) => [{ value: "", label: "Not recorded" }, ...options];

type FormValues = {
  tobaccoUse: TobaccoUse;
  packsPerDay: string;
  tobaccoYears: string;
  alcoholUse: AlcoholUse;
  alcoholFrequency: AlcoholFrequency | "";
  drinksPerOccasion: string;
  exerciseFrequency: ExerciseFrequency | "";
  diet: string;
  occupation: string;
  maritalStatus: MaritalStatus | "";
  note: string;
};

const toFormValues = (socialHistory: SocialHistory | null): FormValues => ({
  tobaccoUse: socialHistory?.tobaccoUse ?? "UNKNOWN",
  packsPerDay: socialHistory?.packsPerDay?.toString() ?? "",
  tobaccoYears: socialHistory?.tobaccoYears?.toString() ?? "",
  alcoholUse: socialHistory?.alcoholUse ?? "UNKNOWN",
  alcoholFrequency: socialHistory?.alcoholFrequency ?? "",
  drinksPerOccasion: socialHistory?.drinksPerOccasion?.toString() ?? "",
  exerciseFrequency: socialHistory?.exerciseFrequency ?? "",
  diet: socialHistory?.diet ?? "",
  occupation: socialHistory?.occupation ?? "",
  maritalStatus: socialHistory?.maritalStatus ?? "",
  note: socialHistory?.note ?? "",
});

interface LifestyleModalProps {
  patientId: string;
  socialHistory: SocialHistory | null;
  onClose: () => void;
}

/**
 * Edits the patient's lifestyle record. Saving replaces the whole record, so every field is
 * sent; smoking and drinking details only apply to smokers and drinkers. Mount only while open.
 */
const LifestyleModal = ({ patientId, socialHistory, onClose }: LifestyleModalProps) => {
  const { save, isSaving, saveError, fieldErrors } = useHistoryChange();
  const [values, setValues] = useState<FormValues>(() => toFormValues(socialHistory));
  const [errors, setErrors] = useState<Partial<Record<keyof FormValues, string>>>({});
  const smokes = values.tobaccoUse === "CURRENT" || values.tobaccoUse === "FORMER";
  const drinks = values.alcoholUse === "OCCASIONAL" || values.alcoholUse === "REGULAR";

  const setField = <K extends keyof FormValues>(key: K, value: FormValues[K]) => {
    setValues((previous) => ({ ...previous, [key]: value }));
    setErrors((previous) => ({ ...previous, [key]: undefined }));
  };

  /** Parses an optional number field; returns undefined when empty, NaN when invalid. */
  const numberOrUndefined = (value: string) => (value.trim() === "" ? undefined : Number(value));

  const handleSave = async () => {
    const nextErrors: Partial<Record<keyof FormValues, string>> = {};
    const packsPerDay = smokes ? numberOrUndefined(values.packsPerDay) : undefined;
    const tobaccoYears = smokes ? numberOrUndefined(values.tobaccoYears) : undefined;
    const drinksPerOccasion = drinks ? numberOrUndefined(values.drinksPerOccasion) : undefined;
    if (packsPerDay !== undefined && !(packsPerDay > 0 && packsPerDay <= 20)) {
      nextErrors.packsPerDay = "Enter 0.1 to 20.";
    }
    if (tobaccoYears !== undefined && !(Number.isInteger(tobaccoYears) && tobaccoYears >= 0 && tobaccoYears <= 120)) {
      nextErrors.tobaccoYears = "Enter whole years, 0 to 120.";
    }
    if (drinksPerOccasion !== undefined && !(Number.isInteger(drinksPerOccasion) && drinksPerOccasion >= 1 && drinksPerOccasion <= 50)) {
      nextErrors.drinksPerOccasion = "Enter 1 to 50.";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    const text = (value: string) => value.trim() || undefined;
    const payload: SocialHistoryPayload = {
      tobaccoUse: values.tobaccoUse,
      alcoholUse: values.alcoholUse,
      ...(packsPerDay !== undefined ? { packsPerDay: Math.round(packsPerDay * 10) / 10 } : {}),
      ...(tobaccoYears !== undefined ? { tobaccoYears } : {}),
      ...(drinks && values.alcoholFrequency ? { alcoholFrequency: values.alcoholFrequency } : {}),
      ...(drinksPerOccasion !== undefined ? { drinksPerOccasion } : {}),
      ...(values.exerciseFrequency ? { exerciseFrequency: values.exerciseFrequency } : {}),
      ...(text(values.diet) ? { diet: text(values.diet) } : {}),
      ...(text(values.occupation) ? { occupation: text(values.occupation) } : {}),
      ...(values.maritalStatus ? { maritalStatus: values.maritalStatus } : {}),
      ...(text(values.note) ? { note: text(values.note) } : {}),
    };
    if (await save({ patientId, kind: "putSocialHistory", payload })) onClose();
  };

  const errorFor = (field: keyof FormValues) => errors[field] ?? fieldErrors[field];

  return (
    <ModalShell
      open
      onClose={() => !isSaving && onClose()}
      onSubmit={handleSave}
      title="Edit Lifestyle & Social History"
      subtitle="Height, weight and BMI come from the latest recorded vital signs."
      submitText="Save Changes"
      isSubmitting={isSaving}
      errorMessage={saveError}
    >
      <FormGrid>
        <FullRow>
          <ModalRadioGroup
            name="tobaccoUse"
            label={<ReqLabel>Tobacco</ReqLabel>}
            options={optionsFrom(TOBACCO_LABELS)}
            value={values.tobaccoUse}
            onChange={(value) => setField("tobaccoUse", value as TobaccoUse)}
            className="flex flex-wrap gap-x-5 gap-y-2"
          />
        </FullRow>
        {smokes && (
          <>
            <SignupField
              name="packsPerDay"
              type="number"
              label={<OptLabel>Packs per Day</OptLabel>}
              placeholder="e.g. 0.5"
              value={values.packsPerDay}
              onChange={(event) => setField("packsPerDay", event.target.value)}
              error={errorFor("packsPerDay")}
              min={0.1}
              max={20}
              step={0.1}
            />
            <SignupField
              name="tobaccoYears"
              type="number"
              label={<OptLabel>Years Smoked</OptLabel>}
              placeholder="e.g. 10"
              value={values.tobaccoYears}
              onChange={(event) => setField("tobaccoYears", event.target.value)}
              error={errorFor("tobaccoYears")}
              min={0}
              max={120}
            />
          </>
        )}
        <FullRow>
          <ModalRadioGroup
            name="alcoholUse"
            label={<ReqLabel>Alcohol</ReqLabel>}
            options={optionsFrom(ALCOHOL_LABELS)}
            value={values.alcoholUse}
            onChange={(value) => setField("alcoholUse", value as AlcoholUse)}
            className="flex flex-wrap gap-x-5 gap-y-2"
          />
        </FullRow>
        {drinks && (
          <>
            <SignupDropdown
              name="alcoholFrequency"
              label={<OptLabel>How Often</OptLabel>}
              options={withNone(ALCOHOL_FREQUENCIES.map((value) => ({ value, label: humanizeEnum(value) })))}
              value={values.alcoholFrequency}
              onChange={(value) => setField("alcoholFrequency", value as FormValues["alcoholFrequency"])}
              portalMenu
              portalMenuZIndex={1000}
            />
            <SignupField
              name="drinksPerOccasion"
              type="number"
              label={<OptLabel>Drinks per Occasion</OptLabel>}
              placeholder="e.g. 2"
              value={values.drinksPerOccasion}
              onChange={(event) => setField("drinksPerOccasion", event.target.value)}
              error={errorFor("drinksPerOccasion")}
              min={1}
              max={50}
            />
          </>
        )}
        <SignupDropdown
          name="exerciseFrequency"
          label={<OptLabel>Exercise</OptLabel>}
          options={withNone(optionsFrom(EXERCISE_LABELS))}
          value={values.exerciseFrequency}
          onChange={(value) => setField("exerciseFrequency", value as FormValues["exerciseFrequency"])}
          portalMenu
          portalMenuZIndex={1000}
        />
        <SignupDropdown
          name="maritalStatus"
          label={<OptLabel>Marital Status</OptLabel>}
          options={withNone(MARITAL_STATUSES.map((value) => ({ value, label: humanizeEnum(value) })))}
          value={values.maritalStatus}
          onChange={(value) => setField("maritalStatus", value as FormValues["maritalStatus"])}
          portalMenu
          portalMenuZIndex={1000}
        />
        <SignupField
          name="diet"
          label={<OptLabel>Diet</OptLabel>}
          placeholder="e.g. Vegetarian"
          value={values.diet}
          onChange={(event) => setField("diet", event.target.value)}
          error={errorFor("diet")}
          maxLength={100}
        />
        <SignupField
          name="occupation"
          label={<OptLabel>Occupation</OptLabel>}
          placeholder="e.g. Teacher"
          value={values.occupation}
          onChange={(event) => setField("occupation", event.target.value)}
          error={errorFor("occupation")}
          maxLength={200}
        />
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

export default LifestyleModal;
