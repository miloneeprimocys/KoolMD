"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";

import SignupField from "@/components/SignupField";
import SignupDropdown from "@/components/SignupDropdown";
import AddButton from "@/components/Addbutton";
import ImportButton from "@/components/ImportButton";
import Breadcrumb from "@/components/Breadcrumb";
import DatePicker from "@/components/Datepicker";
import ErrorToast from "@/components/ErrorToast";
import { Opt, Req, TextArea, cardCls, toOptions, todayISO } from "../../../../providers/Shared";

/* ---------- Options ---------- */
const LIST_HREF = "/fhir-model?resource=conditions";

const PATIENTS = toOptions([
  "John Smith", "Emily Carter", "Robert Johnson", "Olivia Brown", "William Davis", "Sophia Miller",
  "Michael Wilson", "Isabella Moore", "David Taylor", "Laura Anderson", "James Martin",
]);
const CODE_SYSTEMS = toOptions(["SNOMED CT", "ICD-10"]);
const CATEGORIES = toOptions([
  "Endocrine", "Cardiovascular", "Respiratory", "Musculoskeletal", "Neurological",
  "Behavioral Health", "Renal",
]);
const CLINICAL_STATUSES = toOptions(["Active", "Resolved", "Unknown"]);
const PRACTITIONERS = toOptions([
  "Dr. Sarah Wilson", "Dr. Michael Johnson", "Dr. Emily Parker", "Dr. Robert Williams", "Dr. David Brown",
  "Dr. Laura Anderson", "Dr. Richard Kim", "Dr. Susan Davis", "Dr. Thomas Patel", "Dr. Nancy Green",
]);
const ENCOUNTERS = toOptions(Array.from({ length: 11 }, (_, i) => `ENC-00${1247 + i}`));

const CONDITION_MAX_LENGTH = 200;

/* ---------- Form model ---------- */
interface FormValues {
  patient: string;
  condition: string;
  codeSystem: string;
  code: string;
  category: string;
  clinicalStatus: string;
  onsetDate: string;
  recordedBy: string;
  encounter: string;
  notes: string;
}
type FormErrors = Partial<Record<keyof FormValues, string>>;

const EMPTY_FORM: FormValues = {
  patient: "", condition: "", codeSystem: "SNOMED CT", code: "", category: "",
  clinicalStatus: "Active", onsetDate: "", recordedBy: "", encounter: "", notes: "",
};

const validate = (v: FormValues): FormErrors => {
  const e: FormErrors = {};
  if (!v.patient) e.patient = "Patient is required.";
  if (!v.condition.trim()) e.condition = "Condition / diagnosis is required.";
  if (!v.codeSystem) e.codeSystem = "Code system is required.";
  if (!v.code.trim()) e.code = "Code is required.";
  else if (v.codeSystem === "SNOMED CT" && !/^\d{6,18}$/.test(v.code.trim()))
    e.code = "SNOMED CT codes are 6–18 digits.";
  if (!v.category) e.category = "Category is required.";
  if (!v.clinicalStatus) e.clinicalStatus = "Clinical status is required.";
  if (!v.onsetDate) e.onsetDate = "Onset date is required.";
  else if (v.onsetDate > todayISO()) e.onsetDate = "Onset date cannot be in the future.";
  if (!v.recordedBy) e.recordedBy = "Recorded by is required.";
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
const AddCondition = () => {
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
      // TODO: dispatch(createCondition({...values}))
      router.push(LIST_HREF);
    } catch {
      setToast({ title: "Could not save condition", message: "Something went wrong. Please try again." });
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
          { label: "Conditions", href: LIST_HREF },
          { label: "Add Condition" },
        ]}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-heading sm:text-xl 2xl:text-2xl">Add Condition</h2>
          <p className="mt-0.5 text-sm text-body">Record a patient condition, diagnosis or health concern.</p>
        </div>
        <div className="flex flex-row gap-2">
          <ImportButton text="Cancel" icon={null} className="flex-1 sm:flex-none" onClick={() => router.push(LIST_HREF)} />
          <AddButton text={isSaving ? "Saving…" : "Save Condition"} icon={null} className="flex-1 sm:flex-none" onClick={() => submit()} disabled={isSaving} />
        </div>
      </div>

     
        <form className={`${cardCls} min-w-0 sm:p-6`} onSubmit={submit} noValidate>
          {/* 1. Patient & condition */}
          <section>
            <SectionHeader step={1} title="Patient & Condition" subtitle="Who has the condition and what it is." />
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <SignupDropdown
                name="patient"
                label={<>Patient<Req /></>}
                placeholder="Select patient"
                options={PATIENTS}
                value={values.patient}
                onChange={(v) => setField("patient", v)}
                error={errors.patient}
              />
              <SignupField
                name="condition"
                label={<>Condition / Diagnosis<Req /></>}
                placeholder="Enter condition or diagnosis"
                value={values.condition}
                onChange={(e) => setField("condition", e.target.value)}
                error={errors.condition}
                maxLength={CONDITION_MAX_LENGTH}
                autoComplete="off"
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
                name="codeSystem"
                label={<>Code System<Req /></>}
                placeholder="Select code system"
                options={CODE_SYSTEMS}
                value={values.codeSystem}
                onChange={(v) => setField("codeSystem", v)}
                error={errors.codeSystem}
              />
              <SignupField
                name="code"
                label={<>Code<Req /></>}
                placeholder="Enter code"
                value={values.code}
                onChange={(e) => setField("code", e.target.value)}
                error={errors.code}
                maxLength={20}
                autoComplete="off"
              />
            </div>
          </section>

          <hr className="my-6 border-divider" />

          {/* 2. Clinical details */}
          <section>
            <SectionHeader step={2} title="Clinical Details" subtitle="Status, onset and who recorded it." />
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <SignupDropdown
                name="clinicalStatus"
                label={<>Clinical Status<Req /></>}
                placeholder="Select status"
                options={CLINICAL_STATUSES}
                value={values.clinicalStatus}
                onChange={(v) => setField("clinicalStatus", v)}
                error={errors.clinicalStatus}
              />
              <DatePicker
                name="onsetDate"
                label={<>Onset Date<Req /></>}
                placeholder="dd-mm-yyyy"
                value={values.onsetDate}
                onChange={(v) => setField("onsetDate", v)}
                maxDate={todayISO()}
                error={errors.onsetDate}
              />
              <SignupDropdown
                name="recordedBy"
                label={<>Recorded By<Req /></>}
                placeholder="Select practitioner"
                options={PRACTITIONERS}
                value={values.recordedBy}
                onChange={(v) => setField("recordedBy", v)}
                error={errors.recordedBy}
              />
              <SignupDropdown
                name="encounter"
                label={<>Encounter<Opt /></>}
                placeholder="Select encounter"
                options={ENCOUNTERS}
                value={values.encounter}
                onChange={(v) => setField("encounter", v)}
                error={errors.encounter}
              />
            </div>
          </section>

          <hr className="my-6 border-divider" />

          {/* 3. Notes */}
          <section>
            <SectionHeader step={3} title="Notes" subtitle="Optional clinical notes." />
            <TextArea
              name="notes"
              label={<>Notes<Opt /></>}
              placeholder="Enter any additional notes"
              value={values.notes}
              onChange={(v) => setField("notes", v)}
              maxLength={500}
              error={errors.notes}
            />
          </section>

          <button type="submit" className="hidden" aria-hidden tabIndex={-1} />
        </form>

    </div>
  );
};

export default AddCondition;