"use client";

import React, { useState, type ReactNode } from "react";
import {
  AlertTriangle,
  Activity,
  ChevronDown,
  Clock,
  FileText,
  Gauge,
  HeartPulse,
  Pill,
  Stethoscope,
  Users,
  Wine,
  Ban,
  Dumbbell,
  type LucideIcon,
} from "lucide-react";

import { cardCls } from "@/providers/Shared";

/* ---------------------------------------------------------------- */
/*  Static intake answers (replace with API data)                    */
/* ---------------------------------------------------------------- */
const INTAKE = {
  reason: "Persistent headaches for the past 2 weeks and increased fatigue.",
  hpi: "Headaches are mostly in the afternoon, with mild nausea at times. No vomiting, vision changes or recent head injury.",
  symptoms: ["Headache (moderate, recurring)", "Fatigue", "Mild nausea"],
  duration: "2 weeks",
  severity: "Moderate (5/10)",
  medications: ["Multivitamin – 1 tab daily"],
  allergies: [] as string[],
  history: ["Migraines (2021)", "Seasonal Allergies"],
  family: ["Hypertension (Mother)", "Diabetes (Father)"],
  lifestyle: [
    { icon: Ban, text: "Non-smoker" },
    { icon: Wine, text: "Occasional alcohol" },
    { icon: Dumbbell, text: "Exercises 2–3 times/week" },
  ],
  vitals: [
    { label: "Blood Pressure", value: "Not provided" },
    { label: "Heart Rate", value: "Not provided" },
    { label: "Temperature", value: "Not provided" },
    { label: "Weight", value: "Not provided" },
  ],
};

/* ---------------------------------------------------------------- */
/*  Small building blocks                                            */
/* ---------------------------------------------------------------- */
const Block = ({ icon: Icon, title, children }: { icon: LucideIcon; title: string; children: ReactNode }) => (
  <section className={`${cardCls} min-w-0 space-y-2.5 !p-3.5 sm:!p-4`}>
    <h3 className="flex items-center gap-2 text-sm font-semibold text-heading">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </span>
      {title}
    </h3>
    {children}
  </section>
);

const Pill_ = ({ children }: { children: ReactNode }) => (
  <li className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">{children}</li>
);

/* ---------------------------------------------------------------- */
/*  Tab: Intake Review                                               */
/* ---------------------------------------------------------------- */
const IntakeReview = () => {
  const [vitalsOpen, setVitalsOpen] = useState(false);

  return (
    <div className="space-y-3 sm:space-y-4">
      <Block icon={FileText} title="Reason for Visit">
        <p className="text-sm text-body">{INTAKE.reason}</p>
      </Block>

      <Block icon={Stethoscope} title="History of Present Illness">
        <p className="text-sm text-body">{INTAKE.hpi}</p>
      </Block>

      <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
        <Block icon={Activity} title="Symptoms">
          <ul className="list-disc space-y-1 pl-5 text-sm text-body marker:text-primary">
            {INTAKE.symptoms.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </Block>

        <div className="grid gap-3 sm:gap-4">
          <Block icon={Clock} title="Duration">
            <p className="text-sm font-medium text-heading">{INTAKE.duration}</p>
          </Block>
          <Block icon={Gauge} title="Severity">
            <p className="text-sm font-medium text-heading">{INTAKE.severity}</p>
          </Block>
        </div>

        <Block icon={Pill} title="Current Medications">
          <ul className="list-disc space-y-1 pl-5 text-sm text-body marker:text-primary">
            {INTAKE.medications.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </Block>

        <Block icon={AlertTriangle} title="Allergies">
          <p className="text-sm text-body">{INTAKE.allergies.length ? INTAKE.allergies.join(", ") : "No known allergies"}</p>
        </Block>

        <Block icon={HeartPulse} title="Medical History">
          <ul className="flex flex-wrap gap-2">
            {INTAKE.history.map((h) => (
              <Pill_ key={h}>{h}</Pill_>
            ))}
          </ul>
        </Block>

        <Block icon={Users} title="Family History">
          <ul className="flex flex-wrap gap-2">
            {INTAKE.family.map((f) => (
              <Pill_ key={f}>{f}</Pill_>
            ))}
          </ul>
        </Block>
      </div>

      <Block icon={Activity} title="Lifestyle & Social History">
        <ul className="flex flex-wrap gap-x-8 gap-y-2">
          {INTAKE.lifestyle.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-2 text-sm text-body">
              <Icon className="h-4 w-4 text-primary" />
              {text}
            </li>
          ))}
        </ul>
      </Block>

      {/* Collapsible vitals */}
      <section className={`${cardCls} !p-0`}>
        <button
          type="button"
          aria-expanded={vitalsOpen}
          onClick={() => setVitalsOpen((o) => !o)}
          className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-2xl p-3.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 sm:p-4"
        >
          <span className="flex items-center gap-2 text-sm font-semibold text-heading">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <HeartPulse className="h-4 w-4" />
            </span>
            Patient-Reported Vitals (If Provided)
          </span>
          <ChevronDown className={`h-4 w-4 shrink-0 text-body transition-transform ${vitalsOpen ? "rotate-180" : ""}`} />
        </button>
        {vitalsOpen && (
          <dl className="grid gap-3 border-t border-divider p-3.5 sm:grid-cols-2 sm:p-4 xl:grid-cols-4">
            {INTAKE.vitals.map((v) => (
              <div key={v.label}>
                <dt className="text-xs text-body">{v.label}</dt>
                <dd className="mt-0.5 text-sm font-medium text-heading">{v.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </section>
    </div>
  );
};

export default IntakeReview;