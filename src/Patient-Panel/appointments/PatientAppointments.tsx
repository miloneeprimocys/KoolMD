"use client";

import React, { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Calendar,
  CalendarDays,
  CalendarX,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Clock,
  FileText,
  History,
  MapPin,
  Star,
  Video,
  XCircle,
  type LucideIcon,
} from "lucide-react";

import Actions from "@/components/Actions";
import AddButton from "@/components/Addbutton";
import Content from "@/components/Content";
import DeleteDialog from "@/components/Deletedialog";
import EditButton from "@/components/EditButton";
import ImportButton from "@/components/ImportButton";
import Name from "@/components/Name";
import Pagination from "@/components/Pagination";
import SearchAndFilter from "@/components/Searchandfilter";
import Table from "@/components/Table";
import TableStatus from "@/components/TableStatus";
import { type TableColumn } from "@/components/Tableheader";
import Tags, { type TagTone } from "@/components/Tags";
import { cardCls } from "@/providers/Shared";
import Tabs from "@/components/Tabs";

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

/* ---------- Today's schedule (clinician view) ---------- */
type IntakeStatus = "Intake Complete" | "Intake Pending";
type VisitStatus = "Checked In" | "Scheduled" | "Confirmed";

type TodayRow = {
  id: string;
  time: string;
  patient: string;
  sub: string;
  visit: string;
  intake: IntakeStatus;
  status: VisitStatus;
};

const TODAY_ROWS: TodayRow[] = [
  { id: "T-1", time: "10:00 AM", patient: "Emily Carter", sub: "32 y • F • MRN: KM-002487", visit: "Follow-up Visit", intake: "Intake Complete", status: "Checked In" },
  { id: "T-2", time: "10:30 AM", patient: "James Mitchell", sub: "45 y • M • MRN: KM-002531", visit: "Initial Consultation", intake: "Intake Pending", status: "Scheduled" },
  { id: "T-3", time: "11:00 AM", patient: "Sophia Reed", sub: "29 y • F • MRN: KM-002451", visit: "Follow-up Visit", intake: "Intake Complete", status: "Confirmed" },
  { id: "T-4", time: "11:30 AM", patient: "Daniel Brooks", sub: "41 y • M • MRN: KM-002384", visit: "Chronic Care", intake: "Intake Complete", status: "Scheduled" },
  { id: "T-5", time: "12:00 PM", patient: "Olivia Hayes", sub: "36 y • F • MRN: KM-002558", visit: "Initial Consultation", intake: "Intake Pending", status: "Scheduled" },
  { id: "T-6", time: "02:00 PM", patient: "William Scott", sub: "58 y • M • MRN: KM-002390", visit: "Follow-up Visit", intake: "Intake Complete", status: "Confirmed" },
  { id: "T-7", time: "02:30 PM", patient: "Isabella Martin", sub: "27 y • F • MRN: KM-002523", visit: "Urgent Care", intake: "Intake Complete", status: "Checked In" },
  { id: "T-8", time: "03:00 PM", patient: "Henry Adams", sub: "62 y • M • MRN: KM-002602", visit: "Follow-up Visit", intake: "Intake Pending", status: "Scheduled" },
];

const INTAKE_TONES: Record<IntakeStatus, TagTone> = { "Intake Complete": "success", "Intake Pending": "warning" };
const VISIT_TONES: Record<VisitStatus, TagTone> = { "Checked In": "violet", Scheduled: "neutral", Confirmed: "success" };

type TabKey = "today" | "upcoming" | "past" | "cancelled";

const STATUS_TONES: Record<Status, TagTone> = { Confirmed: "success", Completed: "info", Cancelled: "danger" };

const BASE = "/my-appointments";
const BOOK_HREF = "/find-provider";
const REVIEW_HREF = "/review-intake-chart";
const PAGE_SIZE = 5;
const TODAY_PAGE_SIZE = 10;

const initialsOf = (name: string) =>
  name
    .replace(/^Dr\.\s*/i, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

const dayLabel = (offset: number) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
};

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
/*  Today tab: the day's schedule                                    */
/* ---------------------------------------------------------------- */
const VISIT_FILTER = "All Visit Types";
const INTAKE_FILTER = "All Intake Statuses";
const STATUS_FILTER = "All Appointment Statuses";
const EMPTY_FILTERS: Record<string, string> = { [VISIT_FILTER]: "", [INTAKE_FILTER]: "", [STATUS_FILTER]: "" };

const TODAY_COLUMNS: TableColumn[] = [
  { key: "time", label: "Time" },
  { key: "patient", label: "Patient" },
  { key: "visit", label: "Visit Type" },
  { key: "intake", label: "Intake Status" },
  { key: "status", label: "Appointment Status" },
  { key: "actions", label: "Actions", header: <div className="flex w-full items-center justify-center">Actions</div> },
];

const TodayAppointments = ({ onView }: { onView: (row: TodayRow) => void }) => {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [dayOffset, setDayOffset] = useState(0);

  // The static schedule belongs to today; other days show an empty state until you wire the API.
  const dayRows = dayOffset === 0 ? TODAY_ROWS : [];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return dayRows.filter((r) => {
      if (q && ![r.patient, r.sub, r.visit].some((f) => f.toLowerCase().includes(q))) return false;
      if (filters[VISIT_FILTER] && r.visit !== filters[VISIT_FILTER]) return false;
      if (filters[INTAKE_FILTER] && r.intake !== filters[INTAKE_FILTER]) return false;
      if (filters[STATUS_FILTER] && r.status !== filters[STATUS_FILTER]) return false;
      return true;
    });
  }, [dayRows, search, filters]);

  const totalPages = Math.max(Math.ceil(filtered.length / TODAY_PAGE_SIZE), 1);
  const safePage = Math.min(page, totalPages);
  const visible = filtered.slice((safePage - 1) * TODAY_PAGE_SIZE, safePage * TODAY_PAGE_SIZE);

  const rows = visible.map((r) => ({
    time: <Content title={r.time} />,
    patient: <Name name={r.patient} sub={r.sub} truncate />,
    visit: (
      <span className="flex items-center gap-2 text-sm text-heading">
        <ClipboardList className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
        <span className="whitespace-nowrap">{r.visit}</span>
      </span>
    ),
    intake: <Tags text={r.intake} tone={INTAKE_TONES[r.intake]} size="xs" />,
    status: <Tags text={r.status} tone={VISIT_TONES[r.status]} size="xs" />,
    actions: (
      <div className="flex w-full items-center justify-center gap-1">
        <Actions
          actions={["view", "more"]}
          onAction={(action) => {
            if (action === "view") onView(r);
          }}
          size="sm"
        />
      </div>
    ),
  }));

  const dateNav = (
    <div className="flex items-center gap-1 rounded-xl border border-border bg-card px-2 py-1.5">
      <Calendar className="mx-1 h-4 w-4 text-primary" aria-hidden="true" />
      <span className="px-1 text-sm font-medium text-heading">{dayLabel(dayOffset)}</span>
      {/* <button
        type="button"
        aria-label="Previous day"
        onClick={() => {
          setDayOffset((d) => d - 1);
          setPage(1);
        }}
        className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-body transition-colors hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button
        type="button"
        aria-label="Next day"
        onClick={() => {
          setDayOffset((d) => d + 1);
          setPage(1);
        }}
        className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-body transition-colors hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
      >
        <ChevronRight className="h-4 w-4" />
      </button> */}
    </div>
  );

  return (
    <section className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="flex items-center gap-2 text-base font-semibold text-heading">
          <CalendarDays className="h-5 w-5 text-primary" />
          {dayOffset === 0 ? "Today's Appointments" : "Appointments"}
        </h3>
        {dateNav}
      </div>

      <SearchAndFilter
        placeholder="Search patient, MRN or reason for visit"
        value={search}
        onSearch={(v: string) => {
          setSearch(v);
          setPage(1);
        }}
        filters={[
          { label: VISIT_FILTER, options: Array.from(new Set(TODAY_ROWS.map((r) => r.visit))) },
          { label: INTAKE_FILTER, options: ["Intake Complete", "Intake Pending"] },
          { label: STATUS_FILTER, options: ["Checked In", "Scheduled", "Confirmed"] },
        ]}
        selectedFilters={filters}
        onFilterChange={(label: string, value: string) => {
          setFilters((prev) => ({ ...prev, [label]: value }));
          setPage(1);
        }}               
        showDateRange={false}     
      />

      <div className="overflow-hidden rounded-[14px] border border-border bg-card">
        {visible.length === 0 ? (
          <TableStatus variant="empty" message="No appointments found for this day." />
        ) : (
          <Table columns={TODAY_COLUMNS} rows={rows} bordered={false} />
        )}
      </div>

      {filtered.length > 0 && (
        <Pagination
          page={safePage}
          totalPages={totalPages}
          totalItems={filtered.length}
          pageSize={TODAY_PAGE_SIZE}
          itemLabel="appointments"
          onChange={setPage}
        />
      )}
    </section>
  );
};

/* ---------------------------------------------------------------- */
/*  Page                                                             */
/* ---------------------------------------------------------------- */
const PatientAppointments = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedTab = searchParams.get("tab");
  const tab: TabKey =
    requestedTab === "upcoming" || requestedTab === "past" || requestedTab === "cancelled" ? requestedTab : "today";

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
  const renderCard = (a: Appointment, variant: Exclude<TabKey, "today">) => {
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
    { key: "today", label: "Today", Icon: CalendarDays, count: TODAY_ROWS.length },
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
      <Tabs ariaLabel="Appointment status"
      >
        <div className="flex min-w-max gap-1 sm:gap-3">
          {tabs.map(({ key, label, Icon, count }) => {
            const active = key === tab;
            return (
              <button
                key={key}
                role="tab"
                type="button"
                aria-selected={active}
                onClick={() => changeTab(key)}
                className={`-mb-px flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap border-b-2 px-3 pb-2.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 sm:px-4 sm:pb-3 ${
                  active ? "border-primary font-semibold text-primary" : "border-transparent text-body hover:text-heading"
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
      </Tabs>

      {/* Today */}
      {tab === "today" && (
        <TodayAppointments onView={(row) => router.push(`${REVIEW_HREF}?id=${encodeURIComponent(row.id)}`)} />
      )}

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
      
      <DeleteDialog
        open={cancelTarget !== null}
        onClose={() => setCancelTarget(null)}
        onConfirm={confirmCancel}
        icon={<CalendarX className="h-7 w-7" />}
        title="Cancel this appointment?"
        description={
          cancelTarget
            ? `Your appointment with ${cancelTarget.doctor} on ${cancelTarget.date} will be cancelled. You can book a new one at any time.`
            : undefined
        }
        cancelText="Keep Appointment"
        confirmText="Yes, Cancel"
      />
    </div>
  );
};

export default PatientAppointments;