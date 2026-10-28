"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Send } from "lucide-react";

import Breadcrumb from "@/components/Breadcrumb";
import AddSteps from "@/components/Addsteps";
import AddButton from "@/components/Addbutton";
import ImportButton from "@/components/ImportButton";
import type { Errors } from "@/providers/Shared";
import ImagingPatientStep, { initialImagingValues, validateImagingPatient, type ImagingValues } from "./Imagingpatient";
import ImagingDetailsStep, { validateImagingDetails } from "./Imagingdetails";
import ImagingClinicalStep, { validateImagingClinical } from "./Imagingclinical";
import ImagingReviewStep from "./Imagingreview";

/* ---------- Steps ---------- */
const STEPS = [
  { id: 1, title: "Patient" },
  { id: 2, title: "Imaging Details" },
  { id: 3, title: "Clinical Information" },
  { id: 4, title: "Review & Send" },
];

const SUBTITLES = [
  "Create an imaging order and send it through referral or eFax workflow.",
  "Enter imaging details for the order.",
  "Add clinical information and supporting documents.",
  "Review the details below and send the imaging order.",
];

/** Label of the primary button on each step. */
const NEXT_LABEL = ["Next: Imaging Details", "Next: Clinical Information", "Next: Review & Send", "Send Imaging Order"];

const LIST_ROUTE = "/referral/management";

const initialValues = (): ImagingValues => initialImagingValues();

/* ---------- Page ---------- */
const BasicImagingReferral = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [values, setValues] = useState<ImagingValues>(initialValues());
  const [errors, setErrors] = useState<Errors>({});

  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === STEPS.length;

  /** Patch values and clear the errors of the fields that were edited. */
  const update = (patch: Partial<ImagingValues>) => {
    setValues((prev) => ({ ...prev, ...patch }));
    setErrors((prev) => {
      const next = { ...prev };
      Object.keys(patch).forEach((k) => delete next[k]);
      return next;
    });
  };

  const goTo = (step: number) => {
    setErrors({});
    setCurrentStep(step);
  };

  const handleNext = () => {
    const validators: Record<number, (v: ImagingValues) => Errors> = {
      1: validateImagingPatient,
      2: validateImagingDetails,
      3: validateImagingClinical,
    };
    const validate = validators[currentStep];
    if (validate) {
      const errs = validate(values);
      setErrors(errs);
      if (Object.keys(errs).length > 0) return;
    }

    if (isLastStep) {
      // TODO: call your send-imaging-order API with `values` (values.transmission = "referral" | "efax")
      router.push(LIST_ROUTE);
      return;
    }
    goTo(currentStep + 1);
  };

  const handleBack = () => {
    if (!isFirstStep) goTo(currentStep - 1);
  };

  const handleStepClick = (stepId: number) => {
    if (stepId < currentStep) goTo(stepId);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <ImagingPatientStep values={values} errors={errors} onChange={update} />;
      case 2:
        return <ImagingDetailsStep values={values} errors={errors} onChange={update} />;
      case 3:
        return <ImagingClinicalStep values={values} errors={errors} onChange={update} />;
      default:
        return <ImagingReviewStep values={values} errors={errors} onChange={update} onEdit={goTo} />;
    }
  };

  return (
    <div className="flex min-h-full flex-col">
      <div className="mx-auto w-full max-w-[1600px] flex-1">
        <div className="space-y-4 sm:space-y-5">
          <div className="space-y-2">
            <Breadcrumb items={[{ label: "Back to Referrals", href: LIST_ROUTE }]} />
            <div>
              <h2 className="text-lg font-semibold text-heading sm:text-xl 2xl:text-2xl">M16 Basic Imaging Referral</h2>
              <p className="mt-0.5 text-sm text-body">{SUBTITLES[currentStep - 1]}</p>
            </div>
          </div>

          <AddSteps steps={STEPS} current={currentStep} onStepClick={handleStepClick} />

          <div>{renderStep()}</div>
        </div>
      </div>

      {/* Sticky bottom buttons */}
      <div className="sticky -bottom-4 z-[250] -mx-4 -mb-4 mt-4 border-t border-border bg-card px-4 py-4 sm:-bottom-6 sm:-mx-6 sm:-mb-6 sm:px-6 sm:py-5">
        <div className="mx-auto flex max-w-[1600px] items-center justify-center gap-2 sm:justify-end sm:gap-3">
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

          <div className="flex items-center gap-2 sm:gap-3">
            {/* {isLastStep && (
              <ImportButton
                text="Save as Draft"
                icon={null}
                onClick={() => {
                  // TODO: save the draft via your API
                  router.push(LIST_ROUTE);
                }}
                className="shrink-0 whitespace-nowrap px-3 sm:px-5"
              />
            )} */}
            <AddButton
              text={NEXT_LABEL[currentStep - 1]}
              icon={isLastStep ? <Send className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
              onClick={handleNext}
              className="shrink-0 whitespace-nowrap px-3 sm:px-5"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BasicImagingReferral;
