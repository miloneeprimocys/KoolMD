"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

import Breadcrumb from "@/components/Breadcrumb";
import AddSteps from "@/components/Addsteps";
import AddButton from "@/components/Addbutton";
import ImportButton from "@/components/ImportButton";
import PatientInsurance from "./Patientinsurance";
import ServiceDetails from "./Servicedetails";
import ReviewSubmit from "./Reviewsubmit";

const STEPS = [
  { id: 1, title: "Patient & Insurance", subtitle: "Verify patient and plan details" },
  { id: 2, title: "Service Details", subtitle: "Enter service and procedure codes" },
  { id: 3, title: "Review & Submit", subtitle: "Confirm and submit request" },
];

const NEXT_LABEL = [
  "Next: Service Details",
  "Next: Review & Submit",
  "Submit Eligibility Request",
];

const CheckEligibility = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === STEPS.length;

  const handleNext = () => {
    if (isLastStep) {
      setIsSubmitting(true);
      setTimeout(() => {
        router.push("/payers/eligibility-verification");
      }, 1000);
      return;
    }
    setCurrentStep((s) => s + 1);
  };

  const handleBack = () => {
    if (!isFirstStep) setCurrentStep((s) => s - 1);
  };

  const handleStepClick = (stepId: number) => {
    if (stepId < currentStep) setCurrentStep(stepId);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <PatientInsurance />;
      case 2:
        return <ServiceDetails />;
      case 3:
        return <ReviewSubmit />;
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-full flex-col">
      <div className="mx-auto w-full max-w-[1600px] flex-1">
        <div className="space-y-4 sm:space-y-5">
          <Breadcrumb
            items={[
              { label: "Billing", href: "/payment/payment-gateway" },
              { label: "Payers", href: "/payers/accounts" },
              { label: "Eligibility Verification", href: "/payers/eligibility-verification" },
              { label: "Check Eligibility" },
            ]}
          />

          <div>
            <h2 className="text-lg font-semibold text-heading sm:text-xl 2xl:text-2xl">
              Check Insurance Eligibility
            </h2>
            <p className="mt-0.5 text-sm text-body">
              Submit an eligibility request through the configured clearinghouse to verify patient insurance coverage and benefits.
            </p>
          </div>

          <AddSteps steps={STEPS} current={currentStep} onStepClick={handleStepClick} />

          <div className="pb-24">{renderStep()}</div>
        </div>
      </div>

      {/* Sticky bottom buttons */}
      <div className="sticky -bottom-4 sm:-bottom-6 z-[200] -mx-4 -mb-4 sm:-mb-6 mt-4 border-t border-border bg-card px-4 py-4 sm:-mx-6 sm:px-6 sm:py-5">
        <div className="mx-auto flex max-w-[1600px] items-center justify-center sm:justify-end gap-2 sm:gap-3">
          <ImportButton
            text="Cancel"
            icon={null}
            onClick={() => router.push("/eligibility-verification")}
            className="shrink-0 px-3 whitespace-nowrap sm:px-5"
          />
          {!isFirstStep && (
            <ImportButton
              text="Back"
              icon={null}
              onClick={handleBack}
              className="shrink-0 px-3 whitespace-nowrap sm:px-5"
            />
          )}
          <AddButton
            text={
              <>
                <span className="sm:hidden">{isLastStep ? "Submit" : "Next"}</span>
                <span className="hidden sm:inline">{NEXT_LABEL[currentStep - 1]}</span>
              </>
            }
            icon={isLastStep ? null : <ArrowRight className="h-4 w-4" />}
            onClick={handleNext}
            className="shrink-0 whitespace-nowrap px-3 sm:px-5"
            disabled={isSubmitting}
          />
        </div>
      </div>
    </div>
  );
};

export default CheckEligibility;