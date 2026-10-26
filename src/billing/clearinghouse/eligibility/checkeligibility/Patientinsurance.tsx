"use client";

import React from "react";
import { Shield } from "lucide-react";
import { cardCls } from "@/providers/Shared";

const PatientInsurance = () => {
  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_360px] xl:gap-5">
      <div className="space-y-4 sm:space-y-5">
        <section className={`${cardCls} p-4 sm:p-6`}>
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-base font-semibold text-heading sm:text-lg">Patient Information</h3>
            <button className="text-sm font-medium text-primary hover:underline">Change Patient</button>
          </div>

          <div className="flex items-center gap-4 rounded-xl border border-border p-4 bg-primary/5">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
              JS
            </span>
            <div className="min-w-0 space-y-1">
              <h3 className="truncate text-base font-semibold text-heading">John Smith</h3>
              <p className="text-xs text-body">#PT-000125 • DOB: Jan 15, 1980 • Male • (555) 123-4567</p>
            </div>
          </div>
        </section>

        <section className={`${cardCls} p-4 sm:p-6`}>
          <h3 className="mb-4 text-base font-semibold text-heading sm:text-lg">Insurance Information</h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-sm font-medium text-heading">
                Insurance <span className="text-danger">*</span>
              </label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-body" />
                <select className="w-full appearance-none rounded-xl border border-border bg-card pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary">
                  <option>Blue Cross Blue Shield</option>
                  <option>Aetna</option>
                  <option>Cigna</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-heading">
                Payer ID <span className="text-danger">*</span>
              </label>
              <select className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary">
                <option>00324 (Default)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-heading">
                Member ID <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                defaultValue="ABC123456789"
                className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-heading">Group Number (Optional)</label>
              <input
                type="text"
                defaultValue="GRP987654"
                className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-heading">Plan Name (Optional)</label>
              <input
                type="text"
                defaultValue="PPO Blue Preferred"
                className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-heading">Policy Holder (Optional)</label>
              <select className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary">
                <option>Self</option>
                <option>Spouse</option>
                <option>Other</option>
              </select>
            </div>
          </div>
        </section>
      </div>

      <aside className="hidden xl:block">
        <div className={`${cardCls} p-5 sticky top-24`}>
          <h3 className="text-base font-semibold text-heading mb-4">Request Summary</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-body">Patient</span>
              <span className="font-medium text-heading">John Smith</span>
            </div>
            <div className="flex justify-between">
              <span className="text-body">Insurance</span>
              <span className="font-medium text-heading">Blue Cross</span>
            </div>
            <div className="flex justify-between">
              <span className="text-body">Payer ID</span>
              <span className="font-medium text-heading">00324</span>
            </div>
          </div>
          <div className="mt-6 rounded-lg bg-primary/5 p-4 text-xs text-body flex gap-2">
            <Shield className="h-4 w-4 text-primary shrink-0" />
            <p>This will send a real-time eligibility request through the configured clearinghouse.</p>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default PatientInsurance;