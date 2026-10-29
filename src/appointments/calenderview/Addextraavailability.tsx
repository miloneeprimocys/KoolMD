"use client";

import React, { useMemo, useState } from "react";
import { Calendar as CalendarIcon, Clock, Info, Plus, Settings, Trash2, User, X } from "lucide-react";

import AddButton from "@/components/Addbutton";
import ImportButton from "@/components/ImportButton";
import Calendar, { SHORT_WEEKDAYS } from "@/components/Calendar";
import DatePicker from "@/components/Datepicker";
import RadioCheckButtonh from "@/components/RadioCheckButtonh";
import SignupDropdown from "@/components/SignupDropdown";
import SignupField, { FieldError } from "@/components/SignupField";
import StickyColumns from "@/components/StickyColumns";
import { Errors, Opt, SectionCard, toOptions, todayISO, uid } from "../../providers/Shared";
import { PROVIDERS, PROVIDER_OPTIONS, TimeSelect, type Notify } from "./Blocktime";

/* ---------------------------------------------------------------- */
/*  Constants + types                                                */
/* ---------------------------------------------------------------- */
const APPOINTMENT_TYPES = ["In-Person (Clinic)", "Telemedicine", "Home Visit"];
const DURATIONS = ["15 minutes", "30 minutes", "45 minutes", "60 minutes"];
const INTERVALS = DURATIONS;

type DateMode = "single" | "multiple" | "range";

type Slot = { id: string; start: string; end: string; interval: string };

interface ExtraValues {
  providerId: string;
  mode: DateMode;
  date: string;
  dates: string[];
  rangeStart: string;
  rangeEnd: string;
  slots: Slot[];
  appointmentType: string;
  duration: string;
  maxPerSlot: string;
  allowNew: "Yes" | "No";
}

const newSlot = (start = "", end = ""): Slot => ({ id: uid(), start, end, interval: "30 minutes" });

const initialValues = (): ExtraValues => ({
  providerId: "",
  mode: "single",
  date: "",
  dates: [],
  rangeStart: "",
  rangeEnd: "",
  slots: [newSlot("09:00", "12:00"), newSlot("14:00", "17:00")],
  appointmentType: "In-Person (Clinic)",
  duration: "30 minutes",
  maxPerSlot: "1",
  allowNew: "Yes",
});

/* ---------------------------------------------------------------- */
/*  Date helpers                                                     */
/* ---------------------------------------------------------------- */
const toISO = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const fromISO = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
};

const fmtDate = (iso: string) => {
  const [y, m, d] = iso.split("-");
  return `${m}/${d}/${y}`;
};

const eachDay = (startISO: string, endISO: string) => {
  const out: string[] = [];
  const cur = fromISO(startISO);
  const end = fromISO(endISO);
  while (cur <= end && out.length < 366) {
    out.push(toISO(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return out;
};

const selectedDates = (v: ExtraValues): string[] =>
  v.mode === "single"
    ? v.date ? [v.date] : []
    : v.mode === "multiple"
      ? v.dates
      : v.rangeStart && v.rangeEnd ? eachDay(v.rangeStart, v.rangeEnd) : v.rangeStart ? [v.rangeStart] : [];

/* ---------------------------------------------------------------- */
/*  Validation                                                       */
/* ---------------------------------------------------------------- */
const validate = (v: ExtraValues): Errors => {
  const e: Errors = {};
  if (!v.providerId) e.providerId = "Select a provider.";

  if (v.mode === "single" && !v.date) e.date = "Select a date.";
  if (v.mode === "multiple" && v.dates.length === 0) e.dates = "Select at least one date.";
  if (v.mode === "range") {
    if (!v.rangeStart) e.rangeStart = "Start date is required.";
    if (!v.rangeEnd) e.rangeEnd = "End date is required.";
  }

  if (v.slots.length === 0) e.slots = "Add at least one time slot.";
  else if (v.slots.some((s) => !s.start || !s.end)) e.slots = "Select start and end time for every slot.";
  else if (v.slots.some((s) => s.end <= s.start)) e.slots = "End time must be after start time in every slot.";
  else {
    const sorted = [...v.slots].sort((a, b) => a.start.localeCompare(b.start));
    if (sorted.some((s, i) => i > 0 && s.start < sorted[i - 1].end)) e.slots = "Time slots cannot overlap.";
  }

  if (!v.appointmentType) e.appointmentType = "Appointment type is required.";
  if (!v.duration) e.duration = "Duration is required.";
  if (v.maxPerSlot.trim() && !/^[1-9]\d{0,1}$/.test(v.maxPerSlot.trim()))
    e.maxPerSlot = "Enter a number between 1 and 99.";
  return e;
};

/* ---------------------------------------------------------------- */
/*  Component                                                        */
/* ---------------------------------------------------------------- */
type Props = {
  notify: Notify;
  onDone: () => void;
};

const AddExtraAvailability = ({ notify, onDone }: Props) => {
  const [values, setValues] = useState<ExtraValues>(initialValues());
  const [errors, setErrors] = useState<Errors>({});
  const [isSaving, setIsSaving] = useState(false);
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));

  const v = values;
  const patch = (p: Partial<ExtraValues>) => setValues((prev) => ({ ...prev, ...p }));
  const today = todayISO();
  const chosen = useMemo(() => new Set(selectedDates(v)), [v]);
  const provider = PROVIDERS.find((p) => p.id === v.providerId);

  const focusMonth = (iso: string) => {
    if (iso) setMonth(new Date(fromISO(iso).getFullYear(), fromISO(iso).getMonth(), 1));
  };

  /* ---------- Calendar picking ---------- */
  const pickDate = (iso: string) => {
    if (iso < today) return;
    if (v.mode === "single") patch({ date: iso });
    else if (v.mode === "multiple")
      patch({ dates: v.dates.includes(iso) ? v.dates.filter((d) => d !== iso) : [...v.dates, iso].sort() });
    else if (!v.rangeStart || v.rangeEnd) patch({ rangeStart: iso, rangeEnd: "" });
    else if (iso < v.rangeStart) patch({ rangeStart: iso });
    else patch({ rangeEnd: iso });
  };

  const changeMode = (mode: DateMode) => {
    patch({ mode });
    setErrors((prev) => ({ ...prev, date: "", dates: "", rangeStart: "", rangeEnd: "" }));
  };

  /* ---------- Slots ---------- */
  const updateSlot = (id: string, p: Partial<Slot>) =>
    patch({ slots: v.slots.map((s) => (s.id === id ? { ...s, ...p } : s)) });

  /* ---------- Save ---------- */
  const handleSave = async () => {
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
      console.log("Extra availability saved:", { ...v, dates: selectedDates(v) });
      notify("success", "Availability added", "Extra availability has been added.");
      setTimeout(onDone, 800);
    } catch (error) {
      notify("error", "Could not save availability", error instanceof Error ? error.message : "Something went wrong. Try again.");
      setIsSaving(false);
    }
  };

  const navBtn =
    "flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-body transition-colors hover:bg-primary/10 hover:text-primary";

  return (
    <div className="flex min-h-full flex-col">
      <div className="mx-auto w-full max-w-[1600px] flex-1">
        <StickyColumns columnsClass="2xl:grid-cols-2" breakpoint="2xl">
          {/* ---------------- Left column ---------------- */}
          <section className="min-w-0 space-y-4 sm:space-y-5">
            <SectionCard title="Provider" icon={<User className="h-4 w-4" />}>
              <SignupDropdown
              name="providerId"
              label=""
              placeholder="Select provider"
              options={PROVIDER_OPTIONS}
              value={v.providerId}
              onChange={(val) => patch({ providerId: val })}
              error={errors.providerId}
              />
              {provider && (
                <div className="mt-3 flex items-center gap-3 rounded-xl bg-primary/10 px-4 py-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
                    {provider.name.replace(/^Dr\.\s*/i, "").split(" ").map((w) => w[0]).slice(0, 2).join("")}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-heading">{provider.name}</p>
                    <p className="text-xs text-body">{provider.info}</p>
                  </div>
                </div>
              )}
            </SectionCard>

            <SectionCard title="Select Date(s)" icon={<CalendarIcon className="h-4 w-4" />}>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              {(
                [
                  ["single", "Single Date"],
                  ["multiple", "Multiple Dates"],
                  ["range", "Date Range"],
                ] as const
              ).map(([key, text]) => (
                <label key={key} className="flex cursor-pointer items-center gap-2.5 text-sm text-heading">
                  <RadioCheckButtonh type="radio" name="dateMode" checked={v.mode === key} onChange={() => changeMode(key)} />
                  {text}
                </label>
              ))}
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-[minmax(0,1fr)_300px]">
              {/* Inputs */}
              <div className="min-w-0 space-y-3">
                {v.mode === "single" && (
                  <DatePicker
                    name="date"
                    value={v.date}
                    onChange={(val) => {
                      patch({ date: val });
                      focusMonth(val);
                    }}
                    minDate={today}
                    error={errors.date}
                  />
                )}

                {v.mode === "multiple" && (
                  <div id="dates">
                    <p className="text-xs text-body">Click dates on the calendar to select or deselect them.</p>
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
                      onChange={(val) => {
                        patch({ rangeStart: val, rangeEnd: v.rangeEnd && v.rangeEnd < val ? "" : v.rangeEnd });
                        focusMonth(val);
                      }}
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

              {/* Calendar */}
              <div className="select-none rounded-xl border border-border bg-card p-3">
                <Calendar
                  month={month}
                  selectedDate={undefined}
                  today={new Date()}
                  weekdays={SHORT_WEEKDAYS}
                  onSelectDate={(date) => pickDate(toISO(date))}
                  onMonthChange={setMonth}
                  showMonthNavigation={true}
                  weekdayContainerClassName="mb-1"
                  weekdayClassName="py-1 text-xs text-body"
                  dayGridClassName="gap-y-1"
                  renderDay={(date, state) => {
                    if (state.isOutsideMonth) return <span />;
                    const iso = toISO(date);
                    const on = chosen.has(iso);
                    const off = iso < today;
                    return (
                      <button
                        type="button"
                        disabled={off}
                        onClick={() => pickDate(iso)}
                        aria-pressed={on}
                        className={`mx-auto flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-30 ${
                          on
                            ? "bg-primary font-semibold text-white"
                            : iso === today
                              ? "border border-primary font-medium text-primary hover:bg-primary/10"
                              : "text-heading hover:bg-primary/10"
                        }`}
                      >
                        {date.getDate()}
                      </button>
                    );
                  }}
                />
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Time Slots" icon={<Clock className="h-4 w-4" />}>
            <div className="mb-3 flex items-start gap-2 rounded-lg bg-primary/10 px-3 py-2.5 text-xs text-heading">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <p>
                Add one or more time slots for the selected date. These slots will be added as extra availability in
                addition to the regular schedule.
              </p>
            </div>

            <div id="slots" className="divide-y divide-divider rounded-xl border border-border">
              {v.slots.map((s) => (
                <div key={s.id} className="grid items-end gap-3 p-3 sm:grid-cols-[1fr_1fr_1fr_auto]">
                  <TimeSelect name={`start-${s.id}`} label="Start Time" value={s.start} onChange={(val) => updateSlot(s.id, { start: val })} />
                  <TimeSelect name={`end-${s.id}`} label="End Time" value={s.end} onChange={(val) => updateSlot(s.id, { end: val })} />
                  <SignupDropdown
                    name={`interval-${s.id}`}
                    label="Slot Interval"
                    searchable={false}
                    options={toOptions(INTERVALS)}
                    value={s.interval}
                    onChange={(val) => updateSlot(s.id, { interval: val })}
                  />
                  <button
                    type="button"
                    aria-label="Remove time slot"
                    onClick={() => patch({ slots: v.slots.filter((x) => x.id !== s.id) })}
                    className="mb-6 flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg text-danger transition-colors hover:bg-danger/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <div className="p-3">
                <ImportButton
                  text="Add Time Slot"
                  icon={<Plus className="h-4 w-4" />}
                  onClick={() => patch({ slots: [...v.slots, newSlot()] })}
                  className="whitespace-nowrap px-4"
                />
              </div>
              </div>
              <FieldError message={errors.slots} />
            </SectionCard>
          </section>

          {/* ---------------- Right column ---------------- */}
          <div className="min-w-0 space-y-4 sm:space-y-5">
            <SectionCard title="Appointment Settings" icon={<Settings className="h-4 w-4" />}>
            <div className="grid gap-4 sm:grid-cols-2">
              <SignupDropdown
                name="appointmentType"
                label="Appointment Type"
                searchable={false}
                options={toOptions(APPOINTMENT_TYPES)}
                value={v.appointmentType}
                onChange={(val) => patch({ appointmentType: val })}
                error={errors.appointmentType}
              />
              <SignupDropdown
                name="duration"
                label="Default Appointment Duration"
                searchable={false}
                options={toOptions(DURATIONS)}
                value={v.duration}
                onChange={(val) => patch({ duration: val })}
                error={errors.duration}
              />
              <SignupField
                name="maxPerSlot"
                label={<>Max Appointments per Slot<Opt /></>}
                inputMode="numeric"
                placeholder="1"
                value={v.maxPerSlot}
                onChange={(e) => patch({ maxPerSlot: e.target.value.replace(/\D/g, "").slice(0, 2) })}
                error={errors.maxPerSlot}
              />
              <div>
                <p className="mb-2 text-sm font-medium text-label">Allow New Patients</p>
                <div className="flex h-12 items-center gap-6">
                  {(["Yes", "No"] as const).map((opt) => (
                    <label key={opt} className="flex cursor-pointer items-center gap-2.5 text-sm text-heading">
                      <RadioCheckButtonh type="radio" name="allowNew" checked={v.allowNew === opt} onChange={() => patch({ allowNew: opt })} />
                      {opt}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </SectionCard>
        </div>
      </StickyColumns>
      </div>

      {/* Sticky bottom buttons */}
      <div className="sticky -bottom-4 sm:-bottom-6 z-[200] -mx-4 -mb-4 sm:-mb-6 mt-4 border-t border-border bg-card px-4 py-4 sm:-mx-6 sm:px-6 sm:py-5">
        <div className="mx-auto flex max-w-[1600px] items-center justify-center sm:justify-end gap-2 sm:gap-3">
          <ImportButton text="Cancel" icon={null} onClick={onDone} className="shrink-0 px-3 whitespace-nowrap sm:px-5" />
          <AddButton
            text={isSaving ? "Saving…" : "Save Availability"}
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

export default AddExtraAvailability;