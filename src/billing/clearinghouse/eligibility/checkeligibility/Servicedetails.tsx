"use client";

import React, { useState } from "react";
import { FileText, ListChecks, Plus, Search, Trash2, X, Info } from "lucide-react";

import SignupField, { FieldError } from "@/components/SignupField";
import SignupDropdown, { type DropdownOption } from "@/components/SignupDropdown";
import DatePicker from "@/components/Datepicker";
import ImportButton from "@/components/ImportButton";
import RadioCheckButtonh from "@/components/RadioCheckButtonh";
import Table from "@/components/Table";
import { type TableColumn } from "@/components/Tableheader";
import StickyColumns from "@/components/StickyColumns";
import EditButton from "@/components/EditButton";
import Content from "@/components/Content";
import Actions from "@/components/Actions";
import { SectionCard, TextArea, Req, Opt, labelCls, cardCls } from "@/providers/Shared";
import {
  PayerLogo,
  getPatient,
  getPayerById,
  initials,
  type PatientInsuranceValues,
} from "./Patientinsurance";

/* ---------------------------------------------------------------- */
/*  Static data (replace with API data later)                        */
/* ---------------------------------------------------------------- */
const CPT_CODES = [
  { code: "99213", description: "Office or other outpatient visit for the evaluation and management of an established patient, which requires a medically appropriate history and/or examination and low level of medical decision making." },
  { code: "99214", description: "Office or other outpatient visit for the evaluation and management of an established patient, moderate level of medical decision making." },
  { code: "99203", description: "Office or other outpatient visit for the evaluation and management of a new patient, low level of medical decision making." },
  { code: "97110", description: "Therapeutic exercises" },
  { code: "97140", description: "Manual therapy techniques" },
  { code: "93000", description: "Electrocardiogram, routine ECG with at least 12 leads" },
  { code: "80053", description: "Comprehensive metabolic panel" },
  { code: "71046", description: "Chest X-ray, 2 views" },
];

const ICD_CODES = [
  { code: "M54.5", description: "Low back pain" },
  { code: "I10", description: "Essential (primary) hypertension" },
  { code: "E11.9", description: "Type 2 diabetes mellitus without complications" },
  { code: "J06.9", description: "Acute upper respiratory infection, unspecified" },
  { code: "R51.9", description: "Headache, unspecified" },
  { code: "K21.9", description: "Gastro-esophageal reflux disease without esophagitis" },
];

export const POS_OPTIONS: DropdownOption[] = [
  { value: "11", label: "11 - Office" },
  { value: "12", label: "12 - Home" },
  { value: "02", label: "02 - Telehealth" },
  { value: "21", label: "21 - Inpatient Hospital" },
  { value: "22", label: "22 - Outpatient Hospital" },
  { value: "23", label: "23 - Emergency Room" },
];

const PROVIDER_OPTIONS: DropdownOption[] = [
  { value: "dr-doe", label: "Dr. John Doe" },
  { value: "dr-smith", label: "Dr. Jane Smith" },
  { value: "dr-carter", label: "Dr. Emily Carter" },
];

export const CPT_OPTIONS: DropdownOption[] = CPT_CODES.map((c) => ({
  value: c.code,
  label: c.code,
  subLabel: c.description,
  keywords: [c.description],
}));

export const ICD_OPTIONS: DropdownOption[] = ICD_CODES.map((c) => ({
  value: c.code,
  label: c.code,
  subLabel: c.description,
  keywords: [c.description],
}));

export const renderCodeOption = (opt: DropdownOption) => (
  <span className="flex min-w-0 flex-col">
    <span className="text-sm font-medium">{opt.label}</span>
    <span className="truncate text-xs font-normal text-body">{opt.subLabel}</span>
  </span>
);

export const getCpt = (code: string) => CPT_CODES.find((c) => c.code === code);
export const getPos = (value: string) => POS_OPTIONS.find((o) => o.value === value);
export const getProvider = (value: string) => PROVIDER_OPTIONS.find((o) => o.value === value);

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
/** "2024-04-15" → "Apr 15, 2024" */
export const formatDateLong = (iso: string) => {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-").map(Number);
  return `${MONTHS[m - 1]} ${String(d).padStart(2, "0")}, ${y}`;
};

/* ---------------------------------------------------------------- */
/*  Form model                                                       */
/* ---------------------------------------------------------------- */
export type ServiceLine = {
  id: string;
  cpt: string;
  modifiers: string[]; // always 4 entries
  diagnosis: string;
  units: string;
};

export type ServiceDetailsValues = {
  serviceDate: string; // ISO
  placeOfService: string;
  provider: string;
  lines: ServiceLine[];
  notes: string;
  includeSpecific: "no" | "yes";
  saveHistory: boolean;
};

export type ServiceDetailsErrors = Partial<Record<"serviceDate" | "placeOfService" | "lines", string>>;

export const initialServiceDetails = (): ServiceDetailsValues => ({
  serviceDate: "2024-04-15",
  placeOfService: "11",
  provider: "dr-doe",
  lines: [
    { id: "l1", cpt: "99213", modifiers: ["", "", "", ""], diagnosis: "M54.5", units: "1" },
    { id: "l2", cpt: "97110", modifiers: ["GP", "", "", ""], diagnosis: "M54.5", units: "1" },
  ],
  notes: "",
  includeSpecific: "no",
  saveHistory: true,
});

export const validateServiceDetails = (v: ServiceDetailsValues): ServiceDetailsErrors => {
  const e: ServiceDetailsErrors = {};
  if (!v.serviceDate) e.serviceDate = "Service date is required.";
  if (!v.placeOfService) e.placeOfService = "Place of service is required.";
  if (v.includeSpecific === "yes" && v.lines.length === 0) {
    e.lines = "Add at least one service line to check a specific service.";
  } else if (v.lines.some((l) => !/^[1-9]\d*$/.test(l.units.trim()))) {
    e.lines = "Units must be a whole number of at least 1.";
  }
  return e;
};

const checkboxCls = "mt-0.5";

const LINE_COLUMNS: TableColumn[] = [
  { key: "number", label: "#" },
  { key: "cpt", label: "CPT/HCPCS Code" },
  { key: "description", label: "Description" },
  { key: "modifiers", label: "Modifiers" },
  { key: "diagnosis", label: "Diagnosis Code" },
  { key: "units", label: "Units" },
  {
    key: "actions",
    label: "Actions",
    header: <div className="flex w-full items-center justify-center">Actions</div>,
  },
];

/* ---------------------------------------------------------------- */
/*  Step 2 — Service Details                                         */
/* ---------------------------------------------------------------- */
type Props = {
  values: ServiceDetailsValues;
  errors: ServiceDetailsErrors;
  onChange: (patch: Partial<ServiceDetailsValues>) => void;
  /** Read-only, for the summary panel. */
  patientInsurance: PatientInsuranceValues;
  /** Jump back to a step (used by the "Edit" links in the summary). */
  onEdit: (step: number) => void;
};

const ServiceDetails = ({ values, errors, onChange, patientInsurance, onEdit }: Props) => {
  const patient = getPatient(patientInsurance.patientId);
  const payer = getPayerById(patientInsurance.insurance);

  /* "Add service line" builder */
  const [draftCpt, setDraftCpt] = useState("");
  const [draftMods, setDraftMods] = useState<string[]>(["", "", "", ""]);
  const [draftDx, setDraftDx] = useState("");
  const [draftError, setDraftError] = useState<string | undefined>();

  const draftCptInfo = getCpt(draftCpt);

  const addLine = () => {
    if (!draftCpt) {
      setDraftError("Select a procedure code first.");
      return;
    }
    onChange({
      lines: [
        ...values.lines,
        { id: `l${Date.now()}`, cpt: draftCpt, modifiers: draftMods, diagnosis: draftDx, units: "1" },
      ],
    });
    setDraftCpt("");
    setDraftMods(["", "", "", ""]);
    setDraftDx("");
    setDraftError(undefined);
  };

  const updateLine = (id: string, patch: Partial<ServiceLine>) =>
    onChange({ lines: values.lines.map((l) => (l.id === id ? { ...l, ...patch } : l)) });

  const removeLine = (id: string) => onChange({ lines: values.lines.filter((l) => l.id !== id) });

  const lineRows = values.lines.map((l, i) => ({
    number: <span className="text-sm text-body">{i + 1}</span>,
    cpt: <Content title={l.cpt} />,
    description: (
      <Content
        title={getCpt(l.cpt)?.description ?? "—"}
        truncate
        className="max-w-[260px]"
      />
    ),
    modifiers: <Content title={l.modifiers.filter(Boolean).join(", ") || "—"} />,
    diagnosis: <Content title={l.diagnosis || "—"} />,
    units: (
      <div className="w-20">
        <SignupField
          name={`units-${l.id}`}
          type="number"
          min={1}
          aria-label={`Units for ${l.cpt}`}
          value={l.units}
          onChange={(e) => updateLine(l.id, { units: e.target.value })}
          inputClassName="!h-8 !rounded-lg !pl-3 !pr-1"
        />
      </div>
    ),
    actions: (
      <div className="flex w-full items-center justify-center">
        <Actions
          actions={["delete"]}
          onAction={(action) => {
            if (action === "delete") removeLine(l.id);
          }}
        />
      </div>
    ),
  }));

  const firstLine = values.lines[0];

  return (
    <StickyColumns columnsClass="2xl:grid-cols-[minmax(0,1fr)_360px] 22xl:grid-cols-[minmax(0,1fr)_380px]" breakpoint="xl">
      {/* LEFT SECTION */}
      <div className="min-w-0 space-y-4 sm:space-y-5">
        <SectionCard
          icon={<FileText className="h-4 w-4" />}
          title="Service Details"
          subtitle="Enter the service details for which you want to check eligibility."
        >
          {/* Basics */}
          <div className="grid gap-4 sm:grid-cols-3">
            <DatePicker
              name="serviceDate"
              label={<>Service Date<Req /></>}
              placeholder="mm/dd/yyyy"
              value={values.serviceDate}
              onChange={(v) => onChange({ serviceDate: v })}
              error={errors.serviceDate}
            />
            <SignupDropdown
              name="placeOfService"
              label={<>Place of Service<Req /></>}
              placeholder="Select place of service"
              searchable={false}
              options={POS_OPTIONS}
              value={values.placeOfService}
              onChange={(v) => onChange({ placeOfService: v })}
              error={errors.placeOfService}
            />
            <SignupDropdown
              name="provider"
              label={<>Rendering Provider<Opt /></>}
              placeholder="Select provider"
              searchable={false}
              options={PROVIDER_OPTIONS}
              value={values.provider}
              onChange={(v) => onChange({ provider: v })}
            />
          </div>

          {/* Service line builder */}
          <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)]">
            <SignupDropdown
              name="draftCpt"
              label="Procedure Code (CPT/HCPCS)"
              icon={<Search className="h-4 w-4" />}
              placeholder="Search or enter CPT/HCPCS code..."
              options={CPT_OPTIONS}
              value={draftCpt}
              onChange={(v) => {
                setDraftCpt(v);
                setDraftError(undefined);
              }}
              renderOption={renderCodeOption}
              error={draftError}
            />
            <div>
              <p className={labelCls}>
                Modifiers <span className="font-normal text-body">(Optional)</span>
              </p>
              <div className="grid grid-cols-4 gap-2">
                {draftMods.map((m, i) => (
                  <SignupField
                    key={i}
                    name={`draftMod${i + 1}`}
                    aria-label={`Modifier ${i + 1}`}
                    placeholder={`Mod ${i + 1}`}
                    maxLength={2}
                    value={m}
                    onChange={(e) =>
                      setDraftMods((prev) => prev.map((x, idx) => (idx === i ? e.target.value.toUpperCase() : x)))
                    }
                  />
                ))}
              </div>
            </div>
            <SignupDropdown
              name="draftDx"
              label={<>Diagnosis Code (ICD-10)</>}
              icon={<Search className="h-4 w-4" />}
              placeholder="Search or enter diagnosis code..."
              options={ICD_OPTIONS}
              value={draftDx}
              onChange={setDraftDx}
              renderOption={renderCodeOption}
            />
          </div>

          {draftCptInfo && (
            <div className="mt-2 flex max-w-xl items-start gap-3 rounded-xl border border-border bg-primary/5 p-3">
              <span className="text-sm font-semibold text-heading">{draftCptInfo.code}</span>
              <p className="min-w-0 flex-1 text-xs text-body">{draftCptInfo.description}</p>
              <button
                type="button"
                aria-label="Clear procedure code"
                onClick={() => setDraftCpt("")}
                className="shrink-0 cursor-pointer text-body hover:text-heading focus-visible:outline-none"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Service lines */}
          <div className="mt-6">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <h4 className="text-sm font-semibold text-heading">Service Lines</h4>
                <p className="text-xs text-body">Add multiple procedure codes if needed.</p>
              </div>
              <ImportButton
                text="Add Service Line"
                icon={<Plus className="h-4 w-4" />}
                onClick={addLine}
                className="shrink-0 whitespace-nowrap text-primary"
              />
            </div>

            <div id="service-lines" className="overflow-x-auto rounded-xl border border-border">
              {values.lines.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-body">No service lines added yet.</p>
              ) : (
                <Table columns={LINE_COLUMNS} rows={lineRows} bordered={false} />
              )}
            </div>
            <FieldError message={errors.lines} />
          </div>

          <div className="mt-6">
            <TextArea
              name="notes"
              label={<>Additional Information<Opt /></>}
              placeholder="Enter any additional notes or information for this request..."
              value={values.notes}
              onChange={(v) => onChange({ notes: v })}
              maxLength={500}
              rows={3}
            />
          </div>
        </SectionCard>

        {/* Additional options */}
        <SectionCard icon={<ListChecks className="h-4 w-4" />} title="Additional Options">
          <div className="grid gap-6 sm:grid-cols-2">
            <div role="radiogroup" aria-label="Include specific service">
              <p className={labelCls}>Include Specific Service</p>
              <div className="space-y-2.5">
                {(
                  [
                    ["no", "No (General Eligibility)"],
                    ["yes", "Yes (Check Specific Service)"],
                  ] as const
                ).map(([value, label]) => (
                  <label key={value} className="flex w-fit cursor-pointer items-center gap-3 text-sm text-heading">
                    <RadioCheckButtonh
                      type="radio"
                      name="includeSpecific"
                      value={value}
                      checked={values.includeSpecific === value}
                      onChange={() => onChange({ includeSpecific: value })}
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <p className={labelCls}>Save to History</p>
              <label className="flex w-fit cursor-pointer items-start gap-3 text-sm text-heading">
                <RadioCheckButtonh
                  type="checkbox"
                  className={checkboxCls}
                  checked={values.saveHistory}
                  onChange={(e) => onChange({ saveHistory: e.target.checked })}
                />
                Save this request to patient&apos;s eligibility history
              </label>
            </div>
          </div>
        </SectionCard>
      </div>

      {/* RIGHT SECTION - Summary */}
      <div className="min-w-0 space-y-4 sm:space-y-5">
        <section className={`${cardCls} min-w-0 sm:p-6`}>
          <h3 className="mb-4 border-b border-border/70 pb-2 text-base font-semibold text-heading">Summary</h3>

          {/* Patient */}
          <div className="mb-2 flex items-center justify-between">
            <h4 className="text-sm font-semibold text-heading">Patient Information</h4>
            <EditButton section="patient" onEdit={() => onEdit(1)} />
          </div>
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
              {initials(patient.name)}
            </span>
            <div className="min-w-0 text-sm">
              <p className="font-semibold text-heading">{patient.name}</p>
              <p className="text-xs text-body">#{patient.code}</p>
              <p className="text-xs text-body">DOB: {patient.dob} <span className="mx-1 text-border">|</span> {patient.gender}</p>
              <p className="text-xs text-body">Phone: {patient.phone}</p>
            </div>
          </div>

          <div className="my-5 border-t border-border/70" />

          {/* Insurance */}
          <div className="mb-2 flex items-center justify-between">
            <h4 className="text-sm font-semibold text-heading">Insurance Information</h4>
            <EditButton section="insurance" onEdit={() => onEdit(1)} />
          </div>
          <div className="flex items-start gap-3">
            <PayerLogo name={payer.name} size="h-11 w-11" />
            <div className="min-w-0 text-xs text-body">
              <p className="text-sm font-semibold text-heading">{payer.name}</p>
              <p>Payer ID: {patientInsurance.payerId}</p>
              <p>Member ID: {patientInsurance.memberId || "—"}</p>
              <p>Group Number: {patientInsurance.groupNumber || "—"}</p>
              <p>Plan Name: {patientInsurance.planName || "—"}</p>
              <p>
                Policy Holder: <span className="font-semibold text-heading">{patientInsurance.policyHolder}</span>
              </p>
            </div>
          </div>

          <div className="my-5 border-t border-border/70" />

          {/* Service */}
          <div className="mb-2 flex items-center justify-between">
            <h4 className="text-sm font-semibold text-heading">Service Details</h4>
            <EditButton section="service" onEdit={() => document.getElementById("serviceDate")?.focus()} />
          </div>
          <div className="space-y-2">
            <SummaryItem label="Service Date" value={formatDateLong(values.serviceDate)} />
            <SummaryItem label="Place of Service" value={getPos(values.placeOfService)?.label ?? "—"} />
            <SummaryItem label="Rendering Provider" value={getProvider(values.provider)?.label ?? "—"} />
          </div>

          <div className="mt-3 rounded-xl bg-primary/5 p-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-heading">
                {values.lines.length} Service Line{values.lines.length === 1 ? "" : "s"}
              </span>
              <EditButton
                section="service-lines"
                variant="viewAll"
                label="View"
                onEdit={() => document.getElementById("service-lines")?.scrollIntoView({ behavior: "smooth", block: "center" })}
              />
            </div>
            {firstLine ? (
              <div className="mt-1.5 text-xs text-body">
                <p className="truncate">
                  <span className="font-semibold text-heading">{firstLine.cpt}</span>{" "}
                  {getCpt(firstLine.cpt)?.description}
                </p>
                <p>
                  Units: {firstLine.units} <span className="mx-1 text-border">|</span> Diagnosis: {firstLine.diagnosis || "—"}
                </p>
              </div>
            ) : (
              <p className="mt-1.5 text-xs text-body">No service lines added.</p>
            )}
          </div>

          <div className="mt-4 flex gap-3 rounded-xl bg-primary/10 p-4">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <div>
              <p className="text-sm font-semibold text-heading">Supported by Clearinghouse</p>
              <p className="mt-1 text-xs text-body">
                Eligibility verification is supported for the selected payer through the configured clearinghouse.
              </p>
            </div>
          </div>
        </section>
      </div>
    </StickyColumns>
  );
};

const SummaryItem = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between gap-4 text-sm">
    <span className="text-body">{label}</span>
    <span className="font-medium text-heading">{value}</span>
  </div>
);

export default ServiceDetails;
