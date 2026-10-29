"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Activity, UserCheck, UserMinus, UserPlus, Users } from "lucide-react";

import StatCards, { type StatItem } from "@/components/Statcards";
import SearchAndFilter from "@/components/Searchandfilter";
import ImportButton from "@/components/ImportButton";
import Table from "@/components/Table";
import TableStatus from "@/components/TableStatus";
import { type TableColumn } from "@/components/Tableheader";
import Content from "@/components/Content";
import Tags from "@/components/Tags";
import Actions from "@/components/Actions";
import Pagination from "@/components/Pagination";
import RadioCheckButtonh from "@/components/RadioCheckButtonh";
import { TableSelectAllCheckbox, useTableSelection } from "@/components/TableSelection";
import Name from "@/components/Name";
import LinkComponent from "@/components/LinkComponent";

/* ---------------------------------------------------------------- */
/*  Data (replace with API / redux selector)                         */
/* ---------------------------------------------------------------- */
type PatientRow = {
  id: string;
  name: string;
  mrn: string;
  dob: string;
  age: string;
  gender: "Male" | "Female" | "Other";
  phone: string;
  email: string;
  address: [line1: string, line2: string];
  status: "Active" | "Inactive";
};

const PATIENTS: PatientRow[] = [
  { id: "1", name: "John Smith", mrn: "PT-001245", dob: "Jan 14, 1984", age: "42 years", gender: "Male", phone: "+1 (555) 123-4567", email: "john.smith@email.com", address: ["123 Main St,", "New York, NY"], status: "Active" },
  { id: "2", name: "Emily Carter", mrn: "PT-001246", dob: "Mar 22, 1990", age: "36 years", gender: "Female", phone: "+1 (555) 987-6543", email: "emily.carter@email.com", address: ["456 Oak Ave,", "Los Angeles, CA"], status: "Active" },
  { id: "3", name: "Robert Johnson", mrn: "PT-001247", dob: "Jul 08, 1975", age: "51 years", gender: "Male", phone: "+1 (555) 222-3344", email: "robert.j@email.com", address: ["789 Pine Rd,", "Chicago, IL"], status: "Active" },
  { id: "4", name: "Olivia Brown", mrn: "PT-001248", dob: "Nov 30, 1992", age: "33 years", gender: "Female", phone: "+1 (555) 444-5566", email: "olivia.b@email.com", address: ["321 Maple St,", "Houston, TX"], status: "Active" },
  { id: "5", name: "William Davis", mrn: "PT-001249", dob: "Feb 18, 1968", age: "58 years", gender: "Male", phone: "+1 (555) 666-7788", email: "william.d@email.com", address: ["654 Cedar Ln,", "Phoenix, AZ"], status: "Inactive" },
  { id: "6", name: "Sophia Miller", mrn: "PT-001250", dob: "Apr 12, 1995", age: "31 years", gender: "Female", phone: "+1 (555) 777-8899", email: "sophia.m@email.com", address: ["987 Birch Blvd,", "San Diego, CA"], status: "Active" },
  { id: "7", name: "Michael Wilson", mrn: "PT-001251", dob: "Aug 05, 1987", age: "39 years", gender: "Male", phone: "+1 (555) 333-2211", email: "michael.w@email.com", address: ["320 Spruce Dr,", "Miami, FL"], status: "Active" },
  { id: "8", name: "Isabella Moore", mrn: "PT-001252", dob: "Dec 19, 2000", age: "26 years", gender: "Female", phone: "+1 (555) 111-0099", email: "isabella.m@email.com", address: ["159 Walnut Ave,", "Dallas, TX"], status: "Active" },
  { id: "9", name: "David Taylor", mrn: "PT-001253", dob: "Sep 27, 1979", age: "47 years", gender: "Male", phone: "+1 (555) 888-7766", email: "david.t@email.com", address: ["753 Cherry St,", "Seattle, WA"], status: "Inactive" },
  { id: "10", name: "Laura Anderson", mrn: "PT-001254", dob: "Jun 15, 1991", age: "35 years", gender: "Female", phone: "+1 (555) 444-9900", email: "laura.a@email.com", address: ["852 Willow Cir,", "Boston, MA"], status: "Active" },
  { id: "11", name: "James Martin", mrn: "PT-001255", dob: "May 02, 1983", age: "43 years", gender: "Male", phone: "+1 (555) 555-1212", email: "james.m@email.com", address: ["14 Elm St,", "Denver, CO"], status: "Active" },
  { id: "12", name: "Grace Lee", mrn: "PT-001256", dob: "Oct 09, 1998", age: "28 years", gender: "Female", phone: "+1 (555) 909-3030", email: "grace.l@email.com", address: ["77 Lake Rd,", "Austin, TX"], status: "Active" },
];

const STATS: StatItem[] = [
  { label: "Total Patients", value: "1,240", Icon: Users, accent: "primary" },
  { label: "Active Patients", value: "1,120", Icon: UserCheck, accent: "success" },
  { label: "Inactive Patients", value: "120", Icon: UserMinus, accent: "danger" },
  { label: "New This Month", value: "86", Icon: UserPlus, accent: "warning" },
];

const STATUS_FILTER = "All Statuses";
const GENDER_FILTER = "All Genders";
const EMPTY_FILTERS: Record<string, string> = { [STATUS_FILTER]: "", [GENDER_FILTER]: "" };
const PAGE_SIZE = 10;

const AVATAR_TONES = [
  "bg-violet/15 text-violet",
  "bg-danger/15 text-danger",
  "bg-primary/15 text-primary",
  "bg-success/15 text-success",
  "bg-warning/15 text-warning",
];
const initials = (name: string) =>
  name
    .replace(/^Dr\.\s*/, "")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");

const checkboxCls =
  "h-4 w-4 cursor-pointer rounded border-border accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30";
const linkCls = "cursor-pointer text-sm font-medium text-primary hover:underline";

/* ---------------------------------------------------------------- */
/*  Component                                                        */
/* ---------------------------------------------------------------- */
const FhirPatient = () => {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);

  const reset = () => {
    setSearch("");
    setFilters(EMPTY_FILTERS);
    setPage(1);
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return PATIENTS.filter((p) => {
      if (q && ![p.name, p.mrn, p.phone, p.email].some((f) => f.toLowerCase().includes(q))) return false;
      if (filters[STATUS_FILTER] && p.status !== filters[STATUS_FILTER]) return false;
      if (filters[GENDER_FILTER] && p.gender !== filters[GENDER_FILTER]) return false;
      return true;
    });
  }, [search, filters]);

  const totalPages = Math.max(Math.ceil(filtered.length / PAGE_SIZE), 1);
  const safePage = Math.min(page, totalPages);
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const { selectedKeys, allSelected, someSelected, toggleRow, toggleAll } = useTableSelection(visible.map((p) => p.id));

  const columns: TableColumn[] = [
    {
      key: "select",
      label: "",
      className: "w-10",
      header: <TableSelectAllCheckbox checked={allSelected} indeterminate={someSelected} onChange={toggleAll} className={checkboxCls} />,
    },
    { key: "name", label: "Name" },
    { key: "mrn", label: "MRN" },
    { key: "dob", label: "DOB" },
    { key: "gender", label: "Gender" },
    { key: "phone", label: "Phone" },
    { key: "email", label: "Email" },
    { key: "address", label: "Address" },
    { key: "status", label: "Status" },
    { key: "actions", label: "Actions", header: <div className="flex w-full items-center justify-center">Actions</div> },
  ];

  const rows = visible.map((p, i) => ({
    select: (
      <RadioCheckButtonh
        type="checkbox"
        checked={selectedKeys.has(p.id)}
        onChange={() => toggleRow(p.id)}
        aria-label={`Select ${p.name}`}
        className={checkboxCls}
      />
    ),
    name: <Name name={p.name} sub={p.email} truncate />,
    mrn: <Content title={p.mrn} />,
    dob: <Content title={p.dob} description={`(${p.age})`} />,
    gender: <Content title={p.gender} />,
    phone: <Content title={p.phone} />,
    email: <LinkComponent>{p.email}</LinkComponent>,
    address: <Content title={p.address[0]} description={p.address[1]} />,
    status: <Tags text={p.status} tone={p.status === "Active" ? "success" : "danger"} size="xs" />,
    actions: (
      <div className="flex w-full items-center justify-center">
        <Actions
          actions={["view"]}
          size="sm"
          onAction={() => router.push(`/view-fhir-patient?id=${p.id}`)}
        />
      </div>
    ),
  }));

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Panel header */}
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Activity className="h-5 w-5" />
        </span>
        <div>
          <h3 className="text-base font-semibold text-heading">Patients</h3>
          <p className="text-xs text-body sm:text-sm">Manage patient demographic and administrative information.</p>
        </div>
      </div>

      {/* Stat cards */}
      <StatCards stats={STATS} />

      {/* Search + filters */}
      <SearchAndFilter
        placeholder="Search by name, MRN, phone or email..."
        value={search}
        onSearch={(v: string) => {
          setSearch(v);
          setPage(1);
        }}
        filters={[
          { label: STATUS_FILTER, options: ["Active", "Inactive"] },
          { label: GENDER_FILTER, options: ["Male", "Female", "Other"] },
        ]}
        selectedFilters={filters}
        onFilterChange={(label: string, value: string) => {
          setFilters((prev) => ({ ...prev, [label]: value }));
          setPage(1);
        }}
        showDateRange
        trailingFilterAction={<ImportButton text="Reset" icon={null} onClick={reset} className="flex-none text-primary" />}
      />

      {/* List */}
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-base font-semibold text-heading">Patients List</h3>
          <span className="text-xs text-body">
            {filtered.length === 0 ? "0" : `${(safePage - 1) * PAGE_SIZE + 1}-${(safePage - 1) * PAGE_SIZE + visible.length}`} of{" "}
            {filtered.length.toLocaleString()}
          </span>
        </div>
        <div className="overflow-hidden rounded-[14px] border border-border bg-card">
          {visible.length === 0 ? (
            <TableStatus variant="empty" message="No patients match your filters." />
          ) : (
            <Table columns={columns} rows={rows} bordered={false} />
          )}
        </div>
        {filtered.length > 0 && (
          <Pagination
            page={safePage}
            totalPages={totalPages}
            totalItems={filtered.length}
            pageSize={PAGE_SIZE}
            itemLabel="patients"
            onChange={setPage}
          />
        )}
      </section>
    </div>
  );
};

export default FhirPatient;