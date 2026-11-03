"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Link2 } from "lucide-react";

import SignupField from "@/components/SignupField";
import SignupDropdown from "@/components/SignupDropdown";
import AddButton from "@/components/Addbutton";
import ImportButton from "@/components/ImportButton";
import Breadcrumb from "@/components/Breadcrumb";
import ErrorToast from "@/components/ErrorToast";
import { Opt, Req, TextArea, cardCls, toOptions } from "../../../../providers/Shared";

/* ---------- Options ---------- */
const LIST_HREF = "/fhir-model?resource=medications";

const TYPES = toOptions(["Clinical Drug", "Branded Drug", "Ingredient"]);
const CATEGORIES = toOptions([
  "Antibiotic", "Analgesic", "Cardiovascular", "Antidiabetic", "Endocrine",
  "Respiratory", "Gastrointestinal", "Psychiatric",
]);
const FORMS = toOptions(["Tablet", "Capsule", "Inhaler", "Injection", "Syrup", "Cream", "Drops"]);
const STATUSES = toOptions(["Active", "Inactive"]);

const NAME_MAX_LENGTH = 100;

/* ---------- Form model ---------- */
interface FormValues {
  name: string;
  brand: string;
  rxcui: string;
  snomed: string;
  type: string;
  category: string;
  form: string;
  strength: string;
  status: string;
  notes: string;
}
type FormErrors = Partial<Record<keyof FormValues, string>>;

const EMPTY_FORM: FormValues = {
  name: "", brand: "", rxcui: "", snomed: "", type: "Clinical Drug", category: "",
  form: "", strength: "", status: "Active", notes: "",
};

const validate = (v: FormValues): FormErrors => {
  const e: FormErrors = {};
  if (!v.name.trim()) e.name = "Medication name is required.";
  if (!v.rxcui.trim()) e.rxcui = "RxNorm code (RXCUI) is required.";
  else if (!/^\d+$/.test(v.rxcui.trim())) e.rxcui = "RXCUI must contain digits only.";
  if (v.snomed.trim() && !/^\d{6,18}$/.test(v.snomed.trim())) e.snomed = "SNOMED CT codes are 6–18 digits.";
  if (!v.type) e.type = "Type is required.";
  if (!v.category) e.category = "Category is required.";
  if (!v.form) e.form = "Form is required.";
  if (!v.strength.trim()) e.strength = "Strength is required.";
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
const AddMedication = () => {
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
      // TODO: dispatch(createMedication({...values}))
      router.push(LIST_HREF);
    } catch {
      setToast({ title: "Could not save medication", message: "Something went wrong. Please try again." });
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
          { label: "Medications", href: LIST_HREF },
          { label: "Add Medication" },
        ]}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-heading sm:text-xl 2xl:text-2xl">Add Medication</h2>
          <p className="mt-0.5 text-sm text-body">Add medication information and drug details (FHIR Resource: Medication).</p>
        </div>
        <div className="flex flex-row gap-2">
          <ImportButton text="Cancel" icon={null} className="flex-1 sm:flex-none" onClick={() => router.push(LIST_HREF)} />
          <AddButton text={isSaving ? "Saving…" : "Save Medication"} icon={null} className="flex-1 sm:flex-none" onClick={() => submit()} disabled={isSaving} />
        </div>
      </div>

    
        <form className={`${cardCls} min-w-0 sm:p-6`} onSubmit={submit} noValidate>
          {/* 1. Medication details */}
          <section>
            <SectionHeader step={1} title="Medication Details" subtitle="Name, type and classification." />
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <SignupField
                name="name"
                label={<>Medication Name<Req /></>}
                placeholder="Enter medication name"
                value={values.name}
                onChange={(e) => setField("name", e.target.value)}
                error={errors.name}
                maxLength={NAME_MAX_LENGTH}
                autoComplete="off"
              />
              <SignupField
                name="brand"
                label={<>Brand Name<Opt /></>}
                placeholder="Enter brand name"
                value={values.brand}
                onChange={(e) => setField("brand", e.target.value)}
                error={errors.brand}
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
              <SignupDropdown
                name="category"
                label={<>Category<Req /></>}
                placeholder="Select category"
                options={CATEGORIES}
                value={values.category}
                onChange={(v) => setField("category", v)}
                error={errors.category}
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

          {/* 2. Codes */}
          <section>
            <SectionHeader step={2} title="Codes" subtitle="Standard terminology identifiers." />
            <div className="grid gap-4 sm:grid-cols-2">
              <SignupField
                name="rxcui"
                label={<>RxNorm Code (RXCUI)<Req /></>}
                placeholder="Enter RXCUI"
                value={values.rxcui}
                onChange={(e) => setField("rxcui", e.target.value.replace(/\D/g, ""))}
                error={errors.rxcui}
                maxLength={12}
                autoComplete="off"
              />
              <SignupField
                name="snomed"
                label={<>SNOMED CT Code<Opt /></>}
                placeholder="Enter SNOMED CT code"
                value={values.snomed}
                onChange={(e) => setField("snomed", e.target.value.replace(/\D/g, ""))}
                error={errors.snomed}
                maxLength={18}
                autoComplete="off"
              />
            </div>
          </section>

          <hr className="my-6 border-divider" />

          {/* 3. Form & strength */}
          <section>
            <SectionHeader step={3} title="Form & Strength" subtitle="How the medication is supplied." />
            <div className="grid gap-4 sm:grid-cols-2">
              <SignupDropdown
                name="form"
                label={<>Form<Req /></>}
                placeholder="Select form"
                options={FORMS}
                value={values.form}
                onChange={(v) => setField("form", v)}
                error={errors.form}
              />
              <SignupField
                name="strength"
                label={<>Strength<Req /></>}
                placeholder="e.g. 500 mg"
                value={values.strength}
                onChange={(e) => setField("strength", e.target.value)}
                error={errors.strength}
                maxLength={30}
                autoComplete="off"
              />
            </div>
            <div className="mt-4">
              <TextArea
                name="notes"
                label={<>Notes<Opt /></>}
                placeholder="Enter any additional notes"
                value={values.notes}
                onChange={(v) => setField("notes", v)}
                maxLength={500}
                error={errors.notes}
              />
            </div>
          </section>

          <button type="submit" className="hidden" aria-hidden tabIndex={-1} />
        </form>

    
    </div>
  );
};

export default AddMedication;