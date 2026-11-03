"use client";

import React, { useMemo, useState } from "react";
import { Building2, CheckCircle2, MapPin, Network, XCircle } from "lucide-react";

import StatCards, { type StatItem } from "@/components/Statcards";
import SearchAndFilter from "@/components/Searchandfilter";
import ImportButton from "@/components/ImportButton";
import Table from "@/components/Table";
import TableStatus from "@/components/TableStatus";
import { type TableColumn } from "@/components/Tableheader";
import Content from "@/components/Content";
import Tags from "@/components/Tags";
import Name from "@/components/Name";
import Actions from "@/components/Actions";
import Pagination from "@/components/Pagination";
import RadioCheckButtonh from "@/components/RadioCheckButtonh";
import { TableSelectAllCheckbox, useTableSelection } from "@/components/TableSelection";

/* ---------------------------------------------------------------- */
/*  Data (replace with API / redux selector)                         */
/* ---------------------------------------------------------------- */
type LocationRow = {
  id: string;
  name: string;
  code: string;
  type: string;
  department: string;
  organization: string;
  address: string;
  status: "Active" | "Inactive";
};

const LOCATIONS: LocationRow[] = [
  { id: "1", name: "Main Clinic", code: "LOC-001", type: "Building", department: "-", organization: "Main Clinic", address: "123 Health St, New York, NY 10001", status: "Active" },
  { id: "2", name: "Heart Care Center", code: "LOC-002", type: "Facility", department: "Cardiology", organization: "Heart Care Center", address: "456 Cardio Ave, Los Angeles, CA 90001", status: "Active" },
  { id: "3", name: "Children's Hospital", code: "LOC-003", type: "Facility", department: "Pediatrics", organization: "Children's Hospital", address: "789 Pediatric Rd, Chicago, IL 60601", status: "Active" },
  { id: "4", name: "Ortho Care", code: "LOC-004", type: "Facility", department: "Orthopedics", organization: "Ortho Care", address: "321 Ortho Dr, Houston, TX 77001", status: "Active" },
  { id: "5", name: "Skin & Wellness", code: "LOC-005", type: "Clinic", department: "Dermatology", organization: "Skin & Wellness", address: "654 Wellness Ln, Phoenix, AZ 85001", status: "Inactive" },
  { id: "6", name: "Family Care Practice", code: "LOC-006", type: "Clinic", department: "Primary Care", organization: "Family Care Practice", address: "987 Family St, San Diego, CA 92101", status: "Active" },
  { id: "7", name: "Neuro Center", code: "LOC-007", type: "Facility", department: "Neurology", organization: "Neuro Center", address: "741 Neuro Ave, Miami, FL 33101", status: "Active" },
  { id: "8", name: "Women's Health", code: "LOC-008", type: "Clinic", department: "Gynecology", organization: "Women's Health", address: "159 Women's St, Dallas, TX 75201", status: "Active" },
  { id: "9", name: "Vision Care", code: "LOC-009", type: "Clinic", department: "Ophthalmology", organization: "Vision Care", address: "753 Vision Blvd, Seattle, WA 98101", status: "Active" },
  { id: "10", name: "Mind Health Center", code: "LOC-010", type: "Facility", department: "Behavioral Health", organization: "Mind Health Center", address: "852 Mind St, Boston, MA 02101", status: "Inactive" },
  { id: "11", name: "City General – East Wing", code: "LOC-011", type: "Building", department: "Emergency", organization: "City General", address: "10 Central Ave, Denver, CO 80201", status: "Active" },
];

const STATS: StatItem[] = [
  { label: "Total Locations", value: "28", Icon: Building2, accent: "primary" },
  { label: "Active Locations", value: "24", Icon: CheckCircle2, accent: "success" },
  { label: "Inactive Locations", value: "4", Icon: XCircle, accent: "danger" },
  { label: "Departments", value: "12", Icon: Network, accent: "violet" },
];

const TYPE_FILTER = "All Types";
const STATUS_FILTER = "All Statuses";
const ORG_FILTER = "All Organizations";
const EMPTY_FILTERS: Record<string, string> = { [TYPE_FILTER]: "", [STATUS_FILTER]: "", [ORG_FILTER]: "" };
const TYPE_OPTIONS = Array.from(new Set(LOCATIONS.map((l) => l.type)));
const ORG_OPTIONS = Array.from(new Set(LOCATIONS.map((l) => l.organization)));
const PAGE_SIZE = 10;

const checkboxCls =
  "h-4 w-4 cursor-pointer rounded border-border accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30";

/* ---------------------------------------------------------------- */
/*  Component                                                        */
/* ---------------------------------------------------------------- */
const FhirLocation = () => {
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
    return LOCATIONS.filter((l) => {
      if (q && ![l.name, l.code, l.address].some((f) => f.toLowerCase().includes(q))) return false;
      if (filters[TYPE_FILTER] && l.type !== filters[TYPE_FILTER]) return false;
      if (filters[STATUS_FILTER] && l.status !== filters[STATUS_FILTER]) return false;
      if (filters[ORG_FILTER] && l.organization !== filters[ORG_FILTER]) return false;
      return true;
    });
  }, [search, filters]);

  const totalPages = Math.max(Math.ceil(filtered.length / PAGE_SIZE), 1);
  const safePage = Math.min(page, totalPages);
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const from = filtered.length ? (safePage - 1) * PAGE_SIZE + 1 : 0;
  const to = filtered.length ? from + visible.length - 1 : 0;

  const { selectedKeys, allSelected, someSelected, toggleRow, toggleAll } = useTableSelection(visible.map((l) => l.id));

  const columns: TableColumn[] = [
    {
      key: "select",
      label: "",
      className: "w-10",
      header: <TableSelectAllCheckbox checked={allSelected} indeterminate={someSelected} onChange={toggleAll} className={checkboxCls} />,
    },
    { key: "name", label: "Name" },
    { key: "code", label: "Location Code" },
    { key: "type", label: "Type" },
    { key: "department", label: "Department" },
    { key: "organization", label: "Organization" },
    { key: "address", label: "Address" },
    { key: "status", label: "Status" },
    { key: "actions", label: "Actions", header: <div className="flex w-full items-center justify-center">Actions</div> },
  ];

  const rows = visible.map((l) => ({
    select: (
      <RadioCheckButtonh
        type="checkbox"
        checked={selectedKeys.has(l.id)}
        onChange={() => toggleRow(l.id)}
        aria-label={`Select ${l.name}`}
        className={checkboxCls}
      />
    ),
    name: <Name name={l.name} truncate />,
    code: <Content title={l.code} />,
    type: <Content title={l.type} />,
    department: <Content title={l.department} />,
    organization: <Content title={l.organization} />,
    address: <Content title={l.address} />,
    status: <Tags text={l.status} tone={l.status === "Active" ? "success" : "danger"} size="xs" />,
    actions: (
      <div className="flex w-full items-center justify-center">
        <Actions actions={["more"]} size="sm" />
      </div>
    ),
  }));

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-danger/10 text-danger">
          <MapPin className="h-5 w-5" />
        </span>
        <div>
          <h3 className="text-base font-semibold text-heading">Locations</h3>
          <p className="text-xs text-body sm:text-sm">Manage physical locations, departments, rooms and service areas.</p>
        </div>
      </div>

      <StatCards stats={STATS} />

      <SearchAndFilter
        placeholder="Search by name, code or address..."
        value={search}
        onSearch={(v: string) => {
          setSearch(v);
          setPage(1);
        }}
        filters={[
          { label: TYPE_FILTER, options: TYPE_OPTIONS },
          { label: STATUS_FILTER, options: ["Active", "Inactive"] },
          { label: ORG_FILTER, options: ORG_OPTIONS },
        ]}
        selectedFilters={filters}
        onFilterChange={(label: string, value: string) => {
          setFilters((prev) => ({ ...prev, [label]: value }));
          setPage(1);
        }}
        showDateRange
        trailingFilterAction={<ImportButton text="Reset" icon={null} onClick={reset} className="flex-none text-primary" />}
      />

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-base font-semibold text-heading">Locations List</h3>
          <span className="text-xs text-body">
            {from}-{to} of {filtered.length.toLocaleString()}
          </span>
        </div>
        <div className="overflow-hidden rounded-[14px] border border-border bg-card">
          {visible.length === 0 ? (
            <TableStatus variant="empty" message="No locations match your filters." />
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
            itemLabel="locations"
            onChange={setPage}
          />
        )}
      </section>
    </div>
  );
};

export default FhirLocation;