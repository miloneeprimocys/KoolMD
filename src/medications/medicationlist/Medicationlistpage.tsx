"use client";

import React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import Breadcrumb from "@/components/Breadcrumb";
import { cardCls } from "@/providers/Shared";

import CurrentMedications, { CURRENT_MEDS } from "./Currentmedications";
import DiscontinuedMedications, { DISCONTINUED } from "./Discontinuedmedications";
import AllMedications from "./Allmedications";

export const PATIENT = {
  name: "John Smith",
  mrn: "PT-001245",
  dob: "Apr 15, 1985",
  age: "41 years",
  gender: "Male",
  phone: "(555) 123-4567",
};

export const PatientHeader = () => (
  <div className={`${cardCls} !p-3.5 sm:!p-5`}>
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3 sm:gap-4">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-violet/15 text-base font-semibold text-violet sm:h-16 sm:w-16 sm:text-lg">
          JS
        </span>
        <div className="min-w-0 space-y-1">
          <h3 className="truncate text-base font-semibold text-heading sm:text-lg">{PATIENT.name}</h3>
          <p className="text-xs text-body sm:text-sm">
            MRN: {PATIENT.mrn} | DOB: {PATIENT.dob} | {PATIENT.gender} | {PATIENT.phone}
          </p>
        </div>
      </div>
      <Link href="/view-patient?id=1" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
        View Patient Details
      </Link>
    </div>
  </div>
);

type TabKey = "current" | "discontinued" | "all";

const TABS: { key: TabKey; label: string }[] = [
  { key: "current", label: `Current Medications (${CURRENT_MEDS.length})` },
  { key: "discontinued", label: `Discontinued (${DISCONTINUED.length})` },
  { key: "all", label: `All Medications (${CURRENT_MEDS.length + DISCONTINUED.length})` },
];

const MedicationListPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requested = searchParams.get("tab");
  const tab: TabKey = TABS.some((t) => t.key === requested) ? (requested as TabKey) : "current";

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-4 sm:space-y-5">
      <Breadcrumb items={[{ label: "Medications", href: "/medication/medication-list" }, { label: "Medication List" }]} />

      <PatientHeader />

      <div role="tablist" aria-label="Medication sections" className="flex gap-4 overflow-x-auto border-b border-border hide-scrollbar sm:gap-6">
        {TABS.map((t) => {
          const isActive = t.key === tab;
          return (
            <button
              key={t.key}
              role="tab"
              type="button"
              aria-selected={isActive}
              onClick={() => router.push(`/medication/medication-list?tab=${t.key}`, { scroll: false })}
              className={`-mb-px cursor-pointer whitespace-nowrap border-b-2 px-1 pb-2.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 sm:pb-3 sm:text-sm ${
                isActive ? "border-primary text-primary" : "border-transparent text-body hover:text-heading"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <div role="tabpanel">
        {tab === "current" && <CurrentMedications />}
        {tab === "discontinued" && <DiscontinuedMedications />}
        {tab === "all" && <AllMedications />}
      </div>
    </div>
  );
};

export default MedicationListPage;
