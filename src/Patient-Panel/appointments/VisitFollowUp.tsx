
"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  CalendarPlus,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Clock,
  FlaskConical,
  HeartPulse,
  ListChecks,
  Pill,
  RefreshCw,
  Video,
  XCircle,
  type LucideIcon,
} from "lucide-react";

import AddButton from "@/components/Addbutton";
import ImportButton from "@/components/ImportButton";
import DeleteButton from "@/components/DeleteButton";
import DeleteDialog from "@/components/Deletedialog";
import Tags from "@/components/Tags";
import { cardCls } from "@/providers/Shared";

/* ---------------------------------------------------------------- */
/*  Routes (create a page.tsx for each)                              */
/* ---------------------------------------------------------------- */
const BASE = "/my-appointments";
const SUMMARY_ROUTE = `${BASE}/visit-summary`;
const PRESCRIPTIONS_ROUTE = `${BASE}/visit-prescriptions`;
const RESULTS_ROUTE = `${BASE}/visit-results`;
const FOLLOW_UP_ROUTE = `${BASE}/visit-follow-up`;
const BOOK_ROUTE = "/find-provider";

/* ---------------------------------------------------------------- */
/*  Static data (replace with API / redux selector)                  */
/* ---------------------------------------------------------------- */
const VISITS: Record<string, { doctor: string; specialty: string; date: string; type: string; prescriptions: number; results: number }> = {
  "PV-1008": { doctor: "Dr. John Carter", specialty: "Internal Medicine", date: "Mon, Sep 28, 2026", type: "Video Consultation", prescriptions: 2, results: 3 },
  "PV-1007": { doctor: "Dr. Sarah Miller", specialty: "Dermatology", date: "Wed, Aug 20, 2026", type: "Video Consultation", prescriptions: 1, results: 1 },
};

type FollowUp = {
  id: "upcoming" | "previous";
  title: string;
  date: string;
  time?: string;
};

const FOLLOW_UPS: FollowUp[] = [
  { id: "upcoming", title: "Upcoming Follow-Up", date: "Mon, Oct 12, 2026", time: "10:00 AM – 10:30 AM" },
  { id: "previous", title: "Previous Follow-Ups (1)", date: "Mon, Aug 20, 2026" },
];

const PLAN = {
  recommendation: "Schedule a follow-up in 2 weeks to review your recovery and response to medication.",
  recommendedDate: "Mon, Oct 12, 2026",
  visitType: "Video Consultation",
  reason: "Review & Progress",
  notes: [
    "Continue prescribed medications as advised.",
    "Monitor your symptoms and note any changes.",
    "Bring updated test results, if any.",
  ],
};

const PREVIOUS = {
  summary: "Routine review of recovery after the previous consultation.",
  outcome: "Symptoms resolved. No further treatment required.",
  notes: ["Medication course completed.", "No side effects reported.", "Advised to return if symptoms recur."],
};

const initialsOf = (name: string) =>
  name
    .replace(/^Dr\.\s*/i, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

/* ---------------------------------------------------------------- */
/*  Small pieces                                                     */
/* ---------------------------------------------------------------- */
const InfoCell = ({ Icon, label, value, highlight }: { Icon: LucideIcon; label: string; value: string; highlight?: boolean }) => (
  <div className="flex min-w-0 items-center gap-3">
    <Icon className="h-5 w-5 shrink-0 text-primary" />
    <div className="min-w-0">
      <p className="text-[11px] text-body">{label}</p>
      <p className={`text-sm ${highlight ? "font-semibold text-primary" : "font-medium text-heading"}`}>{value}</p>
    </div>
  </div>
);

/* ---------------------------------------------------------------- */
/*  Page                                                             */
/* ---------------------------------------------------------------- */
const VisitFollowUp = () => {
  const router = useRouter();
  const requestedId = useSearchParams().get("id") ?? "PV-1008";
  const visitId = VISITS[requestedId] ? requestedId : "PV-1008";
  const visit = VISITS[visitId];

  const [activeId, setActiveId] = useState<FollowUp["id"]>("upcoming");
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelled, setCancelled] = useState(false);

  const tabs = [
    { key: "prescriptions", label: `Prescriptions (${visit.prescriptions})`, Icon: Pill, href: PRESCRIPTIONS_ROUTE },
    { key: "results", label: `Results (${visit.results})`, Icon: FlaskConical, href: RESULTS_ROUTE },
    { key: "follow-up", label: "Follow-Up", Icon: Calendar, href: FOLLOW_UP_ROUTE },
  ];

  const handleCancel = async () => {
    if (cancelling) return;
    setCancelling(true);
    try {
      // TODO: call your API here to cancel the follow-up appointment
      await new Promise((resolve) => setTimeout(resolve, 600));
      setCancelled(true);
      setCancelOpen(false);
    } catch (error) {
      console.error(error);
    } finally {
      setCancelling(false);
    }
  };

  const upcoming = FOLLOW_UPS[0];

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-4 sm:space-y-5">
      <button
        type="button"
        onClick={() => router.push(`${SUMMARY_ROUTE}?id=${visitId}`)}
        className="flex cursor-pointer items-center gap-1.5 text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Visit Summary
      </button>

      <div>
        <h2 className="text-lg font-semibold text-heading sm:text-xl 2xl:text-2xl">Follow-Up</h2>
        <p className="mt-0.5 text-sm text-body">Manage your follow-up plan and upcoming appointments for this consultation.</p>
      </div>

      {/* Doctor + visit */}
      <section className={`${cardCls} flex flex-col gap-4 sm:p-5 md:flex-row md:items-center`}>
        <div className="flex min-w-0 items-center gap-4 md:w-[320px] md:shrink-0">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-base font-semibold text-primary">
            {initialsOf(visit.doctor)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-base font-semibold text-heading">{visit.doctor}</p>
            <p className="text-sm text-body">{visit.specialty}</p>
          </div>
        </div>
        <div className="flex flex-1 items-center justify-between gap-3 md:border-l md:border-divider md:pl-6">
          <div className="space-y-2 text-sm text-heading">
            <p className="flex items-center gap-2.5"><Calendar className="h-4 w-4 shrink-0 text-primary" />{visit.date}</p>
            <p className="flex items-center gap-2.5"><Video className="h-4 w-4 shrink-0 text-primary" />{visit.type}</p>
          </div>
          <Tags text="Completed" tone="success" size="xs" />
        </div>
      </section>

      {/* Tabs */}
      <div role="tablist" aria-label="Visit documents" className="grid grid-cols-3 gap-1 rounded-2xl border border-border bg-card p-1.5">
        {tabs.map(({ key, label, Icon, href }) => {
          const isActive = key === "follow-up";
          return (
            <button
              key={key}
              role="tab"
              type="button"
              aria-selected={isActive}
              onClick={() => !isActive && router.push(`${href}?id=${visitId}`)}
              className={`flex min-w-0 cursor-pointer items-center justify-center gap-2 rounded-xl px-2 py-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 sm:px-4 ${
                isActive ? "bg-primary font-semibold text-on-primary" : "text-heading hover:bg-primary/5"
              }`}
            >
              <Icon className="hidden h-4 w-4 shrink-0 sm:block" />
              <span className="truncate">{label}</span>
            </button>
          );
        })}
      </div>

      <div className="grid items-start gap-4 sm:gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
        {/* ================= LEFT: list ================= */}
        <section className="min-w-0 space-y-3">
          <h3 className="text-base font-semibold text-heading">Follow-Up Appointments</h3>
          <ul className="space-y-2.5">
            {FOLLOW_UPS.map((f) => {
              const isActive = f.id === activeId;
              return (
                <li key={f.id}>
                  <button
                    type="button"
                    onClick={() => setActiveId(f.id)}
                    aria-pressed={isActive}
                    className={`flex w-full cursor-pointer items-center gap-3 rounded-xl border px-3 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${
                      isActive ? "border-primary/30 bg-primary/10" : "border-border bg-card hover:border-primary/30 hover:bg-primary/5"
                    }`}
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Calendar className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-heading">{f.title}</span>
                      <span className="block text-xs text-body">
                        {f.id === "upcoming" && cancelled ? "Cancelled" : f.date}
                        {f.time && !(f.id === "upcoming" && cancelled) && (
                          <>
                            <span className="mx-1.5 text-border">|</span>
                            {f.time}
                          </>
                        )}
                      </span>
                    </span>
                    <ChevronRight className="h-4 w-4 shrink-0 text-heading" />
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        {/* ================= RIGHT: detail ================= */}
        <section className={`${cardCls} min-w-0 space-y-5 sm:p-5`} aria-live="polite">
          {activeId === "upcoming" ? (
            <>
              <h3 className="flex items-center gap-2.5 text-lg font-semibold text-heading">
                <ClipboardList className="h-5 w-5 shrink-0 text-primary" />
                Follow-Up Plan
              </h3>

              <div className="flex items-start gap-3 rounded-xl bg-primary/5 p-4">
                <HeartPulse className="mt-0.5 h-6 w-6 shrink-0 text-primary" />
                <div>
                  <h4 className="text-sm font-semibold text-heading">Doctor&apos;s Recommendation</h4>
                  <p className="mt-0.5 text-sm text-body">{PLAN.recommendation}</p>
                </div>
              </div>

              <div className="grid gap-4 border-b border-divider pb-5 sm:grid-cols-3 sm:gap-0">
                <InfoCell Icon={Calendar} label="Recommended Date" value={cancelled ? "Cancelled" : PLAN.recommendedDate} highlight />
                <div className="sm:border-l sm:border-divider sm:pl-5">
                  <InfoCell Icon={Clock} label="Visit Type" value={PLAN.visitType} />
                </div>
                <div className="sm:border-l sm:border-divider sm:pl-5">
                  <InfoCell Icon={RefreshCw} label="Reason" value={PLAN.reason} />
                </div>
              </div>

              <div>
                <h4 className="mb-2 flex items-center gap-2.5 text-sm font-semibold text-heading">
                  <ListChecks className="h-5 w-5 shrink-0 text-primary" />
                  Notes for Follow-Up
                </h4>
                <ul className="list-disc space-y-1.5 rounded-xl bg-primary/5 py-3 pl-9 pr-4 text-sm text-heading marker:text-heading">
                  {PLAN.notes.map((n) => (
                    <li key={n}>{n}</li>
                  ))}
                </ul>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <AddButton
                  text="Book Follow-Up"
                  icon={<CalendarPlus className="h-4 w-4" />}
                  onClick={() => router.push(`${BOOK_ROUTE}?followUp=${visitId}`)}
                  className="w-full !justify-center whitespace-nowrap"
                />
                <ImportButton
                  text="Reschedule"
                  icon={<RefreshCw className="h-4 w-4" />}
                  onClick={() => router.push(`${BOOK_ROUTE}?reschedule=${visitId}`)}
                  className="w-full !justify-center whitespace-nowrap"
                />
                <ImportButton
                  text="Cancel Appointment"
                  icon={<XCircle className="h-4 w-4" />}
                  onClick={() => setCancelOpen(true)}
                  className="w-full !justify-center whitespace-nowrap"
                />
              </div>
            </>
          ) : (
            <>
              <div className="flex items-start justify-between gap-3">
                <h3 className="flex items-center gap-2.5 text-lg font-semibold text-heading">
                  <ClipboardList className="h-5 w-5 shrink-0 text-primary" />
                  Previous Follow-Up
                </h3>
                <Tags text="Completed" tone="success" size="xs" />
              </div>

              <div className="grid gap-4 border-b border-divider pb-5 sm:grid-cols-2 sm:gap-0">
                <InfoCell Icon={Calendar} label="Date" value={FOLLOW_UPS[1].date} highlight />
                <div className="sm:border-l sm:border-divider sm:pl-5">
                  <InfoCell Icon={Video} label="Visit Type" value="Video Consultation" />
                </div>
              </div>

              <div className="rounded-xl bg-primary/5 p-4">
                <h4 className="text-sm font-semibold text-heading">Summary</h4>
                <p className="mt-0.5 text-sm text-body">{PREVIOUS.summary}</p>
                <p className="mt-2 flex items-start gap-2 text-sm text-heading">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                  {PREVIOUS.outcome}
                </p>
              </div>

              <div>
                <h4 className="mb-2 flex items-center gap-2.5 text-sm font-semibold text-heading">
                  <ListChecks className="h-5 w-5 shrink-0 text-primary" />
                  Notes
                </h4>
                <ul className="list-disc space-y-1.5 rounded-xl bg-primary/5 py-3 pl-9 pr-4 text-sm text-heading marker:text-heading">
                  {PREVIOUS.notes.map((n) => (
                    <li key={n}>{n}</li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </section>
      </div>

      {/* ---------- Cancel confirmation (reuses DeleteDialog) ---------- */}
      <DeleteDialog
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        onConfirm={handleCancel}
        loading={cancelling}
        icon={<XCircle className="h-7 w-7" />}
        confirmButton={
          <DeleteButton
            text="Cancel Appointment"
            onClick={handleCancel}
            loading={cancelling}
            loadingText="Cancelling…"
            className="sm:w-auto sm:min-w-[170px]"
          />
        }
        title="Cancel Follow-Up Appointment?"
        description="Are you sure you want to cancel this follow-up appointment? The time slot will be released and your provider will be notified."
        details={[
          { label: "Provider", value: `${visit.doctor} (${visit.specialty})` },
          { label: "Appointment Type", value: PLAN.visitType },
          { label: "Date & Time", value: `${upcoming.date}, ${upcoming.time}` },
          { label: "Reason", value: PLAN.reason },
        ]}
        cancelText="Keep Appointment"
        confirmText="Cancel Appointment"
        loadingText="Cancelling…"
      />
    </div>
  );
};

export default VisitFollowUp;