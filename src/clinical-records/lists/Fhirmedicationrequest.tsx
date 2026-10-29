"use client";

import React, { useMemo, useState } from "react";
import { CheckCircle2, ClipboardList, Clock, PauseCircle, XCircle, FileText } from "lucide-react";

import StatCards, { type StatItem } from "@/components/Statcards";
import SearchAndFilter from "@/components/Searchandfilter";
import ImportButton from "@/components/ImportButton";
import Table from "@/components/Table";
import TableStatus from "@/components/TableStatus";
import { type TableColumn } from "@/components/Tableheader";
import Content from "@/components/Content";
import Tags, { type TagTone } from "@/components/Tags";
import Name from "@/components/Name";
import LinkComponent from "@/components/LinkComponent";
import Actions from "@/components/Actions";
import Pagination from "@/components/Pagination";
import RadioCheckButtonh from "@/components/RadioCheckButtonh";
import { TableSelectAllCheckbox, useTableSelection } from "@/components/TableSelection";

/* ---------------------------------------------------------------- */
/*  Data (replace with API / redux selector)                         */
/* ---------------------------------------------------------------- */
type ReqStatus = "Active" | "Pending" | "Cancelled" | "On Hold";

type ReqRow = {
  id: string;
  requestId: string;
  patient: string;
  mrn: string;
  medication: string;
  rxnorm: string;
  dosage: string;
  intent: string;
  requester: string;
  status: ReqStatus;
  date: string;
  time: string;
};

const mk = (
  n: number,
  patient: string,
  age: string,
  medication: string,
  rxnorm: string,
  dosage: string,
  requester: string,
  status: ReqStatus,
  date: string,
  time: string,
): ReqRow => ({
  id: String(n),
  requestId: `MR-00012${46 + n}`,
  patient,
  mrn: `MRN: PT-00${1244 + n} (${age} yrs)`,
  medication,
  rxnorm,
  dosage,
  intent: "Order",
  requester,
  status,
  date,
  time,
});

const REQUESTS: ReqRow[] = [
  mk(1, "John Smith", "42", "Amoxicillin 500 mg", "723", "1 capsule TID", "Dr. Sarah Wilson", "Active", "Oct 10, 2026", "09:15 AM"),
  mk(2, "Emily Carter", "36", "Lisinopril 10 mg", "29046", "1 tablet daily", "Dr. Michael Johnson", "Active", "Oct 10, 2026", "09:45 AM"),
  mk(3, "Robert Johnson", "51", "Metformin 500 mg", "6809", "1 tablet BID", "Dr. Emily Parker", "Pending", "Oct 10, 2026", "10:20 AM"),
  mk(4, "Olivia Brown", "33", "Atorvastatin 20 mg", "83367", "1 tablet daily", "Dr. Robert Williams", "Active", "Oct 10, 2026", "11:05 AM"),
  mk(5, "William Davis", "58", "Levothyroxine 50 mcg", "8970", "1 tablet daily (AM)", "Dr. David Brown", "Active", "Oct 10, 2026", "11:30 AM"),
  mk(6, "Sophia Miller", "31", "Omeprazole 20 mg", "76445", "1 capsule daily", "Dr. Laura Anderson", "Cancelled", "Oct 11, 2026", "09:30 AM"),
  mk(7, "Michael Wilson", "39", "Albuterol 90 mcg", "2080", "2 puffs PRN", "Dr. Richard Kim", "Active", "Oct 11, 2026", "10:15 AM"),
  mk(8, "Isabella Moore", "26", "Hydrochlorothiazide 25 mg", "3652", "1 tablet daily", "Dr. Susan Davis", "On Hold", "Oct 11, 2026", "11:40 AM"),
  mk(9, "David Taylor", "47", "Sertraline 50 mg", "6960", "1 tablet daily", "Dr. Thomas Patel", "Active", "Oct 11, 2026", "01:25 PM"),
  mk(10, "Laura Anderson", "35", "Fluticasone 50 mcg", "293120", "2 sprays daily", "Dr. Nancy Green", "Pending", "Oct 11, 2026", "02:10 PM"),
  mk(11, "James Martin", "43", "Ibuprofen 200 mg", "5640", "1 tablet PRN", "Dr. Sarah Wilson", "Active", "Oct 12, 2026", "09:10 AM"),
];

const STATUS_TONES: Record<ReqStatus, TagTone> = {
  Active: "success",
  Pending: "warning",
  Cancelled: "danger",
  "On Hold": "neutral",
};

const STATS: StatItem[] = [
  { label: "Total Requests", value: "486", Icon: ClipboardList, accent: "primary" },
  { label: "Active Requests", value: "328", Icon: CheckCircle2, accent: "success" },
  { label: "Pending Requests", value: "74", Icon: Clock, accent: "warning" },
  { label: "Cancelled Requests", value: "46", Icon: XCircle, accent: "danger" },
  { label: "On Hold", value: "38", Icon: PauseCircle, accent: "primary" },
];

const STATUS_FILTER = "All Statuses";
const INTENT_FILTER = "All Intents";
const MED_FILTER = "All Medications";
const PRACT_FILTER = "All Practitioners";
const EMPTY_FILTERS: Record<string, string> = { [STATUS_FILTER]: "", [INTENT_FILTER]: "", [MED_FILTER]: "", [PRACT_FILTER]: "" };
const uniq = (key: keyof ReqRow) => Array.from(new Set(REQUESTS.map((r) => r[key])));
const PAGE_SIZE = 10;

const checkboxCls =
  "h-4 w-4 cursor-pointer rounded border-border accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30";

/* ---------------------------------------------------------------- */
/*  Component                                                        */
/* ---------------------------------------------------------------- */
const FhirMedicationRequest = () => {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);

  const reset = () => {
    setSearch("");
    setFilters(EMPTY_FILTERS);
    setPage(1);
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return REQUESTS.filter((r) => {
      if (q && ![r.patient, r.mrn, r.medication, r.rxnorm, r.requestId].some((f) => f.toLowerCase().includes(q))) return false;
      if (filters[STATUS_FILTER] && r.status !== filters[STATUS_FILTER]) return false;
      if (filters[INTENT_FILTER] && r.intent !== filters[INTENT_FILTER]) return false;
      if (filters[MED_FILTER] && r.medication !== filters[MED_FILTER]) return false;
      if (filters[PRACT_FILTER] && r.requester !== filters[PRACT_FILTER]) return false;
      return true;
    });
  }, [search, filters]);

  const totalPages = Math.max(Math.ceil(filtered.length / PAGE_SIZE), 1);
  const safePage = Math.min(page, totalPages);
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const from = filtered.length ? (safePage - 1) * PAGE_SIZE + 1 : 0;
  const to = filtered.length ? from + visible.length - 1 : 0;

  const { selectedKeys, allSelected, someSelected, toggleRow, toggleAll } = useTableSelection(visible.map((r) => r.id));

  const columns: TableColumn[] = [
    {
      key: "select",
      label: "",
      className: "w-10",
      header: <TableSelectAllCheckbox checked={allSelected} indeterminate={someSelected} onChange={toggleAll} className={checkboxCls} />,
    },
    { key: "requestId", label: "Request ID" },
    { key: "patient", label: "Patient" },
    { key: "medication", label: "Medication" },
    { key: "dosage", label: "Dosage & Instructions" },
    { key: "intent", label: "Intent" },
    { key: "requester", label: "Requester" },
    { key: "status", label: "Status" },
    { key: "dateRequested", label: "Date Requested" },
    { key: "actions", label: "Actions", header: <div className="flex w-full items-center justify-center">Actions</div> },
  ];

  const rows = visible.map((r) => ({
    select: (
      <RadioCheckButtonh
        type="checkbox"
        checked={selectedKeys.has(r.id)}
        onChange={() => toggleRow(r.id)}
        aria-label={`Select ${r.requestId}`}
        className={checkboxCls}
      />
    ),
    requestId: <LinkComponent>{r.requestId}</LinkComponent>,
    patient: <Name name={r.patient} sub={r.mrn} truncate />,
    medication: (
      <div className="min-w-0">
        <LinkComponent>{r.medication}</LinkComponent>
        <p className="truncate text-xs text-body">RxNorm: {r.rxnorm}</p>
      </div>
    ),
    dosage: <Content title={r.dosage} />,
    intent: <Content title={r.intent} />,
    requester: <Name name={r.requester} truncate />,
    status: <Tags text={r.status} tone={STATUS_TONES[r.status]} size="xs" />,
    dateRequested: <Content title={r.date} description={r.time} />,
    actions: (
      <div className="flex w-full items-center justify-center">
        <Actions actions={["more"]} size="sm" />
      </div>
    ),
  }));

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-warning/10 text-warning">
          <FileText className="h-5 w-5" />
        </span>
        <div>
          <h3 className="text-base font-semibold text-heading">Medication Requests</h3>
          <p className="text-xs text-body sm:text-sm">Manage medication requests, prescription orders and medication authorizations.</p>
        </div>
      </div>

      <StatCards stats={STATS} />

      <SearchAndFilter
        placeholder="Search by patient, medication, code, or ID..."
        value={search}
        onSearch={(v: string) => {
          setSearch(v);
          setPage(1);
        }}
        filters={[
          { label: STATUS_FILTER, options: ["Active", "Pending", "Cancelled", "On Hold"] },
          { label: INTENT_FILTER, options: uniq("intent") as string[] },
          { label: MED_FILTER, options: uniq("medication") as string[] },
          { label: PRACT_FILTER, options: uniq("requester") as string[] },
        ]}
        selectedFilters={filters}
        onFilterChange={(label: string, value: string) => {
          setFilters((prev) => ({ ...prev, [label]: value }));
          setPage(1);
        }}
        showDateRange
        trailingFilterAction={<ImportButton text="Reset" icon={null} onClick={reset} className="flex-none text-primary" />}
      />

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-base font-semibold text-heading">Medication Requests List</h3>
          <span className="text-xs text-body">
            {from}-{to} of {filtered.length.toLocaleString()}
          </span>
        </div>
        <div className="overflow-hidden rounded-[14px] border border-border bg-card">
          {visible.length === 0 ? (
            <TableStatus variant="empty" message="No medication requests match your filters." />
          ) : (
            <Table columns={columns} rows={rows} bordered={false} />
          )}
        </div>
        {filtered.length > 0 && (
          <Pagination
            page={safePage}
            totalPages={totalPages}
            totalItems={filtered.length}
            pageSize={PAGE_SIZE}
            itemLabel="requests"
            onChange={setPage}
          />
        )}
      </section>
    </div>
  );
};

export default FhirMedicationRequest;