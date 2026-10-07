"use client";

import React, { ReactNode, SelectHTMLAttributes } from "react";
import { CalendarDays, ChevronDown, ImagePlus, User } from "lucide-react";

import SignupField, { FieldError } from "@/components/SignupField";
import AddButton from "@/components/Addbutton";
import ImportButton from "@/components/ImportButton";
import Breadcrumb from "@/components/Breadcrumb";

/* ---------- Static data ---------- */
const GENDERS = ["Male", "Female", "Other"];
const MARITAL = ["Single", "Married", "Divorced", "Widowed"];
const BLOOD = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const LANGUAGES = ["English", "Spanish", "French", "German", "Hindi"];
const STATES = ["California", "Florida", "New York", "Texas", "Washington"];
const COUNTRIES = ["United States", "Canada", "United Kingdom", "India"];

const ROLES = [
  { id: "patient", label: "Patient", desc: "Can book appointments, access records and communicate with providers.", checked: true },
  { id: "practitioner", label: "Practitioner / MD", desc: "Can manage calendar, patient charts, prescriptions and consultations.", checked: false },
  { id: "receptionist", label: "Receptionist / Staff", desc: "Can manage booking, check ins, communications and billing.", checked: false },
  { id: "admin", label: "Administrator", desc: "Full access to manage platform records and settings.", checked: false },
];

/* ---------- Shared styles ---------- */
const labelCls = "mb-2 block text-sm font-medium text-label";
const controlCls =
  "h-12 w-full rounded-xl border border-border bg-card text-sm text-heading outline-none transition-colors duration-200 hover:border-primary/50 focus:border-primary placeholder:text-placeholder disabled:cursor-not-allowed disabled:opacity-60";
const checkboxCls =
  "mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-border accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30";
const cardCls = "rounded-2xl border border-border bg-card p-4 sm:p-5";

/* ---------- Small helpers ---------- */
const Req = () => <span className="text-danger"> *</span>;
const Opt = () => <span className="font-normal text-body"> (Optional)</span>;

/* Select that matches SignupField styling */
interface SelectFieldProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "className"> {
  label?: ReactNode;
  placeholder: string;
  options: string[];
  error?: string;
}

const SelectField = ({
  label,
  placeholder,
  options,
  error,
  id,
  name,
  ...rest
}: SelectFieldProps) => {
  const inputId = id || name;
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className={labelCls}>
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={inputId}
          name={name}
          defaultValue=""
          className={`${controlCls} cursor-pointer appearance-none pl-4 pr-10 invalid:text-placeholder ${
            error ? "border-danger" : ""
          }`}
          required
          {...rest}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((o) => (
            <option key={o} value={o} className="text-heading">
              {o}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-body" />
      </div>
      <FieldError message={error} />
    </div>
  );
};

/* Phone input with flag + country code prefix */
const PhoneField = ({
  label,
  placeholder,
  name,
}: {
  label: ReactNode;
  placeholder: string;
  name: string;
}) => (
  <div className="w-full">
    <label htmlFor={name} className={labelCls}>
      {label}
    </label>
    <div className="flex h-12 w-full items-center rounded-xl border border-border bg-card transition-colors duration-200 focus-within:border-primary hover:border-primary/50">
      <span className="flex shrink-0 items-center gap-1.5 pl-3.5 pr-2 text-sm text-heading">
        <span aria-hidden="true" className="text-base leading-none">
          🇺🇸
        </span>
        <span>+1</span>
      </span>
      <input
        id={name}
        name={name}
        type="tel"
        placeholder={placeholder}
        className="h-full min-w-0 flex-1 rounded-r-xl bg-transparent pr-4 text-sm text-heading outline-none placeholder:text-placeholder"
      />
    </div>
    <FieldError message={undefined} />
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

/* ---------- Page ---------- */
const AddPatient = () => {
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

{/* Buttons — always side by side, share width on phones */}
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
  />
</div>
</div>

      <div className="grid items-start gap-4 sm:gap-5 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_380px]">
        {/* ================= LEFT: FORM ================= */}
        <form className={`${cardCls} sm:p-6`} onSubmit={(e) => e.preventDefault()}>
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
              />
              <SignupField
                name="lastName"
                label={<>Last Name<Req /></>}
                placeholder="Enter last name"
              />
              <SignupField
                name="dob"
                label={<>Date of Birth<Req /></>}
                placeholder="Select date"
                trailing={<CalendarDays className="h-4 w-4 text-body" />}
              />
              <SelectField
                name="gender"
                label={<>Gender<Req /></>}
                placeholder="Select gender"
                options={GENDERS}
              />
              <PhoneField
                name="phone"
                label={<>Phone Number<Req /></>}
                placeholder="Enter phone number"
              />
              <SignupField
                name="email"
                type="email"
                label={<>Email Address<Req /></>}
                placeholder="Enter email address"
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
              />
              <SelectField
                name="marital"
                label="Marital Status"
                placeholder="Select marital status"
                options={MARITAL}
              />
              <SelectField
                name="blood"
                label="Blood Type"
                placeholder="Select blood type"
                options={BLOOD}
              />
              <SelectField
                name="language"
                label="Preferred Language"
                placeholder="Select language"
                options={LANGUAGES}
              />
              <SignupField
                name="emergencyName"
                label="Emergency Contact Name"
                placeholder="Enter contact name"
              />
              <PhoneField
                name="emergencyPhone"
                label="Emergency Contact Number"
                placeholder="Enter phone number"
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
              />
              <SignupField
                name="address2"
                label={<>Address Line 2<Opt /></>}
                placeholder="Enter address line 2"
              />
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <SignupField name="city" label="City" placeholder="Enter city" />
              <SelectField
                name="state"
                label="State"
                placeholder="Select state"
                options={STATES}
              />
              <SignupField
                name="zip"
                label="ZIP Code"
                placeholder="Enter zip code"
                inputMode="numeric"
              />
              <SelectField
                name="country"
                label="Country"
                placeholder="Select country"
                options={COUNTRIES}
                defaultValue="United States"
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