"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Info } from "lucide-react";

import AddButton from "@/components/Addbutton";
import ImportButton from "@/components/ImportButton";
import SearchAndFilter from "@/components/Searchandfilter";
import SignupField from "@/components/SignupField";
import SignupDropdown from "@/components/SignupDropdown";
import Table from "@/components/Table";
import TableStatus from "@/components/TableStatus";
import { type TableColumn } from "@/components/Tableheader";
import Content from "@/components/Content";
import Tags from "@/components/Tags";
import Name from "@/components/Name";
import Actions from "@/components/Actions";
import Pagination from "@/components/Pagination";
import CommonRightSection from "@/components/CommonRightSection";
import RadioCheckButtonh from "@/components/RadioCheckButtonh";
import { TableSelectAllCheckbox, useTableSelection } from "@/components/TableSelection";
import { Req, toOptions } from "@/providers/Shared";

/* ---------------------------------------------------------------- */
/*  Static data (replace with API / redux selector)                  */
/* ---------------------------------------------------------------- */
type UserRow = {
  id: string;
  name: string;
  email: string;
  type: string;
  role: string;
  department: string;
  scope: string;
  status: "Active" | "Inactive";
};

const INITIAL_USERS: UserRow[] = [
  { id: "1", name: "Dr. John Carter", email: "john.carter@koolmd.com", type: "Practitioner", role: "Practitioner / MD", department: "Cardiology", scope: "Full Module Access", status: "Active" },
  { id: "2", name: "Emily Rogers", email: "emily.rogers@koolmd.com", type: "Receptionist", role: "Receptionist", department: "Front Desk", scope: "Limited Module Access", status: "Active" },
  { id: "3", name: "Michael Lee", email: "michael.lee@koolmd.com", type: "Staff", role: "Staff", department: "Operations", scope: "Limited Module Access", status: "Active" },
  { id: "4", name: "Anita Brown", email: "anita.brown@koolmd.com", type: "Practitioner", role: "Practitioner / MD", department: "Internal Medicine", scope: "Full Module Access", status: "Active" },
  { id: "5", name: "Peter Parker", email: "peter.parker@koolmd.com", type: "Staff", role: "Staff", department: "Clinical Support", scope: "Limited Module Access", status: "Active" },
  { id: "6", name: "Sarah Wilson", email: "sarah.wilson@koolmd.com", type: "Admin", role: "Admin", department: "Administration", scope: "Full Module Access", status: "Active" },
  { id: "7", name: "Laura Anderson", email: "laura.anderson@koolmd.com", type: "Receptionist", role: "Receptionist", department: "Front Desk", scope: "Limited Module Access", status: "Inactive" },
  { id: "8", name: "James Martin", email: "james.martin@example.com", type: "Patient", role: "Patient", department: "—", scope: "Own Records Only", status: "Active" },
  { id: "9", name: "Olivia Brown", email: "olivia.brown@example.com", type: "Patient", role: "Patient", department: "—", scope: "Own Records Only", status: "Active" },
  { id: "10", name: "Dr. Richard Kim", email: "richard.kim@koolmd.com", type: "Practitioner", role: "Practitioner / MD", department: "Neurology", scope: "Full Module Access", status: "Active" },
  { id: "11", name: "Dr. Nancy Green", email: "nancy.green@koolmd.com", type: "Practitioner", role: "Practitioner / MD", department: "Psychiatry", scope: "Full Module Access", status: "Inactive" },
];

const USER_TYPES = ["Admin", "Practitioner", "Receptionist", "Staff", "Patient"];
const ROLE_NAMES = ["Admin", "Receptionist", "Practitioner / MD", "Staff", "Patient"];
const DEPARTMENTS = ["Cardiology", "Front Desk", "Operations", "Internal Medicine", "Clinical Support", "Neurology", "Psychiatry", "Administration", "—"];
const ACCESS_SCOPES = ["Full Module Access", "Limited Module Access", "Own Records Only"];

const TYPE_FILTER = "All Types";
const ROLE_FILTER = "All Roles";
const STATUS_FILTER = "All Statuses";
const EMPTY_FILTERS: Record<string, string> = { [TYPE_FILTER]: "", [ROLE_FILTER]: "", [STATUS_FILTER]: "" };
const PAGE_SIZE = 10;

const checkboxCls =
  "h-4 w-4 cursor-pointer rounded border-border accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30";

const COLUMN_DEFS: TableColumn[] = [
  { key: "user", label: "User" },
  { key: "type", label: "User Type" },
  { key: "role", label: "Assigned Role" },
  { key: "department", label: "Department / Provider" },
  { key: "status", label: "Status" },
  { key: "actions", label: "Action", header: <div className="flex w-full items-center justify-center">Action</div> },
];

/* ---------------------------------------------------------------- */
/*  Edit / Add user drawer                                           */
/* ---------------------------------------------------------------- */
interface UserForm {
  name: string;
  email: string;
  type: string;
  role: string;
  department: string;
  scope: string;
  active: boolean;
}
type UserFormErrors = Partial<Record<keyof UserForm, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const initials = (name: string) =>
  name
    .replace(/^Dr\.\s*/i, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

const UserDrawer = ({
  user,
  onClose,
  onCloseStart,
  onSave,
}: {
  /** `null` = add a new user. */
  user: UserRow | null;
  onClose: () => void;
  onCloseStart: () => void;
  onSave: (values: UserForm) => void;
}) => {
  const isEdit = user !== null;
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [values, setValues] = useState<UserForm>({
    name: user?.name ?? "",
    email: user?.email ?? "",
    type: user?.type ?? "",
    role: user?.role ?? "",
    department: user?.department ?? "",
    scope: user?.scope ?? "Full Module Access",
    active: user ? user.status === "Active" : true,
  });
  const [errors, setErrors] = useState<UserFormErrors>({});

  const close = () => {
    if (closing) return;
    setClosing(true);
    setOpen(false);
    onCloseStart();
    window.setTimeout(onClose, 300);
  };

  useEffect(() => {
    const frame = requestAnimationFrame(() => setOpen(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  const setField = <K extends keyof UserForm>(field: K, value: UserForm[K]) => {
    setValues((p) => ({ ...p, [field]: value }));
    setErrors((p) => ({ ...p, [field]: undefined }));
  };

  const submit = (event?: React.FormEvent) => {
    event?.preventDefault();
    const e: UserFormErrors = {};
    if (!isEdit) {
      if (!values.name.trim()) e.name = "Name is required.";
      if (!values.email.trim()) e.email = "Email is required.";
      else if (!EMAIL_PATTERN.test(values.email.trim())) e.email = "Enter a valid email address.";
    }
    if (!values.type) e.type = "User type is required.";
    if (!values.role) e.role = "Assigned role is required.";
    setErrors(e);
    if (Object.keys(e).length === 0) onSave(values);
  };

  return (
    <CommonRightSection
      label={isEdit ? "Edit user" : "Add user"}
      ariaModal
      open={open}
      closing={closing}
      onClose={close}
      panelClassName="2xl:max-w-[420px]"
      header={<h3 className="text-base font-semibold text-heading">{isEdit ? "Edit User" : "Add User"}</h3>}
    >
        <form className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-5" onSubmit={submit} noValidate>
          {user ? (
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                {initials(user.name)}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-heading">{user.name}</p>
                <p className="truncate text-xs text-body">{user.email}</p>
              </div>
            </div>
          ) : (
            <>
              <SignupField
                name="name"
                label={<>Full Name<Req /></>}
                placeholder="Enter full name"
                value={values.name}
                onChange={(e) => setField("name", e.target.value)}
                error={errors.name}
                maxLength={100}
                autoComplete="off"
              />
              <SignupField
                name="email"
                type="email"
                label={<>Email Address<Req /></>}
                placeholder="Enter email address"
                value={values.email}
                onChange={(e) => setField("email", e.target.value)}
                error={errors.email}
                autoComplete="off"
              />
            </>
          )}

          <SignupDropdown
            name="type"
            label={<>User Type<Req /></>}
            placeholder="Select user type"
            options={toOptions(USER_TYPES)}
            value={values.type}
            onChange={(v) => setField("type", v)}
            error={errors.type}
            portalMenu
            portalMenuZIndex={400}
          />
          <SignupDropdown
            name="role"
            label={<>Assigned Role<Req /></>}
            placeholder="Select role"
            options={toOptions(ROLE_NAMES)}
            value={values.role}
            onChange={(v) => setField("role", v)}
            error={errors.role}
            portalMenu
            portalMenuZIndex={400}
          />
          <SignupDropdown
            name="department"
            label="Department / Provider"
            placeholder="Select department"
            options={toOptions(DEPARTMENTS)}
            value={values.department}
            onChange={(v) => setField("department", v)}
            portalMenu
            portalMenuZIndex={400}
          />
          <SignupDropdown
            name="scope"
            label="Access Scope"
            placeholder="Select access scope"
            options={toOptions(ACCESS_SCOPES)}
            value={values.scope}
            onChange={(v) => setField("scope", v)}
            icon={<Info className="h-4 w-4" />}
            portalMenu
            portalMenuZIndex={400}
          />

          <div className="flex items-center justify-between gap-3 pt-1">
            <span className="text-sm font-medium text-label">Active User</span>
            <button
              type="button"
              role="switch"
              aria-checked={values.active}
              aria-label="Active user"
              onClick={() => setField("active", !values.active)}
              className={`relative h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${
                values.active ? "bg-primary" : "bg-border"
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-card shadow transition-all ${
                  values.active ? "left-[22px]" : "left-0.5"
                }`}
              />
            </button>
          </div>

          <button type="submit" className="hidden" aria-hidden tabIndex={-1} />
        </form>

        <div className="flex shrink-0 flex-row gap-2 border-t border-border px-5 py-4 sm:gap-3">
          <ImportButton text="Cancel" icon={null} className="flex-1" onClick={close} />
          <AddButton text={isEdit ? "Update" : "Add User"} icon={null} className="flex-1" onClick={() => submit()} />
        </div>
    </CommonRightSection>
  );
};

/* ---------------------------------------------------------------- */
/*  Tab component                                                    */
/* ---------------------------------------------------------------- */
const UserManagement = () => {
  const [users, setUsers] = useState<UserRow[]>(INITIAL_USERS);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  /** `undefined` = drawer closed, `null` = add mode, UserRow = edit mode. */
  const [drawerUser, setDrawerUser] = useState<UserRow | null | undefined>(undefined);
  const [isDrawerClosing, setIsDrawerClosing] = useState(false);

  useEffect(() => {
    if (drawerUser !== undefined) setIsDrawerClosing(false);
  }, [drawerUser]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      if (q && ![u.name, u.email, u.id].some((f) => f.toLowerCase().includes(q))) return false;
      if (filters[TYPE_FILTER] && u.type !== filters[TYPE_FILTER]) return false;
      if (filters[ROLE_FILTER] && u.role !== filters[ROLE_FILTER]) return false;
      if (filters[STATUS_FILTER] && u.status !== filters[STATUS_FILTER]) return false;
      return true;
    });
  }, [users, search, filters]);

  const totalPages = Math.max(Math.ceil(filtered.length / PAGE_SIZE), 1);
  const safePage = Math.min(page, totalPages);
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const { selectedKeys, allSelected, someSelected, toggleRow, toggleAll } = useTableSelection(visible.map((u) => u.id));

  const columns: TableColumn[] = [
    {
      key: "select",
      label: "",
      className: "w-10",
      header: <TableSelectAllCheckbox checked={allSelected} indeterminate={someSelected} onChange={toggleAll} className={checkboxCls} />,
    },
    ...COLUMN_DEFS,
  ];

  const rows = visible.map((u) => ({
    select: (
      <RadioCheckButtonh
        type="checkbox"
        checked={selectedKeys.has(u.id)}
        onChange={() => toggleRow(u.id)}
        aria-label={`Select ${u.name}`}
        className={checkboxCls}
      />
    ),
    user: <Name name={u.name} sub={u.email} truncate />,
    type: <Content title={u.type} />,
    role: <Content title={u.role} />,
    department: <Content title={u.department} />,
    status: <Tags text={u.status} tone={u.status === "Active" ? "success" : "danger"} size="xs" />,
    actions: (
      <div className="flex w-full items-center justify-center">
        <Actions
          actions={["edit"]}
          size="sm"
          onAction={(action) => {
            if (action === "edit") setDrawerUser(u);
          }}
        />
      </div>
    ),
  }));

  const saveUser = (values: UserForm) => {
    // TODO: dispatch(drawerUser ? updateUser(...) : createUser(...))
    const status = values.active ? "Active" : "Inactive";
    if (drawerUser) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === drawerUser.id
            ? { ...u, type: values.type, role: values.role, department: values.department || "—", scope: values.scope, status }
            : u,
        ),
      );
    } else {
      setUsers((prev) => [
        {
          id: String(Date.now()),
          name: values.name.trim(),
          email: values.email.trim(),
          type: values.type,
          role: values.role,
          department: values.department || "—",
          scope: values.scope,
          status,
        },
        ...prev,
      ]);
    }
    setDrawerUser(undefined);
  };

  return (
    <div className="relative w-full min-w-0">
    <div
      className={`mx-auto w-full min-w-0 max-w-[1600px] space-y-4 transition-all duration-300 ease-out sm:space-y-5 ${
        drawerUser !== undefined && !isDrawerClosing ? "2xl:pr-[420px]" : ""
      }`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-heading sm:text-lg 2xl:text-xl">User Management</h3>
          <p className="mt-0.5 text-sm text-body">Manage system users and assign roles.</p>
        </div>
        <AddButton text="Add User" onClick={() => setDrawerUser(null)} className="shrink-0 whitespace-nowrap" />
      </div>

      <SearchAndFilter
        placeholder="Search by name, email or ID..."
        value={search}
        onSearch={(v: string) => {
          setSearch(v);
          setPage(1);
        }}
        filters={[
          { label: TYPE_FILTER, options: USER_TYPES },
          { label: ROLE_FILTER, options: ROLE_NAMES },
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
            <TableStatus variant="empty" message="No users match your filters." />
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
            itemLabel="users"
            onChange={setPage}
          />
        )}
      </div>

      {drawerUser !== undefined && (
        <UserDrawer
          key={drawerUser?.id ?? "new"}
          user={drawerUser}
          onClose={() => setDrawerUser(undefined)}
          onCloseStart={() => setIsDrawerClosing(true)}
          onSave={saveUser}
        />
      )}
    </div>
    </div>
  );
};

export default UserManagement;
