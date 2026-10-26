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
  Hash,
  Landmark,
  Receipt,
  Shield,
  User,
  Wallet,
} from "lucide-react";

import ImportButton from "@/components/ImportButton";
import Tags, { type TagTone } from "@/components/Tags";
import CommonRightSection from "@/components/CommonRightSection";
import type { PaymentRow, PaymentStatus } from "./Payments";

const STATUS_TONES: Record<PaymentStatus, TagTone> = {
  Paid: "success",
  Pending: "warning",
  Failed: "danger",
  Refunded: "info",
};

const METHOD_ICONS: Record<string, React.ElementType> = {
  "Credit Card": CreditCard,
  Insurance: Shield,
  "ACH Transfer": Landmark,
  Cash: Banknote,
  "Online (Wallet)": Wallet,
  "Manual Entry": FileText,
};

const TIMELINE: Record<PaymentStatus, { label: string; dot: string }> = {
  Paid: { label: "Payment Successful", dot: "bg-success" },
  Pending: { label: "Awaiting Payment", dot: "bg-warning" },
  Failed: { label: "Payment Failed", dot: "bg-danger" },
  Refunded: { label: "Payment Refunded", dot: "bg-primary" },
};

const money = (n: number) => `$${n.toFixed(2)}`;

type Props = { payment: PaymentRow | null; onClose: () => void; onCloseStart: () => void };

const ViewPayments = ({ payment, onClose, onCloseStart }: Props) => {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (!payment) return;
    setClosing(false);
    const frame = requestAnimationFrame(() => setOpen(true));
    return () => cancelAnimationFrame(frame);
  }, [payment?.id]);

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
    if (!payment) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  if (!payment) return null;

  const tone = STATUS_TONES[payment.status];
  const MethodIcon = METHOD_ICONS[payment.method] ?? CreditCard;
  const timeline = TIMELINE[payment.status];

  return (
    <CommonRightSection
      label={`Payment ${payment.txn} details`}
      ariaModal
      open={open}
      closing={closing}
      onClose={close}
      panelClassName="2xl:max-w-[460px]"
      header={<h2 className="text-base font-semibold text-heading">Payment Details</h2>}
    >
      <div className="min-h-0 flex-1 space-y-6 overflow-y-auto p-4 sm:p-5">
        {/* Summary */}
        <section className="flex items-start justify-between gap-4">
          <div className="min-w-0 space-y-1.5">
            <h3 className="font-semibold text-heading">{payment.txn}</h3>
            <Tags text={payment.status} tone={tone} />
            <p className="text-xs text-body">
              {payment.date} · {payment.time}
            </p>
          </div>
          <div className="shrink-0 border-l border-divider pl-3 text-right">
            <p className="text-xl font-bold text-heading">{money(payment.amount)}</p>
            <p className="text-xs text-body">Amount paid</p>
          </div>
        </section>

        <ImportButton
          text="Download Receipt"
          icon={<Download className="h-4 w-4" />}
          onClick={() => console.log("download payment receipt", payment.id) /* TODO: call your API here */}
          className="w-full"
        />

        {/* Payment information */}
        <section>
          <h3 className="mb-3 text-sm font-semibold text-heading">Payment Information</h3>
          <div className="grid grid-cols-2 gap-4 rounded-xl border border-border bg-primary/[0.03] p-4">
            <Info icon={Hash} label="Transaction ID">{payment.txn}</Info>
            <Info icon={Receipt} label="Invoice #">
              <span className="text-primary">{payment.invoice}</span>
            </Info>
            <Info icon={Calendar} label="Date">{payment.date}</Info>
            <Info icon={Clock} label="Time">{payment.time}</Info>
            <Info icon={MethodIcon} label="Payment Method">{payment.method}</Info>
            <Info icon={DollarSign} label="Amount">{money(payment.amount)}</Info>
            <Info icon={Clock} label="Status"><Tags text={payment.status} tone={tone} /></Info>
          </div>
        </section>

        {/* Patient */}
        <section>
          <h3 className="mb-3 text-sm font-semibold text-heading">Patient</h3>
          <div className="grid grid-cols-2 gap-4 rounded-xl border border-border p-4">
            <Info icon={User} label="Patient Name">{payment.patient}</Info>
            <Info icon={Calendar} label="Date of Birth">{payment.dob}</Info>
          </div>
        </section>

        {/* Timeline */}
        <section>
          <h3 className="mb-3 text-sm font-semibold text-heading">Payment Timeline</h3>
          <ol className="space-y-3">
            <li className="flex gap-3">
              <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-primary" />
              <div>
                <p className="text-sm font-medium text-heading">Payment Initiated</p>
                <p className="text-xs text-body">
                  {payment.method} · {payment.date}, {payment.time}
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${timeline.dot}`} />
              <div>
                <p className="text-sm font-medium text-heading">{timeline.label}</p>
                <p className="text-xs text-body">
                  {money(payment.amount)} · {payment.invoice}
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

export default ViewPayments;