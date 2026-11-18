"use client";

import React from "react";
import Link from "next/link";
import { CalendarPlus, FileText, MessageSquare, UserPlus, Zap } from "lucide-react";

import { cardCls } from "@/providers/Shared";

const ACTIONS = [
  { label: "Add Patient", href: "/add-patient", Icon: UserPlus },
  { label: "Schedule Appointment", href: "/book-appointment", Icon: CalendarPlus },
  { label: "Create Invoice", href: "/billing/invoice/create", Icon: FileText },
  { label: "Send Message", href: "/messages", Icon: MessageSquare },
];

const QuickActions = () => (
  <section className={`${cardCls} flex h-full flex-col`}>
    <div className="mb-4 flex items-center gap-2.5">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Zap className="h-4 w-4" />
      </span>
      <h3 className="text-sm font-semibold text-heading sm:text-base">Quick Actions</h3>
    </div>

    <div className="grid flex-1 grid-cols-2 gap-3">
      {ACTIONS.map(({ label, href, Icon }) => (
        <Link
          key={label}
          href={href}
          className="flex min-h-[88px] flex-col items-center justify-center gap-2 rounded-xl border border-transparent bg-primary/[0.07] px-2 py-3 text-center text-xs font-medium text-heading transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-primary/10 hover:shadow-md hover:shadow-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
        >
          <Icon className="h-5 w-5 text-primary" />
          {label}
        </Link>
      ))}
    </div>
  </section>
);

export default QuickActions;