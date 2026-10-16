"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { History, MoreVertical, Pill } from "lucide-react";

import EditButton from "@/components/EditButton";
import Tags, { type TagTone } from "@/components/Tags";
import { Panel } from "./PrescriptionDetailsSection";

/* ---------- Static data ---------- */
type CatalogItem = { name: string; form: string; category: string };

const MEDICATION_CATALOG: CatalogItem[] = [
  { name: "Paracetamol 500 mg", form: "Tablet", category: "Analgesic • Antipyretic" },
  { name: "Ibuprofen 400 mg", form: "Tablet", category: "NSAID" },
  { name: "Amoxicillin 500 mg", form: "Capsule", category: "Antibiotic" },
  { name: "Cetirizine 10 mg", form: "Tablet", category: "Antihistamine" },
  { name: "Omeprazole 20 mg", form: "Capsule", category: "Proton Pump Inhibitor" },
];

const CATEGORY_ALL = "all";

const PREVIOUS: { name: string; sig: string; date: string; status: "Active" | "Completed" }[] = [
  { name: "Omeprazole 20 mg", sig: "1 capsule once daily", date: "Aug 14, 2026", status: "Active" },
  { name: "Cetirizine 10 mg", sig: "1 tablet at night", date: "May 22, 2026", status: "Completed" },
  { name: "Amoxicillin 500 mg", sig: "1 capsule three times daily", date: "Mar 10, 2026", status: "Completed" },
  { name: "Ibuprofen 400 mg", sig: "1 tablet twice daily", date: "Jan 5, 2026", status: "Completed" },
];

const PREVIOUS_TONES: Record<"Active" | "Completed", TagTone> = {
  Active: "success",
  Completed: "neutral",
};

/* ---------- Props ---------- */
type Props = {
  medListRef: React.RefObject<HTMLDivElement | null>;
  catalogSearch: string;
  setCatalogSearch: (v: string) => void;
  catalogCategory: string;
  setCatalogCategory: (v: string) => void;
  onAddFromCatalog: (name: string) => void;
  patientId?: string | null;
};

const PrescriptionSidebar = ({
  medListRef,
  catalogSearch,
  setCatalogSearch,
  catalogCategory,
  setCatalogCategory,
  onAddFromCatalog,
  patientId,
}: Props) => {
  const router = useRouter();


  return (
    <aside className="min-w-0 space-y-4 sm:space-y-5">
   

      {/* Previous prescriptions */}
      <Panel
        icon={History}
        title="Previous Prescriptions"
        action={
          <EditButton
            section="Previous Prescriptions"
            variant="viewAll"
            onEdit={() => router.push("/prescriptions")}
          />
        }
      >
        <ul className="divide-y divide-border">
          {PREVIOUS.map((p) => (
            <li key={p.name} className="flex items-center gap-3 py-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Pill className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-heading">{p.name}</p>
                <p className="truncate text-xs text-body">{p.sig}</p>
              </div>
              <span className="hidden whitespace-nowrap text-xs text-body sm:inline">{p.date}</span>
              <Tags text={p.status} tone={PREVIOUS_TONES[p.status]} />
              <button
                type="button"
                aria-label={`More actions for ${p.name}`}
                className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-label transition-colors hover:bg-primary/10 hover:text-primary"
              >
                <MoreVertical className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      </Panel>

   
    </aside>
  );
};

export default PrescriptionSidebar;