"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Copy } from "lucide-react";

import AddButton from "@/components/Addbutton";
import ImportButton from "@/components/ImportButton";
import Breadcrumb from "@/components/Breadcrumb";
import Tags from "@/components/Tags";
import ErrorToast from "@/components/ErrorToast";
import { cardCls } from "@/providers/Shared";
import PermissionMatrix, { ROLE_PERMISSIONS, clonePermissions, type PermissionMap } from "./Permissionmatrix";
import RoleInfoTab, { validateRoleInfo, type RoleInfoErrors, type RoleInfoValues } from "./Roleinfotab";
import AssignedUsers from "./Assignedusers";

/* ---------------------------------------------------------------- */
/*  Static data (replace with API / redux selector)                  */
/* ---------------------------------------------------------------- */
const ROLES: Record<string, { name: string; status: string; scope: string; users: number; description: string }> = {
  admin: { name: "Admin", status: "Active", scope: "Full Access (All Modules)", users: 4, description: "Full platform access including settings and user administration." },
  receptionist: { name: "Receptionist", status: "Active", scope: "Operational (Patients, Appointments, Messaging)", users: 6, description: "Front-desk access for scheduling, registration and messaging." },
  practitioner: { name: "Practitioner / MD", status: "Active", scope: "Clinical & Operational (Patients, Appointments, Documents, Messaging)", users: 12, description: "Clinical and operational access for practitioners, including patients, appointments, documents and messaging." },
  staff: { name: "Staff", status: "Active", scope: "Limited (Appointments, Documents, Messaging)", users: 8, description: "Limited access for support staff." },
  patient: { name: "Patient", status: "Active", scope: "Self-Service (Appointments, Documents, Messaging)", users: 12, description: "Self-service access for patients." },
};

type TabKey = "matrix" | "details" | "users";
const BASE = "/settings/roles-permissions";

/* ---------------------------------------------------------------- */
/*  Page                                                             */
/* ---------------------------------------------------------------- */
const RoleDetails = () => {
  const router = useRouter();
  const roleId = useSearchParams().get("id") ?? "practitioner";
  const role = ROLES[roleId] ?? ROLES.practitioner;
  const resolvedId = ROLES[roleId] ? roleId : "practitioner";

  const [tab, setTab] = useState<TabKey>("matrix");
  const [permissions, setPermissions] = useState<PermissionMap>(() => clonePermissions(ROLE_PERMISSIONS[resolvedId]));
  const [info, setInfo] = useState<RoleInfoValues>({
    name: role.name,
    status: role.status,
    scope: role.scope,
    description: role.description,
  });
  const [infoErrors, setInfoErrors] = useState<RoleInfoErrors>({});
  const [toast, setToast] = useState<{ title: string; message: string } | null>(null);

  const tabs: { key: TabKey; label: string }[] = [
    { key: "matrix", label: "Permission Matrix" },
    { key: "details", label: "Role Details" },
    { key: "users", label: `Assigned Users (${role.users})` },
  ];

  const changeInfo = (patch: Partial<RoleInfoValues>) => {
    setInfo((p) => ({ ...p, ...patch }));
    setInfoErrors((p) => {
      const next = { ...p };
      for (const key of Object.keys(patch) as (keyof RoleInfoValues)[]) next[key] = undefined;
      return next;
    });
  };

  const save = () => {
    if (tab === "details") {
      const errs = validateRoleInfo(info);
      setInfoErrors(errs);
      if (Object.keys(errs).length) {
        setToast({ title: "Check the form", message: "Fix the highlighted fields to continue." });
        return;
      }
    }
    // TODO: dispatch(updateRole({ id: resolvedId, info, permissions }))
    router.push(BASE);
  };

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-4 sm:space-y-5">
      <ErrorToast isOpen={toast !== null} onClose={() => setToast(null)} title={toast?.title} message={toast?.message} />
      <Breadcrumb
        items={[
          { label: "Settings" },
          { label: "Roles & Permissions", href: BASE },
          { label: info.name || role.name },
        ]}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-heading sm:text-xl 2xl:text-2xl">Role Details – {info.name || role.name}</h2>
          <p className="mt-0.5 text-sm text-body">Configure module-level permissions for this role.</p>
        </div>
        <Tags text={info.status} tone={info.status === "Active" ? "success" : "danger"} size="xs" />
      </div>

      <section className={`${cardCls} space-y-5 sm:p-6`}>
        {/* Tabs + Duplicate */}
        <div className="flex flex-col gap-3 border-b border-border sm:flex-row sm:items-center sm:justify-between">
          <div role="tablist" aria-label="Role sections" className="hide-scrollbar flex gap-4 overflow-x-auto sm:gap-6">
            {tabs.map((t) => (
              <button
                key={t.key}
                role="tab"
                type="button"
                aria-selected={tab === t.key}
                onClick={() => setTab(t.key)}
                className={`-mb-px cursor-pointer whitespace-nowrap border-b-2 px-1 pb-2.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 sm:pb-3 sm:text-sm ${
                  tab === t.key ? "border-primary text-primary" : "border-transparent text-body hover:text-heading"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <ImportButton
            text="Duplicate Role"
            icon={<Copy className="h-4 w-4" />}
            className="mb-3 shrink-0 whitespace-nowrap sm:mb-2"
            onClick={() => router.push(`${BASE}/create-role?duplicate=${resolvedId}`)}
          />
        </div>

        {tab === "matrix" && <PermissionMatrix value={permissions} onChange={setPermissions} />}
        {tab === "details" && <RoleInfoTab values={info} errors={infoErrors} onChange={changeInfo} usersAssigned={role.users} />}
        {tab === "users" && <AssignedUsers roleName={info.name || role.name} count={role.users} />}

        {tab !== "users" && (
          <div className="flex flex-row justify-end gap-2 sm:gap-3">
            <ImportButton text="Cancel" icon={null} className="flex-1 sm:flex-none" onClick={() => router.push(BASE)} />
            <AddButton
              text={tab === "matrix" ? "Save Permissions" : "Save Changes"}
              icon={null}
              className="flex-1 sm:flex-none"
              onClick={save}
            />
          </div>
        )}
      </section>
    </div>
  );
};

export default RoleDetails;