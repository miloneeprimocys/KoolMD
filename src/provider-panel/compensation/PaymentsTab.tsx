"use client";

import React from "react";

import Table from "@/components/Table";
import Content from "@/components/Content";
import Tags from "@/components/Tags";
import type { TableColumn } from "@/components/Tableheader";
import { type PaymentRow, STATUS_TONE, dateLabel, money } from "./Data";

const COLUMNS: TableColumn[] = [
  { key: "date", label: "Payment Date" },
  { key: "reference", label: "Reference" },
  { key: "method", label: "Method" },
  { key: "status", label: "Status" },
  { key: "amount", label: "Amount" },
];

const PaymentsTab = ({ rows }: { rows: PaymentRow[] }) => (
  <Table
    bordered
    rowClassName="dark:border-b-[#294a97]"
    columns={COLUMNS}
    rows={rows.map((r) => ({
      date: <Content title={dateLabel(r.date)} />,
      reference: <Content title={<span className="font-semibold">{r.reference}</span>} />,
      method: <Content title={r.method} />,
      status: <Tags text={r.status} tone={STATUS_TONE[r.status]} size="xs" />,
      amount: <Content title={<span className="font-semibold">{money(r.amount)}</span>} />,
    }))}
  />
);

export default PaymentsTab;
