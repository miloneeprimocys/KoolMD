"use client";

import React, { useState } from "react";
import { Search } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppHooks";
import { hideModal } from "@/redux/slices/dialogslice";

import ModalShell, {
  AttachmentField,
  FormGrid,
  FullRow,
  ModalDateField,
  ModalTextarea,
  OptLabel,
  ReqLabel,
  SignupDropdown,
  SignupField,
  todayISO,
  toOptions,
} from "@/components/Modalshell";
/* ---------- Options ---------- */
const VACCINES = toOptions([
  "COVID-19",
  "Influenza",
  "MMR",
  "Hepatitis A",
  "Hepatitis B",
  "Tdap",
  "DTaP",
  "HPV",
  "Varicella",
  "Pneumococcal",
  "Polio (IPV)",
  "Meningococcal",
]);
const MANUFACTURERS = toOptions([
  "Pfizer",
  "Moderna",
  "Johnson & Johnson",
  "Sanofi",
  "GlaxoSmithKline",
  "Merck",
  "AstraZeneca",
  "Other",
]);
const DOSES = toOptions(["1st Dose", "2nd Dose", "3rd Dose", "Booster", "Annual", "Other"]);
const ROUTES = toOptions(["Intramuscular", "Subcutaneous", "Intradermal", "Oral", "Intranasal"]);

/* ---------- Form types ---------- */
export type ImmunizationValues = {
  vaccine: string;
  manufacturer: string;
  dose: string;
  dateAdministered: string;
  administeredBy: string;
  lotNumber: string;
  nextDoseDue: string;
  route: string;
  notes: string;
  attachment: File | null;
};
type Errors = Partial<Record<keyof ImmunizationValues, string>>;

const initial = (): ImmunizationValues => ({
  vaccine: "",
  manufacturer: "",
  dose: "",
  dateAdministered: "",
  administeredBy: "",
  lotNumber: "",
  nextDoseDue: "",
  route: "",
  notes: "",
  attachment: null,
});

/* ---------- Component ---------- */
const AddImmunizationModal = ({
  onSave,
}: {
  onSave?: (values: ImmunizationValues) => void;
}) => {
  const dispatch = useAppDispatch();
  const open = useAppSelector((s) => s.dialog.AddImmunization);

  const [values, setValues] = useState<ImmunizationValues>(initial());
  const [errors, setErrors] = useState<Errors>({});

  const set = <K extends keyof ImmunizationValues>(key: K, val: ImmunizationValues[K]) => {
    setValues((p) => ({ ...p, [key]: val }));
    setErrors((p) => ({ ...p, [key]: undefined }));
  };

  const handleClose = () => {
    dispatch(hideModal("AddImmunization"));
    setValues(initial());
    setErrors({});
  };

  const handleSave = () => {
    const e: Errors = {};
    if (!values.vaccine) e.vaccine = "Please select a vaccine";
    if (!values.dose) e.dose = "Please select a dose";
    if (!values.dateAdministered) e.dateAdministered = "Date administered is required";
    else if (values.dateAdministered > todayISO()) e.dateAdministered = "Date cannot be in the future";
    if (values.nextDoseDue && values.dateAdministered && values.nextDoseDue <= values.dateAdministered) {
      e.nextDoseDue = "Must be after the date administered";
    }
    setErrors(e);
    if (Object.keys(e).length) return;

    // TODO: call your API here
    console.log("Immunization saved:", values);
    onSave?.(values);
    handleClose();
  };

  return (
    <ModalShell
      open={open}
      onClose={handleClose}
      onSubmit={handleSave}
      title="Add Immunization"
      subtitle="Add a vaccine or immunization record for the patient."
      submitText="Save Immunization"
    >
      <FormGrid>
        <SignupDropdown
          id="im-vaccine"
          name="vaccine"
          label={<ReqLabel>Vaccine</ReqLabel>}
          icon={<Search className="h-4 w-4" />}
          placeholder="Search or select vaccine..."
          hint="Examples: COVID-19, Influenza, MMR, Hepatitis B, Tdap, HPV, etc."
          options={VACCINES}
          value={values.vaccine}
          onChange={(v) => set("vaccine", v)}
          error={errors.vaccine}
        />
        <SignupDropdown
          id="im-manufacturer"
          name="manufacturer"
          label={<OptLabel>Manufacturer</OptLabel>}
          placeholder="Select manufacturer"
          searchable={false}
          options={MANUFACTURERS}
          value={values.manufacturer}
          onChange={(v) => set("manufacturer", v)}
        />

        <SignupDropdown
          id="im-dose"
          name="dose"
          label={<ReqLabel>Dose</ReqLabel>}
          placeholder="Select dose"
          hint="e.g. 1st Dose, 2nd Dose, Booster"
          searchable={false}
          options={DOSES}
          value={values.dose}
          onChange={(v) => set("dose", v)}
          error={errors.dose}
        />
        <ModalDateField
          id="im-date"
          label={<ReqLabel>Date Administered</ReqLabel>}
          value={values.dateAdministered}
          max={todayISO()}
          onChange={(v) => set("dateAdministered", v)}
          error={errors.dateAdministered}
        />

        <SignupField
          name="administeredBy"
          label={<OptLabel>Administered By</OptLabel>}
          placeholder="Enter provider or clinic name"
          value={values.administeredBy}
          onChange={(e) => set("administeredBy", e.target.value)}
        />
        <SignupField
          name="lotNumber"
          label={<OptLabel>Lot Number</OptLabel>}
          placeholder="Enter lot number"
          value={values.lotNumber}
          onChange={(e) => set("lotNumber", e.target.value)}
        />

        <ModalDateField
          id="im-next-dose"
          label={<OptLabel>Next Dose Due</OptLabel>}
          value={values.nextDoseDue}
          min={values.dateAdministered || undefined}
          onChange={(v) => set("nextDoseDue", v)}
          error={errors.nextDoseDue}
        />
        <SignupDropdown
          id="im-route"
          name="route"
          label={<OptLabel>Route</OptLabel>}
          placeholder="Select route"
          searchable={false}
          options={ROUTES}
          value={values.route}
          onChange={(v) => set("route", v)}
        />

        <FullRow>
          <ModalTextarea
            id="im-notes"
            label={<OptLabel>Notes</OptLabel>}
            placeholder="Add any additional details (e.g. side effects, location, etc.)"
            value={values.notes}
            onChange={(v) => set("notes", v)}
          />
        </FullRow>

        <FullRow>
          <AttachmentField
            title="Upload vaccine record or related documents"
            file={values.attachment}
            onChange={(f) => set("attachment", f)}
          />
        </FullRow>
      </FormGrid>
    </ModalShell>
  );
};

export default AddImmunizationModal;