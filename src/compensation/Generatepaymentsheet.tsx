"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight } from "lucide-react";

import Breadcrumb from "@/components/Breadcrumb";
import AddSteps from "@/components/Addsteps";
import AddButton from "@/components/Addbutton";
import ImportButton from "@/components/ImportButton";
import SelectFetch, {
  FETCHED_COUNT,
  formatDate,
  getSheetProvider,
  initialSelectFetch,
  validateSelectFetch,
  type SelectFetchErrors,
  type SelectFetchValues,
} from "./Selectfetch";
import ReviewCalculate, { type SheetSnapshot } from "./Reviewcalculate";
import ConfirmSheet from "./Confirmsheet";

/* ---------- Steps ---------- */
const STEPS = [
  { id: 1, title: "Select & Fetch", subtitle: "Provider, period & records" },
  { id: 2, title: "Review & Calculate", subtitle: "Records and earnings" },
  { id: 3, title: "Confirm", subtitle: "Submit for review" },
];

const NEXT_LABEL = ["Next: Review & Calculate", "Next: Confirm", "Submit for Review"];

const SUBTITLES = [
  "Select provider, period and fetch completed consultations/cases.",
  "Review completed records, earnings and outstanding amount.",
  "Confirm the payment sheet and send it for admin review.",
];

/** Static until the sheet number comes from the API. */
const DRAFT_SHEET_ID = "PS-1045";

/* ---------- Page ---------- */
const GeneratePaymentSheet = () => {
  const router = useRouter();
  const presetProvider = useSearchParams().get("providerId") ?? "";
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1
  const [selection, setSelection] = useState<SelectFetchValues>(() => initialSelectFetch(presetProvider));
  const [errors, setErrors] = useState<SelectFetchErrors>({});
  const [fetchError, setFetchError] = useState<string | undefined>();

  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === STEPS.length;

  const provider = getSheetProvider(selection.provider);
  const snapshot: SheetSnapshot = {
    sheetId: DRAFT_SHEET_ID,
    provider: provider ? `${provider.name} (${provider.id})` : "—",
    period: `${formatDate(selection.startDate)} – ${formatDate(selection.endDate)}`,
    basis: provider?.basis ?? "—",
    rate: provider?.rate ?? 0,
    count: FETCHED_COUNT,
  };

  const changeSelection = (patch: Partial<SelectFetchValues>) => {
    setSelection((prev) => ({ ...prev, ...patch }));
    setErrors((prev) => {
      const next = { ...prev };
      for (const key of Object.keys(patch)) next[key] = undefined;
      return next;
    });
    setFetchError(undefined);
  };

  const handleFetch = () => {
    const errs = validateSelectFetch(selection);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    // TODO: fetch completed consultations/cases for the provider + period
    setSelection((prev) => ({ ...prev, fetched: true }));
  };

  const handleNext = () => {
    if (currentStep === 1) {
      const errs = validateSelectFetch(selection);
      setErrors(errs);
      if (Object.keys(errs).length > 0) return;
      if (!selection.fetched) {
        setFetchError("Fetch the records before continuing.");
        return;
      }
    }

    if (isLastStep) {
      // TODO: call your submit-payment-sheet API
      router.push(`/compensation/payment-sheet-review?id=${DRAFT_SHEET_ID}`);
      return;
    }
    setCurrentStep((s) => s + 1);
  };

  const handleSaveDraft = () => {
    // TODO: call your save-draft API
    router.push("/compensation");
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
          <SelectFetch
            values={selection}
            errors={errors}
            onChange={changeSelection}
            onFetch={handleFetch}
            fetchError={fetchError}
          />
        );
      case 2:
        return <ReviewCalculate snapshot={snapshot} />;
      default:
        return <ConfirmSheet snapshot={snapshot} onEdit={setCurrentStep} />;
    }
  };

  return (
    <div className="flex min-h-full flex-col">
      <div className="mx-auto w-full max-w-[1600px] flex-1">
        <div className="space-y-4 sm:space-y-5">
          <Breadcrumb
            items={[
              { label: "Dashboard", href: "/dashboard" },
              { label: "Compensation", href: "/compensation" },
              { label: "Payment Sheets" },
              { label: "Generate Payment Sheet" },
            ]}
          />

          <div>
            <h2 className="text-lg font-semibold text-heading sm:text-xl 2xl:text-2xl">Generate Payment Sheet</h2>
            <p className="mt-0.5 text-sm text-body">{SUBTITLES[currentStep - 1]}</p>
          </div>

          <AddSteps steps={STEPS} current={currentStep} onStepClick={handleStepClick} />

          <div>{renderStep()}</div>
        </div>
      </div>

      {/* Sticky bottom buttons */}
      <div className="sticky -bottom-4 sm:-bottom-6 z-[200] -mx-4 -mb-4 sm:-mb-6 mt-4 border-t border-border bg-card px-4 py-4 sm:-mx-6 sm:px-6 sm:py-5">
        <div className="mx-auto flex max-w-[1600px] items-center justify-center sm:justify-end gap-2 sm:gap-3">
          <ImportButton text="Cancel" icon={null} onClick={() => router.push("/compensation")} className="shrink-0 px-3 whitespace-nowrap sm:px-5" />
          {!isFirstStep && <ImportButton text="Back" icon={null} onClick={handleBack} className="shrink-0 px-3 whitespace-nowrap sm:px-5" />}
          {!isFirstStep && <ImportButton text="Save Draft" icon={null} onClick={handleSaveDraft} className="shrink-0 px-3 whitespace-nowrap sm:px-5" />}
          <AddButton
            text={
              <>
                <span className="sm:hidden">{isLastStep ? "Submit" : "Next"}</span>
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

export default GeneratePaymentSheet;