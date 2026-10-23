"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { HelpCircle } from "lucide-react";

import Breadcrumb from "@/components/Breadcrumb";
import ImportButton from "@/components/ImportButton";
import SuccessToast from "@/components/SuccessToast";

import UnlockChats from "./Unlockchats";
import LockChats from "./Lockchats";
import AuditHistory from "./Audithistory";
import ChartRightSection, { type PanelState } from "./Chartrightsection";

/* ---------- Tabs (a 4th tab can be added here later) ---------- */
type TabKey = "unlock-requests" | "locked-charts" | "audit-history";

const TABS: {
  key: TabKey;
  label: string;
  crumbs: { label: string; href?: string }[];
  title: string;
  subtitle: string;
}[] = [
  {
    key: "unlock-requests",
    label: "Unlock Requests",
    crumbs: [
      { label: "Administration", href: "/administration/chatunlock?tab=unlock-requests" },
      { label: "Chart Controls", href: "/administration/chatunlock?tab=unlock-requests" },
      { label: "Unlock Requests" },
    ],
    title: "Admin Chart Unlock and Lock Control (M28)",
    subtitle: "Manage locked charts, approve unlock requests and view audit history of chart access.",
  },
  {
    key: "locked-charts",
    label: "Locked Charts",
    crumbs: [
      { label: "Administration", href: "/administration/chatunlock?tab=unlock-requests" },
      { label: "Chart Controls", href: "/administration/chatunlock?tab=unlock-requests" },
      { label: "Locked Charts" },
    ],
    title: "Chart Lock and Unlock Control (M28)",
    subtitle:
      "Manage locked encounter charts. Encounters are automatically locked when a practitioner signs or completes the encounter.",
  },
  {
    key: "audit-history",
    label: "Audit History",
    crumbs: [
      { label: "Administration", href: "/administration/chatunlock?tab=unlock-requests" },
      { label: "Chart Controls", href: "/administration/chatunlock?tab=unlock-requests" },
      { label: "Audit History" },
    ],
    title: "Audit History",
    subtitle: "Track all important activities, changes and system events for compliance and security.",
  },
];

type ToastState = { open: boolean; title: string; message: string };

/* ---------- Component ---------- */
const Administration = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedTab = searchParams.get("tab");
  const tab: TabKey = TABS.some((item) => item.key === requestedTab)
    ? (requestedTab as TabKey)
    : "unlock-requests";
  const [panel, setPanel] = useState<PanelState>(null);
  const [isPanelClosing, setIsPanelClosing] = useState(false);
  const [toast, setToast] = useState<ToastState>({ open: false, title: "", message: "" });

  const active = TABS.find((t) => t.key === tab)!;

  useEffect(() => {
    if (!TABS.some((item) => item.key === requestedTab)) {
      router.replace("/administration/chatunlock?tab=unlock-requests", { scroll: false });
    }
  }, [requestedTab, router]);

  const changeTab = (key: TabKey) => {
    router.push(`/administration/chatunlock?tab=${key}`, { scroll: false });
    setPanel(null);
    setIsPanelClosing(false);
  };

  const openPanel = useCallback((next: PanelState) => {
    setIsPanelClosing(false);
    setPanel(next);
  }, []);

  const closePanel = useCallback(() => {
    setIsPanelClosing(false);
    setPanel(null);
  }, []);

  return (
    <div className="relative w-full">
      <SuccessToast
        isOpen={toast.open}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
        title={toast.title}
        message={toast.message}
      />

      {/* Main content — makes room for the right section when it is docked on 2xl+ */}
      <div
        className={`mx-auto min-w-0 w-full max-w-[1600px] space-y-4 transition-all duration-300 ease-out sm:space-y-5 ${
          panel && !isPanelClosing ? "2xl:pr-[460px]" : ""
        }`}
      >
        <Breadcrumb items={active.crumbs} />

        {/* Title + (How it works) */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-heading sm:text-xl 2xl:text-2xl">{active.title}</h2>
            <p className="mt-0.5 text-xs text-body sm:text-sm">{active.subtitle}</p>
          </div>
          {tab === "locked-charts" && (
            <ImportButton
              text="How it works"
              icon={<HelpCircle className="h-4 w-4" />}
              onClick={() => {}}
              className="w-fit whitespace-nowrap"
            />
          )}
        </div>

        {/* Tabs */}
        <div
          role="tablist"
          aria-label="Chart control sections"
          className="hide-scrollbar flex gap-4 overflow-x-auto border-b border-border sm:gap-6"
        >
          {TABS.map((t) => {
            const isActive = t.key === tab;
            return (
              <button
                key={t.key}
                role="tab"
                type="button"
                aria-selected={isActive}
                onClick={() => changeTab(t.key)}
                className={`-mb-px cursor-pointer whitespace-nowrap border-b-2 px-1 pb-2.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 sm:pb-3 sm:text-sm ${
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-body hover:text-heading"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Active tab */}
        <div role="tabpanel">
          {tab === "unlock-requests" && (
            <UnlockChats onView={(row) => openPanel({ type: "request", row })} />
          )}
          {tab === "locked-charts" && (
            <LockChats onOpen={(row) => openPanel({ type: "locked", row })} />
          )}
          {tab === "audit-history" && <AuditHistory />}
        </div>
      </div>

      {/* Right section drawer (Unlock Requests + Locked Charts) */}
      <ChartRightSection
        panel={panel}
        onClose={closePanel}
        onCloseStart={() => setIsPanelClosing(true)}
        onUnlocked={(title, message) => setToast({ open: true, title, message })}
      />
    </div>
  );
};

export default Administration;
