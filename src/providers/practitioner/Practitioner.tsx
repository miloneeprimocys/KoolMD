"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import RadioCheckButtonh from "@/components/RadioCheckButtonh";
import AddButton from "@/components/Addbutton";
import SearchAndFilter from "@/components/Searchandfilter";
import Table from "@/components/Table";
import TableStatus from "@/components/TableStatus";
import { type TableColumn } from "@/components/Tableheader";
import Name from "@/components/Name";
import Content from "@/components/Content";
import Tags, { type TagTone } from "@/components/Tags";
import Actions from "@/components/Actions";
import Pagination from "@/components/Pagination";
import Breadcrumb from "@/components/Breadcrumb";

/* ---------------------------------------------------------------- */
/*  Types + constants                                                */
/* ---------------------------------------------------------------- */
type PractitionerStatus = "Active" | "Pending" | "Inactive";

type PractitionerRow = {
  id: string;
  name: string;
  email: string;
  npi: string;
  specialty: string;
  locations: string[];
  status: PractitionerStatus;
};

const SPECIALTY_FILTER_LABEL = "All Specialties";
const LOCATION_FILTER_LABEL = "All Locations";
const STATUS_FILTER_LABEL = "All Statuses";

const SPECIALTIES = [
  "Internal Medicine",
  "Family Medicine",
  "Pediatrics",
  "Cardiology",
  "Dermatology",
  "Orthopedics",
];
const LOCATIONS = ["Main Clinic", "Downtown Clinic", "Westside Clinic", "Telemedicine"];
const STATUSES: PractitionerStatus[] = ["Active", "Pending", "Inactive"];

const STATUS_TONES: Record<PractitionerStatus, TagTone> = {
  Active: "success",
  Pending: "warning",
  Inactive: "neutral",
};

const PAGE_SIZE = 10;

const checkboxCls =
  "h-4 w-4 cursor-pointer rounded border-border accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30";

/* ---------------------------------------------------------------- */
/*  Sample data (replace with your API / redux selector)             */
/* ---------------------------------------------------------------- */
const mkRow = (
  id: number,
  name: string,
  npi: string,
  specialty: string,
  locations: string[],
  status: PractitionerStatus,
): PractitionerRow => ({
  id: `p${id}`,
  name,
  email: `${name.toLowerCase().replace(/[^a-z ]/g, "").replace(/ +/g, ".").replace(/^dr\./, "")}@healthcare.com`,
  npi,
  specialty,
  locations,
  status,
});

const FIRST_NAMES = ["Olivia", "Noah", "Ava", "Liam", "Sophia", "Ethan", "Mia", "Lucas"];
const LAST_NAMES = ["Brown", "Davis", "Garcia", "Miller", "Nguyen", "Patel", "Reed", "Singh"];

const SAMPLE_PRACTITIONERS: PractitionerRow[] = [
  mkRow(1, "Dr. Sarah Mitchell", "1234567890", "Internal Medicine", ["Main Clinic", "Downtown Clinic"], "Active"),
  mkRow(2, "Dr. James Carter", "9876543210", "Family Medicine", ["Main Clinic"], "Active"),
  mkRow(3, "Dr. Emily Wilson", "1122334455", "Pediatrics", ["Westside Clinic"], "Pending"),
  mkRow(4, "Dr. Michael Lee", "9988776655", "Cardiology", ["Main Clinic", "Telemedicine"], "Active"),
  mkRow(5, "Dr. Priya Shah", "5566778899", "Dermatology", ["Downtown Clinic"], "Inactive"),
  mkRow(6, "Dr. Daniel Kim", "6655443322", "Orthopedics", ["Westside Clinic"], "Active"),
  ...Array.from({ length: 22 }, (_, i) =>
    mkRow(
      i + 7,
      `Dr. ${FIRST_NAMES[i % FIRST_NAMES.length]} ${LAST_NAMES[(i * 3) % LAST_NAMES.length]}`,
      String(2000000000 + i * 1234567).slice(0, 10),
      SPECIALTIES[i % SPECIALTIES.length],
      [LOCATIONS[i % LOCATIONS.length]],
      STATUSES[i % STATUSES.length],
    ),
  ),
];

/* ---------------------------------------------------------------- */
/*  Component                                                        */
/* ---------------------------------------------------------------- */
const Practitioner = () => {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({
    [SPECIALTY_FILTER_LABEL]: "",
    [LOCATION_FILTER_LABEL]: "",
    [STATUS_FILTER_LABEL]: "",
  });
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  /* ---------- Filters ---------- */
  const practitionerFilters = useMemo(
    () => [
      { label: SPECIALTY_FILTER_LABEL, options: SPECIALTIES.map((s) => ({ value: s, label: s })) },
      { label: LOCATION_FILTER_LABEL, options: LOCATIONS.map((l) => ({ value: l, label: l })) },
      { label: STATUS_FILTER_LABEL, options: STATUSES.map((s) => ({ value: s, label: s })) },
    ],
    [],
  );

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleFilterChange = (filterLabel: string, value: string) => {
    setFilters((prev) => ({ ...prev, [filterLabel]: value }));
    setPage(1);
  };

  /* ---------- Filtered + paged data ---------- */
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return SAMPLE_PRACTITIONERS.filter((p) => {
      if (
        term &&
        ![p.name, p.email, p.npi, p.specialty].some((field) => field.toLowerCase().includes(term))
      )
        return false;
      if (filters[SPECIALTY_FILTER_LABEL] && p.specialty !== filters[SPECIALTY_FILTER_LABEL]) return false;
      if (filters[LOCATION_FILTER_LABEL] && !p.locations.includes(filters[LOCATION_FILTER_LABEL])) return false;
      if (filters[STATUS_FILTER_LABEL] && p.status !== filters[STATUS_FILTER_LABEL]) return false;
      return true;
    });
  }, [search, filters]);

  const totalPages = Math.max(Math.ceil(filtered.length / PAGE_SIZE), 1);
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  /* ---------- Selection (current page only) ---------- */
  const selectedOnPage = pageItems.filter((p) => selectedIds.has(p.id)).length;
  const allSelected = pageItems.length > 0 && selectedOnPage === pageItems.length;
  const someSelected = selectedOnPage > 0 && !allSelected;

  const toggleSelection = (id: string) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleSelectAll = () => setSelectedIds(allSelected ? new Set() : new Set(pageItems.map((p) => p.id)));

  /* ---------- Table ---------- */
  const columns: TableColumn[] = [
    {
      key: "select",
      label: "",
      className: "w-10",
      header: (
        <RadioCheckButtonh
          type="checkbox"
          checked={allSelected}
          ref={(el) => {
            if (el) el.indeterminate = someSelected;
          }}
          onChange={toggleSelectAll}
          aria-label="Select all"
          className={checkboxCls}
        />
      ),
    },
    { key: "name", label: "Name" },
    { key: "npi", label: "NPI" },
    { key: "specialty", label: "Specialty" },
    { key: "locations", label: "Locations" },
    { key: "status", label: "Status" },
    {
      key: "actions",
      label: "Actions",
      header: <div className="flex w-full items-center justify-center">Actions</div>,
    },
  ];

  const rows = pageItems.map((p) => ({
    select: (
      <RadioCheckButtonh
        type="checkbox"
        checked={selectedIds.has(p.id)}
        onChange={() => toggleSelection(p.id)}
        aria-label={`Select ${p.name}`}
        className={checkboxCls}
      />
    ),
    name: <Name name={p.name} />,
    npi: <Content title={p.npi} />,
    specialty: <Content title={p.specialty} />,
    locations: <Content title={`${p.locations.length} Location${p.locations.length === 1 ? "" : "s"}`} />,
    status: <Tags text={p.status} tone={STATUS_TONES[p.status]} />,
    actions: (
      <div className="flex w-full items-center justify-center">
        <Actions
          actions={["view", "edit", "more"]}
          onAction={(action) => {
            if (action === "view") router.push(`/provider/view-practitioner?id=${p.id}`);
            else if (action === "edit") router.push(`/provider/add-practitioner`);
          }}
        />
      </div>
    ),
  }));

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-4 sm:space-y-5">
      <Breadcrumb items={[{ label: "Dashboard", href: "/dashboard" }, { label: "Practitioners" }]} />

      {/* Title + actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-heading sm:text-lg 2xl:text-2xl">Practitioners</h2>
          <p className="mt-0.5 text-sm text-body">
            Manage MDs and practitioners, their profile, licenses, locations, availability and credentials.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <AddButton text="Add Practitioner" onClick={() => router.push("/provider/add-practitioner")} />
        </div>
      </div>

      {/* Search + filters */}
      <SearchAndFilter
        placeholder="Search by name, NPI, email or specialty..."
        filters={practitionerFilters}
        value={search}
        onSearch={handleSearch}
        selectedFilters={filters}
        onFilterChange={handleFilterChange}
        showDateRange={false}
      />

      {/* Table */}
      <div className="space-y-3">
        <div className="overflow-hidden rounded-[14px] border border-border bg-card">
          {pageItems.length === 0 ? (
            <TableStatus variant="empty" message="No practitioners match your filters." />
          ) : (
            <Table columns={columns} rows={rows} bordered={false} />
          )}
        </div>

        {filtered.length > 0 && (
          <Pagination
            page={currentPage}
            totalPages={totalPages}
            totalItems={filtered.length}
            pageSize={PAGE_SIZE}
            itemLabel="practitioners"
            onChange={setPage}
          />
        )}
      </div>
    </div>
  );
};

export default Practitioner;