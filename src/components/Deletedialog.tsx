"use client";

import React, { ReactNode, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Trash2, X } from "lucide-react";

import ImportButton from "@/components/ImportButton";
import DeleteButton from "@/components/DeleteButton";

/* ---------------------------------------------------------------- */
/*  Reusable delete confirmation dialog                             */
/*  - Tailwind + portal (no MUI), same shell behaviour as ModalShell */
/*  - Optional details box (label / value rows)                      */
/*  - Use it from any DeleteXxx file: Tag, Prescription, Provider …  */
/* ---------------------------------------------------------------- */
export type DeleteDetail = { label: string; value: ReactNode };

interface DeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: ReactNode;
  description?: ReactNode;
  /** Summary box shown under the description */
  details?: DeleteDetail[];
  /** Replaces the default trash icon */
  icon?: ReactNode;
  cancelText?: string;
  confirmText?: string;
  loadingText?: string;
  /** Disables both buttons and shows `loadingText` on the confirm button */
  loading?: boolean;
  /** Optional custom confirm button, rendered in the shared actions row. */
  confirmButton?: ReactNode;
  /** Max card width in px (default 480) */
  width?: number;
  /** Tailwind z-index class for the overlay (default z-[300]) */
  zIndexClass?: string;
}

const DeleteDialog = ({
  open,
  onClose,
  onConfirm,
  title,
  description,
  details,
  icon,
  cancelText = "Cancel",
  confirmText = "Delete",
  loadingText = "Deleting…",
  loading = false,
  confirmButton,
  width = 560,
  zIndexClass = "z-[300]",
}: DeleteDialogProps) => {
  const [mounted, setMounted] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  useEffect(() => setMounted(true), []);

  const close = () => {
    if (!loading) onClose();
  };

  /* Close on Escape + lock page scroll while open */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) onClose();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, loading, onClose]);

  if (!mounted || !open) return null;

  return createPortal(
    <div
      className={`fixed inset-0 ${zIndexClass} overflow-y-auto bg-[#18365f]/35 backdrop-blur-[2px]`}
      onPointerDown={(e) => {
        if (e.target instanceof Node && !cardRef.current?.contains(e.target)) close();
      }}
    >
      <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
        <div
          ref={cardRef}
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="delete-dialog-title"
          aria-describedby={description ? "delete-dialog-desc" : undefined}
          style={{ maxWidth: width }}
          className="relative w-full rounded-2xl bg-card p-6 text-center shadow-2xl dark:bg-[#082858] dark:ring-1 dark:ring-primary/30 sm:p-6"
        >
          {/* Close */}
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="absolute right-4 top-4 flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-body transition-colors hover:bg-heading/5 hover:text-heading focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Icon */}
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-danger/10 text-danger">
            {icon ?? <Trash2 className="h-7 w-7" />}
          </span>

          {/* Text */}
          <h3 id="delete-dialog-title" className="mt-4 text-xl font-semibold text-heading">
            {title}
          </h3>
          {description && (
            <p id="delete-dialog-desc" className="mx-auto mt-2 max-w-[380px] text-sm leading-relaxed text-body">
              {description}
            </p>
          )}

          {/* Details */}
          {details && details.length > 0 && (
            <dl className="mt-5 space-y-2.5 rounded-xl bg-primary/[0.05] p-4 text-left">
              {details.map((d) => (
                <div key={d.label} className="grid grid-cols-[110px_minmax(0,1fr)] gap-3 text-sm sm:grid-cols-[130px_minmax(0,1fr)]">
                  <dt className="text-body">{d.label}</dt>
                  <dd className="min-w-0 break-words font-semibold text-heading">{d.value}</dd>
                </div>
              ))}
            </dl>
          )}

          {/* Actions */}
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-center">
            <ImportButton
              text={cancelText}
              icon={null}
              onClick={close}
              className="w-full whitespace-nowrap sm:w-auto sm:min-w-[150px]"
            />
            {confirmButton ?? (
              <DeleteButton
                text={confirmText}
                onClick={onConfirm}
                loading={loading}
                loadingText={loadingText}
                className="sm:w-auto sm:min-w-[170px]"
              />
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default DeleteDialog;