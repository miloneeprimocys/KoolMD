"use client";

import React, { useMemo, useState } from "react";
import { Network, Paperclip, Pencil, Plus } from "lucide-react";

import AddButton from "@/components/Addbutton";
import ImportButton from "@/components/ImportButton";

import { AttachmentList, Chips, DetailRow, ListTable, Panel, SearchInput, StatusTag, TabLayout, dangerBtnCls, fmtDate, type Attachment } from "@/components/Modalshell";

export type Procedure = {
  id: string; name: string; code: string; date: string; status: string; provider: string;
  location: string; outcome: string; notes: string; attachments: Attachment[];
};

export const INITIAL_PROCEDURES: Procedure[] = [
  { id: "PRC-1", name: "Upper Endoscopy", code: "43235", date: "2026-11-28", status: "Scheduled", provider: "Dr. Sarah Miller", location: "Main Clinic – Cardiology", outcome: "—", notes: "", attachments: [] },
  { id: "PRC-2", name: "Knee Arthroscopy", code: "29870", date: "2026-11-20", status: "Completed", provider: "Dr. Sarah Miller", location: "Main Clinic – Cardiology", outcome: "Normal", notes: "", attachments: [] },
  { id: "PRC-3", name: "Cardiac Stress Test", code: "93015", date: "2026-11-18", status: "Completed", provider: "Dr. Sarah Miller", location: "Main Clinic – Cardiology", outcome: "Normal", notes: "Exercise stress test completed. No evidence of ischemia. Patient tolerated the procedure well.", attachments: [{ name: "Stress_Test_Report.pdf", size: "1.4 MB" }, { name: "ECG_Results.pdf", size: "956 KB" }] },
  { id: "PRC-4", name: "Colonoscopy", code: "45378", date: "2026-11-15", status: "Cancelled", provider: "Dr. Sarah Miller", location: "Main Clinic – Cardiology", outcome: "—", notes: "", attachments: [] },
  { id: "PRC-5", name: "Skin Biopsy", code: "11102", date: "2026-11-10", status: "Completed", provider: "Dr. Sarah Miller", location: "Main Clinic – Cardiology", outcome: "Normal", notes: "", attachments: [] },
  { id: "PRC-6", name: "Pulmonary Function Test", code: "94010", date: "2026-12-02", status: "Scheduled", provider: "Dr. Sarah Miller", location: "Main Clinic – Cardiology", outcome: "—", notes: "", attachments: [] },
];

type Props = { procedures: Procedure[]; onAdd: () => void; onDelete: (id: string) => void; onEdit?: (p: Procedure) => void };

const ProceduresTab = ({ procedures, onAdd, onDelete, onEdit }: Props) => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [selectedId, setSelectedId] = useState<string>();
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return procedures.filter((p) => (filter === "All" || p.status === filter) && `${p.name} ${p.code} ${p.status}`.toLowerCase().includes(q));
  }, [procedures, search, filter]);

  const selected = procedures.find((p) => p.id === selectedId) ?? rows[0];
  const chips = [{ label: "All", count: procedures.length }, ...["Scheduled", "Completed", "Cancelled"].map((s) => ({ label: s, count: procedures.filter((p) => p.status === s).length }))];

  return (
    <TabLayout
      mobileDetailOpen={mobileDetailOpen}
      onMobileBack={() => setMobileDetailOpen(false)}
      list={
        <>
          <div className="flex flex-wrap items-center gap-3">
            <div className="min-w-[200px] flex-1"><SearchInput value={search} onChange={setSearch} placeholder="Search procedures by name, code, or status..." /></div>
            <AddButton text="Add Procedure" icon={<Plus className="h-4 w-4" />} onClick={onAdd} className="whitespace-nowrap" />
          </div>
          <Chips options={chips} value={filter} onChange={setFilter} />
          <ListTable
            rows={rows}
            selectedId={selected?.id}
            onSelect={(id) => { setSelectedId(id); setMobileDetailOpen(true); }}
            emptyText="No procedures found."
            columns={[
              {
                label: "Procedure",
                render: (p) => (
                  <span className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><Network className="h-4 w-4" /></span>
                    <span className="font-semibold text-heading">{p.name}</span>
                  </span>
                ),
              },
              { label: "Code", render: (p) => p.code },
              { label: "Date", render: (p) => fmtDate(p.date) },
              { label: "Status", render: (p) => <StatusTag status={p.status} /> },
            ]}
          />
          <p className="text-xs text-body">Showing {rows.length} of {procedures.length} procedures</p>
        </>
      }
      details={
        selected ? (
          <Panel className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h4 className="flex items-center gap-2 text-base font-semibold text-heading"><Network className="h-4 w-4 text-primary" />Procedure Details</h4>
              <StatusTag status={selected.status} />
            </div>
            <div className="rounded-lg bg-primary/5 px-3 py-2">
              <p className="font-semibold text-heading">{selected.name}</p>
              <p className="text-xs text-body">Code: {selected.code}</p>
            </div>
            <dl className="divide-y divide-divider">
              <DetailRow label="Date Performed">{fmtDate(selected.date)}</DetailRow>
              <DetailRow label="Provider">{selected.provider}</DetailRow>
              <DetailRow label="Location">{selected.location}</DetailRow>
              <DetailRow label="Status">{selected.status}</DetailRow>
              <DetailRow label="Outcome">{selected.outcome}</DetailRow>
            </dl>
            {selected.notes && (
              <div>
                <h5 className="mb-2 text-sm font-semibold text-heading">Procedure Notes</h5>
                <p className="rounded-lg bg-primary/5 px-3 py-2 text-sm text-heading">{selected.notes}</p>
              </div>
            )}
            <h5 className="flex items-center gap-2 text-sm font-semibold text-heading"><Paperclip className="h-4 w-4 text-primary" />Attachments ({selected.attachments.length})</h5>
            <AttachmentList items={selected.attachments} />
            <div className="grid grid-cols-2 gap-2 pt-1">
              <ImportButton text="Edit" icon={<Pencil className="h-4 w-4" />} onClick={() => onEdit?.(selected)} className="w-full justify-center whitespace-nowrap" />
              <button type="button" onClick={() => onDelete(selected.id)} className={dangerBtnCls}>Delete</button>
            </div>
          </Panel>
        ) : (
          <Panel><p className="text-sm text-body">Select a procedure to see its details.</p></Panel>
        )
      }
    />
  );
};

export default ProceduresTab;
