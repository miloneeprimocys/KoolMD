"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import SignupField from "@/components/SignupField";
import SignupDropdown from "@/components/SignupDropdown";
import AddButton from "@/components/Addbutton";
import ImportButton from "@/components/ImportButton";
import Breadcrumb from "@/components/Breadcrumb";
import DatePicker from "@/components/Datepicker";
import ErrorToast from "@/components/ErrorToast";
import { Opt, Req, TextArea, cardCls, labelCls, toOptions } from "@/providers/Shared";

/* ---------------------------------------------------------------- */
/*  Static data (replace with API / redux selector)                  */
/* ---------------------------------------------------------------- */
const PROVIDERS = [
  { id: "PR-1001", name: "Dr. John Carter", type: "Independent Contractor" },
  { id: "PR-1002", name: "Dr. Emily Rogers", type: "KOOLMD Direct" },
  { id: "PR-1003", name: "Dr. Michael Lee", type: "Independent Contractor" },
  { id: "PR-1004", name: "MedStaff Agency", type: "External Agency" },
  { id: "PR-1005", name: "CarePlus Agency", type: "External Agency" },
];
const PROVIDER_OPTIONS = PROVIDERS.map((p) => ({ value: p.id, label: `${p.name} (${p.id})` }));
const TYPE_OPTIONS = toOptions(Array.from(new Set(PROVIDERS.map((p) => p.type))));

const BASES = ["Per Consultation", "Per Case", "Fixed Rate", "Manual / Custom"] as const;
const RATE_LABELS: Record<string, string> = {
  "Per Consultation": "Consultation Rate ($)",
  "Per Case": "Case Rate ($)",
  "Fixed Rate": "Fixed Amount ($)",
};

const LIST_HREF = "/compensation/provider-directory";

/* ---------------------------------------------------------------- */
/*  Form model                                                       */
/* ---------------------------------------------------------------- */
interface FormValues {
  provider: string;
  basis: string;
  rate: string;
  effectiveFrom: string;
  effectiveTo: string;
  notes: string;
}
type FormErrors = Partial<Record<keyof FormValues, string>>;

const EMPTY_FORM: FormValues = { provider: "", basis: "Per Consultation", rate: "", effectiveFrom: "", effectiveTo: "", notes: "" };

/** Edit mode: opened from a provider, the agreement is pre-filled. */
const initialForm = (providerId: string | null): FormValues =>
  providerId && PROVIDERS.some((p) => p.id === providerId)
    ? {
        provider: providerId,
        basis: "Per Consultation",
        rate: "500.00",
        effectiveFrom: "2026-01-01",
        effectiveTo: "2026-12-31",
        notes: "$500 per completed consultation. Valid for calendar year 2026.",
      }
    : EMPTY_FORM;

const validate = (v: FormValues): FormErrors => {
  const e: FormErrors = {};
  if (!v.provider) e.provider = "Provider is required.";
  if (v.basis !== "Manual / Custom") {
    if (!v.rate.trim()) e.rate = "Rate is required.";
    else if (!(Number(v.rate) > 0)) e.rate = "Enter an amount greater than 0.";
  }
  if (!v.effectiveFrom) e.effectiveFrom = "Effective from date is required.";
  if (!v.effectiveTo) e.effectiveTo = "Effective to date is required.";
  else if (v.effectiveFrom && v.effectiveTo < v.effectiveFrom) e.effectiveTo = "Must be on or after the start date.";
  return e;
};

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

/* ---------------------------------------------------------------- */
/*  Page                                                             */
/* ---------------------------------------------------------------- */
const CompensationAgreement = () => {
  const router = useRouter();
  const providerId = useSearchParams().get("providerId");
  const [values, setValues] = useState<FormValues>(() => initialForm(providerId));
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ title: string; message: string } | null>(null);

  const provider = PROVIDERS.find((p) => p.id === values.provider);
  const backHref = values.provider ? `/compensation/provider-profile?id=${encodeURIComponent(values.provider)}` : LIST_HREF;

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
      // TODO: dispatch(saveCompensationAgreement({ ...values }))
      router.push(backHref);
    } catch {
      setToast({ title: "Could not save agreement", message: "Something went wrong. Please try again." });
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
      setToast({ title: "Check the form", message: `${invalid.length} field${invalid.length > 1 ? "s need" : " needs"} attention.` });
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
          { label: "Compensation", href: "/compensation" },
          { label: "Provider Directory", href: LIST_HREF },
          ...(provider ? [{ label: provider.name, href: backHref }] : []),
          { label: "Compensation Agreement" },
        ]}
      />

      <div>
        <h2 className="text-lg font-semibold text-heading sm:text-xl 2xl:text-2xl">Compensation Agreement</h2>
        <p className="mt-0.5 text-sm text-body">Configure payment type, rate and effective dates.</p>
      </div>

      <form className={`${cardCls} min-w-0 sm:p-6`} onSubmit={submit} noValidate>
        {/* 1. Provider information */}
        <section>
          <SectionHeader step={1} title="Provider Information" subtitle="Who the agreement is for." />
          <div className="grid gap-4 sm:grid-cols-2">
            <SignupDropdown
              name="provider"
              label={<>Provider<Req /></>}
              placeholder="Select provider"
              options={PROVIDER_OPTIONS}
              value={values.provider}
              onChange={(v) => setField("provider", v)}
              error={errors.provider}
            />
            <SignupDropdown
              name="providerType"
              label="Provider Type"
              placeholder="Auto-filled from provider"
              options={TYPE_OPTIONS}
              value={provider?.type ?? ""}
              onChange={() => {}}
              disabled
            />
          </div>
        </section>

        <hr className="my-6 border-divider" />

        {/* 2. Compensation details */}
        <section>
          <SectionHeader step={2} title="Compensation Details" subtitle="How and when the provider is paid." />

          <div className="mb-4">
            <span className={labelCls}>Payment Basis<Req /></span>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {BASES.map((b) => (
                <label key={b} className="flex cursor-pointer items-center gap-2 text-sm text-heading">
                  <input
                    type="radio"
                    name="basis"
                    checked={values.basis === b}
                    onChange={() => setValues((p) => ({ ...p, basis: b, rate: "" }))}
                    className="h-4 w-4 cursor-pointer accent-primary"
                  />
                  {b}
                </label>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {values.basis !== "Manual / Custom" && (
              <SignupField
                name="rate"
                label={<>{RATE_LABELS[values.basis]}<Req /></>}
                placeholder="0.00"
                value={values.rate}
                onChange={(e) => setField("rate", e.target.value.replace(/[^\d.]/g, ""))}
                error={errors.rate}
                maxLength={12}
                autoComplete="off"
              />
            )}
            <DatePicker
              name="effectiveFrom"
              label={<>Effective From<Req /></>}
              placeholder="dd-mm-yyyy"
              value={values.effectiveFrom}
              onChange={(v) => setField("effectiveFrom", v)}
              error={errors.effectiveFrom}
            />
            <DatePicker
              name="effectiveTo"
              label={<>Effective To<Req /></>}
              placeholder="dd-mm-yyyy"
              value={values.effectiveTo}
              onChange={(v) => setField("effectiveTo", v)}
              error={errors.effectiveTo}
            />
          </div>

          <div className="mt-4">
            <TextArea
              name="notes"
              label={<>Agreement Notes<Opt /></>}
              placeholder="Enter agreement notes"
              value={values.notes}
              onChange={(v) => setField("notes", v)}
              maxLength={500}
            />
          </div>
        </section>

        <div className="mt-6 flex flex-row justify-end gap-2 sm:gap-3">
          <ImportButton text="Cancel" icon={null} className="flex-1 sm:flex-none" onClick={() => router.push(backHref)} />
          <AddButton text={isSaving ? "Saving…" : "Save Agreement"} icon={null} className="flex-1 sm:flex-none" onClick={() => submit()} disabled={isSaving} />
        </div>

        <button type="submit" className="hidden" aria-hidden tabIndex={-1} />
      </form>
    </div>
  );
};

export default CompensationAgreement;