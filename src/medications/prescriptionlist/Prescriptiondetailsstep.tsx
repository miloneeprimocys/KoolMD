"use client";

import React from "react";

import SignupField from "@/components/SignupField";
import SignupDropdown from "@/components/SignupDropdown";
import { ModalRadioGroup } from "@/components/Modalshell";
import { Errors, Req, SectionCard, StepProps, toOptions } from "@/providers/Shared";

export interface DetailsValues {
  rxType: string;
  priority: string;
  diagnosis: string;
  encounterId: string;
  substitution: string;
  clinical: string;
}

export const initialDetails = (): DetailsValues => ({
  rxType: "New",
  priority: "Routine",
  diagnosis: "",
  encounterId: "ENC-2026-00156",
  substitution: "yes",
  clinical: "",
});

export const validateDetails = (v: DetailsValues): Errors => {
  const e: Errors = {};
  if (!v.rxType) e.rxType = "Prescription type is required.";
  if (!v.priority) e.priority = "Priority is required.";
  if (!v.diagnosis.trim()) e.diagnosis = "Diagnosis / reason is required.";
  else if (v.diagnosis.trim().length < 3) e.diagnosis = "Enter at least 3 characters.";
  if (!v.encounterId) e.encounterId = "Select an encounter.";
  return e;
};

const TYPES = toOptions(["New", "Renewal", "Refill", "Change"]);
const PRIORITIES = toOptions(["Routine", "Urgent", "STAT"]);
const ENCOUNTERS = [
  { value: "ENC-2026-00156", label: "ENC-2026-00156 (Oct 28, 2026)" },
  { value: "ENC-2026-00142", label: "ENC-2026-00142 (Oct 12, 2026)" },
  { value: "ENC-2026-00120", label: "ENC-2026-00120 (Sep 20, 2026)" },
];

const PrescriptionDetailsStep = ({ values: v, errors, onChange }: StepProps<DetailsValues>) => (
  <SectionCard step={2} title="Prescription Details" subtitle="Type, priority and clinical reason for this prescription.">
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <SignupDropdown name="rxType" label="Prescription Type *" placeholder="Select type" searchable={false}
        options={TYPES} value={v.rxType} onChange={(val) => onChange({ rxType: val })} error={errors.rxType} />
      <SignupDropdown name="priority" label="Priority *" placeholder="Select priority" searchable={false}
        options={PRIORITIES} value={v.priority} onChange={(val) => onChange({ priority: val })} error={errors.priority} />
      <SignupDropdown name="encounterId" label="Linked Encounter *" placeholder="Select encounter" searchable={false}
        options={ENCOUNTERS} value={v.encounterId} onChange={(val) => onChange({ encounterId: val })} error={errors.encounterId} />
      <div className="sm:col-span-2">
        <SignupField
          name="diagnosis"
          label={<>Diagnosis / Reason<Req /></>}
          placeholder="e.g. Upper respiratory infection (J06.9)"
          value={v.diagnosis}
          onChange={(e) => onChange({ diagnosis: e.target.value })}
          error={errors.diagnosis}
        />
      </div>
      <ModalRadioGroup
        name="substitution"
        label="Allow generic substitution"
        value={v.substitution}
        onChange={(val) => onChange({ substitution: val })}
        options={[{ value: "yes", label: "Yes" }, { value: "no", label: "No (dispense as written)" }]}
      />
    </div>
  </SectionCard>
);

export default PrescriptionDetailsStep;