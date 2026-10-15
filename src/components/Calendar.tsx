"use client";

import React, { Fragment, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const SHORT_WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export const startOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

export const addDays = (date: Date, amount: number) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount);

export const daysInMonth = (year: number, month: number) =>
  new Date(year, month + 1, 0).getDate();

export const addMonths = (date: Date, amount: number) => {
  const first = new Date(date.getFullYear(), date.getMonth() + amount, 1);
  return new Date(
    first.getFullYear(),
    first.getMonth(),
    Math.min(date.getDate(), daysInMonth(first.getFullYear(), first.getMonth())),
  );
};

export const sameDay = (first: Date, second: Date) =>
  first.getFullYear() === second.getFullYear() &&
  first.getMonth() === second.getMonth() &&
  first.getDate() === second.getDate();

export const dayKey = (date: Date) =>
  `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

export const fmt = (date: Date, options: Intl.DateTimeFormatOptions) =>
  date.toLocaleDateString("en-US", options);

/** Returns all dates in the month grid, including leading and trailing days. */
export const buildMonth = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const leadingDays = new Date(year, month, 1).getDay();
  const totalDays = Math.ceil(
    (leadingDays + daysInMonth(year, month)) / 7,
  ) * 7;

  return Array.from(
    { length: totalDays },
    (_, index) => new Date(year, month, 1 - leadingDays + index),
  );
};

export type CalendarDayState = {
  isOutsideMonth: boolean;
  isSelected: boolean;
  isToday: boolean;
};

type CalendarProps = {
  month: Date;
  selectedDate?: Date;
  today?: Date | null;
  onSelectDate: (date: Date) => void;
  onMonthChange?: (month: Date) => void;
  showMonthNavigation?: boolean;
  compact?: boolean;
  weekdays?: readonly string[];
  events?: ReadonlyMap<string, ReactNode>;
  renderDay?: (date: Date, state: CalendarDayState) => ReactNode;
  className?: string;
  weekdayContainerClassName?: string;
  weekdayClassName?: string;
  dayGridClassName?: string;
};

const Calendar = ({
  month,
  selectedDate,
  today = null,
  onSelectDate,
  onMonthChange,
  showMonthNavigation = false,
  compact = false,
  weekdays = WEEKDAYS,
  events,
  renderDay,
  className = "",
  weekdayContainerClassName = "",
  weekdayClassName = "",
  dayGridClassName = "",
}: CalendarProps) => {
  const monthDays = buildMonth(month);

  return (
    <div className={className}>
      {showMonthNavigation && (
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-heading">
            {fmt(month, { month: "long", year: "numeric" })}
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Previous month"
              onClick={() =>
                onMonthChange?.(
                  new Date(month.getFullYear(), month.getMonth() - 1, 1),
                )
              }
              className="flex h-6 w-6 cursor-pointer items-center justify-center rounded text-body hover:text-primary"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Next month"
              onClick={() =>
                onMonthChange?.(
                  new Date(month.getFullYear(), month.getMonth() + 1, 1),
                )
              }
              className="flex h-6 w-6 cursor-pointer items-center justify-center rounded text-body hover:text-primary"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <div
        className={`grid grid-cols-7 text-center ${weekdayContainerClassName}`}
      >
        {weekdays.map((weekday) => (
          <span
            key={weekday}
            className={`${compact ? "py-1 text-[11px] text-body" : "py-1.5 text-xs text-label"} font-medium ${weekdayClassName}`}
          >
            {weekday}
          </span>
        ))}
      </div>

      <div
        className={`grid grid-cols-7 text-center ${
          compact ? "" : "gap-y-1"
        } ${dayGridClassName}`}
      >
        {monthDays.map((date) => {
          const state = {
            isOutsideMonth: date.getMonth() !== month.getMonth(),
            isSelected: !!selectedDate && sameDay(date, selectedDate),
            isToday: !!today && sameDay(date, today),
          };

          if (renderDay) {
            return (
              <Fragment key={dayKey(date)}>
                {renderDay(date, state)}
              </Fragment>
            );
          }

          return (
            <button
              key={dayKey(date)}
              type="button"
              aria-pressed={state.isSelected}
              aria-label={fmt(date, { dateStyle: "full" })}
              onClick={() => onSelectDate(date)}
              className={`relative mx-auto flex cursor-pointer flex-col items-center justify-center rounded-full transition-colors ${
                compact ? "h-7 w-7 text-xs" : "h-9 w-9 text-xs duration-200"
              } ${
                state.isSelected
                  ? compact
                    ? "bg-primary font-semibold text-white"
                    : "bg-primary/10 font-semibold text-primary ring-1 ring-primary/30"
                  : state.isToday
                    ? "border border-primary font-medium text-primary hover:bg-primary/10"
                    : state.isOutsideMonth
                      ? compact
                        ? "text-body/50 hover:bg-primary/10"
                        : "text-placeholder hover:bg-primary/10"
                      : compact
                        ? "text-heading hover:bg-primary/10"
                        : "text-heading hover:bg-primary/5"
              }`}
            >
              {date.getDate()}
              {events?.get(dayKey(date))}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;
