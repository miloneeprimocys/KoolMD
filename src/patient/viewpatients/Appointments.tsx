"use client";

import React, { useMemo, useState } from "react";
import {
  Building2,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock,
  MoreVertical,
  SlidersHorizontal,
  Video,
  XCircle,
} from "lucide-react";

import StatCards, { type StatItem } from "@/components/Statcards";
import StickyColumns from "@/components/StickyColumns";
import Calendar, { dayKey, startOfDay } from "@/components/Calendar";
import Table from "@/components/Table";
import { type TableColumn } from "@/components/Tableheader";
import Content from "@/components/Content";
import Tags from "@/components/Tags";
import Actions from "@/components/Actions";
import AddButton from "@/components/Addbutton";
import EditButton from "@/components/EditButton";
import SignupDropdown, { type DropdownOption } from "@/components/SignupDropdown";
import DatePicker from "@/components/Datepicker";
import {
  ACTIONS_COL,
  DENSE,
  SectionCard,
} from "./medicalhistory/Medicalhistory";
import type { PatientAppointmentDetails } from "./Rightsection";

/* ---------- Stats ---------- */
const STATS: StatItem[] = [
  { label: "Total Appointments", value: "12", Icon: CalendarDays, accent: "primary" },
  { label: "Upcoming Appointments", value: "2", Icon: Clock, accent: "violet" },
  { label: "Completed Appointments", value: "6", Icon: CheckCircle2, accent: "success" },
  { label: "Cancelled Appointments", value: "2", Icon: XCircle, accent: "danger" },
];

/* ---------- Static data ---------- */
type Mode = "In Clinic" | "Telemedicine";

type Upcoming = {
  calendarDate: Date;
  month: string;
  day: string;
  weekday: string;
  time: string;
  type: string;
  mode: Mode;
  provider: string;
  dept: string;
};

const UPCOMING: Upcoming[] = [
  { calendarDate: new Date(2026, 9, 9), month: "OCT", day: "9", weekday: "Fri", time: "10:00 AM - 10:30 AM", type: "Follow-up Visit", mode: "Telemedicine", provider: "Dr. Sarah Lee", dept: "Primary Care" },
  { calendarDate: new Date(2026, 9, 15), month: "OCT", day: "15", weekday: "Thu", time: "02:00 PM - 02:30 PM", type: "Consultation", mode: "In Clinic", provider: "Dr. James Wilson", dept: "Allergy & Immunology" },
];

type History = {
  calendarDate: Date;
  date: string;
  time: string;
  type: string;
  provider: string;
  dept: string;
  mode: Mode;
  status: "Completed" | "Cancelled";
  notes: string;
};

const HISTORY: History[] = [
  { calendarDate: new Date(2026, 9, 2), date: "Oct 2, 2026", time: "Fri, 10:00 AM", type: "Follow-up Visit", provider: "Dr. Sarah Lee", dept: "Primary Care", mode: "In Clinic", status: "Completed", notes: "Symptoms improved." },
  { calendarDate: new Date(2026, 8, 12), date: "Sep 12, 2026", time: "Sat, 09:00 AM", type: "Lab Review", provider: "Dr. Emily Davis", dept: "Internal Medicine", mode: "Telemedicine", status: "Completed", notes: "Reviewed lab results." },
  { calendarDate: new Date(2026, 7, 20), date: "Aug 20, 2026", time: "Thu, 09:00 AM", type: "Annual Checkup", provider: "Dr. Sarah Lee", dept: "Primary Care", mode: "In Clinic", status: "Completed", notes: "Normal vitals." },
  { calendarDate: new Date(2026, 6, 14), date: "Jul 14, 2026", time: "Tue, 02:00 PM", type: "Allergy Consultation", provider: "Dr. James Wilson", dept: "Allergy & Immunology", mode: "In Clinic", status: "Cancelled", notes: "Cancelled by patient." },
  { calendarDate: new Date(2026, 5, 5), date: "Jun 5, 2026", time: "Fri, 10:30 AM", type: "Follow-up Visit", provider: "Dr. Sarah Lee", dept: "Primary Care", mode: "Telemedicine", status: "Completed", notes: "Continue medication." },
];

type Dot = "scheduled" | "completed" | "cancelled" | "rescheduled";

const DOT_CLS: Record<Dot, string> = {
  scheduled: "bg-success",
  completed: "bg-primary",
  cancelled: "bg-danger",
  rescheduled: "bg-warning",
};

const LEGEND: { label: string; kind: Dot }[] = [
  { label: "Scheduled", kind: "scheduled" },
  { label: "Completed", kind: "completed" },
  { label: "Cancelled", kind: "cancelled" },
  { label: "Rescheduled", kind: "rescheduled" },
];

const toDateInputValue = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const fromDateInputValue = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
};

/* ---------- Helpers ---------- */
const initials = (name: string) =>
  name
    .replace("Dr. ", "")
    .split(" ")
    .map((n) => n[0])
    .join("");

const Avatar = ({ name, size = "h-10 w-10" }: { name: string; size?: string }) => (
  <span
    className={`flex ${size} shrink-0 items-center justify-center rounded-full bg-shape-sky/40 text-xs font-semibold text-heading`}
  >
    {initials(name)}
  </span>
);

const ModeLabel = ({ mode }: { mode: Mode }) =>
  mode === "Telemedicine" ? (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary">
      <Video className="h-3.5 w-3.5" />
      Telemedicine
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 text-xs text-body">
      <Building2 className="h-3.5 w-3.5 text-primary" />
      In Clinic
    </span>
  );

const PROVIDER_OPTIONS: DropdownOption[] = [
  { value: "all", label: "All Providers" },
  { value: "sarah", label: "Dr. Sarah Lee" },
  { value: "james", label: "Dr. James Wilson" },
  { value: "emily", label: "Dr. Emily Davis" },
];
const TYPE_OPTIONS: DropdownOption[] = [
  { value: "all", label: "All Types" },
  { value: "follow-up", label: "Follow-up Visit" },
  { value: "consultation", label: "Consultation" },
  { value: "lab-review", label: "Lab Review" },
  { value: "annual", label: "Annual Checkup" },
];
const STATUS_OPTIONS: DropdownOption[] = [
  { value: "all", label: "All Statuses" },
  { value: "scheduled", label: "Scheduled" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "rescheduled", label: "Rescheduled" },
];

const col = (key: string, label: string): TableColumn => ({ key, label, className: DENSE });

const HISTORY_COLUMNS: TableColumn[] = [
  col("date", "Date & Time"),
  col("type", "Appointment Type"),
  col("provider", "Provider"),
  col("mode", "Mode"),
  col("status", "Status"),
  col("notes", "Notes"),
  ACTIONS_COL,
];

/* ---------- Component ---------- */
const Appointments = ({
  onViewAppointment,
}: {
  onViewAppointment: (details: PatientAppointmentDetails) => void;
}) => {
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(() => new Date(2026, 9, 6));
  const [calendarMonth, setCalendarMonth] = useState(() => new Date(2026, 9, 1));
  const [providerFilter, setProviderFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [startDate, setStartDate] = useState("2026-10-06");
  const [endDate, setEndDate] = useState("2026-10-06");
  const today = startOfDay(new Date());
  const calendarEvents = useMemo(() => {
    const events = new Map<string, Dot[]>();
    const addEvent = (date: Date, status: Dot) => {
      const key = dayKey(date);
      events.set(key, [...(events.get(key) ?? []), status]);
    };
    UPCOMING.forEach((appointment) => addEvent(appointment.calendarDate, "scheduled"));
    HISTORY.forEach((appointment) =>
      addEvent(
        appointment.calendarDate,
        appointment.status === "Cancelled" ? "cancelled" : "completed",
      ),
    );
    return new Map(
      [...events].map(([key, dots]) => [
        key,
        <span key={key} className="absolute bottom-1 flex gap-0.5">
          {dots.slice(0, 3).map((dot, index) => (
            <span
              key={`${dot}-${index}`}
              className={`h-1 w-1 rounded-full ${DOT_CLS[dot]}`}
            />
          ))}
        </span>,
      ]),
    );
  }, []);
  const selectCalendarDate = (date: Date) => {
    const selectedDate = startOfDay(date);
    setSelectedCalendarDate(selectedDate);
    setCalendarMonth(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
    const inputDate = toDateInputValue(selectedDate);
    setStartDate(inputDate);
    setEndDate(inputDate);
  };
  const historyRows = HISTORY.map((h) => ({
    date: <Content title={h.date} description={h.time} truncate />,
    type: <Content title={h.type} truncate />,
    provider: (
      <div className="flex min-w-0 items-center gap-3">
        <Avatar name={h.provider} size="h-9 w-9" />
        <Content title={h.provider} description={h.dept} truncate />
      </div>
    ),
    mode: <ModeLabel mode={h.mode} />,
    status: (
      <Tags
        text={h.status}
        tone={h.status === "Completed" ? "success" : "danger"}
      />
    ),
    notes: <Content title={h.notes} truncate />,
    actions: (
      <div className="flex w-full items-center justify-center gap-1">
        <Actions
          actions={["view"]}
          onAction={() => onViewAppointment(h)}
          size="sm"
        />
        <button
          type="button"
          aria-label={`More actions for ${h.type}`}
          className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-label transition-colors hover:bg-primary/10 hover:text-primary"
        >
          <MoreVertical className="h-3.5 w-3.5" />
        </button>
      </div>
    ),
  }));

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Stat cards */}
      <StatCards stats={STATS} />

      <StickyColumns breakpoint="xl" columnsClass="xl:grid-cols-[minmax(0,375px)_minmax(0,1fr)]">
        {/* ================= LEFT: calendar + filters ================= */}
        <div className="space-y-4 sm:space-y-5">
          <SectionCard
            className="!h-auto"
            icon={CalendarDays}
            tone="blue"
            title="Appointments Calendar"
          >
            <Calendar
              month={calendarMonth}
              selectedDate={selectedCalendarDate}
              today={today}
              onSelectDate={selectCalendarDate}
              onMonthChange={setCalendarMonth}
              showMonthNavigation
              events={calendarEvents}
            />

            {/* Legend */}
            <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1.5">
              {LEGEND.map((l) => (
                <span key={l.label} className="flex items-center gap-1.5 text-[11px] text-body">
                  <span className={`h-1.5 w-1.5 rounded-full ${DOT_CLS[l.kind]}`} />
                  {l.label}
                </span>
              ))}
            </div>
          </SectionCard>

          <SectionCard
            className="!h-auto"
            icon={SlidersHorizontal}
            tone="blue"
            title="Filters"
            action={
              <button
                type="button"
                className="cursor-pointer text-xs font-medium text-primary transition-colors hover:text-primary-hover"
              >
                Reset
              </button>
            }
          >
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1 xl:grid-cols-2">
              <SignupDropdown
                name="appointmentProvider"
                label="Provider"
                placeholder="All Providers"
                options={PROVIDER_OPTIONS}
                value={providerFilter}
                onChange={setProviderFilter}
                searchable={false}
              />
              <SignupDropdown
                name="appointmentType"
                label="Appointment Type"
                placeholder="All Types"
                options={TYPE_OPTIONS}
                value={typeFilter}
                onChange={setTypeFilter}
                searchable={false}
              />
              <SignupDropdown
                name="appointmentStatus"
                label="Status"
                placeholder="All Statuses"
                options={STATUS_OPTIONS}
                value={statusFilter}
                onChange={setStatusFilter}
                searchable={false}
              />
              <DatePicker
                name="appointmentStartDate"
                label="Date From"
                value={startDate}
                onChange={(value) => {
                  setStartDate(value);
                  if (value) {
                    const date = fromDateInputValue(value);
                    setSelectedCalendarDate(date);
                    setCalendarMonth(new Date(date.getFullYear(), date.getMonth(), 1));
                  }
                }}
                align="auto"
                minSpaceBelow={480}
              />
              <DatePicker
                name="appointmentEndDate"
                label="Date To"
                value={endDate}
                onChange={(value) => {
                  setEndDate(value);
                  if (value) {
                    const date = fromDateInputValue(value);
                    setSelectedCalendarDate(date);
                    setCalendarMonth(new Date(date.getFullYear(), date.getMonth(), 1));
                  }
                }}
                minDate={startDate}
                align="auto"
                minSpaceBelow={480}
              />
            </div>
          </SectionCard>
        </div>

        {/* ================= RIGHT: upcoming + history ================= */}
        <div className="min-w-0 space-y-4 sm:space-y-5">
          {/* Upcoming */}
          <SectionCard
            className="!h-auto"
            icon={CalendarDays}
            tone="blue"
            title={`Upcoming Appointments (${UPCOMING.length})`}
            action={<AddButton text="Schedule Appointment" onClick={() => {}} />}
          >
                         <div className="divide-y divide-border overflow-hidden rounded-xl border border-border">
              {UPCOMING.map((u) => (
                <div
                  key={`${u.month}-${u.day}`}
                  className="relative flex flex-col gap-3 px-4 py-3 transition-colors duration-200 hover:bg-primary/[0.04] 2xl:grid 2xl:grid-cols-[72px_170px_minmax(0,1fr)_minmax(0,1.2fr)_auto] 2xl:items-stretch 2xl:gap-0 2xl:pr-14"
                >
                  {/* 3 dots: top-right when narrow, vertically centered on 2xl */}
                  <button
                    type="button"
                    aria-label={`More actions for ${u.type}`}
                    className="absolute right-2 top-2 flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-label transition-colors hover:bg-primary/10 hover:text-primary 2xl:right-3 2xl:top-1/2 2xl:-translate-y-1/2"
                  >
                    <MoreVertical className="h-3.5 w-3.5" />
                  </button>

                  {/* Row 1 (mobile): date badge + time + tag. On 2xl these become grid columns. */}
                  <div className="flex items-center gap-3 pr-8 2xl:contents">
                    {/* Date badge */}
                    <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-lg border border-border bg-primary/5 2xl:self-center">
                      <span className="text-[10px] font-semibold uppercase text-danger">{u.month}</span>
                      <span className="text-lg font-semibold leading-none text-heading">{u.day}</span>
                      <span className="text-[10px] text-body">{u.weekday}</span>
                    </div>

                    {/* Time (+ tag underneath, hidden on 2xl) */}
                    <div className="flex min-w-0 flex-1 flex-col items-start gap-2 2xl:flex-none 2xl:justify-center 2xl:px-4">
                      <p className="whitespace-nowrap text-xs text-heading">{u.time}</p>
                      <span className="2xl:hidden">
                        <Tags text="Scheduled" tone="success" />
                      </span>
                    </div>
                  </div>

                  {/* Row 2 (mobile): type + provider, 2 columns. On 2xl these become grid columns. */}
                  <div className="grid grid-cols-2 items-center gap-x-3 2xl:contents">
                    {/* Type + mode (divider on its left on 2xl) */}
                    <div className="min-w-0 2xl:flex 2xl:items-center 2xl:justify-start 2xl:border-l 2xl:border-border 2xl:px-4">
                      <div className="min-w-0 space-y-1">
                        <p className="truncate text-sm font-medium text-heading">{u.type}</p>
                        <ModeLabel mode={u.mode} />
                      </div>
                    </div>

                    {/* Provider (divider on its left on 2xl) */}
                    <div className="flex min-w-0 items-center gap-2 border-l border-border pl-3 sm:gap-3 2xl:justify-start 2xl:px-4">
                      <Avatar name={u.provider} size="h-8 w-8 sm:h-10 sm:w-10" />
                      <div className="min-w-0">
                        <Content title={u.provider} description={u.dept} truncate />
                      </div>
                    </div>
                  </div>

                  {/* Tag at the right, only on 2xl */}
                  <span className="hidden 2xl:flex 2xl:items-center 2xl:justify-start 2xl:pl-4">
                    <Tags text="Scheduled" tone="success" />
                  </span>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* History */}
          <SectionCard
            className="!h-auto"
            icon={ClipboardList}
            tone="blue"
            title={`Appointment History (${HISTORY.length + 5})`}
            action={
              HISTORY.length > 0 ? (
                <EditButton section="Appointment History" variant="viewAll" onEdit={() => {}} />
              ) : undefined
            }
          >
            <Table columns={HISTORY_COLUMNS} rows={historyRows} />
          </SectionCard>
        </div>
      </StickyColumns>
    </div>
  );
};

export default Appointments;
