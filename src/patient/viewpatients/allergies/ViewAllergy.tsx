"use client";

import React, { type ReactNode } from "react";
import { Pill } from "lucide-react";

import ModalShell from "@/components/Modalshell";
import ImportButton from "@/components/ImportButton";
import AddButton from "@/components/Addbutton";
import Tags, { type TagTone } from "@/components/Tags";

/* ---------------------------------------------------------------- */
/*  Shared type + helpers (also used by Edit / Delete)               */
/* ---------------------------------------------------------------- */
export type AllergySeverity = "High" | "Moderate" | "Mild";

export type Allergy = {
  id: string;
  allergen: string;
  /** Medication, Food, Environmental ... */
  type: string;
  reaction: string;
  severity: AllergySeverity;
  /** ISO yyyy-mm-dd */
  dateIdentified: string;
  status: "Active" | "Inactive";
  notes: string;
};

export const SEVERITY_TONE: Record<AllergySeverity, TagTone> = {
  High: "danger",
  Moderate: "warning",
  Mild: "info",
};

export const statusTone = (s: Allergy["status"]): TagTone => (s === "Active" ? "success" : "neutral");

/** "2020-03-12" -> "Mar 12, 2020" */
export const formatDate = (iso?: string) => {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return "—";
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
};

/* Name / type / status card shown at the top of the view modal */
export const AllergySummary = ({ allergy }: { allergy: Allergy }) => (
  <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-primary/[0.03] p-3">
    <div className="flex min-w-0 items-center gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-danger/10 text-danger">
        <Pill className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-heading">{allergy.allergen}</p>
        <p className="truncate text-xs text-body">{allergy.type}</p>
      </div>
    </div>
    <Tags text={allergy.status} tone={statusTone(allergy.status)} />
  </div>
);

const Row = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="grid grid-cols-[110px_minmax(0,1fr)] items-center gap-3 text-sm sm:grid-cols-[140px_minmax(0,1fr)]">
    <dt className="text-body">{label}</dt>
    <dd className="min-w-0 break-words font-semibold text-heading">{children}</dd>
  </div>
);

/* ---------------------------------------------------------------- */
type Props = {
  open: boolean;
  onClose: () => void;
  allergy: Allergy | null;
  /** "Edit Allergy" button – close this modal and open the edit one. */
  onEdit?: (allergy: Allergy) => void;
};

const ViewAllergy = ({ open, onClose, allergy, onEdit }: Props) => {
  if (!allergy) return null;

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title="Allergy Details"
      width={760}
      footer={
        <div className="flex items-center justify-center gap-3 sm:justify-end">
          <ImportButton text="Close" icon={null} onClick={onClose} />
          <AddButton text="Edit Allergy" icon={null} onClick={() => onEdit?.(allergy)} />
        </div>
      }
    >
      <AllergySummary allergy={allergy} />

      <dl className="space-y-3.5 pt-3">
        <Row label="Allergen Name">{allergy.allergen}</Row>
        <Row label="Type">{allergy.type}</Row>
        <Row label="Reaction">{allergy.reaction || "—"}</Row>
        <Row label="Severity">
          <Tags text={allergy.severity} tone={SEVERITY_TONE[allergy.severity]} />
        </Row>
        <Row label="Date Identified">{formatDate(allergy.dateIdentified)}</Row>
        <Row label="Status">
          <Tags text={allergy.status} tone={statusTone(allergy.status)} />
        </Row>
        <Row label="Notes">{allergy.notes || "—"}</Row>
      </dl>
    </ModalShell>
  );
};

export default ViewAllergy;