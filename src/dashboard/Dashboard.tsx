"use client";

import React, { useState } from "react";
import {
  Activity,
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Clock,
  TrendingUp,
  UserPlus,
  Users,
  type LucideIcon,
} from "lucide-react";

import StatCards, { type StatItem } from "@/components/Statcards";
import GlobalButton from "@/components/GlobalButton";

/* ---------- Stats ---------- */
const STATS: StatItem[] = [
  { label: "Total Patients", value: "2,847", Icon: Users, accent: "primary" },
  { label: "Today's Appointments", value: "24", Icon: CalendarDays, accent: "success" },
  { label: "Active Cases", value: "156", Icon: Activity, accent: "warning" },
  { label: "Critical Alerts", value: "7", Icon: AlertCircle, accent: "danger" },
];

/* ---------- Data ---------- */
const APPOINTMENTS = [
  { name: "Emma Wilson", type: "Consultation", time: "09:00 AM", status: "confirmed" as const },
  { name: "Michael Brown", type: "Follow-up", time: "10:30 AM", status: "pending" as const },
  { name: "Sarah Davis", type: "Surgery", time: "02:15 PM", status: "confirmed" as const },
  { name: "James Johnson", type: "Consultation", time: "04:00 PM", status: "confirmed" as const },
];

const ACTIVITIES: {
  title: string;
  name: string;
  time: string;
  Icon: LucideIcon;
  tone: string;
  bg: string;
}[] = [
  { title: "New patient registered", name: "Alice Cooper", time: "5 min ago", Icon: UserPlus, tone: "text-primary", bg: "bg-primary/10" },
  { title: "Appointment completed", name: "Bob Wilson", time: "15 min ago", Icon: CheckCircle2, tone: "text-success", bg: "bg-success/10" },
  { title: "Lab results uploaded", name: "Carol Smith", time: "32 min ago", Icon: TrendingUp, tone: "text-danger", bg: "bg-danger/10" },
  { title: "Prescription updated", name: "David Lee", time: "1 hour ago", Icon: Activity, tone: "text-violet", bg: "bg-violet/10" },
];

const ACTIONS: {
  label: string;
  Icon: LucideIcon;
  tone: string;
  bg: string;
}[] = [
  { label: "Add New Patient", Icon: UserPlus, tone: "text-primary", bg: "bg-primary/10" },
  { label: "Schedule Appointment", Icon: CalendarDays, tone: "text-success", bg: "bg-success/10" },
  { label: "View Lab Results", Icon: Activity, tone: "text-warning", bg: "bg-warning/10" },
  { label: "Emergency Alert", Icon: AlertCircle, tone: "text-danger", bg: "bg-danger/10" },
];

/* Card style — blue hover throughout */
const cardCls =
  "group/card relative isolate overflow-hidden rounded-2xl border border-border bg-card p-5 transition-all duration-300 ease-out hover:border-primary/25 hover:shadow-lg hover:shadow-shape-sky/25";

const initials = (n: string) =>
  n.split(" ").map((w) => w[0]).join("");

/* Status badge — blue-tinted for both states */
const statusStyles = (status: string) =>
  status === "confirmed"
    ? "bg-success/15 text-success border border-success/30"
    : "bg-divider/60 text-body border border-border";

const Dashboard = () => {
  const [selectedAction, setSelectedAction] = useState(0);

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-4 sm:space-y-5">
      <StatCards stats={STATS} />

      <div className="grid gap-4 sm:gap-5 lg:grid-cols-[1.35fr_1fr]">
        {/* ---------- Today's Appointments ---------- */}
        <section className={cardCls}>
          <div className="relative">
            <h2 className="text-sm font-semibold text-heading">Today&apos;s Appointments</h2>
            <p className="mt-1 text-xs text-body">
              You have 24 appointments scheduled for today
            </p>

            <div className="mt-4 space-y-3">
              {APPOINTMENTS.map((a, i) => (
                <div
                  key={a.name}
                  style={{ animationDelay: `${i * 60}ms` }}
                  className="group/row flex animate-[fadeSlide_0.4s_ease-out_both] items-center justify-between gap-3 rounded-xl border border-border bg-card px-3 py-2.5 transition-colors duration-200 hover:border-primary/25 hover:bg-primary/[0.04]"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-shape-sky/40 text-xs font-semibold text-heading">
                      {initials(a.name)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-heading">{a.name}</p>
                      <p className="text-xs text-body">{a.type}</p>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <p className="text-sm font-medium text-heading">{a.time}</p>
                    <span
                      className={`rounded-md px-2 py-0.5 text-[11px] font-medium capitalize transition-colors duration-200 ${statusStyles(
                        a.status
                      )}`}
                    >
                      {a.status}
                    </span>
                  </div>
                </div>
              ))}

              <GlobalButton
                type="button"
                text="View All Appointments"
                icon={<CalendarDays className="h-4 w-4" />}
              />
            </div>
          </div>
        </section>

        {/* ---------- Recent Activities ---------- */}
        <section className={cardCls}>
          <div className="relative">
            <h2 className="text-sm font-semibold text-heading">Recent Activities</h2>
            <p className="mt-1 text-sm text-body">Latest updates and activities</p>

            <div className="mt-4">
              {ACTIVITIES.map(({ title, name, time, Icon, tone, bg }, i) => (
                <div
                  key={title}
                  style={{ animationDelay: `${i * 80}ms` }}
                  className={`group/act flex animate-[fadeSlide_0.4s_ease-out_both] items-start gap-3 py-4 ${
                    i !== ACTIVITIES.length - 1 ? "border-b border-divider" : ""
                  } ${i === 0 ? "pt-2" : ""}`}
                >
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${bg} transition-transform duration-300 group-hover/act:scale-110`}
                  >
                    <Icon className={`h-4 w-4 ${tone}`} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs text-body">{title}</p>
                    <p className="mt-0.5 text-sm font-medium text-heading transition-colors group-hover/act:text-primary">
                      {name}
                    </p>
                    <p className="mt-1 flex items-center gap-1 text-[11px] text-placeholder">
                      <Clock className="h-3 w-3" />
                      {time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* ---------- Quick Actions ---------- */}
      <section className={cardCls}>
        <div className="relative">
          <h2 className="text-sm font-semibold text-heading">Quick Actions</h2>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {ACTIONS.map(({ label, Icon, tone, bg }, i) => {
              const isSelected = selectedAction === i;
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => setSelectedAction(i)}
                  aria-pressed={isSelected}
                  className={`group/action relative isolate flex h-[92px] cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border text-sm font-medium transition-all duration-300 ease-out active:translate-y-0 active:scale-[0.99] ${
                    isSelected
                      ? "shine-always border-primary bg-primary text-on-primary shadow-md shadow-primary/30 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/45"
                      : "border-border bg-card text-heading hover:border-primary/40 hover:bg-primary/[0.05] hover:shadow-md hover:shadow-primary/15"
                  }`}
                >
                  {isSelected && (
                    <span
                      aria-hidden="true"
                      className="shine-layer pointer-events-none absolute inset-y-0 left-0 w-1/3 -translate-x-full -skew-x-12 bg-gradient-to-r from-transparent via-on-primary/35 to-transparent"
                    />
                  )}

                  <span
                    className={`relative flex h-10 w-10 items-center justify-center rounded-[10px] transition-all duration-300 ${
                      isSelected
                        ? "bg-on-primary/15 text-on-primary"
                        : `${bg} ${tone} group-hover/action:scale-105 group-hover/action:bg-primary/15 group-hover/action:text-primary`
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>

                  <span className="relative mt-0.5">{label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;