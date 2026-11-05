"use client";

import React from "react";

import SignupField from "@/components/SignupField";
import SignupDropdown from "@/components/SignupDropdown";
import { Req, toOptions } from "@/providers/Shared";

/* ---------------------------------------------------------------- */
/*  "Role Details" tab of the Role Details page                      */
/* ---------------------------------------------------------------- */
export interface RoleInfoValues {
  name: string;
  status: string;
  scope: string;
  description: string;
}
export type RoleInfoErrors = Partial<Record<keyof RoleInfoValues, string>>;

export const validateRoleInfo = (v: RoleInfoValues): RoleInfoErrors => {
  const e: RoleInfoErrors = {};
  if (!v.name.trim()) e.name = "Role name is required.";
  if (!v.status) e.status = "Status is required.";
  if (!v.scope.trim()) e.scope = "Access scope is required.";
  return e;
};

const STATUSES = toOptions(["Active", "Inactive"]);

type Props = {
  values: RoleInfoValues;
  errors: RoleInfoErrors;
  onChange: (patch: Partial<RoleInfoValues>) => void;
  usersAssigned: number;
};

const RoleInfoTab = ({ values, errors, onChange, usersAssigned }: Props) => (
  <div className="space-y-4">
    <div className="grid gap-4 sm:grid-cols-2">
      <SignupField
        name="name"
        label={<>Role Name<Req /></>}
        placeholder="Enter role name"
        value={values.name}
        onChange={(e) => onChange({ name: e.target.value })}
        error={errors.name}
        maxLength={100}
        autoComplete="off"
      />
      <SignupDropdown
        name="status"
        label={<>Status<Req /></>}
        placeholder="Select status"
        options={STATUSES}
        value={values.status}
        onChange={(v) => onChange({ status: v })}
        error={errors.status}
      />
      <SignupField
        name="scope"
        label={<>Access Scope<Req /></>}
        placeholder="e.g. Clinical & Operational"
        value={values.scope}
        onChange={(e) => onChange({ scope: e.target.value })}
        error={errors.scope}
        maxLength={150}
        autoComplete="off"
      />
      <SignupField
        name="usersAssigned"
        label="Users Assigned"
        value={String(usersAssigned)}
        onChange={() => {}}
        readOnly
        hint="Manage assignments from the Assigned Users tab or User Management."
      />
    </div>
    <SignupField
      name="description"
      label="Description"
      placeholder="Describe what this role is for"
      value={values.description}
      onChange={(e) => onChange({ description: e.target.value })}
      multiline
      rows={4}
      maxLength={300}
    />
  </div>
);

export default RoleInfoTab;