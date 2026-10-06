"use client";

import React, { ButtonHTMLAttributes, ReactNode } from "react";
import { ArrowRight } from "lucide-react";

interface SignupButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string;
  loadingText?: string;
  loading?: boolean;
  icon?: ReactNode;
}

/* One wave period = 600 units, drawn twice (1200). Sliding by -50% loops seamlessly. */
const WAVE_PATH =
  "M0 60C100 10 200 10 300 60S500 110 600 60S800 10 900 60S1100 110 1200 60V120H0Z";

const SignupButton: React.FC<SignupButtonProps> = ({
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
        border border-shape-blue
        bg-linear-to-r from-surface-start to-shape-sky
        text-sm font-semibold text-heading
        transition-all duration-300 ease-out
        hover:-translate-y-0.5
        hover:border-brand-sky
        hover:shadow-lg hover:shadow-shape-blue/30
        active:translate-y-0 active:scale-[0.985]
        focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/25
        disabled:cursor-not-allowed disabled:opacity-70
        disabled:hover:translate-y-0 disabled:hover:shadow-none
        ${className}
      `}
    >
      {/* ── Wavy flowing layers (light shades only) ── */}
      <span aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <svg className="btn-wave btn-wave-1" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d={WAVE_PATH} fill="var(--shape-blue)" opacity="0.35" />
        </svg>
        <svg className="btn-wave btn-wave-2" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d={WAVE_PATH} fill="var(--shape-sky)" opacity="0.6" />
        </svg>
        <svg className="btn-wave btn-wave-3" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d={WAVE_PATH} fill="var(--card)" opacity="0.55" />
        </svg>
      </span>

      {loading ? (
        <>
          <span className="relative h-4 w-4 animate-spin rounded-full border-2 border-shape-blue border-t-primary" />
          <span className="relative tracking-tight">{loadingText}</span>
        </>
      ) : (
        <>
          <span className="relative tracking-tight">{text}</span>
          <span className="relative transition-transform duration-300 group-hover:translate-x-1">
            {icon ?? <ArrowRight className="h-4 w-4" />}
          </span>
        </>
      )}
    </button>
  );
};

export default SignupButton;