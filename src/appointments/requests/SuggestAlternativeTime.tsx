"use client";

import React, { useState } from "react";
import { Info } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppHooks";
import { hideModal } from "@/redux/slices/dialogslice";
import { FieldError } from "@/components/SignupField";
import Calendar from "@/components/Calendar";

import ModalShell, {
  FullRow,
  FormGrid,
  ModalTextarea,
  OptLabel,
  ReqLabel,
  todayISO,
} from "@/components/Modalshell";
import { SAMPLE_REQUEST, type RequestInfo } from "./ApproveRequest";

const TIME_SLOTS = [
  "8:00 AM", "8:30 AM", "9:00 AM",
  "9:30 AM", "10:00 AM", "10:30 AM",
  "11:00 AM", "11:30 AM", "12:00 PM",
  "1:00 PM", "1:30 PM", "2:00 PM",
  "2:30 PM", "3:00 PM", "3:30 PM",
  "4:00 PM", "4:30 PM", "5:00 PM",
];

export type SuggestValues = {
  date: string;
  time: string;
  message: string;
};
type Errors = Partial<Record<"date" | "time", string>>;

/* ---------- Date helpers ---------- */
const pad = (n: number) => String(n).padStart(2, "0");
const toISODate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseISO = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
};
const longDate = (iso: string) =>
  parseISO(iso).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", year: "numeric" });

/* Compare "10:00 AM" vs "10:00 AM" ignoring zero padding */
const normTime = (t: string) => t.replace(/^0/, "");

/* ---------- Component ---------- */
const SuggestAlternativeTime = ({
  request = SAMPLE_REQUEST,
  onSend,
}: {
  request?: RequestInfo | null;
  onSend?: (id: string, values: SuggestValues) => void;
}) => {
  const dispatch = useAppDispatch();
  const open = useAppSelector((s) => s.dialog.SuggestAlternativeTime);
  const data = request ?? SAMPLE_REQUEST;

  const [values, setValues] = useState<SuggestValues>({ date: "", time: "", message: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [month, setMonth] = useState<Date>(() => parseISO(data.date));

  /* Reset whenever the modal opens for a different request */
  const seedKey = `${data.id}|${open}`;
  const [lastSeed, setLastSeed] = useState(seedKey);
  if (seedKey !== lastSeed) {
    setLastSeed(seedKey);
    setValues({ date: "", time: "", message: "" });
    setErrors({});
    setMonth(parseISO(data.date));
  }

  const set = <K extends keyof SuggestValues>(key: K, val: SuggestValues[K]) => {
    setValues((p) => ({ ...p, [key]: val }));
    setErrors((p) => ({ ...p, date: undefined, time: undefined }));
  };

  const handleClose = () => {
    dispatch(hideModal("SuggestAlternativeTime"));
    setErrors({});
  };

  const handleSave = () => {
    const e: Errors = {};
    if (!values.date) e.date = "Please select a date";
    else if (values.date < todayISO()) e.date = "Date cannot be in the past";
    if (!values.time) e.time = "Please select a time";
    if (
      values.date &&
      values.time &&
      values.date === data.date &&
      normTime(values.time) === normTime(data.time)
    ) {
      e.time = "Choose a different date or time than the one requested";
    }
    setErrors(e);
    if (Object.keys(e).length) return;

    // TODO: call your API here
    console.log("Alternative time suggested:", data.id, values);
    onSend?.(data.id, values);
    handleClose();
  };

  return (
    <ModalShell
      open={open}
      onClose={handleClose}
      onSubmit={handleSave}
      title="Suggest Alternative Time"
      subtitle="Offer the patient a different date and time for this request."
      submitText="Send Suggestion"
      width={760}
    >
      {/* Request summary */}
      <div className="rounded-xl border border-border bg-primary/5 px-4 py-3">
        <p className="text-sm font-semibold text-heading">
          {data.patient} ({data.patientId})
        </p>
        <p className="text-xs text-body">
          {data.type} ({data.dept}) with {data.provider}
        </p>
        <p className="mt-1 text-xs text-body">
          Requested: <span className="font-medium text-heading">{data.dateLabel}, {data.time}</span>
        </p>
      </div>

      <FormGrid>
        <FullRow>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Calendar */}
            <div>
              <p className="mb-2 text-sm font-medium text-label">
                <ReqLabel>Select Date</ReqLabel>
              </p>
              <Calendar
                compact
                showMonthNavigation
                month={month}
                onMonthChange={setMonth}
                selectedDate={values.date ? parseISO(values.date) : undefined}
                today={new Date()}
                onSelectDate={(d) => {
                  set("date", toISODate(d));
                  setMonth(d);
                }}
                className={`rounded-xl border bg-card p-3 ${errors.date ? "border-danger" : "border-border"}`}
              />
              <FieldError message={errors.date} />
            </div>

            {/* Time slots */}
            <div>
              <p className="mb-2 text-sm font-medium text-label">
                <ReqLabel>Select Time</ReqLabel>
              </p>
              <p className="mb-2 text-sm font-semibold text-heading">
                {values.date ? longDate(values.date) : "Select a date first"}
              </p>
              <div className="grid grid-cols-3 gap-2">
                {TIME_SLOTS.map((t) => {
                  const selected = values.time === t;
                  return (
                    <button
                      key={t}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => set("time", t)}
                      className={`cursor-pointer rounded-md border px-2 py-2 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${
                        selected
                          ? "border-primary bg-primary text-white"
                          : "border-border bg-card text-heading hover:border-primary/50 hover:text-primary"
                      }`}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
              <FieldError message={errors.time} />
            </div>
          </div>
        </FullRow>

        <FullRow>
          <ModalTextarea
            id="sa-message"
            label={<OptLabel>Message to patient</OptLabel>}
            placeholder="Explain why this time is suggested (e.g. the requested slot is unavailable)"
            value={values.message}
            onChange={(v) => setValues((p) => ({ ...p, message: v }))}
          />
        </FullRow>

        <FullRow>
          <div className="flex items-start gap-2.5 rounded-xl bg-primary/5 px-4 py-3 text-xs text-body sm:text-sm">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span>
              The patient will be notified by email and/or SMS and can accept or decline the new time.
            </span>
          </div>
        </FullRow>
      </FormGrid>
    </ModalShell>
  );
};

export default SuggestAlternativeTime;