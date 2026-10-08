"use client";

import React, { ReactNode, useMemo } from "react";
import { ImagePlus, User } from "lucide-react";
import { Country, State, City } from "country-state-city";
import {
  isValidPhoneNumber,
  parsePhoneNumberFromString,
  CountryCode,
} from "libphonenumber-js";
import {
  postcodeValidator,
  postcodeValidatorExistsForCountry,
} from "postcode-validator";

import SignupField, { FieldError } from "@/components/SignupField";
import SignupDropdown, { DropdownOption } from "@/components/SignupDropdown";
import AddButton from "@/components/Addbutton";
import ImportButton from "@/components/ImportButton";
import Breadcrumb from "@/components/Breadcrumb";
import DatePicker from "@/components/Datepicker";
/* ---------- Static data ---------- */
const GENDERS: DropdownOption[] = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
  { value: "Other", label: "Other" },
];

const MARITAL: DropdownOption[] = [
  { value: "Single", label: "Single" },
  { value: "Married", label: "Married" },
  { value: "Divorced", label: "Divorced" },
  { value: "Widowed", label: "Widowed" },
];

const BLOOD: DropdownOption[] = [
  { value: "A+", label: "A+" },
  { value: "A-", label: "A-" },
  { value: "B+", label: "B+" },
  { value: "B-", label: "B-" },
  { value: "AB+", label: "AB+" },
  { value: "AB-", label: "AB-" },
  { value: "O+", label: "O+" },
  { value: "O-", label: "O-" },
];

const LANGUAGES: DropdownOption[] = [
  { value: "English", label: "English" },
  { value: "Spanish", label: "Spanish" },
  { value: "French", label: "French" },
  { value: "German", label: "German" },
  { value: "Hindi", label: "Hindi" },
];

const ROLES = [
  { id: "patient", label: "Patient", desc: "Can book appointments, access records and communicate with providers.", checked: true },
  { id: "practitioner", label: "Practitioner / MD", desc: "Can manage calendar, patient charts, prescriptions and consultations.", checked: false },
  { id: "receptionist", label: "Receptionist / Staff", desc: "Can manage booking, check ins, communications and billing.", checked: false },
  { id: "admin", label: "Administrator", desc: "Full access to manage platform records and settings.", checked: false },
];

/* ---------- Dynamic location data (from library) ---------- */
const ALL_COUNTRIES = Country.getAllCountries();

// Address country dropdown: value = ISO code (e.g. "IN"), label = name
const COUNTRY_OPTIONS: DropdownOption[] = ALL_COUNTRIES.map((c) => ({
  value: c.isoCode,
  label: c.name,
}));

// Phone code dropdown: value = ISO code, label = "IN +91"
const PHONE_CODE_OPTIONS: DropdownOption[] = ALL_COUNTRIES.map((c) => ({
  value: c.isoCode,
  label: `${c.isoCode} +${(c.phonecode || "").replace(/^\+/, "")}`,
}));
const DEFAULT_COUNTRY = "US";

/* ---------- Shared styles ---------- */
const labelCls = "mb-2 block text-sm font-medium text-label";
const checkboxCls =
  "mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-border accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30";
const cardCls = "rounded-2xl border border-border bg-card p-4 sm:p-5";

/* ---------- Small helpers ---------- */
const Req = () => <span className="text-danger"> *</span>;
const Opt = () => <span className="font-normal text-body"> (Optional)</span>;

/* Phone input: country-code SignupDropdown + number input */
const PhoneField = ({
  label,
  placeholder,
  name,
  value,
  onChange,
  countryCode,
  onCountryChange,
  error,
}: {
  label: ReactNode;
  placeholder: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  countryCode: string;
  onCountryChange: (iso: string) => void;
  error?: string;
}) => (
  <div className="w-full">
    <label htmlFor={name} className={labelCls}>
      {label}
    </label>
    <div className="flex items-start gap-2">
      <SignupDropdown
        name={`${name}Country`}
               className="!w-[104px] shrink-0"
        options={PHONE_CODE_OPTIONS}
        value={countryCode}
        onChange={onCountryChange}
        placeholder="Code"
      />
      <div
        className={`flex h-12 min-w-0 flex-1 items-center rounded-xl border bg-card transition-colors duration-200 focus-within:border-primary hover:border-primary/50 ${
          error ? "border-danger" : "border-border"
        }`}
      >
        <input
          id={name}
          name={name}
          type="tel"
          inputMode="tel"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-full min-w-0 flex-1 rounded-xl bg-transparent px-4 text-sm text-heading outline-none placeholder:text-placeholder"
        />
      </div>
    </div>
    <FieldError message={error} />
  </div>
);

/* Numbered section header */
const SectionHeader = ({
  step,
  title,
  subtitle,
}: {
  step: number;
  title: string;
  subtitle: string;
}) => (
  <div className="mb-4 flex items-center gap-3">
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
      {step}
    </span>
    <div className="min-w-0">
      <h3 className="text-base font-semibold text-heading">{title}</h3>
      <p className="text-xs text-body">{subtitle}</p>
    </div>
  </div>
);

/* ---------- Validation types ---------- */
interface FormValues {
  firstName: string;
  lastName: string;
  dob: string;
  gender: string;
  phoneCountry: string;
  phone: string;
  email: string;
  patientId: string;
  marital: string;
  blood: string;
  language: string;
  emergencyName: string;
  emergencyPhoneCountry: string;
  emergencyPhone: string;
  address1: string;
  address2: string;
  country: string; // ISO code
  state: string; // ISO code
  city: string; // city name
  zip: string;
}

type FormErrors = Partial<Record<keyof FormValues, string>>;

/* ---------- Page ---------- */
const AddPatient = () => {
  const [values, setValues] = React.useState<FormValues>({
    firstName: "",
    lastName: "",
    dob: "",
    gender: "",
    phoneCountry: DEFAULT_COUNTRY,
    phone: "",
    email: "",
    patientId: "",
    marital: "",
    blood: "",
    language: "",
    emergencyName: "",
    emergencyPhoneCountry: DEFAULT_COUNTRY,
    emergencyPhone: "",
    address1: "",
    address2: "",
    country: DEFAULT_COUNTRY,
    state: "",
    city: "",
    zip: "",
  });

  const [errors, setErrors] = React.useState<FormErrors>({});
  const [submitted, setSubmitted] = React.useState(false);

  /* ---------- Dependent dropdown options ---------- */
  const stateOptions: DropdownOption[] = useMemo(
    () =>
      State.getStatesOfCountry(values.country).map((s) => ({
        value: s.isoCode,
        label: s.name,
      })),
    [values.country],
  );

  const cityOptions: DropdownOption[] = useMemo(() => {
    const list = values.state
      ? City.getCitiesOfState(values.country, values.state)
      : stateOptions.length === 0
        ? City.getCitiesOfCountry(values.country) ?? []
        : [];
    // de-duplicate by name so option keys are unique
    const seen = new Set<string>();
    const out: DropdownOption[] = [];
    for (const c of list) {
      if (!seen.has(c.name)) {
        seen.add(c.name);
        out.push({ value: c.name, label: c.name });
      }
    }
    return out;
  }, [values.country, values.state, stateOptions.length]);

  const postalLabel = values.country === "IN" ? "PIN Code" : values.country === "US" ? "ZIP Code" : "Postal Code";

  /* ---------- Field setters ---------- */
  const clearError = (field: keyof FormValues) => {
    if (submitted) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const setField = (field: keyof FormValues, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    clearError(field);
  };

  const handleCountryChange = (iso: string) => {
    // Changing country resets state/city/zip and syncs phone codes
    setValues((prev) => ({
      ...prev,
      country: iso,
      state: "",
      city: "",
      zip: "",
      phoneCountry: iso,
      emergencyPhoneCountry: iso,
    }));
    clearError("country");
    clearError("state");
    clearError("city");
    clearError("zip");
  };

  const handleStateChange = (iso: string) => {
    setValues((prev) => ({ ...prev, state: iso, city: "" }));
    clearError("state");
    clearError("city");
  };

  /* ---------- Validation ---------- */
  const validate = (vals: FormValues): FormErrors => {
    const errs: FormErrors = {};

    if (!vals.firstName.trim()) errs.firstName = "First name is required.";
    else if (vals.firstName.trim().length < 2)
      errs.firstName = "First name must be at least 2 characters.";

    if (!vals.lastName.trim()) errs.lastName = "Last name is required.";
    else if (vals.lastName.trim().length < 2)
      errs.lastName = "Last name must be at least 2 characters.";

    if (!vals.dob.trim()) errs.dob = "Date of birth is required.";

    if (!vals.gender) errs.gender = "Gender is required.";

    // Phone (validated against the selected country code)
    if (!vals.phone.trim()) {
      errs.phone = "Phone number is required.";
    } else if (
      !isValidPhoneNumber(vals.phone.trim(), vals.phoneCountry as CountryCode)
    ) {
      errs.phone = "Enter a valid phone number for the selected country.";
    }

    if (!vals.email.trim()) errs.email = "Email address is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(vals.email.trim()))
      errs.email = "Enter a valid email address.";

    // Emergency phone (optional, validate only if filled)
    if (
      vals.emergencyPhone.trim() &&
      !isValidPhoneNumber(
        vals.emergencyPhone.trim(),
        vals.emergencyPhoneCountry as CountryCode,
      )
    ) {
      errs.emergencyPhone = "Enter a valid phone number for the selected country.";
    }

    if (!vals.country) errs.country = "Country is required.";

    // ZIP / PIN (optional, validated per country)
    if (vals.zip.trim() && vals.country) {
      const zip = vals.zip.trim();
      const ok = postcodeValidatorExistsForCountry(vals.country)
        ? postcodeValidator(zip, vals.country)
        : /^[A-Za-z0-9\s-]{3,10}$/.test(zip);
      if (!ok) errs.zip = `Enter a valid ${postalLabel.toLowerCase()}.`;
    }

    return errs;
  };

  const toE164 = (national: string, iso: string) =>
    parsePhoneNumberFromString(national, iso as CountryCode)?.number ?? "";

  const submitForm = () => {
    setSubmitted(true);
    const errs = validate(values);
    setErrors(errs);

    if (Object.keys(errs).length === 0) {
      const payload = {
        ...values,
        phone: toE164(values.phone, values.phoneCountry),
        emergencyPhone: values.emergencyPhone
          ? toE164(values.emergencyPhone, values.emergencyPhoneCountry)
          : "",
        countryName: Country.getCountryByCode(values.country)?.name ?? "",
        stateName:
          State.getStateByCodeAndCountry(values.state, values.country)?.name ?? "",
      };
      console.log("Form submitted successfully:", payload);
      // TODO: call your API here
    } else {
      const firstErrorField = Object.keys(errs)[0];
      const el = document.getElementById(firstErrorField);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      el?.focus?.();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitForm();
  };

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-4 sm:space-y-5">
      <Breadcrumb
        items={[
          { label: "Patients", href: "/patients" },
          { label: "Add Patient" },
        ]}
      />

      {/* Title + actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-heading sm:text-xl 2xl:text-2xl">
            Add Patient
          </h2>
          <p className="mt-0.5 text-sm text-body">
            Create a new patient record in the system.
          </p>
        </div>

        <div className="flex flex-row gap-2">
          <ImportButton
            text="Cancel"
            icon={null}
            className="flex-1 sm:flex-none"
          />
          <AddButton
            text="Save Patient"
            icon={null}
            className="flex-1 sm:flex-none"
            onClick={submitForm}
          />
        </div>
      </div>

      <div className="grid items-start gap-4 sm:gap-5 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_380px]">
        {/* ================= LEFT: FORM ================= */}
        <form
          className={`${cardCls} sm:p-6`}
          onSubmit={handleSubmit}
          noValidate
        >
          {/* 1. Basic information */}
          <section>
            <SectionHeader
              step={1}
              title="Basic Information"
              subtitle="Enter the patient's personal details."
            />
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <SignupField
                name="firstName"
                label={<>First Name<Req /></>}
                placeholder="Enter first name"
                value={values.firstName}
                onChange={(e) => setField("firstName", e.target.value)}
                error={errors.firstName}
              />
              <SignupField
                name="lastName"
                label={<>Last Name<Req /></>}
                placeholder="Enter last name"
                value={values.lastName}
                onChange={(e) => setField("lastName", e.target.value)}
                error={errors.lastName}
              />
              <DatePicker
                name="dob"
                label={<>Date of Birth<Req /></>}
                placeholder="dd-mm-yyyy"
                value={values.dob}
                onChange={(v) => setField("dob", v)}
                maxDate={new Date().toISOString().split("T")[0]}
                error={errors.dob}
              />
              <SignupDropdown
                name="gender"
                label="Gender *"
                placeholder="Select gender"
                options={GENDERS}
                value={values.gender}
                onChange={(v) => setField("gender", v)}
                error={errors.gender}
              />
              <PhoneField
                name="phone"
                label={<>Phone Number<Req /></>}
                placeholder="Enter phone number"
                value={values.phone}
                onChange={(v) => setField("phone", v)}
                countryCode={values.phoneCountry}
                onCountryChange={(iso) => setField("phoneCountry", iso)}
                error={errors.phone}
              />
              <SignupField
                name="email"
                type="email"
                label={<>Email Address<Req /></>}
                placeholder="Enter email address"
                value={values.email}
                onChange={(e) => setField("email", e.target.value)}
                error={errors.email}
              />
            </div>
          </section>

          <hr className="my-6 border-divider" />

          {/* 2. Additional information */}
          <section>
            <SectionHeader
              step={2}
              title="Additional Information"
              subtitle="Additional details to complete the patient profile."
            />
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <SignupField
                name="patientId"
                label={<>Patient ID<Opt /></>}
                placeholder="Auto-generated if left blank"
                value={values.patientId}
                onChange={(e) => setField("patientId", e.target.value)}
                error={errors.patientId}
              />
              <SignupDropdown
                name="marital"
                label="Marital Status"
                placeholder="Select marital status"
                options={MARITAL}
                value={values.marital}
                onChange={(v) => setField("marital", v)}
                error={errors.marital}
              />
              <SignupDropdown
                name="blood"
                label="Blood Type"
                placeholder="Select blood type"
                options={BLOOD}
                value={values.blood}
                onChange={(v) => setField("blood", v)}
                error={errors.blood}
              />
              <SignupDropdown
                name="language"
                label="Preferred Language"
                placeholder="Select language"
                options={LANGUAGES}
                value={values.language}
                onChange={(v) => setField("language", v)}
                error={errors.language}
              />
              <SignupField
                name="emergencyName"
                label="Emergency Contact Name"
                placeholder="Enter contact name"
                value={values.emergencyName}
                onChange={(e) => setField("emergencyName", e.target.value)}
                error={errors.emergencyName}
              />
              <PhoneField
                name="emergencyPhone"
                label="Emergency Contact Number"
                placeholder="Enter phone number"
                value={values.emergencyPhone}
                onChange={(v) => setField("emergencyPhone", v)}
                countryCode={values.emergencyPhoneCountry}
                onCountryChange={(iso) => setField("emergencyPhoneCountry", iso)}
                error={errors.emergencyPhone}
              />
            </div>
          </section>

          <hr className="my-6 border-divider" />

          {/* 3. Address information */}
          <section>
            <SectionHeader
              step={3}
              title="Address Information"
              subtitle="Patient's residential address."
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <SignupField
                name="address1"
                label="Address Line 1"
                placeholder="Enter address line 1"
                value={values.address1}
                onChange={(e) => setField("address1", e.target.value)}
                error={errors.address1}
              />
              <SignupField
                name="address2"
                label={<>Address Line 2<Opt /></>}
                placeholder="Enter address line 2"
                value={values.address2}
                onChange={(e) => setField("address2", e.target.value)}
                error={errors.address2}
              />
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <SignupDropdown
                name="country"
                label="Country *"
                placeholder="Select country"
                options={COUNTRY_OPTIONS}
                value={values.country}
                onChange={handleCountryChange}
                error={errors.country}
              />
              <SignupDropdown
                key={`state-${values.country}`}
                name="state"
                label="State"
                placeholder={
                  stateOptions.length ? "Select state" : "No states available"
                }
                options={stateOptions}
                value={values.state}
                onChange={handleStateChange}
                disabled={stateOptions.length === 0}
                error={errors.state}
              />
              <SignupDropdown
                key={`city-${values.country}-${values.state}`}
                name="city"
                label="City"
                placeholder={
                  stateOptions.length && !values.state
                    ? "Select state first"
                    : cityOptions.length
                      ? "Select city"
                      : "No cities available"
                }
                options={cityOptions}
                value={values.city}
                onChange={(v) => setField("city", v)}
                disabled={
                  cityOptions.length === 0 ||
                  (stateOptions.length > 0 && !values.state)
                }
                error={errors.city}
              />
              <SignupField
                name="zip"
                label={postalLabel}
                placeholder={`Enter ${postalLabel.toLowerCase()}`}
                value={values.zip}
                onChange={(e) => setField("zip", e.target.value)}
                error={errors.zip}
              />
            </div>
          </section>
        </form>

        {/* ================= RIGHT: SIDEBAR ================= */}
        <aside className="space-y-4 sm:space-y-5">
          {/* Profile photo */}
          <section className={cardCls}>
            <h3 className="text-sm font-semibold text-heading">Profile Photo</h3>
            <div className="mt-4 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <span className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-shape-sky/40 text-body sm:h-28 sm:w-28">
                <User className="h-10 w-10" strokeWidth={1.5} />
              </span>
              <div>
                <button
                  type="button"
                  className="group inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-primary/20 bg-primary/10 px-4 text-sm font-medium text-primary transition-all duration-200 hover:border-primary/40 hover:bg-primary/15 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 active:scale-[0.98]"
                >
                  <ImagePlus className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5" />
                  Upload Photo
                </button>
                <p className="mt-2 text-xs text-body">JPG, PNG up to 5MB</p>
              </div>
            </div>
          </section>

          {/* Assign roles */}
          <section className={cardCls}>
            <h3 className="text-sm font-semibold text-heading">Assign Role(s)</h3>
            <p className="mt-1 text-xs text-body">
              Select which role(s) this user will have access to.
            </p>

            <div className="mt-4 space-y-4">
              {ROLES.map((r) => (
                <label
                  key={r.id}
                  htmlFor={`role-${r.id}`}
                  className="flex cursor-pointer items-start gap-3"
                >
                  <input
                    id={`role-${r.id}`}
                    type="checkbox"
                    defaultChecked={r.checked}
                    className={checkboxCls}
                  />
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-heading">
                      {r.label}
                    </span>
                    <span className="mt-0.5 block text-xs leading-relaxed text-body">
                      {r.desc}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </section>

          {/* Status */}
          <section className={cardCls}>
            <h3 className="text-sm font-semibold text-heading">Status</h3>
            <label
              htmlFor="status"
              className="mt-4 flex cursor-pointer items-start gap-3"
            >
              <span className="relative mt-0.5 inline-flex shrink-0">
                <input
                  id="status"
                  type="checkbox"
                  defaultChecked
                  className="peer sr-only"
                />
                <span className="h-6 w-11 rounded-full bg-divider transition-colors duration-200 peer-checked:bg-primary peer-focus-visible:ring-4 peer-focus-visible:ring-primary/25" />
                <span className="pointer-events-none absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-card shadow transition-transform duration-200 peer-checked:translate-x-5" />
              </span>
              <span>
                <span className="block text-sm font-medium text-heading">
                  Active
                </span>
                <span className="mt-0.5 block text-xs text-body">
                  Inactive users will not be able to access the platform.
                </span>
              </span>
            </label>
          </section>
        </aside>
      </div>
    </div>
  );
};

export default AddPatient;