"use client";

import React, { ReactNode, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

import AddButton from "@/components/Addbutton";
import DatePicker from "@/components/Datepicker";
import ImportButton from "@/components/ImportButton";
import FileDropzone from "@/components/Filedropzone";
import { FieldError } from "@/components/SignupField";
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
    <div className="relative">
      <textarea
        id={id}
        name={id}
        value={value}
        maxLength={maxLength}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={`h-28 w-full resize-none rounded-xl border bg-card px-4 pb-7 pt-3 text-sm text-heading outline-none transition-colors duration-200 placeholder:text-placeholder ${
          error ? "border-danger" : "border-border hover:border-primary/50 focus:border-primary"
        }`}
      />
      <span className="pointer-events-none absolute bottom-2.5 right-3.5 text-[11px] text-body">
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
}

export const ModalRadioGroup = ({
  name, label, value, onChange, options, error,
}: ModalRadioGroupProps) => (
  <div className="w-full">
    <p className="mb-2 text-sm font-medium text-label">{label}</p>
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2" role="radiogroup">
      {options.map((o) => (
        <label key={o.value} className="flex cursor-pointer items-center gap-2 text-sm text-heading">
          <input
            type="radio"
            name={name}
            value={o.value}
            checked={value === o.value}
            onChange={() => onChange(o.value)}
            className="h-4 w-4 cursor-pointer accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
          />
          {o.label}
        </label>
      ))}
    </div>
    <FieldError message={error} />
  </div>
);

/* ---------------------------------------------------------------- */
/*  Attachments (uses FileDropzone's "attachment" variant)          */
/* ---------------------------------------------------------------- */
export const AttachmentField = ({
  title, file, onChange, error,
}: {
  title: string;
  file: File | null;
  onChange: (f: File | null) => void;
  error?: string;
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
      maxSizeMB={5}
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
      className={`fixed inset-0 ${zIndexClass} overflow-y-auto bg-[#18365f]/35 backdrop-blur-[2px]`}
      onPointerDown={(e) => {
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
          className="flex max-h-[calc(90dvh-2rem)] w-full flex-col overflow-hidden rounded-2xl bg-card px-5 pb-5 pt-5 shadow-2xl dark:bg-[#082858] dark:ring-1 dark:ring-primary/30 sm:px-6 sm:pb-6"
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

          {/* Footer */}
          {footer ? (
            <div className="mt-6 shrink-0">{footer}</div>
          ) : (
            onSubmit &&
            submitText && (
              <div className="mt-6 flex shrink-0 items-center justify-center gap-3 sm:justify-end">
                <ImportButton text={cancelText} icon={null} onClick={onClose} />
                <AddButton text={submitText} icon={null} onClick={onSubmit} />
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