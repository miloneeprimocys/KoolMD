"use client";

import React, { useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppHooks";
import { hideModal } from "@/redux/slices/dialogslice";

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

const initial = (defaults?: Partial<ContactValues>): ContactValues => ({
  phoneCountry: DEFAULT_COUNTRY,
  phone: "",
  email: "",
  address1: "",
  address2: "",
  city: "",
  state: "",
  zip: "",
  country: DEFAULT_COUNTRY,
  ...defaults,
});

const EditContactInformationModal = ({
  defaults,
  onSave,
}: {
  /** Current patient values, to pre-fill the form */
  defaults?: Partial<ContactValues>;
  onSave?: (values: ContactValues) => void;
}) => {
  const dispatch = useAppDispatch();
  const open = useAppSelector((s) => s.dialog.EditContactInformation);

  const [values, setValues] = useState<ContactValues>(initial(defaults));
  const [errors, setErrors] = useState<Errors>({});

  React.useEffect(() => {
    if (open) {
      setValues(initial(defaults));
      setErrors({});
    }
  }, [open, defaults]);

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
    dispatch(hideModal("EditContactInformation"));
    setValues(initial(defaults));
    setErrors({});
  };

  const handleSave = () => {
    const e: Errors = {};
    const phoneErr = validatePhone(values.phone, values.phoneCountry, true);
    if (phoneErr) e.phone = phoneErr;
    if (!values.email.trim()) e.email = "Email address is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) e.email = "Enter a valid email address";
    if (!values.country) e.country = "Country is required";
    if (stateOptions.length && !values.state) e.state = "State is required";
    if (cityOptions.length && !values.city) e.city = "City is required";
    if (!values.zip.trim()) e.zip = `${postalLabel} is required`;
    setErrors(e);
    if (Object.keys(e).length) return;

    // TODO: call your API here
    console.log("Contact information saved:", values);
    onSave?.(values);
    handleClose();
  };

  return (
    <ModalShell
      open={open}
      onClose={handleClose}
      onSubmit={handleSave}
      title="Edit Contact Information"
      subtitle="Update the patient's contact details below."
      submitText="Save Changes"
    >
      <FormGrid>
        <FullRow>
          <PhoneField
            name="phone"
            label={<ReqLabel>Phone Number</ReqLabel>}
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
            label={<ReqLabel>Email Address</ReqLabel>}
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