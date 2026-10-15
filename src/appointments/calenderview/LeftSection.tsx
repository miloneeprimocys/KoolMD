"use client";

import React from "react";
import { Building2, MapPin, Search, Video } from "lucide-react";

import Calendar, { dayKey, sameDay } from "@/components/Calendar";
import { checkboxCls, initials } from "../Rightsection";

/* ---------------------------------------------------------------- */
/*  Static data                                                     */
/* ---------------------------------------------------------------- */
export const PROVIDERS = [
  { name: "Dr. Sarah Wilson", specialty: "Internal Medicine" },
  { name: "Dr. Michael Chen", specialty: "Cardiology" },
  { name: "Dr. Emily Carter", specialty: "Dermatology" },
  { name: "Dr. James Miller", specialty: "Pediatrics" },
];

export const LOCATIONS = [
  { name: "Sunrise Medical Group – LA", full: "Sunrise Medical Group – Los Angeles, CA", filter: "Sunrise Medical Group", icon: MapPin },
  { name: "Downtown Clinic", full: "Downtown Clinic – New York, NY", filter: "Downtown Clinic", icon: Building2 },
  { name: "Virtual / Telemedicine", full: "Virtual / Telemedicine", filter: "Virtual / Telemedicine", icon: Video },
];

export const toggleIn = (set: Set<number>, i: number) => {
  const next = new Set(set);
  if (next.has(i)) next.delete(i);
  else next.add(i);
  return next;
};

/* ---------------------------------------------------------------- */
/*  Small pieces                                                    */
/* ---------------------------------------------------------------- */
const Avatar = ({ name, className = "" }: { name: string; className?: string }) => (
  <span
    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary ${className}`}
  >
    {initials(name)}
  </span>
);

/* ---------------------------------------------------------------- */
/*  Component                                                       */
/* ---------------------------------------------------------------- */
type LeftSectionProps = {
  selected: Date;
  today: Date | null;
  miniMonth: Date;
  setMiniMonth: (d: Date) => void;
  go: (d: Date) => void;
  provQuery: string;
  setProvQuery: (v: string) => void;
  provOn: Set<number>;
  setProvOn: (s: Set<number>) => void;
  locOn: Set<number>;
  setLocOn: (s: Set<number>) => void;
};

const LeftSection = ({
  selected,
  today,
  miniMonth,
  setMiniMonth,
  go,
  provQuery,
  setProvQuery,
  provOn,
  setProvOn,
  locOn,
  setLocOn,
}: LeftSectionProps) => {
  return (
    <div className="grid w-full gap-5 rounded-[14px] border border-border bg-card p-4 md:grid-cols-3 2xl:flex 2xl:w-[280px] 2xl:shrink-0 2xl:flex-col 2xl:self-stretch">
      {/* Mini calendar (any month) */}
      <div>
        <Calendar
          month={miniMonth}
          selectedDate={selected}
          today={today}
          onSelectDate={go}
          onMonthChange={setMiniMonth}
          showMonthNavigation
          compact
        />
      </div>

      {/* Providers */}
      <div>
        <p className="mb-2 text-sm font-semibold text-heading">Providers</p>
        <div className="relative mb-3">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-body" />
          <input
            type="text"
            value={provQuery}
            onChange={(e) => setProvQuery(e.target.value)}
            placeholder="Search provider..."
            className="h-10 w-full rounded-lg border border-border bg-card pl-9 pr-3 text-xs text-heading outline-none placeholder:text-placeholder focus:border-primary"
          />
        </div>
        <label className="mb-2.5 flex cursor-pointer items-center gap-2.5 text-sm font-medium text-heading 2xl:mb-4">
          <input
            type="checkbox"
            checked={provOn.size === PROVIDERS.length}
            onChange={() =>
              setProvOn(provOn.size === PROVIDERS.length ? new Set() : new Set(PROVIDERS.map((_, i) => i)))
            }
            className={checkboxCls}
          />
          All Providers
        </label>
        <div className="space-y-2.5 2xl:space-y-4">
          {PROVIDERS.map((p, i) => ({ ...p, i }))
            .filter((p) => p.name.toLowerCase().includes(provQuery.trim().toLowerCase()))
            .map((p) => (
              <label key={p.name} className="flex cursor-pointer items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={provOn.has(p.i)}
                  onChange={() => setProvOn(toggleIn(provOn, p.i))}
                  className={checkboxCls}
                />
                <Avatar name={p.name} />
                <span className="min-w-0">
                  <span className="block truncate text-xs font-semibold text-heading">{p.name}</span>
                  <span className="block truncate text-[11px] text-body">{p.specialty}</span>
                </span>
              </label>
            ))}
        </div>
      </div>

      {/* Locations */}
      <div>
        <p className="mb-3 text-sm font-semibold text-heading">Locations</p>
        <label className="mb-2.5 flex cursor-pointer items-center gap-2.5 text-sm font-medium text-heading 2xl:mb-4">
          <input
            type="checkbox"
            checked={locOn.size === LOCATIONS.length}
            onChange={() =>
              setLocOn(locOn.size === LOCATIONS.length ? new Set() : new Set(LOCATIONS.map((_, i) => i)))
            }
            className={checkboxCls}
          />
          All Locations
        </label>
        <div className="space-y-2.5 2xl:space-y-4">
          {LOCATIONS.map((l, i) => (
            <label key={l.name} className="flex cursor-pointer items-center gap-2.5">
              <input
                type="checkbox"
                checked={locOn.has(i)}
                onChange={() => setLocOn(toggleIn(locOn, i))}
                className={checkboxCls}
              />
              <l.icon className="h-4 w-4 shrink-0 text-body" />
              <span className="min-w-0 truncate text-xs text-heading">{l.name}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LeftSection;