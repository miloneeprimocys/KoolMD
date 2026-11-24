"use client";

import React, { useEffect, useState } from "react";
import { MapPin, Monitor } from "lucide-react";

import { type Errors, type StepProps } from "@/providers/Shared";
import PracticeLocations, { initialLocations, validateLocations, type LocationRow } from "./PracticeLocations";
import TelemedicineSettings, { TELE_ERROR_KEYS, initialTele, validateTele, type TeleValues } from "./TelemedicineSettings";

/* ---------------------------------------------------------------- */
/*  Values + validation (used by ProviderProfile and ProfileReview)  */
/* ---------------------------------------------------------------- */
export interface LocationStepValues {
  locations: LocationRow[];
  tele: TeleValues;
}

export const initialLocationStep = (): LocationStepValues => ({
  locations: initialLocations(),
  tele: initialTele(),
});

export const validateLocationStep = (v: LocationStepValues): Errors => ({
  ...validateLocations(v.locations),
  ...validateTele(v.tele),
});

/* ---------------------------------------------------------------- */
/*  Step 3 – Locations & Telemedicine                                */
/* ---------------------------------------------------------------- */
type Tab = "locations" | "tele";

const TABS: { key: Tab; label: string; Icon: typeof MapPin }[] = [
  { key: "locations", label: "Practice Locations", Icon: MapPin },
  { key: "tele", label: "Telemedicine Settings", Icon: Monitor },
];

const ProfileLocation = ({ values, errors, onChange }: StepProps<LocationStepValues>) => {
  const [tab, setTab] = useState<Tab>("locations");

  /* Jump to the tab that holds the first validation error */
  useEffect(() => {
    const keys = Object.keys(errors);
    if (keys.includes("locations")) setTab("locations");
    else if (keys.some((k) => TELE_ERROR_KEYS.includes(k))) setTab("tele");
  }, [errors]);

  return (
    <div className="space-y-4 sm:space-y-5">
      <div role="tablist" aria-label="Locations and telemedicine" className="flex gap-1 overflow-x-auto rounded-xl border border-border custom-scrollbar bg-card p-1 hide-scrollbar sm:inline-flex">
        {TABS.map(({ key, label, Icon }) => {
          const isActive = key === tab;
          return (
            <button
              key={key}
              role="tab"
              type="button"
              aria-selected={isActive}
              onClick={() => setTab(key)}
              className={`flex flex-1 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg px-3 py-2.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 sm:flex-none sm:px-6 sm:text-sm ${
                isActive ? "bg-primary text-on-primary shadow-md shadow-primary/25" : "text-heading hover:bg-primary/10"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </button>
          );
        })}
      </div>

      {tab === "locations" ? (
        <PracticeLocations locations={values.locations} error={errors.locations} onChange={(locations) => onChange({ locations })} />
      ) : (
        <TelemedicineSettings values={values.tele} errors={errors} onChange={(patch) => onChange({ tele: { ...values.tele, ...patch } })} />
      )}
    </div>
  );
};

export default ProfileLocation;