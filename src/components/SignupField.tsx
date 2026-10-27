"use client";

import React, { forwardRef, InputHTMLAttributes, ReactNode, useState } from "react";
import { AlertCircle } from "lucide-react";

/* ---------------------------------------------------------------- */
/*  Reusable animated error — collapses smoothly when empty         */
/* ---------------------------------------------------------------- */
export const FieldError = ({ message }: { message?: string }) => (
  <div
    className={`overflow-hidden transition-all duration-200 ease-out ${
      message ? "mt-1 max-h-10 opacity-100" : "mt-0 max-h-0 opacity-0"
    }`}
    aria-live="polite"
  >
    <p className="flex items-center gap-1 text-[11px] font-medium leading-tight text-danger">
      <AlertCircle className="h-3 w-3 shrink-0" />
      {message}
    </p>
  </div>
);

/* ---------------------------------------------------------------- */
/*  Types                                                           */
/* ---------------------------------------------------------------- */
export interface SignupFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "className" | "onChange" | "onFocus" | "onBlur" | "type"> {
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
  /** Custom className for the inner input or textarea element */
  inputClassName?: string;
  /** Render a multiline textarea instead of a single-line input. */
  multiline?: boolean;
  /** Number of visible lines when rendered as a textarea. */
  rows?: number;
  type?: React.HTMLInputTypeAttribute;
  onChange?: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  onFocus?: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;
}

/* ---------------------------------------------------------------- */
/*  Component                                                       */
/* ---------------------------------------------------------------- */
const SignupField = forwardRef<HTMLInputElement | HTMLTextAreaElement, SignupFieldProps>(
  (
    {
      label,
      icon,
      trailing,
      error,
      hint,
      className = "",
      inputClassName = "",
      id,
      disabled,
      multiline = false,
      rows = 4,
      type = "text",
      maxLength,
      value,
      onChange,
      onFocus,
      onBlur,
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

          {multiline ? (
            <>
              <textarea
                ref={ref as React.Ref<HTMLTextAreaElement>}
                id={inputId}
                disabled={disabled}
                rows={rows}
                maxLength={maxLength}
                value={value}
                onFocus={(e) => {
                  setFocused(true);
                  onFocus?.(e);
                }}
                onBlur={(e) => {
                  setFocused(false);
                  onBlur?.(e);
                }}
                onChange={onChange}
                className={`w-full resize-y rounded-xl border bg-card px-4 pb-7 pt-3 text-sm text-heading placeholder:text-placeholder outline-none transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${borderClass}`}
                {...(rest as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
              />
              {typeof value === "string" && maxLength !== undefined && (
                <span className="pointer-events-none absolute bottom-2.5 right-3.5 text-[11px] text-body">
                  {value.length}/{maxLength}
                </span>
              )}
            </>
          ) : (
            <input
              ref={ref as React.Ref<HTMLInputElement>}
              id={inputId}
              type={type}
              disabled={disabled}
              value={value}
              maxLength={maxLength}
              onFocus={(e) => {
                setFocused(true);
                onFocus?.(e);
              }}
              onBlur={(e) => {
                setFocused(false);
                onBlur?.(e);
              }}
              onChange={onChange}
              className={`
                peer h-12 w-full rounded-xl border bg-card
                ${icon ? "pl-11" : "pl-4"}
                ${trailing ? "pr-11" : "pr-4"}
                text-sm text-heading placeholder:text-placeholder
                outline-none transition-colors duration-200
                disabled:cursor-not-allowed disabled:opacity-60
                ${borderClass}
                ${inputClassName}
              `}
              {...rest}
            />
          )}

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
