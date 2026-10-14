"use client";

import React from "react";
import { Clock, Pill } from "lucide-react";

import Table from "@/components/Table";
import { type TableColumn } from "@/components/Tableheader";
import Content from "@/components/Content";
import Tags from "@/components/Tags";
import AddButton from "@/components/Addbutton";
import {
  ACTIONS_COL,
  DENSE,
  ScrollArea,
  SectionCard,
  TONES,
  kebab,
  type Tone,
} from "./Medicalhistory";

/* ---------- Static data ---------- */
type Current = {
  name: string;
  category: string;
  dose: string;
  form: string;
  frequency: string;
  when: string;
  start: string;
  provider: string;
  providerId: string;
  notes: string;
  tone: Tone;
};

const CURRENT: Current[] = [
  { name: "Albuterol Inhaler", category: "Asthma", dose: "2 puffs", form: "(90 mcg)", frequency: "As needed", when: "For wheezing", start: "Mar 15, 2023", provider: "Dr. Sarah Lee", providerId: "KMD-1001", notes: "Use before exercise", tone: "blue" },
  { name: "Cetirizine", category: "Allergic Rhinitis", dose: "10 mg", form: "(Tablet)", frequency: "Once daily", when: "Morning", start: "May 2, 2022", provider: "Dr. James Wilson", providerId: "KMD-1002", notes: "For seasonal allergies", tone: "pink" },
  { name: "Montelukast", category: "Asthma", dose: "10 mg", form: "(Tablet)", frequency: "Once daily", when: "Night", start: "Jan 10, 2023", provider: "Dr. Emily Davis", providerId: "KMD-1003", notes: "Take at bedtime", tone: "green" },
  { name: "Vitamin D3", category: "Supplement", dose: "1000 IU", form: "(Tablet)", frequency: "Once daily", when: "Morning", start: "Feb 1, 2024", provider: "Dr. Sarah Lee", providerId: "KMD-1001", notes: "General health", tone: "orange" },
];

type Past = {
  name: string;
  category: string;
  dose: string;
  form: string;
  frequency: string;
  start: string;
  end: string;
  reason: string;
  provider: string;
  providerId: string;
  tone: Tone;
};

const PAST: Past[] = [
  { name: "Amoxicillin", category: "Antibiotic", dose: "500 mg", form: "(Capsule)", frequency: "3 times daily", start: "Aug 15, 2022", end: "Aug 22, 2022", reason: "Completed course", provider: "Dr. Michael Brown", providerId: "KMD-1004", tone: "pink" },
  { name: "Prednisone", category: "Steroid", dose: "20 mg", form: "(Tablet)", frequency: "Once daily", start: "Mar 1, 2021", end: "Mar 7, 2021", reason: "Short-term treatment for flare-up", provider: "Dr. James Wilson", providerId: "KMD-1002", tone: "violet" },
   { name: "Amoxicillin", category: "Antibiotic", dose: "500 mg", form: "(Capsule)", frequency: "3 times daily", start: "Aug 15, 2022", end: "Aug 22, 2022", reason: "Completed course", provider: "Dr. Michael Brown", providerId: "KMD-1004", tone: "pink" },
  { name: "Prednisone", category: "Steroid", dose: "20 mg", form: "(Tablet)", frequency: "Once daily", start: "Mar 1, 2021", end: "Mar 7, 2021", reason: "Short-term treatment for flare-up", provider: "Dr. James Wilson", providerId: "KMD-1002", tone: "violet" },
   { name: "Amoxicillin", category: "Antibiotic", dose: "500 mg", form: "(Capsule)", frequency: "3 times daily", start: "Aug 15, 2022", end: "Aug 22, 2022", reason: "Completed course", provider: "Dr. Michael Brown", providerId: "KMD-1004", tone: "pink" },
  { name: "Prednisone", category: "Steroid", dose: "20 mg", form: "(Tablet)", frequency: "Once daily", start: "Mar 1, 2021", end: "Mar 7, 2021", reason: "Short-term treatment for flare-up", provider: "Dr. James Wilson", providerId: "KMD-1002", tone: "violet" },
   { name: "Amoxicillin", category: "Antibiotic", dose: "500 mg", form: "(Capsule)", frequency: "3 times daily", start: "Aug 15, 2022", end: "Aug 22, 2022", reason: "Completed course", provider: "Dr. Michael Brown", providerId: "KMD-1004", tone: "pink" },
  { name: "Prednisone", category: "Steroid", dose: "20 mg", form: "(Tablet)", frequency: "Once daily", start: "Mar 1, 2021", end: "Mar 7, 2021", reason: "Short-term treatment for flare-up", provider: "Dr. James Wilson", providerId: "KMD-1002", tone: "violet" },
   { name: "Amoxicillin", category: "Antibiotic", dose: "500 mg", form: "(Capsule)", frequency: "3 times daily", start: "Aug 15, 2022", end: "Aug 22, 2022", reason: "Completed course", provider: "Dr. Michael Brown", providerId: "KMD-1004", tone: "pink" },
  { name: "Prednisone", category: "Steroid", dose: "20 mg", form: "(Tablet)", frequency: "Once daily", start: "Mar 1, 2021", end: "Mar 7, 2021", reason: "Short-term treatment for flare-up", provider: "Dr. James Wilson", providerId: "KMD-1002", tone: "violet" },
   { name: "Amoxicillin", category: "Antibiotic", dose: "500 mg", form: "(Capsule)", frequency: "3 times daily", start: "Aug 15, 2022", end: "Aug 22, 2022", reason: "Completed course", provider: "Dr. Michael Brown", providerId: "KMD-1004", tone: "pink" },
  { name: "Prednisone", category: "Steroid", dose: "20 mg", form: "(Tablet)", frequency: "Once daily", start: "Mar 1, 2021", end: "Mar 7, 2021", reason: "Short-term treatment for flare-up", provider: "Dr. James Wilson", providerId: "KMD-1002", tone: "violet" },
  { name: "Ibuprofen", category: "Pain Reliever", dose: "400 mg", form: "(Tablet)", frequency: "As needed", start: "Jan 5, 2021", end: "Feb 1, 2021", reason: "Discontinued (no longer needed)", provider: "Dr. Emily Davis", providerId: "KMD-1003", tone: "red" },
];

const col = (key: string, label: string): TableColumn => ({ key, label, className: DENSE });

const CURRENT_COLUMNS: TableColumn[] = [
  col("name", "Medication Name"),
  col("dosage", "Dosage"),
  col("frequency", "Frequency"),
  col("start", "Start Date"),
  col("end", "End Date"),
  col("provider", "Prescribing Provider"),
  col("status", "Status"),
  col("notes", "Notes"),
  ACTIONS_COL,
];

const PAST_COLUMNS: TableColumn[] = [
  col("name", "Medication Name"),
  col("dosage", "Dosage"),
  col("frequency", "Frequency"),
  col("start", "Start Date"),
  col("end", "End Date"),
  col("reason", "Reason for Discontinuation"),
  col("provider", "Prescribing Provider"),
  ACTIONS_COL,
];

const NameCell = ({ name, category, tone }: { name: string; category: string; tone: Tone }) => (
  <div className="flex min-w-0 items-center gap-3">
    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${TONES[tone]}`}>
      <Pill className="h-4 w-4" />
    </span>
    <Content title={name} description={category} truncate />
  </div>
);

/* ---------- Component ---------- */
const Medications = () => {
  const currentRows = CURRENT.map((m) => ({
    name: <NameCell name={m.name} category={m.category} tone={m.tone} />,
    dosage: <Content title={m.dose} description={m.form} truncate />,
    frequency: <Content title={m.frequency} description={m.when} truncate />,
    start: <Content title={m.start} truncate />,
    end: <Content title="—" />,
    provider: <Content title={m.provider} description={m.providerId} truncate />,
    status: <Tags text="Active" tone="success" />,
    notes: <Content title={m.notes} truncate />,
    actions: kebab,
  }));

  const pastRows = PAST.map((m) => ({
    name: <NameCell name={m.name} category={m.category} tone={m.tone} />,
    dosage: <Content title={m.dose} description={m.form} truncate />,
    frequency: <Content title={m.frequency} truncate />,
    start: <Content title={m.start} truncate />,
    end: <Content title={m.end} truncate />,
    reason: <Content title={m.reason} truncate />,
    provider: <Content title={m.provider} description={m.providerId} truncate />,
    actions: kebab,
  }));
return (
  <div className="space-y-4 sm:space-y-5">
    <SectionCard
      className="!h-[500px]"
      icon={Pill}
      tone="blue"
      title="Current Medications"
      subtitle="Medications the patient is currently taking."
      action={<AddButton text="Add Medication" onClick={() => {}} />}
    >
      <ScrollArea>
        <Table columns={CURRENT_COLUMNS} rows={currentRows} />
      </ScrollArea>
    </SectionCard>

    <SectionCard
      className="!h-[420px]"
      icon={Clock}
      tone="violet"
      title="Past Medications"
      subtitle="Medications the patient no longer takes."
    >
      <ScrollArea>
        <Table columns={PAST_COLUMNS} rows={pastRows} />
      </ScrollArea>
    </SectionCard>
  </div>
);
};

export default Medications;