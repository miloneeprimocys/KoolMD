"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import SignupField from "@/components/SignupField";
import SignupDropdown from "@/components/SignupDropdown";
import AddButton from "@/components/Addbutton";
import ImportButton from "@/components/ImportButton";
import Breadcrumb from "@/components/Breadcrumb";
import ErrorToast from "@/components/ErrorToast";
import { Req, cardCls, toOptions } from "@/providers/Shared";
import PermissionMatrix, {
  ROLE_PERMISSIONS,
  clonePermissions,
  countGranted,
  emptyPermissions,
  type PermissionMap,
} from "./Permissionmatrix";

/* ---------------------------------------------------------------- */
/*  Static data (replace with API / redux selector)                  */
/* ---------------------------------------------------------------- */
const ROLES: Record<string, { name: string; status: string; description: string }> = {
  admin: { name: "Admin", status: "Active", description: "Full platform access including settings and user administration." },
  receptionist: { name: "Receptionist", status: "Active", description: "Front-desk access for scheduling, registration and messaging." },
  practitioner: { name: "Practitioner / MD", status: "Active", description: "Clinical and operational access for practitioners." },
  staff: { name: "Staff", status: "Active", description: "Limited access for support staff." },
  patient: { name: "Patient", status: "Active", description: "Self-service access for patients." },
};
const STATUSES = toOptions(["Active", "Inactive"]);
const BASE = "/settings/roles-permissions";

interface FormValues {
  name: string;
  status: string;
  description: string;
}
type FormErrors = Partial<Record<keyof FormValues, string>>;

/* ---------------------------------------------------------------- */
/*  Page                                                             */
/*  ?id=<role>        → edit an existing role                        */
/*  ?duplicate=<role> → new role pre-filled from another role        */
/* ---------------------------------------------------------------- */
const CreateRole = () => {
  const router = useRouter();
  const params = useSearchParams();
  const editId = params.get("id");
  const duplicateId = params.get("duplicate");
  const isEdit = Boolean(editId && ROLES[editId]);
  const sourceId = (isEdit ? editId : duplicateId) ?? "";
  const source = ROLES[sourceId];

  const [values, setValues] = useState<FormValues>(() => ({
    name: source ? (isEdit ? source.name : `Copy of ${source.name}`) : "",
    status: source ? (isEdit ? source.status : "Active") : "Active",
    description: source?.description ?? "",
  }));
  const [permissions, setPermissions] = useState<PermissionMap>(() =>
    source ? clonePermissions(ROLE_PERMISSIONS[sourceId]) : emptyPermissions(),
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ title: string; message: string } | null>(null);

  const title = isEdit ? "Edit Role" : "Create New Role";

  const setField = <K extends keyof FormValues>(field: K, value: FormValues[K]) => {
    setValues((p) => ({ ...p, [field]: value }));
    setErrors((p) => ({ ...p, [field]: undefined }));
  };

  const submit = (event?: React.FormEvent) => {
    event?.preventDefault();
    if (isSaving) return;
    const e: FormErrors = {};
    if (!values.name.trim()) e.name = "Role name is required.";
    if (!values.status) e.status = "Status is required.";
    setErrors(e);
    if (Object.keys(e).length) {
      document.getElementById(Object.keys(e)[0])?.scrollIntoView({ behavior: "smooth", block: "center" });
      setToast({ title: "Check the form", message: "Fix the highlighted fields to continue." });
      return;
    }
    if (countGranted(permissions) === 0) {
      setToast({ title: "No permissions selected", message: "Grant at least one module permission to this role." });
      return;
    }
    setIsSaving(true);
    try {
      // TODO: dispatch(isEdit ? updateRole(...) : createRole({ ...values, permissions }))
      router.push(BASE);
    } catch {
      setToast({ title: "Could not save role", message: "Something went wrong. Please try again." });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-4 sm:space-y-5">
      <ErrorToast isOpen={toast !== null} onClose={() => setToast(null)} title={toast?.title} message={toast?.message} />
      <Breadcrumb
        items={[
          { label: "Settings" },
          { label: "Roles & Permissions", href: BASE },
          { label: isEdit ? "Edit Role" : "Create Role" },
        ]}
      />

      <div>
        <h2 className="text-lg font-semibold text-heading sm:text-xl 2xl:text-2xl">{title}</h2>
        <p className="mt-0.5 text-sm text-body">Define a role, description and module permissions.</p>
      </div>

      <form className={`${cardCls} min-w-0 space-y-5 sm:p-6`} onSubmit={submit} noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <SignupField
            name="name"
            label={<>Role Name<Req /></>}
            placeholder="Enter role name"
            value={values.name}
            onChange={(e) => setField("name", e.target.value)}
            error={errors.name}
            maxLength={100}
            autoComplete="off"
          />
          <SignupDropdown
            name="status"
            label="Status"
            placeholder="Select status"
            options={STATUSES}
            value={values.status}
            onChange={(v) => setField("status", v)}
            error={errors.status}
          />
        </div>

        <SignupField
          name="description"
          label="Description"
          placeholder="Describe what this role is for"
          value={values.description}
          onChange={(e) => setField("description", e.target.value)}
          multiline
          rows={3}
          maxLength={300}
        />

        <div>
          <h3 className="mb-3 text-base font-semibold text-heading">Module Permissions</h3>
          <PermissionMatrix value={permissions} onChange={setPermissions} showAdmin={false} />
        </div>

        <div className="flex flex-row justify-end gap-2 sm:gap-3">
          <ImportButton text="Cancel" icon={null} className="flex-1 sm:flex-none" onClick={() => router.push(BASE)} />
          <AddButton text={isSaving ? "Saving…" : "Save Role"} icon={null} className="flex-1 sm:flex-none" onClick={() => submit()} disabled={isSaving} />
        </div>

        <button type="submit" className="hidden" aria-hidden tabIndex={-1} />
      </form>
    </div>
  );
};

export default CreateRole;