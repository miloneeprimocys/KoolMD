"use client";

import React, { useState } from "react";
import { CalendarDays, Info } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppHooks";
import { hideModal } from "@/redux/slices/dialogslice";

import ModalShell, {
  FormGrid,
  FullRow,
  ModalCheckboxGroup,
  ModalDateField,
  ModalTextarea,
  OptLabel,
  ReqLabel,
  SignupDropdown,
  todayISO,
  toOptions,
} from "@/components/Modalshell";

/* ---------- Options ---------- */
const PROVIDERS = toOptions([
  "Dr. Sarah Wilson",
  "Dr. Michael Chen",
  "Dr. Emily Carter",
  "Dr. James Miller",
]);
const TIME_SLOTS = toOptions([
  "08:00 AM", "08:30 AM", "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM",
  "11:00 AM", "11:30 AM", "12:00 PM", "01:00 PM", "01:30 PM", "02:00 PM",
  "02:30 PM", "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM", "05:00 PM",
]);
const NOTIFY_OPTIONS = [
  { value: "email", label: "Email" },
  { value: "sms", label: "SMS" },
];

/* ---------- Types + sample data ---------- */
export type RequestInfo = {
  id: string;
  patient: string;
  patientId: string;
  age: number;
  gender: string;
  type: string; // "Initial Consultation"
  dept: string; // "Dermatology"
  provider: string; // preferred provider
  date: string; // ISO yyyy-mm-dd (preferred date)
  dateLabel: string; // "Oct 15, 2026"
  time: string; // "10:00 AM"
  reason: string;
  submittedOn: string; // "Oct 10, 2026, 02:14 PM"
};

export const SAMPLE_REQUEST: RequestInfo = {
  id: "REQ-11234",
  patient: "Ava Taylor",
  patientId: "PID-11234",
  age: 27,
  gender: "Female",
  type: "Initial Consultation",
  dept: "Dermatology",
  provider: "Dr. Emily Carter",
  date: "2026-10-15",
  dateLabel: "Oct 15, 2026",
  time: "10:00 AM",
  reason: "Skin concern and acne treatment consultation.",
  submittedOn: "Oct 10, 2026, 02:14 PM",
};

export type ApproveValues = {
  provider: string;
  date: string;
  time: string;
  notes: string;
  notify: string[];
};
type Errors = Partial<Record<"provider" | "date" | "time", string>>;

const seed = (r: RequestInfo): ApproveValues => ({
  provider: r.provider,
  date: r.date,
  time: r.time,
  notes: "",
  notify: ["email", "sms"],
});

/* ---------- Component ---------- */
const ApproveRequest = ({
  request = SAMPLE_REQUEST,
  onApprove,
}: {
  request?: RequestInfo | null;
  onApprove?: (id: string, values: ApproveValues) => void;
}) => {
  const dispatch = useAppDispatch();
  const open = useAppSelector((s) => s.dialog.ApproveRequest);
  const data = request ?? SAMPLE_REQUEST;

  const [values, setValues] = useState<ApproveValues>(seed(data));
  const [errors, setErrors] = useState<Errors>({});

  /* Re-seed whenever the modal opens for a different request */
  const seedKey = `${data.id}|${open}`;
  const [lastSeed, setLastSeed] = useState(seedKey);
  if (seedKey !== lastSeed) {
    setLastSeed(seedKey);
    setValues(seed(data));
    setErrors({});
  }

  const set = <K extends keyof ApproveValues>(key: K, val: ApproveValues[K]) => {
    setValues((p) => ({ ...p, [key]: val }));
    setErrors((p) => ({ ...p, [key]: undefined }));
  };

  const handleClose = () => {
    dispatch(hideModal("ApproveRequest"));
    setErrors({});
  };

  const handleSave = () => {
    const e: Errors = {};
    if (!values.provider) e.provider = "Please select a provider";
    if (!values.date) e.date = "Please select a date";
    else if (values.date < todayISO()) e.date = "Date cannot be in the past";
    if (!values.time) e.time = "Please select a time";
    setErrors(e);
    if (Object.keys(e).length) return;

    // TODO: call your API here
    console.log("Request approved:", data.id, values);
    onApprove?.(data.id, values);
    handleClose();
  };

  return (
    <ModalShell
      open={open}
      onClose={handleClose}
      onSubmit={handleSave}
      title="Approve Request"
      subtitle="Confirm the appointment details. This will create the appointment."
      submitText="Approve Request"
      width={640}
    >
      {/* Request summary */}
      <div className="flex items-center gap-3 rounded-xl border border-border bg-primary/5 px-4 py-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <CalendarDays className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-heading">
            {data.patient} ({data.patientId})
          </p>
          <p className="truncate text-xs text-body">
            {data.age} years • {data.gender} • {data.type} ({data.dept})
          </p>
          <p className="truncate text-xs text-body">
            Requested: {data.dateLabel}, {data.time} • Submitted {data.submittedOn}
          </p>
        </div>
      </div>

      <FormGrid>
        <SignupDropdown
          id="ar-provider"
          name="provider"
          label={<ReqLabel>Provider</ReqLabel>}
          placeholder="Select provider"
          searchable={false}
          options={PROVIDERS}
          value={values.provider}
          onChange={(v) => set("provider", v)}
          error={errors.provider}
        />
        <ModalDateField
          id="ar-date"
          label={<ReqLabel>Appointment Date</ReqLabel>}
          value={values.date}
          min={todayISO()}
          onChange={(v) => set("date", v)}
          error={errors.date}
        />

        <SignupDropdown
          id="ar-time"
          name="time"
          label={<ReqLabel>Appointment Time</ReqLabel>}
          placeholder="Select time"
          searchable={false}
          options={TIME_SLOTS}
          value={values.time}
          onChange={(v) => set("time", v)}
          error={errors.time}
        />
        <ModalCheckboxGroup
          label="Notify patient via"
          value={values.notify}
          onChange={(v) => set("notify", v)}
          options={NOTIFY_OPTIONS}
          className="flex h-10 items-center gap-6"
        />

        <FullRow>
          <ModalTextarea
            id="ar-notes"
            label={<OptLabel>Notes for the patient</OptLabel>}
            placeholder="Add any instructions (e.g. arrive 10 minutes early, bring reports)"
            value={values.notes}
            onChange={(v) => set("notes", v)}
          />
        </FullRow>

        <FullRow>
          <div className="flex items-start gap-2.5 rounded-xl bg-primary/5 px-4 py-3 text-xs text-body sm:text-sm">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span>
              Approving adds this appointment to the provider&apos;s schedule and notifies the patient.
            </span>
          </div>
        </FullRow>
      </FormGrid>
    </ModalShell>
  );
};

export default ApproveRequest;