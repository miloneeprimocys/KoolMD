"use client";

import React, { useEffect, useMemo, useState } from "react";

import RadioCheckButtonh from "@/components/RadioCheckButtonh";
import AddButton from "@/components/Addbutton";
import ImportButton from "@/components/ImportButton";
import SearchAndFilter from "@/components/Searchandfilter";
import Table from "@/components/Table";
import TableStatus from "@/components/TableStatus";
import { type TableColumn } from "@/components/Tableheader";
import Content from "@/components/Content";
import Tags, { type TagTone } from "@/components/Tags";
import Pagination from "@/components/Pagination";
import ModalShell from "@/components/Modalshell";

/* ---------- Static data (replace with API data later) ---------- */
export type CatalogMedication = {
  name: string;
  generic: string;
  form: string;
  strength: string;
  category: string;
};

export const MEDICATIONS: CatalogMedication[] = [
  { name: "Amoxicillin 500 mg", generic: "Amoxicillin", form: "Capsule", strength: "500 mg", category: "Antibiotic" },
  { name: "Paracetamol 500 mg", generic: "Acetaminophen", form: "Tablet", strength: "500 mg", category: "Analgesic" },
  { name: "Ibuprofen 400 mg", generic: "Ibuprofen", form: "Tablet", strength: "400 mg", category: "NSAID" },
  { name: "Cetirizine 10 mg", generic: "Cetirizine", form: "Tablet", strength: "10 mg", category: "Antihistamine" },
  { name: "Omeprazole 20 mg", generic: "Omeprazole", form: "Capsule", strength: "20 mg", category: "Proton Pump Inhibitor" },
  { name: "Azithromycin 250 mg", generic: "Azithromycin", form: "Tablet", strength: "250 mg", category: "Antibiotic" },
  { name: "Metformin 500 mg", generic: "Metformin", form: "Tablet", strength: "500 mg", category: "Antidiabetic" },
  { name: "Amlodipine 5 mg", generic: "Amlodipine", form: "Tablet", strength: "5 mg", category: "Cardiovascular" },
  { name: "Ciprofloxacin 500 mg", generic: "Ciprofloxacin", form: "Tablet", strength: "500 mg", category: "Antibiotic" },
  { name: "Diclofenac 50 mg", generic: "Diclofenac", form: "Tablet", strength: "50 mg", category: "NSAID" },
  { name: "Naproxen 250 mg", generic: "Naproxen", form: "Tablet", strength: "250 mg", category: "NSAID" },
  { name: "Loratadine 10 mg", generic: "Loratadine", form: "Tablet", strength: "10 mg", category: "Antihistamine" },
  { name: "Pantoprazole 40 mg", generic: "Pantoprazole", form: "Tablet", strength: "40 mg", category: "Proton Pump Inhibitor" },
  { name: "Esomeprazole 20 mg", generic: "Esomeprazole", form: "Capsule", strength: "20 mg", category: "Proton Pump Inhibitor" },
  { name: "Atorvastatin 20 mg", generic: "Atorvastatin", form: "Tablet", strength: "20 mg", category: "Cardiovascular" },
  { name: "Lisinopril 10 mg", generic: "Lisinopril", form: "Tablet", strength: "10 mg", category: "Cardiovascular" },
  { name: "Losartan 50 mg", generic: "Losartan", form: "Tablet", strength: "50 mg", category: "Cardiovascular" },
  { name: "Metoprolol 50 mg", generic: "Metoprolol", form: "Tablet", strength: "50 mg", category: "Cardiovascular" },
  { name: "Glimepiride 2 mg", generic: "Glimepiride", form: "Tablet", strength: "2 mg", category: "Antidiabetic" },
  { name: "Sitagliptin 100 mg", generic: "Sitagliptin", form: "Tablet", strength: "100 mg", category: "Antidiabetic" },
  { name: "Salbutamol Inhaler", generic: "Salbutamol", form: "Inhaler", strength: "100 mcg", category: "Other" },
  { name: "Prednisolone 5 mg", generic: "Prednisolone", form: "Tablet", strength: "5 mg", category: "Other" },
  { name: "Levothyroxine 50 mcg", generic: "Levothyroxine", form: "Tablet", strength: "50 mcg", category: "Other" },
  { name: "Cephalexin 500 mg", generic: "Cephalexin", form: "Capsule", strength: "500 mg", category: "Antibiotic" },
  { name: "Doxycycline 100 mg", generic: "Doxycycline", form: "Capsule", strength: "100 mg", category: "Antibiotic" },
];

const MAIN_CATEGORIES = ["Antibiotic", "Analgesic", "Antihistamine", "NSAID", "Proton Pump Inhibitor"];
const CHIPS = ["All", ...MAIN_CATEGORIES, "Other"];
const ALL_CATEGORIES = Array.from(new Set(MEDICATIONS.map((m) => m.category)));
const CATEGORY_FILTER = "All Categories";
const PAGE_SIZE = 8;

const CATEGORY_TONE: Record<string, TagTone> = {
  Antibiotic: "info",
  Analgesic: "success",
  NSAID: "violet",
  Antihistamine: "danger",
  "Proton Pump Inhibitor": "warning",
  Antidiabetic: "info",
  Cardiovascular: "danger",
  Other: "neutral",
};

/** "" = all, "Other" = anything outside the main chips */
const matchesCategory = (category: string, filter: string) =>
  !filter || (filter === "Other" ? !MAIN_CATEGORIES.includes(category) : category === filter);

const COLUMNS: TableColumn[] = [
  { key: "select", label: "", className: "w-10" },
  { key: "name", label: "Medication Name" },
  { key: "form", label: "Form" },
  { key: "strength", label: "Strength" },
  { key: "category", label: "Category" },
];

type Props = {
  open: boolean;
  onClose: () => void;
  onSelect: (medication: CatalogMedication) => void;
};

const SelectMedicationModal = ({ open, onClose, onSelect }: Props) => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setSearch("");
    setCategory("");
    setPage(1);
    setSelected(null);
  }, [open]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return MEDICATIONS.filter((m) => {
      if (q && !`${m.name} ${m.generic} ${m.category}`.toLowerCase().includes(q)) return false;
      return matchesCategory(m.category, category);
    });
  }, [search, category]);

  const totalPages = Math.max(Math.ceil(filtered.length / PAGE_SIZE), 1);
  const safePage = Math.min(page, totalPages);
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const rows = visible.map((m) => ({
    select: (
      <RadioCheckButtonh
        type="radio"
        name="catalogMedication"
        checked={selected === m.name}
        onChange={() => setSelected(m.name)}
        aria-label={`Select ${m.name}`}
        className="h-4 w-4 cursor-pointer accent-primary"
      />
    ),
    name: <Content title={m.name} description={m.generic} />,
    form: <Content title={m.form} />,
    strength: <Content title={m.strength} />,
    category: <Tags text={m.category} tone={CATEGORY_TONE[m.category] ?? "neutral"} />,
  }));

  const handleAdd = () => {
    const medication = MEDICATIONS.find((m) => m.name === selected);
    if (!medication) return;
    onSelect(medication);
    onClose();
  };

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title="Select Medication from List"
      titleId="select-medication-title"
      subtitle="Choose a medication to add to this prescription."
      width={860}
      footer={
        <div className="flex items-center justify-center gap-3 sm:justify-end">
          <ImportButton text="Cancel" icon={null} onClick={onClose} className="shrink-0 whitespace-nowrap" />
          <AddButton
            text={
              <span className="whitespace-nowrap">
                <span className="inline sm:hidden">Add Medication</span>
                <span className="hidden sm:inline">Add Selected Medication</span>
              </span>
            }
            icon={null}
            onClick={handleAdd}
            disabled={!selected}
            className="shrink-0 whitespace-nowrap"
          />
        </div>
      }
    >
      <SearchAndFilter
        placeholder="Search medication name, generic name or brand name..."
        value={search}
        onSearch={(v: string) => {
          setSearch(v);
          setPage(1);
        }}
        filters={[{ label: CATEGORY_FILTER, options: ALL_CATEGORIES }]}
        selectedFilters={{ [CATEGORY_FILTER]: category }}
        onFilterChange={(_label: string, value: string) => {
          setCategory(value);
          setPage(1);
        }}
        showDateRange={false}
      />

      {/* Category chips */}
      <div className="flex flex-wrap gap-2" role="group" aria-label="Medication categories">
        {CHIPS.map((chip) => {
          const value = chip === "All" ? "" : chip;
          const active = category === value;
          return (
            <button
              key={chip}
              type="button"
              aria-pressed={active}
              onClick={() => {
                setCategory(value);
                setPage(1);
              }}
              className={`cursor-pointer rounded-full border px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${
                active
                  ? "border-primary bg-primary text-on-primary"
                  : "border-border bg-card text-heading hover:border-primary/40 hover:bg-primary/5"
              }`}
            >
              {chip}
            </button>
          );
        })}
      </div>

      <div className="overflow-hidden rounded-xl border border-border">
        {visible.length === 0 ? (
          <TableStatus variant="empty" message="No medications match your search." />
        ) : (
          <Table columns={COLUMNS} rows={rows} bordered={false} />
        )}
      </div>

      {filtered.length > 0 && (
        <Pagination
          page={safePage}
          totalPages={totalPages}
          totalItems={filtered.length}
          pageSize={PAGE_SIZE}
          itemLabel="medications"
          onChange={setPage}
        />
      )}
    </ModalShell>
  );
};

export default SelectMedicationModal;