"use client";

import React from "react";
import Link from "next/link";
import { CalendarCheck, ChevronRight, FileText, FlaskConical, Layers, MessageSquare, UserPlus } from "lucide-react";

import { cardCls } from "@/providers/Shared";

const ITEMS = [
  { count: 12, label: "Lab Results to Review", href: "/lab-results", Icon: FlaskConical },
  { count: 8, label: "Referrals to Process", href: "/referral/management", Icon: UserPlus },
  { count: 5, label: "Membership Approvals", href: "/membership/history", Icon: CalendarCheck },
  { count: 3, label: "Prescription Renewals", href: "/medication/prescription-list", Icon: FileText },
  { count: 7, label: "Unread Messages", href: "/messages", Icon: MessageSquare },
];

const PendingItems = () => (
  <section className={`${cardCls} flex h-full flex-col`}>
    <div className="mb-3 flex items-center gap-2.5">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Layers className="h-4 w-4" />
      </span>
      <h3 className="text-sm font-semibold text-heading sm:text-base">Pending Items</h3>
    </div>

    <ul className="divide-y divide-divider">
      {ITEMS.map(({ count, label, href, Icon }) => (
        <li key={label}>
          <Link
            href={href}
            className="group flex items-center gap-3 py-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
          >
            <Icon className="h-4 w-4 shrink-0 text-primary" />
            <span className="w-7 shrink-0 text-base font-bold text-heading">{count}</span>
            <span className="min-w-0 flex-1 truncate text-sm text-heading">{label}</span>
            <ChevronRight className="h-4 w-4 shrink-0 text-body transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
          </Link>
        </li>
      ))}
    </ul>
  </section>
);

export default PendingItems;