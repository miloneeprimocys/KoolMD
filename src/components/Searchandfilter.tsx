"use client";

import React, { useState, useRef, useEffect } from "react";
import { Calendar, Search, SlidersHorizontal, X } from "lucide-react";

import SignupDropdown from "./SignupDropdown";
import DatePicker from "./Datepicker";

type Filter = { label: string; options: string[] };

export interface DateRange {
  start: string;
  end: string;
}

export interface SearchAndFilterProps {
  placeholder?: string;
  filters?: Filter[];
  value?: string;
  onSearch?: (value: string) => void;
  onFilterChange?: (filterLabel: string, option: string) => void;
  showDateRange?: boolean;
  dateRange?: DateRange;
  onDateRangeChange?: (range: DateRange) => void;
  onMoreFilters?: () => void;
  className?: string;
}

const searchCls =
  "h-12 w-full rounded-xl border border-border bg-card pl-10 pr-4 text-sm text-heading outline-none transition-colors duration-200 placeholder:text-placeholder hover:border-primary/40 focus:border-primary";

const formatDateLabel = (isoDate: string) => {
  if (!isoDate) return "";
  const [y, m, d] = isoDate.split("-").map(Number);
  if (!y || !m || !d) return isoDate;
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
};

const DEFAULT_DATE_RANGE: DateRange = { start: "", end: "" };

const SearchAndFilter = ({
  placeholder = "Search...",
  filters = [],
  value = "",
  onSearch,
  onFilterChange,
  showDateRange = true,
  dateRange = DEFAULT_DATE_RANGE,
  onDateRangeChange,
  onMoreFilters,
  className = "",
}: SearchAndFilterProps) => {
  const [searchTerm, setSearchTerm] = useState(value);
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [datePopoverOpen, setDatePopoverOpen] = useState(false);
  const [localDates, setLocalDates] = useState<DateRange>(dateRange);

  const datePopoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (dateRange) {
      setLocalDates((prev) => {
        if (prev.start === dateRange.start && prev.end === dateRange.end) {
          return prev;
        }
        return { start: dateRange.start || "", end: dateRange.end || "" };
      });
    }
  }, [dateRange?.start, dateRange?.end]);

  // Click outside to close date popover
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (
        datePopoverRef.current &&
        !datePopoverRef.current.contains(e.target as Node)
      ) {
        setDatePopoverOpen(false);
      }
    };
    if (datePopoverOpen) {
      document.addEventListener("mousedown", onDocClick);
    }
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [datePopoverOpen]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchTerm(val);
    onSearch?.(val);
  };

  const handleFilterSelect = (filterLabel: string, opt: string) => {
    const nextVal = opt === "all" ? "" : opt;
    setFilterValues((prev) => ({ ...prev, [filterLabel]: nextVal }));
    onFilterChange?.(filterLabel, nextVal);
  };

  const handleApplyDates = () => {
    onDateRangeChange?.(localDates);
    setDatePopoverOpen(false);
  };

  const handleClearDates = (e: React.MouseEvent) => {
    e.stopPropagation();
    const empty = { start: "", end: "" };
    setLocalDates(empty);
    onDateRangeChange?.(empty);
  };

  const hasActiveDateRange = Boolean(localDates.start || localDates.end);
  const dateRangeDisplay = hasActiveDateRange
    ? `${formatDateLabel(localDates.start) || "Start"} - ${formatDateLabel(localDates.end) || "End"
    }`
    : "Date Range";

  return (
    <div
      className={`flex w-full flex-col gap-3  xl:flex-col 2xl:flex-row 2xl:items-center ${className}`}
    >
      {/* Search */}
      <div className="relative min-w-0 flex-1">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-body" />
        <input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={handleSearchChange}
          className={searchCls}
        />
      
      </div>

      {/* Dropdown Filters + Date Range + More Filters */}
      {(filters.length > 0 || showDateRange) && (
        <div className="flex flex-wrap gap-2 items-center xl:flex-wrap 2xl:shrink-0 2xl:flex-nowrap 2xl:items-center">
          {filters.map((f) => (
            <div key={f.label} className="min-w-[8rem] flex-1 xl:w-40 xl:flex-none 2xl:w-40 2xl:flex-none">
              <SignupDropdown
                id={f.label}
                placeholder={f.label}
                value={filterValues[f.label]}
                onChange={(v) => handleFilterSelect(f.label, v)}
                options={[
                  { value: "all", label: "All" },
                  ...f.options.map((o) => ({ value: o, label: o })),
                ]}
                compact
                className="[&>*:last-child]:hidden [&_button]:!h-12 [&_button]:!rounded-xl"
              />
            </div>
          ))}

          {/* Interactive Date Range Button with DatePicker popover */}
          {showDateRange && (
            <div className="relative min-w-[8rem] flex-1 xl:w-auto xl:flex-none 2xl:w-auto 2xl:flex-none" ref={datePopoverRef}>
              <button
                type="button"
                onClick={() => setDatePopoverOpen((o) => !o)}
                className={`flex h-12 w-full cursor-pointer items-center justify-between gap-2 rounded-xl border px-3.5 text-xs sm:text-sm font-normal transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${hasActiveDateRange || datePopoverOpen
                    ? "border-primary bg-primary/5 text-heading"
                    : "border-border bg-card text-placeholder hover:border-primary/40 hover:text-primary"
                  }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <Calendar className="h-4 w-4 shrink-0 text-body" />
                  <span className="truncate">{dateRangeDisplay}</span>
                </div>

                {hasActiveDateRange && (
                  <span
                    onClick={handleClearDates}
                    className="ml-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-body hover:bg-heading/10 hover:text-heading"
                    title="Clear date range"
                  >
                    <X className="h-3 w-3" />
                  </span>
                )}
              </button>

              {/* DatePicker popover */}
              {datePopoverOpen && (
                <div className="absolute right-0 top-full z-[120] mt-2 w-72 sm:w-80 rounded-2xl border border-border bg-card p-4 shadow-2xl ring-1 ring-border/60 animate-in fade-in zoom-in-95">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-heading">
                    Select Date Range
                  </p>
                  <div className="space-y-3">
                    <DatePicker
                      label="From Date"
                      placeholder="Start date"
                      value={localDates.start}
                      onChange={(v) =>
                        setLocalDates((prev) => ({ ...prev, start: v }))
                      }
                      align="left"
                    />
                    <DatePicker
                      label="To Date"
                      placeholder="End date"
                      value={localDates.end}
                      minDate={localDates.start || undefined}
                      onChange={(v) =>
                        setLocalDates((prev) => ({ ...prev, end: v }))
                      }
                      align="right"
                    />
                  </div>

                  <div className="mt-4 flex items-center justify-end gap-2 border-t border-divider pt-3">
                    <button
                      type="button"
                      onClick={() => {
                        const empty = { start: "", end: "" };
                        setLocalDates(empty);
                        onDateRangeChange?.(empty);
                        setDatePopoverOpen(false);
                      }}
                      className="cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium text-body hover:bg-heading/5 hover:text-heading"
                    >
                      Clear
                    </button>
                    <button
                      type="button"
                      onClick={handleApplyDates}
                      className="cursor-pointer rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-primary-hover shadow-xs"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* More Filters button */}
          <div className="min-w-[8rem] flex-1 xl:w-36 xl:flex-none 2xl:w-36 2xl:flex-none">
            <button
              type="button"
              onClick={onMoreFilters}
              className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-border bg-card px-3.5 text-xs sm:text-sm font-medium text-placeholder transition-colors duration-200 hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
            >
              <SlidersHorizontal className="h-4 w-4 text-body shrink-0" />
              {/* Added whitespace-nowrap here */}
              <span className="whitespace-nowrap">More Filters</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchAndFilter;