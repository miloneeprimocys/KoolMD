"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Send } from "lucide-react";

import Breadcrumb from "@/components/Breadcrumb";
import AddSteps from "@/components/Addsteps";
import AddButton from "@/components/Addbutton";
import ImportButton from "@/components/ImportButton";
import type { Errors } from "@/providers/Shared";
import FaxRecipient, {
  initialFaxValues,
  validateFaxRecipient,
  type FaxValues,
} from "./Faxrecipient";
import FaxDocuments from "./Faxdocuments";
import FaxAdditionalInfo, { validateFaxAdditionalInfo } from "./Faxadditionalinfo";
import FaxReview from "./Faxreview";

/* ---------- Steps ---------- */
const STEPS = [
  { id: 1, title: "Recipient" },
  { id: 2, title: "Documents" },
  { id: 3, title: "Additional Info" },
  { id: 4, title: "Review & Send" },
];

const SUBTITLES = [
  "Send documents by fax to a provider or facility.",
  "Add and organize the documents you want to send.",
  "Add any additional details before sending.",
  "Review the information below and send the fax.",
];

const NEXT_LABEL = ["Next: Add Documents", "Next: Additional Info", "Next: Review & Send"];

const LIST_ROUTE = "/referral/efax";

/* ---------- Page ---------- */
const NewEfax = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [values, setValues] = useState<FaxValues>(initialFaxValues());
  const [errors, setErrors] = useState<Errors>({});
  const [documentPreviewOpen, setDocumentPreviewOpen] = useState(false);
  const [activeDocumentPreviewId, setActiveDocumentPreviewId] = useState<string | null>(null);

  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === STEPS.length;

  /** Patch values and clear the errors of the fields that were edited. */
  const update = (patch: Partial<FaxValues>) => {
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
      const errs = validateFaxRecipient(values);
      setErrors(errs);
      if (Object.keys(errs).length > 0) return;
    }
    if (currentStep === 2 && values.documents.length === 0) {
      setErrors({ documents: "Add at least one document to continue." });
      return;
    }
    if (currentStep === 3) {
      const errs = validateFaxAdditionalInfo(values);
      setErrors(errs);
      if (Object.keys(errs).length > 0) return;
    }

    if (isLastStep) {
      // TODO: call your send-fax API with `values`
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
        return <FaxRecipient values={values} errors={errors} onChange={update} />;
      case 2:
        return (
          <FaxDocuments
            values={values}
            errors={errors}
            onChange={update}
            onPreviewOpenChange={setDocumentPreviewOpen}
            activePreviewId={activeDocumentPreviewId}
            onActivePreviewIdChange={setActiveDocumentPreviewId}
          />
        );
      case 3:
        return <FaxAdditionalInfo values={values} errors={errors} onChange={update} />;
      default:
        return <FaxReview values={values} errors={errors} onChange={update} onEdit={goTo} />;
    }
  };

  const btnCls = "shrink-0 whitespace-nowrap px-3 sm:px-5";

  return (
    <div className="flex min-h-full flex-col">
      <div className="mx-auto w-full max-w-[1600px] flex-1">
        <div className="space-y-4 sm:space-y-5">
          <div className="space-y-2">
            <Breadcrumb
              items={[
                { label: "eFax", href: LIST_ROUTE },
                { label: "New Fax", onClick: () => goTo(1) },
                { label: STEPS[currentStep - 1].title },
              ]}
            />
            <div>
              <h2 className="text-lg font-semibold text-heading sm:text-xl 2xl:text-2xl">New Fax</h2>
              <p className="mt-0.5 text-sm text-body">{SUBTITLES[currentStep - 1]}</p>
            </div>
          </div>

          <AddSteps steps={STEPS} current={currentStep} onStepClick={handleStepClick} />

          <div>{renderStep()}</div>
        </div>
      </div>

      {/* Sticky bottom buttons */}
      <div className={`sticky -bottom-4 sm:-bottom-6 z-[250] -mx-4 -mb-4 sm:-mb-6 mt-4 border-t border-border bg-card px-4 py-4 sm:-mx-6 sm:px-6 sm:py-5 ${currentStep === 2 && documentPreviewOpen ? "hidden 2xl:block" : ""}`}>
        <div className="mx-auto flex max-w-[1600px] items-center justify-center sm:justify-end gap-2 sm:gap-3">
          {/* Left */}
          {isFirstStep ? (
            <ImportButton text="Cancel" icon={null} onClick={() => router.push(LIST_ROUTE)} className={btnCls} />
          ) : (
            <ImportButton
              text="Back"
              icon={<ArrowLeft className="h-4 w-4" />}
              onClick={handleBack}
              className={btnCls}
            />
          )}

          {/* Right */}
          <div className="flex items-center gap-2 sm:gap-3">
            <AddButton
              text={<><span className="sm:hidden">{isLastStep ? "Send" : "Next"}</span><span className="hidden sm:inline">{isLastStep ? "Send Fax" : NEXT_LABEL[currentStep - 1]}</span></>}
              icon={isLastStep ? <Send className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
              onClick={handleNext}
              className={btnCls}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewEfax;
