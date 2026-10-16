"use client";

import React from "react";
import {
  Activity,
  Briefcase,
  Cigarette,
  Droplet,
  Dumbbell,
  FileText,
  Globe,
  Heart,
  HeartPulse,
  Info,
  Plus,
  Ruler,
  Scale,
  Scissors,
  Syringe,
  Users,
  Utensils,
  Wine,
  type LucideIcon,
} from "lucide-react";

import Table from "@/components/Table";
import { type TableColumn } from "@/components/Tableheader";
import Content from "@/components/Content";
import Tags from "@/components/Tags";
import Actions from "@/components/Actions";
import ImportButton from "@/components/ImportButton";
import EditButton from "@/components/EditButton";
import { useAppDispatch } from "@/hooks/useAppHooks";
import { showModal, type ModalKey } from "@/redux/slices/dialogslice";

/* ---------------------------------------------------------------- */
/*  Shared helpers (also imported by Medications.tsx / Allergies.tsx) */
/* ---------------------------------------------------------------- */
export const TONES = {
  red:    "bg-danger/40 text-danger",
  violet: "bg-violet/40 text-violet",
  blue:   "bg-primary/20 dark:bg-primary/30 text-primary",
  green:  "bg-success/40 text-success",
  orange: "bg-warning/40 text-warning",
  pink:   "bg-pink/40 text-pink",
} as const;
export type Tone = keyof typeof TONES;

export const DENSE = "!px-3";

export const ACTIONS_COL: TableColumn = {
  key: "actions",
  label: "Actions",
  className: DENSE,
  width: 72,
  header: <div className="flex w-full items-center justify-center">Actions</div>,
};

export const kebab = (
  <div className="flex w-full items-center justify-center">
    <Actions onAction={() => {}} />
  </div>
);

/**
 * Fixed-height card.
 * Body is `flex-1 min-h-0` so the inner scroll region can shrink and scroll.
 */
export const SectionCard = ({
  icon: Icon,
  tone,
  title,
  subtitle,
  action,
  children,
  className = "",
}: {
  icon: LucideIcon;
  tone: Tone;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) => (
  <section
    className={`flex h-[380px] min-w-0 flex-col rounded-[8px] border border-border/40 bg-card ${className}`}
  >
    <header className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5 sm:px-5 sm:py-4">
      <div className="flex min-w-0 items-center gap-3">
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${TONES[tone]}`}>
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-heading sm:text-base">{title}</h3>
          {subtitle && <p className="mt-0.5 text-xs text-body">{subtitle}</p>}
        </div>
      </div>
      {action}
    </header>
    {/* min-h-0 so the child scroll area can shrink */}
    <div className="flex min-h-0 flex-1 flex-col px-4 pb-4 sm:px-5 sm:pb-5">
      {children}
    </div>
  </section>
);

/**
 * Scrollable body region:
 *  - Fills the remaining card height
 *  - Custom scrollbar via `.hide-scrollbar` class
 *  - Table header (thead) stays fixed via sticky positioning
 */
export const ScrollArea = ({ children }: { children: React.ReactNode }) => (
  <div className="hide-scrollbar min-h-0 flex-1 overflow-y-auto">
    <div
      className="
        [&_thead]:sticky [&_thead]:top-0 [&_thead]:z-10
        [&_thead]:bg-card
        [&_table]:w-full
      "
    >
      {children}
    </div>
  </div>
);

/**
 * "+ Add …" button. Pass `modal` to open a modal registered in dialogSlice
 * (rendered globally by DialogsContainer).
 */
const AddAction = ({ text, modal }: { text: string; modal?: ModalKey }) => {
  const dispatch = useAppDispatch();
  return (
    <ImportButton
      className="text-primary"
      text={text}
      icon={<Plus className="h-4 w-4" />}
      onClick={() => {
        if (modal) dispatch(showModal(modal));
      }}
    />
  );
};

/* ---------------------------------------------------------------- */
/*  Static data                                                     */
/* ---------------------------------------------------------------- */
const col = (key: string, label: string): TableColumn => ({ key, label, className: DENSE });

const CONDITIONS = [
  { name: "Asthma", date: "Mar 15, 2018", status: "Ongoing", notes: "Mild intermittent asthma" },
  { name: "Allergic Rhinitis", date: "May 2, 2020", status: "Ongoing", notes: "Seasonal allergies" },
  { name: "Eczema", date: "Jan 10, 2021", status: "Resolved", notes: "Resolved with treatment" },
];

const SURGERIES = [
  { name: "Tonsillectomy", date: "Jun 12, 2010", reason: "Recurrent infection", notes: "No complications" },
  { name: "Appendectomy", date: "Aug 5, 2022", reason: "Appendicitis", notes: "Recovered well" },
  { name: "Knee Arthroscopy", date: "Sep 20,2023", reason: "Meniscus tear", notes: "Physical therapy recommended"},
];

const FAMILY = [
  { name: "Diabetes", relation: "Father", notes: "Type 2 diabetes" },
  { name: "Hypertension", relation: "Mother", notes: "On medication" },
  { name: "Asthma", relation: "Sibling", notes: "Childhood asthma" },
];

const IMMUNIZATIONS = [
  { name: "COVID-19", date: "May 15, 2021", dose: "2nd Dose", notes: "Pfizer" },
  { name: "Influenza", date: "Oct 10, 2024", dose: "1 Dose", notes: "Seasonal" },
  { name: "MMR", date: "Mar 5, 2006", dose: "1 Dose", notes: "Childhood" },
  { name: "Hepatitis B", date: "Mar 5, 2006", dose: "1 Dose", notes: "Childhood" },
];

const NOTES = [
  { date: "Oct 6, 2026", provider: "Dr. Sarah Lee", note: "Patient reports no new symptoms. Continue current treatment." },
  { date: "Aug 14, 2026", provider: "Dr. James Wilson", note: "Follow-up visit. Asthma well controlled." },
  { date: "May 22, 2026", provider: "Dr. Emily Davis", note: "Allergy symptoms improved." },
];

const LIFESTYLE_LEFT: { icon: LucideIcon; label: string; value: string }[] = [
  { icon: Cigarette, label: "Smoking Status", value: "Non-smoker" },
  { icon: Wine, label: "Alcohol Use", value: "Does not drink" },
  { icon: Dumbbell, label: "Exercise", value: "3–4 times per week" },
  { icon: Utensils, label: "Diet", value: "Vegetarian" },
  { icon: Briefcase, label: "Occupation", value: "Student" },
  { icon: Heart, label: "Marital Status", value: "Single" },
];

const LIFESTYLE_RIGHT: { icon: LucideIcon; label: string; value: string; info?: boolean }[] = [
  { icon: Ruler, label: "Height", value: "165 cm" },
  { icon: Scale, label: "Weight", value: "58 kg" },
  { icon: Activity, label: "BMI", value: "21.3 (Normal)", info: true },
  { icon: Droplet, label: "Blood Type", value: "B+" },
  { icon: Globe, label: "Preferred Language", value: "Not provided" },
];
/* ---------------------------------------------------------------- */
/*  Small pieces                                                    */
/* ---------------------------------------------------------------- */
const LifestyleRow = ({
  icon: Icon,
  label,
  value,
  info,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  info?: boolean;
}) => (
  <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-center gap-3">
    <p className="flex min-w-0 items-center gap-2.5 text-xs text-body sm:text-sm">
      <Icon className="h-4 w-4 shrink-0" />
      <span className="truncate">{label}</span>
    </p>
    <p className="flex min-w-0 items-center gap-1.5 text-sm font-medium text-heading">
      <span className="truncate">{value}</span>
      {info && <Info className="h-3.5 w-3.5 shrink-0 text-primary" />}
    </p>
  </div>
);

/* ---------------------------------------------------------------- */
/*  Component                                                       */
/* ---------------------------------------------------------------- */
const MedicalHistory = () => {
  const conditionRows = CONDITIONS.map((c) => ({
    name: <Content title={c.name} truncate />,
    date: <Content title={c.date} truncate />,
    status: <Tags text={c.status} tone={c.status === "Resolved" ? "success" : "danger"} />,
    notes: <Content title={c.notes} truncate />,
    actions: kebab,
  }));

  const surgeryRows = SURGERIES.map((s) => ({
    name: <Content title={s.name} truncate />,
    date: <Content title={s.date} truncate />,
    reason: <Content title={s.reason} truncate />,
    notes: <Content title={s.notes} truncate />,
    actions: kebab,
  }));

  const familyRows = FAMILY.map((f) => ({
    name: <Content title={f.name} truncate />,
    relation: <Content title={f.relation} truncate />,
    notes: <Content title={f.notes} truncate />,
    actions: kebab,
  }));

  const immunizationRows = IMMUNIZATIONS.map((i) => ({
    name: <Content title={i.name} truncate />,
    date: <Content title={i.date} truncate />,
    dose: <Content title={i.dose} truncate />,
    notes: <Content title={i.notes} truncate />,
    actions: kebab,
  }));

  const noteRows = NOTES.map((n) => ({
    date: <Content title={n.date} truncate />,
    provider: <Content title={n.provider} truncate />,
    note: <Content title={n.note} />,
    actions: kebab,
  }));

  return (
    <div className="grid grid-cols-1 gap-4 sm:gap-5 xl:grid-cols-2">
      {/* Left column */}
      <div className="flex min-w-0 flex-col gap-4 sm:gap-5">
        <SectionCard
          icon={HeartPulse}
          tone="red"
          title="Medical Conditions"
          action={<AddAction text="Add Condition" modal="AddMedicalCondition" />}
        >
          <ScrollArea>
            <Table
              columns={[
                col("name", "Condition"),
                col("date", "Diagnosis Date"),
                col("status", "Status"),
                col("notes", "Notes"),
                ACTIONS_COL,
              ]}
              rows={conditionRows}
            />
          </ScrollArea>
        </SectionCard>

        <SectionCard
          icon={Users}
          tone="blue"
          title="Family History"
          action={<AddAction text="Add Family History" modal="AddFamilyHistory" />}
        >
          <ScrollArea>
            <Table
              columns={[col("name", "Condition"), col("relation", "Relation"), col("notes", "Notes"), ACTIONS_COL]}
              rows={familyRows}
            />
          </ScrollArea>
        </SectionCard>

        <SectionCard
          icon={Syringe}
          tone="violet"
          title="Immunization History"
          action={<AddAction text="Add Immunization" modal="AddImmunization" />}
        >
          <ScrollArea>
            <Table
              columns={[
                col("name", "Vaccine"),
                col("date", "Date"),
                col("dose", "Dose"),
                col("notes", "Notes"),
                ACTIONS_COL,
              ]}
              rows={immunizationRows}
            />
          </ScrollArea>
        </SectionCard>
      </div>
      
      {/* Right column */}
      <div className="flex min-w-0 flex-col gap-4 sm:gap-5">
        <SectionCard
          icon={Scissors}
          tone="violet"
          title="Surgical History"
          action={<AddAction text="Add Surgery" modal="AddSurgery" />}
        >
          <ScrollArea>
            <Table
              columns={[
                col("name", "Procedure"),
                col("date", "Date"),
                col("reason", "Reason"),
                col("notes", "Notes"),
                ACTIONS_COL,
              ]}
              rows={surgeryRows}
            />
          </ScrollArea>
        </SectionCard>

        <SectionCard
          icon={FileText}
          tone="blue"
          title="Lifestyle & Social History"
          action={
            [...LIFESTYLE_LEFT, ...LIFESTYLE_RIGHT].some(
              (item) => item.value.trim() && item.value !== "Not provided",
            ) ? (
              <EditButton section="Lifestyle & Social History" onEdit={() => {}} />
            ) : undefined
          }
        >
          {/* own wrapper instead of <ScrollArea>: scrolls on small screens, fills the card on sm+ */}
          <div className="hide-scrollbar min-h-0 flex-1 overflow-y-auto">
            <div className="grid min-h-full grid-cols-1 gap-x-8 sm:grid-cols-2">
              <div className="grid gap-3.5 sm:grid-rows-6 sm:items-center">
                {LIFESTYLE_LEFT.map((r) => (
                  <LifestyleRow key={r.label} {...r} />
                ))}
              </div>
              <div className="grid gap-3.5 sm:grid-rows-6 sm:items-center">
                {LIFESTYLE_RIGHT.map((r) => (
                  <LifestyleRow key={r.label} {...r} />
                ))}
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          icon={FileText}
          tone="blue"
          title="Clinical Notes"
          action={<AddAction text="Add Note" />}
        >
          <ScrollArea>
            <Table
              columns={[col("date", "Date"), col("provider", "Provider"), col("note", "Note"), ACTIONS_COL]}
              rows={noteRows}
            />
          </ScrollArea>
        </SectionCard>
      </div>
    
    </div>
    
  );
};

export default MedicalHistory;