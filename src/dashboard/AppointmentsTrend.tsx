"use client";

import React, { useMemo, useState } from "react";
import { BarChart3 } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { cardCls } from "@/providers/Shared";

/* Static data: one entry per day of the month (replace with API data) */
const IN_PERSON = [70, 80, 100, 65, 60, 90, 105, 70, 90, 60, 85, 70, 90, 110, 75, 125, 70, 85, 115, 95, 150, 90, 95, 75, 90, 70, 90, 60, 90, 65, 70];
const VIRTUAL = [30, 25, 45, 35, 30, 40, 45, 30, 35, 30, 40, 35, 45, 50, 35, 70, 30, 40, 55, 45, 55, 35, 40, 35, 45, 30, 40, 30, 40, 30, 25];
const AVG_REVENUE_PER_VISIT = 105;

type Mode = "appointments" | "revenue";

type TipProps = {
  active?: boolean;
  label?: string;
  payload?: { dataKey?: string | number; name?: string; value?: number }[];
  money: boolean;
};

const Tip = ({ active, payload, label, money }: TipProps) =>
  active && payload?.length ? (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-lg">
      <p className="mb-1 font-semibold text-heading">{label}</p>
      {payload.map((p) => (
        <p key={String(p.dataKey)} className="text-body">
          {p.name}: <span className="font-medium text-heading">{money ? `$${(p.value ?? 0).toLocaleString()}` : p.value}</span>
        </p>
      ))}
    </div>
  ) : null;

const AppointmentsTrend = () => {
  const [mode, setMode] = useState<Mode>("appointments");
  const money = mode === "revenue";

  const data = useMemo(
    () =>
      IN_PERSON.map((inPerson, i) => {
        const virtual = VIRTUAL[i] ?? 0;
        const k = money ? AVG_REVENUE_PER_VISIT : 1;
        return { day: `Oct ${i + 1}`, inPerson: inPerson * k, virtual: virtual * k };
      }),
    [money],
  );

  return (
    <section className={`${cardCls} flex h-full flex-col`}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <BarChart3 className="h-4 w-4" />
          </span>
          <h3 className="text-sm font-semibold text-heading sm:text-base">Appointments Trend</h3>
        </div>

        <div role="tablist" className="inline-flex rounded-lg border border-border p-0.5">
          {(["appointments", "revenue"] as Mode[]).map((m) => (
            <button
              key={m}
              role="tab"
              type="button"
              aria-selected={mode === m}
              onClick={() => setMode(m)}
              className={`cursor-pointer rounded-md px-3 py-1 text-xs font-medium capitalize transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${
                mode === m ? "bg-primary text-on-primary" : "text-body hover:text-heading"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[240px] min-w-0 text-body sm:h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 4, left: -12, bottom: 0 }} barCategoryGap="22%">
            <CartesianGrid vertical={false} stroke="currentColor" strokeOpacity={0.12} />
            <XAxis dataKey="day" interval={2} tickLine={false} axisLine={false} tick={{ fill: "currentColor", fontSize: 11 }} />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: "currentColor", fontSize: 11 }}
              tickFormatter={(v: number) => (money ? `$${v / 1000}k` : String(v))}
            />
            <Tooltip cursor={{ fill: "currentColor", fillOpacity: 0.06 }} content={<Tip money={money} />} />
            <Bar dataKey="inPerson" name="In-person" stackId="a" fill="var(--violet)" />
            <Bar dataKey="virtual" name="Virtual" stackId="a" fill="var(--violet)" fillOpacity={0.35} radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 flex items-center justify-center gap-5 text-xs text-body">
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-violet" />In-person</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-violet/35" />Virtual</span>
      </div>
    </section>
  );
};

export default AppointmentsTrend;