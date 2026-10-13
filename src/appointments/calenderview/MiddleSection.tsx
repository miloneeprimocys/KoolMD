"use client";

import React from "react";
import { CalendarDays } from "lucide-react";

import { initials } from "../Rightsection";
import {
  buildMonth,
  dayKey,
  fmt,
  sameDay,
  PROVIDERS,
  LOCATIONS,
  WEEKDAYS,
} from "./LeftSection";

/* ---------------------------------------------------------------- */
/*  Types                                                           */
/* ---------------------------------------------------------------- */
export type ColorKey = keyof typeof COLORS;

const COLORS = {
  blue: "border-l-primary bg-primary/10",
  green: "border-l-emerald-500 bg-emerald-100 dark:bg-emerald-950/40",
  red: "border-l-red-400 bg-red-100 dark:bg-red-950/40",
  purple: "border-l-violet-500 bg-violet-100 dark:bg-violet-950/40",
  amber: "border-l-amber-400 bg-amber-100 dark:bg-amber-950/40",
} as const;

export type Appt = {
  id: string;
  date: Date;
  name: string;
  col: number;
  start: number;
  dur: number;
  type: string;
  color: ColorKey;
  loc: number;
  status: string;
};

export type View = "Day" | "Week" | "Month";

/* ---------------------------------------------------------------- */
/*  Grid constants                                                  */
/* ---------------------------------------------------------------- */
const START_HOUR = 8;
const END_HOUR = 18; // grid runs 8 AM – 6 PM
const HOUR = 88; // px per hour
const GUTTER = 56; // px, time labels column
const COL_MIN = 150; // px, minimum width of a provider column
const HOURS = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i);
const hourLabel = (h: number) => `${h % 12 === 0 ? 12 : h % 12}:00 ${h < 12 ? "AM" : "PM"}`;

export const fmtTime = (min: number) => {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h % 12 === 0 ? 12 : h % 12}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
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

const ApptChip = ({
  a,
  active,
  onPick,
}: {
  a: Appt;
  active: boolean;
  onPick: (a: Appt) => void;
}) => (
  <button
    type="button"
    onClick={() => onPick(a)}
    title={`${fmtTime(a.start)} · ${a.name} · ${a.type}`}
    className={`block w-full cursor-pointer truncate rounded border-l-[3px] px-2 py-1 text-left text-[10px] leading-tight text-heading transition-shadow hover:shadow-sm ${COLORS[a.color]} ${
      active ? "ring-2 ring-primary/40" : ""
    }`}
  >
    <span className="text-body">{fmtTime(a.start)}</span> {a.name}
  </button>
);

/* ---------------------------------------------------------------- */
/*  Component                                                       */
/* ---------------------------------------------------------------- */
type MiddleSectionProps = {
  height: number | null;
  view: View;
  heading: string;
  selected: Date;
  today: Date | null;
  now: Date | null;
  columns: { name: string; specialty: string; i: number }[];
  dayItems: Appt[];
  weekDays: Date[];
  panelAppt: Appt | null;
  forDay: (d: Date) => Appt[];
  openDay: (d: Date) => void;
  setSelected: (d: Date) => void;
  setPicked: (a: Appt) => void;
};

const MiddleSection = ({
  height,
  view,
  heading,
  selected,
  today,
  now,
  columns,
  dayItems,
  weekDays,
  panelAppt,
  forDay,
  openDay,
  setSelected,
  setPicked,
}: MiddleSectionProps) => {
  const monthCells = buildMonth(selected);

  const nowMin = now ? now.getHours() * 60 + now.getMinutes() : 0;
  const showNow =
    !!today && sameDay(today, selected) && nowMin >= START_HOUR * 60 && nowMin <= END_HOUR * 60;
  const nowTop = (nowMin - START_HOUR * 60) * (HOUR / 60) + 8;

  const gridCols = `${GUTTER}px repeat(${columns.length}, minmax(${COL_MIN}px, 1fr))`;

  return (
    <div
      className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-[14px] border border-border bg-card"
      style={height ? { height } : undefined}
    >
      <h3 className="shrink-0 px-4 py-4 text-sm font-semibold text-heading sm:text-base">{heading}</h3>

      {/* ---------- DAY ---------- */}
      {view === "Day" &&
        (columns.length === 0 ? (
          <p className="border-t border-border px-4 py-12 text-center text-sm text-body">
            Select at least one provider to see the schedule.
          </p>
        ) : (
          <div className="custom-scrollbar min-h-0 flex-1 overflow-auto">
            <div style={{ minWidth: GUTTER + columns.length * COL_MIN }}>
              <div
                className="sticky top-0 z-30 grid border-y border-border bg-card"
                style={{ gridTemplateColumns: gridCols }}
              >
                <div className="sticky left-0 z-10 bg-card" />
                {columns.map((p) => (
                  <div key={p.name} className="flex min-w-0 items-center gap-2 border-l border-border px-2 py-2.5">
                    <Avatar name={p.name} />
                    <span className="min-w-0">
                      <span className="block truncate text-xs font-semibold text-heading">{p.name}</span>
                      <span className="block truncate text-[11px] text-body">{p.specialty}</span>
                    </span>
                  </div>
                ))}
              </div>

              <div className="grid" style={{ gridTemplateColumns: gridCols }}>
                <div className="sticky left-0 z-20 bg-card pt-2">
                  {HOURS.map((h) => (
                    <div key={h} style={{ height: HOUR }} className="pr-2 text-right">
                      <span className="relative -top-2 text-[10px] text-body">{hourLabel(h)}</span>
                    </div>
                  ))}
                </div>

                {columns.map((c) => (
                  <div
                    key={c.name}
                    className="relative min-w-0 border-l border-border"
                    style={{ height: HOURS.length * HOUR + 8 }}
                  >
                    {HOURS.map((h) => (
                      <div
                        key={h}
                        className="absolute inset-x-0 border-t border-border/60"
                        style={{ top: (h - START_HOUR) * HOUR + 8 }}
                      />
                    ))}

                    {dayItems
                      .filter((a) => a.col === c.i)
                      .map((a) => {
                        const top = (a.start - START_HOUR * 60) * (HOUR / 60) + 10;
                        const height = a.dur * (HOUR / 60) - 4;
                        // 30-min slots are ~40px tall: too short for 3 lines
                        const compact = height < 56;

                        return (
                          <button
                            key={a.id}
                            type="button"
                            onClick={() => setPicked(a)}
                            style={{ top, height }}
                            className={`absolute inset-x-1.5 flex cursor-pointer flex-col justify-center gap-0.5 overflow-hidden rounded-md border-l-4 px-2.5 py-1.5 text-left leading-[1.2] transition-shadow hover:shadow-md ${COLORS[a.color]} ${
                              panelAppt?.id === a.id ? "ring-2 ring-primary/40" : ""
                            }`}
                          >
                            {compact ? (
                              <>
                                <span className="block truncate text-[11px] font-semibold text-heading">
                                  {a.name}
                                </span>
                                <span className="block truncate text-[10px] text-body">
                                  {fmtTime(a.start)} · {a.type}
                                </span>
                              </>
                            ) : (
                              <>
                                <span className="block truncate text-[10px] text-body">{fmtTime(a.start)}</span>
                                <span className="block truncate text-[11px] font-semibold text-heading">
                                  {a.name}
                                </span>
                                <span className="block truncate text-[10px] text-body">{a.type}</span>
                              </>
                            )}
                          </button>
                        );
                      })}

                    {showNow && (
                      <div
                        role="img"
                        aria-label="Current time"
                        title="Current time"
                        className="absolute inset-x-0 z-10 h-px bg-danger"
                        style={{ top: nowTop }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
        

      {/* ---------- WEEK ---------- */}
      {view === "Week" && (
        <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 border-t border-border md:grid-cols-7">
            {weekDays.map((d) => {
              const items = forDay(d);
              const isSel = sameDay(d, selected);
              const isToday = !!today && sameDay(d, today);
              return (
                <div
                  key={dayKey(d)}
                  className="min-w-0 border-b border-border p-2 md:min-h-[260px] md:border-b-0 md:border-l md:first:border-l-0"
                >
                  <button
                    type="button"
                    onClick={() => openDay(d)}
                    className="mb-2 flex w-full cursor-pointer items-center gap-1.5 text-left"
                  >
                    <span className="text-[11px] font-medium text-body">{fmt(d, { weekday: "short" })}</span>
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                        isSel
                          ? "bg-primary text-white"
                          : isToday
                            ? "border border-primary text-primary"
                            : "text-heading"
                      }`}
                    >
                      {d.getDate()}
                    </span>
                  </button>
                  <div className="space-y-1.5">
                    {items.length === 0 ? (
                      <p className="text-[11px] text-body">No appointments</p>
                    ) : (
                      items.map((a) => (
                        <ApptChip
                          key={a.id}
                          a={a}
                          active={panelAppt?.id === a.id}
                          onPick={(x) => {
                            setSelected(x.date);
                            setPicked(x);
                          }}
                        />
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ---------- MONTH ---------- */}
      {view === "Month" && (
        <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto">
          <div className="border-t border-border">
            <div className="grid grid-cols-7">
              {WEEKDAYS.map((w) => (
                <span key={w} className="py-2 text-center text-[11px] font-medium text-body">
                  {w}
                </span>
              ))}
            </div>
            <div className="grid grid-cols-7 border-r border-border">
              {monthCells.map((d) => {
                const out = d.getMonth() !== selected.getMonth();
                const items = forDay(d);
                const isSel = sameDay(d, selected);
                const isToday = !!today && sameDay(d, today);
                return (
                  <div
                    key={dayKey(d)}
                    className={`min-h-[64px] min-w-0 border-b border-l border-border p-1 sm:min-h-[104px] sm:p-1.5 ${
                      out ? "bg-heading/[0.02]" : ""
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => openDay(d)}
                      className={`mb-1 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full text-xs font-medium ${
                        isSel
                          ? "bg-primary text-white"
                          : isToday
                            ? "border border-primary text-primary"
                            : out
                              ? "text-body/50"
                              : "text-heading hover:bg-primary/10"
                      }`}
                    >
                      {d.getDate()}
                    </button>

                    {/* chips on ≥sm, count on phones */}
                    <div className="hidden space-y-1 sm:block">
                      {items.slice(0, 2).map((a) => (
                        <ApptChip
                          key={a.id}
                          a={a}
                          active={panelAppt?.id === a.id}
                          onPick={(x) => {
                            setSelected(x.date);
                            setPicked(x);
                          }}
                        />
                      ))}
                      {items.length > 2 && (
                        <button
                          type="button"
                          onClick={() => openDay(d)}
                          className="cursor-pointer text-[10px] font-medium text-primary hover:underline"
                        >
                          +{items.length - 2} more
                        </button>
                      )}
                    </div>
                    {items.length > 0 && (
                      <span className="block text-[10px] font-semibold text-primary sm:hidden">{items.length}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MiddleSection;