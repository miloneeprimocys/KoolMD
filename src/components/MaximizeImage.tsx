"use client";

import React, { type ReactNode } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, Download, Minimize2, Minus, Plus } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  minZoom?: number;
  maxZoom?: number;
  zoomStep?: number;
  pageLabel?: string;
  onPrevious?: () => void;
  onNext?: () => void;
  previousDisabled?: boolean;
  nextDisabled?: boolean;
  onDownload?: () => void;
  children: ReactNode;
};

const controlClass =
  "flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-body transition-colors hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-body";

const MaximizeImage = ({
  open,
  onClose,
  title,
  zoom,
  onZoomChange,
  minZoom = 50,
  maxZoom = 150,
  zoomStep = 25,
  pageLabel,
  onPrevious,
  onNext,
  previousDisabled = true,
  nextDisabled = true,
  onDownload,
  children,
}: Props) => {
  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/70 p-3 sm:p-6" onClick={onClose}>
      <section
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="flex h-full max-h-full w-full max-w-5xl flex-col overflow-hidden rounded-xl border border-border bg-card shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border bg-card px-3 py-2">
          <div className="flex min-w-0 items-center gap-2">
            <span className="truncate text-sm font-semibold text-heading">{title}</span>
            {pageLabel && <span className="shrink-0 text-xs text-body">{pageLabel}</span>}
          </div>

          <div className="flex shrink-0 items-center gap-1">
            {pageLabel && (
              <div className="mr-1 flex items-center gap-0.5 border-r border-border pr-1">
                <button type="button" aria-label="Previous page" disabled={previousDisabled} onClick={onPrevious} className={controlClass}>
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button type="button" aria-label="Next page" disabled={nextDisabled} onClick={onNext} className={controlClass}>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
            <button type="button" aria-label="Zoom out" disabled={zoom <= minZoom} onClick={() => onZoomChange(Math.max(minZoom, zoom - zoomStep))} className={controlClass}>
              <Minus className="h-4 w-4" />
            </button>
            <span className="min-w-11 text-center text-xs font-medium text-heading">{zoom}%</span>
            <button type="button" aria-label="Zoom in" disabled={zoom >= maxZoom} onClick={() => onZoomChange(Math.min(maxZoom, zoom + zoomStep))} className={controlClass}>
              <Plus className="h-4 w-4" />
            </button>
            <button type="button" aria-label="Download" onClick={onDownload} className={controlClass}>
              <Download className="h-4 w-4" />
            </button>
            <button type="button" aria-label="Minimize preview" title="Minimize preview" onClick={onClose} className={controlClass}>
              <Minimize2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 items-center justify-center custom-scrollbar overflow-auto bg-transparent p-3 sm:p-4">
          {children}
        </div>
      </section>
    </div>,
    document.body,
  );
};

export default MaximizeImage;
