"use client";

import React from "react";
import { Check, Circle } from "lucide-react";

import Tags, { type TagTone } from "@/components/Tags";
import { cardCls } from "@/providers/Shared";
import type { Claim } from "./Claims";

type HistoryEvent = {
  title: string;
  date: string;
  description: string;
  status: string;
  tone: TagTone;
};

/*
  Always returns the full timeline so every step is visible.
  TODO: replace with the status history returned by your API.
*/
export const getHistory = (claim: Claim): HistoryEvent[] => {
  const day = claim.submittedOn;
  const rejected = claim.status === "Rejected";

  return [
    {
      title: "Submitted to Clearinghouse",
      date: `${day}, 10:15 AM`,
      description: "Claim submitted successfully to Availity.",
      status: "Submitted",
      tone: "info",
    },
    {
      title: "Accepted by Clearinghouse",
      date: `${day}, 10:25 AM`,
      description: "Claim accepted and forwarded to payer.",
      status: "Accepted",
      tone: "success",
    },
    {
      title: "Received by Payer",
      date: `${day}, 11:05 AM`,
      description: `Claim received by ${claim.insurance.split(" ")[0]} (Payer Claim ID: ${
        claim.payerClaimId === "-" ? "123456789" : claim.payerClaimId
      }).`,
      status: "Received",
      tone: "info",
    },
    {
      title: "Payer Response",
      date: "Oct 22, 2026, 09:30 AM",
      description: rejected
        ? "Claim rejected by payer. Review the claim and resubmit."
        : "Claim processed. Payment pending.",
      status: rejected ? "Rejected" : "Pending",
      tone: rejected ? "danger" : "warning",
    },
  ];
};

const StatusHistory = ({ claim }: { claim: Claim }) => {
  const events = getHistory(claim);

  return (
    <section className={`${cardCls} sm:p-6`}>
      <h3 className="mb-2 text-base font-semibold text-heading sm:text-lg">Claim Status History</h3>

      <ol>
        {events.map((e, i) => {
          const isFirst = i === 0;
          const isLast = i === events.length - 1;

          return (
            <li
              key={e.title}
              className={`relative flex gap-4 py-4 ${isLast ? "" : "border-b border-border/60"}`}
            >
              {/* Connector line to the next step */}
              {!isLast && (
                <span
                  aria-hidden="true"
                  className={`absolute left-[11px] top-[2.75rem] bottom-[-1rem] z-0 w-0.5 ${
                    isFirst ? "bg-primary" : "bg-success/50"
                  }`}
                />
              )}

              {/* Marker */}
              <span
                className={`relative z-[1] mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                  isLast
                    ? "border-2 border-heading bg-card text-heading"
                    : isFirst
                      ? "bg-primary text-white"
                      : "bg-success text-white"
                }`}
              >
                {isLast ? <Circle className="h-2 w-2 fill-current" /> : <Check className="h-3.5 w-3.5" />}
              </span>

              <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-heading">{e.title}</p>
                  <p className="mt-0.5 text-xs text-body">{e.date}</p>
                  <p className="mt-0.5 text-xs text-body">{e.description}</p>
                </div>
                <div className="shrink-0"><Tags text={e.status} tone={e.tone} /></div>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
};

export default StatusHistory;