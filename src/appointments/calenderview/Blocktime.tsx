"use client";

import React, { useState } from "react";

import AddButton from "@/components/Addbutton";
import ImportButton from "@/components/ImportButton";
import SignupDropdown, { type DropdownOption } from "@/components/SignupDropdown";
import DatePicker from "@/components/Datepicker";
import { Errors, Opt, Req, TextArea, cardCls, pad, toOptions, todayISO } from "../../providers/Shared";

/* ---------------------------------------------------------------- */
/*  Shared helpers (also used by AddExtraAvailability)               */
/* ---------------------------------------------------------------- */
/* TODO: replace with your providers API / redux selector */
export const PROVIDERS = [
  { id: "p1", name: "Dr. Sarah Mitchell", info: "MD | Internal Medicine" },
  { id: "p2", name: "Dr. James Carter", info: "MD | Family Medicine" },
  { id: "p3", name: "Dr. Emily Wilson", info: "MD | Pediatrics" },
  { id: "p4", name: "Dr. Michael Lee", info: "MD | Cardiology" },
  { id: "p5", name: "Dr. Priya Shah", info: "DO | Dermatology" },
];

const initials = (name: string) =>
  name.replace(/^Dr\.\s*/i, "").split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

export const PROVIDER_OPTIONS: DropdownOption[] = PROVIDERS.map((p) => ({
  value: p.id,
  label: p.name,
  icon: (
    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
      {initials(p.name)}
    </span>
  ),
  keywords: [p.name, p.info],
}));

export const LOCATIONS = ["Main Clinic", "Downtown Clinic", "Westside Clinic", "Telemedicine"];
export const REASONS = ["Lunch Break", "Meeting", "Leave", "Training", "Personal", "Other"];

/** 06:00 → 22:00, every 30 min. value "HH:mm" (sortable), label "hh:mm AM/PM". */
export const TIME_OPTIONS: DropdownOption[] = Array.from({ length: 33 }, (_, i) => {
  const mins = 360 + i * 30;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return { value: `${pad(h)}:${pad(m)}`, label: `${pad(h % 12 || 12)}:${pad(m)} ${h >= 12 ? "PM" : "AM"}` };
});

/**
 * Single place to swap in your TimePicker component, if you have one.
 */
export const TimeSelect = ({
  name,
  label,
  value,
  onChange,
  error,
}: {
  name: string;
  label: React.ReactNode;
  value: string;
  onChange: (v: string) => void;
  error?: string;
}) => (
  <SignupDropdown
    name={name}
    label={label}
    placeholder="Select time"
    searchable={false}
    options={TIME_OPTIONS}
    value={value}
    onChange={onChange}
    error={error}
  />
);

export type Notify = (type: "success" | "error", title: string, message: string) => void;

/* ---------------------------------------------------------------- */
/*  Values + validation                                              */
/* ---------------------------------------------------------------- */
interface BlockTimeValues {
  providerId: string;
  location: string;
  date: string; // yyyy-mm-dd
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  reason: string;
  notes: string;
}

const initialValues = (): BlockTimeValues => ({
  providerId: "",
  location: "",
  date: "",
  startTime: "",
  endTime: "",
  reason: "",
  notes: "",
});

const validate = (v: BlockTimeValues): Errors => {
  const e: Errors = {};
  if (!v.providerId) e.providerId = "Select a provider.";
  if (!v.location) e.location = "Select a location.";
  if (!v.date) e.date = "Date is required.";
  if (!v.startTime) e.startTime = "Start time is required.";
  if (!v.endTime) e.endTime = "End time is required.";
  else if (v.startTime && v.endTime <= v.startTime) e.endTime = "End time must be after start time.";
  if (!v.reason) e.reason = "Reason is required.";
  return e;
};

/* ---------------------------------------------------------------- */
/*  Component                                                        */
/* ---------------------------------------------------------------- */
type Props = {
  notify: Notify;
  onDone: () => void;
};

const BlockTime = ({ notify, onDone }: Props) => {
  const [values, setValues] = useState<BlockTimeValues>(initialValues());
  const [errors, setErrors] = useState<Errors>({});
  const [isSaving, setIsSaving] = useState(false);

  const patch = (p: Partial<BlockTimeValues>) => setValues((prev) => ({ ...prev, ...p }));

  const handleSave = async () => {
    if (isSaving) return;
    const errs = validate(values);
    setErrors(errs);
    if (Object.keys(errs).length) {
      document.getElementById(Object.keys(errs)[0])?.scrollIntoView({ behavior: "smooth", block: "center" });
      notify("error", "Validation Incomplete", "Please complete all required fields.");
      return;
    }

    setIsSaving(true);
    try {
      // TODO: call your API here
      console.log("Time blocked:", values);
      notify("success", "Time blocked", "The selected time has been blocked.");
      setTimeout(onDone, 800);
    } catch (error) {
      notify("error", "Could not block time", error instanceof Error ? error.message : "Something went wrong. Try again.");
      setIsSaving(false);
    }
  };

  return (
    <section className={`${cardCls} sm:p-6 -mt-4`}>
      <div className="grid gap-4 sm:grid-cols-2">
        <SignupDropdown
          name="providerId"
          label="Provider *"
          placeholder="Select provider"
          options={PROVIDER_OPTIONS}
          value={values.providerId}
          onChange={(v) => patch({ providerId: v })}
          error={errors.providerId}
        />
        <SignupDropdown
          name="location"
          label="Location *"
          placeholder="Select location"
          searchable={false}
          options={toOptions(LOCATIONS)}
          value={values.location}
          onChange={(v) => patch({ location: v })}
          error={errors.location}
        />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <DatePicker
          name="date"
          label={<>Date<Req /></>}
          value={values.date}
          onChange={(v) => patch({ date: v })}
          minDate={todayISO()}
          error={errors.date}
        />
        <TimeSelect
          name="startTime"
          label="Start Time *"
          value={values.startTime}
          onChange={(v) => patch({ startTime: v })}
          error={errors.startTime}
        />
        <TimeSelect
          name="endTime"
          label="End Time *"
          value={values.endTime}
          onChange={(v) => patch({ endTime: v })}
          error={errors.endTime}
        />
      </div>

      <div className="mt-4">
        <SignupDropdown
          name="reason"
          label="Reason *"
          placeholder="Select reason"
          searchable={false}
          options={toOptions(REASONS)}
          value={values.reason}
          onChange={(v) => patch({ reason: v })}
          error={errors.reason}
        />
      </div>

      <div className="mt-4">
        <TextArea
          name="notes"
          label={<>Notes<Opt /></>}
          placeholder="Add any notes"
          rows={2}
          maxLength={250}
          value={values.notes}
          onChange={(v) => patch({ notes: v })}
        />
      </div>

      <div className="mt-6 flex items-center justify-between gap-3">
        <ImportButton text="Cancel" icon={null} onClick={onDone} className="shrink-0 whitespace-nowrap px-5" />
        <AddButton
          text={isSaving ? "Saving…" : "Save"}
          icon={null}
          onClick={handleSave}
          disabled={isSaving}
          className="shrink-0 whitespace-nowrap px-5"
        />
      </div>
    </section>
  );
};

export default BlockTime;