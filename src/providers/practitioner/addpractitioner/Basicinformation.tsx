"use client";

import React from "react";

import SignupField, { FieldError } from "@/components/SignupField";
import SignupDropdown from "@/components/SignupDropdown";
import DatePicker from "@/components/Datepicker";
import RadioCheckButtonh from "@/components/RadioCheckButtonh";
import { toOptions } from "@/components/Modalshell";
// Same shared helpers the provider "Basic Information" step uses.
// Adjust the path if your Shared file lives in a different folder.
import {
  DEFAULT_COUNTRY,
  Errors,
  Opt,
  PhoneField,
  Req,
  SectionCard,
  validatePhone,
} from "../../Shared";

/* ---------- Constants ---------- */
export const SPECIALTIES = [
  "Internal Medicine",
  "Family Medicine",
  "Pediatrics",
  "Cardiology",
  "Dermatology",
  "Orthopedics",
];

export const PROVIDER_TYPES = [
  "MD (Doctor of Medicine)",
  "DO (Doctor of Osteopathic Medicine)",
  "NP (Nurse Practitioner)",
  "PA (Physician Assistant)",
];

const GENDERS = ["Male", "Female", "Other"] as const;

/** Today as "YYYY-MM-DD" (local time), used to block future birth dates. */
const TODAY_ISO = () => {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")}`;
};

const SPECIALTY_OPTIONS = toOptions(SPECIALTIES);
const PROVIDER_TYPE_OPTIONS = toOptions(PROVIDER_TYPES);

/* ---------- Values ---------- */
export interface BasicValues {
  firstName: string;
  lastName: string;
  dob: string; // yyyy-mm-dd
  gender: string;
  email: string;
  phoneCountry: string; // ISO code used by PhoneField
  phone: string;
  npi: string;
  dea: string;
  specialty: string;
  providerType: string;
  language: string;
}

export const initialBasic = (): BasicValues => ({
  firstName: "",
  lastName: "",
  dob: "",
  gender: "",
  email: "",
  phoneCountry: DEFAULT_COUNTRY,
  phone: "",
  npi: "",
  dea: "",
  specialty: "",
  providerType: "",
  language: "English",
});

/* ---------- Validation ---------- */
/** Minimum needed to save a draft. */
export const validateBasicDraft = (v: BasicValues): Errors => {
  const e: Errors = {};
  if (!v.firstName.trim()) e.firstName = "First name is required.";
  if (!v.lastName.trim()) e.lastName = "Last name is required.";
  return e;
};

export const validateBasic = (v: BasicValues): Errors => {
  const e: Errors = {};

  if (!v.firstName.trim()) e.firstName = "First name is required.";
  else if (v.firstName.trim().length < 2) e.firstName = "First name must be at least 2 characters.";

  if (!v.lastName.trim()) e.lastName = "Last name is required.";
  else if (v.lastName.trim().length < 2) e.lastName = "Last name must be at least 2 characters.";

  if (!v.dob) e.dob = "Date of birth is required.";
  else if (new Date(v.dob) > new Date()) e.dob = "Date of birth cannot be in the future.";

  if (!v.gender) e.gender = "Select a gender.";

  if (!v.email.trim()) e.email = "Email address is required.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email.trim())) e.email = "Enter a valid email address.";

  const phoneErr = validatePhone(v.phone, v.phoneCountry, true);
  if (phoneErr) e.phone = phoneErr;

  if (!v.npi.trim()) e.npi = "NPI number is required.";
  else if (!/^\d{10}$/.test(v.npi.trim())) e.npi = "NPI number must be exactly 10 digits.";

  if (v.dea.trim() && !/^[A-Za-z]{2}\d{7}$/.test(v.dea.trim()))
    e.dea = "DEA number is 2 letters followed by 7 digits.";

  if (!v.specialty) e.specialty = "Specialty is required.";
  if (!v.providerType) e.providerType = "Provider type is required.";

  return e;
};

/* ---------- Component ---------- */
type Props = {
  values: BasicValues;
  errors: Errors;
  onChange: (patch: Partial<BasicValues>) => void;
};

const BasicInformation = ({ values: v, errors, onChange }: Props) => {
  return (
    <SectionCard
      step={1}
      title="Basic Information"
      subtitle="Enter the practitioner's personal and professional details."
    >
      <div className="grid gap-4 sm:grid-cols-2">
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

        <DatePicker
          name="dob"
          label={<>Date of Birth<Req /></>}
          placeholder="dd-mm-yyyy"
          value={v.dob}
          onChange={(val) => onChange({ dob: val })}
          maxDate={TODAY_ISO()}
          error={errors.dob}
        />

        {/* Gender */}
        <div id="gender">
          <p className="mb-2 text-sm font-medium text-heading">
            Gender<Req />
          </p>
          <div className="flex h-11 items-center gap-6">
            {GENDERS.map((g) => (
              <label key={g} className="flex cursor-pointer items-center gap-2.5 text-sm text-heading">
                <RadioCheckButtonh
                  type="radio"
                  name="gender"
                  checked={v.gender === g}
                  onChange={() => onChange({ gender: g })}
                />
                {g}
              </label>
            ))}
          </div>
          <FieldError message={errors.gender} />
        </div>

        <SignupField
          name="email"
          type="email"
          label={<>Email<Req /></>}
          placeholder="Enter email address"
          value={v.email}
          onChange={(e) => onChange({ email: e.target.value })}
          error={errors.email}
        />
        <PhoneField
          name="phone"
          label={<>Phone<Req /></>}
          placeholder="Enter phone number"
          value={v.phone}
          onChange={(val) => onChange({ phone: val })}
          countryCode={v.phoneCountry}
          onCountryChange={(iso) => onChange({ phoneCountry: iso })}
          error={errors.phone}
        />

        <SignupField
          name="npi"
          label={<>NPI Number<Req /></>}
          placeholder="Enter NPI number"
          inputMode="numeric"
          value={v.npi}
          onChange={(e) => onChange({ npi: e.target.value.replace(/\D/g, "").slice(0, 10) })}
          error={errors.npi}
        />
        <SignupField
          name="dea"
          label={<>DEA Number (if applicable)<Opt /></>}
          placeholder="Enter DEA number"
          value={v.dea}
          onChange={(e) => onChange({ dea: e.target.value.toUpperCase().slice(0, 9) })}
          error={errors.dea}
        />

        <SignupDropdown
          name="specialty"
          label="Specialty *"
          placeholder="Select specialty"
          options={SPECIALTY_OPTIONS}
          value={v.specialty}
          onChange={(val) => onChange({ specialty: val })}
          error={errors.specialty}
        />
        <SignupDropdown
          name="providerType"
          label="Provider Type *"
          placeholder="Select provider type"
          searchable={false}
          options={PROVIDER_TYPE_OPTIONS}
          value={v.providerType}
          onChange={(val) => onChange({ providerType: val })}
          error={errors.providerType}
        />
      </div>
    </SectionCard>
  );
};

export default BasicInformation;