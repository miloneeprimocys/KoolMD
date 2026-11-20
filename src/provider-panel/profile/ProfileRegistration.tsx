"use client";

import React, { useRef, useState } from "react";
import { BadgeCheck, Globe, Info, Layers, Stethoscope, User, UserCircle2 } from "lucide-react";

import EditButton from "@/components/EditButton";
import SignupField, { FieldError } from "@/components/SignupField";
import SignupDropdown from "@/components/SignupDropdown";
import RadioCheckButtonh from "@/components/RadioCheckButtonh";
import {
  ChipSelect,
  PhoneField,
  Req,
  SPECIALTIES,
  SectionCard,
  TextArea,
  getSubspecialtyOptions,
  toOptions,
  validatePhone,
  type Errors,
  type StepProps,
} from "@/providers/Shared";

/* ---------------------------------------------------------------- */
/*  Values + validation (used by ProviderProfile and ProfileReview)  */
/* ---------------------------------------------------------------- */
export interface RegistrationValues {
  /** Object URL of the chosen profile photo ("" = none). */
  photo: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneCountry: string;
  phone: string;
  providerType: string;
  specialty: string;
  subspecialty: string;
  experience: string;
  npi: string;
  dea: string;
  qualifications: string[];
  bio: string;
  services: string[];
  consultationTypes: string[];
  languages: string[];
  ageGroups: string[];
}

/** Static starting values (replace with the provider's saved profile). */
export const initialRegistration = (): RegistrationValues => ({
  photo: "",
  firstName: "Sarah",
  lastName: "Miller",
  email: "sarah.miller@koolmd.com",
  phoneCountry: "US",
  phone: "(415) 555-0138",
  providerType: "Physician",
  specialty: "Internal Medicine",
  subspecialty: "",
  experience: "10+ years",
  npi: "1234567890",
  dea: "BM1234567",
  qualifications: ["MD – Doctor of Medicine", "Board Certified – Internal Medicine"],
  bio: "Board-certified internist with 10+ years of experience in adult primary care, prevention, and chronic disease management.",
  services: ["General Consultation", "Follow-up Care", "Chronic Care Management"],
  consultationTypes: ["In-Person", "Telemedicine"],
  languages: ["English", "Spanish"],
  ageGroups: ["Adult (18–64)", "Geriatric (65+)"],
});

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NPI_PATTERN = /^\d{10}$/;
const DEA_PATTERN = /^[A-Za-z]{2}\d{7}$/;

/** NPI / DEA are optional ("where applicable") but must be well-formed when filled. */
export const validateIdentifiers = (npi: string, dea: string): Errors => {
  const e: Errors = {};
  if (npi.trim() && !NPI_PATTERN.test(npi.trim())) e.npi = "NPI must be exactly 10 digits.";
  if (dea.trim() && !DEA_PATTERN.test(dea.trim())) e.dea = "DEA must be 2 letters followed by 7 digits.";
  return e;
};

export const validateRegistration = (v: RegistrationValues): Errors => {
  const e: Errors = {};
  if (!v.firstName.trim()) e.firstName = "First name is required.";
  if (!v.lastName.trim()) e.lastName = "Last name is required.";
  if (!v.email.trim()) e.email = "Email is required.";
  else if (!EMAIL_PATTERN.test(v.email.trim())) e.email = "Enter a valid email address.";
  const phoneError = validatePhone(v.phone, v.phoneCountry, true);
  if (phoneError) e.phone = phoneError;
  if (!v.providerType) e.providerType = "Provider type is required.";
  if (!v.specialty) e.specialty = "Primary specialty is required.";
  if (!v.experience) e.experience = "Years of experience is required.";
  if (v.qualifications.length === 0) e.qualifications = "Add at least one qualification.";
  if (v.services.length === 0) e.services = "Add at least one service.";
  if (v.consultationTypes.length === 0) e.consultationTypes = "Select at least one consultation type.";
  if (v.languages.length === 0) e.languages = "Add at least one language.";
  if (v.ageGroups.length === 0) e.ageGroups = "Select at least one patient age group.";
  return { ...e, ...validateIdentifiers(v.npi, v.dea) };
};

/* ---------------------------------------------------------------- */
/*  Options                                                          */
/* ---------------------------------------------------------------- */
const PROVIDER_TYPE_OPTIONS = toOptions(["Physician", "Nurse Practitioner", "Physician Assistant", "Registered Nurse", "Psychologist"]);
const EXPERIENCE_OPTIONS = toOptions(["Less than 1 year", "1–3 years", "4–6 years", "7–9 years", "10+ years"]);
const QUALIFICATION_OPTIONS = toOptions([
  "MD – Doctor of Medicine",
  "DO – Doctor of Osteopathic Medicine",
  "MBBS",
  "Board Certified – Internal Medicine",
  "NP – Nurse Practitioner",
  "PA-C – Physician Assistant",
  "PhD",
]);
const SERVICE_OPTIONS = toOptions([
  "General Consultation",
  "Follow-up Care",
  "Chronic Care Management",
  "Preventive Care",
  "Annual Physical",
  "Medication Management",
  "Wellness Counseling",
]);
const LANGUAGE_OPTIONS = toOptions(["English", "Spanish", "Hindi", "Gujarati", "French", "German", "Mandarin", "Arabic", "Portuguese"]);
const CONSULTATION_TYPES = ["In-Person", "Telemedicine"];
const AGE_GROUPS = ["Pediatric (0–17)", "Adult (18–64)", "Geriatric (65+)"];

const MAX_PHOTO_MB = 5;

/* ---------------------------------------------------------------- */
/*  Small pieces                                                     */
/* ---------------------------------------------------------------- */
const CheckGroup = ({
  label,
  options,
  value,
  onChange,
  error,
}: {
  label: React.ReactNode;
  options: string[];
  value: string[];
  onChange: (next: string[]) => void;
  error?: string;
}) => (
  <div>
    <p className="mb-2 text-sm font-medium text-label">{label}</p>
    <div className="flex flex-wrap gap-x-6 gap-y-2.5">
      {options.map((option) => (
        <label key={option} className="flex cursor-pointer items-center gap-2 text-sm text-heading">
          <RadioCheckButtonh
            type="checkbox"
            checked={value.includes(option)}
            onChange={(e) => onChange(e.target.checked ? [...value, option] : value.filter((v) => v !== option))}
          />
          {option}
        </label>
      ))}
    </div>
    <FieldError message={error} />
  </div>
);

const InfoHint = ({ text }: { text: string }) => (
  <span title={text} className="flex cursor-help items-center text-body">
    <Info className="h-4 w-4" aria-label={text} />
  </span>
);

/** NPI + DEA card – shown on this step and again on "Licenses & Credentials". */
export const ProviderIdentifiersCard = ({
  npi,
  dea,
  errors,
  onChange,
}: {
  npi: string;
  dea: string;
  errors: Errors;
  onChange: (patch: { npi?: string; dea?: string }) => void;
}) => (
  <SectionCard icon={<BadgeCheck className="h-4 w-4" />} title="Provider Identifiers" subtitle="Where applicable">
    <div className="grid gap-4 sm:grid-cols-2">
      <SignupField
        name="npi"
        label="NPI Number"
        placeholder="10-digit NPI"
        value={npi}
        onChange={(e) => onChange({ npi: e.target.value.replace(/\D/g, "") })}
        error={errors.npi}
        maxLength={10}
        inputMode="numeric"
        autoComplete="off"
        trailing={<InfoHint text="National Provider Identifier – a unique 10-digit number." />}
      />
      <SignupField
        name="dea"
        label="DEA Number"
        placeholder="e.g. BM1234567"
        value={dea}
        onChange={(e) => onChange({ dea: e.target.value.toUpperCase() })}
        error={errors.dea}
        maxLength={9}
        autoComplete="off"
        trailing={<InfoHint text="Drug Enforcement Administration registration – 2 letters and 7 digits." />}
      />
    </div>
  </SectionCard>
);

/* ---------------------------------------------------------------- */
/*  Step 1 – Profile & Registration                                  */
/* ---------------------------------------------------------------- */
const ProfileRegistration = ({ values, errors, onChange }: StepProps<RegistrationValues>) => {
  const photoRef = useRef<HTMLInputElement>(null);
  const [photoError, setPhotoError] = useState<string | undefined>();

  const initials = `${values.firstName[0] ?? ""}${values.lastName[0] ?? ""}`.toUpperCase();

  const pickPhoto = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return setPhotoError("Choose an image file (JPG or PNG).");
    if (file.size > MAX_PHOTO_MB * 1024 * 1024) return setPhotoError(`The photo must be under ${MAX_PHOTO_MB} MB.`);
    setPhotoError(undefined);
    if (values.photo) URL.revokeObjectURL(values.photo);
    onChange({ photo: URL.createObjectURL(file) });
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="grid gap-4 sm:gap-5 2xl:grid-cols-2">
        {/* Personal information */}
        <SectionCard icon={<User className="h-4 w-4" />} title="Personal Information">
          <div className="flex flex-col gap-5 sm:flex-row">
            <div className="shrink-0 self-center sm:self-start">
              <div className="relative h-28 w-28">
                <span className="flex h-full w-full items-center justify-center overflow-hidden rounded-full border-2 border-border bg-shape-sky/40 text-2xl font-semibold text-primary">
                  {values.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={values.photo} alt="Profile photo" className="h-full w-full object-cover" />
                  ) : initials ? (
                    initials
                  ) : (
                    <UserCircle2 className="h-12 w-12 text-body" strokeWidth={1.5} />
                  )}
                </span>
                <EditButton
                  section="photo"
                  label="Change"
                  onEdit={() => photoRef.current?.click()}
                  className="absolute bottom-0 right-0 !h-8 !w-8 !justify-center !gap-0 !rounded-full !bg-primary !p-0 !text-[0px] !text-on-primary !shadow hover:!opacity-90 focus-visible:ring-primary/40"
                />
                <input
                  ref={photoRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    pickPhoto(e.target.files?.[0]);
                    e.target.value = "";
                  }}
                />
              </div>
              <FieldError message={photoError} />
            </div>

            <div className="grid min-w-0 flex-1 gap-4 sm:grid-cols-2">
              <SignupField
                name="firstName"
                label={<>First Name<Req /></>}
                placeholder="Enter first name"
                value={values.firstName}
                onChange={(e) => onChange({ firstName: e.target.value })}
                error={errors.firstName}
                maxLength={100}
                autoComplete="off"
              />
              <SignupField
                name="lastName"
                label={<>Last Name<Req /></>}
                placeholder="Enter last name"
                value={values.lastName}
                onChange={(e) => onChange({ lastName: e.target.value })}
                error={errors.lastName}
                maxLength={100}
                autoComplete="off"
              />
              <SignupField
                name="email"
                type="email"
                label={<>Email<Req /></>}
                placeholder="Enter email address"
                value={values.email}
                onChange={(e) => onChange({ email: e.target.value })}
                error={errors.email}
                autoComplete="off"
              />
              <PhoneField
                name="phone"
                label={<>Phone<Req /></>}
                placeholder="Enter phone number"
                value={values.phone}
                onChange={(v) => onChange({ phone: v })}
                countryCode={values.phoneCountry}
                onCountryChange={(iso) => onChange({ phoneCountry: iso })}
                error={errors.phone}
              />
            </div>
          </div>
        </SectionCard>

        {/* Practitioner details */}
        <SectionCard icon={<Stethoscope className="h-4 w-4" />} title="Practitioner Details">
          <div className="grid gap-4 sm:grid-cols-2">
            <SignupDropdown
              name="providerType"
              label={<>Provider Type<Req /></>}
              placeholder="Select provider type"
              options={PROVIDER_TYPE_OPTIONS}
              value={values.providerType}
              onChange={(v) => onChange({ providerType: v })}
              error={errors.providerType}
            />
            <SignupDropdown
              name="specialty"
              label={<>Primary Specialty<Req /></>}
              placeholder="Select specialty"
              options={SPECIALTIES}
              value={values.specialty}
              onChange={(v) => onChange({ specialty: v, subspecialty: "" })}
              error={errors.specialty}
            />
            <SignupDropdown
              key={`sub-${values.specialty}`}
              name="subspecialty"
              label="Subspecialty"
              placeholder="Select (Optional)"
              options={getSubspecialtyOptions(values.specialty)}
              value={values.subspecialty}
              onChange={(v) => onChange({ subspecialty: v })}
              disabled={getSubspecialtyOptions(values.specialty).length === 0}
            />
            <SignupDropdown
              name="experience"
              label={<>Years of Experience<Req /></>}
              placeholder="Select experience"
              options={EXPERIENCE_OPTIONS}
              value={values.experience}
              onChange={(v) => onChange({ experience: v })}
              error={errors.experience}
            />
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-4 sm:gap-5 2xl:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <ProviderIdentifiersCard
          npi={values.npi}
          dea={values.dea}
          errors={errors}
          onChange={(patch) => onChange(patch)}
        />

        {/* Professional summary */}
        <SectionCard icon={<User className="h-4 w-4" />} title="Professional Summary">
          <div className="space-y-4">
            <ChipSelect
              name="qualifications"
              label="Qualifications / Degree *"
              options={QUALIFICATION_OPTIONS}
              value={values.qualifications}
              onChange={(v) => onChange({ qualifications: v })}
              placeholder="Select qualifications"
              error={errors.qualifications}
            />
            <TextArea
              name="bio"
              label="Professional Bio"
              placeholder="Tell patients about your experience and approach to care"
              value={values.bio}
              onChange={(v) => onChange({ bio: v })}
              maxLength={500}
              rows={4}
            />
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-4 sm:gap-5 2xl:grid-cols-2">
        {/* Specialties & services */}
        <SectionCard icon={<Layers className="h-4 w-4" />} title="Specialties & Services">
          <div className="space-y-4">
            <ChipSelect
              name="services"
              label="Services Offered *"
              options={SERVICE_OPTIONS}
              value={values.services}
              onChange={(v) => onChange({ services: v })}
              placeholder="Select services"
              error={errors.services}
            />
            <CheckGroup
              label={<>Consultation Types<Req /></>}
              options={CONSULTATION_TYPES}
              value={values.consultationTypes}
              onChange={(v) => onChange({ consultationTypes: v })}
              error={errors.consultationTypes}
            />
          </div>
        </SectionCard>

        {/* Languages & patient care */}
        <SectionCard icon={<Globe className="h-4 w-4" />} title="Languages & Patient Care">
          <div className="space-y-4">
            <ChipSelect
              name="languages"
              label="Languages Spoken *"
              options={LANGUAGE_OPTIONS}
              value={values.languages}
              onChange={(v) => onChange({ languages: v })}
              placeholder="Select languages"
              error={errors.languages}
            />
            <CheckGroup
              label={<>Patient Age Groups<Req /></>}
              options={AGE_GROUPS}
              value={values.ageGroups}
              onChange={(v) => onChange({ ageGroups: v })}
              error={errors.ageGroups}
            />
          </div>
        </SectionCard>
      </div>
    </div>
  );
};

export default ProfileRegistration;