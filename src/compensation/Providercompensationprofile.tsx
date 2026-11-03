"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Pencil, Phone, User } from "lucide-react";

import AddButton from "@/components/Addbutton";
import ImportButton from "@/components/ImportButton";
import Breadcrumb from "@/components/Breadcrumb";
import Table from "@/components/Table";
import { type TableColumn } from "@/components/Tableheader";
import Content from "@/components/Content";
import Tags from "@/components/Tags";
import { cardCls } from "@/providers/Shared";

/* ---------------------------------------------------------------- */
/*  Static data (replace with API / redux selector)                  */
/* ---------------------------------------------------------------- */
type Profile = {
  id: string;
  name: string;
  type: string;
  phone: string;
  email: string;
  status: "Active" | "Inactive";
  earned: string;
  paid: string;
  outstanding: string;
  basis: string;
  rate: string;
  period: string;
};

const PROFILES: Record<string, Profile> = {
  "PR-1001": { id: "PR-1001", name: "Dr. John Carter", type: "Independent Contractor", phone: "+1 (859) 234-5678", email: "john.carter@koolmd.com", status: "Active", earned: "$78,500", paid: "$68,500", outstanding: "$10,000", basis: "Per Consultation", rate: "$500 / Consultation", period: "Jan 1, 2026 – Dec 31, 2026" },
  "PR-1002": { id: "PR-1002", name: "Dr. Emily Rogers", type: "KOOLMD Direct", phone: "+1 (859) 234-1122", email: "emily.rogers@koolmd.com", status: "Active", earned: "$52,400", paid: "$52,400", outstanding: "$0", basis: "Per Case", rate: "$350 / Case", period: "Jan 1, 2026 – Dec 31, 2026" },
  "PR-1003": { id: "PR-1003", name: "Dr. Michael Lee", type: "Independent Contractor", phone: "+1 (859) 234-3344", email: "michael.lee@koolmd.com", status: "Active", earned: "$61,000", paid: "$50,500", outstanding: "$10,500", basis: "Fixed Rate", rate: "$10,500 / Month", period: "Jan 1, 2026 – Dec 31, 2026" },
  "PR-1004": { id: "PR-1004", name: "MedStaff Agency", type: "External Agency", phone: "+1 (859) 234-5566", email: "billing@medstaff.com", status: "Active", earned: "$142,000", paid: "$117,000", outstanding: "$25,000", basis: "Per Consultation", rate: "$450 / Consultation", period: "Jan 1, 2026 – Dec 31, 2026" },
  "PR-1005": { id: "PR-1005", name: "CarePlus Agency", type: "External Agency", phone: "+1 (859) 234-7788", email: "accounts@careplus.com", status: "Inactive", earned: "$23,000", paid: "$23,000", outstanding: "$0", basis: "Per Consultation", rate: "$400 / Consultation", period: "Jan 1, 2026 – Jun 30, 2026" },
};

const TABS = ["Overview", "Details", "Compensation Agreement", "Payment Sheets", "Payment History", "Notes"] as const;
type Tab = (typeof TABS)[number];

const SHEET_COLUMNS: TableColumn[] = [
  { key: "sheet", label: "Sheet #" },
  { key: "period", label: "Period" },
  { key: "amount", label: "Amount" },
  { key: "status", label: "Status" },
];
const HISTORY_COLUMNS: TableColumn[] = [
  { key: "date", label: "Payment Date" },
  { key: "sheet", label: "Sheet #" },
  { key: "amount", label: "Amount" },
  { key: "method", label: "Method" },
];

const InfoRow = ({ label, value, valueCls = "text-heading" }: { label: string; value: React.ReactNode; valueCls?: string }) => (
  <div className="flex items-start justify-between gap-4 py-2 text-sm">
    <span className="text-body">{label}</span>
    <span className={`text-right font-semibold ${valueCls}`}>{value}</span>
  </div>
);

/* ---------------------------------------------------------------- */
/*  Component                                                        */
/* ---------------------------------------------------------------- */
const ProviderCompensationProfile = () => {
  const router = useRouter();
  const providerId = useSearchParams().get("id") ?? "PR-1001";
  const profile = PROFILES[providerId] ?? PROFILES["PR-1001"];
  const [tab, setTab] = useState<Tab>("Overview");

  const agreementCard = (
    <div className="rounded-xl border border-border p-4">
      <h4 className="mb-2 text-sm font-semibold text-heading">Agreement Summary</h4>
      <InfoRow label="Payment Basis" value={profile.basis} />
      <InfoRow label="Rate" value={profile.rate} />
      <InfoRow label="Effective Period" value={profile.period} />
    </div>
  );

  const renderTab = () => {
    switch (tab) {
      case "Overview":
        return (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-border p-4">
              <h4 className="mb-2 text-sm font-semibold text-heading">Payment Summary (YTD)</h4>
              <InfoRow label="Total Earned" value={profile.earned} />
              <InfoRow label="Total Paid" value={profile.paid} valueCls="text-success" />
              <InfoRow label="Outstanding" value={profile.outstanding} valueCls="text-danger" />
            </div>
            {agreementCard}
          </div>
        );
      case "Details":
        return (
          <div className="rounded-xl border border-border p-4">
            <InfoRow label="Provider ID" value={profile.id} />
            <InfoRow label="Provider Name" value={profile.name} />
            <InfoRow label="Provider Type" value={profile.type} />
            <InfoRow label="Phone" value={profile.phone} />
            <InfoRow label="Email" value={profile.email} />
            <InfoRow label="Status" value={profile.status} />
          </div>
        );
      case "Compensation Agreement":
        return agreementCard;
      case "Payment Sheets":
        return (
          <div className="overflow-hidden rounded-[14px] border border-border bg-card">
            <Table
              columns={SHEET_COLUMNS}
              bordered={false}
              rows={[
                { sheet: <Content title="PS-1045" />, period: <Content title="Oct 1 – Oct 31, 2026" />, amount: <Content title="$12,000" />, status: <Tags text="Pending Review" tone="warning" size="xs" /> },
                { sheet: <Content title="PS-1038" />, period: <Content title="Sep 1 – Sep 30, 2026" />, amount: <Content title="$10,500" />, status: <Tags text="Paid" tone="success" size="xs" /> },
                { sheet: <Content title="PS-1031" />, period: <Content title="Aug 1 – Aug 31, 2026" />, amount: <Content title="$9,000" />, status: <Tags text="Paid" tone="success" size="xs" /> },
              ]}
            />
          </div>
        );
      case "Payment History":
        return (
          <div className="overflow-hidden rounded-[14px] border border-border bg-card">
            <Table
              columns={HISTORY_COLUMNS}
              bordered={false}
              rows={[
                { date: <Content title="Oct 5, 2026" />, sheet: <Content title="PS-1038" />, amount: <Content title="$10,500" />, method: <Content title="Bank Transfer" /> },
                { date: <Content title="Sep 4, 2026" />, sheet: <Content title="PS-1031" />, amount: <Content title="$9,000" />, method: <Content title="Bank Transfer" /> },
              ]}
            />
          </div>
        );
      default:
        return (
          <p className="rounded-xl border border-border p-4 text-sm text-body">
            Independent contractor. Compensation is paid monthly after admin approval of the payment sheet.
          </p>
        );
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-4 sm:space-y-5">
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Compensation", href: "/compensation" },
          { label: "Provider Directory", href: "/compensation/provider-directory" },
          { label: profile.id },
        ]}
      />

      <div>
        <h2 className="text-lg font-semibold text-heading sm:text-xl 2xl:text-2xl">Provider Compensation Profile</h2>
        <p className="mt-0.5 text-sm text-body">Provider overview, agreement summary and actions.</p>
      </div>

      {/* Header card */}
      <section className={`${cardCls} sm:p-6`}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-2 border-border bg-shape-sky/40">
              <User className="h-9 w-9 text-body" strokeWidth={1.5} />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-semibold text-heading">{profile.name}</h3>
                <Tags text={profile.id} tone="violet" size="xs" />
              </div>
              <p className="mt-1 text-sm text-body">{profile.type}</p>
            </div>
          </div>
          <div className="space-y-1.5 text-sm text-body sm:text-right">
            <Tags text={profile.status} tone={profile.status === "Active" ? "success" : "danger"} size="xs" />
            <p className="flex items-center gap-2 sm:justify-end"><Phone className="h-4 w-4" />{profile.phone}</p>
            <p className="flex items-center gap-2 sm:justify-end"><Mail className="h-4 w-4" />{profile.email}</p>
          </div>
        </div>
      </section>

      {/* Tabs + content */}
      <section className={`${cardCls} space-y-5 sm:p-6`}>
        <div className="hide-scrollbar flex gap-1 overflow-x-auto border-b border-border">
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`-mb-px shrink-0 cursor-pointer whitespace-nowrap border-b-2 px-3 py-2.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${
                tab === t ? "border-primary font-semibold text-primary" : "border-transparent text-body hover:text-heading"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {renderTab()}

        <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
          <ImportButton
            text="Edit Agreement"
            icon={<Pencil className="h-4 w-4" />}
            onClick={() => router.push(`/compensation/agreement?providerId=${encodeURIComponent(profile.id)}`)}
          />
          <AddButton
            text="Generate Payment Sheet"
            icon={null}
            onClick={() => router.push(`/compensation/generate-payment-sheet?providerId=${encodeURIComponent(profile.id)}`)}
          />
        </div>
      </section>
    </div>
  );
};

export default ProviderCompensationProfile;