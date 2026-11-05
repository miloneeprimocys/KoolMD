"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";

import Breadcrumb from "@/components/Breadcrumb";
import RoleList from "./Rolelist";
import UserManagement from "./Usermanagement";
import AccessControl from "./Accesscontrol";

/* ---------- Tabs ---------- */
type TabKey = "roles" | "users" | "access-control";

const TABS: { key: TabKey; label: string }[] = [
  { key: "roles", label: "Roles & Permissions" },
  { key: "users", label: "User Management" },
  { key: "access-control", label: "Access Control" },
];

const BASE = "/settings/roles-permissions";

/* ---------- Page ---------- */
const RolesPermissions = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedTab = searchParams.get("tab");
  const tab: TabKey = TABS.some((t) => t.key === requestedTab) ? (requestedTab as TabKey) : "roles";
  const current = TABS.find((t) => t.key === tab)!;

  const changeTab = (nextTab: TabKey) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", nextTab);
    router.push(`${BASE}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-4 sm:space-y-5">
      <Breadcrumb
        items={[
          { label: "Settings" },
          { label: "Roles & Permissions", href: tab === "roles" ? undefined : BASE },
          ...(tab === "roles" ? [] : [{ label: current.label }]),
        ]}
      />

      {/* Tabs */}
      <div
        role="tablist"
        aria-label="Roles and permissions sections"
        className="hide-scrollbar flex gap-4 overflow-x-auto border-b border-border sm:gap-6"
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
                active ? "border-primary text-primary" : "border-transparent text-body hover:text-heading"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab panels */}
      <div role="tabpanel">
        {tab === "roles" && <RoleList />}
        {tab === "users" && <UserManagement />}
        {tab === "access-control" && <AccessControl />}
      </div>
    </div>
  );
};

export default RolesPermissions;