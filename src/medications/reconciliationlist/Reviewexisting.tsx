"use client";

import React, { useState } from "react";

import Table from "@/components/Table";
import { type TableColumn } from "@/components/Tableheader";
import Content from "@/components/Content";
import Tags, { type TagTone } from "@/components/Tags";
import Actions from "@/components/Actions";
import Pagination from "@/components/Pagination";
import RadioCheckButtonh from "@/components/RadioCheckButtonh";
import { TableSelectAllCheckbox } from "@/components/TableSelection";

import { CURRENT_MEDS } from "../medicationlist/Currentmedications";
import { RX_HISTORY } from "../prescriptionlist/Prescriptionhistorypage";

export type SourceRow = { id: string; name: string; dosage: string; source: string; start: string; status: string };

export const SOURCES = {
  current: CURRENT_MEDS.map((m): SourceRow => ({ id: `c-${m.id}`, name: m.name, dosage: m.dosage, source: "Current List", start: m.start, status: m.status })),
  history: RX_HISTORY.map((r): SourceRow => ({ id: `h-${r.id}`, name: r.name, dosage: r.dosage, source: "Prescription History", start: r.date, status: r.status })),
  reported: [
    { id: "r-1", name: "Ibuprofen", dosage: "200 mg", source: "Patient Reported", start: "-", status: "Reported" },
    { id: "r-2", name: "Multivitamin", dosage: "1 tablet", source: "Patient Reported", start: "-", status: "Reported" },
    { id: "r-3", name: "Fish Oil", dosage: "1000 mg", source: "Patient Reported", start: "-", status: "Reported" },
  ] as SourceRow[],
};
export const ALL_ROWS: SourceRow[] = [...SOURCES.current, ...SOURCES.history, ...SOURCES.reported];

type SourceKey = keyof typeof SOURCES;

const TABS: { key: SourceKey; label: string }[] = [
  { key: "current", label: `Current Medications (${SOURCES.current.length})` },
  { key: "history", label: `Prescription History (${SOURCES.history.length})` },
  { key: "reported", label: `Patient Reported (${SOURCES.reported.length})` },
];

const TONE: Record<string, TagTone> = { Active: "success", Completed: "success", Sent: "info", Reported: "info", Discontinued: "danger" };
const PAGE_SIZE = 10;
const checkboxCls =
  "h-4 w-4 cursor-pointer rounded border-border accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30";

interface Props {
  selected: Set<string>;
  onSelectedChange: (next: Set<string>) => void;
}

const ReviewExisting = ({ selected, onSelectedChange }: Props) => {
  const [tab, setTab] = useState<SourceKey>("current");
  const [page, setPage] = useState(1);

  const list = SOURCES[tab];
  const totalPages = Math.max(Math.ceil(list.length / PAGE_SIZE), 1);
  const visible = list.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const allSelected = visible.length > 0 && visible.every((r) => selected.has(r.id));
  const someSelected = visible.some((r) => selected.has(r.id)) && !allSelected;

  const toggleRow = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onSelectedChange(next);
  };
  const toggleAll = () => {
    const next = new Set(selected);
    visible.forEach((r) => (allSelected ? next.delete(r.id) : next.add(r.id)));
    onSelectedChange(next);
  };

  const columns: TableColumn[] = [
    {
      key: "select",
      label: "",
      className: "w-10",
      header: <TableSelectAllCheckbox checked={allSelected} indeterminate={someSelected} onChange={toggleAll} className={checkboxCls} />,
    },
    { key: "medication", label: "Medication" },
    { key: "dosage", label: "Dosage" },
    { key: "source", label: "Source" },
    { key: "start", label: "Start Date" },
    { key: "status", label: "Status" },
    { key: "actions", label: "Actions", header: <div className="flex w-full items-center justify-center">Actions</div> },
  ];

  const rows = visible.map((r) => ({
    select: (
      <RadioCheckButtonh type="checkbox" checked={selected.has(r.id)} onChange={() => toggleRow(r.id)} aria-label={`Select ${r.name}`} className={checkboxCls} />
    ),
    medication: <Content title={r.name} />,
    dosage: <Content title={r.dosage} />,
    source: <Content title={r.source} />,
    start: <Content title={r.start} />,
    status: <Tags text={r.status} tone={TONE[r.status] ?? "info"} size="xs" />,
    actions: (
      <div className="flex w-full items-center justify-center">
        <Actions actions={["more"]} size="sm" onAction={() => {}} />
      </div>
    ),
  }));

  return (
    <div className="space-y-4">
      <div role="tablist" className="flex gap-4 overflow-x-auto border-b border-border hide-scrollbar sm:gap-6">
        {TABS.map((t) => {
          const isActive = t.key === tab;
          return (
            <button
              key={t.key}
              role="tab"
              type="button"
              aria-selected={isActive}
              onClick={() => {
                setTab(t.key);
                setPage(1);
              }}
              className={`-mb-px cursor-pointer whitespace-nowrap border-b-2 px-1 pb-2.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 sm:pb-3 sm:text-sm ${
                isActive ? "border-primary text-primary" : "border-transparent text-body hover:text-heading"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>
      <div className="overflow-hidden rounded-[14px] border border-border bg-card">
        <Table columns={columns} rows={rows} bordered={false} />
      </div>
      <Pagination page={page} totalPages={totalPages} totalItems={list.length} pageSize={PAGE_SIZE} itemLabel="medications" onChange={setPage} />
    </div>
  );
};

export default ReviewExisting;