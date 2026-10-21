"use client";

import React, { useState } from "react";
import {
  Building2,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  Printer,
  User,
  X,
} from "lucide-react";

import SearchAndFilter from "@/components/Searchandfilter";
import Table from "@/components/Table";
import { type TableColumn } from "@/components/Tableheader";
import Content from "@/components/Content";
import Tags, { type TagTone } from "@/components/Tags";
import Pagination from "@/components/Pagination";
import AddButton from "@/components/Addbutton";
import ImportButton from "@/components/ImportButton";
import EditButton from "@/components/EditButton";
import Actions from "@/components/Actions";
import RightSubSection from "@/components/RightSubSection";
import { cardCls } from "@/providers/Shared";

/* ---------- Static data ---------- */
type ResultStatus = "Normal" | "High" | "Abnormal";

type Result = {
  id: string;
  test: string;
  collected: string;
  reported: string;
  status: ResultStatus;
  lab: string;
};

const RESULTS: Result[] = [
  { id: "LAB-1008", test: "Complete Blood Count (CBC)", collected: "Oct 15, 2026", reported: "Oct 15, 2026", status: "Normal", lab: "Quest Diagnostics" },
  { id: "LAB-1007", test: "Lipid Panel", collected: "Sep 10, 2026", reported: "Sep 10, 2026", status: "High", lab: "Labcorp" },
  { id: "LAB-1006", test: "Metabolic Panel", collected: "Aug 22, 2026", reported: "Aug 22, 2026", status: "Normal", lab: "Quest Diagnostics" },
  { id: "LAB-1005", test: "HbA1c", collected: "Jul 12, 2026", reported: "Jul 12, 2026", status: "Normal", lab: "Labcorp" },
  { id: "LAB-1004", test: "Thyroid Panel", collected: "Jun 18, 2026", reported: "Jun 19, 2026", status: "Abnormal", lab: "Quest Diagnostics" },
  { id: "LAB-1003", test: "Vitamin D", collected: "May 03, 2026", reported: "May 04, 2026", status: "Normal", lab: "Labcorp" },
  { id: "LAB-1002", test: "Urinalysis", collected: "Apr 12, 2026", reported: "Apr 12, 2026", status: "Normal", lab: "Quest Diagnostics" },
  { id: "LAB-1001", test: "ESR", collected: "Mar 10, 2026", reported: "Mar 11, 2026", status: "Normal", lab: "Labcorp" },
  { id: "LAB-0998", test: "Liver Function Test", collected: "Feb 15, 2026", reported: "Feb 15, 2026", status: "High", lab: "Quest Diagnostics" },
  { id: "LAB-0997", test: "C-Reactive Protein (CRP)", collected: "Jan 22, 2026", reported: "Jan 22, 2026", status: "Normal", lab: "Quest Diagnostics" },
];

const STATUS_TONE: Record<ResultStatus, TagTone> = {
  Normal: "success",
  High: "danger",
  Abnormal: "danger",
};

const FILTERS = [
  { label: "Last 6 Months", options: ["Last 30 Days", "Last 3 Months", "Last 6 Months", "Last 12 Months"] },
  { label: "All Status", options: ["Normal", "High", "Abnormal"] },
];

const KEY_RESULTS = [
  { test: "WBC", result: "6.2 x10³/µL", range: "4.0 – 11.0" },
  { test: "RBC", result: "4.8 x10⁶/µL", range: "4.5 – 5.9" },
  { test: "Hemoglobin", result: "14.2 g/dL", range: "13.5 – 17.5" },
  { test: "Hematocrit", result: "42.1 %", range: "41 – 53" },
  { test: "Platelets", result: "245 x10³/µL", range: "150 – 450" },
];

const PANEL_TABS = ["Summary", "Values", "Trends", "Report"] as const;
type PanelTab = (typeof PANEL_TABS)[number];

const checkboxCls =
  "h-4 w-4 shrink-0 cursor-pointer rounded border-border accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30";

const navBtn =
  "flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-border bg-card text-heading transition-colors duration-200 hover:border-primary/40 hover:bg-primary/5 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-40";

const KEY_COLUMNS: TableColumn[] = [
  { key: "test", label: "Test" },
  { key: "result", label: "Result" },
  { key: "range", label: "Reference Range" },
  { key: "status", label: "Status" },
];

/* ---------- Detail panel ---------- */
const ResultPanel = ({
  result,
  index,
  onPrev,
  onNext,
  onClose,
  isOpen,
}: {
  result: Result;
  index: number;
  onPrev: () => void;
  onNext: () => void;
  onClose: () => void;
  isOpen: boolean;
}) => {
  const [tab, setTab] = useState<PanelTab>("Summary");

  const keyRows = KEY_RESULTS.map((k) => ({
    test: <Content title={k.test} />,
    result: <Content title={k.result} />,
    range: <Content title={k.range} />,
    status: <Tags text="Normal" tone="success" />,
  }));

  const info: { label: string; icon: React.ReactNode; lines: string[] }[] = [
    { label: "Collection Date", icon: <CalendarDays className="h-4 w-4 text-primary" />, lines: [result.collected, "08:30 AM"] },
    { label: "Reported Date", icon: <CalendarDays className="h-4 w-4 text-primary" />, lines: [result.reported, "04:12 PM"] },
    { label: "Ordered By", icon: <User className="h-4 w-4 text-body" />, lines: ["Dr. Emily Carter"] },
    { label: "Lab", icon: <Building2 className="h-4 w-4 text-body" />, lines: [result.lab] },
  ];

  return (
    <RightSubSection
      ariaLabel="Lab result details"
      open={isOpen}
      reopenKey={result.id}
      initiallyOpen={isOpen}
      onClose={onClose}
      width={440}
      className={cardCls}
    >
      {(closePanel) => (
        <>
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <FileText className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate text-sm font-semibold text-heading">{result.test}</h3>
              <Tags text={result.status} tone={STATUS_TONE[result.status]} />
            </div>
            <p className="mt-0.5 text-xs text-body">Order ID: {result.id}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <button type="button" aria-label="Previous result" disabled={index === 0} onClick={onPrev} className={navBtn}>
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button type="button" aria-label="Next result" disabled={index === RESULTS.length - 1} onClick={onNext} className={navBtn}>
            <ChevronRight className="h-4 w-4" />
          </button>
          <button type="button" aria-label="Close details" onClick={closePanel} className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-body transition-colors hover:bg-heading/5 hover:text-heading">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div role="tablist" className="mt-4 flex gap-5 overflow-x-auto border-b border-border hide-scrollbar">
        {PANEL_TABS.map((t) => {
          const active = t === tab;
          return (
            <button
              key={t}
              role="tab"
              type="button"
              aria-selected={active}
              onClick={() => setTab(t)}
              className={`-mb-px cursor-pointer whitespace-nowrap border-b-2 px-1 pb-2.5 text-xs font-medium transition-colors focus-visible:outline-none sm:text-sm ${
                active ? "border-primary text-primary" : "border-transparent text-body hover:text-heading"
              }`}
            >
              {t}
            </button>
          );
        })}
      </div>

      {tab === "Summary" ? (
        <div className="mt-4 space-y-5">
          <dl className="grid grid-cols-2 gap-x-4 gap-y-4">
            {info.map((i) => (
              <div key={i.label} className="flex min-w-0 gap-2.5">
                <span className="mt-0.5 shrink-0">{i.icon}</span>
                <div className="min-w-0">
                  <dt className="text-xs text-body">{i.label}</dt>
                  {i.lines.map((l) => (
                    <dd key={l} className="break-words text-xs font-medium text-heading sm:text-sm">
                      {l}
                    </dd>
                  ))}
                </div>
              </div>
            ))}
          </dl>

          {/* Interpretation */}
          <div className="flex gap-3 rounded-xl border border-primary/15 bg-primary/5 p-3.5">
            <FileText className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-primary">Interpretation</p>
              <p className="mt-1 text-xs leading-relaxed text-body">
                All values are within normal reference ranges. No significant abnormalities detected.
              </p>
            </div>
          </div>

          {/* Key results */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <h4 className="text-sm font-semibold text-heading">Key Results</h4>
              <EditButton section="Key Results" variant="viewAll" onEdit={() => {}} />
            </div>
            <div className="overflow-hidden rounded-[14px] border border-border bg-card">
              <Table columns={KEY_COLUMNS} rows={keyRows} />
            </div>
          </div>
        </div>
      ) : (
        <p className="mt-6 rounded-xl border border-dashed border-border p-6 text-center text-sm text-body">
          {tab} will be shown here.
        </p>
      )}

      {/* Footer actions */}
      <div className="mt-5 flex flex-col gap-2 border-t border-divider pt-4 sm:flex-row sm:flex-wrap">
        <ImportButton text="Download Report" icon={<Download className="h-4 w-4" />} onClick={() => {}} />
        <ImportButton text="Print" icon={<Printer className="h-4 w-4" />} onClick={() => {}} />
        <AddButton text="View Full Report" icon={null} onClick={() => {}} />
      </div>
        </>
      )}
    </RightSubSection>
  );
};

/* ---------- Component ---------- */
const Results = () => {
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>("LAB-1008");

  const selectedIndex = RESULTS.findIndex((r) => r.id === selectedId);
  const selected = selectedIndex >= 0 ? RESULTS[selectedIndex] : null;

  const columns: TableColumn[] = [
    { key: "select", label: "", className: "w-10" },
    { key: "id", label: "Order ID" },
    { key: "test", label: "Test Name" },
    { key: "collected", label: "Collection Date" },
    { key: "reported", label: "Reported Date" },
    { key: "status", label: "Status" },
    { key: "lab", label: "Lab" },
    {
      key: "actions",
      label: "Actions",
      header: <div className="flex w-full items-center justify-center">Actions</div>,
    },
  ];

  const rows = RESULTS.map((r) => {
    const isSel = r.id === selectedId;
    return {
      select: (
        <input
          type="checkbox"
          checked={isSel}
          onChange={() => setSelectedId(isSel ? null : r.id)}
          aria-label={`Select ${r.id}`}
          className={checkboxCls}
        />
      ),
      id: <span className={`text-sm ${isSel ? "font-medium text-primary" : "text-heading"}`}>{r.id}</span>,
      test: <Content title={r.test} />,
      collected: <Content title={r.collected} />,
      reported: <Content title={r.reported} />,
      status: <Tags text={r.status} tone={STATUS_TONE[r.status]} />,
      lab: <Content title={r.lab} />,
      actions: (
        <div className="flex w-full items-center justify-center gap-1">
          <Actions
            actions={["view", "more"]}
            size="sm"
            onAction={(action) => {
              if (action === "view") setSelectedId(r.id);
            }}
          />
        </div>
      ),
    };
  });

  return (
    <div className="flex min-w-0 items-start gap-4 sm:gap-5">
      {/* ---------- Results list ---------- */}
      <section className={`${cardCls} min-w-0 flex-1 space-y-4`}>
        <h3 className="text-base font-semibold text-heading">Results ({18})</h3>

        <SearchAndFilter
          placeholder="Search test name, order ID or lab..."
          filters={FILTERS}
          onSearch={() => {}}
          onFilterChange={() => {}}
        />

        <div className="overflow-hidden rounded-[14px] border border-border bg-card">
          <Table columns={columns} rows={rows} />
        </div>

        <Pagination
          page={page}
          totalPages={2}
          totalItems={18}
          pageSize={10}
          itemLabel="results"
          onChange={setPage}
        />
      </section>

      {/* ---------- Detail panel ---------- */}
      <ResultPanel
        result={selected ?? RESULTS[0]}
        index={selectedIndex >= 0 ? selectedIndex : 0}
        isOpen={Boolean(selected)}
        onPrev={() => setSelectedId(RESULTS[Math.max(selectedIndex - 1, 0)].id)}
        onNext={() => setSelectedId(RESULTS[Math.min(selectedIndex + 1, RESULTS.length - 1)].id)}
        onClose={() => setSelectedId(null)}
      />
    </div>
  );
};

export default Results;
