"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Building } from "lucide-react";

import SignupField from "@/components/SignupField";
import SignupDropdown from "@/components/SignupDropdown";
import AddButton from "@/components/Addbutton";
import ImportButton from "@/components/ImportButton";
import Breadcrumb from "@/components/Breadcrumb";
import ErrorToast from "@/components/ErrorToast";
import {
  AddressFields,
  type AddressValues,
  DEFAULT_COUNTRY,
  PhoneField,
  Req,
  cardCls,
  emptyAddress,
  toOptions,
  validateAddress,
  validatePhone,
} from "../../../../providers/Shared";

/* ---------- Options ---------- */
const LIST_HREF = "/fhir-model?resource=organizations";

const TYPES = toOptions(["Hospital", "Clinic", "Specialty Clinic", "Practice", "Healthcare System"]);
const STATUSES = toOptions(["Active", "Inactive"]);

const NAME_MAX_LENGTH = 100;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NPI_PATTERN = /^\d{10}$/;

/* ---------- Form model ---------- */
interface FormValues {
  name: string;
  type: string;
  npi: string;
  status: string;
  phoneCountry: string;
  phone: string;
  email: string;
}
type Errors = Record<string, string | undefined>;

const EMPTY_FORM: FormValues = {
  name: "", type: "", npi: "", status: "Active",
  phoneCountry: DEFAULT_COUNTRY, phone: "", email: "",
};

const validate = (v: FormValues, address: AddressValues): Errors => {
  const e: Errors = {};
  if (!v.name.trim()) e.name = "Organization name is required.";
  if (!v.type) e.type = "Type is required.";
  if (!v.npi.trim()) e.npi = "NPI / identifier is required.";
  else if (!NPI_PATTERN.test(v.npi.trim())) e.npi = "NPI must be exactly 10 digits.";
  if (!v.status) e.status = "Status is required.";

  const phoneError = validatePhone(v.phone, v.phoneCountry, true);
  if (phoneError) e.phone = phoneError;
  if (!v.email.trim()) e.email = "Email address is required.";
  else if (!EMAIL_PATTERN.test(v.email.trim())) e.email = "Enter a valid email address.";

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
const AddOrganization = () => {
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
      // TODO: dispatch(createOrganization({ ...values, address }))
      router.push(LIST_HREF);
    } catch {
      setToast({ title: "Could not save organization", message: "Something went wrong. Please try again." });
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
          { label: "Organizations", href: LIST_HREF },
          { label: "Add Organization" },
        ]}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-heading sm:text-xl 2xl:text-2xl">Add Organization</h2>
          <p className="mt-0.5 text-sm text-body">Create a hospital, clinic, practice or healthcare system.</p>
        </div>
        <div className="flex flex-row gap-2">
          <ImportButton text="Cancel" icon={null} className="flex-1 sm:flex-none" onClick={() => router.push(LIST_HREF)} />
          <AddButton text={isSaving ? "Saving…" : "Save Organization"} icon={null} className="flex-1 sm:flex-none" onClick={() => submit()} disabled={isSaving} />
        </div>
      </div>

      
        <form className={`${cardCls} min-w-0 sm:p-6`} onSubmit={submit} noValidate>
          {/* 1. Basic information */}
          <section>
            <SectionHeader step={1} title="Basic Information" subtitle="The organization's identity." />
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <SignupField
                name="name"
                label={<>Organization Name<Req /></>}
                placeholder="Enter organization name"
                value={values.name}
                onChange={(e) => setField("name", e.target.value)}
                error={errors.name}
                maxLength={NAME_MAX_LENGTH}
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
              <SignupField
                name="npi"
                label={<>NPI / Identifier<Req /></>}
                placeholder="10-digit NPI"
                value={values.npi}
                onChange={(e) => setField("npi", e.target.value.replace(/\D/g, ""))}
                error={errors.npi}
                maxLength={10}
                autoComplete="off"
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

          {/* 2. Contact */}
          <section>
            <SectionHeader step={2} title="Contact" subtitle="How to reach the organization." />
            <div className="grid gap-4 sm:grid-cols-2">
              <PhoneField
                name="phone"
                label={<>Phone Number<Req /></>}
                placeholder="Enter phone number"
                value={values.phone}
                onChange={(v) => setField("phone", v)}
                countryCode={values.phoneCountry}
                onCountryChange={(iso) => setField("phoneCountry", iso)}
                error={errors.phone}
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
            </div>
          </section>

          <hr className="my-6 border-divider" />

          {/* 3. Address */}
          <section>
            <SectionHeader step={3} title="Address" subtitle="The organization's primary address." />
            <AddressFields values={address} errors={errors as Record<string, string>} onChange={handleAddressChange} />
          </section>

          <button type="submit" className="hidden" aria-hidden tabIndex={-1} />
        </form>

   
      
    </div>
  );
};

export default AddOrganization;