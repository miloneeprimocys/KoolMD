"use client";

import RadioCheckButtonh from "@/components/RadioCheckButtonh";
import React, { useMemo, useState } from "react";
import { FileBadge, Upload } from "lucide-react";

import SignupDropdown from "@/components/SignupDropdown";
import { FieldError } from "@/components/SignupField";
import SearchAndFilter from "@/components/Searchandfilter";
import AddButton from "@/components/Addbutton";
import ImportButton from "@/components/ImportButton";
import Table from "@/components/Table";
import TableStatus from "@/components/TableStatus";
import { type TableColumn } from "@/components/Tableheader";
import Content from "@/components/Content";
import Actions from "@/components/Actions";
import Pagination from "@/components/Pagination";
import { ReqLabel, toOptions } from "@/components/Modalshell";

import { formatDate } from "./Licensesjurisdictions";

/* ---------- Types ---------- */
export type PractitionerDocument = {
  id: string;
  fileName: string;
  type: string;
  uploadedAt: string; // yyyy-mm-dd
  file?: File; // present for files uploaded in this session
};

export const DOCUMENT_TYPES = [
  "Medical License",
  "DEA Certificate",
  "NPI Confirmation",
  "Board Certification",
  "CV / Resume",
  "Background Check",
  "Professional Liability Insurance",
];

const TYPE_FILTER_LABEL = "All Types";
const FILTERS = [{ label: TYPE_FILTER_LABEL, options: DOCUMENT_TYPES }];

const TYPE_OPTIONS = toOptions(DOCUMENT_TYPES);
const PAGE_SIZE = 8;
const MAX_FILE_MB = 5;
const ALLOWED_EXT = ["pdf", "doc", "docx"];

const checkboxCls =
  "h-4 w-4 cursor-pointer rounded border-border accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30";

const todayIso = () => new Date().toISOString().slice(0, 10);

/* ---------- Component ---------- */
type Props = {
  documents: PractitionerDocument[];
  onDocumentsChange: (documents: PractitionerDocument[]) => void;
  onView: (document: PractitionerDocument) => void;
  /** Surface file problems (type / size) as a toast in the parent. */
  onError?: (message: string) => void;
};

const PractitionerDocuments = ({ documents, onDocumentsChange, onView, onError }: Props) => {
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});

  const [formOpen, setFormOpen] = useState(false);
  const [type, setType] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  /* ---------- Upload form ---------- */
  const closeForm = () => {
    setFormOpen(false);
    setType("");
    setFile(null);
    setErrors({});
  };

  const pickFile = (picked: File | undefined) => {
    if (!picked) return;
    const ext = picked.name.split(".").pop()?.toLowerCase() ?? "";
    if (!ALLOWED_EXT.includes(ext)) {
      onError?.("Only PDF, DOC or DOCX files are allowed.");
      return;
    }
    if (picked.size > MAX_FILE_MB * 1024 * 1024) {
      onError?.(`File is larger than ${MAX_FILE_MB}MB.`);
      return;
    }
    setFile(picked);
    setErrors((p) => ({ ...p, file: "" }));
  };

  const upload = () => {
    const e: Record<string, string> = {};
    if (!type) e.type = "Select a document type.";
    if (!file) e.file = "Choose a file to upload.";
    setErrors(e);
    if (Object.keys(e).length || !file) return;

    // TODO: call your upload API here
    onDocumentsChange([
      ...documents,
      { id: `doc${Date.now().toString(36)}`, fileName: file.name, type, uploadedAt: todayIso(), file },
    ]);
    closeForm();
  };

  /* ---------- Filtering + paging ---------- */
  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return documents.filter((d) => {
      if (q && !`${d.fileName} ${d.type}`.toLowerCase().includes(q)) return false;
      const typeFilter = activeFilters[TYPE_FILTER_LABEL];
      if (typeFilter && d.type !== typeFilter) return false;
      return true;
    });
  }, [documents, searchQuery, activeFilters]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedItems = useMemo(
    () => filteredItems.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [filteredItems, currentPage],
  );

  /* ---------- Selection (current page only) ---------- */
  const selectedOnPage = paginatedItems.filter((d) => selected.has(d.id)).length;
  const allSelected = paginatedItems.length > 0 && selectedOnPage === paginatedItems.length;
  const someSelected = selectedOnPage > 0 && !allSelected;

  const toggleOne = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleAll = () =>
    setSelected(allSelected ? new Set() : new Set(paginatedItems.map((d) => d.id)));

  /* ---------- Table ---------- */
  const columns: TableColumn[] = [
    {
      key: "select",
      label: "",
      className: "w-10",
      header: (
        <RadioCheckButtonh
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
    { key: "uploaded", label: "Uploaded Date" },
    {
      key: "actions",
      label: "Actions",
      header: <div className="flex w-full items-center justify-center">Actions</div>,
    },
  ];

  const rows = paginatedItems.map((d) => ({
    select: (
      <RadioCheckButtonh
        type="checkbox"
        checked={selected.has(d.id)}
        onChange={() => toggleOne(d.id)}
        aria-label={`Select ${d.fileName}`}
        className={checkboxCls}
      />
    ),
    name: (
      <div className="flex min-w-0 cursor-pointer items-center gap-3" onClick={() => onView(d)}>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <FileBadge className="h-4 w-4" />
        </span>
        <Content title={d.fileName} className="min-w-0 flex-1" truncate />
      </div>
    ),
    type: <Content title={d.type} />,
    uploaded: <Content title={formatDate(d.uploadedAt)} />,
    actions: (
      <div className="flex w-full items-center justify-center">
        <Actions
          actions={["view", "delete"]}
          onAction={(action) => {
            if (action === "view") onView(d);
            else if (action === "delete") {
              onDocumentsChange(documents.filter((x) => x.id !== d.id));
              setSelected((prev) => {
                const next = new Set(prev);
                next.delete(d.id);
                return next;
              });
            }
          }}
        />
      </div>
    ),
  }));

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Search + filters + upload */}
      <div className="flex flex-col gap-3 xl:flex-row xl:items-start 2xl:items-center">
        <div className="min-w-0 flex-1">
          <SearchAndFilter
            placeholder="Search documents..."
            filters={FILTERS}
            showDateRange={false}
            onSearch={(value) => {
              setSearchQuery(value);
              setPage(1);
            }}
            onFilterChange={(filterLabel, option) => {
              setActiveFilters((prev) => ({ ...prev, [filterLabel]: option }));
              setPage(1);
            }}
          />
        </div>
        <AddButton
          text="Upload Document"
          icon={<Upload className="h-4 w-4" />}
          onClick={() => setFormOpen(true)}
          className="whitespace-nowrap"
        />
      </div>

      {/* Inline upload form */}
      {formOpen && (
        <div className="rounded-[14px] border border-primary/40 bg-primary/[0.03] p-3 sm:p-4">
          <p className="mb-3 text-sm font-semibold text-heading">New Document</p>
          <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_auto] 2xl:items-end">
            <SignupDropdown
              name="documentType"
              label={<ReqLabel>Document Type</ReqLabel>}
              placeholder="Select document type"
              searchable={false}
              options={TYPE_OPTIONS}
              value={type}
              onChange={(val) => {
                setType(val);
                setErrors((p) => ({ ...p, type: "" }));
              }}
              error={errors.type}
            />
            <div>
              <p className="mb-2 text-sm font-medium text-label">
                <ReqLabel>File</ReqLabel>
              </p>
              <input
                id="practitionerDocumentFile"
                type="file"
                accept=".pdf,.doc,.docx"
                className="sr-only"
                onChange={(e) => {
                  pickFile(e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                <label
                  htmlFor="practitionerDocumentFile"
                  className={`inline-flex h-12 w-full shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-xl border bg-card px-4 text-sm font-semibold text-primary transition-colors hover:bg-primary/5 focus-within:ring-2 focus-within:ring-primary/30 sm:w-auto ${
                    errors.file ? "border-danger" : "border-border"
                  }`}
                >
                  <Upload className="h-4 w-4 shrink-0" />
                  Choose File
                </label>
                {file ? (
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="truncate text-xs font-medium text-heading sm:text-sm" title={file.name}>
                      {file.name}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setFile(null);
                      }}
                      className="shrink-0 text-xs font-medium text-danger hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <span className="min-w-0 truncate text-xs text-body sm:text-sm">
                    PDF, DOC, DOCX (Max {MAX_FILE_MB}MB)
                  </span>
                )}
              </div>
              <FieldError message={errors.file || undefined} />
            </div>
            <div className="flex items-center justify-end gap-2 sm:col-span-2 sm:gap-3 2xl:col-span-1 2xl:h-12 2xl:self-end">
              <ImportButton text="Cancel" icon={null} onClick={closeForm} className="whitespace-nowrap" />
              <AddButton text="Upload" onClick={upload} className="whitespace-nowrap" />
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="rounded-[14px] border border-border bg-card">
            <TableStatus variant="empty" message="No documents found." />
          </div>
        ) : (
          <Table columns={columns} rows={rows} />
        )}
        {filteredItems.length > 0 && (
          <Pagination
            page={currentPage}
            totalPages={totalPages}
            totalItems={filteredItems.length}
            pageSize={PAGE_SIZE}
            itemLabel="documents"
            onChange={setPage}
          />
        )}
      </div>
    </div>
  );
};

export default PractitionerDocuments;