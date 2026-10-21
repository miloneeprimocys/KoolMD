"use client";

import React from "react";
import { Plus, Search, User } from "lucide-react";

import SignupField from "@/components/SignupField";
import SignupDropdown, { type DropdownOption } from "@/components/SignupDropdown";
import DatePicker from "@/components/Datepicker";
import ImportButton from "@/components/ImportButton";
import { Opt, Req, TextArea, cardCls } from "@/providers/Shared";
import { PriorityToggle, type Priority } from "../Laborders";
import { LabPatientInfo } from "../Labresults";

/* ---------- Values ---------- */
export interface OrderDetailsValues {
  provider: string;
  orderDate: string;
  priority: Priority;
  diagnosis: string;
  icd10: string;
}

export const initialOrderDetails = (): OrderDetailsValues => ({
  provider: "emily",
  orderDate: "2026-10-17",
  priority: "Routine",
  diagnosis: "",
  icd10: "",
});

export type OrderDetailsErrors = Record<string, string>;

export const validateOrderDetails = (v: OrderDetailsValues): OrderDetailsErrors => {
  const e: OrderDetailsErrors = {};
  if (!v.provider) e.provider = "Ordering provider is required.";
  if (!v.orderDate) e.orderDate = "Order date is required.";
  return e;
};

/* ---------- Static data ---------- */
const PROVIDER_OPTIONS: DropdownOption[] = [
  { value: "emily", label: "Dr. Emily Carter (Internal Medicine)" },
  { value: "james", label: "Dr. James Miller (Cardiology)" },
  { value: "sarah", label: "Dr. Sarah Lee (Primary Care)" },
];

/* ---------- Component ---------- */
const OrderDetails = ({
  values: v,
  errors,
  onChange,
}: {
  values: OrderDetailsValues;
  errors: OrderDetailsErrors;
  onChange: (patch: Partial<OrderDetailsValues>) => void;
}) => (
  <section className={`${cardCls} sm:!p-6`}>
    {/* Patient information */}
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <h3 className="text-base font-semibold text-heading">Patient Information</h3>
      <ImportButton
        text="View Patient Profile"
        icon={<User className="h-4 w-4" />}
        onClick={() => {}}
      />
    </div>

    <div className="mt-4">
      <LabPatientInfo />
    </div>

    <hr className="my-6 border-divider" />

    {/* Order form */}
    <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
      <SignupDropdown
        name="provider"
        label={<>Ordering Provider<Req /></>}
        placeholder="Select provider"
        options={PROVIDER_OPTIONS}
        value={v.provider}
        onChange={(val) => onChange({ provider: val })}
        error={errors.provider}
        searchable={false}
      />
      <DatePicker
        name="orderDate"
        label={<>Order Date<Req /></>}
        value={v.orderDate}
        onChange={(val) => onChange({ orderDate: val })}
        error={errors.orderDate}
        align="auto"
      />
      <PriorityToggle
        label={<>Priority<Req /></>}
        value={v.priority}
        onChange={(priority) => onChange({ priority })}
      />

      <div className="sm:col-span-2">
        <TextArea
          name="diagnosis"
          label="Diagnosis / Clinical Indication"
          placeholder="Enter diagnosis, clinical indication or reason for testing..."
          value={v.diagnosis}
          onChange={(diagnosis) => onChange({ diagnosis })}
          rows={4}
          maxLength={500}
        />
      </div>

      <div className="min-w-0">
        <SignupField
          name="icd10"
          label={<>ICD-10 Code<Opt /></>}
          placeholder="Search or enter ICD-10 code..."
          icon={<Search className="h-4 w-4" />}
          value={v.icd10}
          onChange={(e) => onChange({ icd10: e.target.value })}
        />
        <button
          type="button"
          className="mt-1 inline-flex cursor-pointer items-center gap-1.5 rounded-lg py-1 text-sm font-medium text-primary transition-colors hover:text-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
        >
          <Plus className="h-4 w-4" />
          Add ICD-10 Code
        </button>
      </div>
    </div>
  </section>
);

export default OrderDetails;