"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Ban,
  Clock,
  Stethoscope,
  UserCheck,
  UserPlus,
  Users,
} from "lucide-react";

import StatCards, { type StatItem } from "@/components/Statcards";
import AddButton from "@/components/Addbutton";
import ImportButton from "@/components/ImportButton";
import SearchAndFilter from "@/components/Searchandfilter";
import Table from "@/components/Table";
import { type TableColumn } from "@/components/Tableheader";
import Name from "@/components/Name";
import Content from "@/components/Content";
import DateTime from "@/components/Datetime";
import Tags, { type TagTone } from "@/components/Tags";
import Actions from "@/components/Actions";
import Pagination from "@/components/Pagination";
import Breadcrumb from "@/components/Breadcrumb";

/* ---------- Stats ---------- */
const STATS: StatItem[] = [
  { label: "Total Patients", value: "2,048", Icon: Users, accent: "primary", tag: { text: "↑ 12%", tone: "success" } },
  { label: "Active Patients", value: "1,842", Icon: UserCheck, accent: "success", tag: { text: "↑ 10%", tone: "success" } },
  { label: "New Patients", value: "206", Icon: UserPlus, accent: "violet", tag: { text: "↑ 18%", tone: "success" } },
  { label: "Inactive Patients", value: "98", Icon: Ban, accent: "danger", tag: { text: "↓ 5%", tone: "danger" } },
];

/* ---------- Filters ---------- */
const FILTERS = [
  { label: "Status", options: ["Active", "Inactive", "Follow-up"] },
  { label: "Gender", options: ["Male", "Female", "Other"] },
  { label: "Insurance", options: ["Blue Cross", "Aetna", "Cigna", "UnitedHealth", "Kaiser"] },
];

/* ---------- Data ---------- */
type PatientRow = {
  name: string;
  age: number;
  gender: "Male" | "Female";
  patientId: string;
  dob: string;
  email: string;
  phone: string;
  insurance: string;
  status: string;
  tone: TagTone;
  lastVisitDate: string;
  lastVisitDoctor: string;
};

const PATIENTS: PatientRow[] = [
  { name: "Sarah Johnson", age: 34, gender: "Female", patientId: "PT-000124", dob: "Jan 15, 1990", email: "sarah.johnson@email.com", phone: "+1 555 123 4567", insurance: "Blue Cross PPO", status: "Active", tone: "success", lastVisitDate: "Oct 6, 2026", lastVisitDoctor: "Dr. Michael Carter" },
  { name: "Michael Brown", age: 42, gender: "Male", patientId: "PT-000123", dob: "Mar 22, 1982", email: "michael.brown@email.com", phone: "+1 555 987 6543", insurance: "Aetna PPO", status: "Active", tone: "success", lastVisitDate: "Sep 28, 2026", lastVisitDoctor: "Dr. Sarah Lee" },
  { name: "Emma Wilson", age: 29, gender: "Female", patientId: "PT-000122", dob: "Jun 10, 1995", email: "emma.wilson@email.com", phone: "+1 555 456 7890", insurance: "Cigna HMO", status: "Active", tone: "success", lastVisitDate: "Oct 1, 2026", lastVisitDoctor: "Dr. Michael Carter" },
  { name: "James Miller", age: 37, gender: "Male", patientId: "PT-000121", dob: "Nov 3, 1987", email: "james.miller@email.com", phone: "+1 555 321 0987", insurance: "UnitedHealth PPO", status: "Inactive", tone: "danger", lastVisitDate: "Aug 12, 2026", lastVisitDoctor: "Dr. Kevin White" },
  { name: "Priya Patel", age: 31, gender: "Female", patientId: "PT-000120", dob: "Apr 18, 1993", email: "priya.patel@email.com", phone: "+1 555 654 3210", insurance: "Blue Cross PPO", status: "Active", tone: "success", lastVisitDate: "Oct 3, 2026", lastVisitDoctor: "Dr. Sarah Lee" },
  { name: "Robert Chen", age: 45, gender: "Male", patientId: "PT-000119", dob: "Sep 8, 1979", email: "robert.chen@email.com", phone: "+1 (555) 789 0123", insurance: "Kaiser Permanente HMO", status: "Active", tone: "success", lastVisitDate: "Sep 15, 2026", lastVisitDoctor: "Dr. Michael Carter" },
  { name: "Olivia Martinez", age: 28, gender: "Female", patientId: "PT-000118", dob: "Dec 25, 1996", email: "olivia.martinez@email.com", phone: "+1 555 147 2580", insurance: "Aetna PPO", status: "Active", tone: "success", lastVisitDate: "Oct 4, 2026", lastVisitDoctor: "Dr. Kevin White" },
  { name: "Daniel Kim", age: 50, gender: "Male", patientId: "PT-000117", dob: "Feb 14, 1974", email: "daniel.kim@email.com", phone: "+1 555 369 7410", insurance: "Cigna PPO", status: "Active", tone: "success", lastVisitDate: "Aug 30, 2026", lastVisitDoctor: "Dr. Sarah Lee" },
];

/* ---------- Constants ---------- */
const PAGE_SIZE = 8;
const TOTAL_PATIENTS = 2048;

const checkboxCls =
  "h-4 w-4 cursor-pointer rounded border-border accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30";

/* ---------- Component ---------- */
const Patient = () => {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const totalPages = Math.ceil(TOTAL_PATIENTS / PAGE_SIZE);

  const allSelected =
    selected.size > 0 && selected.size === PATIENTS.length;
  const someSelected =
    selected.size > 0 && selected.size < PATIENTS.length;

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    setSelected(
      allSelected ? new Set() : new Set(PATIENTS.map((p) => p.patientId))
    );
  };

  /* Columns — the select column carries the header checkbox */
  const columns: TableColumn[] = useMemo(
    () => [
      {
        key: "select",
        label: "",
        className: "w-10",
        header: (
          <input
            type="checkbox"
            checked={allSelected}
            ref={(el) => {
              if (el) el.indeterminate = someSelected;
            }}
            onChange={toggleAll}
            aria-label="Select all"
            className={checkboxCls}
          />
        ),
      },
      { key: "patient", label: "Patient" },
      { key: "patientId", label: "Patient ID" },
      { key: "dob", label: "Date of Birth" },
      { key: "gender", label: "Gender" },
      { key: "contact", label: "Contact" },
      { key: "insurance", label: "Insurance" },
      { key: "status", label: "Status" },
      { key: "lastVisit", label: "Last Visit" },
      {
        key: "actions",
        label: "Actions",
        header: (
          <div className="flex w-full items-center justify-center">Actions</div>
        ),
      },
    ],
    [allSelected, someSelected]
  );

  /* Rows — checkboxes controlled by `selected` */
  const rows = useMemo(
    () =>
      PATIENTS.map((p) => ({
        select: (
          <input
            type="checkbox"
            checked={selected.has(p.patientId)}
            onChange={() => toggleOne(p.patientId)}
            aria-label={`Select ${p.name}`}
            className={checkboxCls}
          />
        ),
        patient: (
          <Name
            name={p.name}
            sub={`${p.age} years • ${p.gender}`}
            subIcon={<Stethoscope className="hidden h-0 w-0" />}
          />
        ),
        patientId: <Content title={p.patientId} />,
        dob: <Content title={p.dob} />,
        gender: <Content title={p.gender} />,
        contact: <Content title={p.phone} description={p.email} />,
        insurance: (
          <Content
            title={p.insurance.split(" ")[0]}
            description={p.insurance.split(" ").slice(1).join(" ")}
          />
        ),
        status: <Tags text={p.status} tone={p.tone} />,
        lastVisit: (
          <DateTime
            date={p.lastVisitDate}
            sub={p.lastVisitDoctor}
            icon={<Clock className="h-3.5 w-3.5" />}
          />
        ),
        actions: (
          <div className="flex w-full items-center justify-center">
            <Actions onAction={(a) => console.log("action:", a, p.name)} />
          </div>
        ),
      })),
    [selected]
  );

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-4 sm:space-y-5">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Patients" },
        ]}
      />

      {/* Title + actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-heading sm:text-lg 2xl:text-2xl">Patients</h2>
          <p className="mt-0.5 text-sm text-body">
            Manage patient records, registration and profiles.
          </p>
        </div>

        {/* Buttons — side by side on phones, no wrapping */}
<div className="flex flex-row gap-2">
  <ImportButton className="shrink-0 whitespace-nowrap" />
  <AddButton
    text="Add Patient"
    onClick={() => router.push("/add-patient")}
    className="shrink-0 whitespace-nowrap"
  />
</div>
      </div>

      {/* Search + filters */}
      <SearchAndFilter
        placeholder="Search by name, email, phone or patient ID..."
        filters={FILTERS}
      />

      {/* Stat cards */}
      <StatCards stats={STATS} />

      {/* Table */}
      <div className="space-y-3">
        <div className="overflow-hidden rounded-[14px] border border-border bg-card">
          <Table columns={columns} rows={rows} />
        </div>

        {/* Pagination */}
        <Pagination
          page={page}
          totalPages={totalPages}
          totalItems={TOTAL_PATIENTS}
          pageSize={PAGE_SIZE}
          onChange={setPage}
        />
      </div>
    </div>
  );
};

export default Patient;