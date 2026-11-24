"use client";

import React, { useEffect, useRef, useState } from "react";
import { Calendar, HeartPulse, Paperclip, Plus, Send, User, X } from "lucide-react";

import AddButton from "@/components/Addbutton";
import ImportButton from "@/components/ImportButton";
import RadioCheckButtonh from "@/components/RadioCheckButtonh";

import ModalShell, { ModalDateField, ModalTextarea, ReqLabel, SignupDropdown, toOptions, todayISO, FieldLabel, Panel, PriorityToggle, addDays, fmtDate, toAttachments, uid, type Priority } from "@/components/Modalshell";
import type { Referral } from "@/provider-panel/appointments/consulting/ReferralsTab";

const PATIENT_CONTEXT = {
  name: "Emily Carter",
  mrn: "KM-002487",
  dob: "Mar 15, 1994 (32 yrs)",
  conditions: ["Migraine"],
  medications: ["Sumatriptan 50 mg"],
  allergies: [] as string[],
};

const DOCTORS: Record<string, string> = {
  "Dr. James Carter": "Cardiology",
  "Dr. Emily Rogers": "Endocrinology",
  "Dr. Michael Lee": "Orthopedics",
  "Dr. Priya Singh": "Dermatology",
  "Dr. Daniel Kim": "Gastroenterology",
};
const DOCTOR_OPTIONS = toOptions(Object.keys(DOCTORS));
const SPECIALTY_OPTIONS = toOptions(Array.from(new Set(Object.values(DOCTORS))));
const REASONS = toOptions(["Evaluate persistent chest pain", "Diabetes management and follow-up", "Chronic knee pain evaluation", "Skin rash – further evaluation", "Ongoing abdominal discomfort", "Second opinion"]);
const FOLLOW_TYPES = toOptions(["In-person", "Video", "Phone"]);

type Errors = Partial<Record<"doctor" | "specialty" | "reason" | "notes", string>>;
type Props = { open: boolean; onClose: () => void; onSave: (r: Referral) => void };

const CreateReferralModal = ({ open, onClose, onSave }: Props) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [doctor, setDoctor] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [reason, setReason] = useState("");
  const [priority, setPriority] = useState<Priority>("Routine");
  const [notes, setNotes] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [followUp, setFollowUp] = useState(false);
  const [followDate, setFollowDate] = useState("");
  const [followType, setFollowType] = useState("In-person");
  const [errors, setErrors] = useState<Errors>({});

  useEffect(() => {
    if (!open) return;
    setDoctor(""); setSpecialty(""); setReason(""); setPriority("Routine"); setNotes(""); setFiles([]);
    setFollowUp(false); setFollowDate(addDays(todayISO(), 7)); setFollowType("In-person"); setErrors({});
  }, [open]);

  const clear = (k: keyof Errors) => setErrors((p) => ({ ...p, [k]: undefined }));

  const save = (status: "Sent" | "Draft") => {
    if (status === "Sent") {
      const e: Errors = {};
      if (!doctor) e.doctor = "Select a provider";
      if (!specialty) e.specialty = "Specialty is required";
      if (!reason) e.reason = "Referral reason is required";
      if (!notes.trim()) e.notes = "Clinical notes are required";
      setErrors(e);
      if (Object.keys(e).length) return;
    }
    onSave({
      id: uid("REF"),
      doctor: doctor || "—",
      specialty: specialty || "—",
      reason: reason || "—",
      status,
      date: todayISO(),
      appointment: followUp ? `Follow-up on ${fmtDate(followDate)} (${followType})` : undefined,
      notes: notes.trim(),
      attachments: toAttachments(files),
    });
  };

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title="Create Referral"
      width={1000}
      zIndexClass="z-[350]"
      footer={
        <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-end">
          <ImportButton text="Cancel" icon={null} onClick={onClose} />
          <ImportButton text="Save as Draft" icon={null} onClick={() => save("Draft")} className="whitespace-nowrap" />
          <AddButton text="Send Referral" icon={<Send className="h-4 w-4" />} onClick={() => save("Sent")} className="whitespace-nowrap" />
        </div>
      }
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-3">
          <h4 className="flex items-center gap-2 text-sm font-semibold text-heading"><User className="h-4 w-4 text-primary" />Referral Details</h4>
          <div className="grid gap-x-4 gap-y-3 sm:grid-cols-2">
            <SignupDropdown name="referralTo" label={<ReqLabel>Referral To</ReqLabel>} placeholder="Search provider" options={DOCTOR_OPTIONS} value={doctor} onChange={(v) => { setDoctor(v); setSpecialty(DOCTORS[v] ?? ""); clear("doctor"); clear("specialty"); }} error={errors.doctor} portalMenu portalMenuZIndex={1000} />
            <SignupDropdown name="specialty" label={<ReqLabel>Specialty</ReqLabel>} placeholder="Select specialty" options={SPECIALTY_OPTIONS} value={specialty} onChange={(v) => { setSpecialty(v); clear("specialty"); }} error={errors.specialty} portalMenu portalMenuZIndex={1000} />
            <SignupDropdown name="reason" label={<ReqLabel>Referral Reason</ReqLabel>} placeholder="Select reason" options={REASONS} value={reason} onChange={(v) => { setReason(v); clear("reason"); }} error={errors.reason} portalMenu portalMenuZIndex={1000} />
            <div>
              <FieldLabel><ReqLabel>Priority</ReqLabel></FieldLabel>
              <PriorityToggle value={priority} onChange={setPriority} />
            </div>
          </div>
          <ModalTextarea id="referral-notes" label={<ReqLabel>Clinical Notes</ReqLabel>} value={notes} onChange={(v) => { setNotes(v); clear("notes"); }} placeholder="Describe the clinical reason for this referral..." error={errors.notes} />

          <Panel className="space-y-2 bg-primary/5">
            <div className="flex items-center justify-between gap-2">
              <h4 className="flex items-center gap-2 text-sm font-semibold text-heading"><Paperclip className="h-4 w-4 text-primary" />Attachments</h4>
              <ImportButton text="Add Attachment" icon={<Plus className="h-4 w-4" />} onClick={() => fileRef.current?.click()} className="whitespace-nowrap" />
              <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" multiple hidden onChange={(e) => { setFiles((p) => [...p, ...Array.from(e.target.files ?? [])]); e.target.value = ""; }} />
            </div>
            {files.map((f, i) => (
              <div key={`${f.name}-${i}`} className="flex items-center justify-between gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm text-heading">
                <span className="min-w-0 truncate">{f.name}</span>
                <button type="button" aria-label={`Remove ${f.name}`} onClick={() => setFiles((p) => p.filter((_, j) => j !== i))} className="cursor-pointer text-body hover:text-danger"><X className="h-4 w-4" /></button>
              </div>
            ))}
          </Panel>

          <Panel className="space-y-3 bg-primary/5">
            <h4 className="flex items-center gap-2 text-sm font-semibold text-heading"><Calendar className="h-4 w-4 text-primary" />Follow-up</h4>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-heading">
              <RadioCheckButtonh type="checkbox" checked={followUp} onChange={() => setFollowUp((v) => !v)} className="h-4 w-4 rounded accent-primary" />
              Schedule a follow-up appointment after referral
            </label>
            {followUp && (
              <div className="grid gap-x-4 gap-y-3 sm:grid-cols-2">
                <ModalDateField id="referral-follow-date" label="Follow-up Date" value={followDate} onChange={setFollowDate} min={todayISO()} />
                <SignupDropdown name="followType" label="Follow-up Type" placeholder="Select type" options={FOLLOW_TYPES} value={followType} onChange={setFollowType} searchable={false} portalMenu portalMenuZIndex={1000} />
              </div>
            )}
          </Panel>
        </div>

        <aside className="min-w-0 space-y-3">
          <Panel className="space-y-1 bg-primary/5">
            <h4 className="flex items-center gap-2 text-sm font-semibold text-heading"><User className="h-4 w-4 text-primary" />Patient Information</h4>
            <p className="pt-1 text-base font-semibold text-heading">{PATIENT_CONTEXT.name}</p>
            <p className="text-xs text-body">MRN: {PATIENT_CONTEXT.mrn}</p>
            <p className="text-xs text-body">DOB: {PATIENT_CONTEXT.dob}</p>
          </Panel>
          <Panel className="space-y-3 bg-primary/5">
            <h4 className="flex items-center gap-2 text-sm font-semibold text-heading"><HeartPulse className="h-4 w-4 text-primary" />Clinical Context</h4>
            {[
              { label: "Active Conditions", items: PATIENT_CONTEXT.conditions },
              { label: "Current Medications", items: PATIENT_CONTEXT.medications },
              { label: "Allergies", items: PATIENT_CONTEXT.allergies.length ? PATIENT_CONTEXT.allergies : ["No known allergies"] },
            ].map((g) => (
              <div key={g.label}>
                <p className="mb-1.5 text-xs font-semibold text-heading">{g.label} ({g.items.length})</p>
                <div className="flex flex-wrap gap-1.5">
                  {g.items.map((i) => <span key={i} className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs text-heading">{i}</span>)}
                </div>
              </div>
            ))}
          </Panel>
        </aside>
      </div>
    </ModalShell>
  );
};

export default CreateReferralModal;
