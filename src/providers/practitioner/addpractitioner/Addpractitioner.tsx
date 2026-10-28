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

import BasicInformation, {
  initialBasic,
  validateBasic,
  validateBasicDraft,
  type BasicValues,
} from "./Basicinformation";
import LicensesJurisdictions, {
  initialLicenses,
  validateLicenses,
  type LicenseValues,
} from "./Licensesjurisdictions";
import LocationsAvailability, {
  initialLocations,
  validateLocations,
  type LocationValues,
} from "./Locationsavailability";
import CredentialsDocuments, {
  initialCredentials,
  validateCredentials,
  type CredentialValues,
} from "./Credentialsdocuments";
import ReviewSubmit from "./Reviewsubmit";

const LIST_ROUTE = "/provider/practitioner";

type Errors = Record<string, string>;

/* ---------- Step configuration ---------- */
const STEPS = [
  { id: 1, title: "Basic Information", subtitle: "Personal and professional details" },
  { id: 2, title: "Licenses & Jurisdictions", subtitle: "State licenses and telemedicine" },
  { id: 3, title: "Locations & Availability", subtitle: "Practice locations and hours" },
  { id: 4, title: "Credentials & Documents", subtitle: "Upload required documents" },
  { id: 5, title: "Review & Submit", subtitle: "Confirm and submit" },
];

type ToastState = {
  type: "success" | "error" | null;
  title: string;
  message: string;
};

/* ---------- Main component ---------- */
const AddPractitioner = () => {
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<ToastState>({ type: null, title: "", message: "" });

  // Form state for each step
  const [basic, setBasic] = useState<BasicValues>(initialBasic());
  const [licenses, setLicenses] = useState<LicenseValues>(initialLicenses());
  const [locations, setLocations] = useState<LocationValues>(initialLocations());
  const [credentials, setCredentials] = useState<CredentialValues>(initialCredentials());

  const [errors, setErrors] = useState<Errors>({});

  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === STEPS.length;

  /* ---------- Validation ---------- */
  const runValidation = (step: number): Errors => {
    switch (step) {
      case 1:
        return validateBasic(basic);
      case 2:
        return validateLicenses(licenses);
      case 3:
        return validateLocations(locations);
      case 4:
        return validateCredentials(credentials);
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

  /* ---------- Save / submit ---------- */
  const submit = async (mode: "draft" | "review") => {
    if (isSaving) return;

    if (mode === "draft") {
      const errs = validateBasicDraft(basic);
      if (Object.keys(errs).length) {
        setCurrentStep(1);
        showErrors(errs);
        setToast({
          type: "error",
          title: "Cannot save draft",
          message: "Enter at least the practitioner's first and last name.",
        });
        return;
      }
    } else {
      // Re-check every step before submitting; jump to the first one with problems.
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
    }

    setIsSaving(true);
    try {
      // TODO: call your API here
      console.log(mode === "draft" ? "Practitioner saved as draft:" : "Practitioner submitted for review:", {
        basic,
        licenses,
        locations,
        credentials: Object.fromEntries(
          Object.entries(credentials.docs).map(([key, doc]) => [key, doc?.file ?? doc?.fileName]),
        ),
      });
      router.push(LIST_ROUTE);
    } catch (error) {
      setToast({
        type: "error",
        title: "Could not save practitioner",
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

  // Only completed (earlier) steps can be clicked.
  const handleStepClick = (stepId: number) => {
    if (stepId < currentStep) goToStep(stepId);
  };

  /* ---------- Render current step ---------- */
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <BasicInformation
            values={basic}
            errors={errors}
            onChange={(patch) => setBasic((prev) => ({ ...prev, ...patch }))}
          />
        );
      case 2:
        return (
          <LicensesJurisdictions
            values={licenses}
            errors={errors}
            onChange={(patch) => setLicenses((prev) => ({ ...prev, ...patch }))}
          />
        );
      case 3:
        return (
          <LocationsAvailability
            values={locations}
            errors={errors}
            onChange={(patch) => setLocations((prev) => ({ ...prev, ...patch }))}
          />
        );
      case 4:
        return (
          <CredentialsDocuments
            values={credentials}
            errors={errors}
            onChange={(patch) => setCredentials((prev) => ({ ...prev, ...patch }))}
            onFileError={(message) => setToast({ type: "error", title: "Upload failed", message })}
          />
        );
      case 5:
        return (
          <ReviewSubmit
            basic={basic}
            licenses={licenses}
            locations={locations}
            credentials={credentials}
            onEditStep={goToStep}
          />
        );
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
              { label: "Practitioners", href: LIST_ROUTE },
              { label: "Add Practitioner" },
            ]}
          />

          <div>
            <h2 className="text-lg font-semibold text-heading sm:text-xl 2xl:text-2xl">Add Practitioner</h2>
            <p className="mt-0.5 text-sm text-body">Create a new practitioner profile in the system.</p>
          </div>

          <AddSteps steps={STEPS} current={currentStep} onStepClick={handleStepClick} />

          <div>{renderStep()}</div>
        </div>
      </div>

      {/* Sticky bottom buttons */}
      <div className="sticky -bottom-4 z-[250] -mx-4 -mb-4 mt-4 border-t border-border bg-card px-4 py-4 sm:-bottom-6 sm:-mx-6 sm:-mb-6 sm:px-6 sm:py-5">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-2 sm:gap-3">
          {/* Left */}
          {isFirstStep ? (
            <ImportButton
              text="Save as Draft"
              icon={null}
              onClick={() => submit("draft")}
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

          {/* Right */}
          {isLastStep ? (
            <div className="flex items-center gap-2 sm:gap-3">
              <ImportButton
                text="Save as Draft"
                icon={null}
                onClick={() => submit("draft")}
                className="shrink-0 whitespace-nowrap px-3 sm:px-5"
              />
              <AddButton
                text={isSaving ? "Submitting…" : "Submit for Review"}
                icon={<Check className="h-4 w-4" />}
                onClick={() => submit("review")}
                className="shrink-0 whitespace-nowrap px-3 sm:px-5"
                disabled={isSaving}
              />
            </div>
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

export default AddPractitioner;