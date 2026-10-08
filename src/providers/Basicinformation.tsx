"use client";

import React from "react";

import SignupField from "@/components/SignupField";
import SignupDropdown from "@/components/SignupDropdown";
import {
  AddressFields,
  AddressValues,
  DEFAULT_COUNTRY,
  Errors,
  Opt,
  PhoneField,
  PROVIDER_TYPES,
  Req,
  SectionCard,
  SPECIALTIES,
  StepProps,
  TITLES,
  emptyAddress,
  getSubspecialtyOptions,
  validateAddress,
  validatePhone,
} from "./Shared";

/* ---------- Values ---------- */
export interface BasicValues {
  firstName: string;
  lastName: string;
  title: string;
  professionalType: string;
  specialty: string;
  subspecialty: string;
  npi: string;
  dea: string;
  taxonomy: string;
  email: string;
  phoneCountry: string;
  phone: string;
  altPhoneCountry: string;
  altPhone: string;
  address: AddressValues;
}

export const initialBasic = (): BasicValues => ({
  firstName: "",
  lastName: "",
  title: "",
  professionalType: "",
  specialty: "",
  subspecialty: "",
  npi: "",
  dea: "",
  taxonomy: "",
  email: "",
  phoneCountry: DEFAULT_COUNTRY,
  phone: "",
  altPhoneCountry: DEFAULT_COUNTRY,
  altPhone: "",
  address: emptyAddress(),
});

/* ---------- Validation ---------- */
export const validateBasic = (v: BasicValues): Errors => {
  const e: Errors = {};

  if (!v.firstName.trim()) e.firstName = "First name is required.";
  else if (v.firstName.trim().length < 2)
    e.firstName = "First name must be at least 2 characters.";

  if (!v.lastName.trim()) e.lastName = "Last name is required.";
  else if (v.lastName.trim().length < 2)
    e.lastName = "Last name must be at least 2 characters.";

  if (!v.professionalType) e.professionalType = "Professional type is required.";
  if (!v.specialty) e.specialty = "Specialty is required.";

  if (!v.npi.trim()) e.npi = "NPI number is required.";
  else if (!/^\d{10}$/.test(v.npi.trim()))
    e.npi = "NPI number must be exactly 10 digits.";

  if (v.dea.trim() && !/^[A-Za-z]{2}\d{7}$/.test(v.dea.trim()))
    e.dea = "DEA number is 2 letters followed by 7 digits.";

  if (v.taxonomy.trim() && !/^[A-Za-z0-9]{10}$/.test(v.taxonomy.trim()))
    e.taxonomy = "Taxonomy code must be 10 letters or digits.";

  if (!v.email.trim()) e.email = "Email address is required.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email.trim()))
    e.email = "Enter a valid email address.";

  const phoneErr = validatePhone(v.phone, v.phoneCountry, true);
  if (phoneErr) e.phone = phoneErr;
  const altErr = validatePhone(v.altPhone, v.altPhoneCountry, false);
  if (altErr) e.altPhone = altErr;

  return { ...e, ...validateAddress(v.address, "addr_") };
};

/* ---------- Component ---------- */
const BasicInformation = ({
  values: v,
  errors,
  onChange,
}: StepProps<BasicValues>) => {
  const subOptions = getSubspecialtyOptions(v.specialty);

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* 1. Basic information */}
      <SectionCard
        step={1}
        title="Basic Information"
        subtitle="Enter the practitioner's personal and professional details."
      >
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <SignupField
            name="firstName"
            label={<>First Name<Req /></>}
            placeholder="Enter first name"
            value={v.firstName}
            onChange={(e) => onChange({ firstName: e.target.value })}
            error={errors.firstName}
          />
          <SignupField
            name="lastName"
            label={<>Last Name<Req /></>}
            placeholder="Enter last name"
            value={v.lastName}
            onChange={(e) => onChange({ lastName: e.target.value })}
            error={errors.lastName}
          />
          <SignupDropdown
            name="title"
            label="Title / Suffix"
            placeholder="Select title"
            options={TITLES}
            value={v.title}
            onChange={(val) => onChange({ title: val })}
          />
          <SignupDropdown
            name="professionalType"
            label="Professional Type *"
            placeholder="Select type"
            options={PROVIDER_TYPES}
            value={v.professionalType}
            onChange={(val) => onChange({ professionalType: val })}
            error={errors.professionalType}
          />
          <SignupDropdown
            name="specialty"
            label="Specialty *"
            placeholder="Select specialty"
            options={SPECIALTIES}
            value={v.specialty}
            onChange={(val) => onChange({ specialty: val, subspecialty: "" })}
            error={errors.specialty}
          />
          <SignupDropdown
            key={`sub-${v.specialty}`}
            name="subspecialty"
            label="Subspecialty (Optional)"
            placeholder={
              !v.specialty
                ? "Select specialty first"
                : subOptions.length
                  ? "Select subspecialty"
                  : "No subspecialties"
            }
            options={subOptions}
            value={v.subspecialty}
            onChange={(val) => onChange({ subspecialty: val })}
            disabled={subOptions.length === 0}
          />
          <SignupField
            name="npi"
            label={<>NPI Number<Req /></>}
            placeholder="Enter NPI number"
            inputMode="numeric"
            value={v.npi}
            onChange={(e) =>
              onChange({ npi: e.target.value.replace(/\D/g, "").slice(0, 10) })
            }
            error={errors.npi}
          />
          <SignupField
            name="dea"
            label={<>DEA Number<Opt /></>}
            placeholder="Enter DEA number"
            value={v.dea}
            onChange={(e) =>
              onChange({ dea: e.target.value.toUpperCase().slice(0, 9) })
            }
            error={errors.dea}
          />
          <SignupField
            name="taxonomy"
            label={<>Taxonomy Code<Opt /></>}
            placeholder="Enter taxonomy code"
            value={v.taxonomy}
            onChange={(e) =>
              onChange({ taxonomy: e.target.value.toUpperCase().slice(0, 10) })
            }
            error={errors.taxonomy}
          />
        </div>
      </SectionCard>

      {/* 2. Contact information */}
      <SectionCard
        step={2}
        title="Contact Information"
        subtitle="Primary contact details for communication."
      >
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <SignupField
            name="email"
            type="email"
            label={<>Email Address<Req /></>}
            placeholder="Enter email address"
            value={v.email}
            onChange={(e) => onChange({ email: e.target.value })}
            error={errors.email}
          />
          <PhoneField
            name="phone"
            label={<>Phone Number<Req /></>}
            placeholder="Enter phone number"
            value={v.phone}
            onChange={(val) => onChange({ phone: val })}
            countryCode={v.phoneCountry}
            onCountryChange={(iso) => onChange({ phoneCountry: iso })}
            error={errors.phone}
          />
          <PhoneField
            name="altPhone"
            label={<>Alternate Phone<Opt /></>}
            placeholder="Enter alternate number"
            value={v.altPhone}
            onChange={(val) => onChange({ altPhone: val })}
            countryCode={v.altPhoneCountry}
            onCountryChange={(iso) => onChange({ altPhoneCountry: iso })}
            error={errors.altPhone}
          />
        </div>
      </SectionCard>

      {/* 3. Professional address */}
      <SectionCard
        step={3}
        title="Professional Address"
        subtitle="Practice or primary office address."
      >
        <AddressFields
          prefix="addr_"
          values={v.address}
          errors={errors}
          onChange={(patch) => onChange({ address: { ...v.address, ...patch } })}
        />
      </SectionCard>
    </div>
  );
};

export default BasicInformation;