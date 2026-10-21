"use client";

import React from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Droplets,
  FileText,
  MoreVertical,
} from "lucide-react";

import StatCards, { type StatItem } from "@/components/Statcards";
import SearchAndFilter from "@/components/Searchandfilter";
import Table from "@/components/Table";
import { type TableColumn } from "@/components/Tableheader";
import Actions from "@/components/Actions";
import Content from "@/components/Content";
import Tags, { type TagTone } from "@/components/Tags";
import {  labelCls } from "@/providers/Shared";

/* ---------- Priority toggle (Routine / STAT / Urgent) ---------- */
export const PRIORITIES = ["Routine", "STAT", "Urgent"] as const;
export type Priority = (typeof PRIORITIES)[number];

export const PriorityToggle = ({
  label,
  value,
  onChange,
}: {
  label: React.ReactNode;
  value: Priority;
  onChange: (p: Priority) => void;
}) => (
  <div className="w-full">
    <p className={labelCls}>{label}</p>
    <div role="radiogroup" className="grid grid-cols-3 gap-2">
      {PRIORITIES.map((p) => {
        const active = p === value;
        return (
          <button
            key={p}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(p)}
            className={`h-10 cursor-pointer rounded-lg border text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${
              active
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-card text-heading hover:border-primary/40 hover:bg-primary/5"
            }`}
          >
            {p}
          </button>
        );
      })}
    </div>
  </div>
);

/* ---------- Small table action buttons (also used by Results) ---------- */
export const ViewPill = ({
  label = "View",
  onClick,
}: {
  label?: string;
  onClick?: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className="inline-flex h-7 cursor-pointer items-center rounded-md bg-primary/10 px-3 text-xs font-medium text-primary transition-colors duration-200 hover:bg-primary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
  >
    {label}
  </button>
);

export const KebabButton = ({ label }: { label: string }) => (
  <button
    type="button"
    aria-label={label}
    className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-label transition-colors hover:bg-primary/10 hover:text-primary"
  >
    <MoreVertical className="h-3.5 w-3.5" />
  </button>
);

/* ---------- Stats (was "Lab Order Summary") ---------- */
const STATS: StatItem[] = [
  { label: "Total Orders", value: "24", Icon: FileText, accent: "primary" },
  { label: "Completed", value: "18", Icon: CheckCircle2, accent: "success" },
  { label: "Pending", value: "4", Icon: Clock, accent: "warning" },
  { label: "Abnormal Results", value: "3", Icon: AlertTriangle, accent: "danger" },
  { label: "Collected", value: "20", Icon: Droplets, accent: "violet" },
];


type TestGroup = { id: string; name: string; tests: string[] };

const TEST_GROUPS: TestGroup[] = [
  { id: "hematology", name: "Hematology", tests: ["Complete Blood Count (CBC)", "ESR", "Peripheral Smear"] },
  { id: "chemistry", name: "Chemistry", tests: ["Metabolic Panel", "Lipid Panel", "Liver Function Test"] },
  { id: "endocrinology", name: "Endocrinology", tests: ["Thyroid Panel", "HbA1c"] },
];

const FILTERS = [
  { label: "All Status", options: ["Completed", "Pending"] },
  { label: "Last 3 Months", options: ["Last 30 Days", "Last 3 Months", "Last 6 Months", "Last 12 Months"] },
];

type Order = {
  id: string;
  date: string;
  test: string;
  orderedBy: string;
  status: "Completed" | "Pending";
  result: "Normal" | "Abnormal" | "High" | "—";
};

const ORDERS: Order[] = [
  { id: "LAB-1008", date: "Oct 15, 2026", test: "Complete Blood Count (CBC)", orderedBy: "Dr. Emily Carter", status: "Completed", result: "Normal" },
  { id: "LAB-1007", date: "Oct 15, 2026", test: "Metabolic Panel", orderedBy: "Dr. Emily Carter", status: "Completed", result: "Abnormal" },
  { id: "LAB-1006", date: "Sep 10, 2026", test: "Lipid Panel", orderedBy: "Dr. James Miller", status: "Completed", result: "High" },
  { id: "LAB-1005", date: "Aug 22, 2026", test: "Thyroid Panel", orderedBy: "Dr. Emily Carter", status: "Pending", result: "—" },
  { id: "LAB-1004", date: "Jul 12, 2026", test: "HbA1c", orderedBy: "Dr. James Miller", status: "Completed", result: "Normal" },
  { id: "LAB-1003", date: "Jul 12, 2026", test: "Vitamin D", orderedBy: "Dr. Emily Carter", status: "Completed", result: "Normal" },
];

const STATUS_TONE: Record<Order["status"], TagTone> = {
  Completed: "success",
  Pending: "warning",
};
const RESULT_TONE: Record<string, TagTone> = {
  Normal: "success",
  Abnormal: "danger",
  High: "danger",
};

const COLUMNS: TableColumn[] = [
  { key: "id", label: "Order ID" },
  { key: "date", label: "Date" },
  { key: "test", label: "Test Name" },
  { key: "orderedBy", label: "Ordered By" },
  { key: "status", label: "Status" },
  { key: "result", label: "Result" },
  {
    key: "actions",
    label: "Actions",
    header: <div className="flex w-full items-center justify-center">Actions</div>,
  },
];



/* ---------- Component ---------- */
const LabOrders = () => {
  const rows = ORDERS.map((o) => ({
    id: <Content title={o.id} />,
    date: <Content title={o.date} />,
    test: <Content title={o.test} />,
    orderedBy: <Content title={o.orderedBy} />,
    status: <Tags text={o.status} tone={STATUS_TONE[o.status]} />,
    result:
      o.result === "—" ? (
        <span className="text-sm text-body">—</span>
      ) : (
        <Tags text={o.result} tone={RESULT_TONE[o.result] ?? "neutral"} />
      ),
    actions: (
      <div className="flex w-full items-center justify-center gap-1">
        <Actions actions={["view", "more"]} size="sm" />
      </div>
    ),
  }));

  return (
    <div className="space-y-4 sm:space-y-5">
 

      {/* ---------- Summary cards ---------- */}
      <StatCards stats={STATS} />

      {/* ---------- Orders table ---------- */}
      <section className="space-y-3">
        <h3 className="text-base font-semibold text-heading">Lab Orders</h3>
        <SearchAndFilter
          placeholder="Search orders..."
          filters={FILTERS}
          onSearch={() => {}}
          onFilterChange={() => {}}
        />
        <div className="overflow-hidden rounded-[14px] border border-border bg-card">
          <Table columns={COLUMNS} rows={rows} />
        </div>
      </section>
    </div>
  );
};

export default LabOrders;
