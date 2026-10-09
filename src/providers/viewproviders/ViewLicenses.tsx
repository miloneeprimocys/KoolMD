"use client";

import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  FileBadge,
  ShieldCheck,
  Plus,
} from "lucide-react";

import StatCards, { type StatItem } from "@/components/Statcards";
import AddButton from "@/components/Addbutton";
import SearchAndFilter from "@/components/Searchandfilter";
import Table from "@/components/Table";
import { type TableColumn } from "@/components/Tableheader";
import Content from "@/components/Content";
import Tags, { type TagTone } from "@/components/Tags";
import Actions from "@/components/Actions";
import Pagination from "@/components/Pagination";

/* ---------- Types + data (also used by RightSection) ---------- */
export type LicenseRow = {
  id: string;
  type: string;
  subType: string;
  number: string;
  state: string;
  stateCode: string;
  issueDate: string;
  expiryDate: string;
  status: "Active" | "Expiring Soon" | "Expired";
  statusTone: TagTone;
  iconTone: "blue" | "violet" | "green";
  authority?: string;
  notes?: string;
  fileName?: string;
  fileSize?: string;
};

export const LICENSE_TYPES = [
  "Medical License",
  "DEA Registration",
  "State Medical License",
  "Board Certification",
  "BLS Certification",
  "ACLS Certification",
];

export const LICENSE_STATES = [
  "California (CA)",
  "Texas (TX)",
  "New York (NY)",
  "Florida (FL)",
  "Illinois (IL)",
  "Federal (US)",
];

export const INITIAL_LICENSES: LicenseRow[] = [
  {
    id: "l1",
    type: "Medical License",
    subType: "Physician License",
    number: "MD123456",
    state: "California",
    stateCode: "(CA)",
    issueDate: "Jan 15, 2020",
    expiryDate: "Jan 14, 2026",
    status: "Active",
    statusTone: "success",
    iconTone: "blue",
    authority: "State Medical Board of California",
    fileName: "medical_license_ca.pdf",
    fileSize: "2.4 MB",
  },
  {
    id: "l2",
    type: "DEA Registration",
    subType: "Controlled Substances",
    number: "AB1234567",
    state: "Federal",
    stateCode: "(US)",
    issueDate: "Mar 10, 2021",
    expiryDate: "Mar 9, 2026",
    status: "Active",
    statusTone: "success",
    iconTone: "violet",
    authority: "Drug Enforcement Administration",
    fileName: "dea_certificate.pdf",
    fileSize: "1.8 MB",
  },
  {
    id: "l3",
    type: "State Medical License",
    subType: "Physician License",
    number: "MD654321",
    state: "Texas",
    stateCode: "(TX)",
    issueDate: "Jun 1, 2022",
    expiryDate: "May 31, 2025",
    status: "Expiring Soon",
    statusTone: "warning",
    iconTone: "violet",
    authority: "Texas Medical Board",
    fileName: "state_license_tx.pdf",
    fileSize: "1.2 MB",
  },
  {
    id: "l4",
    type: "Board Certification",
    subType: "Internal Medicine",
    number: "IM987654",
    state: "American Board",
    stateCode: "of Internal Medicine",
    issueDate: "Dec 12, 2019",
    expiryDate: "Dec 11, 2029",
    status: "Active",
    statusTone: "success",
    iconTone: "green",
    authority: "American Board of Internal Medicine",
    fileName: "board_certification.pdf",
    fileSize: "3.1 MB",
  },
];

export const LICENSES = INITIAL_LICENSES;

const FILTERS = [
  { label: "All Types", options: LICENSE_TYPES },
  { label: "All Statuses", options: ["Active", "Expiring Soon", "Expired"] },
];

const PAGE_SIZE = 10;

const iconToneCls: Record<LicenseRow["iconTone"], string> = {
  blue: "bg-primary/10 text-primary",
  violet: "bg-violet-100 text-violet-600",
  green: "bg-emerald-100 text-emerald-600",
};

/* ---------- Component ---------- */
type Props = {
  items?: LicenseRow[];
  onAddLicense: () => void;
  onViewLicense?: (license: LicenseRow) => void;
};

const ViewLicenses = ({
  items = INITIAL_LICENSES,
  onAddLicense,
  onViewLicense,
}: Props) => {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});

  // Dynamic stats calculated from current items
  const stats: StatItem[] = useMemo(() => {
    const total = items.length;
    const active = items.filter((l) => l.status === "Active").length;
    const expiring = items.filter((l) => l.status === "Expiring Soon").length;
    const expired = items.filter((l) => l.status === "Expired").length;

    return [
      { label: "Total Licenses", value: String(total), Icon: FileText, accent: "primary" },
      { label: "Active", value: String(active), Icon: CheckCircle2, accent: "success" },
      { label: "Expiring Soon", value: String(expiring), Icon: Clock, accent: "warning" },
      { label: "Expired", value: String(expired), Icon: AlertTriangle, accent: "danger" },
    ] as StatItem[];
  }, [items]);

  // Filtered items
  const filteredItems = useMemo(() => {
    return items.filter((l) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesQuery =
          l.type.toLowerCase().includes(q) ||
          l.number.toLowerCase().includes(q) ||
          l.state.toLowerCase().includes(q) ||
          l.subType.toLowerCase().includes(q);
        if (!matchesQuery) return false;
      }
      if (activeFilters["All Types"] && l.type !== activeFilters["All Types"]) {
        return false;
      }
      if (activeFilters["All Statuses"] && l.status !== activeFilters["All Statuses"]) {
        return false;
      }
      return true;
    });
  }, [items, searchQuery, activeFilters]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));
  const paginatedItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredItems.slice(start, start + PAGE_SIZE);
  }, [filteredItems, page]);

  const columns: TableColumn[] = useMemo(
    () => [
      { key: "type", label: "License Type" },
      { key: "number", label: "License Number" },
      { key: "state", label: "State/Jurisdiction" },
      { key: "issue", label: "Issue Date" },
      { key: "expiry", label: "Expiration Date" },
      { key: "status", label: "Status" },
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
      paginatedItems.map((l) => {
        const Icon = l.iconTone === "green" ? ShieldCheck : FileBadge;
        return {
          type: (
            <div
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => onViewLicense?.(l)}
            >
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${iconToneCls[l.iconTone]}`}>
                <Icon className="h-4 w-4" />
              </span>
              <Content title={l.type} description={l.subType} />
            </div>
          ),
          number: <Content title={l.number} />,
          state: <Content title={l.state} description={l.stateCode} />,
          issue: <Content title={l.issueDate} />,
          expiry: <Content title={l.expiryDate} />,
          status: <Tags text={l.status} tone={l.statusTone} />,
          actions: (
            <div className="flex w-full items-center justify-center">
              <Actions
                onAction={() => {
                  onViewLicense?.(l);
                }}
              />
            </div>
          ),
        };
      }),
    [paginatedItems, onViewLicense]
  );

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Stat cards */}
      <StatCards stats={stats} />

      {/* Search + filters + add */}
      <div className="flex flex-col gap-3 xl:flex-row xl:items-start 2xl:items-center">
        <div className="min-w-0 flex-1">
          <SearchAndFilter
            placeholder="Search by license number, state, type..."
            filters={FILTERS}
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
        <AddButton
          text="Add License"
          icon={<Plus className="h-4 w-4" />}
          onClick={onAddLicense}
        />
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

export default ViewLicenses;