"use client";

import RadioCheckButtonh from "@/components/RadioCheckButtonh";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, Download, Plus } from "lucide-react";

import AddButton from "@/components/Addbutton";
import ImportButton from "@/components/ImportButton";
import SearchAndFilter from "@/components/Searchandfilter";
import Table from "@/components/Table";
import { type TableColumn } from "@/components/Tableheader";
import Name from "@/components/Name";
import Content from "@/components/Content";
import Tags, { type TagTone } from "@/components/Tags";
import Actions from "@/components/Actions";
import Pagination from "@/components/Pagination";
import Breadcrumb from "@/components/Breadcrumb";

/* ---------- Static data ---------- */
const FILTERS = [
  {
    label: "All Providers",
    options: ["Dr. Sarah Lee", "Dr. James Wilson", "Dr. Emily Davis", "Dr. Michael Brown"],
  },
  {
    label: "All Visit Types",
    options: ["Follow-up Visit", "Lab Review", "Annual Checkup", "Consultation", "Initial Visit", "Allergy Consultation"],
  },
  { label: "All Statuses", options: ["Active", "Inactive"] },
];

const STATUS_TONE: Record<string, TagTone> = { Active: "success", Inactive: "neutral" };

type Row = {
  id: string;
  name: string;
  phone: string;
  patientId: string;
  dob: string;
  age: string;
  gender: string;
  provider: string;
  specialty: string;
  lastDate: string;
  lastType: string;
  nextDate: string;
  nextTime: string;
  total: number;
  status: string;
};

const r = (
  id: string,
  name: string,
  phone: string,
  patientId: string,
  dob: string,
  age: string,
  gender: string,
  provider: string,
  specialty: string,
  lastDate: string,
  lastType: string,
  nextDate: string,
  nextTime: string,
  total: number,
  status: string,
): Row => ({ id, name, phone, patientId, dob, age, gender, provider, specialty, lastDate, lastType, nextDate, nextTime, total, status });

const ROWS: Row[] = [
  r("3", "milonee primocys", "+91 98765 43210", "KMD-0000003", "Jul 11, 2005", "21 years", "Female", "Dr. Sarah Lee", "Primary Care", "Oct 9, 2026", "Follow-up Visit", "Nov 10, 2026", "10:30 AM", 12, "Active"),
  r("4", "Rahul Mehta", "+91 98765 43211", "KMD-0000004", "Mar 22, 1990", "36 years", "Male", "Dr. James Wilson", "Allergy & Immunology", "Oct 5, 2026", "Lab Review", "Nov 2, 2026", "02:00 PM", 8, "Active"),
  r("5", "Priya Shah", "+91 98765 43212", "KMD-0000005", "Sep 14, 1988", "38 years", "Female", "Dr. Emily Davis", "Internal Medicine", "Sep 28, 2026", "Annual Checkup", "—", "", 10, "Active"),
  r("6", "Amit Desai", "+91 98765 43213", "KMD-0000006", "Jan 3, 1975", "51 years", "Male", "Dr. Michael Brown", "Family Medicine", "Sep 20, 2026", "Consultation", "Nov 15, 2026", "11:00 AM", 6, "Active"),
  r("7", "Kavya Patel", "+91 98765 43214", "KMD-0000007", "Apr 18, 1998", "28 years", "Female", "Dr. Sarah Lee", "Primary Care", "Sep 12, 2026", "Follow-up Visit", "Oct 30, 2026", "09:30 AM", 5, "Active"),
  r("8", "Neeraj Sharma", "+91 98765 43215", "KMD-0000008", "Nov 27, 1982", "43 years", "Male", "Dr. James Wilson", "Allergy & Immunology", "Aug 25, 2026", "Initial Visit", "—", "", 4, "Active"),
  r("9", "Sneha Iyer", "+91 98765 43216", "KMD-0000009", "Feb 10, 1995", "31 years", "Female", "Dr. Emily Davis", "Internal Medicine", "Aug 18, 2026", "Lab Review", "Oct 28, 2026", "01:00 PM", 7, "Active"),
  r("10", "Vikram Singh", "+91 98765 43217", "KMD-0000010", "Dec 5, 1978", "47 years", "Male", "Dr. Michael Brown", "Family Medicine", "Aug 2, 2026", "Follow-up Visit", "—", "", 3, "Inactive"),
  r("11", "Ritika Jain", "+91 98765 43218", "KMD-0000011", "Jun 30, 1992", "34 years", "Female", "Dr. Sarah Lee", "Primary Care", "Jul 14, 2026", "Allergy Consultation", "Oct 20, 2026", "02:00 PM", 9, "Active"),
  r("12", "Kunal Verma", "+91 98765 43219", "KMD-0000012", "Aug 9, 1986", "40 years", "Male", "Dr. Emily Davis", "Internal Medicine", "Jul 1, 2026", "Lab Review", "—", "", 2, "Active"),
];

const checkboxCls =
  "h-4 w-4 cursor-pointer rounded border-border accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30";

const sortHeader = (label: string) => (
  <span className="flex items-center gap-1">
    {label}
    <ArrowDown className="h-3.5 w-3.5" />
  </span>
);

const COLUMNS: TableColumn[] = [
  {
    key: "select",
    label: "",
    className: "w-10",
  },
  { key: "patient", label: "Patient", header: sortHeader("Patient") },
  { key: "patientId", label: "Patient ID" },
  { key: "dob", label: "DOB / Age" },
  { key: "gender", label: "Gender" },
  { key: "provider", label: "Primary Provider" },
  { key: "last", label: "Last Encounter", header: sortHeader("Last Encounter") },
  { key: "next", label: "Next Visit" },
  { key: "total", label: "Total Encounters" },
  { key: "status", label: "Status" },
  {
    key: "actions",
    label: "Actions",
    header: <div className="flex w-full items-center justify-center">Actions</div>,
  },
];

/* ---------- Component ---------- */
const Encounters = () => {
  const router = useRouter();
  const [page, setPage] = useState(1);

  const openPatient = (id: string) => router.push(`/view-encounter?id=${id}`);

  const rows = ROWS.map((x) => ({
    select: <RadioCheckButtonh type="checkbox" aria-label={`Select ${x.name}`} className={checkboxCls} />,
    patient: (
      <button type="button" onClick={() => openPatient(x.id)} className="cursor-pointer text-left">
        <Name name={x.name} sub={x.phone} />
      </button>
    ),
    patientId: <Content title={x.patientId} />,
    dob: <Content title={x.dob} description={x.age} />,
    gender: <Content title={x.gender} />,
    provider: <Name name={x.provider} sub={x.specialty} />,
    last: <Content title={x.lastDate} description={x.lastType} />,
    next: <Content title={x.nextDate} description={x.nextTime || undefined} />,
    total: <Content title={String(x.total)} />,
    status: <Tags text={x.status} tone={STATUS_TONE[x.status] ?? "neutral"} />,
    actions: (
      <div className="flex w-full items-center justify-center">
        <Actions
          onAction={(action) => {
            if (action === "view") openPatient(x.id);
          }}
        />
      </div>
    ),
  }));

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-4 sm:space-y-5">
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Patients", href: "/patients" },
          { label: "Encounter" },
        ]}
      />

      {/* Title + action */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-heading sm:text-xl 2xl:text-2xl">
            Encounter and Visit Management
          </h2>
          <p className="mt-0.5 text-xs text-body sm:text-sm">
            Select a patient to view and manage encounters, visit details, clinical notes and related records.
          </p>
        </div>
        <AddButton
          text="Start New Encounter"
          icon={<Plus className="h-4 w-4" />}
          onClick={() => router.push("/new-encounter")}
          className="w-fit whitespace-nowrap"
        />
      </div>

      {/* Search + filters + reset / export */}
      <div className="flex flex-col gap-3 xl:flex-row xl:items-start 2xl:items-center">
        <div className="min-w-0 flex-1">
          <SearchAndFilter
            placeholder="Search by patient name, phone, email or patient ID..."
            filters={FILTERS}
            onSearch={() => {}}
            onFilterChange={() => {}}
          />
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <button
            type="button"
            className="cursor-pointer px-2 text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
          >
            Reset
          </button>
          <ImportButton text="Export" icon={<Download className="h-4 w-4" />} onClick={() => {}} />
        </div>
      </div>

      {/* Table */}
      <div className="space-y-3">
        <div className="overflow-hidden rounded-[14px] border border-border bg-card">
          <Table columns={COLUMNS} rows={rows} bordered={false} selectable />
        </div>
        <Pagination
          page={page}
          totalPages={6}
          totalItems={56}
          pageSize={10}
          itemLabel="patients"
          onChange={setPage}
        />
      </div>
    </div>
  );
};

export default Encounters;