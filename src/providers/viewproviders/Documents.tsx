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

export const DOCUMENT_TYPES = [
  "Medical License",
  "DEA Registration",
  "State License",
  "Certification",
  "Insurance",
  "Professional",
  "Identification",
  "Education",
];

export const INITIAL_DOCUMENTS: DocumentRow[] = [
  { id: "d1", name: "Medical License - California", file: "medical_license_ca.pdf", type: "Medical License", category: "Medical", issuedOn: "Jan 15, 2020", expiryDate: "Jan 14, 2026", status: "Active", statusTone: "success", uploadedOn: "Mar 01, 2024", iconTone: "blue", fileSize: "2.4 MB" },
  { id: "d2", name: "DEA Registration", file: "dea_certificate.pdf", type: "DEA Registration", category: "Medical", issuedOn: "Mar 10, 2021", expiryDate: "Mar 09, 2026", status: "Active", statusTone: "success", uploadedOn: "Mar 01, 2024", iconTone: "violet", fileSize: "1.8 MB" },
  { id: "d3", name: "State Medical License - Texas", file: "state_license_tx.pdf", type: "State License", category: "Certifications", issuedOn: "Jun 01, 2022", expiryDate: "May 31, 2025", status: "Expiring Soon", statusTone: "warning", uploadedOn: "Mar 01, 2024", iconTone: "red", fileSize: "1.2 MB" },
  { id: "d4", name: "Board Certification", file: "board_certification.pdf", type: "Certification", category: "Certifications", issuedOn: "Dec 12, 2019", expiryDate: "Dec 11, 2029", status: "Active", statusTone: "success", uploadedOn: "Mar 01, 2024", iconTone: "green", fileSize: "3.1 MB" },
  { id: "d5", name: "Malpractice Insurance", file: "malpractice_insurance.pdf", type: "Insurance", category: "Others", issuedOn: "Jan 01, 2024", expiryDate: "Jan 01, 2025", status: "Active", statusTone: "success", uploadedOn: "Mar 01, 2024", iconTone: "red", fileSize: "2.0 MB" },
  { id: "d6", name: "CV / Resume", file: "cv_michael_brown.pdf", type: "Professional", category: "Others", issuedOn: "-", expiryDate: "-", status: "Active", statusTone: "success", uploadedOn: "Mar 01, 2024", iconTone: "red", fileSize: "850 KB" },
  { id: "d7", name: "Government ID", file: "passport.pdf", type: "Identification", category: "Identification", issuedOn: "Jun 15, 2018", expiryDate: "Jun 15, 2028", status: "Active", statusTone: "success", uploadedOn: "Mar 01, 2024", iconTone: "blue", fileSize: "1.5 MB" },
  { id: "d8", name: "Education Degree", file: "medical_degree.pdf", type: "Education", category: "Education", issuedOn: "May 20, 2015", expiryDate: "-", status: "Active", statusTone: "success", uploadedOn: "Mar 01, 2024", iconTone: "blue", fileSize: "2.7 MB" },
];

export const DOCUMENTS = INITIAL_DOCUMENTS;

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
  items = INITIAL_DOCUMENTS,
  onUploadDocument,
  onViewDocument,
}: Props) => {
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState<CategoryKey>("All");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});

  // Dynamic category calculations
  const categories = useMemo(() => {
    const total = items.length;
    const identification = items.filter((d) => d.category === "Identification").length;
    const medical = items.filter((d) => d.category === "Medical").length;
    const education = items.filter((d) => d.category === "Education").length;
    const certifications = items.filter((d) => d.category === "Certifications").length;
    const others = items.filter((d) => d.category === "Others").length;

    return [
      { key: "All" as const, label: "All Documents", count: total, Icon: Files, tone: "bg-primary/10 text-primary" },
      { key: "Identification" as const, label: "Identification", count: identification, Icon: IdCard, tone: "bg-primary/10 text-primary" },
      { key: "Medical" as const, label: "Medical", count: medical, Icon: Stethoscope, tone: "bg-orange-100 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400" },
      { key: "Education" as const, label: "Education", count: education, Icon: GraduationCap, tone: "bg-violet-100 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400" },
      { key: "Certifications" as const, label: "Certifications", count: certifications, Icon: ShieldCheck, tone: "bg-orange-100 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400" },
      { key: "Others" as const, label: "Others", count: others, Icon: FileText, tone: "bg-primary/10 text-primary" },
    ];
  }, [items]);

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
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => onViewDocument?.(d)}
          >
            <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${iconToneCls[d.iconTone]}`}>
              {d.iconTone === "green" ? <ShieldCheck className="h-4 w-4" /> : <FileBadge className="h-4 w-4" />}
            </span>
            <Content title={d.name} description={d.file} />
          </div>
        ),
        type: <Content title={d.type} />,
        issued: <Content title={d.issuedOn} />,
        expiry: <Content title={d.expiryDate} />,
        status: <Tags text={d.status} tone={d.statusTone} />,
        uploaded: <Content title={d.uploadedOn} />,
        actions: (
          <div className="flex w-full items-center justify-center gap-1">
            <button
              type="button"
              aria-label={`View ${d.name}`}
              className={iconBtnCls}
              onClick={() => onViewDocument?.(d)}
            >
              <Eye className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label={`Download ${d.name}`}
              className={iconBtnCls}
              onClick={() => console.log("download", d.file)}
            >
              <Download className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label={`More actions for ${d.name}`}
              className={iconBtnCls}
              onClick={() => onViewDocument?.(d)}
            >
              <MoreVertical className="h-4 w-4" />
            </button>
          </div>
        ),
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selected, paginatedItems, onViewDocument]
  );

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Category cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        {categories.map(({ key, label, count, Icon, tone }) => {
          const active = category === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => {
                setCategory(key);
                setSelected(new Set());
                setPage(1);
              }}
              aria-pressed={active}
              className={`flex items-center gap-3 rounded-[14px] border bg-card p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 cursor-pointer ${
                active ? "border-primary" : "border-border hover:border-primary/40"
              }`}
            >
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${tone}`}>
                <Icon className="h-5 w-5" />
              </span>
              <span className="min-w-0">
                <span className="block text-lg font-semibold leading-tight text-heading">{count}</span>
                <span className="block truncate text-xs text-body">{label}</span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Search + filters + upload */}
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
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