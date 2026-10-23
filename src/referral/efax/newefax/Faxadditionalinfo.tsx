"use client";

import React from "react";

import SignupDropdown from "@/components/SignupDropdown";
import SignupField from "@/components/SignupField";
import DatePicker from "@/components/Datepicker";
import TogglableSwitch from "@/components/Togglableswitch";
import { ModalCheckboxGroup, ModalRadioGroup } from "@/components/Modalshell";
import {
  Opt,
  Req,
  TextArea,
  cardCls,
  todayISO,
  toOptions,
  type Errors,
  type StepProps,
} from "@/providers/Shared";
import type { FaxValues } from "./Faxrecipient";

/* ---------- Options ---------- */
export const COVER_TEMPLATES = toOptions([
  "Standard Referral Cover Sheet",
  "Standard Cover Sheet",
  "Imaging Order Cover Sheet",
  "Custom Cover Sheet",
]);

export const URGENCY_OPTIONS = [
  { value: "Routine", label: "Routine" },
  { value: "Urgent", label: "Urgent" },
  { value: "Stat", label: "Stat" },
];

export const SEND_MODE_OPTIONS = [
  { value: "now", label: "Send Now" },
  { value: "later", label: "Schedule for Later" },
];

export const NOTIFY_EVENT_OPTIONS = [
  { value: "delivered", label: "Notify me when fax is delivered" },
  { value: "failed", label: "Notify me if fax fails" },
  { value: "copy", label: "Send a copy of the status to another email" },
];

export const NOTIFY_VIA_OPTIONS = [
  { value: "inapp", label: "In-app notification" },
  { value: "email", label: "Email" },
];

const TIME_OPTIONS = toOptions([
  "08:00 AM", "08:30 AM", "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM",
  "11:00 AM", "11:30 AM", "12:00 PM", "01:00 PM", "01:30 PM", "02:00 PM",
  "02:30 PM", "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM", "05:00 PM",
]);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* ---------- Validation ---------- */
export const validateFaxAdditionalInfo = (v: FaxValues): Errors => {
  const e: Errors = {};
  if (v.sendMode === "later") {
    if (!v.sendDate) e.sendDate = "Select a send date.";
    else if (v.sendDate < todayISO()) e.sendDate = "Date cannot be in the past.";
    if (!v.sendTime) e.sendTime = "Select a send time.";
  }
  if (v.notifyEvents.includes("copy")) {
    if (!v.copyEmail.trim()) e.copyEmail = "Enter an email address.";
    else if (!EMAIL_RE.test(v.copyEmail.trim())) e.copyEmail = "Enter a valid email address.";
  }
  if (v.notifyVia.includes("email")) {
    if (!v.notifyEmail.trim()) e.notifyEmail = "Enter an email address.";
    else if (!EMAIL_RE.test(v.notifyEmail.trim())) e.notifyEmail = "Enter a valid email address.";
  }
  return e;
};

/* ---------- Section header ---------- */
const SectionHeader = ({
  title,
  subtitle,
  action,
}: {
  title: React.ReactNode;
  subtitle?: string;
  action?: React.ReactNode;
}) => (
  <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
    <div className="min-w-0">
      <h3 className="text-base font-semibold text-heading sm:text-lg">{title}</h3>
      {subtitle && <p className="mt-0.5 text-xs text-body sm:text-sm">{subtitle}</p>}
    </div>
    {action}
  </div>
);

/* ---------- Component ---------- */
const FaxAdditionalInfo = ({ values: v, errors, onChange }: StepProps<FaxValues>) => {
  const scheduleLater = v.sendMode === "later";

  return (
    <div className="w-full space-y-4 sm:space-y-5">
      {/* Fax cover sheet */}
      <section className={`${cardCls} sm:p-6`}>
        <SectionHeader
          title="Fax Cover Sheet"
          subtitle="Include a cover sheet with your fax (recommended)."
          action={
            <TogglableSwitch
              id="includeCover"
              checked={v.includeCover}
              onChange={(arg: any) =>
                onChange({ includeCover: typeof arg === "boolean" ? arg : Boolean(arg?.target?.checked) })
              }
              ariaLabel="Include cover sheet"
              label={<span className="text-sm text-heading">Include Cover Sheet</span>}
            />
          }
        />
        {v.includeCover && (
          <div className="grid gap-x-6 gap-y-4 md:grid-cols-2">
            <SignupDropdown
              name="coverTemplate"
              label="Cover Sheet Template"
              placeholder="Select template"
              searchable={false}
              options={COVER_TEMPLATES}
              value={v.coverTemplate}
              onChange={(val) => onChange({ coverTemplate: val })}
            />
            <TextArea
              name="message"
              label={<>Message to Recipient<Opt /></>}
              placeholder="Add a message for the recipient..."
              value={v.message}
              onChange={(val) => onChange({ message: val })}
              maxLength={500}
              rows={3}
            />
          </div>
        )}
      </section>

      {/* Urgency & delivery options */}
      <section className={`${cardCls} sm:p-6`}>
        <SectionHeader title="Urgency & Delivery Options" />
        <div className="grid gap-x-6 gap-y-4 md:grid-cols-2">
          <ModalRadioGroup
            name="urgency"
            label="Urgency Level"
            value={v.urgency}
            onChange={(val) => onChange({ urgency: val })}
            options={URGENCY_OPTIONS}
            className="!flex-col !items-start !gap-y-3"
          />

          <div className="space-y-3">
            <ModalRadioGroup
              name="sendMode"
              label="Send Date & Time"
              value={v.sendMode}
              onChange={(val) => onChange({ sendMode: val })}
              options={SEND_MODE_OPTIONS}
              className="!flex-col !items-start !gap-y-3"
            />
            <div
              aria-disabled={!scheduleLater}
              className={`grid gap-3 sm:grid-cols-2 [&_label]:sr-only ${
                scheduleLater ? "" : "pointer-events-none opacity-50"
              }`}
            >
              <DatePicker
                name="sendDate"
                label="Send date"
                placeholder="Select date"
                value={v.sendDate}
                onChange={(val) => onChange({ sendDate: val })}
                minDate={todayISO()}
                error={errors.sendDate}
              />
              <SignupDropdown
                name="sendTime"
                label="Send time"
                placeholder="Select time"
                searchable={false}
                options={TIME_OPTIONS}
                value={v.sendTime}
                onChange={(val) => onChange({ sendTime: val })}
                error={errors.sendTime}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Notification settings */}
      <section className={`${cardCls} sm:p-6`}>
        <SectionHeader title="Notification Settings" />
        <div className="grid gap-x-6 gap-y-4 md:grid-cols-2">
          <div className="space-y-3">
            <ModalCheckboxGroup
              label={<span className="font-normal text-body">Receive notifications about fax delivery status.</span>}
              value={v.notifyEvents}
              onChange={(val) => onChange({ notifyEvents: val })}
              options={NOTIFY_EVENT_OPTIONS}
              className="space-y-3"
            />
            {v.notifyEvents.includes("copy") && (
              <SignupField
                name="copyEmail"
                type="email"
                label={<>Send copy to<Req /></>}
                placeholder="Enter email address"
                value={v.copyEmail}
                onChange={(e) => onChange({ copyEmail: e.target.value })}
                error={errors.copyEmail}
              />
            )}
          </div>

          <div className="space-y-3">
            <ModalCheckboxGroup
              label="Notify via"
              value={v.notifyVia}
              onChange={(val) => onChange({ notifyVia: val })}
              options={NOTIFY_VIA_OPTIONS}
              className="space-y-3"
            />
            {v.notifyVia.includes("email") && (
              <SignupField
                name="notifyEmail"
                type="email"
                label="Notification email"
                placeholder="Enter email address"
                value={v.notifyEmail}
                onChange={(e) => onChange({ notifyEmail: e.target.value })}
                error={errors.notifyEmail}
              />
            )}
          </div>
        </div>
      </section>

      {/* Additional notes */}
      <section className={`${cardCls} sm:p-6`}>
        <TextArea
          name="notes"
          label={<span className="text-base font-semibold text-heading sm:text-lg">Additional Notes <Opt /></span>}
          placeholder="Add any internal notes or instructions for your team..."
          value={v.notes}
          onChange={(val) => onChange({ notes: val })}
          maxLength={500}
          rows={3}
        />
      </section>
    </div>
  );
};

export default FaxAdditionalInfo;
