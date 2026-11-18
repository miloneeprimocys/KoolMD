"use client";

import React from "react";
import { CalendarCheck, CreditCard, FlaskConical, Pill, Users } from "lucide-react";

import StatCards, { type StatItem } from "@/components/Statcards";

import AppointmentsTrend from "./AppointmentsTrend";
import PatientOverview from "./PatientOverview";
import QuickActions from "./QuickActions";
import TodaysAppointments from "./TodaysAppointments";
import PendingItems from "./PendingItems";
import StaffActivity from "./StaffActivity";
import RevenueOverview from "./RevenueOverview";
import RecentActivity from "./RecentActivity";

const STATS: StatItem[] = [
  { label: "Total Appointments", value: "1,248", change: "+12%", positive: true, Icon: CalendarCheck, accent: "violet" },
  { label: "Unique Patients", value: "892", change: "+8%", positive: true, Icon: Users, accent: "primary" },
  { label: "Prescriptions", value: "756", change: "+10%", positive: true, Icon: Pill, accent: "success" },
  { label: "Lab Tests", value: "324", change: "+6%", positive: true, Icon: FlaskConical, accent: "warning" },
  { label: "Total Revenue", value: "$86,420", change: "+14%", positive: true, Icon: CreditCard, accent: "pink" },
];

const Dashboard = () => (
  <div className="mx-auto w-full max-w-[1600px] space-y-4 sm:space-y-5">
    <div>
      <h2 className="text-lg font-semibold text-heading sm:text-xl 2xl:text-2xl">Admin Dashboard</h2>
      <p className="mt-0.5 text-sm text-body">Clinic overview, operations, and key insights.</p>
    </div>

    <StatCards stats={STATS} />

    {/* Row 1: trend · overview · quick actions */}
    <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-2 2xl:grid-cols-[1.7fr_1fr_1fr]">
      <div className="min-w-0 lg:col-span-2 2xl:col-span-1">
        <AppointmentsTrend />
      </div>
      <div className="min-w-0">
        <PatientOverview />
      </div>
      <div className="min-w-0">
        <QuickActions />
      </div>
    </div>

    {/* Row 2: today · pending · staff */}
    <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-2 2xl:grid-cols-3">
      <div className="min-w-0">
        <TodaysAppointments />
      </div>
      <div className="min-w-0">
        <PendingItems />
      </div>
      <div className="min-w-0 lg:col-span-2 2xl:col-span-1">
        <StaffActivity />
      </div>
    </div>

    {/* Row 3: revenue · recent activity */}
    <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-2">
      <div className="min-w-0">
        <RevenueOverview />
      </div>
      <div className="min-w-0">
        <RecentActivity />
      </div>
    </div>
  </div>
);

export default Dashboard;