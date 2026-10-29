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
import { createPortal } from "react-dom";
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
  subLabel?: string;
  image?: string;
}

export interface SignupDropdownProps {
  options: DropdownOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: ReactNode;
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
  /** Render the trigger border. Default: true */
  bordered?: boolean;
  /** Additional classes for the visible dropdown trigger. */
  triggerClassName?: string;
  /** Render the options in a viewport layer to escape clipped containers. */
  portalMenu?: boolean;
  /** Maximum portal menu height in pixels when the menu is scrollable. */
  menuMaxHeight?: number;
  /** Allow the menu to grow to its full content height without an inner scrollbar. */
  menuScrollable?: boolean;
  /** Set a local stacking level for portal menus, such as below sticky table headers. */
  portalMenuZIndex?: number;
  renderSelected?: (option: DropdownOption) => ReactNode;
  renderOption?: (option: DropdownOption) => ReactNode;
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
      bordered = true,
      triggerClassName = "",
      portalMenu = false,
      menuMaxHeight = 256,
      menuScrollable = true,
      portalMenuZIndex = 20,
      renderSelected,
      renderOption,
    },
    ref,
  ) => {
    const [open, setOpen] = useState(false);
    const [focused, setFocused] = useState(false);
    const [placement, setPlacement] = useState<"down" | "up">("down");
    const [query, setQuery] = useState("");
    const [highlightedIndex, setHighlightedIndex] = useState(0);
    const [portalPosition, setPortalPosition] = useState<{
      left: number;
      top: number;
      width: number;
    } | null>(null);

    const wrapRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLElement | null>(null);
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
const rightPad = compact ? "pr-6" : "pr-10";
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
      const el = triggerRef.current ?? wrapRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const nextPlacement =
        spaceBelow < minSpaceBelow && spaceAbove > spaceBelow ? "up" : "down";
      setPlacement(nextPlacement);
      if (portalMenu) {
        const menuHeight = Math.min(
          menuScrollable ? menuMaxHeight : Number.POSITIVE_INFINITY,
          filtered.length * 44 + 8,
        );
        setPortalPosition({
          left: rect.left,
          top:
            nextPlacement === "up"
              ? Math.max(8, rect.top - menuHeight - 4)
              : rect.bottom + 6,
          width: rect.width,
        });
      }
    };

    useLayoutEffect(() => {
      if (open) computePlacement();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, filtered.length, portalMenu, menuMaxHeight, menuScrollable]);

    useLayoutEffect(() => {
      if (!open || !portalMenu || !triggerRef.current || !listRef.current) return;

      const triggerRect = triggerRef.current.getBoundingClientRect();
      const menuRect = listRef.current.getBoundingClientRect();
      const top =
        placement === "up"
          ? Math.max(8, triggerRect.top - menuRect.height - 4)
          : triggerRect.bottom + 6;

      setPortalPosition((current) => {
        if (
          current &&
          Math.abs(current.top - top) < 1 &&
          Math.abs(current.left - triggerRect.left) < 1 &&
          Math.abs(current.width - triggerRect.width) < 1
        ) {
          return current;
        }
        return {
          left: triggerRect.left,
          top,
          width: triggerRect.width,
        };
      });
    }, [open, placement, portalMenu, filtered.length]);

    useEffect(() => {
      if (!open || !portalMenu || !triggerRef.current) return;
      if (typeof ResizeObserver === "undefined") return;

      const ro = new ResizeObserver(() => {
        computePlacement();
      });
      ro.observe(triggerRef.current);
      return () => ro.disconnect();
    }, [open, portalMenu]);

    useEffect(() => {
      if (!open) return;
      const onScroll = (event: Event) => {
        if (portalMenu) {
          if (event.target instanceof Node && listRef.current?.contains(event.target)) {
            return;
          }
          setOpen(false);
          setFocused(false);
          setQuery("");
          onBlur?.();
          return;
        }
        computePlacement();
      };
      const onResize = () => computePlacement();
      window.addEventListener("scroll", onScroll, true);
      window.addEventListener("resize", onResize);
      return () => {
        window.removeEventListener("scroll", onScroll, true);
        window.removeEventListener("resize", onResize);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, portalMenu, onBlur]);

    useEffect(() => {
      onOpenChange?.(open);
    }, [open, onOpenChange]);

    /* Close on outside click */
    useEffect(() => {
      const onDoc = (e: MouseEvent) => {
        if (
          wrapRef.current &&
          !wrapRef.current.contains(e.target as Node) &&
          !listRef.current?.contains(e.target as Node)
        ) {
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
          computePlacement();
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
        className={`relative w-full ${portalMenu ? "" : open ? "z-[60]" : "z-10"} ${className}`}
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
              ref={(el) => {
                triggerRef.current = el;
              }}
              className={`
                relative flex w-full min-w-0 items-center
                ${compact ? "h-8" : "h-12"}
                rounded-xl ${bordered ? "border bg-card" : "border-0 bg-transparent"}
                ${leftPad} ${rightPad}
                transition-colors duration-200
                ${bordered ? borderClass : ""}
                ${triggerClassName}
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
                title={open ? undefined : displayLabel}
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
                  if (!open) {
                    computePlacement();
                    setOpen(true);
                  }
                }}
                onFocus={() => {
                  setFocused(true);
                }}
                onBlur={() => {
                  setFocused(false);
                }}
                onKeyDown={handleKeyDown}
                onClick={() => {
                  if (!disabled) {
                    computePlacement();
                    setOpen(true);
                  }
                }}
                className={`
                  h-full min-w-0 flex-1 bg-transparent
                  pr-0
                  truncate text-sm text-heading outline-none
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
                  className={`absolute top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-card text-label hover:bg-heading/5 hover:text-heading ${chevronRight}`}
                >
                  <span className="text-xs">✕</span>
                </button>
              ) : (
                <ChevronDown
                  className={`
                    pointer-events-none absolute top-1/2 -translate-y-1/2
                    ${chevronSize} ${chevronRight}
                    bg-card transition-transform duration-300
                    ${open ? "rotate-180 text-primary" : "text-label"}
                  `}
                />
              )}
            </div>
          ) : (
            /* ===== Non-searchable trigger button ===== */
            <button
              ref={(el) => {
                triggerRef.current = el;
              }}
              id={inputId}
              name={name}
              aria-label={typeof label === "string" ? label : placeholder}
              type="button"
              disabled={disabled}
              aria-haspopup="listbox"
              aria-expanded={open}
              onClick={() => {
                if (disabled) return;
                computePlacement();
                setOpen((o) => !o);
                setFocused(true);
              }}
              onKeyDown={handleKeyDown}
              className={`
                relative flex w-full min-w-0 items-center
                ${compact ? "h-8" : "h-12"}
                rounded-xl ${bordered ? "border bg-card" : "border-0 bg-transparent"}
                ${leftPad} ${rightPad}
                text-left ${compact ? "text-xs" : "text-sm"}
                outline-none transition-colors duration-200
                cursor-pointer
                disabled:cursor-not-allowed disabled:opacity-60
                ${bordered ? borderClass : ""}
                ${triggerClassName}
              `}
            >
              {!renderSelected && hasTriggerIcon && (
                <span
                  className={`pointer-events-none absolute top-1/2 -translate-y-1/2 transition-colors duration-200 ${iconColor} ${iconLeft}`}
                >
                  {triggerIcon}
                </span>
              )}
              {renderSelected && selected ? (
                <span className="min-w-0 flex-1 pr-8">{renderSelected(selected)}</span>
              ) : (
                <span
                  title={selected?.label ?? placeholder}
                  className={`min-w-0 flex-1 truncate ${
                    selected ? "text-heading" : "text-placeholder"
                  }`}
                >
                  {selected?.label ?? placeholder}
                </span>
              )}

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
          {open && !disabled && (() => {
            const menu = (
            <ul
              ref={listRef}
              id={inputId ? `${inputId}-listbox` : undefined}
              role="listbox"
              onPointerDown={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              style={
                portalMenu
                  ? {
                      position: "fixed",
                      left: portalPosition?.left ?? (triggerRef.current ? triggerRef.current.getBoundingClientRect().left : 0),
                      top: portalPosition?.top ?? (triggerRef.current ? triggerRef.current.getBoundingClientRect().bottom + 6 : 0),
                      width: portalPosition?.width ?? (triggerRef.current ? triggerRef.current.getBoundingClientRect().width : wrapRef.current?.offsetWidth),
                      maxHeight: menuScrollable ? menuMaxHeight : undefined,
                      zIndex: portalMenuZIndex,
                    }
                  : undefined
              }
              className={`
                ${portalMenu ? "" : "absolute left-0 right-0 z-[100]"}
                ${portalMenu ? "" : "max-h-80"}
                ${menuScrollable ? "overflow-y-auto" : "overflow-y-visible"} overflow-x-hidden
                rounded-xl border border-border
                bg-card
                shadow-2xl shadow-black/20 dark:shadow-black/60
                ring-1 ring-border/60
                py-1
                animate-[dropdownIn_0.18s_cubic-bezier(0.16,1,0.3,1)_both]
                ${!portalMenu && (placement === "down" ? "top-full mt-1.5" : "bottom-full mb-1")}
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
                      onPointerDown={(e) => e.stopPropagation()}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        commitSelection(opt.value);
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        commitSelection(opt.value);
                      }}
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
                      {renderOption ? (
                        <span className="min-w-0 flex-1">{renderOption(opt)}</span>
                      ) : (
                        <span className="flex items-center gap-2 truncate">
                          {opt.icon && (
                            <span className="flex-shrink-0">{opt.icon}</span>
                          )}
                          <span title={opt.label} className="truncate">{opt.label}</span>
                        </span>
                      )}
                      {isSelected && (
                        <Check className="h-4 w-4 shrink-0 text-primary" />
                      )}
                    </li>
                  );
                })
              )}
            </ul>
            );
            return portalMenu && typeof document !== "undefined"
              ? createPortal(menu, document.body)
              : menu;
          })()}
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
