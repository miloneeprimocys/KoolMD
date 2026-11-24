"use client";

import React, { useEffect, useState } from "react";
import { ClipboardList, FileText, Paperclip } from "lucide-react";

import AddButton from "@/components/Addbutton";
import ImportButton from "@/components/ImportButton";

import ModalShell, { AttachmentField, ModalDateField, ModalRadioGroup, ModalSection, ModalTextarea, OptLabel, ReqLabel, SignupDropdown, SignupField, todayISO, toOptions, addDays, toAttachments, uid } from "@/components/Modalshell";
import type { OtherOrder } from "./OtherOrdersTab";

const CURRENT_LOCATION = "Main Clinic – Cardiology";

const CURRENT_PROVIDER = "Dr. Sarah Miller";

const CATEGORIES = toOptions(["Admission", "Respiratory", "Monitoring", "Nutrition", "Nursing", "Equipment", "Cardiology", "Other"]);
const STATUSES = toOptions(["Active", "Completed", "Cancelled"]);
const PRIORITIES = toOptions(["Routine", "Urgent", "Stat"]);
const ORDER_TYPES = [{ value: "single", label: "Single Order" }, { value: "set", label: "Order Set (Multiple Orders)" }];

type Errors = Partial<Record<"name" | "category" | "status", string>>;
type Props = { open: boolean; onClose: () => void; onAdd: (o: OtherOrder) => void };

const AddOtherOrderModal = ({ open, onClose, onAdd }: Props) => {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [orderType, setOrderType] = useState("single");
  const [status, setStatus] = useState("Active");
  const [desc, setDesc] = useState("");
  const [priority, setPriority] = useState("Routine");
  const [date, setDate] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Errors>({});

  useEffect(() => {
    if (!open) return;
    setName(""); setCategory(""); setOrderType("single"); setStatus("Active"); setDesc("");
    setPriority("Routine"); setDate(addDays(todayISO(), 2)); setFile(null); setErrors({});
  }, [open]);

  const clear = (k: keyof Errors) => setErrors((p) => ({ ...p, [k]: undefined }));

  const submit = () => {
    const e: Errors = {};
    if (!name.trim()) e.name = "Order name is required";
    if (!category) e.category = "Category is required";
    if (!status) e.status = "Status is required";
    setErrors(e);
    if (Object.keys(e).length) return;
    onAdd({
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      name: name.trim(),
      category,
      date: date || todayISO(),
      status,
      orderedBy: CURRENT_PROVIDER,
      location: CURRENT_LOCATION,
      details: desc.trim(),
      attachments: toAttachments([file]),
    });
  };

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title="Add Order"
      width={720}
      zIndexClass="z-[350]"
      footer={
        <div className="flex items-center justify-center gap-3 sm:justify-end">
          <ImportButton text="Cancel" icon={null} onClick={onClose} />
          <AddButton text="Add Order" icon={null} onClick={submit} className="whitespace-nowrap" />
        </div>
      }
    >
      <ModalSection icon={<FileText className="h-4 w-4" />} title="Order Information">
        <div className="grid gap-x-4 gap-y-3 sm:grid-cols-2">
          <SignupField name="orderName" label={<ReqLabel>Order Name</ReqLabel>} placeholder="e.g., Cardiac Stress Test" value={name} onChange={(e) => { setName(e.target.value); clear("name"); }} error={errors.name} />
          <SignupDropdown name="orderCategory" label={<ReqLabel>Category</ReqLabel>} placeholder="Select category" options={CATEGORIES} value={category} onChange={(v) => { setCategory(v); clear("category"); }} error={errors.category} portalMenu portalMenuZIndex={1000} />
          <ModalRadioGroup name="orderType" label={<ReqLabel>Order Type</ReqLabel>} value={orderType} onChange={setOrderType} options={ORDER_TYPES} className="flex-col gap-2" />
          <SignupDropdown name="orderStatus" label={<ReqLabel>Status</ReqLabel>} placeholder="Select status" options={STATUSES} value={status} onChange={(v) => { setStatus(v); clear("status"); }} error={errors.status} searchable={false} portalMenu portalMenuZIndex={1000} />
        </div>
      </ModalSection>

      <ModalSection icon={<ClipboardList className="h-4 w-4" />} title="Order Details">
        <div className="space-y-3">
          <ModalTextarea id="other-order-desc" label="Order Description / Instructions" value={desc} onChange={setDesc} placeholder="Describe the order..." />
          <div className="grid gap-x-4 gap-y-3 sm:grid-cols-2">
            <SignupDropdown name="orderPriority" label="Priority" placeholder="Select priority" options={PRIORITIES} value={priority} onChange={setPriority} searchable={false} portalMenu portalMenuZIndex={1000} />
            <ModalDateField id="other-order-date" label={<OptLabel>Expected Date</OptLabel>} value={date} onChange={setDate} min={todayISO()} />
          </div>
        </div>
      </ModalSection>

      <ModalSection icon={<Paperclip className="h-4 w-4" />} title="Attachments">
        <AttachmentField title="Drag & drop files here, or click to browse" file={file} onChange={setFile} maxSizeMB={10} />
      </ModalSection>
    </ModalShell>
  );
};

export default AddOtherOrderModal;