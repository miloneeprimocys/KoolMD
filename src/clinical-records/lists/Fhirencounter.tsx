"use client";

import React, { useMemo, useState } from "react";
import { CheckCircle2, FileText, Loader, Clock, XCircle } from "lucide-react";

import StatCards, { type StatItem } from "@/components/Statcards";
import SearchAndFilter from "@/components/Searchandfilter";
import ImportButton from "@/components/ImportButton";
import Table from "@/components/Table";
import TableStatus from "@/components/TableStatus";
import { type TableColumn } from "@/components/Tableheader";
import Content from "@/components/Content";
import Tags, { type TagTone } from "@/components/Tags";
import Name from "@/components/Name";
import LinkComponent from "@/components/LinkComponent";
import Actions from "@/components/Actions";
import Pagination from "@/components/Pagination";
import RadioCheckButtonh from "@/components/RadioCheckButtonh";
import { TableSelectAllCheckbox, useTableSelection } from "@/components/TableSelection";

/* ---------------------------------------------------------------- */
/*  Data (replace with API / redux selector)                         */
/* ---------------------------------------------------------------- */
type EncStatus = "Completed" | "In Progress" | "Scheduled" | "Cancelled" | "No Show";

type EncRow = {
  id: string;
  encounterId: string;
  patient: string;
  patientSub: string;
  type: string;
  date: string;
  time: string;
  practitioner: string;
  specialty: string;
  location: string;
  room: string;
  status: EncStatus;
};

const mk = (
  n: number,
  patient: string,
  patientSub: string,
  type: string,
  date: string,
  time: string,
  practitioner: string,
  specialty: string,
  location: string,
  room: string,
  status: EncStatus,
): EncRow => ({
  id: String(n),
  encounterId: `ENC-00${1246 + n}`,
  patient,
  patientSub,
  type,
  date,
  time,
  practitioner,
  specialty,
  location,
  room,
  status,
});

const ENCOUNTERS: EncRow[] = [
  mk(1, "John Smith", "MRN: PT-001245 (42 yrs)", "Office Visit", "Oct 10, 2026", "09:00 AM - 09:30 AM", "Dr. Sarah Wilson", "Internal Medicine", "Main Clinic", "Room 101", "Completed"),
  mk(2, "Emily Carter", "MRN: PT-001246 (36 yrs)", "New Patient Visit", "Oct 10, 2026", "10:00 AM - 10:30 AM", "Dr. Michael Johnson", "Cardiology", "Heart Care Center", "Room 203", "In Progress"),
  mk(3, "Robert Johnson", "MRN: PT-001247 (51 yrs)", "Follow Up", "Oct 10, 2026", "11:00 AM - 11:30 AM", "Dr. Emily Parker", "Pediatrics", "Children's Hospital", "Room 105", "Completed"),
  mk(4, "Olivia Brown", "MRN: PT-001248 (33 yrs)", "Consultation", "Oct 10, 2026", "01:00 PM - 01:30 PM", "Dr. Robert Williams", "Orthopedics", "Ortho Care", "Room 302", "Scheduled"),
  mk(5, "William Davis", "MRN: PT-001249 (58 yrs)", "Procedure", "Oct 10, 2026", "02:30 PM - 03:00 PM", "Dr. David Brown", "Dermatology", "Skin & Wellness", "Room 210", "Cancelled"),
  mk(6, "Sophia Miller", "MRN: PT-001250 (31 yrs)", "Follow Up", "Oct 11, 2026", "09:00 AM - 09:30 AM", "Dr. Laura Anderson", "Family Medicine", "Main Clinic", "Room 101", "Completed"),
  mk(7, "Michael Wilson", "MRN: PT-001251 (39 yrs)", "Annual Checkup", "Oct 11, 2026", "10:00 AM - 10:30 AM", "Dr. Richard Kim", "Neurology", "Neuro Center", "Room 120", "Completed"),
  mk(8, "Isabella Moore", "MRN: PT-001252 (26 yrs)", "Follow Up", "Oct 11, 2026", "11:30 AM - 12:00 PM", "Dr. Susan Davis", "Gynecology", "Women's Health", "Room 205", "No Show"),
  mk(9, "David Taylor", "MRN: PT-001253 (47 yrs)", "Consultation", "Oct 11, 2026", "01:00 PM - 01:30 PM", "Dr. Thomas Patel", "Ophthalmology", "Vision Care", "Room 110", "Completed"),
  mk(10, "Laura Anderson", "MRN: PT-001254 (35 yrs)", "Follow Up", "Oct 11, 2026", "02:00 PM - 02:30 PM", "Dr. Nancy Green", "Psychiatry", "Mind Health Center", "Room 310", "Scheduled"),
  mk(11, "James Martin", "MRN: PT-001255 (43 yrs)", "Office Visit", "Oct 12, 2026", "09:30 AM - 10:00 AM", "Dr. Sarah Wilson", "Internal Medicine", "Main Clinic", "Room 102", "Completed"),
];

const STATUS_TONES: Record<EncStatus, TagTone> = {
  Completed: "success",
  "In Progress": "warning",
  Scheduled: "neutral",
  Cancelled: "danger",
  "No Show": "warning",
};

const STATS: StatItem[] = [
  { label: "Total Encounters", value: "628", Icon: FileText, accent: "primary" },
  { label: "In Progress", value: "48", Icon: Loader, accent: "success" },
  { label: "Completed", value: "512", Icon: CheckCircle2, accent: "primary" },
  { label: "Cancelled", value: "46", Icon: XCircle, accent: "danger" },
  { label: "No Show", value: "22", Icon: Clock, accent: "warning" },
];

const STATUS_FILTER = "All Statuses";
const TYPE_FILTER = "All Types";
const PRACT_FILTER = "All Practitioners";
const LOC_FILTER = "All Locations";
const EMPTY_FILTERS: Record<string, string> = { [STATUS_FILTER]: "", [TYPE_FILTER]: "", [PRACT_FILTER]: "", [LOC_FILTER]: "" };
const uniq = (key: keyof EncRow) => Array.from(new Set(ENCOUNTERS.map((e) => e[key])));
const PAGE_SIZE = 10;

const checkboxCls =
  "h-4 w-4 cursor-pointer rounded border-border accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30";

/* ---------------------------------------------------------------- */
/*  Component                                                        */
/* ---------------------------------------------------------------- */
const FhirEncounter = () => {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);

  const reset = () => {
    setSearch("");
    setFilters(EMPTY_FILTERS);
    setPage(1);
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return ENCOUNTERS.filter((e) => {
      if (q && ![e.patient, e.patientSub, e.encounterId].some((f) => f.toLowerCase().includes(q))) return false;
      if (filters[STATUS_FILTER] && e.status !== filters[STATUS_FILTER]) return false;
      if (filters[TYPE_FILTER] && e.type !== filters[TYPE_FILTER]) return false;
      if (filters[PRACT_FILTER] && e.practitioner !== filters[PRACT_FILTER]) return false;
      if (filters[LOC_FILTER] && e.location !== filters[LOC_FILTER]) return false;
      return true;
    });
  }, [search, filters]);

  const totalPages = Math.max(Math.ceil(filtered.length / PAGE_SIZE), 1);
  const safePage = Math.min(page, totalPages);
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const from = filtered.length ? (safePage - 1) * PAGE_SIZE + 1 : 0;
  const to = filtered.length ? from + visible.length - 1 : 0;

  const { selectedKeys, allSelected, someSelected, toggleRow, toggleAll } = useTableSelection(visible.map((e) => e.id));

  const columns: TableColumn[] = [
    {
      key: "select",
      label: "",
      className: "w-10",
      header: <TableSelectAllCheckbox checked={allSelected} indeterminate={someSelected} onChange={toggleAll} className={checkboxCls} />,
    },
    { key: "encounterId", label: "Encounter ID" },
    { key: "patient", label: "Patient" },
    { key: "type", label: "Encounter Type" },
    { key: "dateTime", label: "Date & Time" },
    { key: "practitioner", label: "Practitioner" },
    { key: "location", label: "Location" },
    { key: "status", label: "Status" },
    { key: "actions", label: "Actions", header: <div className="flex w-full items-center justify-center">Actions</div> },
  ];

  const rows = visible.map((e) => ({
    select: (
      <RadioCheckButtonh
        type="checkbox"
        checked={selectedKeys.has(e.id)}
        onChange={() => toggleRow(e.id)}
        aria-label={`Select ${e.encounterId}`}
        className={checkboxCls}
      />
    ),
    encounterId: <LinkComponent>{e.encounterId}</LinkComponent>,
    patient: <Name name={e.patient} sub={e.patientSub} truncate />,
    type: <Content title={e.type} />,
    dateTime: <Content title={e.date} description={e.time} />,
    practitioner: <Name name={e.practitioner} sub={e.specialty} truncate />,
    location: <Content title={e.location} description={e.room} />,
    status: <Tags text={e.status} tone={STATUS_TONES[e.status]} size="xs" />,
    actions: (
      <div className="flex w-full items-center justify-center">
        <Actions actions={["more"]} size="sm" />
      </div>
    ),
  }));

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet/10 text-violet">
          <FileText className="h-5 w-5" />
        </span>
        <div>
          <h3 className="text-base font-semibold text-heading">Encounters</h3>
          <p className="text-xs text-body sm:text-sm">Manage clinical encounters, visits and related clinical information.</p>
        </div>
      </div>

      <StatCards stats={STATS} />

      <SearchAndFilter
        placeholder="Search by patient, MRN or encounter ID..."
        value={search}
        onSearch={(v: string) => {
          setSearch(v);
          setPage(1);
        }}
        filters={[
          { label: STATUS_FILTER, options: ["Completed", "In Progress", "Scheduled", "Cancelled", "No Show"] },
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
          <h3 className="text-base font-semibold text-heading">Encounters List</h3>
          <span className="text-xs text-body">
            {from}-{to} of {filtered.length.toLocaleString()}
          </span>
        </div>
        <div className="overflow-hidden rounded-[14px] border border-border bg-card">
          {visible.length === 0 ? (
            <TableStatus variant="empty" message="No encounters match your filters." />
          ) : (
            <Table columns={columns} rows={rows} bordered={false} />
          )}
        </div>
        {filtered.length > 0 && (
          <Pagination
            page={safePage}
            totalPages={totalPages}
            totalItems={filtered.length}
            pageSize={PAGE_SIZE}
            itemLabel="encounters"
            onChange={setPage}
          />
        )}
      </section>
    </div>
  );
};

export default FhirEncounter;