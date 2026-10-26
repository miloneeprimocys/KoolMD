"use client";

import React from "react";
import { ShieldCheck } from "lucide-react";

import Breadcrumb from "@/components/Breadcrumb";

const EligibilityVerification = () => (
  <div className="mx-auto w-full max-w-[1600px] space-y-4 sm:space-y-5">
    <Breadcrumb
      items={[
        { label: "Billing", href: "/payment/payment-gateway" },
        { label: "Clearinghouse", href: "/payers/accounts" },
        { label: "Eligibility Verification" },
      ]}
    />

    <div>
      <h2 className="text-lg font-semibold text-heading sm:text-xl 2xl:text-2xl">Eligibility Verification</h2>
      <p className="mt-0.5 text-sm text-body">Verify patient coverage and benefits through your clearinghouse.</p>
    </div>

    <div className="flex min-h-48 flex-col items-center justify-center rounded-[14px] border border-border bg-card p-6 text-center">
      <ShieldCheck className="h-8 w-8 text-primary" />
      <p className="mt-3 text-sm text-body">Eligibility verification details will appear here.</p>
    </div>
  </div>
);

export default EligibilityVerification;
