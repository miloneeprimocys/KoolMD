"use client";

import React, { useEffect, useRef } from "react";
import { Check } from "lucide-react";

/* ---------------------------------------------------------------- */
/*  Vertical step navigation                                        */
/*  - lg+: vertical list with connector line                        */
/*  - below xl: horizontal scrollable row                           */
/*  - completed steps show a check and are clickable (go back)      */
/* ---------------------------------------------------------------- */
export interface VerticalStepItem {
  id: number;
  title: string;
  subtitle?: string;
}

interface VerticalStepsProps {
  steps: VerticalStepItem[];
  current: number;
  /** Called when a completed step is clicked */
  onStepClick?: (id: number) => void;
  className?: string;
}

const VerticalSteps = ({ steps, current, onStepClick, className = "" }: VerticalStepsProps) => {
  const listRef = useRef<HTMLOListElement>(null);
  const activeStepRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const list = listRef.current;
    const activeStep = activeStepRef.current;
    if (!list || !activeStep || window.matchMedia("(min-width: 1024px)").matches) return;

    const listBounds = list.getBoundingClientRect();
    const stepBounds = activeStep.getBoundingClientRect();
    if (stepBounds.left < listBounds.left) {
      list.scrollBy({ left: stepBounds.left - listBounds.left, behavior: "smooth" });
    } else if (stepBounds.right > listBounds.right) {
      list.scrollBy({ left: stepBounds.right - listBounds.right, behavior: "smooth" });
    }
  }, [current]);

  return (
    <nav
      aria-label="Encounter steps"
      className={`min-w-0 max-w-full overflow-hidden p-3 sm:p-4 xl:overflow-visible ${className}`}
    >
      <ol
        ref={listRef}
        className="custom-scrollbar flex w-full min-w-0 flex-nowrap overflow-x-auto overscroll-x-contain touch-pan-x px-1.5 py-1.5 xl:flex-col xl:overflow-visible xl:p-0"
      >
        {steps.map((s, i) => {
          const complete = s.id < current;
          const isCurrent = s.id === current;
          const clickable = complete && Boolean(onStepClick);
          const isLast = i === steps.length - 1;

          return (
            <li key={s.id} className="relative flex shrink-0 items-center xl:block xl:shrink">
              {/* connector line to the next step (desktop only) */}
              {!isLast && (
                <span
                  aria-hidden="true"
                  className="absolute left-[29px] top-[48px] hidden h-[calc(100%-36px)] w-0.5 bg-divider xl:block"
                />
              )}

              <button
                ref={isCurrent ? activeStepRef : undefined}
                type="button"
                disabled={!clickable}
                onClick={() => onStepClick?.(s.id)}
                aria-current={isCurrent ? "step" : undefined}
                className={`relative flex items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors xl:w-full ${
                                  isCurrent
                    ? "xl:bg-primary/10 xl:[clip-path:polygon(0_0,100%_0,100%_calc(50%_-_6px),calc(100%_-_10px)_50%,100%_calc(50%_+_6px),100%_100%,0_100%)]"
                    : clickable
                      ? "cursor-pointer hover:bg-primary/5"
                      : "cursor-default"
                }`}
              >
                <span className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center">
                  {/* pulse ring (global .animate-toast-ripple) */}
                  {isCurrent && (
                    <span
                      aria-hidden="true"
                      className="animate-toast-ripple absolute inset-0 rounded-full bg-primary/40"
                    />
                  )}
                  <span
                    className={`relative flex h-full w-full items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                      complete
                        ? "bg-success text-white"
                        : isCurrent
                          ? "animate-toast-icon bg-primary text-white ring-4 ring-primary/20"
                          : "bg-primary/10 text-primary"
                    }`}
                  >
                    {complete ? <Check className="h-4 w-4" /> : s.id}
                  </span>
                </span>

                <span className="min-w-0">
                  <span
                    className={`block whitespace-nowrap text-sm font-semibold xl:whitespace-normal ${
                      isCurrent || complete ? "text-heading" : "text-label"
                    }`}
                  >
                    {s.title}
                  </span>
                  {s.subtitle && (
                    <span className="hidden text-xs text-body xl:block">{s.subtitle}</span>
                  )}
                </span>

              </button>

              {/* horizontal connector to the next step (below lg only) */}
              {!isLast && (
                <span
                  aria-hidden="true"
                  className={`mx-1 h-0.5 w-6 shrink-0 rounded-full sm:w-10 xl:hidden ${
                    complete ? "bg-success" : "bg-divider"
                  }`}
                />
              )}

              {/* Point that fits into the notch and continues the divider's border */}
              {isCurrent && (
                <svg
                  aria-hidden="true"
                  viewBox="0 0 19 23"
                  className="pointer-events-none absolute -right-[17px] top-1/2 z-10 hidden h-[23px] w-[19px] -translate-y-1/2 overflow-visible xl:block"
                >
                  <polygon points="19,0 0,11.5 19,23" className="fill-card" />
                  <polyline
                    points="19,0 0,11.5 19,23"
                    fill="none"
                    strokeWidth="1"
                    strokeLinejoin="round"
                    className="stroke-border"
                  />
                </svg>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default VerticalSteps;

/* ---------------------------------------------------------------- */
/*  Shared helpers for the 6 step files                             */
/* ---------------------------------------------------------------- */
export const Req = () => <span className="text-danger"> *</span>;

export const labelCls = "mb-2 block text-sm font-medium text-label";

export const checkboxCls =
  "h-4 w-4 shrink-0 cursor-pointer rounded border-border accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30";

/** Small outlined action button ("Add Diagnosis", "Use Previous" …). */
export const ghostBtn =
  "inline-flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/5 px-3 text-xs font-medium text-primary transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30";

/** Small square icon button used in table action cells. */
export const iconBtn =
  "flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30";

export const StepHeader = ({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle: string;
  action?: React.ReactNode;
}) => (
  <div className="mb-5 flex min-w-0 flex-wrap items-start justify-between gap-3 border-b border-divider pb-4">
    <div className="min-w-0">
      <h3 className="text-lg font-semibold text-heading sm:text-xl">{title}</h3>
      <p className="mt-0.5 text-xs text-body sm:text-sm">{subtitle}</p>
    </div>
    {action}
  </div>
);

const areaCls =
  "min-w-0 w-full rounded-xl border border-border bg-card p-3 text-sm text-heading placeholder:text-placeholder outline-none transition-colors duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20 hover:border-primary/50 resize-y";

export const TextAreaField = ({
  label,
  hint,
  required,
  optional,
  placeholder,
  value,
  onChange,
  rows = 4,
  max,
  action,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  optional?: boolean;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  max?: number;
  action?: React.ReactNode;
}) => (
  <div className="min-w-0">
    <div className="mb-2 flex flex-wrap items-end justify-between gap-2">
      <div className="min-w-0">
        <p className="text-sm font-medium text-label">
          {label}
          {required && <Req />}
          {optional && <span className="font-normal text-body"> (Optional)</span>}
        </p>
        {hint && <p className="text-xs text-body">{hint}</p>}
      </div>
      {action}
    </div>
    <textarea
      rows={rows}
      value={value}
      maxLength={max}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={areaCls}
    />
    {max && <p className="mt-1 text-right text-[11px] text-body">{value.length}/{max}</p>}
  </div>
);
