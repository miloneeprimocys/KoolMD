"use client";

import React, { useState } from "react";
import { Building2, CalendarCheck, ChevronDown, Clock, Info, Plus, Settings, Trash2, Video } from "lucide-react";

import ImportButton from "@/components/ImportButton";
import TogglableSwitch from "@/components/Togglableswitch";
import SignupDropdown from "@/components/SignupDropdown";
import { FieldError } from "@/components/SignupField";
import { cardCls, toOptions, uid, type Errors, type StepProps } from "@/providers/Shared";
import { type TimeRange } from "./AddExceptionModal";

/* ---------------------------------------------------------------- */
/*  Values + validation (used by ConfigureAvailability)              */
/* ---------------------------------------------------------------- */
export type DaySchedule = { day: string; enabled: boolean; slots: TimeRange[] };

export interface WeeklyValues {
  days: DaySchedule[];
  interval: string;
  allowVideo: boolean;
  allowInPerson: boolean;
}

const slot = (start: string, end: string): TimeRange => ({ id: uid(), start, end });

/** Static starting values (replace with the provider's saved schedule). */
export const initialWeekly = (): WeeklyValues => ({
  days: [
    { day: "Monday", enabled: true, slots: [slot("09:00", "12:00"), slot("14:00", "18:00")] },
    { day: "Tuesday", enabled: true, slots: [slot("09:00", "12:00"), slot("14:00", "17:00")] },
    { day: "Wednesday", enabled: true, slots: [slot("09:00", "13:00")] },
    { day: "Thursday", enabled: true, slots: [slot("09:00", "12:00"), slot("14:00", "18:00")] },
    { day: "Friday", enabled: true, slots: [slot("09:00", "13:00")] },
    { day: "Saturday", enabled: false, slots: [] },
    { day: "Sunday", enabled: false, slots: [] },
  ],
  interval: "15 minutes",
  allowVideo: true,
  allowInPerson: true,
});

/* ---------- Helpers ---------- */
const pad = (n: number) => String(n).padStart(2, "0");
const fmt = (m: number) => `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;
const toMinutes = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

/** Every 15 minutes: value "HH:MM", label "hh:mm AM". */
const TIME_OPTIONS = Array.from({ length: 96 }, (_, i) => {
  const minutes = i * 15;
  const h = Math.floor(minutes / 60);
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return { value: fmt(minutes), label: `${pad(hour12)}:${pad(minutes % 60)} ${h < 12 ? "AM" : "PM"}` };
});

const INTERVAL_OPTIONS = toOptions(["10 minutes", "15 minutes", "20 minutes", "30 minutes", "45 minutes", "60 minutes"]);
const MAX_SLOTS = 3;

export const validateWeekly = (v: WeeklyValues): Errors => {
  const e: Errors = {};
  if (!v.days.some((d) => d.enabled)) e.days = "Turn on at least one working day.";
  v.days.forEach((d) => {
    if (!d.enabled) return;
    if (d.slots.length === 0) {
      e[`day_${d.day}`] = "Add at least one time slot.";
      return;
    }
    const sorted = [...d.slots].sort((a, b) => toMinutes(a.start) - toMinutes(b.start));
    for (let i = 0; i < sorted.length; i++) {
      if (toMinutes(sorted[i].end) <= toMinutes(sorted[i].start)) {
        e[`day_${d.day}`] = "End time must be after the start time.";
        break;
      }
      if (i > 0 && toMinutes(sorted[i].start) < toMinutes(sorted[i - 1].end)) {
        e[`day_${d.day}`] = "Time slots can't overlap.";
        break;
      }
    }
  });
  if (!v.allowVideo && !v.allowInPerson) e.modes = "Allow at least one type of appointment.";
  return e;
};

/* ---------------------------------------------------------------- */
/*  Copy schedule menu                                               */
/* ---------------------------------------------------------------- */
const CopyMenu = ({ onCopy }: { onCopy: (target: "weekdays" | "all") => void }) => {
  const [open, setOpen] = useState(false);
  const item = "flex w-full cursor-pointer items-center rounded-lg px-3 py-2 text-left text-xs text-heading transition-colors hover:bg-primary/10";
  return (
    <div className="relative shrink-0">
      <ImportButton text="Copy Schedule" icon={<ChevronDown className="h-4 w-4" />} onClick={() => setOpen((o) => !o)} className="whitespace-nowrap" />
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <ul role="menu" className="absolute right-0 top-full z-20 mt-1 w-56 rounded-xl border border-border bg-card p-1 shadow-2xl">
            <li>
              <button type="button" role="menuitem" className={item} onClick={() => { setOpen(false); onCopy("weekdays"); }}>
                Copy Monday to all weekdays
              </button>
            </li>
            <li>
              <button type="button" role="menuitem" className={item} onClick={() => { setOpen(false); onCopy("all"); }}>
                Copy Monday to all days
              </button>
            </li>
          </ul>
        </>
      )}
    </div>
  );
};

/* ---------------------------------------------------------------- */
/*  Tab 1 – Weekly Schedule                                          */
/* ---------------------------------------------------------------- */
const WeeklySchedule = ({ values, errors, onChange }: StepProps<WeeklyValues>) => {
  const updateDay = (day: string, patch: Partial<DaySchedule>) =>
    onChange({ days: values.days.map((d) => (d.day === day ? { ...d, ...patch } : d)) });

  const toggleDay = (d: DaySchedule, enabled: boolean) =>
    updateDay(d.day, { enabled, slots: enabled && d.slots.length === 0 ? [slot("09:00", "17:00")] : d.slots });

  const changeSlot = (d: DaySchedule, id: string, patch: Partial<TimeRange>) =>
    updateDay(d.day, { slots: d.slots.map((s) => (s.id === id ? { ...s, ...patch } : s)) });

  const addSlot = (d: DaySchedule) => {
    const last = d.slots[d.slots.length - 1];
    const start = last ? Math.min(toMinutes(last.end) + 60, 22 * 60) : 9 * 60;
    const end = Math.min(start + 180, 23 * 60 + 45);
    updateDay(d.day, { slots: [...d.slots, slot(fmt(start), fmt(end))] });
  };

  const copyMonday = (target: "weekdays" | "all") => {
    const monday = values.days.find((d) => d.day === "Monday");
    if (!monday) return;
    const weekdays = ["Tuesday", "Wednesday", "Thursday", "Friday"];
    onChange({
      days: values.days.map((d) =>
        d.day === "Monday" || (target === "weekdays" && !weekdays.includes(d.day))
          ? d
          : { ...d, enabled: monday.enabled, slots: monday.slots.map((s) => ({ ...s, id: uid() })) },
      ),
    });
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="grid items-start gap-4 sm:gap-5 min-[1920px]:grid-cols-[minmax(0,1fr)_380px]">
        {/* ---------- Weekly availability ---------- */}
        <section className={`${cardCls} min-w-0 sm:p-5`}>
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-heading">Weekly Availability</h3>
              <p className="text-xs text-body sm:text-sm">Set your recurring weekly consultation hours.</p>
            </div>
            <CopyMenu onCopy={copyMonday} />
          </div>

          <ul id="days" className="divide-y divide-divider">
            {values.days.map((d) => {
              const rowError = errors[`day_${d.day}`];
              return (
                <li key={d.day} className="py-3.5 first:pt-0 last:pb-0">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                    <div className="sm:w-36 sm:shrink-0 sm:pt-2">
                      <TogglableSwitch
                        size="sm"
                        checked={d.enabled}
                        onChange={(checked) => toggleDay(d, checked)}
                        ariaLabel={`${d.day} available`}
                        label={<span className="font-semibold text-heading">{d.day}</span>}
                      />
                    </div>

                    {d.enabled ? (
                      <div className="min-w-0 flex-1">
                        <div className="grid min-w-0 grid-cols-1 gap-2 2xl:grid-cols-2">
                          {d.slots.map((s, index) => (
                            <div
                              key={s.id}
                              className="grid min-w-0 grid-cols-[minmax(0,1fr)_2rem] items-center gap-x-2 gap-y-1 sm:flex sm:gap-1.5"
                            >
                              <div className="col-start-1 row-start-1 min-w-0 sm:min-w-[8rem] sm:flex-1">
                                <SignupDropdown
                                  name={`${d.day}_${s.id}_start`}
                                  placeholder="From"
                                  options={TIME_OPTIONS}
                                  value={s.start}
                                  onChange={(v) => changeSlot(d, s.id, { start: v })}
                                  icon={<Clock className="h-4 w-4" />}
                                  searchable={false}
                                  error={rowError ? " " : undefined}
                                  portalMenu
                                  portalMenuZIndex={100}
                                />
                              </div>
                              <span className="hidden text-body sm:inline">–</span>
                              <div className="col-start-1 row-start-2 min-w-0 sm:min-w-[8rem] sm:flex-1">
                                <SignupDropdown
                                  name={`${d.day}_${s.id}_end`}
                                  placeholder="To"
                                  options={TIME_OPTIONS}
                                  value={s.end}
                                  onChange={(v) => changeSlot(d, s.id, { end: v })}
                                  searchable={false}
                                  error={rowError ? " " : undefined}
                                  portalMenu
                                  portalMenuZIndex={100}
                                />
                              </div>
                              <div className="col-start-2 row-span-2 row-start-1 flex flex-col items-center justify-center gap-1 sm:row-auto sm:col-auto sm:flex-row">
                                {d.slots.length > 1 && (
                                  <button
                                    type="button"
                                    aria-label={`Remove ${d.day} time slot`}
                                    onClick={() => updateDay(d.day, { slots: d.slots.filter((x) => x.id !== s.id) })}
                                    className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-danger transition-colors hover:bg-danger/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                )}
                                {index === d.slots.length - 1 && d.slots.length < MAX_SLOTS && (
                                  <ImportButton
                                    text=""
                                    icon={<Plus className="h-4 w-4" />}
                                    onClick={() => addSlot(d)}
                                    className="!h-8 !w-8 !shrink-0 !justify-center !gap-0 !px-0"
                                  />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                        <FieldError message={rowError} />
                      </div>
                    ) : (
                      <p className="text-sm text-body sm:pt-2">Not available</p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
          <FieldError message={errors.days} />
        </section>

        {/* ---------- Appointment settings ---------- */}
        <section className={`${cardCls} min-w-0 space-y-4 sm:p-5`}>
          <h3 className="flex items-center gap-2.5 text-base font-semibold text-heading">
            <Settings className="h-5 w-5 shrink-0 text-primary" />
            Appointment Settings
          </h3>

          <div className="grid items-center gap-x-3 gap-y-2 sm:grid-cols-[minmax(0,1fr)_128px]">
            <p className="flex items-center gap-1.5 whitespace-nowrap text-sm text-heading">
              Appointment Slot Interval
              <span title="The length of each bookable time slot." className="inline-flex cursor-help text-body">
                <Info className="h-3.5 w-3.5" aria-label="The length of each bookable time slot." />
              </span>
            </p>
            <SignupDropdown
              name="interval"
              placeholder="Select interval"
              searchable={false}
              options={INTERVAL_OPTIONS}
              value={values.interval}
              onChange={(v) => onChange({ interval: v })}
              triggerClassName="!h-10"
              portalMenu
              portalMenuZIndex={100}
            />
          </div>

          <div id="modes" className="space-y-3.5 border-t border-divider pt-4">
            <TogglableSwitch
              size="sm"
              checked={values.allowVideo}
              onChange={(allowVideo) => onChange({ allowVideo })}
              ariaLabel="Allow video consultations"
              label={
                <span className="flex items-center gap-2 text-heading">
                  <Video className="h-4 w-4 text-primary" />
                  Allow video consultations (Telemedicine)
                </span>
              }
            />
            <TogglableSwitch
              size="sm"
              checked={values.allowInPerson}
              onChange={(allowInPerson) => onChange({ allowInPerson })}
              ariaLabel="Allow in-person appointments"
              label={
                <span className="flex items-center gap-2 text-heading">
                  <Building2 className="h-4 w-4 text-primary" />
                  Allow in-person appointments
                </span>
              }
            />
            <FieldError message={errors.modes} />
          </div>
        </section>
      </div>

      {/* ---------- Tip ---------- */}
      <div className="flex items-center gap-3 rounded-xl bg-primary/5 dark:bg-primary/10 p-4">
        <CalendarCheck className="h-10 w-10 shrink-0 text-primary" />
        <div>
          <p className="text-sm font-semibold text-heading">Tip</p>
          <p className="text-xs text-body sm:text-sm">
            You can add exceptions (holidays, leave or custom hours) in the Exceptions &amp; Time Off tab.
          </p>
        </div>
      </div>
    </div>
  );
};

export default WeeklySchedule;