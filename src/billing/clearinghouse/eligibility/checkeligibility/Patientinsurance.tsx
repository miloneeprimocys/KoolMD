"use client";

import React, { useState } from "react";
import { Info, Shield, User } from "lucide-react";

import SignupField from "@/components/SignupField";
import SignupDropdown, { type DropdownOption } from "@/components/SignupDropdown";
import StickyColumns from "@/components/StickyColumns";
import { SectionCard, Req, Opt, cardCls } from "@/providers/Shared";
import { formatDateLong, getCpt, getPos, getProvider, type ServiceDetailsValues } from "./Servicedetails";

/* ---------------------------------------------------------------- */
/*  Static data (replace with API data later)                        */
/* ---------------------------------------------------------------- */
export type PatientOption = {
  id: string;
  name: string;
  code: string;
  dob: string;
  gender: string;
  phone: string;
  address: string;
};

export const PATIENTS: PatientOption[] = [
  { id: "pt125", name: "John Smith", code: "PT-000125", dob: "Jan 15, 1980", gender: "Male", phone: "(555) 123-4567", address: "123 Main St, Austin, TX 78701" },
  { id: "pt126", name: "Sarah Johnson", code: "PT-000126", dob: "Mar 22, 1988", gender: "Female", phone: "(555) 234-5678", address: "45 Oak Ave, Dallas, TX 75201" },
  { id: "pt127", name: "Michael Brown", code: "PT-000127", dob: "Aug 09, 1975", gender: "Male", phone: "(555) 345-6789", address: "88 Pine Rd, Houston, TX 77002" },
  { id: "pt128", name: "Emily Davis", code: "PT-000128", dob: "Nov 30, 1992", gender: "Female", phone: "(555) 456-7890", address: "12 Elm St, San Antonio, TX 78205" },
  { id: "pt129", name: "Robert Wilson", code: "PT-000129", dob: "Feb 18, 1969", gender: "Male", phone: "(555) 567-8901", address: "300 Cedar Ln, Austin, TX 78702" },
];

export type PayerOption = { id: string; name: string; payerId: string; plan: string; tone: string };

const TONES = {
  blue: "bg-primary/15 text-primary",
  violet: "bg-violet/15 text-violet",
  green: "bg-success/15 text-success",
  orange: "bg-warning/15 text-warning",
  red: "bg-danger/15 text-danger",
  pink: "bg-pink/15 text-pink",
};

export const PAYERS: PayerOption[] = [
  { id: "bcbs", name: "Blue Cross Blue Shield", payerId: "00324", plan: "PPO Blue Preferred", tone: TONES.blue },
  { id: "aetna", name: "Aetna", payerId: "60054", plan: "Aetna Choice POS II", tone: TONES.violet },
  { id: "cigna", name: "Cigna", payerId: "62308", plan: "Cigna Open Access Plus", tone: TONES.green },
  { id: "united", name: "UnitedHealthcare", payerId: "87726", plan: "UHC Choice Plus", tone: TONES.blue },
  { id: "humana", name: "Humana", payerId: "61101", plan: "Humana Gold Plus", tone: TONES.green },
  { id: "medicare", name: "Medicare", payerId: "04106", plan: "Medicare Part B", tone: TONES.blue },
  { id: "medicaid", name: "Medicaid", payerId: "71001", plan: "Medicaid Standard", tone: TONES.blue },
  { id: "tricare", name: "Tricare", payerId: "87726", plan: "Tricare Prime", tone: TONES.red },
  { id: "kaiser", name: "Kaiser Permanente", payerId: "62141", plan: "Kaiser Standard", tone: TONES.blue },
  { id: "anthem", name: "Anthem", payerId: "00343", plan: "Anthem PPO", tone: TONES.pink },
];

export const getPatient = (id: string) => PATIENTS.find((p) => p.id === id) ?? PATIENTS[0];
export const getPayerById = (id: string) => PAYERS.find((p) => p.id === id) ?? PAYERS[0];
export const getPayerByName = (name: string) => PAYERS.find((p) => p.name === name);

export const initials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0]?.toUpperCase())
    .slice(0, 2)
    .join("");

/** Small coloured tile used instead of a payer logo image. */
export const PayerLogo = ({ name, size = "h-10 w-10" }: { name: string; size?: string }) => {
  const payer = getPayerByName(name);
  const words = name.split(" ");
  return (
    <span
      className={`flex ${size} shrink-0 items-center justify-center rounded-lg text-xs font-bold ${payer?.tone ?? TONES.blue}`}
      aria-hidden
    >
      {(words[0]?.[0] ?? "") + (words[1]?.[0] ?? words[0]?.[1] ?? "")}
    </span>
  );
};

/* ---------------------------------------------------------------- */
/*  Form model                                                       */
/* ---------------------------------------------------------------- */
export type PatientInsuranceValues = {
  patientId: string;
  insurance: string;
  payerId: string;
  memberId: string;
  groupNumber: string;
  planName: string;
  policyHolder: string;
};
export type PatientInsuranceErrors = Partial<Record<keyof PatientInsuranceValues, string>>;

export const initialPatientInsurance = (): PatientInsuranceValues => ({
  patientId: "pt125",
  insurance: "bcbs",
  payerId: "00324",
  memberId: "ABC123456789",
  groupNumber: "GRP987654",
  planName: "PPO Blue Preferred",
  policyHolder: "Self",
});

export const validatePatientInsurance = (v: PatientInsuranceValues): PatientInsuranceErrors => {
  const e: PatientInsuranceErrors = {};
  if (!v.patientId) e.patientId = "Select a patient.";
  if (!v.insurance) e.insurance = "Select an insurance.";
  if (!v.payerId) e.payerId = "Select a payer ID.";
  if (!v.memberId.trim()) e.memberId = "Member ID is required.";
  return e;
};

const PATIENT_OPTIONS: DropdownOption[] = PATIENTS.map((p) => ({
  value: p.id,
  label: `${p.name} (#${p.code})`,
  keywords: [p.name, p.code],
}));
const INSURANCE_OPTIONS: DropdownOption[] = PAYERS.map((p) => ({ value: p.id, label: p.name }));
const POLICY_HOLDERS: DropdownOption[] = ["Self", "Spouse", "Parent", "Other"].map((v) => ({ value: v, label: v }));

/* ---------------------------------------------------------------- */
/*  Shared right-hand panel: "Request Details | Response"            */
/* ---------------------------------------------------------------- */
export const RequestSidePanel = ({ children }: { children: React.ReactNode }) => {
  const [tab, setTab] = useState<"request" | "response">("request");
  const tabs = [
    { key: "request", label: "Request Details" },
    { key: "response", label: "Response" },
  ] as const;

  return (
    <div className={`${cardCls} overflow-hidden !p-0 2xl:sticky 2xl:top-24`}>
      <div role="tablist" className="grid grid-cols-2 border-b border-border">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            className={`-mb-px cursor-pointer border-b-2 px-3 py-3.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/30 ${
              tab === t.key ? "border-primary text-primary" : "border-transparent text-heading hover:text-primary"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="p-4 sm:p-5">
        {tab === "request" ? (
          children
        ) : (
          <p className="py-10 text-center text-sm text-body">
            The response will appear here after the request is submitted.
          </p>
        )}
      </div>
    </div>
  );
};

export const SummaryRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex items-start justify-between gap-4 text-sm">
    <span className="shrink-0 text-body">{label}</span>
    <span className="min-w-0 break-words text-right font-medium text-heading">{value}</span>
  </div>
);

/* ---------------------------------------------------------------- */
/*  Step 1 — Patient & Insurance                                     */
/* ---------------------------------------------------------------- */
type Props = {
  values: PatientInsuranceValues;
  errors: PatientInsuranceErrors;
  onChange: (patch: Partial<PatientInsuranceValues>) => void;
  /** Read-only, for the summary panel. */
  service: ServiceDetailsValues;
};

const PatientInsurance = ({ values, errors, onChange, service }: Props) => {
  const [changingPatient, setChangingPatient] = useState(false);
  const patient = getPatient(values.patientId);
  const payer = getPayerById(values.insurance);
  const firstLine = service.lines[0];

  const payerIdOptions: DropdownOption[] = [{ value: payer.payerId, label: `${payer.payerId} (Default)` }];

  return (
    <div className="grid grid-cols-1 gap-4 2xl:grid-cols-[minmax(0,1fr)_360px] 2xl:gap-5">
      <div className="min-w-0 space-y-4 sm:space-y-5">
        {/* Patient information */}
        <SectionCard
          icon={<User className="h-4 w-4" />}
          title="Patient Information"
          action={
            <button
              type="button"
              onClick={() => setChangingPatient((v) => !v)}
              className="cursor-pointer text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
            >
              {changingPatient ? "Done" : "Change Patient"}
            </button>
          }
        >
          <div className="flex items-center gap-4 rounded-xl border border-border bg-primary/5 p-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-base font-semibold text-primary">
              {initials(patient.name)}
            </span>
            <div className="min-w-0 space-y-1">
              <h3 className="truncate text-base font-semibold text-heading">{patient.name}</h3>
              <p className="text-xs text-body">
                #{patient.code} <span className="mx-1.5 text-border">|</span> DOB: {patient.dob}
                <span className="mx-1.5 text-border">|</span> {patient.gender}
                <span className="mx-1.5 text-border">|</span> {patient.phone}
              </p>
            </div>
          </div>

          {changingPatient && (
            <div className="mt-4 max-w-md">
              <SignupDropdown
                name="patientId"
                label={<>Patient<Req /></>}
                placeholder="Search patient by name or ID..."
                options={PATIENT_OPTIONS}
                value={values.patientId}
                onChange={(v) => {
                  onChange({ patientId: v });
                  setChangingPatient(false);
                }}
                error={errors.patientId}
              />
            </div>
          )}
        </SectionCard>

        {/* Insurance information */}
        <SectionCard
          icon={<Shield className="h-4 w-4" />}
          title="Insurance Information"
          subtitle="Verify the patient's insurance plan details."
        >
          <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
            <SignupDropdown
              name="insurance"
              label={<>Insurance<Req /></>}
              placeholder="Search or select insurance..."
              options={INSURANCE_OPTIONS}
              value={values.insurance}
              onChange={(v) => {
                const next = getPayerById(v);
                onChange({ insurance: v, payerId: next.payerId, planName: next.plan });
              }}
              error={errors.insurance}
            />
            <SignupDropdown
              name="payerId"
              label={<>Payer ID<Req /></>}
              placeholder="Select payer ID"
              searchable={false}
              options={payerIdOptions}
              value={values.payerId}
              onChange={(v) => onChange({ payerId: v })}
              error={errors.payerId}
            />
            <SignupField
              name="memberId"
              label={<>Member ID<Req /></>}
              placeholder="Enter member ID"
              value={values.memberId}
              onChange={(e) => onChange({ memberId: e.target.value })}
              error={errors.memberId}
            />
            <SignupField
              name="groupNumber"
              label={<>Group Number<Opt /></>}
              placeholder="Enter group number"
              value={values.groupNumber}
              onChange={(e) => onChange({ groupNumber: e.target.value })}
            />
            <SignupField
              name="planName"
              label={<>Plan Name<Opt /></>}
              placeholder="Filled in from the selected insurance"
              value={values.planName}
              onChange={() => {}}
              disabled
            />
            <SignupDropdown
              name="policyHolder"
              label={<>Policy Holder<Opt /></>}
              placeholder="Select policy holder"
              searchable={false}
              options={POLICY_HOLDERS}
              value={values.policyHolder}
              onChange={(v) => onChange({ policyHolder: v })}
            />
          </div>
        </SectionCard>
      </div>

      {/* Summary */}
      <aside className="hidden 2xl:block">
        <RequestSidePanel>
          <h3 className="mb-4 text-base font-semibold text-heading">Summary</h3>
          <div className="space-y-3">
            <SummaryRow label="Patient" value={`${patient.name} (#${patient.code})`} />
            <SummaryRow label="Insurance" value={payer.name} />
            <SummaryRow label="Payer ID" value={values.payerId || "—"} />
            <SummaryRow label="Member ID" value={values.memberId || "—"} />
            <SummaryRow label="Service Date" value={service.serviceDate ? formatDateLong(service.serviceDate) : "—"} />
            <SummaryRow label="CPT Code" value={firstLine?.cpt ?? "—"} />
            <SummaryRow label="Place of Service" value={getPos(service.placeOfService)?.label ?? "—"} />
            <SummaryRow label="Diagnosis Code" value={firstLine?.diagnosis || "—"} />
            <SummaryRow label="Provider" value={getProvider(service.provider)?.label ?? "—"} />
          </div>

          <div className="mt-5 rounded-xl bg-primary/10 p-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-heading">
              <Info className="h-4 w-4 text-primary" />
              About Eligibility Verification
            </p>
            <ul className="mt-2 list-disc space-y-1.5 pl-5 text-xs text-body">
              <li>This will send a real-time eligibility request through the configured clearinghouse.</li>
              <li>Coverage and benefit information depends on the payer and clearinghouse support.</li>
              <li>Response time may vary.</li>
            </ul>
          </div>
        </RequestSidePanel>
      </aside>
    </div>
  );
};

export default PatientInsurance;