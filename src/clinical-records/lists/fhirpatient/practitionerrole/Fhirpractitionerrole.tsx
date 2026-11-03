"use client";

import React, { useMemo, useState } from "react";
import { Briefcase, CheckCircle2, UserCog, Users, XCircle } from "lucide-react";

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
type RoleRow = {
  id: string;
  practitioner: string;
  role: string;
  specialty: string;
  organization: string;
  location: string;
  startDate: string;
  endDate: string;
  status: "Active" | "Inactive";
};

const ROLES: RoleRow[] = [
  { id: "1", practitioner: "Dr. Sarah Wilson", role: "Attending Physician", specialty: "Internal Medicine", organization: "Main Clinic", location: "Main Branch", startDate: "Jan 10, 2024", endDate: "-", status: "Active" },
  { id: "2", practitioner: "Dr. Michael Johnson", role: "Consulting Physician", specialty: "Cardiology", organization: "Heart Care Center", location: "Downtown Center", startDate: "Feb 5, 2024", endDate: "-", status: "Active" },
  { id: "3", practitioner: "Dr. Emily Parker", role: "Primary Care Physician", specialty: "Pediatrics", organization: "Children's Hospital", location: "West Wing", startDate: "Mar 1, 2024", endDate: "-", status: "Active" },
  { id: "4", practitioner: "Dr. Robert Williams", role: "Surgeon", specialty: "Orthopedics", organization: "Ortho Care", location: "Surgery Center", startDate: "Jan 15, 2024", endDate: "-", status: "Active" },
  { id: "5", practitioner: "Dr. David Brown", role: "Consultant", specialty: "Dermatology", organization: "Skin & Wellness", location: "Main Branch", startDate: "Apr 10, 2024", endDate: "Sep 30, 2024", status: "Inactive" },
  { id: "6", practitioner: "Dr. Laura Anderson", role: "Nurse Practitioner", specialty: "Family Medicine", organization: "Main Clinic", location: "Main Branch", startDate: "Jan 5, 2024", endDate: "-", status: "Active" },
  { id: "7", practitioner: "Dr. Richard Kim", role: "Attending Physician", specialty: "Neurology", organization: "Neuro Center", location: "East Wing", startDate: "Feb 12, 2024", endDate: "-", status: "Active" },
  { id: "8", practitioner: "Dr. Susan Davis", role: "Physician Assistant", specialty: "Gynecology", organization: "Women's Health", location: "West Wing", startDate: "Mar 20, 2024", endDate: "-", status: "Active" },
  { id: "9", practitioner: "Dr. Thomas Patel", role: "Consulting Physician", specialty: "Ophthalmology", organization: "Vision Care", location: "Eye Center", startDate: "Jan 8, 2024", endDate: "-", status: "Active" },
  { id: "10", practitioner: "Dr. Nancy Green", role: "Psychiatrist", specialty: "Psychiatry", organization: "Mind Health Center", location: "Main Branch", startDate: "Apr 1, 2024", endDate: "-", status: "Active" },
  { id: "11", practitioner: "Dr. Paul Adams", role: "Consulting Physician", specialty: "Cardiology", organization: "Heart Care Center", location: "Downtown Center", startDate: "May 6, 2024", endDate: "-", status: "Active" },
];

const STATS: StatItem[] = [
  { label: "Total Roles", value: "412", Icon: Users, accent: "primary" },
  { label: "Active Roles", value: "356", Icon: CheckCircle2, accent: "success" },
  { label: "Inactive Roles", value: "56", Icon: XCircle, accent: "danger" },
  { label: "Unique Practitioners", value: "256", Icon: UserCog, accent: "warning" },
];

const ROLE_FILTER = "All Roles";
const ORG_FILTER = "All Organizations";
const LOC_FILTER = "All Locations";
const STATUS_FILTER = "All Statuses";
const EMPTY_FILTERS: Record<string, string> = { [ROLE_FILTER]: "", [ORG_FILTER]: "", [LOC_FILTER]: "", [STATUS_FILTER]: "" };
const uniq = (key: keyof RoleRow) => Array.from(new Set(ROLES.map((r) => r[key])));
const PAGE_SIZE = 10;

const checkboxCls =
  "h-4 w-4 cursor-pointer rounded border-border accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30";

/* ---------------------------------------------------------------- */
/*  Component                                                        */
/* ---------------------------------------------------------------- */
const FhirPractitionerRole = () => {
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
    return ROLES.filter((r) => {
      if (q && ![r.practitioner, r.role, r.specialty].some((f) => f.toLowerCase().includes(q))) return false;
      if (filters[ROLE_FILTER] && r.role !== filters[ROLE_FILTER]) return false;
      if (filters[ORG_FILTER] && r.organization !== filters[ORG_FILTER]) return false;
      if (filters[LOC_FILTER] && r.location !== filters[LOC_FILTER]) return false;
      if (filters[STATUS_FILTER] && r.status !== filters[STATUS_FILTER]) return false;
      return true;
    });
  }, [search, filters]);

  const totalPages = Math.max(Math.ceil(filtered.length / PAGE_SIZE), 1);
  const safePage = Math.min(page, totalPages);
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const { selectedKeys, allSelected, someSelected, toggleRow, toggleAll } = useTableSelection(visible.map((r) => r.id));

  const columns: TableColumn[] = [
    {
      key: "select",
      label: "",
      className: "w-10",
      header: <TableSelectAllCheckbox checked={allSelected} indeterminate={someSelected} onChange={toggleAll} className={checkboxCls} />,
    },
    { key: "practitioner", label: "Practitioner" },
    { key: "role", label: "Role" },
    { key: "specialty", label: "Specialty" },
    { key: "organization", label: "Organization" },
    { key: "location", label: "Location" },
    { key: "startDate", label: "Start Date" },
    { key: "endDate", label: "End Date" },
    { key: "status", label: "Status" },
    { key: "actions", label: "Actions", header: <div className="flex w-full items-center justify-center">Actions</div> },
  ];

  const rows = visible.map((r) => ({
    select: (
      <RadioCheckButtonh
        type="checkbox"
        checked={selectedKeys.has(r.id)}
        onChange={() => toggleRow(r.id)}
        aria-label={`Select ${r.practitioner}`}
        className={checkboxCls}
      />
    ),
    practitioner: <Name name={r.practitioner} />,
    role: <Content title={r.role} />,
    specialty: <Content title={r.specialty} />,
    organization: <Content title={r.organization} />,
    location: <Content title={r.location} />,
    startDate: <Content title={r.startDate} />,
    endDate: <Content title={r.endDate} />,
    status: <Tags text={r.status} tone={r.status === "Active" ? "success" : "danger"} size="xs" />,
    actions: (
      <div className="flex w-full items-center justify-center">
        <Actions actions={["more"]} size="sm" />
      </div>
    ),
  }));

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Panel header */}
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet/10 text-violet">
          <Briefcase className="h-5 w-5" />
        </span>
        <div>
          <h3 className="text-base font-semibold text-heading">Practitioner Roles</h3>
          <p className="text-xs text-body sm:text-sm">Manage practitioner roles, specialties and organizational assignments.</p>
        </div>
      </div>

      <StatCards stats={STATS} />

      <SearchAndFilter
        placeholder="Search by practitioner name, role, specialty..."
        value={search}
        onSearch={(v: string) => {
          setSearch(v);
          setPage(1);
        }}
        filters={[
          { label: ROLE_FILTER, options: uniq("role") as string[] },
          { label: ORG_FILTER, options: uniq("organization") as string[] },
          { label: LOC_FILTER, options: uniq("location") as string[] },
          { label: STATUS_FILTER, options: ["Active", "Inactive"] },
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
          <h3 className="text-base font-semibold text-heading">Practitioner Roles List</h3>
          <span className="text-xs text-body">
            {filtered.length === 0 ? "0" : `${(safePage - 1) * PAGE_SIZE + 1}-${(safePage - 1) * PAGE_SIZE + visible.length}`} of{" "}
            {filtered.length.toLocaleString()}
          </span>
        </div>
        <div className="overflow-hidden rounded-[14px] border border-border bg-card">
          {visible.length === 0 ? (
            <TableStatus variant="empty" message="No practitioner roles match your filters." />
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
            itemLabel="roles"
            onChange={setPage}
          />
        )}
      </section>
    </div>
  );
};

export default FhirPractitionerRole;