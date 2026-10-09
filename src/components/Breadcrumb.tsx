"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export type BreadcrumbItem = {
  label: string;
  href?: string; // no href = current page (not clickable)
  onClick?: () => void;
};

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className = "" }) => {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={`${item.label}-${i}`} className="flex items-center gap-1.5 sm:gap-2">
              {item.onClick ? (
                <button
                  type="button"
                  onClick={item.onClick}
                  className="cursor-pointer text-body transition-colors duration-200 hover:text-primary   font-normal whitespace-nowrap"
                >
                  {item.label}
                </button>
              ) : item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="text-body transition-colors duration-200 hover:text-primary   whitespace-nowrap"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={`whitespace-nowrap ${
                    isLast ? "font-semibold text-heading" : "text-body"
                  }`}
                >
                  {item.label}
                </span>
              )}

              {!isLast && (
                <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 text-placeholder" />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;