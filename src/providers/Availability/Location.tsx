"use client";

import React, { useEffect, useState } from "react";
import { Copy, Plus, Trash2, X } from "lucide-react";

import SignupDropdown, { DropdownOption } from "@/components/SignupDropdown";
import AddButton from "@/components/Addbutton";
import ImportButton from "@/components/ImportButton";
import { Errors, Switch, pad, uid } from "../Shared";
import AddInternalButton from "@/components/AddInternalButton";
/* ---------------------------------------------------------------- */
/*  Types + defaults (shared with Telemedicine.tsx)                 */
/* ---------------------------------------------------------------- */
export const DAYS = [
  { key: "mon", label: "Monday" },
  { key: "tue", label: "Tuesday" },
  { key: "wed", label: "Wednesday" },
  { key: "thu", label: "Thursday" },
  { key: "fri", label: "Friday" },
  { key: "sat", label: "Saturday" },
  { key: "sun", label: "Sunday" },
] as const;

export type DayKey = (typeof DAYS)[number]["key"];

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

export interface LocationItem {
  id: string;
  name: string;
  week: WeekSchedule;
}

/** Shift pairs always shown per day (2 pairs = 1 row). */
const BASE_SLOTS = 2;
/** Max shifts per day. */
const MAX_SHIFTS = 4;

export const defaultWeek = (prefix: string): WeekSchedule => {
  const week = {} as WeekSchedule;
  DAYS.forEach(({ key }, i) => {
    const weekday = i < 5;
    week[key] = {
      enabled: weekday,
      shifts: [
        {
          id: `${prefix}-${key}-1`,
          start: weekday ? "09:00" : "",
          end: weekday ? "12:00" : "",
        },
        {
          id: `${prefix}-${key}-2`,
          start: weekday ? "13:00" : "",
          end: weekday ? "17:00" : "",
        },
      ],
    };
  });
  return week;
};

export const initialLocations = (): LocationItem[] => [
  { id: "loc-1", name: "Primary Location", week: defaultWeek("loc-1") },
];

/* ---------------------------------------------------------------- */
/*  Time options                                                    */
/* ---------------------------------------------------------------- */
export const TIME_OPTIONS: DropdownOption[] = Array.from(
  { length: 48 },
  (_, i) => {
    const h = Math.floor(i / 2);
    const m = i % 2 ? 30 : 0;
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return {
      value: `${pad(h)}:${pad(m)}`,
      label: `${h12}:${pad(m)}${h < 12 ? "AM" : "PM"}`, // "9:00AM"
    };
  },
);

/* ---------------------------------------------------------------- */
/*  Validation                                                      */
/* ---------------------------------------------------------------- */
export const validateWeek = (
  week: WeekSchedule,
  prefix: string,
  e: Errors,
) => {
  const enabled = DAYS.filter((d) => week[d.key].enabled);
  if (enabled.length === 0) {
    e[`${prefix}_week`] = "Turn on at least one working day.";
    return;
  }

  enabled.forEach(({ key }) => {
    // fully empty pairs are ignored
    const shifts = week[key].shifts.filter((s) => s.start || s.end);

    if (shifts.length === 0) {
      e[`${prefix}_${key}`] = "Add at least one shift.";
      return;
    }
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

export const validateLocations = (locations: LocationItem[], e: Errors) => {
  locations.forEach((l) => validateWeek(l.week, `loc_${l.id}`, e));
};

/* ---------------------------------------------------------------- */
/*  One day row: label + switch | shift pairs (2 per row) | Add     */
/* ---------------------------------------------------------------- */
const DayRow = ({
  id,
  label,
  day,
  error,
  onChange,
}: {
  id: string;
  label: string;
  day: DaySchedule;
  error?: string;
  onChange: (patch: Partial<DaySchedule>) => void;
}) => {
  const setShift = (sid: string, patch: Partial<Shift>) =>
    onChange({
      shifts: day.shifts.map((s) => (s.id === sid ? { ...s, ...patch } : s)),
    });

  const canAdd = day.enabled && day.shifts.length < MAX_SHIFTS;

  return (
    <div
      id={id}
      className={`rounded-xl border p-3 ${error ? "border-danger" : "border-border"}`}
    >
      <div className="flex flex-wrap items-start gap-3 2xl:flex-nowrap">
        {/* Day + switch */}
        <div className="order-1 flex h-12 items-center gap-4 2xl:w-48 2xl:shrink-0">
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

        {/* Add shift (top-right on small screens, right end on xl) */}
        <button
          type="button"
          disabled={!canAdd}
          onClick={() =>
            onChange({
              shifts: [...day.shifts, { id: uid(), start: "", end: "" }],
            })
          }
          className="order-2 ml-auto inline-flex h-12 shrink-0 cursor-pointer items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-primary transition-colors hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent 2xl:order-3 2xl:ml-0"
        >
          <Plus className="h-4 w-4" />
          Add Shift
        </button>

        {/* Shift pairs: 2 per row */}
        <div className="order-3 grid w-full grid-cols-1 gap-2 md:grid-cols-2 2xl:order-2 2xl:w-auto 2xl:min-w-0 2xl:flex-1">
          {day.shifts.map((s, idx) => (
            <div key={s.id} className="flex min-w-0 items-start gap-1.5 sm:gap-2">
              <SignupDropdown
                className="min-w-0 flex-1"
                name={`${s.id}-start`}
                options={TIME_OPTIONS}
                value={s.start}
                placeholder="Start"
                disabled={!day.enabled}
                onChange={(val) => setShift(s.id, { start: val })}
              />
              <span className="flex h-12 items-center text-body">–</span>
              <SignupDropdown
                className="min-w-0 flex-1"
                name={`${s.id}-end`}
                options={TIME_OPTIONS}
                value={s.end}
                placeholder="End"
                disabled={!day.enabled}
                onChange={(val) => setShift(s.id, { end: val })}
              />
              {idx >= BASE_SLOTS && (
                <button
                  type="button"
                  aria-label="Remove shift"
                  onClick={() =>
                    onChange({ shifts: day.shifts.filter((x) => x.id !== s.id) })
                  }
                  className="flex h-12 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-body transition-colors hover:bg-danger/10 hover:text-danger"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
};

/* ---------------------------------------------------------------- */
/*  Weekly editor with "Copy to All Days" (also used by Telemedicine)*/
/* ---------------------------------------------------------------- */
export const WeekEditor = ({
  week,
  prefix,
  errors,
  onChange,
}: {
  week: WeekSchedule;
  prefix: string;
  errors: Errors;
  onChange: (week: WeekSchedule) => void;
}) => {
  // first enabled day is the source
  const source = DAYS.find((d) => week[d.key].enabled);

  const copyToAll = () => {
    if (!source) return;
    const shifts = week[source.key].shifts;
    const next = {} as WeekSchedule;
    DAYS.forEach(({ key }) => {
      next[key] = {
        enabled: true,
        shifts: shifts.map((s) => ({ id: uid(), start: s.start, end: s.end })),
      };
    });
    onChange(next);
  };

  return (
    <div className="rounded-xl border border-border p-3 sm:p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h4 className="text-sm font-semibold text-heading">
          Set Weekly Availability
        </h4>
        <button
          type="button"
          disabled={!source}
          onClick={copyToAll}
          title={
            source
              ? `Copy ${source.label}'s shifts to every day`
              : "Turn on a day first"
          }
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
        >
          <Copy className="h-3.5 w-3.5" />
          Copy to All Days
        </button>
      </div>

      {errors[`${prefix}_week`] && (
        <p
          id={`${prefix}_week`}
          className="mb-2 rounded-lg border border-danger px-3 py-2 text-xs text-danger"
        >
          {errors[`${prefix}_week`]}
        </p>
      )}

      <div className="space-y-2">
        {DAYS.map(({ key, label }) => (
          <DayRow
            key={key}
            id={`${prefix}_${key}`}
            label={label}
            day={week[key]}
            error={errors[`${prefix}_${key}`]}
            onChange={(patch) =>
              onChange({ ...week, [key]: { ...week[key], ...patch } })
            }
          />
        ))}
      </div>
    </div>
  );
};

/* ---------------------------------------------------------------- */
/*  Location tab                                                    */
/* ---------------------------------------------------------------- */
interface LocationTabProps {
  locations: LocationItem[];
  errors: Errors;
  attemptTick?: number;
  onChange: (locations: LocationItem[]) => void;
}

const LocationTab = ({
  locations,
  errors,
  attemptTick = 0,
  onChange,
}: LocationTabProps) => {
  const [activeId, setActiveId] = useState(locations?.[0]?.id ?? "");
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [nameErr, setNameErr] = useState("");

  const active = locations?.find((l) => l.id === activeId) ?? locations?.[0];

  // On a failed "Next", jump to the first location that has an error
  useEffect(() => {
    const keys = Object.keys(errors);
    const bad = locations.find((l) =>
      keys.some((k) => k.startsWith(`loc_${l.id}_`)),
    );
    if (bad) setActiveId(bad.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attemptTick]);

  const options: DropdownOption[] = locations.map((l) => ({
    value: l.id,
    label: l.name,
  }));

  const updateWeek = (id: string, week: WeekSchedule) =>
    onChange(locations.map((l) => (l.id === id ? { ...l, week } : l)));

  const closeAdd = () => {
    setAdding(false);
    setName("");
    setNameErr("");
  };

  const addLocation = () => {
    const n = name.trim();
    if (!n) {
      setNameErr("Enter a location name.");
      return;
    }
    if (locations.some((l) => l.name.toLowerCase() === n.toLowerCase())) {
      setNameErr("This location already exists.");
      return;
    }
    const id = uid();
    onChange([...locations, { id, name: n, week: defaultWeek(id) }]);
    setActiveId(id);
    closeAdd();
  };

  const removeActive = () => {
    if (!active || locations.length < 2) return;
    const rest = locations.filter((l) => l.id !== active.id);
    onChange(rest);
    setActiveId(rest[0].id);
  };

  return (
    <div className="space-y-4">
      {/* Select location + Add another */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex w-full items-end gap-2 sm:max-w-md">
          <SignupDropdown
            className="min-w-0 flex-1"
            name="activeLocation"
            label="Select Location"
            placeholder="Select location"
            options={options}
            value={active?.id ?? ""}
            onChange={setActiveId}
          />
          {locations.length > 1 && (
            <button
              type="button"
              aria-label="Remove this location"
              title="Remove this location"
              onClick={removeActive}
              className="flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-border text-danger transition-colors hover:bg-danger/10"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>

       <AddInternalButton
  text="Add Another Location"
  onClick={() => setAdding((a) => !a)}
/>
      </div>

      {/* Inline add-location form */}
      {adding && (
        <div className="rounded-xl border border-border p-3 sm:p-4">
          <label
            htmlFor="newLocationName"
            className="mb-1.5 block text-sm font-medium text-label"
          >
            Location name <span className="text-danger">*</span>
          </label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              id="newLocationName"
              autoFocus
              value={name}
              maxLength={80}
              placeholder="e.g. Sunrise Medical Group – Los Angeles, CA"
              onChange={(e) => {
                setName(e.target.value);
                setNameErr("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addLocation();
                }
              }}
              className={`h-12 min-w-0 flex-1 rounded-xl border bg-card px-4 text-sm text-heading outline-none placeholder:text-body/60 focus:border-primary ${
                nameErr ? "border-danger" : "border-border"
              }`}
            />
            <AddButton text="Add Location" icon={null} onClick={addLocation} />
            <ImportButton text="Cancel" icon={null} onClick={closeAdd} />
          </div>
          {nameErr && <p className="mt-1 text-xs text-danger">{nameErr}</p>}
        </div>
      )}

      {/* Weekly availability for the selected location */}
      {active && (
        <WeekEditor
          week={active.week}
          prefix={`loc_${active.id}`}
          errors={errors}
          onChange={(w) => updateWeek(active.id, w)}
        />
      )}
    </div>
  );
};

export default LocationTab;