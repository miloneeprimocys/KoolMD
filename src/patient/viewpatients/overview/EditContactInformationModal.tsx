"use client";

import React, { useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppHooks";
import { hideModal } from "@/redux/slices/dialogslice";
import { selectPatientDetail } from "@/redux/selectors/patientSelectors";
import { updatePatient } from "@/redux/thunks/patientThunks";
import type { PatientDetail, UpdatePatientPayload } from "@/types/patient";
import { fromE164, toE164 } from "@/utils/phone";

import ModalShell, {
  FormGrid,
  FullRow,
  OptLabel,
  ReqLabel,
  SignupDropdown,
  SignupField,
} from "@/components/Modalshell";
import {
  COUNTRY_OPTIONS,
  DEFAULT_COUNTRY,
  PhoneField,
  getCityOptions,
  getStateOptions,
  postalLabelFor,
  validatePhone,
} from "@/providers/Shared";

export type ContactValues = {
  phoneCountry: string;
  phone: string;
  email: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  zip: string;
  country: string;
};
type Errors = Partial<Record<keyof ContactValues, string>>;

const US_COUNTRY_CODE = "US";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** API field → form field, for the server's validation messages. */
const FORM_FIELD_BY_API_FIELD: Record<string, keyof ContactValues> = {
  phoneNumber: "phone",
  email: "email",
  addressLine1: "address1",
  addressLine2: "address2",
  city: "city",
  stateCode: "state",
  postalCode: "zip",
  countryCode: "country",
};

const toFormValues = (patient: PatientDetail | null): ContactValues => {
  const country = patient?.countryCode || DEFAULT_COUNTRY;
  const phone = fromE164(patient?.phoneNumber, country);
  return {
    phoneCountry: phone.countryIso,
    phone: phone.nationalNumber,
    email: patient?.email ?? "",
    address1: patient?.addressLine1 ?? "",
    address2: patient?.addressLine2 ?? "",
    city: patient?.city ?? "",
    state: patient?.stateCode ?? "",
    zip: patient?.postalCode ?? "",
    country,
  };
};

/** Empty fields are sent as null so clearing a value removes it. State and ZIP exist for US only. */
const toPayload = (values: ContactValues): UpdatePatientPayload => {
  const isUsAddress = values.country === US_COUNTRY_CODE;
  const orNull = (value: string) => value.trim() || null;
  return {
    phoneNumber: toE164(values.phone, values.phoneCountry) || null,
    email: orNull(values.email),
    addressLine1: orNull(values.address1),
    addressLine2: orNull(values.address2),
    city: orNull(values.city),
    stateCode: isUsAddress ? orNull(values.state) : null,
    postalCode: isUsAddress ? orNull(values.zip) : null,
    countryCode: values.country,
  };
};

/** Edits the contact details of the patient open on the View Patient screen. */
const EditContactInformationModal = () => {
  const dispatch = useAppDispatch();
  const open = useAppSelector((s) => s.dialog.EditContactInformation);
  const { patient } = useAppSelector(selectPatientDetail);

  const [values, setValues] = useState<ContactValues>(() => toFormValues(patient));
  const [errors, setErrors] = useState<Errors>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Re-fill from the current patient every time the modal opens.
  const [openedFor, setOpenedFor] = useState<PatientDetail | null>(null);
  if (open && openedFor !== patient) {
    setOpenedFor(patient);
    setValues(toFormValues(patient));
    setErrors({});
    setSaveError(null);
  }

  const stateOptions = useMemo(() => getStateOptions(values.country), [values.country]);
  const cityOptions = useMemo(() => getCityOptions(values.country, values.state), [values.country, values.state]);
  const postalLabel = postalLabelFor(values.country);

  const set = <K extends keyof ContactValues>(key: K, val: ContactValues[K]) => {
    setValues((p) => ({ ...p, [key]: val }));
    setErrors((p) => ({ ...p, [key]: undefined }));
  };

  const handleCountry = (iso: string) => {
    setValues((p) => ({ ...p, country: iso, state: "", city: "", zip: "", phoneCountry: iso }));
    setErrors((p) => ({ ...p, country: undefined, state: undefined, city: undefined, zip: undefined }));
  };

  const handleState = (iso: string) => {
    setValues((p) => ({ ...p, state: iso, city: "" }));
    setErrors((p) => ({ ...p, state: undefined, city: undefined }));
  };

  const handleClose = () => {
    if (isSaving) return;
    dispatch(hideModal("EditContactInformation"));
    setOpenedFor(null);
  };

  /** Phone and email are optional; an address, once started, needs the parts the API requires. */
  const validate = (): Errors => {
    const e: Errors = {};
    if (values.phone.trim()) {
      const phoneErr = validatePhone(values.phone, values.phoneCountry, false);
      if (phoneErr) e.phone = phoneErr;
    }
    if (values.email.trim() && !EMAIL_PATTERN.test(values.email.trim())) {
      e.email = "Enter a valid email address";
    }
    if (!values.country) e.country = "Country is required";
    if (values.address1.trim()) {
      if (cityOptions.length && !values.city) e.city = "City is required";
      if (values.country === US_COUNTRY_CODE) {
        if (stateOptions.length && !values.state) e.state = "State is required";
        if (!values.zip.trim()) e.zip = `${postalLabel} is required`;
      }
    }
    return e;
  };

  const handleSave = async () => {
    if (!patient) return;
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length) return;

    setIsSaving(true);
    setSaveError(null);
    const result = await dispatch(updatePatient({ patientId: patient.id, payload: toPayload(values) }));
    setIsSaving(false);

    if (updatePatient.fulfilled.match(result)) {
      dispatch(hideModal("EditContactInformation"));
      setOpenedFor(null);
      return;
    }
    const requestError = result.payload;
    const serverErrors: Errors = {};
    for (const [apiField, message] of Object.entries(requestError?.fieldErrors ?? {})) {
      const formField = FORM_FIELD_BY_API_FIELD[apiField];
      if (formField) serverErrors[formField] = message;
    }
    setErrors(serverErrors);
    setSaveError(requestError?.message ?? "Contact information could not be saved.");
  };

  return (
    <ModalShell
      open={open}
      onClose={handleClose}
      onSubmit={handleSave}
      isSubmitting={isSaving}
      errorMessage={saveError}
      title="Edit Contact Information"
      subtitle="Update the patient's contact details below."
      submitText="Save Changes"
    >
      <FormGrid>
        <FullRow>
          <PhoneField
            name="phone"
            label={<OptLabel>Phone Number</OptLabel>}
            placeholder="Enter phone number"
            value={values.phone}
            onChange={(v) => set("phone", v)}
            countryCode={values.phoneCountry}
            onCountryChange={(iso) => set("phoneCountry", iso)}
            error={errors.phone}
          />
        </FullRow>

        <FullRow>
          <SignupField
            name="email"
            type="email"
            label={<OptLabel>Email Address</OptLabel>}
            placeholder="Enter email address"
            value={values.email}
            onChange={(e) => set("email", e.target.value)}
            error={errors.email}
          />
        </FullRow>

        <FullRow>
          <SignupField
            name="address1"
            label="Address Line 1"
            placeholder="Street address, building, unit, etc."
            value={values.address1}
            onChange={(e) => set("address1", e.target.value)}
          />
        </FullRow>

        <FullRow>
          <SignupField
            name="address2"
            label={<OptLabel>Address Line 2</OptLabel>}
            placeholder="Apartment, suite, unit, building, etc."
            value={values.address2}
            onChange={(e) => set("address2", e.target.value)}
          />
        </FullRow>

        <FullRow>
          <div className="grid gap-x-4 gap-y-3 sm:grid-cols-3">
            <SignupDropdown
              key={`city-${values.country}-${values.state}`}
              name="city"
              label={<ReqLabel>City</ReqLabel>}
              placeholder={
                stateOptions.length && !values.state ? "Select state first" : cityOptions.length ? "Select city" : "No cities available"
              }
              options={cityOptions}
              value={values.city}
              onChange={(v) => set("city", v)}
              disabled={cityOptions.length === 0 || (stateOptions.length > 0 && !values.state)}
              error={errors.city}
              portalMenu
              portalMenuZIndex={1000}
            />
            <SignupDropdown
              key={`state-${values.country}`}
              name="state"
              label={<ReqLabel>State</ReqLabel>}
              placeholder={stateOptions.length ? "Select state" : "No states available"}
              options={stateOptions}
              value={values.state}
              onChange={handleState}
              disabled={stateOptions.length === 0}
              error={errors.state}
              portalMenu
              portalMenuZIndex={1000}
            />
            <SignupField
              name="zip"
              label={<ReqLabel>{postalLabel}</ReqLabel>}
              placeholder={`Enter ${postalLabel.toLowerCase()}`}
              value={values.zip}
              onChange={(e) => set("zip", e.target.value)}
              error={errors.zip}
            />
          </div>
        </FullRow>

        <FullRow>
          <SignupDropdown
            name="country"
            label={<ReqLabel>Country</ReqLabel>}
            placeholder="Select country"
            options={COUNTRY_OPTIONS}
            value={values.country}
            onChange={handleCountry}
            error={errors.country}
            portalMenu
            portalMenuZIndex={1000}
          />
        </FullRow>
      </FormGrid>
    </ModalShell>
  );
};

export default EditContactInformationModal;