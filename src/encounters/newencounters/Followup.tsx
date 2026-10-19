"use client";

import RadioCheckButtonh from "@/components/RadioCheckButtonh";
import React, { useState } from "react";

import SignupDropdown, { DropdownOption } from "@/components/SignupDropdown";
import InputActions from "@/components/InputActions";
import DatePicker from "@/components/Datepicker";
import TogglableSwitch from "@/components/Togglableswitch";
import {
  Req,
  StepHeader,
  TextAreaField,
  checkboxCls,
  labelCls,
} from "@/components/Verticalsteps";

/* ---------- Static options ---------- */
const opts = (list: string[]): DropdownOption[] => list.map((v) => ({ value: v, label: v }));

const TYPES = opts(["In-Person Visit", "Telemedicine", "Phone Call"]);
const PRIORITIES = opts(["Routine", "Urgent", "Emergency"]);
const PROVIDERS = opts(["Dr. Sarah Lee", "Dr. Emily Davis", "Dr. James Wilson", "Dr. Michael Brown"]);
const TIMES: DropdownOption[] = Array.from({ length: 48 }, (_, i) => {
  const h = Math.floor(i / 2);
  const m = i % 2 ? "30" : "00";
  const label = `${String(h % 12 === 0 ? 12 : h % 12).padStart(2, "0")}:${m} ${h < 12 ? "AM" : "PM"}`;
  return { value: label, label };
});

const ACTIONS = [
  { id: "reminder", label: "Send appointment reminder to patient" },
  { id: "portal", label: "Include follow-up instructions in patient portal" },
  { id: "labs", label: "Request lab results before next visit" },
  { id: "summary", label: "Generate care plan summary" },
];

/* ---------- Component ---------- */
const FollowUp = () => {
  const [needed, setNeeded] = useState(true);
  const [type, setType] = useState("In-Person Visit");
  const [priority, setPriority] = useState("Routine");
  const [date, setDate] = useState("2026-10-23");
  const [time, setTime] = useState("10:00 AM");
  const [provider, setProvider] = useState("Dr. Sarah Lee");
  const [reason, setReason] = useState("Re-evaluate symptoms and review lab results.");
  const [instructions, setInstructions] = useState(
    "• Continue prescribed medication as directed.\n• Monitor symptoms and return earlier if worsening.\n• Bring any updated test results to the next visit.\n• Contact the clinic if you experience persistent fever, breathing difficulty or new symptoms.",
  );
  const [checked, setChecked] = useState<string[]>(["reminder", "summary"]);

  const toggle = (id: string) =>
    setChecked((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));

  return (
    <div className="min-w-0">
      <StepHeader
        title="Follow-up"
        subtitle="Set follow-up instructions, next appointment and patient education."
      />

      <div className="space-y-5">
        {/* Row 1 */}
        <div className="grid min-w-0 gap-x-6 gap-y-4 md:grid-cols-3 [&>*]:min-w-0">
          <div>
            <p className={labelCls}>Follow-up Needed</p>
            <div className="flex h-12 items-center gap-3">
              <TogglableSwitch
                checked={needed}
                onChange={setNeeded}
                ariaLabel="Follow-up needed"
                className="inline-flex"
              />
              <span className="text-sm text-heading">{needed ? "Yes" : "No"}</span>
            </div>
          </div>
          <SignupDropdown
            name="followUpType"
            label="Follow-up Type"
            placeholder="Select type"
            options={TYPES}
            value={type}
            onChange={setType}
          />
          <SignupDropdown
            name="followUpPriority"
            label="Priority"
            placeholder="Select priority"
            options={PRIORITIES}
            value={priority}
            onChange={setPriority}
          />
        </div>

        {/* Row 2 */}
        <div className="grid min-w-0 gap-x-6 gap-y-4 md:grid-cols-3 [&>*]:min-w-0">
          <DatePicker
            name="followUpDate"
            label={<>Follow-up Date<Req /></>}
            placeholder="Select date"
            value={date}
            onChange={setDate}
          />
          <SignupDropdown
            name="followUpTime"
            label="Time *"
            placeholder="Select time"
            options={TIMES}
            value={time}
            onChange={setTime}
          />
          <SignupDropdown
            name="followUpProvider"
            label="Provider"
            placeholder="Select provider"
            options={PROVIDERS}
            value={provider}
            onChange={setProvider}
          />
        </div>

        <TextAreaField
          label="Reason for Follow-up"
          required
          placeholder="Describe the reason for the follow-up"
          rows={3}
          max={500}
          value={reason}
          onChange={setReason}
        />

        <div>
          <p className={labelCls}>Follow-up Instructions (for Patient)</p>
          <InputActions value={instructions} onChange={setInstructions} rows={6} max={1000} image={false} />
        </div>

        <div>
          <p className={labelCls}>Additional Actions</p>
          <div className="grid min-w-0 gap-3 sm:grid-cols-2 [&>*]:min-w-0">
            {ACTIONS.map((a) => (
              <label key={a.id} className="flex cursor-pointer items-center gap-3 text-sm text-heading">
                <RadioCheckButtonh
                  type="checkbox"
                  checked={checked.includes(a.id)}
                  onChange={() => toggle(a.id)}
                  className={checkboxCls}
                />
                {a.label}
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FollowUp;