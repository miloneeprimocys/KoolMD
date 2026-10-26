"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Zap } from "lucide-react";

import Breadcrumb from "@/components/Breadcrumb";
import AddButton from "@/components/Addbutton";
import ImportButton from "@/components/ImportButton";
import SignupField from "@/components/SignupField";
import SignupDropdown from "@/components/SignupDropdown";
import { ModalRadioGroup, OptLabel, ReqLabel, toOptions } from "@/components/Modalshell";
import { useAppDispatch } from "@/hooks/useAppHooks";
import { showTestConnection } from "@/redux/slices/dialogslice";

import { CLEARINGHOUSES, ROUTES, type Environment } from "./ClearinghouseAccounts";

/* ---------- Shared form ---------- */
export type AccountFormValues = {
  clearinghouse: string;
  name: string;
  environment: Environment;
  clientId: string;
  clientSecret: string;
  payerIds: string;
};

const EMPTY: AccountFormValues = {
  clearinghouse: CLEARINGHOUSES[0],
  name: "",
  environment: "Production",
  clientId: "",
  clientSecret: "",
  payerIds: "",
};

const ENVIRONMENTS = [
  { value: "Production", label: "Production" },
  { value: "Sandbox / Test", label: "Sandbox / Test" },
];

type Errors = Partial<Record<"clearinghouse" | "name" | "clientId" | "clientSecret", string>>;

type FormProps = {
  initial?: AccountFormValues;
  saveText?: string;
  onCancel: () => void;
  onSave: (values: AccountFormValues) => void;
};

export const AccountForm = ({ initial = EMPTY, saveText = "Save", onCancel, onSave }: FormProps) => {
  const dispatch = useAppDispatch();
  const [values, setValues] = useState<AccountFormValues>(initial);
  const [errors, setErrors] = useState<Errors>({});
  const [showSecret, setShowSecret] = useState(false);
  const [testing, setTesting] = useState(false);

  const set = <K extends keyof AccountFormValues>(key: K, value: AccountFormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = (keys: (keyof Errors)[]) => {
    const next: Errors = {};
    const labels: Record<keyof Errors, string> = {
      clearinghouse: "Select a clearinghouse",
      name: "Account name is required",
      clientId: "Client ID is required",
      clientSecret: "Client secret is required",
    };
    keys.forEach((key) => {
      if (!String(values[key]).trim()) next[key] = labels[key];
    });
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleTest = () => {
    if (!validate(["clearinghouse", "clientId", "clientSecret"]) || testing) return;
    setTesting(true);
    // TODO: call your API here — this simulates a successful check
    window.setTimeout(() => {
      dispatch(showTestConnection({
        success: true,
        clearinghouse: values.clearinghouse,
        environment: values.environment,
        clientId: values.clientId,
        testedAt: new Date().toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
        }),
      }));
      setTesting(false);
    }, 600);
  };

  const handleSave = () => {
    if (!validate(["clearinghouse", "name", "clientId", "clientSecret"])) return;
    onSave(values);
  };

  return (
    <section className="rounded-[14px] border border-border bg-card p-4 sm:p-6">
      <div className="grid gap-x-4 gap-y-5 md:grid-cols-2">
        <SignupDropdown
          name="clearinghouse"
          label={<ReqLabel>Clearinghouse</ReqLabel>}
          value={values.clearinghouse}
          onChange={(v: string) => set("clearinghouse", v)}
          options={toOptions(CLEARINGHOUSES)}
        />
        <SignupField
          name="accountName"
          label={<ReqLabel>Account Name</ReqLabel>}
          placeholder="e.g. Availity Production"
          value={values.name}
          error={errors.name}
          onChange={(e) => set("name", e.target.value)}
        />

        <div className="md:col-span-2">
          <ModalRadioGroup
            name="environment"
            label={<ReqLabel>Environment</ReqLabel>}
            value={values.environment}
            onChange={(v) => set("environment", v as Environment)}
            options={ENVIRONMENTS}
            className="gap-x-8"
          />
        </div>

        <SignupField
          name="clientId"
          label={<ReqLabel>Client ID</ReqLabel>}
          placeholder="Enter client ID"
          value={values.clientId}
          error={errors.clientId}
          onChange={(e) => set("clientId", e.target.value)}
        />
        <SignupField
          name="clientSecret"
          type={showSecret ? "text" : "password"}
          label={<ReqLabel>Client Secret</ReqLabel>}
          placeholder="Enter client secret"
          value={values.clientSecret}
          error={errors.clientSecret}
          onChange={(e) => set("clientSecret", e.target.value)}
          trailing={
            <button
              type="button"
              aria-label={showSecret ? "Hide client secret" : "Show client secret"}
              onClick={() => setShowSecret((s) => !s)}
              className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-body transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
            >
              {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          }
        />

        <div className="grid items-end gap-3 md:col-span-2 md:grid-cols-[minmax(0,1fr)_auto]">
          <SignupField
            name="payerIds"
            label={<OptLabel>Payer IDs</OptLabel>}
            placeholder="Enter payer IDs separated by comma"
            value={values.payerIds}
            onChange={(e) => set("payerIds", e.target.value)}
          />
          <ImportButton
            text={testing ? "Testing…" : "Test Connection"}
            icon={<Zap className="h-4 w-4" />}
            onClick={handleTest}
            className="w-fit whitespace-nowrap text-primary"
          />
        </div>
      </div>

      <div className="mt-8 flex items-center justify-end gap-3 border-t border-divider pt-5">
        <ImportButton text="Cancel" icon={null} onClick={onCancel} />
        <AddButton text={saveText} icon={null} onClick={handleSave} />
      </div>

    </section>
  );
};

/* ---------- Page ---------- */
const AddClearinghouseAccount = () => {
  const router = useRouter();

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-4 sm:space-y-5">
      <Breadcrumb
        items={[
          { label: "Billing", href: "/payment/payment-gateway" },
          { label: "Payers", href: ROUTES.list },
          { label: "Accounts", href: ROUTES.list },
          { label: "Add Account" },
        ]}
      />

      <h2 className="text-lg font-semibold text-heading sm:text-xl 2xl:text-2xl">Add Clearinghouse Account</h2>

      <AccountForm
        onCancel={() => router.push(ROUTES.list)}
        onSave={(values) => {
          console.log("add clearinghouse account", values); // TODO: call your API here
          router.push(ROUTES.list);
        }}
      />
    </div>
  );
};

export default AddClearinghouseAccount;
