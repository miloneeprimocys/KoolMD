"use client";

import React, { useMemo, useState } from "react";
import {
  Download,
  Eye,
  FileText,
  FileBadge,
  Files,
  IdCard,
  MoreVertical,
  ShieldCheck,
  Stethoscope,
  Upload,
  GraduationCap,
} from "lucide-react";

import SearchAndFilter from "@/components/Searchandfilter";
import AddButton from "@/components/Addbutton";
import Table from "@/components/Table";
import { type TableColumn } from "@/components/Tableheader";
import Content from "@/components/Content";
import Tags, { type TagTone } from "@/components/Tags";
import Actions from "@/components/Actions";
import Pagination from "@/components/Pagination";

/* ---------- Types + data (also used by RightSection) ---------- */
export type DocumentRow = {
  id: string;
  name: string;
  file: string;
  type: string;
  category: "Medical" | "Education" | "Certifications" | "Identification" | "Others";
  issuedOn: string;
  expiryDate: string;
  status: "Active" | "Expiring Soon" | "Expired";
  statusTone: TagTone;
  uploadedOn: string;
  iconTone: "blue" | "violet" | "red" | "green";
  notes?: string;
  fileSize?: string;
};

/** The backend stores a document as a LICENSE or a PRACTITIONER_CREDENTIAL file. */
export const DOCUMENT_TYPES = ["License", "Professional Credential"];


type CategoryKey = "All" | DocumentRow["category"];

const FILTERS = [
  { label: "All Types", options: DOCUMENT_TYPES },
  { label: "All Statuses", options: ["Active", "Expiring Soon", "Expired"] },
];

const PAGE_SIZE = 8;

const checkboxCls =
  "h-4 w-4 cursor-pointer rounded border-border accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30";

const iconToneCls: Record<DocumentRow["iconTone"], string> = {
  blue: "bg-primary/10 text-primary",
  violet: "bg-violet-100 text-violet-600",
  red: "bg-red-100 text-red-500",
  green: "bg-emerald-100 text-emerald-600",
};

const iconBtnCls =
  "flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-body transition-colors hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30";

/* ---------- Component ---------- */
type Props = {
  items?: DocumentRow[];
  onUploadDocument: () => void;
  onViewDocument?: (doc: DocumentRow) => void;
};

const Documents = ({
  items = [],
  onUploadDocument,
  onViewDocument,
}: Props) => {
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState<CategoryKey>("All");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});



  // Filtered by category, search and dropdowns
  const filteredItems = useMemo(() => {
    return items.filter((d) => {
      if (category !== "All" && d.category !== category) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          d.name.toLowerCase().includes(q) ||
          d.file.toLowerCase().includes(q) ||
          d.type.toLowerCase().includes(q);
        if (!matches) return false;
      }
      if (activeFilters["All Types"] && d.type !== activeFilters["All Types"]) {
        return false;
      }
      if (activeFilters["All Statuses"] && d.status !== activeFilters["All Statuses"]) {
        return false;
      }
      return true;
    });
  }, [items, category, searchQuery, activeFilters]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));
  const paginatedItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredItems.slice(start, start + PAGE_SIZE);
  }, [filteredItems, page]);

  const allSelected = selected.size > 0 && selected.size === paginatedItems.length;
  const someSelected = selected.size > 0 && selected.size < paginatedItems.length;

  const toggleOne = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleAll = () =>
    setSelected(allSelected ? new Set() : new Set(paginatedItems.map((d) => d.id)));

  const columns: TableColumn[] = useMemo(
    () => [
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
      { key: "name", label: "Document Name" },
      { key: "type", label: "Type" },
      { key: "issued", label: "Issued On" },
      { key: "expiry", label: "Expiry Date" },
      { key: "status", label: "Status" },
      { key: "uploaded", label: "Uploaded On" },
      {
        key: "actions",
        label: "Actions",
        header: <div className="flex w-full items-center justify-center">Actions</div>,
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [allSelected, someSelected, paginatedItems]
  );

  const rows = useMemo(
    () =>
      paginatedItems.map((d) => ({
        select: (
          <input
            type="checkbox"
            checked={selected.has(d.id)}
            onChange={() => toggleOne(d.id)}
            aria-label={`Select ${d.name}`}
            className={checkboxCls}
          />
        ),
        name: (
          <div
            className="flex min-w-0 cursor-pointer items-center gap-3"
            onClick={() => onViewDocument?.(d)}
          >
            <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${iconToneCls[d.iconTone]}`}>
              {d.iconTone === "green" ? <ShieldCheck className="h-4 w-4" /> : <FileBadge className="h-4 w-4" />}
            </span>
            <Content title={d.name} description={d.file} className="min-w-0 flex-1" truncate />
          </div>
        ),
        type: <Content title={d.type} />,
        issued: <Content title={d.issuedOn} />,
        expiry: <Content title={d.expiryDate} />,
        status: <Tags text={d.status} tone={d.statusTone} />,
        uploaded: <Content title={d.uploadedOn} />,
        actions: (
          <div className="flex w-full items-center justify-center">
            <Actions
              actions={["view", "download"]}
              onAction={(action) => {
                if (action === "view") {
                  onViewDocument?.(d);
                } else if (action === "download") {
                  console.log("download", d.file);
                }
              }}
            />
          </div>
        ),
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selected, paginatedItems, onViewDocument]
  );

  return (
    <div className="space-y-4 sm:space-y-5">
    

      {/* Search + filters + upload */}
      <div className="flex flex-col gap-3 xl:flex-row xl:items-start 2xl:items-center">
        <div className="min-w-0 flex-1">
          <SearchAndFilter
            placeholder="Search documents..."
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
          text="Upload Document"
          icon={<Upload className="h-4 w-4" />}
          onClick={onUploadDocument}
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

export default Documents;