"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

import Breadcrumb from "@/components/Breadcrumb";
import AddButton from "@/components/Addbutton";
import SearchAndFilter from "@/components/Searchandfilter";
import Table from "@/components/Table";
import { type TableColumn } from "@/components/Tableheader";
import Content from "@/components/Content";
import Tags, { type TagTone } from "@/components/Tags";
import Actions from "@/components/Actions";
import Pagination from "@/components/Pagination";
import TableStatus from "@/components/TableStatus";

/* ---------------------------------------------------------------- */
/*  Types, routes + static data (replace with API data later)        */
/* ---------------------------------------------------------------- */
export type ClaimStatus = "Submitted" | "Accepted" | "Rejected" | "Pending";

export type ClaimLine = {
  cpt: string;
  description: string;
  units: number;
  diagnosis: string;
  charge: number;
};

export type Claim = {
  id: string;
  patient: string;
  patientCode: string;
  dob: string;
  memberId: string;
  encounter: string;
  /** Date of service */
  dos: string;
  amount: number;
  status: ClaimStatus;
  submittedOn: string;
  submittedAt: string;
  submittedBy: string;
  provider: string;
  insurance: string;
  groupNumber: string;
  payerId: string;
  claimType: string;
  clearinghouseClaimId: string;
  payerClaimId: string;
  lastUpdated: string;
  responses: string;
  lines: ClaimLine[];
};

export const CLAIM_ROUTES = {
  list: "/payers/claims",
  view: (id: string) => `/payers/claims/view?id=${encodeURIComponent(id)}`,
  submit: "/payers/claims/submit",
};

export const CLAIM_STATUS_TONE: Record<ClaimStatus, TagTone> = {
  Submitted: "info",
  Accepted: "success",
  Rejected: "danger",
  Pending: "warning",
};

export const money = (n: number) => `$${n.toFixed(2)}`;

const mk = (
  id: string,
  patient: string,
  patientCode: string,
  encounter: string,
  dos: string,
  amount: number,
  status: ClaimStatus,
  submittedOn: string,
  provider = "Dr. Sarah Wilson",
): Claim => ({
  id,
  patient,
  patientCode,
  dob: "Jan 15, 1985",
  memberId: `AET${id.replace(/\D/g, "")}56789`,
  encounter,
  dos,
  amount,
  status,
  submittedOn,
  submittedAt: "10:15 AM",
  submittedBy: provider,
  provider,
  insurance: "Aetna PPO",
  groupNumber: "123456",
  payerId: "60054",
  claimType: "Professional (CMS-1500)",
  clearinghouseClaimId: `98765${id.replace(/\D/g, "")}`,
  payerClaimId: status === "Submitted" || status === "Rejected" ? "-" : "123456789",
  lastUpdated: `${submittedOn}, 10:15 AM`,
  responses: "-",
  lines: [
    {
      cpt: "99213",
      description: "Office or other outpatient visit for the evaluation and management of an established patient.",
      units: 1,
      diagnosis: "E11.9",
      charge: amount,
    },
  ],
});

export const CLAIMS: Claim[] = [
  mk("CLM-1001", "John Doe", "PT-001", "ENC-001", "Oct 20, 2026", 250, "Submitted", "Oct 20, 2026"),
  mk("CLM-1002", "Emily Carter", "PT-002", "ENC-002", "Oct 18, 2026", 320, "Accepted", "Oct 18, 2026"),
  mk("CLM-1003", "Michael Brown", "PT-003", "ENC-003", "Oct 18, 2026", 180, "Rejected", "Oct 18, 2026"),
  mk("CLM-1004", "Sarah Lee", "PT-004", "ENC-004", "Oct 17, 2026", 275, "Pending", "Oct 17, 2026"),
  mk("CLM-1005", "David Kim", "PT-005", "ENC-005", "Oct 16, 2026", 120, "Accepted", "Oct 16, 2026"),
  mk("CLM-1006", "Olivia Martin", "PT-006", "ENC-006", "Oct 15, 2026", 410, "Submitted", "Oct 15, 2026"),
  mk("CLM-1007", "Daniel Green", "PT-007", "ENC-007", "Oct 14, 2026", 95, "Pending", "Oct 14, 2026"),
  mk("CLM-1008", "Priya Patel", "PT-008", "ENC-008", "Oct 12, 2026", 340, "Accepted", "Oct 12, 2026"),
];

export const getClaim = (id: string | null) => CLAIMS.find((c) => c.id === id);

/* ---------------------------------------------------------------- */
/*  Table setup                                                      */
/* ---------------------------------------------------------------- */
const PAGE_SIZE = 5;
const STATUS_FILTER = "Claim Status";
const FILTERS = [{ label: STATUS_FILTER, options: ["Submitted", "Accepted", "Rejected", "Pending"] }];

const COLUMNS: TableColumn[] = [
  { key: "claim", label: "Claim #" },
  { key: "patient", label: "Patient" },
  { key: "encounter", label: "Encounter" },
  { key: "dos", label: "DOS" },
  { key: "amount", label: "Amount" },
  { key: "status", label: "Status" },
  { key: "submitted", label: "Submitted On" },
  {
    key: "actions",
    label: "Actions",
    header: <div className="flex w-full items-center justify-center">Actions</div>,
  },
];

const linkCls = "text-sm font-medium text-link hover:underline focus-visible:outline-none";

/* ---------------------------------------------------------------- */
/*  Page                                                             */
/* ---------------------------------------------------------------- */
const Claims = () => {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const status = selectedFilters[STATUS_FILTER];
    return CLAIMS.filter((c) => {
      if (status && status !== "All" && c.status !== status) return false;
      if (q && !`${c.patient} ${c.id} ${c.encounter}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [search, selectedFilters]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const rows = pageRows.map((c) => ({
    claim: (
      <Link href={CLAIM_ROUTES.view(c.id)} className={linkCls}>
        {c.id}
      </Link>
    ),
    patient: <Content title={c.patient} truncate />,
    encounter: (
      // TODO: point at your encounter details route
      <Link href={`/encounters?id=${encodeURIComponent(c.encounter)}`} className={linkCls}>
        {c.encounter}
      </Link>
    ),
    dos: <Content title={c.dos} />,
    amount: <Content title={money(c.amount)} />,
    status: <Tags text={c.status} tone={CLAIM_STATUS_TONE[c.status]} />,
    submitted: <Content title={c.submittedOn} />,
    actions: (
      <div className="flex w-full items-center justify-center">
        <Actions
          actions={["view"]}
          onAction={(action) => {
            if (action === "view") router.push(CLAIM_ROUTES.view(c.id));
          }}
        />
      </div>
    ),
  }));

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-4 sm:space-y-5">
      <Breadcrumb items={[{ label: "Billing", href: "/billing/payment-gateway" }, { label: "Claims" }]} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold text-heading sm:text-xl 2xl:text-2xl">Claims</h2>
        <AddButton
          text="Submit Claim"
          icon={<Plus className="h-4 w-4" />}
          onClick={() => router.push(CLAIM_ROUTES.submit)}
          className="w-fit shrink-0 whitespace-nowrap"
        />
      </div>

      <SearchAndFilter
        placeholder="Search by patient, claim #, encounter..."
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
      />

      <div className="space-y-3">
        <div className="w-full min-w-0 overflow-hidden rounded-[14px] border border-border bg-card">
          {rows.length > 0 ? (
            <Table columns={COLUMNS} rows={rows} bordered={false} />
          ) : (
            <TableStatus variant="empty" message="No claims match your filters." />
          )}
        </div>
        <Pagination
          page={safePage}
          totalPages={totalPages}
          totalItems={filtered.length}
          pageSize={PAGE_SIZE}
          itemLabel="claims"
          onChange={setPage}
        />
      </div>
    </div>
  );
};

export default Claims;
