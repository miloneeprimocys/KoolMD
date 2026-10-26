"use client";

import React from "react";
import { Info } from "lucide-react";

import { ModalDateField, ModalRadioGroup, ReqLabel } from "@/components/Modalshell";
import SignupField from "@/components/SignupField";
import SignupDropdown from "@/components/SignupDropdown";

export type EndType = "none" | "after" | "on";

export type RecurringScheduleValue = {
  frequency: string; // Weekly | Monthly | Quarterly | Yearly
  every: string; // "1".."12"
  endType: EndType;
  cycles: string;
  endDate: string; // ISO
};

export const DEFAULT_SCHEDULE: RecurringScheduleValue = {
  frequency: "Monthly",
  every: "1",
  endType: "none",
  cycles: "12",
  endDate: "",
};

const FREQUENCIES = ["Weekly", "Monthly", "Quarterly", "Yearly"].map((v) => ({ value: v, label: v }));
const EVERY = Array.from({ length: 12 }, (_, i) => ({ value: String(i + 1), label: String(i + 1) }));
const END_TYPES = [
  { value: "none", label: "No End Date" },
  { value: "after", label: "End After" },
  { value: "on", label: "End On" },
];

const UNIT: Record<string, string> = {
  Weekly: "week(s)",
  Monthly: "month(s)",
  Quarterly: "quarter(s)",
  Yearly: "year(s)",
};

type Props = {
  value: RecurringScheduleValue;
  onChange: (value: RecurringScheduleValue) => void;
};

const RecurringSchedule = ({ value, onChange }: Props) => {
  const set = <K extends keyof RecurringScheduleValue>(key: K, next: RecurringScheduleValue[K]) =>
    onChange({ ...value, [key]: next });

  return (
    <div className="space-y-4 rounded-xl border border-primary/15 bg-primary/[0.05] p-4">
      <h4 className="text-sm font-semibold text-heading">Recurring Schedule</h4>

      <div className="grid gap-4 sm:grid-cols-2">
        <SignupDropdown
          name="billingFrequency"
          label={<ReqLabel>Billing Frequency</ReqLabel>}
          value={value.frequency}
          onChange={(v: string) => set("frequency", v)}
          options={FREQUENCIES}
        />
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3">
          <SignupDropdown
            name="repeatEvery"
            label={<ReqLabel>Repeat Every</ReqLabel>}
            value={value.every}
            onChange={(v: string) => set("every", v)}
            options={EVERY}
          />
          <span className="pb-3 text-sm text-body">{UNIT[value.frequency]}</span>
        </div>
      </div>

      <div className="space-y-3">
        <ModalRadioGroup
          name="endType"
          label="End Type"
          value={value.endType}
          onChange={(v) => set("endType", v as EndType)}
          options={END_TYPES}
          className="gap-x-8"
        />

        {value.endType === "after" && (
          <div className="max-w-[200px]">
            <SignupField
              name="endCycles"
              type="number"
              label="Cycle(s)"
              placeholder="12"
              value={value.cycles}
              onChange={(e) => set("cycles", e.target.value)}
            />
          </div>
        )}

        {value.endType === "on" && (
          <div className="max-w-[240px]">
            <ModalDateField
              id="recurring-end-date"
              label="End Date"
              value={value.endDate}
              onChange={(v) => set("endDate", v)}
            />
          </div>
        )}
      </div>

      <div className="flex items-start gap-2 rounded-lg bg-primary/10 p-3 text-xs text-primary">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          This recurring charge will be automatically added to future invoices based on the selected frequency and end
          date. You can manage or cancel it anytime from the membership plan.
        </p>
      </div>
    </div>
  );
};

export default RecurringSchedule;