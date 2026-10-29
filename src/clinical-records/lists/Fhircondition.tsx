"use client";

import React, { useMemo, useState } from "react";
import { CheckCircle2, FileText, HelpCircle, Heart, RotateCcw } from "lucide-react";

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
type ClinicalStatus = "Active" | "Resolved";

type ConditionRow = {
  id: string;
  patient: string;
  mrn: string;
  condition: string;
  code: string;
  system: string;
  category: string;
  onset: string;
  status: ClinicalStatus;
  recordedBy: string;
  encounter: string;
};

const mk = (
  n: number,
  patient: string,
  age: string,
  condition: string,
  code: string,
  system: string,
  category: string,
  onset: string,
  status: ClinicalStatus,
  recordedBy: string,
): ConditionRow => ({
  id: String(n),
  patient,
  mrn: `MRN: PT-00${1244 + n} (${age} yrs)`,
  condition,
  code,
  system,
  category,
  onset,
  status,
  recordedBy,
  encounter: `ENC-00${1246 + n}`,
});

const CONDITIONS: ConditionRow[] = [
  mk(1, "John Smith", "42", "Type 2 Diabetes Mellitus", "44054006", "SNOMED CT", "Endocrine", "Jan 15, 2022", "Active", "Dr. Sarah Wilson"),
  mk(2, "Emily Carter", "36", "Hypertension", "38341003", "SNOMED CT", "Cardiovascular", "Mar 10, 2021", "Active", "Dr. Michael Johnson"),
  mk(3, "Robert Johnson", "51", "Asthma", "195967001", "SNOMED CT", "Respiratory", "Jun 5, 2019", "Active", "Dr. Emily Parker"),
  mk(4, "Olivia Brown", "33", "Hyperlipidemia", "55822004", "SNOMED CT", "Cardiovascular", "Feb 20, 2023", "Active", "Dr. Robert Williams"),
  mk(5, "William Davis", "58", "Osteoarthritis", "22986200", "SNOMED CT", "Musculoskeletal", "Apr 12, 2020", "Active", "Dr. David Brown"),
  mk(6, "Sophia Miller", "31", "Migraine", "37796009", "SNOMED CT", "Neurological", "Jan 8, 2024", "Active", "Dr. Laura Anderson"),
  mk(7, "Michael Wilson", "39", "Depression", "35489007", "SNOMED CT", "Behavioral Health", "Sep 14, 2022", "Active", "Dr. Richard Kim"),
  mk(8, "Isabella Moore", "26", "Anxiety Disorder", "46694002", "SNOMED CT", "Behavioral Health", "Mar 2, 2023", "Active", "Dr. Susan Davis"),
  mk(9, "David Taylor", "47", "Chronic Kidney Disease", "709044004", "SNOMED CT", "Renal", "Dec 10, 2021", "Resolved", "Dr. Thomas Patel"),
  mk(10, "Laura Anderson", "35", "Hypothyroidism", "40930008", "SNOMED CT", "Endocrine", "May 18, 2020", "Active", "Dr. Nancy Green"),
  mk(11, "James Martin", "43", "Sleep Apnea", "73430006", "SNOMED CT", "Respiratory", "Jul 3, 2022", "Active", "Dr. Sarah Wilson"),
];

const STATUS_TONES: Record<ClinicalStatus, TagTone> = {
  Active: "success",
  Resolved: "neutral",
};

const STATS: StatItem[] = [
  { label: "Total Conditions", value: "1,024", Icon: FileText, accent: "primary" },
  { label: "Active Conditions", value: "728", Icon: CheckCircle2, accent: "success" },
  { label: "Resolved Conditions", value: "216", Icon: RotateCcw, accent: "danger" },
  { label: "Unknown Status", value: "80", Icon: HelpCircle, accent: "warning" },
];

const STATUS_FILTER = "All Statuses";
const CATEGORY_FILTER = "All Categories";
const ENC_FILTER = "All Encounters";
const EMPTY_FILTERS: Record<string, string> = { [STATUS_FILTER]: "", [CATEGORY_FILTER]: "", [ENC_FILTER]: "" };
const CATEGORY_OPTIONS = Array.from(new Set(CONDITIONS.map((c) => c.category)));
const ENC_OPTIONS = CONDITIONS.map((c) => c.encounter);
const PAGE_SIZE = 10;

const checkboxCls =
  "h-4 w-4 cursor-pointer rounded border-border accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30";

/* ---------------------------------------------------------------- */
/*  Component                                                        */
/* ---------------------------------------------------------------- */
const FhirCondition = () => {
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
    return CONDITIONS.filter((c) => {
      if (q && ![c.patient, c.mrn, c.condition, c.code].some((f) => f.toLowerCase().includes(q))) return false;
      if (filters[STATUS_FILTER] && c.status !== filters[STATUS_FILTER]) return false;
      if (filters[CATEGORY_FILTER] && c.category !== filters[CATEGORY_FILTER]) return false;
      if (filters[ENC_FILTER] && c.encounter !== filters[ENC_FILTER]) return false;
      return true;
    });
  }, [search, filters]);

  const totalPages = Math.max(Math.ceil(filtered.length / PAGE_SIZE), 1);
  const safePage = Math.min(page, totalPages);
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const from = filtered.length ? (safePage - 1) * PAGE_SIZE + 1 : 0;
  const to = filtered.length ? from + visible.length - 1 : 0;

  const { selectedKeys, allSelected, someSelected, toggleRow, toggleAll } = useTableSelection(visible.map((c) => c.id));

  const columns: TableColumn[] = [
    {
      key: "select",
      label: "",
      className: "w-10",
      header: <TableSelectAllCheckbox checked={allSelected} indeterminate={someSelected} onChange={toggleAll} className={checkboxCls} />,
    },
    { key: "patient", label: "Patient" },
    { key: "condition", label: "Condition / Diagnosis" },
    { key: "code", label: "Code (SNOMED/ICD)" },
    { key: "category", label: "Category" },
    { key: "onset", label: "Onset Date" },
    { key: "status", label: "Clinical Status" },
    { key: "recordedBy", label: "Recorded By" },
    { key: "actions", label: "Actions", header: <div className="flex w-full items-center justify-center">Actions</div> },
  ];

  const rows = visible.map((c) => ({
    select: (
      <RadioCheckButtonh
        type="checkbox"
        checked={selectedKeys.has(c.id)}
        onChange={() => toggleRow(c.id)}
        aria-label={`Select ${c.condition} for ${c.patient}`}
        className={checkboxCls}
      />
    ),
    patient: <Name name={c.patient} sub={c.mrn} truncate />,
    condition: <LinkComponent>{c.condition}</LinkComponent>,
    code: <Content title={c.code} description={c.system} />,
    category: <Content title={c.category} />,
    onset: <Content title={c.onset} />,
    status: <Tags text={c.status} tone={STATUS_TONES[c.status]} size="xs" />,
    recordedBy: <LinkComponent>{c.recordedBy}</LinkComponent>,
    actions: (
      <div className="flex w-full items-center justify-center">
        <Actions actions={["more"]} size="sm" />
      </div>
    ),
  }));

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-danger/10 text-danger">
          <Heart className="h-5 w-5" />
        </span>
        <div>
          <h3 className="text-base font-semibold text-heading">Conditions</h3>
          <p className="text-xs text-body sm:text-sm">Manage patient conditions, diagnoses, problems and health concerns.</p>
        </div>
      </div>

      <StatCards stats={STATS} />

      <SearchAndFilter
        placeholder="Search by patient, diagnosis, code, or SNOMED..."
        value={search}
        onSearch={(v: string) => {
          setSearch(v);
          setPage(1);
        }}
        filters={[
          { label: STATUS_FILTER, options: ["Active", "Resolved"] },
          { label: CATEGORY_FILTER, options: CATEGORY_OPTIONS },
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
          <h3 className="text-base font-semibold text-heading">Conditions List</h3>
          <span className="text-xs text-body">
            {from}-{to} of {filtered.length.toLocaleString()}
          </span>
        </div>
        <div className="overflow-hidden rounded-[14px] border border-border bg-card">
          {visible.length === 0 ? (
            <TableStatus variant="empty" message="No conditions match your filters." />
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
            itemLabel="conditions"
            onChange={setPage}
          />
        )}
      </section>
    </div>
  );
};

export default FhirCondition;