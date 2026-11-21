"use client";

import React from "react";
import { CalendarCheck, Check, ClipboardList, Clock, Info, Mail, Search, ShieldCheck, UserPlus, type LucideIcon } from "lucide-react";

import VerticalSteps from "@/components/Verticalsteps";
import { cardCls } from "@/providers/Shared";

/* ---------------------------------------------------------------- */
/*  Static data (replace with API data)                              */
/* ---------------------------------------------------------------- */
const PROVIDER = {
  name: "Dr. Sarah Miller",
  type: "Physician",
  specialty: "Internal Medicine",
  npi: "1234567890",
  dea: "BM1234567",
  photo: "" as string, // URL of the provider photo, if any
};

const APPLICATION = {
  submitted: "Oct 12, 2026",
  reviewSince: "Oct 13, 2026",
  estimate: "1–3 business days",
};

/* All onboarding steps are finished once the application is submitted. */
const STEPS = [
  { id: 1, title: "Profile & Registration", subtitle: "Basic and professional details" },
  { id: 2, title: "Licenses & Credentials", subtitle: "State licenses, NPI/DEA" },
  { id: 3, title: "Locations & Telemedicine", subtitle: "Practice locations and jurisdictions" },
  { id: 4, title: "Documents", subtitle: "Upload credentials and certificates" },
  { id: 5, title: "Review & Submit", subtitle: "Verify information and submit" },
];

const NEXT_STEPS: { Icon: LucideIcon; title: string; text: string }[] = [
  { Icon: ShieldCheck, title: "Credential Verification", text: "Our team verifies your licenses, certifications and documents." },
  { Icon: Mail, title: "Notification", text: "You'll receive an email with the approval status or next steps." },
  { Icon: UserPlus, title: "Get Started", text: "Once approved, you can set your availability and start seeing patients." },
];

type TimelineState = "done" | "current" | "pending";
const TIMELINE: { label: string; sub: string; state: TimelineState }[] = [
  { label: "Application Submitted", sub: APPLICATION.submitted, state: "done" },
  { label: "Under Administrative Review", sub: `Since ${APPLICATION.reviewSince}`, state: "current" },
  { label: "Approval", sub: "Pending", state: "pending" },
];

const initialsOf = (name: string) =>
  name
    .replace(/^Dr\.\s*/i, "")
    .split(" ")
    .map((n) => n[0]?.toUpperCase())
    .slice(0, 2)
    .join("");

/* ---------------------------------------------------------------- */
/*  Timeline marker                                                  */
/* ---------------------------------------------------------------- */
const Marker = ({ state }: { state: TimelineState }) => {
  if (state === "done") {
    return (
      <span className="relative z-10 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-on-primary">
        <Check className="h-4 w-4" />
      </span>
    );
  }
  if (state === "current") {
    return (
      <span className="relative z-10 flex h-7 w-7 items-center justify-center rounded-full border-2 border-primary bg-card ring-4 ring-primary/15">
        <span className="h-3 w-3 rounded-full bg-primary" />
      </span>
    );
  }
  return <span className="relative z-10 flex h-7 w-7 shrink-0 rounded-full border-2 border-border bg-card" />;
};

/* ---------------------------------------------------------------- */
/*  Page: application under administrative review                    */
/* ---------------------------------------------------------------- */
const ProviderUnderReview = () => (
  <div className="mx-auto w-full max-w-[1600px]">
    <div className="grid min-w-0 grid-cols-1 overflow-clip rounded-[14px] border border-border bg-card xl:grid-cols-[280px_minmax(0,1fr)] 2xl:grid-cols-[320px_minmax(0,1fr)]">
      {/* ---------- Left rail (all steps complete) ---------- */}
      <aside className="min-w-0 bg-card xl:border-r xl:border-divider">
        <VerticalSteps
          steps={STEPS}
          current={STEPS.length + 1}
          onStepClick={() => {
            /* the application is submitted – steps are read-only */
          }}
          className="border-b border-divider xl:border-b-0"
        />
      </aside>

      {/* ---------- Content ---------- */}
      <main className="min-w-0 space-y-6 p-4 sm:space-y-8 sm:p-8">
        {/* Hero */}
        <section className="text-center">
          <div className="relative mx-auto flex h-28 w-36 items-center justify-center" aria-hidden="true">
            <span className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/15 to-violet/25 blur-xl" />
            <span className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-card text-primary shadow-lg ring-1 ring-primary/20">
              <ClipboardList className="h-10 w-10" />
            </span>
            <span className="absolute bottom-1 right-4 flex h-11 w-11 items-center justify-center rounded-full bg-primary text-on-primary shadow-lg">
              <Search className="h-5 w-5" />
            </span>
          </div>

          <h1 className="mt-4 text-2xl font-bold tracking-tight text-heading sm:text-3xl">
            Your Application is Under Administrative Review
          </h1>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-body sm:text-base">
            Thank you for submitting your provider application. Our credentialing team is currently reviewing your information and documents.
          </p>

          <span className="mt-5 inline-flex items-center gap-2 rounded-full bg-warning/15 px-6 py-2.5 text-sm font-semibold text-warning">
            <Clock className="h-4 w-4" />
            Under Review
          </span>
        </section>

        {/* Progress timeline */}
        <section className={`${cardCls} sm:p-6`} aria-label="Application progress">
          <ol className="space-y-4 sm:grid sm:grid-cols-3 sm:space-y-0">
            {TIMELINE.map((t, i) => (
              <li key={t.label} className="relative flex min-w-0 items-start gap-3 sm:flex-col sm:items-center sm:gap-0 sm:text-center">
                {/* connector to the next marker */}
                {i < TIMELINE.length - 1 && (
                  <span
                    aria-hidden="true"
                    className={`absolute left-3.5 top-7 -bottom-[30px] w-0.5 sm:bottom-auto sm:left-1/2 sm:top-3.5 sm:h-0.5 sm:w-full ${
                      t.state === "done" ? "bg-primary" : "bg-divider"
                    }`}
                  />
                )}
                <span className="relative z-10 shrink-0">
                  <Marker state={t.state} />
                </span>
                <span className="min-w-0 flex-1 text-left sm:flex-none sm:text-center">
                  <span
                    className={`block rounded-lg px-2 py-1 text-xs font-semibold sm:mt-3 sm:text-sm ${
                      t.state === "current" ? "bg-primary/10 text-primary" : "text-heading"
                    }`}
                  >
                    {t.label}
                  </span>
                  <span className="mt-0.5 block text-[11px] text-body sm:text-xs">{t.sub}</span>
                </span>
              </li>
            ))}
          </ol>
        </section>

        {/* Provider summary */}
        <section className={`${cardCls} sm:p-5`}>
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
            <div className="flex min-w-0 items-center gap-4 lg:flex-1">
              <span className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-border bg-shape-sky/40 text-xl font-semibold text-primary">
                {PROVIDER.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={PROVIDER.photo} alt={PROVIDER.name} className="h-full w-full object-cover" />
                ) : (
                  initialsOf(PROVIDER.name)
                )}
              </span>
              <div className="min-w-0 space-y-1">
                <p className="text-base font-semibold text-heading">{PROVIDER.name}</p>
                <p className="text-xs text-body sm:text-sm">
                  {PROVIDER.type} <span className="mx-1.5 text-border">|</span> {PROVIDER.specialty}
                </p>
                <p className="text-xs font-medium text-heading sm:text-sm">
                  NPI: {PROVIDER.npi} <span className="mx-1.5 text-border">|</span> DEA: {PROVIDER.dea}
                </p>
              </div>
            </div>

            <div className="space-y-3 border-t border-divider pt-4 lg:flex-1 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
              <div className="flex items-start gap-3">
                <CalendarCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <div>
                  <p className="text-sm font-semibold text-heading">Estimated Review Time</p>
                  <p className="text-xs text-body sm:text-sm">{APPLICATION.estimate}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <div>
                  <p className="text-sm font-semibold text-heading">We&apos;ll Notify You</p>
                  <p className="text-xs text-body sm:text-sm">
                    You&apos;ll receive an email once your application is approved or if any additional information is needed.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* What happens next */}
        <section>
          <h2 className="mb-3 text-lg font-bold text-heading">What Happens Next?</h2>
          <ul className="grid gap-3 sm:gap-4 2xl:grid-cols-3">
            {NEXT_STEPS.map(({ Icon, title, text }) => (
              <li key={title} className={`${cardCls} flex gap-3 !p-3.5 sm:!p-4`}>
                <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-heading">{title}</p>
                  <p className="mt-0.5 text-xs text-body sm:text-sm">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  </div>
);

export default ProviderUnderReview;