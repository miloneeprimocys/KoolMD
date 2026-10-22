"use client";

import React, { useLayoutEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, ArrowDown, RefreshCw, XCircle } from "lucide-react";

import Table from "@/components/Table";
import { type TableColumn } from "@/components/Tableheader";
import Content from "@/components/Content";
import Tags from "@/components/Tags";
import Actions from "@/components/Actions";
import Pagination from "@/components/Pagination";
import EditButton from "@/components/EditButton";
import ImportButton from "@/components/ImportButton";
import SearchAndFilter from "@/components/Searchandfilter";
import RightSubSection from "@/components/RightSubSection";
import { cardCls } from "@/providers/Shared";
import IntegrationSidebar, {
  ACTIVITY_ICON,
  LOG_STATUS_TONE,
  StepHeader,
  type ActivityLog,
} from "./Integrationsidebar";

const TYPE_OPTIONS = ["Test Connection", "Lab Order Sent", "Results Received", "Status Update", "Mapping Sync", "API Request"];
const STATUS_OPTIONS = ["Success", "Warning", "Failed"];
const PAGE_SIZE = 10;
const TOTAL_LOGS = 142;

const LOGS: ActivityLog[] = [
  { id: 1, date: "Oct 16, 2026 10:25 AM", type: "Test Connection", description: "Connection test completed successfully", status: "Success", responseTime: "1.2 s", user: "Admin User" },
  {
    id: 2,
    date: "Oct 16, 2026 10:20 AM",
    type: "Lab Order Sent",
    description: "Order #ORD12345 sent to lab system",
    status: "Success",
    responseTime: "842 ms",
    user: "Dr. Smith",
    details: {
      requestId: "REQ-20261016-000123",
      orderId: "ORD12345",
      patient: "John Smith (MRN: P001234)",
      provider: "Dr. Emily Carter (NPI: 1234567890)",
      endpoint: "POST /fhir/ServiceRequest",
      environment: "Production",
      payload: `{
  "resourceType": "ServiceRequest",
  "subject": {
    "reference": "Patient/P001234"
  },
  "code": {
    "text": "Complete Blood Count"
  },
  "requester": {
    "reference": "Practitioner/1234567890"
  }
}`,
      response: `{
  "status": "success",
  "orderId": "LAB987654",
  "message": "Order created successfully"
}`,
    },
  },
  { id: 3, date: "Oct 16, 2026 10:18 AM", type: "Results Received", description: "5 result records received (Order #ORD12345)", status: "Success", responseTime: "1.6 s", user: "System" },
  { id: 4, date: "Oct 16, 2026 09:45 AM", type: "Status Update", description: "Order status updated to Completed", status: "Success", responseTime: "320 ms", user: "System" },
  { id: 5, date: "Oct 16, 2026 09:30 AM", type: "Mapping Sync", description: "Field mapping validated", status: "Success", responseTime: "210 ms", user: "Admin User" },
  { id: 6, date: "Oct 15, 2026 04:12 PM", type: "API Request", description: "GET /orders/{id}", status: "Success", responseTime: "580 ms", user: "System" },
  { id: 7, date: "Oct 15, 2026 03:48 PM", type: "API Request", description: "Timeout while fetching results (Retry 1)", status: "Warning", responseTime: "5.2 s", user: "System" },
  { id: 8, date: "Oct 15, 2026 03:45 PM", type: "API Request", description: "Authentication failed (Invalid token)", status: "Failed", responseTime: "420 ms", user: "System" },
  { id: 9, date: "Oct 15, 2026 11:20 AM", type: "Results Received", description: "3 result records received (Order #ORD12340)", status: "Success", responseTime: "1.1 s", user: "System" },
  { id: 10, date: "Oct 15, 2026 10:02 AM", type: "Lab Order Sent", description: "Order #ORD12340 sent to lab system", status: "Success", responseTime: "760 ms", user: "Dr. Smith" },
];

const COLUMNS: TableColumn[] = [
  { key: "n", label: "#", className: "w-10" },
  {
    key: "date",
    label: "Date & Time",
    header: (
      <span className="inline-flex items-center gap-1">
        Date &amp; Time <ArrowDown className="h-3.5 w-3.5" />
      </span>
    ),
  },
  { key: "type", label: "Activity Type" },
  { key: "description", label: "Description" },
  { key: "status", label: "Status" },
  { key: "time", label: "Response Time" },
  { key: "user", label: "User" },
  {
    key: "actions",
    label: "Actions",
    header: <div className="flex w-full items-center justify-center">Actions</div>,
  },
];

const ActivityLogs = () => {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<ActivityLog | null>(LOGS[1]);
  const [leftPanelHeight, setLeftPanelHeight] = useState(0);
  const [rightPanelHeight, setRightPanelHeight] = useState(0);
  const leftPanelRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const panel = leftPanelRef.current;
    if (!panel) return;

    const measure = () => setLeftPanelHeight(panel.getBoundingClientRect().height);
    const observer = new ResizeObserver(measure);
    observer.observe(panel);
    window.addEventListener("resize", measure);
    measure();

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return LOGS.filter((l) => {
      if (type && l.type !== type) return false;
      if (status && l.status !== status) return false;
      if (q && !`${l.description} ${l.type} ${l.user}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [search, type, status]);

  const isFiltered = !!(search.trim() || type || status);
  const totalItems = isFiltered ? filtered.length : TOTAL_LOGS;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));

  const clearFilters = () => {
    setSearch("");
    setType("");
    setStatus("");
    setPage(1);
  };

  const rows = filtered.map((l, i) => {
    const meta = ACTIVITY_ICON[l.type] ?? ACTIVITY_ICON["API Request"];
    const Icon = l.status === "Failed" ? XCircle : l.status === "Warning" ? AlertCircle : meta.icon;
    const tone = l.status === "Failed" ? "text-danger" : l.status === "Warning" ? "text-warning" : meta.tone;
    return {
      n: <Content title={String(i + 1)} />,
      date: <Content title={l.date} truncate />,
      type: (
        <span className="flex min-w-0 items-center gap-2">
          <Icon className={`h-4 w-4 shrink-0 ${tone}`} />
          <Content title={l.type} truncate />
        </span>
      ),
      description: <Content title={l.description} truncate />,
      status: <Tags text={l.status} tone={LOG_STATUS_TONE[l.status]} />,
      time: <Content title={l.responseTime} />,
      user: <Content title={l.user} truncate />,
      actions: (
        <div className="flex w-full items-center justify-center">
          <Actions
            actions={["view"]}
            onAction={() => setSelected((cur) => (cur?.id === l.id ? null : l))}
          />
        </div>
      ),
    };
  });

  return (
    <div
      className="flex min-w-0 flex-col gap-4 sm:gap-5 2xl:flex-row 2xl:items-stretch"
    >
      <section
        ref={leftPanelRef}
        className={`${cardCls} min-w-0 flex-1 space-y-4 sm:p-6 ${
          selected && leftPanelHeight > 0 && rightPanelHeight > leftPanelHeight
            ? "2xl:sticky 2xl:top-4 2xl:self-start"
            : ""
        }`}
      >
        <StepHeader
          title="Activity Logs"
          subtitle="View all integration activities, API requests, responses and system events."
          actions={
            <ImportButton
              text="Refresh"
              icon={<RefreshCw className="h-4 w-4" />}
              onClick={() => {
                // TODO: refetch logs
              }}
            />
          }
        />

        {/* Filters */}
        <div className="min-w-0">
          <SearchAndFilter
            placeholder="Search by request ID, message..."
            value={search}
            onSearch={(v: string) => {
              setSearch(v);
              setPage(1);
            }}
            filters={[
              { label: "All Types", options: TYPE_OPTIONS },
              { label: "All Statuses", options: STATUS_OPTIONS },
            ]}
            selectedFilters={{ "All Types": type, "All Statuses": status }}
            onFilterChange={(label: string, option: string) => {
              if (label === "All Types") setType(option);
              else if (label === "All Statuses") setStatus(option);
              setPage(1);
            }}
            filterLayout="grid"
            trailingFilterAction={
              <EditButton
                section="filters"
                variant="viewAll"
                label="Clear"
                hideIcon
                onEdit={clearFilters}
                className="shrink-0 justify-self-start whitespace-nowrap !h-10 !text-sm"
              />
            }
          />
        </div>

        {/* Table */}
        <div className="space-y-3">
          <div className="w-full min-w-0 overflow-hidden rounded-[14px] border border-border bg-card">
            {rows.length > 0 ? (
              <Table columns={COLUMNS} rows={rows} bordered={false} />
            ) : (
              <p className="px-4 py-10 text-center text-sm text-body">No logs match your filters.</p>
            )}
          </div>
          <Pagination
            page={page}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={PAGE_SIZE}
            itemLabel="logs"
            onChange={setPage}
          />
        </div>
      </section>

      {selected && (
        <RightSubSection
          ariaLabel="Activity log details"
          reopenKey={selected.id}
          onClose={() => setSelected(null)}
          onHeightChange={setRightPanelHeight}
          width={380}
          className="!border-0 !bg-transparent !shadow-none 2xl:sticky 2xl:top-4 2xl:self-start"
        >
          {(closePanel) => (
            <IntegrationSidebar
              variant="logs"
              log={selected}
              onCloseLog={closePanel}
            />
          )}
        </RightSubSection>
      )}
    </div>
  );
};

export default ActivityLogs;
