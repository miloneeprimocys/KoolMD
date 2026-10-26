"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, DollarSign, FileText, CreditCard, ChevronDown, Plus } from "lucide-react";

import RadioCheckButtonh from "@/components/RadioCheckButtonh";
import StatCards, { type StatItem } from "@/components/Statcards";
import AddButton from "@/components/Addbutton";
import SearchAndFilter, { type DateRange, type FilterOption } from "@/components/Searchandfilter";
import Table from "@/components/Table";
import TableStatus from "@/components/TableStatus";
import { type TableColumn } from "@/components/Tableheader";
import Content from "@/components/Content";
import Tags, { type TagTone } from "@/components/Tags";
import Actions from "@/components/Actions";
import Pagination from "@/components/Pagination";

import { formatDate } from "../../membership/membership-plans/Viewmembershipplan";
import ViewInvoice from "./ViewInvoice";

/* ---------- Types + static data (replace with API data later) ---------- */
export type InvoiceStatus = "Paid" | "Pending" | "Overdue" | "Refunded";

export type InvoiceEntry = {
  id: string; // invoice number
  patient: string;
  email: string;
  phone: string;
  plan: string;
  cycle: "Monthly" | "Yearly";
  start: string; // ISO
  end: string; // ISO
  amount: number;
  status: InvoiceStatus;
  paymentDate: string; // ISO or ""
  txn: string;
};

export const INVOICES: InvoiceEntry[] = [
  { id: "INV-001234", patient: "Emma Wilson", email: "emma.wilson@email.com", phone: "+1 (555) 987-6543", plan: "Premium Plan", cycle: "Monthly", start: "2024-01-01", end: "2024-01-31", amount: 49, status: "Paid", paymentDate: "2024-01-01", txn: "TXN123456" },
  { id: "INV-001233", patient: "Liam Carter", email: "liam.carter@email.com", phone: "+1 (555) 123-4411", plan: "Family Plan", cycle: "Monthly", start: "2024-01-01", end: "2024-01-30", amount: 299, status: "Paid", paymentDate: "2024-01-01", txn: "TXN123455" },
  { id: "INV-001232", patient: "Olivia Bennett", email: "olivia.b@email.com", phone: "+1 (555) 222-7890", plan: "Basic Plan", cycle: "Monthly", start: "2024-02-01", end: "2024-02-28", amount: 29, status: "Pending", paymentDate: "", txn: "TXN123454" },
  { id: "INV-001231", patient: "Noah Davis", email: "noah.davis@email.com", phone: "+1 (555) 333-1200", plan: "Premium Plan", cycle: "Monthly", start: "2023-12-01", end: "2023-12-31", amount: 49, status: "Paid", paymentDate: "2023-12-01", txn: "TXN123453" },
  { id: "INV-001230", patient: "Ava Martinez", email: "ava.m@email.com", phone: "+1 (555) 444-9087", plan: "Student Plan", cycle: "Monthly", start: "2024-01-01", end: "2024-01-31", amount: 39, status: "Overdue", paymentDate: "", txn: "TXN123452" },
  { id: "INV-001229", patient: "William Brown", email: "will.brown@email.com", phone: "+1 (555) 555-3321", plan: "Basic Plan", cycle: "Monthly", start: "2023-11-01", end: "2023-11-30", amount: 29, status: "Paid", paymentDate: "2023-11-01", txn: "TXN123451" },
  { id: "INV-001228", patient: "Sophia Taylor", email: "sophia.t@email.com", phone: "+1 (555) 666-7712", plan: "Premium Plan", cycle: "Monthly", start: "2023-10-01", end: "2023-10-31", amount: 49, status: "Refunded", paymentDate: "2023-10-15", txn: "TXN123450" },
  { id: "INV-001227", patient: "James Anderson", email: "james.a@email.com", phone: "+1 (555) 777-4410", plan: "Family Plan", cycle: "Monthly", start: "2023-09-01", end: "2023-09-30", amount: 299, status: "Paid", paymentDate: "2023-09-01", txn: "TXN123449" },
  { id: "INV-001226", patient: "Isabella Thomas", email: "isabella.t@email.com", phone: "+1 (555) 888-2209", plan: "Basic Plan", cycle: "Monthly", start: "2023-08-01", end: "2023-08-31", amount: 29, status: "Paid", paymentDate: "2023-08-01", txn: "TXN123448" },
  { id: "INV-001225", patient: "Mason Jackson", email: "mason.j@email.com", phone: "+1 (555) 999-6103", plan: "Student Plan", cycle: "Monthly", start: "2023-07-01", end: "2023-07-31", amount: 39, status: "Paid", paymentDate: "2023-07-01", txn: "TXN123447" },
];

export const money = (n: number) => `$${n.toFixed(2)}`;

const STATUS_TONES: Record<InvoiceStatus, TagTone> = {
  Paid: "success",
  Pending: "warning",
  Overdue: "danger",
  Refunded: "neutral",
};

/* ---------- Tabs ---------- */
const TABS = [
  { label: "Invoices", href: "/manage/invoice" },
  { label: "Payments", href: "/manage/payments" },
  { label: "Refunds", href: "/manage/refunds" },
  { label: "Payment Methods", href: "/manage/payment-methods" },
  { label: "Reports", href: "/billing/reports" },
];

/* ---------- Filters ---------- */
const STATUS_FILTER = "All Status";
const PLAN_FILTER = "All Plans";
const STATUS_OPTIONS: FilterOption[] = ["Paid", "Pending", "Overdue", "Refunded"];
const PLAN_OPTIONS: FilterOption[] = Array.from(new Set(INVOICES.map((i) => i.plan)));
const PAGE_SIZE = 10;
const TOTAL_ITEMS = 128; // static stat; list pagination uses the filtered data

const checkboxCls =
  "h-4 w-4 cursor-pointer rounded border-border accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30";

/* ---------- Component ---------- */
const Invoice = () => {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [plan, setPlan] = useState("");
  const [dateRange, setDateRange] = useState<DateRange>({ start: "", end: "" });
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [viewId, setViewId] = useState<string | null>(null);
  const [isPanelClosing, setIsPanelClosing] = useState(false);

  const selected = INVOICES.find((i) => i.id === viewId) ?? null;

  useEffect(() => {
    if (selected) setIsPanelClosing(false);
  }, [selected]);

  const stats: StatItem[] = [
    { label: "Total Invoices", value: String(TOTAL_ITEMS), Icon: FileText, accent: "primary", tag: { text: "↑ 12%", tone: "success" } },
    { label: "Total Billed", value: "$24,850", Icon: DollarSign, accent: "success", tag: { text: "↑ 18%", tone: "success" } },
    { label: "Total Paid", value: "$22,300", Icon: CreditCard, accent: "violet", tag: { text: "↑ 15%", tone: "success" } },
    { label: "Outstanding", value: "$2,550", Icon: Clock, accent: "danger", tag: { text: "↓ 5%", tone: "danger" } },
  ];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return INVOICES.filter((i) => {
      if (q && !`${i.id} ${i.patient} ${i.plan}`.toLowerCase().includes(q)) return false;
      if (status && i.status !== status) return false;
      if (plan && i.plan !== plan) return false;
      if (dateRange.start && i.start < dateRange.start) return false;
      if (dateRange.end && i.start > dateRange.end) return false;
      return true;
    });
  }, [search, status, plan, dateRange]);

  const totalPages = Math.max(Math.ceil(filtered.length / PAGE_SIZE), 1);
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleFilterChange = (filterLabel: string, option: string) => {
    if (filterLabel === STATUS_FILTER) setStatus(option);
    else if (filterLabel === PLAN_FILTER) setPlan(option);
    setPage(1);
  };

  /* ---------- Selection (current page only) ---------- */
  const selectedOnPage = visible.filter((i) => selectedIds.has(i.id)).length;
  const allSelected = visible.length > 0 && selectedOnPage === visible.length;
  const someSelected = selectedOnPage > 0 && !allSelected;

  const toggleOne = (id: string) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const toggleAll = () => setSelectedIds(allSelected ? new Set() : new Set(visible.map((i) => i.id)));

  const columns: TableColumn[] = [
    {
      key: "select",
      label: "",
      className: "w-10",
      header: (
        <RadioCheckButtonh
          type="checkbox"
          checked={allSelected}
          ref={(el) => {
            if (el) el.indeterminate = someSelected;
          }}
          onChange={toggleAll}
          aria-label="Select all"
          className={checkboxCls}
        />
      ),
    },
    { key: "invoice", label: "Invoice #" },
    { key: "patient", label: "Patient Name" },
    { key: "plan", label: "Membership Plan" },
    { key: "period", label: "Billing Period" },
    { key: "amount", label: "Amount" },
    { key: "status", label: "Status" },
    { key: "paymentDate", label: "Payment Date" },
    {
      key: "actions",
      label: "Actions",
      header: <div className="flex w-full items-center justify-center">Actions</div>,
    },
  ];

  const rows = visible.map((i) => ({
    select: (
      <RadioCheckButtonh
        type="checkbox"
        checked={selectedIds.has(i.id)}
        onChange={() => toggleOne(i.id)}
        aria-label={`Select ${i.id}`}
        className={checkboxCls}
      />
    ),
    invoice: (
      <button
        type="button"
        onClick={() => setViewId(i.id)}
        className="cursor-pointer whitespace-nowrap text-sm font-medium text-primary hover:underline"
      >
        {i.id}
      </button>
    ),
    patient: <Content title={i.patient} />,
    plan: <Content title={i.plan} />,
    period: <Content title={`${formatDate(i.start)} - ${formatDate(i.end)}`} />,
    amount: <span className="whitespace-nowrap text-sm font-semibold text-heading">{money(i.amount)}</span>,
    status: <Tags text={i.status} tone={STATUS_TONES[i.status]} />,
    paymentDate: <Content title={i.paymentDate ? formatDate(i.paymentDate) : "—"} />,
    actions: (
      <div className="flex w-full items-center justify-center">
        <Actions
          actions={["view", "download", "more"]}
          onAction={(action) => {
            if (action === "view") setViewId(i.id);
            else console.log("invoice action:", action, i.id); // TODO: wire download / more menu
          }}
        />
      </div>
    ),
  }));

  return (
    <div className="relative w-full">
      {/* ================= LEFT: list ================= */}
      <div
        className={`mx-auto w-full min-w-0 max-w-[1600px] space-y-4 transition-all duration-300 ease-out sm:space-y-5 ${
          selected && !isPanelClosing ? "2xl:pr-[460px]" : ""
        }`}
      >
        {/* Title + actions */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-heading sm:text-xl 2xl:text-2xl">Billing and Invoice</h2>
            <p className="mt-0.5 text-sm text-body">Manage membership billing, invoices, payments and refunds.</p>
          </div>
          <AddButton
            text="Create Invoice"
            onClick={() => router.push("/manage/invoice/create")}
            className="w-fit shrink-0 whitespace-nowrap"
          />
    </div>

       

        <StatCards stats={stats} />

        <SearchAndFilter
          placeholder="Search by invoice number, patient name or plan..."
          value={search}
          onSearch={(value) => {
            setSearch(value);
            setPage(1);
          }}
          filters={[
            { label: STATUS_FILTER, options: STATUS_OPTIONS },
            { label: PLAN_FILTER, options: PLAN_OPTIONS },
          ]}
          selectedFilters={{ [STATUS_FILTER]: status, [PLAN_FILTER]: plan }}
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
              <TableStatus variant="empty" message="No invoices match your filters." />
            ) : (
              <Table columns={columns} rows={rows} bordered={false} />
            )}
          </div>

          {filtered.length > 0 && (
            <Pagination
              page={page}
              totalPages={totalPages}
              totalItems={filtered.length}
              pageSize={PAGE_SIZE}
              itemLabel="invoices"
              onChange={setPage}
            />
          )}
        </div>
      </div>

      {/* Right drawer */}
      <ViewInvoice
        invoice={selected}
        onClose={() => setViewId(null)}
        onCloseStart={() => setIsPanelClosing(true)}
      />
    </div>
  );
};

export default Invoice;
