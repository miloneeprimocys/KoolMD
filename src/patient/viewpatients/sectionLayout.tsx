import React from "react";
import type { LucideIcon } from "lucide-react";
import { type TableColumn } from "@/components/Tableheader";

/** Layout pieces shared by the View Patient tabs. */

export const TONES = {
  red: "bg-danger/40 text-danger",
  violet: "bg-violet/40 text-violet",
  blue: "bg-primary/20 dark:bg-primary/30 text-primary",
  green: "bg-success/40 text-success",
  orange: "bg-warning/40 text-warning",
  pink: "bg-pink/40 text-pink",
  primary: "bg-primary/40 text-primary",
  success: "bg-success/40 text-success",
  warning: "bg-warning/40 text-warning",
} as const;
export type Tone = keyof typeof TONES;

/** Tighter cell padding for the dense tab tables. */
export const DENSE = "!px-3";

export const col = (key: string, label: string): TableColumn => ({ key, label, className: DENSE });

export const ACTIONS_COL: TableColumn = {
  key: "actions",
  label: "Actions",
  className: DENSE,
  width: 72,
  header: <div className="flex w-full items-center justify-center">Actions</div>,
};

/**
 * Card with an icon header. Fixed height by default (pass `!h-auto` to grow); the body is
 * `flex-1 min-h-0` so an inner ScrollArea can shrink and scroll.
 */
export const SectionCard = ({
  icon: Icon,
  tone,
  title,
  subtitle,
  action,
  children,
  className = "",
}: {
  icon: LucideIcon;
  tone: Tone;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) => (
  <section
    className={`flex h-[380px] min-w-0 flex-col rounded-[8px] border border-border/40 bg-card ${className}`}
  >
    <header className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5 sm:px-5 sm:py-4">
      <div className="flex min-w-0 items-center gap-3">
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${TONES[tone]}`}>
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-heading sm:text-base">{title}</h3>
          {subtitle && <p className="mt-0.5 text-xs text-body">{subtitle}</p>}
        </div>
      </div>
      {action}
    </header>
    <div className="flex min-h-0 flex-1 flex-col px-4 pb-4 sm:px-5 sm:pb-5">{children}</div>
  </section>
);

/** Scrollable body region with a sticky table header. */
export const ScrollArea = ({ children }: { children: React.ReactNode }) => (
  <div className="hide-scrollbar min-h-0 flex-1 overflow-y-auto">
    <div className="[&_table]:w-full [&_thead]:sticky [&_thead]:top-0 [&_thead]:z-10 [&_thead]:bg-card">
      {children}
    </div>
  </div>
);
