"use client";

import React, { useState } from "react";
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileText,
  Maximize2,
  Minus,
  Plus,
  User,
} from "lucide-react";

import RadioCheckButtonh from "@/components/RadioCheckButtonh";
import Tags from "@/components/Tags";
import MaximizeImage from "@/components/MaximizeImage";
import { cardCls, type StepProps } from "@/providers/Shared";
import { EditLink, formatDate, getPatient, type FaxValues } from "./Faxrecipient";
import { FaxDocIcon, FaxPreviewPage } from "./Faxdocuments";

/* ---------- Small pieces ---------- */
const CardHeader = ({
  icon: Icon,
  title,
  onEdit,
}: {
  icon?: React.ElementType;
  title: string;
  onEdit?: () => void;
}) => (
  <div className="mb-3 flex items-center justify-between gap-3">
    <h3 className="flex items-center gap-2.5 text-base font-semibold text-heading">
      {Icon && <Icon className="h-5 w-5 text-body" />}
      {title}
    </h3>
    {onEdit && <EditLink onClick={onEdit} />}
  </div>
);

const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="grid grid-cols-[120px_minmax(0,1fr)] gap-3 py-1 text-sm sm:grid-cols-[140px_minmax(0,1fr)]">
    <dt className="text-body">{label}</dt>
    <dd className="min-w-0 whitespace-pre-line break-words text-heading">{children}</dd>
  </div>
);

const ctrlBtn =
  "flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-body transition-colors hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-body";

const PAGE_COUNT = 3;
const ZOOM_MIN = 50;
const ZOOM_MAX = 150;
const ZOOM_STEP = 25;

/* ---------- Component ---------- */
type Props = StepProps<FaxValues> & {
  /** Jump back to a step (1 = Recipient, 2 = Documents, 3 = Additional Info) */
  onEdit: (step: number) => void;
};

const FaxReview = ({ values: v, onEdit }: Props) => {
  const patient = getPatient(v.patient);
  const docs = v.documents;
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [expanded, setExpanded] = useState(false);

  const previewDoc = docs.find((d) => d.id === previewId) ?? docs[0];
  const isProvider = v.recipientType === "provider";

  const notifications: string[] = [
    ...(v.notifyEvents.includes("delivered") ? ["Notify me when fax is delivered"] : []),
    ...(v.notifyEvents.includes("failed") ? ["Notify me if fax fails"] : []),
    ...(v.notifyEvents.includes("copy") ? [`Send a copy of the status to ${v.copyEmail || "another email"}`] : []),
    ...(v.notifyVia.includes("inapp") ? ["In-app notification"] : []),
    ...(v.notifyVia.includes("email") ? [`Email (${v.notifyEmail})`] : []),
  ];

  const viewer = (
    <div>
      <div className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-border bg-card">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-3 py-2">
          <div className="flex items-center gap-1 text-xs text-heading">
            <button type="button" aria-label="Previous page" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className={ctrlBtn}>
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="rounded-md border border-border px-2 py-1 font-medium">{page}</span>
            <span className="text-body">/ {PAGE_COUNT}</span>
            <button type="button" aria-label="Next page" disabled={page >= PAGE_COUNT} onClick={() => setPage((p) => p + 1)} className={ctrlBtn}>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="flex items-center gap-1 text-xs text-heading">
            <button type="button" aria-label="Zoom out" disabled={zoom <= ZOOM_MIN} onClick={() => setZoom((z) => Math.max(ZOOM_MIN, z - ZOOM_STEP))} className={ctrlBtn}>
              <Minus className="h-4 w-4" />
            </button>
            <span className="min-w-11 text-center font-medium">{zoom}%</span>
            <button type="button" aria-label="Zoom in" disabled={zoom >= ZOOM_MAX} onClick={() => setZoom((z) => Math.min(ZOOM_MAX, z + ZOOM_STEP))} className={ctrlBtn}>
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Full screen"
              aria-pressed={expanded}
              onClick={() => setExpanded(true)}
              className={ctrlBtn}
            >
              <Maximize2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Page */}
        <div className="min-h-0 flex-1 overflow-auto bg-primary/5 p-4 dark:bg-primary/10">
          {previewDoc ? (
            <FaxPreviewPage values={v} doc={previewDoc} zoom={zoom} />
          ) : (
            <p className="py-10 text-center text-sm text-body">No document to preview.</p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="grid items-start gap-4 sm:gap-5 2xl:grid-cols-[minmax(0,1fr)_420px]">
      {/* ================= LEFT ================= */}
      <div className="min-w-0 space-y-4 sm:space-y-5">
        {/* Recipient / provider */}
        <section className={`${cardCls} sm:p-6`}>
          <CardHeader icon={FileText} title={isProvider ? "Recipient / Provider" : "Recipient / Facility"} onEdit={() => onEdit(1)} />
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-violet/10 text-violet">
                <Building2 className="h-6 w-6" />
              </span>
              <div className="min-w-0 text-sm">
                <p className="font-semibold text-heading">{v.providerName || "—"}</p>
                <p className="text-body">{v.practice || "—"}</p>
                <p className="text-body">Fax: {v.faxNumber || "—"}</p>
                <p className="text-body">{v.address || "—"}</p>
              </div>
            </div>
            <dl className="lg:border-l lg:border-divider lg:pl-6">
              <Row label="Practice / Facility">{v.practice || "—"}</Row>
              <Row label="Specialty">{v.specialty || "—"}</Row>
              <Row label="Phone">{v.phone || "—"}</Row>
            </dl>
          </div>
        </section>

        {/* Patient information */}
        <section className={`${cardCls} sm:p-6`}>
          <CardHeader icon={User} title="Patient Information" onEdit={() => onEdit(1)} />
          {patient ? (
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="flex items-start gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <User className="h-6 w-6" />
                </span>
                <div className="text-sm">
                  <p className="font-semibold text-primary">{patient.name}</p>
                  <p className="text-body">DOB: {patient.dob}</p>
                  <p className="text-body">MRN: {patient.mrn}</p>
                </div>
              </div>
              <dl className="lg:border-l lg:border-divider lg:pl-6">
                <Row label="Phone">{patient.phone}</Row>
                <Row label="Address">{patient.address}</Row>
              </dl>
            </div>
          ) : (
            <p className="text-sm text-body">No patient selected.</p>
          )}
        </section>

        {/* Referral information */}
        <section className={`${cardCls} sm:p-6`}>
          <CardHeader icon={FileText} title="Referral Information" onEdit={() => onEdit(1)} />
          <dl>
            <Row label="Referral Type">{v.referralType || "—"}</Row>
            <Row label="Reason for Referral">{v.reason.trim() || "—"}</Row>
          </dl>
        </section>

        {/* Fax details */}
        <section className={`${cardCls} sm:p-6`}>
          <CardHeader icon={FileText} title="Fax Details" onEdit={() => onEdit(3)} />
          <div className="grid gap-4 lg:grid-cols-2">
            <dl>
              <Row label="Cover Sheet">{v.includeCover ? v.coverTemplate : "Not included"}</Row>
              <Row label="Message to Recipient">{v.includeCover && v.message.trim() ? v.message : "—"}</Row>
              <Row label="Urgency">{v.urgency}</Row>
              <Row label="Send Date & Time">
                {v.sendMode === "now" ? "Send Now" : `${formatDate(v.sendDate)}, ${v.sendTime}`}
              </Row>
            </dl>
            <div className="lg:border-l lg:border-divider lg:pl-6">
              <p className="mb-2 text-sm text-body">Notifications</p>
              {notifications.length > 0 ? (
                <ul className="space-y-2">
                  {notifications.map((n) => (
                    <li key={n} className="flex items-center gap-2.5 text-sm text-heading">
                      <RadioCheckButtonh
                        type="checkbox"
                        checked
                        readOnly
                        disabled
                        aria-label={n}
                        className="h-4 w-4 rounded accent-primary"
                      />
                      {n}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-heading">None</p>
              )}
            </div>
          </div>
        </section>

        {/* Additional notes */}
        <section className={`${cardCls} sm:p-6`}>
          <CardHeader icon={FileText} title="Additional Notes" onEdit={() => onEdit(3)} />
          <p className="text-sm text-body">{v.notes.trim() || "No additional notes."}</p>
        </section>
      </div>

      {/* ================= RIGHT ================= */}
      <aside className="min-w-0 space-y-4 sm:space-y-5">
        <section className={`${cardCls} sm:p-6`}>
          <CardHeader title={`Documents (${docs.length})`} onEdit={() => onEdit(2)} />

          {docs.length > 0 ? (
            <ul className="space-y-2.5">
              {docs.map((d) => (
                <li
                  key={d.id}
                  className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 ${
                    previewDoc?.id === d.id ? "border-primary bg-primary/5" : "border-border"
                  }`}
                >
                  <FaxDocIcon kind={d.kind} className="h-10 w-10" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-heading">{d.name}</p>
                    <p className="text-xs text-body">{d.size}</p>
                  </div>
                  <Tags text={d.category} tone="outline" />
                  <button
                    type="button"
                    aria-label={`Preview ${d.name}`}
                    onClick={() => {
                      setPreviewId(d.id);
                      setPage(1);
                    }}
                    className={ctrlBtn}
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-body">
              No documents attached.
            </p>
          )}

          {docs.length > 0 && <div className="mt-4">{viewer}</div>}
        </section>
        <MaximizeImage
          open={expanded && Boolean(previewDoc)}
          onClose={() => setExpanded(false)}
          title={previewDoc?.name ?? "Document Preview"}
          pageLabel={`${page} / ${PAGE_COUNT}`}
          onPrevious={() => setPage((p) => Math.max(1, p - 1))}
          onNext={() => setPage((p) => Math.min(PAGE_COUNT, p + 1))}
          previousDisabled={page <= 1}
          nextDisabled={page >= PAGE_COUNT}
          zoom={zoom}
          onZoomChange={setZoom}
        >
          {previewDoc && <FaxPreviewPage values={v} doc={previewDoc} zoom={zoom} fit={previewDoc.kind === "image"} fullScreen={previewDoc.kind === "image"} />}
        </MaximizeImage>
      </aside>
    </div>
  );
};

export default FaxReview;
