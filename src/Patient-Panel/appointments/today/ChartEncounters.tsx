"use client";

import React, { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  ClipboardList,
  Download,
  FileText,
  FlaskConical,
  MoreHorizontal,
  Paperclip,
  Pencil,
  Pill,
  Plus,
  Stethoscope,
  type LucideIcon,
} from "lucide-react";

import Content from "@/components/Content";
import EditButton from "@/components/EditButton";
import ImportButton from "@/components/ImportButton";
import SignupDropdown from "@/components/SignupDropdown";
import Table from "@/components/Table";
import TableStatus from "@/components/TableStatus";
import { type TableColumn } from "@/components/Tableheader";
import Tabs from "@/components/Tabs";
import Tags, { type TagTone } from "@/components/Tags";
import { cardCls } from "@/providers/Shared";

const CREATE_ENCOUNTER_HREF = "/create-encounter"; // TODO: your create-encounter route

/* ---------------------------------------------------------------- */
/*  Static data (replace with API data)                              */
/* ---------------------------------------------------------------- */
type Order = { name: string; result: string; date: string; status: string };
type Med = { name: string; instructions: string };
type Doc = { name: string; date: string; size: string };
type Soap = { subjective: string; objective: string; assessment: string; plan: string[] };

type Encounter = {
  id: string;
  date: string;
  type: string;
  status: "Completed";
  reason: string;
  complaint: string;
  soap: Soap;
  orders: Order[];
  meds: Med[];
  docs: Doc[];
};

const ENCOUNTERS: Encounter[] = [
  {
    id: "e1",
    date: "Oct 21, 2026",
    type: "Follow-up Visit",
    status: "Completed",
    reason: "Headache management and medication follow-up",
    complaint: "Persistent headaches, improved with current medication",
    soap: {
      subjective: "Reports fewer headache episodes (1–2 per week). No nausea or vision changes.",
      objective: "Vitals stable. Neurological exam normal.",
      assessment: "G43.009 – Migraine, unspecified, not intractable.",
      plan: ["Continue Sumatriptan 50 mg as needed.", "Maintain headache diary.", "Follow up in 3 months or earlier if symptoms worsen."],
    },
    orders: [
      { name: "CBC", result: "Normal", date: "Oct 21, 2026", status: "Final" },
      { name: "Vitamin D", result: "Low", date: "Oct 21, 2026", status: "Final" },
    ],
    meds: [{ name: "Sumatriptan 50 mg", instructions: "Take 1 tablet by mouth as needed for migraine." }],
    docs: [
      { name: "Encounter Summary.pdf", date: "Oct 21, 2026", size: "240 KB" },
      { name: "Patient Instructions.pdf", date: "Oct 21, 2026", size: "190 KB" },
    ],
  },
  {
    id: "e2",
    date: "Aug 15, 2026",
    type: "Annual Wellness Visit",
    status: "Completed",
    reason: "Annual wellness examination",
    complaint: "No acute complaints",
    soap: {
      subjective: "Routine checkup. No new concerns.",
      objective: "Vitals within normal limits.",
      assessment: "Z00.00 – General adult medical examination.",
      plan: ["Routine labs ordered.", "Return in 12 months."],
    },
    orders: [{ name: "Lipid Panel", result: "Normal", date: "Aug 15, 2026", status: "Final" }],
    meds: [],
    docs: [{ name: "Wellness Summary.pdf", date: "Aug 15, 2026", size: "210 KB" }],
  },
  {
    id: "e3",
    date: "May 10, 2026",
    type: "Chronic Care Visit",
    status: "Completed",
    reason: "Chronic condition review",
    complaint: "Recurring headaches",
    soap: {
      subjective: "Headaches ~3 per week, afternoon pattern.",
      objective: "Neurological exam normal.",
      assessment: "G43.009 – Migraine, unspecified, not intractable.",
      plan: ["Start headache diary.", "Review in 3 months."],
    },
    orders: [],
    meds: [],
    docs: [],
  },
  {
    id: "e4",
    date: "Feb 05, 2026",
    type: "Initial Consultation",
    status: "Completed",
    reason: "New patient evaluation",
    complaint: "Headaches and fatigue",
    soap: {
      subjective: "New patient reporting recurrent headaches and fatigue.",
      objective: "Vitals stable. General exam unremarkable.",
      assessment: "R51.9 – Headache, unspecified.",
      plan: ["Baseline labs.", "Lifestyle counselling."],
    },
    orders: [],
    meds: [],
    docs: [],
  },
  {
    id: "e5",
    date: "Nov 20, 2025",
    type: "Follow-up Visit",
    status: "Completed",
    reason: "Follow-up on seasonal allergies",
    complaint: "Seasonal nasal congestion",
    soap: {
      subjective: "Allergy symptoms improving.",
      objective: "Nasal mucosa mildly congested.",
      assessment: "J30.2 – Other seasonal allergic rhinitis.",
      plan: ["Continue antihistamine as needed."],
    },
    orders: [],
    meds: [],
    docs: [],
  },
];

const ENCOUNTER_OPTIONS = ENCOUNTERS.map((e) => ({ value: e.id, label: `${e.date} – ${e.type}` }));

const RESULT_TONE: Record<string, TagTone> = { Normal: "success", Low: "warning", High: "danger" };

const ORDER_COLUMNS: TableColumn[] = [
  { key: "name", label: "Test" },
  { key: "result", label: "Result" },
  { key: "date", label: "Date" },
  { key: "status", label: "Status" },
];

const MED_COLUMNS: TableColumn[] = [
  { key: "name", label: "Medication" },
  { key: "instructions", label: "Instructions" },
];

const DOC_COLUMNS: TableColumn[] = [
  { key: "name", label: "Name" },
  { key: "date", label: "Date" },
  { key: "size", label: "Size" },
  { key: "actions", label: "", className: "w-10" },
];

const INNER_TABS = ["Encounter Summary", "Clinical Notes (SOAP)", "Orders & Results", "Medications", "Documents"] as const;
type InnerTab = (typeof INNER_TABS)[number];

const INNER_ICONS: Record<InnerTab, LucideIcon> = {
  "Encounter Summary": CalendarDays,
  "Clinical Notes (SOAP)": FileText,
  "Orders & Results": FlaskConical,
  Medications: Pill,
  Documents: Paperclip,
};

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
      <h4 className="flex min-w-0 items-center gap-2 text-sm font-semibold text-heading">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </span>
        <span className="truncate">{title}</span>
      </h4>
      {action}
    </header>
    {children}
  </section>
);

const iconBtn =
  "flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-body transition-colors hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30";

const tableWrap = "overflow-hidden rounded-[14px] border border-border bg-card";

/* ---------------------------------------------------------------- */
/*  Tab: Encounters                                                  */
/* ---------------------------------------------------------------- */
const ChartEncounters = () => {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState(ENCOUNTERS[0].id);
  const [inner, setInner] = useState<InnerTab>("Encounter Summary");

  const enc = ENCOUNTERS.find((e) => e.id === selectedId) ?? ENCOUNTERS[0];

  const orderRows = enc.orders.map((o) => ({
    name: <Content title={o.name} />,
    result: <Tags text={o.result} tone={RESULT_TONE[o.result] ?? "neutral"} size="xs" />,
    date: <Content title={o.date} />,
    status: <Tags text={o.status} tone="success" size="xs" />,
  }));

  const medRows = enc.meds.map((m) => ({
    name: <Content title={m.name} />,
    instructions: <Content title={m.instructions} truncate />,
  }));

  const docRows = enc.docs.map((d) => ({
    name: <Content title={d.name} truncate />,
    date: <Content title={d.date} />,
    size: <Content title={d.size} />,
    actions: (
      <button type="button" aria-label={`Download ${d.name}`} className={iconBtn}>
        <Download className="h-4 w-4" />
      </button>
    ),
  }));

  const soapRows: { letter: string; label: string; content: ReactNode }[] = [
    { letter: "S", label: "Subjective", content: enc.soap.subjective },
    { letter: "O", label: "Objective", content: enc.soap.objective },
    { letter: "A", label: "Assessment", content: enc.soap.assessment },
    {
      letter: "P",
      label: "Plan",
      content: (
        <ul className="list-disc space-y-0.5 pl-4">
          {enc.soap.plan.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      ),
    },
  ];

  const soapBlock = (
    <Box icon={Stethoscope} title="Clinical Summary (SOAP)">
      <dl className="space-y-3">
        {soapRows.map((r) => (
          <div key={r.letter} className="flex gap-3">
            <dt
              aria-label={r.label}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary"
            >
              {r.letter}
            </dt>
            <dd className="grid min-w-0 flex-1 gap-1 text-sm sm:grid-cols-[110px_minmax(0,1fr)]">
              <span className="font-semibold text-heading">{r.label}</span>
              <span className="text-body">{r.content}</span>
            </dd>
          </div>
        ))}
      </dl>
    </Box>
  );

  const emptyOrders = <TableStatus variant="empty" message="No orders or results for this encounter." />;

  return (
    <div className="min-w-0 space-y-4 sm:space-y-5">
   
      {/* Encounter header */}
      <section className={`${cardCls} space-y-4 sm:p-5`}>
        <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <CalendarDays className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-semibold text-heading">Encounter – {enc.date}</h3>
                <Tags text={enc.status} tone="success" size="xs" />
              </div>
              <p className="mt-0.5 text-xs text-body sm:text-sm">
                {enc.type} <span className="mx-1 text-border">|</span> Provider: Dr. Sarah Miller{" "}
                <span className="mx-1 text-border">|</span> Location: Virtual Visit
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ImportButton text="Edit" icon={<Pencil className="h-4 w-4" />} onClick={() => {}} className="whitespace-nowrap" />
            <button type="button" aria-label="More actions" className={`${iconBtn} h-10 w-10 border border-border`}>
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* Inner tabs */}
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
          {inner === "Encounter Summary" && (
            <div className="grid min-w-0 items-start gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
              <div className="min-w-0 space-y-4">
                <Box icon={ClipboardList} title="Visit Summary">
                  <dl className="space-y-2.5 text-sm">
                    {[
                      ["Reason for Visit", enc.reason],
                      ["Chief Complaint", enc.complaint],
                      ["Visit Type", enc.type],
                    ].map(([label, value]) => (
                      <div key={label} className="grid gap-1 sm:grid-cols-[140px_minmax(0,1fr)]">
                        <dt className="text-body">{label}</dt>
                        <dd className="font-medium text-heading">{value}</dd>
                      </div>
                    ))}
                    <div className="grid gap-1 sm:grid-cols-[140px_minmax(0,1fr)]">
                      <dt className="text-body">Encounter Status</dt>
                      <dd>
                        <Tags text={enc.status} tone="success" size="xs" />
                      </dd>
                    </div>
                  </dl>
                </Box>
                {soapBlock}
              </div>

              <div className="min-w-0 space-y-4">
                <Box
                  icon={FlaskConical}
                  title={`Orders & Results (${enc.orders.length})`}
                  action={<EditButton section="Orders & Results" variant="viewAll" onEdit={() => setInner("Orders & Results")} />}
                >
                  {enc.orders.length === 0 ? (
                    <p className="text-sm text-body">None recorded.</p>
                  ) : (
                    <ul className="divide-y divide-divider">
                      {enc.orders.map((o) => (
                        <li key={o.name} className="flex items-center justify-between gap-3 py-2.5">
                          <span className="min-w-0">
                            <span className="block text-sm font-semibold text-heading">{o.name}</span>
                            <span className="block text-xs text-body">
                              Result: {o.result} • {o.date}
                            </span>
                          </span>
                          <Tags text={o.status} tone="success" size="xs" />
                        </li>
                      ))}
                    </ul>
                  )}
                </Box>

                <Box
                  icon={Pill}
                  title={`Medications (${enc.meds.length})`}
                  action={<EditButton section="Medications" variant="viewAll" onEdit={() => setInner("Medications")} />}
                >
                  {enc.meds.length === 0 ? (
                    <p className="text-sm text-body">None recorded.</p>
                  ) : (
                    <ul className="space-y-2">
                      {enc.meds.map((m) => (
                        <li key={m.name}>
                          <p className="text-sm font-semibold text-heading">{m.name}</p>
                          <p className="text-xs text-body">{m.instructions}</p>
                        </li>
                      ))}
                    </ul>
                  )}
                </Box>

                <Box
                  icon={Paperclip}
                  title={`Documents (${enc.docs.length})`}
                  action={<EditButton section="Documents" variant="viewAll" onEdit={() => setInner("Documents")} />}
                >
                  {enc.docs.length === 0 ? (
                    <p className="text-sm text-body">None attached.</p>
                  ) : (
                    <ul className="divide-y divide-divider">
                      {enc.docs.map((d) => (
                        <li key={d.name} className="flex items-center gap-3 py-2.5">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-danger/10 text-danger">
                            <FileText className="h-4 w-4" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-semibold text-heading">{d.name}</span>
                            <span className="block text-xs text-body">
                              {d.date} • {d.size}
                            </span>
                          </span>
                          <button type="button" aria-label={`Download ${d.name}`} className={iconBtn}>
                            <Download className="h-4 w-4" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </Box>
              </div>
            </div>
          )}

          {inner === "Clinical Notes (SOAP)" && soapBlock}

          {inner === "Orders & Results" && (
            <div className={tableWrap}>
              {orderRows.length ? <Table columns={ORDER_COLUMNS} rows={orderRows} bordered={false} /> : emptyOrders}
            </div>
          )}

          {inner === "Medications" && (
            <div className={tableWrap}>
              {medRows.length ? (
                <Table columns={MED_COLUMNS} rows={medRows} bordered={false} />
              ) : (
                <TableStatus variant="empty" message="No medications for this encounter." />
              )}
            </div>
          )}

          {inner === "Documents" && (
            <div className={tableWrap}>
              {docRows.length ? (
                <Table columns={DOC_COLUMNS} rows={docRows} bordered={false} />
              ) : (
                <TableStatus variant="empty" message="No documents for this encounter." />
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default ChartEncounters;