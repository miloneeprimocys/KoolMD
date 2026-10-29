"use client";

import React, { useState } from "react";
import { X } from "lucide-react";

import AddButton from "@/components/Addbutton";
import ImportButton from "@/components/ImportButton";
import DatePicker from "@/components/Datepicker";
import RadioCheckButtonh from "@/components/RadioCheckButtonh";
import SignupDropdown from "@/components/SignupDropdown";
import SignupField, { FieldError } from "@/components/SignupField";
import { ChipSelect, Errors, Opt, Req, TextArea, cardCls, toOptions, todayISO, uid } from "../../providers/Shared";
import { LOCATIONS, PROVIDERS, type Notify } from "./Blocktime";

/* ---------------------------------------------------------------- */
/*  Types + constants                                                */
/* ---------------------------------------------------------------- */
export type Holiday = {
  id: string;
  date: string; // yyyy-mm-dd
  title: string;
  type: "Holiday";
  description: string;
  locations: string[]; // empty = all locations
  types: string[]; // empty = all appointment types
  status: "Active" | "Inactive";
};

export const APPOINTMENT_TYPES = [
  "Initial Consultation",
  "Follow Up",
  "Consultation",
  "Physical Exam",
  "Procedure",
  "Well Child Visit",
];

type DateMode = "single" | "multiple" | "range";
type Scope = "all" | "specific";

interface Values {
  mode: DateMode;
  date: string;
  dates: string[];
  rangeStart: string;
  rangeEnd: string;
  title: string;
  description: string;
  locMode: Scope;
  locations: string[];
  typeMode: Scope;
  types: string[];
}

const initialValues = (h?: Holiday): Values => ({
  mode: "single",
  date: h?.date ?? "",
  dates: [],
  rangeStart: "",
  rangeEnd: "",
  title: h?.title ?? "",
  description: h?.description ?? "",
  locMode: h && h.locations.length ? "specific" : "all",
  locations: h?.locations ?? [],
  typeMode: h && h.types.length ? "specific" : "all",
  types: h?.types ?? [],
});

/* ---------------------------------------------------------------- */
/*  Helpers                                                          */
/* ---------------------------------------------------------------- */
const fmtDate = (iso: string) => {
  const [y, m, d] = iso.split("-");
  return `${m}/${d}/${y}`;
};

const toISO = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const eachDay = (startISO: string, endISO: string) => {
  const out: string[] = [];
  const [sy, sm, sd] = startISO.split("-").map(Number);
  const [ey, em, ed] = endISO.split("-").map(Number);
  const cur = new Date(sy, sm - 1, sd);
  const end = new Date(ey, em - 1, ed);
  while (cur <= end && out.length < 366) {
    out.push(toISO(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return out;
};

const pickedDates = (v: Values): string[] =>
  v.mode === "single" ? (v.date ? [v.date] : []) : v.mode === "multiple" ? v.dates : v.rangeStart && v.rangeEnd ? eachDay(v.rangeStart, v.rangeEnd) : [];

const validate = (v: Values): Errors => {
  const e: Errors = {};
  if (v.mode === "single" && !v.date) e.date = "Select a date.";
  if (v.mode === "multiple" && v.dates.length === 0) e.dates = "Add at least one date.";
  if (v.mode === "range") {
    if (!v.rangeStart) e.rangeStart = "Start date is required.";
    if (!v.rangeEnd) e.rangeEnd = "End date is required.";
  }
  if (!v.title.trim()) e.title = "Title is required.";
  else if (v.title.trim().length < 2) e.title = "Title must be at least 2 characters.";
  if (v.locMode === "specific" && v.locations.length === 0) e.locations = "Select at least one location.";
  if (v.typeMode === "specific" && v.types.length === 0) e.types = "Select at least one appointment type.";
  return e;
};

const RadioRow = <T extends string>({
  name,
  value,
  options,
  onChange,
}: {
  name: string;
  value: T;
  options: { key: T; label: string }[];
  onChange: (v: T) => void;
}) => (
  <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
    {options.map((o) => (
      <label key={o.key} className="flex cursor-pointer items-center gap-2.5 text-sm text-heading">
        <RadioCheckButtonh type="radio" name={name} checked={value === o.key} onChange={() => onChange(o.key)} />
        {o.label}
      </label>
    ))}
  </div>
);

const headingCls = "mb-3 text-sm font-semibold text-heading";

/* ---------------------------------------------------------------- */
/*  Component                                                        */
/* ---------------------------------------------------------------- */
type Props = {
  notify: Notify;
  onCancel: () => void;
  /** Called with the holiday rows to add (one per date). */
  onSave: (rows: Holiday[]) => void;
  /** Provider the holiday belongs to (defaults to the first provider). */
  providerId?: string;
  /** When set, the form edits this holiday. */
  initial?: Holiday;
};

const AddHolidays = ({ notify, onCancel, onSave, providerId, initial }: Props) => {
  const [v, setV] = useState<Values>(initialValues(initial));
  const [errors, setErrors] = useState<Errors>({});
  const [isSaving, setIsSaving] = useState(false);

  const patch = (p: Partial<Values>) => setV((prev) => ({ ...prev, ...p }));
  const provider = PROVIDERS.find((p) => p.id === providerId) ?? PROVIDERS[0];
  const initials = provider.name.replace(/^Dr\.\s*/i, "").split(" ").map((w) => w[0]).slice(0, 2).join("");
  const today = todayISO();

  const handleSave = () => {
    if (isSaving) return;
    const errs = validate(v);
    setErrors(errs);
    if (Object.keys(errs).length) {
      document.getElementById(Object.keys(errs)[0])?.scrollIntoView({ behavior: "smooth", block: "center" });
      notify("error", "Validation Incomplete", "Please complete all required fields.");
      return;
    }

    setIsSaving(true);
    try {
      // TODO: call your API here
      const rows: Holiday[] = pickedDates(v).map((date) => ({
        id: uid(),
        date,
        title: v.title.trim(),
        type: "Holiday",
        description: v.description.trim(),
        locations: v.locMode === "all" ? [] : v.locations,
        types: v.typeMode === "all" ? [] : v.types,
        status: "Active",
      }));
      notify("success", initial ? "Holiday updated" : "Holiday added", "Availability is blocked for the selected date(s).");
      onSave(rows);
    } catch (error) {
      notify("error", "Could not save holiday", error instanceof Error ? error.message : "Something went wrong. Try again.");
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col">
      <div className="space-y-4 -mt-6">
        <div>
          <h3 className="text-base font-semibold text-heading sm:text-lg">{initial ? "Edit Holiday" : "Add Holiday"}</h3>
          <p className="mt-0.5 text-xs text-body sm:text-sm">
            Block your availability for specific date(s). No appointments will be booked during this time.
          </p>
        </div>

        <section className={`${cardCls} space-y-5 sm:p-6`}>
          {/* Provider banner */}
          <div className="flex items-center gap-3 rounded-xl bg-primary/10 px-4 py-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
              {initials}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-heading">{provider.name}</p>
              <p className="text-xs text-body">{provider.info}</p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* ---------------- Left ---------------- */}
            <div className="min-w-0 space-y-5">
              <div>
                <h4 className={headingCls}>Holiday Type</h4>
                <RadioRow<DateMode>
                  name="holidayType"
                  value={v.mode}
                  onChange={(mode) => {
                    patch({ mode });
                    setErrors((p) => ({ ...p, date: "", dates: "", rangeStart: "", rangeEnd: "" }));
                  }}
                  options={[
                    { key: "single", label: "Single Date" },
                    { key: "multiple", label: "Multiple Dates" },
                    { key: "range", label: "Date Range" },
                  ]}
                />
              </div>

              <div>
                <h4 className={headingCls}>{v.mode === "range" ? "Date Range" : v.mode === "multiple" ? "Dates" : "Date"}</h4>

                {v.mode === "single" && (
                  <DatePicker name="date" value={v.date} onChange={(val) => patch({ date: val })} minDate={today} error={errors.date} />
                )}

                {v.mode === "multiple" && (
                  <div id="dates">
                    <DatePicker
                      name="addDate"
                      placeholder="Pick a date to add"
                      value=""
                      onChange={(val) => val && !v.dates.includes(val) && patch({ dates: [...v.dates, val].sort() })}
                      minDate={today}
                    />
                    {v.dates.length > 0 && (
                      <ul className="mt-2 flex flex-wrap gap-2">
                        {v.dates.map((d) => (
                          <li
                            key={d}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 py-1 pl-2.5 pr-1.5 text-xs font-medium text-heading"
                          >
                            {fmtDate(d)}
                            <button
                              type="button"
                              aria-label={`Remove ${fmtDate(d)}`}
                              onClick={() => patch({ dates: v.dates.filter((x) => x !== d) })}
                              className="flex h-4 w-4 cursor-pointer items-center justify-center rounded text-body hover:bg-danger/10 hover:text-danger"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                    <FieldError message={errors.dates} />
                  </div>
                )}

                {v.mode === "range" && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <DatePicker
                      name="rangeStart"
                      label="From"
                      value={v.rangeStart}
                      onChange={(val) => patch({ rangeStart: val, rangeEnd: v.rangeEnd && v.rangeEnd < val ? "" : v.rangeEnd })}
                      minDate={today}
                      error={errors.rangeStart}
                    />
                    <DatePicker
                      name="rangeEnd"
                      label="To"
                      value={v.rangeEnd}
                      onChange={(val) => patch({ rangeEnd: val })}
                      minDate={v.rangeStart || today}
                      error={errors.rangeEnd}
                    />
                  </div>
                )}
              </div>

              <div>
                <h4 className={headingCls}>Title<Req /></h4>
                <SignupField
                  name="title"
                  placeholder="Enter holiday title"
                  value={v.title}
                  onChange={(e) => patch({ title: e.target.value })}
                  error={errors.title}
                />
              </div>

              <TextArea
                name="description"
                label={<>Description<Opt /></>}
                placeholder="Add a note (optional)"
                rows={4}
                maxLength={250}
                value={v.description}
                onChange={(val) => patch({ description: val })}
              />
            </div>

            {/* ---------------- Right ---------------- */}
            <div className="min-w-0 space-y-6 md:border-l md:border-divider md:pl-6">
              <div id="locations">
                <h4 className={headingCls}>Apply To</h4>
                <RadioRow<Scope>
                  name="locMode"
                  value={v.locMode}
                  onChange={(locMode) => patch({ locMode })}
                  options={[
                    { key: "all", label: "All Locations" },
                    { key: "specific", label: "Specific Locations" },
                  ]}
                />
                <div className="mt-3">
                  {v.locMode === "specific" ? (
                    <ChipSelect
                      name="locationsSelect"
                      label=""
                      placeholder="Select Locations"
                      options={toOptions(LOCATIONS)}
                      value={v.locations}
                      onChange={(val) => patch({ locations: val })}
                      error={errors.locations}
                    />
                  ) : (
                    <SignupDropdown name="locationsDisabled" label="" placeholder="Select Locations" options={[]} value="" onChange={() => {}} disabled />
                  )}
                </div>
              </div>

              <div id="types">
                <h4 className={headingCls}>Apply To Appointment Types</h4>
                <RadioRow<Scope>
                  name="typeMode"
                  value={v.typeMode}
                  onChange={(typeMode) => patch({ typeMode })}
                  options={[
                    { key: "all", label: "All Appointment Types" },
                    { key: "specific", label: "Selected Types" },
                  ]}
                />
                <div className="mt-3">
                  {v.typeMode === "specific" ? (
                    <ChipSelect
                      name="typesSelect"
                      label=""
                      placeholder="Select Appointment Types"
                      options={toOptions(APPOINTMENT_TYPES)}
                      value={v.types}
                      onChange={(val) => patch({ types: val })}
                      error={errors.types}
                    />
                  ) : (
                    <SignupDropdown name="typesDisabled" label="" placeholder="Select Appointment Types" options={[]} value="" onChange={() => {}} disabled />
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Sticky bottom buttons */}
      <div className="sticky -bottom-4 z-[250] -mx-4 -mb-4 mt-4 border-t border-border bg-card px-4 py-4 sm:-bottom-6 sm:-mx-6 sm:-mb-6 sm:px-6 sm:py-5">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-2 sm:gap-3">
          <ImportButton text="Cancel" icon={null} onClick={onCancel} className="shrink-0 whitespace-nowrap px-3 sm:px-5" />
          <AddButton
            text={isSaving ? "Saving…" : initial ? "Update Holiday" : "Save Holiday"}
            icon={null}
            onClick={handleSave}
            disabled={isSaving}
            className="shrink-0 whitespace-nowrap px-3 sm:px-5"
          />
        </div>
      </div>
    </div>
  );
};

export default AddHolidays;