"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

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

import { CategoryChip } from "../Questionnairelist";

/* ---------------------------------------------------------------- */
/*  Types + static data (replace with API data later)                */
/* ---------------------------------------------------------------- */
type TemplateStatus = "Active" | "Inactive";

type TemplateRow = {
  id: string;
  name: string;
  category: string;
  description: string;
  questions: number;
  status: TemplateStatus;
  createdBy: string;
  updatedOn: string;
};

const TEMPLATES: TemplateRow[] = [
  { id: "t1", name: "General Health Assessment", category: "General", description: "Basic health and lifestyle information", questions: 12, status: "Active", createdBy: "Dr. Sarah Wilson", updatedOn: "Oct 10, 2026" },
  { id: "t2", name: "Pre-Visit Intake", category: "Intake", description: "Collect patient information before visit", questions: 18, status: "Active", createdBy: "Dr. Sarah Wilson", updatedOn: "Oct 08, 2026" },
  { id: "t3", name: "Telemedicine Intake", category: "Telemedicine", description: "Questions for virtual consultations", questions: 14, status: "Active", createdBy: "Dr. Michael Chen", updatedOn: "Oct 05, 2026" },
  { id: "t4", name: "Mental Health Screening", category: "Mental Health", description: "Anxiety, depression and mood assessment", questions: 21, status: "Active", createdBy: "Dr. Sarah Wilson", updatedOn: "Oct 02, 2026" },
  { id: "t5", name: "Diabetes Follow-up", category: "Chronic Care", description: "Track diabetes management", questions: 16, status: "Active", createdBy: "Dr. Michael Chen", updatedOn: "Sep 28, 2026" },
  { id: "t6", name: "Annual Wellness", category: "Preventive", description: "Yearly wellness assessment", questions: 20, status: "Inactive", createdBy: "Dr. Sarah Wilson", updatedOn: "Sep 25, 2026" },
  { id: "t7", name: "Cardiology Assessment", category: "Cardiology", description: "Heart health assessment questions", questions: 15, status: "Active", createdBy: "Dr. James Miller", updatedOn: "Sep 20, 2026" },
  { id: "t8", name: "Medication Review", category: "Medication", description: "Current medications and adherence", questions: 10, status: "Active", createdBy: "Dr. Sarah Wilson", updatedOn: "Sep 15, 2026" },
  { id: "t9", name: "Post-Surgical Follow-up", category: "Surgery", description: "Recovery and post-operative assessment", questions: 18, status: "Active", createdBy: "Dr. James Miller", updatedOn: "Sep 10, 2026" },
  { id: "t10", name: "Pediatric Evaluation", category: "Pediatrics", description: "Child health assessment", questions: 17, status: "Active", createdBy: "Dr. Emily Roberts", updatedOn: "Sep 05, 2026" },
];

const STATUS_TONES: Record<TemplateStatus, TagTone> = {
  Active: "success",
  Inactive: "neutral",
};

/* ---------------------------------------------------------------- */
/*  Filters (applied live, like the screenshot)                      */
/* ---------------------------------------------------------------- */
const ALL = "";

const CATEGORY_OPTIONS: FilterOption[] = Array.from(new Set(TEMPLATES.map((t) => t.category)));

const STATUS_OPTIONS: FilterOption[] = ["Active", "Inactive"];

const CREATOR_OPTIONS: FilterOption[] = Array.from(new Set(TEMPLATES.map((t) => t.createdBy)));

const PAGE_SIZE = 10;
/** Total templates in the system when no filter is applied (static demo — API will provide this). */
const TOTAL_TEMPLATES = 28;

/* ---------------------------------------------------------------- */
/*  Table columns                                                    */
/* ---------------------------------------------------------------- */
const COLUMNS: TableColumn[] = [
  { key: "name", label: "Template Name" },
  { key: "category", label: "Category" },
  { key: "description", label: "Description" },
  { key: "questions", label: "Questions" },
  { key: "status", label: "Status" },
  { key: "createdBy", label: "Created By" },
  { key: "updatedOn", label: "Updated On" },
  {
    key: "actions",
    label: "Actions",
    header: <div className="flex w-full items-center justify-center">Actions</div>,
  },
];

/* ---------------------------------------------------------------- */
/*  Component                                                        */
/* ---------------------------------------------------------------- */
const Templates = () => {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(ALL);
  const [status, setStatus] = useState(ALL);
  const [createdBy, setCreatedBy] = useState(ALL);
  const [page, setPage] = useState(1);

  const hasFilters = Boolean(search.trim()) || category !== ALL || status !== ALL || createdBy !== ALL;

  const resetFilters = () => {
    setSearch("");
    setCategory(ALL);
    setStatus(ALL);
    setCreatedBy(ALL);
    setPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleFilterChange = (filterLabel: string, option: string) => {
    if (filterLabel === "Category") {
      setCategory(option);
      setPage(1);
    } else if (filterLabel === "Status") {
      setStatus(option);
      setPage(1);
    } else if (filterLabel === "Created by") {
      setCreatedBy(option);
      setPage(1);
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return TEMPLATES.filter((t) => {
      if (q && !`${t.name} ${t.description}`.toLowerCase().includes(q)) return false;
      if (category !== ALL && t.category !== category) return false;
      if (status !== ALL && t.status !== status) return false;
      if (createdBy !== ALL && t.createdBy !== createdBy) return false;
      return true;
    });
  }, [search, category, status, createdBy]);

  /* Static demo: show every matching row on one page. Replace with API-driven page data. */
  const visible = filtered.slice(0, PAGE_SIZE);
  const totalItems = hasFilters ? filtered.length : TOTAL_TEMPLATES;
  const totalPages = Math.max(Math.ceil(totalItems / PAGE_SIZE), 1);

  const rows = visible.map((t) => ({
    name: <Content title={t.name} truncate />,
    category: <CategoryChip label={t.category} />,
    description: <Content title={t.description} />,
    questions: <Content title={String(t.questions)} />,
    status: <Tags text={t.status} tone={STATUS_TONES[t.status]} />,
    createdBy: <Content title={t.createdBy} truncate />,
    updatedOn: <Content title={t.updatedOn} />,
    actions: (
      <div className="flex w-full items-center justify-center">
        <Actions onAction={(action) => console.log("template action:", action, t.id)} />
      </div>
    ),
  }));

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Sub-header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-heading sm:text-lg">Questionnaire Templates</h3>
          <p className="mt-0.5 text-sm text-body">
            Create and manage reusable questionnaire templates for patient intake, follow-ups and assessments.
          </p>
        </div>
        <AddButton
          text="Add Template"
          icon={<Plus className="h-4 w-4" />}
          onClick={() => router.push("/add-template")}
          className="w-fit shrink-0 whitespace-nowrap"
        />
      </div>

      {/* Search + filters */}
      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1">
          <SearchAndFilter
            placeholder="Search templates..."
            value={search}
            onSearch={handleSearchChange}
            filters={[
              { label: "Category", options: CATEGORY_OPTIONS },
              { label: "Status", options: STATUS_OPTIONS },
              { label: "Created by", options: CREATOR_OPTIONS },
            ]}
            selectedFilters={{
              Category: category,
              Status: status,
              "Created by": createdBy,
            }}
            onFilterChange={handleFilterChange}
            showDateRange={false}
            filterLayout="grid"
            className="flex-col xl:flex-row 2xl:flex-row"
          />
        </div>
        <ImportButton
          text="Reset"
          icon={null}
          onClick={resetFilters}
          className="flex-none self-start sm:self-auto"
        />
      </div>

      {/* Table */}
      <div className="space-y-3">
        <div className="overflow-hidden rounded-[14px] border border-border bg-card">
          {visible.length === 0 ? (
            <TableStatus variant="empty" message="No templates match your filters." />
          ) : (
            <Table columns={COLUMNS} rows={rows} bordered={false} />
          )}
        </div>

        {visible.length > 0 && (
          <Pagination
            page={page}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={PAGE_SIZE}
            itemLabel="templates"
            onChange={setPage}
          />
        )}
      </div>
    </div>
  );
};

export default Templates;