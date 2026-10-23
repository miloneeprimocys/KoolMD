"use client";

import React, { useState } from "react";
import { CreditCard, FileText, Info, RefreshCw } from "lucide-react";

import SignupDropdown from "@/components/SignupDropdown";
import AddButton from "@/components/Addbutton";
import ImportButton from "@/components/ImportButton";
import TogglableSwitch from "@/components/Togglableswitch";
import { cardCls, toOptions } from "@/providers/Shared";

/* ---------- Static data ---------- */
const REFUND_METHODS = toOptions(["Original Payment Method", "Store Credit", "Manual Refund"]);

const REFUND_HELP: Record<string, string> = {
  "Original Payment Method": "Refunds will be returned to the original payment method used by the patient.",
  "Store Credit": "Refunds will be added as credit to the patient's account balance.",
  "Manual Refund": "Refunds will be reviewed and issued manually by your billing team.",
};

const INFO: { icon: React.ElementType; title: string; text: string }[] = [
  {
    icon: RefreshCw,
    title: "Refund Processing Time",
    text: "Refunds typically take 3 – 7 business days to appear in the patient's account, depending on the payment method and bank.",
  },
  {
    icon: CreditCard,
    title: "Gateway Fees",
    text: "Payment processing fees charged by the gateway (e.g., Stripe) are non-refundable.",
  },
  {
    icon: FileText,
    title: "Refund Eligibility",
    text: "Refunds are subject to the terms and conditions of the selected payment gateway.",
  },
];

const initialValues = () => ({ enabled: true, method: "Original Payment Method" });

/* ---------- Component ---------- */
const RefundSettings = ({ onSave }: { onSave?: () => void }) => {
  const [values, setValues] = useState(initialValues());

  return (
    <div className="grid items-start gap-4 sm:gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
      {/* ================= LEFT ================= */}
      <section className={`${cardCls} min-w-0 space-y-5 sm:p-6`}>
        <div>
          <h3 className="text-base font-semibold text-heading sm:text-lg">Refund Settings</h3>
          <p className="mt-0.5 text-xs text-body sm:text-sm">
            Configure how refunds are handled for payments processed through this gateway.
          </p>
        </div>

        <div>
          <TogglableSwitch
            id="enableRefunds"
            checked={values.enabled}
            onChange={(arg: any) =>
              setValues((p) => ({ ...p, enabled: typeof arg === "boolean" ? arg : Boolean(arg?.target?.checked) }))
            }
            ariaLabel="Enable refunds"
            label={<span className="text-sm font-medium text-heading">Enable Refunds</span>}
          />
          <p className="ml-14 mt-1 text-xs text-body">Allow refunds for payments processed through this gateway.</p>
        </div>

        <div className="border-t border-divider pt-5">
          <SignupDropdown
            name="refundMethod"
            label="Default Refund Method"
            placeholder="Select refund method"
            searchable={false}
            options={REFUND_METHODS}
            value={values.method}
            onChange={(v) => setValues((p) => ({ ...p, method: v }))}
          />
          <p className="mt-2 text-xs text-body">{REFUND_HELP[values.method]}</p>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-divider pt-5">
          <ImportButton text="Cancel" icon={null} onClick={() => setValues(initialValues())} className="px-5" />
          <AddButton
            text="Save Changes"
            icon={null}
            onClick={() => {
              // TODO: call your API here
              onSave?.();
            }}
            className="px-5"
          />
        </div>
      </section>

      {/* ================= RIGHT ================= */}
      <aside className={`${cardCls} sm:p-6`}>
        <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-heading">
          Important Information <Info className="h-4 w-4 text-body" />
        </h3>
        <ul className="divide-y divide-divider">
          {INFO.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex items-start gap-3 py-4 first:pt-0 last:pb-0">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-heading">{title}</p>
                <p className="mt-0.5 text-xs text-body sm:text-sm">{text}</p>
              </div>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
};

export default RefundSettings;