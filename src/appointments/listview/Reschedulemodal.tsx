"use client";

import React, { useState } from "react";
import { Info, Video } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppHooks";
import { hideModal } from "@/redux/slices/dialogslice";
import { FieldError } from "@/components/SignupField";
import Calendar from "@/components/Calendar";

import ModalShell, {
  FormGrid,
  FullRow,
  ModalTextarea,
  OptLabel,
  ReqLabel,
  SignupDropdown,
  SignupField,
  todayISO,
  toOptions,
} from "@/components/Modalshell";
import { FaVideo } from "react-icons/fa";

/* ---------- Options ---------- */
const PROVIDERS = toOptions([
  "Dr. Emily Carter (Internal Medicine)",
  "Dr. James Miller (Cardiology)",
  "Dr. Sarah Lee (Dermatology)",
  "Dr. Michael Chen (Family Medicine)",
]);
const TYPES = toOptions(["Video Consultation", "In-person Visit", "Follow Up", "Initial Consultation"]);
const DURATIONS = toOptions(["15 minutes", "30 minutes", "45 minutes", "60 minutes"]);
const TIME_SLOTS = [
  "8:00 AM", "8:30 AM", "9:00 AM",
  "9:30 AM", "10:00 AM", "10:30 AM",
  "11:00 AM", "11:30 AM", "12:00 PM",
  "1:00 PM", "1:30 PM", "2:00 PM",
  "2:30 PM", "3:00 PM", "3:30 PM",
  "4:00 PM", "4:30 PM", "5:00 PM",
];

const PROFILE = {
  name: "John Smith",
  id: "PT-1008",
  gender: "Male",
  age: 35,
  dob: "12 Mar 1999",
  appointmentType: "Video Consultation",
  duration: "30 minutes",
};

/* ---------- Types ---------- */
export type RescheduleAppointment = {
  patientName: string;
  patientId: string;
  gender: string;
  age: number;
  dob?: string;
  provider: string; // e.g. "Dr. Emily Carter (Internal Medicine)"
  type: string; // e.g. "Video Consultation"
  reason: string;
  duration: string; // e.g. "30 minutes"
  date: string; // ISO yyyy-mm-dd
  time: string; // e.g. "9:30 AM"
};

export type RescheduleValues = {
  provider: string;
  type: string;
  reason: string;
  duration: string;
  date: string;
  time: string;
  notes: string;
};
type Errors = Partial<Record<keyof RescheduleValues, string>>;

const fromAppointment = (a?: RescheduleAppointment | null): RescheduleValues => ({
  provider: a?.provider ?? "",
  type: a?.type ?? "",
  reason: a?.reason ?? "",
  duration: a?.duration ?? "",
  date: a?.date ?? "",
  time: a?.time ?? "",
  notes: "",
});

/* ---------- Date helpers ---------- */
const pad = (n: number) => String(n).padStart(2, "0");
const toISODate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseISO = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
};
const longDate = (iso: string) =>
  parseISO(iso).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", year: "numeric" });

/* ---------- Component ---------- */
const RescheduleModal = ({
  appointment,
  onSave,
}: {
  appointment?: RescheduleAppointment | null;
  onSave?: (values: RescheduleValues) => void;
}) => {
  const dispatch = useAppDispatch();
  const open = useAppSelector((s) => s.dialog.RescheduleAppointment);

  const [values, setValues] = useState<RescheduleValues>(fromAppointment(appointment));
  const [errors, setErrors] = useState<Errors>({});
  const [month, setMonth] = useState<Date>(() =>
    appointment?.date ? parseISO(appointment.date) : new Date(),
  );

  /* Re-seed the form whenever a different appointment is opened */
  const seedKey = `${appointment?.patientId ?? ""}|${appointment?.date ?? ""}|${appointment?.time ?? ""}|${open}`;
  const [lastSeed, setLastSeed] = useState(seedKey);
  if (seedKey !== lastSeed) {
    setLastSeed(seedKey);
    setValues(fromAppointment(appointment));
    setErrors({});
    setMonth(appointment?.date ? parseISO(appointment.date) : new Date());
  }

  const set = <K extends keyof RescheduleValues>(key: K, val: RescheduleValues[K]) => {
    setValues((p) => ({ ...p, [key]: val }));
    setErrors((p) => ({ ...p, [key]: undefined }));
  };

  const handleClose = () => {
    dispatch(hideModal("RescheduleAppointment"));
    setErrors({});
  };

  const handleSave = () => {
    const e: Errors = {};
    if (!values.provider) e.provider = "Please select a provider";
    if (!values.type) e.type = "Please select an appointment type";
    if (!values.reason.trim()) e.reason = "Reason for visit is required";
    if (!values.duration) e.duration = "Please select a duration";
    if (!values.date) e.date = "Please select a date";
    else if (values.date < todayISO()) e.date = "Date cannot be in the past";
    if (!values.time) e.time = "Please select a time";
    setErrors(e);
    if (Object.keys(e).length) return;

    // TODO: call your API here
    console.log("Appointment rescheduled:", values);
    onSave?.(values);
    handleClose();
  };

  const handleSelectDate = (date: Date) => {
    set("date", toISODate(date));
    setMonth(date);
  };

  return (
    <ModalShell
      open={open}
      onClose={handleClose}
      onSubmit={handleSave}
      title="Reschedule Appointment"
      subtitle="Select a new date and time for this appointment."
      submitText="Reschedule Appointment"
      width={760}
    >
      {/* Static patient profile summary */}
      <div className="mb-4 flex min-h-[76px] items-center justify-between gap-3 rounded-lg border border-border bg-primary/[0.04] px-3 py-2.5 sm:px-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-primary/10 bg-surface-end text-sm font-semibold text-primary sm:h-13 sm:w-13">
              {PROFILE.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm sm:text-md font-semibold text-heading mb-0.5">
                {PROFILE.name} ({PROFILE.id})
              </p>
              <p className="truncate text-xs sm:text-[13px] text-body">
                {PROFILE.gender} <span className="px-1">•</span> {PROFILE.age} years
                <span className="px-1">•</span> DOB: {PROFILE.dob}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-violet/15 dark:bg-violet/20 text-violet">
              <FaVideo className="h-4 w-4" />
            </span>
            <div className="hidden text-left sm:block">
              <p className="text-sm font-semibold text-heading">{PROFILE.appointmentType}</p>
              <p className="text-xs text-body">{PROFILE.duration}</p>
            </div>
          </div>
      </div>

      <FormGrid>
        <SignupDropdown
          id="rs-provider"
          name="provider"
          label={<ReqLabel>Provider</ReqLabel>}
          placeholder="Select provider"
          searchable={false}
          options={PROVIDERS}
          value={values.provider}
          onChange={(v) => set("provider", v)}
          error={errors.provider}
        />
        <SignupDropdown
          id="rs-type"
          name="type"
          label={<ReqLabel>Appointment Type</ReqLabel>}
          placeholder="Select type"
          searchable={false}
          options={TYPES}
          value={values.type}
          onChange={(v) => set("type", v)}
          error={errors.type}
        />
        <SignupField
          name="reason"
          label={<ReqLabel>Reason for Visit</ReqLabel>}
          placeholder="Enter reason for visit"
          value={values.reason}
          onChange={(e) => set("reason", e.target.value)}
          error={errors.reason}
        />
        <SignupDropdown
          id="rs-duration"
          name="duration"
          label={<ReqLabel>Duration</ReqLabel>}
          placeholder="Select duration"
          searchable={false}
          options={DURATIONS}
          value={values.duration}
          onChange={(v) => set("duration", v)}
          error={errors.duration}
        />

        {/* Date picker + time slots */}
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
                onSelectDate={handleSelectDate}
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
            id="rs-notes"
            label={<OptLabel>Additional Notes</OptLabel>}
            placeholder="Add any notes for this rescheduled appointment..."
            value={values.notes}
            onChange={(v) => set("notes", v)}
          />
        </FullRow>

        <FullRow>
          <div className="flex items-start gap-2.5 rounded-xl bg-primary/5 px-4 py-3 text-xs text-body sm:text-sm">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span>The patient will be notified about the rescheduled appointment via email and/or SMS.</span>
          </div>
        </FullRow>
      </FormGrid>
    </ModalShell>
  );
};

export default RescheduleModal;
