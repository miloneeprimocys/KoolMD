"use client";

import React, { useState } from "react";
import { CalendarDays, ChevronDown, ChevronUp, Circle, Filter, MapPin, Video } from "lucide-react";

import ImportButton from "@/components/ImportButton";
import RadioCheckButtonh from "@/components/RadioCheckButtonh";
import SignupDropdown from "@/components/SignupDropdown";
import DatePicker from "@/components/Datepicker";
import { cardCls, toOptions } from "@/providers/Shared";

/* ---------- Filter state ---------- */
export interface FilterState {
  specialty: string[];
  visit: string[];
  availability: string; // "7" | "14" | "range"
  from: string;
  to: string;
  insurance: string;
  language: string[];
}

export const EMPTY_FILTERS: FilterState = {
  specialty: [],
  visit: [],
  availability: "7",
  from: "",
  to: "",
  insurance: "",
  language: [],
};

/* ---------- Static options (counts from API later) ---------- */
type Opt = { value: string; count: number };
const SPECIALTIES: Opt[] = [
  { value: "Primary Care", count: 42 },
  { value: "Cardiology", count: 18 },
  { value: "Dermatology", count: 12 },
  { value: "Endocrinology", count: 9 },
  { value: "Gastroenterology", count: 11 },
  { value: "Neurology", count: 8 },
  { value: "Pediatrics", count: 15 },
  { value: "Psychiatry", count: 7 },
];
const LANGUAGES: Opt[] = [
  { value: "English", count: 50 },
  { value: "Hindi", count: 28 },
  { value: "Gujarati", count: 16 },
  { value: "Spanish", count: 9 },
  { value: "Tamil", count: 4 },
];
const VISIT_TYPES = [
  { value: "video", label: "Video Consultation", Icon: Video },
  { value: "in-person", label: "In-Person Visit", Icon: MapPin },
  { value: "any", label: "Any", Icon: Circle },
];
const INSURERS = toOptions(["Aetna", "Blue Cross Blue Shield", "Cigna", "UnitedHealthcare"]);

const toggle = (list: string[], v: string) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

/* ---------- Small blocks ---------- */
const Section = ({ title, children }: { title: string; children: React.ReactNode }) => {
  const [open, setOpen] = useState(true);
  return (
    <div className="border-t border-divider py-3 first:border-t-0 first:pt-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full cursor-pointer items-center justify-between text-left text-sm font-semibold text-heading focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
      >
        {title}
        {open ? <ChevronUp className="h-4 w-4 text-body" /> : <ChevronDown className="h-4 w-4 text-body" />}
      </button>
      {open && <div className="mt-3 space-y-2.5">{children}</div>}
    </div>
  );
};

const ShowMore = ({ expanded, onClick }: { expanded: boolean; onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className="cursor-pointer text-xs font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
  >
    {expanded ? "− Show Less" : "+ Show More"}
  </button>
);

const CheckRow = ({ checked, onChange, children }: { checked: boolean; onChange: () => void; children: React.ReactNode }) => (
  <label className="flex cursor-pointer items-center gap-2.5 text-xs text-heading">
    <RadioCheckButtonh type="checkbox" checked={checked} onChange={onChange} />
    {children}
  </label>
);

/* ---------- Component ---------- */
interface Props {
  filters: FilterState;
  onChange: (patch: Partial<FilterState>) => void;
  onClear: () => void;
  className?: string;
}

const ProviderFilters = ({ filters: f, onChange, onClear, className = "" }: Props) => {
  const [moreSpecialty, setMoreSpecialty] = useState(false);
  const [moreLanguage, setMoreLanguage] = useState(false);

  const specialties = moreSpecialty ? SPECIALTIES : SPECIALTIES.slice(0, 5);
  const languages = moreLanguage ? LANGUAGES : LANGUAGES.slice(0, 3);

  return (
    <aside className={`${cardCls} h-fit ${className}`} aria-label="Filter providers">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-heading">
          <Filter className="h-4 w-4 text-primary" />
          Filter Providers
        </h2>
        <ImportButton text="Clear All" icon={null} onClick={onClear} className="flex-none !h-8 !px-3 !text-xs text-primary" />
      </div>

      <Section title="Specialty">
        {specialties.map((s) => (
          <CheckRow key={s.value} checked={f.specialty.includes(s.value)} onChange={() => onChange({ specialty: toggle(f.specialty, s.value) })}>
            <span>
              {s.value} <span className="text-body">({s.count})</span>
            </span>
          </CheckRow>
        ))}
        <ShowMore expanded={moreSpecialty} onClick={() => setMoreSpecialty((m) => !m)} />
      </Section>

      <Section title="Visit Type">
        {VISIT_TYPES.map(({ value, label, Icon }) => (
          <CheckRow key={value} checked={f.visit.includes(value)} onChange={() => onChange({ visit: toggle(f.visit, value) })}>
            <Icon className="h-3.5 w-3.5 text-body" />
            <span>{label}</span>
          </CheckRow>
        ))}
      </Section>

      <Section title="Availability">
        {[
          { value: "7", label: "Next 7 Days" },
          { value: "14", label: "Next 14 Days" },
          { value: "range", label: "Choose Date Range" },
        ].map((o) => (
          <label key={o.value} className="flex cursor-pointer items-center gap-2.5 text-xs text-heading">
            <RadioCheckButtonh
              type="radio"
              name="availability"
              checked={f.availability === o.value}
              onChange={() => onChange({ availability: o.value })}
            />
            <span>{o.label}</span>
            {o.value === "range" && <CalendarDays className="h-3.5 w-3.5 text-body" />}
          </label>
        ))}
        {f.availability === "range" && (
          <div className="grid grid-cols-1 gap-3 pt-1">
            <DatePicker id="availFrom" name="availFrom" label="From" value={f.from} onChange={(v: string) => onChange({ from: v })} />
            <DatePicker id="availTo" name="availTo" label="To" value={f.to} minDate={f.from} onChange={(v: string) => onChange({ to: v })} />
          </div>
        )}
      </Section>

      <Section title="Insurance">
        <div className="[&_label]:hidden">
          <SignupDropdown
            name="insurance"
            label="Insurance"
            placeholder="Select insurance provider"
            searchable={false}
            options={INSURERS}
            value={f.insurance}
            onChange={(v: string) => onChange({ insurance: v })}
          />
        </div>
      </Section>

      <Section title="Language">
        {languages.map((l) => (
          <CheckRow key={l.value} checked={f.language.includes(l.value)} onChange={() => onChange({ language: toggle(f.language, l.value) })}>
            <span>
              {l.value} <span className="text-body">({l.count})</span>
            </span>
          </CheckRow>
        ))}
        <ShowMore expanded={moreLanguage} onClick={() => setMoreLanguage((m) => !m)} />
      </Section>
    </aside>
  );
};

export default ProviderFilters;