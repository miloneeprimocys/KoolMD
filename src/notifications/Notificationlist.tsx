"use client";

import React from "react";
import { type LucideIcon } from "lucide-react";

import TableStatus from "@/components/TableStatus";

/* ---------------------------------------------------------------- */
/*  Types (also used by NotificationDetail and Notifications)        */
/* ---------------------------------------------------------------- */
export type NotificationCategory = "appointments" | "lab" | "prescriptions" | "payments" | "system";

export type NotificationField = { Icon: LucideIcon; label: string; value: string };

export type NotificationAction = { label: string; href: string; variant?: "primary" | "secondary" };

export type NotificationItem = {
  id: string;
  category: NotificationCategory;
  title: string;
  /** One-line preview shown in the list (truncated by CSS). */
  preview: string;
  /** Short time shown in the list: "10:30 AM", "Yesterday", "Oct 30". */
  time: string;
  /** Longer time shown in the detail header: "Today, 10:30 AM". */
  fullTime: string;
  Icon: LucideIcon;
  greeting: string;
  intro: string;
  fields: NotificationField[];
  outro?: string;
  actions: NotificationAction[];
};

/* ---------------------------------------------------------------- */
/*  Component                                                        */
/* ---------------------------------------------------------------- */
type Props = {
  items: NotificationItem[];
  selectedId: string | null;
  unreadIds: Set<string>;
  onSelect: (id: string) => void;
};

const NotificationList = ({ items, selectedId, unreadIds, onSelect }: Props) => {
  if (items.length === 0) {
    return <TableStatus variant="empty" message="No notifications in this category." />;
  }

  return (
    <ul className="custom-scrollbar max-h-[70vh] space-y-1 overflow-y-auto pr-1">
      {items.map(({ id, title, preview, time, Icon }) => {
        const selected = id === selectedId;
        const unread = unreadIds.has(id);
        return (
          <li key={id}>
            <button
              type="button"
              onClick={() => onSelect(id)}
              aria-current={selected}
              className={`flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${
                selected ? "bg-primary/10" : "hover:bg-primary/5"
              }`}
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-3">
                  <span className="truncate text-sm font-semibold text-heading">{title}</span>
                  <span className="shrink-0 text-xs text-body">{time}</span>
                </span>
                <span className="mt-0.5 flex items-center justify-between gap-3">
                  <span className="truncate text-xs text-body">{preview}</span>
                  {unread && (
                    <span className="h-2 w-2 shrink-0 rounded-full bg-primary" role="img" aria-label="Unread" />
                  )}
                </span>
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
};

export default NotificationList;