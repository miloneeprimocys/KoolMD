"use client";

import React, { useEffect, useMemo, useState } from "react";
import { CreditCard, Globe, Users, HandCoins, Shield, Landmark, Banknote, Wallet, FileText, TrendingUp } from "lucide-react";

import RadioCheckButtonh from "@/components/RadioCheckButtonh";
import StatCards, { type StatItem } from "@/components/Statcards";
import AddButton from "@/components/Addbutton";
import SearchAndFilter from "@/components/Searchandfilter";
import Table from "@/components/Table";
import TableStatus from "@/components/TableStatus";
import { type TableColumn } from "@/components/Tableheader";
import Name from "@/components/Name";
import Content from "@/components/Content";
import Tags, { type TagTone } from "@/components/Tags";
import Actions from "@/components/Actions";
import Pagination from "@/components/Pagination";
import Breadcrumb from "@/components/Breadcrumb";
import ViewPayments from "./Viewpayments";
export type PaymentStatus = "Paid" | "Pending" | "Failed" | "Refunded";

export type PaymentRow = {
  id: string;
  date: string;
  time: string;
  patient: string;
  dob: string;
  invoice: string;
  method: string;
  amount: number;
  status: PaymentStatus;
  txn: string;
};

const METHOD_ICONS: Record<string, React.ElementType> = {
  "Credit Card": CreditCard,
  Insurance: Shield,
  "ACH Transfer": Landmark,
  Cash: Banknote,
  "Online (Wallet)": Wallet,
  "Manual Entry": FileText,
};

const STATUS_TONES: Record<PaymentStatus, TagTone> = {
  Paid: "success",
  Pending: "warning",
  Failed: "danger",
  Refunded: "info",
};

const PAYMENTS: PaymentRow[] = [
  { id: "1", date: "Oct 28, 2024", time: "10:32 AM", patient: "Emily Carter", dob: "12/05/1988", invoice: "INV-2024-1045", method: "Credit Card", amount: 125, status: "Paid", txn: "txn_8F7D2K9" },
  { id: "2", date: "Oct 27, 2024", time: "02:15 PM", patient: "Michael Brown", dob: "03/14/1975", invoice: "INV-2024-1044", method: "Insurance", amount: 250, status: "Paid", txn: "txn_7G5H9L3" },
  { id: "3", date: "Oct 26, 2024", time: "11:20 AM", patient: "Sophia Williams", dob: "07/22/1992", invoice: "INV-2024-1043", method: "ACH Transfer", amount: 75, status: "Paid", txn: "txn_4K3P8M1" },
  { id: "4", date: "Oct 25, 2024", time: "04:10 PM", patient: "Daniel Miller", dob: "11/09/1980", invoice: "INV-2024-1042", method: "Cash", amount: 100, status: "Paid", txn: "txn_9L0N6Q2" },
  { id: "5", date: "Oct 24, 2024", time: "09:45 AM", patient: "Olivia Davis", dob: "01/18/1995", invoice: "INV-2024-1041", method: "Credit Card", amount: 320, status: "Pending", txn: "txn_6R2T7V4" },
  { id: "6", date: "Oct 22, 2024", time: "01:30 PM", patient: "William Garcia", dob: "05/03/1978", invoice: "INV-2024-1040", method: "Insurance", amount: 180, status: "Paid", txn: "txn_3V6X1Y8" },
  { id: "7", date: "Oct 21, 2024", time: "10:05 AM", patient: "Ava Martinez", dob: "09/27/1990", invoice: "INV-2024-1039", method: "Online (Wallet)", amount: 95, status: "Failed", txn: "txn_1Z9W4E6" },
  { id: "8", date: "Oct 20, 2024", time: "03:40 PM", patient: "James Wilson", dob: "04/11/1985", invoice: "INV-2024-1038", method: "Manual Entry", amount: 60, status: "Paid", txn: "txn_8Q3D5F9" },
  { id: "9", date: "Oct 18, 2024", time: "12:25 PM", patient: "Isabella Anderson", dob: "06/14/1993", invoice: "INV-2024-1037", method: "Credit Card", amount: 210, status: "Refunded", txn: "txn_5H7J2K6" },
  { id: "10", date: "Oct 16, 2024", time: "11:15 AM", patient: "Benjamin Thomas", dob: "02/28/1976", invoice: "INV-2024-1036", method: "Insurance", amount: 275, status: "Paid", txn: "txn_0P9L8N3" },
];

const METHOD_FILTER = "All Methods";
const STATUS_FILTER = "All Status";
const PAGE_SIZE = 10;
const TOTAL_ITEMS = 124;

const checkboxCls =
  "h-4 w-4 cursor-pointer rounded border-border accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30";

const money = (n: number) => `$${n.toFixed(2)}`;

const Payments = () => {
  const [search, setSearch] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({
    [METHOD_FILTER]: "",
    [STATUS_FILTER]: "",
  });
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [viewId, setViewId] = useState<string | null>(null);
  const [isPanelClosing, setIsPanelClosing] = useState(false);

  const selected = PAYMENTS.find((p) => p.id === viewId) ?? null;

  useEffect(() => {
    if (selected) setIsPanelClosing(false);
  }, [selected]);
  const filters = useMemo(
    () => [
      { label: METHOD_FILTER, options: Object.keys(METHOD_ICONS).map((m) => ({ value: m, label: m })) },
      { label: STATUS_FILTER, options: Object.keys(STATUS_TONES).map((s) => ({ value: s, label: s })) },
    ],
    [],
  );

  const stats: StatItem[] = [
    { label: "Total Payments", value: "$28,450.00", Icon: CreditCard, accent: "success", tag: { text: "↑ 12% vs last month", tone: "success" } },
    { label: "Online Payments", value: "$18,320.00", Icon: Globe, accent: "primary", tag: { text: "64% of total payments", tone: "neutral" } },
    { label: "In-Person Payments", value: "$7,680.00", Icon: Users, accent: "violet", tag: { text: "27% of total payments", tone: "neutral" } },
    { label: "Manual Payments", value: "$2,450.00", Icon: HandCoins, accent: "danger", tag: { text: "9% of total payments", tone: "neutral" } },
  ];

  const data = useMemo(() => {
    const q = search.trim().toLowerCase();
    return PAYMENTS.filter((p) => {
      if (q && ![p.patient, p.invoice, p.txn].some((v) => v.toLowerCase().includes(q))) return false;
      if (selectedFilters[METHOD_FILTER] && p.method !== selectedFilters[METHOD_FILTER]) return false;
      if (selectedFilters[STATUS_FILTER] && p.status !== selectedFilters[STATUS_FILTER]) return false;
      return true;
    });
  }, [search, selectedFilters]);

  const selectedOnPage = data.filter((p) => selectedIds.has(p.id)).length;
  const allSelected = data.length > 0 && selectedOnPage === data.length;
  const someSelected = selectedOnPage > 0 && !allSelected;

  const toggleOne = (id: string) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const toggleAll = () => setSelectedIds(allSelected ? new Set() : new Set(data.map((p) => p.id)));

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
    { key: "date", label: "Date" },
    { key: "patient", label: "Patient" },
    { key: "invoice", label: "Invoice #" },
    { key: "method", label: "Payment Method" },
    { key: "amount", label: "Amount" },
    { key: "status", label: "Status" },
    { key: "txn", label: "Transaction ID" },
    {
      key: "actions",
      label: "Actions",
      header: <div className="flex w-full items-center justify-center">Actions</div>,
    },
  ];

  const rows = data.map((p) => {
    const MethodIcon = METHOD_ICONS[p.method] ?? CreditCard;
    return {
      select: (
        <RadioCheckButtonh
          type="checkbox"
          checked={selectedIds.has(p.id)}
          onChange={() => toggleOne(p.id)}
          aria-label={`Select ${p.patient}`}
          className={checkboxCls}
        />
      ),
      date: <Content title={p.date} description={p.time} />,
      patient: <Name name={p.patient} sub={`DOB: ${p.dob}`} />,
      invoice: (
        <button
          type="button"
          onClick={() => setViewId(p.id)}
          className="cursor-pointer text-sm font-medium text-primary underline underline-offset-2"
        >
          {p.invoice}
        </button>
      ),
      method: (
        <div className="flex items-center gap-2 text-sm text-heading">
          <MethodIcon className="h-4 w-4 text-label" />
          {p.method}
        </div>
      ),
      amount: <Content title={money(p.amount)} />,
      status: <Tags text={p.status} tone={STATUS_TONES[p.status]} />,
      txn: <Content title={p.txn} />,
      actions: (
        <div className="flex w-full items-center justify-center">
          <Actions
            actions={["view", "download"]}
            onAction={(action) => {
              if (action === "view") setViewId(p.id);
              else console.log("payment action:", action, p.id); // TODO: wire download
            }}
          />
        </div>
      ),
    };
  });

  return (
    <div className="relative w-full">
    <div
      className={`mx-auto w-full min-w-0 max-w-[1600px] space-y-4 transition-all duration-300 ease-out sm:space-y-5 ${
        selected && !isPanelClosing ? "2xl:pr-[460px]" : ""
      }`}
    >
      <Breadcrumb items={[{ label: "Billing", href: "/payment/payment-gateway" }, { label: "Payments" }]} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-heading sm:text-lg 2xl:text-2xl">Payments</h2>
          <p className="mt-0.5 text-sm text-body">
            Track and manage all patient payments, including online, in-person and manual transactions.
          </p>
        </div>
        {/* <AddButton text="Record Payment" onClick={() => {}} /> */}
      </div>

      <StatCards stats={stats} />

      <SearchAndFilter
        placeholder="Search by patient name, invoice #, transaction ID..."
        filters={filters}
        value={search}
        onSearch={(v: string) => {
          setSearch(v);
          setPage(1);
        }}
        selectedFilters={selectedFilters}
        onFilterChange={(label: string, value: string) => {
          setSelectedFilters((prev) => ({ ...prev, [label]: value }));
          setPage(1);
        }}
        showDateRange
      />

      <div className="space-y-3">
        <div className="overflow-hidden rounded-[14px] border border-border bg-card">
          {data.length === 0 ? (
            <TableStatus variant="empty" message="No payments match your filters." />
          ) : (
            <Table columns={columns} rows={rows} bordered={false} />
          )}
        </div>

        {data.length > 0 && (
          <Pagination
            page={page}
            totalPages={Math.ceil(TOTAL_ITEMS / PAGE_SIZE)}
            totalItems={TOTAL_ITEMS}
            pageSize={PAGE_SIZE}
            itemLabel="payments"
            onChange={setPage}
          />
        )}
      </div>
    </div>

    <ViewPayments
      payment={selected}
      onClose={() => setViewId(null)}
      onCloseStart={() => setIsPanelClosing(true)}
    />
    </div>
  );
};

export default Payments;
