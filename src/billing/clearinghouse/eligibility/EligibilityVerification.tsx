"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, CheckCircle2, Clock, FileText, ShieldCheck, XCircle } from "lucide-react";

import Breadcrumb from "@/components/Breadcrumb";
import AddButton from "@/components/Addbutton";
import ImportButton from "@/components/ImportButton";
import StatCards, { type StatItem } from "@/components/Statcards";
import SearchAndFilter, { type DateRange } from "@/components/Searchandfilter";
import Table from "@/components/Table";
import TableStatus from "@/components/TableStatus";
import { type TableColumn } from "@/components/Tableheader";
import Content from "@/components/Content";
import Tags, { type TagTone } from "@/components/Tags";
import Actions from "@/components/Actions";
import Pagination from "@/components/Pagination";

import { PAYERS, PayerLogo } from "./checkeligibility/Patientinsurance";
import ViewEligibility from "./Vieweligibility";
import CheckEligibilityDrawer from "./CheckEligibilityDrawer";

/* ---------- Types + static data (replace with API data later) ---------- */
export type EligibilityStatus = "Eligible" | "Ineligible" | "Pending" | "Failed";

export type EligibilityRecord = {
  id: string;
  patientName: string;
  patientCode: string;
  payer: string;
  payerId: string;
  serviceDate: string;
  serviceISO: string; // used for the date-range filter
  requestedDate: string;
  requestedTime: string;
  status: EligibilityStatus;
};

export const RECORDS: EligibilityRecord[] = [
  { id: "ELG-2024-00123", patientName: "John Smith", patientCode: "#PT-000125", payer: "Blue Cross Blue Shield", payerId: "00324", serviceDate: "Apr 15, 2024", serviceISO: "2024-04-15", requestedDate: "Apr 14, 2024", requestedTime: "10:32 AM", status: "Eligible" },
  { id: "ELG-2024-00122", patientName: "Sarah Johnson", patientCode: "#PT-000126", payer: "Aetna", payerId: "60054", serviceDate: "Apr 14, 2024", serviceISO: "2024-04-14", requestedDate: "Apr 14, 2024", requestedTime: "09:15 AM", status: "Eligible" },
  { id: "ELG-2024-00121", patientName: "Michael Brown", patientCode: "#PT-000127", payer: "Cigna", payerId: "62308", serviceDate: "Apr 12, 2024", serviceISO: "2024-04-12", requestedDate: "Apr 12, 2024", requestedTime: "02:21 PM", status: "Ineligible" },
  { id: "ELG-2024-00120", patientName: "Emily Davis", patientCode: "#PT-000128", payer: "UnitedHealthcare", payerId: "87726", serviceDate: "Apr 10, 2024", serviceISO: "2024-04-10", requestedDate: "Apr 10, 2024", requestedTime: "11:08 AM", status: "Eligible" },
  { id: "ELG-2024-00119", patientName: "Robert Wilson", patientCode: "#PT-000129", payer: "Humana", payerId: "61101", serviceDate: "Apr 09, 2024", serviceISO: "2024-04-09", requestedDate: "Apr 09, 2024", requestedTime: "04:33 PM", status: "Pending" },
  { id: "ELG-2024-00118", patientName: "Jennifer Lee", patientCode: "#PT-000130", payer: "Medicare", payerId: "04106", serviceDate: "Apr 08, 2024", serviceISO: "2024-04-08", requestedDate: "Apr 08, 2024", requestedTime: "12:17 PM", status: "Eligible" },
  { id: "ELG-2024-00117", patientName: "David Martinez", patientCode: "#PT-000131", payer: "Medicaid", payerId: "71001", serviceDate: "Apr 08, 2024", serviceISO: "2024-04-08", requestedDate: "Apr 08, 2024", requestedTime: "10:05 AM", status: "Failed" },
  { id: "ELG-2024-00116", patientName: "Lisa Anderson", patientCode: "#PT-000132", payer: "Tricare", payerId: "87726", serviceDate: "Apr 05, 2024", serviceISO: "2024-04-05", requestedDate: "Apr 05, 2024", requestedTime: "09:42 AM", status: "Eligible" },
  { id: "ELG-2024-00115", patientName: "James Taylor", patientCode: "#PT-000133", payer: "Kaiser Permanente", payerId: "62141", serviceDate: "Apr 04, 2024", serviceISO: "2024-04-04", requestedDate: "Apr 04, 2024", requestedTime: "03:21 PM", status: "Ineligible" },
  { id: "ELG-2024-00114", patientName: "Maria Garcia", patientCode: "#PT-000134", payer: "Anthem", payerId: "00343", serviceDate: "Apr 03, 2024", serviceISO: "2024-04-03", requestedDate: "Apr 03, 2024", requestedTime: "11:56 AM", status: "Eligible" },
];

export const STATUS_TONE: Record<EligibilityStatus, TagTone> = {
  Eligible: "success",
  Ineligible: "danger",
  Pending: "info",
  Failed: "danger",
};

/* ---------- Filters ---------- */
const STATUS_FILTER = "All Statuses";
const PAYER_FILTER = "All Payers";
const STATUS_OPTIONS = ["Eligible", "Ineligible", "Pending", "Failed"];
const PAYER_OPTIONS = PAYERS.map((p) => p.name);
const PAGE_SIZE = 10;

/* ---------- Columns ---------- */
const COLUMNS: TableColumn[] = [
  { key: "id", label: "Request ID" },
  { key: "patient", label: "Patient" },
  { key: "payer", label: "Payer" },
  { key: "serviceDate", label: "Service Date" },
  { key: "requestedOn", label: "Requested On" },
  { key: "status", label: "Status" },
  {
    key: "actions",
    label: "Actions",
    header: <div className="flex w-full items-center justify-center">Actions</div>,
  },
];

const STATS: StatItem[] = [
  { label: "Total Requests", value: "142", Icon: FileText, accent: "primary", tag: { text: "↑ 12% vs last month", tone: "success" } },
  { label: "Eligible", value: "108", Icon: CheckCircle2, accent: "success", tag: { text: "76%", tone: "neutral" } },
  { label: "Ineligible", value: "18", Icon: XCircle, accent: "danger", tag: { text: "13%", tone: "neutral" } },
  { label: "Pending", value: "9", Icon: Clock, accent: "violet", tag: { text: "6%", tone: "neutral" } },
  { label: "Failed", value: "7", Icon: AlertTriangle, accent: "danger", tag: { text: "6%", tone: "neutral" } },
];

/* ---------- Page ---------- */
const EligibilityVerification = () => {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({ [STATUS_FILTER]: "", [PAYER_FILTER]: "" });
  const [dateRange, setDateRange] = useState<DateRange>({ start: "", end: "" });
  const [page, setPage] = useState(1);

  const [viewRecord, setViewRecord] = useState<EligibilityRecord | null>(null);
  const [isPanelClosing, setIsPanelClosing] = useState(false);
  const [editRecord, setEditRecord] = useState<EligibilityRecord | null>(null);
  const [isEditPanelClosing, setIsEditPanelClosing] = useState(false);

  const drawerOpen = !!viewRecord;
  const editDrawerOpen = !!editRecord;

  useEffect(() => {
    if (drawerOpen) setIsPanelClosing(false);
  }, [drawerOpen]);

  useEffect(() => {
    if (editDrawerOpen) setIsEditPanelClosing(false);
  }, [editDrawerOpen]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return RECORDS.filter((r) => {
      if (q && !`${r.patientName} ${r.payer} ${r.id}`.toLowerCase().includes(q)) return false;
      if (filters[STATUS_FILTER] && r.status !== filters[STATUS_FILTER]) return false;
      if (filters[PAYER_FILTER] && r.payer !== filters[PAYER_FILTER]) return false;
      if (dateRange.start && r.serviceISO < dateRange.start) return false;
      if (dateRange.end && r.serviceISO > dateRange.end) return false;
      return true;
    });
  }, [search, filters, dateRange]);

  const totalPages = Math.max(Math.ceil(filtered.length / PAGE_SIZE), 1);
  const safePage = Math.min(page, totalPages);
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const openView = (record: EligibilityRecord) => {
    setViewRecord(record);
  };

  const rows = visible.map((r) => ({
    id: (
      <button
        type="button"
        onClick={() => openView(r)}
        className="cursor-pointer whitespace-nowrap text-sm font-medium text-primary hover:underline"
      >
        {r.id}
      </button>
    ),
    patient: <Content title={r.patientName} description={r.patientCode} />,
    payer: (
      <div className="flex items-center gap-3">
        <PayerLogo name={r.payer} />
        <Content title={r.payer} description={`Payer ID: ${r.payerId}`} />
      </div>
    ),
    serviceDate: <Content title={r.serviceDate} />,
    requestedOn: <Content title={r.requestedDate} description={r.requestedTime} />,
    status: <Tags text={r.status} tone={STATUS_TONE[r.status]} />,
    actions: (
      <div className="flex w-full items-center justify-center gap-2">
        {r.status === "Failed" ? (
          <ImportButton
            text="Retry"
            icon={null}
            onClick={() => console.log("retry eligibility request", r.id) /* TODO: call your API here */}
            className="w-fit whitespace-nowrap"
          />
        ) : (
          <Actions
            actions={["view", "edit"]}
            onAction={(action) => {
              if (action === "view") {
                openView(r);
              } else if (action === "edit") {
                setEditRecord(r);
              }
            }}
          />
        )}
      </div>
    ),
  }));

  return (
    <div className="relative w-full">
      <div
        className={`mx-auto w-full min-w-0 max-w-[1600px] space-y-4 transition-all duration-300 ease-out sm:space-y-5 ${
          (drawerOpen && !isPanelClosing) || (editDrawerOpen && !isEditPanelClosing) ? "2xl:pr-[460px]" : ""
        }`}
      >
        <Breadcrumb
          items={[
            { label: "Billing", href: "/payment/payment-gateway" },
            { label: "Eligibility Verification" },
          ]}
        />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-heading sm:text-xl 2xl:text-2xl">Eligibility Verification</h2>
            <p className="mt-0.5 text-sm text-body">
              Check insurance eligibility and view past requests submitted through the configured clearinghouse.
            </p>
          </div>
          <AddButton
            text="Check Eligibility"
            icon={<ShieldCheck className="h-4 w-4" />}
            onClick={() => router.push("/payers/eligibility-verification/check")}
            className="w-fit shrink-0 whitespace-nowrap"
          />
        </div>

        <StatCards stats={STATS} />

        <SearchAndFilter
          placeholder="Search by patient name, payer, request ID..."
          value={search}
          onSearch={(v: string) => {
            setSearch(v);
            setPage(1);
          }}
          filters={[
            { label: STATUS_FILTER, options: STATUS_OPTIONS },
            { label: PAYER_FILTER, options: PAYER_OPTIONS },
          ]}
          selectedFilters={filters}
          onFilterChange={(label: string, value: string) => {
            setFilters((prev) => ({ ...prev, [label]: value }));
            setPage(1);
          }}
          showDateRange
          dateRange={dateRange}
          onDateRangeChange={(range) => {
            setDateRange(range);
            setPage(1);
          }}
        />

        <div className="space-y-3">
          <div className="overflow-hidden rounded-[14px] border border-border bg-card">
            {visible.length === 0 ? (
              <TableStatus variant="empty" message="No eligibility requests match your filters." />
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
              itemLabel="results"
              onChange={setPage}
            />
          )}
        </div>
      </div>

      <ViewEligibility
        record={viewRecord}
        onClose={() => setViewRecord(null)}
        onCloseStart={() => setIsPanelClosing(true)}
      />
      <CheckEligibilityDrawer
        open={editDrawerOpen}
        onClose={() => setEditRecord(null)}
        onCloseStart={() => setIsEditPanelClosing(true)}
        record={editRecord}
      />
    </div>
  );
};

export default EligibilityVerification;