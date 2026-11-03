"use client";

import React, { useMemo, useState } from "react";
import { ClipboardList, CheckCircle2, Clock, Compass, AlertCircle } from "lucide-react";

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
type StmtStatus = "Active" | "Past" | "Not Taking" | "Unknown";

type StmtRow = {
  id: string;
  statementId: string;
  patient: string;
  mrn: string;
  medication: string;
  form: string;
  status: StmtStatus;
  category: string;
  encounter: string;
  effective: string;
  source: string;
  reportedBy: string;
  notes: string;
};

const mk = (
  n: number,
  patient: string,
  age: string,
  medication: string,
  form: string,
  status: StmtStatus,
  category: string,
  effective: string,
  notes: string,
): StmtRow => ({
  id: String(n),
  statementId: `MS-00${1246 + n}`,
  patient,
  mrn: `MRN: PT-00${1244 + n} (${age} yrs)`,
  medication,
  form,
  status,
  category,
  encounter: `ENC-00${1246 + n}`,
  effective,
  source: "Patient Reported",
  reportedBy: "Patient",
  notes,
});

const STATEMENTS: StmtRow[] = [
  mk(1, "John Smith", "42", "Metformin 500 mg", "Tablet", "Active", "Outpatient", "Jan 10, 2024", "Taking twice daily"),
  mk(2, "Emily Carter", "36", "Lisinopril 10 mg", "Tablet", "Active", "Outpatient", "Mar 5, 2023", "For hypertension"),
  mk(3, "Robert Johnson", "51", "Albuterol 90 mcg", "Inhaler", "Active", "Outpatient", "Feb 12, 2024", "Uses as needed"),
  mk(4, "Olivia Brown", "33", "Atorvastatin 20 mg", "Tablet", "Active", "Community", "Jan 3, 2024", "At night"),
  mk(5, "William Davis", "58", "Levothyroxine 50 mcg", "Tablet", "Active", "Community", "Nov 18, 2023", "Empty stomach"),
  mk(6, "Sophia Miller", "31", "Omeprazole 20 mg", "Capsule", "Not Taking", "Outpatient", "Aug 10, 2023", "Stopped due to side effects"),
  mk(7, "Michael Wilson", "39", "Amlodipine 5 mg", "Tablet", "Active", "Outpatient", "Jan 22, 2024", "For BP control"),
  mk(8, "Isabella Moore", "26", "Sertraline 50 mg", "Tablet", "Past", "Community", "Jun 15, 2022", "Took for 6 months"),
  mk(9, "David Taylor", "47", "Hydrochlorothiazide 25 mg", "Tablet", "Active", "Outpatient", "Feb 1, 2024", "Morning dose"),
  mk(10, "Laura Anderson", "35", "Vitamin D 1000 IU", "Tablet", "Unknown", "Community", "Jan 5, 2024", "Not sure if still taking"),
  mk(11, "James Martin", "43", "Ibuprofen 200 mg", "Tablet", "Active", "Outpatient", "Mar 2, 2024", "Takes when needed"),
];

const STATUS_TONES: Record<StmtStatus, TagTone> = {
  Active: "success",
  Past: "neutral",
  "Not Taking": "danger",
  Unknown: "warning",
};

const STATS: StatItem[] = [
  { label: "Total Statements", value: "1,248", Icon: ClipboardList, accent: "primary" },
  { label: "Active Medications", value: "682", Icon: CheckCircle2, accent: "success" },
  { label: "Past Medications", value: "432", Icon: Clock, accent: "primary" },
  { label: "Not Taking", value: "86", Icon: Compass, accent: "danger" },
  { label: "Unknown Status", value: "48", Icon: AlertCircle, accent: "warning" },
];

const STATUS_FILTER = "All Statuses";
const CATEGORY_FILTER = "All Categories";
const ENC_FILTER = "All Encounters";
const EMPTY_FILTERS: Record<string, string> = { [STATUS_FILTER]: "", [CATEGORY_FILTER]: "", [ENC_FILTER]: "" };
const CATEGORY_OPTIONS = Array.from(new Set(STATEMENTS.map((s) => s.category)));
const ENC_OPTIONS = STATEMENTS.map((s) => s.encounter);
const PAGE_SIZE = 10;

const checkboxCls =
  "h-4 w-4 cursor-pointer rounded border-border accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30";

/* ---------------------------------------------------------------- */
/*  Component                                                        */
/* ---------------------------------------------------------------- */
const FhirMedicationStatement = () => {
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
    return STATEMENTS.filter((s) => {
      if (q && ![s.patient, s.mrn, s.medication, s.notes, s.statementId].some((f) => f.toLowerCase().includes(q))) return false;
      if (filters[STATUS_FILTER] && s.status !== filters[STATUS_FILTER]) return false;
      if (filters[CATEGORY_FILTER] && s.category !== filters[CATEGORY_FILTER]) return false;
      if (filters[ENC_FILTER] && s.encounter !== filters[ENC_FILTER]) return false;
      return true;
    });
  }, [search, filters]);

  const totalPages = Math.max(Math.ceil(filtered.length / PAGE_SIZE), 1);
  const safePage = Math.min(page, totalPages);
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const from = filtered.length ? (safePage - 1) * PAGE_SIZE + 1 : 0;
  const to = filtered.length ? from + visible.length - 1 : 0;

  const { selectedKeys, allSelected, someSelected, toggleRow, toggleAll } = useTableSelection(visible.map((s) => s.id));

  const columns: TableColumn[] = [
    {
      key: "select",
      label: "",
      className: "w-10",
      header: <TableSelectAllCheckbox checked={allSelected} indeterminate={someSelected} onChange={toggleAll} className={checkboxCls} />,
    },
    { key: "statementId", label: "Statement ID" },
    { key: "patient", label: "Patient" },
    { key: "medication", label: "Medication" },
    { key: "status", label: "Status" },
    { key: "effective", label: "Effective Date" },
    { key: "source", label: "Source" },
    { key: "reportedBy", label: "Reported By" },
    { key: "notes", label: "Notes" },
    { key: "actions", label: "Actions", header: <div className="flex w-full items-center justify-center">Actions</div> },
  ];

  const rows = visible.map((s) => ({
    select: (
      <RadioCheckButtonh
        type="checkbox"
        checked={selectedKeys.has(s.id)}
        onChange={() => toggleRow(s.id)}
        aria-label={`Select ${s.statementId}`}
        className={checkboxCls}
      />
    ),
    statementId: <LinkComponent>{s.statementId}</LinkComponent>,
    patient: <Name name={s.patient} sub={s.mrn} truncate />,
    medication: (
      <div className="min-w-0">
        <LinkComponent>{s.medication}</LinkComponent>
        <p className="truncate text-xs text-body">{s.form}</p>
      </div>
    ),
    status: <Tags text={s.status} tone={STATUS_TONES[s.status]} size="xs" />,
    effective: <Content title={s.effective} />,
    source: <Content title={s.source} />,
    reportedBy: <Content title={s.reportedBy} />,
    notes: <Content title={s.notes} truncate />,
    actions: (
      <div className="flex w-full items-center justify-center">
        <Actions actions={["more"]} size="sm" />
      </div>
    ),
  }));

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-success/10 text-success">
          <ClipboardList className="h-5 w-5" />
        </span>
        <div>
          <h3 className="text-base font-semibold text-heading">Medication Statements</h3>
          <p className="text-xs text-body sm:text-sm">
            Manage medication information provided by patients, including current, past, and reported medications.
          </p>
        </div>
      </div>

      <StatCards stats={STATS} />

      <SearchAndFilter
        placeholder="Search by patient, medication, code, or note..."
        value={search}
        onSearch={(v: string) => {
          setSearch(v);
          setPage(1);
        }}
        filters={[
          { label: STATUS_FILTER, options: ["Active", "Past", "Not Taking", "Unknown"] },
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
          <h3 className="text-base font-semibold text-heading">Medication Statements List</h3>
          <span className="text-xs text-body">
            {from}-{to} of {filtered.length.toLocaleString()}
          </span>
        </div>
        <div className="overflow-hidden rounded-[14px] border border-border bg-card">
          {visible.length === 0 ? (
            <TableStatus variant="empty" message="No medication statements match your filters." />
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
            itemLabel="statements"
            onChange={setPage}
          />
        )}
      </section>
    </div>
  );
};

export default FhirMedicationStatement;