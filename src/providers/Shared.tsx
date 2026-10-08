"use client";

import React, { ReactNode, useMemo } from "react";
import { Country, State, City } from "country-state-city";
import { CountryCode, isValidPhoneNumber } from "libphonenumber-js";
import {
  postcodeValidator,
  postcodeValidatorExistsForCountry,
} from "postcode-validator";
import { X } from "lucide-react";

import SignupField, { FieldError } from "@/components/SignupField";
import SignupDropdown, { DropdownOption } from "@/components/SignupDropdown";

/* ---------------------------------------------------------------- */
/*  Types                                                           */
/* ---------------------------------------------------------------- */
export type Errors = Record<string, string>;

export interface StepProps<V> {
  values: V;
  errors: Errors;
  onChange: (patch: Partial<V>) => void;
}

/* ---------------------------------------------------------------- */
/*  Styles + tiny helpers                                           */
/* ---------------------------------------------------------------- */
export const labelCls = "mb-2 block text-sm font-medium text-label";
export const cardCls = "rounded-2xl border border-border bg-card p-4 sm:p-5";

export const Req = () => <span className="text-danger"> *</span>;
export const Opt = () => (
  <span className="font-normal text-body"> (Optional)</span>
);

/** Unique id for rows created after first render (never used for initial state) */
export const uid = () =>
  `id_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;

export const pad = (n: number) => String(n).padStart(2, "0");

export const todayISO = () => {
  const n = new Date();
  return `${n.getFullYear()}-${pad(n.getMonth() + 1)}-${pad(n.getDate())}`;
};

export const toOptions = (list: string[]): DropdownOption[] =>
  list.map((v) => ({ value: v, label: v }));

/* ---------------------------------------------------------------- */
/*  Static option lists                                             */
/* ---------------------------------------------------------------- */
export const DEFAULT_COUNTRY = "US";

const ALL_COUNTRIES = Country.getAllCountries();

export const COUNTRY_OPTIONS: DropdownOption[] = ALL_COUNTRIES.map((c) => ({
  value: c.isoCode,
  label: c.name,
}));

export const PHONE_CODE_OPTIONS: DropdownOption[] = ALL_COUNTRIES.map((c) => ({
  value: c.isoCode,
  label: `${c.isoCode} +${(c.phonecode || "").replace(/^\+/, "")}`,
}));

export const US_STATE_OPTIONS: DropdownOption[] = State.getStatesOfCountry(
  "US",
).map((s) => ({ value: s.isoCode, label: s.name }));

export const TITLES = toOptions(["Dr.", "Prof.", "MD", "DO", "NP", "PA-C", "RN", "PhD"]);

export const PROVIDER_TYPES: DropdownOption[] = [
  { value: "MD", label: "MD (Doctor of Medicine)" },
  { value: "DO", label: "DO (Doctor of Osteopathic Medicine)" },
  { value: "NP", label: "NP (Nurse Practitioner)" },
  { value: "PA", label: "PA (Physician Assistant)" },
  { value: "RN", label: "RN (Registered Nurse)" },
  { value: "PSY", label: "Psychologist" },
];

const SUBSPECIALTY_MAP: Record<string, string[]> = {
  "Internal Medicine": [
    "Cardiology",
    "Endocrinology",
    "Gastroenterology",
    "Nephrology",
    "Oncology",
    "Pulmonology",
  ],
  "Family Medicine": ["Adolescent Medicine", "Geriatrics", "Sports Medicine"],
  Pediatrics: ["Neonatology", "Pediatric Cardiology", "Pediatric Neurology"],
  Cardiology: ["Electrophysiology", "Interventional Cardiology"],
  Dermatology: ["Cosmetic Dermatology", "Pediatric Dermatology"],
  Psychiatry: ["Addiction Psychiatry", "Child & Adolescent Psychiatry"],
  Orthopedics: ["Spine Surgery", "Sports Medicine"],
  "Obstetrics & Gynecology": [
    "Maternal-Fetal Medicine",
    "Reproductive Endocrinology",
  ],
};

export const SPECIALTIES = toOptions([
  "Cardiology",
  "Dermatology",
  "Family Medicine",
  "Internal Medicine",
  "Neurology",
  "Obstetrics & Gynecology",
  "Orthopedics",
  "Pediatrics",
  "Psychiatry",
  "Radiology",
]);

export const getSubspecialtyOptions = (specialty: string) =>
  toOptions(SUBSPECIALTY_MAP[specialty] ?? []);

/* ---------------------------------------------------------------- */
/*  Location helpers (country-state-city)                           */
/* ---------------------------------------------------------------- */
export const getStateOptions = (country: string): DropdownOption[] =>
  country
    ? State.getStatesOfCountry(country).map((s) => ({
        value: s.isoCode,
        label: s.name,
      }))
    : [];

export const getCityOptions = (
  country: string,
  state: string,
): DropdownOption[] => {
  if (!country) return [];
  const hasStates = State.getStatesOfCountry(country).length > 0;
  const list = state
    ? City.getCitiesOfState(country, state)
    : !hasStates
      ? (City.getCitiesOfCountry(country) ?? [])
      : [];
  const seen = new Set<string>();
  const out: DropdownOption[] = [];
  for (const c of list) {
    if (!seen.has(c.name)) {
      seen.add(c.name);
      out.push({ value: c.name, label: c.name });
    }
  }
  return out;
};

export const postalLabelFor = (country: string) =>
  country === "IN" ? "PIN Code" : country === "US" ? "ZIP Code" : "Postal Code";

/* ---------------------------------------------------------------- */
/*  Validation helpers                                              */
/* ---------------------------------------------------------------- */
export const validatePhone = (
  value: string,
  country: string,
  required: boolean,
): string | undefined => {
  if (!value.trim()) return required ? "Phone number is required." : undefined;
  return isValidPhoneNumber(value.trim(), country as CountryCode)
    ? undefined
    : "Enter a valid phone number for the selected country.";
};

export interface AddressValues {
  address1: string;
  address2: string;
  country: string;
  state: string;
  city: string;
  zip: string;
}

export const emptyAddress = (): AddressValues => ({
  address1: "",
  address2: "",
  country: DEFAULT_COUNTRY,
  state: "",
  city: "",
  zip: "",
});

export const validateAddress = (v: AddressValues, prefix = ""): Errors => {
  const e: Errors = {};
  if (!v.address1.trim()) e[`${prefix}address1`] = "Address line 1 is required.";
  if (!v.country) e[`${prefix}country`] = "Country is required.";

  if (getStateOptions(v.country).length > 0 && !v.state)
    e[`${prefix}state`] = "State is required.";
  if (getCityOptions(v.country, v.state).length > 0 && !v.city)
    e[`${prefix}city`] = "City is required.";

  const label = postalLabelFor(v.country);
  const zip = v.zip.trim();
  if (!zip) e[`${prefix}zip`] = `${label} is required.`;
  else {
    const ok =
      v.country && postcodeValidatorExistsForCountry(v.country)
        ? postcodeValidator(zip, v.country)
        : /^[A-Za-z0-9\s-]{3,10}$/.test(zip);
    if (!ok) e[`${prefix}zip`] = `Enter a valid ${label.toLowerCase()}.`;
  }
  return e;
};

/* ---------------------------------------------------------------- */
/*  SectionCard                                                     */
/* ---------------------------------------------------------------- */
export const SectionCard = ({
  step,
  icon,
  title,
  subtitle,
  action,
  children,
}: {
  step?: number;
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
}) => (
  <section className={`${cardCls} sm:p-6`}>
    <div className="mb-4 flex items-center gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
        {icon ?? step}
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="text-base font-semibold text-heading">{title}</h3>
        {subtitle && <p className="text-xs text-body">{subtitle}</p>}
      </div>
      {action}
    </div>
    {children}
  </section>
);

/* ---------------------------------------------------------------- */
/*  PhoneField (country code SignupDropdown + number input)         */
/* ---------------------------------------------------------------- */
export const PhoneField = ({
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

/* ---------------------------------------------------------------- */
/*  AddressFields (dynamic Country -> State -> City + PIN/ZIP)      */
/* ---------------------------------------------------------------- */
export const AddressFields = ({
  values,
  errors,
  onChange,
  prefix = "",
}: {
  values: AddressValues;
  errors: Errors;
  onChange: (patch: Partial<AddressValues>) => void;
  prefix?: string;
}) => {
  const stateOptions = useMemo(
    () => getStateOptions(values.country),
    [values.country],
  );
  const cityOptions = useMemo(
    () => getCityOptions(values.country, values.state),
    [values.country, values.state],
  );
  const postalLabel = postalLabelFor(values.country);

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <SignupField
          name={`${prefix}address1`}
          label={<>Address Line 1<Req /></>}
          placeholder="Enter address line 1"
          value={values.address1}
          onChange={(e) => onChange({ address1: e.target.value })}
          error={errors[`${prefix}address1`]}
        />
        <SignupField
          name={`${prefix}address2`}
          label={<>Address Line 2<Opt /></>}
          placeholder="Enter address line 2"
          value={values.address2}
          onChange={(e) => onChange({ address2: e.target.value })}
        />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SignupDropdown
          name={`${prefix}country`}
          label="Country *"
          placeholder="Select country"
          options={COUNTRY_OPTIONS}
          value={values.country}
          onChange={(iso) =>
            onChange({ country: iso, state: "", city: "", zip: "" })
          }
          error={errors[`${prefix}country`]}
        />
        <SignupDropdown
          key={`state-${values.country}`}
          name={`${prefix}state`}
          label="State *"
          placeholder={
            stateOptions.length ? "Select state" : "No states available"
          }
          options={stateOptions}
          value={values.state}
          onChange={(iso) => onChange({ state: iso, city: "" })}
          disabled={stateOptions.length === 0}
          error={errors[`${prefix}state`]}
        />
        <SignupDropdown
          key={`city-${values.country}-${values.state}`}
          name={`${prefix}city`}
          label="City *"
          placeholder={
            stateOptions.length && !values.state
              ? "Select state first"
              : cityOptions.length
                ? "Select city"
                : "No cities available"
          }
          options={cityOptions}
          value={values.city}
          onChange={(v) => onChange({ city: v })}
          disabled={
            cityOptions.length === 0 ||
            (stateOptions.length > 0 && !values.state)
          }
          error={errors[`${prefix}city`]}
        />
        <SignupField
          name={`${prefix}zip`}
          label={<>{postalLabel}<Req /></>}
          placeholder={`Enter ${postalLabel.toLowerCase()}`}
          value={values.zip}
          onChange={(e) => onChange({ zip: e.target.value })}
          error={errors[`${prefix}zip`]}
        />
      </div>
    </>
  );
};

/* ---------------------------------------------------------------- */
/*  Switch                                                          */
/* ---------------------------------------------------------------- */
export const Switch = ({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
}) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    disabled={disabled}
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/25 disabled:cursor-not-allowed disabled:opacity-60 ${
      checked ? "bg-primary" : "bg-divider"
    }`}
  >
    <span
      className={`pointer-events-none absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-card shadow transition-transform duration-200 ${
        checked ? "translate-x-5" : ""
      }`}
    />
  </button>
);

/* ---------------------------------------------------------------- */
/*  ChipSelect: multi-select built on SignupDropdown                */
/* ---------------------------------------------------------------- */
export const ChipSelect = ({
  name,
  label,
  options,
  value,
  onChange,
  placeholder,
  error,
}: {
  name: string;
  label: string;
  options: DropdownOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder: string;
  error?: string;
}) => {
  const available = options.filter((o) => !value.includes(o.value));
  return (
    <div className="w-full">
      <SignupDropdown
        name={name}
        label={label}
        placeholder={available.length ? placeholder : "All selected"}
        options={available}
        value=""
        onChange={(v) => onChange([...value, v])}
        disabled={available.length === 0}
        error={error}
      />
      {value.length > 0 && (
        <ul className="-mt-1 flex flex-wrap gap-2">
          {value.map((v) => (
            <li
              key={v}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 py-1 pl-2.5 pr-1.5 text-xs font-medium text-heading"
            >
              {options.find((o) => o.value === v)?.label ?? v}
              <button
                type="button"
                aria-label={`Remove ${v}`}
                onClick={() => onChange(value.filter((x) => x !== v))}
                className="flex h-4 w-4 cursor-pointer items-center justify-center rounded text-body transition-colors hover:bg-danger/10 hover:text-danger"
              >
                <X className="h-3 w-3" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

/* ---------------------------------------------------------------- */
/*  TextArea (matches field styling, optional counter)              */
/* ---------------------------------------------------------------- */
export const TextArea = ({
  name,
  label,
  value,
  onChange,
  placeholder,
  maxLength,
  rows = 4,
  error,
}: {
  name: string;
  label?: ReactNode;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  rows?: number;
  error?: string;
}) => (
  <div className="w-full">
    {label && (
      <label htmlFor={name} className={labelCls}>
        {label}
      </label>
    )}
    <div
      className={`rounded-xl border bg-card transition-colors duration-200 focus-within:border-primary hover:border-primary/50 ${
        error ? "border-danger" : "border-border"
      }`}
    >
      <textarea
        id={name}
        name={name}
        rows={rows}
        maxLength={maxLength}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="block w-full resize-none rounded-xl bg-transparent px-4 pt-3 text-sm text-heading outline-none placeholder:text-placeholder"
      />
      {maxLength && (
        <p className="px-3 pb-2 text-right text-xs text-body">
          {value.length}/{maxLength}
        </p>
      )}
    </div>
    <FieldError message={error} />
  </div>
);