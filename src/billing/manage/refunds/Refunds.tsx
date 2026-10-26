"use client";

import React, { useMemo, useState , useEffect } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, CheckCircle2, Clock, XCircle, Settings, CreditCard, Landmark, Wallet, Banknote } from "lucide-react";

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
import ViewRefund from "./Viewrefund";
export type RefundStatus = "Completed" | "Pending" | "Failed" | "Cancelled";

export type RefundRow = {
  id: string;
  refundId: string;
  date: string;
  time: string;
  patient: string;
  invoice: string;
  method: string;
  amount: number;
  status: RefundStatus;
  reason: string;
  processedBy: string;
};

const METHOD_ICONS: Record<string, React.ElementType> = {
  "Credit Card": CreditCard,
  ACH: Landmark,
  "Online (Wallet)": Wallet,
  Cash: Banknote,
};

const STATUS_TONES: Record<RefundStatus, TagTone> = {
  Completed: "success",
  Pending: "warning",
  Failed: "danger",
  Cancelled: "danger",
};

const REFUNDS: RefundRow[] = [
  { id: "1", refundId: "REF-2024-1024", date: "Oct 28, 2024", time: "10:32 AM", patient: "Emily Carter", invoice: "INV-2024-1045", method: "Credit Card", amount: 125, status: "Completed", reason: "Appointment cancelled", processedBy: "Sarah J." },
  { id: "2", refundId: "REF-2024-1023", date: "Oct 27, 2024", time: "02:15 PM", patient: "Michael Brown", invoice: "INV-2024-1044", method: "ACH", amount: 250, status: "Pending", reason: "Overpayment", processedBy: "David R." },
  { id: "3", refundId: "REF-2024-1022", date: "Oct 26, 2024", time: "11:20 AM", patient: "Sophia Williams", invoice: "INV-2024-1043", method: "Credit Card", amount: 75, status: "Completed", reason: "Service not rendered", processedBy: "Sarah J." },
  { id: "4", refundId: "REF-2024-1021", date: "Oct 25, 2024", time: "04:10 PM", patient: "Daniel Miller", invoice: "INV-2024-1042", method: "Online (Wallet)", amount: 100, status: "Completed", reason: "Duplicate payment", processedBy: "Admin" },
  { id: "5", refundId: "REF-2024-1020", date: "Oct 24, 2024", time: "09:45 AM", patient: "Olivia Davis", invoice: "INV-2024-1041", method: "ACH", amount: 320, status: "Failed", reason: "Payment processing error", processedBy: "System" },
  { id: "6", refundId: "REF-2024-1019", date: "Oct 22, 2024", time: "01:30 PM", patient: "William Garcia", invoice: "INV-2024-1040", method: "Credit Card", amount: 180, status: "Completed", reason: "Insurance adjustment", processedBy: "David R." },
  { id: "7", refundId: "REF-2024-1018", date: "Oct 21, 2024", time: "10:05 AM", patient: "Ava Martinez", invoice: "INV-2024-1039", method: "Cash", amount: 95, status: "Pending", reason: "Patient request", processedBy: "Sarah J." },
  { id: "8", refundId: "REF-2024-1017", date: "Oct 20, 2024", time: "03:40 PM", patient: "James Wilson", invoice: "INV-2024-1038", method: "Credit Card", amount: 60, status: "Completed", reason: "Billing error", processedBy: "Admin" },
  { id: "9", refundId: "REF-2024-1016", date: "Oct 18, 2024", time: "12:25 PM", patient: "Isabella Anderson", invoice: "INV-2024-1037", method: "ACH", amount: 210, status: "Cancelled", reason: "Patient no longer needed", processedBy: "David R." },
  { id: "10", refundId: "REF-2024-1015", date: "Oct 16, 2024", time: "11:15 AM", patient: "Benjamin Thomas", invoice: "INV-2024-1036", method: "Online (Wallet)", amount: 275, status: "Completed", reason: "Overpayment", processedBy: "Sarah J." },
];

const METHOD_FILTER = "All Methods";
const STATUS_FILTER = "All Status";
const PAGE_SIZE = 10;
const TOTAL_ITEMS = 24;

const checkboxCls =
  "h-4 w-4 cursor-pointer rounded border-border accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30";

const money = (n: number) => `$${n.toFixed(2)}`;
const linkCls = "text-sm font-medium text-primary underline underline-offset-2";

const Refunds = () => {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({
  [METHOD_FILTER]: "",
    [STATUS_FILTER]: "",
  });
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [viewId, setViewId] = useState<string | null>(null);
  const [isPanelClosing, setIsPanelClosing] = useState(false);

  const selected = REFUNDS.find((r) => r.id === viewId) ?? null;

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
    { label: "Total Refunds", value: "$4,850.00", Icon: RefreshCw, accent: "violet", tag: { text: "24 refunds", tone: "neutral" } },
    { label: "Completed Refunds", value: "$3,920.00", Icon: CheckCircle2, accent: "success", tag: { text: "18 refunds", tone: "neutral" } },
    { label: "Pending Refunds", value: "$680.00", Icon: Clock, accent: "primary", tag: { text: "4 refunds", tone: "neutral" } },
    { label: "Failed/Cancelled", value: "$250.00", Icon: XCircle, accent: "danger", tag: { text: "2 refunds", tone: "neutral" } },
  ];

  const data = useMemo(() => {
    const q = search.trim().toLowerCase();
    return REFUNDS.filter((r) => {
      if (q && ![r.patient, r.invoice, r.refundId].some((v) => v.toLowerCase().includes(q))) return false;
      if (selectedFilters[METHOD_FILTER] && r.method !== selectedFilters[METHOD_FILTER]) return false;
      if (selectedFilters[STATUS_FILTER] && r.status !== selectedFilters[STATUS_FILTER]) return false;
      return true;
    });
  }, [search, selectedFilters]);

  const selectedOnPage = data.filter((r) => selectedIds.has(r.id)).length;
  const allSelected = data.length > 0 && selectedOnPage === data.length;
  const someSelected = selectedOnPage > 0 && !allSelected;

  const toggleOne = (id: string) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const toggleAll = () => setSelectedIds(allSelected ? new Set() : new Set(data.map((r) => r.id)));

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
    { key: "refundId", label: "Refund ID" },
    { key: "date", label: "Date" },
    { key: "patient", label: "Patient" },
    { key: "invoice", label: "Original Invoice" },
    { key: "method", label: "Refund Method" },
    { key: "amount", label: "Amount" },
    { key: "status", label: "Status" },
    { key: "reason", label: "Reason" },
    { key: "processedBy", label: "Processed By" },
    {
      key: "actions",
      label: "Actions",
      header: <div className="flex w-full items-center justify-center">Actions</div>,
    },
  ];

  const rows = data.map((r) => {
    const MethodIcon = METHOD_ICONS[r.method] ?? CreditCard;
    return {
      select: (
        <RadioCheckButtonh
          type="checkbox"
          checked={selectedIds.has(r.id)}
          onChange={() => toggleOne(r.id)}
          aria-label={`Select ${r.refundId}`}
          className={checkboxCls}
        />
      ),
      refundId: (
        <button type="button" onClick={() => setViewId(r.id)} className={`cursor-pointer ${linkCls}`}>
          {r.refundId}
        </button>
      ),
      date: <Content title={r.date} description={r.time} />,
      patient: <Name name={r.patient} />,
      invoice: (
        <a href="#" className={linkCls}>
          {r.invoice}
        </a>
      ),
      method: (
        <div className="flex items-center gap-2 text-sm text-heading">
          <MethodIcon className="h-4 w-4 text-label" />
          {r.method}
        </div>
      ),
      amount: <Content title={money(r.amount)} />,
      status: <Tags text={r.status} tone={STATUS_TONES[r.status]} />,
      reason: <Content title={r.reason} />,
      processedBy: <Content title={r.processedBy} />,
      actions: (
        <div className="flex w-full items-center justify-center">
          <Actions
            actions={["view", "download"]}
            onAction={(action) => {
              if (action === "view") setViewId(r.id);
              else console.log("refund action:", action, r.id); // TODO: wire download
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
      <Breadcrumb items={[{ label: "Billing", href: "/payment/payment-gateway" }, { label: "Refunds" }]} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-heading sm:text-lg 2xl:text-2xl">Refunds</h2>
          <p className="mt-0.5 text-sm text-body">
            Manage patient refunds, track status and process new refunds.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <AddButton text="Create Refund" onClick={() => router.push("/manage/refunds/create")} />
          <button
            type="button"
            onClick={() => router.push("/payment/payment-gateway/refund-settings")}
            className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 text-sm font-medium text-heading transition-colors hover:bg-primary/5"
          >
            <Settings className="h-4 w-4" />
            Refund Settings
          </button>
        </div>
      </div>

      <StatCards stats={stats} />

      <SearchAndFilter
        placeholder="Search by patient name, invoice #, refund ID..."
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
            <TableStatus variant="empty" message="No refunds match your filters." />
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
            itemLabel="refunds"
            onChange={setPage}
          />
        )}
      </div>
    </div>

    <ViewRefund
      refund={selected}
      onClose={() => setViewId(null)}
      onCloseStart={() => setIsPanelClosing(true)}
    />
    </div>
  );
};

export default Refunds;
