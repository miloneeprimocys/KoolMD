"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Phone } from "lucide-react";

import Breadcrumb from "@/components/Breadcrumb";
import ImportButton from "@/components/ImportButton";
import Tags from "@/components/Tags";
import SignupDropdown from "@/components/SignupDropdown";
import { cardCls, toOptions } from "@/providers/Shared";

import FhirOverview from "./Fhiroverview";
import FhirObservations, { VIEW_PATIENT_ROUTE } from "./Fhirobservations";
import FhirResourceMapping from "./Fhirresourcemapping";
import FhirValidationRules from "./Fhirvalidationrules";

/* ---------------------------------------------------------------- */
/*  Static patient + encounters (replace with API data by ?id=)      */
/* ---------------------------------------------------------------- */
const PATIENT = {
  name: "John Smith",
  gender: "Male",
  age: "42 years",
  dob: "Jan 14, 1984",
  mrn: "PT-001245",
  phone: "+1 (555) 123-4567",
  email: "john.smith@email.com",
};

const ENCOUNTERS = [
  { id: "ENC-2026-00156", date: "Oct 28, 2026", time: "10:00 AM", type: "Office Visit", provider: "Dr. Sarah Wilson", status: "Completed" },
  { id: "ENC-2026-00142", date: "Oct 12, 2026", time: "09:30 AM", type: "Follow Up", provider: "Dr. Michael Johnson", status: "Completed" },
  { id: "ENC-2026-00120", date: "Sep 20, 2026", time: "11:15 AM", type: "Consultation", provider: "Dr. Emily Parker", status: "Completed" },
];

const ENCOUNTER_OPTIONS = ENCOUNTERS.map((e) => ({ value: e.id, label: `${e.id} (${e.date})` }));

const initials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0]?.toUpperCase())
    .slice(0, 2)
    .join("");

/* ---------------------------------------------------------------- */
/*  Tabs                                                             */
/* ---------------------------------------------------------------- */
type TabKey =
  | "overview"
  | "observations"
  | "resource-mapping"
  | "validation-rules";

const TABS: { key: TabKey; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "observations", label: "Observations" },
  { key: "resource-mapping", label: "Resource Mapping" },
  { key: "validation-rules", label: "Validation Rules" },
];

/* ---------------------------------------------------------------- */
/*  Page                                                             */
/* ---------------------------------------------------------------- */
const ViewFhirPatient = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const patientId = searchParams.get("id") ?? "1";
  const requestedTab = searchParams.get("tab");
  const tab: TabKey = TABS.some((t) => t.key === requestedTab) ? (requestedTab as TabKey) : "overview";

  const [encounterId, setEncounterId] = useState(ENCOUNTERS[0].id);
  const encounter = ENCOUNTERS.find((e) => e.id === encounterId) ?? ENCOUNTERS[0];

  const changeTab = (key: TabKey) => {
    router.push(`${VIEW_PATIENT_ROUTE}?id=${patientId}&tab=${key}`, { scroll: false });
  };

  const tabLabel = TABS.find((t) => t.key === tab)?.label ?? "Overview";

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-4 sm:space-y-5">
      <Breadcrumb
        items={[
          { label: "Clinical Records", href: "/fhir-model" },
          { label: "Patient Record", href: `${VIEW_PATIENT_ROUTE}?id=${patientId}` },
          { label: tabLabel },
        ]}
      />

      {/* ---------- Patient header ---------- */}
      <div className={`${cardCls} !p-3.5 sm:!p-5`}>
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
          <div className="flex min-w-0 flex-1 flex-col gap-4 2xl:flex-row 2xl:items-center 2xl:gap-0">
            <div className="flex items-center gap-3 sm:gap-4 xl:w-[320px] xl:shrink-0">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-violet/15 text-base font-semibold text-violet sm:h-[64px] sm:w-[64px] sm:text-lg">
                {initials(PATIENT.name)}
              </span>
              <div className="min-w-0 space-y-1">
                <h3 className="truncate text-base font-semibold text-heading sm:text-lg">{PATIENT.name}</h3>
                <p className="text-xs text-body sm:text-sm">
                  {PATIENT.gender} • {PATIENT.age} • DOB: {PATIENT.dob} • MRN: {PATIENT.mrn}
                </p>
              </div>
            </div>

            <dl className="grid min-w-0 flex-1 grid-cols-1 gap-4 sm:grid-cols-2 xl:gap-0">
              <div className="min-w-0 xl:border-l xl:border-border xl:pl-6">
                <dt className="text-xs text-body">Phone</dt>
                <dd className="mt-1.5 flex items-center gap-2 break-words text-sm font-medium text-heading">
                  <Phone className="h-4 w-4 text-primary" />
                  {PATIENT.phone}
                </dd>
              </div>
              <div className="min-w-0 sm:border-l sm:border-border sm:pl-5 xl:pl-6">
                <dt className="text-xs text-body">Email</dt>
                <dd className="mt-1.5 flex items-center gap-2 break-words text-sm font-medium text-heading">
                  <Mail className="h-4 w-4 text-primary" />
                  {PATIENT.email}
                </dd>
              </div>
            </dl>
          </div>

          <ImportButton text="View All Encounters" icon={null} onClick={() => router.push("/fhir-model")} />
        </div>
      </div>

      {/* ---------- Encounter selector ---------- */}
      <div className={`${cardCls} !p-3.5 sm:!p-5`}>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-[minmax(0,320px)_repeat(4,minmax(0,1fr))] xl:items-end">
          <SignupDropdown
            name="encounter"
            label="Encounter"
            placeholder="Select encounter"
            searchable={false}
            options={ENCOUNTER_OPTIONS}
            value={encounterId}
            onChange={setEncounterId}
          />
          <div className="min-w-0">
            <p className="text-xs text-body">Encounter Type</p>
            <p className="mt-1.5 text-sm font-medium text-heading">{encounter.type}</p>
          </div>
          <div className="min-w-0">
            <p className="text-xs text-body">Provider</p>
            <p className="mt-1.5 text-sm font-medium text-heading">{encounter.provider}</p>
          </div>
          <div className="min-w-0">
            <p className="text-xs text-body">Status</p>
            <div className="mt-1.5">
              <Tags text={encounter.status} tone="success" size="xs" />
            </div>
          </div>
          <div className="min-w-0">
            <p className="text-xs text-body">Date &amp; Time</p>
            <p className="mt-1.5 text-sm font-medium text-heading">
              {encounter.date}, {encounter.time}
            </p>
          </div>
        </div>
      </div>

      {/* ---------- Tabs ---------- */}
      <div
        role="tablist"
        aria-label="Patient record sections"
        className="flex gap-4 overflow-x-auto border-b border-border hide-scrollbar sm:gap-6"
      >
        {TABS.map((t) => {
          const isActive = t.key === tab;
          return (
            <button
              key={t.key}
              role="tab"
              type="button"
              aria-selected={isActive}
              onClick={() => changeTab(t.key)}
              className={`-mb-px cursor-pointer whitespace-nowrap border-b-2 px-1 pb-2.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 sm:pb-3 sm:text-sm ${
                isActive ? "border-primary text-primary" : "border-transparent text-body hover:text-heading"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* ---------- Active tab ---------- */}
      <div role="tabpanel">
        {tab === "overview" && <FhirOverview onViewAll={() => changeTab("observations")} />}
        {tab === "observations" && <FhirObservations />}
        {tab === "resource-mapping" && <FhirResourceMapping />}
        {tab === "validation-rules" && <FhirValidationRules />}
      </div>
    </div>
  );
};

export default ViewFhirPatient;