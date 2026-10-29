"use client";

import React, { useMemo, useState } from "react";
import { Calendar, CalendarCheck, CalendarX, CheckCircle2, Clock, List, UserX } from "lucide-react";

import StatCards, { type StatItem } from "@/components/Statcards";
import SearchAndFilter from "@/components/Searchandfilter";
import ImportButton from "@/components/ImportButton";
import Table from "@/components/Table";
import TableStatus from "@/components/TableStatus";
import { type TableColumn } from "@/components/Tableheader";
import Content from "@/components/Content";
import Tags, { type TagTone } from "@/components/Tags";
import Name from "@/components/Name";
import Actions from "@/components/Actions";
import Pagination from "@/components/Pagination";
import RadioCheckButtonh from "@/components/RadioCheckButtonh";
import { TableSelectAllCheckbox, useTableSelection } from "@/components/TableSelection";

/* ---------------------------------------------------------------- */
/*  Data (replace with API / redux selector)                         */
/* ---------------------------------------------------------------- */
type ApptStatus = "Scheduled" | "Completed" | "Cancelled" | "No Show";

type ApptRow = {
  id: string;
  date: string;
  time: string;
  patient: string;
  patientSub: string;
  type: string;
  practitioner: string;
  specialty: string;
  location: string;
  room: string;
  status: ApptStatus;
};

const mk = (
  id: string,
  date: string,
  time: string,
  patient: string,
  patientSub: string,
  type: string,
  practitioner: string,
  specialty: string,
  location: string,
  room: string,
  status: ApptStatus,
): ApptRow => ({ id, date, time, patient, patientSub, type, practitioner, specialty, location, room, status });

const APPOINTMENTS: ApptRow[] = [
  mk("1", "Oct 10, 2026", "09:00 AM - 09:30 AM", "John Smith", "MRN: PT-001245 (42 yrs)", "Follow Up", "Dr. Sarah Wilson", "Internal Medicine", "Main Clinic", "Room 101", "Scheduled"),
  mk("2", "Oct 10, 2026", "10:00 AM - 10:30 AM", "Emily Carter", "MRN: PT-001246 (36 yrs)", "New Patient", "Dr. Michael Johnson", "Cardiology", "Heart Care Center", "Room 203", "Scheduled"),
  mk("3", "Oct 10, 2026", "11:00 AM - 11:30 AM", "Robert Johnson", "MRN: PT-001247 (51 yrs)", "Follow Up", "Dr. Emily Parker", "Pediatrics", "Children's Hospital", "Room 105", "Completed"),
  mk("4", "Oct 10, 2026", "01:00 PM - 01:30 PM", "Olivia Brown", "MRN: PT-001248 (33 yrs)", "Consultation", "Dr. Robert Williams", "Orthopedics", "Ortho Care", "Room 302", "Scheduled"),
  mk("5", "Oct 10, 2026", "02:30 PM - 03:00 PM", "William Davis", "MRN: PT-001249 (58 yrs)", "Procedure", "Dr. David Brown", "Dermatology", "Skin & Wellness", "Room 210", "Cancelled"),
  mk("6", "Oct 11, 2026", "09:00 AM - 09:30 AM", "Sophia Miller", "MRN: PT-001250 (31 yrs)", "Follow Up", "Dr. Laura Anderson", "Family Medicine", "Main Clinic", "Room 101", "Scheduled"),
  mk("7", "Oct 11, 2026", "10:00 AM - 10:30 AM", "Michael Wilson", "MRN: PT-001251 (39 yrs)", "Annual Checkup", "Dr. Richard Kim", "Neurology", "Neuro Center", "Room 120", "No Show"),
  mk("8", "Oct 11, 2026", "11:00 AM - 12:00 PM", "Isabella Moore", "MRN: PT-001252 (26 yrs)", "Follow Up", "Dr. Susan Davis", "Gynecology", "Women's Health", "Room 205", "Scheduled"),
  mk("9", "Oct 11, 2026", "01:00 PM - 01:30 PM", "David Taylor", "MRN: PT-001253 (47 yrs)", "Consultation", "Dr. Thomas Patel", "Ophthalmology", "Vision Care", "Room 110", "Completed"),
  mk("10", "Oct 11, 2026", "02:00 PM - 02:30 PM", "Laura Anderson", "MRN: PT-001254 (35 yrs)", "Follow Up", "Dr. Nancy Green", "Psychiatry", "Mind Health Center", "Room 310", "Scheduled"),
  mk("11", "Oct 12, 2026", "09:30 AM - 10:00 AM", "James Martin", "MRN: PT-001255 (43 yrs)", "Follow Up", "Dr. Sarah Wilson", "Internal Medicine", "Main Clinic", "Room 102", "Scheduled"),
];

const STATUS_TONES: Record<ApptStatus, TagTone> = {
  Scheduled: "neutral",
  Completed: "success",
  Cancelled: "danger",
  "No Show": "warning",
};

const STATS: StatItem[] = [
  { label: "Total Appointments", value: "343", Icon: Calendar, accent: "primary" },
  { label: "Scheduled", value: "256", Icon: CalendarCheck, accent: "success" },
  { label: "Completed", value: "62", Icon: CheckCircle2, accent: "primary" },
  { label: "Cancelled", value: "18", Icon: CalendarX, accent: "danger" },
  { label: "No Show", value: "7", Icon: UserX, accent: "warning" },
];

const STATUS_FILTER = "All Statuses";
const TYPE_FILTER = "All Types";
const PRACT_FILTER = "All Practitioners";
const LOC_FILTER = "All Locations";
const EMPTY_FILTERS: Record<string, string> = { [STATUS_FILTER]: "", [TYPE_FILTER]: "", [PRACT_FILTER]: "", [LOC_FILTER]: "" };
const uniq = (key: keyof ApptRow) => Array.from(new Set(APPOINTMENTS.map((a) => a[key])));
const PAGE_SIZE = 10;

type View = "list" | "calendar" | "today";
const VIEWS: { key: View; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "list", label: "List View", icon: List },
  { key: "calendar", label: "Calendar View", icon: Calendar },
  { key: "today", label: "Today's Appointments", icon: Clock },
];

const todayLabel = () =>
  new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const checkboxCls =
  "h-4 w-4 cursor-pointer rounded border-border accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30";

/* ---------------------------------------------------------------- */
/*  Component                                                        */
/* ---------------------------------------------------------------- */
const FhirAppointment = () => {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [view, setView] = useState<View>("list");

  const reset = () => {
    setSearch("");
    setFilters(EMPTY_FILTERS);
    setPage(1);
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return APPOINTMENTS.filter((a) => {
      if (view === "today" && a.date !== todayLabel()) return false;
      if (q && ![a.patient, a.patientSub, a.practitioner].some((f) => f.toLowerCase().includes(q))) return false;
      if (filters[STATUS_FILTER] && a.status !== filters[STATUS_FILTER]) return false;
      if (filters[TYPE_FILTER] && a.type !== filters[TYPE_FILTER]) return false;
      if (filters[PRACT_FILTER] && a.practitioner !== filters[PRACT_FILTER]) return false;
      if (filters[LOC_FILTER] && a.location !== filters[LOC_FILTER]) return false;
      return true;
    });
  }, [search, filters, view]);

  const totalPages = Math.max(Math.ceil(filtered.length / PAGE_SIZE), 1);
  const safePage = Math.min(page, totalPages);
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const from = filtered.length ? (safePage - 1) * PAGE_SIZE + 1 : 0;
  const to = filtered.length ? from + visible.length - 1 : 0;

  const { selectedKeys, allSelected, someSelected, toggleRow, toggleAll } = useTableSelection(visible.map((a) => a.id));

  const columns: TableColumn[] = [
    {
      key: "select",
      label: "",
      className: "w-10",
      header: <TableSelectAllCheckbox checked={allSelected} indeterminate={someSelected} onChange={toggleAll} className={checkboxCls} />,
    },
    { key: "dateTime", label: "Date & Time" },
    { key: "patient", label: "Patient" },
    { key: "type", label: "Appointment Type" },
    { key: "practitioner", label: "Practitioner" },
    { key: "location", label: "Location" },
    { key: "status", label: "Status" },
    { key: "actions", label: "Actions", header: <div className="flex w-full items-center justify-center">Actions</div> },
  ];

  const rows = visible.map((a) => ({
    select: (
      <RadioCheckButtonh
        type="checkbox"
        checked={selectedKeys.has(a.id)}
        onChange={() => toggleRow(a.id)}
        aria-label={`Select appointment for ${a.patient}`}
        className={checkboxCls}
      />
    ),
    dateTime: <Content title={a.date} description={a.time} />,
    patient: <Name name={a.patient} sub={a.patientSub} truncate />,
    type: <Content title={a.type} />,
    practitioner: <Name name={a.practitioner} sub={a.specialty} truncate />,
    location: <Content title={a.location} description={a.room} />,
    status: <Tags text={a.status} tone={STATUS_TONES[a.status]} size="xs" />,
    actions: (
      <div className="flex w-full items-center justify-center">
        <Actions actions={["more"]} size="sm" />
      </div>
    ),
  }));

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Calendar className="h-5 w-5" />
          </span>
          <div>
            <h3 className="text-base font-semibold text-heading">Appointments</h3>
            <p className="text-xs text-body sm:text-sm">Manage patient appointments and scheduling information.</p>
          </div>
        </div>

        {/* View switcher */}
        <div className="flex flex-wrap gap-2">
          {VIEWS.map((v) => {
            const Icon = v.icon;
            const on = view === v.key;
            return (
              <button
                key={v.key}
                type="button"
                onClick={() => {
                  setView(v.key);
                  setPage(1);
                }}
                aria-pressed={on}
                className={`flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg border px-3 py-2 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 sm:text-sm ${
                  on ? "border-primary/40 bg-primary/10 text-primary" : "border-border bg-card text-heading hover:bg-primary/5"
                }`}
              >
                <Icon className="h-4 w-4" />
                {v.label}
              </button>
            );
          })}
        </div>
      </div>

      <StatCards stats={STATS} />

      <SearchAndFilter
        placeholder="Search by patient, MRN, practitioner..."
        value={search}
        onSearch={(v: string) => {
          setSearch(v);
          setPage(1);
        }}
        filters={[
          { label: STATUS_FILTER, options: ["Scheduled", "Completed", "Cancelled", "No Show"] },
          { label: TYPE_FILTER, options: uniq("type") as string[] },
          { label: PRACT_FILTER, options: uniq("practitioner") as string[] },
          { label: LOC_FILTER, options: uniq("location") as string[] },
        ]}
        selectedFilters={filters}
        onFilterChange={(label: string, value: string) => {
          setFilters((prev) => ({ ...prev, [label]: value }));
          setPage(1);
        }}
        showDateRange
        trailingFilterAction={<ImportButton text="Reset" icon={null} onClick={reset} className="flex-none text-primary" />}
      />

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-base font-semibold text-heading">Appointments List</h3>
          <span className="text-xs text-body">
            {from}-{to} of {filtered.length.toLocaleString()}
          </span>
        </div>
        <div className="overflow-hidden rounded-[14px] border border-border bg-card">
          {view === "calendar" ? (
            <TableStatus variant="empty" message="Calendar view is coming soon." />
          ) : visible.length === 0 ? (
            <TableStatus variant="empty" message="No appointments match your filters." />
          ) : (
            <Table columns={columns} rows={rows} bordered={false} />
          )}
        </div>
        {view !== "calendar" && filtered.length > 0 && (
          <Pagination
            page={safePage}
            totalPages={totalPages}
            totalItems={filtered.length}
            pageSize={PAGE_SIZE}
            itemLabel="appointments"
            onChange={setPage}
          />
        )}
      </section>
    </div>
  );
};

export default FhirAppointment;