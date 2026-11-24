"use client";

import React from "react";

import SignupDropdown from "@/components/SignupDropdown";
import { TextArea, Req, toOptions, type Errors, type StepProps } from "@/providers/Shared";

/* ---------------------------------------------------------------- */
/*  Values + validation (used by Prescription)                       */
/* ---------------------------------------------------------------- */
export interface ReferralValues {
  referTo: string;
  priority: string;
  reason: string;
  notes: string;
}

/** Static starting values (replace with the saved draft). */
export const initialReferral = (): ReferralValues => ({
  referTo: "Neurology",
  priority: "Routine",
  reason: "Persistent headaches for further evaluation.",
  notes: "Please evaluate and advise.",
});

const SPECIALTIES = toOptions(["Cardiology", "Dermatology", "Endocrinology", "Neurology", "Orthopedics", "Psychiatry", "Radiology"]);
const PRIORITIES = toOptions(["Routine", "Urgent", "Emergency"]);

export const validateReferral = (v: ReferralValues): Errors => {
  const e: Errors = {};
  if (!v.referTo) e.referTo = "Select a specialty.";
  if (!v.priority) e.priority = "Select a priority.";
  if (!v.reason.trim()) e.reason = "Referral reason is required.";
  return e;
};

/* ---------------------------------------------------------------- */
/*  Tab – Referral                                                   */
/* ---------------------------------------------------------------- */
const ReferralTab = ({ values, errors, onChange }: StepProps<ReferralValues>) => (
  <div className="grid gap-4 md:grid-cols-2">
    <div className="space-y-4">
      <SignupDropdown
        name="referTo"
        label={<>Refer To<Req /></>}
        placeholder="Select specialty"
        options={SPECIALTIES}
        value={values.referTo}
        onChange={(referTo) => onChange({ referTo })}
        error={errors.referTo}
      />
      <SignupDropdown
        name="priority"
        label={<>Priority<Req /></>}
        placeholder="Select priority"
        options={PRIORITIES}
        value={values.priority}
        onChange={(priority) => onChange({ priority })}
        searchable={false}
        error={errors.priority}
      />
    </div>
    <div className="space-y-4">
      <TextArea
        name="reason"
        label={<>Referral Reason<Req /></>}
        value={values.reason}
        onChange={(reason) => onChange({ reason })}
        placeholder="Why is the patient being referred?"
        maxLength={250}
        rows={3}
        error={errors.reason}
      />
      <TextArea
        name="notes"
        label="Notes for Receiving Provider"
        value={values.notes}
        onChange={(notes) => onChange({ notes })}
        placeholder="Add notes for the receiving provider"
        maxLength={250}
        rows={3}
      />
    </div>
  </div>
);

export default ReferralTab;