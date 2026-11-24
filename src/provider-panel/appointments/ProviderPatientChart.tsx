"use client";

import React, { useState, type ReactNode } from "react";
import {
  Activity,
  AlertTriangle,
  CalendarDays,
  ChevronRight,
  ClipboardList,
  HeartPulse,
  Leaf,
  LayoutGrid,
  Pencil,
  Pill,
  Syringe,
  Users,
  type LucideIcon,
} from "lucide-react";

import ImportButton from "@/components/ImportButton";
import StatCards, { type StatItem } from "@/components/Statcards";
import Tags from "@/components/Tags";
import { cardCls } from "@/providers/Shared";

/* ---------------------------------------------------------------- */
/*  Static chart data (replace with API data)                        */
/* ---------------------------------------------------------------- */
type SectionKey =
  | "Overview"
  | "Problems & Conditions"
  | "Medications"
  | "Allergies"
  | "Medical History"
  | "Family History"
  | "Social History"
  | "Vitals"
  | "Immunizations";

const SECTIONS: { key: SectionKey; Icon: LucideIcon }[] = [
  { key: "Overview", Icon: LayoutGrid },
  { key: "Problems & Conditions", Icon: HeartPulse },
  { key: "Medications", Icon: Pill },
  { key: "Allergies", Icon: AlertTriangle },
  { key: "Medical History", Icon: ClipboardList },
  { key: "Family History", Icon: Users },
  { key: "Social History", Icon: Leaf },
  { key: "Vitals", Icon: Activity },
  { key: "Immunizations", Icon: Syringe },
];

const DETAILS: Record<Exclude<SectionKey, "Overview">, { title: string; detail: string }[]> = {
  "Problems & Conditions": [{ title: "Migraine", detail: "Active" }],
  Medications: [{ title: "Sumatriptan 50 mg", detail: "Take 1 tablet as needed for migraine" }],
  Allergies: [],
  "Medical History": [{ title: "No significant history", detail: "" }],
  "Family History": [{ title: "Hypertension", detail: "Father" }],
  "Social History": [
    { title: "Smoking", detail: "Non-smoker" },
    { title: "Alcohol", detail: "Occasional" },
  ],
  Vitals: [
    { title: "Blood Pressure", detail: "118/76 mmHg" },
    { title: "Heart Rate", detail: "72 bpm" },
    { title: "Temperature", detail: "98.4 °F" },
    { title: "BMI", detail: "22.1" },
  ],
  Immunizations: [{ title: "COVID-19 Vaccine", detail: "Jan 12, 2024" }],
};

const OVERVIEW_ROWS: { icon: LucideIcon; label: string; value: string }[] = [
  { icon: ClipboardList, label: "Medical History", value: "No significant history" },
  { icon: Users, label: "Family History", value: "Hypertension (Father)" },
  { icon: Leaf, label: "Social History", value: "Non-smoker, occasional alcohol" },
  { icon: Activity, label: "Last Vitals", value: "BP 118/76 mmHg • HR 72 bpm • Temp 98.4 °F • BMI 22.1" },
  { icon: CalendarDays, label: "Last Encounter", value: "Oct 20, 2026 – Follow-up Visit" },
];

const VITALS = [
  { value: "118/76", unit: "mmHg", label: "BP" },
  { value: "72", unit: "bpm", label: "HR" },
  { value: "98.4 °F", unit: "", label: "Temp" },
  { value: "22.1", unit: "", label: "BMI" },
];

const OVERVIEW_STATS: StatItem[] = [
  { label: "Active Conditions", value: "1", Icon: HeartPulse, accent: "primary" },
  { label: "Medications", value: "1", Icon: Pill, accent: "success" },
  { label: "Allergies", value: "None reported", Icon: AlertTriangle, accent: "warning" },
];

const Box = ({ icon: Icon, title, children }: { icon: LucideIcon; title: string; children: ReactNode }) => (
  <section className={`${cardCls} min-w-0 space-y-3 !p-3.5 sm:!p-4`}>
    <h3 className="flex items-center gap-2 text-sm font-semibold text-heading">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </span>
      {title}
    </h3>
    {children}
  </section>
);

/* ---------------------------------------------------------------- */
/*  Tab: Patient Chart                                               */
/* ---------------------------------------------------------------- */
const ProviderPatientChart = () => {
  const [section, setSection] = useState<SectionKey>("Overview");
  const items = section === "Overview" ? [] : DETAILS[section];

  return (
    <div className="grid min-w-0 items-start gap-4 sm:gap-5 2xl:grid-cols-[220px_minmax(0,1fr)_320px]">
      {/* ---------- Section list ---------- */}
      <nav aria-label="Chart sections" className={`${cardCls} min-w-0 !p-2.5`}>
        <ul className="flex gap-1 overflow-x-auto hide-scrollbar 2xl:flex-col">
          {SECTIONS.map(({ key, Icon }) => {
            const active = key === section;
            return (
              <li key={key} className="shrink-0">
                <button
                  type="button"
                  onClick={() => setSection(key)}
                  aria-current={active ? "page" : undefined}
                  className={`flex w-full cursor-pointer items-center gap-3 whitespace-nowrap rounded-lg px-3 py-2.5 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${
                    active ? "bg-primary/10 font-semibold text-primary" : "text-heading hover:bg-primary/5"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {key}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* ---------- Main ---------- */}
      <section className={`${cardCls} min-w-0 space-y-4 sm:p-5`}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-heading">Chart {section === "Overview" ? "Overview" : section}</h3>
            <p className="text-xs text-body sm:text-sm">
              {section === "Overview" ? "A quick summary of the patient’s key clinical information." : "Recorded information for this section."}
            </p>
          </div>
          <ImportButton text="Edit Chart" icon={<Pencil className="h-4 w-4" />} onClick={() => {}} className="whitespace-nowrap" />
        </div>

        {section === "Overview" ? (
          <>
            <StatCards stats={OVERVIEW_STATS} truncateContent gridClassName="grid-cols-1 gap-3 sm:grid-cols-3" />
            <dl className="divide-y divide-divider">
              {OVERVIEW_ROWS.map(({ icon: Icon, label, value }) => (
                <div key={label} className="grid gap-1 py-3 text-sm sm:grid-cols-[200px_minmax(0,1fr)] sm:items-center">
                  <dt className="flex items-center gap-3 font-semibold text-heading">
                    <Icon className="h-4 w-4 shrink-0 text-primary" />
                    {label}
                  </dt>
                  <dd className="text-body">{value}</dd>
                </div>
              ))}
            </dl>
          </>
        ) : items.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border px-4 py-10 text-center text-sm text-body">None reported.</p>
        ) : (
          <ul className="divide-y divide-divider">
            {items.map((i) => (
              <li key={i.title} className="flex items-center justify-between gap-3 py-3 text-sm">
                <span className="font-semibold text-heading">{i.title}</span>
                <span className="text-body">{i.detail}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ---------- Right ---------- */}
      <aside className="min-w-0 space-y-4 sm:space-y-5">
        <Box icon={Activity} title="Recent Vitals">
          <p className="-mt-2 text-right text-xs text-body">Oct 20, 2026</p>
          <ul className="grid grid-cols-4 divide-x divide-divider rounded-xl border border-border text-center">
            {VITALS.map((v) => (
              <li key={v.label} className="px-1 py-2.5">
                <p className="text-sm font-semibold text-heading">{v.value}</p>
                <p className="text-[11px] text-body">{v.unit || " "}</p>
                <p className="text-xs font-medium text-heading">{v.label}</p>
              </li>
            ))}
          </ul>
        </Box>

        <Box icon={ClipboardList} title="Problem List">
          <button
            type="button"
            onClick={() => setSection("Problems & Conditions")}
            className="flex w-full cursor-pointer items-center gap-3 rounded-lg text-left text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
          >
            <span className="h-2 w-2 shrink-0 rounded-full bg-success" />
            <span className="flex-1 text-heading">Migraine</span>
            <Tags text="Active" tone="violet" size="xs" />
            <ChevronRight className="h-4 w-4 shrink-0 text-body" />
          </button>
        </Box>

        <Box icon={Syringe} title="Immunizations">
          <button
            type="button"
            onClick={() => setSection("Immunizations")}
            className="flex w-full cursor-pointer items-center gap-3 rounded-lg text-left text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
          >
            <span className="flex-1 text-heading">COVID-19 Vaccine</span>
            <span className="text-xs text-body">Jan 12, 2024</span>
            <ChevronRight className="h-4 w-4 shrink-0 text-body" />
          </button>
        </Box>
      </aside>
    </div>
  );
};

export default ProviderPatientChart;
