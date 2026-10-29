"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Activity, AlertTriangle, CheckCircle2, Clock, FileText } from "lucide-react";

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
type ObsStatus = "Normal" | "High" | "Low";

type ObsRow = {
  id: string;
  date: string;
  time: string;
  patient: string;
  mrn: string;
  category: string;
  observation: string;
  value: string;
  unit: string;
  range: string;
  status: ObsStatus;
  encounter: string;
};

const mk = (
  n: number,
  date: string,
  time: string,
  patient: string,
  category: string,
  observation: string,
  value: string,
  unit: string,
  range: string,
  status: ObsStatus,
): ObsRow => ({
  id: String(n),
  date,
  time,
  patient,
  mrn: `MRN: PT-00${1244 + n}`,
  category,
  observation,
  value,
  unit,
  range,
  status,
  encounter: `ENC-00${1246 + n}`,
});

const OBSERVATIONS: ObsRow[] = [
  mk(1, "Oct 10, 2026", "09:15 AM", "John Smith", "Vital Signs", "Blood Pressure", "128/82", "mmHg", "90/60 - 120/80", "High"),
  mk(2, "Oct 10, 2026", "09:20 AM", "Emily Carter", "Laboratory", "Hemoglobin (Hgb)", "13.5", "g/dL", "12.0 - 16.0", "Normal"),
  mk(3, "Oct 10, 2026", "09:25 AM", "Robert Johnson", "Laboratory", "WBC Count", "11.2", "10^3/µL", "4.0 - 10.0", "High"),
  mk(4, "Oct 10, 2026", "09:30 AM", "Olivia Brown", "Vital Signs", "Heart Rate", "72", "bpm", "60 - 100", "Normal"),
  mk(5, "Oct 10, 2026", "09:35 AM", "William Davis", "Laboratory", "HbA1c", "6.8", "%", "< 5.7", "High"),
  mk(6, "Oct 11, 2026", "10:00 AM", "Sophia Miller", "Vital Signs", "Temperature", "99.1", "°F", "97.0 - 99.0", "High"),
  mk(7, "Oct 11, 2026", "11:00 AM", "Michael Wilson", "Laboratory", "Creatinine", "0.9", "mg/dL", "0.6 - 1.3", "Normal"),
  mk(8, "Oct 11, 2026", "11:30 AM", "Isabella Moore", "Laboratory", "Glucose (Fasting)", "142", "mg/dL", "70 - 99", "High"),
  mk(9, "Oct 11, 2026", "01:15 PM", "David Taylor", "Laboratory", "Cholesterol, Total", "182", "mg/dL", "< 200", "Normal"),
  mk(10, "Oct 11, 2026", "02:10 PM", "Laura Anderson", "Laboratory", "Vitamin D", "22", "ng/mL", "30 - 100", "Low"),
  mk(11, "Oct 12, 2026", "09:40 AM", "James Martin", "Vital Signs", "Oxygen Saturation", "98", "%", "95 - 100", "Normal"),
];

const STATUS_TONES: Record<ObsStatus, TagTone> = {
  Normal: "success",
  High: "danger",
  Low: "warning",
};

const STATS: StatItem[] = [
  { label: "Total Observations", value: "2,856", Icon: FileText, accent: "primary" },
  { label: "Normal", value: "1,980", Icon: CheckCircle2, accent: "success" },
  { label: "Abnormal", value: "612", Icon: AlertTriangle, accent: "danger" },
  { label: "Pending Review", value: "264", Icon: Clock, accent: "warning" },
];

const CATEGORY_FILTER = "All Categories";
const STATUS_FILTER = "All Statuses";
const ENC_FILTER = "All Encounters";
const EMPTY_FILTERS: Record<string, string> = { [CATEGORY_FILTER]: "", [STATUS_FILTER]: "", [ENC_FILTER]: "" };
const CATEGORY_OPTIONS = Array.from(new Set(OBSERVATIONS.map((o) => o.category)));
const ENC_OPTIONS = OBSERVATIONS.map((o) => o.encounter);
const PAGE_SIZE = 10;

const checkboxCls =
  "h-4 w-4 cursor-pointer rounded border-border accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30";

/* ---------------------------------------------------------------- */
/*  Component                                                        */
/* ---------------------------------------------------------------- */
const FhirObservation = () => {
  const router = useRouter();
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
    return OBSERVATIONS.filter((o) => {
      if (q && ![o.patient, o.mrn, o.observation].some((f) => f.toLowerCase().includes(q))) return false;
      if (filters[CATEGORY_FILTER] && o.category !== filters[CATEGORY_FILTER]) return false;
      if (filters[STATUS_FILTER] && o.status !== filters[STATUS_FILTER]) return false;
      if (filters[ENC_FILTER] && o.encounter !== filters[ENC_FILTER]) return false;
      return true;
    });
  }, [search, filters]);

  const totalPages = Math.max(Math.ceil(filtered.length / PAGE_SIZE), 1);
  const safePage = Math.min(page, totalPages);
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const from = filtered.length ? (safePage - 1) * PAGE_SIZE + 1 : 0;
  const to = filtered.length ? from + visible.length - 1 : 0;

  const { selectedKeys, allSelected, someSelected, toggleRow, toggleAll } = useTableSelection(visible.map((o) => o.id));

  const columns: TableColumn[] = [
    {
      key: "select",
      label: "",
      className: "w-10",
      header: <TableSelectAllCheckbox checked={allSelected} indeterminate={someSelected} onChange={toggleAll} className={checkboxCls} />,
    },
    { key: "dateTime", label: "Date & Time" },
    { key: "patient", label: "Patient" },
    { key: "category", label: "Category" },
    { key: "observation", label: "Observation" },
    { key: "value", label: "Value" },
    { key: "unit", label: "Unit" },
    { key: "range", label: "Reference Range" },
    { key: "status", label: "Status" },
    { key: "encounter", label: "Encounter" },
    { key: "actions", label: "Actions", header: <div className="flex w-full items-center justify-center">Actions</div> },
  ];

  const rows = visible.map((o) => ({
    select: (
      <RadioCheckButtonh
        type="checkbox"
        checked={selectedKeys.has(o.id)}
        onChange={() => toggleRow(o.id)}
        aria-label={`Select ${o.observation} for ${o.patient}`}
        className={checkboxCls}
      />
    ),
    dateTime: <Content title={o.date} description={o.time} />,
    patient: <Name name={o.patient} sub={o.mrn} truncate />,
    category: <Content title={o.category} />,
    observation: <Content title={o.observation} />,
    value: <Content title={o.value} />,
    unit: <Content title={o.unit} />,
    range: <Content title={o.range} />,
    status: <Tags text={o.status} tone={STATUS_TONES[o.status]} size="xs" />,
    encounter: <LinkComponent>{o.encounter}</LinkComponent>,
    actions: (
      <div className="flex w-full items-center justify-center">
        <Actions
          actions={["edit", "view"]}
          size="sm"
          onAction={(action) => {
            if (action === "edit") router.push(`/add-observation?id=${o.id}`);
          }}
        />
      </div>
    ),
  }));

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Activity className="h-5 w-5" />
        </span>
        <div>
          <h3 className="text-base font-semibold text-heading">Observations</h3>
          <p className="text-xs text-body sm:text-sm">
            Manage patient measurements, lab results, vital signs and other clinical observations.
          </p>
        </div>
      </div>

      <StatCards stats={STATS} />

      <SearchAndFilter
        placeholder="Search by patient, test name, LOINC code..."
        value={search}
        onSearch={(v: string) => {
          setSearch(v);
          setPage(1);
        }}
        filters={[
          { label: CATEGORY_FILTER, options: CATEGORY_OPTIONS },
          { label: STATUS_FILTER, options: ["Normal", "High", "Low"] },
          { label: ENC_FILTER, options: ENC_OPTIONS },
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
          <h3 className="text-base font-semibold text-heading">Observations List</h3>
          <span className="text-xs text-body">
            {from}-{to} of {filtered.length.toLocaleString()}
          </span>
        </div>
        <div className="overflow-hidden rounded-[14px] border border-border bg-card">
          {visible.length === 0 ? (
            <TableStatus variant="empty" message="No observations match your filters." />
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
            itemLabel="observations"
            onChange={setPage}
          />
        )}
      </section>
    </div>
  );
};

export default FhirObservation;