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
      className={`rounded-xl border border-border bg-card p-2 ${className}`}
    >
      <div className="sm:custom-scrollbar sm:overflow-x-auto sm:overflow-y-hidden sm:px-5">
      <ol className="flex w-full min-w-0 items-center overflow-visible px-1 py-5 sm:w-max sm:min-w-full">
        {steps.map((step, idx) => {
          const complete = step.id < current;
          const isCurrent = step.id === current;
          const clickable = complete && Boolean(onStepClick);

          return (
            <React.Fragment key={step.id}>
              <li className="flex min-w-0 flex-1 justify-center sm:flex-none sm:justify-start">
                <button
                  type="button"
                  disabled={!clickable}
                  onClick={() => onStepClick?.(step.id)}
                  aria-current={isCurrent ? "step" : undefined}
                  className={`group flex w-full min-w-0 items-center gap-2 text-left sm:w-auto sm:gap-2.5 ${
                    clickable ? "cursor-pointer" : "cursor-default"
                  }`}
                >
                  <span className="relative flex h-9 w-9 shrink-0 items-center justify-center 2xl:h-12 2xl:w-12">
                    {isCurrent && (
                      <span
                        aria-hidden="true"
                        className="animate-toast-ripple absolute inset-0 rounded-full bg-primary/40"
                      />
                    )}
                    <span
                      className={`relative flex h-full w-full items-center justify-center rounded-full text-sm font-semibold transition-colors duration-200 2xl:text-base ${
                        complete
                          ? "bg-primary text-white group-hover:bg-primary/90"
                          : isCurrent
                            ? "animate-toast-icon bg-primary text-white ring-4 ring-primary/20"
                            : "bg-divider text-body"
                      }`}
                    >
                      {complete ? <Check className="h-4 w-4 2xl:h-5 2xl:w-5" /> : step.id}
                    </span>
                  </span>
                  <span className={`min-w-0 flex-1 sm:flex-none sm:whitespace-nowrap ${isCurrent ? "hidden sm:block" : "hidden xl:block"}`}>
                    <span
                      className={`block break-words text-sm font-semibold leading-tight ${
                        isCurrent || complete ? "text-heading" : "text-body"
                      }`}
                    >
                      {step.title}
                    </span>
                    {step.subtitle && (
                      <span className="mt-0.5 block break-words text-xs leading-tight text-body">
                        {step.subtitle}
                      </span>
                    )}
                  </span>
                </button>
              </li>

              {idx < steps.length - 1 && (
                <li
                  aria-hidden="true"
                  className={`mx-1 h-px min-w-2 flex-1 transition-colors duration-300 sm:mx-2 sm:min-w-3 lg:mx-3 lg:min-w-5 ${
                    complete ? "bg-primary" : "bg-divider"
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </ol>
      </div>

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
