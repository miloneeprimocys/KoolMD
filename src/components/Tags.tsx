import React from "react";

export type TagTone =
  | "success"
  | "info"
  | "violet"
  | "warning"
  | "danger"
  | "neutral"
  | "outline";

export type TagSize = "xs" | "sm" | "md";

const TONES: Record<TagTone, string> = {
  success: "bg-success/10 text-success",
  info: "bg-primary/10 text-primary",
  violet: "bg-violet/10 text-violet",
  warning: "bg-warning/10 text-warning",
  danger: "bg-danger/10 text-danger",
  neutral: "bg-divider text-body",
  outline: "border border-border bg-card text-heading",
};

const SIZES: Record<TagSize, string> = {
  xs: "px-1.5 py-0.5 text-[11px]",
  sm: "px-2 py-0.5 text-[12px]",
  md: "px-2.5 py-1 text-sm",
};

type TagsProps = {
  text: string;
  tone?: TagTone;
  size?: TagSize;
  /** Optional leading icon */
  icon?: React.ReactNode;
  /** Show as a rounded pill instead of a rounded-md chip */
  pill?: boolean;
  /** Extra class names */
  className?: string;
};

const Tags = ({
  text,
  tone = "neutral",
  size = "sm",
  icon,
  pill = false,
  className = "",
}: TagsProps) => (
  <span
    className={`inline-flex items-center gap-1 whitespace-nowrap font-medium ${TONES[tone]} ${SIZES[size]} rounded-full ${className}`}
  >
    {icon && <span className="shrink-0">{icon}</span>}
    {text}
  </span>
);

export default Tags;