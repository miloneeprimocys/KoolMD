"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { Ban, Download, Eye, Plus, StickyNote, XCircle } from "lucide-react";

import Breadcrumb from "@/components/Breadcrumb";
import AddButton from "@/components/Addbutton";
import SearchAndFilter from "@/components/Searchandfilter";
import Table from "@/components/Table";
import TableStatus from "@/components/TableStatus";
import { type TableColumn } from "@/components/Tableheader";
import Content from "@/components/Content";
import Tags, { type TagTone } from "@/components/Tags";
import Actions from "@/components/Actions";
import Pagination from "@/components/Pagination";
import { cardCls } from "@/providers/Shared";

import SelectMedicationModal from "../medicationlist/Selectmedicationmodal";

// ✅ NEW IMPORTS
import CancelPrescription from "./CancelPrescription";
import MarkAsDiscontinued from "./MarkAsDiscontinued";

export type Rx = { id: string; name: string; dosage: string; date: string; status: string; prescribedBy: string };

export const RX_HISTORY: Rx[] = [
  { id: "rx1", name: "Amoxicillin", dosage: "500 mg", date: "Oct 28, 2026", status: "Sent", prescribedBy: "Dr. Sarah Wilson" },
  { id: "rx2", name: "Lisinopril", dosage: "10 mg", date: "Sep 10, 2026", status: "Active", prescribedBy: "Dr. Sarah Wilson" },
  { id: "rx3", name: "Metformin", dosage: "500 mg", date: "Aug 15, 2026", status: "Active", prescribedBy: "Dr. Sarah Wilson" },
  { id: "rx4", name: "Atorvastatin", dosage: "20 mg", date: "Jul 20, 2026", status: "Active", prescribedBy: "Dr. Michael Chen" },
  { id: "rx5", name: "Albuterol Inhaler", dosage: "90 mcg", date: "Jun 05, 2026", status: "Active", prescribedBy: "Dr. Emily Roberts" },
  { id: "rx6", name: "Omeprazole", dosage: "20 mg", date: "May 12, 2026", status: "Discontinued", prescribedBy: "Dr. Robert Johnson" },
  { id: "rx7", name: "Prednisone", dosage: "10 mg", date: "Mar 10, 2026", status: "Completed", prescribedBy: "Dr. Sarah Wilson" },
];

const TONE: Record<string, TagTone> = { Sent: "info", Active: "success", Completed: "success", Discontinued: "danger" };
const STATUS_FILTER = "All Statuses";
const EMPTY_FILTERS: Record<string, string> = { [STATUS_FILTER]: "" };
const PAGE_SIZE = 10;

const RowMenu = ({ onSelect }: { onSelect: (action: string) => void }) => {
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!pos) return;
    const close = () => setPos(null);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [pos]);

  const items = [
    { key: "pdf", label: "Download PDF", icon: <Download className="h-3.5 w-3.5" /> },
    { key: "cancel", label: "Cancel Prescription", icon: <XCircle className="h-3.5 w-3.5" /> },
    { key: "discontinue", label: "Mark as Discontinued", icon: <Ban className="h-3.5 w-3.5" /> },
    { key: "note", label: "Add Note", icon: <StickyNote className="h-3.5 w-3.5" /> },
  ];

  return (
    <>
      <div ref={triggerRef}>
        <Actions
          actions={["more"]}
          size="md"
          onAction={() => {
            const r = triggerRef.current?.getBoundingClientRect();
            if (!r) return;
            setPos((current) => (current ? null : { top: r.bottom + 4, left: Math.max(r.right - 192, 8) }));
          }}
        />
      </div>
      {pos &&
        createPortal(
          <>
            <div className="fixed inset-0 z-[390]" onClick={() => setPos(null)} />
            <ul role="menu" style={{ top: pos.top, left: pos.left }} className="fixed z-[400] w-48 rounded-xl border border-border bg-card p-1 shadow-2xl">
              {items.map((it) => (
                <li key={it.key}>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setPos(null);
                      onSelect(it.key);
                    }}
                    className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs text-heading transition-colors hover:bg-primary/10"
                  >
                    {it.icon}
                    {it.label}
                  </button>
                </li>
              ))}
            </ul>
          </>,
          document.body,
        )}
    </>
  );
};

const PrescriptionHistoryPage = () => {
  const router = useRouter();
  const [picker, setPicker] = useState(false);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);

  // ✅ NEW: local list state so we can reflect cancel/discontinue updates in the UI
  const [rows, setRows] = useState<Rx[]>(RX_HISTORY);

  // ✅ NEW: which prescription is being acted on, per modal
  const [cancelTarget, setCancelTarget] = useState<Rx | null>(null);
  const [discontinueTarget, setDiscontinueTarget] = useState<Rx | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (q && ![r.name, r.prescribedBy].some((f) => f.toLowerCase().includes(q))) return false;
      if (filters[STATUS_FILTER] && r.status !== filters[STATUS_FILTER]) return false;
      return true;
    });
  }, [rows, search, filters]);

  const totalPages = Math.max(Math.ceil(filtered.length / PAGE_SIZE), 1);
  const safePage = Math.min(page, totalPages);
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const columns: TableColumn[] = [
    { key: "medication", label: "Medication" },
    { key: "dosage", label: "Dosage" },
    { key: "date", label: "Prescribed Date" },
    { key: "status", label: "Status" },
    { key: "by", label: "Prescribed By" },
    { key: "actions", label: "Actions", header: <div className="flex w-full items-center justify-center">Actions</div> },
  ];

  const tableRows = visible.map((r) => ({
    medication: <Content title={r.name} />,
    dosage: <Content title={r.dosage} />,
    date: <Content title={r.date} />,
    status: <Tags text={r.status} tone={TONE[r.status] ?? "info"} size="xs" />,
    by: <Content title={r.prescribedBy} />,
    actions: (
      <div className="flex w-full items-center justify-center gap-1">
        <Actions actions={["view"]} size="sm" onAction={() => {}} />
        <RowMenu
          onSelect={(action) => {
            // ✅ NEW: route the menu action to the matching modal
            switch (action) {
              case "cancel":
                setCancelTarget(r);
                break;
              case "discontinue":
                setDiscontinueTarget(r);
                break;
              case "pdf":
                console.log("Download PDF:", r.id);
                break;
              case "note":
                console.log("Add note:", r.id);
                break;
            }
          }}
        />
      </div>
    ),
  }));

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-4 sm:space-y-5">
      <Breadcrumb items={[{ label: "Medications", href: "/medication/prescription-list" }, { label: "Prescription History" }]} />

      <section className={`${cardCls} space-y-4`}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-base font-semibold text-heading sm:text-lg">Prescription History</h3>
            <p className="text-xs text-body sm:text-sm">View prescription status and manage actions.</p>
          </div>
          <AddButton text="New Prescription" icon={<Plus className="h-4 w-4" />} onClick={() => setPicker(true)} className="whitespace-nowrap" />
        </div>

        <SearchAndFilter
          placeholder="Search medications..."
          value={search}
          onSearch={(v: string) => {
            setSearch(v);
            setPage(1);
          }}
          filters={[{ label: STATUS_FILTER, options: ["Sent", "Active", "Completed", "Discontinued"] }]}
          selectedFilters={filters}
          onFilterChange={(label: string, value: string) => {
            setFilters((prev) => ({ ...prev, [label]: value }));
            setPage(1);
          }}
          showDateRange
        />

        <div className="overflow-hidden rounded-[14px] border border-border bg-card">
          {visible.length === 0 ? (
            <TableStatus variant="empty" message="No prescriptions match your filters." />
          ) : (
            <Table columns={columns} rows={tableRows} bordered={false} />
          )}
        </div>

        {filtered.length > 0 && (
          <Pagination page={safePage} totalPages={totalPages} totalItems={filtered.length} pageSize={PAGE_SIZE} itemLabel="prescriptions" onChange={setPage} />
        )}
      </section>

      <SelectMedicationModal
        open={picker}
        onClose={() => setPicker(false)}
        onSelect={(m) => {
          setPicker(false);
          router.push(`/medication/new-prescription?med=${m.id}`);
        }}
      />

      {/* ✅ NEW: Cancel Prescription modal */}
      <CancelPrescription
        open={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        prescription={cancelTarget ?? undefined}
        onConfirm={async (id) => {
          // TODO: replace with real API call
          console.log("Cancel prescription:", id);
          return true;
        }}
        onCancelled={(id) => {
          setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status: "Cancelled" } : r)));
        }}
      />

      {/* ✅ NEW: Mark as Discontinued modal */}
      <MarkAsDiscontinued
        open={!!discontinueTarget}
        onClose={() => setDiscontinueTarget(null)}
        prescription={discontinueTarget ?? undefined}
        onConfirm={async (id) => {
          // TODO: replace with real API call
          console.log("Discontinue prescription:", id);
          return true;
        }}
        onDiscontinued={(id) => {
          setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status: "Discontinued" } : r)));
        }}
      />
    </div>
  );
};

export default PrescriptionHistoryPage;