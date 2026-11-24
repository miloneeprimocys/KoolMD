"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Search, User, Video } from "lucide-react";

import Actions from "@/components/Actions";
import Content from "@/components/Content";
import DatePicker from "@/components/Datepicker";
import ImportButton from "@/components/ImportButton";
import SignupDropdown from "@/components/SignupDropdown";
import SignupField from "@/components/SignupField";
import Table from "@/components/Table";
import { type TableColumn } from "@/components/Tableheader";
import Tags, { type TagTone } from "@/components/Tags";
import { toOptions } from "@/providers/Shared";

const DETAILS_HREF = "/provider/appointments/view";

/* ---------------------------------------------------------------- */
/*  Static data (replace with API data)                              */
/* ---------------------------------------------------------------- */
export type Scope = "today" | "upcoming" | "past";

type Row = {
  id: string;
  date: string;
  time: string;
  name: string;
  mrn: string;
  visitType: "Follow-up" | "Initial Visit";
  reason: string;
  intake: "Completed" | "Pending";
  status: "In Progress" | "Checked In" | "Scheduled" | "Confirmed" | "Completed";
};

const NAMES = ["Emily Carter", "John Mitchell", "Ava Singh", "Liam Patel", "Sophia Reddy", "Daniel Brooks"];
const REASONS = ["Headache Management", "Persistent cough", "Diabetes follow-up", "Blood pressure review", "General checkup", "Migraine review"];
const TIMES = ["09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "02:00 PM", "02:30 PM"];
const TODAY = "2026-11-26";

const isoShift = (days: number) => new Date(Date.UTC(2026, 10, 26 + days)).toISOString().slice(0, 10);

const generate = (scope: "upcoming" | "past", count: number): Row[] =>
  Array.from({ length: count }, (_, i) => {
    const p = i % 6;
    const shift = (1 + Math.floor(i / 3)) * (scope === "upcoming" ? 1 : -1);
    return {
      id: `${scope}-${i + 1}`,
      date: isoShift(shift),
      time: TIMES[i % TIMES.length],
      name: NAMES[p],
      mrn: `KM-00${2487 + p}`,
      visitType: p % 3 === 1 ? "Initial Visit" : "Follow-up",
      reason: REASONS[p],
      intake: scope === "past" || i % 4 !== 3 ? "Completed" : "Pending",
      status: scope === "past" ? "Completed" : i % 2 === 0 ? "Scheduled" : "Confirmed",
    };
  });

const todayRow = (i: number, time: string, p: number, visitType: Row["visitType"], intake: Row["intake"], status: Row["status"]): Row => ({
  id: `today-${i}`,
  date: TODAY,
  time,
  name: NAMES[p],
  mrn: `KM-00${2487 + p}`,
  visitType,
  reason: REASONS[p],
  intake,
  status,
});

export const APPOINTMENTS: Record<Scope, Row[]> = {
  today: [
    todayRow(1, "10:00 AM", 0, "Follow-up", "Completed", "In Progress"),
    todayRow(2, "10:30 AM", 1, "Initial Visit", "Completed", "Checked In"),
    todayRow(3, "11:00 AM", 2, "Follow-up", "Completed", "Scheduled"),
    todayRow(4, "11:30 AM", 3, "Follow-up", "Pending", "Confirmed"),
    todayRow(5, "02:00 PM", 4, "Initial Visit", "Completed", "Scheduled"),
    todayRow(6, "02:30 PM", 5, "Follow-up", "Completed", "Scheduled"),
  ],
  upcoming: generate("upcoming", 14),
  past: generate("past", 28),
};

const STATUS_TONE: Record<Row["status"], TagTone> = {
  "In Progress": "violet",
  "Checked In": "info",
  Scheduled: "neutral",
  Confirmed: "success",
  Completed: "success",
};

const COLUMNS: TableColumn[] = [
  { key: "time", label: "Time" },
  { key: "patient", label: "Patient" },
  { key: "visitType", label: "Visit Type" },
  { key: "reason", label: "Reason for Visit" },
  { key: "intake", label: "Intake" },
  { key: "status", label: "Status" },
  { key: "actions", label: "Actions" },
];

const VISIT_TYPES = toOptions(["Follow-up", "Initial Visit"]);
const STATUSES = toOptions(["In Progress", "Checked In", "Scheduled", "Confirmed", "Completed"]);
const PAGE_SIZES = toOptions(["10", "20", "50"]);

const initialsOf = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0]?.toUpperCase())
    .slice(0, 2)
    .join("");

const pageBtn =
  "flex h-8 min-w-8 cursor-pointer items-center justify-center rounded-lg border px-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-50";

/* ---------------------------------------------------------------- */
/*  Tab: Today / Upcoming / Past                                     */
/* ---------------------------------------------------------------- */
const ProviderAppointmentsTab = ({ scope }: { scope: Scope }) => {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [date, setDate] = useState(scope === "today" ? TODAY : "");
  const [visitType, setVisitType] = useState("");
  const [status, setStatus] = useState("");
  const [pageSize, setPageSize] = useState("10");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return APPOINTMENTS[scope].filter(
      (r) =>
        (!q || r.name.toLowerCase().includes(q) || r.mrn.toLowerCase().includes(q) || r.reason.toLowerCase().includes(q)) &&
        (!date || r.date === date) &&
        (!visitType || r.visitType === visitType) &&
        (!status || r.status === status),
    );
  }, [scope, search, date, visitType, status]);

  const size = Number(pageSize);
  const totalPages = Math.max(1, Math.ceil(filtered.length / size));
  const current = Math.min(page, totalPages);
  const start = (current - 1) * size;
  const pageRows = filtered.slice(start, start + size);

  const change = <T,>(setter: (v: T) => void) => (v: T) => {
    setter(v);
    setPage(1);
  };

  const reset = () => {
    setSearch("");
    setDate(scope === "today" ? TODAY : "");
    setVisitType("");
    setStatus("");
    setPage(1);
  };

  const rows = pageRows.map((r) => ({
    time: <Content title={<span className="font-medium">{r.time}</span>} />,
    patient: (
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
          {initialsOf(r.name)}
        </span>
        <Content title={<span className="font-semibold">{r.name}</span>} description={`MRN: ${r.mrn}`} />
      </div>
    ),
    visitType: (
      <Content
        icon={r.visitType === "Follow-up" ? <Video className="h-4 w-4 text-primary" /> : <User className="h-4 w-4 text-primary" />}
        title={<span className="font-medium">{r.visitType}</span>}
      />
    ),
    reason: <Content title={r.reason} />,
    intake: <Tags text={r.intake} tone={r.intake === "Completed" ? "success" : "warning"} size="xs" />,
    status: <Tags text={r.status} tone={STATUS_TONE[r.status]} size="xs" />,
    actions: (
      <div className="flex items-center gap-2">
        <Actions
          actions={["view"]}
          size="sm"
          onAction={() => router.push(`${DETAILS_HREF}?id=${encodeURIComponent(r.id)}&from=${scope}`)}
        />
        <Actions actions={["more"]} size="sm" />
      </div>
    ),
  }));

  return (
    <div className="min-w-0 space-y-4">
      {/* Filters */}
      <div className="grid items-end gap-3 md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_200px_180px_180px_auto]">
        <SignupField
          name={`${scope}_search`}
          placeholder="Search by patient name, MRN or reason..."
          icon={<Search className="h-4 w-4" />}
          value={search}
          onChange={(e) => change(setSearch)(e.target.value)}
          autoComplete="off"
        />
        <DatePicker name={`${scope}_date`} placeholder="dd-mm-yyyy" value={date} onChange={change(setDate)} />
        <SignupDropdown
          name={`${scope}_visitType`}
          placeholder="Visit Type"
          options={VISIT_TYPES}
          value={visitType}
          onChange={change(setVisitType)}
          searchable={false}
        />
        <SignupDropdown
          name={`${scope}_status`}
          placeholder="Status"
          options={STATUSES}
          value={status}
          onChange={change(setStatus)}
          searchable={false}
        />
        <ImportButton text="Reset" icon={null} onClick={reset} className="h-12 whitespace-nowrap" />
      </div>

      <Table columns={COLUMNS} rows={rows} />

      {/* Pagination */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-body sm:text-sm">
          Showing {filtered.length === 0 ? 0 : start + 1}–{start + pageRows.length} of {filtered.length} appointments
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-body sm:text-sm">
            <span className="whitespace-nowrap">Rows per page:</span>
            <div className="w-24">
              <SignupDropdown
                name={`${scope}_pageSize`}
                options={PAGE_SIZES}
                value={pageSize}
                onChange={(v) => {
                  setPageSize(v);
                  setPage(1);
                }}
                searchable={false}
                triggerClassName="!h-9"
                portalMenu
                portalMenuZIndex={100}
              />
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button type="button" aria-label="Previous page" disabled={current === 1} onClick={() => setPage(current - 1)} className={`${pageBtn} border-border text-body hover:bg-primary/10`}>
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                aria-current={n === current ? "page" : undefined}
                onClick={() => setPage(n)}
                className={`${pageBtn} ${n === current ? "border-primary bg-primary text-white" : "border-border text-heading hover:bg-primary/10"}`}
              >
                {n}
              </button>
            ))}
            <button type="button" aria-label="Next page" disabled={current === totalPages} onClick={() => setPage(current + 1)} className={`${pageBtn} border-border text-body hover:bg-primary/10`}>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderAppointmentsTab;
