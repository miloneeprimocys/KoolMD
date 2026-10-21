"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

import Breadcrumb from "@/components/Breadcrumb";
import AddSteps from "@/components/Addsteps";
import AddButton from "@/components/Addbutton";
import ImportButton from "@/components/ImportButton";
import OrderDetails, {
  initialOrderDetails,
  validateOrderDetails,
  type OrderDetailsErrors,
  type OrderDetailsValues,
} from "./Orderdetails";
import SelectTests, { getTest, type LabTest } from "./Selecttests";
import AdditionalInfo, {
  initialAdditionalInfo,
  validateAdditionalInfo,
  type AdditionalInfoValues,
  type OrderSnapshot,
} from "./Additionalinfo";
import ReviewSave from "./Reviewsave";
import { todayISO, type Errors } from "@/providers/Shared";

/* ---------- Steps ---------- */
const STEPS = [
  { id: 1, title: "Order Details", subtitle: "Patient & order information" },
  { id: 2, title: "Select Tests", subtitle: "Choose laboratory tests" },
  { id: 3, title: "Additional Info", subtitle: "Specimen & instructions" },
  { id: 4, title: "Review & Save", subtitle: "Confirm and create order" },
];

/** Label of the primary button on each step. */
const NEXT_LABEL = [
  "Next: Select Tests",
  "Next: Additional Info",
  "Next: Review & Save",
  "Create Lab Order",
];

const SUBTITLES = [
  "Create a new laboratory order for the patient.",
  "Create a new laboratory order for the patient.",
  "Create a new laboratory order for the patient.",
  "Review all details before creating the laboratory order.",
];

/* ---------- Page ---------- */
const NewLabOrder = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1
  const [details, setDetails] = useState<OrderDetailsValues>(initialOrderDetails());
  const [errors, setErrors] = useState<OrderDetailsErrors>({});

  // Step 2
  const [selectedTestIds, setSelectedTestIds] = useState<string[]>([]);
  const [testsError, setTestsError] = useState<string | undefined>();

  // Step 3
  const [additional, setAdditional] = useState<AdditionalInfoValues>(initialAdditionalInfo());
  const [additionalErrors, setAdditionalErrors] = useState<Errors>({});

  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === STEPS.length;

  const selectedTests = selectedTestIds
    .map(getTest)
    .filter((t): t is LabTest => !!t);

  /*
    Snapshot of step-1 data shown in the summaries.
    TODO: map these keys to the real fields of OrderDetailsValues.
  */
  const d = details as unknown as Record<string, string | undefined>;
  const snapshot: OrderSnapshot = {
    patient: d.patient ?? "John Smith (PT-1008)",
    provider: d.provider ?? "Dr. Emily Carter (Internal Medicine)",
    orderDate: d.orderDate ?? todayISO(),
    priority: d.priority ?? "Routine",
    diagnosis: d.diagnosis ?? "—",
  };

  const handleNext = () => {
    if (currentStep === 1) {
      const errs = validateOrderDetails(details);
      setErrors(errs);
      if (Object.keys(errs).length > 0) return;
    }

    if (currentStep === 2) {
      if (selectedTestIds.length === 0) {
        setTestsError("Select at least one laboratory test to continue.");
        return;
      }
      setTestsError(undefined);
    }

    if (currentStep === 3) {
      const errs = validateAdditionalInfo(additional);
      setAdditionalErrors(errs);
      if (Object.keys(errs).length > 0) return;
    }

    if (isLastStep) {
      // TODO: call your create-lab-order API with details, selectedTestIds, additional
      router.push("/lab-results?tab=lab-orders");
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

  const changeTests = (ids: string[]) => {
    setSelectedTestIds(ids);
    if (ids.length > 0) setTestsError(undefined);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <OrderDetails
            values={details}
            errors={errors}
            onChange={(patch) => setDetails((prev) => ({ ...prev, ...patch }))}
          />
        );
      case 2:
        return <SelectTests selected={selectedTestIds} onChange={changeTests} error={testsError} />;
      case 3:
        return (
          <AdditionalInfo
            values={additional}
            errors={additionalErrors}
            onChange={(patch) => setAdditional((prev) => ({ ...prev, ...patch }))}
            tests={selectedTests}
            snapshot={snapshot}
            onRemoveTest={(id) => changeTests(selectedTestIds.filter((x) => x !== id))}
            onEdit={setCurrentStep}
          />
        );
      default:
        return (
          <ReviewSave
            tests={selectedTests}
            snapshot={snapshot}
            additional={additional}
            onEdit={setCurrentStep}
          />
        );
    }
  };

  return (
    <div className="flex min-h-full flex-col">
      <div className="mx-auto w-full max-w-[1600px] flex-1">
        <div className="space-y-4 sm:space-y-5">
          <Breadcrumb
            items={[
              { label: "Lab Results", href: "/lab-results?tab=lab-orders" },
              { label: "Patient Details", href: "/patients" },
              { label: "Lab Orders", href: "/lab-results?tab=lab-orders" },
              { label: "New Lab Order" },
            ]}
          />

          <div>
            <h2 className="text-lg font-semibold text-heading sm:text-xl 2xl:text-2xl">
              New Lab Order
            </h2>
            <p className="mt-0.5 text-sm text-body">{SUBTITLES[currentStep - 1]}</p>
          </div>

          <AddSteps steps={STEPS} current={currentStep} onStepClick={handleStepClick} />

          <div>{renderStep()}</div>
        </div>
      </div>

      {/* Sticky bottom buttons */}
      <div className="sticky -bottom-4 sm:-bottom-6 z-[200] -mx-4 -mb-4 sm:-mb-6 mt-4 border-t border-border bg-card px-4 py-4 sm:-mx-6 sm:px-6 sm:py-5">
        <div className="mx-auto flex max-w-[1600px] items-center justify-center sm:justify-end gap-2 sm:gap-3">
          <ImportButton text="Cancel" icon={null} onClick={() => router.push("/lab-results?tab=lab-orders")} className="shrink-0 px-3 whitespace-nowrap sm:px-5" />
          {!isFirstStep && <ImportButton text="Back" icon={null} onClick={handleBack} className="shrink-0 px-3 whitespace-nowrap sm:px-5" />}
          <AddButton
            text={
              <>
                <span className="sm:hidden">{isLastStep ? "Create" : "Next"}</span>
                <span className="hidden sm:inline">{NEXT_LABEL[currentStep - 1]}</span>
              </>
            }
            ariaLabel={NEXT_LABEL[currentStep - 1]}
            icon={isLastStep ? null : <ArrowRight className="h-4 w-4" />}
            onClick={handleNext}
            className="shrink-0 whitespace-nowrap px-3 sm:px-5"
          />
        </div>
      </div>
    </div>
  );
};

export default NewLabOrder;
