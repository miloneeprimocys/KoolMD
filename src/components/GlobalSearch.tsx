"use client";

import React, { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";

interface GlobalSearchProps {
  placeholder?: string;
  onSearch?: (value: string) => void;
  debounceMs?: number;
  width?: "sm" | "md" | "lg" | "2xl";
  className?: string;
}

/* Fluid widths — fill available space, capped by max-width */
const WIDTHS: Record<NonNullable<GlobalSearchProps["width"]>, string> = {
  sm:    "w-full max-w-xs",   // 320px
  md:    "w-full max-w-sm",   // 384px
  lg:    "w-full max-w-md",   // 448px
  "2xl": "w-full max-w-xl",   // 576px
};

const GlobalSearch = ({
  placeholder = "Search patients by name, email, phone or patient ID...",
  onSearch,
  debounceMs = 200,
  width = "2xl",
  className = "",
}: GlobalSearchProps) => {
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!onSearch) return;
    if (timeout.current) clearTimeout(timeout.current);
    timeout.current = setTimeout(() => onSearch(value), debounceMs);
    return () => {
      if (timeout.current) clearTimeout(timeout.current);
    };
  }, [value, onSearch, debounceMs]);

  const borderClass = focused
    ? "border-primary/50"
    : "border-border hover:border-primary/40";

  return (
    <div className={`relative min-w-0 ${WIDTHS[width]} ${className}`}>
      <Search
        className={`pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors duration-200 ${
          focused ? "text-primary" : "text-body"
        }`}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        aria-label="Global search"
        className={`
          h-10 w-full rounded-lg border bg-card
          pl-10 pr-4 text-sm text-heading
          placeholder:text-placeholder
          outline-none transition-colors duration-200
          ${borderClass}
        `}
      />
    </div>
  );
};

export default GlobalSearch;