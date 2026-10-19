"use client";

import React, { type ReactNode } from "react";
import { X } from "lucide-react";

type CommonRightSectionProps = {
  open: boolean;
  closing?: boolean;
  label: string;
  onClose: () => void;
  header: ReactNode;
  children: ReactNode;
  panelKey?: string;
  panelClassName?: string;
  headerClassName?: string;
  ariaModal?: boolean;
};

/** Shared responsive drawer shell, styled to match the appointment details panel. */
const CommonRightSection = ({
  open,
  closing = false,
  label,
  onClose,
  header,
  children,
  panelKey,
  panelClassName = "",
  headerClassName = "",
  ariaModal = false,
}: CommonRightSectionProps) => (
  <>
    <div
      className={`fixed inset-x-0 bottom-0 top-14 z-[140] bg-black/40 backdrop-blur-xs transition-opacity duration-300 ease-out xl:top-16 2xl:hidden ${open && !closing ? "opacity-100" : "opacity-0"}`}
      onClick={onClose}
      aria-hidden="true"
    />
    <aside
      key={panelKey}
      aria-label={label}
      aria-modal={ariaModal || undefined}
      role={ariaModal ? "dialog" : undefined}
      className={`fixed bottom-0 right-0 top-14 z-[150] flex h-[calc(100dvh-3.5rem)] w-full max-w-[420px] flex-col border-y border-l border-border bg-card shadow-2xl transition-transform duration-300 ease-out xl:top-16 xl:h-[calc(100dvh-4rem)] ${open && !closing ? "translate-x-0" : "translate-x-full"} ${panelClassName}`}
    >
      <header className={`flex shrink-0 items-start justify-between gap-3 border-b border-border bg-card px-4 py-3.5 sm:px-5 ${headerClassName}`}>
        {header}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close panel"
          className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-body transition-colors hover:bg-heading/5 hover:text-heading focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
        >
          <X className="h-5 w-5" />
        </button>
      </header>
      {children}
    </aside>
  </>
);

export default CommonRightSection;
