"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ClipboardList } from "lucide-react";

import SignupField from "@/components/SignupField";
import SignupDropdown from "@/components/SignupDropdown";
import AddButton from "@/components/Addbutton";
import ImportButton from "@/components/ImportButton";
import Breadcrumb from "@/components/Breadcrumb";
import DatePicker from "@/components/Datepicker";
import ErrorToast from "@/components/ErrorToast";
import { Opt, Req, TextArea, cardCls, toOptions, todayISO } from "../../../../providers/Shared";

/* ---------- Options ---------- */
const LIST_HREF = "/fhir-model?resource=medication-statements";

const PATIENTS = toOptions([
  "John Smith", "Emily Carter", "Robert Johnson", "Olivia Brown", "William Davis", "Sophia Miller",
  "Michael Wilson", "Isabella Moore", "David Taylor", "Laura Anderson", "James Martin",
]);
const MEDICATIONS = toOptions([
  "Metformin 500 mg", "Lisinopril 10 mg", "Albuterol 90 mcg", "Atorvastatin 20 mg", "Levothyroxine 50 mcg",
  "Omeprazole 20 mg", "Amlodipine 5 mg", "Sertraline 50 mg", "Hydrochlorothiazide 25 mg",
  "Vitamin D 1000 IU", "Ibuprofen 200 mg",
]);
const FORMS = toOptions(["Tablet", "Capsule", "Inhaler", "Injection", "Syrup", "Cream", "Drops"]);
const STATUSES = toOptions(["Active", "Past", "Not Taking", "Unknown"]);
const CATEGORIES = toOptions(["Outpatient", "Community"]);
const SOURCES = toOptions(["Patient Reported", "Practitioner Reported", "Pharmacy Record"]);
const REPORTERS = toOptions(["Patient", "Caregiver", "Practitioner"]);
const ENCOUNTERS = toOptions(Array.from({ length: 11 }, (_, i) => `ENC-00${1247 + i}`));

/* ---------- Form model ---------- */
interface FormValues {
  patient: string;
  medication: string;
  form: string;
  status: string;
  category: string;
  encounter: string;
  effectiveDate: string;
  source: string;
  reportedBy: string;
  notes: string;
}
type FormErrors = Partial<Record<keyof FormValues, string>>;

const EMPTY_FORM: FormValues = {
  patient: "", medication: "", form: "", status: "Active", category: "", encounter: "",
  effectiveDate: "", source: "Patient Reported", reportedBy: "Patient", notes: "",
};

const validate = (v: FormValues): FormErrors => {
  const e: FormErrors = {};
  if (!v.patient) e.patient = "Patient is required.";
  if (!v.medication) e.medication = "Medication is required.";
  if (!v.form) e.form = "Form is required.";
  if (!v.status) e.status = "Status is required.";
  if (!v.category) e.category = "Category is required.";
  if (!v.effectiveDate) e.effectiveDate = "Effective date is required.";
  else if (v.effectiveDate > todayISO()) e.effectiveDate = "Effective date cannot be in the future.";
  if (!v.source) e.source = "Source is required.";
  if (!v.reportedBy) e.reportedBy = "Reported by is required.";
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
const AddMedicationStatement = () => {
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
      // TODO: dispatch(createMedicationStatement({...values}))
      router.push(LIST_HREF);
    } catch {
      setToast({ title: "Could not save statement", message: "Something went wrong. Please try again." });
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
          { label: "Medication Statements", href: LIST_HREF },
          { label: "Add Medication Statement" },
        ]}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-heading sm:text-xl 2xl:text-2xl">Add Medication Statement</h2>
          <p className="mt-0.5 text-sm text-body">Record a current, past or reported medication for a patient.</p>
        </div>
        <div className="flex flex-row gap-2">
          <ImportButton text="Cancel" icon={null} className="flex-1 sm:flex-none" onClick={() => router.push(LIST_HREF)} />
          <AddButton text={isSaving ? "Saving…" : "Save Statement"} icon={null} className="flex-1 sm:flex-none" onClick={() => submit()} disabled={isSaving} />
        </div>
      </div>

   
        <form className={`${cardCls} min-w-0 sm:p-6`} onSubmit={submit} noValidate>
          {/* 1. Patient & medication */}
          <section>
            <SectionHeader step={1} title="Patient & Medication" subtitle="Who is taking what." />
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
              <SignupDropdown
                name="medication"
                label={<>Medication<Req /></>}
                placeholder="Select medication"
                options={MEDICATIONS}
                value={values.medication}
                onChange={(v) => setField("medication", v)}
                error={errors.medication}
              />
              <SignupDropdown
                name="form"
                label={<>Form<Req /></>}
                placeholder="Select form"
                options={FORMS}
                value={values.form}
                onChange={(v) => setField("form", v)}
                error={errors.form}
              />
            </div>
          </section>

          <hr className="my-6 border-divider" />

          {/* 2. Status & timing */}
          <section>
            <SectionHeader step={2} title="Status & Timing" subtitle="Whether and since when it is taken." />
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <SignupDropdown
                name="status"
                label={<>Status<Req /></>}
                placeholder="Select status"
                options={STATUSES}
                value={values.status}
                onChange={(v) => setField("status", v)}
                error={errors.status}
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
              <DatePicker
                name="effectiveDate"
                label={<>Effective Date<Req /></>}
                placeholder="dd-mm-yyyy"
                value={values.effectiveDate}
                onChange={(v) => setField("effectiveDate", v)}
                maxDate={todayISO()}
                error={errors.effectiveDate}
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

          {/* 3. Source & notes */}
          <section>
            <SectionHeader step={3} title="Source & Notes" subtitle="Where the information came from." />
            <div className="grid gap-4 sm:grid-cols-2">
              <SignupDropdown
                name="source"
                label={<>Source<Req /></>}
                placeholder="Select source"
                options={SOURCES}
                value={values.source}
                onChange={(v) => setField("source", v)}
                error={errors.source}
              />
              <SignupDropdown
                name="reportedBy"
                label={<>Reported By<Req /></>}
                placeholder="Select reporter"
                options={REPORTERS}
                value={values.reportedBy}
                onChange={(v) => setField("reportedBy", v)}
                error={errors.reportedBy}
              />
            </div>
            <div className="mt-4">
              <TextArea
                name="notes"
                label={<>Notes<Opt /></>}
                placeholder="e.g. Taking twice daily"
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

export default AddMedicationStatement;