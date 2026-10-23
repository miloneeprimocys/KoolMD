"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { AlertCircle, Lock, Unlock } from "lucide-react";

import AddButton from "@/components/Addbutton";
import ImportButton from "@/components/ImportButton";
import Tags, { type TagTone } from "@/components/Tags";
import SignupDropdown, { type DropdownOption } from "@/components/SignupDropdown";
import DatePicker from "@/components/Datepicker";
import CommonRightSection from "@/components/CommonRightSection";
import { ModalTextarea } from "@/components/Modalshell";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppHooks";
import {
  clearUnlockPopupConfirmation,
  showModal,
} from "@/redux/slices/dialogslice";

/* ---------------------------------------------------------------- */
/*  Shared types (the tab files import these)                        */
/* ---------------------------------------------------------------- */
export type RequestStatus = "Pending" | "Approved" | "Rejected";

export type UnlockRequest = {
  id: string;
  patient: string;
  pid: string; // "PT-10045"
  age: number;
  gender: "M" | "F";
  encId: string; // "ENC-10021"
  encDate: string;
  encTime: string;
  encType: string;
  provider: string;
  requestedBy: string;
  role: string;
  reason: string;
  /** Longer text shown in the right section (falls back to `reason`). */
  reasonDetail?: string;
  requestedDate: string;
  requestedTime: string;
  status: RequestStatus;
};

export type LockedChart = {
  id: string;
  patient: string;
  pid: string;
  age: number;
  gender: "M" | "F";
  encId: string;
  encDate: string;
  encTime: string;
  encType: string;
  provider: string;
  specialty: string;
  completedDate: string;
  completedTime: string;
  lockedDate: string;
  lockedTime: string;
  status: "Locked" | "Unlocked";
};

export type PanelState =
  | { type: "request"; row: UnlockRequest }
  | { type: "locked"; row: LockedChart }
  | null;

export const REQUEST_TONE: Record<RequestStatus, TagTone> = {
  Pending: "warning",
  Approved: "success",
  Rejected: "danger",
};

/* ---------------------------------------------------------------- */
/*  Small shared pieces                                              */
/* ---------------------------------------------------------------- */
export const initials = (name: string) =>
  name
    .replace(/^Dr\.?\s+/i, "")
    .split(" ")
    .map((n) => n[0]?.toUpperCase())
    .slice(0, 2)
    .join("");

export const patientMeta = (p: { pid: string; age: number; gender: "M" | "F" }) =>
  `#${p.pid} • ${p.age}y • ${p.gender === "M" ? "Male" : "Female"}`;

/** Red "Locked" / green "Unlocked" badge with a lock icon. */
export const LockBadge = ({ locked }: { locked: boolean }) => (
  <span
    className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium ${
      locked ? "bg-danger/10 text-danger" : "bg-success/10 text-success"
    }`}
  >
    {locked ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
    {locked ? "Locked" : "Unlocked"}
  </span>
);

const BODY_CLS = "flex-1 space-y-5 overflow-y-auto px-6 py-5 hide-scrollbar";

const InfoSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="overflow-hidden rounded-xl border border-border">
    <h4 className="border-b border-border bg-primary/[0.04] px-4 py-2.5 text-sm font-semibold text-heading">
      {title}
    </h4>
    {children}
  </section>
);

const InfoRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="grid grid-cols-[120px_minmax(0,1fr)] items-start gap-3 border-t border-divider px-4 py-2.5 text-sm first:border-t-0">
    <dt className="text-body">{label}</dt>
    <dd className="min-w-0 break-words text-heading">{children}</dd>
  </div>
);

const EncounterLink = ({ id }: { id: string }) => (
  <button type="button" className="cursor-pointer font-medium text-link hover:underline">
    #{id}
  </button>
);

const smallBtn =
  "inline-flex h-9 shrink-0 cursor-pointer items-center justify-center whitespace-nowrap rounded-lg border border-primary/30 bg-primary/5 px-3.5 text-xs font-medium text-primary transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30";

const PatientHeader = ({
  row,
  buttonText,
}: {
  row: { patient: string; pid: string; age: number; gender: "M" | "F" };
  buttonText: string;
}) => (
  <div className="flex items-center gap-3 rounded-xl border border-border p-3">
    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
      {initials(row.patient)}
    </span>
    <div className="min-w-0 flex-1">
      <p className="truncate text-sm font-semibold text-heading sm:text-base">{row.patient}</p>
      <p className="truncate text-xs text-body">{patientMeta(row)}</p>
    </div>
    <button type="button" className={smallBtn}>
      {buttonText}
    </button>
  </div>
);

const Footer = ({
  cancelText = "Cancel",
  submitText,
  onCancel,
  onSubmit,
}: {
  cancelText?: string;
  submitText?: string;
  onCancel: () => void;
  onSubmit?: () => void;
}) => (
  <div
    className={`grid shrink-0 gap-3 border-t border-border bg-card px-6 py-4 ${
      submitText ? "grid-cols-2" : "grid-cols-1"
    }`}
  >
    <ImportButton text={cancelText} icon={null} onClick={onCancel} />
    {submitText && <AddButton text={submitText} icon={null} onClick={onSubmit} />}
  </div>
);

/* 12:00 AM … 11:30 PM, plus 11:59 PM */
const TIME_OPTIONS: DropdownOption[] = [
  ...Array.from({ length: 48 }, (_, i) => {
    const h = Math.floor(i / 2);
    const m = i % 2 ? "30" : "00";
    const label = `${String(h % 12 === 0 ? 12 : h % 12).padStart(2, "0")}:${m} ${h < 12 ? "AM" : "PM"}`;
    return { value: label, label };
  }),
  { value: "11:59 PM", label: "11:59 PM" },
];

const UNLOCK_REASONS: DropdownOption[] = [
  "Addendum to clinical notes",
  "Correction of documentation",
  "Missing information",
  "Billing correction",
  "Other",
].map((v) => ({ value: v, label: v }));

/* ---------------------------------------------------------------- */
/*  Unlock request panel                                             */
/* ---------------------------------------------------------------- */
const RequestPanel = ({
  row,
  onCancel,
  onSubmit,
}: {
  row: UnlockRequest;
  onCancel: () => void;
  onSubmit: () => void;
}) => {
  const [mode, setMode] = useState<"date" | "permanent">("date");
  const [date, setDate] = useState("2026-10-11");
  const [time, setTime] = useState("11:59 PM");
  const [notes, setNotes] = useState("");
  const pending = row.status === "Pending";

  return (
    <>
      <div className={BODY_CLS}>
        <PatientHeader row={row} buttonText="View Profile" />

        <InfoSection title="Encounter Details">
          <dl>
            <InfoRow label="Encounter ID"><EncounterLink id={row.encId} /></InfoRow>
            <InfoRow label="Date">{row.encDate} • {row.encTime}</InfoRow>
            <InfoRow label="Encounter Type">{row.encType}</InfoRow>
            <InfoRow label="Provider">{row.provider}</InfoRow>
          </dl>
        </InfoSection>

        <InfoSection title="Unlock Request Details">
          <dl>
            <InfoRow label="Requested By">
              {row.requestedBy} <span className="text-body">({row.role})</span>
            </InfoRow>
            <InfoRow label="Requested On">{row.requestedDate} • {row.requestedTime}</InfoRow>
            <InfoRow label="Reason">
              <p className="rounded-lg bg-primary/[0.06] px-3 py-2">{row.reasonDetail ?? row.reason}</p>
            </InfoRow>
            {!pending && (
              <InfoRow label="Status">
                <Tags text={row.status} tone={REQUEST_TONE[row.status]} />
              </InfoRow>
            )}
          </dl>
        </InfoSection>

        {pending && (
          <>
            <InfoSection title="Unlock Options">
              <div className="space-y-3 px-4 py-3">
                <p className="text-sm font-medium text-label">
                  Unlock Until <span className="text-danger">*</span>
                </p>

                <label className="flex cursor-pointer items-center gap-2.5 text-sm text-heading">
                  <input
                    type="radio"
                    name="unlock-mode"
                    checked={mode === "date"}
                    onChange={() => setMode("date")}
                    className="h-4 w-4 cursor-pointer accent-primary"
                  />
                  Specified date and time
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <DatePicker
                    name="unlockDate"
                    label={<span className="sr-only">Unlock date</span>}
                    placeholder="Select date"
                    value={date}
                    onChange={(v) => {
                      setDate(v);
                      setMode("date");
                    }}
                    portalZIndex={400}
                  />
                  <SignupDropdown
                    name="unlockTime"
                    label={<span className="sr-only">Unlock time</span>}
                    placeholder="Select time"
                    options={TIME_OPTIONS}
                    value={time}
                    onChange={(v) => {
                      setTime(v);
                      setMode("date");
                    }}
                    searchable={false}
                    portalMenu
                  />
                </div>

                <label className="flex cursor-pointer items-start gap-2.5 text-sm text-heading">
                  <input
                    type="radio"
                    name="unlock-mode"
                    checked={mode === "permanent"}
                    onChange={() => setMode("permanent")}
                    className="mt-0.5 h-4 w-4 cursor-pointer accent-primary"
                  />
                  <span>
                    Permanent unlock
                    <span className="block text-xs text-body">
                      Chart will remain unlocked until manually locked again.
                    </span>
                  </span>
                </label>
              </div>
            </InfoSection>

            <InfoSection title="Additional Notes">
              <div className="px-4 py-3">
                <ModalTextarea
                  id="unlock-request-notes"
                  label={<span className="sr-only">Additional notes</span>}
                  placeholder="Add a note (optional)..."
                  value={notes}
                  onChange={setNotes}
                />
              </div>
            </InfoSection>
          </>
        )}
      </div>

      {pending ? (
        <Footer submitText="Unlock Chart" onCancel={onCancel} onSubmit={onSubmit} />
      ) : (
        <Footer cancelText="Close" onCancel={onCancel} />
      )}
    </>
  );
};

/* ---------------------------------------------------------------- */
/*  Locked chart panel (Unlock Chart opens the centered popup)       */
/* ---------------------------------------------------------------- */
const LockedPanel = ({
  row,
  onCancel,
}: {
  row: LockedChart;
  onCancel: () => void;
}) => {
  const dispatch = useAppDispatch();
  const [reason, setReason] = useState("Addendum to clinical notes");
  const [notes, setNotes] = useState("Adding missing past medical history and updating assessment section.");
  const [errors, setErrors] = useState<{ reason?: string; notes?: string }>({});
  const locked = row.status === "Locked";

  const requestUnlock = () => {
    const e: { reason?: string; notes?: string } = {};
    if (!reason) e.reason = "Reason for unlock is required.";
    if (!notes.trim()) e.notes = "Additional notes are required.";
    setErrors(e);
    if (Object.keys(e).length === 0) dispatch(showModal("UnlockPopup"));
  };

  return (
    <>
      <div className={BODY_CLS}>
        <PatientHeader row={row} buttonText="View Patient" />

        <InfoSection title="Encounter Information">
          <dl>
            <InfoRow label="Encounter ID"><EncounterLink id={row.encId} /></InfoRow>
            <InfoRow label="Encounter Date">{row.encDate} • {row.encTime}</InfoRow>
            <InfoRow label="Encounter Type">{row.encType}</InfoRow>
            <InfoRow label="Provider">{row.provider}</InfoRow>
            <InfoRow label="Completed On">{row.completedDate} • {row.completedTime}</InfoRow>
            <InfoRow label="Locked On">{row.lockedDate} • {row.lockedTime}</InfoRow>
            <InfoRow label="Current Status"><LockBadge locked={locked} /></InfoRow>
          </dl>
        </InfoSection>

        {locked && (
          <>
            <InfoSection title="Unlock Details">
              <div className="space-y-3 px-4 py-3">
                <SignupDropdown
                  name="unlockReason"
                  label="Reason for Unlock *"
                  placeholder="Select reason"
                  options={UNLOCK_REASONS}
                  value={reason}
                  onChange={(v) => {
                    setReason(v);
                    setErrors((er) => ({ ...er, reason: undefined }));
                  }}
                  searchable={false}
                  portalMenu
                  error={errors.reason}
                />
                <ModalTextarea
                  id="locked-unlock-notes"
                  label="Additional Notes *"
                  placeholder="Explain why this chart needs to be unlocked"
                  value={notes}
                  onChange={(v) => {
                    setNotes(v);
                    setErrors((er) => ({ ...er, notes: undefined }));
                  }}
                  error={errors.notes}
                />
              </div>
            </InfoSection>

            <div className="flex items-start gap-3 rounded-xl border border-warning/30 bg-warning/10 p-4">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
              <p className="text-xs leading-relaxed text-heading sm:text-sm">
                Only administrators can unlock a locked chart. The chart will be available for the
                practitioner to edit after unlocking. All unlock actions are recorded in the audit
                history.
              </p>
            </div>
          </>
        )}
      </div>

      {locked ? (
        <Footer submitText="Unlock Chart" onCancel={onCancel} onSubmit={requestUnlock} />
      ) : (
        <Footer cancelText="Close" onCancel={onCancel} />
      )}
    </>
  );
};

/* ---------------------------------------------------------------- */
/*  Drawer                                                           */
/* ---------------------------------------------------------------- */
type Props = {
  panel: PanelState;
  onClose: () => void;
  onCloseStart: () => void;
  /** Called after a chart was unlocked so the page can show a toast. */
  onUnlocked?: (title: string, message: string) => void;
};

const ChartRightSection = ({ panel, onClose, onCloseStart, onUnlocked }: Props) => {
  const dispatch = useAppDispatch();
  const unlockPopupConfirmed = useAppSelector((state) => state.dialog.unlockPopupConfirmed);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const closePanel = useCallback(() => {
    if (!panel || closeTimer.current) return;
    setIsClosing(true);
    onCloseStart();
    const duration = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 300;
    closeTimer.current = setTimeout(() => {
      closeTimer.current = null;
      setIsOpen(false);
      setIsClosing(false);
      onClose();
    }, duration);
  }, [onClose, onCloseStart, panel]);

  const finishUnlock = useCallback(() => {
    if (panel?.type !== "locked") return;
    const row = panel.row;
    onUnlocked?.(
      "Chart Unlocked",
      `Encounter #${row.encId} for ${row.patient} has been unlocked and the action was recorded in the audit history.`,
    );
    closePanel();
  }, [closePanel, onUnlocked, panel]);

  useEffect(() => {
    if (!unlockPopupConfirmed) return;
    dispatch(clearUnlockPopupConfirmation());
    finishUnlock();
  }, [dispatch, finishUnlock, unlockPopupConfirmed]);

  useEffect(() => {
    if (!panel) {
      setIsOpen(false);
      setIsClosing(false);
      return;
    }
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    setIsClosing(false);
    const frame = requestAnimationFrame(() => setIsOpen(true));
    return () => cancelAnimationFrame(frame);
  }, [panel]);

  useEffect(
    () => () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    },
    [],
  );

  /* Escape closes the drawer — unless the centered popup is open (it handles Escape itself) */
  useEffect(() => {
    if (!panel) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (document.querySelector('[role="dialog"][aria-modal="true"]')) return;
      closePanel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [panel, closePanel]);

  if (!panel) return null;

  return (
    <CommonRightSection
      label="Unlock Chart"
      panelKey={`${panel.type}-${panel.row.id}`}
      open={isOpen}
      closing={isClosing}
      onClose={closePanel}
      header={<h3 className="text-base font-semibold text-heading sm:text-lg">Unlock Chart</h3>}
      headerClassName="px-6 py-4"
      panelClassName="2xl:max-w-[460px]"
    >

        {panel.type === "request" && (
          <RequestPanel row={panel.row} onCancel={closePanel} onSubmit={finishUnlock} />
        )}
        {panel.type === "locked" && (
          <LockedPanel row={panel.row} onCancel={closePanel} />
        )}
    </CommonRightSection>
  );
};

export default ChartRightSection;
