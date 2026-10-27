"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";

import Breadcrumb from "@/components/Breadcrumb";
import SignupDropdown, { type DropdownOption } from "@/components/SignupDropdown";
import DatePicker from "@/components/Datepicker";
import FileDropzone from "@/components/Filedropzone";
import AddButton from "@/components/Addbutton";
import ImportButton from "@/components/ImportButton";
import { FieldError } from "@/components/SignupField";
import { ModalRadioGroup } from "@/components/Modalshell";
import { Opt, Req, cardCls, labelCls, type Errors } from "@/providers/Shared";
import { CLAIMS, CLAIM_ROUTES } from "./Claims";

/* ---------- Static options (replace with API data later) ---------- */
const PATIENTS: DropdownOption[] = CLAIMS.map((c) => ({ value: c.patientCode, label: `${c.patient} (${c.patientCode})` }));

const ENCOUNTERS = CLAIMS.map((c, i) => ({
  value: c.encounter,
  label: `${c.encounter} (${c.dos})`,
  /** ISO date used to pre-fill the service date */
  iso: `2026-10-${String(20 - i).padStart(2, "0")}`,
}));
const ENCOUNTER_OPTIONS: DropdownOption[] = ENCOUNTERS.map(({ value, label }) => ({ value, label }));

const PROVIDERS: DropdownOption[] = ["Dr. Sarah Wilson", "Dr. James Wilson", "Dr. Emily Davis", "Dr. Michael Brown"].map(
  (n) => ({ value: n, label: n }),
);

const CLAIM_TYPES = [
  { value: "professional", label: "Professional (CMS-1500)" },
  { value: "institutional", label: "Institutional (UB-04)" },
];

const ICD_CODES = [
  { code: "E11.9", description: "Type 2 diabetes mellitus without complications" },
  { code: "I10", description: "Essential (primary) hypertension" },
  { code: "M54.5", description: "Low back pain" },
  { code: "J06.9", description: "Acute upper respiratory infection, unspecified" },
  { code: "R51.9", description: "Headache, unspecified" },
  { code: "K21.9", description: "Gastro-esophageal reflux disease without esophagitis" },
];
const ICD_OPTIONS: DropdownOption[] = ICD_CODES.map((c) => ({
  value: c.code,
  label: c.code,
  subLabel: c.description,
  keywords: [c.description],
}));
const renderCodeOption = (opt: DropdownOption) => (
  <span className="flex min-w-0 flex-col">
    <span className="text-sm font-medium">{opt.label}</span>
    <span className="truncate text-xs font-normal text-body">{opt.subLabel}</span>
  </span>
);

/* ---------- Form ---------- */
type Values = {
  patient: string;
  encounter: string;
  provider: string;
  claimType: string;
  serviceDate: string;
  diagnosis: string[];
  document: File | null;
};

const initial = (): Values => ({
  patient: "",
  encounter: "",
  provider: "",
  claimType: "professional",
  serviceDate: "",
  diagnosis: [],
  document: null,
});

const validate = (v: Values): Errors => {
  const e: Errors = {};
  if (!v.patient) e.patient = "Select a patient.";
  if (!v.encounter) e.encounter = "Select an encounter.";
  if (!v.provider) e.provider = "Select a provider.";
  if (!v.serviceDate) e.serviceDate = "Service date is required.";
  if (v.diagnosis.length === 0) e.diagnosis = "Add at least one diagnosis code.";
  return e;
};

/* ---------- Page ---------- */
const SubmitClaim = () => {
  const router = useRouter();
  const [values, setValues] = useState<Values>(initial());
  const [errors, setErrors] = useState<Errors>({});

  const set = <K extends keyof Values>(key: K, val: Values[K]) => {
    setValues((p) => ({ ...p, [key]: val }));
    setErrors((p) => ({ ...p, [key]: "" }));
  };

  const pickEncounter = (value: string) => {
    set("encounter", value);
    const iso = ENCOUNTERS.find((e) => e.value === value)?.iso;
    if (iso) set("serviceDate", iso);
  };

  const addDiagnosis = (code: string) => {
    if (!code || values.diagnosis.includes(code)) return;
    set("diagnosis", [...values.diagnosis, code]);
  };

  const handleSubmit = () => {
    const errs = validate(values);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    // TODO: call your submit-claim API with `values`
    router.push(CLAIM_ROUTES.list);
  };

  return (
    <div className="flex min-h-full flex-col">
      <div className="mx-auto w-full max-w-[1600px] flex-1">
        <div className="space-y-4 sm:space-y-5">
          <Breadcrumb
            items={[
              { label: "Billing", href: "/billing/payment-gateway" },
              { label: "Claims", href: CLAIM_ROUTES.list },
              { label: "Submit Claim" },
            ]}
          />

          <h2 className="text-lg font-semibold text-heading sm:text-xl 2xl:text-2xl">Submit Claim to Clearinghouse</h2>

          <div className="grid gap-4 sm:gap-5 lg:grid-cols-2">
            {/* Basic information */}
            <section className={`${cardCls} space-y-4 sm:p-6`}>
              <h3 className="text-base font-semibold text-heading sm:text-lg">Basic Information</h3>

              <SignupDropdown
                name="patient"
                label={<>Patient<Req /></>}
                placeholder="Select patient"
                options={PATIENTS}
                value={values.patient}
                onChange={(v) => set("patient", v)}
                error={errors.patient}
              />
              <SignupDropdown
                name="encounter"
                label={<>Encounter<Req /></>}
                placeholder="Select encounter"
                searchable={false}
                options={ENCOUNTER_OPTIONS}
                value={values.encounter}
                onChange={pickEncounter}
                error={errors.encounter}
              />
              <SignupDropdown
                name="provider"
                label={<>Provider<Req /></>}
                placeholder="Select provider"
                searchable={false}
                options={PROVIDERS}
                value={values.provider}
                onChange={(v) => set("provider", v)}
                error={errors.provider}
              />
              <ModalRadioGroup
                name="claimType"
                label="Claim Type"
                value={values.claimType}
                onChange={(v) => set("claimType", v)}
                options={CLAIM_TYPES}
                className="flex-col gap-3"
              />
            </section>

            {/* Claim details */}
            <section className={`${cardCls} space-y-4 sm:p-6`}>
              <h3 className="text-base font-semibold text-heading sm:text-lg">Claim Details</h3>

              <DatePicker
                name="serviceDate"
                label={<>Service Date<Req /></>}
                placeholder="Select date"
                value={values.serviceDate}
                onChange={(v) => set("serviceDate", v)}
                error={errors.serviceDate}
              />

              <div>
                <SignupDropdown
                  name="diagnosis"
                  label={<>Diagnosis Codes<Req /></>}
                  icon={<Search className="h-4 w-4" />}
                  placeholder="Search or enter diagnosis code..."
                  options={ICD_OPTIONS}
                  value=""
                  onChange={addDiagnosis}
                  renderOption={renderCodeOption}
                  error={errors.diagnosis}
                />
                {values.diagnosis.length > 0 && (
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {values.diagnosis.map((code) => (
                      <li
                        key={code}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
                      >
                        {code}
                        <button
                          type="button"
                          aria-label={`Remove ${code}`}
                          onClick={() => set("diagnosis", values.diagnosis.filter((c) => c !== code))}
                          className="cursor-pointer rounded text-primary hover:text-heading focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <p className={labelCls}>
                  Attach Documents <Opt />
                </p>
                <FileDropzone
                  title="Click to upload or drag and drop (PDF, JPG up to 10 MB)"
                  file={values.document}
                  onChange={(f: File | null) => set("document", f)}
                  maxSizeMB={10}
                />
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Sticky bottom buttons */}
      <div className="sticky -bottom-4 z-[200] -mx-4 -mb-4 mt-4 border-t border-border bg-card px-4 py-4 sm:-bottom-6 sm:-mx-6 sm:-mb-6 sm:px-6 sm:py-5">
        <div className="mx-auto flex w-full max-w-[1600px] items-center justify-end gap-2 sm:gap-3">
          <ImportButton text="Cancel" icon={null} onClick={() => router.push(CLAIM_ROUTES.list)} className="shrink-0 px-3 sm:px-5" />
          <AddButton text="Submit Claim" icon={null} onClick={handleSubmit} className="shrink-0 whitespace-nowrap px-3 sm:px-5" />
        </div>
      </div>
    </div>
  );
};

export default SubmitClaim;
