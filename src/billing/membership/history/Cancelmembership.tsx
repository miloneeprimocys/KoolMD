"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Ban, CalendarDays, Star, type LucideIcon } from "lucide-react";

import Breadcrumb from "@/components/Breadcrumb";
import AddButton from "@/components/Addbutton";
import ImportButton from "@/components/ImportButton";
import Tags from "@/components/Tags";
import RadioCheckButtonh from "@/components/RadioCheckButtonh";
import SignupField from "@/components/SignupField";

import { PlanIcon, cycleUnit } from "../membership-plans/Viewmembershipplan";
import { HISTORY } from "./Membershiphistory";

/* ---------- Static data ---------- */
const REASONS = [
  { value: "no-longer-need", label: "I no longer need this plan" },
  { value: "too-expensive", label: "It's too expensive" },
  { value: "not-using", label: "I'm not using the features" },
  { value: "switching", label: "Switching to another plan" },
  { value: "poor-experience", label: "Poor experience" },
  { value: "other", label: "Other" },
];

/* ---------- Small pieces ---------- */
const StepCard = ({
  step,
  title,
  subtitle,
  children,
}: {
  step: number;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) => (
  <section className="rounded-[14px] border border-border bg-card p-4 sm:p-5">
    <div className="mb-4 flex items-start gap-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-on-primary">
        {step}
      </span>
      <div className="min-w-0">
        <h3 className="text-base font-semibold text-heading">{title}</h3>
        {subtitle && <p className="mt-0.5 text-xs text-body sm:text-sm">{subtitle}</p>}
      </div>
    </div>
    <div className="sm:pl-11">{children}</div>
  </section>
);

const NextItem = ({ icon: Icon, children }: { icon: LucideIcon; children: React.ReactNode }) => (
  <li className="flex items-start gap-3 text-sm text-heading">
    <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
    <span>{children}</span>
  </li>
);

/* ---------- Page ---------- */
const CancelMembership = () => {
  const router = useRouter();
  const id = useSearchParams().get("id");

  /* The plan being cancelled — falls back to the first active plan. */
  const entry = HISTORY.find((h) => h.id === id) ?? HISTORY.find((h) => h.status === "Active") ?? HISTORY[0];

  const [reason, setReason] = useState("no-longer-need");
  const [feedback, setFeedback] = useState("");

  return (
    <div className="w-full space-y-4 sm:space-y-5">
      <Breadcrumb
        items={[
          { label: "Billing & Payments", href: "/payment/payment-gateway" },
          { label: "Membership History", href: "/membership/history" },
          { label: "Cancel Membership" },
        ]}
      />

      <div>
        <h2 className="text-lg font-semibold text-heading sm:text-xl 2xl:text-2xl">Cancel Membership</h2>
        <p className="mt-0.5 text-sm text-body">
          We&apos;re sorry to see you go. Please tell us the reason for cancelling your membership.
        </p>
      </div>

      {/* Plan summary */}
      <div className="flex flex-col gap-4 rounded-[14px] border border-border bg-primary/[0.04] dark:bg-primary/20 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="flex min-w-0 items-center gap-4">
          <PlanIcon icon={entry.icon} size="h-16 w-16" iconSize="h-7 w-7" rounded="rounded-full" />
          <div className="min-w-0 space-y-1.5">
            <h3 className="text-base font-semibold text-heading">{entry.name}</h3>
            <Tags text={entry.status} tone={entry.status === "Active" ? "success" : "neutral"} />
            <p className="text-xs text-body sm:text-sm">Complete care and exclusive benefits for regular members.</p>
          </div>
        </div>
        <div className="shrink-0 border-divider sm:border-l sm:pl-5 sm:text-right">
          <p className="text-xl font-bold text-heading">
            ${entry.price}
            <span className="text-sm font-semibold"> / {cycleUnit(entry.cycle)}</span>
          </p>
          <p className="text-xs text-body">Next billing date</p>
          <p className="text-sm font-medium text-heading">{entry.nextBilling}</p>
        </div>
      </div>

      {/* 1. Reason */}
      <StepCard step={1} title="Reason for cancellation" subtitle="Please select a reason to help us improve.">
        <fieldset>
          <legend className="sr-only">Reason for cancellation</legend>
          <div role="radiogroup" aria-label="Reason for cancellation" className="flex flex-col items-start gap-y-3.5">
            {REASONS.map((option) => (
              <label key={option.value} className="flex cursor-pointer items-center gap-2 text-sm text-heading">
                <RadioCheckButtonh
                  type="radio"
                  name="cancel-reason"
                  value={option.value}
                  checked={reason === option.value}
                  onChange={() => setReason(option.value)}
                />
                {option.label}
              </label>
            ))}
          </div>
        </fieldset>
      </StepCard>

      {/* 2. Feedback */}
      <StepCard step={2} title="Additional feedback (optional)" subtitle="Let us know if you have any feedback.">
        <SignupField
          id="cancel-feedback"
          label={<span className="sr-only">Additional feedback</span>}
          placeholder="Write your feedback here..."
          value={feedback}
          onChange={(event) => setFeedback(event.target.value)}
          maxLength={500}
          multiline
          rows={5}
        />
      </StepCard>

      {/* 3. What happens next */}
      <StepCard
        step={3}
        title="What happens next?"
        subtitle="Here’s what to expect after you cancel your membership."
      >
        <ul className="space-y-3 rounded-xl bg-primary/[0.05] p-4">
          <NextItem icon={CalendarDays}>
            Your membership will remain active until the end of your current billing period ({entry.nextBilling}).
          </NextItem>
          <NextItem icon={Ban}>You won&apos;t be charged for the next billing cycle.</NextItem>
          <NextItem icon={Star}>You can reactivate your membership anytime from your account.</NextItem>
        </ul>
      </StepCard>

      {/* Actions */}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <ImportButton text="Go Back" icon={null} onClick={() => router.back()} className="sm:min-w-[160px]" />
        <AddButton
          text="Cancel Membership"
          icon={null}
          onClick={() => {
            // TODO: call your API here (send `reason` + `feedback`)
            console.log("Cancel membership:", { planId: entry.id, reason, feedback: feedback.trim() });
          }}
          /* red variant — if AddButton ignores these classes, give it a `danger` style in the component itself */
          className="!border-danger !bg-danger text-white hover:!bg-danger/90 sm:min-w-[200px]"
        />
      </div>
    </div>
  );
};

export default CancelMembership;
