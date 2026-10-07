"use client";

import React, { forwardRef, InputHTMLAttributes, ReactNode, useState } from "react";
import { AlertCircle } from "lucide-react";

/* ---------------------------------------------------------------- */
/*  Reusable animated error — collapses smoothly when empty         */
/* ---------------------------------------------------------------- */
export const FieldError = ({ message }: { message?: string }) => (
  <div
    className={`
      grid transition-all duration-200 ease-out
      ${message ? "grid-rows-[1fr] opacity-100 mt-1" : "grid-rows-[0fr] opacity-0 mt-0"}
    `}
    aria-live="polite"
  >
    <div className="overflow-hidden">
      <p className="flex items-center gap-1 text-[11px] font-medium leading-tight text-danger">
        <AlertCircle className="h-3 w-3 shrink-0" />
        {message}
      </p>
    </div>
  </div>
);

/* ---------------------------------------------------------------- */
/*  Types                                                           */
/* ---------------------------------------------------------------- */
export interface SignupFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "className"> {
  /** Field label shown above the input */
 label?: ReactNode;
  /** Leading icon (rendered inside, on the left) */
  icon?: ReactNode;
  /** Trailing icon / element (e.g. password toggle) */
  trailing?: ReactNode;
  /** Error message — pass `undefined` for no error */
  error?: string;
  /** Optional helper text shown below input when there is no error */
  hint?: string;
  /** Custom className for the outer wrapper */
  className?: string;
}

/* ---------------------------------------------------------------- */
/*  Component                                                       */
/* ---------------------------------------------------------------- */
const SignupField = forwardRef<HTMLInputElement, SignupFieldProps>(
  (
    {
      label,
      icon,
      trailing,
      error,
      hint,
      className = "",
      id,
      disabled,
      ...rest
    },
    ref,
  ) => {
    const [focused, setFocused] = useState(false);
    const hasError = Boolean(error);
    const inputId = id || rest.name;

    /* Border state: error > focused > default */
    const borderClass = hasError
      ? "border-danger"
      : focused
        ? "border-primary"
        : "border-border hover:border-primary/50";

    /* Icon color: error > focused > body */
    const iconColor = hasError
      ? "text-danger"
      : focused
        ? "text-primary"
        : "text-body";

    return (
      <div className={`w-full ${className}`}>
        {label && (
          <label
            htmlFor={inputId}
            className="mb-2 block text-sm font-medium text-label"
          >
            {label}
          </label>
        )}

        <div className="relative">
          {icon && (
            <span
              className={`pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-200 ${iconColor}`}
            >
              {icon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            onFocus={(e) => {
              setFocused(true);
              rest.onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              rest.onBlur?.(e);
            }}
            className={`
              peer h-12 w-full rounded-xl border bg-card
              ${icon ? "pl-11" : "pl-4"}
              ${trailing ? "pr-11" : "pr-4"}
              text-sm text-heading placeholder:text-placeholder
              outline-none transition-colors duration-200
              disabled:cursor-not-allowed disabled:opacity-60
              ${borderClass}
            `}
            {...rest}
          />

          {trailing && (
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2">
              {trailing}
            </span>
          )}
        </div>

        {/* Error takes priority over hint */}
        {hasError ? (
          <FieldError message={error} />
        ) : hint ? (
          <p className="mt-1.5 text-[11px] leading-tight text-body">{hint}</p>
        ) : (
          <FieldError message={undefined} />
        )}
      </div>
    );
  },
);

SignupField.displayName = "SignupField";

export default SignupField;