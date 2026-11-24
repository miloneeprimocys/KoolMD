"use client";

import React, { useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Download, Eye, FileText, Image as ImageIcon, Search, SlidersHorizontal, UploadCloud } from "lucide-react";

import Actions from "@/components/Actions";
import Content from "@/components/Content";
import ErrorToast from "@/components/ErrorToast";
import ImportButton from "@/components/ImportButton";
import SignupField from "@/components/SignupField";
import SuccessToast from "@/components/SuccessToast";
import Table from "@/components/Table";
import { type TableColumn } from "@/components/Tableheader";
import Tags, { type TagTone } from "@/components/Tags";
import { cardCls } from "@/providers/Shared";

/* ---------------------------------------------------------------- */
/*  Static data (replace with API data)                              */
/* ---------------------------------------------------------------- */
type Kind = "pdf" | "image" | "doc";
type Category = "Lab Report" | "Imaging" | "Prescription" | "Clinical Note" | "Insurance" | "Other";
type Doc = { id: string; name: string; size: string; kind: Kind; category: Category; by: "Patient" | "Provider"; date: string };

const INITIAL_DOCS: Doc[] = [
  { id: "d1", name: "Lab Report - CBC.pdf", size: "1.2 MB", kind: "pdf", category: "Lab Report", by: "Patient", date: "Oct 20, 2026" },
  { id: "d2", name: "MRI Brain Scan.png", size: "3.8 MB", kind: "image", category: "Imaging", by: "Provider", date: "Aug 14, 2026" },
  { id: "d3", name: "Prescription.pdf", size: "354 KB", kind: "pdf", category: "Prescription", by: "Provider", date: "Aug 14, 2026" },
  { id: "d4", name: "Consultation Summary.docx", size: "215 KB", kind: "doc", category: "Clinical Note", by: "Provider", date: "Jun 10, 2026" },
  { id: "d5", name: "Insurance Card.jpg", size: "1.1 MB", kind: "image", category: "Insurance", by: "Patient", date: "Mar 05, 2026" },
  { id: "d6", name: "Blood Test Results.pdf", size: "980 KB", kind: "pdf", category: "Lab Report", by: "Patient", date: "Jan 18, 2026" },
  { id: "d7", name: "Chest X-Ray.png", size: "2.4 MB", kind: "image", category: "Imaging", by: "Provider", date: "Jan 18, 2026" },
  { id: "d8", name: "Referral Letter.pdf", size: "120 KB", kind: "pdf", category: "Other", by: "Provider", date: "Jan 10, 2026" },
];

const CATEGORY_TONE: Record<Category, TagTone> = {
  "Lab Report": "violet",
  Imaging: "info",
  Prescription: "success",
  "Clinical Note": "violet",
  Insurance: "warning",
  Other: "neutral",
};

const COLUMNS: TableColumn[] = [
  { key: "select", label: "", className: "w-10" },
  { key: "name", label: "Document Name" },
  { key: "category", label: "Category" },
  { key: "by", label: "Uploaded By" },
  { key: "date", label: "Date Added" },
  { key: "actions", label: "Actions" },
];

const PAGE_SIZE = 5;
const MAX_BYTES = 10 * 1024 * 1024;
const ACCEPT = ".pdf,.jpg,.jpeg,.png,.doc,.docx";

const kindOf = (name: string): Kind => {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  return ["jpg", "jpeg", "png"].includes(ext) ? "image" : ext === "pdf" ? "pdf" : "doc";
};

const sizeLabel = (bytes: number) => (bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`);

const todayLabel = () => new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });

const iconBtn =
  "flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-body transition-colors hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30";

const pageBtn =
  "flex h-8 min-w-8 cursor-pointer items-center justify-center rounded-lg border px-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-50";

/* ---------------------------------------------------------------- */
/*  Tab: Documents                                                   */
/* ---------------------------------------------------------------- */
const ProviderDocuments = () => {
  const [docs, setDocs] = useState<Doc[]>(INITIAL_DOCS);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [dragging, setDragging] = useState(false);
  const [uploaded, setUploaded] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return docs.filter((d) => !q || d.name.toLowerCase().includes(q) || d.category.toLowerCase().includes(q));
  }, [docs, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const start = (current - 1) * PAGE_SIZE;
  const pageDocs = filtered.slice(start, start + PAGE_SIZE);

  const addFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const added: Doc[] = [];
    for (const file of Array.from(files)) {
      if (!ACCEPT.split(",").some((ext) => file.name.toLowerCase().endsWith(ext))) {
        setError(`${file.name}: unsupported format. Use PDF, JPG, PNG, DOC or DOCX.`);
        continue;
      }
      if (file.size > MAX_BYTES) {
        setError(`${file.name} is larger than 10 MB.`);
        continue;
      }
      // TODO: call your API here to upload the file
      added.push({ id: `up-${Date.now()}-${added.length}`, name: file.name, size: sizeLabel(file.size), kind: kindOf(file.name), category: "Other", by: "Provider", date: todayLabel() });
    }
    if (added.length) {
      setDocs((d) => [...added, ...d]);
      setPage(1);
      setUploaded(`${added.length} document${added.length > 1 ? "s" : ""} uploaded.`);
    }
    if (fileInput.current) fileInput.current.value = "";
  };

  const rows = pageDocs.map((d) => ({
    select: <input type="checkbox" aria-label={`Select ${d.name}`} className="h-4 w-4 cursor-pointer rounded border-border accent-primary" readOnly />,
    name: (
      <div className="flex items-center gap-3">
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${d.kind === "pdf" ? "bg-danger/10 text-danger" : "bg-primary/10 text-primary"}`}>
          {d.kind === "image" ? <ImageIcon className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
        </span>
        <Content title={<span className="font-semibold">{d.name}</span>} description={d.size} />
      </div>
    ),
    category: <Tags text={d.category} tone={CATEGORY_TONE[d.category]} size="xs" />,
    by: <Content title={d.by} />,
    date: <Content title={d.date} />,
    actions: (
      <div className="flex items-center gap-1">
        <button type="button" aria-label={`View ${d.name}`} className={iconBtn}>
          <Eye className="h-4 w-4" />
        </button>
        <button type="button" aria-label={`Download ${d.name}`} className={iconBtn}>
          <Download className="h-4 w-4" />
        </button>
        <Actions actions={["more"]} size="sm" />
      </div>
    ),
  }));

  return (
    <div className="grid min-w-0 items-start gap-4 sm:gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
      <SuccessToast isOpen={uploaded !== null} onClose={() => setUploaded(null)} title="Upload complete" message={uploaded ?? ""} />
      <ErrorToast isOpen={error !== null} onClose={() => setError(null)} title="Could not upload" message={error ?? ""} />

      {/* ---------- Documents list ---------- */}
      <section className={`${cardCls} min-w-0 space-y-4 sm:p-5`}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-base font-semibold text-heading">Documents ({docs.length})</h3>
          <div className="flex items-start gap-2">
            <div className="w-full sm:w-64">
              <SignupField
                name="documentSearch"
                placeholder="Search documents..."
                icon={<Search className="h-4 w-4" />}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                autoComplete="off"
              />
            </div>
            <button type="button" aria-label="Filter documents" className={`${iconBtn} h-12 w-12 shrink-0 border border-border`}>
              <SlidersHorizontal className="h-4 w-4" />
            </button>
          </div>
        </div>

        <Table columns={COLUMNS} rows={rows} selectable />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-body sm:text-sm">
            Showing {filtered.length === 0 ? 0 : start + 1}–{start + pageDocs.length} of {filtered.length} documents
          </p>
          <div className="flex items-center gap-1.5">
            <button type="button" aria-label="Previous page" disabled={current === 1} onClick={() => setPage(current - 1)} className={`${pageBtn} border-border text-body hover:bg-primary/10`}>
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                aria-current={n === current ? "page" : undefined}
                onClick={() => setPage(n)}
                className={`${pageBtn} ${n === current ? "border-primary bg-primary text-white" : "border-border text-heading hover:bg-primary/10"}`}
              >
                {n}
              </button>
            ))}
            <button type="button" aria-label="Next page" disabled={current === totalPages} onClick={() => setPage(current + 1)} className={`${pageBtn} border-border text-body hover:bg-primary/10`}>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ---------- Upload ---------- */}
      <aside className={`${cardCls} min-w-0 space-y-4 sm:p-5`}>
        <h3 className="flex items-center gap-2 text-base font-semibold text-heading">
          <UploadCloud className="h-5 w-5 text-primary" />
          Upload Document
        </h3>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            addFiles(e.dataTransfer.files);
          }}
          className={`flex flex-col items-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors ${
            dragging ? "border-primary bg-primary/10" : "border-border bg-primary/5"
          }`}
        >
          <UploadCloud className="h-8 w-8 text-primary" />
          <p className="text-sm font-semibold text-heading">Drag and drop files here</p>
          <p className="text-xs text-body">or</p>
          <ImportButton text="Choose Files" icon={null} onClick={() => fileInput.current?.click()} className="whitespace-nowrap" />
          <input ref={fileInput} type="file" multiple accept={ACCEPT} className="hidden" onChange={(e) => addFiles(e.target.files)} aria-label="Choose files to upload" />
        </div>

        <p className="text-center text-xs text-body">Supported formats: PDF, JPG, PNG, DOC, DOCX (Max 10 MB)</p>
      </aside>
    </div>
  );
};

export default ProviderDocuments;