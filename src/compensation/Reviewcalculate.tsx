"use client";

import React from "react";

import Table from "@/components/Table";
import { type TableColumn } from "@/components/Tableheader";
import Content from "@/components/Content";
import Tags from "@/components/Tags";
import { cardCls } from "@/providers/Shared";

/* ---------------------------------------------------------------- */
/*  Step 2 – Review & Calculate (Payment Sheet preview)              */
/* ---------------------------------------------------------------- */
export type SheetSnapshot = {
  sheetId: string;
  provider: string;
  period: string;
  basis: string;
  rate: number;
  count: number;
};

export const PREVIOUS_PAYMENTS = 2000;

export const usd = (n: number) =>
  `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const computeEarnings = (s: SheetSnapshot) => {
  const gross = s.rate * s.count;
  return { gross, adjustments: 0, previous: PREVIOUS_PAYMENTS, outstanding: gross - PREVIOUS_PAYMENTS };
};

const SAMPLE_RECORDS = [
  { n: 1, date: "Oct 2, 2026", ref: "ENC-92831" },
  { n: 2, date: "Oct 3, 2026", ref: "ENC-92847" },
  { n: 3, date: "Oct 4, 2026", ref: "ENC-92641" },
];

const COLUMNS: TableColumn[] = [
  { key: "n", label: "#" },
  { key: "date", label: "Date" },
  { key: "ref", label: "Encounter / Case ID" },
  { key: "type", label: "Type" },
  { key: "status", label: "Status" },
  { key: "amount", label: "Amount", header: <div className="flex w-full items-center justify-end">Amount</div> },
];

const InfoRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex items-start justify-between gap-4 py-1.5 text-sm">
    <span className="text-body">{label}</span>
    <span className="text-right font-medium text-heading">{value}</span>
  </div>
);

const ReviewCalculate = ({ snapshot }: { snapshot: SheetSnapshot }) => {
  const earnings = computeEarnings(snapshot);

  const rows = SAMPLE_RECORDS.map((r) => ({
    n: <Content title={String(r.n)} />,
    date: <Content title={r.date} />,
    ref: <Content title={r.ref} />,
    type: <Content title="Consultation" />,
    status: <Tags text="Completed" tone="success" size="xs" />,
    amount: <div className="flex w-full justify-end text-sm text-heading">{usd(snapshot.rate)}</div>,
  }));

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="flex items-center gap-3">
        <h3 className="text-base font-semibold text-heading sm:text-lg">Payment Sheet – Review</h3>
        <Tags text="Draft" tone="warning" size="xs" />
      </div>

      {/* Sheet info */}
      <section className={`${cardCls} grid gap-x-10 gap-y-1 sm:grid-cols-2 sm:p-6`}>
        <div>
          <InfoRow label="Sheet #" value={snapshot.sheetId} />
          <InfoRow label="Provider" value={snapshot.provider} />
          <InfoRow label="Period" value={snapshot.period} />
        </div>
        <div>
          <InfoRow label="Agreement" value={snapshot.basis} />
          <InfoRow label="Rate" value={`${usd(snapshot.rate)} / Consultation`} />
          <InfoRow label="Completed Consultations" value={snapshot.count} />
        </div>
      </section>

      <div className="grid items-start gap-4 sm:gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        {/* Records */}
        <div className="min-w-0 space-y-2">
          <div className="overflow-hidden rounded-[14px] border border-border bg-card">
            <Table columns={COLUMNS} rows={rows} bordered={false} />
          </div>
          <p className="px-1 text-xs text-body">
            + {snapshot.count - SAMPLE_RECORDS.length} more completed consultations included in this sheet.
          </p>
        </div>

        {/* Earnings summary */}
        <aside className={`${cardCls} sm:p-6`}>
          <h4 className="mb-2 text-sm font-semibold text-heading">Earnings Summary</h4>
          <InfoRow label={`Consultations (${snapshot.count} × ${usd(snapshot.rate).replace(".00", "")})`} value={usd(earnings.gross)} />
          <InfoRow label="Adjustments" value={usd(earnings.adjustments)} />
          <InfoRow label="Gross Payable" value={<span className="font-bold">{usd(earnings.gross)}</span>} />
          <InfoRow label="Previous Payments" value={usd(earnings.previous)} />
          <div className="mt-2 flex items-center justify-between gap-4 rounded-lg bg-warning/10 px-3 py-2.5 text-sm">
            <span className="font-medium text-heading">Outstanding Amount</span>
            <span className="font-bold text-heading">{usd(earnings.outstanding)}</span>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default ReviewCalculate;