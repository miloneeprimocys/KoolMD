"use client";

import React, { useEffect, useState } from "react";
import { ChevronDown, Info, Pencil, Plus, Trash2 } from "lucide-react";

import ImportButton from "@/components/ImportButton";
import AddButton from "@/components/Addbutton";
import Tags, { type TagTone } from "@/components/Tags";
import DeleteDialog from "@/components/Deletedialog";
import { iconBtn } from "@/components/Verticalsteps";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppHooks";
import {
  clearAvailabilityExceptionResult,
  showAddAvailabilityException,
} from "@/redux/slices/dialogslice";
import {
  ModalDateField,
  ModalTextarea,
  ReqLabel,
  SignupField,
  todayISO,
} from "@/components/Modalshell";
import { cardCls, type Errors } from "@/providers/Shared";
import {
  EXCEPTION_TYPES,
  newException,
  type AvailabilityException,
  type ExceptionType,
} from "./AddExceptionModal";

/* ---------------------------------------------------------------- */
/*  Static starting values (replace with the provider's saved list)  */
/* ---------------------------------------------------------------- */
export const initialExceptions = (): AvailabilityException[] => [
  { ...newException("holiday"), id: "exc-1", title: "Thanksgiving Holiday", mode: "range", startDate: "2026-11-26", endDate: "2026-11-27" },
  { ...newException("time-off"), id: "exc-2", title: "Annual Leave", mode: "range", startDate: "2026-12-21", endDate: "2026-12-25" },
  {
    ...newException("custom-hours"),
    id: "exc-3",
    title: "Reduced Hours",
    startDate: "2026-11-18",
    endDate: "2026-11-18",
    hours: [{ id: "h-1", start: "09:00", end: "12:00" }],
  },
  { ...newException("holiday"), id: "exc-4", title: "New Year's Day", startDate: "2027-01-01", endDate: "2027-01-01" },
];

/* ---------------------------------------------------------------- */
/*  Helpers                                                          */
/* ---------------------------------------------------------------- */
const TYPE_TONE: Record<ExceptionType, TagTone> = { holiday: "violet", "time-off": "warning", "custom-hours": "info" };

const dateLabel = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });

const dayCount = (start: string, end: string) =>
  Math.round((new Date(`${end}T00:00:00`).getTime() - new Date(`${start}T00:00:00`).getTime()) / 86_400_000) + 1;

const timeLabel = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return `${String(h % 12 === 0 ? 12 : h % 12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
};

const datesText = (e: AvailabilityException) => {
  const days = dayCount(e.startDate, e.endDate);
  const range = e.endDate !== e.startDate ? `${dateLabel(e.startDate)} – ${dateLabel(e.endDate)}` : dateLabel(e.startDate);
  // Custom hours show the available hours on a second line, so a single day needs no "(1 day)"
  return e.type === "custom-hours" && days === 1 ? range : `${range} (${days} day${days > 1 ? "s" : ""})`;
};

type InlineForm = { type: ExceptionType; title: string; startDate: string; endDate: string; notes: string };
const EMPTY_FORM: InlineForm = { type: "time-off", title: "", startDate: "", endDate: "", notes: "" };

/* ---------------------------------------------------------------- */
/*  Tab 2 – Exceptions & Time Off                                    */
/* ---------------------------------------------------------------- */
interface Props {
  exceptions: AvailabilityException[];
  onChange: (next: AvailabilityException[]) => void;
}

const AvailabilityExceptions = ({ exceptions, onChange }: Props) => {
  const dispatch = useAppDispatch();
  const availabilityExceptionResult = useAppSelector((state) => state.dialog.availabilityExceptionResult);
  const [deleting, setDeleting] = useState<AvailabilityException | null>(null);
  const [form, setForm] = useState<InlineForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<Errors>({});

  const patch = (p: Partial<InlineForm>) => {
    setForm((prev) => ({ ...prev, ...p }));
    setErrors((prev) => {
      const next = { ...prev };
      Object.keys(p).forEach((k) => delete next[k]);
      return next;
    });
  };

  const saveException = (exception: AvailabilityException) => {
    // TODO: call your API here
    const exists = exceptions.some((e) => e.id === exception.id);
    onChange(exists ? exceptions.map((e) => (e.id === exception.id ? exception : e)) : [...exceptions, exception]);
  };

  useEffect(() => {
    if (!availabilityExceptionResult) return;
    const { exception, resetInlineForm } = availabilityExceptionResult;
    const exists = exceptions.some((e) => e.id === exception.id);
    onChange(exists ? exceptions.map((e) => (e.id === exception.id ? exception : e)) : [...exceptions, exception]);
    if (resetInlineForm) {
      // Apply the global dialog result to the local inline form.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm((p) => ({ ...EMPTY_FORM, type: p.type }));
    }
    dispatch(clearAvailabilityExceptionResult());
  }, [availabilityExceptionResult, exceptions, onChange, dispatch]);

  const confirmDelete = () => {
    if (!deleting) return;
    // TODO: call your API here
    onChange(exceptions.filter((e) => e.id !== deleting.id));
    setDeleting(null);
  };

  /* Inline "Add Exception" form */
  const inlineDefaults = (): Partial<AvailabilityException> => ({
    type: form.type,
    title: form.title.trim(),
    mode: form.endDate && form.endDate !== form.startDate ? "range" : "single",
    startDate: form.startDate,
    endDate: form.endDate || form.startDate,
    notes: form.notes.trim(),
  });

  const submitInline = () => {
    const e: Errors = {};
    if (!form.title.trim()) e.title = "Title is required.";
    if (!form.startDate) e.startDate = "Start date is required.";
    if (form.endDate && form.startDate && form.endDate < form.startDate) e.endDate = "End date can't be before the start date.";
    setErrors(e);
    if (Object.keys(e).length) return;

    // Custom hours need working hours: continue in the modal with the values carried over
    if (form.type === "custom-hours") {
      dispatch(showAddAvailabilityException({ defaults: inlineDefaults(), resetInlineForm: true }));
      return;
    }

    saveException({ ...newException(form.type), ...inlineDefaults() } as AvailabilityException);
    setForm((p) => ({ ...EMPTY_FORM, type: p.type }));
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="grid items-start gap-4 sm:gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        {/* ---------- List ---------- */}
        <section className={`${cardCls} min-w-0 sm:p-5`}>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h3 className="text-base font-semibold text-heading">Exceptions &amp; Time Off</h3>
              <p className="text-xs text-body sm:text-sm">
                Add holidays, leaves or custom availability changes. These will override your weekly schedule.
              </p>
            </div>
            <div className="relative shrink-0">
              <ImportButton
                text="Add Exception"
                icon={<Plus className="h-4 w-4" />}
                onClick={() => dispatch(showAddAvailabilityException({}))}
                className="whitespace-nowrap"
              />
            </div>
          </div>

          {exceptions.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border px-4 py-10 text-center text-sm text-body">
              No exceptions added yet.
            </p>
          ) : (
            <ul className="max-h-[440px] space-y-3 overflow-y-auto pr-1 hide-scrollbar">
              {exceptions.map((e) => {
                const meta = EXCEPTION_TYPES.find((t) => t.key === e.type) ?? EXCEPTION_TYPES[0];
                return (
                  <li key={e.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-3 sm:flex-nowrap">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <meta.Icon className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1 basis-[180px]">
                      <p className="truncate text-sm font-semibold text-heading">{e.title}</p>
                      <p className="text-xs text-body">{datesText(e)}</p>
                      {e.type === "custom-hours" && e.hours.length > 0 && (
                        <p className="text-xs text-body">
                          Available: {e.hours.map((h) => `${timeLabel(h.start)} – ${timeLabel(h.end)}`).join(", ")}
                        </p>
                      )}
                    </div>
                    <Tags text={meta.label} tone={TYPE_TONE[e.type]} size="xs" />
                    <div className="flex shrink-0 items-center gap-1">
                      <button type="button" aria-label={`Edit ${e.title}`} onClick={() => dispatch(showAddAvailabilityException({ initial: e }))} className={`${iconBtn} text-primary hover:bg-primary/10`}>
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button type="button" aria-label={`Delete ${e.title}`} onClick={() => setDeleting(e)} className={`${iconBtn} text-danger hover:bg-danger/10`}>
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* ---------- Inline add form ---------- */}
        <section className={`${cardCls} min-w-0 space-y-4 sm:p-5`}>
          <h3 className="text-base font-semibold text-heading">Add Exception</h3>

          <div role="radiogroup" aria-label="Exception type">
            <p className="mb-2 text-sm font-medium text-label">
              <ReqLabel>Exception Type</ReqLabel>
            </p>
            <div className="grid grid-cols-3 gap-2">
              {EXCEPTION_TYPES.map(({ key, label, Icon }) => {
                const selected = form.type === key;
                return (
                  <button
                    key={key}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => patch({ type: key })}
                    className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border px-2 py-2.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${
                      selected ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-heading hover:border-primary/40 hover:bg-primary/5"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <SignupField
            name="inline_title"
            label={<ReqLabel>Title</ReqLabel>}
            placeholder={form.type === "holiday" ? "e.g. Thanksgiving Holiday" : form.type === "time-off" ? "e.g. Annual Leave" : "e.g. Extended Evening Hours"}
            value={form.title}
            onChange={(e) => patch({ title: e.target.value })}
            error={errors.title}
            maxLength={100}
            autoComplete="off"
          />

          <div>
            <p className="mb-2 text-sm font-medium text-label">
              <ReqLabel>Dates</ReqLabel>
            </p>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
              <ModalDateField id="inline_startDate" label="Start Date" value={form.startDate} min={todayISO()} onChange={(v) => patch({ startDate: v })} error={errors.startDate} />
              <ModalDateField id="inline_endDate" label="End Date (optional)" value={form.endDate} min={form.startDate || todayISO()} onChange={(v) => patch({ endDate: v })} error={errors.endDate} />
            </div>
          </div>

          <ModalTextarea
            id="inline_notes"
            label={<>Notes <span className="font-normal text-body">(Optional)</span></>}
            value={form.notes}
            onChange={(v) => patch({ notes: v })}
            placeholder={
              form.type === "holiday"
                ? "Add a note (e.g., clinic closed, national holiday, etc.)"
                : form.type === "time-off"
                  ? "Add a note (e.g., vacation, conference, etc.)"
                  : "Add a note (e.g., extended hours for a special clinic, event, etc.)"
            }
            maxLength={250}
          />

          <div className="flex justify-end gap-2 sm:gap-3">
            <ImportButton text="Cancel" icon={null} onClick={() => { setForm((p) => ({ ...EMPTY_FORM, type: p.type })); setErrors({}); }} />
            <AddButton
              text={form.type === "custom-hours" ? "Continue" : "Add Exception"}
              icon={form.type === "custom-hours" ? <ChevronDown className="-rotate-90 h-4 w-4" /> : null}
              onClick={submitInline}
              className="whitespace-nowrap"
            />
          </div>
          {form.type === "custom-hours" && (
            <p className="text-xs text-body">Custom hours need working hours, so you will set them in the next step.</p>
          )}
        </section>
      </div>

      {/* ---------- How it works ---------- */}
      <div className="flex items-start gap-3 rounded-xl bg-primary/5 dark:bg-primary/10 p-4">
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <div>
          <p className="text-sm font-semibold text-heading">How It Works</p>
          <p className="text-xs text-body sm:text-sm">Exceptions will override your regular weekly availability for the selected date(s).</p>
          <p className="text-xs text-body sm:text-sm">
            Use <strong className="font-semibold text-heading">Holiday</strong> for clinic closures,{" "}
            <strong className="font-semibold text-heading">Time Off</strong> for personal leave, or{" "}
            <strong className="font-semibold text-heading">Custom Hours</strong> to set different hours.
          </p>
        </div>
      </div>

      {/* ---------- Delete confirmation ---------- */}
      <DeleteDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
        title="Delete Exception?"
        description="Are you sure you want to delete this exception? Your weekly schedule will apply on these dates again."
        details={
          deleting
            ? [
                { label: "Title", value: deleting.title },
                { label: "Type", value: EXCEPTION_TYPES.find((t) => t.key === deleting.type)?.label ?? "" },
                { label: "Date(s)", value: datesText(deleting) },
              ]
            : []
        }
        confirmText="Delete Exception"
      />
    </div>
  );
};

export default AvailabilityExceptions;