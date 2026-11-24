"use client";

import React, { useMemo, useState } from "react";
import { Atom, Bone, Magnet, Plus, ScanLine, Waves, X, Image as ImageIcon, type LucideIcon } from "lucide-react";

import RadioCheckButtonh from "@/components/RadioCheckButtonh";

import { ModalDateField, ModalTextarea, todayISO, Chips, FieldLabel, Panel, PriorityToggle, SearchInput, TabLayout, addDays, type Priority } from "@/components/Modalshell";

export type ImagingStudy = { name: string; desc: string; category: string };

export const IMAGING_STUDIES: ImagingStudy[] = [
  { name: "Chest X-Ray (CXR)", desc: "Evaluate lungs, heart and chest structures", category: "X-Ray" },
  { name: "X-Ray – Extremity", desc: "Bone and joint evaluation (e.g., hand, knee, ankle)", category: "X-Ray" },
  { name: "CT Scan – Head", desc: "Detailed images of the brain and skull", category: "CT" },
  { name: "MRI – Spine", desc: "Evaluation of spinal cord and surrounding structures", category: "MRI" },
  { name: "Ultrasound – Abdomen", desc: "Evaluate abdominal organs (liver, gallbladder, kidneys, etc.)", category: "Ultrasound" },
];

const CATEGORY_ICON: Record<string, LucideIcon> = {
  "X-Ray": Bone, CT: ScanLine, MRI: Magnet, Ultrasound: Waves, "Nuclear Medicine": Atom, Other: ImageIcon,
};
const FILTERS = ["All", "X-Ray", "CT", "MRI", "Ultrasound", "Nuclear Medicine", "Other"].map((label) => ({ label }));

export type ImagingDraft = {
  selected: string[]; priority: Priority; reason: string; instructions: string; date: string; custom: ImagingStudy[];
};
export const emptyImaging = (): ImagingDraft => ({
  selected: [], priority: "Routine", reason: "", instructions: "", date: addDays(todayISO(), 2), custom: [],
});

type Props = { value: ImagingDraft; onChange: (v: ImagingDraft) => void; onAddCustom: () => void };

const ImagingTab = ({ value, onChange, onAddCustom }: Props) => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [mobileDetailsOpen, setMobileDetailsOpen] = useState(false);
  const patch = (p: Partial<ImagingDraft>) => onChange({ ...value, ...p });
  const toggle = (name: string) => {
    patch({ selected: value.selected.includes(name) ? value.selected.filter((n) => n !== name) : [...value.selected, name] });
    setMobileDetailsOpen(true);
  };

  const list = useMemo(() => {
    const q = search.trim().toLowerCase();
    return [...IMAGING_STUDIES, ...value.custom].filter(
      (s) => (filter === "All" || s.category === filter) && `${s.name} ${s.desc}`.toLowerCase().includes(q),
    );
  }, [search, filter, value.custom]);

  return (
    <TabLayout
      mobileDetailOpen={mobileDetailsOpen}
      onMobileBack={() => setMobileDetailsOpen(false)}
      list={(
      <div className="min-h-0 min-w-0 space-y-3 hide-scrollbar xl:overflow-y-auto">
        <SearchInput value={search} onChange={setSearch} placeholder="Search imaging studies (e.g., X-Ray, CT, MRI)..." />
        <Chips options={FILTERS} value={filter} onChange={setFilter} />
        <h4 className="text-sm font-semibold text-heading">Common Imaging Studies</h4>
        <div className="space-y-2">
          {list.length === 0 && <p className="py-6 text-center text-sm text-body">No imaging studies match your search.</p>}
          {list.map((s) => {
            const Icon = CATEGORY_ICON[s.category] ?? ImageIcon;
            return (
              <label key={s.name} className="flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-card p-3 transition-colors hover:border-primary/50 hover:bg-primary/5">
                <RadioCheckButtonh type="checkbox" checked={value.selected.includes(s.name)} onChange={() => toggle(s.name)} className="h-4 w-4 shrink-0 rounded accent-primary" />
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-heading">{s.name}</span>
                  <span className="block text-xs text-body">{s.desc}</span>
                </span>
              </label>
            );
          })}
        </div>
        <button type="button" onClick={onAddCustom} className="flex cursor-pointer items-center gap-2 text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30">
          <Plus className="h-4 w-4" />
          Add Custom Imaging
        </button>
      </div>
      )}

      details={(
      <Panel className="space-y-4 hide-scrollbar xl:overflow-y-auto">
        <h4 className="text-base font-semibold text-heading">Order Details</h4>

        <div>
          <FieldLabel>Selected Imaging Study <span className="text-danger">*</span></FieldLabel>
          <div className="flex min-h-11 flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-2">
            {value.selected.length === 0 && <span className="px-1 text-sm text-placeholder">No study selected</span>}
            {value.selected.map((name) => (
              <span key={name} className="flex items-center gap-1.5 rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                {name}
                <button type="button" aria-label={`Remove ${name}`} onClick={() => toggle(name)} className="cursor-pointer">
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            ))}
          </div>
        </div>

        <div>
          <FieldLabel>Priority <span className="text-danger">*</span></FieldLabel>
          <PriorityToggle value={value.priority} onChange={(priority) => patch({ priority })} />
        </div>

        <ModalTextarea id="imaging-reason" label={<>Clinical Indication / Reason <span className="text-danger">*</span></>} value={value.reason} onChange={(reason) => patch({ reason })} placeholder="Enter the clinical reason for this imaging order..." />
        <ModalTextarea id="imaging-instructions" label="Instructions (Optional)" value={value.instructions} onChange={(instructions) => patch({ instructions })} placeholder="Add any specific instructions for the imaging center..." />
        <ModalDateField id="imaging-expected-date" label="Expected Date" value={value.date} onChange={(date) => patch({ date })} min={todayISO()} />
      </Panel>
      )}
    />
  );
};

export default ImagingTab;
