"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import AddButton from "@/components/Addbutton";
import ImportButton from "@/components/ImportButton";
import Breadcrumb from "@/components/Breadcrumb";
import Tags from "@/components/Tags";
import { TextArea, cardCls } from "@/providers/Shared";

/* ---------------------------------------------------------------- */
/*  Static data (replace with API / redux selector)                  */
/* ---------------------------------------------------------------- */
type Sheet = {
  id: string;
  provider: string;
  period: string;
  agreement: string;
  consultations: number;
  gross: number;
  adjustments: number;
  previous: number;
};

const SHEETS: Record<string, Sheet> = {
  "PS-1045": { id: "PS-1045", provider: "Dr. John Carter (PR-1001)", period: "Oct 1 – Oct 31, 2026", agreement: "Per Consultation @ $500", consultations: 24, gross: 12000, adjustments: 0, previous: 2000 },
  "PS-1044": { id: "PS-1044", provider: "Dr. Emily Rogers (PR-1002)", period: "Oct 1 – Oct 31, 2026", agreement: "Per Case @ $350", consultations: 25, gross: 8750, adjustments: 0, previous: 0 },
  "PS-1043": { id: "PS-1043", provider: "MedStaff Agency (PR-1004)", period: "Oct 1 – Oct 31, 2026", agreement: "Per Consultation @ $400", consultations: 62, gross: 25000, adjustments: 0, previous: 17000 },
};

const usd = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const InfoRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex items-start justify-between gap-4 py-2 text-sm">
    <span className="text-body">{label}</span>
    <span className="text-right font-medium text-heading">{value}</span>
  </div>
);

/* ---------------------------------------------------------------- */
/*  Page                                                             */
/* ---------------------------------------------------------------- */
const ReviewApprovePayment = () => {
  const router = useRouter();
  const sheetId = useSearchParams().get("id") ?? "PS-1045";
  const sheet = SHEETS[sheetId] ?? SHEETS["PS-1045"];
  const [notes, setNotes] = useState("");

  const outstanding = sheet.gross + sheet.adjustments - sheet.previous;

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-4 sm:space-y-5">
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Compensation", href: "/compensation" },
          { label: "Payment History", href: "/compensation/payment-history" },
          { label: sheet.id },
          { label: "Review & Approval" },
        ]}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-heading sm:text-xl 2xl:text-2xl">Review & Approve Payment</h2>
          <p className="mt-0.5 text-sm text-body">Verify details and approve or return for correction.</p>
        </div>
        <Tags text="Pending Review" tone="warning" size="xs" />
      </div>

      <div className="grid items-start gap-4 sm:gap-5 lg:grid-cols-2">
        <section className={`${cardCls} sm:p-6`}>
          <h3 className="mb-2 text-base font-semibold text-heading">Payment Details</h3>
          <InfoRow label="Sheet #" value={sheet.id} />
          <InfoRow label="Provider" value={sheet.provider} />
          <InfoRow label="Period" value={sheet.period} />
          <InfoRow label="Agreement" value={sheet.agreement} />
          <InfoRow label="Completed Consultations" value={sheet.consultations} />
        </section>

        <section className={`${cardCls} sm:p-6`}>
          <h3 className="mb-2 text-base font-semibold text-heading">Earnings Summary</h3>
          <InfoRow label="Gross Payable" value={usd(sheet.gross)} />
          <InfoRow label="Adjustments" value={usd(sheet.adjustments)} />
          <InfoRow label="Previous Payments" value={usd(sheet.previous)} />
          <div className="mt-2 flex items-center justify-between gap-4 rounded-lg bg-warning/10 px-3 py-2.5 text-sm">
            <span className="font-medium text-heading">Outstanding Amount</span>
            <span className="font-bold text-heading">{usd(outstanding)}</span>
          </div>
        </section>
      </div>

      <section className={`${cardCls} sm:p-6`}>
        <TextArea
          name="adminNotes"
          label="Admin Review Notes"
          placeholder="Verified consultations and rate. Approved for payment."
          value={notes}
          onChange={setNotes}
          maxLength={500}
        />
        <div className="mt-5 flex flex-row justify-end gap-2 sm:gap-3">
          <ImportButton text="Return for Correction" icon={null} className="flex-1 sm:flex-none" onClick={() => router.push("/compensation")} />
          <AddButton
            text="Approve Payment"
            icon={null}
            className="flex-1 sm:flex-none"
            onClick={() => {
              // TODO: call approve API with { sheetId, notes }
              router.push(`/compensation/record-payment?id=${encodeURIComponent(sheet.id)}`);
            }}
          />
        </div>
      </section>
    </div>
  );
};

export default ReviewApprovePayment;