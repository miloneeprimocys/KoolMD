"use client";

import React from "react";
import { ChevronRight, Pencil, type LucideIcon } from "lucide-react";

type Variant = "edit" | "viewAll";

type Props = {
  /** Section/card name passed back to the handler. */
  section: string;
  /** Called with the section name when clicked. */
  onEdit?: (section: string) => void;
  /** Optional label override. Defaults to "Edit" or "View All" based on variant. */
  label?: string;
  /** Visual style. Defaults to "edit". */
  variant?: Variant;
  /** Optional extra classes. */
  className?: string;
  /** Optional: hide the icon. */
  hideIcon?: boolean;
};

const VARIANTS: Record<
  Variant,
  { defaultLabel: string; icon: LucideIcon; iconPosition: "start" | "end"; classes: string }
> = {
  edit: {
    defaultLabel: "Edit",
    icon: Pencil,
    iconPosition: "start",
    classes:
      "h-8 rounded-lg px-2.5 text-xs font-medium text-primary hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-primary/30",
  },
  viewAll: {
    defaultLabel: "View All",
    icon: ChevronRight,
    iconPosition: "end",
    classes:
      "h-8 rounded-lg px-1 text-xs font-medium text-primary hover:underline focus-visible:ring-2 focus-visible:ring-primary/30",
  },
};

const EditButton = ({
  section,
  onEdit,
  label,
  variant = "edit",
  className = "",
  hideIcon = false,
}: Props) => {
  const { defaultLabel, icon: Icon, iconPosition, classes } = VARIANTS[variant];
  const text = label ?? defaultLabel;

  return (
    <button
      type="button"
      onClick={() => onEdit?.(section)}
      aria-label={`${text} ${section}`}
      className={`inline-flex shrink-0 cursor-pointer items-center gap-1.5 transition-colors focus-visible:outline-none ${classes} ${className}`}
    >
      {iconPosition === "start" && !hideIcon && <Icon className="h-3.5 w-3.5" />}
      {text}
      {iconPosition === "end" && !hideIcon && <Icon className="h-4 w-4" />}
    </button>
  );
};

export default EditButton;