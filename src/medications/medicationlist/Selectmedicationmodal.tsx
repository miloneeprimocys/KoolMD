"use client";

import React, { useMemo, useState } from "react";
import { ArrowRight, ChevronRight, Pill } from "lucide-react";

import AddButton from "@/components/Addbutton";
import ImportButton from "@/components/ImportButton";
import Pagination from "@/components/Pagination";
import RadioCheckButtonh from "@/components/RadioCheckButtonh";
import Tags from "@/components/Tags";
import ModalShell, { SignupDropdown, SignupField, toOptions } from "@/components/Modalshell";

/* ---------- Medication catalog (search modal) ---------- */
export type CatalogMed = {
  id: string; name: string; generic: string; brands: string; forms: string[];
  strengths: string[]; category: string; dea: string; description: string;
};

const c = (id: string, name: string, brands: string, forms: string[], strengths: string[], category: string, description: string, generic = name): CatalogMed =>
  ({ id, name, generic, brands, forms, strengths, category, dea: "Not controlled", description });

const AMOX = "Amoxicillin is a penicillin antibiotic used to treat bacterial infections.";

export const CATALOG: CatalogMed[] = [
  c("cat1", "Amoxicillin", "Amoxil, Larotid, Moxatag", ["Capsule", "Tablet", "Suspension"], ["250 mg", "500 mg", "875 mg"], "Antibiotic", AMOX),
  c("cat2", "Amoxicillin/Clavulanate", "Augmentin", ["Tablet", "Suspension"], ["500/125 mg", "875/125 mg"], "Antibiotic", "Combination antibiotic that treats infections resistant to amoxicillin alone.", "Amoxicillin + Clavulanate"),
  c("cat3", "Amoxicillin Trihydrate", "Amoxil", ["Capsule", "Tablet"], ["250 mg", "500 mg"], "Antibiotic", AMOX, "Amoxicillin"),
  c("cat4", "Amoxicillin for Injection", "Amoxil IV", ["Injection"], ["500 mg", "1 g"], "Antibiotic", AMOX, "Amoxicillin"),
  c("cat5", "Amoxicillin Oral Suspension", "Amoxil Suspension", ["Suspension"], ["125 mg/5 mL", "250 mg/5 mL"], "Antibiotic", AMOX, "Amoxicillin"),
  c("cat6", "Amoxicillin Chewable Tablet", "Amoxil Chewable", ["Tablet"], ["125 mg", "250 mg"], "Antibiotic", AMOX, "Amoxicillin"),
  c("cat7", "Amoxicillin Extended Release", "Moxatag", ["Tablet"], ["775 mg"], "Antibiotic", AMOX, "Amoxicillin"),
  c("cat8", "Lisinopril", "Prinivil, Zestril", ["Tablet"], ["5 mg", "10 mg", "20 mg", "40 mg"], "ACE Inhibitor", "Used to treat high blood pressure and heart failure."),
  c("cat9", "Metformin", "Glucophage", ["Tablet"], ["500 mg", "850 mg", "1000 mg"], "Biguanide", "Used to control blood sugar in type 2 diabetes."),
  c("cat10", "Atorvastatin", "Lipitor", ["Tablet"], ["10 mg", "20 mg", "40 mg", "80 mg"], "Statin", "Used to lower cholesterol and reduce cardiovascular risk."),
  c("cat11", "Albuterol Inhaler", "ProAir, Ventolin", ["Inhaler"], ["90 mcg"], "Bronchodilator", "Relieves wheezing and shortness of breath caused by asthma.", "Albuterol"),
  c("cat12", "Omeprazole", "Prilosec", ["Capsule"], ["20 mg", "40 mg"], "PPI", "Reduces stomach acid; treats reflux and ulcers."),
  c("cat13", "Vitamin D3", "Cholecalciferol", ["Tablet", "Capsule"], ["1000 IU", "2000 IU"], "Supplement", "Supports bone health and calcium absorption.", "Cholecalciferol"),
];
export const getCatalogMed = (id?: string | null) => CATALOG.find((m) => m.id === id);


 
const PAGE_SIZE = 7;
const uniq = (list: string[]) => Array.from(new Set(list)).sort();
const CATEGORIES = toOptions(uniq(CATALOG.map((m) => m.category)));
const FORMS = toOptions(uniq(CATALOG.flatMap((m) => m.forms)));
const STRENGTHS = toOptions(uniq(CATALOG.flatMap((m) => m.strengths)));

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (med: CatalogMed) => void;
}

const SelectMedicationModal = ({ open, onClose, onSelect }: Props) => {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [form, setForm] = useState("");
  const [strength, setStrength] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CATALOG.filter(
      (m) =>
        (!q || [m.name, m.brands, m.generic].some((f) => f.toLowerCase().includes(q))) &&
        (!category || m.category === category) &&
        (!form || m.forms.includes(form)) &&
        (!strength || m.strengths.includes(strength)),
    );
  }, [query, category, form, strength]);

  const totalPages = Math.max(Math.ceil(filtered.length / PAGE_SIZE), 1);
  const safePage = Math.min(page, totalPages);
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const active = filtered.find((m) => m.id === selectedId) ?? filtered[0];

  const reset = () => {
    setQuery(""); setCategory(""); setForm(""); setStrength(""); setSelectedId(""); setPage(1);
  };
  const handleClose = () => {
    onClose();
    reset();
  };
  const handleSelect = () => {
    if (!active) return;
    onSelect(active);
    reset();
  };

  const filterChange = (setter: (v: string) => void) => (v: string) => {
    setter(v);
    setPage(1);
  };

  return (
    <ModalShell
      open={open}
      onClose={handleClose}
      title="Select Medication from List"
      width={920}
      footer={
        <div className="flex items-center justify-end gap-3">
          <ImportButton text="Cancel" icon={null} onClick={handleClose} />
          <AddButton
            text="Select Medication"
            icon={<ArrowRight className="h-4 w-4" />}
            onClick={handleSelect}
            disabled={!active}
          />
        </div>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.6fr)_repeat(3,minmax(0,1fr))]">
        <SignupField
          name="medSearch"
          label="Search"
          placeholder="Search medication..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
        />
        <SignupDropdown name="medCategory" label="Category" placeholder="All Categories" searchable={false}
          options={CATEGORIES} value={category} onChange={filterChange(setCategory)} portalMenu portalMenuZIndex={1000} />
        <SignupDropdown name="medForm" label="Form" placeholder="All Forms" searchable={false}
          options={FORMS} value={form} onChange={filterChange(setForm)} portalMenu portalMenuZIndex={1000} />
        <SignupDropdown name="medStrength" label="Strength" placeholder="All Strengths" searchable={false}
          options={STRENGTHS} value={strength} onChange={filterChange(setStrength)} portalMenu portalMenuZIndex={1000} />
      </div>

      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,320px)]">
        {/* List */}
        <div className="min-w-0 space-y-2">
          {visible.length === 0 ? (
            <p className="rounded-xl border border-border px-4 py-10 text-center text-sm text-body">No medications found.</p>
          ) : (
            <ul className="space-y-2">
              {visible.map((m) => {
                const isActive = active?.id === m.id;
                return (
                  <li key={m.id}>
                    <label
                      className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors ${
                        isActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                      }`}
                    >
                      <RadioCheckButtonh
                        type="radio"
                        name="catalogMed"
                        checked={isActive}
                        onChange={() => setSelectedId(m.id)}
                        className="h-4 w-4 shrink-0 cursor-pointer accent-primary"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-heading">{m.name}</span>
                        <span className="mt-0.5 block">
                          <Tags text={m.category} tone="info" size="xs" />
                        </span>
                      </span>
                      <span className="hidden max-w-[120px] text-right text-xs text-body sm:block">{m.forms.join(", ")}</span>
                      <ChevronRight className="h-4 w-4 shrink-0 text-body" />
                    </label>
                  </li>
                );
              })}
            </ul>
          )}
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
        </div>

        {/* Details */}
        <aside className="min-w-0 rounded-xl border border-border p-4">
          {active ? (
            <>
              <h4 className="text-base font-semibold text-heading">{active.name}</h4>
              <p className="text-xs text-body">{active.category}</p>
              <div className="my-4 flex h-24 items-center justify-center rounded-xl bg-primary/5 text-primary">
                <Pill className="h-12 w-12" />
              </div>
              <dl className="space-y-2.5 text-xs">
                {[
                  ["Generic Name", active.generic],
                  ["Brand Names", active.brands],
                  ["Dosage Forms", active.forms.join(", ")],
                  ["Strengths", active.strengths.join(", ")],
                  ["Category", active.category],
                  ["DEA Class", active.dea],
                  ["Description", active.description],
                ].map(([k, v]) => (
                  <div key={k} className="grid grid-cols-[92px_minmax(0,1fr)] gap-2">
                    <dt className="text-body">{k}</dt>
                    <dd className="break-words font-medium text-heading">{v}</dd>
                  </div>
                ))}
              </dl>
            </>
          ) : (
            <p className="py-10 text-center text-sm text-body">Select a medication to see details.</p>
          )}
        </aside>
      </div>
    </ModalShell>
  );
};

export default SelectMedicationModal;