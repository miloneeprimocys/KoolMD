"use client";

import React, { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { FaArrowLeft } from "react-icons/fa6";

import AddSteps from "@/components/Addsteps";
import AddButton from "@/components/Addbutton";
import ImportButton from "@/components/ImportButton";
import SuccessToast from "@/components/SuccessToast";
import ErrorToast from "@/components/ErrorToast";

import SelectPatient, {
  getPatientSummary,
  initialPatientStep,
  validatePatientStep,
  type PatientStepErrors,
  type PatientStepValues,
} from "./Selectpatient";
import AppointmentDetails, {
  initialAppointmentDetails,
  validateAppointmentDetails,
  type AppointmentDetailsErrors,
  type AppointmentDetailsValues,
} from "./Appointmentdetails";
import ProviderTime, {
  initialProviderTime,
  locationOptionsFor,
  validateProviderTime,
  type ProviderTimeErrors,
  type ProviderTimeValues,
} from "./Providertime";
import Confirmation from "./Confirmation";

/* ---------- Step configuration ---------- */
const STEPS = [
  { id: 1, title: "Patient", subtitle: "" },
  { id: 2, title: "Appointment Details", subtitle: "" },
  { id: 3, title: "Provider & Time", subtitle: "" },
  { id: 4, title: "Confirmation", subtitle: "" },
];

/* ---------- Page ---------- */
type Props = {
  /** Back / Cancel. When omitted the browser history is used (route mode). */
  onBack?: () => void;
};

const BookNewAppointment = ({ onBack }: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const isEditMode = pathname === "/edit-appointment";
  const goBack = () => (onBack ? onBack() : router.back());

  const [currentStep, setCurrentStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);

  // Form state for each step
  const [patientStep, setPatientStep] = useState<PatientStepValues>(initialPatientStep());
  const [details, setDetails] = useState<AppointmentDetailsValues>(initialAppointmentDetails());
  const [schedule, setSchedule] = useState<ProviderTimeValues>(initialProviderTime());
  const [sendConfirmation, setSendConfirmation] = useState(true);

  // Errors
  const [patientErrors, setPatientErrors] = useState<PatientStepErrors>({});
  const [detailsErrors, setDetailsErrors] = useState<AppointmentDetailsErrors>({});
  const [scheduleErrors, setScheduleErrors] = useState<ProviderTimeErrors>({});

  const [toast, setToast] = useState<{ type: "success" | "error" | null; title: string; message: string }>({
    type: null,
    title: "",
    message: "",
  });

  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === STEPS.length;
  const patient = getPatientSummary(patientStep);

  /* The "Select" buttons on step 1 replace the Next click — it stays disabled until one is chosen. */
  const nextDisabled =
    submitted || (currentStep === 1 && patientStep.mode === "existing" && !patientStep.patientId);

  /* ---------- Validation ---------- */
  const validateCurrentStep = (): boolean => {
    let errs: Record<string, string | undefined> = {};

    switch (currentStep) {
      case 1: {
        const e = validatePatientStep(patientStep);
        setPatientErrors(e);
        errs = e;
        break;
      }
      case 2: {
        const e = validateAppointmentDetails(details);
        setDetailsErrors(e);
        errs = e;
        break;
      }
      case 3: {
        const e = validateProviderTime(schedule);
        setScheduleErrors(e);
        errs = e;
        break;
      }
    }

    const keys = Object.keys(errs).filter((k) => errs[k]);
    if (keys.length) {
      const el = document.getElementById(keys[0]);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      el?.focus?.();
      return false;
    }
    return true;
  };

  /* ---------- Navigation ---------- */
  const handleNext = () => {
    if (isLastStep) {
      confirmAppointment();
      return;
    }

    if (!validateCurrentStep()) {
      setToast({
        type: "error",
        title: "Validation Incomplete",
        message: `Please complete all required fields in ${STEPS[currentStep - 1].title}.`,
      });
      return;
    }

    setCurrentStep((s) => s + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBack = () => {
    if (!isFirstStep) {
      setCurrentStep((s) => s - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleStepClick = (stepId: number) => {
    if (stepId < currentStep) setCurrentStep(stepId);
  };

  /* ---------- Change handlers ---------- */
  const changeDetails = (patch: Partial<AppointmentDetailsValues>) => {
    setDetails((prev) => ({ ...prev, ...patch }));
    setDetailsErrors({});

    // A different appointment type has different locations — keep the chosen one only if still valid.
    if (patch.type && patch.type !== details.type) {
      const options = locationOptionsFor(patch.type);
      setSchedule((prev) => ({
        ...prev,
        location: options.some((o) => o.value === prev.location) ? prev.location : options[0].value,
      }));
    }
  };

  const changeSchedule = (patch: Partial<ProviderTimeValues>) => {
    setSchedule((prev) => ({ ...prev, ...patch }));
    setScheduleErrors({});
  };

  /* ---------- Confirm ---------- */
  const confirmAppointment = () => {
    if (submitted) return;

    // TODO: call your API here
    console.log("Appointment created:", {
      patient: patientStep.mode === "existing" ? patientStep.patientId : patientStep.newPatient,
      type: details.type,
      reason: details.reason,
      notes: details.notes.trim() || undefined,
      newPatientVisit: details.newPatientVisit,
      longerDuration: details.longerDuration,
      provider: schedule.provider,
      location: schedule.location,
      date: schedule.date,
      time: schedule.time,
      sendConfirmation,
    });

    setSubmitted(true);
    setToast({
      type: "success",
      title: isEditMode ? "Appointment Updated" : "Appointment Confirmed",
      message: `${patient?.name ?? "The patient"}'s appointment on ${schedule.date} at ${schedule.time} has been scheduled.`,
    });
  };

  /* ---------- Render current step ---------- */
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <SelectPatient
            values={patientStep}
            errors={patientErrors}
            onChange={(patch) => {
              setPatientStep((prev) => ({ ...prev, ...patch }));
              setPatientErrors({});
            }}
          />
        );
      case 2:
        return (
          <AppointmentDetails
            patient={patient}
            values={details}
            errors={detailsErrors}
            onChange={changeDetails}
            onEditPatient={() => setCurrentStep(1)}
          />
        );
      case 3:
        return (
          <ProviderTime
            values={schedule}
            errors={scheduleErrors}
            onChange={changeSchedule}
            appointmentType={details.type}
            longerDuration={details.longerDuration}
          />
        );
      default:
        return (
          <Confirmation
            patient={patient}
            details={details}
            schedule={schedule}
            sendConfirmation={sendConfirmation}
            onSendConfirmationChange={setSendConfirmation}
            onEdit={setCurrentStep}
          />
        );
    }
  };

  return (
    <div className="flex min-h-full flex-col">
      <SuccessToast
        isOpen={toast.type === "success"}
        onClose={() => setToast((t) => ({ ...t, type: null }))}
        title={toast.title}
        message={toast.message}
      />
      <ErrorToast
        isOpen={toast.type === "error"}
        onClose={() => setToast((t) => ({ ...t, type: null }))}
        title={toast.title}
        message={toast.message}
      />

      <div className="mx-auto w-full min-w-0 max-w-[1600px] flex-1">
        <div className="space-y-4 sm:space-y-5">
          {/* Title + back action */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-heading sm:text-xl 2xl:text-2xl">
                {isEditMode ? "Edit Appointment" : "New Appointment"}
              </h2>
              <p className="mt-0.5 text-sm text-body">
                Schedule a new patient appointment for in-person or video consultation.
              </p>
            </div>
            <ImportButton
              text="Back"
              icon={<FaArrowLeft className="h-3.5 w-3.5" />}
              onClick={goBack}
              className="shrink-0 self-start whitespace-nowrap py-1!"
            />
          </div>

          {/* Step indicator */}
          <AddSteps steps={STEPS} current={currentStep} onStepClick={handleStepClick} />

          {/* Step content */}
          <div className="min-w-0 rounded-2xl border border-border bg-card p-4 sm:p-6">{renderStep()}</div>
        </div>
      </div>

      {/* Sticky bottom buttons */}
      <div className="sticky -bottom-4 z-[250] -mx-4 -mb-4 mt-4 border-t border-border bg-card px-4 py-4 sm:-bottom-6 sm:-mx-6 sm:-mb-6 sm:px-6 sm:py-5">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-2 sm:gap-3">
          {isFirstStep ? (
            <ImportButton text="Cancel" icon={null} onClick={goBack} className="shrink-0 whitespace-nowrap px-3 sm:px-5" />
          ) : (
            <ImportButton
              text="Back"
              icon={<ArrowLeft className="h-4 w-4" />}
              onClick={handleBack}
              className="shrink-0 whitespace-nowrap px-3 sm:px-5"
            />
          )}
          <AddButton
            text={isLastStep ? "Confirm Appointment" : "Next"}
            icon={isLastStep ? <Check className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
            onClick={handleNext}
            className="shrink-0 whitespace-nowrap px-3 sm:px-5"
            disabled={nextDisabled}
          />
        </div>
      </div>
    </div>
  );
};

export default BookNewAppointment;