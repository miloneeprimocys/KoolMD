"use client";

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  Building2,
  CalendarDays,
  Check,
  ChevronLeft,
  Clock3,
  Download,
  FileText,
  Maximize2,
  Minimize2,
  Minus,
  Plus,
  ShieldCheck,
  Video,
  X,
} from "lucide-react";

import Tags, { type TagTone } from "@/components/Tags";
import ImportButton from "@/components/ImportButton";

/* ---------- Types ---------- */
export type PatientDocumentDetails = {
  name: string;
  size: string;
  category: string;
  format: string;
  date: string;
  uploadedBy: string;
  status: string;
  statusTone: TagTone;
  notes: string;
};

export type PatientAppointmentDetails = {
  date: string;
  time: string;
  type: string;
  provider: string;
  dept: string;
  mode: "In Clinic" | "Telemedicine";
  status: "Completed" | "Cancelled" | "Scheduled";
  notes: string;
};

export type PatientDetailSelection =
  | { kind: "document"; details: PatientDocumentDetails }
  | { kind: "appointment"; details: PatientAppointmentDetails };

type Props = {
  selection: PatientDetailSelection | null;
  onClose: () => void;
  onCloseStart: () => void;
};

/* ---------- Static preview data (replace with API data later) ---------- */
const CARD = {
  insurer: "Health Plan",
  /** Optional: drop in your own licensed logo, e.g. "/images/insurer-logo.png" */
  logoSrc: undefined as string | undefined,
  memberName: "MILONEE PRIMOCYS",
  groupNumber: "GRP987654",
  memberId: "BCBS123456789",
  planType: "PPO",
  effectiveDate: "Jan 1, 2024",
  coverageEnd: "Dec 31, 2024",
};

const ZOOM_MIN = 50;
const ZOOM_MAX = 200;
const ZOOM_STEP = 25;

/* ---------- Shared styles ---------- */
const ctrlBtn =
  "flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-border bg-card text-heading transition-colors duration-200 hover:border-primary/40 hover:bg-primary/5 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border disabled:hover:bg-card disabled:hover:text-heading";

/* ---------- Document preview (all sizes in em so it scales with zoom) ---------- */
const CardField = ({ label, value }: { label: string; value: string }) => (
  <div className="min-w-0">
    <p className="text-[0.85em] leading-tight text-body">{label}</p>
    <p className="mt-[0.25em] truncate text-[0.95em] font-semibold leading-tight text-heading">
      {value}
    </p>
  </div>
);

const DocumentPreview = ({
  zoom,
  expanded,
}: {
  zoom: number;
  expanded: boolean;
}) => (
  <div
    className="mx-auto rounded-2xl border border-primary/20 bg-gradient-to-br from-shape-sky/30 via-card to-shape-sky/40 p-[1.5em] shadow-sm dark:from-slate-800 dark:via-slate-900 dark:to-blue-950"
    style={{
      width: expanded ? "100%" : `${zoom}%`,
      fontSize: `${(13 * zoom) / 100}px`,
    }}
  >
    {/* Insurer header */}
    <div className="flex items-center gap-[0.75em]">
      {CARD.logoSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={CARD.logoSrc}
          alt={CARD.insurer}
          className="h-[2.6em] w-auto object-contain"
        />
      ) : (
        <>
          <span className="flex h-[2.6em] w-[2.6em] shrink-0 items-center justify-center rounded-[0.5em] bg-primary text-on-primary">
            <Plus className="h-[1.5em] w-[1.5em]" strokeWidth={3} />
          </span>
          <span className="flex h-[2.6em] w-[2.6em] shrink-0 items-center justify-center text-primary">
            <ShieldCheck className="h-[2.4em] w-[2.4em]" strokeWidth={1.75} />
          </span>
          <span className="min-w-0 truncate text-[1.35em] font-bold leading-tight text-heading">
            {CARD.insurer}
          </span>
        </>
      )}
    </div>

    {/* Member details */}
    <div className="mt-[1.4em] grid grid-cols-2 gap-x-[1.25em] gap-y-[1em]">
      <CardField label="Member Name" value={CARD.memberName} />
      <CardField label="Group Number" value={CARD.groupNumber} />
      <CardField label="Member ID" value={CARD.memberId} />
      <CardField label="Plan Type" value={CARD.planType} />
    </div>

    {/* Dates */}
    <div className="mt-[1.1em] grid grid-cols-2 gap-x-[1.25em] border-t border-primary/15 pt-[1.1em]">
      <CardField label="Effective Date" value={CARD.effectiveDate} />
      <CardField label="Coverage End Date" value={CARD.coverageEnd} />
    </div>
  </div>
);

/* Preview + pager / zoom controls */
const DocumentViewer = ({
  expanded,
  onToggleExpanded,
}: {
  expanded: boolean;
  onToggleExpanded: () => void;
}) => {
  const [zoom, setZoom] = useState(100);

  return (
    <div
      className={
        expanded
          ? "fixed inset-0 z-[200] flex flex-col items-center justify-center gap-5 bg-black/70 p-5 sm:p-8"
          : "space-y-3"
      }
      onClick={expanded ? onToggleExpanded : undefined}
    >
      <div
        className={
          expanded
            ? "w-full max-w-5xl"
            : "overflow-auto rounded-2xl"
        }
        onClick={expanded ? (event) => event.stopPropagation() : undefined}
      >
        <DocumentPreview zoom={zoom} expanded={expanded} />
      </div>

      <div
        className={`flex items-center justify-between gap-2 rounded-xl border border-border bg-card px-2.5 py-2 ${
          expanded ? "w-full max-w-5xl" : ""
        }`}
        onClick={expanded ? (event) => event.stopPropagation() : undefined}
      >
        <button type="button" aria-label="Previous page" className={ctrlBtn}>
          <ChevronLeft className="h-4 w-4" />
        </button>

        <span className="min-w-10 text-center text-xs font-medium text-heading">
          1 / 1
        </span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Zoom out"
            disabled={zoom <= ZOOM_MIN}
            onClick={() => setZoom((z) => Math.max(ZOOM_MIN, z - ZOOM_STEP))}
            className={ctrlBtn}
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="min-w-11 text-center text-xs font-medium text-heading">
            {zoom}%
          </span>
          <button
            type="button"
            aria-label="Zoom in"
            disabled={zoom >= ZOOM_MAX}
            onClick={() => setZoom((z) => Math.min(ZOOM_MAX, z + ZOOM_STEP))}
            className={ctrlBtn}
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <button
          type="button"
          aria-label={expanded ? "Exit full screen" : "Full screen"}
          title={expanded ? "Exit full screen" : "Full screen"}
          aria-pressed={expanded}
          onClick={onToggleExpanded}
          className={ctrlBtn}
        >
          {expanded ? (
            <Minimize2 className="h-4 w-4" />
          ) : (
            <Maximize2 className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
};

/* ---------- Detail row ---------- */
const DetailRow = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="grid grid-cols-[110px_minmax(0,1fr)] items-start gap-3 text-xs sm:grid-cols-[120px_minmax(0,1fr)]">
    <dt className="pt-0.5 text-body">{label}</dt>
    <dd className="min-w-0 break-words font-medium text-heading">{children}</dd>
  </div>
);

/* ---------- Panel ---------- */
const PatientRightSection = ({ selection, onClose, onCloseStart }: Props) => {
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isPreviewExpanded, setIsPreviewExpanded] = useState(false);

  const closePanel = useCallback(() => {
    if (!selection || closeTimer.current) return;
    setIsPreviewExpanded(false);
    setIsClosing(true);
    onCloseStart();
    const duration = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 300;
    closeTimer.current = setTimeout(() => {
      closeTimer.current = null;
      onClose();
    }, duration);
  }, [onClose, onCloseStart, selection]);

  useEffect(() => {
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, []);

  useLayoutEffect(() => {
    if (!selection) {
      if (closeTimer.current) {
        clearTimeout(closeTimer.current);
        closeTimer.current = null;
      }
      setIsOpen(false);
      setIsClosing(false);
      setIsPreviewExpanded(false);
      return;
    }

    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    setIsClosing(false);
    setIsOpen(false);
    const frame = requestAnimationFrame(() => setIsOpen(true));
    return () => cancelAnimationFrame(frame);
  }, [Boolean(selection)]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (isPreviewExpanded) {
        setIsPreviewExpanded(false);
        return;
      }
      closePanel();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [closePanel, isPreviewExpanded]);

  if (!selection) return null;

  const doc = selection.kind === "document" ? selection.details : null;
  const appointment = selection.kind === "appointment" ? selection.details : null;
  const title = doc?.name ?? "Appointment Details";

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-x-0 bottom-0 top-14 z-[140] bg-black/40 backdrop-blur-xs transition-opacity duration-300 ease-out xl:top-16 2xl:hidden ${
          isOpen && !isClosing ? "opacity-100" : "opacity-0"
        }`}
        onClick={closePanel}
        aria-hidden="true"
      />

      <aside
        aria-label={title}
        aria-modal="true"
        role="dialog"
        className={`fixed right-0 top-14 z-[150] flex h-[calc(100dvh-3.5rem)] w-full max-w-[420px] flex-col border-y border-l border-border bg-card shadow-2xl transition-transform duration-300 ease-out xl:top-16 xl:h-[calc(100dvh-4rem)] ${
          isOpen && !isClosing ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <header className="flex shrink-0 items-start justify-between gap-3 border-b border-border px-4 py-3.5 sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-danger/10 text-danger">
              {doc ? <FileText className="h-5 w-5" /> : <CalendarDays className="h-5 w-5" />}
            </span>
            <div className="min-w-0">
              <h2 className="truncate text-sm font-semibold text-heading">{title}</h2>
              {doc && (
                <p className="mt-0.5 text-xs text-body">
                  {doc.size} · Uploaded {doc.date}
                </p>
              )}
              {appointment && (
                <p className="mt-0.5 text-xs text-body">
                  {appointment.date} · {appointment.time}
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={closePanel}
            aria-label="Close details"
            className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-body transition-colors hover:bg-heading/5 hover:text-heading focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        {/* Body */}
        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-4 sm:p-5">
          {/* ---------- Document ---------- */}
          {doc && (
            <>
              <DocumentViewer
                expanded={isPreviewExpanded}
                onToggleExpanded={() =>
                  setIsPreviewExpanded((expanded) => !expanded)
                }
              />

             

              <div className="grid grid-cols-3 gap-2 border-t border-divider pt-4">
                <ImportButton
                  text="Download"
                  icon={<Download className="h-3.5 w-3.5" />}
                  className="!h-9 !min-w-0 !w-full !gap-1.5 !rounded-lg !px-2 !text-xs !border-primary/30 !text-primary hover:!border-primary/40 hover:!bg-primary/5 hover:!text-primary"
                />
                <ImportButton
                  text="Replace"
                  icon={null}
                  className="!h-9 !min-w-0 !w-full !gap-1.5 !rounded-lg !px-2 !text-xs !border-border !text-heading hover:!border-primary/30 hover:!bg-primary/5 hover:!text-primary"
                />
                <ImportButton
                  text="Delete"
                  icon={null}
                  className="!h-9 !min-w-0 !w-full !gap-1.5 !rounded-lg !px-2 !text-xs !border-danger/30 !text-danger hover:!border-danger/40 hover:!bg-danger/5 hover:!text-danger focus-visible:!ring-danger/30"
                />
              </div>
            </>
          )}

          {/* ---------- Appointment ---------- */}
          {appointment && (
            <>
              <div className="flex items-center gap-3 border-b border-divider pb-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {appointment.provider
                    .replace(/^Dr\.\s*/, "")
                    .split(" ")
                    .map((part) => part[0])
                    .join("")}
                </span>
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-semibold text-heading">
                    {appointment.provider}
                  </h3>
                  <p className="text-xs text-body">{appointment.dept}</p>
                </div>
                <div className="ml-auto shrink-0">
                  <Tags
                    text={appointment.status}
                    tone={
                      appointment.status === "Cancelled"
                        ? "danger"
                        : appointment.status === "Completed"
                          ? "success"
                          : "info"
                    }
                  />
                </div>
              </div>

              <dl className="space-y-4">
                <div className="flex gap-3">
                  <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-body" />
                  <div>
                    <dt className="text-xs text-body">Appointment Type</dt>
                    <dd className="text-sm font-medium text-heading">{appointment.type}</dd>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-body" />
                  <div>
                    <dt className="text-xs text-body">Date &amp; Time</dt>
                    <dd className="text-sm font-medium text-heading">
                      {appointment.date}, {appointment.time}
                    </dd>
                  </div>
                </div>
                <div className="flex gap-3">
                  {appointment.mode === "Telemedicine" ? (
                    <Video className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  ) : (
                    <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  )}
                  <div>
                    <dt className="text-xs text-body">Visit Type</dt>
                    <dd className="text-sm font-medium text-heading">{appointment.mode}</dd>
                  </div>
                </div>
                <div className="flex gap-3">
                  <FileText className="mt-0.5 h-4 w-4 shrink-0 text-body" />
                  <div>
                    <dt className="text-xs text-body">Notes</dt>
                    <dd className="text-sm font-medium text-heading">
                      {appointment.notes || "—"}
                    </dd>
                  </div>
                </div>
              </dl>

              {appointment.status === "Completed" && (
                <div className="rounded-lg bg-success/10 p-3 text-xs text-success">
                  <Check className="mr-1 inline h-3.5 w-3.5" /> Appointment completed
                </div>
              )}
            </>
          )}
        </div>
      </aside>
    </>
  );
};

export default PatientRightSection;