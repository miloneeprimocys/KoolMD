"use client";

import RadioCheckButtonh from "@/components/RadioCheckButtonh";
import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  AlertTriangle,
  Brain,
  ClipboardList,
  Download,
  FileCheck,
  FileText,
  Heart,
  Smile,
  Stethoscope,
  type LucideIcon,
} from "lucide-react";

import SearchAndFilter, { type FilterOption } from "@/components/Searchandfilter";
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
  Wellness: "green",
  Screening: "red",
  Administrative: "orange",
  Dental: "teal",
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

const CATEGORY_ICON: Record<string, LucideIcon> = {
  General: FileText,
  History: FileText,
  Lifestyle: Activity,
  Clinical: Stethoscope,
  "Mental Health": Brain,
  Functional: Activity,
  Intake: ClipboardList,
  Wellness: Heart,
  Screening: AlertTriangle,
  Administrative: FileCheck,
  Dental: Smile,
};

/* ---------------------------------------------------------------- */
/*  Types + static data (replace with API data later)                */
/* ---------------------------------------------------------------- */
export type QuestionnaireStatus = "Active" | "Draft" | "Inactive";
type Stamp = [date: string, time: string];

export type QuestionnaireRow = {
  id: string;
  name: string;
  description: string;
  category: string;
  version: string;
  questions: number;
  assignedTo: string;
  status: QuestionnaireStatus;
  responses: number;
  created: Stamp;
  updated: Stamp;
};

const ALL_PROVIDERS = "All Providers";

export const QUESTIONNAIRES: QuestionnaireRow[] = [
  { id: "q1", name: "General Health Questionnaire", description: "General health and lifestyle", category: "General", version: "v1.0", questions: 15, assignedTo: ALL_PROVIDERS, status: "Active", responses: 124, created: ["Oct 6, 2026", "10:15 AM"], updated: ["Oct 6, 2026", "10:15 AM"] },
  { id: "q2", name: "Medical History", description: "Past and current medical history", category: "History", version: "v1.2", questions: 22, assignedTo: ALL_PROVIDERS, status: "Active", responses: 98, created: ["Sep 28, 2026", "02:30 PM"], updated: ["Oct 1, 2026", "11:20 AM"] },
  { id: "q3", name: "Social History", description: "Lifestyle, habits and social factors", category: "Lifestyle", version: "v1.0", questions: 18, assignedTo: ALL_PROVIDERS, status: "Active", responses: 87, created: ["Sep 15, 2026", "09:10 AM"], updated: ["Sep 20, 2026", "04:15 PM"] },
  { id: "q4", name: "Family History", description: "Family medical history", category: "History", version: "v1.1", questions: 16, assignedTo: ALL_PROVIDERS, status: "Active", responses: 76, created: ["Aug 10, 2026", "11:45 AM"], updated: ["Aug 28, 2026", "01:10 PM"] },
  { id: "q5", name: "Review of Systems (ROS)", description: "Systematic symptom review", category: "Clinical", version: "v1.0", questions: 20, assignedTo: ALL_PROVIDERS, status: "Active", responses: 64, created: ["Aug 10, 2026", "11:45 AM"], updated: ["Aug 28, 2026", "03:20 PM"] },
  { id: "q6", name: "Depression Screening (PHQ-9)", description: "Mental health screening", category: "Mental Health", version: "v1.0", questions: 9, assignedTo: "Dr. Sarah Johnson", status: "Active", responses: 52, created: ["Jul 12, 2026", "03:20 PM"], updated: ["Aug 5, 2026", "11:35 AM"] },
  { id: "q7", name: "Anxiety Screening (GAD-7)", description: "Anxiety screening questionnaire", category: "Mental Health", version: "v1.0", questions: 7, assignedTo: "Dr. Sarah Johnson", status: "Active", responses: 45, created: ["Jun 30, 2026", "02:10 PM"], updated: ["Jul 18, 2026", "09:40 AM"] },
  { id: "q8", name: "Pain Assessment", description: "Pain level and impact", category: "Clinical", version: "v2.0", questions: 10, assignedTo: ALL_PROVIDERS, status: "Active", responses: 38, created: ["Jun 15, 2026", "10:05 AM"], updated: ["Jun 20, 2026", "04:10 PM"] },
  { id: "q9", name: "Functional Status", description: "Daily living and functionality", category: "Functional", version: "v1.0", questions: 12, assignedTo: ALL_PROVIDERS, status: "Draft", responses: 0, created: ["May 25, 2026", "09:30 AM"], updated: ["Jun 2, 2026", "02:05 PM"] },
  { id: "q10", name: "Lifestyle Assessment", description: "Diet, exercise and habits", category: "Lifestyle", version: "v1.0", questions: 14, assignedTo: "Dr. James Wilson", status: "Inactive", responses: 29, created: ["May 10, 2026", "11:30 AM"], updated: ["May 28, 2026", "03:20 PM"] },
  { id: "q11", name: "Allergy History", description: "Known allergies and reactions", category: "History", version: "v1.0", questions: 11, assignedTo: ALL_PROVIDERS, status: "Active", responses: 21, created: ["Apr 22, 2026", "10:00 AM"], updated: ["May 2, 2026", "01:45 PM"] },
  { id: "q12", name: "Post-Visit Satisfaction", description: "Patient experience feedback", category: "General", version: "v1.0", questions: 8, assignedTo: ALL_PROVIDERS, status: "Draft", responses: 0, created: ["Apr 5, 2026", "04:30 PM"], updated: ["Apr 5, 2026", "04:30 PM"] },
];

const STATUS_TONES: Record<QuestionnaireStatus, TagTone> = {
  Active: "success",
  Draft: "warning",
  Inactive: "danger",
};

/* ---------------------------------------------------------------- */
/*  Filters                                                          */
/* ---------------------------------------------------------------- */
const CATEGORY_FILTER = "All Categories";
const STATUS_FILTER = "All Statuses";
const VERSION_FILTER = "All Versions";

const STATUS_OPTIONS: FilterOption[] = ["Active", "Draft", "Inactive"];
const CATEGORY_OPTIONS: FilterOption[] = Array.from(new Set(QUESTIONNAIRES.map((q) => q.category)));
const VERSION_OPTIONS: FilterOption[] = Array.from(new Set(QUESTIONNAIRES.map((q) => q.version))).sort();

const EMPTY_FILTERS: Record<string, string> = {
  [CATEGORY_FILTER]: "",
  [STATUS_FILTER]: "",
  [VERSION_FILTER]: "",
};

const PAGE_SIZE = 10;
const CREATE_ROUTE = "/create-questionnaire";

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
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);

  const resetFilters = () => {
    setSearch("");
    setFilters(EMPTY_FILTERS);
    setPage(1);
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return QUESTIONNAIRES.filter((row) => {
      if (q && !`${row.name} ${row.description} ${row.category}`.toLowerCase().includes(q)) return false;
      if (filters[CATEGORY_FILTER] && row.category !== filters[CATEGORY_FILTER]) return false;
      if (filters[STATUS_FILTER] && row.status !== filters[STATUS_FILTER]) return false;
      if (filters[VERSION_FILTER] && row.version !== filters[VERSION_FILTER]) return false;
      return true;
    });
  }, [search, filters]);

  const totalPages = Math.max(Math.ceil(filtered.length / PAGE_SIZE), 1);
  const safePage = Math.min(page, totalPages);
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

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
    { key: "name", label: "Name" },
    { key: "category", label: "Category" },
    { key: "version", label: "Version" },
    { key: "status", label: "Status" },
    { key: "created", label: "Created On" },
    { key: "updated", label: "Updated On" },
    { key: "assignedTo", label: "Assigned To" },
    { key: "responses", label: "Responses" },
    {
      key: "actions",
      label: "Actions",
      header: <div className="flex w-full items-center justify-center">Actions</div>,
    },
  ];

  const rows = visible.map((row) => {
    const Icon = CATEGORY_ICON[row.category] ?? FileText;
    const tone = CHIP_CLS[CATEGORY_TONE[row.category] ?? "blue"];
    return {
      select: (
        <RadioCheckButtonh
          type="checkbox"
          checked={selectedKeys.has(row.id)}
          onChange={() => toggleRow(row.id)}
          aria-label={`Select ${row.name}`}
          className={checkboxCls}
        />
      ),
      name: (
        <div className="flex min-w-0 items-center gap-3">
          <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${tone}`}>
            <Icon className="h-4 w-4" />
          </span>
          <Content title={row.name} description={row.description} truncate />
        </div>
      ),
      category: <CategoryChip label={row.category} />,
      version: <Content title={row.version} />,
      status: <Tags text={row.status} tone={STATUS_TONES[row.status]} />,
      created: <Content title={row.created[0]} description={row.created[1]} />,
      updated: <Content title={row.updated[0]} description={row.updated[1]} />,
      assignedTo: <Content title={row.assignedTo} truncate />,
      responses: <Content title={String(row.responses)} />,
      actions: (
        <div className="flex w-full items-center justify-center">
          <Actions
            actions={["view", "edit", "copy", "more"]}
            onAction={(action) => {
              if (action === "view") onViewResponses(row);
              else if (action === "edit") router.push(`/edit-questionnaire?id=${encodeURIComponent(row.id)}`);
              else console.log("questionnaire action:", action, row.id); // TODO: duplicate / more menu
            }}
          />
        </div>
      ),
    };
  });

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Search + filters */}
      <div className="rounded-[14px] border border-border bg-card p-4 sm:p-5">
        <SearchAndFilter
          placeholder="Search by questionnaire name, description or category..."
          value={search}
          onSearch={(value: string) => {
            setSearch(value);
            setPage(1);
          }}
          filters={[
            { label: CATEGORY_FILTER, options: CATEGORY_OPTIONS },
            { label: STATUS_FILTER, options: STATUS_OPTIONS },
            { label: VERSION_FILTER, options: VERSION_OPTIONS },
          ]}
          selectedFilters={filters}
          onFilterChange={(label: string, value: string) => {
            setFilters((prev) => ({ ...prev, [label]: value }));
            setPage(1);
          }}
          showDateRange={false}
          className="flex-col xl:flex-row 2xl:flex-row"
          trailingFilterAction={
            <div className="flex shrink-0 items-center gap-2">
              <ImportButton text="Reset" icon={null} onClick={resetFilters} className="flex-none text-primary" />
              <ImportButton
                text="Export"
                icon={<Download className="h-4 w-4" />}
                onClick={() => console.log("export questionnaires") /* TODO: call your API here */}
                className="flex-none"
              />
            </div>
          }
        />
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
            page={safePage}
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