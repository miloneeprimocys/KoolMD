"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FileSpreadsheet } from "lucide-react";

import ImportButton from "@/components/ImportButton";
import Table from "@/components/Table";
import TableStatus from "@/components/TableStatus";
import { type TableColumn } from "@/components/Tableheader";
import Name from "@/components/Name";
import Content from "@/components/Content";
import Tags from "@/components/Tags";
import Actions from "@/components/Actions";
import Pagination from "@/components/Pagination";
import { fmtDate } from "./addlicense/Licenseinformation";

type AlertRow = {
  id: string;
  provider: string;
  licenseNumber: string;
  state: string;
  expiryDate: string; // yyyy-mm-dd
  daysLeft: number; // negative = already expired
};

/* TODO: replace with API data */
const ALERTS: AlertRow[] = [
  { id: "a1", provider: "Dr. Emily Wilson", licenseNumber: "C456789", state: "NY", expiryDate: "2024-04-30", daysLeft: 45 },
  { id: "a2", provider: "Dr. Priya Shah", licenseNumber: "E654321", state: "IL", expiryDate: "2023-11-04", daysLeft: -12 },
  { id: "a3", provider: "Dr. Robert Kim", licenseNumber: "G987654", state: "GA", expiryDate: "2025-02-28", daysLeft: 20 },
  { id: "a4", provider: "Dr. Amanda Clark", licenseNumber: "H112233", state: "TX", expiryDate: "2024-05-15", daysLeft: 60 },
  { id: "a5", provider: "Dr. Kevin Brooks", licenseNumber: "J778899", state: "FL", expiryDate: "2023-10-01", daysLeft: -46 },
];

const PAGE_SIZE = 10;

type SubTab = "soon" | "expired";

const ExpiredLicense = () => {
  const router = useRouter();
  const [tab, setTab] = useState<SubTab>("soon");
  const [page, setPage] = useState(1);

  const soon = useMemo(() => ALERTS.filter((a) => a.daysLeft >= 0), []);
  const expired = useMemo(() => ALERTS.filter((a) => a.daysLeft < 0), []);

  const list = tab === "soon" ? soon : expired;
  const totalPages = Math.max(Math.ceil(list.length / PAGE_SIZE), 1);
  const currentPage = Math.min(page, totalPages);
  const pageItems = list.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const columns: TableColumn[] = [
    { key: "provider", label: "Provider Name" },
    { key: "licenseNumber", label: "License Number" },
    { key: "state", label: "State" },
    { key: "expiryDate", label: "Expiry Date" },
    { key: "daysLeft", label: "Days Left" },
    { key: "status", label: "Status" },
    { key: "actions", label: "Actions", header: <div className="flex w-full items-center justify-center">Actions</div> },
  ];

  const rows = pageItems.map((a) => ({
    provider: <Name name={a.provider} />,
    licenseNumber: <Content title={a.licenseNumber} />,
    state: <Content title={a.state} />,
    expiryDate: <Content title={fmtDate(a.expiryDate)} />,
    daysLeft: <Tags text={String(a.daysLeft)} tone={a.daysLeft < 0 ? "danger" : "warning"} />,
    status: <Tags text={a.daysLeft < 0 ? "Expired" : "Expiring Soon"} tone={a.daysLeft < 0 ? "danger" : "warning"} />,
    actions: (
      <div className="flex w-full items-center justify-center">
        <Actions
          actions={["edit", "delete"]}
          onAction={(action) => {
            if (action === "edit") router.push("/provider/license-management/edit");
          }}
        />
      </div>
    ),
  }));

  const tabCls = (active: boolean) =>
    `-mb-px cursor-pointer border-b-2 pb-2.5 text-sm font-medium transition-colors ${
      active ? "border-primary text-primary" : "border-transparent text-body hover:text-heading"
    }`;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-heading sm:text-lg">Expiration Alerts</h2>
          <p className="mt-0.5 text-sm text-body">List of licenses that are expiring soon or expired.</p>
        </div>
        <ImportButton
          text="Export to Excel"
          icon={<FileSpreadsheet className="h-4 w-4" />}
          onClick={() => {
            /* TODO: export */
          }}
          className="shrink-0 whitespace-nowrap px-4"
        />
      </div>

      <div className="flex gap-6 border-b border-border">
        <button
          type="button"
          className={tabCls(tab === "soon")}
          onClick={() => {
            setTab("soon");
            setPage(1);
          }}
        >
          Expiring Soon ({soon.length})
        </button>
        <button
          type="button"
          className={tabCls(tab === "expired")}
          onClick={() => {
            setTab("expired");
            setPage(1);
          }}
        >
          Expired ({expired.length})
        </button>
      </div>

      <div className="space-y-3">
        <div className="overflow-hidden rounded-[14px] border border-border bg-card">
          {pageItems.length === 0 ? (
            <TableStatus variant="empty" message="No licenses found." />
          ) : (
            <Table columns={columns} rows={rows} bordered={false} />
          )}
        </div>

        {list.length > 0 && (
          <Pagination
            page={currentPage}
            totalPages={totalPages}
            totalItems={list.length}
            pageSize={PAGE_SIZE}
            itemLabel="records"
            onChange={setPage}
          />
        )}
      </div>
    </div>
  );
};

export default ExpiredLicense;


