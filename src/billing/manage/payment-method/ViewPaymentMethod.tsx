"use client";

import React, { useEffect, useState } from "react";
import { CircleDollarSign, FileText, Hash, Power, Receipt, Star, Users } from "lucide-react";

import AddButton from "@/components/Addbutton";
import ImportButton from "@/components/ImportButton";
import Tags from "@/components/Tags";
import CommonRightSection from "@/components/CommonRightSection";
import type { Method } from "./PaymentMethods";

const USED_FOR = [
  { label: "Patient payments", Icon: Users },
  { label: "Invoices", Icon: Receipt },
  { label: "Membership purchases", Icon: CircleDollarSign },
];

type Props = {
  method: Method | null;
  order: number;
  isDefault: boolean;
  onClose: () => void;
  onCloseStart: () => void;
  onToggleActive: (id: string, active: boolean) => void;
  onSetDefault: (id: string) => void;
};

const ViewPaymentMethod = ({
  method,
  order,
  isDefault,
  onClose,
  onCloseStart,
  onToggleActive,
  onSetDefault,
}: Props) => {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (!method) return;
    setClosing(false);
    const frame = requestAnimationFrame(() => setOpen(true));
    return () => cancelAnimationFrame(frame);
  }, [method?.id]);

  const close = () => {
    if (closing) return;
    setClosing(true);
    setOpen(false);
    onCloseStart();
    window.setTimeout(() => {
      onClose();
      setClosing(false);
    }, 300);
  };

  useEffect(() => {
    if (!method) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  if (!method) return null;

  return (
    <CommonRightSection
      label={`${method.name} details`}
      ariaModal
      open={open}
      closing={closing}
      onClose={close}
      panelClassName="2xl:max-w-[460px]"
      header={<h2 className="text-base font-semibold text-heading">Payment Method Details</h2>}
    >
      <div className="min-h-0 flex-1 space-y-6 overflow-y-auto p-4 sm:p-5">
        {/* Summary */}
        <section className="flex items-start gap-3">
          <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${method.iconCls}`}>
            <method.Icon className="h-6 w-6" />
          </span>
          <div className="min-w-0 space-y-1.5">
            <h3 className="font-semibold text-heading">{method.name}</h3>
            <div className="flex flex-wrap items-center gap-2">
              <Tags text={method.active ? "Active" : "Inactive"} tone={method.active ? "success" : "neutral"} />
              {isDefault && <Tags text="Default" tone="info" />}
            </div>
            <p className="text-xs text-body">{method.sub}</p>
          </div>
        </section>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          {isDefault ? (
            <ImportButton text="Default Method" icon={<Star className="h-4 w-4" />} onClick={() => {}} className="w-full" />
          ) : (
            <AddButton text="Set as Default" icon={<Star className="h-4 w-4" />} onClick={() => onSetDefault(method.id)} />
          )}
          <ImportButton
            text={method.active ? "Disable" : "Enable"}
            icon={<Power className="h-4 w-4" />}
            onClick={() => onToggleActive(method.id, !method.active)}
            className="w-full"
          />
        </div>

        {/* Method information */}
        <section>
          <h3 className="mb-3 text-sm font-semibold text-heading">Method Information</h3>
          <div className="grid grid-cols-2 gap-4 rounded-xl border border-border bg-primary/[0.03] p-4">
            <Info icon={FileText} label="Method Name">{method.name}</Info>
            <Info icon={Hash} label="Display Order">{order}</Info>
            <Info icon={CircleDollarSign} label="Transaction Fee">{method.fee}</Info>
            <Info icon={Power} label="Status">
              <Tags text={method.active ? "Active" : "Inactive"} tone={method.active ? "success" : "neutral"} />
            </Info>
            <div className="col-span-2">
              <Info icon={FileText} label="Description">{method.description}</Info>
            </div>
          </div>
        </section>

        {/* Used for */}
        <section>
          <h3 className="mb-3 text-sm font-semibold text-heading">Available For</h3>
          <ul className="space-y-2.5 rounded-xl border border-border p-4">
            {USED_FOR.map(({ label, Icon }) => (
              <li key={label} className="flex items-center gap-3 text-sm text-heading">
                <Icon className="h-4 w-4 text-body" />
                <span className="flex-1">{label}</span>
                <Tags text={method.active ? "Enabled" : "Disabled"} tone={method.active ? "success" : "neutral"} size="xs" />
              </li>
            ))}
          </ul>
        </section>
      </div>
    </CommonRightSection>
  );
};

const Info = ({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ElementType;
  label: string;
  children: React.ReactNode;
}) => (
  <div className="flex items-start gap-2">
    <Icon className="mt-0.5 h-4 w-4 shrink-0 text-body" />
    <div>
      <p className="text-xs text-body">{label}</p>
      <div className="mt-0.5 break-words text-sm font-medium text-heading">{children}</div>
    </div>
  </div>
);

export default ViewPaymentMethod;
