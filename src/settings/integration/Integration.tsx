"use client";

import React from "react";
import { ArrowRight, BookOpen } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

import Breadcrumb from "@/components/Breadcrumb";
import AddButton from "@/components/Addbutton";
import ImportButton from "@/components/ImportButton";
import { useAppDispatch } from "@/hooks/useAppHooks";
import { showModal } from "@/redux/slices/dialogslice";
import Configuration from "./Configuration";
import Mapping from "./Mapping";
import LabOrderMapping from "./Labordermapping";
import ResultMapping from "./Resultmapping";
import StatusMapping from "./Statusmapping";
import TestConnection from "./Testconnection";
import ActivityLogs from "./Activitylogs";

/* ---------- Tabs ---------- */
type TabKey =
  | "configuration"
  | "mapping"
  | "lab-order-mapping"
  | "result-mapping"
  | "status-mapping"
  | "test-connection"
  | "activity-logs";

const TABS: { key: TabKey; label: string; subtitle: string }[] = [
  {
    key: "configuration",
    label: "Configuration",
    subtitle: "Configure and manage the laboratory integration layer to connect with external lab systems.",
  },
  {
    key: "mapping",
    label: "Mapping",
    subtitle: "Map lab data fields to KOOLMD fields for seamless data exchange.",
  },
  {
    key: "lab-order-mapping",
    label: "Lab Order Mapping",
    subtitle: "Map laboratory order fields to KOOLMD order fields for accurate lab order creation.",
  },
  {
    key: "result-mapping",
    label: "Result Mapping",
    subtitle: "Map laboratory result fields to KOOLMD result fields for structured data storage.",
  },
  {
    key: "status-mapping",
    label: "Status Mapping",
    subtitle: "Map laboratory result status from the external system to KOOLMD order status.",
  },
  {
    key: "test-connection",
    label: "Test Connection",
    subtitle: "Test the connection with the lab system to ensure the integration is working correctly.",
  },
  {
    key: "activity-logs",
    label: "Activity Logs",
    subtitle: "Monitor integration activities, requests, and data exchange between KOOLMD and the lab system.",
  },
];

/* Footer buttons for the integration workflow. */
const NEXT_LABEL: Partial<Record<TabKey, string>> = {
  configuration: "Next: Mapping",
  mapping: "Next: Lab Order Mapping",
  "lab-order-mapping": "Next: Result Mapping",
  "result-mapping": "Next: Status Mapping",
  "status-mapping": "Next: Test Connection",
  "test-connection": "Next: Activity Logs",
};

/* ---------- Page ---------- */
const Integration = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedTab = searchParams.get("tab");
  const tab: TabKey = TABS.some((item) => item.key === requestedTab)
    ? (requestedTab as TabKey)
    : "configuration";

  const index = TABS.findIndex((t) => t.key === tab);
  const current = TABS[index];

  const changeTab = (nextTab: TabKey) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", nextTab);
    router.push(`/settings/integration?${params.toString()}`, { scroll: false });
  };

  const goBack = () => index > 0 && changeTab(TABS[index - 1].key);
  const goNext = () => index < TABS.length - 1 && changeTab(TABS[index + 1].key);

  return (
    <div className="flex min-h-full flex-col">
      <div className="mx-auto w-full max-w-[1600px] flex-1">
        <div className="space-y-4 sm:space-y-5">
          <Breadcrumb
            items={[
              { label: "Settings", href: "/settings" },
              { label: "Integrations", href: "/settings/integration" },
              { label: "Lab Integration", href: "/settings/integration" },
              { label: "M13 Lab Integration Foundation" },
            ]}
          />

          {/* Title + action */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-heading sm:text-xl 2xl:text-2xl">
                M13 Lab Integration Foundation
              </h2>
              <p className="mt-0.5 text-sm text-body">{current.subtitle}</p>
            </div>
            <ImportButton
              text="View Documentation"
              icon={<BookOpen className="h-4 w-4" />}
              className="shrink-0 whitespace-nowrap"
              onClick={() => {}}
            />
          </div>

          {/* Tabs */}
          <div
            role="tablist"
            aria-label="Integration sections"
            className="flex gap-4 overflow-x-auto border-b border-border hide-scrollbar sm:gap-6"
          >
            {TABS.map((t) => {
              const active = t.key === tab;
              return (
                <button
                  key={t.key}
                  role="tab"
                  type="button"
                  aria-selected={active}
                  onClick={() => changeTab(t.key)}
                  className={`-mb-px cursor-pointer whitespace-nowrap border-b-2 px-1 pb-2.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 sm:pb-3 sm:text-sm ${
                    active
                      ? "border-primary text-primary"
                      : "border-transparent text-body hover:text-heading"
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
          {/* Tab panels – all stay mounted so mappings keep their state while switching tabs */}
          <div>
            <div role="tabpanel" hidden={tab !== "configuration"}>
              <Configuration onDisconnect={() => dispatch(showModal("DisconnectIntegration"))} />
            </div>
            <div role="tabpanel" hidden={tab !== "mapping"}><Mapping /></div>
            <div role="tabpanel" hidden={tab !== "lab-order-mapping"}><LabOrderMapping /></div>
            <div role="tabpanel" hidden={tab !== "result-mapping"}><ResultMapping /></div>
            <div role="tabpanel" hidden={tab !== "status-mapping"}><StatusMapping /></div>
            <div role="tabpanel" hidden={tab !== "test-connection"}><TestConnection /></div>
            <div role="tabpanel" hidden={tab !== "activity-logs"}><ActivityLogs /></div>
          </div>
        </div>
      </div>

      {/* Sticky bottom buttons */}
      <div className="sticky -bottom-4 sm:-bottom-6 z-[200] -mx-4 -mb-4 sm:-mb-6 mt-4 border-t border-border bg-card px-4 py-4 sm:-mx-6 sm:px-6 sm:py-5">
        <div className="mx-auto flex max-w-[1600px] items-center justify-center gap-3 sm:justify-end">
          {index > 0 && <ImportButton text="Back" icon={null} onClick={goBack} />}
          {index < TABS.length - 1 ? (
            <AddButton
              text={NEXT_LABEL[tab] ?? `Next: ${TABS[index + 1].label}`}
              icon={<ArrowRight className="h-4 w-4" />}
              onClick={goNext}
            />
          ) : (
            <AddButton
              text="Save"
              icon={null}
              onClick={() => {
                // TODO: persist the completed integration workflow.
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Integration;
