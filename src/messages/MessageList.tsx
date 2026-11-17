"use client";

import React, { useMemo, useState } from "react";
import { Search, SlidersHorizontal, Star, type LucideIcon } from "lucide-react";

import SignupField from "@/components/SignupField";
import TableStatus from "@/components/TableStatus";

/* ---------------------------------------------------------------- */
/*  Types (also used by MessageChat, MessageComposer,                */
/*  MessageContext and Messages)                                     */
/* ---------------------------------------------------------------- */
export type AttachmentKind = "image" | "video" | "audio" | "document";

export type Attachment = {
  name: string;
  /** Display size: "1.2 MB". */
  size: string;
  kind: AttachmentKind;
  /** Object / download URL. Missing for the static sample files. */
  url?: string;
};

export type ChatMessage = {
  id: string;
  from: "me" | "them";
  /** Day divider label: "Today", "Yesterday", "Oct 30". */
  day: string;
  time: string;
  text?: string;
  attachments?: Attachment[];
};

export type EmrItem = { Icon: LucideIcon; title: string; subtitle: string; href: string };

export type PatientInfo = {
  name: string;
  mrn: string;
  age: string;
  gender: string;
  dob: string;
  status: "Active" | "Inactive";
  provider: string;
  phone: string;
  email: string;
  insurance: string;
  allergies: string[];
  conditions: string[];
  vitals: { label: string; value: string }[];
  related: EmrItem[];
};

export type Conversation = {
  id: string;
  name: string;
  role: string;
  initials: string;
  /** Group / team conversations show an icon instead of initials. */
  Icon?: LucideIcon;
  tone: "primary" | "teal";
  subject: string;
  preview: string;
  /** Short time shown in the list: "10:24 AM", "Yesterday", "Oct 30". */
  time: string;
  starred: boolean;
  archived: boolean;
  patient: PatientInfo | null;
  messages: ChatMessage[];
};

/* ---------------------------------------------------------------- */
/*  Avatar (also used by MessageChat)                                */
/* ---------------------------------------------------------------- */
export const ConversationAvatar = ({
  conversation,
  size = "md",
}: {
  conversation: Pick<Conversation, "initials" | "Icon" | "tone" | "name">;
  size?: "sm" | "md";
}) => {
  const { Icon } = conversation;
  const dims = size === "sm" ? "h-9 w-9 text-xs" : "h-12 w-12 text-sm";
  const tone = conversation.tone === "teal" ? "bg-brand-teal/15 text-brand-teal" : "bg-primary/10 text-primary";
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full font-semibold ${dims} ${tone}`}
      aria-label={conversation.name}
    >
      {Icon ? <Icon className={size === "sm" ? "h-4 w-4" : "h-5 w-5"} /> : conversation.initials}
    </span>
  );
};

/* ---------------------------------------------------------------- */
/*  Component                                                        */
/* ---------------------------------------------------------------- */
type FilterKey = "all" | "unread" | "starred" | "archived";

type Props = {
  conversations: Conversation[];
  selectedId: string | null;
  unreadIds: Set<string>;
  onSelect: (id: string) => void;
};

const MessageList = ({ conversations, selectedId, unreadIds, onSelect }: Props) => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");

  const unreadCount = conversations.filter((c) => unreadIds.has(c.id) && !c.archived).length;

  const tabs: { key: FilterKey; label: string }[] = [
    { key: "all", label: "All" },
    { key: "unread", label: `Unread (${unreadCount})` },
    { key: "starred", label: "Starred" },
    { key: "archived", label: "Archived" },
  ];

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return conversations.filter((c) => {
      if (filter === "archived" ? !c.archived : c.archived) return false;
      if (filter === "unread" && !unreadIds.has(c.id)) return false;
      if (filter === "starred" && !c.starred) return false;
      if (q) {
        const haystack = [c.name, c.subject, c.preview, c.patient?.name ?? "", c.patient?.mrn ?? ""].join(" ").toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [conversations, search, filter, unreadIds]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Search + reset */}
      <div className="flex items-start gap-2 p-3 pb-0 sm:p-4 sm:pb-0">
        <div className="min-w-0 flex-1">
          <SignupField
            name="messageSearch"
            placeholder="Search messages, people, or patients..."
            icon={<Search className="h-4 w-4" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoComplete="off"
          />
        </div>
        <button
          type="button"
          aria-label="Reset filters"
          title="Reset filters"
          onClick={() => {
            setSearch("");
            setFilter("all");
          }}
          className="flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-border bg-card text-heading transition-colors hover:border-primary/50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
        >
          <SlidersHorizontal className="h-4 w-4" />
        </button>
      </div>

      {/* Filter pills – share the row evenly so the last one never touches the edge */}
      <div role="tablist" aria-label="Message filters" className="flex items-center gap-1 px-3 pb-2 pt-2 sm:px-4 border-b border-border">
        {tabs.map((t) => {
          const active = t.key === filter;
          return (
            <button
              key={t.key}
              role="tab"
              type="button"
              aria-selected={active}
              onClick={() => setFilter(t.key)}
              className={`min-w-0 flex-auto cursor-pointer whitespace-nowrap rounded-full px-2.5 py-1.5 text-center text-[13px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 sm:px-3 sm:text-sm ${
                active ? "bg-primary/10 font-semibold text-primary" : "text-heading hover:bg-primary/5"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Conversations */}
      {visible.length === 0 ? (
        <TableStatus variant="empty" message="No conversations match your filters." />
      ) : (
        <ul className="custom-scrollbar min-h-0 flex-1 space-y-1 overflow-y-auto px-2 pt-2 pb-3 sm:px-3">
          {visible.map((c) => {
            const selected = c.id === selectedId;
            const unread = unreadIds.has(c.id);
            return (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => onSelect(c.id)}
                  aria-current={selected}
                  className={`flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${
                    selected ? "bg-primary/10" : "hover:bg-primary/5"
                  }`}
                >
                  <ConversationAvatar conversation={c} />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-3">
                      <span className="flex min-w-0 items-center gap-1.5">
                        <span className="truncate text-sm font-semibold text-heading">{c.name}</span>
                        {c.starred && <Star className="h-3.5 w-3.5 shrink-0 fill-current text-warning" aria-label="Starred" />}
                      </span>
                      <span className="shrink-0 text-xs text-body">{c.time}</span>
                    </span>
                    <span className="mt-0.5 flex items-center justify-between gap-3">
                      <span className={`truncate text-sm ${unread ? "font-semibold text-heading" : "text-heading"}`}>{c.subject}</span>
                      {unread && <span className="h-2 w-2 shrink-0 rounded-full bg-primary" role="img" aria-label="Unread" />}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-body">{c.preview}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default MessageList;