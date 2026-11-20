"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Download,
  FileText,
  Info,
  ScanLine,
  Share2,
  Video,
  type LucideIcon,
} from "lucide-react";

import AddButton from "@/components/Addbutton";
import ImportButton from "@/components/ImportButton";
import Table from "@/components/Table";
import { type TableColumn } from "@/components/Tableheader";
import Content from "@/components/Content";
import Tags, { type TagTone } from "@/components/Tags";
import { cardCls } from "@/providers/Shared";
import VisitDocumentTabs from "./VisitDocumentTabs";

/* ---------------------------------------------------------------- */
/*  Routes (create a page.tsx for each)                              */
/* ---------------------------------------------------------------- */
const BASE = "/my-appointments";
const SUMMARY_ROUTE = `${BASE}/visit-summary`;

/* ---------------------------------------------------------------- */
/*  Static data (replace with API / redux selector)                  */
/* ---------------------------------------------------------------- */
type Status = "Normal" | "High" | "Low";
const STATUS_TONE: Record<Status, TagTone> = { Normal: "success", High: "danger", Low: "warning" };

type ResultRow = { parameter: string; result: string; range: string; status: Status };
type Test = {
  id: string;
  name: string;
  kind: "Lab Test" | "Imaging";
  date: string;
  dateTime: string;
  status: Status;
  summary: string;
  summaryDetail: string;
  rows: ResultRow[];
  interpretation: string;
  Icon: LucideIcon;
};

const TESTS: Test[] = [
  {
    id: "cbc",
    name: "Complete Blood Count (CBC)",
    kind: "Lab Test",
    date: "Sep 28, 2026",
    dateTime: "Sep 28, 2026, 11:20 AM",
    status: "Normal",
    summary: "All parameters are within normal range.",
    summaryDetail: "Your CBC results are normal, with no significant abnormalities.",
    rows: [
      { parameter: "Hemoglobin", result: "13.2 g/dL", range: "12.0 - 15.5 g/dL", status: "Normal" },
      { parameter: "Total WBC", result: "6,800 /µL", range: "4,000 - 11,000 /µL", status: "Normal" },
      { parameter: "RBC", result: "4.56 million /µL", range: "3.80 - 5.20 million /µL", status: "Normal" },
      { parameter: "Platelets", result: "2.45 lakh /µL", range: "1.50 - 4.00 lakh /µL", status: "Normal" },
      { parameter: "Hematocrit (PCV)", result: "39.8 %", range: "36.0 - 46.0 %", status: "Normal" },
    ],
    interpretation: "Your complete blood count is within the normal range.",
    Icon: FileText,
  },
  {
    id: "xray",
    name: "Chest X-Ray",
    kind: "Imaging",
    date: "Sep 28, 2026",
    dateTime: "Sep 28, 2026, 11:45 AM",
    status: "Normal",
    summary: "No acute abnormalities detected.",
    summaryDetail: "Your chest X-ray shows clear lungs and a normal heart size.",
    rows: [
      { parameter: "Lungs", result: "Clear", range: "No infiltrates", status: "Normal" },
      { parameter: "Heart Size", result: "Normal", range: "Cardiothoracic ratio < 50%", status: "Normal" },
      { parameter: "Pleura", result: "No effusion", range: "No effusion", status: "Normal" },
      { parameter: "Bones", result: "Intact", range: "No fractures", status: "Normal" },
    ],
    interpretation: "No signs of pneumonia or other acute chest conditions.",
    Icon: ScanLine,
  },
  {
    id: "crp",
    name: "C-Reactive Protein (CRP)",
    kind: "Lab Test",
    date: "Sep 28, 2026",
    dateTime: "Sep 28, 2026, 11:20 AM",
    status: "Normal",
    summary: "Inflammation markers are within normal range.",
    summaryDetail: "Your CRP level does not suggest significant inflammation.",
    rows: [
      { parameter: "C-Reactive Protein", result: "3.2 mg/L", range: "< 10 mg/L", status: "Normal" },
      { parameter: "hs-CRP", result: "1.1 mg/L", range: "< 3.0 mg/L", status: "Normal" },
    ],
    interpretation: "Your CRP result is within the normal range.",
    Icon: FileText,
  },
];

const VISITS: Record<string, { doctor: string; specialty: string; date: string; type: string; prescriptions: number }> = {
  "PV-1008": { doctor: "Dr. John Carter", specialty: "Internal Medicine", date: "Mon, Sep 28, 2026", type: "Video Consultation", prescriptions: 2 },
  "PV-1007": { doctor: "Dr. Sarah Miller", specialty: "Dermatology", date: "Wed, Aug 20, 2026", type: "Video Consultation", prescriptions: 1 },
};

const initialsOf = (name: string) =>
  name
    .replace(/^Dr\.\s*/i, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

/* ---------------------------------------------------------------- */
/*  Page                                                             */
/* ---------------------------------------------------------------- */
const VisitResults = () => {
  const router = useRouter();
  const requestedId = useSearchParams().get("id") ?? "PV-1008";
  const visitId = VISITS[requestedId] ? requestedId : "PV-1008";
  const visit = VISITS[visitId];

  const [activeId, setActiveId] = useState(TESTS[0].id);
  const test = TESTS.find((t) => t.id === activeId) ?? TESTS[0];

  const columns: TableColumn[] = [
    { key: "parameter", label: "Parameter" },
    { key: "result", label: "Result" },
    { key: "range", label: "Reference Range" },
    { key: "status", label: "Status" },
  ];
  const rows = test.rows.map((r) => ({
    parameter: <Content title={r.parameter} />,
    result: <Content title={r.result} />,
    range: <Content title={r.range} />,
    status: <Tags text={r.status} tone={STATUS_TONE[r.status]} size="xs" />,
  }));

  const handleDownload = () => {
    // TODO: call your API here to download the PDF
    console.log("Download result PDF:", test.id);
  };

  const handleShare = async () => {
    // TODO: replace with your share flow
    try {
      if (navigator.share) await navigator.share({ title: test.name, url: window.location.href });
      else await navigator.clipboard.writeText(window.location.href);
    } catch {
      /* user cancelled */
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-4 sm:space-y-5">
      <button
        type="button"
        onClick={() => router.push(`${SUMMARY_ROUTE}?id=${visitId}`)}
        className="flex cursor-pointer items-center gap-1.5 text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Visit Summary
      </button>

      <div>
        <h2 className="text-lg font-semibold text-heading sm:text-xl 2xl:text-2xl">Results</h2>
        <p className="mt-0.5 text-sm text-body">View your lab and diagnostic test results from this consultation.</p>
      </div>

      {/* Doctor + visit */}
      <section className={`${cardCls} flex flex-col gap-4 sm:p-5 md:flex-row md:items-center`}>
        <div className="flex min-w-0 items-center gap-4 md:w-[320px] md:shrink-0">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-base font-semibold text-primary">
            {initialsOf(visit.doctor)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-base font-semibold text-heading">{visit.doctor}</p>
            <p className="text-sm text-body">{visit.specialty}</p>
          </div>
        </div>
        <div className="space-y-2 text-sm text-heading md:border-l md:border-divider md:pl-6">
          <p className="flex items-center gap-2.5"><Calendar className="h-4 w-4 shrink-0 text-primary" />{visit.date}</p>
          <p className="flex items-center gap-2.5"><Video className="h-4 w-4 shrink-0 text-primary" />{visit.type}</p>
        </div>
      </section>

      {/* Tabs */}
      <VisitDocumentTabs
        activeTab="results"
        visitId={visitId}
        prescriptionCount={visit.prescriptions}
        resultCount={TESTS.length}
      />

      <div className="grid items-start gap-4 sm:gap-5 lg:grid-cols-[300px_minmax(0,1fr)]">
        {/* ================= LEFT: list ================= */}
        <section className="min-w-0 space-y-3">
          <h3 className="text-base font-semibold text-heading">Test Results ({TESTS.length})</h3>
          <ul className="space-y-2.5">
            {TESTS.map((t) => {
              const isActive = t.id === activeId;
              return (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => setActiveId(t.id)}
                    aria-pressed={isActive}
                    className={`flex w-full cursor-pointer items-center gap-3 rounded-xl border px-3 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${
                      isActive ? "border-primary/30 bg-primary/10" : "border-border bg-card hover:border-primary/30 hover:bg-primary/5"
                    }`}
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <t.Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-heading">{t.name}</span>
                      <span className="block text-xs text-body">{t.kind} • {t.date}</span>
                    </span>
                    <ChevronRight className="h-4 w-4 shrink-0 text-heading" />
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        {/* ================= RIGHT: detail ================= */}
        <section className={`${cardCls} min-w-0 space-y-5 sm:p-5`} aria-live="polite">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <test.Icon className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <h3 className="text-lg font-semibold text-heading">{test.name}</h3>
                <p className="mt-0.5 text-xs text-body">{test.kind} <span className="mx-1.5 text-border">|</span> {test.dateTime}</p>
              </div>
            </div>

            <div className="flex flex-col items-start gap-3 sm:items-end">
              <Tags text={test.status} tone={STATUS_TONE[test.status]} size="xs" />
              <div className="flex flex-wrap gap-2">
                <AddButton text="Download (PDF)" icon={<Download className="h-4 w-4" />} onClick={handleDownload} className="whitespace-nowrap" />
                <ImportButton text="Share" icon={<Share2 className="h-4 w-4" />} onClick={handleShare} />
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="rounded-xl bg-primary/5 p-4">
            <h4 className="text-sm font-semibold text-heading">Result Summary</h4>
            <div className="mt-2 flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-success/15 text-success">
                <CheckCircle2 className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-heading">{test.summary}</p>
                <p className="text-xs text-body">{test.summaryDetail}</p>
              </div>
            </div>
          </div>

          {/* Details */}
          <div>
            <h4 className="mb-2 text-sm font-semibold text-heading">Test Details</h4>
            <div className="overflow-x-auto rounded-[14px] border border-border bg-card">
              <Table columns={columns} rows={rows} bordered={false} />
            </div>
          </div>

          {/* Interpretation */}
          <div className="flex items-start gap-3 rounded-xl bg-primary/5 p-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Info className="h-4 w-4" />
            </span>
            <div>
              <h4 className="text-sm font-semibold text-primary">Lab Interpretation</h4>
              <p className="text-xs text-body sm:text-sm">{test.interpretation}</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default VisitResults;