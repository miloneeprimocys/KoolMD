"use client";

import React, { useMemo, useState } from "react";

import Table from "@/components/Table";
import TableStatus from "@/components/TableStatus";
import { type TableColumn } from "@/components/Tableheader";
import Content from "@/components/Content";
import Tags from "@/components/Tags";
import Actions from "@/components/Actions";
import Pagination from "@/components/Pagination";
import type { Notify } from "./Blocktime";
import { type Holiday } from "./Addholidays";

const PAGE_SIZE = 10;

const fmtDate = (iso: string) => {
  const [y, m, d] = iso.split("-");
  return `${m}/${d}/${y}`;
};

const mk = (id: number, date: string, title: string): Holiday => ({
  id: `h${id}`,
  date,
  title,
  type: "Holiday",
  description: "",
  locations: [],
  types: [],
  status: "Active",
});

/* TODO: replace with your API / redux selector */
const SAMPLE_HOLIDAYS: Holiday[] = [
  mk(1, "2026-11-24", "Thanksgiving"),
  mk(2, "2026-11-25", "Day After Thanksgiving"),
  mk(3, "2026-12-24", "Christmas Eve"),
  mk(4, "2026-12-25", "Christmas Day"),
  mk(5, "2027-01-01", "New Year's Day"),
];

const Holidays = ({ notify, onEditHoliday, onDeleteHoliday }: { notify: Notify; onEditHoliday?: (holiday: Holiday) => void; onDeleteHoliday?: (id: string) => void }) => {
  const [items, setItems] = useState<Holiday[]>(SAMPLE_HOLIDAYS);
  const [page, setPage] = useState(1);

  const sorted = useMemo(() => [...items].sort((a, b) => a.date.localeCompare(b.date)), [items]);
  const totalPages = Math.max(Math.ceil(sorted.length / PAGE_SIZE), 1);
  const currentPage = Math.min(page, totalPages);
  const pageItems = sorted.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const columns: TableColumn[] = [
    { key: "date", label: "Date" },
    { key: "title", label: "Title" },
    { key: "type", label: "Type" },
    { key: "appliesTo", label: "Applies To" },
    { key: "status", label: "Status" },
    { key: "actions", label: "Actions", header: <div className="flex w-full items-center justify-center">Actions</div> },
  ];

  const rows = pageItems.map((h) => ({
    date: <Content title={fmtDate(h.date)} />,
    title: <Content title={h.title} />,
    type: <Content title={h.type} />,
    appliesTo: <Content title={h.locations.length ? h.locations.join(", ") : "All Locations"} />,
    status: <Tags text={h.status} tone={h.status === "Active" ? "success" : "neutral"} />,
    actions: (
      <div className="flex w-full items-center justify-center">
        <Actions
          actions={["edit", "delete"]}
          onAction={(action) => {
            if (action === "edit") onEditHoliday?.(h);
            else if (action === "delete") {
              setItems((prev) => prev.filter((x) => x.id !== h.id));
              onDeleteHoliday?.(h.id);
              notify("success", "Holiday deleted", `${h.title} has been removed.`);
            }
          }}
        />
      </div>
    ),
  }));

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="overflow-hidden rounded-[14px] border border-border bg-card">
          {pageItems.length === 0 ? (
            <TableStatus variant="empty" message="No holidays added yet." />
          ) : (
            <Table columns={columns} rows={rows} bordered={false} />
          )}
        </div>

        {sorted.length > 0 && (
          <Pagination
            page={currentPage}
            totalPages={totalPages}
            totalItems={sorted.length}
            pageSize={PAGE_SIZE}
            itemLabel="holidays"
            onChange={setPage}
          />
        )}
      </div>
    </div>
  );
};

export default Holidays;