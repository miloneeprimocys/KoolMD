"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page: number;
  totalPages: number;
  totalItems?: number;
  pageSize?: number;
  onChange: (page: number) => void;
  className?: string;
}

function buildPages(
  current: number,
  total: number
): (number | "ellipsis-l" | "ellipsis-r")[] {
  const pages: (number | "ellipsis-l" | "ellipsis-r")[] = [];
  const window = 1;

  const add = (p: number) => {
    if (!pages.includes(p)) pages.push(p);
  };

  if (total <= 7) {
    for (let i = 1; i <= total; i++) add(i);
    return pages;
  }

  add(1);
  if (current - window > 2) pages.push("ellipsis-l");

  const start = Math.max(2, current - window);
  const end = Math.min(total - 1, current + window);
  for (let i = start; i <= end; i++) add(i);

  if (current + window < total - 1) pages.push("ellipsis-r");
  add(total);

  return pages;
}

const Pagination: React.FC<PaginationProps> = ({
  page,
  totalPages,
  totalItems,
  pageSize,
  onChange,
  className = "",
}) => {
  const pages = buildPages(page, totalPages);

  const canPrev = page > 1;
  const canNext = page < totalPages;

  const from =
    totalItems != null && pageSize != null
      ? (page - 1) * pageSize + 1
      : undefined;
  const to =
    totalItems != null && pageSize != null
      ? Math.min(page * pageSize, totalItems)
      : undefined;

  const navBtn =
    "flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-body transition-colors duration-200 hover:bg-primary/5 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-body sm:h-9 sm:w-9";

  const pageBtn =
    "flex h-8 min-w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg px-1.5 text-sm font-medium transition-colors duration-200 sm:h-9 sm:min-w-9 sm:px-2";

  return (
    /* ONE row at every breakpoint: summary left, controls right */
    <div
      className={`flex items-center justify-between gap-2 border-t border-divider pt-4 ${className}`}
    >
      {/* Summary — compact on phones, full on sm+ */}
      {totalItems != null && from != null && to != null && (
        <p className="truncate text-xs text-body">
          {/* Phone: "1–8 of 2,048" */}
          <span className="sm:hidden">
            <span className="font-medium text-heading">{from}</span>–
            <span className="font-medium text-heading">{to}</span> of{" "}
            <span className="font-medium text-heading">
              {totalItems.toLocaleString()}
            </span>
          </span>

          {/* sm+: full sentence */}
          <span className="hidden sm:inline">
            Showing <span className="font-medium text-heading">{from}</span> to{" "}
            <span className="font-medium text-heading">{to}</span> of{" "}
            <span className="font-medium text-heading">
              {totalItems.toLocaleString()}
            </span>{" "}
            patients
          </span>
        </p>
      )}

      {/* Controls */}
      <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
        <button
          type="button"
          aria-label="Previous page"
          onClick={() => canPrev && onChange(page - 1)}
          disabled={!canPrev}
          className={navBtn}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {pages.map((p, i) => {
          if (typeof p === "string") {
            return (
              <span
                key={`${p}-${i}`}
                className="flex h-8 w-6 shrink-0 items-center justify-center text-sm text-body select-none sm:h-9 sm:w-9"
                aria-hidden="true"
              >
                …
              </span>
            );
          }
          const isActive = p === page;
          return (
            <button
              key={p}
              type="button"
              onClick={() => onChange(p)}
              aria-current={isActive ? "page" : undefined}
              className={`${pageBtn} ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-heading hover:bg-primary/5 hover:text-primary"
              }`}
            >
              {p}
            </button>
          );
        })}

        <button
          type="button"
          aria-label="Next page"
          onClick={() => canNext && onChange(page + 1)}
          disabled={!canNext}
          className={navBtn}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;