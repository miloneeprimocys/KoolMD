"use client";

import React, { useMemo, useState } from "react";
import { MapPin, Phone } from "lucide-react";

import SignupField, { FieldError } from "@/components/SignupField";
import RadioCheckButtonh from "@/components/RadioCheckButtonh";
import { Errors, SectionCard, StepProps } from "@/providers/Shared";

/* ---------- Pharmacies ---------- */
export type Pharmacy = { id: string; name: string; address: string; phone: string };
export const PHARMACIES: Pharmacy[] = [
  { id: "ph1", name: "CVS Pharmacy #1234", address: "123 Main Street, Ahmedabad, Gujarat 380015", phone: "(555) 987-6543" },
  { id: "ph2", name: "Walgreens #5678", address: "45 Ring Road, Ahmedabad, Gujarat 380009", phone: "(555) 456-1122" },
  { id: "ph3", name: "Apollo Pharmacy #0912", address: "9 SG Highway, Ahmedabad, Gujarat 380054", phone: "(555) 330-7788" },
];


export interface PharmacyValues {
  pharmacyId: string;
}

export const initialPharmacy = (): PharmacyValues => ({ pharmacyId: "ph1" });

export const validatePharmacy = (v: PharmacyValues): Errors =>
  v.pharmacyId ? {} : { pharmacyId: "Select a pharmacy to send the prescription to." };

const PharmacyStep = ({ values: v, errors, onChange }: StepProps<PharmacyValues>) => {
  const [query, setQuery] = useState("");

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PHARMACIES.filter((p) => !q || [p.name, p.address].some((f) => f.toLowerCase().includes(q)));
  }, [query]);

  return (
    <SectionCard step={3} title="Pharmacy" subtitle="Choose where the prescription will be sent electronically.">
      <div className="space-y-4">
        <SignupField name="pharmacySearch" label="Search Pharmacy" placeholder="Search by name or address"
          value={query} onChange={(e) => setQuery(e.target.value)} />

        <div id="pharmacyId" className="space-y-2">
          {list.length === 0 && <p className="rounded-xl border border-border px-4 py-8 text-center text-sm text-body">No pharmacies found.</p>}
          {list.map((p) => {
            const active = v.pharmacyId === p.id;
            return (
              <label
                key={p.id}
                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition-colors ${
                  active ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                }`}
              >
                <RadioCheckButtonh
                  type="radio"
                  name="pharmacy"
                  checked={active}
                  onChange={() => onChange({ pharmacyId: p.id })}
                  className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-primary"
                />
                <span className="min-w-0 space-y-1">
                  <span className="block text-sm font-semibold text-heading">{p.name}</span>
                  <span className="flex items-center gap-1.5 text-xs text-body"><MapPin className="h-3.5 w-3.5" />{p.address}</span>
                  <span className="flex items-center gap-1.5 text-xs text-body"><Phone className="h-3.5 w-3.5" />{p.phone}</span>
                </span>
              </label>
            );
          })}
          <FieldError message={errors.pharmacyId} />
        </div>
      </div>
    </SectionCard>
  );
};

export default PharmacyStep;