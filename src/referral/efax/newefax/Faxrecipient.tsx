"use client";

import React, { useState } from "react";
import { ChevronDown, FileText, FlaskConical, Pencil, Search } from "lucide-react";

import SignupField from "@/components/SignupField";
import SignupDropdown, { type DropdownOption } from "@/components/SignupDropdown";
import {
  Opt,
  Req,
  TextArea,
  cardCls,
  todayISO,
  toOptions,
  type Errors,
  type StepProps,
} from "@/providers/Shared";

/* ---------------------------------------------------------------- */
/*  Shared form model (all 4 steps edit the same values object)      */
/* ---------------------------------------------------------------- */
export type FaxDoc = {
  id: string;
  name: string;
  size: string;
  kind: "pdf" | "image";
  category: string;
  /** Local object URL used to render uploaded image documents. */
  previewUrl?: string;
};

export type FaxValues = {
  /* step 1 – recipient */
  recipientType: "provider" | "facility";
  recipientId: string;
  providerName: string;
  practice: string;
  specialty: string;
  faxNumber: string;
  phone: string;
  address: string;
  patient: string;
  referralType: string;
  reason: string;
  template: string;
  /* step 2 – documents */
  documents: FaxDoc[];
  /* step 3 – additional info */
  includeCover: boolean;
  coverTemplate: string;
  message: string;
  urgency: string;
  sendMode: string;
  sendDate: string;
  sendTime: string;
  notifyEvents: string[];
  copyEmail: string;
  notifyVia: string[];
  notifyEmail: string;
  notes: string;
};

/* ---------------------------------------------------------------- */
/*  Static data (replace with API data later)                        */
/* ---------------------------------------------------------------- */
type Recipient = {
  id: string;
  name: string;
  practice: string;
  specialty: string;
  fax: string;
  phone: string;
  address: string;
};

export const PROVIDERS: Recipient[] = [
  { id: "thompson", name: "Dr. Michael Thompson", practice: "Westview Radiology", specialty: "Radiology", fax: "(314) 555-0176", phone: "(314) 555-0100", address: "1234 Medical Dr, St. Louis, MO 63110" },
  { id: "davis", name: "Dr. Sarah Davis", practice: "Family Care Associates", specialty: "Family Medicine", fax: "(314) 555-0221", phone: "(314) 555-0210", address: "88 Clinic Way, St. Louis, MO 63104" },
  { id: "chen", name: "Dr. Emily Chen", practice: "Heart & Vascular Center", specialty: "Cardiology", fax: "(314) 555-0342", phone: "(314) 555-0330", address: "502 Heartland Ave, St. Louis, MO 63108" },
  { id: "kim", name: "Dr. Robert Kim", practice: "City Orthopedic Center", specialty: "Orthopedics", fax: "(314) 555-0457", phone: "(314) 555-0440", address: "77 Bone St, St. Louis, MO 63101" },
];

export const FACILITIES: Recipient[] = [
  { id: "westview", name: "Westview Radiology", practice: "Westview Radiology", specialty: "Radiology", fax: "(314) 555-0176", phone: "(314) 555-0100", address: "1234 Medical Dr, St. Louis, MO 63110" },
  { id: "central-lab", name: "Central Diagnostic Lab", practice: "Central Diagnostic Lab", specialty: "Laboratory", fax: "(314) 555-0510", phone: "(314) 555-0500", address: "900 Lab Blvd, St. Louis, MO 63103" },
  { id: "riverside", name: "Riverside General Hospital", practice: "Riverside General Hospital", specialty: "Hospital", fax: "(314) 555-0620", phone: "(314) 555-0600", address: "1 Riverside Plaza, St. Louis, MO 63102" },
];

export type FaxPatient = {
  id: string;
  name: string;
  dob: string;
  mrn: string;
  phone: string;
  address: string;
};

export const PATIENTS: FaxPatient[] = [
  { id: "olivia", name: "Olivia Martin", dob: "04/12/1990", mrn: "KM001245", phone: "(314) 555-0100", address: "7428 Maple Ave, St. Louis, MO 63110" },
  { id: "noah", name: "Noah Williams", dob: "03/03/1998", mrn: "KM006371", phone: "(314) 555-0147", address: "18 Market St, St. Louis, MO 63101" },
  { id: "ava", name: "Ava Thompson", dob: "01/22/1984", mrn: "KM008152", phone: "(314) 555-0162", address: "95 Mission St, St. Louis, MO 63103" },
];

export const getPatient = (id: string) => PATIENTS.find((p) => p.id === id);

const PATIENT_OPTIONS: DropdownOption[] = PATIENTS.map((p) => ({
  value: p.id,
  label: `${p.name} (DOB: ${p.dob} | MRN: ${p.mrn})`,
}));

export const REFERRAL_TYPES = toOptions(["Imaging Order", "Referral", "Clinical Notes", "Lab Results", "Other"]);

const TEMPLATES: { key: string; title: string; desc: string; icon: React.ElementType; referralType?: string }[] = [
  { key: "cover", title: "Referral Cover Sheet", desc: "Standard referral cover sheet with patient details.", icon: FileText, referralType: "Referral" },
  { key: "imaging", title: "Imaging Order", desc: "Template for imaging study orders.", icon: FileText, referralType: "Imaging Order" },
  { key: "notes", title: "Clinical Notes", desc: "Send recent clinical notes.", icon: FileText, referralType: "Clinical Notes" },
  { key: "lab", title: "Lab Results", desc: "Include lab results in fax.", icon: FlaskConical, referralType: "Lab Results" },
  { key: "custom", title: "Custom Template", desc: "Use a custom fax template.", icon: FileText },
];

export const formatDate = (iso: string) => {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

export const initialFaxValues = (): FaxValues => ({
  recipientType: "provider",
  recipientId: PROVIDERS[0].id,
  providerName: PROVIDERS[0].name,
  practice: PROVIDERS[0].practice,
  specialty: PROVIDERS[0].specialty,
  faxNumber: PROVIDERS[0].fax,
  phone: PROVIDERS[0].phone,
  address: PROVIDERS[0].address,
  patient: PATIENTS[0].id,
  referralType: "Imaging Order",
  reason: "",
  template: "",
  documents: [],
  includeCover: true,
  coverTemplate: "Standard Referral Cover Sheet",
  message:
    "Please find the attached documents for the patient listed below.\nLet us know if you need any additional information.",
  urgency: "Routine",
  sendMode: "now",
  sendDate: todayISO(),
  sendTime: "10:00 AM",
  notifyEvents: ["delivered", "failed"],
  copyEmail: "",
  notifyVia: ["inapp", "email"],
  notifyEmail: "sarah.davis@koolmd.com",
  notes: "",
});

/* ---------------------------------------------------------------- */
/*  Validation                                                       */
/* ---------------------------------------------------------------- */
export const validateFaxRecipient = (v: FaxValues): Errors => {
  const e: Errors = {};
  const label = v.recipientType === "provider" ? "Provider name" : "Facility name";
  if (!v.providerName.trim()) e.providerName = `${label} is required.`;
  if (!v.faxNumber.trim()) e.faxNumber = "Fax number is required.";
  else if (v.faxNumber.replace(/\D/g, "").length < 10) e.faxNumber = "Enter a valid fax number.";
  return e;
};

/* ---------------------------------------------------------------- */
/*  Small shared pieces                                              */
/* ---------------------------------------------------------------- */
export const EditLink = ({ onClick }: { onClick?: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-medium text-primary transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 sm:text-sm"
  >
    <Pencil className="h-3.5 w-3.5" />
    Edit
  </button>
);

/* ---------------------------------------------------------------- */
/*  Component                                                        */
/* ---------------------------------------------------------------- */
const FaxRecipient = ({ values: v, errors, onChange }: StepProps<FaxValues>) => {
  const [templatesOpen, setTemplatesOpen] = useState(true);
  const isProvider = v.recipientType === "provider";
  const directory = isProvider ? PROVIDERS : FACILITIES;
  const noun = isProvider ? "Provider" : "Facility";

  const directoryOptions: DropdownOption[] = directory.map((r) => ({
    value: r.id,
    label: isProvider ? `${r.name} – ${r.specialty}` : r.name,
  }));

  const pick = (id: string) => {
    const r = directory.find((x) => x.id === id);
    if (!r) return;
    onChange({
      recipientId: id,
      providerName: r.name,
      practice: r.practice,
      specialty: r.specialty,
      faxNumber: r.fax,
      phone: r.phone,
      address: r.address,
    });
  };

  const switchType = (type: FaxValues["recipientType"]) => {
    if (type === v.recipientType) return;
    onChange({
      recipientType: type,
      recipientId: "",
      providerName: "",
      practice: "",
      specialty: "",
      faxNumber: "",
      phone: "",
      address: "",
    });
  };

  const applyTemplate = (key: string) => {
    const t = TEMPLATES.find((x) => x.key === key);
    onChange({
      template: v.template === key ? "" : key,
      ...(t?.referralType ? { referralType: t.referralType } : {}),
    });
  };

  const toggleCls = (active: boolean) =>
    `h-10 cursor-pointer whitespace-nowrap rounded-lg border px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${
      active
        ? "border-primary bg-primary/10 text-primary"
        : "border-border bg-card text-heading hover:border-primary/40 hover:bg-primary/5"
    }`;

  return (
    <div className="grid items-start gap-4 sm:gap-5 2xl:grid-cols-[minmax(0,1fr)_380px]">
      {/* ================= LEFT ================= */}
      <div className="min-w-0 space-y-4 sm:space-y-5">
        {/* Recipient information */}
        <section className={`${cardCls} sm:p-6`}>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-base font-semibold text-heading sm:text-lg">Recipient Information</h3>
            <div role="tablist" aria-label="Recipient type" className="flex gap-2">
              <button type="button" role="tab" aria-selected={isProvider} onClick={() => switchType("provider")} className={toggleCls(isProvider)}>
                Provider
              </button>
              <button type="button" role="tab" aria-selected={!isProvider} onClick={() => switchType("facility")} className={toggleCls(!isProvider)}>
                Facility / Location
              </button>
            </div>
          </div>

          <div className="grid gap-x-6 gap-y-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <SignupDropdown
                name="recipientSearch"
                label={`Search ${noun}`}
                icon={<Search className="h-4 w-4" />}
                placeholder={
                  isProvider
                    ? "Search by provider name, specialty, or practice..."
                    : "Search by facility name or location..."
                }
                options={directoryOptions}
                value={v.recipientId}
                onChange={pick}
              />
            </div>

            <SignupField
              name="providerName"
              label={<>{noun} Name<Req /></>}
              placeholder={`Enter ${noun.toLowerCase()} name`}
              value={v.providerName}
              onChange={(e) => onChange({ providerName: e.target.value })}
              error={errors.providerName}
            />
            <SignupField
              name="practice"
              label="Practice / Facility"
              placeholder="Auto-filled from selection"
              value={v.practice}
              onChange={(e) => onChange({ practice: e.target.value })}
            />
            <SignupField
              name="specialty"
              label="Specialty"
              placeholder="Auto-filled from selection"
              value={v.specialty}
              onChange={(e) => onChange({ specialty: e.target.value })}
            />
            <SignupField
              name="faxNumber"
              label={<>Fax Number<Req /></>}
              placeholder="(000) 000-0000"
              value={v.faxNumber}
              onChange={(e) => onChange({ faxNumber: e.target.value })}
              error={errors.faxNumber}
            />
            <SignupField
              name="phone"
              label="Phone Number"
              placeholder="(000) 000-0000"
              value={v.phone}
              onChange={(e) => onChange({ phone: e.target.value })}
            />
            <SignupField
              name="address"
              label="Address"
              placeholder="Enter address"
              value={v.address}
              onChange={(e) => onChange({ address: e.target.value })}
            />
          </div>
        </section>

        {/* Referral information */}
        <section className={`${cardCls} sm:p-6`}>
          <h3 className="mb-4 text-base font-semibold text-heading sm:text-lg">
            Referral Information <Opt />
          </h3>
          <div className="grid gap-x-6 gap-y-4 md:grid-cols-2">
            <SignupDropdown
              name="patient"
              label="Patient"
              icon={<Search className="h-4 w-4" />}
              placeholder="Search patient by name, DOB or MRN..."
              options={PATIENT_OPTIONS}
              value={v.patient}
              onChange={(val) => onChange({ patient: val })}
            />
            <SignupDropdown
              name="referralType"
              label="Referral Type"
              placeholder="Select referral type"
              searchable={false}
              options={REFERRAL_TYPES}
              value={v.referralType}
              onChange={(val) => onChange({ referralType: val })}
            />
            <div className="md:col-span-2">
              <TextArea
                name="reason"
                label="Reason / Notes"
                placeholder="Add notes or reason for sending this fax (e.g., referral, imaging order, clinical notes, etc.)"
                value={v.reason}
                onChange={(val) => onChange({ reason: val })}
                maxLength={500}
                rows={3}
              />
            </div>
          </div>
        </section>
      </div>

      {/* ================= RIGHT ================= */}
      <aside className="min-w-0 space-y-4 sm:space-y-5">
        <section className={`${cardCls} sm:p-6`}>
          <h3 className="mb-4 text-base font-semibold text-heading">Document Preview ({v.documents.length})</h3>
          {v.documents.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-primary/30 bg-primary/5 px-4 py-12 text-center">
              <FileText className="h-10 w-10 text-body" strokeWidth={1.5} />
              <p className="mt-3 text-sm font-semibold text-heading">No documents added yet</p>
              <p className="mt-1 text-xs text-body">Add documents in the next step to preview them here.</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {v.documents.map((d) => (
                <li key={d.id} className="flex items-center gap-2.5 rounded-xl bg-primary/5 px-3 py-2.5 text-sm text-heading">
                  <FileText className="h-4 w-4 shrink-0 text-primary" />
                  <span className="min-w-0 flex-1 truncate">{d.name}</span>
                  <span className="shrink-0 text-xs text-body">{d.size}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className={`${cardCls} sm:p-6`}>
          <button
            type="button"
            aria-expanded={templatesOpen}
            onClick={() => setTemplatesOpen((o) => !o)}
            className="flex w-full cursor-pointer items-center justify-between gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
          >
            <span className="flex items-center gap-2.5 text-base font-semibold text-heading">
              <FileText className="h-5 w-5 text-primary" />
              Quick Templates
            </span>
            <ChevronDown className={`h-4 w-4 text-body transition-transform ${templatesOpen ? "rotate-180" : ""}`} />
          </button>

          {templatesOpen && (
            <ul className="mt-4 space-y-2.5">
              {TEMPLATES.map((t) => {
                const active = v.template === t.key;
                return (
                  <li key={t.key}>
                    <button
                      type="button"
                      aria-pressed={active}
                      onClick={() => applyTemplate(t.key)}
                      className={`flex w-full cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${
                        active
                          ? "border-primary bg-primary/10"
                          : "border-border bg-card hover:border-primary/40 hover:bg-primary/5"
                      }`}
                    >
                      <t.icon className="h-5 w-5 shrink-0 text-body" />
                      <span className="min-w-0">
                        <span className="block text-sm font-medium text-heading">{t.title}</span>
                        <span className="block text-xs text-body">{t.desc}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </aside>
    </div>
  );
};

export default FaxRecipient;
