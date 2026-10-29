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
import { CalendarDays, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import Calendar, { SHORT_WEEKDAYS } from "@/components/Calendar";
import { FieldError } from "./SignupField";

/* ---------------------------------------------------------------- */
/*  Types                                                           */
/* ---------------------------------------------------------------- */
export interface DatePickerProps {
  /** Value as ISO string "YYYY-MM-DD" (same as <input type="date">) */
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
  /** ISO "YYYY-MM-DD". Dates before this are disabled. */
  minDate?: string;
  /** ISO "YYYY-MM-DD". Dates after this are disabled. */
  maxDate?: string;
  onBlur?: () => void;
  /** Space needed below the field before the popover flips upward (desktop) */
  minSpaceBelow?: number;
  /** Horizontal alignment: 'left', 'right', or 'auto' (detects screen/container edge) */
  align?: "left" | "right" | "auto";
  /** Stacking order for the portaled calendar, useful when rendered inside dialogs. */
  portalZIndex?: number;
  /** Stacking order for the mobile calendar modal. Defaults to `portalZIndex`. */
  mobilePortalZIndex?: number;
  /** Optional stacking order for the trigger, useful inside sticky table rows. */
  triggerZIndex?: number;
  /** Show an inline time picker (HH:MM) alongside the calendar */
  showTime?: boolean;
  /** Current time value as "HH:MM" */
  time?: string;
  /** Called when the time changes */
  onTimeChange?: (time: string) => void;
}

/* ---------------------------------------------------------------- */
/*  Helpers                                                         */
/* ---------------------------------------------------------------- */
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const MONTHS_SHORT = MONTHS.map((m) => m.slice(0, 3));
const YEARS_PER_PAGE = 12;

const pad = (n: number) => String(n).padStart(2, "0");
const toISO = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;

const parseISO = (s?: string) => {
  if (!s) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!match) return null;
  return { y: Number(match[1]), m: Number(match[2]) - 1, d: Number(match[3]) };
};

const todayISO = () => {
  const n = new Date();
  return toISO(n.getFullYear(), n.getMonth(), n.getDate());
};

const formatDisplay = (s?: string) => {
  const p = parseISO(s);
  return p ? `${pad(p.d)}-${pad(p.m + 1)}-${p.y}` : "";
};

const daysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();

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

type View = "days" | "months" | "years";

/* ---------------------------------------------------------------- */
/*  Component                                                       */
/* ---------------------------------------------------------------- */
const DatePicker = forwardRef<HTMLButtonElement, DatePickerProps>(
  (
    {
      value,
      onChange,
      label,
      placeholder = "dd-mm-yyyy",
      error,
      hint,
      disabled = false,
      className = "",
      id,
      name,
      minDate,
      maxDate,
      onBlur,
      minSpaceBelow = 400,
      align = "auto",
      portalZIndex = 200,
      mobilePortalZIndex,
      triggerZIndex,
      showTime = false,
      time = "00:00",
      onTimeChange,
    },
    ref,
  ) => {
    const isMobile = useIsMobile();
    const [open, setOpen] = useState(false);
    const [view, setView] = useState<View>("days");
    const [viewYear, setViewYear] = useState(() => new Date().getFullYear());
    const [viewMonth, setViewMonth] = useState(() => new Date().getMonth());
    const [yearPageStart, setYearPageStart] = useState(0);
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
    const selected = parseISO(value);
    const today = todayISO();

    /* ---- Time helpers ---- */
    const [timeParts, setTimeParts] = useState(() => {
      const [h = "00", m = "00"] = time.split(":");
      return { h: Number(h), m: Number(m) };
    });
    const emitTime = (h: number, m: number) => {
      onTimeChange?.(`${pad(h)}:${pad(m)}`);
      setTimeParts({ h, m });
    };
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const minutes = Array.from({ length: 60 }, (_, i) => i);
    const hourRef = useRef<HTMLDivElement>(null);
    const minRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
      if (!open || !showTime) return;
      const ITEM = 36;
      hourRef.current?.scrollTo({ top: timeParts.h * ITEM, behavior: "instant" });
      minRef.current?.scrollTo({ top: timeParts.m * ITEM, behavior: "instant" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    const setTriggerRef = (el: HTMLButtonElement | null) => {
      triggerRef.current = el;
      if (typeof ref === "function") ref(el);
      else if (ref)
        (ref as React.MutableRefObject<HTMLButtonElement | null>).current = el;
    };

    /* ---- Range helpers ---- */
    const isDisabledDate = useCallback(
      (iso: string) =>
        Boolean((minDate && iso < minDate) || (maxDate && iso > maxDate)),
      [minDate, maxDate],
    );

    const minYear = parseISO(minDate)?.y ?? 1900;
    const maxYear = parseISO(maxDate)?.y ?? new Date().getFullYear() + 100;

    /* ---- Open / close ---- */
    const openPicker = () => {
      if (disabled) return;
      let base = selected ?? parseISO(today)!;
      // keep the view inside the allowed range when nothing is selected
      if (!selected) {
        if (maxDate && today > maxDate) base = parseISO(maxDate)!;
        else if (minDate && today < minDate) base = parseISO(minDate)!;
      }
      setViewYear(base.y);
      setViewMonth(base.m);
      setView("days");
      setOpen(true);
    };

    const closePicker = useCallback(() => {
      setOpen(false);
      onBlur?.();
    }, [onBlur]);

    /* ---- Desktop placement (flip up if no room below & flip horizontal if no room on right) ---- */
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

    /* ---- Outside click (desktop only; mobile uses the backdrop) ---- */
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

    /* ---- Lock page scroll while the mobile modal is open ---- */
    useEffect(() => {
      if (!open || !isMobile) return;
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }, [open, isMobile]);

    /* ---- Navigation ---- */
    const goPrev = () => {
      if (view === "days") {
        if (viewMonth === 0) {
          setViewMonth(11);
          setViewYear((y) => y - 1);
        } else setViewMonth((m) => m - 1);
      } else if (view === "months") setViewYear((y) => y - 1);
      else setYearPageStart((s) => s - YEARS_PER_PAGE);
    };

    const goNext = () => {
      if (view === "days") {
        if (viewMonth === 11) {
          setViewMonth(0);
          setViewYear((y) => y + 1);
        } else setViewMonth((m) => m + 1);
      } else if (view === "months") setViewYear((y) => y + 1);
      else setYearPageStart((s) => s + YEARS_PER_PAGE);
    };

    const prevDisabled =
      view === "days"
        ? Boolean(minDate) && toISO(viewYear, viewMonth, 1) <= (minDate as string)
        : view === "months"
          ? viewYear <= minYear
          : yearPageStart <= minYear;

    const nextDisabled =
      view === "days"
        ? Boolean(maxDate) &&
          toISO(viewYear, viewMonth, daysInMonth(viewYear, viewMonth)) >=
            (maxDate as string)
        : view === "months"
          ? viewYear >= maxYear
          : yearPageStart + YEARS_PER_PAGE - 1 >= maxYear;

    const toggleHeader = () => {
      if (view === "days") {
        setYearPageStart(viewYear - (viewYear % YEARS_PER_PAGE));
        setView("years");
      } else if (view === "years") setView("days");
      else setView("days");
    };

    const selectDate = (d: number) => {
      const iso = toISO(viewYear, viewMonth, d);
      if (isDisabledDate(iso)) return;
      onChange(iso);
      closePicker();
    };

    const headerLabel =
      view === "days"
        ? `${MONTHS[viewMonth]} ${viewYear}`
        : view === "months"
          ? String(viewYear)
          : `${yearPageStart} – ${yearPageStart + YEARS_PER_PAGE - 1}`;

    const navBtnCls =
      "flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-label transition-colors duration-150 hover:bg-primary/10 hover:text-primary disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-label";

    /* ---- Calendar panel (shared by desktop popover + mobile modal) ---- */
    const calendarPanel = (
      <div
        role="dialog"
        aria-label="Choose date"
        className={`select-none overflow-hidden rounded-2xl border border-border bg-card p-4 text-heading ${showTime ? "flex gap-0" : "w-full"}`}
      >
        <div className={showTime ? "min-w-0 flex-1" : "w-full"}>
        {/* Header */}
        <div className="mb-3 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={toggleHeader}
            className="inline-flex cursor-pointer items-center gap-1 rounded-lg px-2 py-1.5 text-sm font-semibold text-heading transition-colors duration-150 hover:bg-primary/10"
          >
            {headerLabel}
            <ChevronDown
              className={`h-4 w-4 text-label transition-transform duration-200 ${
                view === "days" ? "" : "rotate-180"
              }`}
            />
          </button>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={goPrev}
              disabled={prevDisabled}
              aria-label="Previous"
              className={navBtnCls}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={goNext}
              disabled={nextDisabled}
              aria-label="Next"
              className={navBtnCls}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Days view */}
        {view === "days" && (
          <Calendar
            month={new Date(viewYear, viewMonth, 1)}
            selectedDate={
              selected
                ? new Date(selected.y, selected.m, selected.d)
                : undefined
            }
            today={new Date()}
            weekdays={SHORT_WEEKDAYS}
            onSelectDate={(date) => selectDate(date.getDate())}
            weekdayContainerClassName="mb-1"
            weekdayClassName="py-1.5 text-body"
            dayGridClassName="gap-y-1"
            renderDay={(date, state) => {
              if (state.isOutsideMonth) return <span />;
              const iso = toISO(viewYear, viewMonth, date.getDate());
              const isSelected = value === iso;
              const isToday = iso === today;
              const isOff = isDisabledDate(iso);
              return (
                <button
                  type="button"
                  disabled={isOff}
                  onClick={() => selectDate(date.getDate())}
                  aria-pressed={isSelected}
                  className={`mx-auto flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-sm transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-30 ${
                    isSelected
                      ? "bg-primary font-semibold text-white"
                      : isToday
                        ? "border border-primary font-medium text-primary hover:bg-primary/10"
                        : "text-heading hover:bg-primary/10"
                  }`}
                >
                  {date.getDate()}
                </button>
              );
            }}
          />
        )}

        {/* Months view */}
        {view === "months" && (
          <div className="grid grid-cols-3 gap-2">
            {MONTHS_SHORT.map((m, i) => {
              const isSel = selected?.y === viewYear && selected?.m === i;
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    setViewMonth(i);
                    setView("days");
                  }}
                  className={`cursor-pointer rounded-xl py-2.5 text-sm transition-colors duration-150 ${
                    isSel
                      ? "bg-primary font-semibold text-white"
                      : "text-heading hover:bg-primary/10"
                  }`}
                >
                  {m}
                </button>
              );
            })}
          </div>
        )}

        {/* Years view */}
        {view === "years" && (
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: YEARS_PER_PAGE }, (_, i) => yearPageStart + i).map(
              (y) => {
                const off = y < minYear || y > maxYear;
                const isSel = selected?.y === y;
                return (
                  <button
                    key={y}
                    type="button"
                    disabled={off}
                    onClick={() => {
                      setViewYear(y);
                      setView("months");
                    }}
                    className={`cursor-pointer rounded-xl py-2.5 text-sm transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-30 ${
                      isSel
                        ? "bg-primary font-semibold text-white"
                        : "text-heading hover:bg-primary/10"
                    }`}
                  >
                    {y}
                  </button>
                );
              },
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-3 flex items-center justify-between border-t border-divider pt-3">
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
            disabled={isDisabledDate(today)}
            onClick={() => {
              onChange(today);
              closePicker();
            }}
            className="cursor-pointer rounded-lg px-2 py-1 text-sm font-medium text-primary transition-colors duration-150 hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
          >
            Today
          </button>
        </div>
        </div>

        {/* Time columns */}
        {showTime && (
          <div className="ml-3 flex shrink-0 gap-1 border-l border-border pl-3">
            {/* Hours */}
            <div className="flex flex-col items-center gap-1">
              <span className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-body">HH</span>
              <div ref={hourRef} className="h-[216px] overflow-y-auto scrollbar-none" style={{ scrollbarWidth: "none" }}>
                {hours.map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => emitTime(h, timeParts.m)}
                    className={`flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-sm transition-colors ${
                      timeParts.h === h ? "bg-primary font-semibold text-white" : "text-heading hover:bg-primary/10"
                    }`}
                  >
                    {pad(h)}
                  </button>
                ))}
              </div>
            </div>
            {/* Minutes */}
            <div className="flex flex-col items-center gap-1">
              <span className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-body">MM</span>
              <div ref={minRef} className="h-[216px] overflow-y-auto scrollbar-none" style={{ scrollbarWidth: "none" }}>
                {minutes.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => emitTime(timeParts.h, m)}
                    className={`flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-sm transition-colors ${
                      timeParts.m === m ? "bg-primary font-semibold text-white" : "text-heading hover:bg-primary/10"
                    }`}
                  >
                    {pad(m)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
    const panel = calendarPanel;

    /* ---- Trigger styling (matches SignupField / SignupDropdown) ---- */
    const borderClass = hasError
      ? "border-danger"
      : open
        ? "border-primary"
        : "border-border hover:border-primary/50";

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
              {value ? `${formatDisplay(value)}${showTime ? `  ${time}` : ""}` : placeholder}
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
              <CalendarDays className="h-4 w-4" />
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
                className="fixed z-[200] rounded-2xl shadow-2xl shadow-black/20 dark:shadow-black/60"
                style={{
                  left: desktopPosition.left,
                  top: desktopPosition.top ?? undefined,
                  bottom: desktopPosition.bottom ?? undefined,
                  zIndex: portalZIndex,
                  width: showTime ? 480 : 320,
                  maxWidth: "calc(100vw - 2rem)",
                }}
              >
                {panel}
              </div>,
              document.body,
            )}
        </div>

        {/* Mobile: centered modal with bluish blurred backdrop */}
        {open &&
          !disabled &&
          isMobile &&
          typeof document !== "undefined" &&
          createPortal(
            <div
              onPointerDown={(e) => e.stopPropagation()}
              className="fixed inset-0 z-[200] flex items-center justify-center p-4"
              style={{ zIndex: mobilePortalZIndex ?? portalZIndex }}
            >
              <div
                aria-hidden="true"
                onClick={closePicker}
                className="absolute inset-0 animate-[fadeIn_0.2s_ease-out_both] bg-[#1e3a8a]/35 backdrop-blur-md"
              />
              <div className="relative w-full max-w-[340px] animate-[dropdownIn_0.2s_cubic-bezier(0.16,1,0.3,1)_both] rounded-2xl shadow-2xl shadow-[#1e3a8a]/40">
                {panel}
              </div>
            </div>,
            document.body,
          )}
{/*  */}
        {/* Error / hint */}
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

DatePicker.displayName = "DatePicker";

export default DatePicker;
