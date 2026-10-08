"use client";

import React, {
  forwardRef,
  ReactNode,
  useEffect,
  useLayoutEffect,
  useMemo,
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
  keywords?: string[];
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
  minSpaceBelow?: number;
  /** Enable typing to filter options. Default: true */
  searchable?: boolean;
  /** Compact padding for narrow dropdowns (e.g. phone country code). Default: false */
  compact?: boolean;
}

/* ---------------------------------------------------------------- */
/*  Component                                                       */
/* ---------------------------------------------------------------- */
const SignupDropdown = forwardRef<HTMLInputElement, SignupDropdownProps>(
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
      minSpaceBelow = 260,
      searchable = true,
      compact = false,
    },
    ref,
  ) => {
    const [open, setOpen] = useState(false);
    const [focused, setFocused] = useState(false);
    const [placement, setPlacement] = useState<"down" | "up">("down");
    const [query, setQuery] = useState("");
    const [highlightedIndex, setHighlightedIndex] = useState(0);

    const wrapRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const listRef = useRef<HTMLUListElement>(null);

    const selected = options.find((o) => o.value === value);
    const displayLabel = selected?.label ?? "";
    const hasError = Boolean(error);
    const inputId = id || name;

    /* Which icon (if any) shows on the trigger — selected option wins */
    const triggerIcon = selected?.icon ?? icon;
    const hasTriggerIcon = Boolean(triggerIcon);

    /* ---- Padding / positioning: compact vs normal ---- */
const leftPad = hasTriggerIcon
  ? compact
    ? "pl-8"
    : "pl-11"
  : compact
    ? "pl-2.5"
    : "pl-4";
const rightPad = compact ? "pr-6" : "pr-11";
const iconLeft = compact ? "left-2" : "left-3.5";
const chevronRight = compact ? "right-2" : "right-3.5";
    const chevronSize = compact ? "h-4 w-4" : "h-4.5 w-4.5";

    /* Merge forwarded ref with internal input ref */
    const setInputRef = (el: HTMLInputElement | null) => {
      inputRef.current = el;
      if (typeof ref === "function") ref(el);
      else if (ref)
        (ref as React.MutableRefObject<HTMLInputElement | null>).current = el;
    };

    /* Filtered options based on query */
    const filtered = useMemo(() => {
      if (!searchable || !query.trim()) return options;
      const rawQ = query.trim().toLowerCase();
      const qNoPlus = rawQ.replace(/^\+/, "");

      return options.filter((o) => {
        const labelLower = o.label.toLowerCase();
        const valueLower = o.value.toLowerCase();
        const labelNoPlus = labelLower.replace(/^\+/, "");

        if (labelLower.includes(rawQ) || valueLower.includes(rawQ)) return true;
        if (qNoPlus && (labelNoPlus.includes(qNoPlus) || valueLower.includes(qNoPlus))) return true;
        if (
          o.keywords &&
          o.keywords.some(
            (k) =>
              k.toLowerCase().includes(rawQ) ||
              (qNoPlus && k.toLowerCase().replace(/^\+/, "").includes(qNoPlus)),
          )
        ) {
          return true;
        }
        return false;
      });
    }, [options, query, searchable]);

    /* Reset highlight when filtered list changes */
    useEffect(() => {
      setHighlightedIndex(0);
    }, [query, open]);

    /* ---- Placement ---- */
    const computePlacement = () => {
      const el = wrapRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      if (spaceBelow < minSpaceBelow && spaceAbove > spaceBelow) {
        setPlacement("up");
      } else {
        setPlacement("down");
      }
    };

    useLayoutEffect(() => {
      if (open) computePlacement();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    useEffect(() => {
      if (!open) return;
      const onScrollOrResize = () => computePlacement();
      window.addEventListener("scroll", onScrollOrResize, true);
      window.addEventListener("resize", onScrollOrResize);
      return () => {
        window.removeEventListener("scroll", onScrollOrResize, true);
        window.removeEventListener("resize", onScrollOrResize);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    useEffect(() => {
      onOpenChange?.(open);
    }, [open, onOpenChange]);

    /* Close on outside click */
    useEffect(() => {
      const onDoc = (e: MouseEvent) => {
        if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
          setOpen(false);
          setFocused(false);
          setQuery("");
          onBlur?.();
        }
      };
      document.addEventListener("mousedown", onDoc);
      return () => document.removeEventListener("mousedown", onDoc);
    }, [onBlur]);

    /* Focus input when opened (searchable mode) */
    useEffect(() => {
      if (open && searchable) {
        requestAnimationFrame(() => inputRef.current?.focus());
      }
    }, [open, searchable]);

    /* Scroll highlighted item into view */
    useEffect(() => {
      if (!open || !listRef.current) return;
      const item = listRef.current.children[highlightedIndex] as HTMLElement;
      item?.scrollIntoView({ block: "nearest" });
    }, [highlightedIndex, open]);

    const commitSelection = (optValue: string) => {
      onChange(optValue);
      setOpen(false);
      setQuery("");
      setFocused(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (disabled) return;

      if (!open) {
        if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setOpen(true);
        }
        return;
      }

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setHighlightedIndex((i) =>
            filtered.length === 0 ? 0 : (i + 1) % filtered.length,
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setHighlightedIndex((i) =>
            filtered.length === 0
              ? 0
              : (i - 1 + filtered.length) % filtered.length,
          );
          break;
        case "Enter":
          e.preventDefault();
          if (filtered[highlightedIndex]) {
            commitSelection(filtered[highlightedIndex].value);
          }
          break;
        case "Escape":
          e.preventDefault();
          setOpen(false);
          setQuery("");
          setFocused(false);
          onBlur?.();
          break;
        case "Tab":
          setOpen(false);
          setQuery("");
          setFocused(false);
          onBlur?.();
          break;
      }
    };

    const borderClass = hasError
      ? "border-danger"
      : open || focused
        ? "border-primary"
        : "border-border hover:border-primary/50";

    const iconColor = hasError
      ? "text-danger"
      : open || focused
        ? "text-primary"
        : "text-body";

    return (
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

        {/* ---------- Trigger wrapper ---------- */}
        <div className="relative">
          {searchable ? (
            /* ===== Searchable input ===== */
            <div
              className={`
                relative flex h-12 w-full items-center
                rounded-xl border bg-card
                ${leftPad} ${rightPad}
                transition-colors duration-200
                ${borderClass}
              `}
            >
              {hasTriggerIcon && (
                <span
                  className={`pointer-events-none absolute top-1/2 -translate-y-1/2 transition-colors duration-200 ${iconColor} ${iconLeft}`}
                >
                  {triggerIcon}
                </span>
              )}

              <input
                ref={setInputRef}
                id={inputId}
                name={name}
                type="text"
                disabled={disabled}
                role="combobox"
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-controls={inputId ? `${inputId}-listbox` : undefined}
                autoComplete="off"
                placeholder={
                  focused || open ? placeholder : displayLabel || placeholder
                }
                value={open ? query : displayLabel}
                onChange={(e) => {
                  setQuery(e.target.value);
                  if (!open) setOpen(true);
                }}
                onFocus={() => {
                  setFocused(true);
                }}
                onBlur={() => {
                  setFocused(false);
                }}
                onKeyDown={handleKeyDown}
                onClick={() => {
                  if (!disabled) setOpen(true);
                }}
             className={`
  h-full min-w-0 bg-transparent
  ${compact ? "w-auto flex-none pr-0" : "flex-1 pr-2"}
  text-sm text-heading outline-none
  placeholder:text-placeholder
  disabled:cursor-not-allowed disabled:opacity-60
`}
              />

              {/* Chevron / clear button */}
              {open && query ? (
                <button
                  type="button"
                  aria-label="Clear"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    setQuery("");
                    inputRef.current?.focus();
                  }}
                  className={`absolute top-1/2 -translate-y-1/2 text-label hover:text-heading ${chevronRight}`}
                >
                  <span className="text-xs">✕</span>
                </button>
              ) : (
                <ChevronDown
                  className={`
                    pointer-events-none absolute top-1/2 -translate-y-1/2
                    ${chevronSize} ${chevronRight}
                    transition-transform duration-300
                    ${open ? "rotate-180 text-primary" : "text-label"}
                  `}
                />
              )}
            </div>
          ) : (
            /* ===== Non-searchable trigger button ===== */
            <button
              ref={triggerRef}
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
              onKeyDown={handleKeyDown}
              className={`
                relative flex h-12 w-full items-center
                rounded-xl border bg-card
                ${leftPad} ${rightPad}
                text-sm text-left
                outline-none transition-colors duration-200
                cursor-pointer
                disabled:cursor-not-allowed disabled:opacity-60
                ${borderClass}
              `}
            >
              {hasTriggerIcon && (
                <span
                  className={`pointer-events-none absolute top-1/2 -translate-y-1/2 transition-colors duration-200 ${iconColor} ${iconLeft}`}
                >
                  {triggerIcon}
                </span>
              )}
              <span
                className={`truncate ${
                  selected ? "text-heading" : "text-placeholder"
                }`}
              >
                {selected?.label ?? placeholder}
              </span>

              <ChevronDown
                className={`
                  absolute top-1/2 -translate-y-1/2
                  ${chevronSize} ${chevronRight}
                  transition-transform duration-300
                  ${open ? "rotate-180 text-primary" : "text-label"}
                `}
              />
            </button>
          )}

          {/* ---------- Options panel ---------- */}
          {open && !disabled && (
            <ul
              ref={listRef}
              id={inputId ? `${inputId}-listbox` : undefined}
              role="listbox"
              className={`
                absolute left-0 right-0 z-[100]
                max-h-64 overflow-y-auto overflow-x-hidden
                rounded-xl border border-border
                bg-card
                shadow-2xl shadow-black/20 dark:shadow-black/60
                ring-1 ring-border/60
                py-1
                animate-[dropdownIn_0.18s_cubic-bezier(0.16,1,0.3,1)_both]
                ${placement === "down" ? "top-full mt-1.5" : "bottom-full mb-1.5"}
              `}
            >
              {filtered.length === 0 ? (
                <li className="px-3 py-2.5 text-sm text-body">
                  No matches found
                </li>
              ) : (
                filtered.map((opt, idx) => {
                  const isSelected = opt.value === value;
                  const isHighlighted = idx === highlightedIndex;
                  return (
                    <li
                      key={opt.value}
                      role="option"
                      aria-selected={isSelected}
                      onMouseEnter={() => setHighlightedIndex(idx)}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => commitSelection(opt.value)}
                      className={`
                        mx-1 flex cursor-pointer items-center justify-between gap-2
                        rounded-lg px-3 py-2.5
                        text-sm
                        transition-colors duration-150
                        ${
                          isHighlighted
                            ? "bg-primary/10"
                            : "bg-transparent"
                        }
                        ${
                          isSelected
                            ? "text-primary font-medium"
                            : "text-heading"
                        }
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
                })
              )}
            </ul>
          )}
        </div>

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