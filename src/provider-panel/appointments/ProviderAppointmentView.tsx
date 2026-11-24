"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  CalendarCheck,
  CalendarDays,
  CalendarClock,
  ClipboardList,
  FileText,
  FolderOpen,
  Paperclip,
  Video,
  X,
  type LucideIcon,
} from "lucide-react";

import DeleteDialog from "@/components/Deletedialog";
import AddButton from "@/components/Addbutton";
import ImportButton from "@/components/ImportButton";
import SuccessToast from "@/components/SuccessToast";
import TableStatus from "@/components/TableStatus";
import Tabs from "@/components/Tabs";
import Tags from "@/components/Tags";
import { cardCls } from "@/providers/Shared";

import ProviderIntakeReview from "./ProviderIntakeReview";
import ProviderPatientChart from "./ProviderPatientChart";
import ProviderClinicalNotes from "./ProviderClinicalNotes";
import ProviderEncounters from "./ProviderEncounters";
import ProviderDocuments from "./ProviderDocuments";

/* ---------------------------------------------------------------- */
/*  Routes                                                           */
/* ---------------------------------------------------------------- */
const BASE = "/provider/appointments/view";
const START_CONSULTATION_HREF = "/provider/appointments/consultation";
const RESCHEDULE_HREF = "/reschedule-appointment"; // TODO: your reschedule route

/* ---------------------------------------------------------------- */
/*  Tabs                                                             */
/* ---------------------------------------------------------------- */
export type ViewTab = "intake-review" | "patient-chart" | "clinical-notes" | "encounters" | "documents";

const TABS: { key: ViewTab; label: string; Icon: LucideIcon }[] = [
  { key: "intake-review", label: "Intake Review", Icon: ClipboardList },
  { key: "patient-chart", label: "Patient Chart", Icon: CalendarDays },
  { key: "clinical-notes", label: "Clinical Notes", Icon: FileText },
  { key: "encounters", label: "Encounters", Icon: CalendarCheck },
  { key: "documents", label: "Documents", Icon: Paperclip },
];

/* Static data (replace with API data by ?id=) */
const PATIENT = { name: "Emily Carter", sex: "Female", age: "32 years", mrn: "KM-002487" };
const APPOINTMENT = { date: "Nov 26, 2026", time: "10:00 AM (30 min)", type: "Follow-up Visit", reason: "Headache Management" };

const initialsOf = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0]?.toUpperCase())
    .slice(0, 2)
    .join("");

/* ---------------------------------------------------------------- */
/*  Page                                                             */
/* ---------------------------------------------------------------- */
const ProviderAppointmentView = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const appointmentId = searchParams.get("id");
  const requestedFrom = searchParams.get("from");
  const backTab = requestedFrom === "upcoming" || requestedFrom === "past" ? requestedFrom : "today";
  const backHref = `/provider/appointments?tab=${backTab}`;
  const requestedTab = searchParams.get("tab");
  const tab: ViewTab = TABS.some((t) => t.key === requestedTab) ? (requestedTab as ViewTab) : "intake-review";

  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelled, setCancelled] = useState(false);

  const goTab = (key: ViewTab) => {
    router.push(`${BASE}?id=${encodeURIComponent(appointmentId ?? "")}&from=${backTab}&tab=${key}`, { scroll: false });
  };

  const confirmCancel = () => {
    // TODO: call your API here
    setCancelOpen(false);
    setCancelled(true);
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
    <div className="flex min-h-full w-full min-w-0 flex-col">
      <div className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col gap-4 sm:gap-5">
      <SuccessToast
        isOpen={cancelled}
        onClose={() => setCancelled(false)}
        title="Appointment cancelled"
        message="The appointment has been cancelled."
      />

      <button
        type="button"
        onClick={() => router.push(backHref)}
        className="flex cursor-pointer items-center gap-1.5 text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Appointments
      </button>

      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-lg font-semibold text-heading sm:text-xl 2xl:text-2xl">Appointment Details</h2>
          <Tags text="Scheduled" tone="success" size="xs" />
        </div>
        <p className="mt-0.5 text-sm text-body">Review patient intake, medical history, and start the consultation.</p>
      </div>

      {/* Patient header */}
      <div className={`${cardCls} !p-3.5 sm:!p-5`}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
            <div className="flex min-w-0 items-center gap-3 sm:gap-4">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-base font-semibold text-primary sm:h-16 sm:w-16 sm:text-lg">
                {initialsOf(PATIENT.name)}
              </span>
              <div className="min-w-0">
                <h3 className="truncate text-base font-semibold text-heading sm:text-xl">{PATIENT.name}</h3>
                <p className="text-xs text-body sm:text-sm">
                  {PATIENT.age} • {PATIENT.sex} • MRN: {PATIENT.mrn}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 border-t border-divider pt-3 sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <CalendarCheck className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-heading">{APPOINTMENT.date}</p>
                <p className="text-xs text-body sm:text-sm">{APPOINTMENT.time}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 border-t border-divider pt-3 sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Video className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-heading">{APPOINTMENT.type}</p>
                <p className="text-xs text-body sm:text-sm">{APPOINTMENT.reason}</p>
              </div>
            </div>
          </div>

          <div className="grid w-full grid-cols-2 gap-2 lg:w-auto">
            <ImportButton text="View Chart" icon={<FolderOpen className="h-4 w-4" />} onClick={() => goTab("patient-chart")} className="w-full justify-center whitespace-nowrap lg:w-auto" />
            <ImportButton text="View Intake" icon={<FileText className="h-4 w-4" />} onClick={() => goTab("intake-review")} className="w-full justify-center whitespace-nowrap lg:w-auto" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs ariaLabel="Appointment sections">
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
      <div role="tabpanel" className="flex min-w-0 flex-1 flex-col">
        {tab === "intake-review" && (
          <ProviderIntakeReview
            onNavigate={goTab}
          />
        )}
        {tab === "patient-chart" && <ProviderPatientChart />}
        {tab === "clinical-notes" && <ProviderClinicalNotes />}
        {tab === "encounters" && <ProviderEncounters />}
        {tab === "documents" && <ProviderDocuments />}
      </div>
      </div>

      {/* Appointment actions */}
      {tab === "intake-review" && (
        <div className="sticky -bottom-4 z-[200] -mx-4 -mb-4 mt-4 border-t border-border bg-card px-4 py-4 sm:-bottom-6 sm:-mx-6 sm:-mb-6 sm:px-6 sm:py-5">
          <div className="mx-auto flex w-full max-w-[1600px] flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              <ImportButton
                text="Reschedule"
                icon={<CalendarClock className="h-4 w-4" />}
                onClick={() => router.push(`${RESCHEDULE_HREF}?id=${encodeURIComponent(appointmentId)}`)}
                className="whitespace-nowrap"
              />
              <ImportButton text="Cancel Appointment" icon={<X className="h-4 w-4" />} onClick={() => setCancelOpen(true)} className="whitespace-nowrap" />
            </div>
            <AddButton
              text="Start Consultation"
              icon={<Video className="h-4 w-4" />}
              onClick={() => router.push(`${START_CONSULTATION_HREF}?id=${encodeURIComponent(appointmentId)}&from=${backTab}`)}
              className="ml-auto whitespace-nowrap"
            />
          </div>
        </div>
      )}

      <DeleteDialog
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        onConfirm={confirmCancel}
        title="Cancel Appointment?"
        description="Are you sure you want to cancel this appointment? The patient will be notified."
        details={[
          { label: "Patient", value: PATIENT.name },
          { label: "Date", value: `${APPOINTMENT.date}, ${APPOINTMENT.time}` },
          { label: "Visit Type", value: APPOINTMENT.type },
        ]}
        confirmText="Cancel Appointment"
      />
    </div>
  );
};

export default ProviderAppointmentView;
