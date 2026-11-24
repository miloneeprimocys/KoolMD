"use client";

import React from "react";

import Table from "@/components/Table";
import Content from "@/components/Content";
import Tags from "@/components/Tags";
import type { TableColumn } from "@/components/Tableheader";
import { type EarningRow, STATUS_TONE, dateLabel, money } from "./Data";

const COLUMNS: TableColumn[] = [
  { key: "date", label: "Date" },
  { key: "patient", label: "Patient" },
  { key: "visitType", label: "Visit Type" },
  { key: "status", label: "Status" },
  { key: "amount", label: "Amount" },
];

const EarningsTab = ({ rows }: { rows: EarningRow[] }) => (
  <Table
    bordered
    rowClassName="dark:border-b-[#294a97]"
    columns={COLUMNS}
    rows={rows.map((r) => ({
      date: <Content title={dateLabel(r.date)} />,
      patient: <Content title={<span className="font-semibold">{r.patient}</span>} />,
      visitType: <Content title={r.visitType} />,
      status: <Tags text={r.status} tone={STATUS_TONE[r.status]} size="xs" />,
      amount: <Content title={<span className="font-semibold">{money(r.amount)}</span>} />,
    }))}
  />
);

export default EarningsTab;
