"use client";

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

export const INITIAL_VERIFICATIONS: VerificationRow[] = [
  {
    id: "v1",
    name: "Medical License - California",
    sub: "License #MD123456",
    type: "Medical License",
    submittedOn: "Jan 15, 2020",
    verifiedOn: "Jan 18, 2020",
    status: "Verified",
    statusTone: "success",
    verifiedBy: "State Board",
    nextRenewal: "Jan 14, 2026",
    iconTone: "blue",
    detail: {
      documentType: "Medical License",
      licenseNumber: "MD123456",
      jurisdiction: "California (CA)",
      issuedDate: "Jan 15, 2020",
      expirationDate: "Jan 14, 2026",
      verifiedBy: "State Medical Board of California",
      method: "Online Verification (NPI/State Board)",
      notes: "License verified and active. No restrictions found.",
      fileName: "medical_license_ca.pdf",
      fileSize: "2.4 MB",
      timeline: [
        { label: "Document Submitted", date: "Jan 15, 2020  10:30 AM" },
        { label: "Under Review", date: "Jan 16, 2020  02:15 PM" },
        { label: "Verified", date: "Jan 18, 2020  09:20 AM" },
      ],
    },
  },
  {
    id: "v2",
    name: "DEA Registration",
    sub: "#AB1234567",
    type: "DEA Registration",
    submittedOn: "Mar 10, 2021",
    verifiedOn: "Mar 12, 2021",
    status: "Verified",
    statusTone: "success",
    verifiedBy: "DEA",
    nextRenewal: "Mar 09, 2026",
    iconTone: "violet",
    detail: {
      documentType: "DEA Registration",
      licenseNumber: "AB1234567",
      jurisdiction: "Federal (US)",
      issuedDate: "Mar 10, 2021",
      expirationDate: "Mar 09, 2026",
      verifiedBy: "Drug Enforcement Administration",
      method: "Federal DEA Registry Check",
      notes: "DEA Registration verified active with Schedule II-V privileges.",
      fileName: "dea_certificate.pdf",
      fileSize: "1.8 MB",
      timeline: [
        { label: "Document Submitted", date: "Mar 10, 2021  11:00 AM" },
        { label: "Under Review", date: "Mar 11, 2021  03:30 PM" },
        { label: "Verified", date: "Mar 12, 2021  10:15 AM" },
      ],
    },
  },
  { id: "v3", name: "State Medical License - Texas", sub: "License #MD654321", type: "State License", submittedOn: "Jun 01, 2022", verifiedOn: "Jun 03, 2022", status: "Verified", statusTone: "success", verifiedBy: "Texas Medical Board", nextRenewal: "May 31, 2025", iconTone: "red" },
  { id: "v4", name: "Board Certification", sub: "Internal Medicine", type: "Certification", submittedOn: "Dec 12, 2019", verifiedOn: "Dec 15, 2019", status: "Verified", statusTone: "success", verifiedBy: "ABIM", nextRenewal: "Dec 11, 2029", iconTone: "green" },
  { id: "v5", name: "Malpractice Insurance", sub: "Policy #MP987654", type: "Insurance", submittedOn: "Jan 10, 2024", verifiedOn: "Jan 12, 2024", status: "In Progress", statusTone: "warning", verifiedBy: "Admin Review", nextRenewal: "Jan 10, 2025", iconTone: "red" },
  { id: "v6", name: "CV / Resume", sub: "cv_michael_brown.pdf", type: "Professional", submittedOn: "Jan 05, 2024", verifiedOn: "Jan 06, 2024", status: "Verified", statusTone: "success", verifiedBy: "HR Team", nextRenewal: "-", iconTone: "red" },
  { id: "v7", name: "Government ID", sub: "passport.pdf", type: "Identification", submittedOn: "Jun 15, 2018", verifiedOn: "Jun 16, 2018", status: "Verified", statusTone: "success", verifiedBy: "Admin", nextRenewal: "-", iconTone: "blue" },
  { id: "v8", name: "Education Degree", sub: "MD - Harvard University", type: "Education", submittedOn: "May 20, 2015", verifiedOn: "May 25, 2015", status: "Verified", statusTone: "success", verifiedBy: "Education Board", nextRenewal: "-", iconTone: "blue" },
  { id: "v9", name: "BLS Certification", sub: "BLS_2024.pdf", type: "Certification", submittedOn: "Feb 01, 2024", verifiedOn: "-", status: "Failed", statusTone: "danger", verifiedBy: "System", nextRenewal: "Feb 01, 2026", iconTone: "red" },
  { id: "v10", name: "ACLS Certification", sub: "ACLS_2026.pdf", type: "Certification", submittedOn: "Mar 10, 2026", verifiedOn: "-", status: "Expired", statusTone: "neutral", verifiedBy: "System", nextRenewal: "Mar 10, 2026", iconTone: "red" },
];

export const VERIFICATIONS = INITIAL_VERIFICATIONS;

const FILTERS = [
  {
    label: "All Document Types",
    options: ["Medical License", "DEA Registration", "State License", "Certification", "Insurance", "Professional", "Identification", "Education"],
  },
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
  items = INITIAL_VERIFICATIONS,
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
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => onSelect(v)}
          >
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${iconToneCls[v.iconTone]} ${
                selectedId === v.id ? "ring-2 ring-primary/40" : ""
              }`}
            >
              {v.iconTone === "green" ? <ShieldCheck className="h-4 w-4" /> : <FileBadge className="h-4 w-4" />}
            </span>
            <Content title={v.name} description={v.sub} />
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