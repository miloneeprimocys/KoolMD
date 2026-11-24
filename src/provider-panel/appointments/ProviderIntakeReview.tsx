"use client";

import React, { useState, type ReactNode } from "react";
import {
  Activity,
  ArrowLeft,
  AlertTriangle,
  Check,
  ChevronRight,
  ClipboardList,
  Clock,
  FileText,
  HeartPulse,
  Pill,
  Scale,
  Stethoscope,
  Thermometer,
  User,
  type LucideIcon,
} from "lucide-react";

import Tags from "@/components/Tags";
import { cardCls } from "@/providers/Shared";

import type { ViewTab } from "./ProviderAppointmentView";

/* ---------------------------------------------------------------- */
/*  Static intake data (replace with API data)                       */
/* ---------------------------------------------------------------- */
const INTAKE = {
  complaint: "Persistent headaches for the past 2 weeks.",
  hpi: "Headaches mostly in the afternoon, with mild nausea.",
  medications: "Sumatriptan 50 mg",
  allergies: "None reported",
  conditions: "Migraine",
  pastHistory: "No significant history",
};

const VITALS: { icon: LucideIcon; label: string; value: string }[] = [
  { icon: Activity, label: "BP", value: "118/76 mmHg" },
  { icon: HeartPulse, label: "Heart Rate", value: "72 bpm" },
  { icon: Thermometer, label: "Temperature", value: "98.4 °F" },
  { icon: Scale, label: "Weight", value: "64 kg" },
  { icon: User, label: "BMI", value: "22.1" },
];

const SUMMARY = [
  { icon: Stethoscope, label: "Active Conditions", value: "Migraine" },
  { icon: Pill, label: "Medications", value: "Sumatriptan 50 mg" },
  { icon: AlertTriangle, label: "Allergies", value: "None reported" },
];

const RECENT_ENCOUNTERS = [
  { date: "Oct 20, 2026", type: "Follow-up Visit" },
  { date: "Aug 14, 2026", type: "Initial Consultation" },
];

/* ---------------------------------------------------------------- */
/*  Small building blocks                                            */
/* ---------------------------------------------------------------- */
const IconBox = ({ icon: Icon }: { icon: LucideIcon }) => (
  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
    <Icon className="h-5 w-5" />
  </span>
);

const InfoCard = ({ icon, title, children, onClick }: { icon: LucideIcon; title: string; children: ReactNode; onClick?: () => void }) => {
  const content = (
    <>
      <IconBox icon={icon} />
      <span className="min-w-0 flex-1 text-left">
        <span className="block text-sm font-semibold text-heading">{title}</span>
        <span className="mt-0.5 block text-sm text-body">{children}</span>
      </span>
      {onClick && <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-body" />}
    </>
  );

  return onClick ? (
    <button type="button" onClick={onClick} className="flex min-w-0 w-full cursor-pointer items-start gap-3 rounded-xl border border-border bg-card p-3.5 text-left transition-colors hover:border-primary/50 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30">
      {content}
    </button>
  ) : (
    <div className="flex min-w-0 items-start gap-3 rounded-xl border border-border bg-card p-3.5">{content}</div>
  );
};

const SideBox = ({ icon: Icon, title, children }: { icon: LucideIcon; title: string; children: ReactNode }) => (
  <section className={`${cardCls} min-w-0 space-y-3 !p-3.5 sm:!p-4`}>
    <h3 className="flex items-center gap-2 text-sm font-semibold text-heading">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </span>
      {title}
    </h3>
    {children}
  </section>
);

/* ---------------------------------------------------------------- */
/*  Tab: Intake Review                                               */
/* ---------------------------------------------------------------- */
const ProviderIntakeReview = ({ onNavigate }: { onNavigate: (tab: ViewTab) => void }) => {
  const [showHpi, setShowHpi] = useState(false);

  if (showHpi) {
    return (
      <div className="min-w-0 space-y-4">
        <button type="button" onClick={() => setShowHpi(false)} className="flex cursor-pointer items-center gap-1.5 text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30">
          <ArrowLeft className="h-4 w-4" />
          Back to Intake Options
        </button>
        <section className={`${cardCls} min-w-0 space-y-3 sm:p-5`}>
          <h3 className="flex items-center gap-2 text-base font-semibold text-heading">
            <Clock className="h-5 w-5 text-primary" />
            History of Present Illness
          </h3>
          <p className="whitespace-pre-wrap text-sm leading-6 text-body">{INTAKE.hpi}</p>
        </section>
      </div>
    );
  }

  return (
  <div className="grid min-w-0 items-start gap-4 sm:gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
    {/* ---------- Intake ---------- */}
    <section className={`${cardCls} min-w-0 space-y-4 sm:p-5`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-heading">Patient-Submitted Intake</h3>
        <Tags text="Completed" tone="success" size="xs" icon={<Check className="h-3 w-3" />} />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <InfoCard icon={ClipboardList} title="Chief Complaint">
          {INTAKE.complaint}
        </InfoCard>
        <InfoCard icon={Clock} title="History of Present Illness" onClick={() => setShowHpi(true)}>
          {INTAKE.hpi}
        </InfoCard>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-4">
        <InfoCard icon={HeartPulse} title="Current Medications">
          {INTAKE.medications}
        </InfoCard>
        <InfoCard icon={AlertTriangle} title="Allergies">
          {INTAKE.allergies}
        </InfoCard>
        <InfoCard icon={Stethoscope} title="Medical Conditions">
          {INTAKE.conditions}
        </InfoCard>
        <InfoCard icon={FileText} title="Past Medical History">
          {INTAKE.pastHistory}
        </InfoCard>
      </div>

      <div className="space-y-3">
        <h4 className="rounded-lg bg-primary/5 px-3 py-2 text-sm font-semibold text-heading dark:bg-primary/10">Vitals (Last Reported)</h4>
        <ul className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-5">
          {VITALS.map(({ icon, label, value }) => (
            <li key={label} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
              <IconBox icon={icon} />
              <div className="min-w-0">
                <p className="text-xs text-body">{label}</p>
                <p className="truncate text-sm font-semibold text-heading">{value}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>

    {/* ---------- Summary ---------- */}
    <aside className="min-w-0 space-y-4 sm:space-y-5">
      <SideBox icon={User} title="Patient Summary">
        <dl className="divide-y divide-divider">
          {SUMMARY.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center justify-between gap-3 py-2.5 text-sm first:pt-0 last:pb-0">
              <dt className="flex items-center gap-2 font-semibold text-heading">
                <Icon className="h-4 w-4 text-primary" />
                {label}
              </dt>
              <dd className="text-right text-body">{value}</dd>
            </div>
          ))}
        </dl>
      </SideBox>

      <SideBox icon={Clock} title="Recent Encounters">
        <ul className="divide-y divide-divider">
          {RECENT_ENCOUNTERS.map((e) => (
            <li key={e.date}>
              <button
                type="button"
                onClick={() => onNavigate("encounters")}
                className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-2 py-2.5 text-left transition-colors hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
              >
                <span className="flex-1 text-sm font-semibold text-heading">{e.date}</span>
                <span className="text-sm text-body">{e.type}</span>
                <ChevronRight className="h-4 w-4 shrink-0 text-body" />
              </button>
            </li>
          ))}
        </ul>
      </SideBox>
    </aside>
  </div>
  );
};

export default ProviderIntakeReview;
