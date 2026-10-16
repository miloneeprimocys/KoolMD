"use client";

import React, { type ReactNode } from "react";
import { Trash2 } from "lucide-react";

interface DeleteButtonProps {
  text: string;
  onClick?: () => void;
  icon?: ReactNode | null;
  disabled?: boolean;
  loading?: boolean;
  loadingText?: string;
  iconOnly?: boolean;
  iconOnlySize?: "sm" | "md" | "lg";
  className?: string;
}

const DeleteButton = ({
  text,
  onClick,
  icon = <Trash2 className="h-4 w-4" />,
  disabled = false,
  loading = false,
  loadingText = "Deleting…",
  iconOnly = false,
  iconOnlySize = "md",
  className = "",
}: DeleteButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled || loading}
    aria-label={text}
    title={text}
    className={
      iconOnly
        ? `flex ${iconOnlySize === "sm" ? "h-7 w-7" : iconOnlySize === "lg" ? "h-9 w-9" : "h-8 w-8"} cursor-pointer items-center justify-center rounded-xl text-danger transition-all duration-200 hover:bg-danger/10 active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger/30 disabled:cursor-not-allowed disabled:opacity-60 ${className}`
        : `inline-flex h-10 w-full cursor-pointer items-center justify-center whitespace-nowrap rounded-lg bg-danger px-5 text-sm font-semibold text-white transition-colors hover:bg-danger/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger/30 disabled:cursor-not-allowed disabled:opacity-60 ${className}`
    }
  >
    {iconOnly ? icon : loading ? loadingText : text}
  </button>
);

export default DeleteButton;
