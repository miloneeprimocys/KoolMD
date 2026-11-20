"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { CalendarCheck, CircleDollarSign, Clock, FlaskConical, UserPlus } from "lucide-react";

import EditButton from "@/components/EditButton";
import { cardCls } from "@/providers/Shared";

const ITEMS = [
  { Icon: UserPlus, title: "New patient registered", detail: "James Miller", time: "10 min ago" },
  { Icon: CalendarCheck, title: "Appointment scheduled", detail: "Oct 30, 11:00 AM (Emily Davis)", time: "25 min ago" },
  { Icon: CircleDollarSign, title: "Invoice #INV-1045 paid", detail: "$150.00", time: "40 min ago" },
  { Icon: FlaskConical, title: "Lab result received", detail: "CBC Panel (Robert Johnson)", time: "1 hr ago" },
];

const RecentActivity = () => {
  const router = useRouter();

  return (
    <section className={`${cardCls} flex h-full flex-col`}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Clock className="h-4 w-4" />
          </span>
          <h3 className="text-sm font-semibold text-heading sm:text-base">Recent Activity</h3>
        </div>
        <EditButton
          section="notifications"
          label="View Notifications"
          variant="viewAll"
          onEdit={() => router.push("/notifications")}
        />
      </div>

      <ul className="divide-y divide-divider">
        {ITEMS.map(({ Icon, title, detail, time }) => (
          <li key={title} className="flex items-start gap-3 py-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="h-4 w-4" />
            </span>
            <p className="min-w-0 flex-1 text-sm text-body">
              <span className="font-semibold text-heading">{title}</span> – {detail}
            </p>
            <span className="shrink-0 whitespace-nowrap text-[11px] text-placeholder">{time}</span>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default RecentActivity;