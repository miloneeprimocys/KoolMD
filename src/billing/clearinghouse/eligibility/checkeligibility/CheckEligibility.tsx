"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Send } from "lucide-react";

import Breadcrumb from "@/components/Breadcrumb";
import AddSteps from "@/components/Addsteps";
import AddButton from "@/components/Addbutton";
import ImportButton from "@/components/ImportButton";

import PatientInsurance, {
  initialPatientInsurance,
  validatePatientInsurance,
  type PatientInsuranceErrors,
  type PatientInsuranceValues,
} from "./Patientinsurance";
import ServiceDetails, {
  initialServiceDetails,
  validateServiceDetails,
  type ServiceDetailsErrors,
  type ServiceDetailsValues,
} from "./Servicedetails";
import ReviewSubmit from "./Reviewsubmit";

const LIST_ROUTE = "/payers/eligibility-verification";

const STEPS = [
  { id: 1, title: "Patient & Insurance", subtitle: "Verify patient and plan details" },
  { id: 2, title: "Service Details", subtitle: "Enter service and procedure codes" },
  { id: 3, title: "Review & Submit", subtitle: "Confirm and submit request" },
];

const NEXT_LABEL = ["Next: Service Details", "Continue to Review", "Submit Eligibility Request"];

const SUBTITLES = [
  "Submit an eligibility request through the configured clearinghouse to verify patient insurance coverage and benefits.",
  "Submit an eligibility request through the configured clearinghouse to verify patient insurance coverage and benefits.",
  "Review the request details below and submit to the configured clearinghouse.",
];

const CheckEligibility = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1
  const [patientInsurance, setPatientInsurance] = useState<PatientInsuranceValues>(initialPatientInsurance());
  const [piErrors, setPiErrors] = useState<PatientInsuranceErrors>({});

  // Step 2
  const [service, setService] = useState<ServiceDetailsValues>(initialServiceDetails());
  const [serviceErrors, setServiceErrors] = useState<ServiceDetailsErrors>({});

  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === STEPS.length;

  const changePatientInsurance = (patch: Partial<PatientInsuranceValues>) => {
    setPatientInsurance((prev) => ({ ...prev, ...patch }));
    setPiErrors((prev) => {
      const next = { ...prev };
      Object.keys(patch).forEach((key) => delete next[key as keyof PatientInsuranceErrors]);
      return next;
    });
  };

  const changeService = (patch: Partial<ServiceDetailsValues>) => {
    setService((prev) => ({ ...prev, ...patch }));
    setServiceErrors((prev) => {
      const next = { ...prev };
      Object.keys(patch).forEach((key) => delete next[key as keyof ServiceDetailsErrors]);
      if ("lines" in patch || "includeSpecific" in patch) delete next.lines;
      return next;
    });
  };

  const handleNext = () => {
    if (currentStep === 1) {
      const errs = validatePatientInsurance(patientInsurance);
      setPiErrors(errs);
      if (Object.keys(errs).length > 0) return;
    }

    if (currentStep === 2) {
      const errs = validateServiceDetails(service);
      setServiceErrors(errs);
      if (Object.keys(errs).length > 0) return;
    }

    if (isLastStep) {
      setIsSubmitting(true);
      console.log("submit eligibility request", { patientInsurance, service }); // TODO: call your API here
      setTimeout(() => router.push(LIST_ROUTE), 1000);
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
        return (
          <PatientInsurance
            values={patientInsurance}
            errors={piErrors}
            onChange={changePatientInsurance}
            service={service}
          />
        );
      case 2:
        return (
          <ServiceDetails
            values={service}
            errors={serviceErrors}
            onChange={changeService}
            patientInsurance={patientInsurance}
            onEdit={setCurrentStep}
          />
        );
      default:
        return <ReviewSubmit patientInsurance={patientInsurance} service={service} onEdit={setCurrentStep} />;
    }
  };

  return (
    <div className="flex min-h-full flex-col">
      <div className="mx-auto w-full max-w-[1600px] flex-1">
        <div className="space-y-4 sm:space-y-5">
          <Breadcrumb
            items={[
              { label: "Billing", href: "/payment/payment-gateway" },
              { label: "Eligibility Verification", href: LIST_ROUTE },
              { label: "Check Eligibility" },
            ]}
          />

          <div>
            <h2 className="text-lg font-semibold text-heading sm:text-xl 2xl:text-2xl">Check Insurance Eligibility</h2>
            <p className="mt-0.5 text-sm text-body">{SUBTITLES[currentStep - 1]}</p>
          </div>

          <AddSteps steps={STEPS} current={currentStep} onStepClick={handleStepClick} />

          <div className="">{renderStep()}</div>
        </div>
      </div>

      {/* Sticky bottom buttons */}
      <div className="sticky -bottom-4 z-[200] -mx-4 -mb-4 mt-4 border-t border-border bg-card px-4 py-4 sm:-bottom-6 sm:-mx-6 sm:-mb-6 sm:px-6 sm:py-5">
        <div className="mx-auto flex max-w-[1600px] items-center justify-center gap-2 sm:justify-end sm:gap-3">
          <ImportButton
            text="Cancel"
            icon={null}
            onClick={() => router.push(LIST_ROUTE)}
            className="shrink-0 whitespace-nowrap px-3 sm:px-5"
          />
          {!isFirstStep && (
            <ImportButton
              text="Back"
              icon={null}
              onClick={handleBack}
              className="shrink-0 whitespace-nowrap px-3 sm:px-5"
            />
          )}
          <AddButton
            text={
              <>
                <span className="sm:hidden">{isLastStep ? "Submit" : "Next"}</span>
                <span className="hidden sm:inline">{NEXT_LABEL[currentStep - 1]}</span>
              </>
            }
            icon={isLastStep ? <Send className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
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