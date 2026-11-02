"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Activity, Plus } from "lucide-react";

import SearchAndFilter from "@/components/Searchandfilter";
import AddButton from "@/components/Addbutton";
import ImportButton from "@/components/ImportButton";
import Table from "@/components/Table";
import TableStatus from "@/components/TableStatus";
import { type TableColumn } from "@/components/Tableheader";
import Content from "@/components/Content";
import Tags, { type TagTone } from "@/components/Tags";
import LinkComponent from "@/components/LinkComponent";
import Actions from "@/components/Actions";
import Pagination from "@/components/Pagination";
import RadioCheckButtonh from "@/components/RadioCheckButtonh";
import { TableSelectAllCheckbox, useTableSelection } from "@/components/TableSelection";
import { cardCls } from "@/providers/Shared";

/* ---------------------------------------------------------------- */
/*  Routes (create a page.tsx for each of these in your app folder)  */
/* ---------------------------------------------------------------- */
export const VIEW_OBSERVATION_ROUTE = "/view-observation";
export const ADD_OBSERVATION_ROUTE = "/add-observation";
export const VIEW_PATIENT_ROUTE = "/view-fhir-patient";

/* ---------------------------------------------------------------- */
/*  Shared observation data (also used by Add / View / Details tabs) */
/* ---------------------------------------------------------------- */
export type ObsStatus = "Normal" | "High" | "Low";

export type ObservationMeta = {
  loinc: string;
  display: string;
  category: "Vital Signs" | "Laboratory";
  unit: string;
  range: string;
};

export const OBSERVATION_META: Record<string, ObservationMeta> = {
  "Blood Pressure": { loinc: "85354-9", display: "Blood pressure panel", category: "Vital Signs", unit: "mmHg", range: "90-120 / 60-80" },
  "Heart Rate": { loinc: "8867-4", display: "Heart rate", category: "Vital Signs", unit: "bpm", range: "60-100" },
  Temperature: { loinc: "8310-5", display: "Body temperature", category: "Vital Signs", unit: "°F", range: "97.8-99.1" },
  "Respiratory Rate": { loinc: "9279-1", display: "Respiratory rate", category: "Vital Signs", unit: "/min", range: "12-20" },
  SpO2: { loinc: "59408-5", display: "Oxygen saturation by pulse oximetry", category: "Vital Signs", unit: "%", range: "95-100" },
  "Hemoglobin (Hgb)": { loinc: "718-7", display: "Hemoglobin [Mass/volume] in Blood", category: "Laboratory", unit: "g/dL", range: "12.0-16.0" },
  HbA1c: { loinc: "4548-4", display: "Hemoglobin A1c", category: "Laboratory", unit: "%", range: "< 5.7" },
};

export type ObservationRow = {
  id: string;
  obsId: string;
  date: string;
  time: string;
  patient: string;
  patientCode: string;
  encounterId: string;
  observation: string;
  value: string;
  unit: string;
  status: ObsStatus;
};

const mk = (
  n: number,
  date: string,
  time: string,
  patient: string,
  encounterId: string,
  observation: string,
  value: string,
  status: ObsStatus,
): ObservationRow => ({
  id: String(n),
  obsId: `obs-2026-000${123 - n + 1}`,
  date,
  time,
  patient,
  patientCode: `PT-00${1244 + n}`,
  encounterId,
  observation,
  value,
  unit: OBSERVATION_META[observation]?.unit ?? "",
  status,
});

export const OBSERVATIONS: ObservationRow[] = [
  mk(1, "Oct 28, 2026", "10:15 AM", "John Smith", "ENC-2026-00156", "Blood Pressure", "118/76", "Normal"),
  mk(2, "Oct 28, 2026", "09:56 AM", "Emily Carter", "ENC-2026-00153", "Heart Rate", "72", "Normal"),
  mk(3, "Oct 27, 2026", "04:32 PM", "Robert Johnson", "ENC-2026-00154", "Temperature", "101.2", "High"),
  mk(4, "Oct 27, 2026", "11:15 AM", "Olivia Brown", "ENC-2026-00153", "Respiratory Rate", "16", "Normal"),
  mk(5, "Oct 27, 2026", "10:02 AM", "William Davis", "ENC-2026-00152", "SpO2", "98", "Normal"),
  mk(6, "Oct 26, 2026", "03:20 PM", "Sophia Miller", "ENC-2026-00151", "Hemoglobin (Hgb)", "13.5", "Normal"),
  mk(7, "Oct 26, 2026", "01:05 PM", "Michael Wilson", "ENC-2026-00150", "HbA1c", "6.8", "High"),
  mk(8, "Oct 26, 2026", "09:40 AM", "Isabella Moore", "ENC-2026-00149", "Heart Rate", "54", "Low"),
  mk(9, "Oct 25, 2026", "04:10 PM", "David Taylor", "ENC-2026-00148", "Blood Pressure", "132/86", "High"),
  mk(10, "Oct 25, 2026", "11:30 AM", "Laura Anderson", "ENC-2026-00147", "Temperature", "98.6", "Normal"),
  mk(11, "Oct 25, 2026", "10:00 AM", "James Martin", "ENC-2026-00146", "SpO2", "97", "Normal"),
];

export const OBS_STATUS_TONE: Record<ObsStatus, TagTone> = {
  Normal: "success",
  High: "danger",
  Low: "warning",
};

/* ---------------------------------------------------------------- */
/*  Filters                                                          */
/* ---------------------------------------------------------------- */
const CATEGORY_FILTER = "All Categories";
const STATUS_FILTER = "All Statuses";
const EMPTY_FILTERS: Record<string, string> = { [CATEGORY_FILTER]: "", [STATUS_FILTER]: "" };
const PAGE_SIZE = 10;

const checkboxCls =
  "h-4 w-4 cursor-pointer rounded border-border accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30";

/* ---------------------------------------------------------------- */
/*  Component (Observations tab of the patient record)               */
/* ---------------------------------------------------------------- */
const FhirObservations = () => {
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
      if (q && ![o.patient, o.patientCode, o.encounterId, o.observation].some((f) => f.toLowerCase().includes(q))) return false;
      if (filters[CATEGORY_FILTER] && OBSERVATION_META[o.observation]?.category !== filters[CATEGORY_FILTER]) return false;
      if (filters[STATUS_FILTER] && o.status !== filters[STATUS_FILTER]) return false;
      return true;
    });
  }, [search, filters]);

  const totalPages = Math.max(Math.ceil(filtered.length / PAGE_SIZE), 1);
  const safePage = Math.min(page, totalPages);
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

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
    { key: "encounter", label: "Encounter ID" },
    { key: "observation", label: "Observation" },
    { key: "value", label: "Value" },
    { key: "unit", label: "Unit" },
    { key: "status", label: "Status" },
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
    patient: <LinkComponent>{o.patient}</LinkComponent>,
    encounter: <LinkComponent>{o.encounterId}</LinkComponent>,
    observation: <Content title={o.observation} />,
    value: <Content title={o.value} />,
    unit: <Content title={o.unit} />,
    status: <Tags text={o.status} tone={OBS_STATUS_TONE[o.status]} size="xs" />,
    actions: (
      <div className="flex w-full items-center justify-center">
        <Actions
          actions={["view", "edit", "more"]}
          size="sm"
          onAction={(action) => {
            if (action === "view") router.push(`${VIEW_OBSERVATION_ROUTE}?id=${o.id}`);
            else if (action === "edit") router.push(`${ADD_OBSERVATION_ROUTE}?id=${o.id}`);
          }}
        />
      </div>
    ),
  }));

  return (
    <section className={`${cardCls} space-y-4`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Activity className="h-5 w-5" />
          </span>
          <div>
            <h3 className="text-base font-semibold text-heading">Observations</h3>
            <p className="text-xs text-body sm:text-sm">View and manage patient clinical observations.</p>
          </div>
        </div>
        <AddButton
          text="Add Observation"
          icon={<Plus className="h-4 w-4" />}
          onClick={() => router.push(ADD_OBSERVATION_ROUTE)}
          className="whitespace-nowrap"
        />
      </div>

      <SearchAndFilter
        placeholder="Search by patient name, ID..."
        value={search}
        onSearch={(v: string) => {
          setSearch(v);
          setPage(1);
        }}
        filters={[
          { label: CATEGORY_FILTER, options: ["Vital Signs", "Laboratory"] },
          { label: STATUS_FILTER, options: ["Normal", "High", "Low"] },
        ]}
        selectedFilters={filters}
        onFilterChange={(label: string, value: string) => {
          setFilters((prev) => ({ ...prev, [label]: value }));
          setPage(1);
        }}
        showDateRange
        trailingFilterAction={<ImportButton text="Reset" icon={null} onClick={reset} className="flex-none text-primary" />}
      />

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
  );
};

export default FhirObservations;