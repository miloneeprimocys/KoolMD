"use client";

import React, { ButtonHTMLAttributes, ReactNode } from "react";
import { ArrowRight } from "lucide-react";

interface GlobalButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string;
  loadingText?: string;
  loading?: boolean;
  icon?: ReactNode;
}

const GlobalButton: React.FC<GlobalButtonProps> = ({
  text = "Continue",
  loadingText = "Please wait…",
  loading = false,
  icon,
  disabled,
  className = "",
  ...rest
}) => {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={`
        group relative isolate flex h-12 w-full cursor-pointer items-center justify-center gap-2
        overflow-hidden rounded-xl
        border border-[var(--btn-border)]
        bg-linear-to-r from-[var(--btn-from)] to-[var(--btn-to)]
        text-sm font-medium text-[var(--btn-text,var(--on-primary))]

        transition-all duration-200 ease-out
        hover:-translate-y-px
        hover:border-[color-mix(in_srgb,var(--btn-border)_80%,var(--btn-text))]
        hover:shadow-[0_6px_20px_-8px_var(--btn-shadow-hover)]
        active:translate-y-0 active:scale-[0.99]
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--btn-glow)] focus-visible:ring-offset-2 focus-visible:ring-offset-card
        disabled:cursor-not-allowed disabled:opacity-60
        disabled:hover:translate-y-0 disabled:hover:shadow-none
        ${className}
      `}
    >
      {loading ? (
        <>
          <span className="relative h-4 w-4 animate-spin rounded-full border-2 border-[var(--btn-text,var(--on-primary))]/30 border-t-[var(--btn-text,var(--on-primary))]" />
          <span className="relative tracking-tight">{loadingText}</span>
        </>
      ) : (
        <>
          <span className="relative transition-transform duration-200 ease-out group-hover:-translate-x-0.5">
            {icon ?? <ArrowRight className="h-4 w-4" />}
          </span>
          <span className="relative tracking-tight">{text}</span>
        </>
      )}
    </button>
  );
};

export default GlobalButton;