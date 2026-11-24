"use client";

import React, { useMemo, useState } from "react";
import { CheckCircle2, Paperclip, Pencil, Plus, Send, Users } from "lucide-react";

import AddButton from "@/components/Addbutton";
import ImportButton from "@/components/ImportButton";

import { AttachmentList, Chips, DetailRow, ListTable, Panel, SearchInput, StatusTag, TabLayout, fmtDate, type Attachment } from "@/components/Modalshell";

export type Referral = {
  id: string; doctor: string; specialty: string; reason: string; status: string;
  date: string; appointment?: string; notes: string; attachments: Attachment[];
};

export const INITIAL_REFERRALS: Referral[] = [
  { id: "REF-1", doctor: "Dr. James Carter", specialty: "Cardiology", reason: "Evaluate persistent chest pain", status: "Accepted", date: "2026-11-20", appointment: "Scheduled for Nov 28, 2026", notes: "Patient reports intermittent chest pain for the last 2 weeks. Please evaluate and advise further management.", attachments: [{ name: "ECG_Report.pdf", size: "1.2 MB" }, { name: "Recent_Lab_Results.pdf", size: "842 KB" }] },
  { id: "REF-2", doctor: "Dr. Emily Rogers", specialty: "Endocrinology", reason: "Diabetes management and follow-up", status: "Sent", date: "2026-11-18", notes: "", attachments: [] },
  { id: "REF-3", doctor: "Dr. Michael Lee", specialty: "Orthopedics", reason: "Chronic knee pain evaluation", status: "Pending", date: "2026-11-17", notes: "", attachments: [] },
  { id: "REF-4", doctor: "Dr. Priya Singh", specialty: "Dermatology", reason: "Skin rash – further evaluation", status: "Completed", date: "2026-11-10", notes: "", attachments: [] },
  { id: "REF-5", doctor: "Dr. Daniel Kim", specialty: "Gastroenterology", reason: "Ongoing abdominal discomfort", status: "Sent", date: "2026-11-08", notes: "", attachments: [] },
];

const STATUSES = ["Pending", "Sent", "Accepted", "Completed", "Declined"];

type Props = {
  referrals: Referral[];
  onCreate: () => void;
  onChange: (id: string, patch: Partial<Referral>) => void;
  onEdit?: (r: Referral) => void;
};

const ReferralsTab = ({ referrals, onCreate, onChange, onEdit }: Props) => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [selectedId, setSelectedId] = useState<string>();
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return referrals.filter((r) => (filter === "All" || r.status === filter) && `${r.doctor} ${r.specialty} ${r.reason} ${r.status}`.toLowerCase().includes(q));
  }, [referrals, search, filter]);

  const selected = referrals.find((r) => r.id === selectedId) ?? rows[0];
  const chips = [{ label: "All", count: referrals.length }, ...STATUSES.map((s) => ({ label: s, count: referrals.filter((r) => r.status === s).length }))];

  return (
    <TabLayout
      mobileDetailOpen={mobileDetailOpen}
      onMobileBack={() => setMobileDetailOpen(false)}
      list={
        <>
          <div className="flex flex-wrap items-center gap-3">
            <div className="min-w-[200px] flex-1"><SearchInput value={search} onChange={setSearch} placeholder="Search referrals by specialist, reason, or status..." /></div>
            <AddButton text="Create Referral" icon={<Plus className="h-4 w-4" />} onClick={onCreate} className="whitespace-nowrap" />
          </div>
          <Chips options={chips} value={filter} onChange={setFilter} />
          <ListTable
            rows={rows}
            selectedId={selected?.id}
            onSelect={(id) => { setSelectedId(id); setMobileDetailOpen(true); }}
            emptyText="No referrals found."
            columns={[
              { label: "Referral To", render: (r) => <span className="font-semibold text-heading">{r.doctor}</span> },
              { label: "Specialty", render: (r) => r.specialty },
              { label: "Reason", render: (r) => <span className="block max-w-[180px] text-xs">{r.reason}</span> },
              { label: "Status", render: (r) => <StatusTag status={r.status} /> },
              { label: "Date", render: (r) => fmtDate(r.date) },
            ]}
          />
          <p className="text-xs text-body">Showing {rows.length} of {referrals.length} referrals</p>
        </>
      }
      details={
        selected ? (
          <Panel className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h4 className="flex items-center gap-2 text-base font-semibold text-heading"><Users className="h-4 w-4 text-primary" />Referral Details</h4>
              <StatusTag status={selected.status} />
            </div>
            <dl className="divide-y divide-divider border-t border-divider">
              <DetailRow label="Referral To">{selected.doctor}</DetailRow>
              <DetailRow label="Specialty">{selected.specialty}</DetailRow>
              <DetailRow label="Referral Reason">{selected.reason}</DetailRow>
              <DetailRow label="Referral Date">{fmtDate(selected.date)}</DetailRow>
              <DetailRow label="Status">{selected.status}</DetailRow>
              {selected.appointment && <DetailRow label="Appointment">{selected.appointment}</DetailRow>}
            </dl>
            {selected.notes && (
              <div>
                <h5 className="mb-2 text-sm font-semibold text-heading">Clinical Notes</h5>
                <p className="rounded-lg bg-primary/5 px-3 py-2 text-sm text-heading">{selected.notes}</p>
              </div>
            )}
            <h5 className="flex items-center gap-2 text-sm font-semibold text-heading"><Paperclip className="h-4 w-4 text-primary" />Attachments ({selected.attachments.length})</h5>
            <AttachmentList items={selected.attachments} />
            <div className="grid gap-2 pt-1 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              <ImportButton text="Edit" icon={<Pencil className="h-4 w-4" />} onClick={() => onEdit?.(selected)} className="w-full justify-center whitespace-nowrap" />
              <ImportButton text="Resend" icon={<Send className="h-4 w-4" />} onClick={() => onChange(selected.id, { status: "Sent" })} className="w-full justify-center whitespace-nowrap" />
              <AddButton text="Complete" icon={<CheckCircle2 className="h-4 w-4" />} onClick={() => onChange(selected.id, { status: "Completed" })} className="w-full justify-center whitespace-nowrap" />
            </div>
          </Panel>
        ) : (
          <Panel><p className="text-sm text-body">Select a referral to see its details.</p></Panel>
        )
      }
    />
  );
};

export default ReferralsTab;
