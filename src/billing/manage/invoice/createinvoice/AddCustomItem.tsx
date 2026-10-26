"use client";

import React, { useEffect, useState } from "react";

import ModalShell, {
  ModalDateField,
  ModalRadioGroup,
  ModalTextarea,
  FormGrid,
  FullRow,
  ReqLabel,
  OptLabel,
} from "@/components/Modalshell";
import SignupField from "@/components/SignupField";
import SignupDropdown from "@/components/SignupDropdown";

import RecurringSchedule, { DEFAULT_SCHEDULE, type RecurringScheduleValue } from "./RecurringSchedule";

/* ---------- Types + helpers (shared with CreateInvoice) ---------- */
export type ItemType = "one-time" | "recurring";

export type InvoiceItem = {
  id: string;
  service: string;
  cpt: string;
  description: string;
  qty: number;
  unitPrice: number;
  taxRate: number; // percent, e.g. 5
  serviceDate: string; // ISO
  notes: string;
  type: ItemType;
  schedule?: RecurringScheduleValue;
};

export const money = (n: number) => `$${n.toFixed(2)}`;
export const itemAmount = (i: InvoiceItem) => i.qty * i.unitPrice;
export const itemTax = (i: InvoiceItem) => (itemAmount(i) * i.taxRate) / 100;

const TAX_OPTIONS = [
  { value: "0", label: "No Tax (0%)" },
  { value: "5", label: "Tax (5%)" },
  { value: "10", label: "Tax (10%)" },
  { value: "18", label: "Tax (18%)" },
];

const TYPE_OPTIONS = [
  { value: "one-time", label: "One-time Charge" },
  { value: "recurring", label: "Recurring Charge" },
];

const NOTES_MAX = 300;

type Errors = { description?: string; qty?: string; unitPrice?: string };

type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (item: InvoiceItem) => void;
  /** Item being edited (null = add new) */
  item?: InvoiceItem | null;
  /** Pre-fills the service date for new items */
  defaultDate?: string;
};

/* ---------- Component ---------- */
const AddCustomItem = ({ open, onClose, onSave, item = null, defaultDate = "" }: Props) => {
  const [type, setType] = useState<ItemType>("one-time");
  const [description, setDescription] = useState("");
  const [serviceDate, setServiceDate] = useState(defaultDate);
  const [qty, setQty] = useState("1");
  const [unitPrice, setUnitPrice] = useState("");
  const [taxRate, setTaxRate] = useState("0");
  const [notes, setNotes] = useState("");
  const [schedule, setSchedule] = useState<RecurringScheduleValue>(DEFAULT_SCHEDULE);
  const [errors, setErrors] = useState<Errors>({});

  /* Reset / prefill each time the modal opens */
  useEffect(() => {
    if (!open) return;
    setType(item?.type ?? "one-time");
    setDescription(item?.description ?? "");
    setServiceDate(item?.serviceDate ?? defaultDate);
    setQty(String(item?.qty ?? 1));
    setUnitPrice(item ? String(item.unitPrice) : "");
    setTaxRate(String(item?.taxRate ?? 0));
    setNotes(item?.notes ?? "");
    setSchedule(item?.schedule ?? DEFAULT_SCHEDULE);
    setErrors({});
  }, [open, item, defaultDate]);

  const totalAmount = (Number(qty) || 0) * (Number(unitPrice) || 0);
  const isRecurring = type === "recurring";

  const handleSubmit = () => {
    const next: Errors = {};
    if (!description.trim()) next.description = "Description is required";
    if (!(Number(qty) >= 1)) next.qty = "Min 1";
    if (!(Number(unitPrice) > 0)) next.unitPrice = "Enter a price";
    setErrors(next);
    if (Object.keys(next).length) return;

    onSave({
      id: item?.id ?? "",
      service: item?.service ?? "Custom Item",
      cpt: item?.cpt ?? "",
      description: description.trim(),
      qty: Number(qty),
      unitPrice: Number(unitPrice),
      taxRate: Number(taxRate),
      serviceDate,
      notes: notes.trim(),
      type,
      schedule: isRecurring ? schedule : undefined,
    });
  };

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      onSubmit={handleSubmit}
      title={item ? "Edit Custom Item" : "Add Custom Item"}
      titleId="add-custom-item-title"
      subtitle={`Add a ${isRecurring ? "recurring" : "custom"} charge for services, products or other fees.`}
      submitText={item ? "Save Item" : "Add Item"}
      width={720}
    >
      <FormGrid>
        <FullRow>
          <ModalRadioGroup
            name="itemType"
            label={<ReqLabel>Item Type</ReqLabel>}
            value={type}
            onChange={(v) => setType(v as ItemType)}
            options={TYPE_OPTIONS}
            className="gap-x-8"
          />
        </FullRow>

        {/* Description (+ service date on the right when recurring) */}
        <div className={isRecurring ? "" : "sm:col-span-2"}>
          <SignupField
            name="itemDescription"
            label={<ReqLabel>Description</ReqLabel>}
            placeholder={isRecurring ? "Monthly Care Management Fee" : "e.g. Consultation Fee, Medication, Lab Test, etc."}
            value={description}
            error={errors.description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div>
          <ModalDateField
            id="item-service-date"
            label={<ReqLabel>{isRecurring ? "Service/Start Date" : "Service Date"}</ReqLabel>}
            value={serviceDate}
            onChange={setServiceDate}
          />
        </div>

        <SignupField
          name="itemQty"
          type="number"
          label={<ReqLabel>Quantity</ReqLabel>}
          placeholder="1"
          value={qty}
          error={errors.qty}
          onChange={(e) => setQty(e.target.value)}
        />

        <SignupField
          name="itemUnitPrice"
          type="number"
          label={<ReqLabel>Unit Price ($)</ReqLabel>}
          placeholder="0.00"
          value={unitPrice}
          error={errors.unitPrice}
          onChange={(e) => setUnitPrice(e.target.value)}
        />

        <SignupDropdown
          name="itemTax"
          label="Tax"
          value={taxRate}
          onChange={setTaxRate}
          options={TAX_OPTIONS}
        />

        {!isRecurring && (
          <div className="w-full">
            <p className="mb-2 text-sm font-medium text-label">Total Amount</p>
            <div className="flex h-12 items-center rounded-xl border border-border bg-primary/[0.06] px-4 text-sm font-medium text-heading">
              {money(totalAmount)}
            </div>
          </div>
        )}

        {isRecurring && (
          <FullRow>
            <RecurringSchedule value={schedule} onChange={setSchedule} />
          </FullRow>
        )}

        <FullRow>
          <ModalTextarea
            id="item-notes"
            label={<OptLabel>Notes</OptLabel>}
            placeholder="Add any notes for this item..."
            value={notes}
            onChange={setNotes}
            maxLength={NOTES_MAX}
          />
        </FullRow>
      </FormGrid>
    </ModalShell>
  );
};

export default AddCustomItem;