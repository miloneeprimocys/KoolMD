"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Check, Minus, Plus } from "lucide-react";

import AddButton from "@/components/Addbutton";
import ImportButton from "@/components/ImportButton";

import ModalShell, { ModalDateField, ModalTextarea, OptLabel, ReqLabel, SignupDropdown, SignupField, todayISO, toOptions, FieldLabel, addDays, uid } from "@/components/Modalshell";
import type { Medication } from "./MedicationsTab";

const CURRENT_PROVIDER = "Dr. Sarah Miller";

const CATALOG = [
  { name: "Metformin", generic: "Metformin Hydrochloride", form: "Tablet" },
  { name: "Atorvastatin", generic: "Atorvastatin Calcium", form: "Tablet" },
  { name: "Omeprazole", generic: "Omeprazole", form: "Capsule" },
  { name: "Sumatriptan", generic: "Sumatriptan Succinate", form: "Tablet" },
  { name: "Amoxicillin", generic: "Amoxicillin", form: "Capsule" },
  { name: "Ibuprofen", generic: "Ibuprofen", form: "Tablet" },
  { name: "Cetirizine", generic: "Cetirizine Hydrochloride", form: "Tablet" },
  { name: "Albuterol Inhaler", generic: "Albuterol Sulfate", form: "Inhaler" },
];
const DOSE_UNITS = toOptions(["mg", "mcg", "g", "ml", "puffs"]);
const ROUTES = toOptions(["Oral", "Topical", "Inhalation", "Intravenous", "Intramuscular", "Subcutaneous"]);
const FREQUENCIES = toOptions(["Once daily", "Twice daily", "Three times daily", "Every 8 hours", "As needed"]);
const DURATION_UNITS = toOptions(["Days", "Weeks", "Months"]);
const QTY_UNITS = toOptions(["Tablets", "Capsules", "ml", "Units"]);
const PHARMACIES = toOptions(["CVS Pharmacy", "Walgreens", "Local Pharmacy"]);
const DAYS_PER: Record<string, number> = { Days: 1, Weeks: 7, Months: 30 };

type Errors = Partial<Record<"med" | "dosage" | "route" | "frequency" | "start", string>>;
type Props = { open: boolean; onClose: () => void; onAdd: (m: Medication) => void };

const AddMedicationModal = ({ open, onClose, onAdd }: Props) => {
  const [search, setSearch] = useState("");
  const [picked, setPicked] = useState<(typeof CATALOG)[number] | null>(null);
  const [dosage, setDosage] = useState("");
  const [unit, setUnit] = useState("mg");
  const [route, setRoute] = useState("Oral");
  const [frequency, setFrequency] = useState("");
  const [duration, setDuration] = useState("30");
  const [durUnit, setDurUnit] = useState("Days");
  const [start, setStart] = useState(todayISO());
  const [endManual, setEndManual] = useState<string | null>(null);
  const [qty, setQty] = useState("");
  const [qtyUnit, setQtyUnit] = useState("Tablets");
  const [refills, setRefills] = useState(0);
  const [pharmacy, setPharmacy] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Errors>({});

  useEffect(() => {
    if (!open) return;
    setSearch(""); setPicked(null); setDosage(""); setUnit("mg"); setRoute("Oral"); setFrequency("");
    setDuration("30"); setDurUnit("Days"); setStart(todayISO()); setEndManual(null); setQty("");
    setQtyUnit("Tablets"); setRefills(0); setPharmacy(""); setNotes(""); setErrors({});
  }, [open]);

  const autoEnd = Number(duration) > 0 ? addDays(start, Number(duration) * DAYS_PER[durUnit]) : "";
  const end = endManual ?? autoEnd;
  const clear = (k: keyof Errors) => setErrors((p) => ({ ...p, [k]: undefined }));

  const matches = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q && !picked ? CATALOG.filter((m) => `${m.name} ${m.generic}`.toLowerCase().includes(q)) : [];
  }, [search, picked]);

  const submit = () => {
    const e: Errors = {};
    if (!picked) e.med = "Select a medication";
    if (!dosage.trim() || Number(dosage) <= 0) e.dosage = "Enter a valid dosage";
    if (!route) e.route = "Route is required";
    if (!frequency) e.frequency = "Frequency is required";
    if (!start) e.start = "Start date is required";
    setErrors(e);
    if (Object.keys(e).length || !picked) return;
    onAdd({
      id: uid("MED"),
      name: picked.name,
      strength: `${dosage} ${unit} ${picked.form.toLowerCase()}`,
      dosage: `${dosage} ${unit}`,
      frequency,
      start,
      status: "Active",
      prescribedBy: CURRENT_PROVIDER,
      notes: notes.trim(),
    });
  };

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title="Add Medication"
      width={860}
      zIndexClass="z-[350]"
      footer={
        <div className="flex items-center justify-center gap-3 sm:justify-end">
          <ImportButton text="Cancel" icon={null} onClick={onClose} />
          <AddButton text="Add Medication" icon={<Check className="h-4 w-4" />} onClick={submit} className="whitespace-nowrap" />
        </div>
      }
    >
      <div className="grid gap-x-6 gap-y-3 md:grid-cols-2">
        {/* ---------- Left ---------- */}
        <div className="min-w-0 space-y-3">
          <div>
            <SignupField
              name="medication"
              label={<ReqLabel>Medication</ReqLabel>}
              placeholder="Search medication..."
              value={picked ? picked.name : search}
              onChange={(e) => { setPicked(null); setSearch(e.target.value); clear("med"); }}
              error={errors.med}
            />
            {matches.length > 0 && (
              <ul className="mt-2 max-h-40 overflow-y-auto rounded-xl border border-border bg-card hide-scrollbar">
                {matches.map((m) => (
                  <li key={m.name}>
                    <button type="button" onClick={() => { setPicked(m); setSearch(m.name); }} className="flex w-full cursor-pointer items-center justify-between gap-3 px-3 py-2 text-left hover:bg-primary/5">
                      <span><span className="block text-sm font-semibold text-heading">{m.name}</span><span className="block text-xs text-body">{m.generic}</span></span>
                      <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs text-primary">{m.form}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="grid grid-cols-[minmax(0,1fr)_110px] gap-3">
            <SignupField name="dosage" type="number" label={<ReqLabel>Dosage</ReqLabel>} placeholder="500" value={dosage} onChange={(e) => { setDosage(e.target.value); clear("dosage"); }} error={errors.dosage} />
            <SignupDropdown name="doseUnit" label={<span className="invisible">Unit</span>} placeholder="Unit" options={DOSE_UNITS} value={unit} onChange={setUnit} searchable={false} portalMenu portalMenuZIndex={1000} />
          </div>
          <SignupDropdown name="route" label={<ReqLabel>Route</ReqLabel>} placeholder="Select route" options={ROUTES} value={route} onChange={(v) => { setRoute(v); clear("route"); }} error={errors.route} searchable={false} portalMenu portalMenuZIndex={1000} />
          <SignupDropdown name="frequency" label={<ReqLabel>Frequency</ReqLabel>} placeholder="Select frequency" options={FREQUENCIES} value={frequency} onChange={(v) => { setFrequency(v); clear("frequency"); }} error={errors.frequency} searchable={false} portalMenu portalMenuZIndex={1000} />
          <div className="grid grid-cols-[minmax(0,1fr)_110px] gap-3">
            <SignupField name="duration" type="number" label="Duration" placeholder="30" value={duration} onChange={(e) => { setDuration(e.target.value); setEndManual(null); }} />
            <SignupDropdown name="durationUnit" label={<span className="invisible">Unit</span>} placeholder="Unit" options={DURATION_UNITS} value={durUnit} onChange={(v) => { setDurUnit(v); setEndManual(null); }} searchable={false} portalMenu portalMenuZIndex={1000} />
          </div>
        </div>

        {/* ---------- Right ---------- */}
        <div className="min-w-0 space-y-3">
          <ModalDateField id="med-start" label={<ReqLabel>Start Date</ReqLabel>} value={start} onChange={(v) => { setStart(v); setEndManual(null); clear("start"); }} error={errors.start} min={todayISO()} />
          <ModalDateField id="med-end" label={<OptLabel>End Date</OptLabel>} value={end} onChange={setEndManual} min={start} />
          <div className="grid grid-cols-[minmax(0,1fr)_130px] gap-3">
            <SignupField name="quantity" type="number" label="Quantity" placeholder="60" value={qty} onChange={(e) => setQty(e.target.value)} />
            <SignupDropdown name="qtyUnit" label={<span className="invisible">Unit</span>} placeholder="Unit" options={QTY_UNITS} value={qtyUnit} onChange={setQtyUnit} searchable={false} portalMenu portalMenuZIndex={1000} />
          </div>
          <div>
            <FieldLabel>Refills</FieldLabel>
            <div className="inline-flex items-center overflow-hidden rounded-xl border border-border">
              <button type="button" aria-label="Fewer refills" onClick={() => setRefills((r) => Math.max(0, r - 1))} className="flex h-10 w-10 cursor-pointer items-center justify-center text-heading hover:bg-primary/5"><Minus className="h-4 w-4" /></button>
              <span className="w-12 text-center text-sm font-semibold text-heading">{refills}</span>
              <button type="button" aria-label="More refills" onClick={() => setRefills((r) => Math.min(12, r + 1))} className="flex h-10 w-10 cursor-pointer items-center justify-center text-heading hover:bg-primary/5"><Plus className="h-4 w-4" /></button>
            </div>
          </div>
          <SignupDropdown name="pharmacy" label={<OptLabel>Pharmacy</OptLabel>} placeholder="Select pharmacy" options={PHARMACIES} value={pharmacy} onChange={setPharmacy} searchable={false} portalMenu portalMenuZIndex={1000} />
          <ModalTextarea id="med-notes" label={<OptLabel>Notes</OptLabel>} value={notes} onChange={setNotes} placeholder="e.g., Take with food, monitor blood sugar, etc." />
        </div>
      </div>
    </ModalShell>
  );
};

export default AddMedicationModal;