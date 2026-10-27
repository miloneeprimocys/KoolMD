"use client";

import React, { type ReactNode } from "react";
import { Pill } from "lucide-react";

import ModalShell from "@/components/Modalshell";
import AddButton from "@/components/Addbutton";
import ImportButton from "@/components/ImportButton";
import Tags from "@/components/Tags";

/* ---------------------------------------------------------------- */
/*  Shared type + helpers (also used by Edit / MarkInactive / Delete) */
/* ---------------------------------------------------------------- */
export type MedicationTone = "primary" | "pink" | "success" | "warning";

export type Medication = {
  id: string;
  name: string;
  /** Condition / category shown under the name, e.g. "Asthma" */
  condition: string;
  type: string;
  dosage: string;
  /** Shown in brackets after the dosage, e.g. "90 mcg" */
  dosageNote: string;
  frequency: string;
  /** Shown in brackets after the frequency, e.g. "For wheezing" */
  frequencyNote: string;
  route: string;
  /** ISO yyyy-mm-dd */
  startDate: string;
  /** ISO yyyy-mm-dd or "" */
  endDate: string;
  provider: string;
  providerCode: string;
  instructions: string;
  notes: string;
  status: "Active" | "Inactive";
  tone: MedicationTone;
};

export const TONE_CLS: Record<MedicationTone, string> = {
  primary: "bg-primary/10 text-primary",
  pink: "bg-pink/10 text-pink",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
};

/** "2023-03-15" -> "Mar 15, 2023" */
export const formatDate = (iso?: string) => {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return "—";
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
};

export const withNote = (value: string, note?: string) => (note ? `${value} (${note})` : value);

/* Round icon badge used in the table and in the modals */
export const MedicationBadge = ({ tone }: { tone: MedicationTone }) => (
  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${TONE_CLS[tone]}`}>
    <Pill className="h-4 w-4" />
  </span>
);

/* Name / condition / status card shown at the top of the view and stop modals */
export const MedicationSummary = ({ medication }: { medication: Medication }) => (
  <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-primary/[0.03] p-3">
    <div className="flex min-w-0 items-center gap-3">
      <MedicationBadge tone={medication.tone} />
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-heading">{medication.name}</p>
        <p className="truncate text-xs text-body">{medication.condition}</p>
      </div>
    </div>
    <Tags text={medication.status} tone={medication.status === "Active" ? "success" : "neutral"} />
  </div>
);

const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="min-w-0">
    <p className="text-xs text-body">{label}</p>
    <p className="mt-1 break-words text-sm font-semibold text-heading">{children}</p>
  </div>
);

/* ---------------------------------------------------------------- */
/*  View details modal                                              */
/* ---------------------------------------------------------------- */
type Props = {
  open: boolean;
  onClose: () => void;
  medication: Medication | null;
  /** "Edit Medication" button – close this modal and open the edit one. */
  onEdit?: (medication: Medication) => void;
};

const ViewMedication = ({ open, onClose, medication, onEdit }: Props) => {
  if (!medication) return null;

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title="Medication Details"
      width={760}
      footer={
        <div className="flex items-center justify-center gap-3 sm:justify-end">
          <ImportButton text="Close" icon={null} onClick={onClose} />
          <AddButton text="Edit Medication" icon={null} onClick={() => onEdit?.(medication)} />
        </div>
      }
    >
      <MedicationSummary medication={medication} />

      <div className="grid grid-cols-1 gap-x-6 gap-y-4 pt-2 sm:grid-cols-2">
        <Field label="Dosage">{withNote(medication.dosage, medication.dosageNote)}</Field>
        <Field label="Frequency">{withNote(medication.frequency, medication.frequencyNote)}</Field>
        <Field label="Route">{medication.route || "—"}</Field>
        <Field label="Start Date">{formatDate(medication.startDate)}</Field>
        <Field label="End Date">{formatDate(medication.endDate)}</Field>
      </div>

      <div className="space-y-4 pt-2">
        <Field label="Prescribing Provider">
          {medication.provider}
          {medication.providerCode ? ` (${medication.providerCode})` : ""}
        </Field>
        <Field label="Instructions">{medication.instructions || "—"}</Field>
        <Field label="Notes">{medication.notes || "—"}</Field>
      </div>
    </ModalShell>
  );
};

export default ViewMedication;