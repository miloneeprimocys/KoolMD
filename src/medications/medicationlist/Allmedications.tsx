"use client";

import React, { useMemo, useState } from "react";

import SearchAndFilter from "@/components/Searchandfilter";
import Table from "@/components/Table";
import TableStatus from "@/components/TableStatus";
import { type TableColumn } from "@/components/Tableheader";
import Content from "@/components/Content";
import Tags from "@/components/Tags";
import Actions from "@/components/Actions";
import Pagination from "@/components/Pagination";

import { CURRENT_MEDS } from "./Currentmedications";
import { DISCONTINUED } from "./Discontinuedmedications";

const ALL = [...CURRENT_MEDS, ...DISCONTINUED];
const STATUS_FILTER = "All Statuses";
const EMPTY_FILTERS: Record<string, string> = { [STATUS_FILTER]: "" };
const PAGE_SIZE = 10;

const AllMedications = () => {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return ALL.filter((m) => {
      if (q && ![m.name, m.category, m.prescribedBy].some((f) => f.toLowerCase().includes(q))) return false;
      if (filters[STATUS_FILTER] && m.status !== filters[STATUS_FILTER]) return false;
      return true;
    });
  }, [search, filters]);

  const totalPages = Math.max(Math.ceil(filtered.length / PAGE_SIZE), 1);
  const safePage = Math.min(page, totalPages);
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const columns: TableColumn[] = [
    { key: "medication", label: "Medication" },
    { key: "dosage", label: "Dosage" },
    { key: "frequency", label: "Frequency" },
    { key: "start", label: "Start Date" },
    { key: "end", label: "End Date" },
    { key: "status", label: "Status" },
    { key: "actions", label: "Actions", header: <div className="flex w-full items-center justify-center">Actions</div> },
  ];

  const rows = visible.map((m) => ({
    medication: <Content title={m.name} description={m.category} />,
    dosage: <Content title={m.dosage} />,
    frequency: <Content title={m.frequency} />,
    start: <Content title={m.start} />,
    end: <Content title={m.end} />,
    status: <Tags text={m.status} tone={m.status === "Active" ? "success" : "danger"} size="xs" />,
    actions: (
      <div className="flex w-full items-center justify-center">
        <Actions actions={["view"]} size="sm" onAction={() => {}} />
      </div>
    ),
  }));

  return (
    <section className="space-y-4">
      <SearchAndFilter
        placeholder="Search medication..."
        value={search}
        onSearch={(v: string) => {
          setSearch(v);
          setPage(1);
        }}
        filters={[{ label: STATUS_FILTER, options: ["Active", "Discontinued"] }]}
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
          <Table columns={columns} rows={rows} bordered={false} />
        )}
      </div>

      {filtered.length > 0 && (
        <Pagination page={safePage} totalPages={totalPages} totalItems={filtered.length} pageSize={PAGE_SIZE} itemLabel="medications" onChange={setPage} />
      )}
    </section>
  );
};

export default AllMedications;