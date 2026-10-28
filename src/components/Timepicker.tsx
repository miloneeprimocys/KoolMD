"use client";

import React, {
  forwardRef,
  ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { Clock } from "lucide-react";
import { FieldError } from "./SignupField";

/* ---------------------------------------------------------------- */
/*  Types                                                           */
/* ---------------------------------------------------------------- */
export interface TimePickerProps {
  /** Value as ISO time string "HH:mm" (24-hour format) */
  value?: string;
  onChange: (value: string) => void;
  label?: ReactNode;
  placeholder?: string;
  error?: string;
  hint?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  name?: string;
  /** Minimum time in "HH:mm" format */
  minTime?: string;
  /** Maximum time in "HH:mm" format */
  maxTime?: string;
  onBlur?: () => void;
  /** Space needed below the field before the popover flips upward (desktop) */
  minSpaceBelow?: number;
  /** Horizontal alignment: 'left', 'right', or 'auto' */
  align?: "left" | "right" | "auto";
  /** Stacking order for the portaled picker, useful when rendered inside dialogs. */
  portalZIndex?: number;
  /** Stacking order for the mobile picker modal. Defaults to `portalZIndex`. */
  mobilePortalZIndex?: number;
  /** Optional stacking order for the trigger, useful inside sticky table rows. */
  triggerZIndex?: number;
}

/* ---------------------------------------------------------------- */
/*  Helpers                                                         */
/* ---------------------------------------------------------------- */
const pad = (n: number) => String(n).padStart(2, "0");

/** "HH:mm" → { h, m } */
const parseTime = (s?: string) => {
  if (!s) return null;
  const match = /^(\d{2}):(\d{2})$/.exec(s);
  if (!match) return null;
  return { h: Number(match[1]), m: Number(match[2]) };
};

/** { h, m } → "HH:mm" */
const toISO = (h: number, m: number) => `${pad(h)}:${pad(m)}`;

/** Format for display in 12-hour format */
const formatDisplay = (s?: string) => {
  const p = parseTime(s);
  if (!p) return "";
  const suffix = p.h >= 12 ? "PM" : "AM";
  const hour = p.h % 12 === 0 ? 12 : p.h % 12;
  return `${pad(hour)}:${pad(p.m)} ${suffix}`;
};

/** True when the viewport is below Tailwind's `sm` breakpoint (640px) */
const useIsMobile = () => {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const update = () => setMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return mobile;
};

/* ---------------------------------------------------------------- */
/*  Scroll Wheel Component                                          */
/* ---------------------------------------------------------------- */
const ScrollWheel = ({
  items,
  selected,
  onSelect,
  disabled,
}: {
  items: { value: string; label: string }[];
  selected: string;
  onSelect: (value: string) => void;
  disabled?: boolean;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemHeight = 40;
  const selectedIndex = items.findIndex((i) => i.value === selected);

  useEffect(() => {
    if (containerRef.current && selectedIndex >= 0) {
      containerRef.current.scrollTop = selectedIndex * itemHeight;
    }
  }, [selectedIndex]);

  return (
    <div
      ref={containerRef}
      className="relative h-40 overflow-y-auto scrollbar-hide"
      style={{
        scrollSnapType: "y mandatory",
        scrollbarWidth: "none",
        msOverflowStyle: "none",
      }}
    >
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      {/* Top fade */}
      <div className="absolute inset-x-0 top-0 z-10 h-16 bg-gradient-to-b from-card to-transparent pointer-events-none" />
      {/* Bottom fade */}
      <div className="absolute inset-x-0 bottom-0 z-10 h-16 bg-gradient-to-t from-card to-transparent pointer-events-none" />
      {/* Center highlight */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 z-0 bg-primary/5" />

      <div className="py-16">
        {items.map((item, index) => (
          <div
            key={item.value}
            onClick={() => !disabled && onSelect(item.value)}
            className={`flex h-10 shrink-0 cursor-pointer items-center justify-center text-sm transition-colors ${
              disabled
                ? "cursor-not-allowed opacity-40"
                : "hover:bg-primary/10"
            } ${item.value === selected ? "font-semibold text-primary" : "text-label"}`}
            style={{ scrollSnapAlign: "center" }}
          >
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
};

/* ---------------------------------------------------------------- */
/*  Component                                                       */
/* ---------------------------------------------------------------- */
const TimePicker = forwardRef<HTMLButtonElement, TimePickerProps>(
  (
    {
      value,
      onChange,
      label,
      placeholder = "Select time",
      error,
      hint,
      disabled = false,
      className = "",
      id,
      name,
      minTime,
      maxTime,
      onBlur,
      minSpaceBelow = 400,
      align = "auto",
      portalZIndex = 200,
      mobilePortalZIndex,
      triggerZIndex,
    },
    ref,
  ) => {
    const isMobile = useIsMobile();
    const [open, setOpen] = useState(false);
    const [selectedHour, setSelectedHour] = useState(() => {
      const p = parseTime(value);
      return p ? p.h : 9;
    });
    const [selectedMinute, setSelectedMinute] = useState(() => {
      const p = parseTime(value);
      return p ? p.m : 0;
    });
    const [isPM, setIsPM] = useState(() => {
      const p = parseTime(value);
      return p ? p.h >= 12 : false;
    });
    const [desktopPosition, setDesktopPosition] = useState<{
      left: number;
      top: number | null;
      bottom: number | null;
    } | null>(null);

    const wrapRef = useRef<HTMLDivElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement | null>(null);

    const hasError = Boolean(error);
    const inputId = id || name;
    const selected = parseTime(value);

    const setTriggerRef = (el: HTMLButtonElement | null) => {
      triggerRef.current = el;
      if (typeof ref === "function") ref(el);
      else if (ref)
        (ref as React.MutableRefObject<HTMLButtonElement | null>).current = el;
    };

    /* ---- Generate hours (1-12 for display) ---- */
    const hours = Array.from({ length: 12 }, (_, i) => ({
      value: String(i + 1),
      label: pad(i + 1),
    }));

    /* ---- Generate minutes (0-59) ---- */
    const minutes = Array.from({ length: 60 }, (_, i) => ({
      value: String(i),
      label: pad(i),
    }));

    /* ---- Range helpers ---- */
    const isDisabledTime = useCallback(
      (h: number, m: number) => {
        const iso = toISO(h, m);
        return Boolean((minTime && iso < minTime) || (maxTime && iso > maxTime));
      },
      [minTime, maxTime],
    );

    /* ---- Open / close ---- */
    const openPicker = () => {
      if (disabled) return;
      const p = selected || { h: 9, m: 0 };
      setSelectedHour(p.h % 12 === 0 ? 12 : p.h % 12);
      setSelectedMinute(p.m);
      setIsPM(p.h >= 12);
      setOpen(true);
    };

    const closePicker = useCallback(() => {
      setOpen(false);
      onBlur?.();
    }, [onBlur]);

    /* ---- Desktop placement ---- */
    const computePlacement = useCallback(() => {
      const el = triggerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const opensUp = spaceBelow < minSpaceBelow && spaceAbove > spaceBelow;
      const popoverWidth = Math.min(320, window.innerWidth - 32);
      const shouldAlignRight =
        align === "right" ||
        (align === "auto" && rect.left + popoverWidth > window.innerWidth - 16);
      const preferredLeft = shouldAlignRight
        ? rect.right - popoverWidth
        : rect.left;
      const left = Math.max(
        16,
        Math.min(preferredLeft, window.innerWidth - popoverWidth - 16),
      );

      setDesktopPosition({
        left,
        top: opensUp ? null : rect.bottom + 6,
        bottom: opensUp ? window.innerHeight - rect.top + 6 : null,
      });
    }, [minSpaceBelow, align]);

    useLayoutEffect(() => {
      if (!open || isMobile) {
        setDesktopPosition(null);
        return;
      }
      computePlacement();
    }, [open, isMobile, computePlacement]);

    useEffect(() => {
      if (!open || isMobile) return;
      window.addEventListener("scroll", computePlacement, true);
      window.addEventListener("resize", computePlacement);
      return () => {
        window.removeEventListener("scroll", computePlacement, true);
        window.removeEventListener("resize", computePlacement);
      };
    }, [open, isMobile, computePlacement]);

    /* ---- Outside click (desktop only) ---- */
    useEffect(() => {
      if (!open || isMobile) return;
      const onDoc = (e: MouseEvent) => {
        const target = e.target as Node;
        if (
          !wrapRef.current?.contains(target) &&
          !popoverRef.current?.contains(target)
        ) {
          closePicker();
        }
      };
      document.addEventListener("mousedown", onDoc);
      return () => document.removeEventListener("mousedown", onDoc);
    }, [open, isMobile, closePicker]);

    /* ---- Escape key ---- */
    useEffect(() => {
      if (!open) return;
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          e.stopPropagation();
          closePicker();
        }
      };
      document.addEventListener("keydown", onKey);
      return () => document.removeEventListener("keydown", onKey);
    }, [open, closePicker]);

    /* ---- Lock page scroll while mobile modal is open ---- */
    useEffect(() => {
      if (!open || !isMobile) return;
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }, [open, isMobile]);

    /* ---- Time selection ---- */
    const selectTime = () => {
      let finalHour = Number(selectedHour);
      if (isPM) {
        finalHour = finalHour === 12 ? 12 : finalHour + 12;
      } else {
        finalHour = finalHour === 12 ? 0 : finalHour;
      }
      const iso = toISO(finalHour, Number(selectedMinute));
      if (isDisabledTime(finalHour, Number(selectedMinute))) return;
      onChange(iso);
      closePicker();
    };

    /* ---- Trigger styling ---- */
    const borderClass = hasError
      ? "border-danger"
      : open
        ? "border-primary"
        : "border-border hover:border-primary/50";

    /* ---- Time picker panel ---- */
    const panel = (
      <div
        role="dialog"
        aria-label="Choose time"
        className="w-full select-none overflow-hidden rounded-2xl border border-border bg-card p-4 text-heading"
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-base font-semibold text-heading">Select Time</h3>
          <button
            type="button"
            onClick={closePicker}
            className="cursor-pointer rounded-lg p-2 text-label hover:bg-primary/10"
          >
            ✕
          </button>
        </div>

        <div className="flex items-center justify-center gap-4">
          {/* Hours */}
          <div className="flex-1">
            <p className="mb-2 text-center text-xs font-medium text-label">Hour</p>
            <ScrollWheel
              items={hours}
              selected={String(selectedHour)}
              onSelect={(val) => setSelectedHour(Number(val))}
              disabled={disabled}
            />
          </div>

          <span className="text-2xl font-semibold text-label pt-8">:</span>

          {/* Minutes */}
          <div className="flex-1">
            <p className="mb-2 text-center text-xs font-medium text-label">Minute</p>
            <ScrollWheel
              items={minutes}
              selected={String(selectedMinute)}
              onSelect={(val) => setSelectedMinute(Number(val))}
              disabled={disabled}
            />
          </div>

          {/* AM/PM */}
          <div className="flex w-20 flex-col gap-2 pt-8">
            <button
              type="button"
              onClick={() => setIsPM(true)}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isPM
                  ? "bg-primary text-white"
                  : "text-label hover:bg-primary/10"
              }`}
            >
              PM
            </button>
            <button
              type="button"
              onClick={() => setIsPM(false)}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                !isPM
                  ? "bg-primary text-white"
                  : "text-label hover:bg-primary/10"
              }`}
            >
              AM
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between border-t border-divider pt-3">
          <button
            type="button"
            onClick={() => {
              onChange("");
              closePicker();
            }}
            className="cursor-pointer rounded-lg px-2 py-1 text-sm font-medium text-primary transition-colors duration-150 hover:bg-primary/10"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={selectTime}
            className="cursor-pointer rounded-lg bg-primary px-4 py-1.5 text-sm font-medium text-white transition-colors duration-150 hover:bg-primary/90"
          >
            Done
          </button>
        </div>
      </div>
    );

    return (
      <div
        ref={wrapRef}
        className={`relative w-full ${triggerZIndex == null ? (open ? "z-[60]" : "z-10") : ""} ${className}`}
        style={triggerZIndex == null ? undefined : { zIndex: triggerZIndex }}
      >
        {label && (
          <label
            htmlFor={inputId}
            className="mb-2 block text-sm font-medium text-label"
          >
            {label}
          </label>
        )}

        <div className="relative">
          <button
            ref={setTriggerRef}
            id={inputId}
            name={name}
            type="button"
            disabled={disabled}
            aria-haspopup="dialog"
            aria-expanded={open}
            onClick={() => (open ? closePicker() : openPicker())}
            className={`relative flex h-12 w-full cursor-pointer items-center rounded-xl border bg-card pl-4 pr-12 text-left text-sm outline-none transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${borderClass}`}
          >
            <span
              className={`truncate ${
                value ? "text-heading" : "text-placeholder"
              }`}
            >
              {value ? formatDisplay(value) : placeholder}
            </span>

            <span
              className={`absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg transition-all duration-200 hover:scale-110 hover:bg-primary/10 ${
                open || hasError
                  ? hasError
                    ? "text-danger"
                    : "text-primary"
                  : "text-body hover:text-primary"
              }`}
            >
              <Clock className="h-4 w-4" />
            </span>
          </button>

          {/* Hidden input so the value is included in native form submits */}
          {name && <input type="hidden" name={`${name}-value`} value={value ?? ""} readOnly />}

          {/* Desktop popover */}
          {open &&
            !disabled &&
            !isMobile &&
            desktopPosition &&
            typeof document !== "undefined" &&
            createPortal(
              <div
                ref={popoverRef}
                onPointerDown={(e) => e.stopPropagation()}
                className="fixed z-[200] w-[320px] max-w-[calc(100vw-2rem)] rounded-2xl shadow-2xl shadow-black/20 dark:shadow-black/60"
                style={{
                  left: desktopPosition.left,
                  top: desktopPosition.top ?? undefined,
                  bottom: desktopPosition.bottom ?? undefined,
                  zIndex: portalZIndex,
                }}
              >
                {panel}
              </div>,
              document.body,
            )}

          {/* Mobile modal */}
          {open && !disabled && isMobile && typeof document !== "undefined" && (
            <div className="fixed inset-0 z-[999] flex items-end justify-center bg-black/50 backdrop-blur-sm">
              <div
                className="w-full max-w-[400px] rounded-t-3xl bg-card p-4 shadow-2xl"
                style={{ zIndex: mobilePortalZIndex ?? portalZIndex }}
              >
                {panel}
              </div>
            </div>
          )}

          {/* Error */}
          {error && <FieldError message={error} />}

          {/* Hint */}
          {hint && !error && (
            <p className="mt-1.5 text-xs text-body">{hint}</p>
          )}
        </div>
      </div>
    );
  },
);

TimePicker.displayName = "TimePicker";

export default TimePicker;
