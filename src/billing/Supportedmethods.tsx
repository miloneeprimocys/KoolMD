"use client";

import React from "react";
import { CreditCard, Landmark } from "lucide-react";
import { FaApple } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

import Table from "@/components/Table";
import { type TableColumn } from "@/components/Tableheader";
import Tags from "@/components/Tags";
import AddButton from "@/components/Addbutton";
import ImportButton from "@/components/ImportButton";
import TogglableSwitch from "@/components/Togglableswitch";
import { cardCls } from "@/providers/Shared";

/* ---------------------------------------------------------------- */
/*  Shared pieces (also used by the Configuration and Transaction    */
/*  History tabs)                                                    */
/* ---------------------------------------------------------------- */
export type MethodKind = "card" | "visa" | "mastercard" | "ach" | "apple" | "google";
export type MethodId = "card" | "ach" | "apple" | "google";
export type MethodsState = Record<MethodId, boolean>;

export const DEFAULT_METHODS: MethodsState = { card: true, ach: true, apple: true, google: true };

export const METHODS: {
  id: MethodId;
  name: string;
  description: string;
  fee: string;
}[] = [
  { id: "card", name: "Credit / Debit Card", description: "Allow patients to pay using major credit and debit cards (Visa, Mastercard, American Express, Discover).", fee: "2.9% + $0.30" },
  { id: "ach", name: "ACH Bank Transfer", description: "Allow patients to pay directly from their bank account using ACH transfer.", fee: "1% (max $10)" },
  { id: "apple", name: "Apple Pay", description: "Allow patients to pay using Apple Pay on supported devices.", fee: "2.9% + $0.30" },
  { id: "google", name: "Google Pay", description: "Allow patients to pay using Google Pay on supported devices.", fee: "2.9% + $0.30" },
];

/** Small brand-style chip (VISA, ACH, Pay …). */
export const BrandChip = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <span
    className={`inline-flex h-6 items-center justify-center rounded border border-border bg-card px-1.5 text-[10px] font-bold leading-none text-heading ${className}`}
  >
    {children}
  </span>
);

export const MastercardMark = () => (
  <span className="relative inline-flex h-5 w-7 shrink-0 items-center" aria-hidden="true">
    <span className="absolute left-0 h-5 w-5 rounded-full bg-danger/90" />
    <span className="absolute right-0 h-5 w-5 rounded-full bg-warning/90 mix-blend-multiply dark:mix-blend-normal" />
  </span>
);

export const VisaMark = () => <span className="text-sm font-extrabold italic tracking-tight text-primary">VISA</span>;

/** Icon used in lists (supported methods, transactions). */
export const MethodIcon = ({ kind, className = "h-5 w-5" }: { kind: MethodKind; className?: string }) => {
  switch (kind) {
    case "visa":
      return <VisaMark />;
    case "mastercard":
      return <MastercardMark />;
    case "ach":
      return <Landmark className={`${className} text-primary`} />;
    case "apple":
      return <FaApple className={`${className} text-heading`} />;
    case "google":
      return <FcGoogle className={className} />;
    default:
      return <CreditCard className={`${className} text-primary`} />;
  }
};

/** Brand marks shown on the right of a method row. */
export const MethodBrands = ({ id }: { id: MethodId }) => {
  if (id === "card")
    return (
      <span className="flex items-center gap-1.5">
        <BrandChip className="!text-primary italic">VISA</BrandChip>
        <BrandChip>
          <MastercardMark />
        </BrandChip>
        <BrandChip className="!border-primary !bg-primary !text-white">AMEX</BrandChip>
        <BrandChip className="!text-warning">DISCOVER</BrandChip>
      </span>
    );
  if (id === "ach") return <BrandChip>ACH</BrandChip>;
  if (id === "apple")
    return (
      <BrandChip className="gap-1 !px-2 !text-xs">
        <FaApple className="h-3 w-3" />
        Pay
      </BrandChip>
    );
  return (
    <BrandChip className="gap-1 !px-2 !text-xs">
      <FcGoogle className="h-3 w-3" />
      Pay
    </BrandChip>
  );
};

const KIND_OF: Record<MethodId, MethodKind> = { card: "card", ach: "ach", apple: "apple", google: "google" };

/* ---------------------------------------------------------------- */
/*  Component                                                        */
/* ---------------------------------------------------------------- */
const COLUMNS: TableColumn[] = [
  { key: "method", label: "Payment Method" },
  { key: "description", label: "Description" },
  { key: "status", label: "Status" },
  { key: "action", label: "Action" },
];

type Props = {
  methods: MethodsState;
  onChange: (patch: Partial<MethodsState>) => void;
  onCancel: () => void;
  onSave: () => void;
};

const SupportedMethods = ({ methods, onChange, onCancel, onSave }: Props) => {
  const rows = METHODS.map((m) => ({
    method: (
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex w-10 shrink-0 items-center justify-center">
          {m.id === "card" ? (
            <span className="flex items-center gap-1.5">
              <VisaMark />
              <MastercardMark />
            </span>
          ) : (
            <MethodIcon kind={KIND_OF[m.id]} className="h-6 w-6" />
          )}
        </span>
        <span className="text-sm font-semibold text-heading">{m.name}</span>
      </div>
    ),
    description: <p className="max-w-[360px] text-xs text-body sm:text-sm">{m.description}</p>,
    status: <Tags text="Supported" tone="success" />,
    action: (
      <TogglableSwitch
        id={`method-${m.id}`}
        checked={methods[m.id]}
        onChange={(arg: any) =>
          onChange({ [m.id]: typeof arg === "boolean" ? arg : Boolean(arg?.target?.checked) })
        }
        ariaLabel={`${m.name} enabled`}
      />
    ),
  }));

  return (
    <div className="space-y-4 sm:space-y-5">
      <section className={`${cardCls} sm:p-6`}>
        <h3 className="text-base font-semibold text-heading sm:text-lg">Supported Payment Methods</h3>
        <p className="mb-4 mt-0.5 text-xs text-body sm:text-sm">
          Enable or disable the payment methods you want to offer to patients. These methods are provided by the
          selected payment gateway.
        </p>
        <div className="w-full min-w-0 overflow-hidden rounded-[14px] border border-border bg-card">
          <Table columns={COLUMNS} rows={rows} bordered={false} />
        </div>
      </section>

      <div className="flex items-center justify-end gap-3">
        <ImportButton text="Cancel" icon={null} onClick={onCancel} className="px-5" />
        <AddButton text="Save Changes" icon={null} onClick={onSave} className="px-5" />
      </div>
    </div>
  );
};

export default SupportedMethods;