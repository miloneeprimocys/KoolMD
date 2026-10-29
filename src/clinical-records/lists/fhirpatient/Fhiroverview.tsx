"use client";

import React, { useState } from "react";
import { Activity, Droplet, Heart, Thermometer, TrendingUp, Wind } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import Table from "@/components/Table";
import { type TableColumn } from "@/components/Tableheader";
import Content from "@/components/Content";
import Tags from "@/components/Tags";
import Actions from "@/components/Actions";
import EditButton from "@/components/EditButton";
import { cardCls } from "@/providers/Shared";

/* ---------------------------------------------------------------- */
/*  Static chart data (replace with API data)                        */
/* ---------------------------------------------------------------- */
type Point = { label: string; sys: number; dia: number; hr: number; temp: number };
const p = (label: string, sys: number, dia: number, hr: number, temp: number): Point => ({ label, sys, dia, hr, temp });

const RANGES = ["1W", "1M", "3M", "1Y"] as const;
type Range = (typeof RANGES)[number];

const DATA: Record<Range, Point[]> = {
  "1W": [
    p("Oct 22", 122, 80, 74, 98.2),
    p("Oct 23", 120, 78, 72, 98.4),
    p("Oct 24", 124, 82, 76, 98.1),
    p("Oct 25", 121, 79, 73, 98.6),
    p("Oct 26", 119, 77, 71, 98.3),
    p("Oct 27", 123, 80, 75, 98.5),
    p("Oct 28", 118, 76, 72, 98.4),
  ],
  "1M": [
    p("Sep 30", 128, 84, 78, 98.2),
    p("Oct 7", 124, 80, 74, 98.5),
    p("Oct 14", 126, 82, 76, 98.1),
    p("Oct 21", 121, 78, 72, 98.4),
    p("Oct 28", 118, 76, 72, 98.4),
  ],
  "3M": [
    p("Aug 1", 122, 82, 90, 97.6),
    p("Aug 15", 122, 80, 92, 98.0),
    p("Sep 1", 136, 86, 104, 98.4),
    p("Sep 15", 118, 78, 100, 98.1),
    p("Oct 1", 137, 84, 96, 98.6),
    p("Oct 15", 126, 80, 78, 98.2),
    p("Oct 28", 138, 76, 90, 98.4),
  ],
  "1Y": [
    p("Nov", 134, 88, 84, 98.3),
    p("Jan", 132, 86, 82, 98.2),
    p("Mar", 130, 84, 80, 98.5),
    p("May", 128, 82, 78, 98.4),
    p("Jul", 126, 80, 76, 98.1),
    p("Sep", 124, 78, 74, 98.5),
    p("Oct", 118, 76, 72, 98.4),
  ],
};

const SERIES = [
  { key: "sys", name: "Systolic BP", color: "#3b82f6" },
  { key: "dia", name: "Diastolic BP", color: "#14b8a6" },
  { key: "hr", name: "Heart Rate", color: "#8b5cf6" },
  { key: "temp", name: "Temperature", color: "#f97316" },
] as const;

/* ---------------------------------------------------------------- */
/*  Latest vitals + recent observations (static)                     */
/* ---------------------------------------------------------------- */
const VITALS = [
  { label: "Blood Pressure", value: "118/76", unit: "mmHg", icon: Droplet, tone: "bg-primary/10 text-primary" },
  { label: "Heart Rate", value: "72", unit: "bpm", icon: Heart, tone: "bg-danger/10 text-danger" },
  { label: "Temperature", value: "98.4", unit: "°F", icon: Thermometer, tone: "bg-warning/10 text-warning" },
  { label: "Respiratory Rate", value: "16", unit: "/min", icon: Wind, tone: "bg-success/10 text-success" },
  { label: "SpO₂", value: "98", unit: "%", icon: Activity, tone: "bg-violet/10 text-violet" },
];

const RECENT = [
  { dateTime: "Oct 28, 2026 10:15 AM", type: "Vital Sign", name: "Blood Pressure", value: "118/76", unit: "mmHg", range: "90-120 / 60-80" },
  { dateTime: "Oct 28, 2026 10:15 AM", type: "Vital Sign", name: "Heart Rate", value: "72", unit: "bpm", range: "60-100" },
  { dateTime: "Oct 28, 2026 10:15 AM", type: "Vital Sign", name: "Temperature", value: "98.4", unit: "°F", range: "97.8-99.1" },
  { dateTime: "Oct 28, 2026 10:15 AM", type: "Vital Sign", name: "Respiratory Rate", value: "16", unit: "/min", range: "12-20" },
];

const COLUMNS: TableColumn[] = [
  { key: "dateTime", label: "Date & Time" },
  { key: "type", label: "Type" },
  { key: "name", label: "Name" },
  { key: "value", label: "Value" },
  { key: "unit", label: "Unit" },
  { key: "range", label: "Reference Range" },
  { key: "status", label: "Status" },
  { key: "actions", label: "", className: "w-10" },
];

/* ---------------------------------------------------------------- */
/*  Component                                                        */
/* ---------------------------------------------------------------- */
const FhirOverview = ({ onViewAll }: { onViewAll: () => void }) => {
  const [range, setRange] = useState<Range>("3M");

  const rows = RECENT.map((r) => ({
    dateTime: <Content title={r.dateTime} />,
    type: <Content title={r.type} />,
    name: <Content title={r.name} />,
    value: <Content title={r.value} />,
    unit: <Content title={r.unit} />,
    range: <Content title={r.range} />,
    status: <Tags text="Normal" tone="success" size="xs" />,
    actions: (
      <div className="flex w-full items-center justify-center">
        <Actions actions={["more"]} size="sm" />
      </div>
    ),
  }));

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="grid items-start gap-4 sm:gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        {/* ---------- Vitals trend ---------- */}
        <section className={`${cardCls} min-w-0`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="flex items-center gap-2 text-base font-semibold text-heading">
              <TrendingUp className="h-4 w-4 text-primary" />
              Vitals Trend
            </h3>
            <div role="group" aria-label="Chart range" className="flex gap-1.5">
              {RANGES.map((r) => (
                <button
                  key={r}
                  type="button"
                  aria-pressed={r === range}
                  onClick={() => setRange(r)}
                  className={`cursor-pointer rounded-lg border px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${
                    r === range
                      ? "border-primary bg-primary text-on-primary"
                      : "border-border bg-card text-heading hover:bg-primary/5"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
            {SERIES.map((s) => (
              <li key={s.key} className="flex items-center gap-1.5 text-xs text-body">
                <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
                {s.name}
              </li>
            ))}
          </ul>

          <div className="mt-3 h-64 w-full text-body">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={DATA[range]} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
                <CartesianGrid stroke="currentColor" strokeOpacity={0.15} vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "currentColor" }} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 200]} ticks={[0, 50, 100, 150, 200]} tick={{ fontSize: 11, fill: "currentColor" }} tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={false}
                  contentStyle={{
                    borderRadius: 8,
                    fontSize: 12,
                    backgroundColor: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    color: "var(--color-heading)",
                  }}
                  labelStyle={{ color: "var(--color-body)", marginBottom: 4 }}
                />
                {SERIES.map((s) => (
                  <Line
                    key={s.key}
                    type="monotone"
                    dataKey={s.key}
                    name={s.name}
                    stroke={s.color}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* ---------- Latest vitals ---------- */}
        <section className={`${cardCls} min-w-0`}>
          <h3 className="text-base font-semibold text-heading">
            Latest Vitals <span className="text-xs font-normal text-body">(Oct 28, 2026)</span>
          </h3>
          <ul className="mt-4 space-y-3">
            {VITALS.map((v) => {
              const Icon = v.icon;
              return (
                <li key={v.label} className="flex items-center gap-3">
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${v.tone}`}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm text-heading">{v.label}</span>
                  <span className="shrink-0 text-sm text-heading">
                    <span className="font-semibold">{v.value}</span> <span className="text-body">{v.unit}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      {/* ---------- Recent observations ---------- */}
      <section className={`${cardCls} space-y-3`}>
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-base font-semibold text-heading">Recent Observations</h3>
          <EditButton section="Recent Observations" variant="viewAll" onEdit={onViewAll} />
        </div>
        <div className="overflow-hidden rounded-[14px] border border-border bg-card">
          <Table columns={COLUMNS} rows={rows} bordered={false} />
        </div>
      </section>
    </div>
  );
};

export default FhirOverview;