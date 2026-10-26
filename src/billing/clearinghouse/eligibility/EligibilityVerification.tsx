"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";

import Breadcrumb from "@/components/Breadcrumb";
import AddButton from "@/components/Addbutton";
import { cardCls } from "@/providers/Shared";
import Table from "@/components/Table";
import { type TableColumn } from "@/components/Tableheader";
import Tags, { type TagTone } from "@/components/Tags";
import Pagination from "@/components/Pagination";
import Content from "@/components/Content";
import SearchAndFilter from "@/components/Searchandfilter";
import ViewEligibility from "./Vieweligibility";

/* ---------- Mock Data ---------- */
export type EligibilityStatus = "Eligible" | "Ineligible" | "Pending" | "Failed";

export type EligibilityRecord = {
  id: string;
  patientName: string;
  patientCode: string;
  payer: string;
  payerId: string;
  serviceDate: string;
  requestedOn: string;
  status: EligibilityStatus;
};

const MOCK_DATA: EligibilityRecord[] = [
  { id: "ELIG-202400123", patientName: "John Smith", patientCode: "PT-000123", payer: "Blue Cross Blue Shield", payerId: "00324", serviceDate: "Apr 15, 2024", requestedOn: "Apr 14, 2024 10:32 AM", status: "Eligible" },
  { id: "ELIG-202400122", patientName: "Sarah Johnson", patientCode: "PT-000126", payer: "Aetna", payerId: "60054", serviceDate: "Apr 14, 2024", requestedOn: "Apr 14, 2024 09:15 AM", status: "Eligible" },
  { id: "ELIG-202400121", patientName: "Michael Brown", patientCode: "PT-000127", payer: "Cigna", payerId: "62308", serviceDate: "Apr 12, 2024", requestedOn: "Apr 12, 2024 02:21 PM", status: "Ineligible" },
  { id: "ELIG-202400120", patientName: "Emily Davis", patientCode: "PT-000128", payer: "UnitedHealthcare", payerId: "87726", serviceDate: "Apr 10, 2024", requestedOn: "Apr 10, 2024 11:08 AM", status: "Eligible" },
  { id: "ELIG-202400119", patientName: "Robert Wilson", patientCode: "PT-000129", payer: "Humana", payerId: "61101", serviceDate: "Apr 09, 2024", requestedOn: "Apr 09, 2024 04:33 PM", status: "Pending" },
  { id: "ELIG-202400118", patientName: "Jennifer Lee", patientCode: "PT-000130", payer: "Medicare", payerId: "04106", serviceDate: "Apr 08, 2024", requestedOn: "Apr 08, 2024 12:17 PM", status: "Eligible" },
  { id: "ELIG-202400117", patientName: "David Martinez", patientCode: "PT-000131", payer: "Medicaid", payerId: "11001", serviceDate: "Apr 08, 2024", requestedOn: "Apr 08, 2024 10:05 AM", status: "Failed" },
  { id: "ELIG-202400116", patientName: "Lisa Anderson", patientCode: "PT-000132", payer: "Tricare", payerId: "87726", serviceDate: "Apr 05, 2024", requestedOn: "Apr 05, 2024 09:42 AM", status: "Eligible" },
  { id: "ELIG-202400115", patientName: "James Taylor", patientCode: "PT-000133", payer: "Kaiser Permanente", payerId: "02141", serviceDate: "Apr 04, 2024", requestedOn: "Apr 04, 2024 03:21 PM", status: "Ineligible" },
  { id: "ELIG-202400114", patientName: "Maria Garcia", patientCode: "PT-000134", payer: "Anthem", payerId: "00343", serviceDate: "Apr 03, 2024", requestedOn: "Apr 03, 2024 11:56 AM", status: "Eligible" },
];

const STATUS_TONE: Record<EligibilityStatus, TagTone> = {
  Eligible: "success",
  Ineligible: "danger",
  Pending: "warning",
  Failed: "danger",
};

const PAGE_SIZE = 10;

const COLUMNS: TableColumn[] = [
  { key: "id", label: "Request ID" },
  { key: "patient", label: "Patient" },
  { key: "payer", label: "Payer" },
  { key: "serviceDate", label: "Service Date" },
  { key: "requestedOn", label: "Requested On" },
  { key: "status", label: "Status" },
  { key: "actions", label: "Actions", className: "text-right" },
];

/* ---------- Page ---------- */
const EligibilityVerification = () => {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [viewRecord, setViewRecord] = useState<EligibilityRecord | null>(null);
  const [isClosing, setIsClosing] = useState(false);

  const handleCloseDrawer = () => {
    setIsClosing(true);
    setTimeout(() => {
      setViewRecord(null);
      setIsClosing(false);
    }, 300);
  };

  const filteredData = MOCK_DATA.filter((item) => {
    const q = search.toLowerCase();
    return (
      item.patientName.toLowerCase().includes(q) ||
      item.id.toLowerCase().includes(q) ||
      item.payer.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filteredData.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = filteredData.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const rows = pageRows.map((r) => ({
    id: <Content title={r.id} className="font-medium text-primary" />,
    patient: (
      <div>
        <p className="font-medium text-heading">{r.patientName}</p>
        <p className="text-xs text-body">{r.patientCode}</p>
      </div>
    ),
    payer: (
      <div>
        <p className="font-medium text-heading">{r.payer}</p>
        <p className="text-xs text-body">Payer ID: {r.payerId}</p>
      </div>
    ),
    serviceDate: <span className="text-sm text-heading">{r.serviceDate}</span>,
    requestedOn: <span className="text-sm text-body">{r.requestedOn}</span>,
    status: <Tags text={r.status} tone={STATUS_TONE[r.status]} />,
    actions: (
      <div className="flex justify-end gap-2">
        <button
          onClick={() => setViewRecord(r)}
          className="cursor-pointer text-sm font-medium text-primary hover:underline"
        >
          View Response
        </button>
      </div>
    ),
  }));

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-4 sm:space-y-5">
      <Breadcrumb items={[{ label: "Billing", href: "/payment/payment-gateway" }, { label: "Payers", href: "/payers/accounts" }, { label: "Eligibility Verification" }]} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-heading sm:text-xl 2xl:text-2xl">
            Eligibility Verification
          </h2>
          <p className="mt-0.5 text-sm text-body">
            Check insurance eligibility and view past requests submitted through the configured clearinghouse.
          </p>
        </div>
        <AddButton
          text="Check Eligibility"
          icon={<ShieldCheck className="h-4 w-4" />}
          onClick={() => router.push("/payers/eligibility-verification/check")}
        />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total Requests", value: "142", color: "text-primary" },
          { label: "Eligible", value: "108", color: "text-success" },
          { label: "Ineligible", value: "18", color: "text-danger" },
          { label: "Pending", value: "9", color: "text-warning" },
        ].map((stat) => (
          <div key={stat.label} className={`${cardCls} p-4 sm:p-5`}>
            <p className="text-sm text-body">{stat.label}</p>
            <p className={`mt-1 text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className={`${cardCls} min-w-0 space-y-4 sm:p-6`}>
        <SearchAndFilter
          placeholder="Search by patient name, payer, request ID..."
          value={search}
          onSearch={(v: string) => {
            setSearch(v);
            setPage(1);
          }}
          filters={[
            { label: "All Statuses", options: ["Eligible", "Ineligible", "Pending", "Failed"] },
            { label: "All Payers", options: ["Blue Cross Blue Shield", "Aetna", "Cigna", "UnitedHealthcare"] },
          ]}
          selectedFilters={{}}
          onFilterChange={() => {}}
          showDateRange={true}
        />

        <div className="w-full min-w-0 overflow-hidden rounded-[14px] border border-border bg-card">
          <Table columns={COLUMNS} rows={rows} bordered={false} />
        </div>

        <Pagination
          page={safePage}
          totalPages={totalPages}
          totalItems={filteredData.length}
          pageSize={PAGE_SIZE}
          itemLabel="requests"
          onChange={setPage}
        />
      </div>

      <ViewEligibility
        record={viewRecord}
        open={!!viewRecord}
        closing={isClosing}
        onClose={handleCloseDrawer}
      />
    </div>
  );
};

export default EligibilityVerification;