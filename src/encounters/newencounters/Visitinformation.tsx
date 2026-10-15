"use client";

import React, { useState } from "react";

import SignupField from "@/components/SignupField";
import SignupDropdown, { DropdownOption } from "@/components/SignupDropdown";
import Name from "@/components/Name";
import DatePicker from "@/components/Datepicker";
import { StepHeader, TextAreaField, Req, checkboxCls, labelCls } from "@/components/Verticalsteps";

/* ---------- Static options ---------- */
const opts = (list: string[]): DropdownOption[] => list.map((v) => ({ value: v, label: v }));

const APPOINTMENTS = opts([
  "Oct 9, 2026 • 10:00 AM • Follow-up Visit",
  "Oct 23, 2026 • 10:00 AM • Follow-up Visit",
  "Nov 10, 2026 • 10:30 AM • Lab Review",
]);
const STATUSES = opts(["Scheduled", "In Progress", "Completed", "Cancelled"]);
const VISIT_TYPES = opts([
  "Follow-up Visit",
  "Initial Visit",
  "Lab Review",
  "Annual Checkup",
  "Consultation",
  "Allergy Consultation",
]);
const PRIORITIES = opts(["Routine", "Urgent", "Emergency"]);
const PROVIDERS: DropdownOption[] = [
  { value: "Dr. Sarah Lee", label: "Dr. Sarah Lee", subLabel: "Primary Care" },
  { value: "Dr. Emily Davis", label: "Dr. Emily Davis" },
  { value: "Dr. James Wilson", label: "Dr. James Wilson", subLabel: "Allergy & Immunology" },
  { value: "Dr. Michael Brown", label: "Dr. Michael Brown" },
];
const TIMES: DropdownOption[] = Array.from({ length: 48 }, (_, i) => {
  const h = Math.floor(i / 2);
  const m = i % 2 ? "30" : "00";
  const label = `${String(h % 12 === 0 ? 12 : h % 12).padStart(2, "0")}:${m} ${h < 12 ? "AM" : "PM"}`;
  return { value: label, label };
});
const MODES = ["In Clinic", "Telemedicine", "Phone", "Other"];
const PARTICIPANTS = ["Patient", "Caregiver / Family Member", "Interpreter"];

/* ---------- Component ---------- */
const VisitInformation = () => {
  const [appointment, setAppointment] = useState("");
  const [status, setStatus] = useState("In Progress");
  const [visitType, setVisitType] = useState("Follow-up Visit");
  const [priority, setPriority] = useState("Routine");
  const [date, setDate] = useState("2026-10-09");
  const [time, setTime] = useState("10:00 AM");
  const [room, setRoom] = useState("Room 3");
  const [mode, setMode] = useState("In Clinic");
  const [provider, setProvider] = useState("Dr. Sarah Lee");
  const [reason, setReason] = useState(
    "Follow-up for seasonal allergies and review of current medication.",
  );
  const [participants, setParticipants] = useState<string[]>(["Patient"]);

  const toggleParticipant = (name: string) =>
    setParticipants((prev) => (prev.includes(name) ? prev.filter((p) => p !== name) : [...prev, name]));

  return (
    <div className="min-w-0">
      <StepHeader title="Visit Information" subtitle="Enter the basic details for this encounter." />

      <div className="grid min-w-0 gap-x-6 gap-y-4 md:grid-cols-2 [&>*]:min-w-0">
        <SignupDropdown
          name="appointment"
          label="Appointment (Optional)"
          placeholder="Select appointment"
          options={APPOINTMENTS}
          value={appointment}
          onChange={setAppointment}
        />
        <SignupDropdown
          name="encounterStatus"
          label="Encounter Status *"
          placeholder="Select status"
          options={STATUSES}
          value={status}
          onChange={setStatus}
        />

        <SignupDropdown
          name="visitType"
          label="Visit Type *"
          placeholder="Select visit type"
          options={VISIT_TYPES}
          value={visitType}
          onChange={setVisitType}
        />
        <SignupDropdown
          name="visitPriority"
          label="Visit Priority"
          placeholder="Select priority"
          options={PRIORITIES}
          value={priority}
          onChange={setPriority}
        />

        {/* Date & time */}
        <div className="grid min-w-0 grid-cols-1 gap-3 min-[420px]:grid-cols-2 [&>*]:min-w-0">
          <DatePicker
            name="visitDate"
            label={<>Date &amp; Time<Req /></>}
            placeholder="Select date"
            value={date}
            onChange={setDate}
          />
          <SignupDropdown
            name="visitTime"
            label={"\u00A0"}
            placeholder="Select time"
            options={TIMES}
            value={time}
            onChange={setTime}
          />
        </div>
        <SignupField
          name="examRoom"
          label="Exam Room"
          placeholder="Enter exam room"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
        />

        {/* Location / mode */}
        <div>
          <label className={labelCls}>
            Location / Mode<Req />
          </label>
          <div role="radiogroup" aria-label="Location / Mode" className="flex flex-wrap gap-2">
            {MODES.map((m) => {
              const on = mode === m;
              return (
                <button
                  key={m}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => setMode(m)}
                  className={`h-10 cursor-pointer rounded-lg border px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${
                    on
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-card text-heading hover:border-primary/40"
                  }`}
                >
                  {m}
                </button>
              );
            })}
          </div>
        </div>

        {/* Participants */}
        <div className="md:row-span-2">
          <p className={labelCls}>Visit Participants</p>
          <div className="space-y-3">
            {PARTICIPANTS.map((p) => (
              <label key={p} className="flex cursor-pointer items-center gap-3 text-sm text-heading">
                <input
                  type="checkbox"
                  checked={participants.includes(p)}
                  onChange={() => toggleParticipant(p)}
                  className={checkboxCls}
                />
                {p}
              </label>
            ))}
          </div>
        </div>

        <SignupDropdown
          name="visitProvider"
          label="Provider *"
          placeholder="Select provider"
          options={PROVIDERS}
          value={provider}
          onChange={setProvider}
          searchable={false}
          renderSelected={(option) => (
            <Name
              name={option.label}
              sub={option.subLabel}
              image={option.image}
              truncate
            />
          )}
          renderOption={(option) => (
            <Name
              name={option.label}
              sub={option.subLabel}
              image={option.image}
              truncate
            />
          )}
        />

        <div className="md:col-span-2">
          <TextAreaField
            label="Reason for Visit"
            required
            placeholder="Describe the reason for this visit"
            rows={4}
            value={reason}
            onChange={setReason}
          />
        </div>
      </div>
    </div>
  );
};

export default VisitInformation;