"use client";

import React from "react";
import { BadgeCheck, Calendar, Clock, CreditCard, Info, ShieldCheck, Stethoscope, Video } from "lucide-react";

import RadioCheckButtonh from "@/components/RadioCheckButtonh";
import { cardCls } from "@/providers/Shared";

import type { Provider } from "./FindProvider";
import type { BookingValues } from "./BookAppointment";


/* ---------------------------------------------------------------- */
/*  Fees + formatting                                                */
/* ---------------------------------------------------------------- */
export const FEES = { consultation: 80, platform: 5 };
export const TOTAL = FEES.consultation + FEES.platform;
export const money = (n: number) => `$${n.toFixed(2)}`;

export const VISIT_LABEL: Record<BookingValues["visitType"], string> = {
  video: "Video Consultation",
  "in-person": "In-Person Visit",
};

export const formatDateLong = (iso: string) =>
  iso
    ? new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";

export const providerInitials = (name: string) =>
  name
    .replace(/^Dr\.\s*/, "")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");

/** Provider photo placeholder (swap for <img> when providers have a photo URL). */
export const ProviderAvatar = ({ name, size = "md" }: { name: string; size?: "md" | "lg" }) => (
  <span
    className={`flex shrink-0 items-center justify-center rounded-xl bg-primary/10 font-semibold text-primary ${
      size === "lg" ? "h-24 w-24 text-2xl" : "h-12 w-12 text-sm"
    }`}
  >
    {providerInitials(name)}
  </span>
);

export const VerifiedBadge = () => <BadgeCheck className="h-4 w-4 shrink-0 text-primary" aria-label="Verified" />;

/* ---------------------------------------------------------------- */
/*  Appointment summary (right column)                               */
/* ---------------------------------------------------------------- */
const AppointmentSummary = ({
  provider,
  booking,
  mode,
}: {
  provider: Provider;
  booking: BookingValues;
  /** "booking" shows the next-step note, "intake" shows the total payment. */
  mode: "booking" | "intake";
}) => {
  const rows = [
    { icon: Calendar, label: "Date", value: formatDateLong(booking.date) },
    { icon: Clock, label: "Time", value: booking.time || "—" },
    { icon: Video, label: "Visit Type", value: VISIT_LABEL[booking.visitType] },
    { icon: Stethoscope, label: "Reason for Visit", value: booking.reason || "—" },
  ];

  return (
    <aside className={`${cardCls} min-w-0 space-y-4`}>
      <h3 className="flex items-center gap-2 text-base font-semibold text-heading">
        <Calendar className="h-4 w-4 text-primary" />
        Appointment Summary
      </h3>

      <div className="flex items-center gap-3 rounded-xl bg-primary/[0.04] p-3">
        <ProviderAvatar name={provider.name} />
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-sm font-semibold text-heading">
            <span className="truncate">{provider.name}</span>
            <VerifiedBadge />
          </p>
          <p className="truncate text-xs text-body">{provider.specialty}</p>
        </div>
      </div>

      <dl className="space-y-3">
        {rows.map((r) => {
          const Icon = r.icon;
          return (
            <div key={r.label} className="flex items-start justify-between gap-3 text-sm">
              <dt className="flex shrink-0 items-center gap-2 text-body">
                <Icon className="h-4 w-4 text-primary" />
                {r.label}
              </dt>
              <dd className="min-w-0 text-right font-medium text-heading">{r.value}</dd>
            </div>
          );
        })}
      </dl>

      {mode === "booking" ? (
        <div className="flex gap-2.5 rounded-xl border border-primary/15 bg-primary/5 p-3 text-xs leading-relaxed text-body">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          After booking, you&apos;ll complete a short intake form and make the consultation payment.
        </div>
      ) : (
        <div className="flex items-center justify-between border-t border-divider pt-3 text-sm font-semibold text-heading">
          <span>Total Payment</span>
          <span className="text-base">{money(TOTAL)}</span>
        </div>
      )}
    </aside>
  );
};

export default AppointmentSummary;

/* ---------------------------------------------------------------- */
/*  Payment card (shown on the review & pay screen)                  */
/* ---------------------------------------------------------------- */
export type PaymentMethod = "card" | "upi" | "wallet";

const METHODS: { key: PaymentMethod; label: string }[] = [
  { key: "card", label: "Credit / Debit Card" },
  { key: "upi", label: "UPI" },
  { key: "wallet", label: "Wallet (Paytm, PhonePe, etc.)" },
];

export const PaymentCard = ({
  method,
  onMethod,
}: {
  method: PaymentMethod;
  onMethod: (m: PaymentMethod) => void;
}) => (
  <section className={`${cardCls} min-w-0 space-y-4`}>
    <h3 className="flex items-center gap-2 text-base font-semibold text-heading">
      <CreditCard className="h-4 w-4 text-primary" />
      Payment
    </h3>

    <dl className="space-y-2 text-sm">
      <div className="flex justify-between">
        <dt className="text-body">Consultation Fee</dt>
        <dd className="text-heading">{money(FEES.consultation)}</dd>
      </div>
      <div className="flex justify-between">
        <dt className="text-body">Platform Fee</dt>
        <dd className="text-heading">{money(FEES.platform)}</dd>
      </div>
      <div className="flex justify-between border-t border-divider pt-2 text-base font-semibold text-heading">
        <dt>Total</dt>
        <dd>{money(TOTAL)}</dd>
      </div>
    </dl>

    <div>
      <p className="mb-2 text-sm font-semibold text-heading">Select Payment Method</p>
      <div role="radiogroup" className="space-y-2">
        {METHODS.map((m) => (
          <label
            key={m.key}
            className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 text-sm text-heading transition-colors ${
              method === m.key ? "border-primary/40 bg-primary/10" : "border-border bg-card hover:bg-primary/5"
            }`}
          >
            <RadioCheckButtonh
              type="radio"
              name="paymentMethod"
              checked={method === m.key}
              onChange={() => onMethod(m.key)}
            />
            {m.label}
          </label>
        ))}
      </div>
    </div>

    <div className="flex items-center gap-2 rounded-lg bg-primary/5 px-3 py-2 text-xs text-body">
      <ShieldCheck className="h-4 w-4 shrink-0 text-primary" />
      Your payment is secure and encrypted.
    </div>
  </section>
);