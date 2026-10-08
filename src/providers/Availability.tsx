"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  CalendarX,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Plus,
  Trash2,
  Video,
  X,
} from "lucide-react";

import SignupDropdown, { DropdownOption } from "@/components/SignupDropdown";
import DatePicker from "@/components/Datepicker";
import AddButton from "@/components/Addbutton";
import { FieldError } from "@/components/SignupField";
import {
  ChipSelect,
  Errors,
  StepProps,
  Switch,
  TextArea,
  US_STATE_OPTIONS,
  cardCls,
  pad,
  todayISO,
  toOptions,
  uid,
} from "./Shared";

/* ---------------------------------------------------------------- */
/*  Types + defaults                                                */
/* ---------------------------------------------------------------- */
const DAYS = [
  { key: "mon", label: "Monday" },
  { key: "tue", label: "Tuesday" },
  { key: "wed", label: "Wednesday" },
  { key: "thu", label: "Thursday" },
  { key: "fri", label: "Friday" },
  { key: "sat", label: "Saturday" },
  { key: "sun", label: "Sunday" },
] as const;

type DayKey = (typeof DAYS)[number]["key"];

export interface Shift {
  id: string;
  start: string; // "HH:mm" (24h) or ""
  end: string;
}
export interface DaySchedule {
  enabled: boolean;
  shifts: Shift[];
}
export type WeekSchedule = Record<DayKey, DaySchedule>;

export interface BlockedDate {
  id: string;
  type: "single" | "range";
  start: string; // ISO
  end: string; // ISO (same as start for single)
  reason: string;
  notes: string;
}

export interface AvailabilityValues {
  timezone: string;
  duration: string;
  buffer: string;
  telemedicineEnabled: boolean;
  inPersonEnabled: boolean;
  locationSchedule: WeekSchedule;
  teleSameAsInPerson: boolean;
  teleJurisdictions: string[];
  teleAppointmentType: string;
  teleSchedule: WeekSchedule;
  blocked: BlockedDate[];
}

const defaultWeek = (prefix: string): WeekSchedule => {
  const week = {} as WeekSchedule;
  DAYS.forEach(({ key }, i) => {
    const weekday = i < 5;
    week[key] = {
      enabled: weekday,
      shifts: weekday
        ? [
            { id: `${prefix}-${key}-1`, start: "09:00", end: "12:00" },
            { id: `${prefix}-${key}-2`, start: "13:00", end: "17:00" },
          ]
        : [{ id: `${prefix}-${key}-1`, start: "", end: "" }],
    };
  });
  return week;
};

export const initialAvailability = (): AvailabilityValues => ({
  timezone: "America/Los_Angeles",
  duration: "30",
  buffer: "5",
  telemedicineEnabled: true,
  inPersonEnabled: true,
  locationSchedule: defaultWeek("loc"),
  teleSameAsInPerson: true,
  teleJurisdictions: [],
  teleAppointmentType: "video",
  teleSchedule: defaultWeek("tele"),
  blocked: [],
});

/* ---------------------------------------------------------------- */
/*  Option lists                                                    */
/* ---------------------------------------------------------------- */
const TIMEZONES: DropdownOption[] = [
  { value: "America/New_York", label: "(GMT-05:00) Eastern Time (US & Canada)" },
  { value: "America/Chicago", label: "(GMT-06:00) Central Time (US & Canada)" },
  { value: "America/Denver", label: "(GMT-07:00) Mountain Time (US & Canada)" },
  { value: "America/Los_Angeles", label: "(GMT-08:00) Pacific Time (US & Canada)" },
  { value: "America/Anchorage", label: "(GMT-09:00) Alaska" },
  { value: "Pacific/Honolulu", label: "(GMT-10:00) Hawaii" },
  { value: "Europe/London", label: "(GMT+00:00) London" },
  { value: "Europe/Paris", label: "(GMT+01:00) Paris, Berlin" },
  { value: "Asia/Dubai", label: "(GMT+04:00) Dubai" },
  { value: "Asia/Kolkata", label: "(GMT+05:30) India Standard Time" },
];

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

const TELE_TYPES: DropdownOption[] = [
  { value: "video", label: "Video Consultation" },
  { value: "phone", label: "Phone Consultation" },
  { value: "chat", label: "Chat Consultation" },
];

const REASONS = toOptions([
  "Vacation",
  "Conference",
  "Personal Leave",
  "Sick Leave",
  "Holiday",
  "Other",
]);

const TIME_OPTIONS: DropdownOption[] = Array.from({ length: 48 }, (_, i) => {
  const h = Math.floor(i / 2);
  const m = i % 2 ? 30 : 0;
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return {
    value: `${pad(h)}:${pad(m)}`,
    label: `${pad(h12)}:${pad(m)} ${h < 12 ? "AM" : "PM"}`,
  };
});

/* ---------------------------------------------------------------- */
/*  Date helpers                                                    */
/* ---------------------------------------------------------------- */
const fromISO = (s: string) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};
const toISO = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

const fmt = (iso: string) =>
  fromISO(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const eachDay = (startISO: string, endISO: string) => {
  const out: string[] = [];
  const cur = fromISO(startISO);
  const end = fromISO(endISO);
  let guard = 0;
  while (cur <= end && guard < 366) {
    out.push(toISO(cur));
    cur.setDate(cur.getDate() + 1);
    guard++;
  }
  return out;
};

/* ---------------------------------------------------------------- */
/*  Validation                                                      */
/* ---------------------------------------------------------------- */
const validateWeek = (week: WeekSchedule, prefix: string, e: Errors) => {
  const enabled = DAYS.filter((d) => week[d.key].enabled);
  if (enabled.length === 0) {
    e[`${prefix}_week`] = "Turn on at least one working day.";
    return;
  }
  enabled.forEach(({ key }) => {
    const shifts = week[key].shifts;
    if (shifts.some((s) => !s.start || !s.end)) {
      e[`${prefix}_${key}`] = "Select a start and end time for every shift.";
      return;
    }
    if (shifts.some((s) => s.end <= s.start)) {
      e[`${prefix}_${key}`] = "End time must be after start time.";
      return;
    }
    const sorted = [...shifts].sort((a, b) => a.start.localeCompare(b.start));
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i].start < sorted[i - 1].end) {
        e[`${prefix}_${key}`] = "Shifts can't overlap.";
        return;
      }
    }
  });
};

export const validateAvailability = (v: AvailabilityValues): Errors => {
  const e: Errors = {};
  if (!v.timezone) e.timezone = "Timezone is required.";
  if (!v.duration) e.duration = "Appointment duration is required.";

  if (!v.inPersonEnabled && !v.telemedicineEnabled)
    e.modes = "Turn on telemedicine or in-person availability.";

  if (v.inPersonEnabled) validateWeek(v.locationSchedule, "loc", e);

  if (v.telemedicineEnabled) {
    if (v.teleJurisdictions.length === 0)
      e.teleJurisdictions = "Select at least one jurisdiction.";
    if (!v.teleSameAsInPerson) validateWeek(v.teleSchedule, "tele", e);
    else if (!v.inPersonEnabled)
      e.tele_week =
        "Turn on in-person availability or set different hours for telemedicine.";
  }
  return e;
};

/* ---------------------------------------------------------------- */
/*  Weekly schedule editor                                          */
/* ---------------------------------------------------------------- */
const DayRow = ({
  label,
  day,
  error,
  onChange,
}: {
  label: string;
  day: DaySchedule;
  error?: string;
  onChange: (patch: Partial<DaySchedule>) => void;
}) => {
  const setShift = (id: string, patch: Partial<Shift>) =>
    onChange({
      shifts: day.shifts.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    });

  return (
    <div
      className={`rounded-xl border p-3 ${error ? "border-danger" : "border-border"}`}
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start">
        <div className="flex w-full items-center justify-between lg:h-12 lg:w-48 lg:shrink-0 lg:justify-start lg:gap-4">
          <span
            className={`w-24 text-sm font-semibold ${
              day.enabled ? "text-heading" : "text-body"
            }`}
          >
            {label}
          </span>
          <Switch
            checked={day.enabled}
            onChange={(c) => onChange({ enabled: c })}
            label={`${label} availability`}
          />
        </div>

        <div className="min-w-0 flex-1 space-y-1">
          {day.shifts.map((s) => (
            <div key={s.id} className="flex items-start gap-2">
              <SignupDropdown
                className="min-w-0 flex-1"
                name={`${s.id}-start`}
                options={TIME_OPTIONS}
                value={s.start}
                placeholder="Select time"
                disabled={!day.enabled}
                onChange={(val) => setShift(s.id, { start: val })}
              />
              <span className="flex h-12 items-center text-body">–</span>
              <SignupDropdown
                className="min-w-0 flex-1"
                name={`${s.id}-end`}
                options={TIME_OPTIONS}
                value={s.end}
                placeholder="Select time"
                disabled={!day.enabled}
                onChange={(val) => setShift(s.id, { end: val })}
              />
              {day.shifts.length > 1 && (
                <button
                  type="button"
                  aria-label="Remove shift"
                  onClick={() =>
                    onChange({ shifts: day.shifts.filter((x) => x.id !== s.id) })
                  }
                  className="flex h-12 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-body transition-colors hover:bg-danger/10 hover:text-danger"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        {day.enabled && day.shifts.length < 3 && (
          <button
            type="button"
            onClick={() =>
              onChange({
                shifts: [...day.shifts, { id: uid(), start: "", end: "" }],
              })
            }
            className="inline-flex h-12 shrink-0 cursor-pointer items-center gap-1.5 self-start rounded-lg px-3 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
          >
            <Plus className="h-4 w-4" />
            Add Shift
          </button>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
};

const WeekEditor = ({
  week,
  prefix,
  errors,
  onChange,
}: {
  week: WeekSchedule;
  prefix: string;
  errors: Errors;
  onChange: (week: WeekSchedule) => void;
}) => (
  <div className="space-y-2">
    {errors[`${prefix}_week`] && (
      <p className="rounded-lg border border-danger px-3 py-2 text-xs text-danger">
        {errors[`${prefix}_week`]}
      </p>
    )}
    {DAYS.map(({ key, label }) => (
      <DayRow
        key={key}
        label={label}
        day={week[key]}
        error={errors[`${prefix}_${key}`]}
        onChange={(patch) => onChange({ ...week, [key]: { ...week[key], ...patch } })}
      />
    ))}
  </div>
);

/* ---------------------------------------------------------------- */
/*  Blocked dates (calendar + form + list)                          */
/* ---------------------------------------------------------------- */
const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const BlockedDates = ({
  blocked,
  onChange,
}: {
  blocked: BlockedDate[];
  onChange: (list: BlockedDate[]) => void;
}) => {
  const today = todayISO();
  const now = new Date();
  const [viewY, setViewY] = useState(now.getFullYear());
  const [viewM, setViewM] = useState(now.getMonth());
  const [mode, setMode] = useState<"single" | "range">("single");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [formErr, setFormErr] = useState("");
  const [sort, setSort] = useState("asc");

  const blockedSet = useMemo(() => {
    const s = new Set<string>();
    blocked.forEach((b) => eachDay(b.start, b.end).forEach((d) => s.add(d)));
    return s;
  }, [blocked]);

  const sorted = useMemo(
    () =>
      [...blocked].sort((a, b) =>
        sort === "asc" ? a.start.localeCompare(b.start) : b.start.localeCompare(a.start),
      ),
    [blocked, sort],
  );

  const shiftMonth = (delta: number) => {
    const d = new Date(viewY, viewM + delta, 1);
    setViewY(d.getFullYear());
    setViewM(d.getMonth());
  };

  const firstWeekday = new Date(viewY, viewM, 1).getDay();
  const total = new Date(viewY, viewM + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: total }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const pickDay = (iso: string) => {
    setFormErr("");
    if (mode === "single") return setStart(iso);
    if (!start || end) {
      setStart(iso);
      setEnd("");
    } else if (iso >= start) setEnd(iso);
    else setStart(iso);
  };

  const add = () => {
    if (!start || (mode === "range" && !end)) {
      setFormErr(mode === "single" ? "Select a date." : "Select a start and end date.");
      return;
    }
    if (mode === "range" && end < start) {
      setFormErr("End date must be on or after the start date.");
      return;
    }
    onChange([
      ...blocked,
      {
        id: uid(),
        type: mode,
        start,
        end: mode === "single" ? start : end,
        reason,
        notes,
      },
    ]);
    setStart("");
    setEnd("");
    setReason("");
    setNotes("");
    setFormErr("");
  };

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      {/* Calendar */}
      <div className="rounded-xl border border-border p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Previous month"
              onClick={() => shiftMonth(-1)}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-label transition-colors hover:bg-primary/10 hover:text-primary"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="min-w-[8.5rem] text-center text-sm font-semibold text-heading">
              {new Date(viewY, viewM, 1).toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </span>
            <button
              type="button"
              aria-label="Next month"
              onClick={() => shiftMonth(1)}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-label transition-colors hover:bg-primary/10 hover:text-primary"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <button
            type="button"
            onClick={() => {
              setViewY(now.getFullYear());
              setViewM(now.getMonth());
            }}
            className="cursor-pointer rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
          >
            Today
          </button>
        </div>

        <div className="mb-1 grid grid-cols-7 text-center">
          {WEEKDAYS.map((w) => (
            <span key={w} className="py-1.5 text-xs font-medium text-body">
              {w}
            </span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-y-1">
          {cells.map((d, i) => {
            if (d === null) return <span key={`e-${i}`} />;
            const iso = `${viewY}-${pad(viewM + 1)}-${pad(d)}`;
            const picked =
              iso === start ||
              iso === end ||
              (mode === "range" && start && end && iso > start && iso < end);
            const isBlocked = blockedSet.has(iso);
            return (
              <button
                key={iso}
                type="button"
                onClick={() => pickDay(iso)}
                className={`mx-auto flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-sm transition-colors duration-150 ${
                  picked
                    ? "bg-primary font-semibold text-white"
                    : isBlocked
                      ? "bg-danger/10 font-medium text-danger"
                      : iso === today
                        ? "border border-primary font-medium text-primary hover:bg-primary/10"
                        : "text-heading hover:bg-primary/10"
                }`}
              >
                {d}
              </button>
            );
          })}
        </div>
      </div>

      {/* Form + list */}
      <div className="space-y-4">
        <div className="rounded-xl border border-border p-4">
          <h4 className="mb-3 text-sm font-semibold text-heading">
            Add Blocked Date
          </h4>

          <div
            role="tablist"
            className="mb-4 inline-flex rounded-lg border border-border p-0.5"
          >
            {(
              [
                { v: "single", l: "Single Date" },
                { v: "range", l: "Date Range" },
              ] as const
            ).map((o) => (
              <button
                key={o.v}
                type="button"
                role="tab"
                aria-selected={mode === o.v}
                onClick={() => {
                  setMode(o.v);
                  setEnd("");
                  setFormErr("");
                }}
                className={`cursor-pointer rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                  mode === o.v
                    ? "bg-primary/10 text-primary"
                    : "text-body hover:text-heading"
                }`}
              >
                {o.l}
              </button>
            ))}
          </div>

          <div className="grid gap-x-4 sm:grid-cols-2">
            {mode === "single" ? (
              <DatePicker
                name="blockedDate"
                label="Date *"
                value={start}
                onChange={(v) => {
                  setStart(v);
                  setFormErr("");
                }}
                minDate={today}
                error={formErr}
              />
            ) : (
              <>
                <DatePicker
                  name="blockedFrom"
                  label="From *"
                  value={start}
                  onChange={(v) => {
                    setStart(v);
                    if (end && v > end) setEnd("");
                    setFormErr("");
                  }}
                  minDate={today}
                  error={formErr && !start ? formErr : undefined}
                />
                <DatePicker
                  name="blockedTo"
                  label="To *"
                  value={end}
                  onChange={(v) => {
                    setEnd(v);
                    setFormErr("");
                  }}
                  minDate={start || today}
                  error={formErr && start ? formErr : undefined}
                />
              </>
            )}
            <SignupDropdown
              name="blockedReason"
              label="Reason (Optional)"
              placeholder="Select reason"
              options={REASONS}
              value={reason}
              onChange={setReason}
            />
          </div>

          <TextArea
            name="blockedNotes"
            label="Notes (Optional)"
            placeholder="Add a note..."
            maxLength={200}
            rows={3}
            value={notes}
            onChange={setNotes}
          />

          <div className="mt-3 flex justify-end">
            <AddButton text="Add Blocked Date" icon={null} onClick={add} />
          </div>
        </div>

        <div className="rounded-xl border border-border p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h4 className="text-sm font-semibold text-heading">
              Blocked Dates List ({blocked.length})
            </h4>
            <SignupDropdown
              className="!w-[190px]"
              name="blockedSort"
              options={[
                { value: "asc", label: "Date (Upcoming)" },
                { value: "desc", label: "Date (Latest)" },
              ]}
              value={sort}
              onChange={setSort}
            />
          </div>

          {sorted.length === 0 ? (
            <p className="rounded-lg bg-primary/5 px-3 py-4 text-center text-sm text-body">
              No blocked dates yet. Add a date or range above.
            </p>
          ) : (
            <ul className="divide-y divide-divider overflow-hidden rounded-lg border border-border">
              {sorted.map((b) => (
                <li key={b.id} className="flex items-center gap-3 px-3 py-2.5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-danger/10 text-danger">
                    <CalendarX className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-heading">
                      {b.type === "single" || b.start === b.end
                        ? fmt(b.start)
                        : `${fmt(b.start)} – ${fmt(b.end)}`}
                    </span>
                    <span className="block truncate text-xs text-body">
                      {b.reason || "No reason given"}
                      {b.notes ? ` · ${b.notes}` : ""}
                    </span>
                  </span>
                  <button
                    type="button"
                    aria-label="Delete blocked date"
                    onClick={() => onChange(blocked.filter((x) => x.id !== b.id))}
                    className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-danger transition-colors hover:bg-danger/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
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

  // Jump to the tab that holds the first error after a failed "Next"
  const firstKey = Object.keys(errors)[0];
  useEffect(() => {
    if (!firstKey) return;
    if (firstKey.startsWith("loc_")) setTab("location");
    else if (firstKey.startsWith("tele")) setTab("telemedicine");
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
        <div className="grid gap-4 md:grid-cols-3">
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

        <div className="mt-2 grid gap-4 sm:grid-cols-2">
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
        <div
          role="tablist"
          className="-mx-1 mb-5 flex gap-1 overflow-x-auto border-b border-divider px-1"
        >
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={tab === t.key}
              onClick={() => setTab(t.key)}
              className={`-mb-px shrink-0 cursor-pointer border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                tab === t.key
                  ? "border-primary text-primary"
                  : "border-transparent text-body hover:text-heading"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Location schedule */}
        {tab === "location" &&
          (v.inPersonEnabled ? (
            <div>
              <h3 className="text-base font-semibold text-heading">
                Location Schedule
              </h3>
              <p className="mb-4 mt-0.5 text-xs text-body">
                Set your weekly working hours for in-person visits. Add more than
                one shift for breaks.
              </p>
              <WeekEditor
                week={v.locationSchedule}
                prefix="loc"
                errors={errors}
                onChange={(w) => onChange({ locationSchedule: w })}
              />
            </div>
          ) : (
            <Notice>Turn on In-person Availability to set your location schedule.</Notice>
          ))}

        {/* Telemedicine schedule */}
        {tab === "telemedicine" &&
          (v.telemedicineEnabled ? (
            <div>
              <h3 className="text-base font-semibold text-heading">
                Telemedicine Schedule
              </h3>
              <p className="mb-4 mt-0.5 text-xs text-body">
                Set your availability for video consultations. You can use your
                in-person hours or set different hours.
              </p>

              <div className="mb-4 grid gap-3 sm:grid-cols-2">
                {[
                  {
                    same: true,
                    title: "Use same hours as in-person",
                    desc: "Telemedicine will use the same weekly hours as your location schedule.",
                  },
                  {
                    same: false,
                    title: "Set different hours for telemedicine",
                    desc: "Configure separate working hours for telemedicine consultations.",
                  },
                ].map((o) => (
                  <label
                    key={o.title}
                    className="flex cursor-pointer items-start gap-3"
                  >
                    <input
                      type="radio"
                      name="teleSame"
                      checked={v.teleSameAsInPerson === o.same}
                      onChange={() => onChange({ teleSameAsInPerson: o.same })}
                      className="mt-0.5 h-4 w-4 cursor-pointer accent-primary"
                    />
                    <span>
                      <span className="block text-sm font-semibold text-heading">
                        {o.title}
                      </span>
                      <span className="block text-xs text-body">{o.desc}</span>
                    </span>
                  </label>
                ))}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <ChipSelect
                  name="teleJurisdictions"
                  label="Select Telemedicine Jurisdictions *"
                  placeholder="Select states"
                  options={US_STATE_OPTIONS}
                  value={v.teleJurisdictions}
                  onChange={(val) => onChange({ teleJurisdictions: val })}
                  error={errors.teleJurisdictions}
                />
                <SignupDropdown
                  name="teleAppointmentType"
                  label="Default Telemedicine Appointment Type"
                  placeholder="Select type"
                  options={TELE_TYPES}
                  value={v.teleAppointmentType}
                  onChange={(val) => onChange({ teleAppointmentType: val })}
                />
              </div>

              {v.teleSameAsInPerson ? (
                <>
                  <FieldError message={errors.tele_week} />
                  <p className="mt-2 rounded-xl bg-primary/5 px-4 py-3 text-sm text-body">
                    Telemedicine follows your Location Schedule.
                  </p>
                </>
              ) : (
                <div className="mt-2">
                  <WeekEditor
                    week={v.teleSchedule}
                    prefix="tele"
                    errors={errors}
                    onChange={(w) => onChange({ teleSchedule: w })}
                  />
                </div>
              )}
            </div>
          ) : (
            <Notice>Turn on Telemedicine Availability to set your telemedicine schedule.</Notice>
          ))}

        {/* Blocked dates */}
        {tab === "blocked" && (
          <div>
            <h3 className="text-base font-semibold text-heading">Blocked Dates</h3>
            <p className="mb-4 mt-0.5 text-xs text-body">
              Set specific dates or date ranges when you are not available for
              appointments.
            </p>
            <BlockedDates
              blocked={v.blocked}
              onChange={(list) => onChange({ blocked: list })}
            />
          </div>
        )}
      </section>
    </div>
  );
};

export default Availability;