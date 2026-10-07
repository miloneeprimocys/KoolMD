import React from "react";
import { Activity, AlertCircle, ArrowDown, ArrowUp, CalendarDays, Users, type LucideIcon } from "lucide-react";

import { type TagTone } from "./Tags";

type Accent = "primary" | "success" | "warning" | "danger" | "violet";

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

/* Full class strings (not built dynamically) so Tailwind can detect them */
const ACCENTS: Record<Accent, { tone: string; color: string; glow: string }> = {
  primary: { tone: "bg-primary/10 text-primary", color: "var(--primary)", glow: "hover:shadow-primary/15" },
  success: { tone: "bg-success/10 text-success", color: "var(--success)", glow: "hover:shadow-success/15" },
  warning: { tone: "bg-warning/10 text-warning", color: "var(--warning)", glow: "hover:shadow-warning/15" },
  danger:  { tone: "bg-danger/10 text-danger",   color: "var(--danger)",  glow: "hover:shadow-danger/15" },
  violet:  { tone: "bg-violet/10 text-violet",   color: "var(--violet)",  glow: "hover:shadow-violet/15" },
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
const StatCards = ({ stats = DEFAULT_STATS }: { stats?: StatItem[] }) => {
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
              className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-14 overflow-hidden opacity-40 transition-opacity duration-500 group-hover:opacity-100 lg:h-16"
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
              {/* Icon tile */}
              <span
                className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-[14px] ${tone} transition-transform duration-300 group-hover:scale-105`}
              >
                <Icon className="h-7 w-7" />
              </span>

              {/* Content column */}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-label">{label}</p>

                {/* Value + change / tag, side by side */}
                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <p className="text-3xl font-bold leading-none tracking-tight text-heading">
                    {value}
                  </p>

                  {/* arrow + percentage */}
                  {change && (
                    <div className="leading-tight">
                      <p
                        className={`flex items-center gap-0.5 text-lg font-semibold ${
                          positive ? "text-success" : "text-danger"
                        }`}
                      >
                        {positive ? (
                          <ArrowUp className="h-[18px] w-[18px]" />
                        ) : (
                          <ArrowDown className="h-[18px] w-[18px]" />
                        )}
                        {change}
                      </p>
                      <p className="text-xs text-body xl:text-[13px]">from last month</p>
                    </div>
                  )}

                  {/* plain coloured text (not a chip) */}
                  {tag && (
                    <span className={`text-lg font-semibold ${TAG_TEXT[tag.tone]}`}>
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