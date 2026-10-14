"use client";

import React from "react";
import {
  AlertCircle,
  Bug,
  FileText,
  Flower2,
  Nut,
  Pill,
  Shell,
  ShieldAlert,
  type LucideIcon,
} from "lucide-react";

import Table from "@/components/Table";
import { type TableColumn } from "@/components/Tableheader";
import Content from "@/components/Content";
import Tags, { type TagTone } from "@/components/Tags";
import AddButton from "@/components/Addbutton";
import EditButton from "@/components/EditButton";
import {
  ACTIONS_COL,
  DENSE,
  SectionCard,
  TONES,
  kebab,
  type Tone,
} from "./Medicalhistory";

/* ---------- Static data ---------- */
type Severity = "High" | "Moderate" | "Mild";

type Allergy = {
  allergen: string;
  icon: LucideIcon;
  tone: Tone;
  type: string;
  reaction: string;
  severity: Severity;
  date: string;
  notes: string;
};

const ALLERGIES: Allergy[] = [
  { allergen: "Penicillin", icon: Pill, tone: "red", type: "Medication", reaction: "Rash, Hives", severity: "High", date: "Mar 12, 2020", notes: "Avoid all penicillin-class antibiotics" },
  { allergen: "Peanuts", icon: Nut, tone: "orange", type: "Food", reaction: "Anaphylaxis, Swelling", severity: "High", date: "Jun 5, 2018", notes: "Carries epinephrine auto-injector" },
  { allergen: "Pollen", icon: Flower2, tone: "green", type: "Environmental", reaction: "Sneezing, Itchy eyes", severity: "Moderate", date: "Apr 10, 2019", notes: "Seasonal allergies (spring)" },
  { allergen: "Dust Mites", icon: Bug, tone: "blue", type: "Environmental", reaction: "Runny nose, Cough", severity: "Mild", date: "Jan 15, 2021", notes: "Use air purifier at home" },
  { allergen: "Shellfish", icon: Shell, tone: "violet", type: "Food", reaction: "Hives, Nausea", severity: "High", date: "Aug 2, 2017", notes: "Avoid shellfish and related products" },
];

const SEVERITY_TONE: Record<Severity, TagTone> = {
  High: "danger",
  Moderate: "warning",
  Mild: "info",
};

const NOTES_TEXT = [
  "Patient has a history of severe allergic reactions to penicillin and peanuts.",
  "Carries an epinephrine auto-injector. Recommend monitoring for cross-reactivity with related medications and food products.",
];

const col = (key: string, label: string): TableColumn => ({ key, label, className: DENSE });

const COLUMNS: TableColumn[] = [
  col("allergen", "Allergen"),
  col("type", "Type"),
  col("reaction", "Reaction"),
  col("severity", "Severity"),
  col("date", "Date Identified"),
  col("status", "Status"),
  col("notes", "Notes"),
  ACTIONS_COL,
];

/* ---------- Component ---------- */
const Allergies = () => {
  const highRisk = ALLERGIES.filter((a) => a.severity === "High");

  const rows = ALLERGIES.map((a) => ({
    allergen: (
      <div className="flex min-w-0 items-center gap-3">
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${TONES[a.tone]}`}>
          <a.icon className="h-4 w-4" />
        </span>
        <Content title={a.allergen} truncate />
      </div>
    ),
    type: <Content title={a.type} truncate />,
    reaction: <Content title={a.reaction} truncate />,
    severity: <Tags text={a.severity} tone={SEVERITY_TONE[a.severity]} />,
    date: <Content title={a.date} truncate />,
    status: <Tags text="Active" tone="success" />,
    notes: <Content title={a.notes} truncate />,
    actions: kebab,
  }));

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Allergies table */}
      <SectionCard
        className="!h-auto"
        icon={ShieldAlert}
        tone="red"
        title="Allergies"
        subtitle="Manage patient allergies and adverse reactions."
        action={<AddButton text="Add Allergy" onClick={() => {}} />}
      >
        <Table columns={COLUMNS} rows={rows} />
      </SectionCard>

      <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-2">
        {/* Allergy alert */}
        <SectionCard
          className="!h-auto"
          icon={ShieldAlert}
          tone="red"
          title="Allergy Alert"
          subtitle="These allergies will be shown as an alert in appointments and encounters."
        >
          <div className="flex items-center gap-3 rounded-xl border border-danger/25 bg-danger/10 p-4 dark:border-danger/40 dark:bg-danger/15">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-danger text-white">
              <AlertCircle className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-danger">
                {highRisk.length} High Risk Allergies
              </p>
              <p className="text-xs text-danger/80">{highRisk.map((a) => a.allergen).join(", ")}</p>
            </div>
          </div>
        </SectionCard>

        {/* Allergy notes */}
        <SectionCard
          className="!h-auto"
          icon={FileText}
          tone="blue"
          title="Allergy Notes"
          action={<EditButton section="Allergy Notes" onEdit={() => {}} />}
        >
          <div className="space-y-1 rounded-xl border border-border bg-primary/5 p-4 text-sm leading-relaxed text-heading">
            {NOTES_TEXT.map((t) => (
              <p key={t}>{t}</p>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
};

export default Allergies;