"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { CalendarDays } from "lucide-react";

import EditButton from "@/components/EditButton";
import Tags, { type TagTone } from "@/components/Tags";
import { cardCls } from "@/providers/Shared";

const ROWS: { time: string; initials: string; name: string; detail: string; status: string; tone: TagTone }[] = [
  { time: "09:00 AM", initials: "MS", name: "Mary Smith", detail: "Follow-up • Hypertension", status: "Checked In", tone: "success" },
  { time: "09:30 AM", initials: "RJ", name: "Robert Johnson", detail: "Consultation • Diabetes", status: "Checked In", tone: "success" },
  { time: "10:00 AM", initials: "ED", name: "Emily Davis", detail: "Consultation • Annual Checkup", status: "In Progress", tone: "violet" },
  { time: "10:30 AM", initials: "MT", name: "Michael Turner", detail: "Follow-up • Medication Review", status: "Scheduled", tone: "neutral" },
  { time: "11:00 AM", initials: "SC", name: "Sarah Collins", detail: "Consultation • Joint Pain", status: "Scheduled", tone: "neutral" },
];

const TodaysAppointments = () => {
  const router = useRouter();

  return (
    <section className={`${cardCls} flex h-full flex-col`}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <CalendarDays className="h-4 w-4" />
          </span>
          <h3 className="text-sm font-semibold text-heading sm:text-base">Today&apos;s Appointments</h3>
        </div>
        <EditButton
          section="appointments"
          label="View Calendar"
          variant="viewAll"
          onEdit={() => router.push("/appointments")}
        />
      </div>

      <ul className="divide-y divide-divider">
        {ROWS.map((r) => (
          <li key={r.name} className="flex items-center gap-3 py-2.5">
            <span className="w-[68px] shrink-0 text-xs font-medium text-heading">{r.time}</span>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">
              {r.initials}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-heading">{r.name}</p>
              <p className="truncate text-[11px] text-body">{r.detail}</p>
            </div>
            <span className="shrink-0">
              <Tags text={r.status} tone={r.tone} size="xs" />
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default TodaysAppointments;