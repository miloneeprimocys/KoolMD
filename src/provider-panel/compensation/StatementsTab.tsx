"use client";

import React from "react";
import { Download } from "lucide-react";

import Table from "@/components/Table";
import Content from "@/components/Content";
import ImportButton from "@/components/ImportButton";
import type { TableColumn } from "@/components/Tableheader";
import { type StatementRow, money } from "./Data";

const COLUMNS: TableColumn[] = [
  { key: "month", label: "Statement" },
  { key: "visits", label: "Completed Visits" },
  { key: "total", label: "Total Earnings" },
  { key: "download", label: "Download" },
];

const StatementsTab = ({ rows }: { rows: StatementRow[] }) => (
  <Table
    bordered
    rowClassName="dark:border-b-[#294a97]"
    columns={COLUMNS}
    rows={rows.map((r) => ({
      month: <Content title={<span className="font-semibold">{r.month}</span>} />,
      visits: <Content title={String(r.visits)} />,
      total: <Content title={<span className="font-semibold">{money(r.total)}</span>} />,
      // TODO: call your API here to download the statement
      download: <ImportButton text="PDF" icon={<Download className="h-4 w-4" />} onClick={() => undefined} className="whitespace-nowrap" />,
    }))}
  />
);

export default StatementsTab;
