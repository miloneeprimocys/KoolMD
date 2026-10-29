"use client";

import React, { useMemo, useState } from "react";
import { CheckCircle2, Clock, FileText, Link2, PauseCircle } from "lucide-react";

import StatCards, { type StatItem } from "@/components/Statcards";
import SearchAndFilter from "@/components/Searchandfilter";
import ImportButton from "@/components/ImportButton";
import Table from "@/components/Table";
import TableStatus from "@/components/TableStatus";
import { type TableColumn } from "@/components/Tableheader";
import Content from "@/components/Content";
import Tags from "@/components/Tags";
import Name from "@/components/Name";
import LinkComponent from "@/components/LinkComponent";
import Actions from "@/components/Actions";
import Pagination from "@/components/Pagination";
import RadioCheckButtonh from "@/components/RadioCheckButtonh";
import { TableSelectAllCheckbox, useTableSelection } from "@/components/TableSelection";

/* ---------------------------------------------------------------- */
/*  Data (replace with API / redux selector)                         */
/* ---------------------------------------------------------------- */
type MedRow = {
  id: string;
  name: string;
  rxcui: string;
  snomed: string;
  type: string;
  category: string;
  form: string;
  strength: string;
  status: "Active" | "Inactive";
  usedIn: number;
};

const mk = (
  n: number,
  name: string,
  rxcui: string,
  snomed: string,
  category: string,
  form: string,
  strength: string,
  usedIn: number,
  status: "Active" | "Inactive" = "Active",
): MedRow => ({ id: String(n), name, rxcui, snomed, type: "Clinical Drug", category, form, strength, status, usedIn });

const MEDICATIONS: MedRow[] = [
  mk(1, "Amoxicillin", "723", "387510006", "Antibiotic", "Capsule", "500 mg", 128),
  mk(2, "Ibuprofen", "5640", "387207008", "Analgesic", "Tablet", "200 mg", 95),
  mk(3, "Lisinopril", "29046", "373683009", "Cardiovascular", "Tablet", "10 mg", 84),
  mk(4, "Metformin", "6809", "372509007", "Antidiabetic", "Tablet", "500 mg", 76),
  mk(5, "Atorvastatin", "83367", "372510002", "Cardiovascular", "Tablet", "20 mg", 73),
  mk(6, "Levothyroxine", "8970", "387062004", "Endocrine", "Tablet", "50 mcg", 68),
  mk(7, "Amlodipine", "72326", "372511003", "Cardiovascular", "Tablet", "5 mg", 61),
  mk(8, "Albuterol", "2080", "387239004", "Respiratory", "Inhaler", "90 mcg", 56),
  mk(9, "Omeprazole", "76445", "387286007", "Gastrointestinal", "Capsule", "20 mg", 42, "Inactive"),
  mk(10, "Hydrochlorothiazide", "3652", "387512005", "Cardiovascular", "Tablet", "25 mg", 38),
  mk(11, "Sertraline", "36437", "372594008", "Psychiatric", "Tablet", "50 mg", 35),
];

const STATS: StatItem[] = [
  { label: "Total Medications", value: "856", Icon: FileText, accent: "primary" },
  { label: "Active Medications", value: "652", Icon: CheckCircle2, accent: "success" },
  { label: "Inactive Medications", value: "162", Icon: PauseCircle, accent: "danger" },
  { label: "Common Medications", value: "48", Icon: Clock, accent: "warning" },
];

const STATUS_FILTER = "All Statuses";
const TYPE_FILTER = "All Types";
const CATEGORY_FILTER = "All Categories";
const EMPTY_FILTERS: Record<string, string> = { [STATUS_FILTER]: "", [TYPE_FILTER]: "", [CATEGORY_FILTER]: "" };
const TYPE_OPTIONS = Array.from(new Set(MEDICATIONS.map((m) => m.type)));
const CATEGORY_OPTIONS = Array.from(new Set(MEDICATIONS.map((m) => m.category)));
const PAGE_SIZE = 10;

const checkboxCls =
  "h-4 w-4 cursor-pointer rounded border-border accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30";

/* ---------------------------------------------------------------- */
/*  Component                                                        */
/* ---------------------------------------------------------------- */
const FhirMedication = () => {
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
    return MEDICATIONS.filter((m) => {
      if (q && ![m.name, m.rxcui, m.snomed].some((f) => f.toLowerCase().includes(q))) return false;
      if (filters[STATUS_FILTER] && m.status !== filters[STATUS_FILTER]) return false;
      if (filters[TYPE_FILTER] && m.type !== filters[TYPE_FILTER]) return false;
      if (filters[CATEGORY_FILTER] && m.category !== filters[CATEGORY_FILTER]) return false;
      return true;
    });
  }, [search, filters]);

  const totalPages = Math.max(Math.ceil(filtered.length / PAGE_SIZE), 1);
  const safePage = Math.min(page, totalPages);
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const from = filtered.length ? (safePage - 1) * PAGE_SIZE + 1 : 0;
  const to = filtered.length ? from + visible.length - 1 : 0;

  const { selectedKeys, allSelected, someSelected, toggleRow, toggleAll } = useTableSelection(visible.map((m) => m.id));

  const columns: TableColumn[] = [
    {
      key: "select",
      label: "",
      className: "w-10",
      header: <TableSelectAllCheckbox checked={allSelected} indeterminate={someSelected} onChange={toggleAll} className={checkboxCls} />,
    },
    { key: "name", label: "Medication Name" },
    { key: "code", label: "Code (RxNorm/SNOMED)" },
    { key: "type", label: "Type" },
    { key: "form", label: "Form" },
    { key: "strength", label: "Strength" },
    { key: "status", label: "Status" },
    { key: "usedIn", label: "Used In" },
    { key: "actions", label: "Actions", header: <div className="flex w-full items-center justify-center">Actions</div> },
  ];

  const rows = visible.map((m) => ({
    select: (
      <RadioCheckButtonh
        type="checkbox"
        checked={selectedKeys.has(m.id)}
        onChange={() => toggleRow(m.id)}
        aria-label={`Select ${m.name}`}
        className={checkboxCls}
      />
    ),
    name: <Name name={m.name} truncate />,
    code: <Content title={`RXCUI: ${m.rxcui}`} description={`SNOMED CT: ${m.snomed}`} />,
    type: <Content title={m.type} />,
    form: <Content title={m.form} />,
    strength: <Content title={m.strength} />,
    status: <Tags text={m.status} tone={m.status === "Active" ? "success" : "danger"} size="xs" />,
    usedIn: <LinkComponent>{String(m.usedIn)}</LinkComponent>,
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
          <Link2 className="h-5 w-5" />
        </span>
        <div>
          <h3 className="text-base font-semibold text-heading">Medications</h3>
          <p className="text-xs text-body sm:text-sm">Manage medication information and drug details (FHIR Resource: Medication).</p>
        </div>
      </div>

      <StatCards stats={STATS} />

      <SearchAndFilter
        placeholder="Search by medication name, code, or brand..."
        value={search}
        onSearch={(v: string) => {
          setSearch(v);
          setPage(1);
        }}
        filters={[
          { label: STATUS_FILTER, options: ["Active", "Inactive"] },
          { label: TYPE_FILTER, options: TYPE_OPTIONS },
          { label: CATEGORY_FILTER, options: CATEGORY_OPTIONS },
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
          <h3 className="text-base font-semibold text-heading">Medications List</h3>
          <span className="text-xs text-body">
            {from}-{to} of {filtered.length.toLocaleString()}
          </span>
        </div>
        <div className="overflow-hidden rounded-[14px] border border-border bg-card">
          {visible.length === 0 ? (
            <TableStatus variant="empty" message="No medications match your filters." />
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
            itemLabel="medications"
            onChange={setPage}
          />
        )}
      </section>
    </div>
  );
};

export default FhirMedication;