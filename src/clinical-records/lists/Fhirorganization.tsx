"use client";

import React, { useMemo, useState } from "react";
import { Building, Building2, CheckCircle2, MapPin, XCircle } from "lucide-react";

import StatCards, { type StatItem } from "@/components/Statcards";
import SearchAndFilter from "@/components/Searchandfilter";
import ImportButton from "@/components/ImportButton";
import Table from "@/components/Table";
import TableStatus from "@/components/TableStatus";
import { type TableColumn } from "@/components/Tableheader";
import Content from "@/components/Content";
import Tags from "@/components/Tags";
import Name from "@/components/Name";
import LinkComponent from "@/components/LinkComponent";
import Actions from "@/components/Actions";
import Pagination from "@/components/Pagination";
import RadioCheckButtonh from "@/components/RadioCheckButtonh";
import { TableSelectAllCheckbox, useTableSelection } from "@/components/TableSelection";

/* ---------------------------------------------------------------- */
/*  Data (replace with API / redux selector)                         */
/* ---------------------------------------------------------------- */
type OrgRow = {
  id: string;
  name: string;
  type: string;
  npi: string;
  phone: string;
  email: string;
  address: [line1: string, line2: string];
  locations: number;
  status: "Active" | "Inactive";
};

const ORGANIZATIONS: OrgRow[] = [
  { id: "1", name: "Main Clinic", type: "Hospital", npi: "1234567890", phone: "+1 (555) 123-4567", email: "info@mainclinic.com", address: ["123 Health St,", "New York, NY 10001"], locations: 3, status: "Active" },
  { id: "2", name: "Heart Care Center", type: "Clinic", npi: "2345678901", phone: "+1 (555) 987-6543", email: "contact@heartcare.com", address: ["456 Cardio Ave, Los Angeles,", "CA 90001"], locations: 2, status: "Active" },
  { id: "3", name: "Children's Hospital", type: "Hospital", npi: "3456789012", phone: "+1 (555) 222-3344", email: "info@childrenshospital.com", address: ["789 Pediatric Rd, Chicago, IL", "60601"], locations: 4, status: "Active" },
  { id: "4", name: "Ortho Care", type: "Specialty Clinic", npi: "4567890123", phone: "+1 (555) 444-5566", email: "info@orthocare.com", address: ["321 Ortho Dr, Houston, TX", "77001"], locations: 2, status: "Active" },
  { id: "5", name: "Skin & Wellness", type: "Clinic", npi: "5678901234", phone: "+1 (555) 666-7788", email: "info@skinwellness.com", address: ["654 Wellness Ln, Phoenix, AZ", "85001"], locations: 1, status: "Inactive" },
  { id: "6", name: "Family Care Practice", type: "Clinic", npi: "6789012345", phone: "+1 (555) 777-8899", email: "info@familycare.com", address: ["987 Family St, San Diego, CA", "92101"], locations: 3, status: "Active" },
  { id: "7", name: "Neuro Center", type: "Specialty Clinic", npi: "7890123456", phone: "+1 (555) 888-9900", email: "info@neurocenter.com", address: ["741 Neuro Ave, Miami, FL", "33101"], locations: 2, status: "Active" },
  { id: "8", name: "Women's Health", type: "Clinic", npi: "8901234567", phone: "+1 (555) 999-1122", email: "contact@womenshealth.com", address: ["159 Women's St, Dallas, TX", "75201"], locations: 1, status: "Active" },
  { id: "9", name: "Vision Care", type: "Clinic", npi: "9012345678", phone: "+1 (555) 111-2233", email: "info@visioncare.com", address: ["753 Vision Blvd, Seattle, WA", "98101"], locations: 4, status: "Active" },
  { id: "10", name: "Mind Health Center", type: "Clinic", npi: "0123456789", phone: "+1 (555) 333-4455", email: "contact@mindhealth.com", address: ["852 Mind St, Boston, MA 02101", ""], locations: 2, status: "Inactive" },
  { id: "11", name: "City General", type: "Hospital", npi: "1122334455", phone: "+1 (555) 212-3434", email: "info@citygeneral.com", address: ["10 Central Ave, Denver, CO", "80201"], locations: 5, status: "Active" },
];

const STATS: StatItem[] = [
  { label: "Total Organizations", value: "52", Icon: Building2, accent: "primary" },
  { label: "Active Organizations", value: "46", Icon: CheckCircle2, accent: "success" },
  { label: "Inactive Organizations", value: "6", Icon: XCircle, accent: "danger" },
  { label: "Multi-Location", value: "18", Icon: MapPin, accent: "warning" },
];

const TYPE_FILTER = "All Types";
const STATUS_FILTER = "All Statuses";
const LOC_FILTER = "All Locations";
const EMPTY_FILTERS: Record<string, string> = { [TYPE_FILTER]: "", [STATUS_FILTER]: "", [LOC_FILTER]: "" };
const TYPE_OPTIONS = Array.from(new Set(ORGANIZATIONS.map((o) => o.type)));
const STATE_OPTIONS = Array.from(new Set(ORGANIZATIONS.map((o) => o.address[0].split(",").slice(-1)[0].trim().split(" ").pop() ?? "")));
const PAGE_SIZE = 10;

const checkboxCls =
  "h-4 w-4 cursor-pointer rounded border-border accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30";

/* ---------------------------------------------------------------- */
/*  Component                                                        */
/* ---------------------------------------------------------------- */
const FhirOrganization = () => {
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
    return ORGANIZATIONS.filter((o) => {
      if (q && ![o.name, o.npi, o.email].some((f) => f.toLowerCase().includes(q))) return false;
      if (filters[TYPE_FILTER] && o.type !== filters[TYPE_FILTER]) return false;
      if (filters[STATUS_FILTER] && o.status !== filters[STATUS_FILTER]) return false;
      if (filters[LOC_FILTER] && !o.address.join(" ").includes(filters[LOC_FILTER])) return false;
      return true;
    });
  }, [search, filters]);

  const totalPages = Math.max(Math.ceil(filtered.length / PAGE_SIZE), 1);
  const safePage = Math.min(page, totalPages);
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const from = filtered.length ? (safePage - 1) * PAGE_SIZE + 1 : 0;
  const to = filtered.length ? from + visible.length - 1 : 0;

  const { selectedKeys, allSelected, someSelected, toggleRow, toggleAll } = useTableSelection(visible.map((o) => o.id));

  const columns: TableColumn[] = [
    {
      key: "select",
      label: "",
      className: "w-10",
      header: <TableSelectAllCheckbox checked={allSelected} indeterminate={someSelected} onChange={toggleAll} className={checkboxCls} />,
    },
    { key: "name", label: "Name" },
    { key: "type", label: "Type" },
    { key: "npi", label: "NPI / Identifier" },
    { key: "phone", label: "Phone" },
    { key: "email", label: "Email" },
    { key: "address", label: "Address" },
    { key: "locations", label: "Locations" },
    { key: "status", label: "Status" },
    { key: "actions", label: "Actions", header: <div className="flex w-full items-center justify-center">Actions</div> },
  ];

  const rows = visible.map((o) => ({
    select: (
      <RadioCheckButtonh
        type="checkbox"
        checked={selectedKeys.has(o.id)}
        onChange={() => toggleRow(o.id)}
        aria-label={`Select ${o.name}`}
        className={checkboxCls}
      />
    ),
    name: <Name name={o.name} truncate />,
    type: <Content title={o.type} />,
    npi: <Content title={o.npi} />,
    phone: <Content title={o.phone} />,
    email: <LinkComponent>{o.email}</LinkComponent>,
    address: <Content title={o.address[0]} description={o.address[1] || undefined} />,
    locations: <Content title={String(o.locations)} />,
    status: <Tags text={o.status} tone={o.status === "Active" ? "success" : "danger"} size="xs" />,
    actions: (
      <div className="flex w-full items-center justify-center">
        <Actions actions={["more"]} size="sm" />
      </div>
    ),
  }));

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-warning/10 text-warning">
          <Building className="h-5 w-5" />
        </span>
        <div>
          <h3 className="text-base font-semibold text-heading">Organizations</h3>
          <p className="text-xs text-body sm:text-sm">
            Manage healthcare organizations such as hospitals, clinics, practices, and healthcare systems.
          </p>
        </div>
      </div>

      <StatCards stats={STATS} />

      <SearchAndFilter
        placeholder="Search by organization name, NPI, identifier..."
        value={search}
        onSearch={(v: string) => {
          setSearch(v);
          setPage(1);
        }}
        filters={[
          { label: TYPE_FILTER, options: TYPE_OPTIONS },
          { label: STATUS_FILTER, options: ["Active", "Inactive"] },
          { label: LOC_FILTER, options: STATE_OPTIONS },
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
          <h3 className="text-base font-semibold text-heading">Organizations List</h3>
          <span className="text-xs text-body">
            {from}-{to} of {filtered.length.toLocaleString()}
          </span>
        </div>
        <div className="overflow-hidden rounded-[14px] border border-border bg-card">
          {visible.length === 0 ? (
            <TableStatus variant="empty" message="No organizations match your filters." />
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
            itemLabel="organizations"
            onChange={setPage}
          />
        )}
      </section>
    </div>
  );
};

export default FhirOrganization;