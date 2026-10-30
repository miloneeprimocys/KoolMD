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
import type { ImmunizationRoute, PatientImmunization } from "@/types/patient";
import { humanizeEnum } from "@/utils/formatters";
import { useHistoryChange } from "./useHistoryChange";

const ROUTES: ImmunizationRoute[] = [
  "INTRAMUSCULAR",
  "SUBCUTANEOUS",
  "INTRADERMAL",
  "ORAL",
  "INTRANASAL",
  "OTHER",
];
const ROUTE_OPTIONS = [{ value: "", label: "Not specified" }, ...ROUTES.map((value) => ({ value, label: humanizeEnum(value) }))];
const GIVEN_OPTIONS = [
  { value: "COMPLETED", label: "Given" },
  { value: "NOT_DONE", label: "Not given" },
];

type FormValues = {
  vaccineName: string;
  manufacturer: string;
  doseLabel: string;
  administeredDate: string;
  administeredBy: string;
  lotNumber: string;
  route: ImmunizationRoute | "";
  nextDoseDueDate: string;
  status: "COMPLETED" | "NOT_DONE";
  statusReason: string;
  note: string;
};

const toFormValues = (immunization: PatientImmunization | null): FormValues => ({
  vaccineName: immunization?.vaccineName ?? "",
  manufacturer: immunization?.manufacturer ?? "",
  doseLabel: immunization?.doseLabel ?? "",
  administeredDate: immunization?.administeredDate ?? "",
  administeredBy: immunization?.administeredBy ?? "",
  lotNumber: immunization?.lotNumber ?? "",
  route: immunization?.route ?? "",
  nextDoseDueDate: immunization?.nextDoseDueDate ?? "",
  status: immunization?.status === "NOT_DONE" ? "NOT_DONE" : "COMPLETED",
  statusReason: immunization?.status === "NOT_DONE" ? (immunization.statusReason ?? "") : "",
  note: immunization?.note ?? "",
});

interface ImmunizationModalProps {
  patientId: string;
  /** Immunization being edited; null records a new one. */
  immunization: PatientImmunization | null;
  onClose: () => void;
}

/**
 * Records a vaccine dose — given, or not given with the reason (refused, contraindicated…).
 * Mount only while open, with a `key` per immunization.
 */
const ImmunizationModal = ({ patientId, immunization, onClose }: ImmunizationModalProps) => {
  const { save, isSaving, saveError, fieldErrors } = useHistoryChange();
  const [values, setValues] = useState<FormValues>(() => toFormValues(immunization));
  const [errors, setErrors] = useState<Partial<Record<keyof FormValues, string>>>({});
  const isNotGiven = values.status === "NOT_DONE";

  const setField = <K extends keyof FormValues>(key: K, value: FormValues[K]) => {
    setValues((previous) => ({ ...previous, [key]: value }));
    setErrors((previous) => ({ ...previous, [key]: undefined }));
  };

  const handleSave = async () => {
    const nextErrors: Partial<Record<keyof FormValues, string>> = {};
    if (!values.vaccineName.trim()) nextErrors.vaccineName = "Vaccine is required.";
    if (!values.administeredDate) nextErrors.administeredDate = "Date is required.";
    else if (values.administeredDate > todayISO()) nextErrors.administeredDate = "Date cannot be in the future.";
    if (values.nextDoseDueDate && values.administeredDate && values.nextDoseDueDate < values.administeredDate) {
      nextErrors.nextDoseDueDate = "Next dose cannot be before this one.";
    }
    if (isNotGiven && values.statusReason.trim().length < 3) {
      nextErrors.statusReason = "Explain why the dose was not given (at least 3 characters).";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    const optional = (value: string) => value.trim() || (immunization ? null : undefined);
    const payload = {
      vaccineName: values.vaccineName.trim(),
      administeredDate: values.administeredDate,
      manufacturer: optional(values.manufacturer),
      doseLabel: optional(values.doseLabel),
      administeredBy: optional(values.administeredBy),
      lotNumber: optional(values.lotNumber),
      route: values.route || (immunization ? null : undefined),
      nextDoseDueDate: values.nextDoseDueDate || (immunization ? null : undefined),
      status: values.status,
      statusReason: isNotGiven ? values.statusReason.trim() : undefined,
      note: optional(values.note),
    };
    const saved = immunization
      ? await save({ patientId, kind: "updateEntry", section: "immunizations", entryId: immunization.id, payload })
      : await save({ patientId, kind: "createEntry", section: "immunizations", payload });
    if (saved) onClose();
  };

  const errorFor = (field: keyof FormValues) => errors[field] ?? fieldErrors[field];
  const textField = (key: "manufacturer" | "doseLabel" | "administeredBy" | "lotNumber", label: string, placeholder: string, maxLength: number) => (
    <SignupField
      name={key}
      label={<OptLabel>{label}</OptLabel>}
      placeholder={placeholder}
      value={values[key]}
      onChange={(event) => setField(key, event.target.value)}
      error={errorFor(key)}
      maxLength={maxLength}
    />
  );

  return (
    <ModalShell
      open
      onClose={() => !isSaving && onClose()}
      onSubmit={handleSave}
      title={immunization ? "Edit Immunization" : "Add Immunization"}
      subtitle="A vaccine dose, given now or recorded from history."
      submitText={immunization ? "Save Changes" : "Add Immunization"}
      isSubmitting={isSaving}
      errorMessage={saveError}
    >
      <FormGrid>
        <SignupField
          name="vaccineName"
          label={<ReqLabel>Vaccine</ReqLabel>}
          placeholder="e.g. Influenza (seasonal)"
          value={values.vaccineName}
          onChange={(event) => setField("vaccineName", event.target.value)}
          error={errorFor("vaccineName")}
          maxLength={200}
        />
        <ModalDateField
          id="administeredDate"
          label={<ReqLabel>Date</ReqLabel>}
          value={values.administeredDate}
          onChange={(value) => setField("administeredDate", value)}
          error={errorFor("administeredDate")}
          max={todayISO()}
        />
        <FullRow>
          <ModalRadioGroup
            name="status"
            label={<ReqLabel>Dose</ReqLabel>}
            options={GIVEN_OPTIONS}
            value={values.status}
            onChange={(value) => setField("status", value as FormValues["status"])}
            className="flex flex-wrap gap-x-5 gap-y-2"
          />
        </FullRow>
        {isNotGiven && (
          <FullRow>
            <SignupField
              name="statusReason"
              label={<ReqLabel>Reason Not Given</ReqLabel>}
              placeholder="e.g. Patient declined, contraindicated"
              value={values.statusReason}
              onChange={(event) => setField("statusReason", event.target.value)}
              error={errorFor("statusReason")}
              maxLength={1000}
            />
          </FullRow>
        )}
        {textField("doseLabel", "Dose", "e.g. 1st dose, Booster", 50)}
        {textField("manufacturer", "Manufacturer", "e.g. Pfizer", 200)}
        {textField("lotNumber", "Lot Number", "e.g. AB1234", 50)}
        {textField("administeredBy", "Administered By", "e.g. Nurse Joy", 200)}
        <SignupDropdown
          name="route"
          label={<OptLabel>Route</OptLabel>}
          options={ROUTE_OPTIONS}
          value={values.route}
          onChange={(value) => setField("route", value as FormValues["route"])}
          portalMenu
          portalMenuZIndex={1000}
        />
        <ModalDateField
          id="nextDoseDueDate"
          label={<OptLabel>Next Dose Due</OptLabel>}
          value={values.nextDoseDueDate}
          onChange={(value) => setField("nextDoseDueDate", value)}
          error={errorFor("nextDoseDueDate")}
          min={values.administeredDate || undefined}
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

export default ImmunizationModal;
