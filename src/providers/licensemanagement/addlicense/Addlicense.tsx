"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

import AddButton from "@/components/Addbutton";
import ImportButton from "@/components/ImportButton";
import Breadcrumb from "@/components/Breadcrumb";
import AddSteps from "@/components/Addsteps";
import SuccessToast from "@/components/SuccessToast";
import ErrorToast from "@/components/ErrorToast";

import LicenseInformation, {
  initialLicense,
  validateLicense,
  type LicenseValues,
} from "./Licenseinformation";
import SupportingDocuments, {
  initialDocuments,
  validateDocuments,
  type DocumentValues,
} from "./Supportingdocuments";
import LicenseVerification, {
  initialVerification,
  validateVerification,
  type VerificationValues,
} from "./Licenseverification";
import ReviewSave from "./Reviewsave";

const LIST_ROUTE = "/provider/license-management";

type Errors = Record<string, string>;

const STEPS = [
  { id: 1, title: "License Information", subtitle: "Provider and license details" },
  { id: 2, title: "Supporting Documents", subtitle: "Upload required documents" },
  { id: 3, title: "Verification", subtitle: "Verify the license" },
  { id: 4, title: "Review & Save", subtitle: "Confirm and save" },
];

type ToastState = { type: "success" | "error" | null; title: string; message: string };

const AddLicense = () => {
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<ToastState>({ type: null, title: "", message: "" });

  const [license, setLicense] = useState<LicenseValues>(initialLicense());
  const [docs, setDocs] = useState<DocumentValues>(initialDocuments());
  const [verification, setVerification] = useState<VerificationValues>(initialVerification());

  const [errors, setErrors] = useState<Errors>({});

  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === STEPS.length;

  /* ---------- Validation ---------- */
  const runValidation = (step: number): Errors => {
    switch (step) {
      case 1:
        return validateLicense(license);
      case 2:
        return validateDocuments(docs);
      case 3:
        return validateVerification(verification);
      default:
        return {};
    }
  };

  const showErrors = (errs: Errors) => {
    setErrors(errs);
    const firstField = Object.keys(errs)[0];
    if (!firstField) return;
    const el = document.getElementById(firstField);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
    el?.focus?.();
  };

  /* ---------- Save ---------- */
  const save = async () => {
    if (isSaving) return;

    for (let step = 1; step < STEPS.length; step++) {
      const errs = runValidation(step);
      if (Object.keys(errs).length) {
        setCurrentStep(step);
        showErrors(errs);
        setToast({
          type: "error",
          title: "Validation Incomplete",
          message: `Please complete all required fields in ${STEPS[step - 1].title}.`,
        });
        return;
      }
    }

    setIsSaving(true);
    try {
      // TODO: call your API here
      console.log("License saved:", {
        license,
        verification,
        documents: docs.docs.map((d) => ({ type: d.type, file: d.file ?? d.name })),
      });
      router.push(LIST_ROUTE);
    } catch (error) {
      setToast({
        type: "error",
        title: "Could not save license",
        message: error instanceof Error ? error.message : "Something went wrong. Try again.",
      });
      setIsSaving(false);
    }
  };

  /* ---------- Navigation ---------- */
  const handleNext = () => {
    const errs = runValidation(currentStep);
    if (Object.keys(errs).length) {
      showErrors(errs);
      setToast({
        type: "error",
        title: "Validation Incomplete",
        message: `Please complete all required fields in ${STEPS[currentStep - 1].title}.`,
      });
      return;
    }
    setErrors({});
    setCurrentStep((prev) => prev + 1);
  };

  const goToStep = (step: number) => {
    setCurrentStep(step);
    setErrors({});
  };

  const handleBack = () => {
    if (!isFirstStep) goToStep(currentStep - 1);
  };

  const handleStepClick = (stepId: number) => {
    if (stepId < currentStep) goToStep(stepId);
  };

  /* ---------- Render step ---------- */
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <LicenseInformation
            values={license}
            errors={errors}
            onChange={(patch) => setLicense((prev) => ({ ...prev, ...patch }))}
          />
        );
      case 2:
        return (
          <SupportingDocuments
            values={docs}
            errors={errors}
            onChange={(patch) => setDocs((prev) => ({ ...prev, ...patch }))}
            onFileError={(message) => setToast({ type: "error", title: "Upload failed", message })}
          />
        );
      case 3:
        return (
          <LicenseVerification
            values={verification}
            errors={errors}
            onChange={(patch) => setVerification((prev) => ({ ...prev, ...patch }))}
            submittedOn={docs.docs[0]?.uploadedDate}
          />
        );
      case 4:
        return <ReviewSave license={license} docs={docs} verification={verification} onEditStep={goToStep} />;
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <SuccessToast
        isOpen={toast.type === "success"}
        onClose={() => setToast((prev) => ({ ...prev, type: null }))}
        title={toast.title}
        message={toast.message}
      />
      <ErrorToast
        isOpen={toast.type === "error"}
        onClose={() => setToast((prev) => ({ ...prev, type: null }))}
        title={toast.title}
        message={toast.message}
      />

      <div className="mx-auto w-full max-w-[1600px] flex-1">
        <div className="space-y-4 sm:space-y-5">
          <Breadcrumb
            items={[
              { label: "License Management", href: LIST_ROUTE },
              { label: "Add License" },
            ]}
          />

          <div>
            <h2 className="text-lg font-semibold text-heading sm:text-xl 2xl:text-2xl">Add License</h2>
            <p className="mt-0.5 text-sm text-body">Add a new license for a provider.</p>
          </div>

          <AddSteps steps={STEPS} current={currentStep} onStepClick={handleStepClick} />

          <div>{renderStep()}</div>
        </div>
      </div>

      {/* Sticky bottom buttons */}
      <div className="sticky -bottom-4 z-[250] -mx-4 -mb-4 mt-4 border-t border-border bg-card px-4 py-4 sm:-bottom-6 sm:-mx-6 sm:-mb-6 sm:px-6 sm:py-5">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-2 sm:gap-3">
          {isFirstStep ? (
            <ImportButton
              text="Cancel"
              icon={null}
              onClick={() => router.push(LIST_ROUTE)}
              className="shrink-0 whitespace-nowrap px-3 sm:px-5"
            />
          ) : (
            <ImportButton
              text="Back"
              icon={<ArrowLeft className="h-4 w-4" />}
              onClick={handleBack}
              className="shrink-0 whitespace-nowrap px-3 sm:px-5"
            />
          )}

          {isLastStep ? (
            <AddButton
              text={isSaving ? "Saving…" : "Save License"}
              icon={<Check className="h-4 w-4" />}
              onClick={save}
              className="shrink-0 whitespace-nowrap px-3 sm:px-5"
              disabled={isSaving}
            />
          ) : (
            <AddButton
              text="Continue"
              icon={<ArrowRight className="h-4 w-4" />}
              onClick={handleNext}
              className="shrink-0 whitespace-nowrap px-3 sm:px-5"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AddLicense;

