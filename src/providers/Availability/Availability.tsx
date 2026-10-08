"use client";

import React, { useEffect, useState } from "react";
import { MapPin, Video } from "lucide-react";
import { getTimeZones } from "@vvo/tzdb";

import SignupDropdown, { DropdownOption } from "@/components/SignupDropdown";
import { FieldError } from "@/components/SignupField";
import { Errors, StepProps, Switch, cardCls } from "../Shared";

import LocationTab, {
  LocationItem,
  initialLocations,
  validateLocations,
} from "./Location";
import TelemedicineTab, {
  TelemedicineValues,
  initialTelemedicine,
  validateTelemedicine,
} from "./Telemedicine";
import BlockedDatesTab, { BlockedDate } from "./Blockeddate";

export type { Shift, DaySchedule, WeekSchedule, LocationItem } from "./Location";
export type { BlockedDate } from "./Blockeddate";

/* ---------------------------------------------------------------- */
/*  Types + defaults                                                */
/* ---------------------------------------------------------------- */
export interface AvailabilityValues extends TelemedicineValues {
  timezone: string;
  duration: string;
  buffer: string;
  telemedicineEnabled: boolean;
  inPersonEnabled: boolean;
  locations: LocationItem[];
  blocked: BlockedDate[];
}

/** Detect the user's IANA timezone (falls back to LA). */
const detectTimezone = (): string => {
  try {
    return (
      Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Los_Angeles"
    );
  } catch {
    return "America/Los_Angeles";
  }
};

export const initialAvailability = (): AvailabilityValues => ({
  timezone: detectTimezone(),
  duration: "30",
  buffer: "5",
  telemedicineEnabled: true,
  inPersonEnabled: true,
  locations: initialLocations(),
  blocked: [],
  ...initialTelemedicine(),
});

/* ---------------------------------------------------------------- */
/*  Option lists                                                    */
/* ---------------------------------------------------------------- */
/** Full IANA timezone list with live GMT offsets, via @vvo/tzdb. */
const TIMEZONES: DropdownOption[] = getTimeZones().map((tz) => ({
  value: tz.name,
  label: tz.currentTimeFormat, // e.g. "GMT-08:00 Pacific Time - Los Angeles"
}));

const DURATIONS: DropdownOption[] = [
  { value: "15", label: "15 minutes" },
  { value: "20", label: "20 minutes" },
  { value: "30", label: "30 minutes" },
  { value: "45", label: "45 minutes" },
  { value: "60", label: "60 minutes" },
];

const BUFFERS: DropdownOption[] = [
  { value: "0", label: "No buffer" },
  { value: "5", label: "5 minutes" },
  { value: "10", label: "10 minutes" },
  { value: "15", label: "15 minutes" },
];

/* ---------------------------------------------------------------- */
/*  Validation                                                      */
/* ---------------------------------------------------------------- */
export const validateAvailability = (v: AvailabilityValues): Errors => {
  const e: Errors = {};
  if (!v.timezone) e.timezone = "Timezone is required.";
  if (!v.duration) e.duration = "Appointment duration is required.";

  if (!v.inPersonEnabled && !v.telemedicineEnabled)
    e.modes = "Turn on telemedicine or in-person availability.";

  if (v.inPersonEnabled) validateLocations(v.locations, e);
  if (v.telemedicineEnabled) validateTelemedicine(v, v.inPersonEnabled, e);

  return e;
};

/* ---------------------------------------------------------------- */
/*  Main component                                                  */
/* ---------------------------------------------------------------- */
type TabKey = "location" | "telemedicine" | "blocked";

const TABS: { key: TabKey; label: string }[] = [
  { key: "location", label: "Location Schedule" },
  { key: "telemedicine", label: "Telemedicine Schedule" },
  { key: "blocked", label: "Blocked Dates" },
];

const Notice = ({ children }: { children: string }) => (
  <p className="rounded-xl bg-primary/5 px-4 py-6 text-center text-sm text-body">
    {children}
  </p>
);

const Availability = ({
  values: v,
  errors,
  onChange,
  attemptTick = 0,
}: StepProps<AvailabilityValues> & { attemptTick?: number }) => {
  const [tab, setTab] = useState<TabKey>("location");

  // On a failed "Next": open the tab that has the first error and scroll to it
  const firstKey = Object.keys(errors)[0];
  useEffect(() => {
    if (!firstKey) return;
    if (firstKey.startsWith("loc_")) setTab("location");
    else if (firstKey.startsWith("tele")) setTab("telemedicine");
    requestAnimationFrame(() =>
      document
        .getElementById(firstKey)
        ?.scrollIntoView({ behavior: "smooth", block: "center" }),
    );
  }, [firstKey, attemptTick]);

  return (
    <div className="space-y-4 sm:space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-heading sm:text-xl">
          Availability and Scheduling
        </h2>
        <p className="mt-0.5 text-sm text-body">
          Set your working hours, appointment duration and availability for each
          location and telemedicine.
        </p>
      </div>

      {/* General settings */}
      <section className={`${cardCls} sm:p-6`}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <SignupDropdown
            name="timezone"
            label="Timezone *"
            placeholder="Select timezone"
            options={TIMEZONES}
            value={v.timezone}
            onChange={(val) => onChange({ timezone: val })}
            error={errors.timezone}
          />
          <SignupDropdown
            name="duration"
            label="Default Appointment Duration *"
            placeholder="Select duration"
            options={DURATIONS}
            value={v.duration}
            onChange={(val) => onChange({ duration: val })}
            error={errors.duration}
          />
          <SignupDropdown
            name="buffer"
            label="Buffer Time"
            placeholder="Select buffer"
            options={BUFFERS}
            value={v.buffer}
            onChange={(val) => onChange({ buffer: val })}
          />
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {[
            {
              icon: <Video className="h-5 w-5" />,
              title: "Telemedicine Availability",
              desc: "Allow patients to book video consultations",
              checked: v.telemedicineEnabled,
              set: (c: boolean) => onChange({ telemedicineEnabled: c }),
            },
            {
              icon: <MapPin className="h-5 w-5" />,
              title: "In-person Availability",
              desc: "Allow patients to book in-person visits",
              checked: v.inPersonEnabled,
              set: (c: boolean) => onChange({ inPersonEnabled: c }),
            },
          ].map((t) => (
            <div
              key={t.title}
              className={`flex items-center gap-3 rounded-xl border p-3 ${
                errors.modes ? "border-danger" : "border-border"
              }`}
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                {t.icon}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-heading">
                  {t.title}
                </span>
                <span className="block text-xs text-body">{t.desc}</span>
              </span>
              <Switch checked={t.checked} onChange={t.set} label={t.title} />
            </div>
          ))}
        </div>
        <FieldError message={errors.modes} />
      </section>

      {/* Tabs */}
      <section className={`${cardCls} sm:p-6`}>
        {/* overflow-y-hidden + no -mb-px = no stray vertical scrollbar arrows */}
        <div
          role="tablist"
          className="mb-5 sm:px-2 -mt-2 sm:-mt-3.5 -mx-4 sm:-mx-6 flex gap-1 overflow-x-auto overflow-y-hidden border-b border-divider [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={tab === t.key}
              onClick={() => setTab(t.key)}
              className={`shrink-0 cursor-pointer whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                tab === t.key
                  ? "border-primary text-primary"
                  : "border-transparent text-body hover:text-heading"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Panels stay mounted (just hidden) so each tab keeps its own state */}
        <div hidden={tab !== "location"}>
          {v.inPersonEnabled ? (
            <LocationTab
              locations={v.locations}
              errors={errors}
              attemptTick={attemptTick}
              onChange={(locations) => onChange({ locations })}
            />
          ) : (
            <Notice>
              Turn on In-person Availability to set your location schedule.
            </Notice>
          )}
        </div>

        <div hidden={tab !== "telemedicine"}>
          {v.telemedicineEnabled ? (
            <TelemedicineTab
              values={v}
              inPersonEnabled={v.inPersonEnabled}
              errors={errors}
              onChange={onChange}
            />
          ) : (
            <Notice>
              Turn on Telemedicine Availability to set your telemedicine
              schedule.
            </Notice>
          )}
        </div>

        <div hidden={tab !== "blocked"}>
          <h3 className="text-base font-semibold text-heading">Blocked Dates</h3>
          <p className="mb-4 mt-0.5 text-xs text-body">
            Set specific dates or date ranges when you are not available for
            appointments.
          </p>
          <BlockedDatesTab
            blocked={v.blocked}
            onChange={(blocked) => onChange({ blocked })}
          />
        </div>
      </section>
    </div>
  );
};

export default Availability;