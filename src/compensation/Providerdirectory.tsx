"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import AddButton from "@/components/Addbutton";
import SearchAndFilter from "@/components/Searchandfilter";
import Table from "@/components/Table";
import TableStatus from "@/components/TableStatus";
import { type TableColumn } from "@/components/Tableheader";
import Content from "@/components/Content";
import Tags from "@/components/Tags";
import Name from "@/components/Name";
import Actions from "@/components/Actions";
import Pagination from "@/components/Pagination";
import Breadcrumb from "@/components/Breadcrumb";

/* ---------------------------------------------------------------- */
/*  Static data (replace with API / redux selector)                  */
/* ---------------------------------------------------------------- */
type ProviderRow = {
  id: string;
  name: string;
  email: string;
  type: "Independent Contractor" | "KOOLMD Direct" | "External Agency";
  rateModel: "Per Consultation" | "Per Case" | "Fixed Rate";
  status: "Active" | "Inactive";
};

const PROVIDERS: ProviderRow[] = [
  { id: "PR-1001", name: "Dr. John Carter", email: "john.carter@koolmd.com", type: "Independent Contractor", rateModel: "Per Consultation", status: "Active" },
  { id: "PR-1002", name: "Dr. Emily Rogers", email: "emily.rogers@koolmd.com", type: "KOOLMD Direct", rateModel: "Per Case", status: "Active" },
  { id: "PR-1003", name: "Dr. Michael Lee", email: "michael.lee@koolmd.com", type: "Independent Contractor", rateModel: "Fixed Rate", status: "Active" },
  { id: "PR-1004", name: "MedStaff Agency", email: "billing@medstaff.com", type: "External Agency", rateModel: "Per Consultation", status: "Active" },
  { id: "PR-1005", name: "CarePlus Agency", email: "accounts@careplus.com", type: "External Agency", rateModel: "Per Consultation", status: "Inactive" },
  { id: "PR-1006", name: "Dr. Sarah Wilson", email: "sarah.wilson@koolmd.com", type: "KOOLMD Direct", rateModel: "Fixed Rate", status: "Active" },
  { id: "PR-1007", name: "Dr. Robert Williams", email: "robert.williams@koolmd.com", type: "Independent Contractor", rateModel: "Per Case", status: "Active" },
  { id: "PR-1008", name: "Dr. Laura Anderson", email: "laura.anderson@koolmd.com", type: "KOOLMD Direct", rateModel: "Per Consultation", status: "Active" },
  { id: "PR-1009", name: "HealthBridge Staffing", email: "info@healthbridge.com", type: "External Agency", rateModel: "Per Case", status: "Inactive" },
  { id: "PR-1010", name: "Dr. Richard Kim", email: "richard.kim@koolmd.com", type: "Independent Contractor", rateModel: "Per Consultation", status: "Active" },
  { id: "PR-1011", name: "Dr. Nancy Green", email: "nancy.green@koolmd.com", type: "KOOLMD Direct", rateModel: "Fixed Rate", status: "Active" },
];

const TYPE_FILTER = "All Types";
const STATUS_FILTER = "All Statuses";
const EMPTY_FILTERS: Record<string, string> = { [TYPE_FILTER]: "", [STATUS_FILTER]: "" };
const TYPE_OPTIONS = Array.from(new Set(PROVIDERS.map((p) => p.type)));
const PAGE_SIZE = 10;

const COLUMNS: TableColumn[] = [
  { key: "id", label: "Provider ID" },
  { key: "name", label: "Provider Name" },
  { key: "type", label: "Type" },
  { key: "rateModel", label: "Rate Model" },
  { key: "status", label: "Status" },
  { key: "actions", label: "Actions", header: <div className="flex w-full items-center justify-center">Actions</div> },
];

/* ---------------------------------------------------------------- */
/*  Component                                                        */
/* ---------------------------------------------------------------- */
const ProviderDirectory = () => {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return PROVIDERS.filter((p) => {
      if (q && ![p.name, p.id, p.email].some((f) => f.toLowerCase().includes(q))) return false;
      if (filters[TYPE_FILTER] && p.type !== filters[TYPE_FILTER]) return false;
      if (filters[STATUS_FILTER] && p.status !== filters[STATUS_FILTER]) return false;
      return true;
    });
  }, [search, filters]);

  const totalPages = Math.max(Math.ceil(filtered.length / PAGE_SIZE), 1);
  const safePage = Math.min(page, totalPages);
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const rows = visible.map((p) => ({
    id: <Content title={p.id} />,
    name: <Name name={p.name} sub={p.email} truncate />,
    type: <Content title={p.type} />,
    rateModel: <Content title={p.rateModel} />,
    status: <Tags text={p.status} tone={p.status === "Active" ? "success" : "danger"} size="xs" />,
    actions: (
      <div className="flex w-full items-center justify-center">
        <Actions
          actions={["view", "edit"]}
          size="sm"
          onAction={(action) => {
            if (action === "view") router.push(`/compensation/provider-profile?id=${encodeURIComponent(p.id)}`);
            if (action === "edit") router.push(`/compensation/agreement?providerId=${encodeURIComponent(p.id)}`);
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
          { label: "Compensation", href: "/compensation" },
          { label: "Provider Directory" },
        ]}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-heading sm:text-xl 2xl:text-2xl">Provider Directory</h2>
          <p className="mt-0.5 text-sm text-body">View and manage provider compensation details.</p>
        </div>
        <AddButton
          text="Add Provider"
          onClick={() => router.push("/provider/add-provider")}
          className="shrink-0 whitespace-nowrap"
        />
      </div>

      <SearchAndFilter
        placeholder="Search by name, ID or email..."
        value={search}
        onSearch={(v: string) => {
          setSearch(v);
          setPage(1);
        }}
        filters={[
          { label: TYPE_FILTER, options: TYPE_OPTIONS },
          { label: STATUS_FILTER, options: ["Active", "Inactive"] },
        ]}
        selectedFilters={filters}
        onFilterChange={(label: string, value: string) => {
          setFilters((prev) => ({ ...prev, [label]: value }));
          setPage(1);
        }}
        showDateRange={false}
      />

      <div className="space-y-3">
        <div className="overflow-hidden rounded-[14px] border border-border bg-card">
          {visible.length === 0 ? (
            <TableStatus variant="empty" message="No providers match your filters." />
          ) : (
            <Table columns={COLUMNS} rows={rows} bordered={false} />
          )}
        </div>
        {filtered.length > 0 && (
          <Pagination
            page={safePage}
            totalPages={totalPages}
            totalItems={filtered.length}
            pageSize={PAGE_SIZE}
            itemLabel="providers"
            onChange={setPage}
          />
        )}
      </div>
    </div>
  );
};

export default ProviderDirectory;