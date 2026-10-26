"use client";

import React, { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import Breadcrumb from "@/components/Breadcrumb";
import SignupField from "@/components/SignupField";
import SignupDropdown from "@/components/SignupDropdown";
import DatePicker from "@/components/Datepicker";
import AddButton from "@/components/Addbutton";
import ImportButton from "@/components/ImportButton";
import RadioCheckButtonh from "@/components/RadioCheckButtonh";
import TogglableSwitch from "@/components/Togglableswitch";
import { Opt, Req, TextArea, cardCls, toOptions, type Errors } from "@/providers/Shared";
import { ROUTES } from "../ClearinghouseAccounts";
import { PAYER_ROUTES, getPayerId, type PayerId } from "./Payerids";

/* ---------- Options ---------- */
const TYPES = toOptions(["Commercial", "Government"]);
const STATUSES = toOptions(["Active", "Inactive"]);

const FEATURES: { key: "eligibility" | "claims" | "claimStatus"; label: string; desc: string }[] = [
  { key: "eligibility", label: "Eligibility Verification", desc: "Check patient eligibility and benefits." },
  { key: "claims", label: "Claim Submission", desc: "Submit professional claims (CMS 1500)." },
  { key: "claimStatus", label: "Claim Status Retrieval", desc: "Retrieve basic claim status updates." },
];

type Values = Omit<PayerId, "id" | "addedDate" | "addedTime">;

const blank = (): Values => ({
  name: "",
  payerId: "",
  type: "Commercial",
  eligibility: true,
  claims: true,
  claimStatus: true,
  status: "Active",
  isDefault: false,
  effectiveDate: "",
  notes: "",
});

const validate = (v: Values): Errors => {
  const e: Errors = {};
  if (!v.name.trim()) e.name = "Payer name is required.";
  if (!v.payerId.trim()) e.payerId = "Payer ID is required.";
  else if (!/^[A-Za-z0-9-]{3,20}$/.test(v.payerId.trim())) e.payerId = "Use 3–20 letters, numbers or dashes.";
  if (!v.type) e.type = "Select a payer type.";
  if (!v.status) e.status = "Select a status.";
  return e;
};

const checkboxCls =
  "mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-border accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30";

/* ---------- Screen (edit when `id` is in the URL, otherwise add) ---------- */
const EditPayerId = () => {
  const router = useRouter();
  const params = useSearchParams();
  const accountId = params.get("accountId") ?? "";
  const payerKey = params.get("id");

  const existing = payerKey ? getPayerId(payerKey) : undefined;
  const isEdit = Boolean(payerKey);

  const [values, setValues] = useState<Values>(() => {
    if (!existing) return blank();
    const { id: _id, addedDate: _d, addedTime: _t, ...rest } = existing;
    return rest;
  });
  const [errors, setErrors] = useState<Errors>({});

  const set = <K extends keyof Values>(key: K, val: Values[K]) => {
    setValues((p) => ({ ...p, [key]: val }));
    setErrors((p) => ({ ...p, [key]: "" }));
  };

  const backHref = useMemo(() => (accountId ? PAYER_ROUTES.view(accountId) : ROUTES.list), [accountId]);

  const handleSave = () => {
    const errs = validate(values);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    // TODO: call your API here (create when !isEdit, update otherwise)
    router.push(backHref);
  };

  const title = isEdit ? "Edit Payer ID" : "Add Payer ID";

  return (
    <div className="flex min-h-full flex-col">
      <div className="mx-auto w-full max-w-[1600px] flex-1">
        <div className="space-y-4 sm:space-y-5">
          <Breadcrumb
            items={[
              { label: "Billing", href: "/payment/payment-gateway" },
              { label: "Payers", href: ROUTES.list },
              { label: "Accounts", href: ROUTES.list },
              { label: "View Account", href: backHref },
              { label: title },
            ]}
          />

          <div>
            <h2 className="text-lg font-semibold text-heading sm:text-xl 2xl:text-2xl">{title}</h2>
            <p className="mt-0.5 text-sm text-body">
              {isEdit
                ? "Update the payer ID details for this clearinghouse account."
                : "Add a payer ID to this clearinghouse account."}
            </p>
          </div>

          {isEdit && !existing && (
            <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-body">
              This payer ID does not exist.
            </p>
          )}

          {(!isEdit || existing) && (
            <>
              {/* Basic information */}
              <section className={`${cardCls} sm:p-6`}>
                <h3 className="mb-4 text-base font-semibold text-heading sm:text-lg">Basic Information</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <SignupField
                    name="name"
                    label={<>Payer Name<Req /></>}
                    placeholder="Enter payer name"
                    value={values.name}
                    onChange={(e) => set("name", e.target.value)}
                    error={errors.name}
                  />
                  <SignupField
                    name="payerId"
                    label={<>Payer ID<Req /></>}
                    placeholder="Enter payer ID"
                    value={values.payerId}
                    onChange={(e) => set("payerId", e.target.value)}
                    error={errors.payerId}
                  />
                  <SignupDropdown
                    name="type"
                    label={<>Payer Type<Req /></>}
                    placeholder="Select payer type"
                    searchable={false}
                    options={TYPES}
                    value={values.type}
                    onChange={(v) => set("type", v as Values["type"])}
                    error={errors.type}
                  />
                  <SignupDropdown
                    name="status"
                    label={<>Status<Req /></>}
                    placeholder="Select status"
                    searchable={false}
                    options={STATUSES}
                    value={values.status}
                    onChange={(v) => set("status", v as Values["status"])}
                    error={errors.status}
                  />
                </div>
              </section>

              {/* Feature support */}
              <section className={`${cardCls} sm:p-6`}>
                <h3 className="text-base font-semibold text-heading sm:text-lg">Feature Support</h3>
                <p className="mb-4 mt-0.5 text-xs text-body sm:text-sm">
                  Select which features are supported for this payer. Availability depends on your clearinghouse
                  configuration.
                </p>
                <div className="space-y-4">
                  {FEATURES.map((f) => (
                    <label key={f.key} htmlFor={`feat-${f.key}`} className="flex cursor-pointer items-start gap-3">
                      <RadioCheckButtonh
                        id={`feat-${f.key}`}
                        type="checkbox"
                        checked={values[f.key]}
                        onChange={() => set(f.key, !values[f.key])}
                        className={checkboxCls}
                      />
                      <span className="min-w-0">
                        <span className="block text-sm font-medium text-heading">{f.label}</span>
                        <span className="mt-0.5 block text-xs text-body">{f.desc}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </section>

              {/* Additional configuration */}
              <section className={`${cardCls} sm:p-6`}>
                <h3 className="mb-4 text-base font-semibold text-heading sm:text-lg">Additional Configuration</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="mb-2 text-sm font-medium text-label">Default Payer</p>
                    <div className="flex h-12 items-center">
                      <TogglableSwitch
                        id="isDefault"
                        checked={values.isDefault}
                        onChange={(arg: any) =>
                          set("isDefault", typeof arg === "boolean" ? arg : Boolean(arg?.target?.checked))
                        }
                        ariaLabel="Set as default payer"
                        label={<span className="text-xs text-body sm:text-sm">Set as default payer for this clearinghouse account.</span>}
                      />
                    </div>
                  </div>
                  <DatePicker
                    name="effectiveDate"
                    label={<>Payer Effective Date<Opt /></>}
                    placeholder="Select date"
                    value={values.effectiveDate}
                    onChange={(v) => set("effectiveDate", v)}
                  />
                </div>
                <div className="mt-4">
                  <TextArea
                    name="notes"
                    label={<>Notes<Opt /></>}
                    placeholder="Add any notes about this payer..."
                    value={values.notes}
                    onChange={(v) => set("notes", v)}
                    maxLength={500}
                    rows={3}
                  />
                </div>
              </section>
            </>
          )}
        </div>
      </div>

      {/* Sticky bottom buttons */}
      <div className="sticky -bottom-4 z-[200] -mx-4 -mb-4 mt-4 border-t border-border bg-card px-4 py-4 sm:-bottom-6 sm:-mx-6 sm:-mb-6 sm:px-6 sm:py-5">
        <div className="mx-auto flex w-full max-w-[1600px] items-center justify-end gap-2 sm:gap-3">
          <ImportButton text="Cancel" icon={null} onClick={() => router.push(backHref)} className="shrink-0 px-3 sm:px-5" />
          <AddButton
            text={isEdit ? "Save Changes" : "Add Payer ID"}
            icon={null}
            onClick={handleSave}
            className="shrink-0 whitespace-nowrap px-3 sm:px-5"
          />
        </div>
      </div>
    </div>
  );
};

export default EditPayerId;
