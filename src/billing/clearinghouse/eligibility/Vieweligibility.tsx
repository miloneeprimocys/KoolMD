"use client";

import React, { useEffect, useState } from "react";
import { AlertCircle, Building2, Calendar, CheckCircle2, Clock, FileText, Hash, Shield, User } from "lucide-react";

import ImportButton from "@/components/ImportButton";
import Tags from "@/components/Tags";
import CommonRightSection from "@/components/CommonRightSection";
import { PayerLogo } from "./checkeligibility/Patientinsurance";
import { STATUS_TONE, type EligibilityRecord } from "./EligibilityVerification";

type Props = { record: EligibilityRecord | null; onClose: () => void; onCloseStart: () => void };

const BANNER = {
  Eligible: { cls: "bg-success/10 text-success", text: "The patient is eligible for coverage under this plan.", Icon: CheckCircle2 },
  Ineligible: { cls: "bg-danger/10 text-danger", text: "The patient is not eligible for coverage under this plan.", Icon: AlertCircle },
  Pending: { cls: "bg-primary/10 text-primary", text: "The clearinghouse is still processing this request.", Icon: Clock },
  Failed: { cls: "bg-danger/10 text-danger", text: "The request failed due to a clearinghouse error.", Icon: AlertCircle },
} as const;

const Info = ({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ElementType;
  label: string;
  children: React.ReactNode;
}) => (
  <div className="flex items-start gap-2">
    <Icon className="mt-0.5 h-4 w-4 shrink-0 text-body" />
    <div>
      <p className="text-xs text-body">{label}</p>
      <div className="mt-0.5 break-words text-sm font-medium text-heading">{children}</div>
    </div>
  </div>
);

const ViewEligibility = ({ record, onClose, onCloseStart }: Props) => {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (!record) return;
    setClosing(false);
    const frame = requestAnimationFrame(() => setOpen(true));
    return () => cancelAnimationFrame(frame);
  }, [record?.id]);

  const close = () => {
    if (closing) return;
    setClosing(true);
    setOpen(false);
    onCloseStart();
    window.setTimeout(() => {
      onClose();
      setClosing(false);
    }, 300);
  };

  useEffect(() => {
    if (!record) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  if (!record) return null;

  const banner = BANNER[record.status];
  const BannerIcon = banner.Icon;

  return (
    <CommonRightSection
      label={`Eligibility response ${record.id}`}
      ariaModal
      open={open}
      closing={closing}
      onClose={close}
      panelClassName="2xl:max-w-[460px]"
      header={
        <div>
          <h2 className="text-base font-semibold text-heading">Eligibility Response</h2>
          <p className="mt-0.5 text-xs text-body">Request ID: {record.id}</p>
        </div>
      }
    >
      <div className="min-h-0 flex-1 space-y-6 overflow-y-auto p-4 sm:p-5">
        {/* Status banner */}
        <div className={`flex items-start gap-3 rounded-xl p-4 ${banner.cls}`}>
          <BannerIcon className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-semibold">{record.status}</p>
            <p className="mt-0.5 text-xs opacity-90">{banner.text}</p>
          </div>
        </div>

        {/* Patient + payer */}
        <section>
          <h3 className="mb-3 text-sm font-semibold text-heading">Patient &amp; Payer</h3>
          <div className="grid grid-cols-2 gap-4 rounded-xl border border-border bg-primary/[0.03] p-4">
            <Info icon={User} label="Patient">{record.patientName}</Info>
            <Info icon={Hash} label="Patient ID">{record.patientCode}</Info>
            <Info icon={Building2} label="Payer">
              <span className="flex items-center gap-2">
                <PayerLogo name={record.payer} size="h-7 w-7" />
                {record.payer}
              </span>
            </Info>
            <Info icon={Hash} label="Payer ID">{record.payerId}</Info>
          </div>
        </section>

        {/* Request details */}
        <section>
          <h3 className="mb-3 text-sm font-semibold text-heading">Request Details</h3>
          <div className="grid grid-cols-2 gap-4 rounded-xl border border-border p-4">
            <Info icon={Calendar} label="Service Date">{record.serviceDate}</Info>
            <Info icon={Clock} label="Requested On">{record.requestedDate}, {record.requestedTime}</Info>
            <Info icon={Clock} label="Status"><Tags text={record.status} tone={STATUS_TONE[record.status]} /></Info>
          </div>
        </section>

        {/* Coverage details */}
        <section>
          <h3 className="mb-3 text-sm font-semibold text-heading">Coverage Details</h3>
          <div className="grid grid-cols-2 gap-4 rounded-xl border border-border p-4">
            <Info icon={Shield} label="Plan Name">PPO Blue Preferred</Info>
            <Info icon={FileText} label="Group Number">GRP987654</Info>
            <Info icon={Calendar} label="Effective Date">Jan 01, 2024</Info>
            <Info icon={Clock} label="Coverage Status">
              <Tags
                text={record.status === "Eligible" ? "Active" : "Inactive"}
                tone={record.status === "Eligible" ? "success" : "neutral"}
              />
            </Info>
          </div>
        </section>
      </div>

      <div className="shrink-0 border-t border-border bg-card p-4 sm:p-5">
        <ImportButton text="Close" icon={null} onClick={close} className="w-full" />
      </div>
    </CommonRightSection>
  );
};

export default ViewEligibility;