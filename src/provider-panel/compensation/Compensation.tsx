"use client";

import React, { useMemo, useState } from "react";
import { CalendarCheck, TrendingUp, Wallet } from "lucide-react";

import Breadcrumb from "@/components/Breadcrumb";
import DatePicker from "@/components/Datepicker";
import StatCards, { type StatItem } from "@/components/Statcards";
import Tabs from "@/components/Tabs";
import { cardCls } from "@/providers/Shared";
import EarningsTab from "./EarningsTab";
import PaymentsTab from "./PaymentsTab";
import StatementsTab from "./StatementsTab";
import { EARNINGS, PAYMENTS, STATEMENTS, money } from "./Data";

type TabKey = "earnings" | "payments" | "statements";
const TABS: { key: TabKey; label: string }[] = [
  { key: "earnings", label: "Earnings" },
  { key: "payments", label: "Payments" },
  { key: "statements", label: "Statements" },
];

const Compensation = () => {
  const [tab, setTab] = useState<TabKey>("earnings");
  const [from, setFrom] = useState("2026-10-01");
  const [to, setTo] = useState("2026-10-31");

  const inRange = (iso: string) => (!from || iso >= from) && (!to || iso <= to);
  const earnings = useMemo(() => EARNINGS.filter((r) => inRange(r.date)), [from, to]); // eslint-disable-line react-hooks/exhaustive-deps
  const payments = useMemo(() => PAYMENTS.filter((r) => inRange(r.date)), [from, to]); // eslint-disable-line react-hooks/exhaustive-deps

  const completed = earnings.filter((r) => r.status === "Completed");
  const total = completed.reduce((sum, r) => sum + r.amount, 0);
  const average = completed.length ? total / completed.length : 0;

  const stats: StatItem[] = [
    { label: "Total Earnings", value: money(total), Icon: Wallet, accent: "primary" },
    { label: "Completed Visits", value: String(completed.length), Icon: CalendarCheck, accent: "success" },
    { label: "Avg. per Visit", value: money(average), Icon: TrendingUp, accent: "violet" },
  ];

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-4 sm:space-y-5">
      <Breadcrumb items={[{ label: "Dashboard", href: "/dashboard" }, { label: "Compensation" }]} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-heading sm:text-xl 2xl:text-2xl">Compensation</h2>
          <p className="mt-0.5 text-sm text-body">Review your earnings, payments and statements.</p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <DatePicker name="from" label="From" placeholder="dd-mm-yyyy" value={from} onChange={setFrom} maxDate={to || undefined} />
          <DatePicker name="to" label="To" placeholder="dd-mm-yyyy" value={to} onChange={setTo} />
        </div>
      </div>

      <StatCards stats={stats} gridClassName="grid-cols-1 sm:grid-cols-3" />

      <section className={`${cardCls} min-w-0 space-y-4 sm:p-5`}>
        <Tabs ariaLabel="Compensation">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={tab === t.key}
              onClick={() => setTab(t.key)}
              className={`-mb-px shrink-0 cursor-pointer whitespace-nowrap border-b-2 px-1 pb-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${
                tab === t.key ? "border-primary text-primary" : "border-transparent text-body hover:text-heading"
              }`}
            >
              {t.label}
            </button>
          ))}
        </Tabs>
        {tab === "earnings" && <EarningsTab rows={earnings} />}
        {tab === "payments" && <PaymentsTab rows={payments} />}
        {tab === "statements" && <StatementsTab rows={STATEMENTS} />}
      </section>
    </div>
  );
};

export default Compensation;
