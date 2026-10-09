import React from "react";
import { AlertCircle, Inbox, RotateCw } from "lucide-react";

interface TableStatusProps {
  variant: "loading" | "empty" | "error";
  message?: string;
  onRetry?: () => void;
}

/** Placeholder shown in place of the table body while loading, when empty, or on error. */
const TableStatus = ({ variant, message, onRetry }: TableStatusProps) => (
  <div
    className="flex min-h-64 flex-col items-center justify-center gap-3 px-4 py-12 text-center"
    role={variant === "error" ? "alert" : "status"}
  >
    {variant === "loading" && (
      <span className="h-8 w-8 animate-spin rounded-full border-[3px] border-primary/25 border-t-primary" />
    )}
    {variant === "empty" && <Inbox className="h-8 w-8 text-placeholder" />}
    {variant === "error" && <AlertCircle className="h-8 w-8 text-danger" />}

    <p className="text-sm text-body">
      {message ?? (variant === "loading" ? "Loading…" : "No records found.")}
    </p>

    {variant === "error" && onRetry && (
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-heading transition-colors hover:border-primary hover:text-primary"
      >
        <RotateCw className="h-3.5 w-3.5" />
        Try again
      </button>
    )}
  </div>
);

export default TableStatus;
