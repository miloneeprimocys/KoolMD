"use client";

import React from "react";
import {
  Bone,
  Disc,
  MoreHorizontal,
  Radiation,
  ScanLine,
  Search,
  Waves,
} from "lucide-react";

import SignupField from "@/components/SignupField";
import SignupDropdown, { type DropdownOption } from "@/components/SignupDropdown";
import ImportButton from "@/components/ImportButton";
import { ModalRadioGroup } from "@/components/Modalshell";
import {
  Req,
  cardCls,
  todayISO,
  toOptions,
  type Errors,
  type StepProps,
} from "@/providers/Shared";

/* ---------------------------------------------------------------- */
/*  Shared form model (all 4 steps edit the same values object)      */
/* ---------------------------------------------------------------- */
export type ImagingDoc = {
  id: string;
  name: string;
  size: string;
  kind: "pdf" | "image" | "doc";
  category: string;
  /** Local object URL used to render uploaded image documents. */
  previewUrl?: string;
};

export type ImagingValues = {
  /* step 1 – patient */
  patient: string;
  dob: string;
  mrn: string;
  phone: string;
  gender: string;
  address: string;
  imagingType: string;
  laterality: string;
  priority: string;
  procedure: string;
  bodyPart: string;
  views: string[];
  recipientType: "provider" | "facility";
  referringProvider: string;
  sendToId: string;
  sendToName: string;
  sendToSpecialty: string;
  faxNumber: string;
  sendToAddress: string;
  /* step 2 – imaging details */
  cptCode: string;
  otherView: string;
  contrast: string;
  reason: string;
  /* step 3 – clinical information */
  history: string;
  symptoms: string;
  onset: string;
  severity: string;
  priorTreatment: string;
  clinicalQuestions: string;
  specialInstructions: string;
  previousImaging: string;
  schedule: string;
  scheduleDate: string;
  documents: ImagingDoc[];
  /* step 4 – review */
  transmission: string;
};

/* ---------------------------------------------------------------- */
/*  Static data (replace with API data later)                        */
/* ---------------------------------------------------------------- */
export type ImagingPatient = {
  id: string;
  name: string;
  dob: string;
  mrn: string;
  phone: string;
  gender: string;
  address: string;
  insurance: string;
  memberId: string;
  group: string;
};

export const PATIENTS: ImagingPatient[] = [
  { id: "olivia", name: "Olivia Martin", dob: "04/12/1990", mrn: "KM001245", phone: "(314) 555-0100", gender: "Female", address: "7428 Maple Ave, St. Louis, MO 63110", insurance: "BlueCross BlueShield", memberId: "BC12345678", group: "GRP98765" },
  { id: "noah", name: "Noah Williams", dob: "03/03/1998", mrn: "KM006371", phone: "(314) 555-0147", gender: "Male", address: "18 Market St, St. Louis, MO 63101", insurance: "Aetna", memberId: "AE55512345", group: "GRP44120" },
  { id: "ava", name: "Ava Thompson", dob: "01/22/1984", mrn: "KM008152", phone: "(314) 555-0162", gender: "Female", address: "95 Mission St, St. Louis, MO 63103", insurance: "Cigna", memberId: "CG90817263", group: "GRP20871" },
];

export const getPatient = (id: string) => PATIENTS.find((p) => p.id === id);

const PATIENT_OPTIONS: DropdownOption[] = PATIENTS.map((p) => ({
  value: p.id,
  label: `${p.name} (DOB: ${p.dob} | MRN: ${p.mrn})`,
}));

export const REFERRING_PROVIDERS = [
  { id: "davis", name: "Dr. Sarah Davis", specialty: "Family Medicine", phone: "(314) 555-0100" },
  { id: "chen", name: "Dr. Emily Chen", specialty: "Cardiology", phone: "(314) 555-0342" },
  { id: "kim", name: "Dr. Robert Kim", specialty: "Orthopedics", phone: "(314) 555-0457" },
];

export const getReferringProvider = (id: string) => REFERRING_PROVIDERS.find((p) => p.id === id);

type Recipient = { id: string; name: string; specialty: string; fax: string; address: string };

const PROVIDER_RECIPIENTS: Recipient[] = [
  { id: "westview", name: "Westview Radiology", specialty: "Radiology", fax: "(314) 555-0176", address: "1234 Medical Dr, St. Louis, MO 63110" },
  { id: "northside", name: "Northside Imaging", specialty: "Radiology", fax: "(314) 555-0288", address: "45 Northside Blvd, St. Louis, MO 63107" },
  { id: "riverside-img", name: "Riverside Imaging Associates", specialty: "Radiology", fax: "(314) 555-0399", address: "210 River Rd, St. Louis, MO 63102" },
];

const FACILITY_RECIPIENTS: Recipient[] = [
  { id: "westview-center", name: "Westview Imaging Center", specialty: "Radiology", fax: "(314) 555-0176", address: "1234 Medical Dr, St. Louis, MO 63110" },
  { id: "riverside-hosp", name: "Riverside General Hospital", specialty: "Radiology", fax: "(314) 555-0620", address: "1 Riverside Plaza, St. Louis, MO 63102" },
  { id: "city-diag", name: "City Diagnostic Center", specialty: "Radiology", fax: "(314) 555-0731", address: "800 Diagnostic Way, St. Louis, MO 63104" },
];

/* Imaging catalog */
export const IMAGING_TYPES: { key: string; label: string; icon: React.ElementType }[] = [
  { key: "X-Ray", label: "X-Ray", icon: Bone },
  { key: "CT", label: "CT", icon: Disc },
  { key: "MRI", label: "MRI", icon: ScanLine },
  { key: "Ultrasound", label: "Ultrasound", icon: Waves },
  { key: "Nuclear Medicine", label: "Nuclear Medicine", icon: Radiation },
  { key: "Other", label: "Other", icon: MoreHorizontal },
];

export const PROCEDURES: Record<string, { name: string; cpt: string; body: string }[]> = {
  "X-Ray": [
    { name: "Knee X-Ray", cpt: "73562", body: "Knee" },
    { name: "Chest X-Ray", cpt: "71046", body: "Chest" },
    { name: "Hand X-Ray", cpt: "73130", body: "Hand" },
    { name: "Spine X-Ray", cpt: "72100", body: "Spine" },
    { name: "Shoulder X-Ray", cpt: "73030", body: "Shoulder" },
  ],
  CT: [
    { name: "CT Head without Contrast", cpt: "70450", body: "Head" },
    { name: "CT Chest", cpt: "71250", body: "Chest" },
    { name: "CT Abdomen / Pelvis", cpt: "74177", body: "Abdomen" },
  ],
  MRI: [
    { name: "MRI Knee", cpt: "73721", body: "Knee" },
    { name: "MRI Brain", cpt: "70551", body: "Head" },
    { name: "MRI Lumbar Spine", cpt: "72148", body: "Spine" },
  ],
  Ultrasound: [
    { name: "Abdominal Ultrasound", cpt: "76700", body: "Abdomen" },
    { name: "Pelvic Ultrasound", cpt: "76856", body: "Abdomen" },
    { name: "Thyroid Ultrasound", cpt: "76536", body: "Head" },
  ],
  "Nuclear Medicine": [
    { name: "Bone Scan", cpt: "78306", body: "Spine" },
    { name: "Thyroid Uptake", cpt: "78014", body: "Head" },
  ],
  Other: [{ name: "Other Imaging Study", cpt: "", body: "" }],
};

export const procedureOptions = (type: string): DropdownOption[] =>
  (PROCEDURES[type] ?? []).map((p) => ({ value: p.name, label: p.name }));

export const BODY_PARTS = toOptions(["Knee", "Chest", "Hand", "Spine", "Shoulder", "Hip", "Ankle", "Head", "Abdomen"]);
export const PRIORITIES = toOptions(["Routine", "Urgent", "Stat"]);
export const LATERALITY_OPTIONS = [
  { value: "Left", label: "Left" },
  { value: "Right", label: "Right" },
  { value: "Bilateral", label: "Bilateral" },
];

export const VIEW_OPTIONS = [
  { value: "AP", label: "AP (Anteroposterior)" },
  { value: "Lateral", label: "Lateral" },
  { value: "Sunrise", label: "Sunrise (Patellar)" },
  { value: "Other", label: "Other View" },
];

const PROTOCOLS: { label: string; views: string[] }[] = [
  { label: "2 views (AP, Lateral)", views: ["AP", "Lateral"] },
  { label: "3 views (AP, Lateral, Sunrise)", views: ["AP", "Lateral", "Sunrise"] },
  { label: "Standard protocol (AP)", views: ["AP"] },
];

export const viewsSummary = (v: ImagingValues) =>
  v.views.map((x) => (x === "Other" ? v.otherView.trim() || "Other" : x)).join(", ") || "—";

export const formatDate = (iso: string) => {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

export const initialImagingValues = (): ImagingValues => {
  const p = PATIENTS[0];
  const r = PROVIDER_RECIPIENTS[0];
  return {
    patient: p.id,
    dob: p.dob,
    mrn: p.mrn,
    phone: p.phone,
    gender: p.gender,
    address: p.address,
    imagingType: "X-Ray",
    laterality: "Right",
    priority: "Routine",
    procedure: "Knee X-Ray",
    bodyPart: "Knee",
    views: ["AP", "Lateral", "Sunrise"],
    recipientType: "provider",
    referringProvider: REFERRING_PROVIDERS[0].id,
    sendToId: r.id,
    sendToName: r.name,
    sendToSpecialty: r.specialty,
    faxNumber: r.fax,
    sendToAddress: r.address,
    cptCode: "73562",
    otherView: "",
    contrast: "No Contrast",
    reason: "",
    history: "",
    symptoms: "",
    onset: "",
    severity: "",
    priorTreatment: "",
    clinicalQuestions: "",
    specialInstructions: "",
    previousImaging: "None",
    schedule: "now",
    scheduleDate: todayISO(),
    documents: [],
    transmission: "referral",
  };
};

/* ---------------------------------------------------------------- */
/*  Validation                                                       */
/* ---------------------------------------------------------------- */
export const validateImagingPatient = (v: ImagingValues): Errors => {
  const e: Errors = {};
  if (!v.patient) e.patient = "Select a patient.";
  if (!v.imagingType) e.imagingType = "Select an imaging type.";
  if (!v.procedure) e.procedure = "Select a procedure / study.";
  if (!v.referringProvider) e.referringProvider = "Select the referring provider.";
  if (!v.sendToId && !v.sendToName.trim())
    e.sendToName = v.recipientType === "provider" ? "Select a provider to send to." : "Select a facility to send to.";
  return e;
};

/* ---------------------------------------------------------------- */
/*  Reusable pieces (also used by step 2 / 4)                        */
/* ---------------------------------------------------------------- */
export const EditLink = ({ onClick }: { onClick?: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-medium text-primary transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 sm:text-sm"
  >
    Edit
  </button>
);

/** Imaging type tile picker */
export const ImagingTypePicker = ({
  value,
  onChange,
  includeNuclear = true,
  error,
}: {
  value: string;
  onChange: (type: string) => void;
  includeNuclear?: boolean;
  error?: string;
}) => {
  const types = IMAGING_TYPES.filter((t) => includeNuclear || t.key !== "Nuclear Medicine");
  return (
    <div>
      <div role="radiogroup" aria-label="Imaging type" className={`grid gap-3 ${includeNuclear ? "grid-cols-3 sm:grid-cols-6" : "grid-cols-3 sm:grid-cols-5"}`}>
        {types.map((t) => {
          const active = value === t.key;
          return (
            <button
              key={t.key}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(t.key)}
              className={`flex h-[84px] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border px-2 text-center text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 sm:text-sm ${
                active
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card text-heading hover:border-primary/40 hover:bg-primary/5"
              }`}
            >
              <t.icon className="h-5 w-5" />
              {t.label}
            </button>
          );
        })}
      </div>
      {error && <p className="mt-2 text-xs text-danger">{error}</p>}
    </div>
  );
};

/** Apply an imaging-type change (clears the procedure that no longer applies). */
export const imagingTypePatch = (v: ImagingValues, type: string): Partial<ImagingValues> => {
  const stillValid = (PROCEDURES[type] ?? []).some((p) => p.name === v.procedure);
  return stillValid ? { imagingType: type } : { imagingType: type, procedure: "", cptCode: "" };
};

/** Apply a procedure selection (auto-fills CPT code and body part). */
export const procedurePatch = (name: string, type: string): Partial<ImagingValues> => {
  const p = (PROCEDURES[type] ?? []).find((x) => x.name === name);
  return { procedure: name, cptCode: p?.cpt ?? "", ...(p?.body ? { bodyPart: p.body } : {}) };
};

const SectionTitle = ({ title, action }: { title: string; action?: React.ReactNode }) => (
  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
    <h3 className="text-base font-semibold text-heading sm:text-lg">{title}</h3>
    {action}
  </div>
);

/* ---------------------------------------------------------------- */
/*  Component                                                        */
/* ---------------------------------------------------------------- */
const ImagingPatientStep = ({ values: v, errors, onChange }: StepProps<ImagingValues>) => {
  const isProvider = v.recipientType === "provider";
  const noun = isProvider ? "Provider" : "Facility";
  const directory = isProvider ? PROVIDER_RECIPIENTS : FACILITY_RECIPIENTS;

  const pickPatient = (id: string) => {
    const p = getPatient(id);
    if (!p) return;
    onChange({ patient: id, dob: p.dob, mrn: p.mrn, phone: p.phone, gender: p.gender, address: p.address });
  };

  const pickRecipient = (id: string) => {
    const r = directory.find((x) => x.id === id);
    if (!r) return;
    onChange({ sendToId: id, sendToName: r.name, sendToSpecialty: r.specialty, faxNumber: r.fax, sendToAddress: r.address });
  };

  const switchRecipientType = (type: ImagingValues["recipientType"]) => {
    if (type === v.recipientType) return;
    onChange({ recipientType: type, sendToId: "", sendToName: "", sendToSpecialty: "", faxNumber: "", sendToAddress: "" });
  };

  const protocolLabel =
    PROTOCOLS.find(
      (p) => p.views.length === v.views.length && p.views.every((x) => v.views.includes(x)),
    )?.label ?? "";

  const toggleCls = (active: boolean) =>
    `h-10 cursor-pointer whitespace-nowrap rounded-lg border px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${
      active
        ? "border-primary bg-primary/10 text-primary"
        : "border-border bg-card text-heading hover:border-primary/40 hover:bg-primary/5"
    }`;

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Patient information */}
      <section className={`${cardCls} sm:p-6`}>
        <SectionTitle
          title="Patient Information"
          action={<ImportButton text="Select from Patient" icon={null} onClick={() => {}} />}
        />
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[2fr_1fr_1fr]">
            <div className="md:col-span-2 xl:col-span-1">
              <SignupDropdown
                name="patient"
                label={<>Patient Name<Req /></>}
                icon={<Search className="h-4 w-4" />}
                placeholder="Search patient by name, MRN or DOB..."
                options={PATIENT_OPTIONS}
                value={v.patient}
                onChange={pickPatient}
                error={errors.patient}
              />
            </div>
            <SignupField
              name="dob"
              label="Date of Birth"
              placeholder="mm/dd/yyyy"
              value={v.dob}
              onChange={(e) => onChange({ dob: e.target.value })}
            />
            <SignupField
              name="mrn"
              label="MRN"
              placeholder="MRN"
              value={v.mrn}
              onChange={(e) => onChange({ mrn: e.target.value })}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[1fr_1fr_1.6fr]">
            <SignupField
              name="phone"
              label="Phone"
              placeholder="(000) 000-0000"
              value={v.phone}
              onChange={(e) => onChange({ phone: e.target.value })}
            />
            <SignupDropdown
              name="gender"
              label="Gender"
              placeholder="Select gender"
              searchable={false}
              options={toOptions(["Female", "Male", "Other", "Prefer not to say"])}
              value={v.gender}
              onChange={(val) => onChange({ gender: val })}
            />
            <div className="md:col-span-2 xl:col-span-1">
              <SignupField
                name="address"
                label="Address"
                placeholder="Enter address"
                value={v.address}
                onChange={(e) => onChange({ address: e.target.value })}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Imaging details (quick) */}
      <section className={`${cardCls} sm:p-6`}>
        <SectionTitle title="Imaging Details" />
        <div className="grid gap-x-6 gap-y-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          <div>
            <p className="mb-2 text-sm font-medium text-label">
              Imaging Type<Req />
            </p>
            <ImagingTypePicker
              value={v.imagingType}
              includeNuclear={false}
              onChange={(t) => onChange(imagingTypePatch(v, t))}
              error={errors.imagingType}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <ModalRadioGroup
              name="laterality"
              label="Laterality"
              value={v.laterality}
              onChange={(val) => onChange({ laterality: val })}
              options={LATERALITY_OPTIONS}
              className="h-12"
            />
            <SignupDropdown
              name="priority"
              label="Priority"
              placeholder="Select priority"
              searchable={false}
              options={PRIORITIES}
              value={v.priority}
              onChange={(val) => onChange({ priority: val })}
            />
          </div>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-[2fr_1fr_1.3fr]">
          <div className="md:col-span-2 xl:col-span-1">
            <SignupDropdown
              name="procedure"
              label={<>Procedure / Study<Req /></>}
              icon={<Search className="h-4 w-4" />}
              placeholder="Search procedure or study..."
              options={procedureOptions(v.imagingType)}
              value={v.procedure}
              onChange={(val) => onChange(procedurePatch(val, v.imagingType))}
              error={errors.procedure}
            />
          </div>
          <SignupDropdown
            name="bodyPart"
            label="Body Part"
            placeholder="Select body part"
            searchable={false}
            options={BODY_PARTS}
            value={v.bodyPart}
            onChange={(val) => onChange({ bodyPart: val })}
          />
          <SignupDropdown
            name="protocol"
            label={<>View / Protocol <span className="font-normal text-body">(if applicable)</span></>}
            placeholder="Select views"
            searchable={false}
            options={toOptions(PROTOCOLS.map((p) => p.label))}
            value={protocolLabel}
            onChange={(label) => {
              const p = PROTOCOLS.find((x) => x.label === label);
              if (p) onChange({ views: p.views });
            }}
          />
        </div>
      </section>

      {/* Referral / recipient */}
      <section className={`${cardCls} sm:p-6`}>
        <SectionTitle
          title="Referral / Recipient"
          action={
            <div role="tablist" aria-label="Recipient type" className="flex gap-2">
              <button type="button" role="tab" aria-selected={isProvider} onClick={() => switchRecipientType("provider")} className={toggleCls(isProvider)}>
                Provider
              </button>
              <button type="button" role="tab" aria-selected={!isProvider} onClick={() => switchRecipientType("facility")} className={toggleCls(!isProvider)}>
                Facility / Location
              </button>
            </div>
          }
        />
        <div className="grid gap-x-6 gap-y-4 md:grid-cols-2">
          <SignupDropdown
            name="referringProvider"
            label={<>Referring Provider<Req /></>}
            icon={<Search className="h-4 w-4" />}
            placeholder="Search referring provider..."
            options={REFERRING_PROVIDERS.map((p) => ({ value: p.id, label: p.name }))}
            value={v.referringProvider}
            onChange={(val) => onChange({ referringProvider: val })}
            error={errors.referringProvider}
          />
          <SignupDropdown
            name="sendTo"
            label={<>Send To {noun}<Req /></>}
            icon={<Search className="h-4 w-4" />}
            placeholder={`Search ${noun.toLowerCase()}...`}
            options={directory.map((r) => ({ value: r.id, label: r.name }))}
            value={v.sendToId}
            onChange={pickRecipient}
            error={errors.sendToName}
          />
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-[1fr_1fr_1.6fr]">
          <SignupField
            name="sendToSpecialty"
            label="Specialty"
            placeholder="Auto-filled from selection"
            value={v.sendToSpecialty}
            onChange={(e) => onChange({ sendToSpecialty: e.target.value })}
          />
          <SignupField
            name="faxNumber"
            label="Fax Number"
            placeholder="(000) 000-0000"
            value={v.faxNumber}
            onChange={(e) => onChange({ faxNumber: e.target.value })}
          />
          <div className="md:col-span-2 xl:col-span-1">
            <SignupField
              name="sendToAddress"
              label="Address"
              placeholder="Enter address"
              value={v.sendToAddress}
              onChange={(e) => onChange({ sendToAddress: e.target.value })}
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default ImagingPatientStep;