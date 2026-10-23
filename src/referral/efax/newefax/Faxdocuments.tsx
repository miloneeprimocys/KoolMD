"use client";

import React, { useEffect, useState } from "react";
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Download,
  FileText,
  GripVertical,
  Image as ImageIcon,
  ListOrdered,
  Maximize2,
  Minus,
  Plus,
  X,
} from "lucide-react";

import FileDropzone from "@/components/Filedropzone";
import SignupDropdown from "@/components/SignupDropdown";
import Actions from "@/components/Actions";
import ImportButton from "@/components/ImportButton";
import SuccessToast from "@/components/SuccessToast";
import RightSubSection from "@/components/RightSubSection";
import MaximizeImage from "@/components/MaximizeImage";
import { cardCls, todayISO, toOptions, type StepProps } from "@/providers/Shared";
import { formatDate, getPatient, type FaxDoc, type FaxValues } from "./Faxrecipient";

/* ---------------------------------------------------------------- */
/*  Helpers                                                          */
/* ---------------------------------------------------------------- */
const CATEGORIES = toOptions([
  "Referral Form",
  "Insurance Card",
  "Clinical Notes",
  "Lab Results",
  "Imaging Report",
  "Other",
]);
const ZOOM_MIN = 50;
const ZOOM_MAX = 150;
const ZOOM_STEP = 25;

const formatSize = (bytes: number) =>
  bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;

const kindOf = (file: File): FaxDoc["kind"] => (file.type.startsWith("image/") ? "image" : "pdf");

const guessCategory = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes("insurance")) return "Insurance Card";
  if (n.includes("referral")) return "Referral Form";
  if (n.includes("lab")) return "Lab Results";
  if (n.includes("note")) return "Clinical Notes";
  if (n.includes("mri") || n.includes("xray") || n.includes("imaging")) return "Imaging Report";
  return "Other";
};

/** File-type icon (also used on the review step). */
export const FaxDocIcon = ({ kind, className = "h-11 w-11" }: { kind: FaxDoc["kind"]; className?: string }) => (
  <span
    className={`flex shrink-0 items-center justify-center rounded-lg ${className} ${
      kind === "image" ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
    }`}
  >
    {kind === "image" ? <ImageIcon className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
  </span>
);

/* ---------------------------------------------------------------- */
/*  Mock fax page (scales with `zoom`) – also used on the review step */
/* ---------------------------------------------------------------- */
export const FaxPreviewPage = ({
  values: v,
  doc,
  zoom = 100,
  fit = false,
  fullScreen = false,
}: {
  values: FaxValues;
  doc: FaxDoc;
  zoom?: number;
  fit?: boolean;
  fullScreen?: boolean;
}) => {
  const patient = getPatient(v.patient);
  const fs = `${(11 * zoom) / 100}px`;
  const fullScreenExtent = `${Math.max(100, zoom)}%`;
  const fullScreenImageSize = `${Math.min(100, zoom)}%`;

  if (doc.kind === "image") {
    return (
      <div className={`flex items-center justify-center rounded-lg border border-border bg-card ${fullScreen ? "flex-none aspect-auto" : `w-full ${fit ? "h-full min-h-0 aspect-auto overflow-visible 2xl:h-auto 2xl:aspect-[3/4]" : "aspect-[3/4] overflow-hidden"}`}`} style={fullScreen ? { width: "100%", height: fullScreenExtent, fontSize: fs } : { fontSize: fs }}>
        {doc.previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={doc.previewUrl}
            alt={doc.name}
            className={fullScreen ? "h-[var(--preview-image-size)] w-auto shrink-0 object-contain transition-[height] duration-150" : fit ? "w-auto shrink-0 object-contain transition-[height] duration-150" : "h-full w-full object-contain"}
            style={fullScreen ? ({ "--preview-image-size": fullScreenImageSize, maxWidth: "none", maxHeight: "none" } as React.CSSProperties) : fit ? { height: `${zoom}%`, maxWidth: zoom <= 100 ? "100%" : "none", maxHeight: "none" } : undefined}
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-center">
            <ImageIcon className="h-[4em] w-[4em] text-success" strokeWidth={1.25} />
            <p className="max-w-[80%] truncate font-medium text-heading">{doc.name}</p>
          </div>
        )}
      </div>
    );
  }

  const Row = ({ label, value }: { label: string; value: string }) => (
    <div className="flex gap-[0.8em] py-[0.15em]">
      <span className="w-[7.5em] shrink-0 text-body">{label}</span>
      <span className="min-w-0 text-heading">{value}</span>
    </div>
  );
  const Band = ({ children }: { children: React.ReactNode }) => (
    <div className="mt-[1.1em] rounded-[0.3em] bg-primary/10 px-[0.8em] py-[0.35em] font-semibold text-heading">{children}</div>
  );

  return (
    <div className="w-full rounded-lg border border-border bg-card p-[1.4em] shadow-sm" style={{ fontSize: fs }}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-[0.6em]">
          <span className="flex h-[2.4em] w-[2.4em] items-center justify-center rounded-[0.4em] bg-primary text-white">
            <Building2 className="h-[1.4em] w-[1.4em]" />
          </span>
          <span className="max-w-[9em] break-words text-[1.05em] font-semibold leading-tight text-heading">
            {v.practice || "Recipient"}
          </span>
        </div>
        <span className="text-[1em] font-semibold text-heading">{v.referralType || "Fax"}</span>
      </div>

      <Band>Patient Information</Band>
      <div className="px-[0.4em] pt-[0.4em]">
        <Row label="Name:" value={patient?.name ?? "—"} />
        <Row label="DOB:" value={patient?.dob ?? "—"} />
        <Row label="MRN:" value={patient?.mrn ?? "—"} />
        <Row label="Phone:" value={patient?.phone ?? "—"} />
      </div>

      <Band>Referral Information</Band>
      <div className="px-[0.4em] pt-[0.4em]">
        <Row label="Referring Provider:" value="Dr. Sarah Davis" />
        <Row label="Specialty:" value="Family Medicine" />
        <Row label="Date:" value={formatDate(todayISO())} />
        <p className="pt-[0.5em] text-body">Reason for Referral:</p>
        <p className="mt-[0.3em] rounded-[0.3em] bg-primary/5 px-[0.8em] py-[0.6em] text-heading">
          {v.reason.trim() || "—"}
        </p>
      </div>

      <div className="mt-[2.5em] flex gap-[2em]">
        <span className="h-px flex-1 bg-border" />
        <span className="h-px flex-1 bg-border" />
      </div>
    </div>
  );
};

/* ---------------------------------------------------------------- */
/*  Component                                                        */
/* ---------------------------------------------------------------- */
const FaxDocuments = ({
  values: v,
  errors,
  onChange,
  onPreviewOpenChange,
  activePreviewId,
  onActivePreviewIdChange,
}: StepProps<FaxValues> & {
  onPreviewOpenChange?: (open: boolean) => void;
  activePreviewId: string | null;
  onActivePreviewIdChange: (id: string | null) => void;
}) => {
  const docs = v.documents;
  const previewId = activePreviewId;
  const setPreviewId = onActivePreviewIdChange;
  const [previewZoom, setPreviewZoom] = useState(100);
  const [previewExpanded, setPreviewExpanded] = useState(false);
  const [reorderMode, setReorderMode] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [uploadNotice, setUploadNotice] = useState<{ id: number; fileName: string } | null>(null);
  const [removalNotice, setRemovalNotice] = useState<{ id: number; message: string } | null>(null);

  const previewIndex = docs.findIndex((d) => d.id === previewId);
  const previewDoc = previewIndex >= 0 ? docs[previewIndex] : null;

  useEffect(() => {
    if (!previewDoc) setPreviewExpanded(false);
  }, [Boolean(previewDoc)]);

  React.useEffect(() => {
    setPreviewZoom(100);
  }, [previewId]);

  useEffect(() => {
    onPreviewOpenChange?.(Boolean(previewDoc));
    return () => onPreviewOpenChange?.(false);
  }, [Boolean(previewDoc), onPreviewOpenChange]);

  /* FileDropzone is single-file; each pick is appended to the list. */
  const addFile = (file: File | null) => {
    if (!file) return;
    const doc: FaxDoc = {
      id: `${Date.now()}-${file.name}`,
      name: file.name,
      size: formatSize(file.size),
      kind: kindOf(file),
      category: guessCategory(file.name),
      previewUrl: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined,
    };
    onChange({ documents: [...docs, doc] });
    setPreviewId(doc.id);
    setUploadNotice({ id: Date.now(), fileName: file.name });
  };

  const removeDoc = (id: string) => {
    const removed = docs.find((d) => d.id === id);
    if (!removed) return;
    if (removed.previewUrl) URL.revokeObjectURL(removed.previewUrl);
    onChange({ documents: docs.filter((d) => d.id !== id) });
    if (previewId === id) setPreviewId(null);
    setRemovalNotice({ id: Date.now(), message: `${removed.name} was removed from the fax.` });
  };

  const setCategory = (id: string, category: string) =>
    onChange({ documents: docs.map((d) => (d.id === id ? { ...d, category } : d)) });

  const move = (from: number, to: number) => {
    if (to < 0 || to >= docs.length || from === to) return;
    const next = [...docs];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange({ documents: next });
  };

  const stepPreview = (delta: number) => {
    const next = docs[previewIndex + delta];
    if (next) setPreviewId(next.id);
  };

  const pagerBtn =
    "flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-body transition-colors hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-body";

  const expandedPreview = (
    <MaximizeImage
      open={Boolean(previewDoc && previewExpanded)}
      onClose={() => setPreviewExpanded(false)}
      title={previewDoc?.name ?? "Document Preview"}
      pageLabel={previewDoc ? `${previewIndex + 1} of ${docs.length}` : undefined}
      onPrevious={() => stepPreview(-1)}
      onNext={() => stepPreview(1)}
      previousDisabled={previewIndex <= 0}
      nextDisabled={previewIndex < 0 || previewIndex >= docs.length - 1}
      zoom={previewZoom}
      onZoomChange={setPreviewZoom}
    >
      {previewDoc && <FaxPreviewPage values={v} doc={previewDoc} zoom={previewZoom} fit={previewDoc.kind === "image"} fullScreen={previewDoc.kind === "image"} />}
    </MaximizeImage>
  );

  return (
    <>
      <div className="flex min-w-0 flex-col gap-4 sm:gap-5 2xl:flex-row 2xl:items-start">
        {/* ================= LEFT: upload + attached ================= */}
        <section className={`${cardCls} min-w-0 flex-1 sm:p-6`}>
          <h3 className="mb-4 text-base font-semibold text-heading sm:text-lg">Add Documents</h3>

          <FileDropzone title="files here" file={null} onChange={addFile} maxSizeMB={10} />

          <div className="mt-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h4 className="text-sm font-semibold text-heading sm:text-base">Attached Documents ({docs.length})</h4>
              {docs.length > 1 && (
                <ImportButton
                  text={reorderMode ? "Done" : "Reorder"}
                  icon={<ListOrdered className="h-4 w-4" />}
                  onClick={() => setReorderMode((m) => !m)}
                />
              )}
            </div>

            {docs.length > 0 ? (
              <ul className={`space-y-2.5 ${errors.documents ? "rounded-xl ring-1 ring-danger" : ""}`}>
                {docs.map((d, i) => (
                  <li
                    key={d.id}
                    draggable
                    onDragStart={() => setDragIndex(i)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => {
                      if (dragIndex !== null) move(dragIndex, i);
                      setDragIndex(null);
                    }}
                    onDragEnd={() => setDragIndex(null)}
                    className={`flex flex-wrap items-center gap-3 rounded-xl border bg-card px-3 py-3 transition-colors sm:flex-nowrap sm:px-4 ${
                      dragIndex === i ? "border-primary bg-primary/5" : "border-border"
                    }`}
                  >
                    <span aria-hidden="true" title="Drag to reorder" className="cursor-grab text-body active:cursor-grabbing">
                      <GripVertical className="h-4 w-4" />
                    </span>
                    <FaxDocIcon kind={d.kind} />
                    <div className="min-w-0 flex-1 sm:flex-none sm:basis-[200px]">
                      <p className="truncate text-sm font-semibold text-heading">{d.name}</p>
                      <p className="text-xs text-body">{d.size}</p>
                    </div>
                    <div className="order-last w-full min-w-0 sm:order-none sm:ml-auto sm:w-[220px] [&_label]:sr-only">
                      <SignupDropdown
                        name={`category-${d.id}`}
                        label={`Category for ${d.name}`}
                        placeholder="Select category"
                        searchable={false}
                        triggerClassName="!h-10 !min-h-10 !rounded-lg !px-3 !pr-8 !text-xs"
                        options={CATEGORIES}
                        value={d.category}
                        onChange={(val) => setCategory(d.id, val)}
                      />
                    </div>

                    {reorderMode && (
                      <div className="flex items-center">
                        <button type="button" aria-label="Move up" disabled={i === 0} onClick={() => move(i, i - 1)} className={pagerBtn}>
                          <ChevronUp className="h-4 w-4" />
                        </button>
                        <button type="button" aria-label="Move down" disabled={i === docs.length - 1} onClick={() => move(i, i + 1)} className={pagerBtn}>
                          <ChevronDown className="h-4 w-4" />
                        </button>
                      </div>
                    )}

                    <Actions
                      actions={["view", "download", "delete"]}
                      size="sm"
                      onAction={(action) => {
                        if (action === "view") setPreviewId(d.id);
                        else if (action === "delete") removeDoc(d.id);
                        // TODO: download → action === "download"
                      }}
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <p
                className={`rounded-xl border border-dashed px-4 py-8 text-center text-sm text-body ${
                  errors.documents ? "border-danger" : "border-border"
                }`}
              >
                No documents attached yet.
              </p>
            )}
            {errors.documents && <p className="mt-2 text-xs text-danger">{errors.documents}</p>}
          </div>
        </section>

        {/* ================= RIGHT: preview (RightSubSection) ================= */}
        {previewDoc && (
          <RightSubSection
            ariaLabel="Document preview"
            reopenKey="fax-document-preview"
            onClose={() => setPreviewId(null)}
            onHeightChange={() => {}}
            width={380}
            className="!border-0 !bg-transparent !shadow-none 2xl:sticky 2xl:top-4 2xl:self-start"
          >
            {(closePanel) => (
          <section className="flex h-full min-h-0 flex-col rounded-none bg-card 2xl:h-auto 2xl:rounded-[14px]">
                <div className="sticky top-0 z-20 flex shrink-0 items-center justify-between gap-3 bg-card px-4 py-3.5 2xl:static 2xl:px-6">
                  <h3 className="text-base font-semibold text-heading">Document Preview</h3>
                  <button
                    type="button"
                    aria-label="Close preview"
                    onClick={closePanel}
                    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-body transition-colors hover:bg-heading/5 hover:text-heading focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="flex shrink-0 items-center gap-3 px-4 2xl:px-6">
                  <FaxDocIcon kind={previewDoc.kind} className="h-9 w-9" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-heading">{previewDoc.name}</p>
                    <p className="text-xs text-body">{previewDoc.size}</p>
                  </div>
                </div>

                <div className="mx-4 mb-4 mt-3 flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-border bg-card 2xl:mx-6 2xl:flex-none">
                <div className="flex shrink-0 items-center justify-between gap-1 border-b border-border px-1.5 py-1 text-xs text-heading">
                  <div className="flex items-center gap-0.5">
                    <button type="button" aria-label="Previous document" disabled={previewIndex <= 0} onClick={() => stepPreview(-1)} className={pagerBtn}><ChevronLeft className="h-4 w-4" /></button>
                    <span className="min-w-12 text-center">{previewIndex + 1} / {docs.length}</span>
                    <button type="button" aria-label="Next document" disabled={previewIndex >= docs.length - 1} onClick={() => stepPreview(1)} className={pagerBtn}><ChevronRight className="h-4 w-4" /></button>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <button type="button" aria-label="Zoom out" disabled={previewZoom <= ZOOM_MIN} onClick={() => setPreviewZoom((z) => Math.max(ZOOM_MIN, z - ZOOM_STEP))} className={pagerBtn}><Minus className="h-4 w-4" /></button>
                    <span className="min-w-11 text-center font-medium">{previewZoom}%</span>
                    <button type="button" aria-label="Zoom in" disabled={previewZoom >= ZOOM_MAX} onClick={() => setPreviewZoom((z) => Math.min(ZOOM_MAX, z + ZOOM_STEP))} className={pagerBtn}><Plus className="h-4 w-4" /></button>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <button type="button" aria-label="Download document" className={pagerBtn}><Download className="h-4 w-4" /></button>
                    <button type="button" aria-label="Maximize preview" title="Maximize preview" aria-pressed={previewExpanded} onClick={() => setPreviewExpanded(true)} className={pagerBtn}><Maximize2 className="h-4 w-4" /></button>
                  </div>
                </div>
                <div className="min-h-0 flex-1 overflow-auto bg-primary/5 p-3 dark:bg-primary/10 sm:p-4 2xl:flex-none">
                  <FaxPreviewPage values={v} doc={previewDoc} zoom={previewZoom} fit={previewDoc.kind === "image"} />
                </div>
                </div>
              </section>
            )}
          </RightSubSection>
        )}
        {expandedPreview}
      </div>

      <SuccessToast
        key={uploadNotice?.id ?? "no-upload"}
        isOpen={Boolean(uploadNotice)}
        onClose={() => setUploadNotice(null)}
        title="Document added successfully"
        message={uploadNotice ? `${uploadNotice.fileName} was added to the fax.` : undefined}
      />
      <SuccessToast
        key={removalNotice?.id ?? "no-removal"}
        isOpen={Boolean(removalNotice)}
        onClose={() => setRemovalNotice(null)}
        title="Document removed successfully"
        message={removalNotice?.message}
      />
    </>
  );
};

export default FaxDocuments;
