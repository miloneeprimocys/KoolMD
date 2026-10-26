"use client";

import React, { useState } from "react";
import { Check, CheckCircle2, Copy } from "lucide-react";

import Table from "@/components/Table";
import { type TableColumn } from "@/components/Tableheader";
import Content from "@/components/Content";
import Tags, { type TagTone } from "@/components/Tags";
import EditButton from "@/components/EditButton";       
import { cardCls } from "@/providers/Shared";
import type { ClearinghouseAccount } from "../ClearinghouseAccounts";

/* ---------- Static data (replace with API data later) ---------- */
const FEATURES = [
  "Insurance Eligibility Verification",
  "Claim Submission (Professional - CMS 1500)",
  "Claim Status Retrieval",
  "Patient/Member Information",
  "Payer List",
];

type Activity = {
  no: number;
  date: string;
  activity: string;
  status: "Success" | "Failed";
  details: string;
  by: string;
};

const ACTIVITY: Activity[] = [
  { no: 1, date: "Oct 20, 2026, 10:25 AM", activity: "Auto Sync", status: "Success", details: "Account synchronized successfully.", by: "System" },
  { no: 2, date: "Oct 19, 2026, 04:30 PM", activity: "Test Connection", status: "Success", details: "Connection successful. Response time: 420 ms.", by: "Dr. Sarah Wilson" },
  { no: 3, date: "Oct 15, 2026, 01:14 PM", activity: "Claim Submission", status: "Success", details: "Claim #CLM-1001 submitted.", by: "Dr. Sarah Wilson" },
  { no: 4, date: "Oct 12, 2026, 09:25 AM", activity: "Status Check", status: "Success", details: "Claim status retrieved.", by: "System" },
  { no: 5, date: "Oct 10, 2026, 11:20 AM", activity: "Test Connection", status: "Failed", details: "Connection failed. Invalid client secret.", by: "Dr. Sarah Wilson" },
];

const ACTIVITY_TONE: Record<Activity["status"], TagTone> = { Success: "success", Failed: "danger" };

const ACTIVITY_COLUMNS: TableColumn[] = [
  { key: "no", label: "#", className: "w-10" },
  { key: "date", label: "Date & Time" },
  { key: "activity", label: "Activity" },
  { key: "status", label: "Status" },
  { key: "details", label: "Details" },
  { key: "by", label: "Performed By" },
];

const maskId = (id: string) => `${id.slice(0, 6)}******`;

/* ---------- Small building blocks ---------- */
const Card = ({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) => (
  <section className={`${cardCls} min-w-0 sm:p-6`}>
    <header className="mb-4 flex items-center justify-between gap-3">
      <h3 className="text-base font-semibold text-heading">{title}</h3>
      {action}
    </header>
    {children}
  </section>
);

const Row = ({
  label,
  children,
  action,
}: {
  label: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) => (
  <div className="grid grid-cols-[130px_minmax(0,1fr)_28px] items-center gap-3 border-b border-divider py-2.5 text-sm last:border-b-0 sm:grid-cols-[160px_minmax(0,1fr)_28px]">
    <dt className="text-body">{label}</dt>
    <dd className="min-w-0 break-words text-heading">{children}</dd>
    <span className="flex justify-end">{action}</span>
  </div>
);

const CopyButton = ({ text, label }: { text: string; label: string }) => {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      aria-label={`Copy ${label}`}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          /* clipboard not available */
        }
      }}
      className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-body transition-colors hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
    >
      {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
    </button>
  );
};

const StatusText = ({ connected }: { connected: boolean }) => (
  <span className={`inline-flex items-center gap-2 font-medium ${connected ? "text-success" : "text-danger"}`}>
    <CheckCircle2 className="h-4 w-4" />
    {connected ? "Connected" : "Disconnected"}
  </span>
);

/* ---------- Component ---------- */
const ClearinghouseOverview = ({ account }: { account: ClearinghouseAccount }) => {
  const connected = account.status === "Connected";
  const lastSynced = account.syncedDate ? `${account.syncedDate}, ${account.syncedTime}` : "-";
  const apiEndpoint = `https://api.${account.clearinghouse.toLowerCase().replace(/\s+/g, "")}.com`;
  const isProduction = account.environment === "Production";

  const rows = ACTIVITY.map((a) => ({
    no: <span className="text-sm text-body">{a.no}</span>,
    date: <Content title={a.date} />,
    activity: <Content title={a.activity} />,
    status: <Tags text={a.status} tone={ACTIVITY_TONE[a.status]} />,
    details: <p className="text-sm text-heading">{a.details}</p>,
    by: <Content title={a.by} />,
  }));

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="grid gap-4 sm:gap-5 xl:grid-cols-2">
        {/* Basic information */}
        <Card title="Basic Information">
          <dl>
            <Row label="Account Name">{account.name}</Row>
            <Row label="Clearinghouse">{account.clearinghouse}</Row>
            <Row label="Environment">
              <Tags text={account.environment} tone={isProduction ? "success" : "warning"} />
            </Row>
            <Row label="Status">
              <StatusText connected={connected} />
            </Row>
            <Row label="Last Synced">{lastSynced}</Row>
            <Row label="Last Connection Test">Oct 19, 2026, 04:30 PM</Row>
            <Row label="Created On">{account.createdOn}</Row>
            <Row label="Created By">{account.createdBy}</Row>
            <Row label="Updated On">Oct 18, 2026, 09:15 AM</Row>
            <Row label="Updated By">{account.createdBy}</Row>
          </dl>
        </Card>

        {/* Connection details */}
        <Card title="Connection Details">
          <dl>
            <Row label="Client ID" action={<CopyButton text={account.clientId} label="client ID" />}>
              {maskId(account.clientId)}
            </Row>
            <Row label="Client Secret">••••••••••••••••</Row>
            <Row label="API Endpoint" action={<CopyButton text={apiEndpoint} label="API endpoint" />}>
              {apiEndpoint}
            </Row>
            <Row label="Environment">{account.environment === "Production" ? "Production" : "Sandbox / Test"}</Row>
            <Row label="Connection Status">
              <StatusText connected={connected} />
            </Row>
            <Row label="Last Successful Test">Oct 19, 2026, 04:30 PM</Row>
            <Row label="Response Time">420 ms</Row>
          </dl>
        </Card>

        {/* Supported features */}
        <Card title="Supported Features (Enabled)">
          <ul className="space-y-3">
            {FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-3 text-sm font-medium text-heading">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-success" />
                {f}
              </li>
            ))}
          </ul>
        </Card>

        {/* Configuration notes */}
        <Card title="Configuration Notes">
          <dl>
            <Row label="Description">
              Primary clearinghouse account for claim submissions and eligibility checks.
            </Row>
            <Row label="Default Account">
              <Tags text="Yes" tone="success" />
            </Row>
            <Row label="Notes">Used for all production claims. Test account available in sandbox for development.</Row>
          </dl>
        </Card>
      </div>

      {/* Recent activity */}
      <Card title="Recent Activity" action={<EditButton section="Recent Activity" variant="viewAll" onEdit={() => {}} />}>
        <div className="w-full min-w-0 overflow-hidden rounded-[14px] border border-border bg-card">
          <Table columns={ACTIVITY_COLUMNS} rows={rows} bordered={false} />
        </div>
      </Card>
    </div>
  );
};

export default ClearinghouseOverview;