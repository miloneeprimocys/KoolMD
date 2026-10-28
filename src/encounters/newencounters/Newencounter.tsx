"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import Breadcrumb from "@/components/Breadcrumb";
import AddButton from "@/components/Addbutton";
import ImportButton from "@/components/ImportButton";

import Tags from "@/components/Tags";
import VerticalSteps, { type VerticalStepItem } from "@/components/Verticalsteps";
import VisitInformation from "./Visitinformation";
import ClinicalNotes from "./Clinicalnotes";
import AssessmentPlan from "./Assessmentplan";
import OrdersPrescriptions from "./Ordersprescriptions";
import Attachments from "./Attachments";
import FollowUp from "./Followup";

/* ---------- Shared patient stub (replace with API data) ---------- */
const PATIENT = {
  initials: "MP",
  name: "milonee primocys",
  age: "21 years",
  gender: "Female",
  status: "Active" as const,
  patientId: "KMD-0000003",
  dob: "Jul 11, 2005",
  primaryProvider: "Dr. Sarah Lee",
};

const PatientProfileCard = () => (
  <div className="flex min-w-0 flex-col gap-4 rounded-[14px] border border-border bg-card p-4 sm:flex-row sm:items-center sm:p-5">
    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-base font-semibold text-primary">
      {PATIENT.initials}
    </span>
    <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-8 sm:gap-y-1">
      <div className="min-w-0">
        <p className="truncate text-base font-semibold text-heading">{PATIENT.name}</p>
        <p className="mt-0.5 text-sm text-body">
          {PATIENT.age} <span className="mx-1 text-border">•</span> {PATIENT.gender}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-body">
        <span><span className="font-medium text-heading">ID:</span> {PATIENT.patientId}</span>
        <span><span className="font-medium text-heading">DOB:</span> {PATIENT.dob}</span>
        <span><span className="font-medium text-heading">Provider:</span> {PATIENT.primaryProvider}</span>
      </div>
    </div>
    <Tags text={PATIENT.status} tone="success" />
  </div>
);

/* ---------- Steps ---------- */
const STEPS: VerticalStepItem[] = [
  { id: 1, title: "Visit Information", subtitle: "Basic details" },
  { id: 2, title: "Clinical Notes", subtitle: "Subjective, Objective, ROS" },
  { id: 3, title: "Assessment & Plan", subtitle: "Diagnoses and treatment" },
  { id: 4, title: "Orders & Prescriptions", subtitle: "Lab, Imaging, Medication" },
  { id: 5, title: "Attachments", subtitle: "Files and documents" },
  { id: 6, title: "Follow-up", subtitle: "Instructions and next steps" },
];

/* ---------- Component ---------- */
const NewEncounter = () => {
  const router = useRouter();
  const pathname = usePathname();
  const patientId = useSearchParams().get("id");
  const isEditMode = pathname === "/edit-encounter";
  const encounterTitle = isEditMode ? "Edit Encounter" : "New Encounter";
  const query = patientId ? `?id=${patientId}` : "";
  const viewHref = `/view-encounters${query}`;

  const [step, setStep] = useState(1);
  const isFirst = step === 1;
  const isLast = step === STEPS.length;
  const current = STEPS[step - 1];
  const next = STEPS[step]; // undefined on the last step

  const goTo = (id: number) => setStep(id);

  /* Scroll back to the top whenever the step changes */
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  /* Breadcrumb grows with the step: …/ Encounter / Clinical Notes */
  const crumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Encounter", href: "/encounters" },
    { label: PATIENT.name, href: `/view-patient${query}` },
    isFirst ? { label: encounterTitle } : { label: encounterTitle, href: "#" },
    ...(isFirst ? [] : [{ label: current.title }]),
  ];

  return (
    <div className="mx-auto w-full min-w-0 max-w-[1600px] space-y-4 sm:space-y-5">
      <Breadcrumb items={crumbs} />

      {/* Title + step actions */}
      <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-heading sm:text-xl 2xl:text-2xl">{encounterTitle}</h2>
          <p className="mt-0.5 text-xs text-body sm:text-sm">
            Document clinical notes, diagnoses, treatment plan and follow-up for this visit.
          </p>
        </div>

        <div className="flex min-w-0 flex-wrap gap-2">
          {isFirst ? (
            <ImportButton
              text="Cancel"
              icon={null}
              className="whitespace-nowrap"
              onClick={() => router.back()}
            />
          ) : (
            <ImportButton
              text="Back"
              icon={null}
              className="whitespace-nowrap"
              onClick={() => goTo(step - 1)}
            />
          )}
          {/* <ImportButton text="Save as Draft" icon={null} className="whitespace-nowrap" onClick={() => {}} /> */}
          {isLast ? (
            <AddButton
              text="Complete Encounter"
              icon={null}
              className="whitespace-nowrap"
              onClick={() => router.push(viewHref)}
            />
          ) : (
            <AddButton
              text={`Next`}
              icon={null}
              className="whitespace-nowrap"
              onClick={() => goTo(step + 1)}
            />
          )}
        </div>
      </div>

      {/* Common patient profile */}
      <PatientProfileCard />

      {/* Steps + active step */}
      <div className="grid min-w-0 grid-cols-1 overflow-hidden rounded-[14px] border border-border bg-card xl:grid-cols-[260px_minmax(0,1fr)]">
        <VerticalSteps
          steps={STEPS}
          current={step}
          onStepClick={goTo}
          className="border-b border-divider bg-primary/[0.03] xl:border-b-0 xl:border-r"
        />

        {/* Panels stay mounted (just hidden) so typed values survive step changes */}
        <div className="min-w-0 overflow-hidden p-4 sm:p-6">
          <div hidden={step !== 1}><VisitInformation /></div>
          <div hidden={step !== 2}><ClinicalNotes /></div>
          <div hidden={step !== 3}><AssessmentPlan /></div>
          <div hidden={step !== 4}><OrdersPrescriptions /></div>
          <div hidden={step !== 5}><Attachments /></div>
          <div hidden={step !== 6}><FollowUp /></div>
        </div>
      </div>
    </div>
  );
};

export default NewEncounter;
