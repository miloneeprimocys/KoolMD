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
import { Opt, Req, TextArea, cardCls, labelCls, todayISO, toOptions } from "@/providers/Shared";

/* ---------------------------------------------------------------- */
/*  Static data (replace with API / redux selector)                  */
/* ---------------------------------------------------------------- */
const SHEETS: Record<string, { id: string; provider: string; approved: number }> = {
  "PS-1045": { id: "PS-1045", provider: "Dr. John Carter", approved: 10000 },
  "PS-1044": { id: "PS-1044", provider: "Dr. Emily Rogers", approved: 8750 },
  "PS-1043": { id: "PS-1043", provider: "MedStaff Agency", approved: 8000 },
};
const METHODS = toOptions(["Bank Transfer", "ACH", "Check", "Credit Card", "Cash"]);
const HISTORY_HREF = "/compensation/payment-history";

const usd = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/* ---------------------------------------------------------------- */
/*  Form model                                                       */
/* ---------------------------------------------------------------- */
interface FormValues {
  amount: string;
  date: string;
  method: string;
  reference: string;
  status: "Paid (Full)" | "Partially Paid";
  notes: string;
}
type FormErrors = Partial<Record<keyof FormValues, string>>;

/* ---------------------------------------------------------------- */
/*  Page                                                             */
/* ---------------------------------------------------------------- */
const RecordPayment = () => {
  const router = useRouter();
  const sheetId = useSearchParams().get("id") ?? "PS-1045";
  const sheet = SHEETS[sheetId] ?? SHEETS["PS-1045"];

  const [values, setValues] = useState<FormValues>({
    amount: sheet.approved.toFixed(2),
    date: todayISO(),
    method: "",
    reference: "",
    status: "Paid (Full)",
    notes: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ title: string; message: string } | null>(null);

  const setField = <K extends keyof FormValues>(field: K, value: FormValues[K]) => {
    setValues((p) => ({ ...p, [field]: value }));
    setErrors((p) => ({ ...p, [field]: undefined }));
  };

  const setStatus = (status: FormValues["status"]) =>
    setValues((p) => ({ ...p, status, amount: status === "Paid (Full)" ? sheet.approved.toFixed(2) : "" }));

  const validate = (): FormErrors => {
    const e: FormErrors = {};
    const amount = Number(values.amount);
    if (!values.amount.trim() || !(amount > 0)) e.amount = "Enter a payment amount greater than 0.";
    else if (amount > sheet.approved) e.amount = `Amount cannot exceed the approved amount (${usd(sheet.approved)}).`;
    else if (values.status === "Partially Paid" && amount >= sheet.approved) e.amount = "A partial payment must be less than the approved amount.";
    if (!values.date) e.date = "Payment date is required.";
    if (!values.method) e.method = "Payment method is required.";
    if (values.method && values.method !== "Cash" && !values.reference.trim()) e.reference = "Transaction reference is required.";
    return e;
  };

  const scrollToField = (field: string) => {
    const el = document.getElementById(field);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
    el?.focus?.();
  };

  const submit = (event?: React.FormEvent) => {
    event?.preventDefault();
    if (isSaving) return;
    const validationErrors = validate();
    setErrors(validationErrors);
    const invalid = Object.keys(validationErrors);
    if (invalid.length) {
      scrollToField(invalid[0]);
      setToast({ title: "Check the form", message: `${invalid.length} field${invalid.length > 1 ? "s need" : " needs"} attention.` });
      return;
    }
    setIsSaving(true);
    try {
      // TODO: call record-payment API with { sheetId: sheet.id, ...values }
      router.push(HISTORY_HREF);
    } catch {
      setToast({ title: "Could not record payment", message: "Something went wrong. Please try again." });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-4 sm:space-y-5">
      <ErrorToast isOpen={toast !== null} onClose={() => setToast(null)} title={toast?.title} message={toast?.message} />
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Compensation", href: "/compensation" },
          { label: "Payment History", href: HISTORY_HREF },
          { label: sheet.id },
          { label: "Record Payment" },
        ]}
      />

      <div>
        <h2 className="text-lg font-semibold text-heading sm:text-xl 2xl:text-2xl">Record Payment</h2>
        <p className="mt-0.5 text-sm text-body">Enter payment details, method and confirm the transaction.</p>
      </div>

      {/* Sheet strip */}
      <section className={`${cardCls} grid gap-4 sm:grid-cols-3 sm:p-6`}>
        <div>
          <p className="text-xs text-body">Sheet #</p>
          <p className="mt-0.5 text-sm font-semibold text-heading">{sheet.id}</p>
        </div>
        <div>
          <p className="text-xs text-body">Provider</p>
          <p className="mt-0.5 text-sm font-semibold text-heading">{sheet.provider}</p>
        </div>
        <div>
          <p className="text-xs text-body">Approved Amount</p>
          <p className="mt-0.5 text-sm font-semibold text-heading">{usd(sheet.approved)}</p>
        </div>
      </section>

      <form className={`${cardCls} min-w-0 sm:p-6`} onSubmit={submit} noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <SignupField
            name="amount"
            label={<>Payment Amount ($)<Req /></>}
            placeholder="0.00"
            value={values.amount}
            onChange={(e) => setField("amount", e.target.value.replace(/[^\d.]/g, ""))}
            error={errors.amount}
            maxLength={12}
            autoComplete="off"
          />
          <DatePicker
            name="date"
            label={<>Payment Date<Req /></>}
            placeholder="dd-mm-yyyy"
            value={values.date}
            onChange={(v) => setField("date", v)}
            error={errors.date}
          />
          <SignupDropdown
            name="method"
            label={<>Payment Method<Req /></>}
            placeholder="Select payment method"
            options={METHODS}
            value={values.method}
            onChange={(v) => setField("method", v)}
            error={errors.method}
          />
          <SignupField
            name="reference"
            label={<>Transaction Reference{values.method === "Cash" ? <Opt /> : <Req />}</>}
            placeholder="Enter transaction reference"
            value={values.reference}
            onChange={(e) => setField("reference", e.target.value)}
            error={errors.reference}
            maxLength={50}
            autoComplete="off"
          />
        </div>

        <div className="mt-4">
          <span className={labelCls}>Payment Status<Req /></span>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {(["Paid (Full)", "Partially Paid"] as const).map((s) => (
              <label key={s} className="flex cursor-pointer items-center gap-2 text-sm text-heading">
                <input
                  type="radio"
                  name="status"
                  checked={values.status === s}
                  onChange={() => setStatus(s)}
                  className="h-4 w-4 cursor-pointer accent-primary"
                />
                {s}
              </label>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <TextArea
            name="notes"
            label={<>Admin Notes<Opt /></>}
            placeholder="Payment processed via bank transfer."
            value={values.notes}
            onChange={(v) => setField("notes", v)}
            maxLength={500}
          />
        </div>

        <div className="mt-6 flex flex-row justify-end gap-2 sm:gap-3">
          <ImportButton text="Cancel" icon={null} className="flex-1 sm:flex-none" onClick={() => router.push(HISTORY_HREF)} />
          <AddButton text={isSaving ? "Saving…" : "Confirm Payment"} icon={null} className="flex-1 sm:flex-none" onClick={() => submit()} disabled={isSaving} />
        </div>

        <button type="submit" className="hidden" aria-hidden tabIndex={-1} />
      </form>
    </div>
  );
};

export default RecordPayment;