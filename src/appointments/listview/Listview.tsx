"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  Ban,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  History,
  SquarePen,
  User,
  Video,
  type LucideIcon,
} from "lucide-react";

import { useAppDispatch } from "@/hooks/useAppHooks";
import { showModal } from "@/redux/slices/dialogslice";
import RadioCheckButtonh from "@/components/RadioCheckButtonh";
import SearchAndFilter, { type FilterOption } from "@/components/Searchandfilter";
import Table from "@/components/Table";
import { type TableColumn } from "@/components/Tableheader";
import Name from "@/components/Name";
import Content from "@/components/Content";
import Tags from "@/components/Tags";
import TypeTag from "../../components/TypeTag";
import Actions from "@/components/Actions";
import DateTime from "@/components/Datetime";
import Pagination from "@/components/Pagination";
import StatCards, { type StatItem } from "@/components/Statcards";
import { TableSelectAllCheckbox, useTableSelection } from "@/components/TableSelection";
import { STATUS_TONE, StatusChips, checkboxCls, type ChipItem } from "../Rightsection";
import RescheduleModal, { type RescheduleAppointment } from "./Reschedulemodal";

/* ---------- Static data ---------- */
const STATS: StatItem[] = [
  { label: "Total Appointments", value: "248", change: "12%", positive: true, Icon: CalendarDays, accent: "primary" },
  { label: "Confirmed", value: "182", change: "8%", positive: true, Icon: CheckCircle2, accent: "success" },
  { label: "Pending", value: "24", change: "4%", positive: true, Icon: Clock, accent: "warning" },
  { label: "Video Consultations", value: "42", change: "18%", positive: true, Icon: Video, accent: "violet" },
];

const CHIPS: ChipItem[] = [
  { label: "All Appointments", count: 248, dot: "bg-primary", tint: "border-primary/20 bg-primary/5" },
  { label: "Confirmed", count: 182, dot: "bg-success", tint: "border-success/20 bg-success/5" },
  { label: "Pending", count: 24, dot: "bg-warning", tint: "border-warning/30 bg-warning/5" },
  { label: "Completed", count: 32, dot: "bg-slate-400", tint: "border-border bg-heading/5" },
  { label: "Cancelled", count: 10, dot: "bg-danger", tint: "border-danger/20 bg-danger/5" },
];

const PROVIDER_OPTIONS: FilterOption[] = ["Dr. Emily Carter", "Dr. James Miller", "Dr. Sarah Lee", "Dr. Michael Chen"];
const TYPE_OPTIONS: FilterOption[] = ["Video Visit", "In-person"];
const STATUS_OPTIONS: FilterOption[] = ["Confirmed", "Pending", "Completed", "Cancelled"];

type Row = {
  name: string;
  pid: string;
  age: number;
  gender: string;
  date: string; // ISO (used by the reschedule modal)
  dateLabel: string;
  time: string;
  start: string;
  provider: string;
  specialty: string;
  type: "Video Visit" | "In-person";
  reason: string;
  status: string;
};

const D = ["2026-10-17", "Oct 17, 2026"] as const;
const r = (
  name: string, pid: string, age: number, gender: string,
  time: string, start: string, provider: string, specialty: string,
  type: Row["type"], reason: string, status: string,
): Row => ({ name, pid, age, gender, date: D[0], dateLabel: D[1], time, start, provider, specialty, type, reason, status });

const ROWS: Row[] = [
  r("John Smith", "PT-1008", 35, "Male", "10:00 AM - 10:30 AM", "10:00 AM", "Dr. Emily Carter", "Internal Medicine", "Video Visit", "Follow up consultation", "Confirmed"),
  r("Jane Wilson", "PT-1012", 42, "Female", "11:00 AM - 11:30 AM", "11:00 AM", "Dr. James Miller", "Cardiology", "In-person", "Chest pain follow up", "Pending"),
  r("Robert Brown", "PT-1005", 28, "Male", "01:00 PM - 01:30 PM", "1:00 PM", "Dr. Sarah Lee", "Dermatology", "Video Visit", "Skin rash evaluation", "Confirmed"),
  r("Emily Carter", "PT-1011", 31, "Female", "02:00 PM - 02:30 PM", "2:00 PM", "Dr. Michael Chen", "Family Medicine", "In-person", "Annual physical", "Confirmed"),
  r("David Lee", "PT-1009", 45, "Male", "03:00 PM - 03:30 PM", "3:00 PM", "Dr. Emily Carter", "Internal Medicine", "Video Visit", "Lab results review", "Completed"),
  r("Sophia Patel", "PT-1023", 39, "Female", "03:30 PM - 04:00 PM", "3:30 PM", "Dr. James Miller", "Cardiology", "In-person", "Shortness of breath", "Cancelled"),
  r("Michael Clark", "PT-1020", 50, "Male", "04:30 PM - 05:00 PM", "4:30 PM", "Dr. Sarah Lee", "Dermatology", "In-person", "Mole check", "Confirmed"),
  r("Aarav Rao", "PT-1024", 27, "Male", "05:00 PM - 05:30 PM", "5:00 PM", "Dr. Michael Chen", "Family Medicine", "Video Visit", "Cold and flu symptoms", "Pending"),
];

const COLUMNS: TableColumn[] = [
  { key: "select", label: "", className: "w-10", header: null },
  { key: "patient", label: "Patient" },
  { key: "datetime", label: "Date & Time" },
  { key: "provider", label: "Provider" },
  { key: "type", label: "Type" },
  { key: "reason", label: "Reason for Visit" },
  { key: "status", label: "Status" },
  {
    key: "actions",
    label: "Actions",
    header: <div className="flex w-full items-center justify-center">Actions</div>,
  },
];

/* ---------- "More" dropdown menu ---------- */
type MenuKey =
  | "view"
  | "edit"
  | "reschedule"
  | "cancel"
  | "join"
  | "encounter"
  | "patient"
  | "audit";

const MENU: { key: MenuKey; label: string; icon: LucideIcon; tone?: "danger" | "primary" }[] = [
  { key: "view", label: "View Appointment", icon: Eye },
  { key: "edit", label: "Edit Appointment", icon: SquarePen },
  { key: "reschedule", label: "Reschedule", icon: CalendarClock },
  { key: "cancel", label: "Cancel Appointment", icon: Ban, tone: "danger" },
  { key: "join", label: "Join Video Visit", icon: Video, tone: "primary" },
  { key: "encounter", label: "View Encounter", icon: FileText },
  { key: "patient", label: "View Patient", icon: User },
  { key: "audit", label: "View Audit History", icon: History },
];

const MENU_WIDTH = 208;
const MENU_ITEM_H = 36;

/*
  Wraps the shared <Actions /> (unchanged). When the "more" button is clicked,
  Actions calls onAction("more") → we open a portal menu anchored to the
  right edge of this wrapper (where the "more" button sits).
*/
const RowActions = ({ onMenu }: { onMenu: (key: MenuKey) => void }) => {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const wrapRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!open || !wrapRef.current) return;
    const b = wrapRef.current.getBoundingClientRect();
    const menuH = MENU.length * MENU_ITEM_H + 8;
    const top =
      b.bottom + 6 + menuH > window.innerHeight ? Math.max(8, b.top - menuH - 6) : b.bottom + 6;
    const left = Math.max(8, Math.min(b.right - MENU_WIDTH, window.innerWidth - MENU_WIDTH - 8));
    setPos({ top, left });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!menuRef.current?.contains(t) && !wrapRef.current?.contains(t)) close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [open]);

  return (
    <>
      <div ref={wrapRef} className="inline-flex">
        <Actions
          actions={["view", "more"]}
          onAction={(action) => {
            if (action === "more") setOpen((o) => !o);
            else if (action === "view") onMenu("view");
          }}
        />
      </div>

      {open &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            style={{ top: pos.top, left: pos.left, width: MENU_WIDTH }}
            className="fixed z-[250] rounded-xl border border-border bg-card p-1 shadow-xl dark:ring-1 dark:ring-primary/20"
          >
            {MENU.map(({ key, label, icon: Icon, tone }) => (
              <button
                key={key}
                role="menuitem"
                type="button"
                onClick={() => {
                  setOpen(false);
                  onMenu(key);
                }}
                className={`flex h-9 w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 text-left text-[13px] font-medium transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${
                  tone === "danger"
                    ? "text-danger"
                    : tone === "primary"
                      ? "text-primary"
                      : "text-heading hover:text-primary"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{label}</span>
              </button>
            ))}
          </div>,
          document.body,
        )}
    </>
  );
};

/* ---------- Component ---------- */
const ListView = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const [chip, setChip] = useState("All Appointments");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [provider, setProvider] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [target, setTarget] = useState<RescheduleAppointment | null>(null);

  const rowKeys = ROWS.map((row, index) => `${row.pid}-${row.date}-${row.start}-${index}`);
  const { selectedKeys, allSelected, someSelected, toggleRow, toggleAll } =
    useTableSelection(rowKeys);

  const resetFilters = () => {
    setSearch("");
    setProvider("");
    setType("");
    setStatus("");
    setChip("All Appointments");
  };

  const handleFilterChange = (filterLabel: string, option: string) => {
    if (filterLabel === "Provider") setProvider(option);
    else if (filterLabel === "Appointment Type") setType(option);
    else if (filterLabel === "Status") setStatus(option);
  };

  const openReschedule = (x: Row) => {
    setTarget({
      patientName: x.name,
      patientId: x.pid,
      gender: x.gender,
      age: x.age,
      provider: `${x.provider} (${x.specialty})`,
      type: x.type === "Video Visit" ? "Video Consultation" : "In-person Visit",
      reason: x.reason,
      duration: "30 minutes",
      date: x.date,
      time: x.start,
    });
    dispatch(showModal("RescheduleAppointment"));
  };

  const handleMenu = (x: Row, key: MenuKey) => {
    if (key === "reschedule") return openReschedule(x);
    if (key === "cancel") return dispatch(showModal("CancelAppointment"));
    if (key === "join") return dispatch(showModal("JoinVideoVisit"));
    if (key === "encounter") return router.push("/view-encounter?id=3");
    if (key === "patient") {
      return router.push("/view-patient?id=01a1354b-3dd7-79d0-b2c3-4c7fcdedf415");
    }
    if (key === "audit") return router.push("/administration/chatunlock?tab=audit-history");

    // View, edit, cancel, and join are intentionally left unchanged.
    console.log(key, x);
  };

  const columns = COLUMNS.map((column) =>
    column.key === "select"
      ? {
          ...column,
          header: (
            <TableSelectAllCheckbox
              checked={allSelected}
              indeterminate={someSelected}
              onChange={toggleAll}
              className={checkboxCls}
            />
          ),
        }
      : column,
  );

  const rows = ROWS.map((x, index) => {
    const rowKey = rowKeys[index];
    return {
      select: (
        <RadioCheckButtonh
          type="checkbox"
          checked={selectedKeys.has(rowKey)}
          onChange={() => toggleRow(rowKey)}
          aria-label={`Select ${x.name}`}
          className={checkboxCls}
        />
      ),
      patient: <Name name={x.name} sub={`${x.pid} • ${x.age} yrs • ${x.gender}`} truncate />,
      datetime: <DateTime date={x.dateLabel} time={x.time} truncate />,
      provider: <Name name={x.provider} sub={x.specialty} truncate />,
      type: <TypeTag type={x.type} />,
      reason: <Content title={x.reason} truncate />,
      status: <Tags text={x.status} tone={STATUS_TONE[x.status] ?? "neutral"} />,
      actions: (
        <div className="flex w-full items-center justify-center">
          <RowActions onMenu={(key) => handleMenu(x, key)} />
        </div>
      ),
    };
  });

  return (
    <div className="space-y-4">
      {/* Stat cards */}
      <StatCards stats={STATS} />
      {/* Search + filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-[200px] flex-1">
          <SearchAndFilter
            placeholder="Search patient name, appointment ID..."
            value={search}
            onSearch={setSearch}
            filters={[
              { label: "Provider", options: PROVIDER_OPTIONS },
              { label: "Appointment Type", options: TYPE_OPTIONS },
              { label: "Status", options: STATUS_OPTIONS },
            ]}
            selectedFilters={{
              Provider: provider,
              "Appointment Type": type,
              Status: status,
            }}
            onFilterChange={handleFilterChange}
            showDateRange={false}
            onMoreFilters={() => {}}
            className="flex-col xl:flex-row 2xl:flex-row"
          />
        </div>
        <button
          type="button"
          onClick={resetFilters}
          className="h-10 cursor-pointer text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
        >
          Reset
        </button>
      </div>

      {/* Status chips */}
      <StatusChips items={CHIPS} active={chip} onChange={setChip} />

      {/* Table */}
      <div className="min-w-0 space-y-3">
        <div className="w-full min-w-0 overflow-hidden rounded-[14px] border border-border bg-card">
          <Table columns={columns} rows={rows} bordered={false} />
        </div>
        <Pagination
          page={page}
          totalPages={31}
          totalItems={248}
          pageSize={8}
          itemLabel="appointments"
          onChange={setPage}
        />
      </div>

      <RescheduleModal
        appointment={target}
        onSave={(v) => {
          // TODO: refresh list after API success
          console.log("rescheduled", v);
        }}
      />
    </div>
  );
};

export default ListView;
