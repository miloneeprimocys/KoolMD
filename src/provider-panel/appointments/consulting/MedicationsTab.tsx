"use client";

import React, { useMemo, useState } from "react";
import { History, Info, Pencil, Pill, Plus } from "lucide-react";

import ImportButton from "@/components/ImportButton";

import { Chips, DetailRow, ListTable, Panel, SearchInput, StatusTag, TabLayout, dangerBtnCls, fmtDate } from "@/components/Modalshell";

export type Medication = {
  id: string; name: string; strength: string; dosage: string; frequency: string;
  start: string; status: string; prescribedBy: string; notes: string;
};

export const INITIAL_MEDS: Medication[] = [
  { id: "MED-1", name: "Metformin", strength: "500 mg tablet", dosage: "500 mg", frequency: "Twice daily", start: "2025-11-01", status: "Active", prescribedBy: "Dr. Sarah Miller", notes: "Take with food." },
  { id: "MED-2", name: "Atorvastatin", strength: "20 mg tablet", dosage: "20 mg", frequency: "Once daily", start: "2025-10-15", status: "Active", prescribedBy: "Dr. Sarah Miller", notes: "Take in the evening." },
  { id: "MED-3", name: "Omeprazole", strength: "40 mg capsule", dosage: "40 mg", frequency: "Once daily", start: "2025-09-10", status: "Completed", prescribedBy: "Dr. Sarah Miller", notes: "Before breakfast." },
  { id: "MED-4", name: "Albuterol Inhaler", strength: "90 mcg", dosage: "2 puffs", frequency: "As needed", start: "2025-08-20", status: "As Needed", prescribedBy: "Dr. Sarah Miller", notes: "For shortness of breath." },
];

const groupOf = (s: string) => (s === "Active" || s === "As Needed" ? "Current" : s === "Completed" ? "Past" : "Pending");

type Props = { meds: Medication[]; onAdd: () => void; onDiscontinue: (id: string) => void; onEdit?: (m: Medication) => void };

const MedicationsTab = ({ meds, onAdd, onDiscontinue, onEdit }: Props) => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [selectedId, setSelectedId] = useState<string>();
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return meds.filter((m) => (filter === "All" || groupOf(m.status) === filter) && `${m.name} ${m.strength}`.toLowerCase().includes(q));
  }, [meds, search, filter]);

  const selected = meds.find((m) => m.id === selectedId) ?? rows[0];
  const activeCount = meds.filter((m) => groupOf(m.status) === "Current").length;

  return (
    <TabLayout
      mobileDetailOpen={mobileDetailOpen}
      onMobileBack={() => setMobileDetailOpen(false)}
      list={
        <>
          <div className="flex flex-wrap items-center gap-3">
            <div className="min-w-[200px] flex-1"><SearchInput value={search} onChange={setSearch} placeholder="Search medications..." /></div>
            <ImportButton text="Add Medication" icon={<Plus className="h-4 w-4" />} onClick={onAdd} className="whitespace-nowrap" />
          </div>
          <Chips options={["All", "Current", "Past", "Pending"].map((label) => ({ label }))} value={filter} onChange={setFilter} />
          <ListTable
            rows={rows}
            selectedId={selected?.id}
            onSelect={(id) => { setSelectedId(id); setMobileDetailOpen(true); }}
            emptyText="No medications found."
            columns={[
              {
                label: "Medication",
                render: (m) => (
                  <span className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><Pill className="h-4 w-4" /></span>
                    <span><span className="block font-semibold text-heading">{m.name}</span><span className="block text-xs text-body">{m.strength}</span></span>
                  </span>
                ),
              },
              { label: "Dosage", render: (m) => m.dosage },
              { label: "Frequency", render: (m) => m.frequency },
              { label: "Start Date", render: (m) => fmtDate(m.start) },
              { label: "Status", render: (m) => <StatusTag status={m.status} /> },
            ]}
          />
          <p className="text-xs text-body">Showing {rows.length} of {meds.length} medications</p>
          <p className="flex items-center gap-2 rounded-lg bg-primary/5 px-3 py-2 text-xs text-heading">
            <Info className="h-4 w-4 shrink-0 text-primary" />
            Patient is currently on {activeCount} medications
          </p>
        </>
      }
      details={
        selected ? (
          <Panel className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h4 className="flex items-center gap-2 text-base font-semibold text-heading"><Pill className="h-4 w-4 text-primary" />Medication Details</h4>
              <StatusTag status={selected.status} />
            </div>
            <div>
              <p className="text-lg font-semibold text-heading">{selected.name}</p>
              <p className="text-sm text-body">{selected.strength}</p>
            </div>
            <dl className="divide-y divide-divider border-t border-divider">
              <DetailRow label="Dosage">{selected.dosage}</DetailRow>
              <DetailRow label="Frequency">{selected.frequency}</DetailRow>
              <DetailRow label="Start Date">{fmtDate(selected.start)}</DetailRow>
              <DetailRow label="Prescribed By">{selected.prescribedBy}</DetailRow>
              <DetailRow label="Notes">{selected.notes || "—"}</DetailRow>
            </dl>
            <h5 className="flex items-center gap-2 pt-1 text-sm font-semibold text-heading"><History className="h-4 w-4 text-primary" />Medication History</h5>
            <div className="border-l-2 border-primary/30 pl-3 text-sm">
              <p className="font-medium text-heading">{fmtDate(selected.start)}</p>
              <p className="text-body">Medication prescribed</p>
              <p className="text-xs text-body">{selected.prescribedBy}</p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <ImportButton text="Edit" icon={<Pencil className="h-4 w-4" />} onClick={() => onEdit?.(selected)} className="w-full justify-center" />
              <button type="button" onClick={() => onDiscontinue(selected.id)} disabled={selected.status === "Completed"} className={`${dangerBtnCls} disabled:cursor-not-allowed disabled:opacity-50`}>
                Discontinue
              </button>
            </div>
          </Panel>
        ) : (
          <Panel><p className="text-sm text-body">Select a medication to see its details.</p></Panel>
        )
      }
    />
  );
};

export default MedicationsTab;
