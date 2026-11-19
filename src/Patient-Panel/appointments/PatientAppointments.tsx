"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  History,
  MapPin,
  MoreVertical,
  Star,
  Video,
  XCircle,
  type LucideIcon,
} from "lucide-react";

import AddButton from "@/components/Addbutton";
import EditButton from "@/components/EditButton";
import ImportButton from "@/components/ImportButton";
import Pagination from "@/components/Pagination";
import TableStatus from "@/components/TableStatus";
import Tags, { type TagTone } from "@/components/Tags";
import { cardCls } from "@/providers/Shared";

/* ---------------------------------------------------------------- */
/*  Static data (replace with API / redux selector)                  */
/* ---------------------------------------------------------------- */
type Status = "Confirmed" | "Completed" | "Cancelled";

type Appointment = {
  id: string;
  doctor: string;
  specialty: string;
  rating: string;
  reviews: number;
  date: string;
  time: string;
  type: "Video Consultation" | "In-Person Visit";
  status: Status;
};

const APPOINTMENTS: Appointment[] = [
  // Upcoming
  { id: "APT-2001", doctor: "Dr. John Carter", specialty: "Internal Medicine", rating: "4.9", reviews: 320, date: "Wed, Oct 14, 2026", time: "10:30 AM – 11:00 AM (30 min)", type: "Video Consultation", status: "Confirmed" },
  { id: "APT-2002", doctor: "Dr. Sarah Miller", specialty: "Dermatology", rating: "4.8", reviews: 210, date: "Thu, Oct 22, 2026", time: "4:00 PM – 4:30 PM (30 min)", type: "In-Person Visit", status: "Confirmed" },
  // Past
  { id: "PV-1008", doctor: "Dr. John Carter", specialty: "Internal Medicine", rating: "4.9", reviews: 320, date: "Mon, Sep 28, 2026", time: "10:00 AM – 10:30 AM (30 min)", type: "Video Consultation", status: "Completed" },
  { id: "PV-1007", doctor: "Dr. Sarah Miller", specialty: "Dermatology", rating: "4.8", reviews: 210, date: "Wed, Aug 20, 2026", time: "3:00 PM – 3:30 PM (30 min)", type: "Video Consultation", status: "Completed" },
  { id: "PV-1006", doctor: "Dr. Michael Lee", specialty: "Cardiology", rating: "4.7", reviews: 180, date: "Fri, Jul 17, 2026", time: "11:00 AM – 11:30 AM (30 min)", type: "In-Person Visit", status: "Completed" },
  { id: "PV-1005", doctor: "Dr. Emily Parker", specialty: "Pediatrics", rating: "4.9", reviews: 260, date: "Tue, Jun 23, 2026", time: "9:30 AM – 10:00 AM (30 min)", type: "Video Consultation", status: "Completed" },
  { id: "PV-1004", doctor: "Dr. Robert Williams", specialty: "Orthopedics", rating: "4.6", reviews: 140, date: "Mon, May 18, 2026", time: "2:00 PM – 2:45 PM (45 min)", type: "In-Person Visit", status: "Completed" },
  { id: "PV-1003", doctor: "Dr. John Carter", specialty: "Internal Medicine", rating: "4.9", reviews: 320, date: "Thu, Apr 9, 2026", time: "10:00 AM – 10:30 AM (30 min)", type: "Video Consultation", status: "Completed" },
  { id: "PV-1002", doctor: "Dr. Susan Davis", specialty: "Gynecology", rating: "4.8", reviews: 205, date: "Wed, Mar 11, 2026", time: "4:00 PM – 4:30 PM (30 min)", type: "In-Person Visit", status: "Completed" },
  { id: "PV-1001", doctor: "Dr. Richard Kim", specialty: "Neurology", rating: "4.7", reviews: 160, date: "Fri, Feb 6, 2026", time: "1:00 PM – 1:30 PM (30 min)", type: "Video Consultation", status: "Completed" },
  // Cancelled
  { id: "APT-1999", doctor: "Dr. Thomas Patel", specialty: "Ophthalmology", rating: "4.7", reviews: 150, date: "Tue, Sep 15, 2026", time: "5:00 PM – 5:30 PM (30 min)", type: "In-Person Visit", status: "Cancelled" },
];

type TabKey = "upcoming" | "past" | "cancelled";

const STATUS_TONES: Record<Status, TagTone> = { Confirmed: "success", Completed: "info", Cancelled: "danger" };

const BASE = "/my-appointments";
const BOOK_HREF = "/find-provider";
const PAGE_SIZE = 5;

const initialsOf = (name: string) =>
  name
    .replace(/^Dr\.\s*/i, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

/* ---------------------------------------------------------------- */
/*  Small pieces                                                     */
/* ---------------------------------------------------------------- */
const DetailLine = ({ Icon, text }: { Icon: LucideIcon; text: string }) => (
  <p className="flex items-center gap-2.5 text-sm text-heading">
    <Icon className="h-4 w-4 shrink-0 text-primary" />
    <span className="min-w-0">{text}</span>
  </p>
);

/** "⋮" menu of a card. */
const KebabMenu = ({ items }: { items: { label: string; onClick: () => void; danger?: boolean }[] }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative shrink-0">
    
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} aria-hidden="true" />
          <div role="menu" className="absolute right-0 top-full z-20 mt-1 w-48 overflow-hidden rounded-xl border border-border bg-card py-1 shadow-xl">
            {items.map((item) => (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  item.onClick();
                }}
                className={`block w-full cursor-pointer px-4 py-2.5 text-left text-sm hover:bg-primary/5 ${item.danger ? "text-danger" : "text-heading"}`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

/* ---------------------------------------------------------------- */
/*  Page                                                             */
/* ---------------------------------------------------------------- */
const PatientAppointments = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedTab = searchParams.get("tab");
  const tab: TabKey = requestedTab === "past" || requestedTab === "cancelled" ? requestedTab : "upcoming";

  const [appointments, setAppointments] = useState<Appointment[]>(APPOINTMENTS);
  const [cancelTarget, setCancelTarget] = useState<Appointment | null>(null);
  const [pastPage, setPastPage] = useState(1);

  const upcoming = appointments.filter((a) => a.status === "Confirmed");
  const past = appointments.filter((a) => a.status === "Completed");
  const cancelled = appointments.filter((a) => a.status === "Cancelled");

  const changeTab = (next: TabKey) => {
    setPastPage(1);
    router.push(`${BASE}?tab=${next}`, { scroll: false });
  };

  const confirmCancel = () => {
    if (!cancelTarget) return;
    // TODO: dispatch(cancelAppointment(cancelTarget.id))
    setAppointments((prev) => prev.map((a) => (a.id === cancelTarget.id ? { ...a, status: "Cancelled" } : a)));
    setCancelTarget(null);
  };

  const goJoin = (a: Appointment) => router.push(`${BASE}/join-consultation?id=${a.id}`);
  const goSummary = (a: Appointment) => router.push(`${BASE}/visit-summary?id=${a.id}`);
  /* ---------- One appointment card ---------- */
  const renderCard = (a: Appointment, variant: TabKey) => {
    const video = a.type === "Video Consultation";

    const menuItems =
      variant === "upcoming"
        ? [
            ...(video ? [{ label: "Join consultation", onClick: () => goJoin(a) }] : []),
            { label: "Reschedule", onClick: () => router.push(BOOK_HREF) },
            { label: "Cancel appointment", onClick: () => setCancelTarget(a), danger: true },
          ]
        : variant === "past"
          ? [
              { label: "View summary", onClick: () => goSummary(a) },
              { label: "Book follow-up", onClick: () => router.push(BOOK_HREF) },
            ]
          : [{ label: "Book again", onClick: () => router.push(BOOK_HREF) }];

    return (
      <li key={a.id} className={`${cardCls} grid items-center gap-4 sm:p-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)_auto]`}>
        {/* Doctor */}
        <div className="flex min-w-0 items-center gap-4">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-lg font-semibold text-primary">
            {initialsOf(a.doctor)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-base font-semibold text-heading">{a.doctor}</p>
            <p className="text-sm text-body">{a.specialty}</p>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-body">
              <Star className="h-3.5 w-3.5 fill-current text-warning" />
              <span className="font-semibold text-heading">{a.rating}</span> ({a.reviews} reviews)
            </p>
          </div>
        </div>

        {/* When / how */}
        <div className="space-y-2 md:border-l md:border-divider md:pl-5">
          <DetailLine Icon={Calendar} text={a.date} />
          <DetailLine Icon={Clock} text={a.time} />
          <DetailLine Icon={video ? Video : MapPin} text={a.type} />
        </div>

        {/* Status + actions */}
        <div className="flex items-start justify-between gap-3 md:justify-end">
          <div className="flex flex-col items-start gap-2.5">
            <Tags text={a.status} tone={STATUS_TONES[a.status]} size="xs" />
            {variant === "upcoming" && video && (
              <AddButton text="Join Consultation" icon={<Video className="h-4 w-4" />} onClick={() => goJoin(a)} className="whitespace-nowrap" />
            )}
            {variant === "upcoming" && !video && (
              <div className="flex flex-wrap gap-2">
                <ImportButton text="Reschedule" icon={<Calendar className="h-4 w-4" />} onClick={() => router.push(BOOK_HREF)} className="whitespace-nowrap" />
                <ImportButton text="Cancel" icon={null} onClick={() => setCancelTarget(a)} className="whitespace-nowrap" />
              </div>
            )}
            {variant === "past" && (
              <ImportButton text="View Summary" icon={<FileText className="h-4 w-4" />} onClick={() => goSummary(a)} className="whitespace-nowrap" />
            )}
            {variant === "cancelled" && (
              <ImportButton text="Book Again" icon={<Calendar className="h-4 w-4" />} onClick={() => router.push(BOOK_HREF)} className="whitespace-nowrap" />
            )}
          </div>
          <KebabMenu items={menuItems} />
        </div>
      </li>
    );
  };

  const sectionTitle = (Icon: LucideIcon, text: string, extra?: React.ReactNode) => (
    <div className="mb-3 flex items-center justify-between gap-3">
      <h3 className="flex items-center gap-2 text-base font-semibold text-heading">
        <Icon className="h-5 w-5 text-primary" />
        {text}
      </h3>
      {extra}
    </div>
  );

  const tabs: { key: TabKey; label: string; Icon: LucideIcon; count: number }[] = [
    { key: "upcoming", label: "Upcoming", Icon: Calendar, count: upcoming.length },
    { key: "past", label: "Past", Icon: CheckCircle2, count: past.length },
    { key: "cancelled", label: "Cancelled", Icon: XCircle, count: cancelled.length },
  ];

  const pastTotalPages = Math.max(Math.ceil(past.length / PAGE_SIZE), 1);
  const pastSafePage = Math.min(pastPage, pastTotalPages);
  const pastVisible = past.slice((pastSafePage - 1) * PAGE_SIZE, pastSafePage * PAGE_SIZE);

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-4 sm:space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-heading sm:text-xl 2xl:text-2xl">Appointments</h2>
          <p className="mt-0.5 text-sm text-body">View and manage all your appointments in one place.</p>
        </div>
        <AddButton text="Book New Appointment" onClick={() => router.push(BOOK_HREF)} className="shrink-0 whitespace-nowrap" />
      </div>

      {/* Tabs */}
      <div
        role="tablist"
        aria-label="Appointment status"
        className="overflow-x-auto overscroll-x-contain rounded-2xl border border-border bg-card p-1.5"
      >
        <div className="flex min-w-max gap-1">
          {tabs.map(({ key, label, Icon, count }) => {
            const active = key === tab;
            return (
              <button
                key={key}
                role="tab"
                type="button"
                aria-selected={active}
                onClick={() => changeTab(key)}
                className={`flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-xl px-3 py-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 sm:px-4 ${
                  active ? "bg-primary/10 font-semibold text-primary" : "text-heading hover:bg-primary/5"
                }`}
              >
                <Icon className="hidden h-4 w-4 shrink-0 sm:block" />
                <span>
                  {label} ({count})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Upcoming */}
      {tab === "upcoming" && (
        <div className="space-y-6">
          <section>
            {sectionTitle(Calendar, "Upcoming Appointments")}
            {upcoming.length === 0 ? (
              <div className={cardCls}>
                <TableStatus variant="empty" message="You have no upcoming appointments." />
              </div>
            ) : (
              <ul className="space-y-3">{upcoming.map((a) => renderCard(a, "upcoming"))}</ul>
            )}
          </section>

          <section>
            {sectionTitle(
              History,
              "Past Appointments",
              past.length > 0 && (
                <EditButton
                  section="Past Appointments"
                  variant="viewAll"
                  onEdit={() => changeTab("past")}
                />
              ),
            )}
            <ul className="space-y-3">{past.slice(0, 2).map((a) => renderCard(a, "past"))}</ul>
          </section>
        </div>
      )}

      {/* Past */}
      {tab === "past" && (
        <section>
          {sectionTitle(History, "Past Appointments")}
          {past.length === 0 ? (
            <div className={cardCls}>
              <TableStatus variant="empty" message="No past appointments yet." />
            </div>
          ) : (
            <div className="space-y-3">
              <ul className="space-y-3">{pastVisible.map((a) => renderCard(a, "past"))}</ul>
              <Pagination
                page={pastSafePage}
                totalPages={pastTotalPages}
                totalItems={past.length}
                pageSize={PAGE_SIZE}
                itemLabel="appointments"
                onChange={setPastPage}
              />
            </div>
          )}
        </section>
      )}

      {/* Cancelled */}
      {tab === "cancelled" && (
        <section>
          {sectionTitle(XCircle, "Cancelled Appointments")}
          {cancelled.length === 0 ? (
            <div className={cardCls}>
              <TableStatus variant="empty" message="You have no cancelled appointments." />
            </div>
          ) : (
            <ul className="space-y-3">{cancelled.map((a) => renderCard(a, "cancelled"))}</ul>
          )}
        </section>
      )}
      
      {/* Cancel confirmation */}
      {cancelTarget && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 p-4" onMouseDown={() => setCancelTarget(null)} role="presentation">
          <div
            role="alertdialog"
            aria-modal="true"
            aria-label="Cancel appointment"
            className="w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-2xl sm:p-6"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-semibold text-heading">Cancel this appointment?</h3>
            <p className="mt-2 text-sm text-body">
              Your appointment with {cancelTarget.doctor} on {cancelTarget.date} will be cancelled. You can book a new one at any time.
            </p>
            <div className="mt-5 flex flex-row justify-end gap-2 sm:gap-3">
              <ImportButton text="Keep Appointment" icon={null} className="flex-1 sm:flex-none" onClick={() => setCancelTarget(null)} />
              <AddButton text="Yes, Cancel" icon={null} className="flex-1 sm:flex-none" onClick={confirmCancel} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientAppointments;