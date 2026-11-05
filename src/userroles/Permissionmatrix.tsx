"use client";

import React from "react";
import {
  BarChart3,
  CalendarDays,
  FileText,
  Heart,
  LayoutDashboard,
  MessageSquare,
  Receipt,
  Settings,
  Users,
  type LucideIcon,
} from "lucide-react";

import RadioCheckButtonh from "@/components/RadioCheckButtonh";
import Table from "@/components/Table";
import { type TableColumn } from "@/components/Tableheader";

/* ---------------------------------------------------------------- */
/*  Types + static role presets (replace with API / redux selector)  */
/*  Also imported by RoleDetails, CreateRole and AccessControl.      */
/* ---------------------------------------------------------------- */
export type ModuleKey =
  | "dashboard"
  | "patients"
  | "appointments"
  | "billing"
  | "memberships"
  | "documents"
  | "messaging"
  | "reports"
  | "settings";

export type PermKey = "view" | "create" | "edit" | "delete" | "sendReceive" | "approve" | "sign" | "export" | "admin";

export type PermissionMap = Record<ModuleKey, Record<PermKey, boolean>>;

export const MODULES: { key: ModuleKey; label: string; Icon: LucideIcon }[] = [
  { key: "dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { key: "patients", label: "Patients", Icon: Users },
  { key: "appointments", label: "Appointments", Icon: CalendarDays },
  { key: "billing", label: "Billing & Invoice", Icon: Receipt },
  { key: "memberships", label: "Memberships", Icon: Heart },
  { key: "documents", label: "Documents", Icon: FileText },
  { key: "messaging", label: "Messaging", Icon: MessageSquare },
  { key: "reports", label: "Reports", Icon: BarChart3 },
  { key: "settings", label: "Settings", Icon: Settings },
];

export const PERMISSION_COLUMNS: { key: PermKey; label: string }[] = [
  { key: "view", label: "View" },
  { key: "create", label: "Create" },
  { key: "edit", label: "Edit" },
  { key: "delete", label: "Delete" },
  { key: "sendReceive", label: "Send / Receive" },
  { key: "approve", label: "Approve" },
  { key: "sign", label: "Sign" },
  { key: "export", label: "Export" },
  { key: "admin", label: "Admin" },
];

const PERM_KEYS = PERMISSION_COLUMNS.map((c) => c.key);

export const emptyPermissions = (): PermissionMap =>
  Object.fromEntries(
    MODULES.map((m) => [m.key, Object.fromEntries(PERM_KEYS.map((k) => [k, false]))]),
  ) as PermissionMap;

export const clonePermissions = (map: PermissionMap): PermissionMap => JSON.parse(JSON.stringify(map));

export const countGranted = (map: PermissionMap) =>
  MODULES.reduce((total, m) => total + PERM_KEYS.filter((k) => map[m.key][k]).length, 0);

const build = (spec: Partial<Record<ModuleKey, PermKey[]>>): PermissionMap => {
  const map = emptyPermissions();
  for (const [module, perms] of Object.entries(spec) as [ModuleKey, PermKey[]][]) {
    perms.forEach((p) => {
      map[module][p] = true;
    });
  }
  return map;
};

/** Keyed by role id. */
export const ROLE_PERMISSIONS: Record<string, PermissionMap> = {
  admin: build(Object.fromEntries(MODULES.map((m) => [m.key, PERM_KEYS])) as Partial<Record<ModuleKey, PermKey[]>>),
  receptionist: build({
    dashboard: ["view"],
    patients: ["view", "create", "edit"],
    appointments: ["view", "create", "edit", "delete", "sendReceive"],
    billing: ["view"],
    messaging: ["view", "create", "sendReceive"],
  }),
  practitioner: build({
    dashboard: ["view", "export"],
    patients: ["view", "create", "edit", "export"],
    appointments: ["view", "create", "edit", "delete", "sendReceive", "approve", "export"],
    billing: ["view", "export"],
    memberships: ["view"],
    documents: ["view", "create", "edit", "sendReceive", "sign", "export"],
    messaging: ["view", "create", "sendReceive"],
    reports: ["view", "export"],
  }),
  staff: build({
    dashboard: ["view"],
    appointments: ["view", "create", "edit"],
    documents: ["view", "create", "sendReceive"],
    messaging: ["view", "create", "sendReceive"],
  }),
  patient: build({
    dashboard: ["view"],
    appointments: ["view", "create"],
    billing: ["view"],
    documents: ["view"],
    messaging: ["view", "create", "sendReceive"],
  }),
};

/* ---------------------------------------------------------------- */
/*  Component                                                        */
/* ---------------------------------------------------------------- */
type Props = {
  value: PermissionMap;
  onChange: (next: PermissionMap) => void;
  /** The create-role screen has no Admin column. Default: true */
  showAdmin?: boolean;
};

const PermissionMatrix = ({ value, onChange, showAdmin = true }: Props) => {
  const permColumns = PERMISSION_COLUMNS.filter((c) => showAdmin || c.key !== "admin");

  const setPermission = (module: ModuleKey, perm: PermKey, checked: boolean) => {
    const row = { ...value[module], [perm]: checked };
    // Admin on a module grants everything for that module.
    if (perm === "admin" && checked) PERM_KEYS.forEach((k) => (row[k] = true));
    onChange({ ...value, [module]: row });
  };

  const columns: TableColumn[] = [
    { key: "module", label: "Module" },
    ...permColumns.map((c) => ({
      key: c.key,
      label: c.label,
      header: <div className="flex w-full justify-center text-center">{c.label}</div>,
    })),
  ];

  const rows = MODULES.map(({ key, label, Icon }) => ({
    module: (
      <div className="flex items-center gap-2.5">
        <Icon className="h-4 w-4 shrink-0 text-body" />
        <span className="text-sm font-medium text-heading">{label}</span>
      </div>
    ),
    ...Object.fromEntries(
      permColumns.map((c) => [
        c.key,
        <div key={c.key} className="flex w-full justify-center">
          <RadioCheckButtonh
            type="checkbox"
            checked={value[key][c.key]}
            onChange={(e) => setPermission(key, c.key, e.target.checked)}
            aria-label={`${c.label} permission for ${label}`}
          />
        </div>,
      ]),
    ),
  }));

  return (
    <div className="overflow-hidden rounded-[14px] border border-border bg-card">
      <Table columns={columns} rows={rows} bordered={false} />
    </div>
  );
};

export default PermissionMatrix;