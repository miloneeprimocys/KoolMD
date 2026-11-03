"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  BookUser,
  Calendar,
  CheckCircle2,
  ClipboardList,
  Clock,
  FileText,
  History,
  Wallet,
  type LucideIcon,
} from "lucide-react";

import StatCards, { type StatItem } from "@/components/Statcards";
import Table from "@/components/Table";
import { type TableColumn } from "@/components/Tableheader";
import Content from "@/components/Content";
import Tags from "@/components/Tags";
import Actions from "@/components/Actions";
import Breadcrumb from "@/components/Breadcrumb";
import EditButton from "@/components/EditButton";
import { cardCls } from "@/providers/Shared";

/* ---------------------------------------------------------------- */
/*  Static data (replace with API / redux selector)                  */
/* ---------------------------------------------------------------- */
type PendingRow = { id: string; provider: string; period: string; amount: string };

const PENDING: PendingRow[] = [
  { id: "PS-1045", provider: "Dr. John Carter", period: "Oct 1 – Oct 31, 2026", amount: "$12,000" },
  { id: "PS-1044", provider: "Dr. Emily Rogers", period: "Oct 1 – Oct 31, 2026", amount: "$8,750" },
  { id: "PS-1043", provider: "MedStaff Agency", period: "Oct 1 – Oct 31, 2026", amount: "$25,000" },
];

const STATS: StatItem[] = [
  { label: "Total Payable", value: "$156,500", Icon: Wallet, accent: "primary" },
  { label: "Total Paid", value: "$108,750", Icon: CheckCircle2, accent: "success" },
  { label: "Pending Approval", value: "$24,300", Icon: Clock, accent: "warning" },
  { label: "Outstanding", value: "$23,450", Icon: AlertCircle, accent: "danger" },
];

/** These four cards are also the four entries of the "Compensation" sidebar group. */
const QUICK_ACTIONS: { title: string; subtitle: string; Icon: LucideIcon; href: string }[] = [
  { title: "Provider Directory", subtitle: "Manage providers", Icon: BookUser, href: "/compensation/provider-directory" },
  { title: "Compensation Agreements", subtitle: "Set rates & terms", Icon: FileText, href: "/compensation/agreement" },
  { title: "Generate Payment Sheet", subtitle: "Create payment", Icon: ClipboardList, href: "/compensation/generate-payment-sheet" },
  { title: "Payment History", subtitle: "View transactions", Icon: History, href: "/compensation/payment-history" },
];

const COLUMNS: TableColumn[] = [
  { key: "sheet", label: "Sheet #" },
  { key: "provider", label: "Provider" },
  { key: "period", label: "Period" },
  { key: "amount", label: "Amount" },
  { key: "status", label: "Status" },
  { key: "actions", label: "Actions", header: <div className="flex w-full items-center justify-center">Actions</div> },
];

/* ---------------------------------------------------------------- */
/*  Component                                                        */
/* ---------------------------------------------------------------- */
const CompensationDashboard = () => {
  const router = useRouter();

  const rows = PENDING.map((p) => ({
    sheet: <Content title={p.id} />,
    provider: <Content title={p.provider} />,
    period: <Content title={p.period} />,
    amount: <Content title={p.amount} />,
    status: <Tags text="Pending Review" tone="warning" size="xs" />,
    actions: (
      <div className="flex w-full items-center justify-center">
        <Actions
          actions={["view"]}
          size="sm"
          onAction={(action) => {
            if (action === "view") router.push(`/compensation/payment-sheet-review?id=${encodeURIComponent(p.id)}`);
          }}
        />
      </div>
    ),
  }));

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-4 sm:space-y-5">
      <Breadcrumb items={[{ label: "Dashboard", href: "/dashboard" }, { label: "Finance & Payments" }, { label: "Compensation" }]} />

      {/* Title + period */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-heading sm:text-xl 2xl:text-2xl">Provider Compensation</h2>
          <p className="mt-0.5 text-sm text-body">Overview, KPIs, quick actions and pending approvals.
            
          </p>
        </div>
        <span className="inline-flex h-11 items-center gap-2 rounded-xl border border-border bg-card px-4 text-sm text-heading">
          <Calendar className="h-4 w-4 text-body" />
          Oct 1, 2026 – Oct 31, 2026
        </span>
      </div>
      <StatCards stats={STATS} />
      {/* Pending approvals */} 
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-base font-semibold text-heading">Pending Approvals ({PENDING.length})</h3>
          <EditButton
            section="Pending Approvals"
            variant="viewAll"
            onEdit={() => router.push("/compensation/payment-history")}
          />
        </div>
        <div className="overflow-hidden rounded-[14px] border border-border bg-card">
          <Table columns={COLUMNS} rows={rows} bordered={false} />
        </div>
      </section>
    </div>
  );
};

export default CompensationDashboard;