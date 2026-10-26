"use client";

import React, { useEffect, useState } from "react";
import {
  Banknote,
  Calendar,
  Clock,
  CreditCard,
  DollarSign,
  Download,
  FileText,
  Landmark,
  Receipt,
  User,
  UserCheck,
  Wallet,
} from "lucide-react";

import ImportButton from "@/components/ImportButton";
import Tags, { type TagTone } from "@/components/Tags";
import CommonRightSection from "@/components/CommonRightSection";
import type { RefundRow, RefundStatus } from "./Refunds";

const STATUS_TONES: Record<RefundStatus, TagTone> = {
  Completed: "success",
  Pending: "warning",
  Failed: "danger",
  Cancelled: "danger",
};

const METHOD_ICONS: Record<string, React.ElementType> = {
  "Credit Card": CreditCard,
  ACH: Landmark,
  "Online (Wallet)": Wallet,
  Cash: Banknote,
};

const TIMELINE_DOT: Record<RefundStatus, { label: string; dot: string }> = {
  Completed: { label: "Refund Completed", dot: "bg-success" },
  Pending: { label: "Awaiting Processing", dot: "bg-warning" },
  Failed: { label: "Refund Failed", dot: "bg-danger" },
  Cancelled: { label: "Refund Cancelled", dot: "bg-danger" },
};

const money = (n: number) => `$${n.toFixed(2)}`;

type Props = { refund: RefundRow | null; onClose: () => void; onCloseStart: () => void };

const ViewRefund = ({ refund, onClose, onCloseStart }: Props) => {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (!refund) return;
    setClosing(false);
    const frame = requestAnimationFrame(() => setOpen(true));
    return () => cancelAnimationFrame(frame);
  }, [refund?.id]);

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
    if (!refund) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  if (!refund) return null;

  const tone = STATUS_TONES[refund.status];
  const MethodIcon = METHOD_ICONS[refund.method] ?? CreditCard;
  const timeline = TIMELINE_DOT[refund.status];

  return (
    <CommonRightSection
      label={`Refund ${refund.refundId} details`}
      ariaModal
      open={open}
      closing={closing}
      onClose={close}
      panelClassName="2xl:max-w-[460px]"
      header={<h2 className="text-base font-semibold text-heading">Refund Details</h2>}
    >
      <div className="min-h-0 flex-1 space-y-6 overflow-y-auto p-4 sm:p-5">
        {/* Summary */}
        <section className="flex items-start justify-between gap-4">
          <div className="min-w-0 space-y-1.5">
            <h3 className="font-semibold text-heading">{refund.refundId}</h3>
            <Tags text={refund.status} tone={tone} />
            <p className="text-xs text-body">{refund.reason}</p>
          </div>
          <div className="shrink-0 border-l border-divider pl-3 text-right">
            <p className="text-xl font-bold text-heading">{money(refund.amount)}</p>
            <p className="text-xs text-body">Refund amount</p>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-3">
          <ImportButton
            text="Download Receipt"
            icon={<Download className="h-4 w-4" />}
            onClick={() => console.log("download refund receipt", refund.id) /* TODO: call your API here */}
            className="w-full"
          />
        </div>

        {/* Refund information */}
        <section>
          <h3 className="mb-3 text-sm font-semibold text-heading">Refund Information</h3>
          <div className="grid grid-cols-2 gap-4 rounded-xl border border-border bg-primary/[0.03] p-4">
            <Info icon={FileText} label="Refund ID">{refund.refundId}</Info>
            <Info icon={Calendar} label="Date">{refund.date}</Info>
            <Info icon={Clock} label="Time">{refund.time}</Info>
            <Info icon={MethodIcon} label="Refund Method">{refund.method}</Info>
            <Info icon={DollarSign} label="Amount">{money(refund.amount)}</Info>
            <Info icon={Clock} label="Status"><Tags text={refund.status} tone={tone} /></Info>
            <Info icon={FileText} label="Reason">{refund.reason}</Info>
            <Info icon={UserCheck} label="Processed By">{refund.processedBy}</Info>
          </div>
        </section>

        {/* Patient + invoice */}
        <section>
          <h3 className="mb-3 text-sm font-semibold text-heading">Patient &amp; Invoice</h3>
          <div className="grid grid-cols-2 gap-4 rounded-xl border border-border p-4">
            <Info icon={User} label="Patient">{refund.patient}</Info>
            <Info icon={Receipt} label="Original Invoice">
              <span className="text-primary">{refund.invoice}</span>
            </Info>
          </div>
        </section>

        {/* Timeline */}
        <section>
          <h3 className="mb-3 text-sm font-semibold text-heading">Refund Timeline</h3>
          <ol className="space-y-3">
            <li className="flex gap-3">
              <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-primary" />
              <div>
                <p className="text-sm font-medium text-heading">Refund Initiated</p>
                <p className="text-xs text-body">
                  {refund.processedBy} · {refund.date}, {refund.time}
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${timeline.dot}`} />
              <div>
                <p className="text-sm font-medium text-heading">{timeline.label}</p>
                <p className="text-xs text-body">
                  {money(refund.amount)} via {refund.method}
                </p>
              </div>
            </li>
          </ol>
        </section>
      </div>
    </CommonRightSection>
  );
};

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

export default ViewRefund;