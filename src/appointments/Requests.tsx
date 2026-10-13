"use client";

import React, { useState } from "react";
import { Calendar, Check, Clock, Eye, X } from "lucide-react";

import SearchAndFilter from "@/components/Searchandfilter";
import Table from "@/components/Table";
import { type TableColumn } from "@/components/Tableheader";
import Name from "@/components/Name";
import Content from "@/components/Content";
import Tags, { type TagTone } from "@/components/Tags";
import Pagination from "@/components/Pagination";
import RightSection, {
  BASE_FILTERS,
  StatusChips,
  checkboxCls,
  type ChipItem,
} from "./Rightsection";

/* ---------- Static data ---------- */
const FILTERS = [
  ...BASE_FILTERS,
  { label: "All Request Statuses", options: ["Pending", "Approved", "Declined", "Cancelled"] },
];

const CHIPS: ChipItem[] = [
  { label: "All", count: 24, dot: "bg-primary", tint: "border-primary/20 bg-primary/5" },
  { label: "Pending", count: 12, dot: "bg-warning", tint: "border-warning/30 bg-warning/5" },
  { label: "Approved", count: 6, dot: "bg-success", tint: "border-success/20 bg-success/5" },
  { label: "Declined", count: 4, dot: "bg-danger", tint: "border-danger/20 bg-danger/5" },
  { label: "Cancelled", count: 2, dot: "bg-slate-400", tint: "border-border bg-heading/5" },
];

const REQUEST_TONE: Record<string, TagTone> = {
  Pending: "warning",
  Approved: "success",
  Declined: "danger",
  Cancelled: "neutral",
};

type Row = {
  name: string;
  pid: string;
  age: number;
  type: string;
  dept: string;
  date: string;
  time: string;
  provider: string;
  submittedDate: string;
  submittedTime: string;
  status: string;
};

const r = (
  name: string,
  pid: string,
  age: number,
  type: string,
  dept: string,
  date: string,
  time: string,
  provider: string,
  submittedDate: string,
  submittedTime: string,
  status: string,
): Row => ({ name, pid, age, type, dept, date, time, provider, submittedDate, submittedTime, status });

const ROWS: Row[] = [
  r("Ava Taylor", "PID-11234", 27, "Initial Consultation", "Dermatology", "Oct 15, 2026", "10:00 AM", "Dr. Emily Carter", "Oct 10, 2026", "02:14 PM", "Pending"),
  r("Lucas Anderson", "PID-11567", 50, "Follow Up", "Cardiology", "Oct 14, 2026", "11:30 AM", "Dr. Michael Chen", "Oct 10, 2026", "11:32 AM", "Pending"),
  r("Isabella Garcia", "PID-11890", 31, "Initial Consultation", "Internal Medicine", "Oct 13, 2026", "09:00 AM", "Dr. Sarah Wilson", "Oct 10, 2026", "09:18 AM", "Pending"),
  r("Noah Wilson", "PID-10987", 18, "Physical Exam", "Pediatrics", "Oct 16, 2026", "03:00 PM", "Dr. James Miller", "Oct 09, 2026", "06:45 PM", "Approved"),
  r("Emma Davis", "PID-11022", 34, "Lab Results Review", "Internal Medicine", "Oct 12, 2026", "01:00 PM", "Dr. Sarah Wilson", "Oct 09, 2026", "04:21 PM", "Approved"),
  r("Olivia Bennett", "PID-10234", 36, "Follow Up", "Cardiology", "Oct 18, 2026", "10:00 AM", "Dr. Michael Chen", "Oct 09, 2026", "01:14 PM", "Declined"),
  r("Charlotte White", "PID-12234", 8, "Well Child Visit", "Pediatrics", "Oct 20, 2026", "10:30 AM", "Dr. James Miller", "Oct 08, 2026", "11:03 AM", "Pending"),
  r("Liam Carter", "PID-10456", 29, "Consultation", "Orthopedics", "Oct 14, 2026", "02:00 PM", "Dr. Robert Kim", "Oct 08, 2026", "10:55 AM", "Cancelled"),
  r("Sophia Martinez", "PID-10789", 42, "Procedure", "Dermatology", "Oct 17, 2026", "09:30 AM", "Dr. Emily Carter", "Oct 08, 2026", "09:12 AM", "Pending"),
  r("Mason Lee", "PID-12011", 45, "Initial Consultation", "Urology", "Oct 21, 2026", "11:00 AM", "Dr. Kevin Roberts", "Oct 07, 2026", "05:44 PM", "Pending"),
];

const COLUMNS: TableColumn[] = [
  {
    key: "select",
    label: "",
    className: "w-10",
    header: <input type="checkbox" aria-label="Select all" className={checkboxCls} />,
  },
  { key: "patient", label: "Patient" },
  { key: "requested", label: "Requested Appointment" },
  { key: "provider", label: "Preferred Provider" },
  { key: "submitted", label: "Submitted On" },
  { key: "status", label: "Status" },
  {
    key: "actions",
    label: "Actions",
    width: 152,
    header: <div className="flex w-full items-center justify-center">Actions</div>,
  },
];

const iconBtn =
  "flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30";

/* ---------- Component ---------- */
const Requests = () => {
  const [chip, setChip] = useState("All");
  const [page, setPage] = useState(1);
  const [showPanel, setShowPanel] = useState(false);

  const rows = ROWS.map((x) => ({
    select: <input type="checkbox" aria-label={`Select ${x.name}`} className={checkboxCls} />,
    patient: (
      <button type="button" onClick={() => setShowPanel(true)} className="w-full min-w-0 cursor-pointer text-left">
        <Name name={x.name} sub={`${x.pid} • ${x.age}Y`} truncate />
      </button>
    ),
    requested: (
      <div className="min-w-0 space-y-1">
        <Content title={x.type} description={x.dept} truncate />
        <div className="min-w-0 space-y-0.5 text-xs">
          <p className="flex min-w-0 items-center gap-1.5 font-medium text-heading">
            <Calendar className="h-3.5 w-3.5 shrink-0 text-body" />
            <span className="truncate">{x.date}</span>
          </p>
          <p className="flex min-w-0 items-center gap-1.5 text-body">
            <Clock className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{x.time}</span>
          </p>
        </div>
      </div>
    ),
    provider: <Name name={x.provider} sub={x.dept} truncate />,
    submitted: <Content title={x.submittedDate} description={x.submittedTime} truncate />,
    status: <Tags text={x.status} tone={REQUEST_TONE[x.status] ?? "neutral"} />,
    actions: (
      <div className="flex w-full items-center justify-center gap-1">
        <button
          type="button"
          aria-label="Toggle request details"
          title={showPanel ? "Hide request details" : "View request"}
          onClick={() => setShowPanel((open) => !open)}
          className={`${iconBtn} text-body hover:bg-heading/5 hover:text-heading`}
        >
          <Eye className="h-4 w-4" />
        </button>
        {x.status === "Pending" ? (
          <>
            <button type="button" aria-label="Approve request" className={`${iconBtn} text-primary hover:bg-primary/10`}>
              <Check className="h-4 w-4" />
            </button>
            <button type="button" aria-label="Decline request" className={`${iconBtn} text-danger hover:bg-danger/10`}>
              <X className="h-4 w-4" />
            </button>
          </>
        ) : null}
      </div>
    ),
  }));

  return (
    <div className="space-y-4">
      {/* Search + filters */}
      <SearchAndFilter
        placeholder="Search by patient name or ID..."
        filters={FILTERS}
        onSearch={() => {}}
        onFilterChange={() => {}}
      />

      <div className="flex flex-col gap-4 xl:flex-row xl:items-start">
        <div className="min-w-0 flex-1 space-y-4">
          <StatusChips items={CHIPS} active={chip} onChange={setChip} />

          <div className="space-y-3">
            <div className="overflow-hidden rounded-[14px] border border-border bg-card">
              <Table columns={COLUMNS} rows={rows} />
            </div>
            <Pagination
              page={page}
              totalPages={3}
              totalItems={24}
              pageSize={10}
              itemLabel="requests"
              onChange={setPage}
            />
          </div>
        </div>

        {/* Right section */}
        {showPanel && <RightSection variant="request" onClose={() => setShowPanel(false)} />}
      </div>
    </div>
  );
};

export default Requests;