"use client";

import React from "react";
import { HeartPulse, MapPin, ShieldCheck, User } from "lucide-react";

import SignupField from "@/components/SignupField";
import SignupDropdown from "@/components/SignupDropdown";
import DatePicker from "@/components/Datepicker";
import { ModalRadioGroup } from "@/components/Modalshell";
import { ChipSelect, Opt, toOptions, todayISO, type Errors, type StepProps } from "@/providers/Shared";

/* ---------- Values ---------- */
export interface ProfileValues {
  dob: string;
  gender: string;
  address: string;
  conditions: string[];
  allergies: string[];
  insuranceProvider: string;
  memberId: string;
}

export const initialProfile = (): ProfileValues => ({
  dob: "",
  gender: "",
  address: "",
  conditions: [],
  allergies: [],
  insuranceProvider: "",
  memberId: "",
});

/* ---------- Validation ---------- */
export const validateProfile = (v: ProfileValues): Errors => {
  const e: Errors = {};
  if (!v.dob) e.dob = "Date of birth is required.";
  else if (v.dob > todayISO()) e.dob = "Date of birth cannot be in the future.";
  if (!v.gender) e.gender = "Please select your gender.";
  if (!v.address.trim()) e.address = "Address is required.";
  else if (v.address.trim().length < 5) e.address = "Enter a complete address.";
  if (v.insuranceProvider && !v.memberId.trim()) e.memberId = "Enter your member ID / policy number.";
  return e;
};

/* ---------- Options (static) ---------- */
const GENDERS = [
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
  { value: "other", label: "Other" },
];
const CONDITIONS = toOptions(["Hypertension", "Diabetes (Type 2)", "Asthma", "Heart Disease", "Thyroid Disorder", "Arthritis"]);
const ALLERGIES = toOptions(["Penicillin", "Peanuts", "Latex", "Dust", "Sulfa Drugs", "Shellfish"]);
const INSURERS = toOptions(["Aetna", "Blue Cross Blue Shield", "Cigna", "UnitedHealthcare", "Medicare", "Other"]);

const Section = ({ icon, title, optional, children }: { icon: React.ReactNode; title: string; optional?: boolean; children: React.ReactNode }) => (
  <section className="rounded-xl border border-border p-4">
    <div className="mb-3 flex items-center gap-2.5">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">{icon}</span>
      <h3 className="text-sm font-semibold text-heading">
        {title}
        {optional && <Opt />}
      </h3>
    </div>
    {children}
  </section>
);

/* ---------- Component ---------- */
const PatientCompleteProfile = ({ values: v, errors, onChange }: StepProps<ProfileValues>) => (
  <div className="space-y-3">
    <Section icon={<User className="h-4 w-4" />} title="Personal Information">
      <div className="space-y-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <DatePicker
            id="dob"
            name="dob"
            label="Date of Birth *"
            value={v.dob}
            maxDate={todayISO()}
            onChange={(val: string) => onChange({ dob: val })}
            error={errors.dob}
          />
          <div id="gender">
            <ModalRadioGroup
              name="gender"
              label="Gender *"
              value={v.gender}
              onChange={(val) => onChange({ gender: val })}
              options={GENDERS}
              error={errors.gender}
            />
          </div>
        </div>
        <SignupField
          id="address"
          name="address"
          label="Address"
          placeholder="Enter your full address"
          autoComplete="street-address"
          icon={<MapPin className="h-[18px] w-[18px]" />}
          value={v.address}
          onChange={(e) => onChange({ address: e.target.value })}
          error={errors.address}
        />
      </div>
    </Section>

    <Section icon={<HeartPulse className="h-4 w-4" />} title="Medical Information" optional>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <ChipSelect
          name="conditions"
          label="Medical Conditions"
          placeholder="Add condition"
          options={CONDITIONS}
          value={v.conditions}
          onChange={(val) => onChange({ conditions: val })}
          menuMaxHeight={176}
        />
        <ChipSelect
          name="allergies"
          label="Allergies"
          placeholder="Add allergy"
          options={ALLERGIES}
          value={v.allergies}
          onChange={(val) => onChange({ allergies: val })}
          menuMaxHeight={176}
        />
      </div>
    </Section>

    <Section icon={<ShieldCheck className="h-4 w-4" />} title="Insurance Information" optional>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <SignupDropdown
          id="insuranceProvider"
          name="insuranceProvider"
          label="Insurance Provider"
          placeholder="Select insurance provider"
          searchable={false}
          options={INSURERS}
          value={v.insuranceProvider}
          onChange={(val) => onChange({ insuranceProvider: val })}
        />
        <SignupField
          id="memberId"
          name="memberId"
          label="Member ID / Policy Number"
          placeholder="Enter ID or policy number"
          value={v.memberId}
          onChange={(e) => onChange({ memberId: e.target.value })}
          error={errors.memberId}
        />
      </div>
    </Section>
  </div>
);

export default PatientCompleteProfile;