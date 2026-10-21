"use client";

import React, { useState } from "react";

import AddButton from "@/components/Addbutton";
import CalendarView from "./calenderview/Calendarview";
import AppointmentList from "./Appointmentlist";
import Requests from "./Requests";
import WaitingRoom from "./Waitingroom";
import AppointmentHistory from "./Appointmenthistory";
import ListView from "./listview/Listview";

/* ---------- Tabs ---------- */
type TabKey = "listview" | "calendar" | "list" | "requests" | "waiting" | "history";

const TABS: { key: TabKey; label: string }[] = [
  { key: "listview", label: "List View" },
  { key: "calendar", label: "Calendar View" },
  { key: "list", label: "Appointment List" },
  { key: "requests", label: "Requests" },
  { key: "waiting", label: "Waiting Room" },
  { key: "history", label: "Appointment History" },
];

/* ---------- Component ---------- */
const AppointmentScheduling = () => {
  const [tab, setTab] = useState<TabKey>("listview");

  return (
    <div className="mx-auto min-w-0 w-full max-w-[1600px] overflow-x-clip space-y-4 sm:space-y-5">
      {/* Title + action */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-heading sm:text-xl 2xl:text-2xl">
            Appointment and Scheduling
          </h2>
          <p className="mt-0.5 text-xs text-body sm:text-sm">
            Manage patient bookings, schedules, rescheduling and appointment history.
          </p>
        </div>
        <AddButton
          text="Book Appointment"
          onClick={() => {}}
          className="shrink-0 whitespace-nowrap px-3 text-xs sm:px-5 sm:text-sm"
        />
      </div>

      {/* Tabs */}
      <div
        role="tablist"
        aria-label="Appointment sections"
        className="flex gap-4 overflow-x-auto border-b border-border hide-scrollbar sm:gap-6"
      >
        {TABS.map((t) => {
          const isActive = t.key === tab;
          return (
            <button
              key={t.key}
              role="tab"
              type="button"
              aria-selected={isActive}
              onClick={() => setTab(t.key)}
              className={`-mb-px cursor-pointer whitespace-nowrap border-b-2 px-1 pb-2.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 sm:pb-3 sm:text-sm ${
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-body hover:text-heading"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Active tab */}
      <div role="tabpanel">
        {tab === "listview" && <ListView />}
        {tab === "calendar" && <CalendarView />}
        {tab === "list" && <AppointmentList />}
        {tab === "requests" && <Requests />}
        {tab === "waiting" && <WaitingRoom />}
        {tab === "history" && <AppointmentHistory />}

      </div>
    </div>
  );
};

export default AppointmentScheduling;