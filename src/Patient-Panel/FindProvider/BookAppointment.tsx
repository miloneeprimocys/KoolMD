"use client";

import React, { useState } from "react";
import { MapPin, Star, Video, type LucideIcon } from "lucide-react";

import Calendar, { type CalendarDayState } from "@/components/Calendar";
import RadioCheckButtonh from "@/components/RadioCheckButtonh";
import SignupDropdown from "@/components/SignupDropdown";
import { FieldError } from "@/components/SignupField";
import { Opt, Req, TextArea, cardCls, todayISO, toOptions } from "@/providers/Shared";

import type { Provider } from "./FindProvider";
import AppointmentSummary, { ProviderAvatar, VerifiedBadge } from "./AppointmentSummary";


/* ---------------------------------------------------------------- */
/*  Booking model (owned by FindProviderMainPage)                    */
/* ---------------------------------------------------------------- */
export type VisitType = "video" | "in-person";

export type BookingValues = {
  date: string; // yyyy-mm-dd
  time: string; // e.g. "10:30 AM"
  visitType: VisitType;
  reason: string;
  notes: string;
};

export const REASON_OPTIONS = toOptions([
  "General Consultation",
  "Follow-up Visit",
  "New Symptoms",
  "Medication Review",
  "Preventive Care",
  "Other",
]);

const MORNING = ["09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM"];
const AFTERNOON = ["01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM"];
const ALL_SLOTS = [...MORNING, ...AFTERNOON];
const toISO = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const initialBooking = (provider: Provider, slot: string): BookingValues => ({
  date: todayISO(),
  time: ALL_SLOTS.includes(slot) ? slot : "",
  visitType: provider.visit[0] ?? "video",
  reason: "",
  notes: "",
});

const VISITS: { key: VisitType; title: string; desc: string; icon: LucideIcon }[] = [
  { key: "video", title: "Video Consultation", desc: "Consult online from anywhere", icon: Video },
  { key: "in-person", title: "In-Person Visit", desc: "Visit at the clinic", icon: MapPin },
];

/* ---------------------------------------------------------------- */
/*  Time slots                                                       */
/* ---------------------------------------------------------------- */
const SlotGroup = ({
  title,
  slots,
  value,
  onSelect,
}: {
  title: string;
  slots: string[];
  value: string;
  onSelect: (s: string) => void;
}) => (
  <div>
    <p className="mb-2 text-xs font-semibold text-heading">{title}</p>
    <div className="grid grid-cols-2 gap-2">
      {slots.map((s) => {
        const on = s === value;
        return (
          <button
            key={s}
            type="button"
            aria-pressed={on}
            onClick={() => onSelect(s)}
            className={`cursor-pointer rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${
              on ? "border-primary bg-primary text-on-primary" : "border-border bg-card text-heading hover:bg-primary/5"
            }`}
          >
            {s}
          </button>
        );
      })}
    </div>
  </div>
);

/* ---------------------------------------------------------------- */
/*  Step 2: Book an appointment                                      */
/* ---------------------------------------------------------------- */
const BookAppointment = ({
  provider,
  booking,
  errors,
  onChange,
}: {
  provider: Provider;
  booking: BookingValues;
  errors: { time?: string; reason?: string };
  onChange: (patch: Partial<BookingValues>) => void;
}) => {
  const minISO = todayISO();
  const minMonth = new Date(`${minISO.slice(0, 7)}-01T00:00:00`);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const selected = new Date(`${booking.date || minISO}T00:00:00`);
    return new Date(selected.getFullYear(), selected.getMonth(), 1);
  });

  const renderCalendarDay = (date: Date, state: CalendarDayState) => {
    const iso = toISO(date);
    const disabled = iso < minISO;
    return (
      <button
        type="button"
        disabled={disabled}
        aria-pressed={state.isSelected}
        aria-label={date.toDateString()}
        onClick={() => onChange({ date: iso })}
        className={`mx-auto flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:cursor-not-allowed ${
          state.isSelected
            ? "bg-primary font-semibold text-on-primary"
            : disabled
              ? "text-body/40"
              : state.isOutsideMonth
                ? "text-body/50 hover:bg-primary/5"
                : "text-heading hover:bg-primary/10"
        }`}
      >
        {date.getDate()}
      </button>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-heading sm:text-xl 2xl:text-2xl">Book an Appointment</h2>
        <p className="mt-0.5 text-sm text-body">Schedule a consultation with {provider.name}.</p>
      </div>

      <div className="grid min-w-0 items-start gap-4 sm:gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-4 sm:space-y-5">
          <div className="grid min-w-0 gap-4 sm:gap-5 md:grid-cols-[260px_minmax(0,1fr)]">
            {/* Provider */}
            <section className={`${cardCls} min-w-0`}>
              <div className="flex items-start gap-3">
                <ProviderAvatar name={provider.name} size="lg" />
                <div className="min-w-0">
                  <p className="flex items-center gap-1.5 text-sm font-semibold text-heading">
                    <span className="truncate">{provider.name}</span>
                    <VerifiedBadge />
                  </p>
                  <p className="text-xs text-body">{provider.specialty}</p>
                  <p className="mt-1.5 flex items-center gap-1 text-xs text-heading">
                    <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                    <span className="font-semibold">{provider.rating}</span>
                    <span className="text-body">({provider.reviews} reviews)</span>
                  </p>
                  <p className="mt-1 text-xs text-body">{provider.years}+ years experience</p>
                </div>
              </div>
              <div className="mt-4 border-t border-divider pt-3">
                <p className="mb-2 text-xs font-semibold text-heading">Expertise</p>
                <ul className="flex flex-wrap gap-1.5">
                  {provider.tags.map((t) => (
                    <li key={t} className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* Date & time */}
            <section className={`${cardCls} min-w-0`}>
              <h3 className="mb-3 text-base font-semibold text-heading">Select Date &amp; Time</h3>
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_200px]">
                <Calendar
                  month={calendarMonth}
                  minMonth={minMonth}
                  selectedDate={new Date(`${booking.date}T00:00:00`)}
                  today={new Date(`${minISO}T00:00:00`)}
                  onSelectDate={(date) => onChange({ date: toISO(date) })}
                  onMonthChange={setCalendarMonth}
                  showMonthNavigation
                  compact
                  renderDay={renderCalendarDay}
                  weekdayContainerClassName="gap-y-1"
                  weekdayClassName="pb-1 text-[11px] text-body"
                />
                <div className="space-y-3 lg:border-l lg:border-divider lg:pl-4">
                  <p className="text-xs font-semibold text-heading">Available Time Slots</p>
                  <SlotGroup
                    title="Morning"
                    slots={MORNING}
                    value={booking.time}
                    onSelect={(s) => {
                      onChange({ time: s });
                    }}
                  />
                  <SlotGroup
                    title="Afternoon"
                    slots={AFTERNOON}
                    value={booking.time}
                    onSelect={(s) => {
                      onChange({ time: s });
                    }}
                  />
                  <FieldError message={errors.time} />
                </div>
              </div>
            </section>
          </div>

          {/* Visit type + reason */}
          <section className={`${cardCls} min-w-0 space-y-4`}>
            <h3 className="text-base font-semibold text-heading">Select Visit Type</h3>
            <div role="radiogroup" className="grid gap-3 sm:grid-cols-2">
              {VISITS.map((v) => {
                const Icon = v.icon;
                const supported = provider.visit.includes(v.key);
                const on = booking.visitType === v.key;
                return (
                  <label
                    key={v.key}
                    className={`flex items-center gap-3 rounded-xl border px-3 py-3 text-left transition-colors ${
                      on ? "border-primary bg-primary/10" : "border-border bg-card hover:bg-primary/5"
                    } ${supported ? "cursor-pointer" : "cursor-not-allowed opacity-50"}`}
                  >
                    <RadioCheckButtonh
                      type="radio"
                      name="visitType"
                      value={v.key}
                      checked={on}
                      disabled={!supported}
                      onChange={() => onChange({ visitType: v.key })}
                      aria-label={v.title}
                    />
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-heading">{v.title}</span>
                      <span className="block text-xs text-body">{supported ? v.desc : "Not offered by this provider"}</span>
                    </span>
                  </label>
                );
              })}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <SignupDropdown
                name="reason"
                label={<>Reason for Visit<Req /></>}
                placeholder="Select reason"
                searchable={false}
                options={REASON_OPTIONS}
                value={booking.reason}
                onChange={(v) => {
                  onChange({ reason: v });
                }}
                error={errors.reason}
              />
              <TextArea
                name="notes"
                label={<>Additional Notes<Opt /></>}
                placeholder="Anything else your provider should know?"
                value={booking.notes}
                onChange={(v) => onChange({ notes: v })}
                maxLength={500}
                rows={3}
              />
            </div>
          </section>
        </div>

        <AppointmentSummary provider={provider} booking={booking} mode="booking" />
      </div>
    </div>
  );
};

export default BookAppointment;