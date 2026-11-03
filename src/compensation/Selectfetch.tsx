"use client";

import React from "react";
import { CheckCircle2 } from "lucide-react";

import SignupDropdown from "@/components/SignupDropdown";
import DatePicker from "@/components/Datepicker";
import AddButton from "@/components/Addbutton";
import { Req, cardCls, toOptions } from "@/providers/Shared";

/* ---------------------------------------------------------------- */
/*  Step 1 – Select & Fetch                                          */
/* ---------------------------------------------------------------- */
export const SHEET_PROVIDERS = [
  { id: "PR-1001", name: "Dr. John Carter", basis: "Per Consultation", rate: 500 },
  { id: "PR-1002", name: "Dr. Emily Rogers", basis: "Per Case", rate: 350 },
  { id: "PR-1003", name: "Dr. Michael Lee", basis: "Per Consultation", rate: 450 },
  { id: "PR-1004", name: "MedStaff Agency", basis: "Per Consultation", rate: 400 },
];
export const getSheetProvider = (id: string) => SHEET_PROVIDERS.find((p) => p.id === id);

const PROVIDER_OPTIONS = SHEET_PROVIDERS.map((p) => ({ value: p.id, label: `${p.name} (${p.id})` }));
const PERIOD_OPTIONS = toOptions(["Weekly", "Bi-Weekly", "Monthly", "Custom"]);

/** Number of completed consultations returned by the (static) fetch. */
export const FETCHED_COUNT = 24;

export interface SelectFetchValues {
  provider: string;
  period: string;
  startDate: string;
  endDate: string;
  fetched: boolean;
}
export type SelectFetchErrors = Record<string, string | undefined>;

export const initialSelectFetch = (provider = ""): SelectFetchValues => ({
  provider,
  period: "Monthly",
  startDate: "",
  endDate: "",
  fetched: false,
});

export const validateSelectFetch = (v: SelectFetchValues): SelectFetchErrors => {
  const e: SelectFetchErrors = {};
  if (!v.provider) e.provider = "Provider is required.";
  if (!v.period) e.period = "Payment period is required.";
  if (!v.startDate) e.startDate = "Start date is required.";
  if (!v.endDate) e.endDate = "End date is required.";
  else if (v.startDate && v.endDate < v.startDate) e.endDate = "End date cannot be before the start date.";
  return e;
};

export const formatDate = (iso: string) =>
  iso
    ? new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "—";

type Props = {
  values: SelectFetchValues;
  errors: SelectFetchErrors;
  onChange: (patch: Partial<SelectFetchValues>) => void;
  onFetch: () => void;
  /** Shown under the fetch button when the step is validated without fetching. */
  fetchError?: string;
};

const SelectFetch = ({ values, errors, onChange, onFetch, fetchError }: Props) => {
  /** Any change to the selection invalidates the fetched records. */
  const change = (patch: Partial<SelectFetchValues>) => onChange({ ...patch, fetched: false });

  return (
    <section className={`${cardCls} space-y-4 sm:p-6`}>
      <div>
        <h3 className="text-base font-semibold text-heading sm:text-lg">Select Provider & Period</h3>
        <p className="mt-0.5 text-xs text-body sm:text-sm">Select provider, period and fetch completed consultations/cases.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <SignupDropdown
          name="provider"
          label={<>Provider<Req /></>}
          placeholder="Select provider"
          options={PROVIDER_OPTIONS}
          value={values.provider}
          onChange={(v) => change({ provider: v })}
          error={errors.provider}
        />
        <SignupDropdown
          name="period"
          label={<>Payment Period<Req /></>}
          placeholder="Select period"
          options={PERIOD_OPTIONS}
          value={values.period}
          onChange={(v) => change({ period: v })}
          error={errors.period}
        />
      </div>

      <div className="grid items-end gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <DatePicker
          name="startDate"
          label={<>Start Date<Req /></>}
          placeholder="dd-mm-yyyy"
          value={values.startDate}
          onChange={(v) => change({ startDate: v })}
          error={errors.startDate}
        />
        <DatePicker
          name="endDate"
          label={<>End Date<Req /></>}
          placeholder="dd-mm-yyyy"
          value={values.endDate}
          onChange={(v) => change({ endDate: v })}
          error={errors.endDate}
        />
        <div>
          <AddButton text="Fetch Records" icon={null} onClick={onFetch} className="whitespace-nowrap" />
        </div>
      </div>

      {fetchError && <p className="text-xs text-danger">{fetchError}</p>}

      {values.fetched && (
        <div className="flex items-center gap-3 rounded-xl border border-success/30 bg-success/10 px-4 py-3">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-success" />
          <div>
            <p className="text-sm font-semibold text-heading">{FETCHED_COUNT} completed consultations found</p>
            <p className="text-xs text-body">
              From {formatDate(values.startDate)} to {formatDate(values.endDate)}.
            </p>
          </div>
        </div>
      )}
    </section>
  );
};

export default SelectFetch;