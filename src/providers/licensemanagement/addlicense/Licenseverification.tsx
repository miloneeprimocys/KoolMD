"use client";

import React from "react";
import { Check } from "lucide-react";

import SignupField from "@/components/SignupField";
import SignupDropdown from "@/components/SignupDropdown";
import DatePicker from "@/components/Datepicker";
import { Errors, Req, SectionCard, toOptions, todayISO } from "../../Shared";
import { fmtDate } from "./Licenseinformation";

export const VERIFICATION_STATUSES = ["Pending", "Verified"];
export const LICENSE_SOURCES = ["State Medical Board", "Federation of State Medical Boards", "Manual Entry"];

export interface VerificationValues {
  verificationStatus: string;
  licenseSource: string;
  verifiedBy: string;
  verifiedOn: string; // yyyy-mm-dd
  nextRenewal: string; // yyyy-mm-dd
}

export const initialVerification = (): VerificationValues => ({
  verificationStatus: "Pending",
  licenseSource: "",
  verifiedBy: "",
  verifiedOn: "",
  nextRenewal: "",
});

export const validateVerification = (v: VerificationValues): Errors => {
  const e: Errors = {};
  if (!v.licenseSource) e.licenseSource = "License source is required.";
  if (v.verificationStatus === "Verified") {
    if (!v.verifiedBy.trim()) e.verifiedBy = "Verified by is required.";
    if (!v.verifiedOn) e.verifiedOn = "Verified on date is required.";
  }
  return e;
};

/* ---------- Timeline (also used by ViewLicense) ---------- */
export type TimelineStep = { label: string; date?: string };

export const VerificationTimeline = ({ steps }: { steps: TimelineStep[] }) => (
  <ol>
    {steps.map((s, i) => {
      const done = Boolean(s.date);
      return (
        <li key={s.label} className="relative flex gap-3 pb-5 last:pb-0">
          {i < steps.length - 1 && (
            <span
              aria-hidden="true"
              className={`absolute left-[13px] top-7 h-[calc(100%-1.75rem)] w-0.5 ${done ? "bg-emerald-500" : "bg-border"}`}
            />
          )}
          <span
            className={`z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
              done ? "bg-emerald-500 text-white" : "border border-border bg-card text-transparent"
            }`}
          >
            <Check className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-heading">{s.label}</p>
            <p className="text-xs text-body">{s.date ? fmtDate(s.date) : "Pending"}</p>
          </div>
        </li>
      );
    })}
  </ol>
);

export const buildTimeline = (v: VerificationValues, submittedOn?: string): TimelineStep[] => {
  const verified = v.verificationStatus === "Verified" ? v.verifiedOn || undefined : undefined;
  return [
    { label: "Document Submitted", date: submittedOn },
    { label: "Administrative Review", date: verified },
    { label: "State Verification", date: verified },
    { label: "Verified", date: verified },
  ];
};

/* ---------- Component ---------- */
type Props = {
  values: VerificationValues;
  errors: Errors;
  onChange: (patch: Partial<VerificationValues>) => void;
  submittedOn?: string;
};

const LicenseVerification = ({ values: v, errors, onChange, submittedOn }: Props) => {
  const verified = v.verificationStatus === "Verified";

  return (
    <SectionCard step={3} title="Verification" subtitle="Verify the license and record the outcome.">
      <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
        {/* Summary */}
        <div className="rounded-xl border border-border p-4">
          <h4 className="mb-4 text-sm font-semibold text-heading">Verification Summary</h4>
          <VerificationTimeline steps={buildTimeline(v, submittedOn)} />
        </div>

        {/* Status + fields */}
        <div className="min-w-0 space-y-4">
          <div
            className={`flex items-center gap-3 rounded-xl border p-4 ${
              verified ? "border-emerald-200 bg-emerald-50 dark:border-emerald-500/30 dark:bg-emerald-500/10" : "border-amber-200 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-500/10"
            }`}
          >
            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white ${verified ? "bg-emerald-500" : "bg-amber-500"}`}
            >
              <Check className="h-5 w-5" />
            </span>
            <div>
              <p className={`text-sm font-semibold ${verified ? "text-emerald-600" : "text-amber-600"}`}>
                {verified ? "License Verified" : "Verification Pending"}
              </p>
              <p className="text-xs text-body">
                {verified ? "This license has been verified and is active." : "This license has not been verified yet."}
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <SignupDropdown
              name="verificationStatus"
              label="Verification Status *"
              searchable={false}
              options={toOptions(VERIFICATION_STATUSES)}
              value={v.verificationStatus}
              onChange={(val) => onChange({ verificationStatus: val })}
            />
            <SignupDropdown
              name="licenseSource"
              label="License Source *"
              placeholder="Select source"
              searchable={false}
              options={toOptions(LICENSE_SOURCES)}
              value={v.licenseSource}
              onChange={(val) => onChange({ licenseSource: val })}
              error={errors.licenseSource}
            />
            <SignupField
              name="verifiedBy"
              label={<>Verified By{verified && <Req />}</>}
              placeholder="Enter name"
              value={v.verifiedBy}
              onChange={(e) => onChange({ verifiedBy: e.target.value })}
              error={errors.verifiedBy}
            />
            <DatePicker
              name="verifiedOn"
              label={<>Verified On{verified && <Req />}</>}
              value={v.verifiedOn}
              onChange={(val) => onChange({ verifiedOn: val })}
              maxDate={todayISO()}
              error={errors.verifiedOn}
            />
            <DatePicker
              name="nextRenewal"
              label="Next Renewal"
              value={v.nextRenewal}
              onChange={(val) => onChange({ nextRenewal: val })}
              minDate={v.verifiedOn || undefined}
            />
          </div>
        </div>
      </div>
    </SectionCard>
  );
};

export default LicenseVerification;