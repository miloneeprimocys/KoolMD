"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Clock, FileText, XCircle } from "lucide-react";

import StatCards, { type StatItem } from "@/components/Statcards";
import AddButton from "@/components/Addbutton";
import ImportButton from "@/components/ImportButton";
import SearchAndFilter, { type DateRange, type FilterOption } from "@/components/Searchandfilter";
import Table from "@/components/Table";
import TableStatus from "@/components/TableStatus";
import { type TableColumn } from "@/components/Tableheader";
import Name from "@/components/Name";
import Tags, { type TagTone } from "@/components/Tags";
import Actions from "@/components/Actions";
import Pagination from "@/components/Pagination";
import Breadcrumb from "@/components/Breadcrumb";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppHooks";
import { showDeletePrescription } from "@/redux/slices/dialogslice";

/* ---------- Types + static data (replace with API data later) ---------- */
type PrescriptionStatus = "Active" | "Completed" | "Expired" | "Pending" | "Cancelled";

export type PrescriptionRow = {
  id: string; // Prescription ID, e.g. RX-000125
  patient: string;
  patientMeta: string;
  medications: string[];
  moreCount?: number;
  date: string; // ISO yyyy-mm-dd (used for filtering)
  provider: string;
  status: PrescriptionStatus;
};

export const PRESCRIPTIONS: PrescriptionRow[] = [
  { id: "RX-000125", patient: "milonee primocys", patientMeta: "21 years • Female", medications: ["Amoxicillin 500 mg"], date: "2026-10-06", provider: "Dr. Sarah Johnson", status: "Active" },
  { id: "RX-000124", patient: "Rohan Mehta", patientMeta: "34 years • Male", medications: ["Omeprazole 20 mg"], date: "2026-08-14", provider: "Dr. James Wilson", status: "Active" },
  { id: "RX-000123", patient: "Priya Sharma", patientMeta: "28 years • Female", medications: ["Cetirizine 10 mg", "Fluticasone 50 mcg"], date: "2026-05-22", provider: "Dr. Emily Davis", status: "Completed" },
  { id: "RX-000122", patient: "Amit Patel", patientMeta: "45 years • Male", medications: ["Ibuprofen 400 mg", "Paracetamol 500 mg"], date: "2026-03-10", provider: "Dr. Robert Lee", status: "Expired" },
  { id: "RX-000121", patient: "Neha Shah", patientMeta: "32 years • Female", medications: ["Metformin 500 mg"], date: "2026-01-05", provider: "Dr. Sarah Johnson", status: "Active" },
  { id: "RX-000120", patient: "Karan Desai", patientMeta: "29 years • Male", medications: ["Lisinopril 10 mg", "Atorvastatin 20 mcg"], date: "2025-12-15", provider: "Dr. James Wilson", status: "Completed" },
  { id: "RX-000119", patient: "Diya Shah", patientMeta: "26 years • Female", medications: ["Sertraline 50 mg"], date: "2025-11-03", provider: "Dr. Emily Davis", status: "Completed" },
  { id: "RX-000118", patient: "Manish Trivedi", patientMeta: "52 years • Male", medications: ["Amlodipine 5 mg"], moreCount: 1, date: "2025-10-20", provider: "Dr. Robert Lee", status: "Active" },
  { id: "RX-000117", patient: "Pooja Vora", patientMeta: "38 years • Female", medications: ["Albuterol 90 mcg", "Montelukast 10 mg"], date: "2025-09-12", provider: "Dr. Sarah Johnson", status: "Expired" },
  { id: "RX-000116", patient: "Vikram Singh", patientMeta: "41 years • Male", medications: ["Levothyroxine 50 mcg"], date: "2025-08-02", provider: "Dr. James Wilson", status: "Completed" },
];

const STATUS_TONES: Record<PrescriptionStatus, TagTone> = {
  Active: "success",
  Completed: "neutral",
  Expired: "danger",
  Pending: "warning",
  Cancelled: "neutral",
};

/* ---------- Stats ---------- */
const STATS: StatItem[] = [
  { label: "Total Prescriptions", value: "128", Icon: FileText, accent: "primary", tag: { text: "All time", tone: "neutral" } },
  { label: "Active Prescriptions", value: "42", Icon: CheckCircle2, accent: "success", tag: { text: "Currently active", tone: "neutral" } },
  { label: "Expired Prescriptions", value: "18", Icon: XCircle, accent: "danger", tag: { text: "Past end date", tone: "neutral" } },
  { label: "Pending / Draft", value: "6", Icon: Clock, accent: "violet", tag: { text: "Not sent to patient", tone: "neutral" } },
];

/* ---------- Filter options ---------- */
const ALL = "";

const STATUS_OPTIONS: FilterOption[] = (["Active", "Completed", "Expired", "Pending", "Cancelled"] as const);

const PROVIDER_OPTIONS: FilterOption[] = Array.from(new Set(PRESCRIPTIONS.map((p) => p.provider)));

const MEDICATION_OPTIONS: FilterOption[] = Array.from(new Set(PRESCRIPTIONS.flatMap((p) => p.medications)));

/* ---------- Constants / helpers ---------- */
const PAGE_SIZE = 10;
/** Total across the whole system when no filter is applied (static demo — API will provide this). */
const TOTAL_PRESCRIPTIONS = 128;

const checkboxCls =
  "h-4 w-4 cursor-pointer rounded border-border accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const formatDate = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return `${MONTHS[m - 1]} ${d}, ${y}`;
};

type Filters = {
  search: string;
  dateRange: DateRange;
  status: string;
  provider: string;
  medication: string;
};

const EMPTY_FILTERS: Filters = {
  search: "",
  dateRange: { start: "", end: "" },
  status: ALL,
  provider: ALL,
  medication: ALL,
};

/* ---------- Component ---------- */
const Prescriptions = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const deletedPrescriptionIds = useAppSelector((state) => state.dialog.deletedPrescriptionIds);

  const [draft, setDraft] = useState<Filters>(EMPTY_FILTERS); // what the inputs show
  const [applied, setApplied] = useState<Filters>(EMPTY_FILTERS); // applied on "Search"
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const setDraftField = <K extends keyof Filters>(key: K, value: Filters[K]) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  const applyFilters = () => {
    setApplied(draft);
    setPage(1);
    setSelected(new Set());
  };

  const resetFilters = () => {
    setDraft(EMPTY_FILTERS);
    setApplied(EMPTY_FILTERS);
    setPage(1);
    setSelected(new Set());
  };

  const hasFilters = JSON.stringify(applied) !== JSON.stringify(EMPTY_FILTERS);

  /* ---------- Filtering (client-side on static data) ---------- */
  const filtered = useMemo(() => {
    const q = applied.search.trim().toLowerCase();
    return PRESCRIPTIONS.filter((p) => {
      if (deletedPrescriptionIds.includes(p.id)) return false;
      if (q) {
        const hay = `${p.patient} ${p.id} ${p.medications.join(" ")}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (applied.dateRange.start && p.date < applied.dateRange.start) return false;
      if (applied.dateRange.end && p.date > applied.dateRange.end) return false;
      if (applied.status !== ALL && p.status !== applied.status) return false;
      if (applied.provider !== ALL && p.provider !== applied.provider) return false;
      if (applied.medication !== ALL && !p.medications.includes(applied.medication)) return false;
      return true;
    });
  }, [applied, deletedPrescriptionIds]);

  /* Static demo: show every matching row on one page. Replace with API-driven page data. */
  const visible = filtered.slice(0, PAGE_SIZE);
  const totalItems = hasFilters
    ? filtered.length
    : Math.max(TOTAL_PRESCRIPTIONS - deletedPrescriptionIds.length, 0);
  const totalPages = Math.max(Math.ceil(totalItems / PAGE_SIZE), 1);

  /* ---------- Selection ---------- */
  const selectedOnPage = visible.filter((p) => selected.has(p.id)).length;
  const allSelected = visible.length > 0 && selectedOnPage === visible.length;
  const someSelected = selectedOnPage > 0 && !allSelected;

  const toggleOne = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleAll = () =>
    setSelected(allSelected ? new Set() : new Set(visible.map((p) => p.id)));

  /* ---------- SearchAndFilter configuration ---------- */
  const filters = [
    { label: "Status", options: STATUS_OPTIONS },
    { label: "Provider", options: PROVIDER_OPTIONS },
    { label: "Medication", options: MEDICATION_OPTIONS },
  ];

  const handleSearchChange = (value: string) => {
    setDraftField("search", value);
  };

  const handleFilterChange = (filterLabel: string, option: string) => {
    if (filterLabel === "Status") setDraftField("status", option);
    else if (filterLabel === "Provider") setDraftField("provider", option);
    else if (filterLabel === "Medication") setDraftField("medication", option);
  };

  const handleDateRangeChange = (range: DateRange) => {
    setDraftField("dateRange", range);
  };

  /* ---------- Table ---------- */
  const columns: TableColumn[] = [
    {
      key: "select",
      label: "",
      className: "w-10",
      header: (
        <input
          type="checkbox"
          checked={allSelected}
          ref={(el) => {
            if (el) el.indeterminate = someSelected;
          }}
          onChange={toggleAll}
          aria-label="Select all"
          className={checkboxCls}
        />
      ),
    },
    { key: "id", label: "Prescription ID" },
    { key: "patient", label: "Patient" },
    { key: "medications", label: "Medication(s)" },
    { key: "date", label: "Date" },
    { key: "provider", label: "Prescribed By" },
    { key: "status", label: "Status" },
    {
      key: "actions",
      label: "Actions",
      header: <div className="flex w-full items-center justify-center">Actions</div>,
    },
  ];

  const rows = visible.map((p) => ({
    select: (
      <input
        type="checkbox"
        checked={selected.has(p.id)}
        onChange={() => toggleOne(p.id)}
        aria-label={`Select ${p.id}`}
        className={checkboxCls}
      />
    ),
    id: (
      <button
        type="button"
        onClick={() => router.push(`/view-prescription?id=${encodeURIComponent(p.id)}`)}
        className="cursor-pointer text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
      >
        {p.id}
      </button>
    ),
    patient: <Name name={p.patient} sub={p.patientMeta} />,
    medications: (
      <div className="min-w-0 space-y-0.5 text-sm text-heading">
        {p.medications.map((m) => (
          <p key={m} className="truncate">{m}</p>
        ))}
        {p.moreCount ? <p className="text-xs font-medium text-primary">+{p.moreCount} more</p> : null}
      </div>
    ),
    date: <span className="whitespace-nowrap text-sm text-heading">{formatDate(p.date)}</span>,
    provider: <span className="whitespace-nowrap text-sm text-heading">{p.provider}</span>,
    status: <Tags text={p.status} tone={STATUS_TONES[p.status]} />,
    actions: (
      <div className="flex w-full items-center justify-center">
        <Actions
          actions={["view", "delete"]}
          onAction={(action) => {
            if (action === "view") router.push(`/view-prescription?id=${encodeURIComponent(p.id)}`);
            else if (action === "delete") {
              const [age = "", gender = ""] = p.patientMeta.split(" • ");
              dispatch(showDeletePrescription({
                id: p.id,
                patient: p.patient,
                age: Number.parseInt(age, 10) || 0,
                gender,
                medication: p.medications.join(", "),
                prescribedDate: formatDate(p.date),
                prescribedBy: p.provider,
              }));
            }
          }}
        />
      </div>
    ),
  }));

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-4 sm:space-y-5">
      {/* Breadcrumb */}
      <Breadcrumb items={[{ label: "Dashboard", href: "/dashboard" }, { label: "Prescriptions" }]} />

      {/* Title + actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-heading sm:text-lg 2xl:text-2xl">Prescriptions</h2>
          <p className="mt-0.5 text-sm text-body">
            View, manage and create prescriptions for patients.
          </p>
        </div>
        <AddButton
          text="Add Prescription"
          onClick={() => router.push("/add-prescription")}
          className="shrink-0 whitespace-nowrap"
        />
      </div>

      {/* Stat cards */}
      <StatCards stats={STATS} />

      {/* Search + filters */}
      <div className="rounded-[14px] border border-border bg-card p-4 sm:p-5">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex-1 min-w-[200px]">
            <SearchAndFilter
              placeholder="Search by patient name, medication or prescription ID..."
              value={draft.search}
              onSearch={handleSearchChange}
              filters={filters}
              selectedFilters={{
                Status: draft.status,
                Provider: draft.provider,
                Medication: draft.medication,
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
            <TableStatus variant="empty" message="No prescriptions match your filters." />
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
            onChange={setPage}
          />
        )}
      </div>
    </div>
  );
};

export default Prescriptions;