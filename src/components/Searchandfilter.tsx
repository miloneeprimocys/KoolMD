"use client";

import React, { useState } from "react";
import { Calendar, Search, SlidersHorizontal } from "lucide-react";

import SignupDropdown from "./SignupDropdown";

type Filter = { label: string; options: string[] };

type SearchAndFilterProps = {
  placeholder?: string;
  filters?: Filter[];
};

const searchCls =
  "h-11 w-full rounded-lg border border-border bg-card pl-10 pr-4 text-sm text-heading outline-none transition-colors duration-200 placeholder:text-placeholder hover:border-primary/40 focus:border-primary";

const SearchAndFilter = ({
  placeholder = "Search...",
  filters = [],
}: SearchAndFilterProps) => {
  const [values, setValues] = useState<Record<string, string>>({});

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-3 lg:flex-row lg:items-center">
      {/* Search */}
      <div className="relative min-w-0 lg:flex-1">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-body" />
        <input type="text" placeholder={placeholder} className={searchCls} />
      </div>

      {/* Filters */}
      {filters.length > 0 && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:flex lg:shrink-0">
          {filters.map((f) => (
            <div key={f.label} className="w-full lg:w-40">
              <SignupDropdown
                id={f.label}
                placeholder={f.label}
                value={values[f.label]}
                onChange={(v) => setValues((s) => ({ ...s, [f.label]: v }))}
                options={[
                  { value: "all", label: "All" },
                  ...f.options.map((o) => ({ value: o, label: o })),
                ]}
                className="[&>*:last-child]:hidden [&_button]:!h-11 [&_button]:!rounded-lg"
              />
            </div>
          ))}

          {/* Date Range button (static label to match the screenshot) */}
          <div className="w-full lg:w-44">
            <button
              type="button"
              className="flex h-11 w-full cursor-pointer items-center gap-2 rounded-lg border border-border bg-card px-3.5 text-sm text-heading transition-colors duration-200 hover:border-primary/40 hover:text-primary"
            >
              <Calendar className="h-4 w-4 text-body" />
              <span>Date Range</span>
            </button>
          </div>

          {/* More Filters button */}
          <div className="w-full lg:w-40">
            <button
              type="button"
              className="flex h-11 w-full cursor-pointer items-center gap-2 rounded-lg border border-border bg-card px-3.5 text-sm text-heading transition-colors duration-200 hover:border-primary/40 hover:text-primary"
            >
              <SlidersHorizontal className="h-4 w-4 text-body" />
              <span>More Filters</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchAndFilter;