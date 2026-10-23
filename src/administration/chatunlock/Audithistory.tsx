"use client";

import React, { useEffect, useRef, useState } from "react";
import { Calendar, ChevronDown } from "lucide-react";

import AddButton from "@/components/Addbutton";
import SignupField from "@/components/SignupField";
import SignupDropdown, { type DropdownOption } from "@/components/SignupDropdown";
import DatePicker from "@/components/Datepicker";
import Table from "@/components/Table";
import { type TableColumn } from "@/components/Tableheader";
import Name from "@/components/Name";
import Content from "@/components/Content";
import Tags, { type TagTone } from "@/components/Tags";
import Pagination from "@/components/Pagination";
import Actions from "@/components/Actions";
import EditButton from "@/components/EditButton";

/* ---------- Static data ---------- */
const opts = (all: string, list: string[]): DropdownOption[] => [
  { value: "all", label: all },
  ...list.map((v) => ({ value: v, label: v })),
];

const USERS = opts("All Users", ["Dr. John Doe", "Admin User", "Sarah Miller", "Rachel Clark"]);
const MODULES = opts("All Modules", [
  "Encounter",
  "Prescription",
  "Questionnaire",
  "Patient",
  "User",
  "Appointment",
  "Lab Results",
]);
const ACTIONS = opts("All Actions", ["Updated", "Unlocked", "Locked", "Created", "Deleted", "Viewed"]);

const ACTION_TONE: Record<string, TagTone> = {
  Updated: "success",
  Unlocked: "violet",
  Locked: "info",
  Created: "success",
  Deleted: "warning",
  Viewed: "success",
};

type Row = {
  date: string;
  time: string;
  user: string;
  role: string;
  action: string;
  module: string;
  details: string;
  ip: string;
};

const DOE = ["Dr. John Doe", "Practitioner"] as const;
const ADMIN = ["Admin User", "Administrator"] as const;
const MILLER = ["Sarah Miller", "Receptionist"] as const;
const CLARK = ["Rachel Clark", "Staff"] as const;

const a = (
  date: string,
  time: string,
  who: readonly [string, string],
  action: string,
  module: string,
  details: string,
  ip: string,
): Row => ({ date, time, user: who[0], role: who[1], action, module, details, ip });

const ROWS: Row[] = [
  a("Oct 18, 2026", "10:24 AM", DOE, "Updated", "Encounter", "Updated clinical notes for Encounter #ENC-1024", "192.168.1.10"),
  a("Oct 18, 2026", "09:15 AM", ADMIN, "Unlocked", "Encounter", "Unlocked chart for Encounter #ENC-1018", "192.168.1.5"),
  a("Oct 17, 2026", "04:32 PM", DOE, "Locked", "Encounter", "Locked chart after completing Encounter #ENC-1018", "192.168.1.10"),
  a("Oct 17, 2026", "01:20 PM", MILLER, "Created", "Prescription", "Created prescription for Patient John Smith", "192.168.1.25"),
  a("Oct 17, 2026", "11:10 AM", DOE, "Deleted", "Prescription", "Deleted prescription (Amoxicillin 500mg)", "192.168.1.10"),
  a("Oct 16, 2026", "03:45 PM", CLARK, "Created", "Questionnaire", 'Assigned questionnaire "General Health Assessment" to Patient #PT-1023', "192.168.1.18"),
  a("Oct 16, 2026", "02:12 PM", DOE, "Updated", "Patient", "Updated patient demographics for Jane Wilson", "192.168.1.10"),
  a("Oct 15, 2026", "05:30 PM", ADMIN, "Created", "User", "Created new user account for Dr. Emily Carter", "192.168.1.5"),
  a("Oct 15, 2026", "12:05 PM", MILLER, "Updated", "Appointment", "Rescheduled appointment for Patient #PT-1008", "192.168.1.25"),
  a("Oct 14, 2026", "10:18 AM", DOE, "Viewed", "Lab Results", "Viewed lab result for Patient #PT-1015", "192.168.1.10"),
];

const COLUMNS: TableColumn[] = [
  { key: "when", label: "Date & Time" },
  { key: "user", label: "User" },
  { key: "action", label: "Action" },
  { key: "module", label: "Module" },
  { key: "details", label: "Details" },
  { key: "ip", label: "IP Address" },
  { key: "menu", label: "", className: "w-10" },
];

/* ---------- Date range field (button + popover) ---------- */
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const fmt = (iso: string) => {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  return `${MONTHS[m - 1]} ${d}, ${y}`;
};

const DateRangeField = ({
  start,
  end,
  onChange,
}: {
  start: string;
  end: string;
  onChange: (start: string, end: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState({ start, end });
  const ref = useRef<HTMLDivElement>(null);

  /* click outside closes the popover */
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <div className="relative min-w-0" ref={ref}>
      <p className="mb-2 text-sm font-medium text-label">Date Range</p>
      <button
        type="button"
        onClick={() => {
          setDraft({ start, end });
          setOpen((o) => !o);
        }}
        aria-expanded={open}
        className={`flex h-12 w-full cursor-pointer items-center gap-2 rounded-xl border bg-card px-3.5 text-left text-sm text-heading transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${
          open ? "border-primary" : "border-border hover:border-primary/50"
        }`}
      >
        <Calendar className="h-4 w-4 shrink-0 text-body" />
        <span className="min-w-0 flex-1 truncate">
          {start || end ? `${fmt(start) || "Start"} - ${fmt(end) || "End"}` : "Select date range"}
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 text-body" />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-[120] mt-2 w-[min(320px,calc(100vw-2rem))] rounded-2xl border border-border bg-card p-4 shadow-2xl">
          <div className="space-y-3">
            <DatePicker
              name="auditFrom"
              label="From Date"
              placeholder="Select start date"
              value={draft.start}
              onChange={(v) => setDraft((p) => ({ ...p, start: v }))}
              align="left"
            />
            <DatePicker
              name="auditTo"
              label="To Date"
              placeholder="Select end date"
              value={draft.end}
              minDate={draft.start || undefined}
              onChange={(v) => setDraft((p) => ({ ...p, end: v }))}
              align="left"
            />
          </div>
          <div className="mt-3 flex items-center justify-end gap-2 border-t border-divider pt-3">
            <button
              type="button"
              onClick={() => {
                onChange("", "");
                setOpen(false);
              }}
              className="cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium text-body hover:bg-heading/5 hover:text-heading"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => {
                onChange(draft.start, draft.end);
                setOpen(false);
              }}
              className="cursor-pointer rounded-lg bg-primary px-3.5 py-1.5 text-xs font-medium text-on-primary shadow-xs transition-colors hover:bg-primary-hover"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/* ---------- Component ---------- */
const AuditHistory = () => {
  const [page, setPage] = useState(1);
  const [range, setRange] = useState({ start: "2026-10-01", end: "2026-10-31" });
  const [user, setUser] = useState("all");
  const [module, setModule] = useState("all");
  const [action, setAction] = useState("all");
  const [patient, setPatient] = useState("");
  const [encounter, setEncounter] = useState("");
  const [ip, setIp] = useState("");

  const clearFilters = () => {
    setRange({ start: "", end: "" });
    setUser("all");
    setModule("all");
    setAction("all");
    setPatient("");
    setEncounter("");
    setIp("");
  };

  const rows = ROWS.map((x) => ({
    when: <Content title={x.date} description={x.time} />,
    user: <Name name={x.user} sub={x.role} />,
    action: <Tags text={x.action} tone={ACTION_TONE[x.action] ?? "neutral"} />,
    module: <Content title={x.module} />,
    details: <Content title={x.details} />,
    ip: <Content title={x.ip} />,
    menu: <Actions actions={["more"]} />,
  }));

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Filters */}
      <div className="rounded-[14px] border border-border bg-card p-4 sm:p-5">
        <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 xl:grid-cols-5">
          <DateRangeField
            start={range.start}
            end={range.end}
            onChange={(start, end) => setRange({ start, end })}
          />
          <SignupDropdown
            name="auditUser"
            label="User"
            placeholder="All Users"
            options={USERS}
            value={user}
            onChange={setUser}
            searchable={false}
          />
          <SignupDropdown
            name="auditModule"
            label="Module"
            placeholder="All Modules"
            options={MODULES}
            value={module}
            onChange={setModule}
            searchable={false}
          />
          <SignupDropdown
            name="auditAction"
            label="Action"
            placeholder="All Actions"
            options={ACTIONS}
            value={action}
            onChange={setAction}
            searchable={false}
          />
          <SignupField
            name="auditPatient"
            label="Patient"
            placeholder="Search patient..."
            value={patient}
            onChange={(e) => setPatient(e.target.value)}
          />

          <SignupField
            name="auditEncounter"
            label="Encounter"
            placeholder="Search encounter..."
            value={encounter}
            onChange={(e) => setEncounter(e.target.value)}
          />
          <SignupField
            name="auditIp"
            label="IP Address"
            placeholder="Search IP address..."
            value={ip}
            onChange={(e) => setIp(e.target.value)}
          />

          <div className="flex items-center justify-center sm:justify-end gap-3 sm:col-span-2 xl:col-span-3 xl:items-end">
            <EditButton
            className="text-sm! justify-center items-center flex "
              section="Audit History Filters"
              label="Clear Filters"
              variant="viewAll"
              hideIcon
              onEdit={clearFilters}
            />
            <AddButton text="Apply Filters" icon={null} onClick={() => setPage(1)} className="whitespace-nowrap" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="space-y-3">
        <div className="overflow-hidden rounded-[14px] border border-border bg-card">
          <Table columns={COLUMNS} rows={rows} bordered={false} />
        </div>
        <Pagination
          page={page}
          totalPages={25}
          totalItems={248}
          pageSize={10}
          itemLabel="records"
          onChange={setPage}
        />
      </div>
    </div>
  );
};

export default AuditHistory;
