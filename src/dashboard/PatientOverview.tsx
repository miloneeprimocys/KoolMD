"use client";

import React from "react";
import { ClipboardList } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

import { cardCls } from "@/providers/Shared";

const DATA = [
  { name: "Active Patients", value: 607, color: "var(--violet)", opacity: 1 },
  { name: "New Patients", value: 152, color: "var(--primary)", opacity: 0.35 },
  { name: "Inactive", value: 89, color: "var(--success)", opacity: 1 },
  { name: "Others", value: 44, color: "var(--violet)", opacity: 0.3 },
];
const TOTAL = DATA.reduce((s, d) => s + d.value, 0);

const PatientOverview = () => (
  <section className={`${cardCls} flex h-full flex-col`}>
    <div className="mb-4 flex items-center gap-2.5">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <ClipboardList className="h-4 w-4" />
      </span>
      <h3 className="text-sm font-semibold text-heading sm:text-base">Patient Overview</h3>
    </div>

    <div className="flex flex-1 flex-col items-center gap-4 sm:flex-row sm:justify-center xl:flex-col 2xl:flex-row">
      <div className="relative h-[170px] w-[170px] shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={DATA} dataKey="value" innerRadius={58} outerRadius={82} paddingAngle={2} stroke="none" startAngle={90} endAngle={-270}>
              {DATA.map((d) => (
                <Cell key={d.name} fill={d.color} fillOpacity={d.opacity} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-heading">{TOTAL}</span>
          <span className="text-[11px] text-body">Total Patients</span>
        </div>
      </div>

      <ul className="w-full min-w-0 space-y-2.5 sm:w-auto">
        {DATA.map((d) => (
          <li key={d.name} className="flex items-center justify-between gap-4 text-xs">
            <span className="flex min-w-0 items-center gap-2 text-body">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: d.color, opacity: d.opacity }} />
              <span className="truncate">{d.name}</span>
            </span>
            <span className="shrink-0 whitespace-nowrap font-semibold text-heading">
              {Math.round((d.value / TOTAL) * 100)}% ({d.value})
            </span>
          </li>
        ))}
      </ul>
    </div>
  </section>
);

export default PatientOverview;