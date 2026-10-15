"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";

import Breadcrumb from "@/components/Breadcrumb";
import Tags from "@/components/Tags";
import AddButton from "@/components/Addbutton";
import Management from "./Management";

/* ---------- Static data (replace with API data later) ---------- */
export const PATIENT = {
  name: "milonee primocys",
  age: "21 years",
  gender: "Female",
  status: "Active",
  id: "KMD-0000003",
  dob: "Jul 11, 2005",
  dobAge: "(21 years)",
  provider: "Dr. Sarah Lee",
  language: "Not provided",
};

const initials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0]?.toUpperCase())
    .slice(0, 2)
    .join("");
/* Left divider + padding per column count: 2 (base) · 5 (md) · 3 (lg) · 5 (2xl) */
const colDivider = (i: number) =>
  [
    i % 2 === 1 ? "border-l pl-4" : "border-l-0 pl-0",
    i > 0 ? "md:border-l md:pl-4" : "md:border-l-0 md:pl-0",
   
  ].join(" ");
/* ---------- Profile card (also used by NewEncounter) ---------- */
export const PatientProfileCard = () => {
  const stats: { label: string; value: string; sub?: string; muted?: boolean }[] = [
    { label: "Patient ID", value: PATIENT.id },
    { label: "Date of Birth", value: PATIENT.dob, sub: PATIENT.dobAge },
    { label: "Gender", value: PATIENT.gender },
    { label: "Primary Provider", value: PATIENT.provider },
    { label: "Preferred Language", value: PATIENT.language, muted: true },
  ];

  return (
    <div className="rounded-[14px] border border-border bg-card p-3.5 sm:p-5">
      <div className="flex flex-col gap-4 2xl:flex-row 2xl:items-center 2xl:gap-6">
        <div className="flex items-center gap-3 sm:gap-4 xl:w-[300px] xl:shrink-0">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-base font-semibold text-primary sm:h-20 sm:w-20 sm:text-xl">
            {initials(PATIENT.name)}
          </span>
          <div className="min-w-0 space-y-1">
            <h3 className="truncate text-base font-semibold text-heading sm:text-xl">{PATIENT.name}</h3>
            <p className="text-xs text-body sm:text-sm">
              {PATIENT.age} • {PATIENT.gender}
            </p>
            <Tags text={PATIENT.status} tone="success" />
          </div>
        </div>

     <dl className="grid min-w-0 flex-1 grid-cols-2 gap-y-4 md:grid-cols-5 2xl:grid-cols-5">
  {stats.map((s, i) => (
    <div
      key={s.label}
      className={`min-w-0 border-border pr-3 ${colDivider(i)}`}
    >
      <dt className="text-xs text-body">{s.label}</dt>
      <dd className={`mt-1 break-words text-sm ${s.muted ? "text-body" : "font-semibold text-heading"}`}>
        {s.value}
      </dd>
      {s.sub && <dd className="text-xs text-body">{s.sub}</dd>}
    </div>
  ))}
</dl>
      </div>
    </div>
  );
};

/* ---------- Page ---------- */
const ViewEncounters = () => {
  const router = useRouter();
  const patientId = useSearchParams().get("id");
  const query = patientId ? `?id=${patientId}` : "";

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-4 sm:space-y-5">
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Encounters", href: "/encounters" },
          { label: PATIENT.name, href: `/view-patient${query}` },
       
        ]}
      />

      {/* Title + action */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-heading sm:text-xl 2xl:text-2xl">
            Encounter and Visit Management
          </h2>
          <p className="mt-0.5 text-xs text-body sm:text-sm">
            View and manage all encounters, visit details, clinical notes and related records for this patient.
          </p>
        </div>
        <AddButton
          text="Start New Encounter"
          icon={<Plus className="h-4 w-4" />}
          onClick={() => router.push(`/new-encounter${query}`)}
          className="w-fit whitespace-nowrap"
        />
      </div>

      <PatientProfileCard />

      {/* Stat cards, filters and encounters table */}
      <Management />
    </div>
  );
};

export default ViewEncounters;