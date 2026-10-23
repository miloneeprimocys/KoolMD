"use client";

import React, { useMemo, useState } from "react";
import { Pencil, Plus, X } from "lucide-react";

import RadioCheckButtonh from "@/components/RadioCheckButtonh";
import SearchAndFilter from "@/components/Searchandfilter";
import Table from "@/components/Table";
import { type TableColumn } from "@/components/Tableheader";
import Content from "@/components/Content";
import Tags, { type TagTone } from "@/components/Tags";
import Pagination from "@/components/Pagination";
import { TableSelectAllCheckbox } from "@/components/TableSelection";
import { FieldError } from "@/components/SignupField";
import { cardCls } from "@/providers/Shared";
import LabOrderColumns from "./Labordercolumns";

/* ---------------------------------------------------------------- */
/*  Shared data + helpers (also used by AdditionalInfo / Review)    */
/* ---------------------------------------------------------------- */
export type TestCategory =
  | "Hematology"
  | "Chemistry"
  | "Endocrinology"
  | "Microbiology"
  | "Urinalysis"
  | "Other";

export type LabTest = {
  id: string;
  name: string;
  code: string;
  category: TestCategory;
  description: string;
  price: number;
  /** Shown under the "Common Panels" tab */
  common?: boolean;
};

export const LAB_TESTS: LabTest[] = [
  { id: "cbc", name: "Complete Blood Count (CBC)", code: "CBC", category: "Hematology", description: "Measures red and white blood cells, hemoglobin, hematocrit and platelets.", price: 450, common: true },
  { id: "cmp", name: "Comprehensive Metabolic Panel (CMP)", code: "CMP", category: "Chemistry", description: "Evaluates kidney and liver function, electrolytes, glucose and calcium.", price: 750, common: true },
  { id: "lipid", name: "Lipid Panel", code: "LIPID", category: "Chemistry", description: "Measures cholesterol, HDL, LDL and triglycerides.", price: 600, common: true },
  { id: "thyroid", name: "Thyroid Panel (TSH, T3, T4)", code: "THYROID", category: "Endocrinology", description: "Evaluates thyroid function.", price: 650, common: true },
  { id: "a1c", name: "Hemoglobin A1c (HbA1c)", code: "A1C", category: "Chemistry", description: "Measures average blood glucose over 3 months.", price: 550 },
  { id: "ua", name: "Urinalysis (UA)", code: "UA", category: "Urinalysis", description: "Evaluates kidney function and detects infections.", price: 400, common: true },
  { id: "vitd", name: "Vitamin D, 25-Hydroxy", code: "VITD", category: "Chemistry", description: "Measures vitamin D levels in the blood.", price: 900 },
  { id: "esr", name: "ESR", code: "ESR", category: "Hematology", description: "Erythrocyte sedimentation rate.", price: 350 },
  { id: "crp", name: "C-Reactive Protein (CRP)", code: "CRP", category: "Chemistry", description: "Detects inflammation in the body.", price: 500 },
  { id: "lft", name: "Liver Function Test (LFT)", code: "LFT", category: "Chemistry", description: "Evaluates liver enzymes and function.", price: 700 },
  { id: "smear", name: "Peripheral Smear", code: "SMEAR", category: "Hematology", description: "Examines the shape and size of blood cells.", price: 300 },
  { id: "pt", name: "Prothrombin Time (PT/INR)", code: "PT", category: "Hematology", description: "Measures how long blood takes to clot.", price: 480 },
  { id: "kft", name: "Kidney Function Test (KFT)", code: "KFT", category: "Chemistry", description: "Evaluates urea, creatinine and electrolytes.", price: 620 },
  { id: "fsh", name: "Follicle Stimulating Hormone (FSH)", code: "FSH", category: "Endocrinology", description: "Evaluates reproductive hormone levels.", price: 800 },
  { id: "cortisol", name: "Cortisol, Serum", code: "CORT", category: "Endocrinology", description: "Evaluates adrenal gland function.", price: 850 },
  { id: "uculture", name: "Urine Culture", code: "UCULT", category: "Microbiology", description: "Detects bacteria causing urinary tract infections.", price: 650 },
  { id: "bculture", name: "Blood Culture", code: "BCULT", category: "Microbiology", description: "Detects bacteria or fungi in the bloodstream.", price: 1200 },
  { id: "stool", name: "Stool Routine Examination", code: "STOOL", category: "Microbiology", description: "Detects parasites and digestive disorders.", price: 380 },
  { id: "urine-pr", name: "Urine Protein / Creatinine Ratio", code: "UPCR", category: "Urinalysis", description: "Assesses protein loss through the kidneys.", price: 520 },
  { id: "hiv", name: "HIV 1/2 Antibody Screening", code: "HIV", category: "Other", description: "Screens for HIV infection.", price: 700 },
  { id: "b12", name: "Vitamin B12", code: "B12", category: "Other", description: "Measures vitamin B12 levels.", price: 780 },
  { id: "iron", name: "Iron Studies", code: "IRON", category: "Other", description: "Evaluates iron levels and storage.", price: 680 },
];

export const getTest = (id: string) => LAB_TESTS.find((t) => t.id === id);

export const formatPrice = (n: number) => n.toLocaleString("en-IN");

export const CATEGORY_TONE: Record<TestCategory, TagTone> = {
  Hematology: "violet",
  Chemistry: "success",
  Endocrinology: "warning",
  Microbiology: "neutral",
  Urinalysis: "info",
  Other: "neutral",
};

const checkboxCls =
  "h-4 w-4 cursor-pointer rounded border-border accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30";

/* "Edit" link used on the Additional Info + Review cards */
export const EditLink = ({ onClick }: { onClick?: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-medium text-primary transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 sm:text-sm"
  >
    <Pencil className="h-3.5 w-3.5" />
    Edit
  </button>
);

/* ---------------------------------------------------------------- */
/*  Selected tests card (right column on steps 2 and 3, and 4)      */
/* ---------------------------------------------------------------- */
export const SelectedTestsCard = ({
  tests,
  onRemove,
  onClear,
  onEdit,
  showPrice = false,
  showTemplateButton = false,
  listMaxHeightClass = "max-h-80",
}: {
  tests: LabTest[];
  onRemove?: (id: string) => void;
  onClear?: () => void;
  onEdit?: () => void;
  showPrice?: boolean;
  showTemplateButton?: boolean;
  listMaxHeightClass?: string;
}) => (
  <section className={`${cardCls} sm:p-6`}>
    <div className="mb-4 flex items-center justify-between gap-3">
      <h3 className="text-base font-semibold text-heading">Selected Tests ({tests.length})</h3>
      {onClear && tests.length > 0 && (
        <button
          type="button"
          onClick={onClear}
          className="cursor-pointer text-xs font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 sm:text-sm"
        >
          Clear All
        </button>
      )}
      {onEdit && <EditLink onClick={onEdit} />}
    </div>

    {tests.length === 0 ? (
      <p className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-xs text-body">
        No tests selected yet. Choose tests from the list.
      </p>
    ) : (
      <ul className={`custom-scrollbar ${listMaxHeightClass} space-y-2.5 overflow-y-auto pr-1`}>
        {tests.map((t) => (
          <li
            key={t.id}
            className="flex items-center justify-between gap-3 rounded-xl bg-primary/5 px-3.5 py-3"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-heading">{t.name}</p>
              <p className="mt-0.5 truncate text-xs text-body">
                Code: {t.code} <span className="px-1 text-border">|</span> Category: {t.category}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {showPrice && (
                <span className="text-sm font-semibold text-heading">₹ {formatPrice(t.price)}</span>
              )}
              {onRemove && (
                <button
                  type="button"
                  aria-label={`Remove ${t.name}`}
                  onClick={() => onRemove(t.id)}
                  className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-body transition-colors hover:bg-danger/10 hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    )}

    {showTemplateButton && (
      <button
        type="button"
        onClick={() => {
          // TODO: open "Add test from template" modal
        }}
        className="mt-4 flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-primary/50 bg-primary/5 text-sm font-medium text-primary transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
      >
        <Plus className="h-4 w-4" />
        Add Test from Template
      </button>
    )}
  </section>
);

/* ---------------------------------------------------------------- */
/*  Step 2 – Select Tests                                           */
/* ---------------------------------------------------------------- */
const TABS = [
  "All Tests",
  "Common Panels",
  "Hematology",
  "Chemistry",
  "Endocrinology",
  "Microbiology",
  "Urinalysis",
  "Other",
] as const;

const CATEGORY_OPTIONS: TestCategory[] = [
  "Hematology",
  "Chemistry",
  "Endocrinology",
  "Microbiology",
  "Urinalysis",
  "Other",
];

const PAGE_SIZE = 10;

const COLUMNS: TableColumn[] = [
  { key: "select", label: "", className: "w-10", header: null },
  { key: "name", label: "Test Name" },
  { key: "code", label: "Code" },
  { key: "category", label: "Category" },
  { key: "description", label: "Description" },
  {
    key: "price",
    label: "Price (₹)",
    header: <div className="flex w-full items-center justify-end">Price (₹)</div>,
  },
];

type Props = {
  /** Selected test ids */
  selected: string[];
  onChange: (ids: string[]) => void;
  error?: string;
};

const SelectTests = ({ selected, onChange, error }: Props) => {
  const [tab, setTab] = useState<(typeof TABS)[number]>("All Tests");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);

  /* Tabs + search + category dropdown are filters on the table only */
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return LAB_TESTS.filter((t) => {
      if (tab === "Common Panels" && !t.common) return false;
      if (tab !== "All Tests" && tab !== "Common Panels" && t.category !== tab) return false;
      if (category && t.category !== category) return false;
      if (q && !`${t.name} ${t.code} ${t.description}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [tab, search, category]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const pageIds = pageRows.map((t) => t.id);
  const selectedOnPage = pageIds.filter((id) => selected.includes(id));
  const allSelected = pageIds.length > 0 && selectedOnPage.length === pageIds.length;
  const someSelected = selectedOnPage.length > 0 && !allSelected;

  const toggleRow = (id: string) =>
    onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);

  const toggleAll = () =>
    onChange(
      allSelected
        ? selected.filter((id) => !pageIds.includes(id))
        : [...selected, ...pageIds.filter((id) => !selected.includes(id))],
    );

  const columns = COLUMNS.map((c) =>
    c.key === "select"
      ? {
          ...c,
          header: (
            <TableSelectAllCheckbox
              checked={allSelected}
              indeterminate={someSelected}
              onChange={toggleAll}
              className={checkboxCls}
            />
          ),
        }
      : c,
  );

  const rows = pageRows.map((t) => ({
    select: (
      <RadioCheckButtonh
        type="checkbox"
        checked={selected.includes(t.id)}
        onChange={() => toggleRow(t.id)}
        aria-label={`Select ${t.name}`}
        className={checkboxCls}
      />
    ),
    name: <Content title={t.name} truncate />,
    code: <Content title={t.code} truncate />,
    category: <Tags text={t.category} tone={CATEGORY_TONE[t.category]} />,
    description: <Content title={t.description} truncate />,
    price: (
      <div className="flex w-full justify-end text-sm text-heading">{formatPrice(t.price)}</div>
    ),
  }));

  const selectedTests = selected.map(getTest).filter((t): t is LabTest => !!t);

  return (
    <LabOrderColumns>
      {/* ================= LEFT ================= */}
      <section className={`${cardCls} min-w-0 space-y-4 sm:p-6`}>
        <div>
          <h3 className="text-base font-semibold text-heading sm:text-lg">Select Laboratory Tests</h3>
          <p className="mt-0.5 text-xs text-body sm:text-sm">
            Search and select laboratory tests to add to the order.
          </p>
        </div>

      
        {/* Search + category filter */}
        <SearchAndFilter
          placeholder="Search test name, code or keyword..."
          value={search}
          onSearch={(v: string) => {
            setSearch(v);
            setPage(1);
          }}
          filters={[{ label: "All Categories", options: CATEGORY_OPTIONS }]}
          selectedFilters={{ "All Categories": category }}
          onFilterChange={(_label: string, option: string) => {
            setCategory(option);
            setPage(1);
          }}
          showDateRange={false}
        />

        {/* Table */}
        <div className="space-y-3">
          <div className="w-full min-w-0 overflow-hidden rounded-[14px] border border-border bg-card">
            {rows.length > 0 ? (
              <Table columns={columns} rows={rows} bordered={false} />
            ) : (
              <p className="px-4 py-10 text-center text-sm text-body">
                No tests match your filters.
              </p>
            )}
          </div>
          <FieldError message={error} />
          <Pagination
            page={safePage}
            totalPages={totalPages}
            totalItems={filtered.length}
            pageSize={PAGE_SIZE}
            itemLabel="tests"
            onChange={setPage}
          />
        </div>
      </section>

      {/* ================= RIGHT ================= */}
      <aside>
        <SelectedTestsCard
          tests={selectedTests}
          onRemove={(id) => onChange(selected.filter((x) => x !== id))}
          onClear={() => onChange([])}
          showTemplateButton
          listMaxHeightClass="max-h-[70vh]"
        />
      </aside>
    </LabOrderColumns>
  );
};

export default SelectTests;
