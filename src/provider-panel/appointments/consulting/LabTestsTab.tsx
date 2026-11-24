"use client";

import React, { useMemo, useState } from "react";
import { X } from "lucide-react";

import RadioCheckButtonh from "@/components/RadioCheckButtonh";

import { ModalDateField, ModalTextarea, todayISO, FieldLabel, Panel, PriorityToggle, SearchInput, TabLayout, addDays, type Priority } from "@/components/Modalshell";

export const LAB_TESTS = [
  { name: "CBC with Differential", desc: "Complete blood count" },
  { name: "Comprehensive Metabolic Panel (CMP)", desc: "Kidney and liver function tests" },
  { name: "Lipid Panel", desc: "Cholesterol and triglycerides" },
  { name: "HbA1c", desc: "Diabetes screening test" },
  { name: "TSH", desc: "Thyroid function test" },
  { name: "Vitamin D (25-OH)", desc: "Vitamin D level" },
  { name: "Urinalysis", desc: "Routine urine examination" },
];

export type LabDraft = { selected: string[]; priority: Priority; instructions: string; date: string };
export const emptyLab = (): LabDraft => ({ selected: [], priority: "Routine", instructions: "", date: addDays(todayISO(), 2) });

type Props = { value: LabDraft; onChange: (v: LabDraft) => void };

const LabTestsTab = ({ value, onChange }: Props) => {
  const [search, setSearch] = useState("");
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(false);
  const patch = (p: Partial<LabDraft>) => onChange({ ...value, ...p });
  const toggle = (name: string) => {
    patch({ selected: value.selected.includes(name) ? value.selected.filter((n) => n !== name) : [...value.selected, name] });
    setMobileSummaryOpen(true);
  };

  const list = useMemo(() => {
    const q = search.trim().toLowerCase();
    return LAB_TESTS.filter((t) => `${t.name} ${t.desc}`.toLowerCase().includes(q));
  }, [search]);

  return (
    <TabLayout
      mobileDetailOpen={mobileSummaryOpen}
      onMobileBack={() => setMobileSummaryOpen(false)}
      list={(
      <div className="min-h-0 min-w-0 space-y-3 hide-scrollbar xl:overflow-y-auto">
        <SearchInput value={search} onChange={setSearch} placeholder="Search lab tests..." />
        <h4 className="text-sm font-semibold text-heading">Frequently Ordered</h4>
        <div className="space-y-2">
          {list.length === 0 && <p className="py-6 text-center text-sm text-body">No lab tests match your search.</p>}
          {list.map((t) => (
            <label key={t.name} className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-card p-3 transition-colors hover:border-primary/50 hover:bg-primary/5">
              <RadioCheckButtonh
                type="checkbox"
                checked={value.selected.includes(t.name)}
                onChange={() => toggle(t.name)}
                className="mt-0.5 h-4 w-4 rounded accent-primary"
              />
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-heading">{t.name}</span>
                <span className="block text-xs text-body">{t.desc}</span>
              </span>
            </label>
          ))}
        </div>
      </div>
      )}

      details={(
      <Panel className="space-y-4 hide-scrollbar xl:overflow-y-auto">
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-base font-semibold text-heading">Order Summary</h4>
          {value.selected.length > 0 && (
            <button type="button" onClick={() => patch({ selected: [] })} className="cursor-pointer text-xs font-medium text-primary hover:underline">
              Clear All
            </button>
          )}
        </div>

        {value.selected.length === 0 ? (
          <p className="text-sm text-body">Select lab tests from the list.</p>
        ) : (
          <ul className="space-y-2">
            {value.selected.map((name) => (
              <li key={name} className="flex items-center justify-between gap-2 rounded-lg bg-primary/5 px-3 py-2 text-sm font-medium text-heading">
                <span className="min-w-0 truncate">{name}</span>
                <button type="button" aria-label={`Remove ${name}`} onClick={() => toggle(name)} className="cursor-pointer text-body hover:text-danger">
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}

        <div>
          <FieldLabel>Priority</FieldLabel>
          <PriorityToggle value={value.priority} onChange={(priority) => patch({ priority })} />
        </div>

        <ModalTextarea id="lab-instructions" label="Instructions (Optional)" value={value.instructions} onChange={(instructions) => patch({ instructions })} placeholder="Add any special instructions..." />
        <ModalDateField id="lab-expected-date" label="Expected Date" value={value.date} onChange={(date) => patch({ date })} min={todayISO()} />
      </Panel>
      )}
    />
  );
};

export default LabTestsTab;
