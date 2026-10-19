"use client";

import RadioCheckButtonh from "@/components/RadioCheckButtonh";
import React, { useState } from "react";
import {
  ClipboardList,
  Clock,
  Hourglass,
  LayoutGrid,
  List,
  MessageCircle,
  Video,
  VideoOff,
} from "lucide-react";

import SearchAndFilter from "@/components/Searchandfilter";
import StatCards, { type StatItem } from "@/components/Statcards";
import SignupDropdown, { DropdownOption } from "@/components/SignupDropdown";
import Table from "@/components/Table";
import { type TableColumn } from "@/components/Tableheader";
import Name from "@/components/Name";
import Content from "@/components/Content";
import Tags, { type TagTone } from "@/components/Tags";
import Actions from "@/components/Actions";
import { TableSelectAllCheckbox, useTableSelection } from "@/components/TableSelection";
import RightSection, { BASE_FILTERS, checkboxCls } from "./Rightsection";

/* ---------- Static data ---------- */
const STATS: StatItem[] = [
  { label: "In Waiting Room", value: "6", Icon: ClipboardList, accent: "primary" },
  { label: "Checked In", value: "2", Icon: Clock, accent: "primary" },
  { label: "In Consultation", value: "1", Icon: Video, accent: "success" },
  { label: "Running Late", value: "0", Icon: Hourglass, accent: "warning" },
  { label: "No Show", value: "1", Icon: VideoOff, accent: "danger" },
] as StatItem[];

const SORT_OPTIONS: DropdownOption[] = [
  { value: "oldest", label: "Check-in Time (Oldest)" },
  { value: "newest", label: "Check-in Time (Newest)" },
  { value: "wait", label: "Wait Time (Longest)" },
];

type Row = {
  name: string;
  meta: string;
  type: string;
  time: string;
  provider: string;
  specialty: string;
  checkIn: string;
  wait: string;
  waitTone: TagTone;
};

const ROWS: Row[] = [
  { name: "Olivia Bennett", meta: "PID-10234 • 36Y • F", type: "Follow Up", time: "09:00 AM", provider: "Dr. Sarah Wilson", specialty: "Internal Medicine", checkIn: "08:55 AM", wait: "5 min", waitTone: "success" },
  { name: "Liam Carter", meta: "PID-10456 • 29Y • M", type: "Initial Consultation", time: "09:30 AM", provider: "Dr. Michael Chen", specialty: "Cardiology", checkIn: "09:25 AM", wait: "5 min", waitTone: "success" },
  { name: "Sophia Martinez", meta: "PID-10789 • 42Y • F", type: "Consultation", time: "10:00 AM", provider: "Dr. Emily Carter", specialty: "Dermatology", checkIn: "09:48 AM", wait: "12 min", waitTone: "warning" },
  { name: "Noah Wilson", meta: "PID-10987 • 18Y • M", type: "Physical Exam", time: "10:30 AM", provider: "Dr. James Miller", specialty: "Pediatrics", checkIn: "10:20 AM", wait: "10 min", waitTone: "success" },
  { name: "Emma Davis", meta: "PID-11022 • 34Y • F", type: "Lab Results Review", time: "11:00 AM", provider: "Dr. Sarah Wilson", specialty: "Internal Medicine", checkIn: "10:55 AM", wait: "5 min", waitTone: "success" },
  { name: "Lucas Anderson", meta: "PID-11567 • 50Y • M", type: "Follow Up", time: "11:30 AM", provider: "Dr. Michael Chen", specialty: "Cardiology", checkIn: "11:25 AM", wait: "5 min", waitTone: "success" },
];

const COLUMNS: TableColumn[] = [
  {
    key: "select",
    label: "",
    className: "w-10",
    header: null,
  },
  { key: "patient", label: "Patient" },
  { key: "details", label: "Appointment Details" },
  { key: "provider", label: "Provider" },
  { key: "checkin", label: "Check-in Time" },
  { key: "wait", label: "Wait Time" },
  { key: "status", label: "Status" },
  {
    key: "actions",
    label: "Actions",
    width: 184,
    header: <div className="flex w-full items-center justify-center">Actions</div>,
  },
];

const iconBtn =
  "flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-label transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30";
const checkInMinutes = (time: string) => {
  const [clock, period] = time.split(" ");
  const [hours, minutes] = clock.split(":").map(Number);
  return ((hours % 12) + (period === "PM" ? 12 : 0)) * 60 + minutes;
};

/* ---------- Card-view helpers ---------- */

/** Small label above a value. Every value cell has the same min-height,
 *  so a plain text value, a tag and an avatar row all line up. */
const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="min-w-0">
    <p className="mb-1.5 text-xs text-body">{label}</p>
    <div className="flex min-h-10 min-w-0 items-center">{children}</div>
  </div>
);
/** Same 2-column grid as the Appointment / Provider row,
 *  so the value lines up directly under "Provider". */
const InlineField = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="grid grid-cols-2 items-center gap-x-4">
    <p className="min-w-0 text-xs text-body">{label}</p>
    <div className="flex min-w-0 items-center justify-start">{children}</div>
  </div>
);
/* ---------- Component ---------- */
const WaitingRoom = () => {
  const [showPanel, setShowPanel] = useState(false);
  const [panelHeight, setPanelHeight] = useState<number | null>(null);
  const [sort, setSort] = useState("oldest");
  const [layout, setLayout] = useState<"list" | "grid">("list");

  const sortedRows = [...ROWS].sort((a, b) =>
    sort === "wait"
      ? Number.parseInt(b.wait, 10) - Number.parseInt(a.wait, 10)
      : sort === "newest"
        ? checkInMinutes(b.checkIn) - checkInMinutes(a.checkIn)
        : checkInMinutes(a.checkIn) - checkInMinutes(b.checkIn),
  );
  const rowKeys = sortedRows.map((row) => `${row.meta}-${row.checkIn}`);
  const { selectedKeys, allSelected, someSelected, toggleRow, toggleAll } =
    useTableSelection(rowKeys);
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

  const rows = sortedRows.map((x, index) => {
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
      patient: (
        <button type="button" onClick={() => setShowPanel(true)} className="w-full min-w-0 cursor-pointer text-left">
          <Name name={x.name} sub={x.meta} truncate />
        </button>
      ),
      details: <Content title={x.type} description={x.time} truncate />,
      provider: <Name name={x.provider} sub={x.specialty} truncate />,
      checkin: <Content title={x.checkIn} />,
      wait: <Tags text={x.wait} tone={x.waitTone} />,
      status: <Tags text="Waiting" tone="info" />,
      actions: (
        <div className="flex w-full items-center justify-center gap-1">
          <button type="button" aria-label="Start video consultation" className={iconBtn}>
            <Video className="h-4 w-4" />
          </button>
          <button type="button" aria-label="Send message" className={iconBtn}>
            <MessageCircle className="h-4 w-4" />
          </button>
          <Actions
            onAction={(action) => {
              if (action === "view") {
                setShowPanel((open) => !open);
              } else {
                setShowPanel(true);
              }
            }}
          />
        </div>
      ),
    };
  });

  const toggleCls = (on: boolean) =>
    `flex h-9 w-9 cursor-pointer items-center justify-center rounded-md transition-colors ${
      on ? "bg-primary/10 text-primary" : "text-body hover:text-heading"
    }`;

  return (
    <div className="space-y-4">
      {/* Search + filters */}
      <SearchAndFilter
        placeholder="Search patient name or ID..."
        filters={BASE_FILTERS}
        showDateRange={false}
        onSearch={() => {}}
        onFilterChange={() => {}}
      />

      <label className="flex w-fit cursor-pointer items-center gap-2 text-xs text-body sm:ml-auto sm:text-sm">
        <RadioCheckButtonh type="checkbox" className={checkboxCls} />
        Auto refresh (30s)
      </label>

      <div className="flex flex-col gap-4 xl:flex-row xl:items-start">
        <div
          className={`min-w-0 flex-1 space-y-4 ${
            layout === "grid" && showPanel && panelHeight ? "2xl:flex 2xl:min-h-0 2xl:flex-col 2xl:space-y-4" : ""
          }`}
          style={
            layout === "grid" && showPanel && panelHeight
              ? ({ "--waiting-panel-height": `${panelHeight}px` } as React.CSSProperties)
              : undefined
          }
        >
          {/* Stat cards */}
          <StatCards stats={STATS} />

          {/* Waiting room table */}
          <div
            className={`w-full min-w-0 overflow-hidden rounded-[14px] border border-border bg-card ${
              layout === "grid" && showPanel && panelHeight
                ? "2xl:flex 2xl:min-h-0 2xl:flex-1 2xl:flex-col 2xl:h-[var(--waiting-panel-height)]"
                : ""
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4">
              <div>
                <h3 className="text-sm font-semibold text-heading sm:text-base">Waiting Room (6)</h3>
                <p className="mt-0.5 text-xs text-body">
                  Patients who have checked in for their appointments.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-body">Sort by</span>
                <SignupDropdown
                  className="!w-[280px]"
                  name="waitingSort"
                  options={SORT_OPTIONS}
                  value={sort}
                  onChange={setSort}
                />
                <div className="inline-flex rounded-lg border border-border bg-card p-0.5">
                  <button
                    type="button"
                    aria-label="List view"
                    aria-pressed={layout === "list"}
                    onClick={() => setLayout("list")}
                    className={toggleCls(layout === "list")}
                  >
                    <List className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="Grid view"
                    aria-pressed={layout === "grid"}
                    onClick={() => setLayout("grid")}
                    className={toggleCls(layout === "grid")}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {layout === "list" ? (
              <Table columns={columns} rows={rows} />
            ) : (
              <div className="grid grid-cols-1 gap-4 border-t border-divider p-4 md:grid-cols-2 2xl:min-h-0 2xl:flex-1 2xl:overflow-y-auto">
                {sortedRows.map((patient) => (
                  <article
                    key={patient.name}
                    className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-card"
                  >
                    {/* Header: patient + status + actions (2 rows on mobile) */}
                    <div className="flex flex-col gap-3 border-b border-divider px-4 py-3 xl:flex-row xl:items-center xl:justify-between">
                      <button
                        type="button"
                        onClick={() => setShowPanel(true)}
                        className="w-full min-w-0 cursor-pointer text-left xl:flex-1"
                      >
                        <Name name={patient.name} sub={patient.meta} truncate />
                      </button>
                      <div className="flex w-full items-center gap-1.5 xl:w-auto xl:shrink-0">
                        <Tags
                          text="Waiting"
                          tone="info"
                          className="order-first mr-auto xl:order-last xl:mr-0 xl:ml-1"
                        />
                        <button type="button" aria-label="Start video consultation" className={iconBtn}>
                          <Video className="h-4 w-4" />
                        </button>
                        <button type="button" aria-label="Send message" className={iconBtn}>
                          <MessageCircle className="h-4 w-4" />
                        </button>
                        <Actions
                          actions={["view"]}
                          onAction={() => setShowPanel((open) => !open)}
                        />
                      </div>
                    </div>

                    {/* Body */}
                    <div className="flex-1 space-y-4 px-4 py-4">
                      <div className="grid grid-cols-2 gap-x-4">
                        <Field label="Appointment">
                          <Content title={patient.type} description={patient.time} truncate />
                        </Field>
                        <Field label="Provider">
                          <Name name={patient.provider} sub={patient.specialty} truncate />
                        </Field>
                      </div>

                      <div className="space-y-3 border-t border-divider pt-4">
                        <InlineField label="Check-in time">
                          <Content title={patient.checkIn} />
                        </InlineField>
                        <InlineField label="Wait time">
                          <Tags text={patient.wait} tone={patient.waitTone} />
                        </InlineField>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right section */}
        {showPanel && (
          <RightSection
            variant="waiting"
            onClose={() => setShowPanel(false)}
            onHeightChange={setPanelHeight}
          />
        )}
      </div>
    </div>
  );
};

export default WaitingRoom;