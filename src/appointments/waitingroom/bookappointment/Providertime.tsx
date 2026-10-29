"use client";

import React from "react";
import { ChevronLeft, ChevronRight, MapPin, Stethoscope } from "lucide-react";

import SignupDropdown, { type DropdownOption } from "@/components/SignupDropdown";
import DatePicker from "@/components/Datepicker";
import Tags from "@/components/Tags";
import { FieldError } from "@/components/SignupField";

/* ---------------------------------------------------------------- */
/*  Static data (replace with API data later)                        */
/* ---------------------------------------------------------------- */
export const PROVIDERS = [
  { value: "mitchell", name: "Dr. Sarah Mitchell", specialty: "Internal Medicine" },
  { value: "carter", name: "Dr. Emily Carter", specialty: "Family Medicine" },
  { value: "chen", name: "Dr. Michael Chen", specialty: "Cardiology" },
  { value: "miller", name: "Dr. James Miller", specialty: "Pediatrics" },
];

const PROVIDER_OPTIONS: DropdownOption[] = PROVIDERS.map((p) => ({
  value: p.value,
  label: p.name,
  keywords: [p.specialty],
}));

export const getProvider = (value: string) => PROVIDERS.find((p) => p.value === value);

/** Locations depend on the appointment type chosen in step 2. */
export const locationOptionsFor = (type: string): DropdownOption[] => {
  const list =
    type === "video"
      ? ["Virtual / Telemedicine"]
      : type === "phone"
        ? ["Phone Consultation"]
        : ["Main Clinic - Room 1", "Main Clinic - Room 2", "Downtown Clinic - Room 1"];
  return list.map((v) => ({ value: v, label: v }));
};

/* ---------------------------------------------------------------- */
/*  Date + time helpers (also used by the Confirmation step)         */
/* ---------------------------------------------------------------- */
const pad = (n: number) => String(n).padStart(2, "0");
const toISODate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fromISO = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d, 12);
};

export const todayISO = () => toISODate(new Date());
export const addDays = (iso: string, n: number) => {
  const d = fromISO(iso);
  d.setDate(d.getDate() + n);
  return toISODate(d);
};
const startOfWeek = (iso: string) => addDays(iso, -((fromISO(iso).getDay() + 6) % 7)); // Monday

/** "Nov 24, 2026" */
export const formatShortDate = (iso: string) =>
  fromISO(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

/** "Tuesday, Nov 24, 2026" */
export const formatLongDate = (iso: string) =>
  fromISO(iso).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", year: "numeric" });

const formatMinutes = (mins: number) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${pad(h % 12 === 0 ? 12 : h % 12)}:${pad(m)} ${h < 12 ? "AM" : "PM"}`;
};

const parseMinutes = (time: string) => {
  const match = /^(\d{2}):(\d{2}) (AM|PM)$/.exec(time);
  if (!match) return 0;
  const h = Number(match[1]) % 12;
  return (match[3] === "PM" ? h + 12 : h) * 60 + Number(match[2]);
};

/** 9:00 AM – 4:30 PM in 30-minute steps. */
export const SLOT_TIMES: string[] = Array.from({ length: 16 }, (_, i) => formatMinutes(9 * 60 + i * 30));

export const durationFor = (longer: boolean) => (longer ? 60 : 30);

/** "10:00 AM – 10:30 AM" */
export const slotRange = (time: string, minutes: number) =>
  `${time} – ${formatMinutes(parseMinutes(time) + minutes)}`;

const hash = (s: string) => {
  let h = 0;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h;
};

/** Demo availability. Replace with the provider's real schedule from your API. */
export const isSlotUnavailable = (provider: string, date: string, time: string) => {
  if (date === todayISO()) {
    const now = new Date();
    if (parseMinutes(time) <= now.getHours() * 60 + now.getMinutes()) return true;
  }
  return hash(`${provider}|${date}|${time}`) % 5 === 0;
};

/* ---------------------------------------------------------------- */
/*  Form model                                                       */
/* ---------------------------------------------------------------- */
export type ProviderTimeValues = {
  provider: string;
  location: string;
  date: string; // ISO
  time: string; // "10:00 AM"
};

export type ProviderTimeErrors = Partial<Record<"provider" | "location" | "date" | "time", string>>;

export const initialProviderTime = (): ProviderTimeValues => ({
  provider: "mitchell",
  location: "Main Clinic - Room 1",
  date: addDays(todayISO(), 1),
  time: "",
});

export const validateProviderTime = (v: ProviderTimeValues): ProviderTimeErrors => {
  const e: ProviderTimeErrors = {};
  if (!v.provider) e.provider = "Select a provider.";
  if (!v.location) e.location = "Select a location.";
  if (!v.date) e.date = "Select a date.";
  else if (v.date < todayISO()) e.date = "Date cannot be in the past.";
  if (!v.time) e.time = "Select a time slot.";
  else if (isSlotUnavailable(v.provider, v.date, v.time)) e.time = "That time slot is no longer available.";
  return e;
};

/* ---------------------------------------------------------------- */
/*  Step 3 — Provider & Time                                         */
/* ---------------------------------------------------------------- */
type Props = {
  values: ProviderTimeValues;
  errors: ProviderTimeErrors;
  onChange: (patch: Partial<ProviderTimeValues>) => void;
  /** Appointment type from step 2 (decides the location list). */
  appointmentType: string;
  /** "Requires Longer Duration" from step 2. */
  longerDuration: boolean;
};

const ProviderTime = ({ values, errors, onChange, appointmentType, longerDuration }: Props) => {
  const minutes = durationFor(longerDuration);
  const provider = getProvider(values.provider);
  const today = todayISO();
  const weekStart = startOfWeek(values.date || today);
  const week = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const selectDate = (iso: string) => onChange({ date: iso, time: "" });

  return (
    <div className="space-y-5">
      {/* Provider / location / date */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <SignupDropdown
          name="provider"
          label={<>Provider <span className="text-danger">*</span></>}
          placeholder="Select provider"
          options={PROVIDER_OPTIONS}
          value={values.provider}
          onChange={(v) => onChange({ provider: v, time: "" })}
          error={errors.provider}
        />
        <SignupDropdown
          name="location"
          label={<>Location / Mode <span className="text-danger">*</span></>}
          placeholder="Select location"
          searchable={false}
          options={locationOptionsFor(appointmentType)}
          value={values.location}
          onChange={(v) => onChange({ location: v })}
          error={errors.location}
        />
        <DatePicker
          name="date"
          label={<>Date <span className="text-danger">*</span></>}
          placeholder="Select date"
          value={values.date}
          onChange={selectDate}
          minDate={today}
          error={errors.date}
        />
      </div>

      {/* Day navigator */}
      <div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Previous day"
            disabled={values.date <= today}
            onClick={() => selectDate(addDays(values.date, -1))}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border border-border bg-card text-heading transition-colors hover:border-primary/50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border disabled:hover:text-heading"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="min-w-[130px] text-center text-base font-semibold text-heading">
            {values.date ? formatShortDate(values.date) : "—"}
          </span>
          <button
            type="button"
            aria-label="Next day"
            onClick={() => selectDate(addDays(values.date || today, 1))}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border border-border bg-card text-heading transition-colors hover:border-primary/50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div role="group" aria-label="Week" className="mt-3 grid grid-cols-7 overflow-hidden rounded-xl border border-border">
          {week.map((iso, i) => {
            const d = new Date(`${iso}T12:00:00`);
            const active = iso === values.date;
            const past = iso < today;
            return (
              <button
                key={iso}
                type="button"
                disabled={past}
                aria-pressed={active}
                onClick={() => selectDate(iso)}
                className={`flex cursor-pointer flex-col items-center gap-0.5 py-2.5 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-40 sm:text-sm ${
                  i > 0 ? "border-l border-border" : ""
                } ${active ? "bg-primary/10 text-primary" : "text-heading hover:bg-primary/5"}`}
              >
                <span className={active ? "font-semibold" : "text-body"}>
                  {d.toLocaleDateString("en-US", { weekday: "short" })}
                </span>
                <span className="font-semibold">{d.getDate()}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Time slots + details */}
      <div id="time" tabIndex={-1} className="grid gap-4 outline-none md:grid-cols-[200px_minmax(0,1fr)]">
        <div>
          <ul className="hide-scrollbar grid max-h-[300px] grid-cols-2 gap-2 overflow-y-auto md:grid-cols-1">
            {SLOT_TIMES.map((t) => {
              const unavailable = isSlotUnavailable(values.provider, values.date, t);
              const selected = values.time === t;
              return (
                <li key={t}>
                  <button
                    type="button"
                    disabled={unavailable}
                    aria-pressed={selected}
                    onClick={() => onChange({ time: t })}
                    className={`h-10 w-full cursor-pointer rounded-lg border text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${
                      selected
                        ? "border-primary bg-primary font-medium text-on-primary"
                        : unavailable
                          ? "cursor-not-allowed border-border/60 text-body/50"
                          : "border-border text-heading hover:border-primary/50 hover:bg-primary/5"
                    }`}
                  >
                    {t}
                  </button>
                </li>
              );
            })}
          </ul>
          <FieldError message={errors.time} />
        </div>

        <div className="min-w-0 rounded-xl border border-border bg-primary/[0.03]">
          {values.time ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-t-xl bg-primary/[0.06] px-4 py-3.5">
                <p className="text-sm font-semibold text-heading">
                  {slotRange(values.time, minutes)}{" "}
                  <span className="font-normal text-body">({minutes} minutes)</span>
                </p>
                <Tags text="Available" tone="success" />
              </div>
              <div className="space-y-5 px-4 py-4">
                <div>
                  <p className="text-sm font-semibold text-heading">Provider</p>
                  <div className="mt-2 flex items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Stethoscope className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm text-heading">{provider?.name ?? "—"}</p>
                      <p className="text-xs text-body">{provider?.specialty}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-heading">Location</p>
                  <div className="mt-2 flex items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <MapPin className="h-4 w-4" />
                    </span>
                    <p className="text-sm text-heading">{values.location || "—"}</p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <p className="px-4 py-12 text-center text-sm text-body">
              Select a time slot to see the appointment details.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProviderTime;