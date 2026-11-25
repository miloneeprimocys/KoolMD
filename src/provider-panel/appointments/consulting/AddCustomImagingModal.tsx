"use client";

import React, { useEffect, useState } from "react";
import { Check, Atom, Magnet, ScanLine, Waves, Image as ImageIcon, Clock, type LucideIcon } from "lucide-react";

import AddButton from "@/components/Addbutton";
import ImportButton from "@/components/ImportButton";

import ModalShell, { ModalTextarea, OptLabel, ReqLabel, SignupDropdown, SignupField, toOptions, FieldLabel, PriorityToggle, type Priority } from "@/components/Modalshell";
import type { ImagingStudy } from "./ImagingTab";

const CATEGORIES = toOptions(["Ultrasound", "X-Ray", "CT", "MRI", "Nuclear Medicine", "Other"]);
const BODY_PARTS = toOptions(["Head", "Neck", "Chest", "Abdomen", "Pelvis", "Spine", "Extremity", "Whole Body"]);
const TURNAROUND = toOptions(["Same day", "1 Day", "2–3 Days", "1 Week"]);
const MODALITIES: { key: string; Icon: LucideIcon }[] = [
  { key: "Ultrasound", Icon: Waves }, { key: "X-Ray", Icon: ScanLine }, { key: "CT", Icon: Atom }, { key: "MRI", Icon: Magnet }, { key: "Other", Icon: ImageIcon },
];

type Props = { open: boolean; onClose: () => void; onAdd: (study: ImagingStudy) => void };

const AddCustomImagingModal = ({ open, onClose, onAdd }: Props) => {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [desc, setDesc] = useState("");
  const [category, setCategory] = useState("");
  const [bodyPart, setBodyPart] = useState("");
  const [modality, setModality] = useState("Ultrasound");
  const [priority, setPriority] = useState<Priority>("Routine");
  const [turnaround, setTurnaround] = useState("2–3 Days");
  const [errors, setErrors] = useState<{ name?: string; category?: string; bodyPart?: string }>({});

  useEffect(() => {
    if (!open) return;
    setName(""); setCode(""); setDesc(""); setCategory(""); setBodyPart("");
    setModality("Ultrasound"); setPriority("Routine"); setTurnaround("2–3 Days"); setErrors({});
  }, [open]);

  const submit = () => {
    const e: typeof errors = {};
    if (!name.trim()) e.name = "Study name is required";
    if (!category) e.category = "Category is required";
    if (!bodyPart) e.bodyPart = "Body part is required";
    setErrors(e);
    if (Object.keys(e).length) return;
    onAdd({ name: name.trim(), desc: desc.trim() || `${bodyPart} – ${modality}`, category });
  };

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title="Add Custom Imaging"
      width={780}
      zIndexClass="z-[350]"
      footer={
        <div className="flex items-center justify-center gap-3 sm:justify-end">
          <ImportButton text="Cancel" icon={null} onClick={onClose} />
          <AddButton text="Add Custom Imaging" icon={<Check className="h-4 w-4" />} onClick={submit} className="whitespace-nowrap" />
        </div>
      }
    >
      <div className="grid gap-x-4 gap-y-3 sm:grid-cols-2">
        <SignupField name="studyName" label={<ReqLabel>Imaging Study Name</ReqLabel>} placeholder="e.g., Pelvic Ultrasound" value={name} onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: undefined })); }} error={errors.name} />
        <SignupDropdown name="category" label={<ReqLabel>Imaging Category</ReqLabel>} placeholder="Select category" options={CATEGORIES} value={category} onChange={(v) => { setCategory(v); setErrors((p) => ({ ...p, category: undefined })); }} error={errors.category} portalMenu portalMenuZIndex={1000} />
        <SignupField name="studyCode" label={<OptLabel>Study Code</OptLabel>} placeholder="e.g., US-PEL" value={code} onChange={(e) => setCode(e.target.value)} />
        <SignupDropdown name="bodyPart" label={<ReqLabel>Body Part / Region</ReqLabel>} placeholder="Select body part" options={BODY_PARTS} value={bodyPart} onChange={(v) => { setBodyPart(v); setErrors((p) => ({ ...p, bodyPart: undefined })); }} error={errors.bodyPart} portalMenu portalMenuZIndex={1000} />
        <ModalTextarea id="custom-imaging-desc" label="Description" value={desc} onChange={setDesc} placeholder="Describe what this study evaluates..." />
        <div>
          <FieldLabel><ReqLabel>Modality</ReqLabel></FieldLabel>
          <div className="grid grid-cols-3 xl:grid-cols-5 gap-2" role="group" aria-label="Modality">
            {MODALITIES.map(({ key, Icon }) => (
              <button
                key={key}
                type="button"
                aria-pressed={modality === key}
                onClick={() => setModality(key)}
                className={`group flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border px-1 py-3 text-xs font-medium transition-all duration-200 ease-out  hover:shadow-md hover:shadow-primary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 active:translate-y-0 active:scale-[0.97] xl:text-[11px] ${modality === key
                    ? "border-primary bg-primary/10 text-primary hover:bg-primary/15"
                    : "border-border bg-card text-heading hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                  }`}
              >
                <Icon className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
                {key}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3 rounded-xl border border-border bg-primary/5 p-4 sm:col-span-2">
          <h4 className="text-sm font-semibold text-heading">Default Order Settings</h4>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <FieldLabel>Priority</FieldLabel>
              <PriorityToggle value={priority} onChange={setPriority} />
            </div>
            <div className="relative">
              <SignupDropdown className="h-10!" name="turnaround" label={<OptLabel>Expected Turnaround Time</OptLabel>} placeholder="Select turnaround" options={TURNAROUND} value={turnaround} onChange={setTurnaround} searchable={false} portalMenu portalMenuZIndex={1000} />
            </div>
          </div>
          <p className="flex items-center gap-1.5 text-xs text-body"><Clock className="h-3.5 w-3.5" />Used as the defaults when this study is ordered.</p>
        </div>
      </div>
    </ModalShell>
  );
};

export default AddCustomImagingModal;