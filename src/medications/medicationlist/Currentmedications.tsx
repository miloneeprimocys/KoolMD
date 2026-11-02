"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

import AddButton from "@/components/Addbutton";
import ImportButton from "@/components/ImportButton";
import Table from "@/components/Table";
import { type TableColumn } from "@/components/Tableheader";
import Content from "@/components/Content";
import Tags from "@/components/Tags";
import Actions from "@/components/Actions";
import Pagination from "@/components/Pagination";
import RadioCheckButtonh from "@/components/RadioCheckButtonh";
import { TableSelectAllCheckbox, useTableSelection } from "@/components/TableSelection";

import SelectMedicationModal from "./Selectmedicationmodal";

export type Medication = {
  id: string; name: string; category: string; dosage: string; frequency: string;
  start: string; end: string; status: string; prescribedBy: string; reason?: string;
};

export const CURRENT_MEDS: Medication[] = [
  { id: "m1", name: "Lisinopril", category: "ACE Inhibitor", dosage: "10 mg", frequency: "Once daily", start: "Jan 10, 2024", end: "-", status: "Active", prescribedBy: "Dr. Sarah Wilson" },
  { id: "m2", name: "Metformin", category: "Biguanide", dosage: "500 mg", frequency: "Twice daily", start: "Feb 15, 2024", end: "-", status: "Active", prescribedBy: "Dr. Sarah Wilson" },
  { id: "m3", name: "Atorvastatin", category: "Statin", dosage: "20 mg", frequency: "Once daily", start: "Mar 01, 2024", end: "-", status: "Active", prescribedBy: "Dr. Michael Chen" },
  { id: "m4", name: "Albuterol Inhaler", category: "Bronchodilator", dosage: "90 mcg", frequency: "As needed", start: "Apr 12, 2024", end: "-", status: "Active", prescribedBy: "Dr. Michael Chen" },
  { id: "m5", name: "Omeprazole", category: "PPI", dosage: "20 mg", frequency: "Once daily", start: "Jun 05, 2024", end: "-", status: "Active", prescribedBy: "Dr. Emily Roberts" },
  { id: "m6", name: "Vitamin D3", category: "Supplement", dosage: "1000 IU", frequency: "Once daily", start: "Aug 20, 2024", end: "-", status: "Active", prescribedBy: "Dr. Sarah Wilson" },
];

const PAGE_SIZE = 10;
const checkboxCls =
  "h-4 w-4 cursor-pointer rounded border-border accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30";

const CurrentMedications = () => {
  const router = useRouter();
  const [picker, setPicker] = useState(false);
  const [page, setPage] = useState(1);

  const totalPages = Math.max(Math.ceil(CURRENT_MEDS.length / PAGE_SIZE), 1);
  const visible = CURRENT_MEDS.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const { selectedKeys, allSelected, someSelected, toggleRow, toggleAll } = useTableSelection(visible.map((m) => m.id));

  const columns: TableColumn[] = [
    {
      key: "select",
      label: "",
      className: "w-10",
      header: <TableSelectAllCheckbox checked={allSelected} indeterminate={someSelected} onChange={toggleAll} className={checkboxCls} />,
    },
    { key: "medication", label: "Medication" },
    { key: "dosage", label: "Dosage" },
    { key: "frequency", label: "Frequency" },
    { key: "start", label: "Start Date" },
    { key: "end", label: "End Date" },
    { key: "status", label: "Status" },
    { key: "actions", label: "Actions", header: <div className="flex w-full items-center justify-center">Actions</div> },
  ];

  const rows = visible.map((m) => ({
    select: (
      <RadioCheckButtonh type="checkbox" checked={selectedKeys.has(m.id)} onChange={() => toggleRow(m.id)} aria-label={`Select ${m.name}`} className={checkboxCls} />
    ),
    medication: <Content title={m.name} description={m.category} />,
    dosage: <Content title={m.dosage} />,
    frequency: <Content title={m.frequency} />,
    start: <Content title={m.start} />,
    end: <Content title={m.end} />,
    status: <Tags text={m.status} tone="success" size="xs" />,
    actions: (
      <div className="flex w-full items-center justify-center">
        <Actions actions={["view", "more"]} size="sm" onAction={() => {}} />
      </div>
    ),
  }));

  return (
    <section className="space-y-4">

      <div className="overflow-hidden rounded-[14px] border border-border bg-card">
        <Table columns={columns} rows={rows} bordered={false} />
      </div>

      <Pagination page={page} totalPages={totalPages} totalItems={CURRENT_MEDS.length} pageSize={PAGE_SIZE} itemLabel="medications" onChange={setPage} />

      <SelectMedicationModal
        open={picker}
        onClose={() => setPicker(false)}
        onSelect={(m) => {
          setPicker(false);
          router.push(`/medication/new-prescription?med=${m.id}`);
        }}
      />
    </section>
  );
};

export default CurrentMedications;
