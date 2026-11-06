"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Bell, MoreVertical, Trash2 } from "lucide-react";

import AddButton from "@/components/Addbutton";
import ImportButton from "@/components/ImportButton";
import { type NotificationItem } from "./Notificationlist";

type Props = {
  /** `null` = nothing selected. */
  item: NotificationItem | null;
  isUnread: boolean;
  onDelete: (id: string) => void;
  onToggleUnread: (id: string) => void;
  /** Below 2xl the detail replaces the list; this returns to the list. */
  onBack: () => void;
};

const iconButtonCls =
  "flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-heading transition-colors hover:bg-primary/5 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30";

const NotificationDetail = ({ item, isUnread, onDelete, onToggleUnread, onBack }: Props) => {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  if (!item) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center gap-3 px-6 py-16 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Bell className="h-6 w-6" />
        </span>
        <p className="text-sm text-body">Select a notification to read it here.</p>
      </div>
    );
  }

  const { Icon } = item;

  return (
    <div className="space-y-5">
      {/* Back to list (below 2xl only) */}
      <button
        type="button"
        onClick={onBack}
        className="flex cursor-pointer items-center gap-1.5 text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 2xl:hidden"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to notifications
      </button>

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon className="h-6 w-6" />
          </span>
          <div className="min-w-0">
            <h3 className="truncate text-lg font-semibold text-heading sm:text-xl">{item.title}</h3>
            <p className="text-sm text-body">{item.fullTime}</p>
          </div>
        </div>

        <div className="relative flex shrink-0 items-center gap-1">
          <button type="button" aria-label="Delete notification" onClick={() => onDelete(item.id)} className={iconButtonCls}>
            <Trash2 className="h-[18px] w-[18px]" />
          </button>
          <button
            type="button"
            aria-label="More options"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
            className={iconButtonCls}
          >
            <MoreVertical className="h-[18px] w-[18px]" />
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} aria-hidden="true" />
              <div className="absolute right-0 top-full z-20 mt-1 w-44 overflow-hidden rounded-xl border border-border bg-card py-1 shadow-xl">
                <button
                  type="button"
                  onClick={() => {
                    onToggleUnread(item.id);
                    setMenuOpen(false);
                  }}
                  className="block w-full cursor-pointer px-4 py-2.5 text-left text-sm text-heading hover:bg-primary/5"
                >
                  {isUnread ? "Mark as read" : "Mark as unread"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onDelete(item.id);
                  }}
                  className="block w-full cursor-pointer px-4 py-2.5 text-left text-sm text-danger hover:bg-danger/5"
                >
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="space-y-3 text-sm text-heading">
        <p>{item.greeting}</p>
        <p>{item.intro}</p>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border md:grid-cols-4">
        {item.fields.map(({ Icon: FieldIcon, label, value }) => (
          <div key={label} className="space-y-1.5 bg-card p-4">
            <FieldIcon className="h-5 w-5 text-primary" />
            <p className="text-xs text-body">{label}</p>
            <p className="text-sm font-semibold text-heading">{value}</p>
          </div>
        ))}
      </div>

      {item.outro && <p className="text-sm text-heading">{item.outro}</p>}

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3">
        {item.actions.map((a) =>
          a.variant === "secondary" ? (
            <ImportButton key={a.label} text={a.label} icon={null} onClick={() => router.push(a.href)} />
          ) : (
            <AddButton key={a.label} text={a.label} icon={null} onClick={() => router.push(a.href)} />
          ),
        )}
      </div>
    </div>
  );
};

export default NotificationDetail;