"use client";

import React, { useEffect, useState } from "react";
import { CalendarClock, FileText, Paperclip, Stethoscope } from "lucide-react";

import AddButton from "@/components/Addbutton";
import ImportButton from "@/components/ImportButton";
import TimePicker from "@/components/Timepicker";

import ModalShell, { AttachmentField, ModalDateField, ModalSection, ModalTextarea, OptLabel, ReqLabel, SignupDropdown, SignupField, todayISO, toOptions, fmtDate, toAttachments, uid } from "@/components/Modalshell";
import type { Procedure } from "@/provider-panel/appointments/consulting/ProceduresTab";

const CURRENT_LOCATION = "Main Clinic – Cardiology";

const CURRENT_PROVIDER = "Dr. Sarah Miller";

const CATEGORIES = toOptions(["Cardiology", "Gastroenterology", "Orthopedics", "Dermatology", "Pulmonology", "General"]);
const STATUSES = toOptions(["Scheduled", "Completed", "Cancelled"]);
const LOCATIONS = toOptions([CURRENT_LOCATION, "Main Clinic – Radiology", "Day Surgery Center"]);

type Errors = Partial<Record<"name" | "code" | "category" | "status" | "date" | "location", string>>;
type Props = { open: boolean; onClose: () => void; onAdd: (p: Procedure) => void };

const AddProcedureModal = ({ open, onClose, onAdd }: Props) => {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("Scheduled");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("10:00");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [indication, setIndication] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Errors>({});

  useEffect(() => {
    if (!open) return;
    setName(""); setCode(""); setCategory(""); setStatus("Scheduled"); setDate(todayISO()); setTime("10:00");
    setLocation(""); setNotes(""); setIndication(""); setFile(null); setErrors({});
  }, [open]);

  const clear = (k: keyof Errors) => setErrors((p) => ({ ...p, [k]: undefined }));

  const submit = () => {
    const e: Errors = {};
    if (!name.trim()) e.name = "Procedure name is required";
    if (!code.trim()) e.code = "Procedure code is required";
    if (!category) e.category = "Category is required";
    if (!status) e.status = "Status is required";
    if (!date) e.date = "Date is required";
    if (!location) e.location = "Location is required";
    setErrors(e);
    if (Object.keys(e).length) return;
    onAdd({
      id: uid("PRC"),
      name: name.trim(),
      code: code.trim(),
      date,
      status,
      provider: CURRENT_PROVIDER,
      location,
      outcome: "—",
      notes: [notes.trim(), indication.trim() && `Indication: ${indication.trim()}`].filter(Boolean).join("\n") || `Scheduled for ${fmtDate(date)} at ${time}.`,
      attachments: toAttachments([file]),
    });
  };

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title="Add Procedure"
      width={780}
      zIndexClass="z-[350]"
      footer={
        <div className="flex items-center justify-center gap-3 sm:justify-end">
          <ImportButton text="Cancel" icon={null} onClick={onClose} />
          <AddButton text="Add Procedure" icon={null} onClick={submit} className="whitespace-nowrap" />
        </div>
      }
    >
      <ModalSection icon={<FileText className="h-4 w-4" />} title="Procedure Information">
        <div className="grid gap-x-4 gap-y-3 sm:grid-cols-2">
          <SignupField name="procName" label={<ReqLabel>Procedure Name</ReqLabel>} placeholder="e.g., Echocardiogram" value={name} onChange={(e) => { setName(e.target.value); clear("name"); }} error={errors.name} />
          <SignupField name="procCode" label={<ReqLabel>Procedure Code (CPT/HCPCS)</ReqLabel>} placeholder="e.g., 93306" value={code} onChange={(e) => { setCode(e.target.value); clear("code"); }} error={errors.code} />
          <SignupDropdown name="procCategory" label={<ReqLabel>Procedure Category</ReqLabel>} placeholder="Select category" options={CATEGORIES} value={category} onChange={(v) => { setCategory(v); clear("category"); }} error={errors.category} portalMenu portalMenuZIndex={1000} />
          <SignupDropdown name="procStatus" label={<ReqLabel>Status</ReqLabel>} placeholder="Select status" options={STATUSES} value={status} onChange={(v) => { setStatus(v); clear("status"); }} error={errors.status} searchable={false} portalMenu portalMenuZIndex={1000} />
        </div>
      </ModalSection>

      <ModalSection icon={<CalendarClock className="h-4 w-4" />} title="Scheduling">
        <div className="grid gap-x-4 gap-y-3 sm:grid-cols-2">
          <div className="grid grid-cols-[minmax(0,1fr)_120px] gap-3">
            <ModalDateField id="proc-date" label={<ReqLabel>Date &amp; Time</ReqLabel>} value={date} onChange={(v) => { setDate(v); clear("date"); }} error={errors.date} />
            <TimePicker name="procTime" label={<span className="sr-only">Time</span>} value={time} onChange={setTime} portalZIndex={1000} mobilePortalZIndex={1000} />
          </div>
          <SignupDropdown name="procLocation" label={<ReqLabel>Location</ReqLabel>} placeholder="Select location" options={LOCATIONS} value={location} onChange={(v) => { setLocation(v); clear("location"); }} error={errors.location} portalMenu portalMenuZIndex={1000} />
        </div>
      </ModalSection>

      <ModalSection icon={<Stethoscope className="h-4 w-4" />} title="Clinical Details">
        <div className="space-y-3">
          <ModalTextarea id="proc-notes" label="Procedure Notes" value={notes} onChange={setNotes} placeholder="Describe the procedure..." />
          <ModalTextarea id="proc-indication" label={<OptLabel>Indication / Reason</OptLabel>} value={indication} onChange={setIndication} placeholder="Why is this procedure needed?" />
        </div>
      </ModalSection>

      <ModalSection icon={<Paperclip className="h-4 w-4" />} title="Attachments">
        <AttachmentField title="Drag & drop files here, or click to browse" file={file} onChange={setFile} maxSizeMB={10} />
      </ModalSection>
    </ModalShell>
  );
};

export default AddProcedureModal;
