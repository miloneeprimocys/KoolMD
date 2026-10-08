"use client";

import React from "react";
import { Check } from "lucide-react";

/* ---------------------------------------------------------------- */
/*  Reusable multi-step indicator                                   */
/*  - completed steps show a check and are clickable (go back)      */
/*  - on mobile only the circles show, plus a "Step X of Y" line    */
/* ---------------------------------------------------------------- */
export interface StepItem {
  id: number;
  title: string;
  subtitle?: string;
}

interface AddStepsProps {
  steps: StepItem[];
  current: number;
  /** Called when a completed step is clicked */
  onStepClick?: (id: number) => void;
  className?: string;
}

const AddSteps = ({
  steps,
  current,
  onStepClick,
  className = "",
}: AddStepsProps) => {
  const active = steps.find((s) => s.id === current);

  return (
    <nav
      aria-label="Progress"
      className={`rounded-2xl border border-border bg-card p-4 sm:p-5 ${className}`}
    >
     <ol className="flex min-w-0 items-center overflow-x-auto px-1 py-1 hide-scrollbar">
        {steps.map((step, idx) => {
          const complete = step.id < current;
          const isCurrent = step.id === current;
          const clickable = complete && Boolean(onStepClick);

          return (
            <React.Fragment key={step.id}>
              <li className="shrink-0">
                <button
                  type="button"
                  disabled={!clickable}
                  onClick={() => onStepClick?.(step.id)}
                  aria-current={isCurrent ? "step" : undefined}
                  className={`group flex items-center gap-3 text-left ${
                    clickable ? "cursor-pointer" : "cursor-default"
                  }`}
                >
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors duration-200 ${
                      complete
                        ? "bg-primary text-white group-hover:bg-primary/90"
                        : isCurrent
                          ? "bg-primary text-white ring-4 ring-primary/20"
                          : "bg-divider text-body"
                    }`}
                  >
                    {complete ? <Check className="h-4 w-4" /> : step.id}
                  </span>
                  <span className={`min-w-0 whitespace-nowrap ${isCurrent ? "hidden sm:block" : "hidden xl:block"}`}>
                    <span
                      className={`block text-sm font-semibold ${
                        isCurrent || complete ? "text-heading" : "text-body"
                      }`}
                    >
                      {step.title}
                    </span>
                    {step.subtitle && (
                      <span className="block text-xs text-body">
                        {step.subtitle}
                      </span>
                    )}
                  </span>
                </button>
              </li>

              {idx < steps.length - 1 && (
                <li
                  aria-hidden="true"
                  className={`mx-3 h-px min-w-6 flex-1 transition-colors duration-300 ${
                    complete ? "bg-primary" : "bg-divider"
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </ol>

      {active && (
        <p className="mt-3 text-sm sm:hidden">
          <span className="text-body">
            Step {current} of {steps.length}:{" "}
          </span>
          <span className="font-semibold text-heading">{active.title}</span>
        </p>
      )}
    </nav>
  );
};

export default AddSteps;