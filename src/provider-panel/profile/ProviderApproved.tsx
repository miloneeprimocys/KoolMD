"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BadgeCheck,
  CalendarCheck,
  CalendarDays,
  CheckCircle2,
  Search,
  Settings,
  Users,
  Video,
  type LucideIcon,
} from "lucide-react";

import AddButton from "@/components/Addbutton";
import VerticalSteps from "@/components/Verticalsteps";
import { cardCls } from "@/providers/Shared";

/* Update these to your real routes */
const DASHBOARD_ROUTE = "/dashboard";
const AVAILABILITY_ROUTE = "/availability";
const TELEMEDICINE_ROUTE = "/provider/profile/locations";
const APPOINTMENTS_ROUTE = "/my-appointments?tab=today";
const PROFILE_ROUTE = "/provider/profile";

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

const STEPS = [
  { id: 1, title: "Profile & Registration", subtitle: "Basic and professional details" },
  { id: 2, title: "Licenses & Credentials", subtitle: "State licenses, NPI/DEA" },
  { id: 3, title: "Locations & Telemedicine", subtitle: "Practice locations and jurisdictions" },
  { id: 4, title: "Documents", subtitle: "Upload credentials and certificates" },
  { id: 5, title: "Review & Submit", subtitle: "Verify information and submit" },
];

const MILESTONES: { Icon: LucideIcon; label: string; date: string; highlight?: boolean }[] = [
  { Icon: CalendarCheck, label: "Application Submitted", date: "Oct 12, 2026" },
  { Icon: Search, label: "Reviewed By Admin", date: "Oct 13, 2026" },
  { Icon: CheckCircle2, label: "Approved", date: "Oct 14, 2026", highlight: true },
];

const WHATS_NEXT: { Icon: LucideIcon; title: string; text: string; href: string }[] = [
  { Icon: CalendarDays, title: "Set Your Availability", text: "Add consultation hours and manage your schedule.", href: AVAILABILITY_ROUTE },
  { Icon: Video, title: "Configure Telemedicine", text: "Set up your virtual care preferences and visit types.", href: TELEMEDICINE_ROUTE },
  { Icon: Users, title: "Start Seeing Patients", text: "Accept appointments and conduct consultations.", href: APPOINTMENTS_ROUTE },
  { Icon: Settings, title: "Manage Your Profile", text: "Update your information, locations and settings anytime.", href: PROFILE_ROUTE },
];

/* Confetti around the seal (purely decorative) */
const CONFETTI = [
  { cls: "left-2 top-4 h-3 w-1.5 rotate-45 bg-violet", },
  { cls: "left-10 top-0 h-1.5 w-3 -rotate-12 bg-success" },
  { cls: "right-3 top-3 h-3 w-1.5 -rotate-45 bg-danger" },
  { cls: "right-10 top-8 h-1.5 w-3 rotate-12 bg-warning" },
  { cls: "left-0 bottom-8 h-1.5 w-3 rotate-12 bg-danger" },
  { cls: "right-0 bottom-6 h-3 w-1.5 rotate-45 bg-primary" },
];

const initialsOf = (name: string) =>
  name
    .replace(/^Dr\.\s*/i, "")
    .split(" ")
    .map((n) => n[0]?.toUpperCase())
    .slice(0, 2)
    .join("");

/* ---------------------------------------------------------------- */
/*  Page: application approved                                       */
/* ---------------------------------------------------------------- */
const ProviderApproved = () => {
  const router = useRouter();

  return (
    <div className="mx-auto w-full max-w-[1600px]">
      <div className="grid min-w-0 grid-cols-1 overflow-clip rounded-[14px] border border-border bg-card xl:grid-cols-[280px_minmax(0,1fr)] 2xl:grid-cols-[320px_minmax(0,1fr)]">
        {/* ---------- Left rail (all steps complete) ---------- */}
        <aside className="min-w-0 bg-card xl:border-r xl:border-divider">
          <VerticalSteps
            steps={STEPS}
            current={STEPS.length + 1}
            onStepClick={() => {
              /* the application is approved – steps are read-only */
            }}
            className="border-b border-divider xl:border-b-0"
          />
        </aside>

        {/* ---------- Content ---------- */}
        <main className="min-w-0 space-y-6 p-4 sm:space-y-8 sm:p-8">
          {/* Hero */}
          <section className="text-center">
            <div className="relative mx-auto h-28 w-40" aria-hidden="true">
              {CONFETTI.map((c, i) => (
                <span key={i} className={`absolute rounded-[1px] ${c.cls}`} />
              ))}
              <BadgeCheck className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 fill-success text-white" strokeWidth={1.5} />
            </div>

            <h1 className="mt-3 text-2xl font-bold tracking-tight text-heading sm:text-3xl">Administrative Approval Received!</h1>
            <p className="mx-auto mt-2 max-w-2xl text-sm text-body sm:text-base">
              Your provider application has been reviewed and approved. Your account is now active on KOOLMD and you can start managing patients and
              appointments.
            </p>

            <span className="mt-5 inline-flex items-center gap-2 rounded-full bg-success/15 px-6 py-2.5 text-sm font-semibold text-success">
              <CheckCircle2 className="h-4 w-4" />
              Approved
            </span>
          </section>

          {/* Provider + milestones */}
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

              <ul className="space-y-1.5 border-t border-divider pt-4 lg:flex-1 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
                {MILESTONES.map(({ Icon, label, date, highlight }) => (
                  <li
                    key={label}
                    className={`flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm ${
                      highlight ? "bg-success/10 font-semibold text-success" : "text-heading"
                    }`}
                  >
                    <span className="flex min-w-0 items-center gap-2.5">
                      <Icon className={`h-4 w-4 shrink-0 ${highlight ? "text-success" : "text-primary"}`} />
                      <span className="truncate">{label}</span>
                    </span>
                    <span className={`shrink-0 text-xs sm:text-sm ${highlight ? "" : "text-body"}`}>{date}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* CTA */}
          <div className="flex justify-center">
            <AddButton
              text="Go to Provider Dashboard"
              icon={<ArrowRight className="h-4 w-4" />}
              onClick={() => router.push(DASHBOARD_ROUTE)}
              className="whitespace-nowrap px-8"
            />
          </div>

          {/* What's next */}
          <section>
            <h2 className="text-lg font-bold text-heading">What&apos;s Next?</h2>
            <p className="mb-3 mt-0.5 text-sm text-body">Your account is ready to use. Here are a few things you can do now:</p>
            <ul className="grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
              {WHATS_NEXT.map(({ Icon, title, text, href }) => (
                <li key={title}>
                  <button
                    type="button"
                    onClick={() => router.push(href)}
                    className={`${cardCls} flex h-full w-full cursor-pointer flex-col items-start gap-1 !p-3.5 text-left transition-colors hover:border-primary/40 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 sm:!p-4`}
                  >
                    <Icon className="h-5 w-5 text-primary" />
                    <span className="mt-1 text-sm font-semibold text-heading">{title}</span>
                    <span className="text-xs text-body sm:text-sm">{text}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </main>
      </div>
    </div>
  );
};

export default ProviderApproved;