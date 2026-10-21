"use client";

import React from "react";
import { Info } from "lucide-react";

import SignupDropdown from "@/components/SignupDropdown";
import DatePicker from "@/components/Datepicker";
import Tags, { type TagTone } from "@/components/Tags";
import { ModalRadioGroup } from "@/components/Modalshell";
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
import { SelectedTestsCard, EditLink, type LabTest } from "./Selecttests";

/* ---------- Options ---------- */
const SPECIMEN_SOURCES = toOptions([
  "Blood (Venous)",
  "Blood (Capillary)",
  "Urine",
  "Stool",
  "Saliva",
  "Swab",
  "Tissue",
]);
const PRIORITY_OPTIONS = toOptions(["Same as Order", "Routine", "STAT", "Urgent"]);
const TIME_OPTIONS = toOptions([
  "08:00 AM", "08:30 AM", "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM",
  "11:00 AM", "11:30 AM", "12:00 PM", "01:00 PM", "01:30 PM", "02:00 PM",
  "02:30 PM", "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM", "05:00 PM",
]);
const LOCATIONS = toOptions(["Main Laboratory", "Outpatient Collection Center", "Bedside / On-site", "Partner Laboratory"]);
const SPECIMEN_TYPES = toOptions(["Whole Blood (EDTA)", "Serum", "Plasma", "Clean-catch Urine", "Random Stool", "Other"]);
const FASTING_OPTIONS = [
  { value: "Yes", label: "Yes" },
  { value: "No", label: "No" },
  { value: "Not Specified", label: "Not Specified" },
];

/* ---------- Values + validation ---------- */
export type AdditionalInfoValues = {
  specimenSource: string;
  fasting: string;
  priority: string;
  collectionDate: string;
  collectionTime: string;
  collectionLocation: string;
  specimenType: string;
  patientInstructions: string;
  internalNotes: string;
};

export const initialAdditionalInfo = (): AdditionalInfoValues => ({
  specimenSource: "Blood (Venous)",
  fasting: "No",
  priority: "Same as Order",
  collectionDate: todayISO(),
  collectionTime: "08:30 AM",
  collectionLocation: "Main Laboratory",
  specimenType: "Whole Blood (EDTA)",
  patientInstructions: "",
  internalNotes: "",
});

export const validateAdditionalInfo = (v: AdditionalInfoValues): Errors => {
  const e: Errors = {};
  if (!v.specimenSource) e.specimenSource = "Specimen source is required.";
  if (v.collectionDate && v.collectionDate < todayISO())
    e.collectionDate = "Collection date cannot be in the past.";
  return e;
};

/* ---------- Order snapshot (from step 1) shown in summaries ---------- */
export type OrderSnapshot = {
  patient: string;
  provider: string;
  orderDate: string; // ISO
  priority: string;
  diagnosis: string;
};

export const PRIORITY_TONE: Record<string, TagTone> = {
  Routine: "info",
  STAT: "danger",
  Urgent: "warning",
};

export const formatDate = (iso: string) => {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const effectivePriority = (a: AdditionalInfoValues, s: OrderSnapshot) =>
  a.priority === "Same as Order" ? s.priority : a.priority;

export const collectionDateTime = (a: AdditionalInfoValues) =>
  a.collectionDate ? `${formatDate(a.collectionDate)}, ${a.collectionTime}` : "—";

/* ---------- Order summary rows ---------- */
const SummaryRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="grid grid-cols-[130px_minmax(0,1fr)] gap-3 py-1.5 text-sm">
    <dt className="text-body">{label}</dt>
    <dd className="min-w-0 break-words text-heading">{children}</dd>
  </div>
);

/* ---------- Component ---------- */
type Props = StepProps<AdditionalInfoValues> & {
  tests: LabTest[];
  snapshot: OrderSnapshot;
  onRemoveTest: (id: string) => void;
  /** Jump back to a step (1 = Order Details, 2 = Select Tests) */
  onEdit: (step: number) => void;
};

const AdditionalInfo = ({
  values,
  errors,
  onChange,
  tests,
  snapshot,
  onRemoveTest,
  onEdit,
}: Props) => {
  const priority = effectivePriority(values, snapshot);

  return (
    <div className="grid items-start gap-4 sm:gap-5 2xl:grid-cols-[minmax(0,1fr)_380px]">
      {/* ================= LEFT ================= */}
      <section className={`${cardCls} min-w-0 space-y-4 sm:p-6`}>
        <div>
          <h3 className="text-base font-semibold text-heading sm:text-lg">Specimen &amp; Instructions</h3>
          <p className="mt-0.5 text-xs text-body sm:text-sm">
            Provide specimen details, collection information and any special instructions.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <SignupDropdown
            name="specimenSource"
            label={<>Specimen Source<Req /></>}
            placeholder="Select specimen source"
            searchable={false}
            options={SPECIMEN_SOURCES}
            value={values.specimenSource}
            onChange={(v) => onChange({ specimenSource: v })}
            error={errors.specimenSource}
          />
          <ModalRadioGroup
            name="fasting"
            label="Fasting Required"
            value={values.fasting}
            onChange={(v) => onChange({ fasting: v })}
            options={FASTING_OPTIONS}
            className="h-12"
          />
          <SignupDropdown
            name="priority"
            label="Priority (if different)"
            placeholder="Select priority"
            searchable={false}
            options={PRIORITY_OPTIONS}
            value={values.priority}
            onChange={(v) => onChange({ priority: v })}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <DatePicker
            name="collectionDate"
            label={<>Collection Date<Opt /></>}
            placeholder="dd-mm-yyyy"
            value={values.collectionDate}
            onChange={(v) => onChange({ collectionDate: v })}
            minDate={todayISO()}
            error={errors.collectionDate}
          />
          <SignupDropdown
            name="collectionTime"
            label={<>Collection Time<Opt /></>}
            placeholder="Select time"
            searchable={false}
            options={TIME_OPTIONS}
            value={values.collectionTime}
            onChange={(v) => onChange({ collectionTime: v })}
          />
          <SignupDropdown
            name="collectionLocation"
            label={<>Collection Location<Opt /></>}
            placeholder="Select location"
            searchable={false}
            options={LOCATIONS}
            value={values.collectionLocation}
            onChange={(v) => onChange({ collectionLocation: v })}
          />
          <SignupDropdown
            name="specimenType"
            label={<>Specimen Type<Opt /></>}
            placeholder="Select specimen type"
            searchable={false}
            options={SPECIMEN_TYPES}
            value={values.specimenType}
            onChange={(v) => onChange({ specimenType: v })}
          />
        </div>

        <TextArea
          name="patientInstructions"
          label={<>Patient Instructions<Opt /></>}
          placeholder="e.g., Fasting instructions, medication restrictions, collection method, etc."
          value={values.patientInstructions}
          onChange={(v) => onChange({ patientInstructions: v })}
          maxLength={500}
          rows={3}
        />
        <TextArea
          name="internalNotes"
          label={<>Internal Notes<Opt /></>}
          placeholder="Add any internal notes visible to clinical staff only..."
          value={values.internalNotes}
          onChange={(v) => onChange({ internalNotes: v })}
          maxLength={500}
          rows={3}
        />

        {/* Important notes */}
        <div className="flex items-start gap-3 rounded-xl bg-primary/5 px-4 py-3.5">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div>
            <p className="text-sm font-semibold text-heading">Important Notes</p>
            <ul className="mt-1.5 list-disc space-y-1 pl-4 text-xs text-body sm:text-[13px]">
              <li>Patient will receive preparation instructions based on the selected tests (e.g., fasting, medication restrictions).</li>
              <li>Collection details will be included on the lab requisition form.</li>
              <li>Internal notes are for clinical staff use only and will not be visible to the patient.</li>
              <li>Verify all information before proceeding to review and create the order.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ================= RIGHT ================= */}
      <aside className="space-y-4 sm:space-y-5 2xl:sticky 2xl:top-0 2xl:self-start">
        <SelectedTestsCard
          tests={tests}
          onRemove={onRemoveTest}
          onEdit={() => onEdit(2)}
        />

        <section className={`${cardCls} sm:p-6`}>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="text-base font-semibold text-heading">Order Summary</h3>
            <EditLink onClick={() => onEdit(1)} />
          </div>
          <dl className="divide-y divide-divider">
            <SummaryRow label="Patient">{snapshot.patient}</SummaryRow>
            <SummaryRow label="Ordering Provider">{snapshot.provider}</SummaryRow>
            <SummaryRow label="Order Date">{formatDate(snapshot.orderDate)}</SummaryRow>
            <SummaryRow label="Priority">
              <Tags text={priority} tone={PRIORITY_TONE[priority] ?? "neutral"} />
            </SummaryRow>
            <SummaryRow label="Specimen Source">{values.specimenSource || "—"}</SummaryRow>
            <SummaryRow label="Fasting Required">{values.fasting}</SummaryRow>
            <SummaryRow label="Collection Date & Time">{collectionDateTime(values)}</SummaryRow>
            <SummaryRow label="Collection Location">{values.collectionLocation || "—"}</SummaryRow>
            <SummaryRow label="Specimen Type">{values.specimenType || "—"}</SummaryRow>
          </dl>
        </section>
      </aside>
    </div>
  );
};

export default AdditionalInfo;
