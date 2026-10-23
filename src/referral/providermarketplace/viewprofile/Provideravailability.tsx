"use client";

import React, { useMemo, useState } from "react";
import { CalendarDays, Clock, FileText, IndianRupee, MapPin, Monitor, Video } from "lucide-react";

import Calendar, { addDays, fmt, sameDay, startOfDay } from "@/components/Calendar";
import AddButton from "@/components/Addbutton";
import ImportButton from "@/components/ImportButton";
import SignupDropdown from "@/components/SignupDropdown";
import { FieldError } from "@/components/SignupField";
import { cardCls, toOptions } from "@/providers/Shared";
import type { ProviderProfile } from "./Viewproviderprofile";
import type { Service } from "./Providerservices";

/* ---------------------------------------------------------------- */
/*  Static data                                                      */
/* ---------------------------------------------------------------- */
const SLOT_GROUPS: { label: string; slots: string[] }[] = [
  { label: "Morning", slots: ["9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM"] },
  { label: "Afternoon", slots: ["1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM"] },
  { label: "Evening", slots: ["4:00 PM", "4:30 PM", "5:00 PM"] },
];

const REASONS = toOptions([
  "General check-up",
  "Follow-up visit",
  "New symptoms / concern",
  "Prescription refill",
  "Lab results review",
  "Vaccination",
]);

type VisitType = "telemedicine" | "in-person";

/** The doctor sees patients Tuesday – Friday, from today onwards. */
const isAvailable = (date: Date) => {
  const dow = date.getDay();
  return dow >= 2 && dow <= 5 && date >= startOfDay(new Date());
};

const firstAvailable = () => {
  let d = startOfDay(new Date());
  for (let i = 0; i < 60 && !isAvailable(d); i++) d = addDays(d, 1);
  return d;
};

const DetailRow = ({ icon: Icon, label, children }: { icon: React.ElementType; label: string; children: React.ReactNode }) => (
  <div className="grid grid-cols-[28px_130px_minmax(0,1fr)] items-center gap-2 py-3 text-sm sm:grid-cols-[28px_170px_minmax(0,1fr)]">
    <Icon className="h-4 w-4 text-primary" />
    <span className="text-heading">{label}</span>
    <div className="min-w-0 text-body">{children}</div>
  </div>
);

/* ---------------------------------------------------------------- */
/*  Component                                                        */
/* ---------------------------------------------------------------- */
type Props = {
  profile: ProviderProfile;
  /** set when the patient came from a "Book Now" on the Services tab */
  service?: Service | null;
  onCancel: () => void;
};

const ProviderAvailability = ({ profile, service, onCancel }: Props) => {
  const start = useMemo(() => firstAvailable(), []);
  const [visit, setVisit] = useState<VisitType>("telemedicine");
  const [month, setMonth] = useState<Date>(start);
  const [date, setDate] = useState<Date>(start);
  const [time, setTime] = useState("9:00 AM");
  const [reason, setReason] = useState("");
  const [errors, setErrors] = useState<{ reason?: string; time?: string }>({});

  const fee = service?.price ?? profile.fee;
  const feeLabel = service?.title ?? "Initial Consultation";
  const duration = service?.minutes ?? 30;
  const longDate = fmt(date, { weekday: "long", month: "short", day: "numeric", year: "numeric" });
  const typeLabel = visit === "telemedicine" ? "Telemedicine (Video Consultation)" : "In-Person Visit";

  const handleProceed = () => {
    const e: typeof errors = {};
    if (!time) e.time = "Select a time slot.";
    if (!reason) e.reason = "Select a reason for the visit.";
    setErrors(e);
    if (Object.keys(e).length) return;
    // TODO: call your booking API with { provider: profile.id, visit, date, time, reason, service }
  };

  const tile = (active: boolean) =>
    `flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${
      active ? "border-primary bg-primary/10" : "border-border bg-card hover:border-primary/40 hover:bg-primary/5"
    }`;

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Visit type */}
      <div role="radiogroup" aria-label="Visit type" className="grid gap-3 sm:grid-cols-2">
        <button type="button" role="radio" aria-checked={visit === "telemedicine"} onClick={() => setVisit("telemedicine")} className={tile(visit === "telemedicine")}>
          <Monitor className="h-6 w-6 text-primary" />
          <span>
            <span className="block text-sm font-semibold text-heading">Telemedicine</span>
            <span className="block text-xs text-body">Video Consultation</span>
          </span>
        </button>
        <button type="button" role="radio" aria-checked={visit === "in-person"} onClick={() => setVisit("in-person")} className={tile(visit === "in-person")}>
          <MapPin className="h-6 w-6 text-primary" />
          <span>
            <span className="block text-sm font-semibold text-heading">In-Person Visit</span>
            <span className="block text-xs text-body">At Clinic Location</span>
          </span>
        </button>
      </div>

      {/* Date & time */}
      <div className="grid items-stretch gap-4 sm:gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <section className={`${cardCls} h-full sm:p-6`}>
          <h3 className="mb-4 text-base font-semibold text-heading">Select Date &amp; Time</h3>
          <Calendar
            showMonthNavigation
            month={month}
            onMonthChange={setMonth}
            selectedDate={date}
            today={new Date()}
            onSelectDate={setDate}
            className="w-full"
            renderDay={(d, state) => {
              const available = isAvailable(d);
              const selected = sameDay(d, date);
              return (
                <button
                  type="button"
                  disabled={!available}
                  aria-pressed={selected}
                  aria-label={fmt(d, { dateStyle: "full" })}
                  onClick={() => {
                    setDate(d);
                    setMonth(d);
                  }}
                  className={`mx-auto flex h-9 w-9 items-center justify-center rounded-full text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 sm:h-10 sm:w-10 ${
                    selected
                      ? "cursor-pointer bg-primary font-semibold text-white"
                      : available
                        ? "cursor-pointer bg-primary/10 font-medium text-primary hover:bg-primary/20"
                        : state.isOutsideMonth
                          ? "cursor-not-allowed text-placeholder"
                          : "cursor-not-allowed text-body/70"
                  }`}
                >
                  {d.getDate()}
                </button>
              );
            }}
          />
        </section>

        <section className={`${cardCls} h-full sm:p-6`}>
          <h3 className="mb-4 text-base font-semibold text-heading">{longDate}</h3>
          <div className="space-y-4">
            {SLOT_GROUPS.map((g) => (
              <div key={g.label}>
                <p className="mb-2 text-sm font-semibold text-heading">{g.label}</p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {g.slots.map((t) => {
                    const selected = time === t;
                    return (
                      <button
                        key={t}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => {
                          setTime(t);
                          setErrors((p) => ({ ...p, time: undefined }));
                        }}
                        className={`cursor-pointer rounded-md border px-2 py-2 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 sm:text-sm ${
                          selected
                            ? "border-primary bg-primary text-white"
                            : "border-border bg-card text-primary hover:border-primary/50 hover:bg-primary/5"
                        }`}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <FieldError message={errors.time} />
        </section>
      </div>

      {/* Appointment details */}
      <section className={`${cardCls} sm:p-6`}>
        <h3 className="mb-2 text-base font-semibold text-heading">Appointment Details</h3>
        <div className="divide-y divide-divider">
          <DetailRow icon={CalendarDays} label="Date & Time">
            {longDate} <span className="mx-1 text-border">|</span> {time}
          </DetailRow>
          <DetailRow icon={visit === "telemedicine" ? Video : MapPin} label="Appointment Type">
            {typeLabel}
          </DetailRow>
          <DetailRow icon={IndianRupee} label="Consultation Fee">
            {profile.currency}
            {fee} ({feeLabel})
          </DetailRow>
          <DetailRow icon={Clock} label="Duration">
            {duration} minutes
          </DetailRow>
          <DetailRow icon={FileText} label="Reason for Visit">
            <SignupDropdown
              name="reason"
              placeholder="Select a reason"
              searchable={false}
              triggerClassName="!h-10 !min-h-10 !rounded-lg !px-3 !pr-8 !text-xs"
              options={REASONS}
              value={reason}
              onChange={(val) => {
                setReason(val);
                setErrors((p) => ({ ...p, reason: undefined }));
              }}
              error={errors.reason}
            />
          </DetailRow>
        </div>
      </section>

      <div className="flex items-center justify-end gap-3">
        <ImportButton text="Cancel" icon={null} onClick={onCancel} className="px-5" />
        <AddButton text="Proceed to Book" onClick={handleProceed} className="px-5" />
      </div>
    </div>
  );
};

export default ProviderAvailability;
