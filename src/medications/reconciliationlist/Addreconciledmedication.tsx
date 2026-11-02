"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Pill } from "lucide-react";

import AddButton from "@/components/Addbutton";
import ImportButton from "@/components/ImportButton";
import Breadcrumb from "@/components/Breadcrumb";
import AddSteps from "@/components/Addsteps";
import ErrorToast from "@/components/ErrorToast";
import { SectionCard, type Errors } from "@/providers/Shared";

import SelectMedicationModal, { getCatalogMed } from "../medicationlist/Selectmedicationmodal";
import MedicationStep, { fmtDate, initialMed, validateMed, type MedValues } from "../prescriptionlist/Medicationstep";

const BACK = "/medication/reconciliation-list/start?step=2";

const STEPS = [
  { id: 1, title: "Medication Details", subtitle: "Dose and instructions" },
  { id: 2, title: "Confirm and Add", subtitle: "Review and add" },
];

const KV = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="grid grid-cols-[140px_minmax(0,1fr)] gap-3 border-t border-divider py-2.5 text-sm first:border-t-0">
    <dt className="text-body">{label}</dt>
    <dd className="min-w-0 break-words font-medium text-heading">{children}</dd>
  </div>
);

const AddReconciledMedication = () => {
  const router = useRouter();
  const medParam = useSearchParams().get("med") ?? "";

  const [currentStep, setCurrentStep] = useState(1);
  const [values, setValues] = useState<MedValues>(() => ({
    ...initialMed(medParam),
    unit: getCatalogMed(medParam)?.forms[0] ?? "Capsule",
  }));
  const [errors, setErrors] = useState<Errors>({});
  const [picker, setPicker] = useState(!medParam);
  const [toast, setToast] = useState({ open: false, title: "", message: "" });

  const med = getCatalogMed(values.medId);

  const handleNext = () => {
    const errs = validateMed(values, true);
    if (Object.keys(errs).length) {
      setErrors(errs);
      setToast({ open: true, title: "Validation Incomplete", message: "Please complete all required fields in Medication Details." });
      const el = document.getElementById(Object.keys(errs)[0]);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      el?.focus?.();
      return;
    }
    setErrors({});
    setCurrentStep(2);
  };

  const handleAdd = () => {
    // TODO: call your API here
    console.log("Medication added to reconciliation:", values);
    router.push(BACK);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <ErrorToast isOpen={toast.open} onClose={() => setToast((p) => ({ ...p, open: false }))} title={toast.title} message={toast.message} />

      <div className="mx-auto w-full max-w-[1600px] flex-1">
        <div className="space-y-4 sm:space-y-5">
          <Breadcrumb items={[{ label: "Back to Reconciliation", href: BACK }, { label: "Add New Medication" }]} />
          <h2 className="text-lg font-semibold text-heading sm:text-xl 2xl:text-2xl">Add New Medication</h2>

          <AddSteps steps={STEPS} current={currentStep} onStepClick={(id: number) => id < currentStep && setCurrentStep(id)} />
          {currentStep === 1 ? (
            <MedicationStep
              values={values}
              errors={errors}
              med={med}
              endOptional
              onChangeMedication={() => setPicker(true)}
              onChange={(patch) => setValues((p) => ({ ...p, ...patch }))}
            />
          ) : (
            <SectionCard step={2} title="Confirm and Add" subtitle="Review the medication before adding it to the reconciliation.">
              <div className="mb-3 flex items-center gap-3">
                <span className="flex h-10 w-14 items-center justify-center rounded-lg bg-primary/10 text-primary"><Pill className="h-5 w-5" /></span>
                <div>
                  <p className="text-sm font-semibold text-heading">{med?.name}</p>
                  <p className="text-xs text-body">{med?.category}</p>
                </div>
              </div>
              <dl>
                <KV label="Dosage">{values.dosage}</KV>
                <KV label="Route">{values.route}</KV>
                <KV label="Frequency">{values.frequency}</KV>
                <KV label="Duration">{values.duration}</KV>
                <KV label="Quantity">{values.quantity} {values.unit}</KV>
                <KV label="Refills">{values.refills}</KV>
                <KV label="Start Date">{fmtDate(values.startDate)}</KV>
                <KV label="End Date">{fmtDate(values.endDate)}</KV>
                <KV label="Instructions">{values.instructions}</KV>
                {values.notes && <KV label="Notes">{values.notes}</KV>}
              </dl>
            </SectionCard>
          )}
        </div>
      </div>

      <div className="sticky -bottom-4 z-[250] -mx-4 -mb-4 mt-4 border-t border-border bg-card px-4 py-4 sm:-bottom-6 sm:-mx-6 sm:-mb-6 sm:px-6 sm:py-5">
        <div className="mx-auto flex max-w-[1600px] items-center justify-center sm:justify-end gap-2 sm:gap-3">
          {currentStep === 1 ? (
            <ImportButton text="Cancel" icon={null} onClick={() => router.push(BACK)} className="shrink-0 px-3 sm:px-5" />
          ) : (
            <ImportButton text="Previous" icon={<ArrowLeft className="h-4 w-4" />} onClick={() => setCurrentStep(1)} className="shrink-0 whitespace-nowrap px-3 sm:px-5" />
          )}
          {currentStep === 1 ? (
            <AddButton text="Next" icon={<ArrowRight className="h-4 w-4" />} onClick={handleNext} className="shrink-0 whitespace-nowrap px-3 sm:px-5" />
          ) : (
            <AddButton text="Add Medication" icon={<Check className="h-4 w-4" />} onClick={handleAdd} className="shrink-0 whitespace-nowrap px-3 sm:px-5" />
          )}
        </div>
      </div>
      <SelectMedicationModal
        open={picker}
        onClose={() => {
          setPicker(false);
          if (!values.medId) router.push(BACK);
        }}
        onSelect={(m) => {
          setPicker(false);
          setValues((p) => ({ ...p, medId: m.id, dosage: "", unit: m.forms[0] ?? p.unit }));
          setErrors({});
        }}
      />
    </div>
  );
};

export default AddReconciledMedication;
