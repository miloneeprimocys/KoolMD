"use client";

import React from "react";
import { CheckCircle2, AlertCircle, Clock } from "lucide-react";
import CommonRightSection from "@/components/CommonRightSection";
import { type EligibilityRecord } from "./EligibilityVerification";

type Props = {
  record: EligibilityRecord | null;
  open: boolean;
  closing: boolean;
  onClose: () => void;
};

const ViewEligibility = ({ record, open, closing, onClose }: Props) => {
  if (!record && !closing) return null;

  return (
    <CommonRightSection
      open={open}
      closing={closing}
      label="Eligibility Response"
      onClose={onClose}
      ariaModal
      header={
        <div>
          <h2 className="text-lg font-semibold text-heading">Eligibility Response</h2>
          <p className="text-xs text-body">Request ID: {record?.id}</p>
        </div>
      }
    >
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6 custom-scrollbar">
        {record && (
          <>
            {/* Status Banner */}
            <div
              className={`rounded-xl p-4 flex items-start gap-3 ${
                record.status === "Eligible"
                  ? "bg-success/10 text-success"
                  : record.status === "Pending"
                  ? "bg-warning/10 text-warning"
                  : "bg-danger/10 text-danger"
              }`}
            >
              {record.status === "Eligible" && <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />}
              {record.status === "Pending" && <Clock className="h-5 w-5 shrink-0 mt-0.5" />}
              {(record.status === "Ineligible" || record.status === "Failed") && (
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-semibold">{record.status}</p>
                <p className="text-xs opacity-90 mt-0.5">
                  {record.status === "Eligible" && "The patient is eligible for coverage under this plan."}
                  {record.status === "Ineligible" && "The patient is not eligible for coverage under this plan."}
                  {record.status === "Pending" && "The clearinghouse is still processing this request."}
                  {record.status === "Failed" && "The request failed due to a clearinghouse error."}
                </p>
              </div>
            </div>

            {/* Patient Info */}
            <section>
              <h3 className="text-sm font-semibold text-heading mb-3">Patient Information</h3>
              <div className="rounded-xl border border-border p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-body">Name</span>
                  <span className="font-medium text-heading">{record.patientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-body">Patient ID</span>
                  <span className="font-medium text-heading">{record.patientCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-body">Payer</span>
                  <span className="font-medium text-heading">{record.payer}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-body">Payer ID</span>
                  <span className="font-medium text-heading">{record.payerId}</span>
                </div>
              </div>
            </section>

            {/* Request Details */}
            <section>
              <h3 className="text-sm font-semibold text-heading mb-3">Request Details</h3>
              <div className="rounded-xl border border-border p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-body">Service Date</span>
                  <span className="font-medium text-heading">{record.serviceDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-body">Requested On</span>
                  <span className="font-medium text-heading">{record.requestedOn}</span>
                </div>
              </div>
            </section>

            {/* Coverage Details */}
            <section>
              <h3 className="text-sm font-semibold text-heading mb-3">Coverage Details</h3>
              <div className="rounded-xl border border-border p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-body">Plan Name</span>
                  <span className="font-medium text-heading">PPO Blue Preferred</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-body">Group Number</span>
                  <span className="font-medium text-heading">GRP987654</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-body">Effective Date</span>
                  <span className="font-medium text-heading">Jan 01, 2024</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-body">Status</span>
                  <span className="font-medium text-success">Active</span>
                </div>
              </div>
            </section>
          </>
        )}
      </div>

      <div className="shrink-0 border-t border-border p-4 sm:p-5 bg-card">
        <button
          onClick={onClose}
          className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-heading hover:bg-heading/5 transition-colors"
        >
          Close
        </button>
      </div>
    </CommonRightSection>
  );
};

export default ViewEligibility;