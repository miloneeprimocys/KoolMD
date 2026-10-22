"use client";

import RadioCheckButtonh from "@/components/RadioCheckButtonh";
import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import SearchAndFilter, { type FilterOption } from "@/components/Searchandfilter";
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

/* ---------------------------------------------------------------- */
/*  Shared: category chip (also used by Templates.tsx)               */
/* ---------------------------------------------------------------- */
export type ChipTone = "blue" | "violet" | "green" | "orange" | "red" | "pink" | "yellow" | "teal";

const CHIP_CLS: Record<ChipTone, string> = {
  blue: "bg-primary/15 text-primary",
  violet: "bg-violet/15 text-violet",
  green: "bg-success/15 text-success",
  orange: "bg-warning/15 text-warning",
  red: "bg-danger/15 text-danger",
  pink: "bg-pink/15 text-pink",
  yellow: "bg-yellow-400/20 text-yellow-700 dark:text-yellow-400",
  teal: "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400",
};

export const CATEGORY_TONE: Record<string, ChipTone> = {
  General: "blue",
  History: "violet",
  Lifestyle: "orange",
  Clinical: "green",
  "Mental Health": "red",
  Functional: "violet",
  Intake: "violet",
  Telemedicine: "teal",
  "Chronic Care": "pink",
  Preventive: "green",
  Cardiology: "red",
  Medication: "violet",
  Surgery: "blue",
  Pediatrics: "yellow",
};

export const CategoryChip = ({ label }: { label: string }) => (
  <span
    className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${
      CHIP_CLS[CATEGORY_TONE[label] ?? "blue"]
    }`}
  >
    {label}
  </span>
);

export const checkboxCls =
  "h-4 w-4 cursor-pointer rounded border-border accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30";

/* ---------------------------------------------------------------- */
/*  Types + static data (replace with API data later)                */
/* ---------------------------------------------------------------- */
export type QuestionnaireStatus = "Active" | "Draft";

export type QuestionnaireRow = {
  id: string;
  name: string;
  description: string;
  category: string;
  questions: number;
  assignedTo: string;
  status: QuestionnaireStatus;
  responses: number;
};

const ALL_PROVIDERS = "All Providers";

export const QUESTIONNAIRES: QuestionnaireRow[] = [
  { id: "q1", name: "General Health Questionnaire", description: "General health and lifestyle", category: "General", questions: 15, assignedTo: ALL_PROVIDERS, status: "Active", responses: 124 },
  { id: "q2", name: "Medical History", description: "Past and current medical history", category: "History", questions: 22, assignedTo: ALL_PROVIDERS, status: "Active", responses: 98 },
  { id: "q3", name: "Social History", description: "Lifestyle, habits and social factors", category: "Lifestyle", questions: 18, assignedTo: ALL_PROVIDERS, status: "Active", responses: 87 },
  { id: "q4", name: "Family History", description: "Family medical history", category: "History", questions: 16, assignedTo: ALL_PROVIDERS, status: "Active", responses: 76 },
  { id: "q5", name: "Review of Systems (ROS)", description: "Systematic symptom review", category: "Clinical", questions: 20, assignedTo: ALL_PROVIDERS, status: "Active", responses: 64 },
  { id: "q6", name: "Depression Screening (PHQ-9)", description: "Mental health screening", category: "Mental Health", questions: 9, assignedTo: "Dr. Sarah Johnson", status: "Active", responses: 52 },
  { id: "q7", name: "Anxiety Screening (GAD-7)", description: "Anxiety screening questionnaire", category: "Mental Health", questions: 7, assignedTo: "Dr. Sarah Johnson", status: "Active", responses: 45 },
  { id: "q8", name: "Pain Assessment", description: "Pain level and impact", category: "Clinical", questions: 10, assignedTo: ALL_PROVIDERS, status: "Active", responses: 38 },
  { id: "q9", name: "Functional Status", description: "Daily living and functionality", category: "Functional", questions: 12, assignedTo: ALL_PROVIDERS, status: "Draft", responses: 0 },
  { id: "q10", name: "Lifestyle Assessment", description: "Diet, exercise and habits", category: "Lifestyle", questions: 14, assignedTo: "Dr. James Wilson", status: "Active", responses: 29 },
  { id: "q11", name: "Allergy History", description: "Known allergies and reactions", category: "History", questions: 11, assignedTo: ALL_PROVIDERS, status: "Active", responses: 21 },
  { id: "q12", name: "Post-Visit Satisfaction", description: "Patient experience feedback", category: "General", questions: 8, assignedTo: ALL_PROVIDERS, status: "Draft", responses: 0 },
];

const STATUS_TONES: Record<QuestionnaireStatus, TagTone> = {
  Active: "success",
  Draft: "warning",
};

/* ---------------------------------------------------------------- */
/*  Filters                                                          */
/* ---------------------------------------------------------------- */
const ALL = "";

const STATUS_OPTIONS: FilterOption[] = ["Active", "Draft"];

const CATEGORY_OPTIONS: FilterOption[] = Array.from(new Set(QUESTIONNAIRES.map((q) => q.category)));

const ASSIGNED_OPTIONS: FilterOption[] = Array.from(new Set(QUESTIONNAIRES.map((q) => q.assignedTo)))
  .filter((p) => p !== ALL_PROVIDERS);

type Filters = { search: string; status: string; category: string; assignedTo: string };
const EMPTY_FILTERS: Filters = { search: "", status: ALL, category: ALL, assignedTo: ALL };

const PAGE_SIZE = 10;

/* ---------------------------------------------------------------- */
/*  Component                                                        */
/* ---------------------------------------------------------------- */
const QuestionnaireList = ({
  onViewResponses,
}: {
  /** Called when "view" (eye) is chosen on a row — the page switches to the Patient Responses tab. */
  onViewResponses: (questionnaire: QuestionnaireRow) => void;
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

  const filtered = useMemo(() => {
    const q = applied.search.trim().toLowerCase();
    return QUESTIONNAIRES.filter((row) => {
      if (q && !`${row.name} ${row.description}`.toLowerCase().includes(q)) return false;
      if (applied.status !== ALL && row.status !== applied.status) return false;
      if (applied.category !== ALL && row.category !== applied.category) return false;
      if (applied.assignedTo !== ALL && row.assignedTo !== applied.assignedTo) return false;
      return true;
    });
  }, [applied]);

  const totalPages = Math.max(Math.ceil(filtered.length / PAGE_SIZE), 1);
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  /* ---------- SearchAndFilter configuration ---------- */
  const filters = [
    { label: "Status", options: STATUS_OPTIONS },
    { label: "Category", options: CATEGORY_OPTIONS },
    { label: "Assigned To", options: ASSIGNED_OPTIONS },
  ];

  const handleSearchChange = (value: string) => {
    setDraftField("search", value);
  };

  const handleFilterChange = (filterLabel: string, option: string) => {
    if (filterLabel === "Status") setDraftField("status", option);
    else if (filterLabel === "Category") setDraftField("category", option);
    else if (filterLabel === "Assigned To") setDraftField("assignedTo", option);
  };

  /* ---------- Selection ---------- */
  const rowKeys = visible.map((row) => row.id);
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
    { key: "name", label: "Questionnaire Name" },
    { key: "category", label: "Category" },
    { key: "questions", label: "Questions" },
    { key: "assignedTo", label: "Assigned To" },
    { key: "status", label: "Status" },
    { key: "responses", label: "Responses" },
    {
      key: "actions",
      label: "Actions",
      header: <div className="flex w-full items-center justify-center">Actions</div>,
    },
  ];

  const rows = visible.map((row) => ({
    select: (
      <RadioCheckButtonh
        type="checkbox"
        checked={selectedKeys.has(row.id)}
        onChange={() => toggleRow(row.id)}
        aria-label={`Select ${row.name}`}
        className={checkboxCls}
      />
    ),
    name: <Content title={row.name} description={row.description} truncate />,
    category: <CategoryChip label={row.category} />,
    questions: <Content title={String(row.questions)} />,
    assignedTo: <Content title={row.assignedTo} truncate />,
    status: <Tags text={row.status} tone={STATUS_TONES[row.status]} />,
    responses: <Content title={String(row.responses)} />,
    actions: (
      <div className="flex w-full items-center justify-center">
        <Actions
          onAction={(action) => {
            if (action === "view") onViewResponses(row);
            else if (action === "edit") router.push(`/edit-questionnaire?id=${encodeURIComponent(row.id)}`);
            else console.log("questionnaire action:", action, row.id);
          }}
        />
      </div>
    ),
  }));

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Search + filters */}
      <div className="rounded-[14px] border border-border bg-card p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-3">
          <div className="min-w-[200px] flex-1">
            <SearchAndFilter
              placeholder="Search questionnaire by name or description..."
              value={draft.search}
              onSearch={handleSearchChange}
              filters={filters}
              selectedFilters={{
                Status: draft.status,
                Category: draft.category,
                "Assigned To": draft.assignedTo,
              }}
              onFilterChange={handleFilterChange}
              showDateRange={false}
              className="flex-col xl:flex-row 2xl:flex-row"
              trailingFilterAction={
                <div className="flex shrink-0 gap-2">
                  <ImportButton text="Reset" icon={null} onClick={resetFilters} className="flex-none" />
                  <AddButton text="Search" icon={null} onClick={applyFilters} className="flex-none" />
                </div>
              }
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="space-y-3">
        <div className="overflow-hidden rounded-[14px] border border-border bg-card">
          {visible.length === 0 ? (
            <TableStatus variant="empty" message="No questionnaires match your filters." />
          ) : (
            <Table columns={columns} rows={rows} bordered={false} />
          )}
        </div>

        {filtered.length > 0 && (
          <Pagination
            page={page}
            totalPages={totalPages}
            totalItems={filtered.length}
            pageSize={PAGE_SIZE}
            itemLabel="questionnaires"
            onChange={setPage}
          />
        )}
      </div>
    </div>
  );
};

export default QuestionnaireList;
