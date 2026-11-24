"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarCheck,
  ChevronRight,
  ClipboardList,
  Download,
  FileText,
  FlaskConical,
  Info,
  Paperclip,
  Pill,
  Printer,
  Search,
  SlidersHorizontal,
  Stethoscope,
  type LucideIcon,
} from "lucide-react";

import AddButton from "@/components/Addbutton";
import Content from "@/components/Content";
import ImportButton from "@/components/ImportButton";
import SignupField from "@/components/SignupField";
import Table from "@/components/Table";
import { type TableColumn } from "@/components/Tableheader";
import Tabs from "@/components/Tabs";
import Tags, { type TagTone } from "@/components/Tags";
import { cardCls } from "@/providers/Shared";

const NEW_ENCOUNTER_HREF = "/provider/appointments/new-encounter";

/* ---------------------------------------------------------------- */
/*  Static data (replace with API data)                              */
/* ---------------------------------------------------------------- */
type Encounter = {
  id: string;
  date: string;
  type: string;
  location: string;
  reason: string;
  diagnosis: string;
  plan: string[];
  soap: { subjective: string; objective: string; assessment: string; plan: string };
  orders: { name: string; result: string; date: string }[];
  meds: { name: string; instructions: string }[];
  docs: { name: string; size: string }[];
};

const encounter = (id: string, date: string, type: string, location: string, reason: string, diagnosis: string, plan: string[]): Encounter => ({
  id,
  date,
  type,
  location,
  reason,
  diagnosis,
  plan,
  soap: {
    subjective: reason,
    objective: "Vitals stable. Neurological exam normal.",
    assessment: diagnosis,
    plan: plan.join(" "),
  },
  orders: [{ name: "CBC", result: "Normal", date }],
  meds: [{ name: "Sumatriptan 50 mg", instructions: "Take 1 tablet as needed for migraine." }],
  docs: [{ name: `Encounter Summary – ${date}.pdf`, size: "240 KB" }],
});

const ENCOUNTERS: Encounter[] = [
  encounter("e1", "Oct 20, 2026", "Follow-up Visit", "Telemedicine", "Follow-up for headache management.", "G43.009 – Migraine, unspecified", [
    "Continue Sumatriptan 50 mg as needed.",
    "Maintain headache diary.",
    "Follow up in 4 weeks.",
  ]),
  encounter("e2", "Aug 14, 2026", "Initial Consultation", "In-Person", "New patient evaluation for recurrent headaches.", "R51.9 – Headache, unspecified", ["Start headache diary.", "Baseline labs."]),
  encounter("e3", "Jun 10, 2026", "Follow-up Visit", "Telemedicine", "Review of headache frequency.", "G43.009 – Migraine, unspecified", ["Continue current plan.", "Review in 8 weeks."]),
  encounter("e4", "Mar 05, 2026", "Follow-up Visit", "Telemedicine", "Medication review.", "G43.009 – Migraine, unspecified", ["Adjust dose if needed.", "Lifestyle counselling."]),
  encounter("e5", "Jan 18, 2026", "Initial Consultation", "In-Person", "Initial assessment of fatigue and headaches.", "R53.83 – Other fatigue", ["Order baseline labs.", "Return in 6 weeks."]),
  encounter("e6", "Dec 02, 2025", "Follow-up Visit", "Telemedicine", "Seasonal allergy follow-up.", "J30.2 – Seasonal allergic rhinitis", ["Continue antihistamine as needed."]),
];

const INNER_TABS = ["Summary", "Clinical Notes", "Orders", "Medications", "Documents"] as const;
type InnerTab = (typeof INNER_TABS)[number];

const INNER_ICONS: Record<InnerTab, LucideIcon> = {
  Summary: ClipboardList,
  "Clinical Notes": FileText,
  Orders: FlaskConical,
  Medications: Pill,
  Documents: Paperclip,
};

const RESULT_TONE: Record<string, TagTone> = { Normal: "success", Low: "warning", High: "danger" };

const ORDER_COLUMNS: TableColumn[] = [
  { key: "name", label: "Test" },
  { key: "result", label: "Result" },
  { key: "date", label: "Date" },
];
const MED_COLUMNS: TableColumn[] = [
  { key: "name", label: "Medication" },
  { key: "instructions", label: "Instructions" },
];
const DOC_COLUMNS: TableColumn[] = [
  { key: "name", label: "Name" },
  { key: "size", label: "Size" },
  { key: "actions", label: "", className: "w-10" },
];

const iconBtn =
  "flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-body transition-colors hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30";

/* ---------------------------------------------------------------- */
/*  Tab: Encounters                                                  */
/* ---------------------------------------------------------------- */
const ProviderEncounters = () => {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState(ENCOUNTERS[0].id);
  const [inner, setInner] = useState<InnerTab>("Summary");

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return ENCOUNTERS.filter((e) => !q || e.date.toLowerCase().includes(q) || e.type.toLowerCase().includes(q));
  }, [search]);

  const enc = ENCOUNTERS.find((e) => e.id === selectedId) ?? ENCOUNTERS[0];

  const detailRows: [string, React.ReactNode][] = [
    ["Encounter Date", enc.date],
    ["Visit Type", enc.type],
    ["Location", enc.location],
    ["Status", <Tags key="status" text="Completed" tone="success" size="xs" />],
  ];

  return (
    <div className="grid min-w-0 items-start gap-4 sm:gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
      {/* ---------- Encounter list ---------- */}
      <section className={`${cardCls} min-w-0 space-y-4 sm:p-5`}>
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-base font-semibold text-heading">Encounters ({ENCOUNTERS.length})</h3>
          <AddButton text="New Encounter" onClick={() => router.push(NEW_ENCOUNTER_HREF)} className="whitespace-nowrap" />
        </div>

        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <SignupField
              name="encounterSearch"
              placeholder="Search encounters..."
              icon={<Search className="h-4 w-4" />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoComplete="off"
            />
          </div>
          <button type="button" aria-label="Filter encounters" className={`${iconBtn} h-12 w-12 shrink-0 border border-border`}>
            <SlidersHorizontal className="h-4 w-4" />
          </button>
        </div>

        <ul className="max-h-[440px] space-y-2 overflow-y-auto pr-1 hide-scrollbar">
          {visible.map((e) => {
            const active = e.id === selectedId;
            return (
              <li key={e.id}>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedId(e.id);
                    setInner("Summary");
                  }}
                  aria-current={active ? "true" : undefined}
                  className={`flex w-full cursor-pointer items-center gap-3 rounded-xl border-l-2 p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${
                    active ? "border-primary bg-primary/10" : "border-transparent hover:bg-primary/5"
                  }`}
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <CalendarCheck className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-heading">{e.date}</span>
                    <span className="block truncate text-xs text-body">{e.type}</span>
                  </span>
                  <Tags text="Completed" tone="success" size="xs" />
                  <ChevronRight className="h-4 w-4 shrink-0 text-body" />
                </button>
              </li>
            );
          })}
          {visible.length === 0 && <li className="px-2 py-6 text-center text-sm text-body">No encounters found.</li>}
        </ul>
      </section>

      {/* ---------- Encounter detail ---------- */}
      <section className={`${cardCls} min-w-0 space-y-4 sm:p-5`}>
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-heading">Encounter – {enc.date}</h3>
            <p className="mt-0.5 text-xs text-body sm:text-sm">
              {enc.type} • Provider: Dr. Sarah Miller
            </p>
          </div>
          <Tags text="Completed" tone="success" size="xs" />
        </header>

        <Tabs ariaLabel="Encounter sections">
          <div className="flex min-w-max gap-1 sm:gap-3">
            {INNER_TABS.map((t) => {
              const Icon = INNER_ICONS[t];
              const active = t === inner;
              return (
                <button
                  key={t}
                  role="tab"
                  type="button"
                  aria-selected={active}
                  onClick={() => setInner(t)}
                  className={`-mb-px flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap border-b-2 px-3 pb-2.5 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 sm:text-sm ${
                    active ? "border-primary font-semibold text-primary" : "border-transparent text-body hover:text-heading"
                  }`}
                >
                  <Icon className="hidden h-4 w-4 shrink-0 sm:block" />
                  {t}
                </button>
              );
            })}
          </div>
        </Tabs>

        <div role="tabpanel" className="min-w-0">
          {inner === "Summary" && (
            <div className="grid min-w-0 items-start gap-4 2xl:grid-cols-[minmax(0,1fr)_280px]">
              <div className="min-w-0 space-y-4 rounded-xl border border-border bg-card p-4">
                <div className="flex gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <ClipboardList className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-heading">Reason for Visit</p>
                    <p className="text-sm text-body">{enc.reason}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Stethoscope className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-heading">Diagnosis</p>
                    <span className="mt-1 inline-block rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-medium text-heading">{enc.diagnosis}</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <FileText className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-heading">Treatment Plan</p>
                    <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm text-body marker:text-primary">
                      {enc.plan.map((p) => (
                        <li key={p}>{p}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="min-w-0 rounded-xl border border-border bg-card p-4">
                <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-heading">
                  <Info className="h-4 w-4 text-primary" />
                  Encounter Details
                </h4>
                <dl className="space-y-2.5 text-sm">
                  {detailRows.map(([label, value]) => (
                    <div key={label} className="flex items-center justify-between gap-3">
                      <dt className="text-body">{label}</dt>
                      <dd className="font-medium text-heading">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          )}

          {inner === "Clinical Notes" && (
            <dl className="space-y-3 rounded-xl border border-border bg-card p-4">
              {(
                [
                  ["S", "Subjective", enc.soap.subjective],
                  ["O", "Objective", enc.soap.objective],
                  ["A", "Assessment", enc.soap.assessment],
                  ["P", "Plan", enc.soap.plan],
                ] as const
              ).map(([letter, label, text]) => (
                <div key={letter} className="flex gap-3">
                  <dt aria-label={label} className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {letter}
                  </dt>
                  <dd className="grid min-w-0 flex-1 gap-1 text-sm sm:grid-cols-[110px_minmax(0,1fr)]">
                    <span className="font-semibold text-heading">{label}</span>
                    <span className="text-body">{text}</span>
                  </dd>
                </div>
              ))}
            </dl>
          )}

          {inner === "Orders" && (
            <Table
              columns={ORDER_COLUMNS}
              rows={enc.orders.map((o) => ({
                name: <Content title={o.name} />,
                result: <Tags text={o.result} tone={RESULT_TONE[o.result] ?? "neutral"} size="xs" />,
                date: <Content title={o.date} />,
              }))}
            />
          )}

          {inner === "Medications" && (
            <Table
              columns={MED_COLUMNS}
              rows={enc.meds.map((m) => ({
                name: <Content title={m.name} />,
                instructions: <Content title={m.instructions} truncate />,
              }))}
            />
          )}

          {inner === "Documents" && (
            <Table
              columns={DOC_COLUMNS}
              rows={enc.docs.map((d) => ({
                name: <Content title={d.name} truncate />,
                size: <Content title={d.size} />,
                actions: (
                  <button type="button" aria-label={`Download ${d.name}`} className={iconBtn}>
                    <Download className="h-4 w-4" />
                  </button>
                ),
              }))}
            />
          )}
        </div>

        <div className="flex justify-end gap-2 sm:gap-3">
          <ImportButton text="Print" icon={<Printer className="h-4 w-4" />} onClick={() => window.print()} className="whitespace-nowrap" />
          <ImportButton text="Download Summary" icon={<Download className="h-4 w-4" />} onClick={() => {}} className="whitespace-nowrap" />
        </div>
      </section>
    </div>
  );
};

export default ProviderEncounters;
