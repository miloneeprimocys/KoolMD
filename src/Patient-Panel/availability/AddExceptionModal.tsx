"use client";

import React, { useState } from "react";
import { Briefcase, Calendar, CalendarPlus, Check, Clock, Plus, Trash2, type LucideIcon } from "lucide-react";

import ImportButton from "@/components/ImportButton";
import TogglableSwitch from "@/components/Togglableswitch";
import { FieldError } from "@/components/SignupField";
import ModalShell, {
  FormGrid,
  FullRow,
  ModalDateField,
  ModalRadioGroup,
  ModalTextarea,
  ReqLabel,
  SignupDropdown,
  SignupField,
  todayISO,
} from "@/components/Modalshell";
import { uid, type Errors } from "@/providers/Shared";

/* ---------------------------------------------------------------- */
/*  Types (also used by AvailabilityExceptions and ConfigureAvailability) */
/* ---------------------------------------------------------------- */
export type ExceptionType = "holiday" | "time-off" | "custom-hours";

export type TimeRange = { id: string; start: string; end: string };

export interface AvailabilityException {
  id: string;
  type: ExceptionType;
  title: string;
  mode: "single" | "range";
  /** ISO dates. For a single day `endDate === startDate`. */
  startDate: string;
  endDate: string;
  notes: string;
  /** Custom hours only. */
  hours: TimeRange[];
  breakEnabled: boolean;
  breakStart: string;
  breakEnd: string;
}

export const EXCEPTION_TYPES: { key: ExceptionType; label: string; hint: string; Icon: LucideIcon; detailsTitle: string; submitText: string }[] = [
  { key: "holiday", label: "Holiday", hint: "Clinic closure or public holiday", Icon: Calendar, detailsTitle: "Holiday Details", submitText: "Add Holiday" },
  { key: "time-off", label: "Time Off", hint: "Leave, vacation or personal time", Icon: Briefcase, detailsTitle: "Time Off Details", submitText: "Add Time Off" },
  { key: "custom-hours", label: "Custom Hours", hint: "Set different working hours for a specific date", Icon: Clock, detailsTitle: "Custom Hours Details", submitText: "Add Custom Hours" },
];

export const newException = (type: ExceptionType = "holiday"): AvailabilityException => ({
  id: uid(),
  type,
  title: "",
  mode: "single",
  startDate: "",
  endDate: "",
  notes: "",
  hours: [{ id: uid(), start: "09:00", end: "12:00" }],
  breakEnabled: false,
  breakStart: "13:00",
  breakEnd: "13:30",
});

/* ---------------------------------------------------------------- */
/*  Helpers                                                          */
/* ---------------------------------------------------------------- */
const pad = (n: number) => String(n).padStart(2, "0");

/** Every 15 minutes: value "HH:MM", label "hh:mm AM". */
const TIME_OPTIONS = Array.from({ length: 96 }, (_, i) => {
  const minutes = i * 15;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return { value: `${pad(h)}:${pad(m)}`, label: `${pad(hour12)}:${pad(m)} ${h < 12 ? "AM" : "PM"}` };
});

const toMinutes = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

const dayCount = (start: string, end: string) =>
  Math.round((new Date(`${end}T00:00:00`).getTime() - new Date(`${start}T00:00:00`).getTime()) / 86_400_000) + 1;

const MODE_OPTIONS = [
  { value: "single", label: "Single Day" },
  { value: "range", label: "Date Range" },
];

/* ---------------------------------------------------------------- */
/*  Modal                                                            */
/*  Render it only while it is open (the form state starts fresh).   */
/* ---------------------------------------------------------------- */
type Props = {
  onClose: () => void;
  onSave: (exception: AvailabilityException) => void;
  /** Editing an existing exception. */
  initial?: AvailabilityException | null;
  /** New exception: preselected type / values carried over from the inline form. */
  defaults?: Partial<AvailabilityException>;
};

const AddExceptionModal = ({ onClose, onSave, initial = null, defaults }: Props) => {
  const isEdit = initial !== null;
  const [form, setForm] = useState<AvailabilityException>(() => initial ?? { ...newException(defaults?.type ?? "holiday"), ...defaults });
  const [errors, setErrors] = useState<Errors>({});

  const meta = EXCEPTION_TYPES.find((t) => t.key === form.type) ?? EXCEPTION_TYPES[0];
  const isRange = form.mode === "range";
  const effectiveEnd = isRange ? form.endDate : form.startDate;
  const duration = form.startDate && effectiveEnd && effectiveEnd >= form.startDate ? dayCount(form.startDate, effectiveEnd) : 0;
  const minDate = isEdit ? undefined : todayISO();

  const set = (patch: Partial<AvailabilityException>) => {
    setForm((p) => ({ ...p, ...patch }));
    // Clear the errors of the touched fields.
    setErrors((p) => {
      const next = { ...p };
      for (const key of Object.keys(patch)) {
        delete next[key];
        if (key === "hours") Object.keys(next).filter((k) => k.startsWith("hours")).forEach((k) => delete next[k]);
        if (key.startsWith("break")) delete next.break;
      }
      delete next.form;
      return next;
    });
  };

  const changeSlot = (id: string, patch: Partial<TimeRange>) => set({ hours: form.hours.map((h) => (h.id === id ? { ...h, ...patch } : h)) });

  const addSlot = () => {
    const last = form.hours[form.hours.length - 1];
    const start = last ? Math.min(toMinutes(last.end) + 60, 22 * 60) : 9 * 60;
    const end = Math.min(start + 180, 23 * 60 + 45);
    const fmt = (m: number) => `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;
    set({ hours: [...form.hours, { id: uid(), start: fmt(start), end: fmt(end) }] });
  };

  /* ---------- Validation ---------- */
  const validate = (): Errors => {
    const e: Errors = {};
    if (!form.title.trim()) e.title = "Title is required.";
    if (!form.startDate) e.startDate = "Start date is required.";
    if (isRange) {
      if (!form.endDate) e.endDate = "End date is required.";
      else if (form.startDate && form.endDate < form.startDate) e.endDate = "End date can't be before the start date.";
    }

    if (form.type === "custom-hours") {
      if (form.hours.length === 0) e.hours = "Add at least one time slot.";
      const sorted = [...form.hours].sort((a, b) => toMinutes(a.start) - toMinutes(b.start));
      sorted.forEach((slot, i) => {
        if (toMinutes(slot.end) <= toMinutes(slot.start)) e[`hours_${slot.id}`] = "End time must be after the start time.";
        else if (i > 0 && toMinutes(slot.start) < toMinutes(sorted[i - 1].end)) e[`hours_${slot.id}`] = "Time slots can't overlap.";
      });

      if (form.breakEnabled && form.hours.length > 0) {
        const breakStart = toMinutes(form.breakStart);
        const breakEnd = toMinutes(form.breakEnd);
        const workStart = Math.min(...form.hours.map((h) => toMinutes(h.start)));
        const workEnd = Math.max(...form.hours.map((h) => toMinutes(h.end)));
        if (breakEnd <= breakStart) e.break = "Break end must be after the break start.";
        else if (breakStart < workStart || breakEnd > workEnd) e.break = "The break must fall within your working hours.";
      }
    }
    return e;
  };

  const submit = () => {
    const found = validate();
    setErrors(found.title || found.startDate || found.endDate || found.hours || Object.keys(found).length ? { ...found, form: "Please fix the highlighted fields." } : {});
    if (Object.keys(found).length > 0) return;

    // TODO: dispatch(saveAvailabilityException(...))
    onSave({
      ...form,
      title: form.title.trim(),
      notes: form.notes.trim(),
      endDate: isRange ? form.endDate : form.startDate,
      hours: form.type === "custom-hours" ? form.hours : [],
      breakEnabled: form.type === "custom-hours" ? form.breakEnabled : false,
    });
  };

  const breakMinutes = form.breakEnabled ? Math.max(0, toMinutes(form.breakEnd) - toMinutes(form.breakStart)) : 0;

  return (
    <ModalShell
      open
      onClose={onClose}
      onSubmit={submit}
      titleId="add-exception-title"
      width={720}
      title={
        <span className="flex items-start gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <CalendarPlus className="h-6 w-6" />
          </span>
          <span className="block min-w-0">
            <span className="block">{isEdit ? "Edit Exception" : "Add Exception"}</span>
            <span className="mt-0.5 block text-sm font-normal text-body">Set a holiday, time off or custom working hours for specific date(s).</span>
          </span>
        </span>
      }
      submitText={isEdit ? "Save Changes" : meta.submitText}
      errorMessage={errors.form}
    >
      {/* Exception type */}
      <div role="radiogroup" aria-label="Exception type">
        <p className="mb-2 text-sm font-medium text-label">
          <ReqLabel>Exception Type</ReqLabel>
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          {EXCEPTION_TYPES.map(({ key, label, hint, Icon }) => {
            const selected = form.type === key;
            return (
              <button
                key={key}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => set({ type: key })}
                className={`relative flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${
                  selected ? "border-primary bg-primary/10" : "border-border bg-card hover:border-primary/40 hover:bg-primary/5"
                }`}
              >
                <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <span className="min-w-0 pr-5">
                  <span className="block text-sm font-semibold text-heading">{label}</span>
                  <span className="block text-xs text-body">{hint}</span>
                </span>
                {selected && (
                  <span className="absolute right-2.5 top-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-on-primary">
                    <Check className="h-3 w-3" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Details */}
      <div className="rounded-lg bg-primary/10 px-3 py-1.5 text-sm font-semibold text-heading">{meta.detailsTitle}</div>

      <FormGrid>
        <FullRow>
          <SignupField
            name="exc_title"
            label={<ReqLabel>Title</ReqLabel>}
            placeholder={form.type === "holiday" ? "e.g. Thanksgiving Holiday" : form.type === "time-off" ? "e.g. Annual Leave" : "e.g. Extended Evening Hours"}
            value={form.title}
            onChange={(e) => set({ title: e.target.value })}
            error={errors.title}
            maxLength={100}
            autoComplete="off"
          />
        </FullRow>

        <FullRow>
          <ModalRadioGroup
            name="exc_mode"
            label=""
            value={form.mode}
            onChange={(v) => set({ mode: v as AvailabilityException["mode"], endDate: v === "single" ? "" : form.endDate })}
            options={MODE_OPTIONS}
          />
        </FullRow>

        <FullRow>
          <div className={`grid gap-x-4 gap-y-3 ${isRange ? "sm:grid-cols-[1fr_1fr_auto]" : "sm:grid-cols-[1fr_auto]"}`}>
            <ModalDateField
              id="exc_startDate"
              label={<ReqLabel>{isRange ? "Start Date" : "Date"}</ReqLabel>}
              value={form.startDate}
              onChange={(v) => set({ startDate: v })}
              error={errors.startDate}
              min={minDate}
            />
            {isRange && (
              <ModalDateField
                id="exc_endDate"
                label={<ReqLabel>End Date</ReqLabel>}
                value={form.endDate}
                onChange={(v) => set({ endDate: v })}
                error={errors.endDate}
                min={form.startDate || minDate}
              />
            )}
            <div className="flex items-center gap-3 self-start rounded-xl bg-primary/10 px-4 py-1.5 sm:mt-7">
              <Calendar className="h-6 w-6 shrink-0 text-primary" />
              <div>
                <p className="text-xs text-body">Duration</p>
                <p className="text-[13px] font-medium text-heading">{duration > 0 ? `${duration} day${duration > 1 ? "s" : ""}` : "—"}</p>
              </div>
            </div>
          </div>
        </FullRow>

        {/* Custom hours */}
        {form.type === "custom-hours" && (
          <>
            <FullRow>
              <div>
                <p className="text-sm font-medium text-label">
                  <ReqLabel>Working Hours</ReqLabel>
                </p>
                <p className="mb-2 text-xs text-body">Set the available hours for the selected date(s).</p>
                <div className="space-y-3">
                  {form.hours.map((slot, index) => (
                    <div key={slot.id}>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <div className="w-36">
                          <SignupDropdown
                            name={`exc_hours_${slot.id}_start`}
                            placeholder="From"
                            options={TIME_OPTIONS}
                            value={slot.start}
                            onChange={(v) => changeSlot(slot.id, { start: v })}
                            icon={<Clock className="h-4 w-4" />}
                            searchable={false}
                            error={errors[`hours_${slot.id}`] ? " " : undefined}
                            portalMenu
                            portalMenuZIndex={1000}
                          />
                        </div>
                        <span className="text-body">–</span>
                        <div className="w-36">
                          <SignupDropdown
                            name={`exc_hours_${slot.id}_end`}
                            placeholder="To"
                            options={TIME_OPTIONS}
                            value={slot.end}
                            onChange={(v) => changeSlot(slot.id, { end: v })}
                            searchable={false}
                            error={errors[`hours_${slot.id}`] ? " " : undefined}
                            portalMenu
                            portalMenuZIndex={1000}
                          />
                        </div>
                        {index === form.hours.length - 1 && form.hours.length < 3 && (
                          <ImportButton text="Add Time Slot" icon={<Plus className="h-4 w-4" />} onClick={addSlot} className="whitespace-nowrap" />
                        )}
                        {form.hours.length > 1 && (
                          <button
                            type="button"
                            aria-label="Remove time slot"
                            onClick={() => set({ hours: form.hours.filter((h) => h.id !== slot.id) })}
                            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-danger transition-colors hover:bg-danger/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      <FieldError message={errors[`hours_${slot.id}`]} />
                    </div>
                  ))}
                </div>
                <FieldError message={errors.hours} />
              </div>
            </FullRow>

            <FullRow>
              <div>
                <p className="mb-2 text-sm font-medium text-label">
                  Break Time <span className="font-normal text-body">(Optional)</span>
                </p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
                  <TogglableSwitch
                    size="sm"
                    checked={form.breakEnabled}
                    onChange={(checked) => set({ breakEnabled: checked })}
                    label="Add a break during working hours"
                  />
                  {form.breakEnabled && (
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      <div className="w-36">
                        <SignupDropdown
                          name="exc_break_start"
                          placeholder="From"
                          options={TIME_OPTIONS}
                          value={form.breakStart}
                          onChange={(v) => set({ breakStart: v })}
                          icon={<Clock className="h-4 w-4" />}
                          searchable={false}
                          portalMenu
                          portalMenuZIndex={1000}
                        />
                      </div>
                      <span className="text-body">–</span>
                      <div className="w-36">
                        <SignupDropdown
                          name="exc_break_end"
                          placeholder="To"
                          options={TIME_OPTIONS}
                          value={form.breakEnd}
                          onChange={(v) => set({ breakEnd: v })}
                          searchable={false}
                          portalMenu
                          portalMenuZIndex={1000}
                        />
                      </div>
                      <span className="text-xs text-body">({breakMinutes} minutes)</span>
                      <button
                        type="button"
                        aria-label="Remove break"
                        onClick={() => set({ breakEnabled: false })}
                        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-danger transition-colors hover:bg-danger/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
                <FieldError message={errors.break} />
              </div>
            </FullRow>
          </>
        )}

        <FullRow>
          <ModalTextarea
            id="exc_notes"
            label={
              <>
                Notes <span className="font-normal text-body">(Optional)</span>
              </>
            }
            value={form.notes}
            onChange={(v) => set({ notes: v })}
            placeholder={
              form.type === "holiday"
                ? "Add a note (e.g., clinic closed, national holiday, etc.)"
                : form.type === "time-off"
                  ? "Add a note (e.g., vacation, conference, etc.)"
                  : "Add a note (e.g., extended hours for a special clinic, event, etc.)"
            }
            maxLength={250}
          />
        </FullRow>
      </FormGrid>
    </ModalShell>
  );
};

export default AddExceptionModal;