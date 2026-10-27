"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { CircleX, Clock, Pencil, Pill, Search, Trash2 } from "lucide-react";

import Table from "@/components/Table";
import { type TableColumn } from "@/components/Tableheader";
import Content from "@/components/Content";
import Tags from "@/components/Tags";
import AddButton from "@/components/Addbutton";
import Actions from "@/components/Actions";
import { useAppDispatch } from "@/hooks/useAppHooks";
import {
  showModal,
  showViewMedication,
  showEditMedication,
  showDeleteMedication,
  showMarkInactiveMedication,
} from "@/redux/slices/dialogslice";
import {
  ACTIONS_COL,
  DENSE,
  ScrollArea,
  SectionCard,
  TONES,
  kebab,
  type Tone,
} from "../medicalhistory/Medicalhistory";
import type { Medication } from "./ViewMedication";

/* ---------- Static data ---------- */
const CURRENT: Medication[] = [
  { id: "cur-1", name: "Albuterol Inhaler", condition: "Asthma", type: "Inhaler", dosage: "2 puffs", dosageNote: "90 mcg", frequency: "As needed", frequencyNote: "For wheezing", route: "Inhalation", startDate: "2023-03-15", endDate: "", provider: "Dr. Sarah Lee", providerCode: "KMD-1001", instructions: "Use before exercise", notes: "Use before exercise", status: "Active", tone: "primary" },
  { id: "cur-2", name: "Cetirizine", condition: "Allergic Rhinitis", type: "Tablet", dosage: "10 mg", dosageNote: "", frequency: "Once daily", frequencyNote: "Morning", route: "Oral", startDate: "2022-05-02", endDate: "", provider: "Dr. James Wilson", providerCode: "KMD-1002", instructions: "For seasonal allergies", notes: "For seasonal allergies", status: "Active", tone: "pink" },
  { id: "cur-3", name: "Montelukast", condition: "Asthma", type: "Tablet", dosage: "10 mg", dosageNote: "", frequency: "Once daily", frequencyNote: "Night", route: "Oral", startDate: "2023-01-10", endDate: "", provider: "Dr. Emily Davis", providerCode: "KMD-1003", instructions: "Take at bedtime", notes: "Take at bedtime", status: "Active", tone: "success" },
  { id: "cur-4", name: "Vitamin D3", condition: "Supplement", type: "Tablet", dosage: "1000 IU", dosageNote: "", frequency: "Once daily", frequencyNote: "Morning", route: "Oral", startDate: "2024-02-01", endDate: "", provider: "Dr. Sarah Lee", providerCode: "KMD-1001", instructions: "General health", notes: "General health", status: "Active", tone: "warning" },
];

const PAST: Medication[] = [
  { id: "past-1", name: "Amoxicillin", condition: "Antibiotic", type: "Capsule", dosage: "500 mg", dosageNote: "", frequency: "3 times daily", frequencyNote: "", route: "Oral", startDate: "2022-08-15", endDate: "2022-08-22", provider: "Dr. Michael Brown", providerCode: "KMD-1004", instructions: "", notes: "", status: "Inactive", tone: "pink" },
  { id: "past-2", name: "Prednisone", condition: "Steroid", type: "Tablet", dosage: "20 mg", dosageNote: "", frequency: "Once daily", frequencyNote: "", route: "Oral", startDate: "2021-03-01", endDate: "2021-03-07", provider: "Dr. James Wilson", providerCode: "KMD-1002", instructions: "", notes: "", status: "Inactive", tone: "violet" },
  { id: "past-3", name: "Ibuprofen", condition: "Pain Reliever", type: "Tablet", dosage: "400 mg", dosageNote: "", frequency: "As needed", frequencyNote: "", route: "Oral", startDate: "2021-01-05", endDate: "2021-02-01", provider: "Dr. Emily Davis", providerCode: "KMD-1003", instructions: "", notes: "", status: "Inactive", tone: "primary" },
];

const col = (key: string, label: string): TableColumn => ({ key, label, className: DENSE });

const CURRENT_COLUMNS: TableColumn[] = [
  col("name", "Medication Name"),
  col("dosage", "Dosage"),
  col("frequency", "Frequency"),
  col("start", "Start Date"),
  col("end", "End Date"),
  col("provider", "Prescribing Provider"),
  col("status", "Status"),
  col("notes", "Notes"),
  ACTIONS_COL,
];

const PAST_COLUMNS: TableColumn[] = [
  col("name", "Medication Name"),
  col("dosage", "Dosage"),
  col("frequency", "Frequency"),
  col("start", "Start Date"),
  col("end", "End Date"),
  col("reason", "Reason for Discontinuation"),
  col("provider", "Prescribing Provider"),
  ACTIONS_COL,
];

const NameCell = ({ name, condition, tone }: { name: string; condition: string; tone: Medication["tone"] }) => (
  <div className="flex min-w-0 items-center gap-3">
    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${TONES[tone]}`}>
      <Pill className="h-4 w-4" />
    </span>
    <Content title={name} description={condition} truncate />
  </div>
);

const MENU_ITEMS = [
  { key: "view", label: "View Details", Icon: Search, isRedIcon: false },
  { key: "edit", label: "Edit Medication", Icon: Pencil, isRedIcon: false },
  { key: "inactive", label: "Mark as Inactive / Stop", Icon: CircleX, isRedIcon: true },
  { key: "delete", label: "Delete", Icon: Trash2, isRedIcon: false },
] as const;

/* ---------- Component ---------- */
const Medications = () => {
  const dispatch = useAppDispatch();
  const [currentList, setCurrentList] = useState<Medication[]>(CURRENT);
  const [pastList, setPastList] = useState<Medication[]>(PAST);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [menuPlacement, setMenuPlacement] = useState<"above" | "below">("below");
  const menuRef = useRef<HTMLDivElement | null>(null);
  const menuPanelRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const trigger = menuRef.current;
    const menu = menuPanelRef.current;
    if (!openMenuId || !trigger || !menu) return;

    const triggerRect = trigger.getBoundingClientRect();
    const menuHeight = menu.getBoundingClientRect().height || 180;
    const tableContainer = trigger.closest(".table-scrollbar, table, .overflow-y-auto");
    const containerBottom = tableContainer
      ? tableContainer.getBoundingClientRect().bottom
      : window.innerHeight;
    const spaceBelow = Math.min(window.innerHeight, containerBottom) - triggerRect.bottom;
    const spaceAbove = triggerRect.top;
    setMenuPlacement(spaceBelow < menuHeight && spaceAbove > menuHeight ? "above" : "below");
  }, [openMenuId]);

  /* Close dropdown on outside click or Escape */
  useEffect(() => {
    if (!openMenuId) return;
    const onMouseDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenMenuId(null);
    };
    document.addEventListener("mousedown", onMouseDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [openMenuId]);

  const handleMenu = (key: string, m: Medication) => {
    setOpenMenuId(null);
    if (key === "view") {
      dispatch(showViewMedication(m));
    } else if (key === "edit") {
      dispatch(showEditMedication(m));
    } else if (key === "inactive") {
      dispatch(showMarkInactiveMedication(m));
    } else if (key === "delete") {
      dispatch(showDeleteMedication(m));
    }
  };

  const currentRows = currentList.map((m) => ({
    name: <NameCell name={m.name} condition={m.condition} tone={m.tone} />,
    dosage: <Content title={m.dosage} description={m.dosageNote} truncate />,
    frequency: <Content title={m.frequency} description={m.frequencyNote} truncate />,
    start: <Content title={m.startDate} truncate />,
    end: <Content title="—" />,
    provider: <Content title={m.provider} description={m.providerCode} truncate />,
    status: <Tags text={m.status} tone={m.status === "Active" ? "success" : "neutral"} />,
    notes: <Content title={m.notes} truncate />,
    actions: (
      <div
        className="relative flex w-full items-center justify-center"
        ref={openMenuId === m.id ? menuRef : undefined}
      >
        <Actions
          actions={["more"]}
          onAction={() => setOpenMenuId((cur) => (cur === m.id ? null : m.id))}
        />
        {openMenuId === m.id && (
          <div
            ref={menuPanelRef}
            className={`absolute right-0 z-30 w-56 rounded-xl border border-border bg-card py-1.5 shadow-lg ${
              menuPlacement === "above" ? "bottom-full mb-1" : "top-full mt-1"
            }`}
          >
            {MENU_ITEMS.map(({ key, label, Icon, isRedIcon }) => {
              const isDelete = key === "delete";
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleMenu(key, m)}
                  className={`group flex w-full cursor-pointer items-center gap-2.5 px-3.5 py-2 text-left text-sm transition-colors ${
                    isDelete
                      ? "text-heading hover:bg-danger/10 hover:text-danger"
                      : "text-heading hover:bg-primary/5 hover:text-primary"
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 shrink-0 transition-colors ${
                      isRedIcon
                        ? "text-danger"
                        : isDelete
                        ? "text-label group-hover:text-danger"
                        : "text-label group-hover:text-primary"
                    }`}
                  />
                  <span className="truncate">{label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    ),
  }));

  const pastRows = pastList.map((m) => ({
    name: <NameCell name={m.name} condition={m.condition} tone={m.tone} />,
    dosage: <Content title={m.dosage} description={m.dosageNote} truncate />,
    frequency: <Content title={m.frequency} description={m.frequencyNote} truncate />,
    start: <Content title={m.startDate} truncate />,
    end: <Content title={m.endDate} truncate />,
    reason: <Content title={m.endDate ? "Completed" : "—"} truncate />,
    provider: <Content title={m.provider} description={m.providerCode} truncate />,
    actions: kebab,
  }));
return (
  <div className="space-y-4 sm:space-y-5">
    <SectionCard
      className="!h-[500px]"
      icon={Pill}
      tone="blue"
      title="Current Medications"
      subtitle="Medications the patient is currently taking."
      action={<AddButton text="Add Medication" onClick={() => dispatch(showModal("AddMedication"))} />}
    >
      <ScrollArea>
        <Table columns={CURRENT_COLUMNS} rows={currentRows} />
      </ScrollArea>
    </SectionCard>

    <SectionCard
      className="!h-[420px]"
      icon={Clock}
      tone="violet"
      title="Past Medications"
      subtitle="Medications the patient no longer takes."
    >
      <ScrollArea>
        <Table columns={PAST_COLUMNS} rows={pastRows} />
      </ScrollArea>
    </SectionCard>
  </div>
);
};

export default Medications;