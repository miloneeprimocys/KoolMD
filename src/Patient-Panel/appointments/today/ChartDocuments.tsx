"use client";

import React, { useMemo, useState } from "react";
import {
  Download,
  Expand,
  FileImage,
  FileText,
  FlaskConical,
  Info,
  Maximize2,
  Printer,
  Trash2,
  Upload,
  Eye,
  type LucideIcon,
} from "lucide-react";

import AddButton from "@/components/Addbutton";
import Actions from "@/components/Actions";
import Content from "@/components/Content";
import DeleteDialog from "@/components/Deletedialog";
import ImportButton from "@/components/ImportButton";
import MaximizeImage from "@/components/MaximizeImage";
import Pagination from "@/components/Pagination";
import RadioCheckButtonh from "@/components/RadioCheckButtonh";
import SearchAndFilter from "@/components/Searchandfilter";
import Table from "@/components/Table";
import TableStatus from "@/components/TableStatus";
import { type TableColumn } from "@/components/Tableheader";
import Tags, { type TagTone } from "@/components/Tags";
import { TableSelectAllCheckbox, useTableSelection } from "@/components/TableSelection";
import { cardCls } from "@/providers/Shared";

/* ---------------------------------------------------------------- */
/*  Static data (replace with API data)                              */
/* ---------------------------------------------------------------- */
type Category = "Lab Results" | "Imaging" | "Reports" | "Forms" | "Other";
type DocRow = {
  id: string;
  name: string;
  kind: "pdf" | "image";
  category: Category;
  date: string;
  by: string;
  size: string;
};

const mk = (id: number, name: string, kind: DocRow["kind"], category: Category, date: string, by: string, size: string): DocRow => ({
  id: `d${id}`,
  name,
  kind,
  category,
  date,
  by,
  size,
});

const INITIAL_DOCS: DocRow[] = [
  mk(1, "Lab Results – CBC.pdf", "pdf", "Lab Results", "Oct 21, 2026", "Patient", "248 KB"),
  mk(2, "Chest X-Ray.png", "image", "Imaging", "Aug 15, 2026", "Dr. Sarah Miller", "1.8 MB"),
  mk(3, "Encounter Summary.pdf", "pdf", "Reports", "Oct 21, 2026", "Dr. Sarah Miller", "240 KB"),
  mk(4, "Intake Questionnaire.pdf", "pdf", "Forms", "May 10, 2026", "Patient", "190 KB"),
  mk(5, "Medication List.png", "image", "Other", "Feb 05, 2026", "Patient", "420 KB"),
  mk(6, "Lab Results – Lipid Panel.pdf", "pdf", "Lab Results", "Aug 15, 2026", "Patient", "230 KB"),
  mk(7, "Lab Results – Vitamin D.pdf", "pdf", "Lab Results", "Oct 21, 2026", "Patient", "205 KB"),
  mk(8, "MRI Brain.png", "image", "Imaging", "Jun 02, 2026", "Dr. Sarah Miller", "2.4 MB"),
  mk(9, "Wellness Summary.pdf", "pdf", "Reports", "Aug 15, 2026", "Dr. Sarah Miller", "210 KB"),
  mk(10, "Consent Form.pdf", "pdf", "Forms", "Feb 05, 2026", "Patient", "150 KB"),
  mk(11, "Insurance Card.png", "image", "Other", "Feb 05, 2026", "Patient", "380 KB"),
  mk(12, "Referral Letter.pdf", "pdf", "Other", "Mar 11, 2026", "Dr. Sarah Miller", "175 KB"),
];

const CATEGORIES: Category[] = ["Lab Results", "Imaging", "Reports", "Forms", "Other"];
const CATEGORY_TONE: Record<Category, TagTone> = {
  "Lab Results": "violet",
  Imaging: "info",
  Reports: "success",
  Forms: "warning",
  Other: "neutral",
};

const CBC = [
  { test: "WBC", result: "6.4", range: "4.0 – 11.0 x10³/µL" },
  { test: "RBC", result: "4.62", range: "3.80 – 5.20 x10⁶/µL" },
  { test: "Hemoglobin", result: "13.8", range: "12.0 – 15.5 g/dL" },
  { test: "Hematocrit", result: "41.5", range: "36.0 – 46.0 %" },
  { test: "Platelets", result: "248", range: "150 – 400 x10³/µL" },
];

const PAGE_SIZE = 6;

const checkboxCls =
  "h-4 w-4 cursor-pointer rounded border-border accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30";

const iconBtnDark =
  "flex h-7 w-7 cursor-pointer items-center justify-center rounded text-white/80 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40";

const FileIcon = ({ kind }: { kind: DocRow["kind"] }) =>
  kind === "pdf" ? (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-danger/10 text-danger">
      <FileText className="h-4 w-4" />
    </span>
  ) : (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
      <FileImage className="h-4 w-4" />
    </span>
  );

const DocumentPreviewPage = ({ doc }: { doc: DocRow }) =>
  doc.category === "Lab Results" ? (
    <div className="rounded bg-white p-4 text-[11px] text-slate-700 shadow">
      <div className="flex items-start justify-between gap-3 border-b border-slate-200 pb-2">
        <p className="text-sm font-bold text-violet-700">CityPath Labs</p>
        <p className="text-xs font-semibold">Laboratory Report</p>
      </div>
      <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-0.5">
        <div className="flex gap-2">
          <dt className="text-slate-500">Patient Name</dt>
          <dd>: Emily Carter</dd>
        </div>
        <div className="flex gap-2">
          <dt className="text-slate-500">Report Date</dt>
          <dd>: {doc.date}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="text-slate-500">MRN</dt>
          <dd>: KM-002487</dd>
        </div>
        <div className="flex gap-2">
          <dt className="text-slate-500">Age / Gender</dt>
          <dd>: 32 Years / Female</dd>
        </div>
      </dl>
      <p className="mt-3 rounded bg-violet-50 px-2 py-1 font-semibold text-violet-700">Complete Blood Count (CBC)</p>
      <table className="mt-1 w-full text-left">
        <thead>
          <tr className="text-slate-500">
            <th className="py-1 font-medium">Test</th>
            <th className="py-1 font-medium">Result</th>
            <th className="py-1 font-medium">Reference Range</th>
          </tr>
        </thead>
        <tbody>
          {CBC.map((row) => (
            <tr key={row.test} className="border-t border-slate-100">
              <td className="py-1">{row.test}</td>
              <td className="py-1">{row.result}</td>
              <td className="py-1">{row.range}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ) : (
    <div className="flex min-h-[220px] flex-col items-center justify-center gap-2 rounded bg-white p-4 text-center text-xs text-slate-500 shadow">
      <FileIcon kind={doc.kind} />
      <p className="font-medium text-slate-700">{doc.name}</p>
      <p>Preview will appear here.</p>
    </div>
  );

const PreviewSurface = ({ doc }: { doc: DocRow }) => (
  <div className="bg-slate-100 p-3 dark:bg-slate-900/40">
    <DocumentPreviewPage doc={doc} />
  </div>
);

const CATEGORY_ICON: Record<Category, LucideIcon> = {
  "Lab Results": FlaskConical,
  Imaging: FileImage,
  Reports: FileText,
  Forms: FileText,
  Other: FileText,
};

/* ---------------------------------------------------------------- */
/*  Tab: Documents                                                   */
/* ---------------------------------------------------------------- */
const ChartDocuments = () => {
  const [docs, setDocs] = useState<DocRow[]>(INITIAL_DOCS);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<"All" | Category>("All");
  const [page, setPage] = useState(1);
  const [activeId, setActiveId] = useState<string>(INITIAL_DOCS[0].id);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [previewExpanded, setPreviewExpanded] = useState(false);
  const [previewZoom, setPreviewZoom] = useState(100);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return docs.filter(
      (d) => (category === "All" || d.category === category) && (!q || `${d.name} ${d.category} ${d.by}`.toLowerCase().includes(q)),
    );
  }, [docs, search, category]);

  const totalPages = Math.max(Math.ceil(filtered.length / PAGE_SIZE), 1);
  const safePage = Math.min(page, totalPages);
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const { selectedKeys, allSelected, someSelected, toggleRow, toggleAll } = useTableSelection(visible.map((d) => d.id));
  const selectedDocs = docs.filter((d) => selectedKeys.has(d.id));
  const active = docs.find((d) => d.id === activeId) ?? docs[0];
  const activeIndex = active ? docs.findIndex((d) => d.id === active.id) : -1;

  const counts = (c: "All" | Category) => (c === "All" ? docs.length : docs.filter((d) => d.category === c).length);
  const stepPreview = (delta: number) => {
    const next = docs[activeIndex + delta];
    if (next) setActiveId(next.id);
  };

  const deleteSelected = () => {
    // TODO: call your delete-documents API
    const gone = new Set(selectedDocs.map((d) => d.id));
    setDocs((prev) => prev.filter((d) => !gone.has(d.id)));
    if (gone.has(activeId)) {
      const next = docs.find((d) => !gone.has(d.id));
      if (next) setActiveId(next.id);
    }
    setConfirmDelete(false);
  };

  const columns: TableColumn[] = [
    {
      key: "select",
      label: "",
      className: "w-10",
      header: <TableSelectAllCheckbox checked={allSelected} indeterminate={someSelected} onChange={toggleAll} className={checkboxCls} />,
    },
    { key: "name", label: "Document Name" },
    { key: "category", label: "Category" },
    { key: "date", label: "Uploaded Date" },
    { key: "by", label: "Uploaded By" },
    { key: "actions", label: "", className: "w-10" },
  ];

  const rows = visible.map((d) => {
    const CatIcon = CATEGORY_ICON[d.category];
    return {
      select: (
        <RadioCheckButtonh
          type="checkbox"
          checked={selectedKeys.has(d.id)}
          onChange={() => toggleRow(d.id)}
          aria-label={`Select ${d.name}`}
          className={checkboxCls}
        />
      ),
      name: (
        <button
          type="button"
          onClick={() => setActiveId(d.id)}
          className={`flex min-w-0 cursor-pointer items-center gap-2.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${
            d.id === activeId ? "font-semibold text-primary" : "text-heading"
          }`}
        >
          <FileIcon kind={d.kind} />
          <span className="truncate text-sm font-medium">{d.name}</span>
        </button>
      ),
      category: (
        <span className="flex items-center gap-1.5">
          <CatIcon className="h-4 w-4 text-primary" aria-hidden="true" />
          <Tags text={d.category} tone={CATEGORY_TONE[d.category]} size="xs" />
        </span>
      ),
      date: <Content title={d.date} />,
      by: <Content title={d.by} />,
      actions: (
        <div className="flex w-full items-center justify-center">
          <Actions actions={["more"]} size="sm" />
        </div>
      ),
    };
  });

  return (
    <>
      <div className="grid min-w-0 items-start gap-4 sm:gap-5 2xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        {/* ================= LEFT: list ================= */}
        <section className={`${cardCls} min-w-0 space-y-4 sm:p-5`}>
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-base font-semibold text-heading">Documents ({docs.length})</h3>
            <AddButton
              text="Upload Document"
              icon={<Upload className="h-4 w-4" />}
              onClick={() => {
                /* TODO: open your upload modal */
              }}
              className="whitespace-nowrap"
            />
          </div>

          <SearchAndFilter
            placeholder="Search documents..."
            value={search}
            onSearch={(v: string) => {
              setSearch(v);
              setPage(1);
            }}
            filters={[]}
            showDateRange={false}
            onFilterChange={() => {}}
          />

          {/* Category chips */}
          <div role="group" aria-label="Document categories" className="flex flex-wrap gap-2">
            {(["All", ...CATEGORIES] as const).map((c) => {
              const on = c === category;
              return (
                <button
                  key={c}
                  type="button"
                  aria-pressed={on}
                  onClick={() => {
                    setCategory(c);
                    setPage(1);
                  }}
                  className={`cursor-pointer rounded-full border px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${
                    on ? "border-primary bg-primary text-on-primary" : "border-border bg-card text-heading hover:bg-primary/5"
                  }`}
                >
                  {c} ({counts(c)})
                </button>
              );
            })}
          </div>

          <div className="overflow-hidden rounded-[14px] border border-border bg-card">
            {visible.length === 0 ? (
              <TableStatus variant="empty" message="No documents match your filters." />
            ) : (
              <Table columns={columns} rows={rows} bordered={false} />
            )}
          </div>

          {filtered.length > 0 && (
            <Pagination
              page={safePage}
              totalPages={totalPages}
              totalItems={filtered.length}
              pageSize={PAGE_SIZE}
              itemLabel="documents"
              onChange={setPage}
            />
          )}

          {/* Selection bar */}
          <div className="flex flex-col gap-2 border-t border-divider pt-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-body">
              {selectedDocs.length} of {docs.length} selected
            </p>
            <div className="flex flex-wrap gap-2">
              <ImportButton
                text="Download"
                icon={<Download className="h-4 w-4" />}
                onClick={() => {
                  /* TODO: download selectedDocs */
                }}
                className={`whitespace-nowrap ${selectedDocs.length ? "" : "pointer-events-none opacity-50"}`}
              />
              <ImportButton
                text="View"
                icon={<Eye className="h-4 w-4" />}
                onClick={() => selectedDocs[0] && setActiveId(selectedDocs[0].id)}
                className={`whitespace-nowrap ${selectedDocs.length ? "" : "pointer-events-none opacity-50"}`}
              />
              <button
                type="button"
                disabled={selectedDocs.length === 0}
                onClick={() => setConfirmDelete(true)}
                className="flex h-10 cursor-pointer items-center gap-2 whitespace-nowrap rounded-xl border border-danger/50 bg-danger/5 px-4 text-sm font-medium text-danger transition-colors hover:bg-danger/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger/30 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          </div>
        </section>

        {/* ================= RIGHT: preview ================= */}
        <aside className="min-w-0 space-y-4 sm:space-y-5">
          {active ? (
            <>
              <section className={`${cardCls} space-y-3 sm:p-5`}>
                <header className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <FileIcon kind={active.kind} />
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-semibold text-heading sm:text-base">{active.name}</h3>
                      <p className="text-xs text-body">
                        {active.category} • {active.size} • Uploaded {active.date} by {active.by}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    aria-label="Open preview full screen"
                    onClick={() => setPreviewExpanded(true)}
                    className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-body transition-colors hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                  >
                    <Maximize2 className="h-4 w-4" />
                  </button>
                </header>

                {/* Preview (static mock – swap for your PDF/image viewer) */}
                <div className="overflow-hidden rounded-lg border border-border">
                  <div className="flex items-center justify-between gap-2 bg-slate-800 px-3 py-1.5 text-xs text-white">
                    <span>{activeIndex + 1} / {docs.length}</span>
                    <span className="flex items-center gap-1">
                      <span aria-hidden="true">–</span> {previewZoom}% <span aria-hidden="true">+</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <button type="button" aria-label="Download" className={iconBtnDark}>
                        <Download className="h-3.5 w-3.5" />
                      </button>
                      <button type="button" aria-label="Print" className={iconBtnDark}>
                        <Printer className="h-3.5 w-3.5" />
                      </button>
                      <button type="button" aria-label="Fullscreen" onClick={() => setPreviewExpanded(true)} className={iconBtnDark}>
                        <Expand className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  </div>

                  <PreviewSurface doc={active} />
                </div>
              </section>

              <section className={`${cardCls} space-y-3 !p-3.5 sm:!p-4`}>
                <h3 className="flex items-center gap-2 text-sm font-semibold text-heading">
                  <Info className="h-4 w-4 text-primary" />
                  Document Details
                </h3>
                <dl className="grid gap-3 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-xs text-body">Category</dt>
                    <dd className="mt-1">
                      <Tags text={active.category} tone={CATEGORY_TONE[active.category]} size="xs" />
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-body">Uploaded By</dt>
                    <dd className="mt-1 font-medium text-heading">{active.by}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-body">File Size</dt>
                    <dd className="mt-1 font-medium text-heading">{active.size}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-body">Uploaded On</dt>
                    <dd className="mt-1 font-medium text-heading">{active.date}</dd>
                  </div>
                </dl>
              </section>
            </>
          ) : (
            <section className={cardCls}>
              <TableStatus variant="empty" message="Select a document to preview it." />
            </section>
          )}
        </aside>
      </div>

      <MaximizeImage
        open={Boolean(active && previewExpanded)}
        onClose={() => setPreviewExpanded(false)}
        title={active?.name ?? "Document Preview"}
        pageLabel={active ? `${activeIndex + 1} of ${docs.length}` : undefined}
        onPrevious={() => stepPreview(-1)}
        onNext={() => stepPreview(1)}
        previousDisabled={activeIndex <= 0}
        nextDisabled={activeIndex < 0 || activeIndex >= docs.length - 1}
        zoom={previewZoom}
        onZoomChange={setPreviewZoom}
      >
        {active && (
          <div className="flex w-full justify-center">
            <div className="shrink-0" style={{ width: `${previewZoom}%` }}>
              <div className="overflow-hidden rounded-lg border border-border">
                <PreviewSurface doc={active} />
              </div>
            </div>
          </div>
        )}
      </MaximizeImage>

      <DeleteDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={deleteSelected}
        icon={<Trash2 className="h-7 w-7" />}
        title={`Delete ${selectedDocs.length} document${selectedDocs.length === 1 ? "" : "s"}?`}
        description="The selected documents will be removed from the patient chart. This cannot be undone."
        cancelText="Keep"
        confirmText="Yes, Delete"
      />
    </>
  );
};

export default ChartDocuments;