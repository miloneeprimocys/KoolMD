"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin } from "lucide-react";

import SignupField from "@/components/SignupField";
import SignupDropdown from "@/components/SignupDropdown";
import AddButton from "@/components/Addbutton";
import ImportButton from "@/components/ImportButton";
import Breadcrumb from "@/components/Breadcrumb";
import ErrorToast from "@/components/ErrorToast";
import {
  AddressFields,
  type AddressValues,
  Opt,
  Req,
  TextArea,
  cardCls,
  emptyAddress,
  toOptions,
  validateAddress,
} from "../../../../providers/Shared";

/* ---------- Options ---------- */
const LIST_HREF = "/fhir-model?resource=locations";

const TYPES = toOptions(["Building", "Facility", "Clinic"]);
const DEPARTMENTS = toOptions([
  "Cardiology", "Pediatrics", "Orthopedics", "Dermatology", "Primary Care", "Neurology",
  "Gynecology", "Ophthalmology", "Behavioral Health", "Emergency",
]);
const ORGANIZATIONS = toOptions([
  "Main Clinic", "Heart Care Center", "Children's Hospital", "Ortho Care", "Skin & Wellness",
  "Family Care Practice", "Neuro Center", "Women's Health", "Vision Care", "Mind Health Center", "City General",
]);
const STATUSES = toOptions(["Active", "Inactive"]);

const NAME_MAX_LENGTH = 100;
const CODE_PATTERN = /^LOC-\d{3,}$/;

/* ---------- Form model ---------- */
interface FormValues {
  name: string;
  code: string;
  type: string;
  department: string;
  organization: string;
  status: string;
  description: string;
}
type Errors = Record<string, string | undefined>;

const EMPTY_FORM: FormValues = {
  name: "", code: "", type: "", department: "", organization: "", status: "Active", description: "",
};

const validate = (v: FormValues, address: AddressValues): Errors => {
  const e: Errors = {};
  if (!v.name.trim()) e.name = "Location name is required.";
  if (!v.code.trim()) e.code = "Location code is required.";
  else if (!CODE_PATTERN.test(v.code.trim().toUpperCase())) e.code = "Use the format LOC-001.";
  if (!v.type) e.type = "Type is required.";
  if (!v.organization) e.organization = "Organization is required.";
  if (!v.status) e.status = "Status is required.";
  return { ...e, ...validateAddress(address) };
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
const AddLocation = () => {
  const router = useRouter();
  const [values, setValues] = useState<FormValues>(EMPTY_FORM);
  const [address, setAddress] = useState<AddressValues>(emptyAddress());
  const [errors, setErrors] = useState<Errors>({});
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ title: string; message: string } | null>(null);

  const setField = <K extends keyof FormValues>(field: K, value: FormValues[K]) => {
    setValues((p) => ({ ...p, [field]: value }));
    setErrors((p) => ({ ...p, [field]: undefined }));
  };

  const handleAddressChange = (patch: Partial<AddressValues>) => {
    setAddress((p) => ({ ...p, ...patch }));
    setErrors((p) => {
      const next = { ...p };
      for (const key of Object.keys(patch)) next[key] = undefined;
      return next;
    });
  };

  const scrollToField = (field: string) => {
    const el = document.getElementById(field);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
    el?.focus?.();
  };

  const save = async () => {
    setIsSaving(true);
    try {
      // TODO: dispatch(createLocation({ ...values, code: values.code.toUpperCase(), address }))
      router.push(LIST_HREF);
    } catch {
      setToast({ title: "Could not save location", message: "Something went wrong. Please try again." });
    } finally {
      setIsSaving(false);
    }
  };

  const submit = (event?: React.FormEvent) => {
    event?.preventDefault();
    if (isSaving) return;
    const validationErrors = validate(values, address);
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
          { label: "Locations", href: LIST_HREF },
          { label: "Add Location" },
        ]}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-heading sm:text-xl 2xl:text-2xl">Add Location</h2>
          <p className="mt-0.5 text-sm text-body">Create a physical location, department or service area.</p>
        </div>
        <div className="flex flex-row gap-2">
          <ImportButton text="Cancel" icon={null} className="flex-1 sm:flex-none" onClick={() => router.push(LIST_HREF)} />
          <AddButton text={isSaving ? "Saving…" : "Save Location"} icon={null} className="flex-1 sm:flex-none" onClick={() => submit()} disabled={isSaving} />
        </div>
      </div>

     
        <form className={`${cardCls} min-w-0 sm:p-6`} onSubmit={submit} noValidate>
          {/* 1. Basic information */}
          <section>
            <SectionHeader step={1} title="Basic Information" subtitle="The location's identity." />
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <SignupField
                name="name"
                label={<>Location Name<Req /></>}
                placeholder="Enter location name"
                value={values.name}
                onChange={(e) => setField("name", e.target.value)}
                error={errors.name}
                maxLength={NAME_MAX_LENGTH}
                autoComplete="off"
              />
              <SignupField
                name="code"
                label={<>Location Code<Req /></>}
                placeholder="LOC-001"
                value={values.code}
                onChange={(e) => setField("code", e.target.value.toUpperCase())}
                error={errors.code}
                maxLength={20}
                autoComplete="off"
              />
              <SignupDropdown
                name="type"
                label={<>Type<Req /></>}
                placeholder="Select type"
                options={TYPES}
                value={values.type}
                onChange={(v) => setField("type", v)}
                error={errors.type}
              />
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
                name="department"
                label={<>Department<Opt /></>}
                placeholder="Select department"
                options={DEPARTMENTS}
                value={values.department}
                onChange={(v) => setField("department", v)}
                error={errors.department}
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

          <hr className="my-6 border-divider" />

          {/* 2. Address */}
          <section>
            <SectionHeader step={2} title="Address" subtitle="Where the location is." />
            <AddressFields values={address} errors={errors as Record<string, string>} onChange={handleAddressChange} />
          </section>

          <hr className="my-6 border-divider" />

          {/* 3. Description */}
          <section>
            <SectionHeader step={3} title="Description" subtitle="Optional notes about rooms and service areas." />
            <TextArea
              name="description"
              label={<>Description<Opt /></>}
              placeholder="Enter a short description"
              value={values.description}
              onChange={(v) => setField("description", v)}
              maxLength={500}
              error={errors.description}
            />
          </section>

          <button type="submit" className="hidden" aria-hidden tabIndex={-1} />
        </form>

    </div>
  );
};

export default AddLocation;