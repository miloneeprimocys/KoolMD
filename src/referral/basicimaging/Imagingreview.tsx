"use client";

import React, { useState } from "react";
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Eye,
  FileText,
  Image as ImageIcon,
  Maximize2,
  User,
} from "lucide-react";

import MaximizeImage from "@/components/MaximizeImage";
import Tags from "@/components/Tags";
import { cardCls, type StepProps } from "@/providers/Shared";
import { DocTile } from "./Imagingclinical";
import {
  EditLink,
  formatDate,
  getPatient,
  getReferringProvider,
  type ImagingDoc,
  type ImagingValues,
} from "./Imagingpatient";

const CardHeader = ({
  icon: Icon,
  title,
  onEdit,
}: {
  icon?: React.ElementType;
  title: string;
  onEdit?: () => void;
}) => (
  <div className="mb-3 flex items-center justify-between gap-3 border-b border-divider pb-3">
    <h3 className="flex items-center gap-2.5 text-sm font-semibold text-heading sm:text-base">
      {Icon && <Icon className="h-4 w-4 text-body sm:h-5 sm:w-5" />}
      {title}
    </h3>
    {onEdit && <EditLink onClick={onEdit} />}
  </div>
);

const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="grid grid-cols-[minmax(94px,0.8fr)_minmax(0,1.2fr)] gap-x-3 py-1 text-xs sm:grid-cols-[minmax(110px,0.8fr)_minmax(0,1.2fr)] sm:text-sm">
    <dt className="text-body">{label}:</dt>
    <dd className="min-w-0 whitespace-pre-line break-words text-heading">{children || "—"}</dd>
  </div>
);

const DocumentPreview = ({ doc, zoom, fullScreen = false }: { doc: ImagingDoc; zoom: number; fullScreen?: boolean }) => (
  <div
    className={`mx-auto flex items-center justify-center overflow-hidden bg-transparent ${
      fullScreen
        ? "flex-none max-w-none rounded-none"
        : "min-h-[210px] w-full max-w-3xl rounded-lg sm:min-h-[280px]"
    }`}
    style={fullScreen ? { width: "100%", height: `${Math.max(100, zoom)}%` } : undefined}
  >
    {doc.previewUrl ? (
      <img
        src={doc.previewUrl}
        alt={doc.name}
        className={fullScreen
          ? "h-[var(--imaging-preview-image-size)] w-auto shrink-0 object-contain transition-[height] duration-150"
          : "max-h-[430px] max-w-full object-contain transition-transform"}
        style={fullScreen
          ? ({ "--imaging-preview-image-size": `${Math.min(100, zoom)}%`, maxWidth: "none", maxHeight: "none" } as React.CSSProperties)
          : { transform: `scale(${zoom / 100})` }}
      />
    ) : doc.kind === "image" ? (
      <div className="flex h-full min-h-[210px] w-full flex-col items-center justify-center gap-2 bg-primary/5 px-5 text-center sm:min-h-[280px]">
        <ImageIcon className="h-8 w-8 text-primary" />
        <p className="text-sm font-medium text-heading">{doc.name}</p>
        <p className="text-xs text-body">Image preview is available after the file is uploaded.</p>
      </div>
    ) : (
      <div className="flex min-h-[210px] w-full items-center justify-center bg-white p-5 sm:min-h-[280px] sm:p-8">
        <div className="w-full max-w-sm rounded border border-slate-200 p-5 shadow-sm sm:p-7">
          <div className="mb-5 flex items-center gap-2 border-b border-slate-200 pb-3">
            <FileText className="h-5 w-5 text-primary" />
            <span className="text-sm font-semibold text-slate-800">{doc.category}</span>
          </div>
          <div className="space-y-3">
            <div className="h-2 w-3/4 rounded bg-slate-200" />
            <div className="h-2 w-full rounded bg-slate-100" />
            <div className="h-2 w-5/6 rounded bg-slate-100" />
            <div className="mt-5 h-16 rounded bg-slate-50" />
            <div className="h-2 w-2/3 rounded bg-slate-100" />
          </div>
          <p className="mt-5 truncate text-xs text-slate-500">{doc.name}</p>
        </div>
      </div>
    )}
  </div>
);

const ImagingReviewStep = ({ values: v, onChange, onEdit }: StepProps<ImagingValues> & { onEdit: (step: number) => void }) => {
  const patient = getPatient(v.patient);
  const provider = getReferringProvider(v.referringProvider);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [expanded, setExpanded] = useState(false);
  const pageCount = v.documents.length;
  const currentIndex = Math.min(previewIndex, Math.max(0, pageCount - 1));
  const page = pageCount ? currentIndex + 1 : 0;
  const previewDoc = v.documents[currentIndex];

  const selectDocument = (index: number) => {
    setPreviewIndex(Math.max(0, Math.min(index, pageCount - 1)));
  };

  const viewer = (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-2 py-1.5 sm:px-3">
        <div className="flex items-center gap-1 text-xs text-heading">
          <button type="button" aria-label="Previous document" disabled={page <= 1} onClick={() => selectDocument(currentIndex - 1)} className="flex h-8 w-8 items-center justify-center rounded-md text-body hover:bg-primary/10 disabled:opacity-40">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="rounded border border-border px-2 py-1">{page}</span>
          <span className="text-body">/ {pageCount}</span>
          <button type="button" aria-label="Next document" disabled={page >= pageCount} onClick={() => selectDocument(currentIndex + 1)} className="flex h-8 w-8 items-center justify-center rounded-md text-body hover:bg-primary/10 disabled:opacity-40">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <div className="flex items-center gap-1 text-xs text-heading">
          <button type="button" aria-label="Zoom out" disabled={zoom <= 50} onClick={() => setZoom((n) => Math.max(50, n - 25))} className="flex h-8 w-8 items-center justify-center rounded-md text-body hover:bg-primary/10 disabled:opacity-40">−</button>
          <span className="min-w-11 text-center font-medium">{zoom}%</span>
          <button type="button" aria-label="Zoom in" disabled={zoom >= 150} onClick={() => setZoom((n) => Math.min(150, n + 25))} className="flex h-8 w-8 items-center justify-center rounded-md text-body hover:bg-primary/10 disabled:opacity-40">+</button>
        </div>
        <button type="button" aria-label="Full screen preview" onClick={() => setExpanded(true)} className="flex h-8 w-8 items-center justify-center rounded-md text-body hover:bg-primary/10 hover:text-primary">
          <Maximize2 className="h-4 w-4" />
        </button>
      </div>
      <div className="bg-primary/5 p-2 dark:bg-primary/10 sm:p-3">
        {previewDoc ? <DocumentPreview doc={previewDoc} zoom={zoom} /> : <p className="py-12 text-center text-sm text-body">No document to preview.</p>}
      </div>
    </div>
  );

  return (
    <div className="grid items-start gap-4 sm:gap-5 2xl:grid-cols-[minmax(0,1fr)_420px]">
      <div className="min-w-0 space-y-3 sm:space-y-4">
        <section className={`${cardCls} sm:p-5`}>
          <CardHeader icon={User} title="Patient Information" onEdit={() => onEdit(1)} />
          <div className="grid gap-x-6 lg:grid-cols-2">
            <dl>
              <Row label="Name">{patient?.name}</Row>
              <Row label="DOB">{patient?.dob}</Row>
              <Row label="MRN">{patient?.mrn}</Row>
              <Row label="Phone">{patient?.phone}</Row>
              <Row label="Gender">{patient?.gender}</Row>
            </dl>
            <dl className="mt-2 border-t border-divider pt-2 lg:mt-0 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
              <Row label="Address">{patient?.address}</Row>
              <Row label="Insurance">{patient?.insurance}</Row>
              <Row label="Member ID">{patient?.memberId}</Row>
              <Row label="Group #">{patient?.group}</Row>
            </dl>
          </div>
        </section>

        <section className={`${cardCls} sm:p-5`}>
          <CardHeader icon={ClipboardList} title="Imaging Details" onEdit={() => onEdit(2)} />
          <div className="grid gap-x-6 lg:grid-cols-2">
            <dl>
              <Row label="Imaging Type">{v.imagingType}</Row>
              <Row label="Procedure / Study">{v.procedure}</Row>
              <Row label="CPT Code">{v.cptCode}</Row>
              <Row label="Body Part">{v.bodyPart}</Row>
              <Row label="Laterality">{v.laterality}</Row>
            </dl>
            <dl className="mt-2 border-t border-divider pt-2 lg:mt-0 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
              <Row label="Views">{v.views.join(", ")}</Row>
              <Row label="Contrast">{v.contrast}</Row>
              <Row label="Priority">{v.priority}</Row>
              <Row label="Schedule">{v.schedule === "now" ? "Send Now" : formatDate(v.scheduleDate)}</Row>
              <Row label="Previous Imaging">{v.previousImaging}</Row>
            </dl>
          </div>
        </section>

        <section className={`${cardCls} sm:p-5`}>
          <CardHeader icon={ClipboardList} title="Clinical Information" onEdit={() => onEdit(3)} />
          <div className="grid gap-x-6 lg:grid-cols-2">
            <dl>
              <Row label="Reason for Exam">{v.reason}</Row>
              <Row label="Relevant History">{v.history}</Row>
              <Row label="Symptoms">{v.symptoms}</Row>
              <Row label="Onset / Duration">{v.onset}</Row>
              <Row label="Severity">{v.severity}</Row>
            </dl>
            <dl className="mt-2 border-t border-divider pt-2 lg:mt-0 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
              <Row label="Prior Treatment">{v.priorTreatment}</Row>
              <Row label="Clinical Questions">{v.clinicalQuestions}</Row>
              <Row label="Special Instructions">{v.specialInstructions}</Row>
            </dl>
          </div>
        </section>

        <section className={`${cardCls} sm:p-5`}>
          <CardHeader icon={Building2} title="Recipient / Facility" onEdit={() => onEdit(2)} />
          <div className="grid gap-x-6 lg:grid-cols-2">
            <dl>
              <Row label="Referring Provider">{provider?.name || v.referringProvider}</Row>
              <Row label="Specialty">{provider?.specialty}</Row>
              <Row label="Phone">{provider?.phone}</Row>
            </dl>
            <dl className="mt-2 border-t border-divider pt-2 lg:mt-0 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
              <Row label="Send To">{v.sendToName}</Row>
              <Row label="Specialty">{v.sendToSpecialty}</Row>
              <Row label="Fax Number">{v.faxNumber}</Row>
              <Row label="Address">{v.sendToAddress}</Row>
            </dl>
          </div>
        </section>
      </div>

      <aside className="min-w-0 space-y-3 sm:space-y-4">
        <section className={`${cardCls} sm:p-5`}>
          <CardHeader title={`Documents (${v.documents.length})`} onEdit={() => onEdit(3)} />
          {v.documents.length ? (
            <ul className="divide-y divide-divider">
              {v.documents.map((doc) => (
                <li key={doc.id} className={`flex min-w-0 items-center gap-2 py-2 ${previewDoc?.id === doc.id ? "text-primary" : ""}`}>
                  <DocTile kind={doc.kind} className="h-9 w-9 rounded-md" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-heading sm:text-sm">{doc.name}</p>
                    <p className="text-[11px] text-body">{doc.size}</p>
                  </div>
                  <Tags text={doc.category} tone="outline" />
                  <button type="button" aria-label={`Preview ${doc.name}`} onClick={() => selectDocument(v.documents.findIndex((item) => item.id === doc.id))} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-body hover:bg-primary/10 hover:text-primary">
                    <Eye className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-6 text-center text-sm text-body">No documents attached.</p>
          )}
        </section>

        <section className={`${cardCls} sm:p-3`}>
          <h3 className="mb-2 px-1 text-sm font-semibold text-heading">Document Preview</h3>
          {viewer}
        </section>

        <section className={`${cardCls} sm:p-5`}>
          <CardHeader icon={Building2} title="Transmission Options" />
          <div className="space-y-3">
            <label className="flex cursor-pointer items-start gap-3 text-xs text-heading sm:text-sm">
              <input type="radio" name="transmission" value="referral" checked={v.transmission === "referral"} onChange={() => onChange({ transmission: "referral" })} className="mt-0.5 h-4 w-4 accent-primary" />
              <span><span className="font-medium">Send via Referral Workflow (Recommended)</span><span className="mt-0.5 block text-[11px] text-body sm:text-xs">Sends the imaging order to the selected provider/facility through the referral workflow.</span></span>
            </label>
            <label className="flex cursor-pointer items-start gap-3 text-xs text-heading sm:text-sm">
              <input type="radio" name="transmission" value="efax" checked={v.transmission === "efax"} onChange={() => onChange({ transmission: "efax" })} className="mt-0.5 h-4 w-4 accent-primary" />
              <span><span className="font-medium">Send via eFax</span><span className="mt-0.5 block text-[11px] text-body sm:text-xs">Send directly via eFax to {v.faxNumber || "the selected fax number"}.</span></span>
            </label>
          </div>
        </section>
      </aside>

      <MaximizeImage
        open={expanded && Boolean(previewDoc)}
        onClose={() => setExpanded(false)}
        title={previewDoc?.name ?? "Document Preview"}
        pageLabel={`${page} / ${pageCount}`}
        onPrevious={() => selectDocument(currentIndex - 1)}
        onNext={() => selectDocument(currentIndex + 1)}
        previousDisabled={page <= 1}
        nextDisabled={page >= pageCount}
        zoom={zoom}
        onZoomChange={setZoom}
      >
        {previewDoc && <DocumentPreview doc={previewDoc} zoom={zoom} fullScreen />}
      </MaximizeImage>
    </div>
  );
};

export default ImagingReviewStep;
