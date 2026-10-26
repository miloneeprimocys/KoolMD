"use client";

import React, { useEffect, useState } from "react";
import { Download, Mail, MoreVertical } from "lucide-react";

import ImportButton from "@/components/ImportButton";
import Tags, { type TagTone } from "@/components/Tags";
import CommonRightSection from "@/components/CommonRightSection";
import { formatDate } from "../../membership//membership-plans/Viewmembershipplan";
import { money, type InvoiceEntry, type InvoiceStatus } from "./Invoice";

const STATUS_TONES: Record<InvoiceStatus, TagTone> = {
  Paid: "success",
  Pending: "warning",
  Overdue: "danger",
  Refunded: "neutral",
};

type Props = { invoice: InvoiceEntry | null; onClose: () => void; onCloseStart: () => void };

const ViewInvoice = ({ invoice, onClose, onCloseStart }: Props) => {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (!invoice) return;
    setClosing(false);
    const frame = requestAnimationFrame(() => setOpen(true));
    return () => cancelAnimationFrame(frame);
  }, [invoice?.id]);

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
    if (!invoice) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  if (!invoice) return null;

  const tone = STATUS_TONES[invoice.status];
  const dueDate = invoice.start;
  const paid = invoice.status === "Paid";

  return (
    <CommonRightSection
      label={`Invoice ${invoice.id} details`}
      ariaModal
      open={open}
      closing={closing}
      onClose={close}
      panelClassName="2xl:max-w-[460px]"
      header={<h2 className="text-base font-semibold text-heading">Invoice Details</h2>}
    >
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4 sm:p-5">
        {/* Status + actions */}
        <div className="flex items-center justify-between gap-2">
          <Tags text={invoice.status} tone={tone} />
          <div className="flex items-center gap-2">
            <ImportButton
              text="Download"
              icon={<Download className="h-4 w-4" />}
              onClick={() => console.log("download invoice", invoice.id) /* TODO: call your API here */}
              className="h-8! whitespace-nowrap px-3"
            />
            <ImportButton
              text="Send"
              icon={<Mail className="h-4 w-4" />}
              onClick={() => console.log("send invoice", invoice.id) /* TODO: call your API here */}
              className="h-8! whitespace-nowrap px-3"
            />
            <button
              type="button"
              aria-label="More actions"
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-border text-label transition-colors hover:bg-primary/10 hover:text-primary"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Invoice sheet */}
        <section className="space-y-5 rounded-xl border border-border p-4">
          {/* Brand + number */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-white">+</span>
              <span className="text-lg font-bold tracking-wide text-primary">KOOLMD</span>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-heading">Invoice</p>
              <p className="text-sm font-medium text-body">{invoice.id}</p>
              <div className="mt-1.5">
                <Tags text={invoice.status} tone={tone} />
              </div>
            </div>
          </div>

          {/* Clinic + dates */}
          <div className="grid grid-cols-2 gap-4 border-b border-border pb-5 text-xs text-body">
            <div className="space-y-0.5 leading-relaxed">
              <p className="text-sm font-semibold text-heading">KoolMD Healthcare</p>
              <p>123 Medical Center Drive</p>
              <p>New York, NY 10001</p>
              <p>support@koolmd.com</p>
              <p>+1 (555) 123-4567</p>
            </div>
            <dl className="space-y-1">
              <Row label="Invoice Date" value={formatDate(invoice.start)} />
              <Row label="Due Date" value={formatDate(dueDate)} />
              <Row label="Payment Date" value={invoice.paymentDate ? formatDate(invoice.paymentDate) : "—"} />
            </dl>
          </div>

          {/* Bill to + plan */}
          <div className="grid grid-cols-2 gap-4 text-xs text-body">
            <div className="space-y-0.5 leading-relaxed">
              <p className="mb-1 text-sm font-semibold text-heading">Bill To</p>
              <p className="font-medium text-heading">{invoice.patient}</p>
              <p>{invoice.email}</p>
              <p>{invoice.phone}</p>
            </div>
            <div className="space-y-0.5 leading-relaxed">
              <p className="mb-1 text-sm font-semibold text-heading">Membership Plan</p>
              <p className="font-medium text-heading">{invoice.plan}</p>
              <p>
                {formatDate(invoice.start)} - {formatDate(invoice.end)}
              </p>
            </div>
          </div>

          {/* Items */}
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-primary/[0.05] text-heading">
                  <th className="p-2.5 font-semibold">Description</th>
                  <th className="p-2.5 font-semibold">Qty</th>
                  <th className="p-2.5 font-semibold">Unit Price</th>
                  <th className="p-2.5 text-right font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr className="text-body">
                  <td className="p-2.5">
                    {invoice.plan} - {invoice.cycle} Membership
                  </td>
                  <td className="p-2.5">1</td>
                  <td className="p-2.5">{money(invoice.amount)}</td>
                  <td className="p-2.5 text-right">{money(invoice.amount)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="ml-auto w-full  space-y-2 text-xs">
            <div className="flex justify-between text-body">
              <span>Subtotal</span>
              <span className="font-medium text-heading">{money(invoice.amount)}</span>
            </div>
            <div className="flex justify-between text-body">
              <span>Tax (0%)</span>
              <span className="font-medium text-heading">$0.00</span>
            </div>
            <div className="flex justify-between rounded-lg bg-primary/10 px-3 py-2 text-sm font-bold text-primary">
              <span>Total</span>
              <span>{money(invoice.amount)}</span>
            </div>
          </div>
        </section>

        {/* Payment information */}
        <section>
          <h3 className="mb-3 text-sm font-semibold text-heading">Payment Information</h3>
          <dl className="space-y-2.5 rounded-xl border border-border p-4 text-xs">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-body">Payment Method</dt>
              <dd className="flex items-center gap-2 font-medium text-heading">
                Visa **** 4242
                <span className="rounded bg-primary px-1.5 py-0.5 text-[10px] font-bold italic text-white">VISA</span>
              </dd>
            </div>
            <Row label="Transaction ID" value={invoice.txn} wide />
            <Row label="Payment Date" value={invoice.paymentDate ? formatDate(invoice.paymentDate) : "—"} wide />
            <div className="flex items-center justify-between gap-3">
              <dt className="text-body">Payment Status</dt>
              <dd>
                <Tags text={paid ? "Paid" : invoice.status} tone={tone} />
              </dd>
            </div>
          </dl>
        </section>
      </div>
    </CommonRightSection>
  );
};

const Row = ({ label, value, wide = false }: { label: string; value: React.ReactNode; wide?: boolean }) => (
  <div className={`flex items-center justify-between gap-3 ${wide ? "" : "text-xs"}`}>
    <dt className="text-body">{label}</dt>
    <dd className="whitespace-nowrap font-medium text-heading">{value}</dd>
  </div>
);

export default ViewInvoice;
