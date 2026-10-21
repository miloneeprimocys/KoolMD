"use client";

import React from "react";
import { AlertTriangle, FileText, Info, Mail, Phone } from "lucide-react";

import Table from "@/components/Table";
import { type TableColumn } from "@/components/Tableheader";
import Content from "@/components/Content";
import Tags from "@/components/Tags";
import { cardCls } from "@/providers/Shared";
import {
  CATEGORY_TONE,
  EditLink,
  SelectedTestsCard,
  formatPrice,
  type LabTest,
} from "./Selecttests";
import {
  PRIORITY_TONE,
  collectionDateTime,
  effectivePriority,
  formatDate,
  type AdditionalInfoValues,
  type OrderSnapshot,
} from "./Additionalinfo";

/* ---------- Patient info (replace with real patient data) ---------- */
export type PatientInfo = {
  name: string;
  id: string;
  gender: string;
  age: number;
  dob: string;
  phone: string;
  email: string;
  allergies: string[];
};

export const SAMPLE_PATIENT: PatientInfo = {
  name: "John Smith",
  id: "PT-1008",
  gender: "Male",
  age: 35,
  dob: "12 Mar 1989",
  phone: "+1 234 567 8900",
  email: "john.smith@email.com",
  allergies: ["Penicillin"],
};

/* ---------- Small pieces ---------- */
const CardHeader = ({ title, onEdit }: { title: string; onEdit?: () => void }) => (
  <div className="mb-3 flex items-center justify-between gap-3">
    <h3 className="text-base font-semibold text-heading">{title}</h3>
    {onEdit && <EditLink onClick={onEdit} />}
  </div>
);

const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="grid grid-cols-[130px_minmax(0,1fr)] gap-3 py-1.5 text-sm sm:grid-cols-[150px_minmax(0,1fr)]">
    <dt className="text-body">{label}</dt>
    <dd className="min-w-0 break-words text-heading">{children}</dd>
  </div>
);

const TEST_COLUMNS: TableColumn[] = [
  { key: "n", label: "#", className: "w-12" },
  { key: "name", label: "Test Name" },
  { key: "code", label: "Code" },
  { key: "category", label: "Category" },
  {
    key: "price",
    label: "Price (₹)",
    header: <div className="flex w-full items-center justify-end">Price (₹)</div>,
  },
];

/* ---------- Component ---------- */
type Props = {
  tests: LabTest[];
  snapshot: OrderSnapshot;
  additional: AdditionalInfoValues;
  patient?: PatientInfo;
  /** Jump back to a step (1 = Order Details, 2 = Select Tests, 3 = Additional Info) */
  onEdit: (step: number) => void;
};

const ReviewSave = ({ tests, snapshot, additional, patient = SAMPLE_PATIENT, onEdit }: Props) => {
  const priority = effectivePriority(additional, snapshot);
  const total = tests.reduce((sum, t) => sum + t.price, 0);

  const rows = tests.map((t, i) => ({
    n: <Content title={String(i + 1)} />,
    name: <Content title={t.name} truncate />,
    code: <Content title={t.code} truncate />,
    category: <Tags text={t.category} tone={CATEGORY_TONE[t.category]} />,
    price: <div className="flex w-full justify-end text-sm text-heading">{formatPrice(t.price)}</div>,
  }));

  const initials = patient.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("");

  return (
    <div className="grid items-start gap-4 sm:gap-5 2xl:grid-cols-[minmax(0,1fr)_380px]">
      {/* ================= LEFT ================= */}
      <div className="min-w-0 space-y-4 sm:space-y-5">
        {/* Patient information */}
        <section className={`${cardCls} sm:p-6`}>
          <CardHeader title="Patient Information" onEdit={() => onEdit(1)} />
          <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1.35fr)_repeat(3,minmax(0,1fr))] lg:items-center lg:gap-0">
            <div className="flex min-w-0 items-center gap-3 lg:pr-4">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-base font-semibold text-primary">
                {initials}
              </span>
              <div className="min-w-0">
                <p className="truncate text-base font-semibold text-heading">
                  {patient.name} ({patient.id})
                </p>
                <p className="text-xs text-body">
                  {patient.gender} • {patient.age} years • DOB: {patient.dob}
                </p>
              </div>
            </div>
            <div className="flex min-w-0 items-center gap-2 text-sm text-heading lg:border-l lg:border-divider lg:px-4">
              <Phone className="h-4 w-4 shrink-0 text-body" />
              <span className="break-words">{patient.phone}</span>
            </div>
            <div className="flex min-w-0 items-center gap-2 text-sm text-heading lg:border-l lg:border-divider lg:px-4">
              <Mail className="h-4 w-4 shrink-0 text-body" />
              <span className="break-all">{patient.email}</span>
            </div>
            <div className="min-w-0 lg:border-l lg:border-divider lg:pl-4">
              <p className="text-xs font-medium text-heading">Allergies</p>
              {patient.allergies.length > 0 ? (
                <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-danger">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  {patient.allergies.join(", ")}
                </p>
              ) : (
                <p className="mt-1 text-sm text-body">None</p>
              )}
            </div>
          </div>
        </section>

        {/* Order details */}
        <section className={`${cardCls} sm:p-6`}>
          <CardHeader title="Order Details" onEdit={() => onEdit(1)} />
          <dl>
            <Row label="Ordering Provider">{snapshot.provider}</Row>
            <Row label="Order Date">{formatDate(snapshot.orderDate)}</Row>
            <Row label="Priority">
              <Tags text={priority} tone={PRIORITY_TONE[priority] ?? "neutral"} />
            </Row>
            <Row label="Diagnosis / Clinical Indication">{snapshot.diagnosis || "—"}</Row>
          </dl>
        </section>

        {/* Selected tests */}
        <section className={`${cardCls} sm:p-6`}>
          <CardHeader title={`Selected Tests (${tests.length})`} onEdit={() => onEdit(2)} />
          <div className="w-full min-w-0 overflow-hidden rounded-[14px] border border-border bg-card">
            <Table columns={TEST_COLUMNS} rows={rows} bordered={false} />
          </div>
        </section>

        {/* Specimen & instructions */}
        <section className={`${cardCls} sm:p-6`}>
          <CardHeader title="Specimen & Instructions" onEdit={() => onEdit(3)} />
          <div className="grid gap-x-8 lg:grid-cols-2">
            <dl>
              <Row label="Specimen Source">{additional.specimenSource || "—"}</Row>
              <Row label="Fasting Required">{additional.fasting}</Row>
              <Row label="Collection Date & Time">{collectionDateTime(additional)}</Row>
              <Row label="Collection Location">{additional.collectionLocation || "—"}</Row>
              <Row label="Specimen Type">{additional.specimenType || "—"}</Row>
            </dl>
            <dl className="lg:border-l lg:border-divider lg:pl-8">
              <Row label="Patient Instructions">{additional.patientInstructions.trim() || "None"}</Row>
              <Row label="Internal Notes">{additional.internalNotes.trim() || "None"}</Row>
            </dl>
          </div>
        </section>
      </div>

      {/* ================= RIGHT ================= */}
      <aside className="min-w-0 space-y-4 sm:space-y-5 2xl:sticky 2xl:top-0 2xl:self-start">
        <section className={`${cardCls} sm:p-6`}>
          <h3 className="mb-3 text-base font-semibold text-heading">Order Summary</h3>

          <dl className="space-y-1.5 rounded-xl border border-border bg-primary/5 px-4 py-3 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-body">Total Tests</dt>
              <dd className="font-semibold text-heading">{tests.length}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-body">Estimated Total (₹)</dt>
              <dd className="font-semibold text-heading">{formatPrice(total)}</dd>
            </div>
          </dl>

          <div className="mt-4 space-y-3">
            <div className="flex items-start gap-3 rounded-xl bg-primary/5 px-4 py-3 text-xs text-body sm:text-[13px]">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>
                The laboratory will receive this order electronically and prepare collection
                instructions for the patient.
              </span>
            </div>
            <div className="flex items-start gap-3 rounded-xl bg-primary/5 px-4 py-3 text-xs text-body sm:text-[13px]">
              <FileText className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>
                An order confirmation will be visible in the patient&apos;s Lab Orders and Lab
                Results sections after creation.
              </span>
            </div>
          </div>
        </section>

        <SelectedTestsCard tests={tests} showPrice onEdit={() => onEdit(2)} />

        <div className="flex items-center justify-between rounded-2xl border border-border bg-primary/5 dark:bg-primary/15 px-5 py-4">
          <span className="text-sm font-semibold text-heading">Estimated Total</span>
          <span className="text-lg font-bold text-label">₹ {formatPrice(total)}</span>
        </div>
      </aside>
    </div>
  );
};

export default ReviewSave;
