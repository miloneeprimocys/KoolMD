"use client";

import React, { useState } from "react";

import SearchAndFilter from "@/components/Searchandfilter";
import Table from "@/components/Table";
import { type TableColumn } from "@/components/Tableheader";
import Name from "@/components/Name";
import Content from "@/components/Content";
import Actions from "@/components/Actions";
import Pagination from "@/components/Pagination";
import EditButton from "@/components/EditButton";
import { LockBadge, type LockedChart } from "../chatunlock/Chartrightsection";

/* ---------- Static data ---------- */
const FILTERS = [
  {
    label: "All Providers",
    options: ["Dr. James Miller", "Dr. Sarah Wilson", "Dr. Michael Chen", "Dr. Emily Roberts"],
  },
  { label: "Lock Status", options: ["Locked", "Unlocked"] },
];

const c = (
  id: string,
  patient: string,
  pid: string,
  age: number,
  gender: "M" | "F",
  encId: string,
  encDate: string,
  encTime: string,
  encType: string,
  provider: string,
  specialty: string,
  doneDate: string,
  doneTime: string,
  status: "Locked" | "Unlocked",
): LockedChart => ({
  id,
  patient,
  pid,
  age,
  gender,
  encId,
  encDate,
  encTime,
  encType,
  provider,
  specialty,
  completedDate: doneDate,
  completedTime: doneTime,
  lockedDate: doneDate,
  lockedTime: doneTime,
  status,
});

const ROWS: LockedChart[] = [
  c("lc1", "John Carter", "PT-10045", 36, "M", "ENC-10021", "Oct 10, 2026", "10:00 AM", "General Consultation", "Dr. James Miller", "Family Medicine", "Oct 10, 2026", "11:24 AM", "Locked"),
  c("lc2", "Emily Roberts", "PT-10076", 28, "F", "ENC-10018", "Oct 08, 2026", "01:30 PM", "Follow-up", "Dr. Sarah Wilson", "Internal Medicine", "Oct 08, 2026", "02:15 PM", "Locked"),
  c("lc3", "Michael Chen", "PT-10112", 52, "M", "ENC-09995", "Oct 05, 2026", "09:30 AM", "Telemedicine", "Dr. Michael Chen", "Cardiology", "Oct 05, 2026", "10:03 AM", "Locked"),
  c("lc4", "Sophia Patel", "PT-10087", 41, "F", "ENC-09980", "Sep 28, 2026", "12:30 PM", "Diabetes Follow-up", "Dr. Sarah Wilson", "Endocrinology", "Sep 28, 2026", "01:20 PM", "Locked"),
  c("lc5", "Robert Miller", "PT-10109", 67, "M", "ENC-09972", "Sep 25, 2026", "03:00 PM", "Annual Wellness", "Dr. James Miller", "Family Medicine", "Sep 25, 2026", "03:45 PM", "Locked"),
  c("lc6", "Olivia Smith", "PT-10069", 32, "F", "ENC-09960", "Sep 18, 2026", "08:30 AM", "Pre-Op Assessment", "Dr. Emily Roberts", "Surgery", "Sep 18, 2026", "09:12 AM", "Locked"),
  c("lc7", "David Brown", "PT-10105", 45, "M", "ENC-09945", "Sep 12, 2026", "04:00 PM", "Mental Health", "Dr. Michael Chen", "Psychiatry", "Sep 12, 2026", "04:30 PM", "Locked"),
  c("lc8", "Ava Thompson", "PT-10098", 29, "F", "ENC-09930", "Sep 05, 2026", "10:30 AM", "Urgent Care", "Dr. Sarah Wilson", "Urgent Care", "Sep 05, 2026", "11:10 AM", "Unlocked"),
];

const COLUMNS: TableColumn[] = [
  { key: "patient", label: "Patient" },
  { key: "encounter", label: "Encounter Details" },
  { key: "provider", label: "Provider" },
  { key: "completed", label: "Completed On" },
  { key: "locked", label: "Locked On" },
  { key: "status", label: "Status" },
  {
    key: "actions",
    label: "Actions",
    header: <div className="flex w-full items-center justify-center">Actions</div>,
  },
];

/* ---------- Component ---------- */
type Props = {
  /** Opens the right section for a chart (Unlock for locked charts, View for unlocked). */
  onOpen: (row: LockedChart) => void;
};

const LockChats = ({ onOpen }: Props) => {
  const [page, setPage] = useState(1);

  const rows = ROWS.map((x) => ({
    patient: (
      <button type="button" onClick={() => onOpen(x)} className="cursor-pointer text-left">
        <Name name={x.patient} sub={`#${x.pid} • ${x.age}y • ${x.gender}`} />
      </button>
    ),
    encounter: (
      <Content
        title={
          <button type="button" className="cursor-pointer font-semibold text-link hover:underline">
            #{x.encId}
          </button>
        }
        description={
          <span className="flex flex-col whitespace-normal">
            <span>{x.encDate}</span>
            <span>{x.encType}</span>
          </span>
        }
        className="min-w-0"
      />
    ),
    provider: <Content title={x.provider} description={x.specialty} />,
    completed: <Content title={x.completedDate} description={x.completedTime} />,
    locked: <Content title={x.lockedDate} description={x.lockedTime} />,
    status: <LockBadge locked={x.status === "Locked"} />,
    actions: (
      <div className="flex w-full items-center justify-center">
        <Actions
          actions={[x.status === "Locked" ? "unlock" : "view"]}
          onAction={() => onOpen(x)}
        />
      </div>
    ),
  }));

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Search + filters + reset */}
      <div className="flex flex-col gap-3 xl:flex-row xl:items-start 2xl:items-center">
        <div className="min-w-0 flex-1">
          <SearchAndFilter
            placeholder="Search by patient, encounter ID, provider..."
            filters={FILTERS}
            onSearch={() => {}}
            onFilterChange={() => {}}
          />
        </div>
        <EditButton
          section="Locked chat filters"
          label="Reset"
          variant="viewAll"
          hideIcon
          className="!shrink-0 !px-2 !text-left !text-sm"
        />
      </div>

      {/* Table */}
      <div className="space-y-3">
        <div className="overflow-hidden rounded-[14px] border border-border bg-card">
          <Table columns={COLUMNS} rows={rows} bordered={false} />
        </div>
        <Pagination
          page={page}
          totalPages={3}
          totalItems={24}
          pageSize={8}
          itemLabel="encounters"
          onChange={setPage}
        />
      </div>
    </div>
  );
};

export default LockChats;
