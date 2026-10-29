"use client";

import React, { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import AddButton from "@/components/Addbutton";
import CalendarView from "./calenderview/Calendarview";
import AppointmentList from "./listview/Appointmentlist";
import Requests from "./requests/Requests";
import WaitingRoom from "./waitingroom/Waitingroom";
import AppointmentHistory from "./Appointmenthistory";
import BlockTimeMain from "./calenderview/Blocktimemain";
import Holidays from "./calenderview/Holidays";


/* ---------- Tabs ---------- */
type TabKey = "calendar" | "list" | "requests" | "waiting" | "history" | "calendar/blocktime" | "calendar/holidays";

const TABS: { key: TabKey; label: string }[] = [

  { key: "list", label: "Appointment List" },
  { key: "calendar", label: "Calendar View" },
  { key: "requests", label: "Requests" },
  { key: "waiting", label: "Waiting Room" },
  { key: "history", label: "Appointment History" },
];

/* ---------- Component ---------- */
const AppointmentScheduling = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedTab = searchParams.get("tab");
  const tab: TabKey = (TABS.some((item) => item.key === requestedTab) || requestedTab === "calendar/blocktime" || requestedTab === "calendar/holidays")
    ? (requestedTab as TabKey)
    : "list";

  useEffect(() => {
    if (!TABS.some((item) => item.key === requestedTab) && requestedTab !== "calendar/blocktime" && requestedTab !== "calendar/holidays") {
      router.replace("/appointments?tab=list", { scroll: false });
    }
  }, [requestedTab, router]);

  const changeTab = (key: TabKey) => {
    router.push(`/appointments?tab=${key}`, { scroll: false });
  };

  const isBlockTime = tab === "calendar/blocktime";
  const isHolidays = tab === "calendar/holidays";

  return (
    <div className="flex min-h-full flex-col">
      {/* Header + tabs — hidden when in block-time / add availability view */}
      {!isBlockTime && !isHolidays && (
        <div className="mx-auto w-full max-w-[1600px] space-y-4 sm:space-y-5">
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
              onClick={() => router.push("/book-appointment")}
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
                  onClick={() => changeTab(t.key)}
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
        </div>
      )}

      {/* Active tab — blocktime gets full bleed so its sticky footer works */}
      <div role="tabpanel" className={isBlockTime || isHolidays ? "flex-1" : undefined}>
        {!isBlockTime && !isHolidays && (
          <div className="mx-auto mt-4 w-full max-w-[1600px] sm:mt-5">
            {tab === "calendar" && <CalendarView />}
            {tab === "list" && <AppointmentList />}
            {tab === "requests" && <Requests />}
            {tab === "waiting" && <WaitingRoom />}
            {tab === "history" && <AppointmentHistory />}
          </div>
        )}
        {isBlockTime && <BlockTimeMain />}
        {isHolidays && <Holidays notify={(type, title, message) => console.log(`[${type}] ${title}: ${message}`)} />}
      </div>
    </div>
  );
};

export default AppointmentScheduling;
