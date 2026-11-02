"use client";

import React from "react";
import { Info, Pill } from "lucide-react";

import { SectionCard, TextArea } from "@/providers/Shared";
import EditButton from "@/components/EditButton";
import { type CatalogMed } from "../medicationlist/Selectmedicationmodal";
import { PATIENT } from "../medicationlist/Medicationlistpage";
import { fmtDate, type MedValues } from "./Medicationstep";
import { type DetailsValues } from "./Prescriptiondetailsstep";
import { PHARMACIES, type PharmacyValues } from "./Pharmacystep";

const PRESCRIBER = { name: "Dr. Sarah Wilson", npi: "1234567890", specialty: "Family Medicine" };

const KV = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="grid grid-cols-[110px_minmax(0,1fr)] gap-3 py-1.5 text-sm">
    <dt className="text-body">{label}</dt>
    <dd className="min-w-0 break-words font-medium text-heading">{children}</dd>
  </div>
);

const Box = ({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) => (
  <div className="rounded-xl border border-border p-4">
    <div className="mb-2 flex items-center justify-between gap-3">
      <h4 className="text-sm font-semibold text-heading">{title}</h4>
      {action}
    </div>
    {children}
  </div>
);

interface Props {
  med?: CatalogMed;
  medValues: MedValues;
  details: DetailsValues;
  pharmacy: PharmacyValues;
  onDetailsChange: (patch: Partial<DetailsValues>) => void;
  onEditStep: (step: number) => void;
}

const ReviewStep = ({ med, medValues: m, details, pharmacy, onDetailsChange, onEditStep }: Props) => {
  const ph = PHARMACIES.find((p) => p.id === pharmacy.pharmacyId) ?? PHARMACIES[0];

  return (
    <SectionCard step={4} title="Review Prescription" subtitle="Review the details below, then sign and send.">
      <div className="grid gap-4 xl:grid-cols-2">
        <div className="space-y-4">
          <Box title="Patient Information">
            <div className="space-y-1.5">
              <p className="text-sm font-semibold text-heading">{PATIENT.name}</p>
              <div className="space-y-0.5 text-sm text-body">
                <p>MRN: {PATIENT.mrn}</p>
                <p>DOB: {PATIENT.dob} ({PATIENT.age})</p>
                <p>{PATIENT.gender} • {PATIENT.phone}</p>
              </div>
            </div>
          </Box>

          <Box
            title="Medication Details"
            action={<EditButton section="Medication Details" onEdit={() => onEditStep(1)} />}
          >
            <div className="mb-2 flex items-center gap-3">
              <span className="flex h-10 w-14 items-center justify-center rounded-lg bg-primary/10 text-primary"><Pill className="h-5 w-5" /></span>
              <div>
                <p className="text-sm font-semibold text-heading">{med?.name}</p>
                <p className="text-sm text-body">{med?.category}</p>
              </div>
            </div>
            <dl>
              <KV label="Dosage">{m.dosage}</KV>
              <KV label="Route">{m.route}</KV>
              <KV label="Frequency">{m.frequency}</KV>
              <KV label="Duration">{m.duration}</KV>
              <KV label="Quantity">{m.quantity} {m.unit}</KV>
              <KV label="Refills">{m.refills}</KV>
              <KV label="Start Date">{fmtDate(m.startDate)}</KV>
              <KV label="End Date">{fmtDate(m.endDate)}</KV>
              <KV label="Instructions">{m.instructions}</KV>
              {m.notes && <KV label="Additional Notes">{m.notes}</KV>}
              <KV label="Type / Priority">{details.rxType} / {details.priority}</KV>
              <KV label="Diagnosis">{details.diagnosis}</KV>
              <KV label="Substitution">{details.substitution === "yes" ? "Generic allowed" : "Dispense as written"}</KV>
            </dl>
          </Box>
        </div>

        <div className="space-y-4">
          <Box
            title="Pharmacy Details"
            action={<EditButton section="Pharmacy Details" label="Change" onEdit={() => onEditStep(3)} />}
          >
            <div className="space-y-1.5">
              <p className="text-sm font-semibold text-heading">{ph.name}</p>
              <div className="space-y-0.5 text-sm text-body">
                <p>{ph.address}</p>
                <p>Phone: {ph.phone}</p>
              </div>
            </div>
          </Box>

          <Box title="Prescriber Information">
            <p className="text-sm font-semibold text-heading">{PRESCRIBER.name}</p>
            <div className="space-y-0.5 text-sm text-body">
              <p>NPI: {PRESCRIBER.npi}</p>
              <p>{PRESCRIBER.specialty}</p>
            </div>
          </Box>

          <div className="flex items-start gap-2 rounded-xl border border-primary/30 bg-primary/5 p-3 text-xs text-primary">
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
            This prescription will be electronically sent to the selected pharmacy.
          </div>

          <TextArea
            name="clinical"
            label="Clinical Information (Optional)"
            placeholder="Add clinical information for the pharmacist"
            value={details.clinical}
            onChange={(val) => onDetailsChange({ clinical: val })}
            maxLength={500}
            rows={4}
          />
        </div>
      </div>
    </SectionCard>
  );
};

export default ReviewStep;
