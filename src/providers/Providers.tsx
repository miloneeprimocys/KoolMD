"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  Stethoscope,
  UserCheck,
  UserX,
  Users,
} from "lucide-react";

import StatCards, { type StatItem } from "@/components/Statcards";
import AddButton from "@/components/Addbutton";
import SearchAndFilter from "@/components/Searchandfilter";
import Table from "@/components/Table";
import { type TableColumn } from "@/components/Tableheader";
import Name from "@/components/Name";
import Content from "@/components/Content";
import Tags, { type TagTone } from "@/components/Tags";
import Actions from "@/components/Actions";
import Pagination from "@/components/Pagination";
import Breadcrumb from "@/components/Breadcrumb";

/* ---------- Stats ---------- */
const STATS: StatItem[] = [
  { label: "Total Providers", value: "156", Icon: Users, accent: "primary", tag: { text: "↑ 12%", tone: "success" } },
  { label: "Active Providers", value: "142", Icon: UserCheck, accent: "success", tag: { text: "↑ 8%", tone: "success" } },
  { label: "Pending Approval", value: "8", Icon: Clock, accent: "violet", tag: { text: "↓ 14%", tone: "danger" } },
  { label: "Inactive Providers", value: "6", Icon: UserX, accent: "danger", tag: { text: "↓ 25%", tone: "danger" } },
];

/* ---------- Filters ---------- */
const FILTERS = [
  {
    label: "All Specialties",
    options: [
      "Internal Medicine",
      "Pediatrics",
      "Cardiology",
      "Family Medicine",
      "Dermatology",
      "Orthopedics",
      "Neurology",
      "Emergency Medicine",
    ],
  },
  {
    label: "All Locations",
    options: [
      "Main Clinic",
      "West Clinic",
      "East Clinic",
      "North Clinic",
      "South Clinic",
      "Central Clinic",
    ],
  },
  {
    label: "All Statuses",
    options: ["Active", "Inactive", "Pending"],
  },
];

/* ---------- Data ---------- */
type ProviderRow = {
  name: string;
  credential: string;
  npi: string;
  specialty: string;
  clinic: string;
  city: string;
  license: string;
  licenseTone: TagTone;
  dea: string;
  deaTone: TagTone;
  status: string;
  statusTone: TagTone;
};

const PROVIDERS: ProviderRow[] = [
  { name: "Dr. Michael Brown", credential: "MD", npi: "1234567890", specialty: "Internal Medicine", clinic: "Main Clinic", city: "New York, NY", license: "Valid", licenseTone: "success", dea: "Valid", deaTone: "success", status: "Active", statusTone: "success" },
  { name: "Dr. Sarah Lee", credential: "DO", npi: "9876543210", specialty: "Pediatrics", clinic: "West Clinic", city: "San Francisco, CA", license: "Valid", licenseTone: "success", dea: "Valid", deaTone: "success", status: "Active", statusTone: "success" },
  { name: "Dr. James Wilson", credential: "MD", npi: "4567891230", specialty: "Cardiology", clinic: "East Clinic", city: "Boston, MA", license: "Expiring Soon", licenseTone: "warning", dea: "Valid", deaTone: "success", status: "Active", statusTone: "success" },
  { name: "Dr. Emily Davis", credential: "NP", npi: "3216549870", specialty: "Family Medicine", clinic: "North Clinic", city: "Chicago, IL", license: "Valid", licenseTone: "success", dea: "N/A", deaTone: "neutral", status: "Active", statusTone: "success" },
  { name: "Dr. Robert Chen", credential: "MD", npi: "1597534860", specialty: "Dermatology", clinic: "Main Clinic", city: "New York, NY", license: "Expired", licenseTone: "danger", dea: "Valid", deaTone: "success", status: "Inactive", statusTone: "danger" },
  { name: "Dr. Amanda White", credential: "PA", npi: "7539519510", specialty: "Orthopedics", clinic: "South Clinic", city: "Austin, TX", license: "Valid", licenseTone: "success", dea: "N/A", deaTone: "neutral", status: "Active", statusTone: "success" },
  { name: "Dr. Richard Taylor", credential: "MD", npi: "9517538640", specialty: "Neurology", clinic: "West Clinic", city: "San Francisco, CA", license: "Valid", licenseTone: "success", dea: "Valid", deaTone: "success", status: "Pending", statusTone: "warning" },
  { name: "Dr. Olivia Martinez", credential: "MD", npi: "8529637410", specialty: "Emergency Medicine", clinic: "Central Clinic", city: "Dallas, TX", license: "Valid", licenseTone: "success", dea: "Valid", deaTone: "success", status: "Active", statusTone: "success" },
];

/* ---------- Constants ---------- */
const PAGE_SIZE = 8;
const TOTAL_PROVIDERS = 156;

const checkboxCls =
  "h-4 w-4 cursor-pointer rounded border-border accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30";

/* ---------- Component ---------- */
const Providers = () => {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const totalPages = Math.ceil(TOTAL_PROVIDERS / PAGE_SIZE);

  const allSelected =
    selected.size > 0 && selected.size === PROVIDERS.length;
  const someSelected =
    selected.size > 0 && selected.size < PROVIDERS.length;

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
      allSelected ? new Set() : new Set(PROVIDERS.map((p) => p.npi))
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
      { key: "provider", label: "Provider" },
      { key: "npi", label: "NPI" },
      { key: "specialty", label: "Specialty" },
      { key: "location", label: "Location" },
      { key: "license", label: "License Status" },
      { key: "dea", label: "DEA Status" },
      { key: "status", label: "Status" },
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
      PROVIDERS.map((p) => ({
        select: (
          <input
            type="checkbox"
            checked={selected.has(p.npi)}
            onChange={() => toggleOne(p.npi)}
            aria-label={`Select ${p.name}`}
            className={checkboxCls}
          />
        ),
        provider: (
          <Name
            name={p.name}
            sub={p.credential}
            subIcon={<Stethoscope className="hidden h-0 w-0" />}
          />
        ),
        npi: <Content title={p.npi} />,
        specialty: <Content title={p.specialty} />,
        location: <Content title={p.clinic} description={p.city} />,
        license: <Tags text={p.license} tone={p.licenseTone} />,
        dea: <Tags text={p.dea} tone={p.deaTone} />,
        status: <Tags text={p.status} tone={p.statusTone} />,
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
          { label: "Providers" },
        ]}
      />

      {/* Title + actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-heading sm:text-lg 2xl:text-2xl">Providers</h2>
          <p className="mt-0.5 text-sm text-body">
            Manage healthcare providers, practitioners and their profiles.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <AddButton
            text="Add Provider"
            onClick={() => router.push("/add-provider")}
          />
        </div>
      </div>

      {/* Stat cards */}
      <StatCards stats={STATS} />

      {/* Search + filters */}
      <SearchAndFilter
        placeholder="Search by name, email, NPI, specialty..."
        filters={FILTERS}
      />

      {/* Table */}
      <div className="space-y-3">
        <div className="overflow-hidden rounded-[14px] border border-border bg-card">
          <Table columns={columns} rows={rows} />
        </div>

        {/* Pagination */}
        <Pagination
          page={page}
          totalPages={totalPages}
          totalItems={TOTAL_PROVIDERS}
          pageSize={PAGE_SIZE}
          onChange={setPage}
        />
      </div>
    </div>
  );
};

export default Providers;