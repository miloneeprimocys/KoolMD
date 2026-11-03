"use client";

import React from "react";
import { Info } from "lucide-react";

import EditButton from "@/components/EditButton";
import { cardCls } from "@/providers/Shared";
import { computeEarnings, usd, type SheetSnapshot } from "./Reviewcalculate";

/* ---------------------------------------------------------------- */
/*  Step 3 – Confirm                                                 */
/* ---------------------------------------------------------------- */
const InfoRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex items-start justify-between gap-4 py-2 text-sm">
    <span className="text-body">{label}</span>
    <span className="text-right font-medium text-heading">{value}</span>
  </div>
);

type Props = {
  snapshot: SheetSnapshot;
  /** Jump back to a step (1 or 2). */
  onEdit: (step: number) => void;
};

const ConfirmSheet = ({ snapshot, onEdit }: Props) => {
  const earnings = computeEarnings(snapshot);

  return (
    <div className="space-y-4 sm:space-y-5">
      <section className={`${cardCls} sm:p-6`}>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="text-base font-semibold text-heading">Sheet Details</h3>
          <EditButton section="Sheet Details" onEdit={() => onEdit(1)} />
        </div>
        <InfoRow label="Sheet #" value={snapshot.sheetId} />
        <InfoRow label="Provider" value={snapshot.provider} />
        <InfoRow label="Period" value={snapshot.period} />
        <InfoRow label="Agreement" value={`${snapshot.basis} @ ${usd(snapshot.rate)}`} />
        <InfoRow label="Completed Consultations" value={snapshot.count} />
      </section>

      <section className={`${cardCls} sm:p-6`}>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="text-base font-semibold text-heading">Earnings</h3>
          <EditButton section="Earnings" onEdit={() => onEdit(2)} />
        </div>
        <InfoRow label="Gross Payable" value={usd(earnings.gross)} />
        <InfoRow label="Adjustments" value={usd(earnings.adjustments)} />
        <InfoRow label="Previous Payments" value={usd(earnings.previous)} />
        <InfoRow label="Outstanding Amount" value={<span className="font-bold">{usd(earnings.outstanding)}</span>} />
      </section>

      <div className="flex items-start gap-3 rounded-xl border border-border bg-primary/5 dark:bg-primary/15 px-4 py-3 text-sm text-body">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        Submitting sends this payment sheet to an admin for review and approval. You can also save it as a draft.
      </div>
    </div>
  );
};

export default ConfirmSheet;