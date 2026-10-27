"use client";

import React, { useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, Printer, RefreshCw } from "lucide-react";

import Breadcrumb from "@/components/Breadcrumb";
import ImportButton from "@/components/ImportButton";
import Table from "@/components/Table";
import { type TableColumn } from "@/components/Tableheader";
import Content from "@/components/Content";
import Tags from "@/components/Tags";
import TableStatus from "@/components/TableStatus";
import { cardCls } from "@/providers/Shared";
import { CLAIM_ROUTES, CLAIM_STATUS_TONE, getClaim, money, type Claim } from "./Claims";
import ClaimInformation from "./Claiminformation";
import StatusHistory from "./Statushistory";

/* ---------- Tabs ---------- */
type TabKey = "information" | "lines" | "attachments" | "history";

const TABS: { key: TabKey; label: string }[] = [
  { key: "information", label: "Claim Information" },
  { key: "lines", label: "Service Lines" },
  { key: "attachments", label: "Attachments" },
  { key: "history", label: "Status History" },
];

const isTab = (v: string | null): v is TabKey => TABS.some((t) => t.key === v);

/* ---------- Small pieces ---------- */
const linkCls = "text-sm font-semibold text-link hover:underline focus-visible:outline-none";

const SummaryBlock = ({ title, children }: { title: string; children: ReactNode }) => (
  <div className="min-w-0 space-y-1 text-sm text-body">
    <p className="text-sm font-semibold text-heading">{title}</p>
    {children}
  </div>
);

const LINE_COLUMNS: TableColumn[] = [
  { key: "no", label: "#", className: "w-10" },
  { key: "cpt", label: "CPT/HCPCS Code" },
  { key: "description", label: "Description" },
  { key: "diagnosis", label: "Diagnosis Code" },
  { key: "units", label: "Units" },
  { key: "charge", label: "Charge" },
];

const ServiceLines = ({ claim }: { claim: Claim }) => (
  <section className={`${cardCls} space-y-4 sm:p-6`}>
    <h3 className="text-base font-semibold text-heading sm:text-lg">Service Lines</h3>
    <div className="w-full min-w-0 overflow-hidden rounded-[14px] border border-border bg-card">
      <Table
        columns={LINE_COLUMNS}
        bordered={false}
        rows={claim.lines.map((l, i) => ({
          no: <span className="text-sm text-body">{i + 1}</span>,
          cpt: <Content title={l.cpt} />,
          description: <Content title={l.description} truncate className="max-w-[320px]" />,
          diagnosis: <Content title={l.diagnosis} />,
          units: <Content title={String(l.units)} />,
          charge: <Content title={money(l.charge)} />,
        }))}
      />
    </div>
  </section>
);

/* TODO: replace with the attachments returned by your API */
const ATTACHMENTS = [
  { name: "CMS-1500-claim-form.pdf", size: "182 KB", uploaded: "Oct 20, 2026" },
  { name: "encounter-note.pdf", size: "96 KB", uploaded: "Oct 20, 2026" },
];

const ATTACHMENT_COLUMNS: TableColumn[] = [
  { key: "name", label: "File Name" },
  { key: "size", label: "Size" },
  { key: "uploaded", label: "Uploaded On" },
];

const Attachments = () => (
  <section className={`${cardCls} space-y-4 sm:p-6`}>
    <h3 className="text-base font-semibold text-heading sm:text-lg">Attachments</h3>
    <div className="w-full min-w-0 overflow-hidden rounded-[14px] border border-border bg-card">
      {ATTACHMENTS.length > 0 ? (
        <Table
          columns={ATTACHMENT_COLUMNS}
          bordered={false}
          rows={ATTACHMENTS.map((a) => ({
            name: <Content title={a.name} truncate />,
            size: <Content title={a.size} />,
            uploaded: <Content title={a.uploaded} />,
          }))}
        />
      ) : (
        <TableStatus variant="empty" message="No attachments for this claim." />
      )}
    </div>
  </section>
);

/* ---------- Page ---------- */
const ViewClaims = () => {
  const router = useRouter();
  const params = useSearchParams();
  const claimId = params.get("id");
  const claim = getClaim(claimId);

  const tabParam = params.get("tab");
  const [tab, setTab] = useState<TabKey>(isTab(tabParam) ? tabParam : "information");

  const breadcrumbBase = [
    { label: "Billing", href: "/billing/payment-gateway" },
    { label: "Claims", href: CLAIM_ROUTES.list },
  ];

  if (!claim) {
    return (
      <div className="mx-auto w-full max-w-[1600px] space-y-4">
        <Breadcrumb items={[...breadcrumbBase, { label: "Claim" }]} />
        <div className="rounded-[14px] border border-border bg-card">
          <TableStatus
            variant="empty"
            message={claimId ? "This claim does not exist." : "No claim selected. Open one from the Claims list."}
          />
          <p className="pb-6 text-center text-sm">
            <Link href={CLAIM_ROUTES.list} className="font-semibold text-link hover:underline">
              Back to Claims
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-4 sm:space-y-5">
      <Breadcrumb items={[...breadcrumbBase, { label: claim.id }]} />

      {/* Title + actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-lg font-semibold text-heading sm:text-xl 2xl:text-2xl">Claim #{claim.id}</h2>
          <Tags text={claim.status} tone={CLAIM_STATUS_TONE[claim.status]} />
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <ImportButton
            text="Resubmit"
            icon={<RefreshCw className="h-4 w-4" />}
            onClick={() => {
              // TODO: call your resubmit-claim API
            }}
          />
          <ImportButton
            text="Print"
            icon={<Printer className="h-4 w-4" />}
            onClick={() => window.print()}
          />
          <ImportButton
            text="More"
            icon={<ChevronDown className="h-4 w-4" />}
            onClick={() => {
              // TODO: open your "More" actions menu
            }}
          />
        </div>
      </div>

      {/* Summary */}
      <div className={`${cardCls} grid gap-5 sm:p-5 md:grid-cols-3 md:gap-0 md:[&>div:not(:first-child)]:border-l md:[&>div:not(:first-child)]:border-border md:[&>div:not(:first-child)]:pl-6 md:[&>div:not(:last-child)]:pr-6`}>
        <SummaryBlock title="Patient">
          {/* TODO: point at your patient details route */}
          <Link href={`/patients?id=${encodeURIComponent(claim.patientCode)}`} className={linkCls}>
            {claim.patient} ({claim.patientCode})
          </Link>
          <p>DOB: {claim.dob}</p>
          <p>Member ID: {claim.memberId}</p>
        </SummaryBlock>
        <SummaryBlock title="Encounter">
          {/* TODO: point at your encounter details route */}
          <Link href={`/encounters?id=${encodeURIComponent(claim.encounter)}`} className={linkCls}>
            {claim.encounter}
          </Link>
          <p>DOS: {claim.dos}</p>
          <p>Provider: {claim.provider}</p>
        </SummaryBlock>
        <SummaryBlock title="Insurance">
          <p className="font-medium text-heading">{claim.insurance}</p>
          <p>Group #: {claim.groupNumber}</p>
          <p>Payer ID: {claim.payerId}</p>
        </SummaryBlock>
      </div>

      {/* Tabs */}
      <div role="tablist" aria-label="Claim sections" className="flex gap-6 overflow-x-auto border-b border-border hide-scrollbar">
        {TABS.map((t) => {
          const active = t.key === tab;
          return (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(t.key)}
              className={`-mb-px shrink-0 cursor-pointer whitespace-nowrap border-b-2 px-1 pb-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${
                active ? "border-primary text-primary" : "border-transparent text-body hover:text-heading"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <div role="tabpanel">
        {tab === "information" && <ClaimInformation claim={claim} />}
        {tab === "lines" && <ServiceLines claim={claim} />}
        {tab === "attachments" && <Attachments />}
        {tab === "history" && <StatusHistory claim={claim} />}
      </div>
    </div>
  );
};

export default ViewClaims;