"use client";

import React, { useMemo, useState } from "react";
import { MoreHorizontal, Paperclip, Pencil, Plus } from "lucide-react";

import AddButton from "@/components/Addbutton";
import ImportButton from "@/components/ImportButton";

import { AttachmentList, Chips, DetailRow, ListTable, Panel, SearchInput, StatusTag, TabLayout, dangerBtnCls, fmtDate, type Attachment } from "@/components/Modalshell";

export type OtherOrder = {
  id: string; name: string; category: string; date: string; status: string; orderedBy: string;
  location: string; details: string; attachments: Attachment[];
};

export const INITIAL_OTHER_ORDERS: OtherOrder[] = [
  { id: "ORD-1045", name: "Admission Order", category: "Admission", date: "2026-11-28", status: "Completed", orderedBy: "Dr. Sarah Miller", location: "Main Clinic – Cardiology", details: "Admit patient for cardiac stress test and observation for 24 hours.", attachments: [{ name: "Admission_Notes.pdf", size: "532 KB" }] },
  { id: "ORD-1044", name: "Oxygen Therapy", category: "Respiratory", date: "2026-11-25", status: "Active", orderedBy: "Dr. Sarah Miller", location: "Main Clinic – Cardiology", details: "", attachments: [] },
  { id: "ORD-1043", name: "Vital Signs Monitoring", category: "Monitoring", date: "2026-11-22", status: "Active", orderedBy: "Dr. Sarah Miller", location: "Main Clinic – Cardiology", details: "", attachments: [] },
  { id: "ORD-1042", name: "Diet Order", category: "Nutrition", date: "2026-11-20", status: "Completed", orderedBy: "Dr. Sarah Miller", location: "Main Clinic – Cardiology", details: "", attachments: [] },
  { id: "ORD-1041", name: "Nursing Care", category: "Nursing", date: "2026-11-18", status: "Active", orderedBy: "Dr. Sarah Miller", location: "Main Clinic – Cardiology", details: "", attachments: [] },
  { id: "ORD-1040", name: "DME Order", category: "Equipment", date: "2026-11-15", status: "Cancelled", orderedBy: "Dr. Sarah Miller", location: "Main Clinic – Cardiology", details: "", attachments: [] },
];

type Props = { orders: OtherOrder[]; onAdd: () => void; onDelete: (id: string) => void; onEdit?: (o: OtherOrder) => void };

const OtherOrdersTab = ({ orders, onAdd, onDelete, onEdit }: Props) => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [selectedId, setSelectedId] = useState<string>();
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((o) => (filter === "All" || o.status === filter) && `${o.name} ${o.category} ${o.status}`.toLowerCase().includes(q));
  }, [orders, search, filter]);

  const selected = orders.find((o) => o.id === selectedId) ?? rows[0];
  const chips = [{ label: "All", count: orders.length }, ...["Active", "Completed", "Cancelled"].map((s) => ({ label: s, count: orders.filter((o) => o.status === s).length }))];

  return (
    <TabLayout
      mobileDetailOpen={mobileDetailOpen}
      onMobileBack={() => setMobileDetailOpen(false)}
      list={
        <>
          <div className="flex flex-wrap items-center gap-3">
            <div className="min-w-[200px] flex-1"><SearchInput value={search} onChange={setSearch} placeholder="Search orders by name, category, or status..." /></div>
            <AddButton text="Add Order" icon={<Plus className="h-4 w-4" />} onClick={onAdd} className="whitespace-nowrap" />
          </div>
          <Chips options={chips} value={filter} onChange={setFilter} />
          <ListTable
            rows={rows}
            selectedId={selected?.id}
            onSelect={(id) => { setSelectedId(id); setMobileDetailOpen(true); }}
            emptyText="No orders found."
            columns={[
              {
                label: "Order Name",
                render: (o) => (
                  <span className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><MoreHorizontal className="h-4 w-4" /></span>
                    <span className="font-semibold text-heading">{o.name}</span>
                  </span>
                ),
              },
              { label: "Category", render: (o) => o.category },
              { label: "Date", render: (o) => fmtDate(o.date) },
              { label: "Status", render: (o) => <StatusTag status={o.status} tone={o.status === "Active" ? "info" : undefined} /> },
            ]}
          />
          <p className="text-xs text-body">Showing {rows.length} of {orders.length} orders</p>
        </>
      }
      details={
        selected ? (
          <Panel className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h4 className="flex items-center gap-2 text-base font-semibold text-heading"><MoreHorizontal className="h-4 w-4 text-primary" />Order Details</h4>
              <StatusTag status={selected.status} />
            </div>
            <div className="rounded-lg bg-primary/5 px-3 py-2">
              <p className="font-semibold text-heading">{selected.name}</p>
              <p className="text-xs text-body">Order ID: {selected.id}</p>
            </div>
            <dl className="divide-y divide-divider">
              <DetailRow label="Order Date">{fmtDate(selected.date)}</DetailRow>
              <DetailRow label="Category">{selected.category}</DetailRow>
              <DetailRow label="Ordered By">{selected.orderedBy}</DetailRow>
              <DetailRow label="Location">{selected.location}</DetailRow>
              <DetailRow label="Status">{selected.status}</DetailRow>
            </dl>
            {selected.details && (
              <div>
                <h5 className="mb-2 text-sm font-semibold text-heading">Order Details</h5>
                <p className="rounded-lg bg-primary/5 px-3 py-2 text-sm text-heading">{selected.details}</p>
              </div>
            )}
            <h5 className="flex items-center gap-2 text-sm font-semibold text-heading"><Paperclip className="h-4 w-4 text-primary" />Attachments ({selected.attachments.length})</h5>
            <AttachmentList items={selected.attachments} />
            <div className="grid grid-cols-2 gap-2 pt-1">
              <ImportButton text="Edit Order" icon={<Pencil className="h-4 w-4" />} onClick={() => onEdit?.(selected)} className="w-full justify-center whitespace-nowrap" />
              <button type="button" onClick={() => onDelete(selected.id)} className={dangerBtnCls}>Delete</button>
            </div>
          </Panel>
        ) : (
          <Panel><p className="text-sm text-body">Select an order to see its details.</p></Panel>
        )
      }
    />
  );
};

export default OtherOrdersTab;
