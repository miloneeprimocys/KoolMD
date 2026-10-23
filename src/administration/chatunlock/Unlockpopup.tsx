"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";

import ModalShell from "@/components/Modalshell";

/* ---------------------------------------------------------------- */
/*  Centered "Unlock Encounter Chart" confirmation                   */
/*  Opened from the Locked Charts right section (Unlock Chart btn).  */
/* ---------------------------------------------------------------- */
type Props = {
  open: boolean;
  onClose: () => void;
  /** Runs when the user presses "Yes, Unlock Chart". */
  onConfirm: () => void;
};

const UnlockPopup = ({ open, onClose, onConfirm }: Props) => (
  <ModalShell
    open={open}
    onClose={onClose}
    onSubmit={onConfirm}
    title="Unlock Encounter Chart"
    titleId="unlock-popup-title"
    submitText="Yes, Unlock Chart"
    cancelText="Cancel"
    width={520}
  >
    <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:items-start sm:gap-4 sm:text-left">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-warning/15 text-warning">
        <AlertTriangle className="h-6 w-6" />
      </span>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-heading">Are you sure you want to unlock this chart?</p>
        <p className="mt-1 text-sm leading-relaxed text-body">
          This will allow the practitioner to edit the encounter and make changes to the clinical
          documentation.
        </p>
      </div>
    </div>
  </ModalShell>
);

export default UnlockPopup;
