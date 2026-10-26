
"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Crown,
  Download,
  History,
  XCircle,
} from "lucide-react";

import StatCards, { type StatItem } from "@/components/Statcards";
import SearchAndFilter, { type DateRange, type FilterOption } from "@/components/Searchandfilter";
import ImportButton from "@/components/ImportButton";
import Table from "@/components/Table";
import TableStatus from "@/components/TableStatus";
import { type TableColumn } from "@/components/Tableheader";
import Content from "@/components/Content";
import Tags, { type TagTone } from "@/components/Tags";
import Pagination from "@/components/Pagination";
import Actions from "@/components/Actions";

import {
  PlanIcon,
  formatDate,
  formatPerPeriod,
  type BillingCycle,
  type IconKey,
} from "../membership-plans/Viewmembershipplan";
import Plans from "./Plans";

/* ---------- Types + static data (replace with API data later; CancelMembership reads HISTORY too) ---------- */
export type HistoryStatus = "Active" | "Expired" | "Cancelled";

export type HistoryEntry = {
  id: string;
  name: string;
  description: string;
  status: HistoryStatus;
  cycle: BillingCycle;
  start: string; // ISO
  end: string; // ISO or ""
  price: number;
  icon: IconKey;
  nextBilling: string;
};

export const HISTORY: HistoryEntry[] = [
  { id: "h1", name: "Premium Plan", description: "Complete care and exclusive benefits.", status: "Active", cycle: "Monthly", start: "2024-01-01", end: "", price: 49, icon: "crown", nextBilling: "Jan 1, 2025" },
  { id: "h2", name: "Family Plan", description: "Care for your family in one plan.", status: "Expired", cycle: "Yearly", start: "2023-01-10", end: "2024-01-09", price: 299, icon: "users", nextBilling: "–" },
  { id: "h3", name: "Basic Plan", description: "Essential benefits for regular care.", status: "Cancelled", cycle: "Monthly", start: "2023-03-05", end: "2023-04-05", price: 29, icon: "leaf", nextBilling: "–" },
  { id: "h4", name: "Premium Plan", description: "Complete care and exclusive benefits.", status: "Expired", cycle: "Monthly", start: "2022-12-01", end: "2022-12-31", price: 49, icon: "crown", nextBilling: "–" },
  { id: "h5", name: "Student Plan", description: "Complete care and exclusive benefits.", status: "Active", cycle: "Monthly", start: "2024-08-15", end: "", price: 39, icon: "graduation", nextBilling: "Sep 15, 2024" },
  { id: "h6", name: "Basic Plan", description: "Essential benefits for regular care.", status: "Expired", cycle: "Monthly", start: "2022-06-01", end: "2022-06-30", price: 29, icon: "leaf", nextBilling: "–" },
];

/* ---------- Status tones ---------- */
const STATUS_TONES: Record<HistoryStatus, TagTone> = {
  Active: "success",
  Expired: "neutral",
  Cancelled: "danger",
};

/* ---------- Filters ---------- */
const ALL = "";
const STATUS_OPTIONS: FilterOption[] = ["Active", "Expired", "Cancelled"];
const PLAN_OPTIONS: FilterOption[] = Array.from(new Set(HISTORY.map((h) => h.name)));

const PAGE_SIZE = 10;

/* ---------- Columns ---------- */
const COLUMNS: TableColumn[] = [
  { key: "plan", label: "Plan Details" },
  { key: "status", label: "Status" },
  { key: "cycle", label: "Billing Cycle" },
  { key: "start", label: "Start Date" },
  { key: "end", label: "End Date" },
  { key: "amount", label: "Amount" },
  {
    key: "actions",
    label: "Actions",
    header: <div className="flex w-full items-center justify-center">Actions</div>,
  },
];

/* ---------- Component ---------- */
const MembershipHistory = () => {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(ALL);
  const [plan, setPlan] = useState(ALL);
  const [dateRange, setDateRange] = useState<DateRange>({ start: "", end: "" });
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isPanelClosing, setIsPanelClosing] = useState(false);

  const selected = HISTORY.find((h) => h.id === selectedId) ?? null;

  useEffect(() => {
    if (selected) setIsPanelClosing(false);
  }, [selected]);

  /* ---------- Stats (computed from the data below) ---------- */
  const stats: StatItem[] = useMemo(() => {
    const count = (s: HistoryStatus) => HISTORY.filter((h) => h.status === s).length;
    return [
      { label: "Total Plans", value: String(HISTORY.length), Icon: Crown, accent: "violet" },
      { label: "Active", value: String(count("Active")), Icon: CheckCircle2, accent: "success" },
      { label: "Expired", value: String(count("Expired")), Icon: History, accent: "violet" },
      { label: "Cancelled", value: String(count("Cancelled")), Icon: XCircle, accent: "danger" },
    ];
  }, []);

  /* ---------- Filtering ---------- */
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return HISTORY.filter((h) => {
      if (q && !`${h.name} ${h.description} ${h.id}`.toLowerCase().includes(q)) return false;
      if (status !== ALL && h.status !== status) return false;
      if (plan !== ALL && h.name !== plan) return false;
      if (dateRange.start && h.start < dateRange.start) return false;
      if (dateRange.end && h.start > dateRange.end) return false;
      return true;
    });
  }, [search, status, plan, dateRange]);

  const totalPages = Math.max(Math.ceil(filtered.length / PAGE_SIZE), 1);
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleFilterChange = (filterLabel: string, option: string) => {
    if (filterLabel === "Status") setStatus(option);
    else if (filterLabel === "Plan") setPlan(option);
    setPage(1);
  };

  /* ---------- Table rows ---------- */
  const rows = visible.map((h) => ({
    plan: (
      <div className="flex min-w-0 items-center gap-3">
        <PlanIcon icon={h.icon} rounded="rounded-full" />
        <Content title={h.name} description={h.description} truncate />
      </div>
    ),
    status: <Tags text={h.status} tone={STATUS_TONES[h.status]} />,
    cycle: <Content title={h.cycle} />,
    start: <Content title={formatDate(h.start)} />,
    end: <Content title={formatDate(h.end)} />,
    amount: <span className="whitespace-nowrap text-sm font-semibold text-heading">{formatPerPeriod(h.price, h.cycle)}</span>,
    actions: (
      <div className="flex w-full items-center justify-center">
        <Actions actions={["view"]} onAction={() => setSelectedId(h.id)} />
      </div>
    ),
  }));

  return (
    <div className="relative w-full">
      {/* ================= LEFT: list ================= */}
      <div className={`mx-auto min-w-0 w-full max-w-[1600px] space-y-4 sm:space-y-5 transition-all duration-300 ease-out ${selected && !isPanelClosing ? "2xl:pr-[460px]" : ""}`}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-heading sm:text-xl 2xl:text-2xl">Membership History</h2>
            <p className="mt-0.5 text-sm text-body">
              View complete history of membership plans, renewals, cancellations and payments.
            </p>
          </div>
          <ImportButton
            text="Export"
            icon={<Download className="h-4 w-4" />}
            onClick={() => console.log("export history") /* TODO: call your API here */}
            className="w-fit whitespace-nowrap"
          />
        </div>

        <StatCards stats={stats} />

        <SearchAndFilter
          placeholder="Search by plan name or transaction ID..."
          value={search}
          onSearch={(value) => {
            setSearch(value);
            setPage(1);
          }}
          filters={[
            { label: "Status", options: STATUS_OPTIONS },
            { label: "Plan", options: PLAN_OPTIONS },
          ]}
          selectedFilters={{ Status: status, Plan: plan }}
          onFilterChange={handleFilterChange}
          showDateRange
          dateRange={dateRange}
          onDateRangeChange={(range) => {
            setDateRange(range);
            setPage(1);
          }}
          className="flex-col xl:flex-row 2xl:flex-row"
        />

        <div className="space-y-3">
          <div className="overflow-hidden rounded-[14px] border border-border bg-card">
            {visible.length === 0 ? (
              <TableStatus variant="empty" message="No membership history matches your filters." />
            ) : (
              <Table columns={COLUMNS} rows={rows} bordered={false} />
            )}
          </div>

          {filtered.length > 0 && (
            <Pagination
              page={page}
              totalPages={totalPages}
              totalItems={filtered.length}
              pageSize={PAGE_SIZE}
              itemLabel="plans"
              onChange={setPage}
            />
          )}
        </div>
      </div>

      {/* Fixed details drawer leaves the history content in its own layout column. */}
      <Plans
        plan={selected}
        onClose={() => setSelectedId(null)}
        onCloseStart={() => setIsPanelClosing(true)}
      />
    </div>
  );
};

export default MembershipHistory;
