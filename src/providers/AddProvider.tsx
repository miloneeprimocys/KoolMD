"use client";

import React, { useEffect, useState } from "react";
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
} from "./Availability/Availability";
import AddButton from "@/components/Addbutton";
import ImportButton from "@/components/ImportButton";
import Breadcrumb from "@/components/Breadcrumb";
import AddSteps from "@/components/Addsteps";
import SuccessToast from "@/components/SuccessToast";
import ErrorToast from "@/components/ErrorToast";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppHooks";
import {
  selectCreatePractitionerRequest,
  selectOrganizationLocations,
} from "@/redux/selectors/practitionerSelectors";
import { onboardProvider } from "@/redux/thunks/practitionerThunks";
import { resetCreatePractitionerRequest } from "@/redux/slices/practitionersSlice";
import type { Errors } from "./Shared";
import {
  buildOnboardProviderRequest,
  findScheduleOverlaps,
  planSchedules,
} from "./buildOnboardProviderRequest";
import { DAYS, defaultWeek, type LocationItem, type WeekSchedule } from "./Availability/Location";

/** Every day off, empty shifts — the user picks the days for this location. */
const closedWeek = (prefix: string): WeekSchedule => {
  const week = defaultWeek(prefix);
  for (const { key } of DAYS) {
    week[key] = {
      enabled: false,
      shifts: week[key].shifts.map((shift) => ({ ...shift, start: "", end: "" })),
    };
  }
  return week;
};

/* ---------- Step configuration ---------- */
const STEPS = [
  { id: 1, title: "Basic Information", subtitle: "Personal and professional details" },
  { id: 2, title: "Licenses and Certificates", subtitle: "Professional credentials" },
  { id: 3, title: "Practice Information", subtitle: "Specialty and locations" },
  { id: 4, title: "Availability", subtitle: "Set working hours" },
];

/** Backend validation field → form field (step 1), so server errors show under the input. */
const FORM_FIELD_BY_API_FIELD: Record<string, string> = {
  email: "email",
  firstName: "firstName",
  lastName: "lastName",
  phoneNumber: "phone",
  npi: "npi",
  credentials: "title",
};

/** Error codes that point at a step-1 field. */
const FORM_FIELD_BY_ERROR_CODE: Record<string, string> = {
  EMAIL_ALREADY_REGISTERED: "email",
  PHONE_NUMBER_ALREADY_REGISTERED: "phone",
  NPI_ALREADY_REGISTERED: "npi",
};

/* ---------- Main component ---------- */
const AddProvider = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const createRequest = useAppSelector(selectCreatePractitionerRequest);
  const isSaving = createRequest.status === "pending";
  const organizationLocations = useAppSelector(selectOrganizationLocations);

  // Each visit starts with a fresh save state.
  useEffect(() => () => void dispatch(resetCreatePractitionerRequest()), [dispatch]);
  const [currentStep, setCurrentStep] = useState(1);
  const [attemptTick, setAttemptTick] = useState(0);
  const [toast, setToast] = useState<{
    type: "success" | "error" | null;
    title: string;
    message: string;
    action?: { label: string; onClick: () => void };
  }>({
    type: null,
    title: "",
    message: "",
  });

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
        // Telemedicine is only allowed where the provider holds a state medical license.
        if (
          practice.telemedicine &&
          practice.jurisdictions.some((stateCode) => stateCode !== licenses.medicalState)
        ) {
          errs.jurisdictions =
            "Telemedicine states must match the state medical license added in step 2.";
        }
        break;
      case 4: {
        errs = validateAvailability(availability);
        const isTelemedicineOn = practice.telemedicine && availability.telemedicineEnabled;
        if (
          isTelemedicineOn &&
          availability.teleJurisdictions.some((stateCode) => stateCode !== licenses.medicalState)
        ) {
          errs.teleJurisdictions =
            "Telemedicine states must match the state medical license added in step 2.";
        }
        // Only when each row is valid on its own — then check across locations / telemedicine.
        if (Object.keys(errs).length === 0) {
          errs = findScheduleOverlaps(planSchedules(availability, practice.telemedicine));
        }
        break;
      }
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
    if (!validateCurrentStep()) {
      const stepName = STEPS[currentStep - 1]?.title || `Step ${currentStep}`;
      setToast({
        type: "error",
        title: "Validation Incomplete",
        message: `Please complete all required fields in ${stepName}.`,
      });
      return;
    }

    if (isLastStep) {
      saveProvider();
    } else {
      if (currentStep === 3) syncAvailabilityLocations();
      // Move to next step
      setCurrentStep((prev) => prev + 1);
      setErrors({});
    }
  };

  /**
   * In-person hours are set per practice location chosen in step 3 (physical ones only —
   * virtual locations are telemedicine). Keeps the hours already entered for kept locations.
   */
  const syncAvailabilityLocations = () => {
    const activeRows =
      practice.practiceType === "single" ? practice.locations.slice(0, 1) : practice.locations;
    const physicalLocations = activeRows
      .map((row) => organizationLocations.find((location) => location.id === row.locationId))
      .filter((location) => location !== undefined && location.locationType !== "VIRTUAL");

    setAvailability((previous) => ({
      ...previous,
      locations: physicalLocations.map(
        (location, index): LocationItem =>
          previous.locations.find((item) => item.id === location!.id) ?? {
            id: location!.id,
            name: location!.name,
            // Only the first location gets default hours: identical hours at two locations
            // would overlap (a provider can't be in two places), so the rest start closed.
            week: index === 0 ? defaultWeek(location!.id) : closedWeek(location!.id),
          },
      ),
    }));
  };

  const saveProvider = async () => {
    if (isSaving) return;
    const onboardResult = await dispatch(
      onboardProvider(buildOnboardProviderRequest(basic, licenses, practice, availability)),
    );

    if (onboardProvider.fulfilled.match(onboardResult)) {
      const { followUpErrors } = onboardResult.payload;
      if (followUpErrors.length === 0) {
        router.push("/providers");
        return;
      }
      // Provider exists now; re-saving would create a duplicate, so offer the list instead.
      setToast({
        type: "error",
        title: "Provider created — some details were not saved",
        message: followUpErrors.join(" • "),
        action: { label: "Go to Providers", onClick: () => router.push("/providers") },
      });
      return;
    }

    const requestError = onboardResult.payload;
    if (!requestError) return; // skipped: a save is already in progress

    const fieldErrors: Errors = {};
    for (const [apiField, message] of Object.entries(requestError.fieldErrors ?? {})) {
      const formField = FORM_FIELD_BY_API_FIELD[apiField];
      if (formField) fieldErrors[formField] = message;
    }
    const fieldFromErrorCode = FORM_FIELD_BY_ERROR_CODE[requestError.errorCode];
    if (fieldFromErrorCode) fieldErrors[fieldFromErrorCode] = requestError.message;

    if (Object.keys(fieldErrors).length) {
      // All mapped fields live in step 1 — take the user there.
      setCurrentStep(1);
      setErrors(fieldErrors);
    }
    setToast({ type: "error", title: "Could not save provider", message: requestError.message });
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
      {/* Success and Error Toasts */}
      <SuccessToast
        isOpen={toast.type === "success"}
        onClose={() => setToast((prev) => ({ ...prev, type: null }))}
        title={toast.title}
        message={toast.message}
      />
      <ErrorToast
        isOpen={toast.type === "error"}
        onClose={() => setToast((prev) => ({ ...prev, type: null, action: undefined }))}
        title={toast.title}
        message={toast.message}
        action={toast.action}
        duration={toast.action ? 0 : undefined}
      />

      <div className="mx-auto w-full max-w-[1600px] flex-1  ">
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
      <div className="sticky -bottom-4 sm:-bottom-6 z-[200] -mx-4 -mb-4 sm:-mb-6 mt-4 border-t border-border bg-card px-4 py-4 sm:-mx-6 sm:px-6 sm:py-5">
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
            text={isLastStep ? (isSaving ? "Saving…" : "Save Provider") : "Next"}
            icon={null}
            onClick={handleNext}
            disabled={isSaving || createRequest.status === "succeeded"}
          />
        </div>
      </div>
    </div>
  );
};

export default AddProvider;
