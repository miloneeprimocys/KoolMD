"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

import Breadcrumb from "@/components/Breadcrumb";
import AddButton from "@/components/Addbutton";
import ImportButton from "@/components/ImportButton";
import Table from "@/components/Table";
import TableStatus from "@/components/TableStatus";
import { type TableColumn } from "@/components/Tableheader";
import Content from "@/components/Content";
import Tags from "@/components/Tags";
import Actions from "@/components/Actions";
import SignupField from "@/components/SignupField";
import SignupDropdown from "@/components/SignupDropdown";
import {
  ModalCheckboxGroup,
  ModalDateField,
  ModalTextarea,
  ReqLabel,
  toOptions,
} from "@/components/Modalshell";

import { itemAmount, itemTax, money, type InvoiceItem } from "./AddCustomItem";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppHooks";
import {
  clearCustomInvoiceItemDeletedId,
  clearCustomInvoiceItemResult,
  showAddCustomInvoiceItem,
  showDeleteCustomInvoiceItem,
} from "@/redux/slices/dialogslice";

const LIST_ROUTE = "/manage/invoice";

/* ---------- Static data (replace with API data later) ---------- */
type PatientInfo = { id: string; name: string; dob: string; phone: string; insurance: string; memberId: string };
type EncounterInfo = { id: string; date: string; provider: string; visitType: string };

const PATIENTS: PatientInfo[] = [
  { id: "PT-001", name: "John Doe", dob: "Jan 15, 1985", phone: "+1 555 123 4567", insurance: "Aetna PPO", memberId: "AET123456789" },
  { id: "PT-002", name: "Emma Wilson", dob: "Mar 02, 1990", phone: "+1 555 987 6543", insurance: "Cigna HMO", memberId: "CIG987654321" },
];

const ENCOUNTERS: Record<string, EncounterInfo[]> = {
  "PT-001": [
    { id: "ENC-001", date: "Oct 20, 2026", provider: "Dr. Sarah Wilson", visitType: "Office Visit" },
    { id: "ENC-002", date: "Oct 12, 2026", provider: "Dr. Mark Lee", visitType: "Follow-up" },
  ],
  "PT-002": [{ id: "ENC-003", date: "Oct 18, 2026", provider: "Dr. Sarah Wilson", visitType: "Telemedicine" }],
};

const PAYMENT_TERMS: Record<string, number> = {
  "Due on receipt": 0,
  "Due in 7 days": 7,
  "Due in 15 days": 15,
  "Due in 30 days": 30,
};

const STATUS_OPTIONS = ["Pending", "Draft", "Paid"];
const DISCOUNT_TYPES = [
  { value: "%", label: "%" },
  { value: "$", label: "$" },
];
const SEND_OPTIONS = [
  { value: "email", label: "Patient Email" },
  { value: "portal", label: "Patient Portal" },
  { value: "none", label: "Do not send" },
];

const INITIAL_ITEMS: InvoiceItem[] = [
  { id: "i1", service: "Office Visit - Established Patient", cpt: "99213", description: "Established patient office visit with moderate complexity", qty: 1, unitPrice: 150, taxRate: 0, serviceDate: "2026-10-20", notes: "", type: "one-time" },
  { id: "i2", service: "X-Ray", cpt: "71045", description: "Chest X-Ray", qty: 1, unitPrice: 100, taxRate: 0, serviceDate: "2026-10-20", notes: "", type: "one-time" },
  { id: "i3", service: "Blood Test - CBC", cpt: "85025", description: "Complete blood count", qty: 1, unitPrice: 75, taxRate: 0, serviceDate: "2026-10-20", notes: "", type: "one-time" },
];

const addDays = (iso: string, days: number) => {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + days);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const COLUMNS: TableColumn[] = [
  { key: "no", label: "#" },
  { key: "service", label: "Service / Item" },
  { key: "cpt", label: "CPT Code" },
  { key: "description", label: "Description" },
  { key: "qty", label: "Qty" },
  { key: "price", label: "Unit Price" },
  { key: "amount", label: "Amount" },
  {
    key: "actions",
    label: "Actions",
    header: <div className="flex w-full items-center justify-center">Actions</div>,
  },
];

/* ---------- Component ---------- */
const CreateInvoice = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const idSeed = React.useRef(100);
  const handledCustomItemResult = React.useRef<InvoiceItem | null>(null);
  const handledDeletedCustomItemId = React.useRef<string | null>(null);
  const customItemResult = useAppSelector((state) => state.dialog.customInvoiceItemResult);
  const deletedCustomItemId = useAppSelector((state) => state.dialog.customInvoiceItemDeletedId);

  const [patientId, setPatientId] = useState(PATIENTS[0].id);
  const [encounterId, setEncounterId] = useState(ENCOUNTERS[PATIENTS[0].id][0].id);
  const [invoiceDate, setInvoiceDate] = useState("2026-10-20");
  const [terms, setTerms] = useState("Due in 7 days");
  const [dueDate, setDueDate] = useState("2026-10-27");

  const [items, setItems] = useState<InvoiceItem[]>(INITIAL_ITEMS);

  const [discountType, setDiscountType] = useState("%");
  const [discountValue, setDiscountValue] = useState("0");

  const [notes, setNotes] = useState("");
  const [internalNotes, setInternalNotes] = useState("");
  const [status, setStatus] = useState("Pending");
  const [sendTo, setSendTo] = useState<string[]>(["email"]);

  const patient = PATIENTS.find((p) => p.id === patientId) ?? PATIENTS[0];
  const encounters = ENCOUNTERS[patientId] ?? [];
  const encounter = encounters.find((e) => e.id === encounterId) ?? encounters[0];

  /* ---------- Totals ---------- */
  const { subtotal, tax, discount, total } = useMemo(() => {
    const sub = items.reduce((sum, i) => sum + itemAmount(i), 0);
    const taxTotal = items.reduce((sum, i) => sum + itemTax(i), 0);
    const raw = Number(discountValue) || 0;
    const disc = Math.min(discountType === "%" ? (sub * raw) / 100 : raw, sub);
    return { subtotal: sub, tax: taxTotal, discount: disc, total: sub - disc + taxTotal };
  }, [items, discountType, discountValue]);

  /* ---------- Handlers ---------- */
  const handlePatientChange = (id: string) => {
    setPatientId(id);
    setEncounterId((ENCOUNTERS[id] ?? [])[0]?.id ?? "");
  };

  const applyTerms = (nextTerms: string, from = invoiceDate) => {
    setTerms(nextTerms);
    setDueDate(addDays(from, PAYMENT_TERMS[nextTerms] ?? 0));
  };

  useEffect(() => {
    if (!customItemResult || handledCustomItemResult.current === customItemResult) return;
    handledCustomItemResult.current = customItemResult;
    setItems((prev) => {
      if (customItemResult.id && prev.some((item) => item.id === customItemResult.id)) {
        return prev.map((item) => item.id === customItemResult.id ? { ...customItemResult, id: item.id } : item);
      }
      return [...prev, { ...customItemResult, id: customItemResult.id || `i${idSeed.current++}` }];
    });
    dispatch(clearCustomInvoiceItemResult());
  }, [customItemResult, dispatch]);

  useEffect(() => {
    if (!deletedCustomItemId || handledDeletedCustomItemId.current === deletedCustomItemId) return;
    handledDeletedCustomItemId.current = deletedCustomItemId;
    setItems((prev) => prev.filter((item) => item.id !== deletedCustomItemId));
    dispatch(clearCustomInvoiceItemDeletedId());
  }, [deletedCustomItemId, dispatch]);

  const handleSaveInvoice = () => {
    console.log("save invoice", {
      patientId, encounterId, invoiceDate, dueDate, terms, items,
      discountType, discountValue, notes, internalNotes, status, sendTo, total,
    }); // TODO: call your API here
    router.push(LIST_ROUTE);
  };

  /* ---------- Table rows ---------- */
  const rows = items.map((item, index) => ({
    no: <Content title={String(index + 1)} />,
    service: (
      <div className="flex items-center gap-2">
        <Content title={item.service} />
        {item.type === "recurring" && <Tags text="Recurring" tone="violet" size="xs" />}
      </div>
    ),
    cpt: <Content title={item.cpt || "—"} />,
    description: <Content title={item.description} truncate className="max-w-[260px]" />,
    qty: <Content title={String(item.qty)} />,
    price: <Content title={money(item.unitPrice)} />,
    amount: <span className="whitespace-nowrap text-sm font-semibold text-heading">{money(itemAmount(item))}</span>,
    actions: (
      <div className="flex w-full items-center justify-center">
        <Actions
          actions={["edit", "delete"]}
          onAction={(action) => {
            if (action === "edit") {
              dispatch(showAddCustomInvoiceItem({ item, defaultDate: invoiceDate }));
            } else if (action === "delete") {
              dispatch(showDeleteCustomInvoiceItem(item));
            }
          }}
        />
      </div>
    ),
  }));

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-4 sm:space-y-5">
      <Breadcrumb
        items={[
          { label: "Billing", href: "/payment/payment-gateway" },
          { label: "Invoices", href: LIST_ROUTE },
          { label: "Create Invoice" },
        ]}
      />

      {/* Title + actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-heading sm:text-xl 2xl:text-2xl">Create Invoice</h2>
          <p className="mt-0.5 text-sm text-body">Create a new invoice for membership, services or other charges.</p>
        </div>
        <div className="flex items-center gap-3">
          <ImportButton text="Cancel" icon={null} onClick={() => router.push(LIST_ROUTE)} />
          <AddButton text="Save Invoice" icon={null} onClick={handleSaveInvoice} className="whitespace-nowrap" />
        </div>
      </div>

      {/* ================= Patient & Encounter ================= */}
      <section className="rounded-[14px] border border-border bg-card p-4 sm:p-6">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_320px]">
          <div className="min-w-0 space-y-3">
            <h3 className="text-base font-semibold text-heading">Patient &amp; Encounter</h3>
            <SignupDropdown
              name="patient"
              label={<ReqLabel>Patient</ReqLabel>}
              value={patientId}
              onChange={handlePatientChange}
              options={PATIENTS.map((p) => ({ value: p.id, label: `${p.name} (${p.id})` }))}
            />
            <div className="rounded-xl bg-primary/[0.06] p-3 text-xs text-body">
              <p>
                DOB: <span className="font-medium text-heading">{patient.dob}</span> &nbsp;|&nbsp; Phone:{" "}
                <span className="font-medium text-heading">{patient.phone}</span>
              </p>
              <p className="mt-1">
                Insurance: <span className="font-medium text-heading">{patient.insurance}</span> &nbsp;|&nbsp; Member ID:{" "}
                <span className="font-medium text-heading">{patient.memberId}</span>
              </p>
            </div>
          </div>

          <div className="min-w-0 space-y-3 xl:pt-[2.1rem]">
            <SignupDropdown
              name="encounter"
              label={<ReqLabel>Encounter</ReqLabel>}
              value={encounter?.id ?? ""}
              onChange={setEncounterId}
              options={encounters.map((e) => ({ value: e.id, label: `${e.id} (${e.date})` }))}
            />
            {encounter && (
              <div className="rounded-xl bg-primary/[0.06] p-3 text-xs text-body">
                <p>Date: <span className="font-medium text-heading">{encounter.date}</span></p>
                <p className="mt-1">Provider: <span className="font-medium text-heading">{encounter.provider}</span></p>
                <p className="mt-1">Visit Type: <span className="font-medium text-heading">{encounter.visitType}</span></p>
              </div>
            )}
          </div>

          <div className="min-w-0 space-y-3 xl:border-l xl:border-border xl:pl-6">
            <ModalDateField
              id="invoice-date"
              label={<ReqLabel>Invoice Date</ReqLabel>}
              value={invoiceDate}
              onChange={(v) => {
                setInvoiceDate(v);
                setDueDate(addDays(v, PAYMENT_TERMS[terms] ?? 0));
              }}
            />
            <ModalDateField
              id="due-date"
              label={<ReqLabel>Due Date</ReqLabel>}
              value={dueDate}
              min={invoiceDate}
              onChange={setDueDate}
            />
            <SignupDropdown
              name="paymentTerms"
              label="Payment Terms"
              value={terms}
              onChange={(v: string) => applyTerms(v)}
              options={toOptions(Object.keys(PAYMENT_TERMS))}
            />
          </div>
        </div>
      </section>

      {/* ================= Items + Summary ================= */}
      <div className="grid items-start gap-4 sm:gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <section className="min-w-0 rounded-[14px] border border-border bg-card">
          <div className="flex items-center justify-between px-4 py-4 sm:px-6">
            <h3 className="text-base font-semibold text-heading">Invoice Items</h3>
            <ImportButton
              text="Add Item"
              icon={<Plus className="h-4 w-4" />}
              onClick={() => dispatch(showAddCustomInvoiceItem({ defaultDate: invoiceDate }))}
              className="w-fit whitespace-nowrap text-primary"
            />
          </div>
          {items.length === 0 ? (
            <TableStatus variant="empty" message="No items added yet." />
          ) : (
            <Table columns={COLUMNS} rows={rows} bordered={false} />
          )}
        </section>

        <section className="min-w-0 rounded-[14px] border border-border bg-card p-4 sm:p-6 xl:sticky xl:top-4">
          <h3 className="text-base font-semibold text-heading">Invoice Summary</h3>

          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-body">Subtotal</dt>
              <dd className="font-medium text-heading">{money(subtotal)}</dd>
            </div>

            <div>
              <dt className="mb-2 text-body">Discount</dt>
              <dd className="grid grid-cols-[84px_minmax(0,1fr)_auto] items-center gap-2">
                <SignupDropdown
                  name="discountType"
                  value={discountType}
                  onChange={setDiscountType}
                  options={DISCOUNT_TYPES}
                />
                <SignupField
                  name="discountValue"
                  type="number"
                  placeholder="0.00"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                />
                <span className="min-w-[56px] text-right font-medium text-heading">-{money(discount)}</span>
              </dd>
            </div>

            {tax > 0 && (
              <div className="flex items-center justify-between">
                <dt className="text-body">Tax</dt>
                <dd className="font-medium text-heading">{money(tax)}</dd>
              </div>
            )}
          </dl>

          <div className="mt-4 flex items-center justify-between border-t border-divider pt-4">
            <span className="text-base font-semibold text-heading">Total</span>
            <span className="text-lg font-bold text-heading">{money(total)}</span>
          </div>
        </section>
      </div>

      {/* ================= Additional Information ================= */}
      <section className="rounded-[14px] border border-border bg-card p-4 sm:p-6">
        <h3 className="text-base font-semibold text-heading">Additional Information</h3>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <ModalTextarea
            id="invoice-notes"
            label="Notes"
            placeholder="Add notes for this invoice (optional)"
            value={notes}
            onChange={setNotes}
            maxLength={500}
          />
          <ModalTextarea
            id="invoice-internal-notes"
            label="Internal Notes (optional)"
            placeholder="Visible to staff only"
            value={internalNotes}
            onChange={setInternalNotes}
            maxLength={500}
          />

          <SignupDropdown
            name="invoiceStatus"
            label="Invoice Status"
            value={status}
            onChange={setStatus}
            options={toOptions(STATUS_OPTIONS)}
          />
          <ModalCheckboxGroup
            label="Send Invoice To"
            value={sendTo}
            onChange={setSendTo}
            options={SEND_OPTIONS}
            className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-3"
          />
        </div>
      </section>

    </div>
  );
};

export default CreateInvoice;
