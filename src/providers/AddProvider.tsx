"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

import BasicInformation, {
  initialBasic,
  validateBasic,
  type BasicValues,
} from "./Basicinformation";
import Licenses, {
  initialLicenses,
  validateLicenses,
  type LicenseValues,
} from "./Licenses";
import PracticeInfo, {
  initialPractice,
  validatePractice,
  type PracticeValues,
} from "./Practiceinfo";
import Availability, {
  initialAvailability,
  validateAvailability,
  type AvailabilityValues,
} from "./Availability";
import AddButton from "@/components/Addbutton";
import ImportButton from "@/components/ImportButton";
import Breadcrumb from "@/components/Breadcrumb";
import AddSteps from "@/components/Addsteps";
import type { Errors } from "./Shared";

/* ---------- Step configuration ---------- */
const STEPS = [
  { id: 1, title: "Basic Information", subtitle: "Personal and professional details" },
  { id: 2, title: "Licenses and Certificates", subtitle: "Professional credentials" },
  { id: 3, title: "Practice Information", subtitle: "Specialty and locations" },
  { id: 4, title: "Availability", subtitle: "Set working hours" },
];

/* ---------- Main component ---------- */
const AddProvider = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [attemptTick, setAttemptTick] = useState(0);

  // Form state for each step
  const [basic, setBasic] = useState<BasicValues>(initialBasic());
  const [licenses, setLicenses] = useState<LicenseValues>(initialLicenses());
  const [practice, setPractice] = useState<PracticeValues>(initialPractice());
  const [availability, setAvailability] = useState<AvailabilityValues>(
    initialAvailability()
  );

  // Errors for each step
  const [errors, setErrors] = useState<Errors>({});

  const isLastStep = currentStep === STEPS.length;
  const isFirstStep = currentStep === 1;

  /* ---------- Validation ---------- */
  const validateCurrentStep = (): boolean => {
    let errs: Errors = {};

    switch (currentStep) {
      case 1:
        errs = validateBasic(basic);
        break;
      case 2:
        errs = validateLicenses(licenses);
        break;
      case 3:
        errs = validatePractice(practice);
        break;
      case 4:
        errs = validateAvailability(availability);
        break;
    }

    setErrors(errs);
    setAttemptTick((prev) => prev + 1);

    if (Object.keys(errs).length > 0) {
      // Scroll to first error
      const firstErrorField = Object.keys(errs)[0];
      const el = document.getElementById(firstErrorField);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      el?.focus?.();
      return false;
    }

    return true;
  };

  /* ---------- Navigation ---------- */
  const handleNext = () => {
    if (!validateCurrentStep()) return;

    if (isLastStep) {
      // Submit all steps
      const payload = {
        basic,
        licenses,
        practice,
        availability,
      };
      console.log("Form submitted successfully:", payload);
      // TODO: call your API here
      // router.push("/providers");
    } else {
      // Move to next step
      setCurrentStep((prev) => prev + 1);
      setErrors({});
    }
  };

  const handleBack = () => {
    if (!isFirstStep) {
      setCurrentStep((prev) => prev - 1);
      setErrors({});
    }
  };

  const handleStepClick = (stepId: number) => {
    if (stepId < currentStep) {
      setCurrentStep(stepId);
      setErrors({});
    }
  };

  const handleCancel = () => {
    router.push("/providers");
  };

  /* ---------- Render current step ---------- */
  const renderStep = () => {
    const commonProps = {
      attemptTick,
    };

    switch (currentStep) {
      case 1:
        return (
          <BasicInformation
            values={basic}
            errors={errors}
            onChange={(patch) => setBasic((prev) => ({ ...prev, ...patch }))}
            {...commonProps}
          />
        );
      case 2:
        return (
          <Licenses
            values={licenses}
            errors={errors}
            onChange={(patch) => setLicenses((prev) => ({ ...prev, ...patch }))}
            {...commonProps}
          />
        );
      case 3:
        return (
          <PracticeInfo
            values={practice}
            errors={errors}
            onChange={(patch) => setPractice((prev) => ({ ...prev, ...patch }))}
            {...commonProps}
          />
        );
      case 4:
        return (
          <Availability
            values={availability}
            errors={errors}
            onChange={(patch) => setAvailability((prev) => ({ ...prev, ...patch }))}
            {...commonProps}
          />
        );
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <div className="mx-auto w-full max-w-[1600px] flex-1 px-4 py-4 sm:px-6 sm:py-5 lg:px-6 pb-32">
        <div className="space-y-4 sm:space-y-5">
          {/* Breadcrumb */}
          <Breadcrumb
            items={[
              { label: "Providers", href: "/providers" },
              { label: "Add Provider" },
            ]}
          />

          {/* Title */}
          <div>
            <h2 className="text-lg font-semibold text-heading sm:text-xl 2xl:text-2xl">
              Add Provider
            </h2>
            <p className="mt-0.5 text-sm text-body">
              Create a new provider profile in the system.
            </p>
          </div>

          {/* Step indicator */}
          <AddSteps
            steps={STEPS}
            current={currentStep}
            onStepClick={handleStepClick}
          />

          {/* Step content */}
          <div>{renderStep()}</div>
        </div>
      </div>

      {/* Sticky bottom buttons - contained within content width */}
      <div className="sticky bottom-0 z-[200] -mx-4 mt-4 border-t border-border bg-card px-4 py-4 sm:-mx-6 sm:px-6 sm:py-5 lg:-mx-6 lg:px-6 lg:py-5">
        <div className="mx-auto flex max-w-[1600px] items-center justify-end gap-3">
          <ImportButton
            text="Cancel"
            icon={null}
            onClick={handleCancel}
          />
          {!isFirstStep && (
            <ImportButton
              text="Back"
              icon={null}
              onClick={handleBack}
            />
          )}
          <AddButton
            text={isLastStep ? "Save Provider" : "Next"}
            icon={null}
            onClick={handleNext}
          />
        </div>
      </div>
    </div>
  );
};

export default AddProvider;
