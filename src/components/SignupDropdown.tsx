"use client";

import React, {
  forwardRef,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import { ChevronDown, Check } from "lucide-react";
import { FieldError } from "./SignupField";

/* ---------------------------------------------------------------- */
/*  Types                                                           */
/* ---------------------------------------------------------------- */
export interface DropdownOption {
  value: string;
  label: string;
  icon?: ReactNode;
}

export interface SignupDropdownProps {
  options: DropdownOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  icon?: ReactNode;
  error?: string;
  hint?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  name?: string;
  onBlur?: () => void;
  onOpenChange?: (isOpen: boolean) => void;
}

/* ---------------------------------------------------------------- */
/*  Component                                                       */
/* ---------------------------------------------------------------- */
const SignupDropdown = forwardRef<HTMLButtonElement, SignupDropdownProps>(
  (
    {
      options,
      value,
      onChange,
      placeholder = "Select an option",
      label,
      icon,
      error,
      hint,
      disabled = false,
      className = "",
      id,
      name,
      onBlur,
      onOpenChange,
    },
    ref,
  ) => {
    const [open, setOpen] = useState(false);
    const [focused, setFocused] = useState(false);
    const wrapRef = useRef<HTMLDivElement>(null);

    const selected = options.find((o) => o.value === value);
    const displayLabel = selected?.label ?? placeholder;
    const hasError = Boolean(error);
    const inputId = id || name;

    /* Notify parent when open state changes */
    useEffect(() => {
      onOpenChange?.(open);
    }, [open, onOpenChange]);

    /* Close on outside click */
    useEffect(() => {
      const onDoc = (e: MouseEvent) => {
        if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
          setOpen(false);
          setFocused(false);
          onBlur?.();
        }
      };
      document.addEventListener("mousedown", onDoc);
      return () => document.removeEventListener("mousedown", onDoc);
    }, [onBlur]);

    /* Close on Escape */
    useEffect(() => {
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape" && open) {
          setOpen(false);
          onBlur?.();
        }
      };
      document.addEventListener("keydown", onKey);
      return () => document.removeEventListener("keydown", onKey);
    }, [open, onBlur]);

    /* Border / icon colors */
    const borderClass = hasError
      ? "border-red-500"
      : open || focused
        ? "border-primary"
        : "border-border hover:border-primary/50";

    const iconColor = hasError
      ? "text-red-500"
      : open || focused
        ? "text-primary"
        : "text-body";

    return (
      /* z-[60] when open so the whole dropdown floats above siblings */
      <div
        ref={wrapRef}
        className={`relative w-full ${open ? "z-[60]" : "z-10"} ${className}`}
      >
        {label && (
          <label
            htmlFor={inputId}
            className="mb-2 block text-sm font-medium text-label"
          >
            {label}
          </label>
        )}

        {/* ---------- Trigger ---------- */}
        <button
          ref={ref}
          id={inputId}
          name={name}
          type="button"
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => {
            if (disabled) return;
            setOpen((o) => !o);
            setFocused(true);
          }}
          className={`
            relative flex h-12 w-full items-center justify-between
            rounded-xl border
            bg-card
            ${icon ? "pl-11" : "pl-4"} pr-11
            text-sm text-left
            outline-none transition-colors duration-200
            cursor-pointer
            disabled:cursor-not-allowed disabled:opacity-60
            ${borderClass}
          `}
        >
          <span className="flex items-center gap-2 truncate">
            {icon && (
              <span
                className={`pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-200 ${iconColor}`}
              >
                {icon}
              </span>
            )}
            <span
              className={`truncate ${selected ? "text-heading" : "text-placeholder"
                }`}
            >
              {displayLabel}
            </span>
          </span>

          <ChevronDown
            className={`
              absolute right-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2
              transition-transform duration-300
              ${open ? "rotate-180 text-primary" : "text-label"}
            `}
          />
        </button>

        {/* ---------- Options panel ---------- */}
        {open && !disabled && (
          <ul
            role="listbox"
            className="
      absolute left-0 right-0 top-full mt-1.5
      z-[100]
      max-h-64 overflow-y-auto overflow-x-hidden
      rounded-xl border border-border
      bg-card
      shadow-2xl shadow-shape-sky/40
      ring-1 ring-black/5
      py-1
      animate-[dropdownIn_0.18s_cubic-bezier(0.16,1,0.3,1)_both]
    "
          >
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <li
                  key={opt.value}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={`
            mx-1 flex cursor-pointer items-center justify-between gap-2
            rounded-lg px-3 py-2.5
            text-sm
            transition-colors duration-150
            hover:bg-primary/5
            ${isSelected ? "bg-primary/10 text-primary font-medium" : "text-heading"}
          `}
                >
                  <span className="flex items-center gap-2 truncate">
                    {opt.icon && (
                      <span className="flex-shrink-0">{opt.icon}</span>
                    )}
                    <span className="truncate">{opt.label}</span>
                  </span>
                  {isSelected && (
                    <Check className="h-4 w-4 shrink-0 text-primary" />
                  )}
                </li>
              );
            })}
          </ul>
        )}

        {/* ---------- Error / hint ---------- */}
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

SignupDropdown.displayName = "SignupDropdown";

export default SignupDropdown;