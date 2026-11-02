"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, PenLine } from "lucide-react";

import AddButton from "@/components/Addbutton";
import ImportButton from "@/components/ImportButton";
import Breadcrumb from "@/components/Breadcrumb";
import AddSteps from "@/components/Addsteps";
import ErrorToast from "@/components/ErrorToast";
import { type Errors } from "@/providers/Shared";

import SelectMedicationModal, { getCatalogMed } from "../medicationlist/Selectmedicationmodal";
import MedicationStep, { initialMed, validateMed, type MedValues } from "./Medicationstep";
import PrescriptionDetailsStep, { initialDetails, validateDetails, type DetailsValues } from "./Prescriptiondetailsstep";
import PharmacyStep, { initialPharmacy, validatePharmacy, type PharmacyValues } from "./Pharmacystep";
import ReviewStep from "./Reviewstep";

const ROUTES = { list: "/medication/medication-list", history: "/medication/prescription-list" };

const STEPS = [
  { id: 1, title: "Medication", subtitle: "Select and configure" },
  { id: 2, title: "Prescription Details", subtitle: "Type and diagnosis" },
  { id: 3, title: "Pharmacy", subtitle: "Choose pharmacy" },
  { id: 4, title: "Review", subtitle: "Sign and send" },
];

const NewPrescription = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const medParam = searchParams.get("med") ?? "";

  const [currentStep, setCurrentStep] = useState(1);
  const [picker, setPicker] = useState(!medParam);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState({ open: false, title: "", message: "" });
  const [errors, setErrors] = useState<Errors>({});

  const [med, setMed] = useState<MedValues>(initialMed(medParam));
  const [details, setDetails] = useState<DetailsValues>(initialDetails());
  const [pharmacy, setPharmacy] = useState<PharmacyValues>(initialPharmacy());

  const catalogMed = getCatalogMed(med.medId);
  const isFirst = currentStep === 1;
  const isLast = currentStep === STEPS.length;

  const runValidation = (step: number): Errors => {
    if (step === 1) return validateMed(med);
    if (step === 2) return validateDetails(details);
    if (step === 3) return validatePharmacy(pharmacy);
    return {};
  };

  const showErrors = (errs: Errors, step: number) => {
    setErrors(errs);
    setToast({
      open: true,
      title: "Validation Incomplete",
      message: `Please complete all required fields in ${STEPS[step - 1].title}.`,
    });
    const first = Object.keys(errs)[0];
    if (first) {
      const el = document.getElementById(first);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      el?.focus?.();
    }
  };

  const handleNext = () => {
    const errs = runValidation(currentStep);
    if (Object.keys(errs).length) return showErrors(errs, currentStep);
    setErrors({});
    setCurrentStep((s) => s + 1);
  };

  const goToStep = (step: number) => {
    setCurrentStep(step);
    setErrors({});
  };

  const handleSignAndSend = async () => {
    if (isSaving) return;
    for (let step = 1; step < STEPS.length; step++) {
      const errs = runValidation(step);
      if (Object.keys(errs).length) {
        setCurrentStep(step);
        return showErrors(errs, step);
      }
    }
    setIsSaving(true);
    try {
      // TODO: call your API here
      console.log("Prescription signed and sent:", { med, details, pharmacy });
      router.push(ROUTES.history);
    } catch (error) {
      setToast({
        open: true,
        title: "Could not send prescription",
        message: error instanceof Error ? error.message : "Something went wrong. Try again.",
      });
      setIsSaving(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <MedicationStep
            values={med}
            errors={errors}
            med={catalogMed}
            onChangeMedication={() => setPicker(true)}
            onChange={(patch) => setMed((p) => ({ ...p, ...patch }))}
          />
        );
      case 2:
        return <PrescriptionDetailsStep values={details} errors={errors} onChange={(patch) => setDetails((p) => ({ ...p, ...patch }))} />;
      case 3:
        return <PharmacyStep values={pharmacy} errors={errors} onChange={(patch) => setPharmacy((p) => ({ ...p, ...patch }))} />;
      case 4:
        return (
          <ReviewStep
            med={catalogMed}
            medValues={med}
            details={details}
            pharmacy={pharmacy}
            onDetailsChange={(patch) => setDetails((p) => ({ ...p, ...patch }))}
            onEditStep={goToStep}
          />
        );
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <ErrorToast
        isOpen={toast.open}
        onClose={() => setToast((p) => ({ ...p, open: false }))}
        title={toast.title}
        message={toast.message}
      />

      <div className="mx-auto w-full max-w-[1600px] flex-1">
        <div className="space-y-4 sm:space-y-5">
          <Breadcrumb
            items={[
              { label: "Medication List", href: ROUTES.list },
              { label: "New Prescription" },
            ]}
          />
          <div>
            <h2 className="text-lg font-semibold text-heading sm:text-xl 2xl:text-2xl">New Prescription</h2>
            <p className="mt-0.5 text-sm text-body">Enter prescription details.</p>
          </div>

          <AddSteps steps={STEPS} current={currentStep} onStepClick={(id: number) => id < currentStep && goToStep(id)} />

          <div>{renderStep()}</div>
        </div>
      </div>

      <div className="sticky -bottom-4 z-[250] -mx-4 -mb-4 mt-4 border-t border-border bg-card px-4 py-4 sm:-bottom-6 sm:-mx-6 sm:-mb-6 sm:px-6 sm:py-5">
        <div className="mx-auto flex max-w-[1600px] items-center justify-center sm:justify-end gap-2 sm:gap-3">
        {
          isFirst ? (
            <ImportButton text="Cancel" icon={null} onClick={() => router.push(ROUTES.list)} className="shrink-0 px-3 sm:px-5" />
          ) : (
            <ImportButton text="Previous" icon={<ArrowLeft className="h-4 w-4" />} onClick={() => goToStep(currentStep - 1)} className="shrink-0 whitespace-nowrap px-3 sm:px-5" />
          )
        }
        {
          isLast ? (
            <AddButton
              text={isSaving ? "Sending…" : "Sign and Send"}
              icon={<PenLine className="h-4 w-4" />}
              onClick={handleSignAndSend}
              disabled={isSaving}
              className="shrink-0 whitespace-nowrap px-3 sm:px-5"
            />
          ) : (
            <AddButton text="Next" icon={<ArrowRight className="h-4 w-4" />} onClick={handleNext} className="shrink-0 whitespace-nowrap px-3 sm:px-5" />
          )
        }
        </div>
      </div>

      <SelectMedicationModal
        open={picker}
        onClose={() => {
          setPicker(false);
          if (!med.medId) router.push(ROUTES.list);
        }}
        onSelect={(m) => {
          setPicker(false);
          setMed((p) => ({ ...p, medId: m.id, dosage: "", unit: m.forms[0] ?? p.unit }));
          setErrors({});
        }}
      />
    </div>
  );
};

export default NewPrescription;
