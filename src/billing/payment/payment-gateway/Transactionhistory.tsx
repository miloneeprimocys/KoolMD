"use client";

import React, { useEffect, useMemo, useState } from "react";
import { CalendarDays, Download, Eye, FileText, Heart, MoreHorizontal, Receipt, RefreshCw, X } from "lucide-react";

import SearchAndFilter from "@/components/Searchandfilter";
import Table from "@/components/Table";
import { type TableColumn } from "@/components/Tableheader";
import Content from "@/components/Content";
import Tags, { type TagTone } from "@/components/Tags";
import Pagination from "@/components/Pagination";
import ImportButton from "@/components/ImportButton";
import RightSubSection from "@/components/RightSubSection";
import { cardCls } from "@/providers/Shared";
import { MethodIcon, type MethodKind } from "./Supportedmethods";

/* ---------- Types + static data (replace with API data later) ---------- */
type TxnStatus = "Succeeded" | "Failed" | "Refunded";
type TxnType = "Appointment Payment" | "Invoice Payment" | "Membership Payment";

type Txn = {
  id: string;
  date: string;
  time: string;
  patient: string;
  ptId: string;
  type: TxnType;
  method: MethodKind;
  methodLabel: string;
  amount: number;
  status: TxnStatus;
  provider: string;
  appointment: string;
  description: string;
};

const TXNS: Txn[] = [
  { id: "txn_9F3K2L7M8N1Q4R5S6", date: "Oct 28, 2026", time: "10:24 AM", patient: "Sarah Miller", ptId: "PT-00234", type: "Appointment Payment", method: "visa", methodLabel: "Visa •••• 4242", amount: 150, status: "Succeeded", provider: "Dr. Priya Sharma, MD", appointment: "Oct 28, 2026, 11:00 AM", description: "Primary care consultation" },
  { id: "txn_7H8D1P3K5M9T2W4X6", date: "Oct 27, 2026", time: "02:15 PM", patient: "James Wilson", ptId: "PT-00112", type: "Invoice Payment", method: "ach", methodLabel: "ACH Transfer", amount: 85, status: "Succeeded", provider: "Dr. Emily Carter, MD", appointment: "Oct 20, 2026, 09:30 AM", description: "Invoice INV-2026-0451" },
  { id: "txn_4K9M8Q2R5T7V1X3Z6", date: "Oct 25, 2026", time: "11:03 AM", patient: "Emily Roberts", ptId: "PT-00321", type: "Membership Payment", method: "apple", methodLabel: "Apple Pay", amount: 29.99, status: "Succeeded", provider: "Dr. Priya Sharma, MD", appointment: "—", description: "Monthly membership" },
  { id: "txn_1N5V4T8B2C6D9F3G7", date: "Oct 24, 2026", time: "09:48 AM", patient: "Michael Brown", ptId: "PT-00087", type: "Appointment Payment", method: "google", methodLabel: "Google Pay", amount: 120, status: "Failed", provider: "Dr. James Miller, MD", appointment: "Oct 24, 2026, 10:30 AM", description: "Cardiology consultation" },
  { id: "txn_6P2L9S4H7J1K5M8N3", date: "Oct 22, 2026", time: "04:30 PM", patient: "Linda Carter", ptId: "PT-00456", type: "Invoice Payment", method: "mastercard", methodLabel: "Mastercard •••• 5454", amount: 200, status: "Succeeded", provider: "Dr. Sarah Lee, MD", appointment: "Oct 15, 2026, 01:00 PM", description: "Invoice INV-2026-0433" },
  { id: "txn_0R7B3C8D5F2G9H4J1", date: "Oct 20, 2026", time: "01:12 PM", patient: "Robert Davis", ptId: "PT-00289", type: "Appointment Payment", method: "visa", methodLabel: "Visa •••• 1111", amount: 95, status: "Succeeded", provider: "Dr. Priya Sharma, MD", appointment: "Oct 20, 2026, 02:00 PM", description: "Follow-up consultation" },
  { id: "txn_5Z8K1N4M7Q2R6T9V3", date: "Oct 18, 2026", time: "03:20 PM", patient: "Jessica Taylor", ptId: "PT-00567", type: "Membership Payment", method: "ach", methodLabel: "ACH Transfer", amount: 49.99, status: "Refunded", provider: "Dr. Priya Sharma, MD", appointment: "—", description: "Annual membership" },
  { id: "txn_3D9P6M1S4V8X2B5C7", date: "Oct 15, 2026", time: "10:05 AM", patient: "David Harris", ptId: "PT-00098", type: "Invoice Payment", method: "apple", methodLabel: "Apple Pay", amount: 75, status: "Succeeded", provider: "Dr. Michael Chen, MD", appointment: "Oct 10, 2026, 11:30 AM", description: "Invoice INV-2026-0402" },
  { id: "txn_8L1Q2V5W9Y3A6E4H7", date: "Oct 12, 2026", time: "12:40 PM", patient: "Amanda White", ptId: "PT-00345", type: "Appointment Payment", method: "google", methodLabel: "Google Pay", amount: 110, status: "Succeeded", provider: "Dr. Sarah Lee, MD", appointment: "Oct 12, 2026, 01:30 PM", description: "Dermatology consultation" },
  { id: "txn_9M4T7B2N5C8F1J6K3", date: "Oct 10, 2026", time: "09:18 AM", patient: "Daniel Clark", ptId: "PT-00176", type: "Invoice Payment", method: "visa", methodLabel: "Visa •••• 3333", amount: 180, status: "Succeeded", provider: "Dr. Emily Carter, MD", appointment: "Oct 05, 2026, 10:00 AM", description: "Invoice INV-2026-0388" },
];

const STATUS_TONE: Record<TxnStatus, TagTone> = {
  Succeeded: "success",
  Failed: "danger",
  Refunded: "violet",
};

const TYPE_ICON: Record<TxnType, React.ElementType> = {
  "Appointment Payment": CalendarDays,
  "Invoice Payment": FileText,
  "Membership Payment": Heart,
};

const DATE_FILTER = "Oct 1, 2026 – Oct 31, 2026";
const TYPE_FILTER = "All Types";
const STATUS_FILTER = "All Statuses";
const METHOD_FILTER = "All Methods";
const PATIENT_FILTER = "All Patients";
const PROVIDER_FILTER = "All Providers";

const METHOD_NAMES = ["Visa", "Mastercard", "ACH Transfer", "Apple Pay", "Google Pay"];

const FILTERS = [
  { label: DATE_FILTER, options: ["Today", "Last 7 days", "Last 30 days", "This month"] },
  { label: TYPE_FILTER, options: ["Appointment Payment", "Invoice Payment", "Membership Payment"] },
  { label: STATUS_FILTER, options: ["Succeeded", "Failed", "Refunded"] },
  { label: METHOD_FILTER, options: METHOD_NAMES },
  { label: PATIENT_FILTER, options: Array.from(new Set(TXNS.map((t) => t.patient))) },
  { label: PROVIDER_FILTER, options: Array.from(new Set(TXNS.map((t) => t.provider))) },
];

const PAGE_SIZE = 10;
const TOTAL = 124;
const TOTAL_PAGES = 13;
const DETAILS_PANEL_DISMISSED_KEY = "billing-transaction-details-dismissed";

const money = (n: number) => `$${n.toFixed(2)}`;
const processingFee = (n: number) => n * 0.029 + 0.3;

const COLUMNS: TableColumn[] = [
  { key: "date", label: "Date & Time" },
  { key: "id", label: "Transaction ID" },
  { key: "patient", label: "Patient" },
  { key: "type", label: "Type" },
  { key: "method", label: "Method" },
  { key: "amount", label: "Amount" },
  { key: "status", label: "Status" },
  {
    key: "actions",
    label: "Actions",
    header: <div className="flex w-full items-center justify-center">Actions</div>,
  },
];

/* ---------- Detail panel (RightSubSection) ---------- */
const DetailRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="grid grid-cols-[120px_minmax(0,1fr)] gap-3 text-sm">
    <dt className="text-body">{label}</dt>
    <dd className="min-w-0 break-words text-heading">{children}</dd>
  </div>
);

const TransactionPanel = ({
  txn,
  isOpen,
  onClose,
}: {
  txn: Txn;
  isOpen: boolean;
  onClose: () => void;
}) => {
  const fee = processingFee(txn.amount);

  return (
    <RightSubSection
      ariaLabel="Transaction details"
      open={isOpen}
      reopenKey={txn.id}
      initiallyOpen={isOpen}
      onClose={onClose}
      width={400}
      className={cardCls}
    >
      {(closePanel) => (
        <>
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-base font-semibold text-heading">Transaction Details</h3>
            <button
              type="button"
              aria-label="Close details"
              onClick={closePanel}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-body transition-colors hover:bg-heading/5 hover:text-heading focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-4 space-y-1">
            <Tags text={txn.status} tone={STATUS_TONE[txn.status]} />
            <p className="pt-2 text-3xl font-bold tracking-tight text-heading">{money(txn.amount)}</p>
            <p className="text-sm text-body">{txn.type}</p>
          </div>

          <dl className="mt-5 space-y-2.5">
            <DetailRow label="Transaction ID">{txn.id}</DetailRow>
            <DetailRow label="Date & Time">
              {txn.date}, {txn.time}
            </DetailRow>
            <DetailRow label="Status">
              <span className="inline-flex items-center gap-2">
                <span
                  className={`h-2 w-2 rounded-full ${
                    txn.status === "Succeeded" ? "bg-success" : txn.status === "Failed" ? "bg-danger" : "bg-violet"
                  }`}
                />
                {txn.status}
              </span>
            </DetailRow>
            <DetailRow label="Payment Method">
              <span className="inline-flex items-center gap-2">
                <MethodIcon kind={txn.method} className="h-4 w-4" />
                {txn.methodLabel}
              </span>
            </DetailRow>
            <DetailRow label="Gateway">Stripe</DetailRow>
            <DetailRow label="Transaction Type">{txn.type}</DetailRow>
          </dl>

          <dl className="mt-5 space-y-2.5 border-t border-divider pt-5">
            <DetailRow label="Patient">
              <span className="block font-medium text-primary">{txn.patient}</span>
              <span className="block text-body">{txn.ptId}</span>
            </DetailRow>
            <DetailRow label="Provider">{txn.provider}</DetailRow>
            <DetailRow label="Appointment">
              {txn.appointment}
              {txn.appointment !== "—" && (
                <button
                  type="button"
                  className="mt-1 block cursor-pointer text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                >
                  View Appointment
                </button>
              )}
            </DetailRow>
          </dl>

          <dl className="mt-5 space-y-2.5 border-t border-divider pt-5">
            <DetailRow label="Description">{txn.description}</DetailRow>
            <DetailRow label="Subtotal">{money(txn.amount)}</DetailRow>
            <DetailRow label="Processing Fee">
              {money(fee)} (2.9% + $0.30)
            </DetailRow>
            <div className="grid grid-cols-[120px_minmax(0,1fr)] gap-3 text-sm font-semibold text-heading">
              <dt>Total Amount</dt>
              <dd>{money(txn.amount)}</dd>
            </div>
          </dl>

          <div className="mt-5 grid grid-cols-3 gap-2 border-t border-divider pt-4">
            <ImportButton
              text="Refund"
              icon={<RefreshCw className="h-4 w-4" />}
              onClick={() => {}}
              className="!h-9 !min-w-0 !w-full !px-2 !text-xs"
            />
            <ImportButton
              text="View Receipt"
              icon={<Receipt className="h-4 w-4" />}
              onClick={() => {}}
              className="!h-9 !min-w-0 !w-full !gap-1 !whitespace-nowrap !px-1 !text-[11px]"
            />
            <ImportButton
              text="More"
              icon={<MoreHorizontal className="h-4 w-4" />}
              onClick={() => {}}
              className="!h-9 !min-w-0 !w-full !px-2 !text-xs"
            />
          </div>
        </>
      )}
    </RightSubSection>
  );
};

/* ---------- Component ---------- */
const TransactionHistory = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const dismissed = window.sessionStorage.getItem(DETAILS_PANEL_DISMISSED_KEY) === "true";
    setSelectedId(window.matchMedia("(min-width: 1536px)").matches && !dismissed ? TXNS[0].id : null);
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const type = selectedFilters[TYPE_FILTER];
    const status = selectedFilters[STATUS_FILTER];
    const method = selectedFilters[METHOD_FILTER];
    const patient = selectedFilters[PATIENT_FILTER];
    const provider = selectedFilters[PROVIDER_FILTER];
    return TXNS.filter((t) => {
      if (type && t.type !== type) return false;
      if (status && t.status !== status) return false;
      if (method && !t.methodLabel.startsWith(method)) return false;
      if (patient && t.patient !== patient) return false;
      if (provider && t.provider !== provider) return false;
      if (q && !`${t.patient} ${t.provider} ${t.id} ${t.ptId}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [search, selectedFilters]);

  const isFiltered = Object.values(selectedFilters).some(Boolean) || !!search.trim();
  const totalItems = isFiltered ? filtered.length : TOTAL;
  const totalPages = isFiltered ? Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)) : TOTAL_PAGES;

  const selected = TXNS.find((t) => t.id === selectedId) ?? null;

  const rows = filtered.map((t) => {
    const TypeIcon = TYPE_ICON[t.type];
    const isSel = t.id === selectedId;
    return {
      date: (
        <button type="button" onClick={() => setSelectedId(t.id)} className="cursor-pointer text-left">
          <span className="block text-sm text-heading">{t.date}</span>
          <span className="block text-xs text-body">{t.time}</span>
        </button>
      ),
      id: (
        <button
          type="button"
          onClick={() => setSelectedId(t.id)}
          className={`block max-w-[110px] cursor-pointer truncate text-sm font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${
            isSel ? "text-primary" : "text-primary"
          }`}
          title={t.id}
        >
          {t.id}
        </button>
      ),
      patient: (
        <div className="min-w-0">
          <span className="block truncate text-sm font-medium text-heading">{t.patient}</span>
          <span className="block text-xs text-body">{t.ptId}</span>
        </div>
      ),
      type: (
        <div className="flex items-center gap-2">
          <TypeIcon className="h-4 w-4 shrink-0 text-primary" />
          <span className="text-xs text-heading">{t.type}</span>
        </div>
      ),
      method: (
        <div className="flex items-center gap-2">
          <span className="flex w-7 shrink-0 items-center justify-center">
            <MethodIcon kind={t.method} className="h-4 w-4" />
          </span>
          <span className="text-sm text-heading">{t.methodLabel}</span>
        </div>
      ),
      amount: <Content title={money(t.amount)} />,
      status: <Tags text={t.status} tone={STATUS_TONE[t.status]} />,
      actions: (
        <div className="flex w-full items-center justify-center">
          <button
            type="button"
            aria-label={`View transaction ${t.id}`}
            onClick={() => setSelectedId(t.id)}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-body transition-colors hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
          >
            <Eye className="h-4 w-4" />
          </button>
        </div>
      ),
    };
  });

  return (
    <div className="flex min-w-0 items-start gap-4 sm:gap-5">
      {/* ---------- Transactions list ---------- */}
      <section className={`${cardCls} min-w-0 flex-1 space-y-4`}>
        <SearchAndFilter
          placeholder="Search by patient, provider, transaction ID..."
          value={search}
          onSearch={(v: string) => {
            setSearch(v);
            setPage(1);
          }}
          filters={FILTERS}
          selectedFilters={selectedFilters}
          onFilterChange={(label: string, option: string) => {
            setSelectedFilters((p) => ({ ...p, [label]: option }));
            setPage(1);
          }}
          trailingFilterAction={
            <ImportButton
              text="Export"
              icon={<Download className="h-4 w-4" />}
              onClick={() => {}}
              className="!h-12 shrink-0 whitespace-nowrap"
            />
          }
          className="2xl:!flex-row 2xl:!flex-wrap 2xl:!items-start 2xl:!gap-x-2 2xl:!gap-y-2 2xl:[&>div:last-child]:!contents 2xl:[&>div:first-child]:!w-64 2xl:[&>div:first-child]:!flex-none 2xl:[&>div:last-child>div]:!w-[9.25rem] 2xl:[&>div:last-child>div]:!flex-none"
        />

        <div className="w-full min-w-0 overflow-hidden rounded-[14px] border border-border bg-card">
          {rows.length > 0 ? (
            <Table columns={COLUMNS} rows={rows} bordered={false} />
          ) : (
            <p className="px-4 py-10 text-center text-sm text-body">No transactions match your filters.</p>
          )}
        </div>

        <Pagination
          page={page}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={PAGE_SIZE}
          itemLabel="transactions"
          onChange={setPage}
        />
      </section>

      {/* ---------- Detail panel ---------- */}
      <TransactionPanel
        txn={selected ?? TXNS[0]}
        isOpen={Boolean(selected)}
        onClose={() => {
          setSelectedId(null);
          window.sessionStorage.setItem(DETAILS_PANEL_DISMISSED_KEY, "true");
        }}
      />
    </div>
  );
};

export default TransactionHistory;
