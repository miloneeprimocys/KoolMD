"use client";

import { LICENSE_TYPES } from "./ViewLicenses";
import React, { useMemo, useRef, useEffect, useState } from "react";
import {
  Calendar,
  CheckCircle2,
  Clock,
  FileBadge,
  FileText,
  ShieldCheck,
  XCircle,
  X,
} from "lucide-react";

import StatCards, { type StatItem } from "@/components/Statcards";
import SearchAndFilter from "@/components/Searchandfilter";
import Table from "@/components/Table";
import { type TableColumn } from "@/components/Tableheader";
import Content from "@/components/Content";
import Tags, { type TagTone } from "@/components/Tags";
import Actions from "@/components/Actions";
import Pagination from "@/components/Pagination";
import DatePicker from "@/components/Datepicker";

/* ---------- Types + data (also used by RightSection) ---------- */
export type VerificationStatus = "Verified" | "In Progress" | "Failed" | "Expired";

export type VerificationDetail = {
  documentType: string;
  licenseNumber: string;
  jurisdiction: string;
  issuedDate: string;
  expirationDate: string;
  verifiedBy: string;
  method: string;
  notes: string;
  fileName: string;
  fileSize: string;
  /** Backend document id, when a file is attached (enables download). */
  documentId?: string;
  timeline: { label: string; date: string }[];
};

export type VerificationRow = {
  id: string;
  name: string;
  sub: string;
  type: string;
  submittedOn: string;
  verifiedOn: string;
  status: VerificationStatus;
  statusTone: TagTone;
  verifiedBy: string;
  nextRenewal: string;
  iconTone: "blue" | "violet" | "red" | "green";
  detail?: VerificationDetail;
};


const FILTERS = [
  { label: "All Document Types", options: LICENSE_TYPES },
  { label: "All Statuses", options: ["Verified", "In Progress", "Failed", "Expired"] },
];

const PAGE_SIZE = 10;

const iconToneCls: Record<VerificationRow["iconTone"], string> = {
  blue: "bg-primary/10 text-primary",
  violet: "bg-violet-100 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400",
  red: "bg-red-100 text-red-500 dark:bg-red-950/40 dark:text-red-400",
  green: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400",
};

/* ---------- Component ---------- */
type Props = {
  items?: VerificationRow[];
  selectedId?: string | null;
  onSelect: (row: VerificationRow) => void;
};

const History = ({
  items = [],
  selectedId,
  onSelect,
}: Props) => {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: "",
    end: "",
  });
  const [tempDates, setTempDates] = useState<{ start: string; end: string }>({
    start: "",
    end: "",
  });
  const [dateOpen, setDateOpen] = useState(false);
  const dateRef = useRef<HTMLDivElement>(null);

  // Click outside to close date popover
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (dateRef.current && !dateRef.current.contains(e.target as Node)) {
        setDateOpen(false);
      }
    };
    if (dateOpen) document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [dateOpen]);

  // Dynamic stats
  const stats: StatItem[] = useMemo(() => {
    const total = items.length;
    const verified = items.filter((v) => v.status === "Verified").length;
    const inProgress = items.filter((v) => v.status === "In Progress").length;
    const failed = items.filter((v) => v.status === "Failed").length;
    const expired = items.filter((v) => v.status === "Expired").length;

    return [
      { label: "Total Verifications", value: String(total), Icon: FileText, accent: "primary" },
      { label: "Verified", value: String(verified), Icon: CheckCircle2, accent: "success" },
      { label: "In Progress", value: String(inProgress), Icon: Clock, accent: "warning" },
      { label: "Failed", value: String(failed), Icon: XCircle, accent: "danger" },
      { label: "Expired", value: String(expired), Icon: Clock, accent: "danger" },
    ] as StatItem[];
  }, [items]);

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter((v) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          v.name.toLowerCase().includes(q) ||
          v.sub.toLowerCase().includes(q) ||
          v.type.toLowerCase().includes(q) ||
          v.verifiedBy.toLowerCase().includes(q);
        if (!matches) return false;
      }
      if (activeFilters["All Document Types"] && v.type !== activeFilters["All Document Types"]) {
        return false;
      }
      if (activeFilters["All Statuses"] && v.status !== activeFilters["All Statuses"]) {
        return false;
      }
      if (dateRange.start || dateRange.end) {
        const rowDate = new Date(v.submittedOn);
        if (dateRange.start) {
          const startDate = new Date(dateRange.start);
          if (rowDate < startDate) return false;
        }
        if (dateRange.end) {
          const endDate = new Date(dateRange.end);
          endDate.setHours(23, 59, 59, 999);
          if (rowDate > endDate) return false;
        }
      }
      return true;
    });
  }, [items, searchQuery, activeFilters, dateRange]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));
  const paginatedItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredItems.slice(start, start + PAGE_SIZE);
  }, [filteredItems, page]);

  const columns: TableColumn[] = useMemo(
    () => [
      { key: "name", label: "Document Name" },
      { key: "type", label: "Type" },
      { key: "submitted", label: "Submitted On" },
      { key: "verified", label: "Verified On" },
      { key: "status", label: "Status" },
      { key: "verifiedBy", label: "Verified By" },
      { key: "renewal", label: "Next Renewal" },
      {
        key: "actions",
        label: "Actions",
        header: <div className="flex w-full items-center justify-center">Actions</div>,
      },
    ],
    []
  );

  const rows = useMemo(
    () =>
      paginatedItems.map((v) => ({
        name: (
          <div
            className="flex min-w-0 cursor-pointer items-center gap-3"
            onClick={() => onSelect(v)}
          >
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${iconToneCls[v.iconTone]} ${
                selectedId === v.id ? "ring-2 ring-primary/40" : ""
              }`}
            >
              {v.iconTone === "green" ? <ShieldCheck className="h-4 w-4" /> : <FileBadge className="h-4 w-4" />}
            </span>
            <Content title={v.name} description={v.sub} className="min-w-0 flex-1" truncate />
          </div>
        ),
        type: <Content title={v.type} />,
        submitted: <Content title={v.submittedOn} />,
        verified: <Content title={v.verifiedOn} />,
        status: <Tags text={v.status} tone={v.statusTone} />,
        verifiedBy: <Content title={v.verifiedBy} />,
        renewal: <Content title={v.nextRenewal} />,
        actions: (
          <div className="flex w-full items-center justify-center">
            <Actions onAction={() => onSelect(v)} />
          </div>
        ),
      })),
    [paginatedItems, selectedId, onSelect]
  );

  const hasActiveDateRange = Boolean(dateRange.start || dateRange.end);

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Stat cards */}
      <StatCards stats={stats} />

      {/* Search + filters + date range */}
      <div className="flex flex-col gap-3 xl:flex-row xl:items-start 2xl:items-center">
        <div className="min-w-0 flex-1">
          <SearchAndFilter
            placeholder="Search by document, type or reference..."
            filters={FILTERS}
            showDateRange={false}
            onSearch={setSearchQuery}
            onFilterChange={(filterLabel, option) => {
              setActiveFilters((prev) => ({
                ...prev,
                [filterLabel]: option,
              }));
              setPage(1);
            }}
          />
        </div>

        {/* DatePicker popover trigger button */}
        <div className="relative shrink-0" ref={dateRef}>
          <button
            type="button"
            onClick={() => setDateOpen((o) => !o)}
            className={`flex h-11 items-center gap-2 rounded-lg border px-3.5 text-xs sm:text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 cursor-pointer ${
              hasActiveDateRange || dateOpen
                ? "border-primary bg-primary/5 text-primary"
                : "border-border bg-card text-heading hover:border-primary/40 hover:text-primary"
            }`}
          >
            <Calendar className="h-4 w-4 text-body" />
            <span>
              {hasActiveDateRange
                ? `${dateRange.start || "Start"} - ${dateRange.end || "End"}`
                : "Date Range"}
            </span>
            {hasActiveDateRange && (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  setDateRange({ start: "", end: "" });
                  setTempDates({ start: "", end: "" });
                }}
                className="ml-1 flex h-4 w-4 items-center justify-center rounded-full text-body hover:text-heading"
                title="Clear date range"
              >
                <X className="h-3 w-3" />
              </span>
            )}
          </button>

          {dateOpen && (
            <div className="absolute right-0 top-full z-[120] mt-2 w-72 sm:w-80 rounded-2xl border border-border bg-card p-4 shadow-2xl ring-1 ring-border/60 animate-in fade-in zoom-in-95">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-heading">
                Select Date Range
              </p>
              <div className="space-y-3">
                <DatePicker
                  label="From Date"
                  placeholder="Select start date"
                  value={tempDates.start}
                  onChange={(v) => setTempDates((p) => ({ ...p, start: v }))}
                  align="left"
                />
                <DatePicker
                  label="To Date"
                  placeholder="Select end date"
                  value={tempDates.end}
                  minDate={tempDates.start || undefined}
                  onChange={(v) => setTempDates((p) => ({ ...p, end: v }))}
                  align="right"
                />
              </div>

              <div className="mt-4 flex items-center justify-end gap-2 border-t border-divider pt-3">
                <button
                  type="button"
                  onClick={() => {
                    const empty = { start: "", end: "" };
                    setTempDates(empty);
                    setDateRange(empty);
                    setDateOpen(false);
                    setPage(1);
                  }}
                  className="cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium text-body hover:bg-heading/5 hover:text-heading"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDateRange(tempDates);
                    setDateOpen(false);
                    setPage(1);
                  }}
                  className="cursor-pointer rounded-lg bg-primary px-3.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-primary-hover shadow-xs"
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="space-y-3">
        <Table columns={columns} rows={rows} />
        <Pagination
          page={page}
          totalPages={totalPages}
          totalItems={filteredItems.length}
          pageSize={PAGE_SIZE}
          onChange={setPage}
        />
      </div>
    </div>
  );
};

export default History;