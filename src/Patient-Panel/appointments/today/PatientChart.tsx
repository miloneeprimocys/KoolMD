"use client";

import React, { type ReactNode } from "react";
import {
  AlertTriangle,
  Ban,
  CalendarDays,
  ChevronRight,
  ClipboardList,
  Download,
  Dumbbell,
  FileText,
  FolderOpen,
  HeartPulse,
  History,
  Info,
  Pill,
  ShieldOff,
  Stethoscope,
  Users,
  Wine,
  Activity,
  type LucideIcon,
} from "lucide-react";

import AddInternalButton from "@/components/AddInternalButton";
import Actions from "@/components/Actions";
import Content from "@/components/Content";
import EditButton from "@/components/EditButton";
import StatCards, { type StatItem } from "@/components/Statcards";
import Table from "@/components/Table";
import { type TableColumn } from "@/components/Tableheader";
import Tags from "@/components/Tags";
import { cardCls } from "@/providers/Shared";

import type { ChartTab } from "./ReviewIntakeChart";

/* ---------------------------------------------------------------- */
/*  Static chart data (replace with API data)                        */
/* ---------------------------------------------------------------- */
const CONDITIONS = [{ condition: "Migraines", status: "Active", onset: "2021", notes: "Recurrent, managed with lifestyle and medication" }];

const MEDICATIONS = [{ medication: "Multivitamin", dose: "1 tab", frequency: "Daily", start: "Mar 10, 2026" }];

const PAST_HISTORY = ["Migraines (2021)", "Seasonal Allergies"];
const FAMILY_HISTORY = ["Hypertension – Mother", "Diabetes – Father"];

const SOCIAL = [
  { icon: Ban, text: "Non-smoker" },
  { icon: Wine, text: "Occasional alcohol" },
  { icon: Dumbbell, text: "Exercises 2–3 times/week" },
];

const VITALS = [
  { icon: HeartPulse, label: "Blood Pressure", value: "118 / 76 mmHg" },
  { icon: Activity, label: "Heart Rate", value: "72 bpm" },
  { icon: Stethoscope, label: "Temperature", value: "98.4 °F" },
  { icon: ClipboardList, label: "Weight", value: "62 kg (136.7 lb)" },
  { icon: FileText, label: "BMI", value: "22.1" },
];

const ENCOUNTERS = [
  { date: "Oct 21, 2026", title: "Headache Management • Follow-up" },
  { date: "Aug 15, 2026", title: "Annual Wellness Visit" },
];

const KEY_DOCUMENTS = [
  { name: "Intake Questionnaire", date: "Nov 26, 2026" },
  { name: "Lab Results.pdf", date: "Oct 21, 2026" },
  { name: "Previous Visit Summary.pdf", date: "Oct 21, 2026" },
];

const OVERVIEW_STATS: StatItem[] = [
  { label: "Active Conditions", value: "1", Icon: HeartPulse, accent: "danger" },
  { label: "Medications", value: "1", Icon: Pill, accent: "primary" },
  { label: "Allergies", value: "0", Icon: AlertTriangle, accent: "warning" },
  { label: "Last Visit", value: "Oct 21, 2026", Icon: CalendarDays, accent: "violet" },
];

const CONDITION_COLUMNS: TableColumn[] = [
  { key: "condition", label: "Condition" },
  { key: "status", label: "Status" },
  { key: "onset", label: "Onset" },
  { key: "notes", label: "Notes" },
];

const MEDICATION_COLUMNS: TableColumn[] = [
  { key: "medication", label: "Medication" },
  { key: "dose", label: "Dose" },
  { key: "frequency", label: "Frequency" },
  { key: "start", label: "Start Date" },
  { key: "actions", label: "", className: "w-10" },
];

/* ---------------------------------------------------------------- */
/*  Small building blocks                                            */
/* ---------------------------------------------------------------- */
const Box = ({
  icon: Icon,
  title,
  action,
  children,
}: {
  icon: LucideIcon;
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) => (
  <section className={`${cardCls} min-w-0 space-y-3 !p-3.5 sm:!p-4`}>
    <header className="flex items-center justify-between gap-3">
      <h3 className="flex min-w-0 items-center gap-2 text-sm font-semibold text-heading">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </span>
        <span className="truncate">{title}</span>
      </h3>
      {action}
    </header>
    {children}
  </section>
);

const addBtn = "h-9! whitespace-nowrap";

/* ---------------------------------------------------------------- */
/*  Tab: Patient Chart                                               */
/* ---------------------------------------------------------------- */
const PatientChart = ({ onNavigate }: { onNavigate: (tab: ChartTab) => void }) => {
  const conditionRows = CONDITIONS.map((c) => ({
    condition: (
      <span className="flex items-center gap-1.5">
        <Content title={c.condition} />
        <Info className="h-3.5 w-3.5 text-body" aria-hidden="true" />
      </span>
    ),
    status: <Tags text={c.status} tone="success" size="xs" />,
    onset: <Content title={c.onset} />,
    notes: <Content title={c.notes} truncate />,
  }));

  const medicationRows = MEDICATIONS.map((m) => ({
    medication: <Content title={m.medication} />,
    dose: <Content title={m.dose} />,
    frequency: <Content title={m.frequency} />,
    start: <Content title={m.start} />,
    actions: (
      <div className="flex w-full items-center justify-center">
        <Actions actions={["more"]} size="sm" />
      </div>
    ),
  }));

  return (
    <div className="grid min-w-0 items-start gap-4 sm:gap-5 2xl:grid-cols-[minmax(0,1fr)_340px]">
      {/* ================= LEFT ================= */}
      <section className={`${cardCls} min-w-0 space-y-4 sm:p-5`}>
        <h3 className="text-base font-semibold text-heading">Patient Chart – Overview</h3>

        <StatCards stats={OVERVIEW_STATS} truncateContent gridClassName="grid-cols-1 sm:grid-cols-2 2xl:grid-cols-4" />

        <Box
          icon={ClipboardList}
          title="Problem List / Active Conditions"
          action={<AddInternalButton className={addBtn} text="Add Condition" onClick={() => {}} />}
        >
          <div className="overflow-hidden rounded-[14px] border border-border bg-card">
            <Table columns={CONDITION_COLUMNS} rows={conditionRows} bordered={false} />
          </div>
        </Box>

        <Box
          icon={Pill}
          title={`Current Medications (${MEDICATIONS.length})`}
          action={<AddInternalButton className={addBtn} text="Add Medication" onClick={() => {}} />}
        >
          <div className="overflow-hidden rounded-[14px] border border-border bg-card">
            <Table columns={MEDICATION_COLUMNS} rows={medicationRows} bordered={false} />
          </div>
        </Box>

        <div className="grid gap-4 md:grid-cols-2">
          <Box
            icon={AlertTriangle}
            title="Allergies (0)"
            action={<AddInternalButton className={addBtn} text="Add Allergy" onClick={() => {}} />}
          >
            <div className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-border py-6 text-sm text-body">
              <ShieldOff className="h-5 w-5" />
              No known allergies
            </div>
          </Box>

          <Box
            icon={History}
            title={`Past Medical History (${PAST_HISTORY.length})`}
            action={<AddInternalButton className={addBtn} text="Add History" onClick={() => {}} />}
          >
            <ul className="list-disc space-y-1 pl-5 text-sm text-heading marker:text-primary">
              {PAST_HISTORY.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
          </Box>

          <Box
            icon={Users}
            title={`Family History (${FAMILY_HISTORY.length})`}
            action={<AddInternalButton className={addBtn} text="Add History" onClick={() => {}} />}
          >
            <ul className="space-y-1">
              {FAMILY_HISTORY.map((f) => (
                <li key={f} className="flex items-center justify-between gap-2 text-sm text-heading">
                  <span className="min-w-0 truncate">• {f}</span>
                  <Actions actions={["more"]} size="sm" />
                </li>
              ))}
            </ul>
          </Box>

          <Box
            icon={Activity}
            title="Social History"
            action={<EditButton section="Social History" onEdit={() => {}} />}
          >
            <ul className="grid grid-cols-3 gap-2 text-center">
              {SOCIAL.map(({ icon: Icon, text }) => (
                <li key={text} className="flex flex-col items-center gap-1.5 text-xs text-body">
                  <Icon className="h-4 w-4 text-primary" />
                  {text}
                </li>
              ))}
            </ul>
          </Box>
        </div>
      </section>

      {/* ================= RIGHT ================= */}
      <aside className="min-w-0 space-y-4 sm:space-y-5">
        <Box
          icon={Activity}
          title="Recent Vitals"
          action={<EditButton section="Recent Vitals" variant="viewAll" onEdit={() => {}} />}
        >
          <dl className="divide-y divide-divider">
            {VITALS.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center justify-between gap-3 py-2.5 text-sm first:pt-0 last:pb-0">
                <dt className="flex items-center gap-2 text-body">
                  <Icon className="h-4 w-4 text-primary" />
                  {label}
                </dt>
                <dd className="font-semibold text-heading">{value}</dd>
              </div>
            ))}
          </dl>
          <p className="text-xs text-body">Last recorded: Nov 18, 2026</p>
        </Box>

        <Box
          icon={CalendarDays}
          title="Recent Encounters"
          action={<EditButton section="Recent Encounters" variant="viewAll" onEdit={() => onNavigate("encounters")} />}
        >
          <ul className="divide-y divide-divider">
            {ENCOUNTERS.map((e) => (
              <li key={e.date}>
                <button
                  type="button"
                  onClick={() => onNavigate("encounters")}
                  className="flex w-full cursor-pointer items-center gap-3 py-2.5 text-left transition-colors hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <CalendarDays className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-heading">{e.date}</span>
                    <span className="block truncate text-xs text-body">{e.title}</span>
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-body" />
                </button>
              </li>
            ))}
          </ul>
        </Box>

        <Box
          icon={FolderOpen}
          title={`Key Documents (${KEY_DOCUMENTS.length})`}
          action={<EditButton section="Key Documents" variant="viewAll" onEdit={() => onNavigate("documents")} />}
        >
          <ul className="divide-y divide-divider">
            {KEY_DOCUMENTS.map((d) => (
              <li key={d.name} className="flex items-center gap-3 py-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-danger/10 text-danger">
                  <FileText className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-heading">{d.name}</span>
                  <span className="block text-xs text-body">{d.date}</span>
                </span>
                <button
                  type="button"
                  aria-label={`Download ${d.name}`}
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-body transition-colors hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                >
                  <Download className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        </Box>
      </aside>
    </div>
  );
};

export default PatientChart;