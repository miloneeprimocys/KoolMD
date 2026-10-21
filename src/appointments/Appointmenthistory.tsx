"use client";

import RadioCheckButtonh from "@/components/RadioCheckButtonh";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Download, MapPin, Video } from "lucide-react";

import SearchAndFilter from "@/components/Searchandfilter";
import SignupDropdown, { DropdownOption } from "@/components/SignupDropdown";
import Table from "@/components/Table";
import { type TableColumn } from "@/components/Tableheader";
import Name from "@/components/Name";
import Content from "@/components/Content";
import Tags from "@/components/Tags";
import Actions from "@/components/Actions";
import Pagination from "@/components/Pagination";
import ImportButton from "@/components/ImportButton";
import DateTime from "@/components/Datetime";
import { TableSelectAllCheckbox, useTableSelection } from "@/components/TableSelection";
import RightSection, { BASE_FILTERS, STATUS_TONE, checkboxCls } from "./Rightsection";

/* ---------- Static data ---------- */
const FILTERS = [
  ...BASE_FILTERS,
  { label: "All Statuses", options: ["Completed", "Cancelled", "No Show"] },
];

const SORT_OPTIONS: DropdownOption[] = [
  { value: "newest", label: "Date (Newest First)" },
  { value: "oldest", label: "Date (Oldest First)" },
];

type Row = {
  name: string;
  meta: string;
  type: string;
  reason: string;
  provider: string;
  specialty: string;
  place: string;
  city: string;
  date: string;
  time: string;
  status: string;
};

const SW: [string, string] = ["Dr. Sarah Wilson", "Internal Medicine"];
const MC: [string, string] = ["Dr. Michael Chen", "Cardiology"];
const EC: [string, string] = ["Dr. Emily Carter", "Dermatology"];
const JM: [string, string] = ["Dr. James Miller", "Pediatrics"];
const SUNRISE: [string, string] = ["Sunrise Medical Group", "Los Angeles, CA"];
const DOWNTOWN: [string, string] = ["Downtown Clinic", "New York, NY"];
const VIRTUAL: [string, string] = ["Virtual Visit", "Telemedicine"];

const r = (
  name: string,
  meta: string,
  type: string,
  reason: string,
  provider: string,
  specialty: string,
  place: string,
  city: string,
  date: string,
  time: string,
  status: string,
): Row => ({ name, meta, type, reason, provider, specialty, place, city, date, time, status });

const ROWS: Row[] = [
  r("Olivia Bennett", "PID-10234 • 36Y • F", "Follow Up", "Routine checkup", ...SW, ...SUNRISE, "Oct 12, 2026", "09:00 AM (30 min)", "Completed"),
  r("Liam Carter", "PID-10456 • 29Y • M", "Initial Consultation", "New patient visit", ...MC, ...SUNRISE, "Oct 12, 2026", "10:30 AM (30 min)", "Completed"),
  r("Sophia Martinez", "PID-10789 • 42Y • F", "Consultation", "Skin treatment", ...EC, ...DOWNTOWN, "Oct 11, 2026", "02:00 PM (45 min)", "Completed"),
  r("Noah Wilson", "PID-10987 • 18Y • M", "Physical Exam", "Annual checkup", ...JM, ...SUNRISE, "Oct 10, 2026", "03:00 PM (30 min)", "Cancelled"),
  r("Emma Davis", "PID-11022 • 34Y • F", "Lab Results Review", "Follow up", ...SW, ...VIRTUAL, "Oct 09, 2026", "01:00 PM (30 min)", "Completed"),
  r("Ava Taylor", "PID-11234 • 27Y • F", "Consultation", "Back pain", ...MC, ...SUNRISE, "Oct 08, 2026", "11:30 AM (30 min)", "No Show"),
  r("Lucas Anderson", "PID-11567 • 50Y • M", "Follow Up", "Medication review", ...EC, ...VIRTUAL, "Oct 07, 2026", "12:00 PM (30 min)", "Completed"),
  r("Isabella Garcia", "PID-11890 • 31Y • F", "Initial Consultation", "Acne treatment", ...JM, ...DOWNTOWN, "Oct 06, 2026", "09:00 AM (45 min)", "Completed"),
  r("Mason Lee", "PID-12011 • 45Y • M", "Procedure", "Mole removal", ...SW, ...SUNRISE, "Oct 05, 2026", "11:30 AM (60 min)", "Completed"),
  r("Charlotte White", "PID-12234 • 8Y • F", "Well Child Visit", "Annual checkup", ...JM, ...SUNRISE, "Oct 03, 2026", "10:00 AM (30 min)", "Completed"),
];

const COLUMNS: TableColumn[] = [
  {
    key: "select",
    label: "",
    className: "w-10",
    header: null,
  },
  { key: "patient", label: "Patient" },
  { key: "details", label: "Appointment Details" },
  { key: "provider", label: "Provider" },
  { key: "location", label: "Location" },
  { key: "datetime", label: "Date & Time" },
  { key: "status", label: "Status" },
  {
    key: "actions",
    label: "Actions",
    header: <div className="flex w-full items-center justify-center">Actions</div>,
  },
];

/* ---------- Component ---------- */
const AppointmentHistory = () => {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("newest");
  const [showPanel, setShowPanel] = useState(false);
  const rowKeys = ROWS.map((row, index) => `${row.name}-${row.date}-${row.time}-${index}`);
  const { selectedKeys, allSelected, someSelected, toggleRow, toggleAll } =
    useTableSelection(rowKeys);
  const columns = COLUMNS.map((column) =>
    column.key === "select"
      ? {
          ...column,
          header: (
            <TableSelectAllCheckbox
              checked={allSelected}
              indeterminate={someSelected}
              onChange={toggleAll}
              className={checkboxCls}
            />
          ),
        }
      : column,
  );

  const rows = ROWS.map((x, index) => {
    const rowKey = rowKeys[index];
    const Icon = x.place === "Virtual Visit" ? Video : MapPin;
    return {
      select: (
        <RadioCheckButtonh
          type="checkbox"
          checked={selectedKeys.has(rowKey)}
          onChange={() => toggleRow(rowKey)}
          aria-label={`Select ${x.name}`}
          className={checkboxCls}
        />
      ),
      patient: (
        <button type="button" onClick={() => setShowPanel(true)} className="w-full min-w-0 cursor-pointer text-left">
          <Name name={x.name} sub={x.meta} truncate />
        </button>
      ),
      details: <Content title={x.type} description={x.reason} truncate />,
      provider: <Name name={x.provider} sub={x.specialty} truncate />,
      location: (
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 shrink-0 text-primary" />
          <Content title={x.place} description={x.city} truncate />
        </div>
      ),
      datetime: <DateTime date={x.date} time={x.time} truncate />,
      status: <Tags text={x.status} tone={STATUS_TONE[x.status] ?? "neutral"} />,
      actions: (
        <div className="flex w-full items-center justify-center">
          <Actions
            onAction={(action) => {
              if (action === "view") {
                setShowPanel((open) => !open);
              } else {
                setShowPanel(true);
              }
            }}
          />
        </div>
      ),
    };
  });

  return (
    <div className="space-y-4">
      {/* Search + filters + export */}
      <div className="flex flex-col gap-3 xl:flex-row xl:items-start 2xl:items-center">
        <div className="min-w-0 flex-1">
          <SearchAndFilter
            placeholder="Search by patient name, provider name, or ID..."
            filters={FILTERS}
            onSearch={() => {}}
            onFilterChange={() => {}}
          />
        </div>
        <div className="shrink-0">
          <ImportButton text="Export" icon={<Download className="h-4 w-4" />} onClick={() => {}} />
        </div>
      </div>

      <div className="flex flex-col gap-4 xl:flex-row xl:items-start">
        <div className="min-w-0 flex-1 space-y-4">
          {/* Total + sort */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-body sm:text-sm">Total 256 appointments</p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-body sm:text-sm">Sort by</span>
              <SignupDropdown
                className="!w-[190px]"
                name="historySort"
                options={SORT_OPTIONS}
                value={sort}
                onChange={setSort}
              />
            </div>
          </div>

          {/* Table */}
          <div className="min-w-0 space-y-3">
            <div className="w-full min-w-0 overflow-hidden rounded-[14px] border border-border bg-card">
              <Table columns={columns} rows={rows} bordered={false} />
            </div>
            <Pagination
              page={page}
              totalPages={26}
              totalItems={256}
              pageSize={10}
              itemLabel="appointments"
              onChange={setPage}
            />
          </div>
        </div>

        {/* Right section */}
        {showPanel && (
          <RightSection
            variant="history"
            onClose={() => setShowPanel(false)}
            onBookAppointment={() => router.push("/book-appointment")}
          />
        )}
      </div>
    </div>
  );
};

export default AppointmentHistory;
