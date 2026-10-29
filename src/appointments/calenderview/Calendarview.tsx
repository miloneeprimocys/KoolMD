"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useAppDispatch } from "@/hooks/useAppHooks";
import { showModal } from "@/redux/slices/dialogslice";
import { useRouter } from "next/navigation";
import AddButton from "@/components/Addbutton";
import {
  addDays,
  addMonths,
  dayKey,
  fmt,
  sameDay,
  startOfDay,
} from "@/components/Calendar";
import SearchAndFilter from "@/components/Searchandfilter";
import RightSection, {
  BASE_FILTERS,
  toAppointmentPanel,
} from "../Rightsection";
import LeftSection, {
  LOCATIONS,
  PROVIDERS,
} from "./LeftSection";
import MiddleSection, { Appt, ColorKey, View } from "./MiddleSection";

/* ---------------------------------------------------------------- */
/*  Static data                                                     */
/* ---------------------------------------------------------------- */
const FILTERS = [
  ...BASE_FILTERS,
  {
    label: "All Statuses",
    options: ["Scheduled", "Confirmed", "In Progress", "Completed", "Cancelled", "No Show"],
  },
];

/* Appointment template — repeated (with variations) on every weekday */
type Tpl = {
  col: number;
  start: number;
  dur: number;
  type: string;
  color: ColorKey;
  loc: number;
  status: string;
};

const tpl = (
  col: number,
  time: string,
  type: string,
  color: ColorKey,
  dur = 30,
  loc = 0,
  status = "Scheduled",
): Tpl => {
  const [hm, ap] = time.split(" ");
  const [hh, mm] = hm.split(":").map(Number);
  const h = ap === "PM" && hh !== 12 ? hh + 12 : hh;
  return { col, start: h * 60 + mm, dur, type, color, loc, status };
};

const TEMPLATE: Tpl[] = [
  tpl(0, "9:00 AM", "Follow Up", "blue", 30, 0, "Confirmed"),
  tpl(0, "10:30 AM", "Initial Consultation", "green"),
  tpl(0, "1:00 PM", "Follow Up", "blue", 30, 2, "Confirmed"),
  tpl(0, "3:00 PM", "Physical Exam", "purple", 45),
  tpl(1, "9:30 AM", "Consultation", "red", 45),
  tpl(1, "11:00 AM", "Follow Up", "blue", 30, 0, "Confirmed"),
  tpl(1, "2:00 PM", "Consultation", "red", 45),
  tpl(1, "4:00 PM", "Follow Up", "blue"),
  tpl(2, "9:00 AM", "Initial Consultation", "green", 45, 1),
  tpl(2, "12:00 PM", "Follow Up", "blue", 30, 2, "Confirmed"),
  tpl(2, "2:30 PM", "Procedure", "purple", 45, 1),
  tpl(2, "4:30 PM", "Follow Up", "blue", 30, 1),
  tpl(3, "10:00 AM", "Well Child Visit", "amber"),
  tpl(3, "11:30 AM", "Follow Up", "blue"),
  tpl(3, "1:30 PM", "Consultation", "red"),
  tpl(3, "3:30 PM", "Physical Exam", "purple", 45),
];

const PATIENTS = [
  "Olivia Bennett", "Liam Carter", "Emma Davis", "Noah Wilson",
  "Sophia Martinez", "Ethan Brown", "Ava Taylor", "Mason Lee",
  "Isabella Garcia", "Lucas Anderson", "Mia Thomas", "Benjamin Harris",
  "Charlotte White", "Henry Martin", "Amelia Thompson", "Elijah Clark",
];

/* Static demo data for any date: weekdays only, varied per day */
const DEMO_DAY = new Date(2026, 9, 12);

const dayAppts = (date: Date): Appt[] => {
  const dow = date.getDay();
  if (dow === 0 || dow === 6) return [];
  const demo = sameDay(date, DEMO_DAY);
  const seed = demo ? 0 : date.getDate() + date.getMonth() * 3;
  return TEMPLATE.flatMap((t, i) =>
    demo || (i + seed) % 5 !== 0
      ? [{ ...t, id: `${dayKey(date)}-${i}`, date, name: PATIENTS[(i + seed) % PATIENTS.length] }]
      : [],
  );
};

/* ---------------------------------------------------------------- */
/*  Constants                                                       */
/* ---------------------------------------------------------------- */
const EMPTY_CALENDAR_MIN_HEIGHT = 480;

const navBtn =
  "flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border border-border bg-card text-body transition-colors hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30";

/* ---------------------------------------------------------------- */
/*  Component                                                       */
/* ---------------------------------------------------------------- */
const CalendarView = () => {
  const dispatch = useAppDispatch();
  const rightSectionRef = useRef<HTMLDivElement>(null);
  const [rightSectionHeight, setRightSectionHeight] = useState<number | null>(null);
  const [selected, setSelected] = useState(() => startOfDay(new Date()));
  const [miniMonth, setMiniMonth] = useState(
    () => new Date(selected.getFullYear(), selected.getMonth(), 1),
  );
  const [view, setView] = useState<View>("Day");
  const [now, setNow] = useState<Date | null>(null);
  const [picked, setPicked] = useState<Appt | null>(null);
  const [showPanel, setShowPanel] = useState(false);
  const [showDesktopPanel, setShowDesktopPanel] = useState(true);
  const [isDesktopPanelExpanded, setIsDesktopPanelExpanded] = useState(true);
  const hasMountedDesktopPanelRef = useRef(false);

  const [filters, setFilters] = useState<Record<string, string>>({});
  const [query, setQuery] = useState("");
  const [provQuery, setProvQuery] = useState("");
  const [provOn, setProvOn] = useState<Set<number>>(() => new Set(PROVIDERS.map((_, i) => i)));
  const [locOn, setLocOn] = useState<Set<number>>(() => new Set(LOCATIONS.map((_, i) => i)));

  /* "now" is set after mount (avoids server/client date mismatch) */
  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, []);
const router = useRouter();
  useEffect(() => {
    const rightSection = rightSectionRef.current;
    if (!rightSection) return;

    const desktop = window.matchMedia("(min-width: 1536px)");
    const updateHeight = () => {
      setRightSectionHeight(
        desktop.matches ? rightSection.getBoundingClientRect().height : null,
      );
    };
    const observer = new ResizeObserver(updateHeight);

    observer.observe(rightSection);
    desktop.addEventListener("change", updateHeight);
    updateHeight();

    return () => {
      observer.disconnect();
      desktop.removeEventListener("change", updateHeight);
    };
  }, []);

  useEffect(() => {
    if (!showDesktopPanel) {
      setIsDesktopPanelExpanded(false);
      return;
    }

    if (!hasMountedDesktopPanelRef.current) {
      hasMountedDesktopPanelRef.current = true;
      setIsDesktopPanelExpanded(true);
      return;
    }

    const frame = requestAnimationFrame(() => setIsDesktopPanelExpanded(true));
    return () => cancelAnimationFrame(frame);
  }, [showDesktopPanel]);
  const today = now ? startOfDay(now) : null;

  /* ---------- Navigation ---------- */
  const go = (d: Date) => {
    setSelected(d);
    setMiniMonth(new Date(d.getFullYear(), d.getMonth(), 1));
    setPicked(null);
  };
  const step = (dir: 1 | -1) =>
    go(view === "Day" ? addDays(selected, dir) : view === "Week" ? addDays(selected, 7 * dir) : addMonths(selected, dir));
  const openDay = (d: Date) => {
    go(d);
    setView("Day");
  };
  const pickAppointment = (appointment: Appt) => {
    setPicked(appointment);
    setShowPanel(true);
    setShowDesktopPanel(true);
  };

  /* ---------- Filters ---------- */
  const fv = (k: string) => {
    const v = filters[k];
    return v && !v.startsWith("All ") ? v : "";
  };

  const visible = (a: Appt) => {
    const p = PROVIDERS[a.col];
    if (!provOn.has(a.col) || !locOn.has(a.loc)) return false;
    if (fv("All Providers") && fv("All Providers") !== p.name) return false;
    if (fv("All Locations") && fv("All Locations") !== LOCATIONS[a.loc].filter) return false;
    if (fv("All Appointments") && fv("All Appointments") !== a.type) return false;
    if (fv("All Statuses") && fv("All Statuses") !== a.status) return false;
    const q = query.trim().toLowerCase();
    if (q && !a.name.toLowerCase().includes(q) && !p.name.toLowerCase().includes(q)) return false;
    return true;
  };

  const forDay = (d: Date) => dayAppts(d).filter(visible).sort((x, y) => x.start - y.start);

  /* ---------- Derived data ---------- */
  const weekStart = addDays(selected, -selected.getDay());
  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart],
  );

  const dayItems = forDay(selected);
  const columns = PROVIDERS.map((p, i) => ({ ...p, i })).filter(
    (p) => provOn.has(p.i) && (!fv("All Providers") || fv("All Providers") === p.name),
  );

  const panelAppt = picked ?? dayItems[0] ?? null;
  const panelData = panelAppt
    ? toAppointmentPanel({
        patient: panelAppt.name,
        type: panelAppt.type,
        date: panelAppt.date,
        start: panelAppt.start,
        dur: panelAppt.dur,
        provider: PROVIDERS[panelAppt.col].name,
        specialty: PROVIDERS[panelAppt.col].specialty,
        location: LOCATIONS[panelAppt.loc].full,
        status: panelAppt.status,
      })
    : undefined;

  const heading =
    view === "Day"
      ? fmt(selected, { weekday: "long", month: "long", day: "numeric", year: "numeric" })
      : view === "Week"
        ? `${fmt(weekDays[0], { month: "short", day: "numeric" })} – ${fmt(weekDays[6], { month: "short", day: "numeric", year: "numeric" })}`
        : fmt(selected, { month: "long", year: "numeric" });

  const navLabel =
    view === "Day" ? fmt(selected, { month: "short", day: "numeric", year: "numeric" }) : heading;

  const calendarPanelHeight = rightSectionHeight
    ? Math.max(rightSectionHeight, panelAppt ? 0 : EMPTY_CALENDAR_MIN_HEIGHT)
    : null;

  return (
    <div className="space-y-4">
      {/* Search + filters */}
      <SearchAndFilter
        placeholder="Search by patient or provider..."
        filters={FILTERS}
        showDateRange={false}
        onSearch={setQuery}
        onFilterChange={(label, option) => setFilters((prev) => ({ ...prev, [label]: option }))}
      />

      {/* Date navigation + view switch */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" aria-label={`Previous ${view.toLowerCase()}`} onClick={() => step(-1)} className={navBtn}>
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="flex h-10 min-w-[150px] items-center justify-center gap-2 rounded-lg border border-border bg-card px-3.5 text-sm font-medium text-heading">
            <CalendarDays className="h-4 w-4 text-body" />
            {navLabel}
          </div>
          <button type="button" aria-label={`Next ${view.toLowerCase()}`} onClick={() => step(1)} className={navBtn}>
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => go(startOfDay(new Date()))}
            className="h-10 cursor-pointer rounded-lg border border-border bg-card px-4 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
          >
            Today
          </button>
        </div>

      <div className="flex flex-wrap items-center gap-2">
  <div role="tablist" className="inline-flex rounded-lg border border-border bg-card p-0.5">
    {(["Day", "Week", "Month"] as const).map((v) => (
      <button
        key={v}
        type="button"
        role="tab"
        aria-selected={view === v}
        onClick={() => setView(v)}
        className={`h-9 cursor-pointer rounded-md px-4 text-sm font-medium transition-colors ${
          view === v ? "bg-primary/10 text-primary" : "text-body hover:text-heading"
        }`}
      >
        {v}
      </button>
    ))}
  </div>
  <div className="flex gap-2">
    <AddButton
      text="Block Time"
      onClick={() => router.push("/appointments?tab=calendar/blocktime")}
      className="h-10 whitespace-nowrap px-4"
    />
   
  </div>
</div>
      </div>


   
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start">
        {/* Left + centre */}
        <div className="flex min-w-0 flex-1 flex-col gap-4 2xl:flex-row 2xl:items-start">
          <LeftSection
            selected={selected}
            today={today}
            miniMonth={miniMonth}
            setMiniMonth={setMiniMonth}
            go={go}
            provQuery={provQuery}
            setProvQuery={setProvQuery}
            provOn={provOn}
            setProvOn={setProvOn}
            locOn={locOn}
            setLocOn={setLocOn}
          />

          <MiddleSection
            height={calendarPanelHeight}
            view={view}
            heading={heading}
            selected={selected}
            today={today}
            now={now}
            columns={columns}
            dayItems={dayItems}
            weekDays={weekDays}
            panelAppt={panelAppt}
            forDay={forDay}
            openDay={openDay}
            setSelected={setSelected}
            setPicked={pickAppointment}
          />
        </div>

        {/* Persistent desktop details panel */}
        {showDesktopPanel && (
          <div
            ref={rightSectionRef}
            className={`hidden shrink-0 overflow-hidden 2xl:block 2xl:h-auto 2xl:transition-[width] 2xl:duration-300 2xl:ease-out ${
              isDesktopPanelExpanded ? "2xl:w-[360px]" : "2xl:w-0"
            }`}
          >
            {panelData ? (
              <RightSection
                variant="appointment"
                onClose={() => setShowDesktopPanel(false)}
                onCloseStart={() => setIsDesktopPanelExpanded(false)}
                initiallyOpen={!hasMountedDesktopPanelRef.current}
                desktopLayoutControlled
                data={panelData}
                onJoinVideoVisit={() => dispatch(showModal("JoinVideoVisit"))}
                onReschedule={() => dispatch(showModal("RescheduleAppointment"))}
                onCancelAppointment={() => dispatch(showModal("CancelAppointment"))}
              />
            ) : (
              <aside className="hidden w-[360px] shrink-0 flex-col items-center justify-center rounded-[14px] border border-border bg-card px-6 py-12 text-center 2xl:flex">
                <CalendarDays className="mb-3 h-8 w-8 text-body" />
                <p className="text-sm font-semibold text-heading">No appointment selected</p>
                <p className="mt-1 text-xs text-body">
                  There are no appointments for this day. Pick another date or appointment.
                </p>
              </aside>
            )}
          </div>
        )}

        {/* Mobile appointment drawer */}
        {showPanel && panelData && (
          <div className="2xl:hidden">
            <RightSection
              variant="appointment"
              onClose={() => setShowPanel(false)}
              data={panelData}
              onJoinVideoVisit={() => dispatch(showModal("JoinVideoVisit"))}
              onReschedule={() => dispatch(showModal("RescheduleAppointment"))}
              onCancelAppointment={() => dispatch(showModal("CancelAppointment"))}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarView;
