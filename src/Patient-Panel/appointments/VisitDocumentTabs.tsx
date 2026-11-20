"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Calendar, FlaskConical, Pill, type LucideIcon } from "lucide-react";
import Tabs from "@/components/Tabs";

type VisitDocumentTabKey = "prescriptions" | "results" | "follow-up";

interface VisitDocumentTabsProps {
  activeTab: VisitDocumentTabKey;
  visitId: string;
  prescriptionCount: number;
  resultCount: number;
}

const VisitDocumentTabs = ({
  activeTab,
  visitId,
  prescriptionCount,
  resultCount,
}: VisitDocumentTabsProps) => {
  const router = useRouter();
  const tabs: { key: VisitDocumentTabKey; label: string; Icon: LucideIcon; href: string }[] = [
    {
      key: "prescriptions",
      label: `Prescriptions (${prescriptionCount})`,
      Icon: Pill,
      href: "/my-appointments/visit-prescriptions",
    },
    {
      key: "results",
      label: `Results (${resultCount})`,
      Icon: FlaskConical,
      href: "/my-appointments/visit-results",
    },
    {
      key: "follow-up",
      label: "Follow-Up",
      Icon: Calendar,
      href: "/my-appointments/visit-follow-up",
    },
  ];

  return (
    <Tabs ariaLabel="Visit documents"
    >
      {tabs.map(({ key, label, Icon, href }) => {
        const isActive = key === activeTab;
        return (
          <button
            key={key}
            role="tab"
            type="button"
            aria-selected={isActive}
            onClick={() => !isActive && router.push(`${href}?id=${encodeURIComponent(visitId)}`)}
            className={`-mb-px flex shrink-0 cursor-pointer items-center gap-2 whitespace-nowrap border-b-2 px-3 pb-2.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 sm:px-4 sm:pb-3 ${
              isActive ? "border-primary font-semibold text-primary" : "border-transparent text-body hover:text-heading"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        );
      })}
    </Tabs>
  );
};

export default VisitDocumentTabs;
