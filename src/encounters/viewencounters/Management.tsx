"use client";

import RadioCheckButtonh from "@/components/RadioCheckButtonh";
import React, { useState } from "react";
import {
  ArrowDown,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  Video,
  XCircle,
} from "lucide-react";

import StatCards, { type StatItem } from "@/components/Statcards";
import SearchAndFilter from "@/components/Searchandfilter";
import Table from "@/components/Table";
import { type TableColumn } from "@/components/Tableheader";
import Name from "@/components/Name";
import Content from "@/components/Content";
import Tags, { type TagTone } from "@/components/Tags";
import Actions from "@/components/Actions";
import Pagination from "@/components/Pagination";
import ImportButton from "@/components/ImportButton";
import EditButton from "@/components/EditButton";

/* ---------- Static data ---------- */
const STATS: StatItem[] = [
  { label: "Total Encounters", value: "12", Icon: FileText, accent: "primary" },
  { label: "Completed", value: "8", Icon: CheckCircle2, accent: "success" },
  { label: "In Progress", value: "2", Icon: Clock, accent: "violet" },
  { label: "Cancelled", value: "1", Icon: XCircle, accent: "danger" },
  { label: "Upcoming Visits", value: "2", Icon: CalendarDays, accent: "primary" },
];

const FILTERS = [
  {
    label: "All Visit Types",
    options: ["Follow-up Visit", "Lab Review", "Annual Checkup", "Allergy Consultation", "Initial Visit"],
  },
  {
    label: "All Providers",
    options: ["Dr. Sarah Lee", "Dr. Emily Davis", "Dr. James Wilson", "Dr. Michael Brown"],
  },
  { label: "All Statuses", options: ["Completed", "In Progress", "Cancelled"] },
];

const STATUS_TONE: Record<string, TagTone> = {
  Completed: "success",
  "In Progress": "info",
  Cancelled: "danger",
};

type Row = {
  id: string;
  date: string;
  time: string;
  type: string;
  provider: string;
  specialty: string;
  mode: "In Clinic" | "Telemedicine";
  status: string;
  notes: string;
};

const ROWS: Row[] = [
  { id: "ENC-2026-000125", date: "Oct 9, 2026", time: "10:00 AM – 10:30 AM", type: "Follow-up Visit", provider: "Dr. Sarah Lee", specialty: "Primary Care", mode: "In Clinic", status: "Completed", notes: "Improved symptoms." },
  { id: "ENC-2026-000124", date: "Sep 12, 2026", time: "11:30 AM – 12:00 PM", type: "Lab Review", provider: "Dr. Emily Davis", specialty: "Internal Medicine", mode: "Telemedicine", status: "Completed", notes: "Reviewed lab results." },
  { id: "ENC-2026-000123", date: "Aug 20, 2026", time: "09:00 AM – 09:30 AM", type: "Annual Checkup", provider: "Dr. Sarah Lee", specialty: "Primary Care", mode: "In Clinic", status: "Completed", notes: "Normal vitals." },
  { id: "ENC-2026-000122", date: "Jul 14, 2026", time: "02:00 PM – 02:30 PM", type: "Allergy Consultation", provider: "Dr. James Wilson", specialty: "Allergy & Immunology", mode: "In Clinic", status: "Cancelled", notes: "Cancelled by patient." },
  { id: "ENC-2026-000121", date: "Jun 5, 2026", time: "10:30 AM – 11:00 AM", type: "Follow-up Visit", provider: "Dr. Sarah Lee", specialty: "Primary Care", mode: "Telemedicine", status: "Completed", notes: "Continue medication." },
  { id: "ENC-2026-000120", date: "May 10, 2026", time: "01:00 PM – 01:30 PM", type: "Initial Visit", provider: "Dr. Michael Brown", specialty: "Family Medicine", mode: "In Clinic", status: "Completed", notes: "Initial assessment." },
  { id: "ENC-2026-000119", date: "Apr 2, 2026", time: "11:00 AM – 11:30 AM", type: "Follow-up Visit", provider: "Dr. Sarah Lee", specialty: "Primary Care", mode: "In Clinic", status: "In Progress", notes: "–" },
  { id: "ENC-2026-000118", date: "Mar 15, 2026", time: "09:30 AM – 10:00 AM", type: "Lab Review", provider: "Dr. Emily Davis", specialty: "Internal Medicine", mode: "In Clinic", status: "Completed", notes: "Labs within normal range." },
];

const checkboxCls =
  "h-4 w-4 cursor-pointer rounded border-border accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30";

const COLUMNS: TableColumn[] = [
  {
    key: "select",
    label: "",
    className: "w-10",
  },
  { key: "id", label: "Encounter ID" },
  {
    key: "date",
    label: "Date & Time",
    header: (
      <span className="flex items-center gap-1 text-primary">
        Date &amp; Time
        <ArrowDown className="h-3.5 w-3.5" />
      </span>
    ),
  },
  { key: "type", label: "Visit Type" },
  { key: "provider", label: "Provider" },
  { key: "mode", label: "Location / Mode" },
  { key: "status", label: "Status" },
  { key: "notes", label: "Notes" },
  {
    key: "actions",
    label: "Actions",
    header: <div className="flex w-full items-center justify-center">Actions</div>,
  },
];

/* ---------- Component ---------- */
const Management = () => {
  const [page, setPage] = useState(1);

  const rows = ROWS.map((r) => ({
    select: <RadioCheckButtonh type="checkbox" aria-label={`Select ${r.id}`} className={checkboxCls} />,
    id: <Content title={r.id} />,
    date: <Content title={r.date} description={r.time} />,
    type: <Content title={r.type} />,
    provider: <Name name={r.provider} sub={r.specialty} />,
    mode: (
      <span className="flex items-center gap-2 whitespace-nowrap text-sm text-heading">
        {r.mode === "Telemedicine" ? (
          <Video className="h-4 w-4 shrink-0 text-primary" />
        ) : (
          <Building2 className="h-4 w-4 shrink-0 text-primary" />
        )}
        {r.mode}
      </span>
    ),
    status: <Tags text={r.status} tone={STATUS_TONE[r.status] ?? "neutral"} />,
    notes: <Content title={r.notes} />,
    actions: (
      <div className="flex w-full items-center justify-center">
        <Actions onAction={() => {}} />
      </div>
    ),
  }));

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Stat cards */}
      <StatCards stats={STATS} />

      {/* Search + filters + reset / export */}
      <div className="flex flex-col gap-3 xl:flex-row xl:items-start 2xl:items-center">
        <div className="min-w-0 flex-1">
          <SearchAndFilter
            placeholder="Search by encounter ID, visit type or provider..."
            filters={FILTERS}
            onSearch={() => {}}
            onFilterChange={() => {}}
          />
        </div>
        <div className="flex shrink-0 items-center gap-3">
           <EditButton className="text-[14px]" section="reset" variant="viewAll" label="Reset" onEdit={() => {}} hideIcon />
          <ImportButton text="Export" icon={<Download className="h-4 w-4" />} onClick={() => {}} />
        </div>
      </div>

      {/* Table */}
      <div className="space-y-3">
        <div className="overflow-hidden rounded-[14px] border border-border bg-card">
          <Table columns={COLUMNS} rows={rows} bordered={false} selectable />
        </div>
        <Pagination
          page={page}
          totalPages={2}
          totalItems={12}
          pageSize={8}
          itemLabel="encounters"
          onChange={setPage}
        />
      </div>
    </div>
  );
};

export default Management;