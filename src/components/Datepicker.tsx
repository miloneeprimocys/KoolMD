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
}

/* ---------------------------------------------------------------- */
/*  Helpers                                                         */
/* ---------------------------------------------------------------- */
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const MONTHS_SHORT = MONTHS.map((m) => m.slice(0, 3));
const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
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
    },
    ref,
  ) => {
    const isMobile = useIsMobile();
    const [open, setOpen] = useState(false);
    const [view, setView] = useState<View>("days");
    const [viewYear, setViewYear] = useState(() => new Date().getFullYear());
    const [viewMonth, setViewMonth] = useState(() => new Date().getMonth());
    const [yearPageStart, setYearPageStart] = useState(0);
    const [placement, setPlacement] = useState<"down" | "up">("down");

    const wrapRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement | null>(null);

    const hasError = Boolean(error);
    const inputId = id || name;
    const selected = parseISO(value);
    const today = todayISO();

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

    /* ---- Desktop placement (flip up if no room below) ---- */
    const computePlacement = useCallback(() => {
      const el = triggerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      setPlacement(
        spaceBelow < minSpaceBelow && spaceAbove > spaceBelow ? "up" : "down",
      );
    }, [minSpaceBelow]);

    useLayoutEffect(() => {
      if (open && !isMobile) computePlacement();
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
        if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
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
        if (e.key === "Escape") closePicker();
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

    /* ---- Days grid ---- */
    const firstWeekday = new Date(viewYear, viewMonth, 1).getDay();
    const totalDays = daysInMonth(viewYear, viewMonth);
    const cells: (number | null)[] = [
      ...Array.from({ length: firstWeekday }, () => null),
      ...Array.from({ length: totalDays }, (_, i) => i + 1),
    ];
    while (cells.length % 7 !== 0) cells.push(null);

    const headerLabel =
      view === "days"
        ? `${MONTHS[viewMonth]} ${viewYear}`
        : view === "months"
          ? String(viewYear)
          : `${yearPageStart} – ${yearPageStart + YEARS_PER_PAGE - 1}`;

    const navBtnCls =
      "flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-label transition-colors duration-150 hover:bg-primary/10 hover:text-primary disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-label";

    /* ---- Calendar panel (shared by desktop popover + mobile modal) ---- */
    const panel = (
      <div
        role="dialog"
        aria-label="Choose date"
        className="w-full select-none rounded-2xl border border-border bg-card p-4 text-heading"
      >
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
          <>
            <div className="mb-1 grid grid-cols-7 text-center">
              {WEEKDAYS.map((w) => (
                <span
                  key={w}
                  className="py-1.5 text-xs font-medium text-body"
                >
                  {w}
                </span>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-y-1">
              {cells.map((d, i) => {
                if (d === null) return <span key={`e-${i}`} />;
                const iso = toISO(viewYear, viewMonth, d);
                const isSelected = value === iso;
                const isToday = iso === today;
                const isOff = isDisabledDate(iso);
                return (
                  <button
                    key={iso}
                    type="button"
                    disabled={isOff}
                    onClick={() => selectDate(d)}
                    aria-pressed={isSelected}
                    className={`mx-auto flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-sm transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-30 ${
                      isSelected
                        ? "bg-primary font-semibold text-white"
                        : isToday
                          ? "border border-primary font-medium text-primary hover:bg-primary/10"
                          : "text-heading hover:bg-primary/10"
                    }`}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          </>
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
    );

    /* ---- Trigger styling (matches SignupField / SignupDropdown) ---- */
    const borderClass = hasError
      ? "border-danger"
      : open
        ? "border-primary"
        : "border-border hover:border-primary/50";

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
              <CalendarDays className="h-4 w-4" />
            </span>
          </button>

          {/* Hidden input so the value is included in native form submits */}
          {name && <input type="hidden" name={`${name}-value`} value={value ?? ""} readOnly />}

          {/* Desktop popover */}
          {open && !disabled && !isMobile && (
            <div
              className={`absolute left-0 z-[100] w-[320px] max-w-[calc(100vw-2rem)] shadow-2xl shadow-black/20 dark:shadow-black/60 animate-[dropdownIn_0.18s_cubic-bezier(0.16,1,0.3,1)_both] ${
                placement === "down" ? "top-full mt-1.5" : "bottom-full mb-1.5"
              }`}
            >
              {panel}
            </div>
          )}
        </div>

        {/* Mobile: centered modal with bluish blurred backdrop */}
        {open &&
          !disabled &&
          isMobile &&
          typeof document !== "undefined" &&
          createPortal(
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
              <div
                aria-hidden="true"
                onClick={closePicker}
                className="absolute inset-0 animate-[fadeIn_0.2s_ease-out_both] bg-[#1e3a8a]/35 backdrop-blur-md"
              />
              <div className="relative w-full max-w-[340px] animate-[dropdownIn_0.2s_cubic-bezier(0.16,1,0.3,1)_both] shadow-2xl shadow-[#1e3a8a]/40">
                {panel}
              </div>
            </div>,
            document.body,
          )}

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