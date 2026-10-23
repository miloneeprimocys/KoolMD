"use client";

import React, { useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import Breadcrumb from "@/components/Breadcrumb";
import AddButton from "@/components/Addbutton";
import ImportButton from "@/components/ImportButton";
import Tags from "@/components/Tags";
import GatewayConfiguration from "./Gatewayconfiguration";
import SupportedMethods, { DEFAULT_METHODS, type MethodsState } from "./Supportedmethods";
import TransactionHistory from "./Transactionhistory";
import RefundSettings from "./Refundsettings";

/* ---------- Tabs ---------- */
const TABS = [
  {
    key: "configuration",
    label: "Configuration",
    subtitle: "Integrate and configure a payment gateway to process patient and appointment payments securely.",
  },
  {
    key: "methods",
    label: "Supported Methods",
    subtitle: "Manage the payment methods supported by the selected gateway.",
  },
  {
    key: "transactions",
    label: "Transaction History",
    subtitle: "View all payment transactions processed through the selected gateway. Search, filter, and manage transactions.",
  },
  {
    key: "refunds",
    label: "Refund Settings",
    subtitle: "Configure refund settings for payments processed through the selected gateway.",
  },
] as const;

type TabKey = (typeof TABS)[number]["key"];
const TAB_PATHS: Record<TabKey, string> = {
  configuration: "/billing/configuration",
  methods: "/billing/supported-methods",
  transactions: "/billing/transaction-history",
  refunds: "/billing/refund-settings",
};
const PATH_TABS: Record<string, TabKey> = Object.fromEntries(
  Object.entries(TAB_PATHS).map(([key, path]) => [path, key]),
) as Record<string, TabKey>;

/* ---------- Page ---------- */
const Billing = () => {
  const pathname = usePathname();
  const router = useRouter();
  const tab = PATH_TABS[pathname ?? ""] ?? "configuration";
  /* Enabled payment methods are shared by the Configuration and Supported Methods tabs. */
  const [methods, setMethods] = useState<MethodsState>(DEFAULT_METHODS);

  const patchMethods = (patch: Partial<MethodsState>) => setMethods((p) => ({ ...p, ...patch }));
  const current = TABS.find((t) => t.key === tab)!;

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-4 sm:space-y-5">
      <Breadcrumb
        items={[
          { label: "Billing & Payments", href: "/billing" },
          { label: current.label },
        ]}
      />

      {/* Title + connection */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-heading sm:text-xl 2xl:text-2xl">Payment Gateway</h2>
          <p className="mt-0.5 text-sm text-body">{current.subtitle}</p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <Tags text="Connected" tone="success" />
          {tab === "configuration" ? (
            <AddButton text="Test Connection" icon={null} onClick={() => {}} />
          ) : (
            <ImportButton text="Test Connection" icon={null} onClick={() => {}} />
          )}
        </div>
      </div>

      {/* Tabs */}
      <div role="tablist" className="flex gap-6 overflow-x-auto border-b border-divider hide-scrollbar">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => router.push(TAB_PATHS[t.key])}
            className={`-mb-px shrink-0 cursor-pointer whitespace-nowrap border-b-2 px-1 pb-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${
              tab === t.key ? "border-primary text-primary" : "border-transparent text-body hover:text-heading"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div role="tabpanel">
        {tab === "configuration" && <GatewayConfiguration methods={methods} onMethodsChange={patchMethods} />}
        {tab === "methods" && (
          <SupportedMethods
            methods={methods}
            onChange={patchMethods}
            onCancel={() => setMethods(DEFAULT_METHODS)}
            onSave={() => {
              // TODO: call your API here
            }}
          />
        )}
        {tab === "transactions" && <TransactionHistory />}
        {tab === "refunds" && <RefundSettings />}
      </div>
    </div>
  );
};

export default Billing;
