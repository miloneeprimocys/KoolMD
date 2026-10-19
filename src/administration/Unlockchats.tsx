"use client";

import React, { useState } from "react";

import SearchAndFilter from "@/components/Searchandfilter";
import Table from "@/components/Table";
import { type TableColumn } from "@/components/Tableheader";
import Name from "@/components/Name";
import Content from "@/components/Content";
import Tags from "@/components/Tags";
import Actions from "@/components/Actions";
import Pagination from "@/components/Pagination";
import EditButton from "@/components/EditButton";
import {
  REQUEST_TONE,
  patientMeta,
  type RequestStatus,
  type UnlockRequest,
} from "./Chartrightsection";

/* ---------- Static data ---------- */
const FILTERS = [
  { label: "Status", options: ["Pending", "Approved", "Rejected"] },
  {
    label: "Requested By",
    options: ["Dr. James Miller", "Dr. Sarah Wilson", "Dr. Michael Chen", "Dr. Emily Roberts"],
  },
];

const r = (
  id: string,
  patient: string,
  pid: string,
  age: number,
  gender: "M" | "F",
  encId: string,
  encDate: string,
  encTime: string,
  encType: string,
  requestedBy: string,
  reason: string,
  requestedDate: string,
  requestedTime: string,
  status: RequestStatus,
): UnlockRequest => ({
  id,
  patient,
  pid,
  age,
  gender,
  encId,
  encDate,
  encTime,
  encType,
  provider: requestedBy,
  requestedBy,
  role: "Practitioner",
  reason,
  requestedDate,
  requestedTime,
  status,
});

const ROWS: UnlockRequest[] = [
  {
    ...r("rq1", "John Carter", "PT-10045", 36, "M", "ENC-10021", "Oct 10, 2026", "10:00 AM", "General Consultation", "Dr. James Miller", "Addendum to clinical notes", "Oct 10, 2026", "11:24 AM", "Pending"),
    reasonDetail: "Addendum to clinical notes to include additional patient history and update assessment.",
  },
  r("rq2", "Emily Roberts", "PT-10076", 28, "F", "ENC-10018", "Oct 08, 2026", "01:30 PM", "Follow-up", "Dr. Sarah Wilson", "Update medication list", "Oct 08, 2026", "02:15 PM", "Pending"),
  r("rq3", "Michael Chen", "PT-10112", 52, "M", "ENC-09995", "Oct 05, 2026", "09:30 AM", "Telemedicine", "Dr. Michael Chen", "Correct diagnosis code", "Oct 05, 2026", "10:03 AM", "Approved"),
  r("rq4", "Sophia Patel", "PT-10087", 41, "F", "ENC-09980", "Sep 28, 2026", "12:30 PM", "Diabetes Follow-up", "Dr. Sarah Wilson", "Update lab results", "Sep 28, 2026", "01:20 PM", "Rejected"),
  r("rq5", "Robert Miller", "PT-10109", 67, "M", "ENC-09972", "Sep 25, 2026", "03:00 PM", "Annual Wellness", "Dr. James Miller", "Add missed attachment", "Sep 25, 2026", "03:45 PM", "Approved"),
  r("rq6", "Olivia Smith", "PT-10069", 32, "F", "ENC-09960", "Sep 18, 2026", "08:30 AM", "Pre-Op Assessment", "Dr. Emily Roberts", "Update procedure details", "Sep 18, 2026", "09:12 AM", "Approved"),
  r("rq7", "David Brown", "PT-10105", 45, "M", "ENC-09945", "Sep 12, 2026", "04:00 PM", "Mental Health", "Dr. Michael Chen", "Edit assessment section", "Sep 12, 2026", "04:30 PM", "Rejected"),
  r("rq8", "Ava Thompson", "PT-10098", 29, "F", "ENC-09930", "Sep 05, 2026", "10:30 AM", "Urgent Care", "Dr. Sarah Wilson", "Modify plan and prescription", "Sep 05, 2026", "11:10 AM", "Approved"),
];

const COLUMNS: TableColumn[] = [
  { key: "patient", label: "Patient" },
  { key: "encounter", label: "Encounter / Visit" },
  { key: "requestedBy", label: "Requested By" },
  { key: "reason", label: "Reason" },
  { key: "requestedOn", label: "Requested On" },
  { key: "status", label: "Status" },
  {
    key: "actions",
    label: "Actions",
    header: <div className="flex w-full items-center justify-center">Actions</div>,
  },
];

/* ---------- Component ---------- */
type Props = {
  /** Opens the right section for a request. */
  onView: (row: UnlockRequest) => void;
};

const UnlockChats = ({ onView }: Props) => {
  const [page, setPage] = useState(1);

  const rows = ROWS.map((x) => ({
    patient: (
      <button type="button" onClick={() => onView(x)} className="cursor-pointer text-left">
        <Name name={x.patient} sub={patientMeta(x).replace(" • Male", " • M").replace(" • Female", " • F")} />
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
    requestedBy: <Content title={x.requestedBy} description={x.role} />,
    reason: <Content title={x.reason} />,
    requestedOn: <Content title={x.requestedDate} description={x.requestedTime} />,
    status: <Tags text={x.status} tone={REQUEST_TONE[x.status]} />,
    actions: (
      <div className="flex w-full items-center justify-center">
        <Actions actions={["view"]} onAction={() => onView(x)} />
      </div>
    ),
  }));

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Search + filters + reset */}
      <div className="flex flex-col gap-3 xl:flex-row xl:items-start 2xl:items-center">
        <div className="min-w-0 flex-1">
          <SearchAndFilter
            placeholder="Search by patient name, reason or requested by..."
            filters={FILTERS}
            onSearch={() => {}}
            onFilterChange={() => {}}
          />
        </div>
        <EditButton
          section="Unlock chat filters"
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
          itemLabel="requests"
          onChange={setPage}
        />
      </div>
    </div>
  );
};

export default UnlockChats;
