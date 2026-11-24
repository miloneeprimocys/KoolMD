"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CalendarCheck, CalendarClock, CalendarDays, Plus, type LucideIcon } from "lucide-react";

import AddButton from "@/components/Addbutton";
import Tabs from "@/components/Tabs";
import { cardCls } from "@/providers/Shared";

import ProviderAppointmentsTab, { APPOINTMENTS, type Scope } from "./ProviderAppointmentsTab";

const BASE = "/provider/appointments";
const NEW_APPOINTMENT_HREF = "/book-appointment";

const TABS: { key: Scope; label: string; Icon: LucideIcon }[] = [
  { key: "today", label: "Today", Icon: CalendarCheck },
  { key: "upcoming", label: "Upcoming", Icon: CalendarClock },
  { key: "past", label: "Past", Icon: CalendarDays },
];

const ProviderAppointments = () => {
  const router = useRouter();
  const requested = useSearchParams().get("tab");
  const tab: Scope = TABS.some((t) => t.key === requested) ? (requested as Scope) : "today";

  return (
    <div className="mx-auto w-full min-w-0 max-w-[1600px] space-y-4 sm:space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-heading sm:text-xl 2xl:text-2xl">Appointments</h2>
          <p className="mt-0.5 text-sm text-body">Manage your patient appointments and consultations.</p>
        </div>
        <AddButton
          text="New Appointment"
          icon={<Plus className="h-4 w-4" />}
          onClick={() => router.push(NEW_APPOINTMENT_HREF)}
          className="whitespace-nowrap"
        />
      </div>

      <section className={`${cardCls} min-w-0 space-y-4 sm:p-5`}>
        <Tabs ariaLabel="Appointment lists">
          <div className="flex min-w-max gap-1 sm:gap-3">
            {TABS.map(({ key, label, Icon }) => {
              const active = key === tab;
              return (
                <button
                  key={key}
                  role="tab"
                  type="button"
                  aria-selected={active}
                  onClick={() => router.push(`${BASE}?tab=${key}`, { scroll: false })}
                  className={`-mb-px flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap border-b-2 px-3 pb-2.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 sm:px-4 sm:pb-3 ${
                    active ? "border-primary font-semibold text-primary" : "border-transparent text-body hover:text-heading"
                  }`}
                >
                  <Icon className="hidden h-4 w-4 shrink-0 sm:block" />
                  <span>
                    {label} ({APPOINTMENTS[key].length})
                  </span>
                </button>
              );
            })}
          </div>
        </Tabs>

        <div role="tabpanel" className="min-w-0">
          <ProviderAppointmentsTab key={tab} scope={tab} />
        </div>
      </section>
    </div>
  );
};

export default ProviderAppointments;
