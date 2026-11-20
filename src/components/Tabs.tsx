import React, { type ReactNode } from "react";

interface TabsProps {
  ariaLabel?: string;
  children: ReactNode;
}

const Tabs = ({ ariaLabel, children }: TabsProps) => (
  <div
    role="tablist"
    aria-label={ariaLabel}
    className="flex gap-4 overflow-x-auto border-b border-border hide-scrollbar sm:gap-6"
  >
    {children}
  </div>
);

export default Tabs;
