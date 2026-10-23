"use client";

import React from "react";
import StickyColumns from "@/components/StickyColumns";

/** Two-column lab-order layout matching the conditional stickiness in integration steps. */
const LabOrderColumns = ({ children }: { children: React.ReactNode }) => {
  return (
    <StickyColumns columnsClass="2xl:grid-cols-[minmax(0,1fr)_380px]">
      {children}
    </StickyColumns>
  );
};

export default LabOrderColumns;
