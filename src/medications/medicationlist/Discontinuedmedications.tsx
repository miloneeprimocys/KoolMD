"use client";

import React, { useMemo, useState } from "react";

import SearchAndFilter from "@/components/Searchandfilter";
import Table from "@/components/Table";
import TableStatus from "@/components/TableStatus";
import { type TableColumn } from "@/components/Tableheader";
import Content from "@/components/Content";
import Tags, { type TagTone } from "@/components/Tags";
import Actions from "@/components/Actions";
import Pagination from "@/components/Pagination";
import RadioCheckButtonh from "@/components/RadioCheckButtonh";
import { TableSelectAllCheckbox, useTableSelection } from "@/components/TableSelection";
import { cardCls } from "@/providers/Shared";

import { type Medication } from "./Currentmedications";

export const DISCONTINUED: Medication[] = [
  { id: "d1", name: "Amoxicillin", category: "Antibiotic", dosage: "500 mg", frequency: "Three times daily", start: "Jan 05, 2024", end: "Jan 12, 2024", status: "Discontinued", prescribedBy: "Dr. Sarah Wilson", reason: "Completed course" },
  { id: "d2", name: "Prednisone", category: "Corticosteroid", dosage: "10 mg", frequency: "Once daily", start: "Mar 10, 2024", end: "Mar 20, 2024", status: "Discontinued", prescribedBy: "Dr. Michael Chen", reason: "Short term use" },
];

/* name, dosage, status, start, end, prescribedBy */
const H: [string, string, string, string, string, string][] = [
  ["Lisinopril", "10 mg", "Active", "Jan 10, 2024", "-", "Dr. Sarah Wilson"],
  ["Metformin", "500 mg", "Active", "Feb 15, 2024", "-", "Dr. Sarah Wilson"],
  ["Atorvastatin", "20 mg", "Discontinued", "Jan 01, 2023", "Dec 31, 2023", "Dr. Robert Johnson"],
  ["Albuterol Inhaler", "90 mcg", "Active", "Apr 12, 2024", "-", "Dr. Michael Chen"],
  ["Omeprazole", "20 mg", "Active", "Jun 05, 2024", "-", "Dr. Emily Roberts"],
  ["Vitamin D3", "1000 IU", "Active", "Aug 20, 2024", "-", "Dr. Sarah Wilson"],
  ["Amoxicillin", "500 mg", "Completed", "Jan 05, 2024", "Jan 12, 2024", "Dr. Sarah Wilson"],
  ["Prednisone", "10 mg", "Completed", "Mar 10, 2024", "Mar 20, 2024", "Dr. Michael Chen"],
  ["Ibuprofen", "400 mg", "Completed", "Nov 02, 2023", "Nov 09, 2023", "Dr. Emily Roberts"],
  ["Cetirizine", "10 mg", "Discontinued", "May 14, 2023", "Aug 30, 2023", "Dr. Robert Johnson"],
  ["Azithromycin", "250 mg", "Completed", "Feb 03, 2023", "Feb 08, 2023", "Dr. Sarah Wilson"],
  ["Losartan", "50 mg", "Discontinued", "Sep 12, 2022", "Mar 01, 2023", "Dr. Michael Chen"],
];
const HISTORY = H.map(([name, dosage, status, start, end, by], i) => ({ id: `h${i + 1}`, name, dosage, status, start, end, by }));

const TONE: Record<string, TagTone> = { Active: "success", Completed: "success", Discontinued: "danger" };
const STATUS_FILTER = "All Medications";
const EMPTY_FILTERS: Record<string, string> = { [STATUS_FILTER]: "" };
const HISTORY_PAGE_SIZE = 5;
const checkboxCls =
  "h-4 w-4 cursor-pointer rounded border-border accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30";
const actionsHeader = <div className="flex w-full items-center justify-center">Actions</div>;
const eye = <div className="flex w-full items-center justify-center"><Actions actions={["view"]} size="sm" onAction={() => {}} /></div>;

const DiscontinuedMedications = () => {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);

  const { selectedKeys, allSelected, someSelected, toggleRow, toggleAll } = useTableSelection(DISCONTINUED.map((m) => m.id));

  const discColumns: TableColumn[] = [
    {
      key: "select",
      label: "",
      className: "w-10",
      header: <TableSelectAllCheckbox checked={allSelected} indeterminate={someSelected} onChange={toggleAll} className={checkboxCls} />,
    },
    { key: "medication", label: "Medication" },
    { key: "dosage", label: "Dosage" },
    { key: "reason", label: "Reason for Discontinuation" },
    { key: "start", label: "Start Date" },
    { key: "end", label: "End Date" },
    { key: "by", label: "Prescribed By" },
    { key: "actions", label: "Actions", header: actionsHeader },
  ];

  const discRows = DISCONTINUED.map((m) => ({
    select: (
      <RadioCheckButtonh type="checkbox" checked={selectedKeys.has(m.id)} onChange={() => toggleRow(m.id)} aria-label={`Select ${m.name}`} className={checkboxCls} />
    ),
    medication: <Content title={m.name} />,
    dosage: <Content title={m.dosage} />,
    reason: <Content title={m.reason ?? "-"} />,
    start: <Content title={m.start} />,
    end: <Content title={m.end} />,
    by: <Content title={m.prescribedBy} />,
    actions: eye,
  }));

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return HISTORY.filter((h) => {
      if (q && ![h.name, h.by].some((f) => f.toLowerCase().includes(q))) return false;
      if (filters[STATUS_FILTER] && h.status !== filters[STATUS_FILTER]) return false;
      return true;
    });
  }, [search, filters]);

  const totalPages = Math.max(Math.ceil(filtered.length / HISTORY_PAGE_SIZE), 1);
  const safePage = Math.min(page, totalPages);
  const visible = filtered.slice((safePage - 1) * HISTORY_PAGE_SIZE, safePage * HISTORY_PAGE_SIZE);

  const histColumns: TableColumn[] = [
    { key: "medication", label: "Medication" },
    { key: "dosage", label: "Dosage" },
    { key: "status", label: "Status" },
    { key: "start", label: "Start Date" },
    { key: "end", label: "End Date" },
    { key: "by", label: "Prescribed By" },
    { key: "actions", label: "Actions", header: actionsHeader },
  ];

  const histRows = visible.map((h) => ({
    medication: <Content title={h.name} />,
    dosage: <Content title={h.dosage} />,
    status: <Tags text={h.status} tone={TONE[h.status] ?? "info"} size="xs" />,
    start: <Content title={h.start} />,
    end: <Content title={h.end} />,
    by: <Content title={h.by} />,
    actions: eye,
  }));

  return (
    <section className="space-y-5">
      <div className="overflow-hidden rounded-[14px] border border-border bg-card">
        <Table columns={discColumns} rows={discRows} bordered={false} />
      </div>

      <div className={`${cardCls} space-y-4`}>
        <h3 className="text-base font-semibold text-heading">All Medication History</h3>

        <SearchAndFilter
          placeholder="Search medication..."
          value={search}
          onSearch={(v: string) => {
            setSearch(v);
            setPage(1);
          }}
          filters={[{ label: STATUS_FILTER, options: ["Active", "Discontinued", "Completed"] }]}
          selectedFilters={filters}
          onFilterChange={(label: string, value: string) => {
            setFilters((prev) => ({ ...prev, [label]: value }));
            setPage(1);
          }}
        />

        <div className="overflow-hidden rounded-[14px] border border-border bg-card">
          {visible.length === 0 ? (
            <TableStatus variant="empty" message="No medications match your filters." />
          ) : (
            <Table columns={histColumns} rows={histRows} bordered={false} />
          )}
        </div>

        {filtered.length > 0 && (
          <Pagination page={safePage} totalPages={totalPages} totalItems={filtered.length} pageSize={HISTORY_PAGE_SIZE} itemLabel="medications" onChange={setPage} />
        )}
      </div>
    </section>
  );
};

export default DiscontinuedMedications;