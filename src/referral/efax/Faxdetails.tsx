"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Building2, Download, FileText, History, RefreshCw, Trash2, User, XCircle, CheckCircle2, Clock } from "lucide-react";

import CommonRightSection from "@/components/CommonRightSection";
import AddButton from "@/components/Addbutton";
import DeleteButton from "@/components/DeleteButton";
import type { TagTone } from "@/components/Tags";

/* ---------------------------------------------------------------- */
/*  Types + shared helpers (also used by Efax.tsx)                   */
/* ---------------------------------------------------------------- */
export type FaxStatus = "Delivered" | "Pending" | "Failed";

export type FaxEvent = {
  label: string;
  time: string;
  /** optional message shown under the event (e.g. error reason) */
  note?: string;
};

export type Fax = {
  id: string;
  patient: string;
  dob: string;
  mrn: string;
  recipient: string;
  faxNumber: string;
  specialty: string;
  location: string;
  document: string;
  size: string;
  sentDate: string;
  sentTime: string;
  status: FaxStatus;
  /** newest first */
  history: FaxEvent[];
};

export const STATUS_TONE: Record<FaxStatus, TagTone> = {
  Delivered: "success",
  Pending: "warning",
  Failed: "danger",
};

const BANNER: Record<FaxStatus, { Icon: React.ElementType; box: string; icon: string; text: string }> = {
  Failed: {
    Icon: XCircle,
    box: "bg-danger/10",
    icon: "bg-danger text-white",
    text: "This fax could not be delivered. You can review the details below and resend.",
  },
  Delivered: {
    Icon: CheckCircle2,
    box: "bg-success/10",
    icon: "bg-success text-white",
    text: "This fax was delivered successfully.",
  },
  Pending: {
    Icon: Clock,
    box: "bg-warning/10",
    icon: "bg-warning text-white",
    text: "This fax is still being transmitted. Check back shortly.",
  },
};

const DOT: Record<FaxStatus, string> = {
  Failed: "bg-danger",
  Delivered: "bg-success",
  Pending: "bg-warning",
};

/* ---------------------------------------------------------------- */
/*  Small pieces                                                     */
/* ---------------------------------------------------------------- */
const SectionTitle = ({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) => (
  <h3 className="flex items-center gap-2.5 border-b border-divider pb-2.5 text-sm font-semibold text-heading">
    <Icon className="h-4 w-4 text-body" />
    {children}
  </h3>
);

const InfoRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="grid grid-cols-[90px_minmax(0,1fr)] gap-3 text-sm">
    <dt className="text-body">{label}</dt>
    <dd className="min-w-0 break-words text-heading">{children}</dd>
  </div>
);

/* ---------------------------------------------------------------- */
/*  Drawer (built on CommonRightSection)                             */
/* ---------------------------------------------------------------- */
type Props = {
  fax: Fax | null;
  onClose: () => void;
  onCloseStart: () => void;
};

const FaxDetails = ({ fax, onClose, onCloseStart }: Props) => {
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previousFaxId = useRef<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const closePanel = () => {
    if (!fax || closeTimer.current) return;
    setIsClosing(true);
    onCloseStart();
    const duration = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 300;
    closeTimer.current = setTimeout(() => {
      closeTimer.current = null;
      onClose();
    }, duration);
  };

  useEffect(
    () => () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    },
    [],
  );

  /* Animate the first open; on 2xl screens keep the drawer open while switching faxes. */
  useLayoutEffect(() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    setIsClosing(false);
    if (!fax) {
      previousFaxId.current = null;
      setIsOpen(false);
      return;
    }

    const isSwitchingFax = previousFaxId.current !== null && previousFaxId.current !== fax.id;
    previousFaxId.current = fax.id;

    if (isSwitchingFax && window.matchMedia("(min-width: 1536px)").matches) {
      setIsOpen(true);
      return;
    }

    setIsOpen(false);
    const frame = requestAnimationFrame(() => setIsOpen(true));
    return () => cancelAnimationFrame(frame);
  }, [fax?.id]);

  useEffect(() => {
    if (!fax) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closePanel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (!fax) return null;

  const banner = BANNER[fax.status];
  const BannerIcon = banner.Icon;

  return (
    <CommonRightSection
      label={`Fax details ${fax.id}`}
      ariaModal
      open={isOpen}
      closing={isClosing}
      onClose={closePanel}
      panelClassName="2xl:max-w-[420px]"
      header={<h2 className="text-base font-semibold text-heading">Fax Details</h2>}
    >
      <div className="min-h-0 flex-1 space-y-6 overflow-y-auto p-4 sm:p-5">
        {/* Status banner */}
        <div className={`flex items-center gap-3 rounded-xl p-3.5 ${banner.box}`}>
          <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${banner.icon}`}>
            <BannerIcon className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-heading">{fax.status}</p>
            <p className="text-xs text-body">{banner.text}</p>
          </div>
        </div>

        {/* Patient */}
        <section className="space-y-3">
          <SectionTitle icon={User}>Patient Information</SectionTitle>
          <dl className="space-y-2.5">
            <InfoRow label="Name">{fax.patient}</InfoRow>
            <InfoRow label="DOB">{fax.dob}</InfoRow>
            <InfoRow label="MRN">{fax.mrn}</InfoRow>
          </dl>
        </section>

        {/* Recipient */}
        <section className="space-y-3">
          <SectionTitle icon={Building2}>Recipient / eFax Provider</SectionTitle>
          <p className="text-sm font-semibold text-heading">{fax.recipient}</p>
          <dl className="space-y-2.5">
            <InfoRow label="Fax Number">{fax.faxNumber}</InfoRow>
            <InfoRow label="Specialty">{fax.specialty}</InfoRow>
            <InfoRow label="Location">{fax.location}</InfoRow>
          </dl>
        </section>

        {/* Document */}
        <section className="space-y-3">
          <SectionTitle icon={FileText}>Document(s)</SectionTitle>
          <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-danger/10 text-danger">
              <FileText className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-heading">{fax.document}</p>
              <p className="text-xs text-body">{fax.size}</p>
            </div>
            <button
              type="button"
              aria-label={`Download ${fax.document}`}
              className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-body transition-colors hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
            >
              <Download className="h-4 w-4" />
            </button>
          </div>
        </section>

        {/* Transmission history */}
        <section className="space-y-4">
          <SectionTitle icon={History}>Transmission History</SectionTitle>
          <ol className="relative space-y-4 before:absolute before:bottom-2 before:left-[5px] before:top-2 before:w-px before:bg-divider">
            {fax.history.map((e, i) => {
              const isLast = i === fax.history.length - 1;
              return (
                <li key={`${e.label}-${i}`} className="relative pl-7">
                  <span
                    className={`absolute left-0 top-1 h-[11px] w-[11px] rounded-full ${
                      i === 0
                        ? DOT[fax.status]
                        : isLast
                          ? "border-2 border-body/50 bg-card"
                          : "bg-body/40"
                    }`}
                  />
                  <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-0.5">
                    <p className={`text-sm ${i === 0 ? "font-semibold text-heading" : "text-body"}`}>{e.label}</p>
                    <span className="text-xs text-body">{e.time}</span>
                  </div>
                  {e.note && (
                    <p className="mt-2 rounded-lg bg-danger/10 px-3 py-2 text-xs text-body">{e.note}</p>
                  )}
                </li>
              );
            })}
          </ol>
        </section>
      </div>

      {/* Actions */}
      <div className="shrink-0 space-y-2.5 border-t border-border p-4 sm:p-5">
        {fax.status === "Failed" && (
          <AddButton
            text="Resend Fax"
            icon={<RefreshCw className="h-4 w-4" />}
            onClick={() => {}}
            className="!w-full"
          />
        )}
        <DeleteButton
          text="Delete Fax"
          icon={<Trash2 className="h-4 w-4" />}
          onClick={() => {}}
          className="!w-full !rounded-lg !border !border-border !bg-transparent !font-medium !text-heading hover:!border-danger/40 hover:!bg-danger/5 hover:!text-danger focus-visible:!ring-danger/30"
        />
      </div>
    </CommonRightSection>
  );
};

export default FaxDetails;
