"use client";

import React, { useState } from "react";
import { Check, Copy, Eye, EyeOff, Info } from "lucide-react";

import SignupField from "@/components/SignupField";
import SignupDropdown from "@/components/SignupDropdown";
import AddButton from "@/components/Addbutton";
import ImportButton from "@/components/ImportButton";
import EditButton from "@/components/EditButton";
import RadioCheckButtonh from "@/components/RadioCheckButtonh";
import Table from "@/components/Table";
import { type TableColumn } from "@/components/Tableheader";
import StickyColumns from "@/components/StickyColumns";
import Tags from "@/components/Tags";
import { Req, cardCls, toOptions, type Errors } from "@/providers/Shared";
import { METHODS, MethodBrands, MethodIcon, type MethodId, type MethodKind, type MethodsState } from "./Supportedmethods";

/* ---------- Static data ---------- */
const GATEWAYS = toOptions(["Stripe", "PayPal", "Square", "Authorize.net"]);
const WEBHOOK_URL = "https://app.koolmd.com/api/payments/stripe/webhook";

const MODES = [
  { value: "live", label: "Live Mode", desc: "Process real payments from patients." },
  { value: "test", label: "Test Mode", desc: "Use test credentials for development." },
];

type Settings = {
  patientPayments: boolean;
  providerPayments: boolean;
  autoReceipt: boolean;
  partialPayments: boolean;
};

const SETTINGS: { key: keyof Settings; label: string; desc: string }[] = [
  { key: "patientPayments", label: "Enable patient payments", desc: "Allow patients to pay for appointments, invoices and memberships." },
  { key: "providerPayments", label: "Enable provider payments", desc: "Allow payments to providers (if applicable)." },
  { key: "autoReceipt", label: "Enable automatic receipt generation", desc: "Send payment receipt to patient via email." },
  { key: "partialPayments", label: "Allow partial payments", desc: "Let patients make partial payments for invoices." },
];

type Values = Settings & {
  gateway: string;
  mode: string;
  publishableKey: string;
  secretKey: string;
};

const initialValues = (): Values => ({
  gateway: "Stripe",
  mode: "live",
  publishableKey: "pk_live_51H8xK2LmPqRsTuVw",
  secretKey: "sk_live_51H8xK2LmPqRsTuVw",
  patientPayments: true,
  providerPayments: true,
  autoReceipt: true,
  partialPayments: false,
});

const validate = (v: Values): Errors => {
  const e: Errors = {};
  if (!v.gateway) e.gateway = "Select a payment gateway.";
  if (!v.publishableKey.trim()) e.publishableKey = "Publishable key is required.";
  if (!v.secretKey.trim()) e.secretKey = "Secret key is required.";
  return e;
};

const GATEWAY_STATUS: { label: string; value: React.ReactNode }[] = [
  { label: "Gateway", value: "Stripe" },
  { label: "Environment", value: "Live Mode" },
  {
    label: "Connection Status",
    value: (
      <span className="inline-flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-success" />
        Active
      </span>
    ),
  },
  { label: "Last Checked", value: "Oct 14, 2026, 10:30 AM" },
  { label: "Transaction Fee", value: "2.9% + $0.30 (per successful charge)" },
];

const FEE_COLUMNS: TableColumn[] = [
  { key: "method", label: "Payment Method" },
  { key: "fee", label: "Fee" },
];

const checkboxCls =
  "mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-border accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30";
const radioCls =
  "mt-0.5 h-4 w-4 shrink-0 cursor-pointer border-border accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30";

const KIND_OF: Record<MethodId, MethodKind> = { card: "card", ach: "ach", apple: "apple", google: "google" };

/* ---------- Component ---------- */
type Props = {
  methods: MethodsState;
  onMethodsChange: (patch: Partial<MethodsState>) => void;
  onSave?: () => void;
};

const GatewayConfiguration = ({ methods, onMethodsChange, onSave }: Props) => {
  const [values, setValues] = useState<Values>(initialValues());
  const [errors, setErrors] = useState<Errors>({});
  const [copied, setCopied] = useState(false);
  const [showSecretKey, setShowSecretKey] = useState(false);

  const set = <K extends keyof Values>(key: K, val: Values[K]) => {
    setValues((p) => ({ ...p, [key]: val }));
    setErrors((p) => ({ ...p, [key]: "" }));
  };

  const handleSave = () => {
    const errs = validate(values);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    // TODO: call your API here
    onSave?.();
  };

  const copyWebhook = async () => {
    try {
      await navigator.clipboard.writeText(WEBHOOK_URL);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard not available */
    }
  };

  const feeRows = METHODS.map((m) => ({
    method: <span className="text-sm text-heading">{m.name}</span>,
    fee: <span className="text-sm text-heading">{m.fee}</span>,
  }));

  return (
    <StickyColumns columnsClass="2xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]" breakpoint="2xl">
      {/* ================= LEFT ================= */}
      <section className={`${cardCls} min-w-0 space-y-5 sm:p-6`}>
        <div>
          <h3 className="text-base font-semibold text-heading sm:text-lg">Gateway Information</h3>
          <p className="mt-0.5 text-xs text-body sm:text-sm">Select a payment gateway and configure the required credentials.</p>
        </div>

        {/* Gateway */}
        <div className="flex items-end gap-3">
          <div className="min-w-0 flex-1">
            <SignupDropdown
              name="gateway"
              label="Payment Gateway"
              placeholder="Select payment gateway"
              searchable={false}
              options={GATEWAYS}
              value={values.gateway}
              onChange={(v) => set("gateway", v)}
              error={errors.gateway}
            />
          </div>
          {values.gateway === "Stripe" && (
            <div className="flex h-12 shrink-0 items-center">
              <Tags text="Recommended" tone="success" />
            </div>
          )}
        </div>

        {/* Mode */}
        <div>
          <p className="mb-2 text-sm font-medium text-label">Mode</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {MODES.map((m) => (
              <label key={m.value} htmlFor={`mode-${m.value}`} className="flex cursor-pointer items-start gap-2.5">
                <RadioCheckButtonh
                  id={`mode-${m.value}`}
                  type="radio"
                  name="mode"
                  checked={values.mode === m.value}
                  onChange={() => set("mode", m.value)}
                  className={radioCls}
                />
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-heading">{m.label}</span>
                  <span className="block text-xs text-body">{m.desc}</span>
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Keys */}
        <div className="grid gap-4 sm:grid-cols-2">
          <SignupField
            name="publishableKey"
            label={<>Publishable Key<Req /></>}
            placeholder="pk_live_..."
            value={values.publishableKey}
            onChange={(e) => set("publishableKey", e.target.value)}
            error={errors.publishableKey}
          />
          <SignupField
            name="secretKey"
            type={showSecretKey ? "text" : "password"}
            label={<>Secret Key<Req /></>}
            placeholder="sk_live_..."
            value={values.secretKey}
            onChange={(e) => set("secretKey", e.target.value)}
            error={errors.secretKey}
            trailing={
              <button
                type="button"
                aria-label={showSecretKey ? "Hide secret key" : "Show secret key"}
                onClick={() => setShowSecretKey((visible) => !visible)}
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-body transition-colors hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
              >
                {showSecretKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
          />
        </div>

        {/* Webhook */}
        <div>
          <p className="mb-2 text-sm font-medium text-label">Webhook URL</p>
          <div className="flex h-12 items-center gap-2 rounded-lg border border-border bg-heading/5 px-3">
            <span className="min-w-0 flex-1 truncate text-sm text-body">{WEBHOOK_URL}</span>
            <button
              type="button"
              aria-label="Copy webhook URL"
              onClick={copyWebhook}
              className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-body transition-colors hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
            >
              {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Payment settings */}
        <div className="border-t border-divider pt-5">
          <h4 className="mb-4 text-sm font-semibold text-heading sm:text-base">Payment Settings</h4>
          <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
            {SETTINGS.map((s) => (
              <label key={s.key} htmlFor={`pg-${s.key}`} className="flex cursor-pointer items-start gap-3">
                <RadioCheckButtonh
                  id={`pg-${s.key}`}
                  type="checkbox"
                  checked={values[s.key]}
                  onChange={() => set(s.key, !values[s.key])}
                  className={checkboxCls}
                />
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-heading">{s.label}</span>
                  <span className="mt-0.5 block text-xs text-body">{s.desc}</span>
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-divider pt-5">
          <ImportButton text="Cancel" icon={null} onClick={() => setValues(initialValues())} className="px-5" />
          <AddButton text="Save Changes" icon={null} onClick={handleSave} className="px-5" />
        </div>
      </section>

      {/* ================= RIGHT ================= */}
      <div className="min-w-0 space-y-4 sm:space-y-5">
        {/* Gateway status */}
        <section className={`${cardCls} sm:p-6`}>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="text-base font-semibold text-heading">Gateway Status</h3>
            <Tags text="Connected" tone="success" />
          </div>
          <dl className="space-y-2.5">
            {GATEWAY_STATUS.map((r) => (
              <div key={r.label} className="grid grid-cols-[130px_minmax(0,1fr)] gap-3 text-sm">
                <dt className="text-body">{r.label}</dt>
                <dd className="min-w-0 break-words text-heading">{r.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Supported payment methods */}
        <section className={`${cardCls} sm:p-6`}>
          <h3 className="text-base font-semibold text-heading">Supported Payment Methods</h3>
          <p className="mb-3 mt-0.5 text-xs text-body sm:text-sm">Select the payment methods you want to enable.</p>
          <ul className="divide-y divide-divider">
            {METHODS.map((m) => (
              <li
                key={m.id}
                className={m.id === "card"
                  ? "grid grid-cols-[auto_auto_minmax(0,1fr)] items-center gap-x-2 gap-y-2 py-3 sm:flex sm:gap-3"
                  : "flex items-center gap-3 py-3"}
              >
                <RadioCheckButtonh
                  type="checkbox"
                  checked={methods[m.id]}
                  onChange={() => onMethodsChange({ [m.id]: !methods[m.id] })}
                  aria-label={m.name}
                  className="h-4 w-4 shrink-0 cursor-pointer rounded border-border accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                />
                <MethodIcon kind={KIND_OF[m.id]} className="h-5 w-5 shrink-0" />
                <span className={`min-w-0 text-sm font-medium leading-tight text-heading ${m.id === "card" ? "" : "flex-1"}`}>
                  {m.name}
                </span>
                <span className={m.id === "card" ? "col-span-3 flex min-w-0 justify-start pl-6 sm:ml-auto sm:pl-0" : "shrink-0"}>
                  <MethodBrands id={m.id} />
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* Transaction fees */}
        <section className={`${cardCls} sm:p-6`}>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="flex items-center gap-2 text-base font-semibold text-heading">
              Transaction Fees <Info className="h-4 w-4 text-body" />
            </h3>
            <EditButton section="Transaction Fees" label="Edit Fees" onEdit={() => {}} />
          </div>
          <div className="overflow-hidden rounded-[14px] border border-border bg-card">
            <Table columns={FEE_COLUMNS} rows={feeRows} bordered={false} />
          </div>
        </section>
      </div>
    </StickyColumns>
  );
};

export default GatewayConfiguration;
