"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  CalendarCheck,
  CalendarDays,
  ClipboardList,
  Copy,
  FileText,
  FolderOpen,
  Paperclip,
  Video,
  type LucideIcon,
} from "lucide-react";

import AddButton from "@/components/Addbutton";
import ImportButton from "@/components/ImportButton";
import SuccessToast from "@/components/SuccessToast";
import TableStatus from "@/components/TableStatus";
import Tabs from "@/components/Tabs";
import Tags from "@/components/Tags";
import { cardCls } from "@/providers/Shared";

import IntakeReview from "./IntakeReview";
import PatientChart from "./PatientChart";
import ClinicalNotes from "./ClinicalNotes";
import ChartEncounters from "./ChartEncounters";
import ChartDocuments from "./ChartDocuments";

/* ---------------------------------------------------------------- */
/*  Routes                                                           */
/* ---------------------------------------------------------------- */
const BASE = "/review-intake-chart";
const BACK_HREF = "/my-appointments?tab=today";
const START_CONSULTATION_HREF = "/start-consultation"; // TODO: your consultation route

/* ---------------------------------------------------------------- */
/*  Tabs                                                             */
/* ---------------------------------------------------------------- */
export type ChartTab = "intake-review" | "patient-chart" | "clinical-notes" | "encounters" | "documents";

const TABS: { key: ChartTab; label: string; Icon: LucideIcon }[] = [
  { key: "intake-review", label: "Intake Review", Icon: ClipboardList },
  { key: "patient-chart", label: "Patient Chart", Icon: FolderOpen },
  { key: "clinical-notes", label: "Clinical Notes", Icon: FileText },
  { key: "encounters", label: "Encounters", Icon: CalendarDays },
  { key: "documents", label: "Documents", Icon: Paperclip },
];

/* ---------------------------------------------------------------- */
/*  Static data (replace with API data by ?id=)                      */
/* ---------------------------------------------------------------- */
const PATIENT = {
  name: "Emily Carter",
  sex: "F",
  age: "32 years",
  mrn: "KM-002487",
};

const APPOINTMENT = {
  day: "Today, Nov 26, 2026",
  time: "10:00 AM",
  type: "Follow-up Visit",
};

const initialsOf = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0]?.toUpperCase())
    .slice(0, 2)
    .join("");

/* ---------------------------------------------------------------- */
/*  Page                                                             */
/* ---------------------------------------------------------------- */
const ReviewIntakeChart = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const appointmentId = searchParams.get("id");
  const requestedTab = searchParams.get("tab");
  const tab: ChartTab = TABS.some((t) => t.key === requestedTab) ? (requestedTab as ChartTab) : "intake-review";

  const [copied, setCopied] = useState(false);

  const goTab = (key: ChartTab) => {
    router.push(`${BASE}?id=${encodeURIComponent(appointmentId ?? "")}&tab=${key}`, { scroll: false });
  };

  const copyMrn = async () => {
    try {
      await navigator.clipboard.writeText(PATIENT.mrn);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable – nothing to do */
    }
  };

  if (!appointmentId) {
    return (
      <div className="mx-auto w-full max-w-[1600px] space-y-4">
        <div className="rounded-[14px] border border-border bg-card">
          <TableStatus variant="empty" message="No appointment selected. Open one from the Appointments list." />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full min-w-0 max-w-[1600px] space-y-4 sm:space-y-5">
      <SuccessToast
        isOpen={copied}
        onClose={() => setCopied(false)}
        title="MRN copied"
        message="The medical record number has been copied to your clipboard."
      />

      <button
        type="button"
        onClick={() => router.push(BACK_HREF)}
        className="flex cursor-pointer items-center gap-1.5 text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Appointments
      </button>

      {/* Title + actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-heading sm:text-xl 2xl:text-2xl">Review Intake &amp; Patient Chart</h2>
          <p className="mt-0.5 text-sm text-body">
            Review the patient&apos;s intake information, medical history and chart before the consultation.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ImportButton
            text="View Chart"
            icon={<FolderOpen className="h-4 w-4" />}
            onClick={() => goTab("patient-chart")}
            className="whitespace-nowrap"
          />
          <AddButton
            text="Start Consultation"
            icon={<Video className="h-4 w-4" />}
            onClick={() => router.push(`${START_CONSULTATION_HREF}?id=${encodeURIComponent(appointmentId)}`)}
            className="whitespace-nowrap"
          />
        </div>
      </div>

      {/* Patient header */}
      <div className={`${cardCls} !p-3.5 sm:!p-5`}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
            <div className="flex min-w-0 items-center gap-3 sm:gap-4">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-base font-semibold text-primary sm:h-16 sm:w-16 sm:text-lg">
                {initialsOf(PATIENT.name)}
              </span>
              <div className="min-w-0">
                <h3 className="truncate text-base font-semibold text-heading sm:text-xl">{PATIENT.name}</h3>
                <p className="flex flex-wrap items-center gap-x-2 text-xs text-body sm:text-sm">
                  <span>
                    {PATIENT.sex} • {PATIENT.age}
                  </span>
                  <span className="flex items-center gap-1">
                    • MRN: {PATIENT.mrn}
                    <button
                      type="button"
                      aria-label="Copy MRN"
                      onClick={copyMrn}
                      className="flex h-6 w-6 cursor-pointer items-center justify-center rounded text-body transition-colors hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </span>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Tags text="Intake Completed" tone="violet" size="xs" />
              <Tags text="Ready for Review" tone="success" size="xs" />
            </div>
          </div>

          <div className="flex items-center gap-3 border-t border-divider pt-3 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <CalendarCheck className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-heading">{APPOINTMENT.day}</p>
              <p className="text-xs text-body sm:text-sm">
                {APPOINTMENT.time} <span className="mx-1 text-border">|</span> {APPOINTMENT.type}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs ariaLabel="Patient chart sections">
        <div className="flex min-w-max gap-1 sm:gap-3">
          {TABS.map(({ key, label, Icon }) => {
            const active = key === tab;
            return (
              <button
                key={key}
                role="tab"
                type="button"
                aria-selected={active}
                onClick={() => goTab(key)}
                className={`-mb-px flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap border-b-2 px-3 pb-2.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 sm:px-4 sm:pb-3 ${
                  active ? "border-primary font-semibold text-primary" : "border-transparent text-body hover:text-heading"
                }`}
              >
                <Icon className="hidden h-4 w-4 shrink-0 sm:block" />
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </Tabs>

      {/* Active tab */}
      <div role="tabpanel" className="min-w-0">
        {tab === "intake-review" && <IntakeReview />}
        {tab === "patient-chart" && <PatientChart onNavigate={goTab} />}
        {tab === "clinical-notes" && <ClinicalNotes />}
        {tab === "encounters" && <ChartEncounters />}
        {tab === "documents" && <ChartDocuments />}
      </div>
    </div>
  );
};

export default ReviewIntakeChart;