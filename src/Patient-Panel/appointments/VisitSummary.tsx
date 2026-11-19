"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  CalendarPlus,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Clock,
  FileText,
  FlaskConical,
  Heart,
  MessageSquare,
  Pill,
  Stethoscope,
  Star,
  Video,
  Zap,
  type LucideIcon,
} from "lucide-react";

import AddButton from "@/components/Addbutton";
import ImportButton from "@/components/ImportButton";
import Tags from "@/components/Tags";
import { cardCls } from "@/providers/Shared";

/* ---------------------------------------------------------------- */
/*  Static data (replace with API / redux selector)                  */
/* ---------------------------------------------------------------- */
type Visit = {
  doctor: string;
  specialty: string;
  rating: string;
  reviews: number;
  date: string;
  time: string;
  type: string;
  reason: string;
  diagnosis: string;
  notes: string[];
  care: string[];
  prescriptions: number;
  results: number;
};

const VISITS: Record<string, Visit> = {
  "PV-1008": {
    doctor: "Dr. John Carter", specialty: "Internal Medicine", rating: "4.9", reviews: 320,
    date: "Mon, Sep 28, 2026", time: "10:00 AM – 10:30 AM (30 min)", type: "Video Consultation",
    reason: "Persistent cough and congestion",
    diagnosis: "Upper respiratory tract infection (common cold)",
    notes: [
      "Symptoms consistent with a mild respiratory infection.",
      "Lungs clear, no signs of pneumonia.",
      "Recommended rest, hydration and prescribed medications.",
    ],
    care: [
      "Take medications as prescribed.",
      "Monitor symptoms for the next 5–7 days.",
      "Stay well-hydrated and get adequate rest.",
      "Avoid cold exposure and maintain a healthy diet.",
      "Use steam inhalation or a humidifier if needed.",
      "Follow up if symptoms persist or worsen.",
    ],
    prescriptions: 2,
    results: 3,
  },
  "PV-1007": {
    doctor: "Dr. Sarah Miller", specialty: "Dermatology", rating: "4.8", reviews: 210,
    date: "Wed, Aug 20, 2026", time: "3:00 PM – 3:30 PM (30 min)", type: "Video Consultation",
    reason: "Skin rash and itching",
    diagnosis: "Contact dermatitis",
    notes: ["Mild redness on both forearms.", "No signs of infection.", "Advised to avoid the suspected irritant."],
    care: ["Apply the prescribed cream twice daily.", "Avoid scratching the affected area.", "Use fragrance-free soap.", "Follow up if the rash spreads."],
    prescriptions: 1,
    results: 1,
  },
};

const BASE = "/my-appointments";

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
const CardTitle = ({ Icon, children }: { Icon: LucideIcon; children: React.ReactNode }) => (
  <h3 className="mb-3 flex items-center gap-2.5 text-base font-semibold text-heading">
    <Icon className="h-5 w-5 shrink-0 text-primary" />
    {children}
  </h3>
);

/* ---------------------------------------------------------------- */
/*  Page                                                             */
/* ---------------------------------------------------------------- */
const VisitSummary = () => {
  const router = useRouter();
  const id = useSearchParams().get("id") ?? "PV-1008";
  const visit = VISITS[id] ?? VISITS["PV-1008"];
  const visitId = VISITS[id] ? id : "PV-1008";

  const documents: { label: string; hint: string; Icon: LucideIcon; href: string }[] = [
    { label: `Prescriptions (${visit.prescriptions})`, hint: "Medications prescribed during this visit", Icon: Pill, href: `${BASE}/visit-prescriptions?id=${visitId}` },
    { label: `Results (${visit.results})`, hint: "Lab and diagnostic results", Icon: FlaskConical, href: `${BASE}/visit-results?id=${visitId}` },
    { label: "Follow-Up", hint: "Recommended follow-up plan", Icon: Calendar, href: `${BASE}/visit-follow-up?id=${visitId}` },
  ];

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-4 sm:space-y-5">
      <button
        type="button"
        onClick={() => router.push(`${BASE}?tab=past`)}
        className="flex cursor-pointer items-center gap-1.5 text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Past Appointments
      </button>

      <div>
        <h2 className="text-lg font-semibold text-heading sm:text-xl 2xl:text-2xl">Visit Summary</h2>
        <p className="mt-0.5 text-sm text-body">A summary of your consultation with {visit.doctor}.</p>
      </div>

      <div className="grid items-start gap-4 sm:gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        {/* ================= LEFT ================= */}
        <div className="min-w-0 space-y-4 sm:space-y-5">
          {/* Doctor + visit */}
          <section className={`${cardCls} grid gap-4 sm:p-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-center`}>
            <div className="flex min-w-0 items-center gap-4">
              <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-lg font-semibold text-primary">
                {initialsOf(visit.doctor)}
              </span>
              <div className="min-w-0">
                <p className="truncate text-base font-semibold text-heading">{visit.doctor}</p>
                <p className="text-sm text-body">{visit.specialty}</p>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-body">
                  <Star className="h-3.5 w-3.5 fill-current text-warning" />
                  <span className="font-semibold text-heading">{visit.rating}</span> ({visit.reviews} reviews)
                </p>
              </div>
            </div>
            <div className="flex items-end justify-between gap-3 md:border-l md:border-divider md:pl-5">
              <div className="space-y-2 text-sm text-heading">
                <p className="flex items-center gap-2.5"><Calendar className="h-4 w-4 shrink-0 text-primary" />{visit.date}</p>
                <p className="flex items-center gap-2.5"><Clock className="h-4 w-4 shrink-0 text-primary" />{visit.time}</p>
                <p className="flex items-center gap-2.5"><Video className="h-4 w-4 shrink-0 text-primary" />{visit.type}</p>
              </div>
              <Tags text="Completed" tone="success" size="xs" />
            </div>
          </section>

          {/* Reason + diagnosis */}
          <div className="grid gap-4 sm:gap-5 sm:grid-cols-2">
            <section className={`${cardCls} sm:p-5`}>
              <CardTitle Icon={Stethoscope}>Reason for Visit</CardTitle>
              <p className="text-sm text-heading">{visit.reason}</p>
            </section>
            <section className={`${cardCls} sm:p-5`}>
              <CardTitle Icon={ClipboardList}>Diagnosis</CardTitle>
              <p className="text-sm text-heading">{visit.diagnosis}</p>
            </section>
          </div>

          {/* Notes */}
          <section className={`${cardCls} sm:p-5`}>
            <CardTitle Icon={FileText}>Consultation Notes</CardTitle>
            <ul className="list-disc space-y-1.5 pl-6 text-sm text-heading marker:text-heading">
              {visit.notes.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          </section>

          {/* Care plan */}
          <section className={`${cardCls} sm:p-5`}>
            <CardTitle Icon={Heart}>Instructions &amp; Care Plan</CardTitle>
            <ul className="grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
              {visit.care.map((c) => (
                <li key={c} className="flex items-start gap-2.5 text-sm text-heading">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  {c}
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* ================= RIGHT ================= */}
        <aside className="min-w-0 space-y-4 sm:space-y-5">
          <section className={`${cardCls} sm:p-5`}>
            <CardTitle Icon={FileText}>Visit Documents</CardTitle>
            <ul className="space-y-2.5">
              {documents.map(({ label, hint, Icon, href }) => (
                <li key={label}>
                  <button
                    type="button"
                    onClick={() => router.push(href)}
                    className="flex w-full cursor-pointer items-center gap-3 rounded-xl bg-primary/5 px-3 py-3 text-left transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-card text-primary">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-heading">{label}</span>
                      <span className="block text-xs text-body">{hint}</span>
                    </span>
                    <ChevronRight className="h-4 w-4 shrink-0 text-heading" />
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <section className={`${cardCls} space-y-3 sm:p-5`}>
            <CardTitle Icon={Zap}>Quick Actions</CardTitle>
            <AddButton
              text="Book Follow-Up"
              icon={<CalendarPlus className="h-4 w-4" />}
              onClick={() => router.push("/find-provider")}
              className="w-full justify-center"
            />
            <ImportButton
              text="Message Provider"
              icon={<MessageSquare className="h-4 w-4" />}
              onClick={() => router.push("/messages")}
              className="w-full justify-center"
            />
          </section>
        </aside>
      </div>
    </div>
  );
};

export default VisitSummary;