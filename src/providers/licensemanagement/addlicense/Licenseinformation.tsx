"use client";

import React from "react";

import type { TagTone } from "@/components/Tags";
import SignupField from "@/components/SignupField";
import SignupDropdown from "@/components/SignupDropdown";
import DatePicker from "@/components/Datepicker";
import {
  Errors,
  Opt,
  Req,
  SectionCard,
  TextArea,
  US_STATE_OPTIONS,
  toOptions,
  todayISO,
} from "../../Shared";

/* ---------- Constants ---------- */
export const PROVIDERS = [
  { id: "p1", name: "Dr. Sarah Mitchell", providerType: "MD (Doctor of Medicine)", specialty: "Internal Medicine", npi: "1234567890", dea: "AB1234567" },
  { id: "p2", name: "Dr. Emily Wilson", providerType: "MD (Doctor of Medicine)", specialty: "Pediatrics", npi: "1122334455", dea: "EW1122334" },
  { id: "p3", name: "Dr. Priya Shah", providerType: "DO (Doctor of Osteopathic Medicine)", specialty: "Dermatology", npi: "5566778899", dea: "PS5566778" },
  { id: "p4", name: "Dr. Robert Kim", providerType: "MD (Doctor of Medicine)", specialty: "Cardiology", npi: "6655443322", dea: "RK6655443" },
];

export const PROVIDER_OPTIONS = PROVIDERS.map((p) => ({
  value: p.id,
  label: `${p.name} — ${p.specialty}`,
}));

export const STATE_OPTIONS = US_STATE_OPTIONS.map((s) => ({
  ...s,
  label: `${s.label} (${s.value})`,
}));

export const stateLabel = (code: string) =>
  STATE_OPTIONS.find((s) => s.value === code)?.label ?? code;

export const LICENSE_TYPES = ["Medical License", "Nursing License", "Pharmacy License", "Controlled Substance License"];
export const LICENSE_STATUSES = ["Active", "Inactive", "Pending", "Expired"];

export const STATUS_TONES: Record<string, TagTone> = {
  Active: "success",
  Verified: "success",
  Pending: "warning",
  "Expiring Soon": "warning",
  Inactive: "neutral",
  Expired: "danger",
};

/** "2024-01-15" -> "01/15/2024" */
export const fmtDate = (iso?: string) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso ?? "");
  return m ? `${m[2]}/${m[3]}/${m[1]}` : "—";
};

/* ---------- Values ---------- */
export interface LicenseValues {
  providerId: string;
  state: string;
  licenseNumber: string;
  issueDate: string; // yyyy-mm-dd
  expiryDate: string; // yyyy-mm-dd
  licenseType: string;
  status: string;
  notes: string;
}

export const initialLicense = (): LicenseValues => ({
  providerId: "",
  state: "",
  licenseNumber: "",
  issueDate: "",
  expiryDate: "",
  licenseType: "",
  status: "Active",
  notes: "",
});

/** Static sample used by Edit / View (replace with API data). */
export const SAMPLE_LICENSE: LicenseValues = {
  providerId: "p1",
  state: "CA",
  licenseNumber: "A123456",
  issueDate: "2020-01-15",
  expiryDate: "2025-01-14",
  licenseType: "Medical License",
  status: "Active",
  notes: "Renewed as per latest documentation.",
};

/* ---------- Validation ---------- */
export const validateLicense = (v: LicenseValues, withProvider = true): Errors => {
  const e: Errors = {};
  if (withProvider && !v.providerId) e.providerId = "Select a provider.";
  if (!v.state) e.state = "State is required.";

  if (!v.licenseNumber.trim()) e.licenseNumber = "License number is required.";
  else if (!/^[A-Za-z0-9-]{4,20}$/.test(v.licenseNumber.trim()))
    e.licenseNumber = "Enter a valid license number (4–20 letters/digits).";

  if (!v.issueDate) e.issueDate = "Issue date is required.";
  else if (v.issueDate > todayISO()) e.issueDate = "Issue date cannot be in the future.";

  if (!v.expiryDate) e.expiryDate = "Expiry date is required.";
  else if (v.issueDate && v.expiryDate <= v.issueDate) e.expiryDate = "Expiry date must be after the issue date.";

  if (!v.licenseType) e.licenseType = "License type is required.";
  if (!v.status) e.status = "License status is required.";
  return e;
};

/* ---------- Fields (used by Step 1 and EditLicense) ---------- */
type FieldsProps = {
  values: LicenseValues;
  errors: Errors;
  onChange: (patch: Partial<LicenseValues>) => void;
  showProvider?: boolean;
};

export const LicenseFields = ({ values: v, errors, onChange, showProvider = false }: FieldsProps) => (
  <div className="grid gap-4 sm:grid-cols-2">
    {showProvider && (
      <div className="sm:col-span-2">
        <SignupDropdown
          name="providerId"
          label="Provider *"
          placeholder="Select provider"
          options={PROVIDER_OPTIONS}
          value={v.providerId}
          onChange={(val) => onChange({ providerId: val })}
          error={errors.providerId}
        />
      </div>
    )}

    <SignupDropdown
      name="state"
      label="State *"
      placeholder="Select state"
      options={STATE_OPTIONS}
      value={v.state}
      onChange={(val) => onChange({ state: val })}
      error={errors.state}
    />
    <SignupField
      name="licenseNumber"
      label={<>License Number<Req /></>}
      placeholder="Enter license number"
      value={v.licenseNumber}
      onChange={(e) => onChange({ licenseNumber: e.target.value.toUpperCase() })}
      error={errors.licenseNumber}
    />

    <DatePicker
      name="issueDate"
      label={<>Issue Date<Req /></>}
      value={v.issueDate}
      onChange={(val) => onChange({ issueDate: val })}
      maxDate={todayISO()}
      error={errors.issueDate}
    />
    <DatePicker
      name="expiryDate"
      label={<>Expiry Date<Req /></>}
      value={v.expiryDate}
      onChange={(val) => onChange({ expiryDate: val })}
      minDate={v.issueDate || undefined}
      error={errors.expiryDate}
    />

    <SignupDropdown
      name="licenseType"
      label="License Type *"
      placeholder="Select license type"
      searchable={false}
      options={toOptions(LICENSE_TYPES)}
      value={v.licenseType}
      onChange={(val) => onChange({ licenseType: val })}
      error={errors.licenseType}
    />
    <SignupDropdown
      name="status"
      label="License Status *"
      placeholder="Select status"
      searchable={false}
      options={toOptions(LICENSE_STATUSES)}
      value={v.status}
      onChange={(val) => onChange({ status: val })}
      error={errors.status}
    />

    <div className="sm:col-span-2">
      <TextArea
        name="notes"
        label={<>Notes<Opt /></>}
        placeholder="Add any notes about this license"
        rows={3}
        maxLength={250}
        value={v.notes}
        onChange={(val) => onChange({ notes: val })}
      />
    </div>
  </div>
);

/* ---------- Step 1 ---------- */
type Props = Omit<FieldsProps, "showProvider">;

const LicenseInformation = (props: Props) => (
  <SectionCard
    step={1}
    title="License Information"
    subtitle="Select the provider and enter the license details."
  >
    <LicenseFields {...props} showProvider />
  </SectionCard>
);

export default LicenseInformation;