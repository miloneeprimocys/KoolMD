"use client";

import RadioCheckButtonh from "@/components/RadioCheckButtonh";
import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, MoreVertical } from "lucide-react";

import SearchAndFilter, { type DateRange, type FilterOption } from "@/components/Searchandfilter";
import SignupDropdown, { type DropdownOption } from "@/components/SignupDropdown";
import AddButton from "@/components/Addbutton";
import ImportButton from "@/components/ImportButton";
import Table from "@/components/Table";
import TableStatus from "@/components/TableStatus";
import { type TableColumn } from "@/components/Tableheader";
import Content from "@/components/Content";
import Tags, { type TagTone } from "@/components/Tags";
import Actions from "@/components/Actions";
import Pagination from "@/components/Pagination";
import { TableSelectAllCheckbox, useTableSelection } from "@/components/TableSelection";

import { CategoryChip, QUESTIONNAIRES, checkboxCls, type QuestionnaireRow } from "../Questionnairelist";

/* ---------------------------------------------------------------- */
/*  Types + static data (replace with API data later)                */
/* ---------------------------------------------------------------- */
type ResponseStatus = "Completed" | "In Progress" | "Not Started" | "Overdue";

type ResponseRow = {
  id: string;
  patient: string;
  email: string;
  patientId: string;
  provider: string;
  submitted: string; // ISO yyyy-mm-dd (used for filtering)
  time: string;
  status: ResponseStatus;
};

const RESPONSES: ResponseRow[] = [
  { id: "r1", patient: "Milonee Primocys", email: "milonee@example.com", patientId: "KMD-0000003", provider: "Dr. Sarah Johnson", submitted: "2026-10-28", time: "10:24 AM", status: "Completed" },
  { id: "r2", patient: "Rohan Mehta", email: "rohan@example.com", patientId: "KMD-0000008", provider: "Dr. James Wilson", submitted: "2026-10-27", time: "03:15 PM", status: "Completed" },
  { id: "r3", patient: "Priya Sharma", email: "priya@example.com", patientId: "KMD-0000012", provider: "Dr. Sarah Johnson", submitted: "2026-10-26", time: "11:40 AM", status: "Completed" },
  { id: "r4", patient: "Amit Patel", email: "amit@example.com", patientId: "KMD-0000019", provider: "Dr. Robert Lee", submitted: "2026-10-25", time: "09:12 AM", status: "In Progress" },
  { id: "r5", patient: "Neha Shah", email: "neha@example.com", patientId: "KMD-0000021", provider: "Dr. Emily Carter", submitted: "2026-10-24", time: "02:33 PM", status: "Not Started" },
  { id: "r6", patient: "Diya Shah", email: "diya@example.com", patientId: "KMD-0000023", provider: "Dr. Sarah Johnson", submitted: "2026-10-24", time: "01:17 PM", status: "Completed" },
  { id: "r7", patient: "Manish Trivedi", email: "manish@example.com", patientId: "KMD-0000026", provider: "Dr. Robert Lee", submitted: "2026-10-23", time: "05:44 PM", status: "Completed" },
  { id: "r8", patient: "Pooja Vora", email: "pooja@example.com", patientId: "KMD-0000028", provider: "Dr. James Wilson", submitted: "2026-10-23", time: "11:08 AM", status: "Overdue" },
  { id: "r9", patient: "Vikram Singh", email: "vikram@example.com", patientId: "KMD-0000031", provider: "Dr. Emily Carter", submitted: "2026-10-21", time: "09:21 AM", status: "Completed" },
  { id: "r10", patient: "Anjali Joshi", email: "anjali@example.com", patientId: "KMD-0000034", provider: "Dr. Sarah Johnson", submitted: "2026-10-20", time: "04:06 PM", status: "Completed" },
];

const STATUS_TONES: Record<ResponseStatus, TagTone> = {
  Completed: "success",
  "In Progress": "warning",
  "Not Started": "neutral",
  Overdue: "danger",
};

/* ---------------------------------------------------------------- */
/*  Filters                                                          */
/* ---------------------------------------------------------------- */
const ALL = "";

const STATUS_OPTIONS: FilterOption[] = ["Completed", "In Progress", "Not Started", "Overdue"];

const PROVIDER_OPTIONS: FilterOption[] = Array.from(new Set(RESPONSES.map((r) => r.provider)));

type Filters = { search: string; status: string; provider: string; dateRange: DateRange };
const EMPTY_FILTERS: Filters = { search: "", status: ALL, provider: ALL, dateRange: { start: "", end: "" } };

const PAGE_SIZE = 10;
/** Total responses for this questionnaire when no filter is applied (static demo — API will provide this). */
const TOTAL_RESPONSES = 124;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const formatDate = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return `${MONTHS[m - 1]} ${d}, ${y}`;
};

const initials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0]?.toUpperCase())
    .slice(0, 2)
    .join("");

const Avatar = ({ name }: { name: string }) => (
  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-shape-sky/40 text-xs font-semibold text-heading">
    {initials(name)}
  </span>
);

/* ---------------------------------------------------------------- */
/*  Component                                                        */
/* ---------------------------------------------------------------- */
const ResponseList = ({
  questionnaire = QUESTIONNAIRES[0],
  onBack,
  onViewResponse,
}: {
  questionnaire?: QuestionnaireRow;
  /** "Back to Questionnaires" — the page switches back to the list tab. */
  onBack: () => void;
  onViewResponse?: (response: ResponseRow) => void;
}) => {
  const router = useRouter();
  const [draft, setDraft] = useState<Filters>(EMPTY_FILTERS);
  const [applied, setApplied] = useState<Filters>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);

  const setDraftField = <K extends keyof Filters>(key: K, value: Filters[K]) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  const applyFilters = () => {
    setApplied(draft);
    setPage(1);
  };

  const resetFilters = () => {
    setDraft(EMPTY_FILTERS);
    setApplied(EMPTY_FILTERS);
    setPage(1);
  };

  const hasFilters =
    applied.search !== "" ||
    applied.status !== ALL ||
    applied.provider !== ALL ||
    applied.dateRange.start !== "" ||
    applied.dateRange.end !== "";

  const filtered = useMemo(() => {
    const q = applied.search.trim().toLowerCase();
    return RESPONSES.filter((r) => {
      if (q && !`${r.patient} ${r.email} ${r.patientId}`.toLowerCase().includes(q)) return false;
      if (applied.status !== ALL && r.status !== applied.status) return false;
      if (applied.provider !== ALL && r.provider !== applied.provider) return false;
      if (applied.dateRange.start && r.submitted < applied.dateRange.start) return false;
      if (applied.dateRange.end && r.submitted > applied.dateRange.end) return false;
      return true;
    });
  }, [applied]);

  /* Static demo: show every matching row on one page. Replace with API-driven page data. */
  const visible = filtered.slice(0, PAGE_SIZE);
  const totalItems = hasFilters ? filtered.length : TOTAL_RESPONSES;
  const totalPages = Math.max(Math.ceil(totalItems / PAGE_SIZE), 1);

  /* ---------- SearchAndFilter configuration ---------- */
  const filters = [
    { label: "Response Status", options: STATUS_OPTIONS },
    { label: "Assigned Provider", options: PROVIDER_OPTIONS },
  ];

  const handleSearchChange = (value: string) => {
    setDraftField("search", value);
  };

  const handleFilterChange = (filterLabel: string, option: string) => {
    if (filterLabel === "Response Status") setDraftField("status", option);
    else if (filterLabel === "Assigned Provider") setDraftField("provider", option);
  };

  const handleDateRangeChange = (range: DateRange) => {
    setDraftField("dateRange", range);
  };

  /* ---------- Selection ---------- */
  const rowKeys = visible.map((r) => r.id);
  const { selectedKeys, allSelected, someSelected, toggleRow, toggleAll } = useTableSelection(rowKeys);

  const columns: TableColumn[] = [
    {
      key: "select",
      label: "",
      className: "w-10",
      header: (
        <TableSelectAllCheckbox
          checked={allSelected}
          indeterminate={someSelected}
          onChange={toggleAll}
          className={checkboxCls}
        />
      ),
    },
    { key: "patient", label: "Patient Name" },
    { key: "patientId", label: "Patient ID" },
    { key: "provider", label: "Assigned Provider" },
    { key: "submitted", label: "Submitted On" },
    { key: "status", label: "Status" },
    {
      key: "actions",
      label: "Actions",
      header: <div className="flex w-full items-center justify-center">Actions</div>,
    },
  ];

  const rows = visible.map((r) => ({
    select: (
      <RadioCheckButtonh
        type="checkbox"
        checked={selectedKeys.has(r.id)}
        onChange={() => toggleRow(r.id)}
        aria-label={`Select ${r.patient}`}
        className={checkboxCls}
      />
    ),
    patient: (
      <div className="flex min-w-0 items-center gap-3">
        <Avatar name={r.patient} />
        <Content title={r.patient} description={r.email} truncate />
      </div>
    ),
    patientId: <Content title={r.patientId} />,
    provider: <Content title={r.provider} truncate />,
    submitted: <Content title={formatDate(r.submitted)} description={r.time} />,
    status: <Tags text={r.status} tone={STATUS_TONES[r.status]} />,
    actions: (
      <div className="flex w-full items-center justify-center gap-1">
        <Actions
          actions={["view", "edit"]}
          onAction={(action) => {
            const responseUrl = `?id=${encodeURIComponent(r.id)}`;
            if (action === "edit") router.push(`/edit-response${responseUrl}`);
            else if (onViewResponse) onViewResponse(r);
            else router.push(`/view-response${responseUrl}`);
          }}
          size="sm"
        />
      
      </div>
    ),
  }));

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Sub-header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-heading sm:text-lg">Patient Responses</h3>
          <p className="mt-0.5 text-sm text-body">View and manage patient responses for this questionnaire.</p>
        </div>
        <ImportButton text="Back to Questionnaires" icon={null} onClick={onBack} className="w-fit whitespace-nowrap" />
      </div>

      {/* Questionnaire details (replaces the stat cards on this tab) */}
      <div className="rounded-[14px] border border-border bg-card p-4 sm:p-5">
        <div className="flex items-start gap-4">
          <span className=" hidden sm:block flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <FileText className="h-7 w-7" />
          </span>
          <div className="min-w-0 space-y-2">
            <div>
              <h4 className="text-base font-semibold text-heading">{questionnaire.name}</h4>
              <p className="text-sm text-body">{questionnaire.description}</p>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-body sm:text-sm">
              <span className="flex items-center gap-2">
                Category <CategoryChip label={questionnaire.category} />
              </span>
              <span className="hidden h-4 w-px bg-divider sm:block" aria-hidden />
              <span>{questionnaire.questions} questions</span>
              <span className="hidden h-4 w-px bg-divider sm:block" aria-hidden />
              <span>
                Assigned to <span className="font-medium text-heading">{questionnaire.assignedTo}</span>
              </span>
              <Tags text={questionnaire.status} tone={questionnaire.status === "Active" ? "success" : "warning"} />
            </div>
          </div>
        </div>
      </div>

      {/* Search + filters */}
      <div className="rounded-[14px] border border-border bg-card p-4 sm:p-5">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex-1 min-w-[200px]">
            <SearchAndFilter
              placeholder="Search by patient name, email or patient ID..."
              value={draft.search}
              onSearch={handleSearchChange}
              filters={filters}
              selectedFilters={{
                "Response Status": draft.status,
                "Assigned Provider": draft.provider,
              }}
              onFilterChange={handleFilterChange}
              showDateRange
              dateRange={draft.dateRange}
              onDateRangeChange={handleDateRangeChange}
              className="flex-col xl:flex-row 2xl:flex-row"
            />
          </div>
          <div className="flex gap-2">
            <ImportButton
              text="Reset"
              icon={null}
              onClick={resetFilters}
              className="flex-none"
            />
            <AddButton
              text="Search"
              icon={null}
              onClick={applyFilters}
              className="flex-none"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="space-y-3">
        <div className="overflow-hidden rounded-[14px] border border-border bg-card">
          {visible.length === 0 ? (
            <TableStatus variant="empty" message="No responses match your filters." />
          ) : (
            <Table columns={columns} rows={rows} bordered={false} />
          )}
        </div>

        {visible.length > 0 && (
          <Pagination
            page={page}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={PAGE_SIZE}
            itemLabel="responses"
            onChange={setPage}
          />
        )}
      </div>
    </div>
  );
};

export default ResponseList;