"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  AlertCircle,
  Bug,
  FileText,
  Flower2,
  Nut,
  Pill,
  Pencil,
  Search,
  Shell,
  ShieldAlert,
  Trash2,
} from "lucide-react";

import Table from "@/components/Table";
import { type TableColumn } from "@/components/Tableheader";
import Content from "@/components/Content";
import Tags, { type TagTone } from "@/components/Tags";
import AddButton from "@/components/Addbutton";
import ImportButton from "@/components/ImportButton";
import EditButton from "@/components/EditButton";
import Actions from "@/components/Actions";
import { useAppDispatch } from "@/hooks/useAppHooks";
import {
  showModal,
  showViewAllergy,
  showEditAllergy,
  showDeleteAllergy,
} from "@/redux/slices/dialogslice";
import {
  ACTIONS_COL,
  DENSE,
  SectionCard,
  TONES,
  kebab,
  type Tone,
} from "../medicalhistory/Medicalhistory";
import type { Allergy } from "./ViewAllergy";

/* ---------- Static data ---------- */
const ALLERGIES: Allergy[] = [
  { id: "allergy-1", allergen: "Penicillin", type: "Medication", reaction: "Rash, Hives", severity: "High", dateIdentified: "2020-03-12", status: "Active", notes: "Avoid all penicillin-class antibiotics" },
  { id: "allergy-2", allergen: "Peanuts", type: "Food", reaction: "Anaphylaxis, Swelling", severity: "High", dateIdentified: "2018-06-05", status: "Active", notes: "Carries epinephrine auto-injector" },
  { id: "allergy-3", allergen: "Pollen", type: "Environmental", reaction: "Sneezing, Itchy eyes", severity: "Moderate", dateIdentified: "2019-04-10", status: "Active", notes: "Seasonal allergies (spring)" },
  { id: "allergy-4", allergen: "Dust Mites", type: "Environmental", reaction: "Runny nose, Cough", severity: "Mild", dateIdentified: "2021-01-15", status: "Active", notes: "Use air purifier at home" },
  { id: "allergy-5", allergen: "Shellfish", type: "Food", reaction: "Hives, Nausea", severity: "High", dateIdentified: "2017-08-02", status: "Active", notes: "Avoid shellfish and related products" },
];

const ALLERGY_ICON: Record<string, typeof Pill> = {
  Medication: Pill,
  Food: Nut,
  Environmental: Flower2,
  Insect: Bug,
  Latex: Shell,
  Other: AlertCircle,
};

const SEVERITY_TONE: Record<Allergy["severity"], TagTone> = {
  High: "danger",
  Moderate: "warning",
  Mild: "info",
};

const DEFAULT_NOTES = [
  "Patient has a history of severe allergic reactions to penicillin and peanuts.",
  "Carries an epinephrine auto-injector. Recommend monitoring for cross-reactivity with related medications and food products.",
].join("\n");

const col = (key: string, label: string): TableColumn => ({ key, label, className: DENSE });

const COLUMNS: TableColumn[] = [
  col("allergen", "Allergen"),
  col("type", "Type"),
  col("reaction", "Reaction"),
  col("severity", "Severity"),
  col("date", "Date Identified"),
  col("status", "Status"),
  col("notes", "Notes"),
  ACTIONS_COL,
];

const MENU_ITEMS = [
  { key: "view", label: "View Details", icon: Search, isRedIcon: false },
  { key: "edit", label: "Edit Allergy", icon: Pencil, isRedIcon: false },
  { key: "delete", label: "Delete", icon: Trash2, isRedIcon: false },
] as const;

/* ---------- Component ---------- */
const Allergies = () => {
  const dispatch = useAppDispatch();
  const [allergyList, setAllergyList] = useState<Allergy[]>(ALLERGIES);
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

  const handleMenu = (key: string, allergy: Allergy) => {
    setOpenMenuId(null);
    if (key === "view") {
      dispatch(showViewAllergy(allergy));
    } else if (key === "edit") {
      dispatch(showEditAllergy(allergy));
    } else if (key === "delete") {
      dispatch(showDeleteAllergy(allergy));
    }
  };

  const highRisk = allergyList.filter((a) => a.severity === "High");

  const [notes, setNotes] = useState(DEFAULT_NOTES);
  const [draft, setDraft] = useState(DEFAULT_NOTES);
  const [editingNotes, setEditingNotes] = useState(false);

  const startEditNotes = () => {
    setDraft(notes);
    setEditingNotes(true);
  };
  const saveNotes = () => {
    setNotes(draft.trim());
    setEditingNotes(false);
  };
  const cancelEditNotes = () => setEditingNotes(false);

  const rows = allergyList.map((a) => {
    const Icon = ALLERGY_ICON[a.type] || AlertCircle;
    return {
      allergen: (
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-danger/10 text-danger">
            <Icon className="h-4 w-4" />
          </span>
          <Content title={a.allergen} truncate />
        </div>
      ),
      type: <Content title={a.type} truncate />,
      reaction: <Content title={a.reaction} truncate />,
      severity: <Tags text={a.severity} tone={SEVERITY_TONE[a.severity]} />,
      date: <Content title={a.dateIdentified} truncate />,
      status: <Tags text={a.status} tone={a.status === "Active" ? "success" : "neutral"} />,
      notes: <Content title={a.notes} truncate />,
      actions: (
        <div
          className="relative flex w-full items-center justify-center"
          ref={openMenuId === a.id ? menuRef : undefined}
        >
          <Actions
            actions={["more"]}
            onAction={() => setOpenMenuId((cur) => (cur === a.id ? null : a.id))}
          />
          {openMenuId === a.id && (
            <div
              ref={menuPanelRef}
              className={`absolute right-0 z-30 w-56 rounded-xl border border-border bg-card py-1.5 shadow-lg ${
                menuPlacement === "above" ? "bottom-full mb-1" : "top-full mt-1"
              }`}
            >
              {MENU_ITEMS.map(({ key, label, icon: Icon, isRedIcon }) => {
                const isDelete = key === "delete";
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleMenu(key, a)}
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
    };
  });

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Allergies table */}
      <SectionCard
        className="!h-auto"
        icon={ShieldAlert}
        tone="red"
        title="Allergies"
        subtitle="Manage patient allergies and adverse reactions."
        action={<AddButton text="Add Allergy" onClick={() => dispatch(showModal("AddAllergy"))} />}
      >
        <Table columns={COLUMNS} rows={rows} />
      </SectionCard>

      <div className="grid grid-cols-1 ">
    
        {/* Allergy notes */}
        <SectionCard
          className="!h-auto"
          icon={FileText}
          tone="blue"
          title="Allergy Notes"
          action={
            !editingNotes ? (
              <EditButton section="Allergy Notes" onEdit={startEditNotes} />
            ) : undefined
          }
        >
          {editingNotes ? (
            <div className="space-y-3">
              <textarea
                autoFocus
                rows={5}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") cancelEditNotes();
                  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) saveNotes();
                }}
                placeholder="Type allergy notes here..."
                aria-label="Allergy notes"
                className="w-full resize-y rounded-xl border border-border bg-card p-4 text-sm leading-relaxed text-heading outline-none transition-colors duration-200 placeholder:text-placeholder hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <div className="flex justify-end gap-3">
                <ImportButton text="Cancel" icon={null} onClick={cancelEditNotes} />
                <AddButton text="Save Notes" icon={null} onClick={saveNotes} />
              </div>
            </div>
          ) : (
            <div className="whitespace-pre-wrap rounded-xl border border-border bg-primary/5 p-4 text-sm leading-relaxed text-heading">
              {notes || <span className="text-body">No notes added yet. Click Edit to add some.</span>}
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
};

export default Allergies;