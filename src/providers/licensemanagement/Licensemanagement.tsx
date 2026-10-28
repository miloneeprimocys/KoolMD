"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import AddButton from "@/components/Addbutton";
import SearchAndFilter from "@/components/Searchandfilter";
import Table from "@/components/Table";
import TableStatus from "@/components/TableStatus";
import { type TableColumn } from "@/components/Tableheader";
import Name from "@/components/Name";
import Content from "@/components/Content";
import Tags from "@/components/Tags";
import Actions from "@/components/Actions";
import Pagination from "@/components/Pagination";
import Breadcrumb from "@/components/Breadcrumb";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppHooks";
import { showDeleteLicense } from "@/redux/slices/dialogslice";

import { LICENSE_STATUSES, LICENSE_TYPES, STATUS_TONES, fmtDate } from "./addlicense/Licenseinformation";
import ExpiredLicense from "./Expiredlicense";

/* ---------------------------------------------------------------- */
/*  Types + constants                                                */
/* ---------------------------------------------------------------- */
type LicenseRow = {
  id: string;
  provider: string;
  licenseNumber: string;
  state: string;
  licenseType: string;
  expiryDate: string; // yyyy-mm-dd
  status: string;
};

const STATE_FILTER_LABEL = "All States";
const TYPE_FILTER_LABEL = "All License Types";
const STATUS_FILTER_LABEL = "All Statuses";

const STATE_CODES = ["CA", "NY", "TX", "FL", "IL", "GA"];
const PROVIDER_NAMES = ["Sarah Mitchell", "James Carter", "Emily Wilson", "Michael Lee", "Priya Shah", "Daniel Kim"];

const PAGE_SIZE = 10;

type Tab = "all" | "expired";
const TABS: { id: Tab; label: string }[] = [
  { id: "all", label: "All Licenses" },
  { id: "expired", label: "Expired Licenses" },
];

/* TODO: replace with your API / redux selector */
const SAMPLE_LICENSES: LicenseRow[] = Array.from({ length: 24 }, (_, i) => ({
  id: `l${i + 1}`,
  provider: `Dr. ${PROVIDER_NAMES[i % PROVIDER_NAMES.length]}`,
  licenseNumber: `${String.fromCharCode(65 + (i % 8))}${123456 + i * 1111}`,
  state: STATE_CODES[i % STATE_CODES.length],
  licenseType: LICENSE_TYPES[i % 2],
  expiryDate: `${2024 + (i % 3)}-${String((i % 12) + 1).padStart(2, "0")}-14`,
  status: LICENSE_STATUSES[i % LICENSE_STATUSES.length],
}));

/* ---------------------------------------------------------------- */
/*  Component                                                        */
/* ---------------------------------------------------------------- */
const LicenseManagement = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const deletedLicenseIds = useAppSelector((state) => state.dialog.deletedLicenseIds);

  const [tab, setTab] = useState<Tab>("all");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({
    [STATE_FILTER_LABEL]: "",
    [TYPE_FILTER_LABEL]: "",
    [STATUS_FILTER_LABEL]: "",
  });
  const [page, setPage] = useState(1);

  const licenseFilters = useMemo(
    () => [
      { label: STATE_FILTER_LABEL, options: STATE_CODES.map((s) => ({ value: s, label: s })) },
      { label: TYPE_FILTER_LABEL, options: LICENSE_TYPES.map((t) => ({ value: t, label: t })) },
      { label: STATUS_FILTER_LABEL, options: LICENSE_STATUSES.map((s) => ({ value: s, label: s })) },
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

  /* ---------- Filtered + paged ---------- */
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return SAMPLE_LICENSES.filter((l) => !deletedLicenseIds.includes(l.id)).filter((l) => {
      if (term && ![l.provider, l.licenseNumber, l.state, l.licenseType].some((f) => f.toLowerCase().includes(term)))
        return false;
      if (filters[STATE_FILTER_LABEL] && l.state !== filters[STATE_FILTER_LABEL]) return false;
      if (filters[TYPE_FILTER_LABEL] && l.licenseType !== filters[TYPE_FILTER_LABEL]) return false;
      if (filters[STATUS_FILTER_LABEL] && l.status !== filters[STATUS_FILTER_LABEL]) return false;
      return true;
    });
  }, [deletedLicenseIds, search, filters]);

  const totalPages = Math.max(Math.ceil(filtered.length / PAGE_SIZE), 1);
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  /* ---------- Table ---------- */
  const columns: TableColumn[] = [
    { key: "provider", label: "Provider Name" },
    { key: "licenseNumber", label: "License Number" },
    { key: "state", label: "State" },
    { key: "licenseType", label: "License Type" },
    { key: "expiryDate", label: "Expiry Date" },
    { key: "status", label: "Status" },
    { key: "actions", label: "Actions", header: <div className="flex w-full items-center justify-center">Actions</div> },
  ];

  const rows = pageItems.map((l) => ({
    provider: <Name name={l.provider} />,
    licenseNumber: <Content title={l.licenseNumber} />,
    state: <Content title={l.state} />,
    licenseType: <Content title={l.licenseType} />,
    expiryDate: <Content title={fmtDate(l.expiryDate)} />,
    status: <Tags text={l.status} tone={STATUS_TONES[l.status] ?? "neutral"} />,
    actions: (
      <div className="flex w-full items-center justify-center">
        <Actions
          actions={["view", "edit", "delete"]}
          onAction={(action) => {
            if (action === "view") router.push(`/provider/license-management/view?id=${l.id}`);
            else if (action === "edit") router.push(`/provider/license-management/edit?id=${l.id}`);
            else if (action === "delete") dispatch(showDeleteLicense(l));
          }}
        />
      </div>
    ),
  }));

  const tabCls = (active: boolean) =>
    `-mb-px cursor-pointer border-b-2 pb-2.5 text-sm font-medium transition-colors ${
      active ? "border-primary text-primary" : "border-transparent text-body hover:text-heading"
    }`;

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-4 sm:space-y-5">
      <Breadcrumb items={[{ label: "Dashboard", href: "/dashboard" }, { label: "License Management" }]} />

      {/* Title + actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-heading sm:text-lg 2xl:text-2xl">License Management</h2>
          <p className="mt-0.5 text-sm text-body">Manage all provider licenses, verification and expiration alerts.</p>
        </div>
        <AddButton text="Add License" onClick={() => router.push("/provider/license-management/add")} />
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-border">
        {TABS.map((t) => (
          <button key={t.id} type="button" className={tabCls(tab === t.id)} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "expired" ? (
        <ExpiredLicense />
      ) : (
        <>
          <SearchAndFilter
            placeholder="Search by provider, license number or state..."
            filters={licenseFilters}
            value={search}
            onSearch={handleSearch}
            selectedFilters={filters}
            onFilterChange={handleFilterChange}
            showDateRange={false}
          />

          <div className="space-y-3">
            <div className="overflow-hidden rounded-[14px] border border-border bg-card">
              {pageItems.length === 0 ? (
                <TableStatus variant="empty" message="No licenses match your filters." />
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
                itemLabel="licenses"
                onChange={setPage}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default LicenseManagement;

