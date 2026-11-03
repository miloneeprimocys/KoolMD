"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Briefcase } from "lucide-react";

import SignupDropdown from "@/components/SignupDropdown";
import AddButton from "@/components/Addbutton";
import ImportButton from "@/components/ImportButton";
import Breadcrumb from "@/components/Breadcrumb";
import DatePicker from "@/components/Datepicker";
import ErrorToast from "@/components/ErrorToast";
import { Opt, Req, SPECIALTIES, cardCls, toOptions } from "../../../../providers/Shared";

/* ---------- Options ---------- */
const LIST_HREF = "/fhir-model?resource=practitioner-roles";

const PRACTITIONERS = toOptions([
  "Dr. Sarah Wilson", "Dr. Michael Johnson", "Dr. Emily Parker", "Dr. Robert Williams",
  "Dr. David Brown", "Dr. Laura Anderson", "Dr. Richard Kim", "Dr. Susan Davis",
  "Dr. Thomas Patel", "Dr. Nancy Green", "Dr. Paul Adams",
]);
const ROLES = toOptions([
  "Attending Physician", "Consulting Physician", "Primary Care Physician", "Surgeon",
  "Consultant", "Nurse Practitioner", "Physician Assistant", "Psychiatrist",
]);
const ORGANIZATIONS = toOptions([
  "Main Clinic", "Heart Care Center", "Children's Hospital", "Ortho Care", "Skin & Wellness",
  "Neuro Center", "Women's Health", "Vision Care", "Mind Health Center",
]);
const LOCATIONS = toOptions([
  "Main Branch", "Downtown Center", "West Wing", "Surgery Center", "East Wing", "Eye Center",
]);
const STATUSES = toOptions(["Active", "Inactive"]);

/* ---------- Form model ---------- */
interface FormValues {
  practitioner: string;
  role: string;
  specialty: string;
  organization: string;
  location: string;
  startDate: string;
  endDate: string;
  status: string;
}
type FormErrors = Partial<Record<keyof FormValues, string>>;

const EMPTY_FORM: FormValues = {
  practitioner: "", role: "", specialty: "", organization: "",
  location: "", startDate: "", endDate: "", status: "Active",
};

const validate = (v: FormValues): FormErrors => {
  const e: FormErrors = {};
  if (!v.practitioner) e.practitioner = "Practitioner is required.";
  if (!v.role) e.role = "Role is required.";
  if (!v.specialty) e.specialty = "Specialty is required.";
  if (!v.organization) e.organization = "Organization is required.";
  if (!v.location) e.location = "Location is required.";
  if (!v.startDate) e.startDate = "Start date is required.";
  if (v.endDate && v.startDate && v.endDate < v.startDate) e.endDate = "End date cannot be before the start date.";
  if (!v.status) e.status = "Status is required.";
  return e;
};

/* ---------- Small pieces ---------- */
const SectionHeader = ({ step, title, subtitle }: { step: number; title: string; subtitle: string }) => (
  <div className="mb-4 flex items-center gap-3">
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
      {step}
    </span>
    <div className="min-w-0">
      <h3 className="text-base font-semibold text-heading">{title}</h3>
      <p className="text-xs text-body">{subtitle}</p>
    </div>
  </div>
);

/* ---------- Page ---------- */
const AddPractitionerRole = () => {
  const router = useRouter();
  const [values, setValues] = useState<FormValues>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ title: string; message: string } | null>(null);

  const setField = <K extends keyof FormValues>(field: K, value: FormValues[K]) => {
    setValues((p) => ({ ...p, [field]: value }));
    setErrors((p) => ({ ...p, [field]: undefined }));
  };

  const scrollToField = (field: string) => {
    const el = document.getElementById(field);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
    el?.focus?.();
  };

  const save = async () => {
    setIsSaving(true);
    try {
      // TODO: dispatch(createPractitionerRole({...values}))
      router.push(LIST_HREF);
    } catch {
      setToast({ title: "Could not save role", message: "Something went wrong. Please try again." });
    } finally {
      setIsSaving(false);
    }
  };

  const submit = (event?: React.FormEvent) => {
    event?.preventDefault();
    if (isSaving) return;
    const validationErrors = validate(values);
    setErrors(validationErrors);
    const invalid = Object.keys(validationErrors);
    if (invalid.length) {
      scrollToField(invalid[0]);
      setToast({
        title: "Check the form",
        message: `${invalid.length} field${invalid.length > 1 ? "s need" : " needs"} attention.`,
      });
      return;
    }
    save();
  };

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-4 sm:space-y-5">
      <ErrorToast isOpen={toast !== null} onClose={() => setToast(null)} title={toast?.title} message={toast?.message} />
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "FHIR Model", href: "/fhir-model" },
          { label: "Practitioner Roles", href: LIST_HREF },
          { label: "Add Practitioner Role" },
        ]}
      />

      {/* Title + actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-heading sm:text-xl 2xl:text-2xl">Add Practitioner Role</h2>
          <p className="mt-0.5 text-sm text-body">Assign a practitioner to a role, specialty and organization.</p>
        </div>
        <div className="flex flex-row gap-2">
          <ImportButton text="Cancel" icon={null} className="flex-1 sm:flex-none" onClick={() => router.push(LIST_HREF)} />
          <AddButton text={isSaving ? "Saving…" : "Save Role"} icon={null} className="flex-1 sm:flex-none" onClick={() => submit()} disabled={isSaving} />
        </div>
      </div>


        <form className={`${cardCls} min-w-0 sm:p-6`} onSubmit={submit} noValidate>
          {/* 1. Practitioner & role */}
          <section>
            <SectionHeader step={1} title="Practitioner & Role" subtitle="Who the role is for and what they do." />
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <SignupDropdown
                name="practitioner"
                label={<>Practitioner<Req /></>}
                placeholder="Select practitioner"
                options={PRACTITIONERS}
                value={values.practitioner}
                onChange={(v) => setField("practitioner", v)}
                error={errors.practitioner}
              />
              <SignupDropdown
                name="role"
                label={<>Role<Req /></>}
                placeholder="Select role"
                options={ROLES}
                value={values.role}
                onChange={(v) => setField("role", v)}
                error={errors.role}
              />
              <SignupDropdown
                name="specialty"
                label={<>Specialty<Req /></>}
                placeholder="Select specialty"
                options={SPECIALTIES}
                value={values.specialty}
                onChange={(v) => setField("specialty", v)}
                error={errors.specialty}
              />
            </div>
          </section>

          <hr className="my-6 border-divider" />

          {/* 2. Assignment */}
          <section>
            <SectionHeader step={2} title="Assignment" subtitle="Where the practitioner works." />
            <div className="grid gap-4 sm:grid-cols-2">
              <SignupDropdown
                name="organization"
                label={<>Organization<Req /></>}
                placeholder="Select organization"
                options={ORGANIZATIONS}
                value={values.organization}
                onChange={(v) => setField("organization", v)}
                error={errors.organization}
              />
              <SignupDropdown
                name="location"
                label={<>Location<Req /></>}
                placeholder="Select location"
                options={LOCATIONS}
                value={values.location}
                onChange={(v) => setField("location", v)}
                error={errors.location}
              />
            </div>
          </section>

          <hr className="my-6 border-divider" />

          {/* 3. Period & status */}
          <section>
            <SectionHeader step={3} title="Period & Status" subtitle="When the role is valid." />
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <DatePicker
                name="startDate"
                label={<>Start Date<Req /></>}
                placeholder="dd-mm-yyyy"
                value={values.startDate}
                onChange={(v) => setField("startDate", v)}
                error={errors.startDate}
              />
              <DatePicker
                name="endDate"
                label={<>End Date<Opt /></>}
                placeholder="dd-mm-yyyy"
                value={values.endDate}
                onChange={(v) => setField("endDate", v)}
                error={errors.endDate}
              />
              <SignupDropdown
                name="status"
                label={<>Status<Req /></>}
                placeholder="Select status"
                options={STATUSES}
                value={values.status}
                onChange={(v) => setField("status", v)}
                error={errors.status}
              />
            </div>
          </section>

          {/* Enter in any field submits the form */}
          <button type="submit" className="hidden" aria-hidden tabIndex={-1} />
        </form>

  
    </div>
  );
};

export default AddPractitionerRole;