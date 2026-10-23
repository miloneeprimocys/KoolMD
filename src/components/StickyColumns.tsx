"use client";

import React, { useLayoutEffect, useRef, useState } from "react";

type Breakpoint = "xl" | "2xl";

const BREAKPOINTS: Record<Breakpoint, { minWidth: number; left: string; right: string }> = {
  xl: {
    minWidth: 1280,
    left: "xl:sticky xl:top-4 xl:self-start",
    right: "xl:sticky xl:top-4 xl:self-start",
  },
  "2xl": {
    minWidth: 1536,
    left: "2xl:sticky 2xl:top-4 2xl:self-start",
    right: "2xl:sticky 2xl:top-4 2xl:self-start",
  },
};

/** Two-column layout: keep the right panel in view, and the shorter left panel when useful. */
const StickyColumns = ({
  children,
  columnsClass,
  breakpoint = "2xl",
}: {
  children: React.ReactNode;
  columnsClass: string;
  breakpoint?: Breakpoint;
}) => {
  const [left, right] = React.Children.toArray(children);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const [leftIsShorter, setLeftIsShorter] = useState(false);
  const stickyClasses = BREAKPOINTS[breakpoint];

  useLayoutEffect(() => {
    const measure = () => {
      if (window.innerWidth < stickyClasses.minWidth) {
        setLeftIsShorter(false);
        return;
      }

      const leftHeight = leftRef.current?.scrollHeight;
      const rightHeight = rightRef.current?.scrollHeight;
      if (leftHeight == null || rightHeight == null || leftHeight === 0 || rightHeight === 0) return;
      setLeftIsShorter(leftHeight < rightHeight);
    };

    const observer = new ResizeObserver(measure);
    if (leftRef.current) observer.observe(leftRef.current);
    if (rightRef.current) observer.observe(rightRef.current);
    window.addEventListener("resize", measure);
    measure();
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [stickyClasses.minWidth]);

  return (
    <div className={`grid items-start gap-4 sm:gap-5 ${columnsClass}`}>
      <div ref={leftRef} className={`min-w-0 ${leftIsShorter ? stickyClasses.left : ""}`}>
        {left}
      </div>
      <div ref={rightRef} className={`min-w-0 space-y-4 sm:space-y-5 ${stickyClasses.right}`}>
        {right}
      </div>
    </div>
  );
};

export default StickyColumns;
