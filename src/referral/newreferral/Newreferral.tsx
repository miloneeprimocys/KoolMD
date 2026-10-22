"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Send } from "lucide-react";

import Breadcrumb from "@/components/Breadcrumb";
import AddSteps from "@/components/Addsteps";
import AddButton from "@/components/Addbutton";
import ImportButton from "@/components/ImportButton";
import type { Errors } from "@/providers/Shared";
import ReferralDetails, { PATIENTS, validateReferralDetails, type ReferralValues } from "./Referraldetails";
import ProviderReason, { PROVIDERS, validateProviderReason } from "./Providerreason";
import AttachDocuments, { INITIAL_DOCS } from "./Attachdocuments";
import ReviewSend from "./Reviewsend";

/* ---------- Steps ---------- */
const STEPS = [
  { id: 1, title: "Referral Details" },
  { id: 2, title: "Provider & Reason" },
  { id: 3, title: "Attach Documents" },
  { id: 4, title: "Review & Send" },
];

const SUBTITLES = [
  "Create a new patient referral and send to the appropriate provider.",
  "Create a new patient referral and send to the appropriate provider.",
  "Create a new patient referral and send to the appropriate provider.",
  "Review the referral details and send to the selected provider.",
];

const LIST_ROUTE = "/referral";

const initialValues = (): ReferralValues => ({
  patient: PATIENTS[0]?.id ?? "",
  specialty: "",
  priority: "Routine",
  referralType: "Internal",
  location: "",
  reason: "",
  history: "",
  medications: "",
  appointmentDate: "",
  followUp: true,
  notes: "",
  provider: PROVIDERS[0]?.id ?? "",
  consultationRequest: "",
  documents: INITIAL_DOCS,
  notifyPatient: true,
});

/* ---------- Page ---------- */
const NewReferral = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [values, setValues] = useState<ReferralValues>(initialValues());
  const [errors, setErrors] = useState<Errors>({});

  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === STEPS.length;

  /** Patch values and clear the errors of the fields that were edited. */
  const update = (patch: Partial<ReferralValues>) => {
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
    if (currentStep === 1) {
      const errs = validateReferralDetails(values);
      setErrors(errs);
      if (Object.keys(errs).length > 0) return;
    }
    if (currentStep === 2) {
      const errs = validateProviderReason(values);
      setErrors(errs);
      if (Object.keys(errs).length > 0) return;
    }

    if (isLastStep) {
      // TODO: call your create-referral API with `values`
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
        return <ReferralDetails values={values} errors={errors} onChange={update} />;
      case 2:
        return <ProviderReason values={values} errors={errors} onChange={update} />;
      case 3:
        return <AttachDocuments values={values} errors={errors} onChange={update} />;
      default:
        return <ReviewSend values={values} errors={errors} onChange={update} onEdit={goTo} />;
    }
  };

  const nextButton = (
    <AddButton
      text={
        <>
          <span className="sm:hidden">{isLastStep ? "Send" : "Next"}</span>
          <span className="hidden sm:inline">{isLastStep ? "Send Referral" : "Next"}</span>
        </>
      }
      ariaLabel={isLastStep ? "Send Referral" : "Next"}
      icon={isLastStep ? <Send className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
      onClick={handleNext}
      className="shrink-0 whitespace-nowrap px-3 sm:px-5"
    />
  );

  return (
    <div className="flex min-h-full flex-col">
      <div className="mx-auto w-full max-w-[1600px] flex-1">
        <div className="space-y-4 sm:space-y-5">
          <div className="space-y-2">
            <Breadcrumb items={[{ label: "Referral Management", href: LIST_ROUTE }]} />
            <div>
              <h2 className="text-lg font-semibold text-heading sm:text-xl 2xl:text-2xl">New Referral</h2>
              <p className="mt-0.5 text-sm text-body">{SUBTITLES[currentStep - 1]}</p>
            </div>
          </div>

          <AddSteps steps={STEPS} current={currentStep} onStepClick={handleStepClick} />

          <div>{renderStep()}</div>
        </div>
      </div>

      {/* Sticky bottom buttons */}
      <div className="sticky -bottom-4 sm:-bottom-6 z-[200] -mx-4 -mb-4 sm:-mb-6 mt-4 border-t border-border bg-card px-4 py-4 sm:-mx-6 sm:px-6 sm:py-5">
        <div className="mx-auto flex max-w-[1600px] items-center justify-center gap-2 sm:justify-end sm:gap-3">
          <ImportButton text="Cancel" icon={null} onClick={() => router.push(LIST_ROUTE)} className="shrink-0 px-3 whitespace-nowrap sm:px-5" />
          {!isFirstStep && <ImportButton text="Back" icon={null} onClick={handleBack} className="shrink-0 px-3 whitespace-nowrap sm:px-5" />}
          {nextButton}
        </div>
      </div>
    </div>
  );
};

export default NewReferral;
