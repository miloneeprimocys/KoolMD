"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Crown, Headset, Stethoscope, User, Users, type LucideIcon } from "lucide-react";

import AddButton from "@/components/Addbutton";
import SearchAndFilter from "@/components/Searchandfilter";
import Table from "@/components/Table";
import TableStatus from "@/components/TableStatus";
import { type TableColumn } from "@/components/Tableheader";
import Content from "@/components/Content";
import Tags from "@/components/Tags";
import Actions from "@/components/Actions";
import Pagination from "@/components/Pagination";

/* ---------------------------------------------------------------- */
/*  Static data (replace with API / redux selector)                  */
/* ---------------------------------------------------------------- */
type RoleRow = {
  id: string;
  name: string;
  Icon: LucideIcon;
  users: number;
  scope: string;
  status: "Active" | "Inactive";
};

const ROLES: RoleRow[] = [
  { id: "admin", name: "Admin", Icon: Crown, users: 4, scope: "Full Access (All Modules)", status: "Active" },
  { id: "receptionist", name: "Receptionist", Icon: Headset, users: 6, scope: "Operational (Patients, Appointments, Messaging)", status: "Active" },
  { id: "practitioner", name: "Practitioner / MD", Icon: Stethoscope, users: 12, scope: "Clinical & Operational (Patients, Appointments, Documents, Messaging)", status: "Active" },
  { id: "staff", name: "Staff", Icon: Users, users: 8, scope: "Limited (Appointments, Documents, Messaging)", status: "Active" },
  { id: "patient", name: "Patient", Icon: User, users: 12, scope: "Self-Service (Appointments, Documents, Messaging)", status: "Active" },
];

const STATUS_FILTER = "All Statuses";
const PAGE_SIZE = 10;
const BASE = "/settings/roles-permissions";

const COLUMNS: TableColumn[] = [
  { key: "role", label: "Role" },
  { key: "users", label: "Users Assigned" },
  { key: "scope", label: "Access Scope" },
  { key: "status", label: "Status" },
  { key: "actions", label: "Actions", header: <div className="flex w-full items-center justify-center">Actions</div> },
];

/* ---------------------------------------------------------------- */
/*  Component                                                        */
/* ---------------------------------------------------------------- */
const RoleList = () => {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return ROLES.filter((r) => {
      if (q && !r.name.toLowerCase().includes(q)) return false;
      if (status && r.status !== status) return false;
      return true;
    });
  }, [search, status]);

  const totalPages = Math.max(Math.ceil(filtered.length / PAGE_SIZE), 1);
  const safePage = Math.min(page, totalPages);
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const rows = visible.map((r) => ({
    role: (
      <button
        type="button"
        onClick={() => router.push(`${BASE}/role-details?id=${r.id}`)}
        className="flex cursor-pointer items-center gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
      >
        <r.Icon className="h-5 w-5 shrink-0 text-primary" />
        <span className="text-sm font-semibold text-heading hover:text-primary">{r.name}</span>
      </button>
    ),
    users: <Content title={String(r.users)} />,
    scope: <Content title={r.scope} />,
    status: <Tags text={r.status} tone={r.status === "Active" ? "success" : "danger"} size="xs" />,
    actions: (
      <div className="flex w-full items-center justify-center">
        <Actions
          actions={["edit"]}
          size="sm"
          onAction={(action) => {
            if (action === "edit") router.push(`${BASE}/edit-role?id=${r.id}`);
          }}
        />
      </div>
    ),
  }));

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-heading sm:text-lg 2xl:text-xl">Roles & Permissions</h3>
          <p className="mt-0.5 text-sm text-body">Manage user roles, access scope and permissions across the platform.</p>
        </div>
        <AddButton text="Add Role" onClick={() => router.push(`${BASE}/create-role`)} className="shrink-0 whitespace-nowrap" />
      </div>

      <SearchAndFilter
        placeholder="Search role by name..."
        value={search}
        onSearch={(v: string) => {
          setSearch(v);
          setPage(1);
        }}
        filters={[{ label: STATUS_FILTER, options: ["Active", "Inactive"] }]}
        selectedFilters={{ [STATUS_FILTER]: status }}
        onFilterChange={(_label: string, value: string) => {
          setStatus(value);
          setPage(1);
        }}
        showDateRange={false}
      />

      <div className="space-y-3">
        <div className="overflow-hidden rounded-[14px] border border-border bg-card">
          {visible.length === 0 ? (
            <TableStatus variant="empty" message="No roles match your filters." />
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
            itemLabel="roles"
            onChange={setPage}
          />
        )}
      </div>
    </div>
  );
};

export default RoleList;