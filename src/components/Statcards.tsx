import React from "react";
import { Activity, AlertCircle, ArrowDown, ArrowUp, CalendarDays, Users, type LucideIcon } from "lucide-react";

import { type TagTone } from "./Tags";

type Accent = "primary" | "success" | "warning" | "danger" | "violet" | "pink";

export type StatItem = {
  label: string;
  value: string;
  Icon: LucideIcon;
  accent: Accent;
  /* arrow + percentage beside the value, e.g. "12%" */
  change?: string;
  positive?: boolean; // true → green ↑, false → red ↓
  /* plain coloured text beside the value, e.g. "Active" (no chip) */
  tag?: { text: string; tone: TagTone };
};

/*
  Full class strings (not built dynamically) so Tailwind can detect them.
  - tone:  gradient icon tile (bg-grad-* comes from the global theme) + tinted shadow
  - color: wave / animated border colour (global CSS variable)
  - glow:  card hover shadow
*/
const ACCENTS: Record<Accent, { tone: string; color: string; glow: string }> = {
  primary: { tone: "bg-grad-blue shadow-primary/30",     color: "var(--primary)", glow: "hover:shadow-primary/15" },
  success: { tone: "bg-grad-green shadow-success/30",    color: "var(--success)", glow: "hover:shadow-success/15" },
  warning: { tone: "bg-grad-orange shadow-warning/30",   color: "var(--warning)", glow: "hover:shadow-warning/15" },
  danger:  { tone: "bg-grad-red shadow-danger/30",       color: "var(--danger)",  glow: "hover:shadow-danger/15" },
  violet:  { tone: "bg-grad-violet shadow-violet/30",    color: "var(--violet)",  glow: "hover:shadow-violet/15" },
  pink:    { tone: "bg-grad-pink shadow-pink/30",        color: "var(--pink)",    glow: "hover:shadow-pink/15" },
};

/* Text colour for the tag, by tone */
const TAG_TEXT: Record<TagTone, string> = {
  success: "text-success",
  info: "text-primary",
  violet: "text-violet",
  warning: "text-warning",
  danger: "text-danger",
  neutral: "text-body",
  outline: "text-heading",
};

const DEFAULT_STATS: StatItem[] = [
  { label: "Total Patients", value: "2,847", change: "12%", positive: true, Icon: Users, accent: "primary" },
  { label: "Today's Appointments", value: "24", change: "3%", positive: true, Icon: CalendarDays, accent: "success" },
  { label: "Active Cases", value: "156", change: "8%", positive: true, Icon: Activity, accent: "warning" },
  { label: "Critical Alerts", value: "7", change: "2%", positive: false, Icon: AlertCircle, accent: "danger" },
];

/* Same wave path used by SignupButton */
const WAVE_PATH =
  "M0 60C100 10 200 10 300 60S500 110 600 60S800 10 900 60S1100 110 1200 60V120H0Z";

/* No props → the 4 dashboard cards.  stats={[...]} → any set of cards. */
const StatCards = ({
  stats = DEFAULT_STATS,
  truncateContent = false,
}: {
  stats?: StatItem[];
  truncateContent?: boolean;
}) => {
  /*
    Grid rules:
    - phone                  → 1 per row
    - md through xl          → 2 per row
    - 2xl with 5+ cards      → 5 per row
    - 2xl with 4 or fewer    → 4 per row
  */
  const grid =
    stats.length >= 5
      ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-5"
      : "grid-cols-1 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-4";

  return (
    <div className={`grid gap-4 ${grid}`}>
      {stats.map(({ label, value, change, positive, tag, Icon, accent }) => {
        const { tone, color: waveColor, glow } = ACCENTS[accent];
        const isNumericValue = /^[\d,$.]+$/.test(value);

        return (
          <div
            key={label}
            className={`stat-card group relative isolate overflow-hidden rounded-2xl border border-border bg-card p-5 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-[var(--border-color)] hover:shadow-md ${glow}`}
            style={{
              ["--wave-color" as string]: waveColor,
              ["--border-color" as string]: waveColor,
            }}
          >
            {/* ── Animated gradient border (visible on hover) ── */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 -z-20 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{
                background: `conic-gradient(from var(--angle), transparent 0deg, var(--wave-color) 60deg, transparent 120deg, transparent 360deg)`,
                padding: "1px",
                WebkitMask:
                  "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
                WebkitMaskComposite: "xor",
                maskComposite: "exclude",
              }}
            />

            {/* ── Wavy flowing layers ── */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-14 overflow-hidden opacity-40 transition-opacity duration-500 group-hover:opacity-100 xl:h-16"
            >
              <svg className="btn-wave btn-wave-1" viewBox="0 0 1200 120" preserveAspectRatio="none">
                <path d={WAVE_PATH} fill={waveColor} opacity="0.10" />
              </svg>
              <svg className="btn-wave btn-wave-2" viewBox="0 0 1200 120" preserveAspectRatio="none">
                <path d={WAVE_PATH} fill={waveColor} opacity="0.16" />
              </svg>
              <svg className="btn-wave btn-wave-3" viewBox="0 0 1200 120" preserveAspectRatio="none">
                <path d={WAVE_PATH} fill={waveColor} opacity="0.07" />
              </svg>
            </span>

            {/* ── Body: icon on the left, content on the right ── */}
            <div className="relative flex items-start gap-4">
              {/* Icon tile: global gradient + white icon + tinted glow */}
              <span
                className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-[14px] text-white shadow-lg ${tone} transition-transform duration-300 group-hover:scale-105`}
              >
                <Icon className="h-7 w-7" />
              </span>

              {/* Content column */}
              <div className="min-w-0 flex-1">
                <p className={`text-sm font-medium text-label ${truncateContent ? "truncate" : ""}`}>{label}</p>

                <div className="mt-1.5 flex min-w-0 items-center gap-2">
                  <p className={`text-3xl font-bold leading-none tracking-tight text-heading ${truncateContent && !isNumericValue ? "min-w-0 truncate" : "shrink-0"}`}>
                    {value}
                  </p>

                  {change && (
                    <div className="flex min-w-0 items-center gap-1 text-xs text-body xl:text-[13px]">
                      <span
                        className={`flex shrink-0 items-center gap-0.5 text-sm font-semibold ${
                          positive ? "text-success" : "text-danger"
                        }`}
                      >
                        {positive ? (
                          <ArrowUp className="h-4 w-4" />
                        ) : (
                          <ArrowDown className="h-4 w-4" />
                        )}
                        {change}
                      </span>
                      <span className="truncate">from last month</span>
                    </div>
                  )}

                  {tag && (
                    <span className={`min-w-0 truncate text-base font-semibold ${TAG_TEXT[tag.tone]}`}>
                      {tag.text}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatCards;
