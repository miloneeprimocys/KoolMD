"use client";

import React, { useMemo, useState } from "react";
import { Building2, Info, MapPin, Stethoscope } from "lucide-react";

import RadioCheckButtonh from "@/components/RadioCheckButtonh";
import ModalShell, { OptLabel, ReqLabel, SignupDropdown, SignupField, toOptions } from "@/components/Modalshell";
import {
  DEFAULT_COUNTRY,
  PhoneField,
  SPECIALTIES,
  getCityOptions,
  getStateOptions,
  postalLabelFor,
  uid,
  validatePhone,
} from "@/providers/Shared";
import { postcodeValidator, postcodeValidatorExistsForCountry } from "postcode-validator";

/* ---------- Values ---------- */
export type PracticeLocationValues = {
  id: string;
  name: string;
  type: string;
  address1: string;
  city: string;
  state: string;
  zip: string;
  department: string;
  phoneCountry: string;
  phone: string;
  faxCountry: string;
  fax: string;
  primary: boolean;
};
type Errors = Partial<Record<keyof PracticeLocationValues, string>>;

const emptyLocation = (): PracticeLocationValues => ({
  id: uid(),
  name: "",
  type: "",
  address1: "",
  city: "",
  state: "",
  zip: "",
  department: "",
  phoneCountry: DEFAULT_COUNTRY,
  phone: "",
  faxCountry: DEFAULT_COUNTRY,
  fax: "",
  primary: false,
});

/* ---------- Options ---------- */
const LOCATION_TYPES = toOptions([
  "Clinic / Medical Practice",
  "Hospital",
  "Urgent Care Center",
  "Ambulatory Surgery Center",
  "Diagnostic / Imaging Center",
  "Other",
]);

/* ---------- Props ---------- */
interface Props {
  open: boolean;
  onClose: () => void;
  /** Pass a location to edit it; omit to add a new one. */
  initial?: PracticeLocationValues | null;
  /** Your save call. Throw to keep the modal open and show the message. */
  onSave?: (values: PracticeLocationValues) => void | Promise<void>;
}

/* ---------- Body (mounted only while open, so state is fresh every time) ---------- */
const LocationModalBody = ({ onClose, initial, onSave }: Omit<Props, "open">) => {
  const [values, setValues] = useState<PracticeLocationValues>(initial ?? emptyLocation());
  const [errors, setErrors] = useState<Errors>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Practice locations are US-based (State dropdown + ZIP Code)
  const stateOptions = useMemo(() => getStateOptions(DEFAULT_COUNTRY), []);
  const cityOptions = useMemo(() => getCityOptions(DEFAULT_COUNTRY, values.state), [values.state]);
  const postalLabel = postalLabelFor(DEFAULT_COUNTRY);

  const set = <K extends keyof PracticeLocationValues>(key: K, val: PracticeLocationValues[K]) => {
    setValues((p) => ({ ...p, [key]: val }));
    setErrors((p) => ({ ...p, [key]: undefined }));
  };

  const handleState = (iso: string) => {
    setValues((p) => ({ ...p, state: iso, city: "" }));
    setErrors((p) => ({ ...p, state: undefined, city: undefined }));
  };

  const validate = (): Errors => {
    const e: Errors = {};
    if (!values.name.trim()) e.name = "Location name is required";
    if (!values.type) e.type = "Location type is required";
    if (!values.address1.trim()) e.address1 = "Address is required";
    if (!values.state) e.state = "State is required";
    if (!values.city) e.city = "City is required";
    const zip = values.zip.trim();
    if (!zip) e.zip = `${postalLabel} is required`;
    else if (postcodeValidatorExistsForCountry(DEFAULT_COUNTRY) && !postcodeValidator(zip, DEFAULT_COUNTRY)) {
      e.zip = `Enter a valid ${postalLabel.toLowerCase()}`;
    }
    if (!values.department) e.department = "Department / specialty is required";
    const phoneErr = validatePhone(values.phone, values.phoneCountry, true);
    if (phoneErr) e.phone = phoneErr;
    const faxErr = validatePhone(values.fax, values.faxCountry, false);
    if (faxErr) e.fax = faxErr;
    return e;
  };

  const handleSave = async () => {
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length) return;

    setIsSaving(true);
    setSaveError(null);
    try {
      // TODO: call your API here
      await onSave?.({ ...values, name: values.name.trim(), address1: values.address1.trim(), zip: values.zip.trim() });
      onClose();
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "The location could not be saved.");
      setIsSaving(false);
    }
  };

  return (
    <ModalShell
      open
      onClose={() => !isSaving && onClose()}
      onSubmit={handleSave}
      isSubmitting={isSaving}
      errorMessage={saveError}
      titleId="practice-location-title"
      title={
        <span className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <MapPin className="h-5 w-5" />
          </span>
          {initial ? "Edit Practice Location" : "Add Practice Location"}
        </span>
      }
      subtitle="Add a clinic, hospital or practice location where you see patients."
      submitText={initial ? "Save Changes" : "Add Location"}
      width={820}
    >
      <div className="grid gap-x-4 gap-y-3 sm:grid-cols-2">
        {/* Left column */}
        <div className="min-w-0 space-y-3">
          <SignupField
            name="name"
            label={<ReqLabel>Location / Organization Name</ReqLabel>}
            placeholder="e.g. Riverside Medical Clinic"
            value={values.name}
            onChange={(e) => set("name", e.target.value)}
            error={errors.name}
            maxLength={120}
            autoComplete="off"
          />
          <SignupField
            name="address1"
            label={<ReqLabel>Address Line 1</ReqLabel>}
            placeholder="Street address, suite, etc."
            value={values.address1}
            onChange={(e) => set("address1", e.target.value)}
            error={errors.address1}
            maxLength={150}
            autoComplete="off"
          />
          <div className="grid gap-x-3 gap-y-3 sm:grid-cols-3">
            <SignupDropdown
              key={`city-${values.state}`}
              name="city"
              label={<ReqLabel>City</ReqLabel>}
              placeholder={!values.state ? "Select state first" : cityOptions.length ? "Select city" : "No cities"}
              options={cityOptions}
              value={values.city}
              onChange={(v) => set("city", v)}
              disabled={!values.state || cityOptions.length === 0}
              error={errors.city}
              portalMenu
              portalMenuZIndex={1000}
            />
            <SignupDropdown
              name="state"
              label={<ReqLabel>State</ReqLabel>}
              placeholder="State"
              options={stateOptions}
              value={values.state}
              onChange={handleState}
              error={errors.state}
              portalMenu
              portalMenuZIndex={1000}
            />
            <SignupField
              name="zip"
              label={<ReqLabel>{postalLabel}</ReqLabel>}
              placeholder="ZIP"
              value={values.zip}
              onChange={(e) => set("zip", e.target.value)}
              error={errors.zip}
              maxLength={10}
              autoComplete="off"
            />
          </div>
        </div>

        {/* Right column */}
        <div className="min-w-0 space-y-3">
          <SignupDropdown
            name="type"
            label={<ReqLabel>Location Type</ReqLabel>}
            placeholder="Select location type"
            searchable={false}
            icon={<Building2 className="h-[18px] w-[18px]" />}
            options={LOCATION_TYPES}
            value={values.type}
            onChange={(v) => set("type", v)}
            error={errors.type}
            portalMenu
            portalMenuZIndex={1000}
          />
          <SignupDropdown
            name="department"
            label={<ReqLabel>Department / Specialty</ReqLabel>}
            placeholder="Select department"
            icon={<Stethoscope className="h-[18px] w-[18px]" />}
            options={SPECIALTIES}
            value={values.department}
            onChange={(v) => set("department", v)}
            error={errors.department}
            portalMenu
            portalMenuZIndex={1000}
          />
          <PhoneField
            name="phone"
            label={<ReqLabel>Contact Number</ReqLabel>}
            placeholder="Enter contact number"
            value={values.phone}
            onChange={(v) => set("phone", v)}
            countryCode={values.phoneCountry}
            onCountryChange={(iso) => set("phoneCountry", iso)}
            error={errors.phone}
            portalMenu
            portalMenuZIndex={1000}
          />
          <PhoneField
            name="fax"
            label={<OptLabel>Fax Number</OptLabel>}
            placeholder="Enter fax number"
            value={values.fax}
            onChange={(v) => set("fax", v)}
            countryCode={values.faxCountry}
            onCountryChange={(iso) => set("faxCountry", iso)}
            error={errors.fax}
            portalMenu
            portalMenuZIndex={1000}
          />
        </div>
      </div>

      <label className="flex w-fit cursor-pointer items-center gap-2 pt-1 text-sm font-medium text-heading">
        <RadioCheckButtonh type="checkbox" checked={values.primary} onChange={(e) => set("primary", e.target.checked)} />
        Set as Primary Location
        <span title="Your primary location is shown first to patients." className="inline-flex cursor-help text-body">
          <Info className="h-4 w-4" aria-label="Your primary location is shown first to patients." />
        </span>
      </label>
    </ModalShell>
  );
};

/* ---------- Public component ---------- */
const AddPracticeLocationModal = ({ open, ...rest }: Props) => (open ? <LocationModalBody {...rest} /> : null);

export default AddPracticeLocationModal;