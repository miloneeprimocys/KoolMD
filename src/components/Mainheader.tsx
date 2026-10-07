"use client";

import React from "react";
import { Bell, ChevronDown, Menu, ShieldCheck } from "lucide-react";

import ThemeToggle from "./Themetoggle";
import GlobalSearch from "./GlobalSearch";

interface MainHeaderProps {
  title?: string;
  /** Optional callback when the user types into the search box */
  onSearch?: (value: string) => void;
}

const MainHeader = ({ onSearch }: MainHeaderProps) => {
  return (
    <header className="flex h-14 min-w-0 shrink-0 items-center justify-between gap-3 border-b border-border bg-card px-4 sm:px-6 lg:h-16 lg:px-6">
      {/* ---------- LEFT ---------- */}
      <div className="flex min-w-0 flex-1 items-center gap-3">
        {/* Hamburger — mobile / tablet only */}
        <label
          htmlFor="sidebar-toggle"
          aria-label="Open menu"
          className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-border text-label transition-colors hover:border-primary hover:text-primary lg:hidden"
        >
          <Menu className="h-4 w-4" />
        </label>

        {/* Global search — fluid, grows up to 576px, hidden on phones */}
        <div className="hidden min-w-0 flex-1 md:block md:max-w-xl">
          <GlobalSearch
            onSearch={onSearch}
            width="2xl"
            className="!w-full !max-w-none"
          />
        </div>
      </div>

      {/* ---------- RIGHT ---------- */}
      <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
        {/* HIPAA card — large screens only */}
        <div className="hidden items-center gap-2.5 rounded-lg border border-primary/15 bg-primary/5 px-3 py-1.5 lg:flex">
          <ShieldCheck className="h-6 w-6 shrink-0 text-primary" />
          <div className="leading-tight">
            <p className="text-xs font-semibold text-heading">HIPAA Compliant</p>
            <p className="text-[10px] text-body">Secure. Private. Protected.</p>
          </div>
        </div>

        {/* Divider — large screens only */}
        <span
          className="hidden h-6 w-px bg-border lg:block"
          aria-hidden="true"
        />

        {/* Theme toggle */}
        <ThemeToggle />
  {/* Divider — large screens only */}
        <span
          className="hidden h-6 w-px bg-border lg:block"
          aria-hidden="true"
        />
        {/* Notifications */}
        <button
          type="button"
          aria-label="Notifications"
          className="relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-label transition-colors hover:bg-primary/5 hover:text-primary"
        >
          <Bell className="h-5 w-5" />
          {/* Red dot */}
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-danger ring-2 ring-card" />
        </button>
  {/* Divider — large screens only */}
        <span
          className="hidden h-6 w-px bg-border lg:block"
          aria-hidden="true"
        />
        {/* User menu */}
        <button
          type="button"
          aria-label="Account menu"
          className="flex cursor-pointer items-center gap-2.5 rounded-lg px-1.5 py-1 transition-colors hover:bg-primary/5"
        >
          {/* Avatar */}
          <span className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-end text-xs font-semibold text-heading ring-1 ring-border">
            DS
          </span>

          {/* Name + role — large screens only */}
          <div className="hidden text-left leading-tight lg:block">
            <p className="text-xs font-semibold text-heading">Dr. Sarah Carter</p>
            <p className="text-[10px] text-body">Administrator</p>
          </div>

          <ChevronDown className="hidden h-4 w-4 text-body lg:block" />
        </button>
      </div>
    </header>
  );
};

export default MainHeader;