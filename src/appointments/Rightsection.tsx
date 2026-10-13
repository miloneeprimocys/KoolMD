"use client";

import React, { useEffect, useRef } from "react";
import {
  Calendar,
  CalendarDays,
  Check,
  ChevronDown,
  ClipboardList,
  Clock,
  Download,
  FileText,
  Mail,
  MapPin,
  MessageSquare,
  MoreVertical,
  Paperclip,
  Pencil,
  Phone,
  Stethoscope,
  StickyNote,
  Trash2,
  User,
  UserX,
  Video,
  X,
  type LucideIcon,
} from "lucide-react";

import Tags, { type TagTone } from "@/components/Tags";

/* ---------------------------------------------------------------- */
/*  Shared helpers (used by every tab)                              */
/* ---------------------------------------------------------------- */
export const checkboxCls =
  "h-4 w-4 cursor-pointer rounded border-border accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30";

export const initials = (name: string) =>
  name
    .replace(/^Dr\.?\s+/i, "")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");

/** Filter dropdowns shared by all tabs (passed to SearchAndFilter). */
export const BASE_FILTERS = [
  {
    label: "All Providers",
    options: [
      "Dr. Sarah Wilson",
      "Dr. Michael Chen",
      "Dr. Emily Carter",
      "Dr. James Miller",
    ],
  },
  {
    label: "All Locations",
    options: ["Sunrise Medical Group", "Downtown Clinic", "Virtual / Telemedicine"],
  },
  {
    label: "All Appointments",
    options: [
      "Follow Up",
      "Initial Consultation",
      "Consultation",
      "Physical Exam",
      "Procedure",
      "Well Child Visit",
      "Lab Results Review",
    ],
  },
];

export const STATUS_TONE: Record<string, TagTone> = {
  Confirmed: "success",
  Scheduled: "info",
  "In Progress": "info",
  Completed: "neutral",
  Cancelled: "danger",
  "No Show": "warning",
  Waiting: "info",
};

/* ---------- Status chips (All (128), Scheduled (56) …) ---------- */
export type ChipItem = {
  label: string;
  count: number;
  /** dot colour class */
  dot?: string;
  /** inactive tint classes */
  tint?: string;
};

export const StatusChips = ({
  items,
  active,
  onChange,
}: {
  items: ChipItem[];
  active: string;
  onChange: (label: string) => void;
}) => (
  <div className="flex flex-wrap gap-2">
    {items.map((i) => {
      const on = i.label === active;
      return (
        <button
          key={i.label}
          type="button"
          onClick={() => onChange(i.label)}
          className={`inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border px-3 text-xs font-medium whitespace-nowrap transition-colors ${
            on
              ? "border-primary bg-primary/10 text-primary"
              : `${i.tint ?? "border-border bg-card"} text-heading hover:border-primary/40`
          }`}
        >
          <span className={`h-2 w-2 rounded-full ${i.dot ?? "bg-primary"}`} />
          {i.label} ({i.count})
        </button>
      );
    })}
  </div>
);

/* ---------------------------------------------------------------- */
/*  Panel presets (static data)                                     */
/* ---------------------------------------------------------------- */
export type PanelVariant = "appointment" | "request" | "waiting" | "history";

type Detail = {
  icon: LucideIcon;
  label: string;
  value?: string;
  sub?: string;
  tag?: { text: string; tone: TagTone };
  file?: string;
};

type Config = {
  title: string;
  /** regular-weight values (calendar panel) */
  plain?: boolean;
  edit?: boolean;
  menu?: boolean;
  status?: { text: string; tone: TagTone };
  patient: { name: string; meta: string; phone: string; email: string };
  details: Detail[];
};

const PRESETS: Record<PanelVariant, Config> = {
  appointment: {
    title: "Appointment Details",
    plain: true,
    edit: true,
    status: { text: "Confirmed", tone: "success" },
    patient: {
      name: "Olivia Bennett",
      meta: "DOB: Jan 14, 1990 (36y)",
      phone: "+1 415 555 0198",
      email: "olivia.bennett@email.com",
    },
    details: [
      { icon: ClipboardList, label: "Appointment Type", value: "Follow Up" },
      { icon: Calendar, label: "Date", value: "Mon, Oct 12, 2026" },
      { icon: Clock, label: "Time", value: "09:00 AM – 09:30 AM (30 minutes)" },
      { icon: User, label: "Provider", value: "Dr. Sarah Wilson", sub: "Internal Medicine" },
      { icon: MapPin, label: "Location", value: "Sunrise Medical Group – Los Angeles, CA" },
      { icon: Stethoscope, label: "Visit Type", value: "In-person" },
      { icon: FileText, label: "Reason for Visit", value: "Routine follow up and lab results review." },
      { icon: StickyNote, label: "Notes", value: "Patient to bring previous test reports." },
    ],
  },
  request: {
    title: "Request Details",
    patient: {
      name: "Ava Taylor",
      meta: "PID-11234 • 27Y • Female",
      phone: "+1 415 555 0198",
      email: "ava.taylor@email.com",
    },
    details: [
      { icon: ClipboardList, label: "Requested Appointment", value: "Initial Consultation", sub: "Dermatology" },
      { icon: CalendarDays, label: "Preferred Date & Time", value: "Oct 15, 2026", sub: "10:00 AM (30 min)" },
      { icon: User, label: "Preferred Provider", value: "Dr. Emily Carter" },
      { icon: MapPin, label: "Preferred Location", value: "Sunrise Medical Group – Los Angeles, CA" },
      { icon: FileText, label: "Reason for Visit", value: "Skin concern and acne treatment consultation." },
      { icon: StickyNote, label: "Additional Notes", value: "Prefer in-person visit. Flexible with time if needed." },
      { icon: Clock, label: "Submitted On", value: "Oct 10, 2026, 02:14 PM" },
    ],
  },
  waiting: {
    title: "Patient Details",
    patient: {
      name: "Olivia Bennett",
      meta: "PID-10234 • 36Y • Female",
      phone: "+1 415 555 0198",
      email: "olivia.bennett@email.com",
    },
    details: [
      { icon: ClipboardList, label: "Appointment Type", value: "Follow Up" },
      { icon: User, label: "Provider", value: "Dr. Sarah Wilson", sub: "Internal Medicine" },
      { icon: CalendarDays, label: "Date & Time", value: "Oct 12, 2026 at 09:00 AM" },
      { icon: Clock, label: "Check-in Time", value: "08:55 AM (5 min ago)" },
      { icon: Clock, label: "Wait Time", tag: { text: "5 minutes", tone: "success" } },
      { icon: MapPin, label: "Location", value: "Sunrise Medical Group – Los Angeles, CA" },
      { icon: Stethoscope, label: "Visit Type", value: "In-person" },
      { icon: FileText, label: "Reason for Visit", value: "Routine follow up and lab results review." },
      { icon: StickyNote, label: "Notes", value: "Patient completed intake forms." },
    ],
  },
  history: {
    title: "Appointment Details",
    patient: {
      name: "Olivia Bennett",
      meta: "PID-10234 • 36Y • Female",
      phone: "+1 415 555 0198",
      email: "olivia.bennett@email.com",
    },
    details: [
      { icon: ClipboardList, label: "Appointment Type", value: "Follow Up", sub: "Routine checkup" },
      { icon: User, label: "Provider", value: "Dr. Sarah Wilson", sub: "Internal Medicine" },
      { icon: CalendarDays, label: "Date & Time", value: "Oct 12, 2026", sub: "09:00 AM – 09:30 AM (30 min)" },
      { icon: MapPin, label: "Location", value: "Sunrise Medical Group – Los Angeles, CA" },
      { icon: Stethoscope, label: "Visit Type", value: "In-person" },
      { icon: Clock, label: "Status", tag: { text: "Completed", tone: "neutral" } },
      { icon: Clock, label: "Check-in Time", value: "08:55 AM" },
      { icon: Clock, label: "Check-out Time", value: "09:32 AM" },
      { icon: FileText, label: "Notes", value: "Patient is doing well. Continue current medication. Next follow up in 3 months." },
      { icon: Paperclip, label: "Attachments", file: "Lab_Report_Oct12.pdf" },
    ],
  },
};

/* ---------------------------------------------------------------- */
/*  Dynamic data for the "appointment" variant (Calendar View)      */
/* ---------------------------------------------------------------- */
export type PanelData = Partial<Pick<Config, "status" | "patient" | "details">>;

export type AppointmentInfo = {
  patient: string;
  type: string;
  date: Date;
  /** minutes from midnight */
  start: number;
  /** minutes */
  dur: number;
  provider: string;
  specialty: string;
  location: string;
  status: string;
};

const clock = (min: number) => {
  const h = Math.floor(min / 60);
  const m = min % 60;
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${String(h12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
};

export const toAppointmentPanel = (a: AppointmentInfo): PanelData => {
  const [first, ...rest] = a.patient.toLowerCase().split(" ");
  const pid = 10000 + (a.patient.split("").reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % 2000);
  return {
    status: { text: a.status, tone: STATUS_TONE[a.status] ?? "neutral" },
    patient: {
      name: a.patient,
      meta: `PID-${pid}`,
      phone: "+1 415 555 0198",
      email: `${first}.${rest.join("")}@email.com`,
    },
    details: [
      { icon: ClipboardList, label: "Appointment Type", value: a.type },
      {
        icon: Calendar,
        label: "Date",
        value: a.date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" }),
      },
      { icon: Clock, label: "Time", value: `${clock(a.start)} – ${clock(a.start + a.dur)} (${a.dur} minutes)` },
      { icon: User, label: "Provider", value: a.provider, sub: a.specialty },
      { icon: MapPin, label: "Location", value: a.location },
      { icon: Stethoscope, label: "Visit Type", value: a.location.includes("Virtual") ? "Telemedicine" : "In-person" },
      { icon: FileText, label: "Reason for Visit", value: "Routine follow up and lab results review." },
      { icon: StickyNote, label: "Notes", value: "Patient to bring previous test reports." },
    ],
  };
};

/* ---------------------------------------------------------------- */
/*  Buttons                                                         */
/* ---------------------------------------------------------------- */
const BTN = {
  success: "border-transparent bg-success text-white hover:bg-success/90",
  outline: "border-primary/30 bg-primary/5 text-primary hover:bg-primary/10",
  danger: "border-danger/40 bg-danger/5 text-danger hover:bg-danger/10",
} as const;

const PanelButton = ({
  tone,
  icon: Icon,
  children,
}: {
  tone: keyof typeof BTN;
  icon: LucideIcon;
  children: string;
}) => (
  <button
    type="button"
    className={`flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-lg border text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${BTN[tone]}`}
  >
    <Icon className="h-4 w-4" />
    {children}
  </button>
);

const SplitButton = ({ text }: { text: string }) => (
  <div className="flex">
    <button
      type="button"
      className="flex h-10 flex-1 cursor-pointer items-center justify-center gap-2 rounded-l-lg bg-primary text-sm font-medium text-white transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
    >
      <Video className="h-4 w-4" />
      {text}
    </button>
    <button
      type="button"
      aria-label="More options"
      className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-r-lg border-l border-white/30 bg-primary text-white transition-colors hover:bg-primary-hover"
    >
      <ChevronDown className="h-4 w-4" />
    </button>
  </div>
);

const PanelActions = ({ variant }: { variant: PanelVariant }) => {
  switch (variant) {
    case "appointment":
      return (
        <>
          <SplitButton text="Join Consultation" />
          <PanelButton tone="outline" icon={Calendar}>Reschedule</PanelButton>
          <PanelButton tone="danger" icon={Trash2}>Cancel Appointment</PanelButton>
        </>
      );
    case "request":
      return (
        <>
          <PanelButton tone="success" icon={Check}>Approve Request</PanelButton>
          <PanelButton tone="danger" icon={X}>Decline Request</PanelButton>
          <PanelButton tone="outline" icon={Calendar}>Suggest Alternative Time</PanelButton>
        </>
      );
    case "waiting":
      return (
        <>
          <SplitButton text="Start Consultation" />
          <PanelButton tone="outline" icon={MessageSquare}>Send Message</PanelButton>
          <PanelButton tone="danger" icon={UserX}>Mark as No Show</PanelButton>
        </>
      );
    case "history":
      return (
        <>
          <PanelButton tone="outline" icon={FileText}>View Patient Record</PanelButton>
          <PanelButton tone="outline" icon={Calendar}>Book New Appointment</PanelButton>
        </>
      );
  }
};

/* ---------------------------------------------------------------- */
/*  Component                                                       */
/* ---------------------------------------------------------------- */
type Props = {
  variant: PanelVariant;
  /** When provided, an X button closes the panel. */
  onClose?: () => void;
  /** Overrides the preset content (used by Calendar View). */
  data?: PanelData;
  className?: string;
  onHeightChange?: (height: number) => void;
};

const iconBtn =
  "flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-body transition-colors hover:bg-heading/5 hover:text-heading focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30";

const RightSection = ({ variant, onClose, data, className = "", onHeightChange }: Props) => {
  const panelRef = useRef<HTMLElement>(null);
  const c: Config = { ...PRESETS[variant], ...(data ?? {}) };
  const p = c.patient;
  const valueCls = c.plain ? "text-sm text-heading" : "text-sm font-semibold text-heading";

  useEffect(() => {
    if (!onHeightChange || !panelRef.current) return;

    const panel = panelRef.current;
    const updateHeight = () => onHeightChange(Math.ceil(panel.getBoundingClientRect().height));
    const observer = new ResizeObserver(updateHeight);

    observer.observe(panel);
    updateHeight();

    return () => observer.disconnect();
  }, [onHeightChange]);

  return (
    <>
      {onClose && (
        <div
          className="fixed inset-x-0 bottom-0 top-14 z-[140] bg-black/40 backdrop-blur-xs xl:top-16 2xl:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        ref={panelRef}
        aria-label={c.title}
        className={`fixed right-0 top-14 z-[150] flex h-[calc(100dvh-3.5rem)] w-full max-w-[420px] flex-col overflow-y-auto border-y border-l border-border bg-card shadow-2xl transition-transform duration-300 animate-in slide-in-from-right xl:top-16 xl:h-[calc(100dvh-4rem)] 2xl:relative 2xl:bottom-auto 2xl:right-auto 2xl:top-auto 2xl:z-auto 2xl:h-auto 2xl:overflow-y-visible 2xl:w-[360px] 2xl:max-w-none 2xl:shrink-0 2xl:rounded-[14px] 2xl:border 2xl:shadow-none 2xl:animate-none hide-scrollbar ${className}`}
      >
      {/* Header */}
      <header className="sticky top-0 z-20 flex shrink-0 items-center justify-between gap-3 bg-card px-4 py-3.5 2xl:static">
        <h3 className="text-sm font-semibold text-heading sm:text-base">{c.title}</h3>
        <div className="flex items-center gap-1">
          {c.edit && (
            <button
              type="button"
              className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border border-primary/30 px-3 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </button>
          )}
          {c.menu && (
            <button type="button" aria-label="More options" className={iconBtn}>
              <MoreVertical className="h-4 w-4" />
            </button>
          )}
          {onClose && (
            <button type="button" aria-label="Close panel" onClick={onClose} className={iconBtn}>
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </header>

      <div className="space-y-4 px-4 pb-4 pt-2">
        {/* Status */}
        {c.status && (
          <div className="inline-flex items-center gap-1">
            <Tags text={c.status.text} tone={c.status.tone} />
            <ChevronDown className="h-4 w-4 text-body" />
          </div>
        )}

        {/* Patient */}
        <div className="flex items-start gap-3">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-base font-semibold text-primary">
            {initials(p.name)}
          </span>
          <div className="min-w-0 space-y-0.5">
            <p className="text-sm font-semibold text-heading sm:text-base">{p.name}</p>
            <p className="text-xs text-body">{p.meta}</p>
            <p className="flex items-center gap-1.5 text-xs text-body">
              <Phone className="h-3 w-3 shrink-0" />
              {p.phone}
            </p>
            <p className="flex items-center gap-1.5 break-all text-xs text-link">
              <Mail className="h-3 w-3 shrink-0" />
              {p.email}
            </p>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-3.5 border-t border-divider pt-4">
          {c.details.map((d) => (
            <div key={d.label} className="flex gap-3">
              <d.icon className="mt-0.5 h-4 w-4 shrink-0 text-body" />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-body">{d.label}</p>
                {d.value && <p className={`mt-0.5 break-words ${valueCls}`}>{d.value}</p>}
                {d.sub && <p className="text-xs text-body">{d.sub}</p>}
                {d.tag && (
                  <div className="mt-1">
                    <Tags text={d.tag.text} tone={d.tag.tone} />
                  </div>
                )}
                {d.file && (
                  <div className="mt-1.5 flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-xs text-primary">
                    <FileText className="h-4 w-4 shrink-0" />
                    <span className="min-w-0 flex-1 truncate">{d.file}</span>
                    <Download className="h-4 w-4 shrink-0 cursor-pointer" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="space-y-2.5">
          <PanelActions variant={variant} />
        </div>
      </div>
      </aside>
    </>
  );
};

export default RightSection;