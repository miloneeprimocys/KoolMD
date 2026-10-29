"use client";

import React, { useMemo, useState } from "react";
import { Stethoscope, UserCheck, UserMinus, UserPlus, Users } from "lucide-react";

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
type PractitionerRow = {
  id: string;
  name: string;
  npi: string;
  specialty: string;
  organization: string;
  phone: string;
  email: string;
  status: "Active" | "Inactive";
};

const PRACTITIONERS: PractitionerRow[] = [
  { id: "1", name: "Dr. Sarah Wilson", npi: "1234567890", specialty: "Internal Medicine", organization: "Main Clinic", phone: "+1 (555) 123-4567", email: "sarah.wilson@clinic.com", status: "Active" },
  { id: "2", name: "Dr. Michael Johnson", npi: "2345678901", specialty: "Cardiology", organization: "Heart Care Center", phone: "+1 (555) 987-6543", email: "m.johnson@heartcare.com", status: "Active" },
  { id: "3", name: "Dr. Emily Parker", npi: "3456789012", specialty: "Pediatrics", organization: "Children's Hospital", phone: "+1 (555) 222-3344", email: "emily.parker@childclinic.com", status: "Active" },
  { id: "4", name: "Dr. Robert Williams", npi: "4567890123", specialty: "Orthopedics", organization: "Ortho Care", phone: "+1 (555) 444-5566", email: "robert.williams@orthocare.com", status: "Active" },
  { id: "5", name: "Dr. David Brown", npi: "5678901234", specialty: "Dermatology", organization: "Skin & Wellness", phone: "+1 (555) 666-7788", email: "david.brown@skinwellness.com", status: "Inactive" },
  { id: "6", name: "Dr. Laura Anderson", npi: "6789012345", specialty: "Family Medicine", organization: "Main Clinic", phone: "+1 (555) 777-8899", email: "laura.anderson@clinic.com", status: "Active" },
  { id: "7", name: "Dr. Richard Kim", npi: "7890123456", specialty: "Neurology", organization: "Neuro Center", phone: "+1 (555) 888-9900", email: "richard.kim@neurocenter.com", status: "Active" },
  { id: "8", name: "Dr. Susan Davis", npi: "8901234567", specialty: "Gynecology", organization: "Women's Health", phone: "+1 (555) 999-1122", email: "susan.davis@womenshealth.com", status: "Active" },
  { id: "9", name: "Dr. Thomas Patel", npi: "9012345678", specialty: "Ophthalmology", organization: "Vision Care", phone: "+1 (555) 111-2233", email: "thomas.patel@visioncare.com", status: "Inactive" },
  { id: "10", name: "Dr. Nancy Green", npi: "0123456789", specialty: "Psychiatry", organization: "Mind Health Center", phone: "+1 (555) 333-4455", email: "nancy.green@mindhealth.com", status: "Active" },
  { id: "11", name: "Dr. Paul Adams", npi: "1122334455", specialty: "Cardiology", organization: "Heart Care Center", phone: "+1 (555) 212-3434", email: "paul.adams@heartcare.com", status: "Active" },
];

const STATS: StatItem[] = [
  { label: "Total Practitioners", value: "256", Icon: Users, accent: "primary" },
  { label: "Active Practitioners", value: "228", Icon: UserCheck, accent: "success" },
  { label: "Inactive Practitioners", value: "28", Icon: UserMinus, accent: "danger" },
  { label: "New This Month", value: "15", Icon: UserPlus, accent: "warning" },
];

const SPECIALTY_FILTER = "All Specialties";
const STATUS_FILTER = "All Statuses";
const ORG_FILTER = "All Organizations";
const EMPTY_FILTERS: Record<string, string> = { [SPECIALTY_FILTER]: "", [STATUS_FILTER]: "", [ORG_FILTER]: "" };
const SPECIALTY_OPTIONS = Array.from(new Set(PRACTITIONERS.map((p) => p.specialty)));
const ORG_OPTIONS = Array.from(new Set(PRACTITIONERS.map((p) => p.organization)));
const PAGE_SIZE = 10;

const AVATAR_TONES = [
  "bg-violet/15 text-violet",
  "bg-warning/15 text-warning",
  "bg-danger/15 text-danger",
  "bg-success/15 text-success",
  "bg-primary/15 text-primary",
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
const FhirPractitioner = () => {
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
    return PRACTITIONERS.filter((p) => {
      if (q && ![p.name, p.npi, p.email].some((f) => f.toLowerCase().includes(q))) return false;
      if (filters[SPECIALTY_FILTER] && p.specialty !== filters[SPECIALTY_FILTER]) return false;
      if (filters[STATUS_FILTER] && p.status !== filters[STATUS_FILTER]) return false;
      if (filters[ORG_FILTER] && p.organization !== filters[ORG_FILTER]) return false;
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
    { key: "npi", label: "NPI" },
    { key: "specialty", label: "Specialty" },
    { key: "organization", label: "Organization" },
    { key: "phone", label: "Phone" },
    { key: "email", label: "Email" },
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
    name: <Name name={p.name} sub={p.specialty} truncate />,
    npi: <Content title={p.npi} />,
    specialty: <Content title={p.specialty} />,
    organization: <Content title={p.organization} />,
    phone: <Content title={p.phone} />,
    email: <LinkComponent>{p.email}</LinkComponent>,
    status: <Tags text={p.status} tone={p.status === "Active" ? "success" : "danger"} size="xs" />,
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
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-success/10 text-success">
          <Stethoscope className="h-5 w-5" />
        </span>
        <div>
          <h3 className="text-base font-semibold text-heading">Practitioners</h3>
          <p className="text-xs text-body sm:text-sm">Manage healthcare providers and their demographic information.</p>
        </div>
      </div>

      <StatCards stats={STATS} />

      <SearchAndFilter
        placeholder="Search by name, NPI, email..."
        value={search}
        onSearch={(v: string) => {
          setSearch(v);
          setPage(1);
        }}
        filters={[
          { label: SPECIALTY_FILTER, options: SPECIALTY_OPTIONS },
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
          <h3 className="text-base font-semibold text-heading">Practitioners List</h3>
          <span className="text-xs text-body">
            {filtered.length === 0 ? "0" : `${(safePage - 1) * PAGE_SIZE + 1}-${(safePage - 1) * PAGE_SIZE + visible.length}`} of{" "}
            {filtered.length.toLocaleString()}
          </span>
        </div>
        <div className="overflow-hidden rounded-[14px] border border-border bg-card">
          {visible.length === 0 ? (
            <TableStatus variant="empty" message="No practitioners match your filters." />
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
            itemLabel="practitioners"
            onChange={setPage}
          />
        )}
      </section>
    </div>
  );
};

export default FhirPractitioner;