"use client";

import React from "react";
import { ArrowUp, BarChart3 } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { cardCls } from "@/providers/Shared";

const DATA = [
  { day: "Oct 1", revenue: 3200 },
  { day: "Oct 4", revenue: 4100 },
  { day: "Oct 7", revenue: 3800 },
  { day: "Oct 10", revenue: 5200 },
  { day: "Oct 13", revenue: 4600 },
  { day: "Oct 16", revenue: 5900 },
  { day: "Oct 19", revenue: 5400 },
  { day: "Oct 22", revenue: 6800 },
  { day: "Oct 25", revenue: 6200 },
  { day: "Oct 28", revenue: 7600 },
  { day: "Oct 31", revenue: 8200 },
];

type TipProps = { active?: boolean; label?: string; payload?: { value?: number }[] };

const Tip = ({ active, payload, label }: TipProps) =>
  active && payload?.length ? (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-lg">
      <p className="mb-1 font-semibold text-heading">{label}</p>
      <p className="text-body">
        Revenue: <span className="font-medium text-heading">${(payload[0].value ?? 0).toLocaleString()}</span>
      </p>
    </div>
  ) : null;

const RevenueOverview = () => (
  <section className={`${cardCls} flex h-full flex-col`}>
    <div className="mb-4 flex items-center gap-2.5">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <BarChart3 className="h-4 w-4" />
      </span>
      <h3 className="text-sm font-semibold text-heading sm:text-base">Revenue Overview</h3>
    </div>

    <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-center">
      <div className="shrink-0">
        <div className="flex items-center gap-2">
          <p className="text-3xl font-bold leading-none text-heading">$86,420</p>
          <span className="flex items-center gap-0.5 rounded-md bg-success/15 px-1.5 py-0.5 text-xs font-semibold text-success">
            <ArrowUp className="h-3 w-3" />+14%
          </span>
        </div>
        <p className="mt-2 text-xs text-body">Total Revenue (This Month)</p>
      </div>

      <div className="h-[170px] min-w-0 flex-1 text-body">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={DATA} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
            <defs>
              <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--violet)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="var(--violet)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="currentColor" strokeOpacity={0.1} />
            <XAxis dataKey="day" interval={1} tickLine={false} axisLine={false} tick={{ fill: "currentColor", fontSize: 11 }} />
            <YAxis hide domain={["dataMin - 1000", "dataMax + 500"]} />
            <Tooltip cursor={false} content={<Tip />} />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="var(--violet)"
              strokeWidth={2}
              fill="url(#revFill)"
              dot={{ r: 3, fill: "var(--violet)", strokeWidth: 0 }}
              activeDot={{ r: 5 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  </section>
);

export default RevenueOverview;