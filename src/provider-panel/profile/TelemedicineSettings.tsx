"use client";

import React from "react";
import { CalendarDays, Info, MessageCircle, Monitor, Phone, Scale, Stethoscope, Users, Video, type LucideIcon } from "lucide-react";

import TogglableSwitch from "@/components/Togglableswitch";
import RadioCheckButtonh from "@/components/RadioCheckButtonh";
import SignupDropdown from "@/components/SignupDropdown";
import { FieldError } from "@/components/SignupField";
import { ChipSelect, SectionCard, US_STATE_OPTIONS, toOptions, type Errors, type StepProps } from "@/providers/Shared";

/* ---------------------------------------------------------------- */
/*  Values + validation (used by ProfileLocation and ProfileReview)  */
/* ---------------------------------------------------------------- */
export interface TeleValues {
  enabled: boolean;
  mode: "all" | "specific";
  states: string[];
  availability: "same" | "custom";
  customStart: string;
  customEnd: string;
  visitTypes: string[];
  duration: string;
  platform: string;
  allowVideo: boolean;
  allowAudio: boolean;
  allowChat: boolean;
}

/** Static starting values (replace with the provider's saved settings). */
export const initialTele = (): TeleValues => ({
  enabled: true,
  mode: "all",
  states: ["CA", "TX", "NY"],
  availability: "same",
  customStart: "",
  customEnd: "",
  visitTypes: ["Initial Consult", "Follow-up", "Chronic Care"],
  duration: "30 minutes",
  platform: "KOOLMD Video (HIPAA-ready)",
  allowVideo: true,
  allowAudio: true,
  allowChat: true,
});

/** Error keys that belong to this tab (ProfileLocation uses them to switch tabs). */
export const TELE_ERROR_KEYS = ["states", "customHours", "visitTypes", "duration", "platform", "access"];

export const validateTele = (v: TeleValues): Errors => {
  const e: Errors = {};
  if (!v.enabled) return e;
  if (v.mode === "specific" && v.states.length === 0) e.states = "Select at least one state.";
  if (v.availability === "custom" && (!v.customStart || !v.customEnd)) e.customHours = "Choose your custom virtual care hours.";
  if (v.visitTypes.length === 0) e.visitTypes = "Select at least one visit type.";
  if (!v.duration) e.duration = "Default visit duration is required.";
  if (!v.platform) e.platform = "Platform is required.";
  if (!v.allowVideo && !v.allowAudio && !v.allowChat) e.access = "Enable at least one consultation method.";
  return e;
};

/* ---------------------------------------------------------------- */
/*  Options                                                          */
/* ---------------------------------------------------------------- */
const STATE_CHIP_OPTIONS = US_STATE_OPTIONS.map((s) => ({ value: s.value, label: `${s.label} (${s.value})` }));
const VISIT_TYPES: { label: string; hint: string }[] = [
  { label: "Initial Consult", hint: "First visit with a new patient." },
  { label: "Follow-up", hint: "Review of an existing condition or treatment." },
  { label: "Chronic Care", hint: "Ongoing management of long-term conditions." },
  { label: "Urgent Care", hint: "Same-day concerns that are not emergencies." },
];
const DURATIONS = toOptions(["15 minutes", "20 minutes", "30 minutes", "45 minutes", "60 minutes"]);
const PLATFORMS = toOptions(["KOOLMD Video (HIPAA-ready)", "Zoom for Healthcare", "Doxy.me"]);
const START_TIMES = toOptions(["07:00 AM", "08:00 AM", "09:00 AM", "10:00 AM"]);
const END_TIMES = toOptions(["03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM", "07:00 PM"]);

const Hint = ({ text }: { text: string }) => (
  <span title={text} className="inline-flex cursor-help text-body">
    <Info className="h-3.5 w-3.5" aria-label={text} />
  </span>
);

const RadioRow = ({
  name, checked, onChange, title, desc,
}: { name: string; checked: boolean; onChange: () => void; title: string; desc?: string }) => (
  <label className="flex cursor-pointer items-start gap-3">
    <RadioCheckButtonh type="radio" name={name} checked={checked} onChange={onChange} className="mt-1" />
    <span>
      <span className="block text-sm font-semibold text-heading">{title}</span>
      {desc && <span className="block text-xs text-body">{desc}</span>}
    </span>
  </label>
);

/* ---------------------------------------------------------------- */
/*  Telemedicine Settings tab                                        */
/* ---------------------------------------------------------------- */
const TelemedicineSettings = ({ values: v, errors, onChange }: StepProps<TeleValues>) => {
  const access: { key: "allowVideo" | "allowAudio" | "allowChat"; label: string; Icon: LucideIcon }[] = [
    { key: "allowVideo", label: "Allow video consultations", Icon: Video },
    { key: "allowAudio", label: "Allow audio-only consultations", Icon: Phone },
    { key: "allowChat", label: "Allow secure chat during the visit", Icon: MessageCircle },
  ];

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Master switch */}
      <section className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:p-5">
        <span className="flex h-20 w-full shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-violet/30 text-primary sm:w-[150px]">
          <Monitor className="h-10 w-10" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-semibold text-heading">Offer Telemedicine Care</h3>
          <p className="text-sm text-body">Enable virtual consultations and set where you can see patients online.</p>
        </div>
        <TogglableSwitch checked={v.enabled} onChange={(enabled) => onChange({ enabled })} ariaLabel="Offer telemedicine care" />
      </section>

      <div
        className={`grid gap-4 sm:gap-5 2xl:grid-cols-2 ${v.enabled ? "" : "pointer-events-none select-none opacity-50"}`}
        aria-disabled={!v.enabled}
      >
        {/* Left */}
        <div className="min-w-0 space-y-4 sm:space-y-5">
          <SectionCard icon={<Scale className="h-4 w-4" />} title="Telemedicine Jurisdictions">
            <div className="space-y-3">
              <RadioRow
                name="tele-mode"
                checked={v.mode === "all"}
                onChange={() => onChange({ mode: "all" })}
                title="All states where I am licensed"
                desc="Automatically include all states/regions from your active licenses."
              />
              <RadioRow
                name="tele-mode"
                checked={v.mode === "specific"}
                onChange={() => onChange({ mode: "specific" })}
                title="Select specific states"
                desc="Choose the states/regions where you can provide telemedicine care."
              />
              {v.mode === "specific" && (
                <ChipSelect
                  name="states"
                  label="States / Regions"
                  options={STATE_CHIP_OPTIONS}
                  value={v.states}
                  onChange={(states) => onChange({ states })}
                  placeholder="Select states"
                  error={errors.states}
                />
              )}
            </div>
          </SectionCard>

          <SectionCard icon={<CalendarDays className="h-4 w-4" />} title="Virtual Care Availability" subtitle="Set your availability for telemedicine consultations.">
            <div className="space-y-3">
              <RadioRow
                name="tele-availability"
                checked={v.availability === "same"}
                onChange={() => onChange({ availability: "same" })}
                title="Same as my practice schedule"
                desc="Use the same hours as my in-person practice locations."
              />
              <RadioRow
                name="tele-availability"
                checked={v.availability === "custom"}
                onChange={() => onChange({ availability: "custom" })}
                title="Custom virtual care hours"
              />
              {v.availability === "custom" && (
                <div id="customHours" className="grid gap-4 sm:grid-cols-2">
                  <SignupDropdown name="customStart" label="Start Time" placeholder="Select time" searchable={false}
                    options={START_TIMES} value={v.customStart} onChange={(customStart) => onChange({ customStart })} />
                  <SignupDropdown name="customEnd" label="End Time" placeholder="Select time" searchable={false}
                    options={END_TIMES} value={v.customEnd} onChange={(customEnd) => onChange({ customEnd })} />
                  <div className="sm:col-span-2"><FieldError message={errors.customHours} /></div>
                </div>
              )}
            </div>
          </SectionCard>
        </div>

        {/* Right */}
        <div className="min-w-0 space-y-4 sm:space-y-5">
          <SectionCard icon={<Stethoscope className="h-4 w-4" />} title="Virtual Visit Configuration">
            <div className="space-y-4">
              <div id="visitTypes">
                <p className="mb-2 text-sm font-medium text-label">Telemedicine Visit Types <span className="text-danger">*</span></p>
                <div className="flex flex-wrap gap-x-5 gap-y-2.5">
                  {VISIT_TYPES.map(({ label, hint }) => (
                    <label key={label} className="flex cursor-pointer items-center gap-2 text-xs text-heading">
                      <RadioCheckButtonh
                        type="checkbox"
                        checked={v.visitTypes.includes(label)}
                        onChange={(e) => onChange({ visitTypes: e.target.checked ? [...v.visitTypes, label] : v.visitTypes.filter((t) => t !== label) })}
                      />
                      {label}
                      <Hint text={hint} />
                    </label>
                  ))}
                </div>
                <FieldError message={errors.visitTypes} />
              </div>

              <div className="grid gap-4 border-t border-divider pt-4 sm:grid-cols-2">
                <SignupDropdown name="duration" label="Default Visit Duration *" placeholder="Select duration" searchable={false}
                  options={DURATIONS} value={v.duration} onChange={(duration) => onChange({ duration })} error={errors.duration} />
                <SignupDropdown name="platform" label="Platform *" placeholder="Select platform" searchable={false}
                  options={PLATFORMS} value={v.platform} onChange={(platform) => onChange({ platform })} error={errors.platform} />
              </div>
            </div>
          </SectionCard>

          <SectionCard icon={<Users className="h-4 w-4" />} title="Patient Access">
            <ul id="access" className="space-y-3.5">
              {access.map(({ key, label, Icon }) => (
                <li key={key} className="flex items-center justify-between gap-3">
                  <span className="flex min-w-0 items-center gap-3 text-sm text-heading">
                    <Icon className="h-4 w-4 shrink-0 text-primary" />
                    {label}
                  </span>
                  <TogglableSwitch checked={v[key]} onChange={(checked) => onChange({ [key]: checked })} ariaLabel={label} />
                </li>
              ))}
            </ul>
            <FieldError message={errors.access} />
          </SectionCard>
        </div>
      </div>
    </div>
  );
};

export default TelemedicineSettings;