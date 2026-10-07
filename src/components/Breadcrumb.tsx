"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export type BreadcrumbItem = {
  label: string;
  href?: string; // no href = current page (not clickable)
};

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className = "" }) => {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex items-center gap-2 text-sm">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={`${item.label}-${i}`} className="flex items-center gap-2">
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="text-body transition-colors duration-200 hover:text-primary"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={
                    isLast ? "font-semibold text-heading" : "text-body"
                  }
                >
                  {item.label}
                </span>
              )}

              {!isLast && (
                <ChevronRight className="h-4 w-4 shrink-0 text-placeholder" />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;