"use client";

import RadioCheckButtonh from "@/components/RadioCheckButtonh";
import React, { ReactNode, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, Download, Search, X } from "lucide-react";

import AddButton from "@/components/Addbutton";
import DatePicker from "@/components/Datepicker";
import ImportButton from "@/components/ImportButton";
import FileDropzone from "@/components/Filedropzone";
import { FieldError } from "@/components/SignupField";
import Tags, { type TagTone } from "@/components/Tags";
import type { DropdownOption } from "@/components/SignupDropdown";
/* Re-exports so modals import everything from one place */
export { default as SignupField } from "@/components/SignupField";
export { default as SignupDropdown } from "@/components/SignupDropdown";
/* ---------------------------------------------------------------- */
/*  Small helpers                                                   */
/* ---------------------------------------------------------------- */
export const toOptions = (items: string[]): DropdownOption[] =>
  items.map((v) => ({ value: v, label: v }));

export const ReqLabel = ({ children }: { children: ReactNode }) => (
  <>  
    {children} <span className="text-danger">*</span>
  </>
);

export const OptLabel = ({ children }: { children: ReactNode }) => (
  <>
    {children} <span className="font-normal text-body">(Optional)</span>
  </>
);

export const todayISO = () => new Date().toISOString().slice(0, 10);

/** "2026-11-20" -> "Nov 20, 2026" */
export const fmtDate = (iso: string) =>
  iso ? new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }) : "—";

export const addDays = (iso: string, n: number) => {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + n);
  const p = (x: number) => String(x).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

export const uid = (prefix: string) => `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;

export type Attachment = { name: string; size: string };
const fileSize = (b: number) => (b < 1048576 ? `${Math.max(1, Math.round(b / 1024))} KB` : `${(b / 1048576).toFixed(1)} MB`);
export const toAttachments = (files: (File | null)[]): Attachment[] =>
  files.filter((f): f is File => !!f).map((f) => ({ name: f.name, size: fileSize(f.size) }));

/* ---------------------------------------------------------------- */
/*  Date field                                                       */
/* ---------------------------------------------------------------- */
interface ModalDateFieldProps {
  id: string;
  label: ReactNode;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  min?: string;
  max?: string;
}

export const ModalDateField = ({
  id, label, value, onChange, error, min, max,
}: ModalDateFieldProps) => (
  <DatePicker
    id={id}
    name={id}
    label={label}
    value={value}
    minDate={min}
    maxDate={max}
    onChange={onChange}
    error={error}
    portalZIndex={400}
  />
);

/* ---------------------------------------------------------------- */
/*  Textarea with live counter                                      */
/* ---------------------------------------------------------------- */
interface ModalTextareaProps {
  id: string;
  label: ReactNode;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  maxLength?: number;
  error?: string;
}

export const ModalTextarea = ({
  id, label, value, onChange, placeholder, maxLength = 500, error,
}: ModalTextareaProps) => (
  <div className="w-full">
    <label htmlFor={id} className="mb-2 block text-sm font-medium text-label">
      {label}
    </label>
    <div>
      <textarea
        id={id}
        name={id}
        value={value}
        maxLength={maxLength}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={`h-28 w-full resize-none custom-scrollbar rounded-xl border bg-card px-4 py-3 text-sm text-heading outline-none transition-colors duration-200 placeholder:text-placeholder ${
          error ? "border-danger" : "border-border hover:border-primary/50 focus:border-primary"
        }`}
      />
      <span className=" block text-right text-[11px] text-body">
        {value.length}/{maxLength}
      </span>
    </div>
    <FieldError message={error} />
  </div>
);

/* ---------------------------------------------------------------- */
/*  Radio group (Yes / No / Unknown …)                              */
/* ---------------------------------------------------------------- */
interface ModalRadioGroupProps {
  name: string;
  label: ReactNode;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  error?: string;
  disabled?: boolean;
  className?: string;
}

export const ModalRadioGroup = ({
  name, label, value, onChange, options, error, disabled = false, className = "",
}: ModalRadioGroupProps) => {
  const isGrid = className.includes("grid");
  const isCustomFlex = className.includes("flex-col") || isGrid;

  return (
    <div className="w-full">
      {label ? <p className="mb-2 text-sm font-medium text-label">{label}</p> : null}
      <div
        className={`${isGrid ? "" : "flex"} ${
          isCustomFlex
            ? ""
            : `items-center gap-y-2 ${
                className.includes("flex-nowrap") ? "" : "flex-wrap"
              } ${className.includes("gap-x-") ? "" : "gap-x-6"}`
        } ${className}`}
        role="radiogroup"
      >
        {options.map((o) => (
          <label
            key={o.value}
            className={`flex items-center gap-2 text-sm text-heading ${
              disabled ? "cursor-default" : "cursor-pointer"
            }`}
          >
            <RadioCheckButtonh
              type="radio"
              name={name}
              value={o.value}
              checked={value === o.value}
              onChange={() => onChange(o.value)}
              disabled={disabled}
              className="h-4 w-4 shrink-0 cursor-pointer accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:cursor-default"
            />
            <span className="whitespace-nowrap">{o.label}</span>
          </label>
        ))}
      </div>
      <FieldError message={error} />
    </div>
  );
};

interface ModalCheckboxGroupProps {
  label: ReactNode;
  value: string[];
  onChange: (value: string[]) => void;
  options: { value: string; label: string }[];
  disabled?: boolean;
  className?: string;
}

export const ModalCheckboxGroup = ({
  label,
  value,
  onChange,
  options,
  disabled = false,
  className = "",
}: ModalCheckboxGroupProps) => (
  <div className="w-full">
    <p className="mb-2 text-sm font-medium text-label">{label}</p>
    <div className={className} role="group">
      {options.map((option) => (
        <label
          key={option.value}
          className={`flex items-center gap-2 text-sm text-heading ${disabled ? "cursor-default" : "cursor-pointer"}`}
        >
          <RadioCheckButtonh
            type="checkbox"
            checked={value.includes(option.value)}
            disabled={disabled}
            onChange={() =>
              onChange(
                value.includes(option.value)
                  ? value.filter((selected) => selected !== option.value)
                  : [...value, option.value],
              )
            }
            className="h-4 w-4 rounded accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:cursor-default"
          />
          {option.label}
        </label>
      ))}
    </div>
  </div>
);

/* ---------------------------------------------------------------- */
/*  Attachments (uses FileDropzone's "attachment" variant)          */
/* ---------------------------------------------------------------- */
export const AttachmentField = ({
  title, file, onChange, error, maxSizeMB = 5,
}: {
  title: string;
  file: File | null;
  onChange: (f: File | null) => void;
  error?: string;
  maxSizeMB?: number;
}) => (
  <div className="w-full">
    <p className="mb-2 text-sm font-medium text-label">
      <OptLabel>Attachments</OptLabel>
    </p>
    <FileDropzone
      variant="attachment"
      title={title}
      file={file}
      onChange={onChange}
      error={error}
      maxSizeMB={maxSizeMB}
    />
  </div>
);

/* ---------------------------------------------------------------- */
/*  Form grid                                                       */
/* ---------------------------------------------------------------- */
export const FormGrid = ({ children }: { children: ReactNode }) => (
  <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">{children}</div>
);

export const FullRow = ({ children }: { children: ReactNode }) => (
  <div className="sm:col-span-2">{children}</div>
);
/* Bordered section with an icon badge (used in the longer modals) */
export const ModalSection = ({
  icon,
  title,
  children,
}: {
  icon?: ReactNode;
  title: ReactNode;
  children: ReactNode;
}) => (
  <section className="rounded-xl border border-border p-4">
    <div className="mb-3 flex items-center gap-3">
      {icon && (
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          {icon}
        </span>
      )}
      <h4 className="text-sm font-semibold text-heading">{title}</h4>
    </div>
    {children}
  </section>
);

/* ---------------------------------------------------------------- */
/*  Pieces for the sidebar-style modals (Add Order etc.)            */
/* ---------------------------------------------------------------- */
export const FieldLabel = ({ children }: { children: ReactNode }) => (
  <p className="mb-2 text-sm font-medium text-label">{children}</p>
);

/** Bordered box used for detail / summary panels inside a modal */
export const Panel = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
  <div className={`min-w-0 rounded-xl border border-border bg-card p-4 ${className}`}>{children}</div>
);

export const DetailRow = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="grid grid-cols-[110px_minmax(0,1fr)] gap-2 py-1.5 text-sm">
    <dt className="text-body">{label}</dt>
    <dd className="font-medium text-heading">{children}</dd>
  </div>
);

const outlineBtnCls =
  "flex cursor-pointer items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30";
export const dangerBtnCls = `${outlineBtnCls} border-danger/40 text-danger hover:bg-danger/5`;

export type Priority = "Routine" | "Urgent" | "Stat";
const PRIORITIES: Priority[] = ["Routine", "Urgent", "Stat"];

export const PriorityToggle = ({ value, onChange }: { value: Priority; onChange: (p: Priority) => void }) => (
  <div className="flex flex-wrap gap-2" role="group" aria-label="Priority">
    {PRIORITIES.map((p) => (
      <button
        key={p}
        type="button"
        aria-pressed={value === p}
        onClick={() => onChange(p)}
        className={`cursor-pointer rounded-lg border px-4 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${
          value === p ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-heading hover:border-primary/40"
        }`}
      >
        {p}
      </button>
    ))}
  </div>
);

export const SearchInput = ({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) => (
  <label className="flex h-11 w-full min-w-0 items-center gap-2 rounded-xl border border-border bg-card px-3 transition-colors focus-within:border-primary hover:border-primary/50">
    <Search className="h-4 w-4 shrink-0 text-body" />
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="min-w-0 flex-1 bg-transparent text-sm text-heading outline-none placeholder:text-placeholder"
    />
  </label>
);

export const Chips = ({ options, value, onChange }: { options: { label: string; count?: number }[]; value: string; onChange: (v: string) => void }) => (
  <div className="flex flex-wrap gap-2" role="group">
    {options.map((o) => {
      const active = value === o.label;
      return (
        <button
          key={o.label}
          type="button"
          aria-pressed={active}
          onClick={() => onChange(o.label)}
          className={`cursor-pointer rounded-full border px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${
            active ? "border-primary bg-primary text-on-primary" : "border-border bg-card text-heading hover:border-primary/40 hover:bg-primary/5"
          }`}
        >
          {o.label}
          {o.count !== undefined ? ` (${o.count})` : ""}
        </button>
      );
    })}
  </div>
);

const STATUS_TONE: Record<string, TagTone> = {
  Active: "success", Completed: "success", Accepted: "success",
  Scheduled: "info", Sent: "info",
  Pending: "warning",
  Cancelled: "danger", Declined: "danger",
  Draft: "neutral", "As Needed": "violet",
};
export const StatusTag = ({ status, tone }: { status: string; tone?: TagTone }) => (
  <Tags text={status} tone={tone ?? STATUS_TONE[status] ?? "neutral"} size="xs" />
);

/** Clickable-row table used for the master lists */
export function ListTable<T extends { id: string }>({
  columns, rows, selectedId, onSelect, emptyText,
}: {
  columns: { label: string; render: (row: T) => ReactNode }[];
  rows: T[];
  selectedId?: string;
  onSelect: (id: string) => void;
  emptyText: string;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border custom-scrollbar">
      <table className="w-full min-w-[680px] text-left text-sm">
        <thead className="border-b border-border bg-primary/5 text-xs font-semibold text-heading dark:bg-primary/10">
          <tr>{columns.map((c) => <th key={c.label} className="border-b border-border px-3 py-2.5">{c.label}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-divider">
          {rows.length === 0 && (
            <tr><td colSpan={columns.length} className="px-3 py-8 text-center text-body">{emptyText}</td></tr>
          )}
          {rows.map((r) => (
            <tr
              key={r.id}
              onClick={() => onSelect(r.id)}
              className={`cursor-pointer transition-colors hover:bg-primary/5 ${selectedId === r.id ? "bg-primary/10" : ""}`}
            >
              {columns.map((c) => <td key={c.label} className="px-3 py-3 align-middle">{c.render(r)}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export const AttachmentList = ({ items }: { items: Attachment[] }) =>
  items.length === 0 ? (
    <p className="text-sm text-body">No attachments.</p>
  ) : (
    <ul className="space-y-2">
      {items.map((a) => (
        <li key={a.name} className="flex items-center justify-between gap-3 rounded-xl border border-border px-3 py-2">
          <span className="min-w-0 truncate text-sm text-heading">
            {a.name} <span className="text-body">({a.size})</span>
          </span>
          <button type="button" aria-label={`Download ${a.name}`} className="cursor-pointer text-body hover:text-primary">
            <Download className="h-4 w-4" />
          </button>
        </li>
      ))}
    </ul>
  );

/** List on the left, details on the right; each column scrolls on large screens. */
export const TabLayout = ({
  list,
  details,
  mobileDetailOpen = false,
  onMobileBack,
}: {
  list: ReactNode;
  details: ReactNode;
  mobileDetailOpen?: boolean;
  onMobileBack?: () => void;
}) => (
  <div className="grid min-h-0 gap-4 xl:h-full xl:grid-cols-[minmax(0,1fr)_340px]">
    <div className={`min-h-0 min-w-0 space-y-3 hide-scrollbar xl:overflow-y-auto ${mobileDetailOpen ? "hidden xl:block" : ""}`}>{list}</div>
    <div className={`min-h-0 min-w-0 hide-scrollbar xl:overflow-y-auto ${mobileDetailOpen ? "" : "hidden xl:block"}`}>
      {onMobileBack && (
        <button type="button" onClick={onMobileBack} className="mb-3 flex cursor-pointer items-center gap-1.5 text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 xl:hidden">
          <ArrowLeft className="h-4 w-4" />
          Back to options
        </button>
      )}
      {details}
    </div>
  </div>
);

/* ---------------------------------------------------------------- */
/*  Modal shell (no MUI — Tailwind + portal)                        */
/* ---------------------------------------------------------------- */
interface ModalShellProps {
  open: boolean;
  onClose: () => void;
  onSubmit?: () => void;
  title: ReactNode;
  titleId?: string;
  subtitle?: ReactNode;
  submitText?: string;
  cancelText?: string;
  footer?: ReactNode;
  /** Max card width in px (default 640) */
  width?: number;
  /** Tailwind z-index class for the overlay (default z-[300]) */
  zIndexClass?: string;
  /** While saving: the submit button is disabled and shows "Saving…" (blocks double submits). */
  isSubmitting?: boolean;
  /** Save failure shown above the footer (e.g. the API error message). */
  errorMessage?: string | null;
  children: ReactNode;
}

const ModalShell = ({
  open,
  onClose,
  onSubmit,
  title,
  titleId,
  subtitle,
  submitText,
  cancelText = "Cancel",
  footer,
  width = 680,
  zIndexClass = "z-[300]",
  isSubmitting = false,
  errorMessage,
  children,
}: ModalShellProps) => {
  const [mounted, setMounted] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  useEffect(() => setMounted(true), []);

  /* Close on Escape + lock page scroll while open */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!mounted || !open) return null;

  return createPortal(
    <div
      className={`fixed inset-0 ${zIndexClass} overflow-y-auto bg-primary/10 dark:bg-label/10 backdrop-blur-[2px]`}
      onPointerDown={(e) => {
        if (
          e.target instanceof Element &&
          e.target.closest('[role="listbox"], [role="menu"], [data-portal], .portal-menu')
        ) {
          return;
        }
        if (e.target instanceof Node && !modalRef.current?.contains(e.target)) {
          onClose();
        }
      }}
    >
      <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
        <div
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          style={{ maxWidth: width }}
          className="flex max-h-[calc(90dvh-2rem)] w-full flex-col overflow-hidden rounded-2xl bg-card px-5 pb-5 pt-5 shadow-2xl dark:bg-card dark:ring-1 dark:ring-primary/30 sm:px-6 sm:pb-6"
        >
          {/* Header */}
          <div className="-mx-5 mb-5 flex items-start justify-between gap-4 border-b border-border/70 px-5 pb-4 sm:-mx-6 sm:mb-6 sm:px-6">
            <div className="min-w-0">
              <h3 id={titleId} className="text-lg font-semibold text-heading sm:text-xl">{title}</h3>
              {subtitle && <p className="mt-0.5 text-sm text-body">{subtitle}</p>}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="flex h-8 w-8 cursor-pointer shrink-0 items-center justify-center rounded-md text-heading transition-colors hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          {/* Body */}
          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto hide-scrollbar">{children}</div>

          {errorMessage && (
            <p
              role="alert"
              className="mt-4 shrink-0 rounded-lg border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger"
            >
              {errorMessage}
            </p>
          )}

          {/* Footer */}
          {footer ? (
            <div className="mt-6 shrink-0">{footer}</div>
          ) : (
            onSubmit &&
            submitText && (
              <div className="mt-6 flex shrink-0 items-center justify-center gap-3 sm:justify-end">
                <ImportButton text={cancelText} icon={null} onClick={onClose} />
                <AddButton
                  text={isSubmitting ? "Saving…" : submitText}
                  icon={null}
                  onClick={onSubmit}
                  disabled={isSubmitting}
                />
              </div>
            )
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default ModalShell;
