"use client";

import React, { type ReactNode } from "react";

import Tags from "@/components/Tags";
import { cardCls } from "@/providers/Shared";
import { CLAIM_STATUS_TONE, money, type Claim } from "./Claims";

const Row = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="grid grid-cols-[130px_minmax(0,1fr)] items-center gap-3 text-sm sm:grid-cols-[170px_minmax(0,1fr)]">
    <dt className="text-body">{label}</dt>
    <dd className="min-w-0 break-words font-medium text-heading">{children}</dd>
  </div>
);

const ClaimInformation = ({ claim }: { claim: Claim }) => (
  <section className={`${cardCls} sm:p-6`}>
    <dl className="grid gap-x-10 gap-y-4 md:grid-cols-2 md:[&>div:first-child]:border-r md:[&>div:first-child]:border-border md:[&>div:first-child]:pr-8">
      <div className="space-y-4">
        <Row label="Claim #">{claim.id}</Row>
        <Row label="Claim Type">{claim.claimType}</Row>
        <Row label="Submitted On">
          {claim.submittedOn}, {claim.submittedAt}
        </Row>
        <Row label="Submitted By">{claim.submittedBy}</Row>
        <Row label="Total Amount">{money(claim.amount)}</Row>
      </div>

      <div className="space-y-4">
        <Row label="Current Status">
          <Tags text={claim.status} tone={CLAIM_STATUS_TONE[claim.status]} />
        </Row>
        <Row label="Clearinghouse Claim ID">{claim.clearinghouseClaimId}</Row>
        <Row label="Payer Claim ID">{claim.payerClaimId}</Row>
        <Row label="Last Updated">{claim.lastUpdated}</Row>
        <Row label="Responses">{claim.responses}</Row>
      </div>
    </dl>
  </section>
);

export default ClaimInformation;