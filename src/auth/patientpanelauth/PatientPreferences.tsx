"use client";

import React from "react";
import Link from "next/link";
import { Bell, CalendarClock, FileText, FlaskConical, Mail, Search, Settings, Stethoscope, type LucideIcon } from "lucide-react";

import SignupField, { FieldError } from "@/components/SignupField";
import SignupDropdown from "@/components/SignupDropdown";
import RadioCheckButtonh from "@/components/RadioCheckButtonh";
import { ModalCheckboxGroup } from "@/components/Modalshell";
import TogglableSwitch from "@/components/Togglableswitch";
import { toOptions, type Errors, type StepProps } from "@/providers/Shared";

/* ---------- Values ---------- */
export type NotifyKey = "appointments" | "visits" | "labs" | "promotions";

export interface PreferencesValues {
  visitTypes: string[];
  preferredProvider: string;
  notify: Record<NotifyKey, boolean>;
  timeZone: string;
  language: string;
  agree: boolean;
}

export const initialPreferences = (): PreferencesValues => ({
  visitTypes: ["either"],
  preferredProvider: "",
  notify: { appointments: true, visits: true, labs: true, promotions: false },
  timeZone: "(GMT+05:30) India Standard Time",
  language: "English",
  agree: false,
});

/* ---------- Validation ---------- */
export const validatePreferences = (v: PreferencesValues): Errors => {
  const e: Errors = {};
  if (v.visitTypes.length === 0) e.visitTypes = "Select at least one visit type.";
  if (!v.timeZone) e.timeZone = "Select your time zone.";
  if (!v.language) e.language = "Select your language.";
  if (!v.agree) e.agree = "You must accept the Terms of Service and Privacy Policy.";
  return e;
};

/* ---------- Options (static) ---------- */
const VISIT_TYPES = [
  { value: "video", label: "Video Consultation" },
  { value: "in-person", label: "In-Person Visit" },
  { value: "either", label: "Either (Recommended)" },
];
const TIME_ZONES = toOptions([
  "(GMT+05:30) India Standard Time",
  "(GMT+00:00) UTC",
  "(GMT+01:00) Central European Time",
  "(GMT+04:00) Gulf Standard Time",
  "(GMT-05:00) Eastern Time (US & Canada)",
  "(GMT-08:00) Pacific Time (US & Canada)",
]);
const LANGUAGES = toOptions(["English", "Hindi", "Gujarati", "Spanish"]);

const NOTIFY: { key: NotifyKey; title: string; desc: string; Icon: LucideIcon }[] = [
  { key: "appointments", title: "Appointment Reminders", desc: "Get reminders for upcoming appointments", Icon: CalendarClock },
  { key: "visits", title: "Visit Updates", desc: "Notifications about visit status and notes", Icon: FileText },
  { key: "labs", title: "Lab & Test Results", desc: "Alerts when your results are ready", Icon: FlaskConical },
  { key: "promotions", title: "Promotions & Health Tips", desc: "Care updates, wellness tips and program offers", Icon: Mail },
];

/* ---------- Small blocks ---------- */
const Section = ({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) => (
  <section className="rounded-xl border border-border p-4">
    <div className="mb-3 flex items-center gap-2.5">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">{icon}</span>
      <h3 className="text-sm font-semibold text-heading">{title}</h3>
    </div>
    {children}
  </section>
);

/* ---------- Component ---------- */
const PatientPreferences = ({ values: v, errors, onChange }: StepProps<PreferencesValues>) => (
  <div className="space-y-3">
    <Section icon={<Stethoscope className="h-4 w-4" />} title="Care Preferences">
      <div className="space-y-3">
        <div id="visitTypes">
          <ModalCheckboxGroup
            label="Preferred Visit Type"
            value={v.visitTypes}
            onChange={(val) => onChange({ visitTypes: val })}
            options={VISIT_TYPES}
            className="space-y-2"
          />
          <FieldError message={errors.visitTypes} />
        </div>
        <SignupField
          id="preferredProvider"
          name="preferredProvider"
          label="Preferred Provider (Optional)"
          placeholder="Search by name, specialty, or clinic"
          icon={<Search className="h-[18px] w-[18px]" />}
          value={v.preferredProvider}
          onChange={(e) => onChange({ preferredProvider: e.target.value })}
        />
      </div>
    </Section>

    <Section icon={<Bell className="h-4 w-4" />} title="Communication Preferences">
      <ul className="divide-y divide-divider">
        {NOTIFY.map(({ key, title, desc, Icon }) => (
          <li key={key} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-heading">{title}</p>
              <p className="text-xs text-body">{desc}</p>
            </div>
            <TogglableSwitch
              ariaLabel={title}
              checked={v.notify[key]}
              onChange={(next) => onChange({ notify: { ...v.notify, [key]: next } })}
              className="inline-flex"
            />
          </li>
        ))}
      </ul>
    </Section>

    <Section icon={<Settings className="h-4 w-4" />} title="Additional Preferences">
      <div className="space-y-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <SignupDropdown
            id="timeZone"
            name="timeZone"
            label="Time Zone"
            placeholder="Select time zone"
            options={TIME_ZONES}
            value={v.timeZone}
            onChange={(val) => onChange({ timeZone: val })}
            error={errors.timeZone}
          />
          <SignupDropdown
            id="language"
            name="language"
            label="Language"
            placeholder="Select language"
            searchable={false}
            options={LANGUAGES}
            value={v.language}
            onChange={(val) => onChange({ language: val })}
            error={errors.language}
          />
        </div>

        <div id="agree">
          <label className="flex cursor-pointer items-start gap-2.5 text-xs text-body sm:text-sm">
            <RadioCheckButtonh
              type="checkbox"
              checked={v.agree}
              onChange={(e) => onChange({ agree: e.target.checked })}
              className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
            />
            <span>
              I agree to the{" "}
              <Link href="/terms" className="font-semibold text-link hover:text-primary hover:underline">Terms of Service</Link>{" "}
              and{" "}
              <Link href="/privacy-policy" className="font-semibold text-link hover:text-primary hover:underline">Privacy Policy</Link>.
            </span>
          </label>
          <FieldError message={errors.agree} />
        </div>
      </div>
    </Section>
  </div>
);

export default PatientPreferences;