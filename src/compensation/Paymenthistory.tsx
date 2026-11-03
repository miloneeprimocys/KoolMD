"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Download } from "lucide-react";

import ImportButton from "@/components/ImportButton";
import SearchAndFilter from "@/components/Searchandfilter";
import Table from "@/components/Table";
import TableStatus from "@/components/TableStatus";
import { type TableColumn } from "@/components/Tableheader";
import Content from "@/components/Content";
import Tags, { type TagTone } from "@/components/Tags";
import Actions from "@/components/Actions";
import Pagination from "@/components/Pagination";
import Breadcrumb from "@/components/Breadcrumb";

/* ---------------------------------------------------------------- */
/*  Static data (replace with API / redux selector)                  */
/* ---------------------------------------------------------------- */
type SheetStatus = "Paid" | "Partially Paid" | "Approved" | "Pending Review";

type HistoryRow = {
  id: string;
  provider: string;
  type: "Independent Contractor" | "KOOLMD Direct" | "External Agency";
  period: string;
  /** Months between the period and today, used by the Period filter. */
  monthsAgo: number;
  gross: number;
  paid: number;
  status: SheetStatus;
};

const HISTORY: HistoryRow[] = [
  { id: "PS-1045", provider: "Dr. John Carter", type: "Independent Contractor", period: "Oct 1 – Oct 31, 2026", monthsAgo: 1, gross: 12000, paid: 12000, status: "Paid" },
  { id: "PS-1044", provider: "Dr. Emily Rogers", type: "KOOLMD Direct", period: "Oct 1 – Oct 31, 2026", monthsAgo: 1, gross: 8750, paid: 8750, status: "Paid" },
  { id: "PS-1043", provider: "MedStaff Agency", type: "External Agency", period: "Oct 1 – Oct 31, 2026", monthsAgo: 1, gross: 25000, paid: 17000, status: "Partially Paid" },
  { id: "PS-1042", provider: "Dr. Michael Lee", type: "Independent Contractor", period: "Sep 1 – Sep 30, 2026", monthsAgo: 2, gross: 10500, paid: 0, status: "Approved" },
  { id: "PS-1041", provider: "Dr. John Carter", type: "Independent Contractor", period: "Sep 1 – Sep 30, 2026", monthsAgo: 2, gross: 10500, paid: 10500, status: "Paid" },
  { id: "PS-1040", provider: "Dr. Emily Rogers", type: "KOOLMD Direct", period: "Sep 1 – Sep 30, 2026", monthsAgo: 2, gross: 7900, paid: 7900, status: "Paid" },
  { id: "PS-1039", provider: "CarePlus Agency", type: "External Agency", period: "Aug 1 – Aug 31, 2026", monthsAgo: 3, gross: 14200, paid: 14200, status: "Paid" },
  { id: "PS-1038", provider: "Dr. Michael Lee", type: "Independent Contractor", period: "Aug 1 – Aug 31, 2026", monthsAgo: 3, gross: 10500, paid: 10500, status: "Paid" },
  { id: "PS-1037", provider: "MedStaff Agency", type: "External Agency", period: "Aug 1 – Aug 31, 2026", monthsAgo: 3, gross: 22800, paid: 22800, status: "Paid" },
  { id: "PS-1036", provider: "Dr. John Carter", type: "Independent Contractor", period: "Jun 1 – Jun 30, 2026", monthsAgo: 5, gross: 9500, paid: 9500, status: "Paid" },
  { id: "PS-1035", provider: "Dr. Emily Rogers", type: "KOOLMD Direct", period: "May 1 – May 31, 2026", monthsAgo: 6, gross: 8100, paid: 8100, status: "Paid" },
];

const STATUS_TONES: Record<SheetStatus, TagTone> = {
  Paid: "success",
  "Partially Paid": "warning",
  Approved: "info",
  "Pending Review": "warning",
};

const TYPE_FILTER = "All Types";
const STATUS_FILTER = "All Statuses";
const PERIOD_FILTER = "Last 6 Months";
const PERIOD_OPTIONS: Record<string, number> = { "Last 3 Months": 3, "Last 6 Months": 6, "Last 12 Months": 12 };
const EMPTY_FILTERS: Record<string, string> = { [TYPE_FILTER]: "", [STATUS_FILTER]: "", [PERIOD_FILTER]: "Last 6 Months" };
const TYPE_OPTIONS = Array.from(new Set(HISTORY.map((h) => h.type)));
const STATUS_OPTIONS: SheetStatus[] = ["Paid", "Partially Paid", "Approved", "Pending Review"];
const PAGE_SIZE = 10;

const usd = (n: number) => `$${n.toLocaleString("en-US")}`;

const COLUMNS: TableColumn[] = [
  { key: "sheet", label: "Sheet #" },
  { key: "provider", label: "Provider" },
  { key: "period", label: "Period" },
  { key: "gross", label: "Gross Payable" },
  { key: "paid", label: "Paid Amount" },
  { key: "outstanding", label: "Outstanding" },
  { key: "status", label: "Status" },
  { key: "actions", label: "Action", header: <div className="flex w-full items-center justify-center">Action</div> },
];

/* ---------------------------------------------------------------- */
/*  Component                                                        */
/* ---------------------------------------------------------------- */
const PaymentHistory = () => {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const maxMonths = PERIOD_OPTIONS[filters[PERIOD_FILTER]] ?? 6;
    return HISTORY.filter((h) => {
      if (q && ![h.id, h.provider].some((f) => f.toLowerCase().includes(q))) return false;
      if (filters[TYPE_FILTER] && h.type !== filters[TYPE_FILTER]) return false;
      if (filters[STATUS_FILTER] && h.status !== filters[STATUS_FILTER]) return false;
      if (h.monthsAgo > maxMonths) return false;
      return true;
    });
  }, [search, filters]);

  const totalPages = Math.max(Math.ceil(filtered.length / PAGE_SIZE), 1);
  const safePage = Math.min(page, totalPages);
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const rows = visible.map((h) => ({
    sheet: <Content title={h.id} />,
    provider: <Content title={h.provider} />,
    period: <Content title={h.period} />,
    gross: <Content title={usd(h.gross)} />,
    paid: <Content title={usd(h.paid)} />,
    outstanding: <Content title={usd(h.gross - h.paid)} />,
    status: <Tags text={h.status} tone={STATUS_TONES[h.status]} size="xs" />,
    actions: (
      <div className="flex w-full items-center justify-center">
        <Actions
          actions={["view"]}
          size="sm"
          onAction={(action) => {
            if (action !== "view") return;
            // Approved sheets still need a payment → record it; everything else opens the review page.
            const target = h.status === "Approved" ? "record-payment" : "payment-sheet-review";
            router.push(`/compensation/${target}?id=${encodeURIComponent(h.id)}`);
          }}
        />
      </div>
    ),
  }));

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-4 sm:space-y-5">
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Compensation", href: "/compensation" },
          { label: "Payment History" },
        ]}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-heading sm:text-xl 2xl:text-2xl">Payment History</h2>
          <p className="mt-0.5 text-sm text-body">Track all payments, filter by provider/period/status and export reports.</p>
        </div>
        <ImportButton
          text="Export"
          icon={<Download className="h-4 w-4" />}
          onClick={() => {
            // TODO: export the filtered rows (CSV / XLSX)
          }}
          className="shrink-0 whitespace-nowrap"
        />
      </div>

      <SearchAndFilter
        placeholder="Search by sheet # or provider..."
        value={search}
        onSearch={(v: string) => {
          setSearch(v);
          setPage(1);
        }}
        filters={[
          { label: TYPE_FILTER, options: TYPE_OPTIONS },
          { label: STATUS_FILTER, options: STATUS_OPTIONS },
          { label: PERIOD_FILTER, options: Object.keys(PERIOD_OPTIONS) },
        ]}
        selectedFilters={filters}
        onFilterChange={(label: string, value: string) => {
          setFilters((prev) => ({ ...prev, [label]: value }));
          setPage(1);
        }}
        showDateRange={false}
      />

      <div className="space-y-3">
        <div className="overflow-hidden rounded-[14px] border border-border bg-card">
          {visible.length === 0 ? (
            <TableStatus variant="empty" message="No payments match your filters." />
          ) : (
            <Table columns={COLUMNS} rows={rows} bordered={false} />
          )}
        </div>
        {filtered.length > 0 && (
          <Pagination
            page={safePage}
            totalPages={totalPages}
            totalItems={filtered.length}
            pageSize={PAGE_SIZE}
            itemLabel="payments"
            onChange={setPage}
          />
        )}
      </div>
    </div>
  );
};

export default PaymentHistory;