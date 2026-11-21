"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, CheckCircle2, MoreHorizontal, ShieldCheck } from "lucide-react";

import AddButton from "@/components/Addbutton";
import ImportButton from "@/components/ImportButton";
import VerticalSteps from "@/components/Verticalsteps";
import SuccessToast from "@/components/SuccessToast";
import ErrorToast from "@/components/ErrorToast";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppHooks";
import {
  clearPracticeLocationResult,
  clearStateLicenseResult,
} from "@/redux/slices/dialogslice";
import { cardCls, type Errors } from "@/providers/Shared";

import ProfileRegistration, { initialRegistration, validateRegistration, type RegistrationValues } from "./ProfileRegistration";
import ProfileLicenses, { initialLicenses, validateLicenses, type LicenseRow, type LicensesValues } from "./ProfileLicenses";
import ProfileLocation, { initialLocationStep, validateLocationStep, type LocationStepValues } from "./ProfileLocation";
import ProfileDocuments, { initialDocuments, validateDocuments, type DocumentsValues } from "./ProfileDocuments";
import ProfileReview from "./ProfileReview";
import type { LocationRow } from "./PracticeLocations";

const DONE_ROUTE = "/provider/under-review";
const PROFILE_STEP_ROUTES = [
  "/provider/profile/registration",
  "/provider/profile/licenses",
  "/provider/profile/locations",
  "/provider/profile/documents",
  "/provider/profile/review",
] as const;

const getStepFromPath = (pathname: string | null) => {
  const stepIndex = PROFILE_STEP_ROUTES.findIndex((route) => route === pathname);
  return stepIndex < 0 ? 1 : stepIndex + 1;
};

const STEPS = [
  { id: 1, title: "Profile & Registration", subtitle: "Basic and professional details", heading: "Provider Registration & Profile", description: "Create your practitioner profile to get started on KOOLMD." },
  { id: 2, title: "Licenses & Credentials", subtitle: "State licenses, NPI/DEA", heading: "Licenses & Credentials", description: "Add your professional identifiers, state licenses and board certifications." },
  { id: 3, title: "Locations & Telemedicine", subtitle: "Practice locations and jurisdictions", heading: "Locations & Telemedicine", description: "Add your practice locations and set your telemedicine jurisdictions." },
  { id: 4, title: "Documents", subtitle: "Upload credentials and certificates", heading: "Documents", description: "Upload your professional documents for verification and administrative review." },
  { id: 5, title: "Review & Submit", subtitle: "Verify information and submit", heading: "Review & Submit", description: "Review your information below. Make any changes if needed, then submit your application for administrative approval." },
];

const APPROVAL_STEPS = [
  "Submit your provider profile",
  "Admin review and verification",
  "Receive approval notification",
  "Start seeing patients",
];

type ToastState = { type: "success" | "error" | null; title: string; message: string };

const ProviderProfile = () => {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const practiceLocationResult = useAppSelector((state) => state.dialog.practiceLocationResult);
  const stateLicenseResult = useAppSelector((state) => state.dialog.stateLicenseResult);

  const currentStep = getStepFromPath(pathname);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [toast, setToast] = useState<ToastState>({ type: null, title: "", message: "" });

  const [registration, setRegistration] = useState<RegistrationValues>(initialRegistration());
  const [licenses, setLicenses] = useState<LicensesValues>(initialLicenses());
  const [location, setLocation] = useState<LocationStepValues>(initialLocationStep());
  const [documents, setDocuments] = useState<DocumentsValues>(initialDocuments());
  const [confirmed, setConfirmed] = useState(false);

  const isFirst = currentStep === 1;
  const isLast = currentStep === STEPS.length;
  const meta = STEPS[currentStep - 1];

  /* Edit a step's values and clear the matching errors */
  const patchReg = (patch: Partial<RegistrationValues>) => {
    setRegistration((p) => ({ ...p, ...patch }));
    setErrors((prev) => {
      const next = { ...prev };
      Object.keys(patch).forEach((k) => delete next[k]);
      return next;
    });
  };
  const patchLicenses = (patch: Partial<LicensesValues>) => {
    setLicenses((p) => ({ ...p, ...patch }));
    setErrors((prev) => {
      const next = { ...prev };
      Object.keys(patch).forEach((k) => delete next[k]);
      return next;
    });
  };
  const patchLocation = (patch: Partial<LocationStepValues>) => {
    setLocation((p) => ({ ...p, ...patch }));
    setErrors({});
  };
  const patchDocuments = (patch: Partial<DocumentsValues>) => {
    setDocuments((p) => ({ ...p, ...patch }));
    setErrors({});
  };

  useEffect(() => {
    if (!practiceLocationResult) return;
    const addedLocation: LocationRow = {
      id: practiceLocationResult.id,
      name: practiceLocationResult.name,
      type: practiceLocationResult.type,
      address: {
        address1: practiceLocationResult.address1,
        address2: "",
        country: "US",
        state: practiceLocationResult.state,
        city: practiceLocationResult.city,
        zip: practiceLocationResult.zip,
      },
      phoneCountry: practiceLocationResult.phoneCountry,
      phone: practiceLocationResult.phone,
      faxCountry: practiceLocationResult.faxCountry,
      fax: practiceLocationResult.fax,
      department: practiceLocationResult.department,
      primary: practiceLocationResult.primary,
    };
    // Apply the global dialog result to the local wizard draft.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocation((previous) => {
      let locations = previous.locations.some((item) => item.id === addedLocation.id)
        ? previous.locations.map((item) => (item.id === addedLocation.id ? addedLocation : item))
        : [...previous.locations, addedLocation];
      if (addedLocation.primary) locations = locations.map((item) => ({ ...item, primary: item.id === addedLocation.id }));
      else if (!locations.some((item) => item.primary)) locations = locations.map((item, index) => ({ ...item, primary: index === 0 }));
      return { ...previous, locations };
    });
    setErrors((previous) => {
      const next = { ...previous };
      delete next.locations;
      return next;
    });
    dispatch(clearPracticeLocationResult());
  }, [practiceLocationResult, dispatch]);

  useEffect(() => {
    if (!stateLicenseResult) return;
    const addedLicense: LicenseRow = {
      id: stateLicenseResult.id,
      state: stateLicenseResult.state,
      number: stateLicenseResult.number,
      type: stateLicenseResult.type,
      issue: stateLicenseResult.issue,
      expiry: stateLicenseResult.expiry,
      authority: stateLicenseResult.authority,
      primary: stateLicenseResult.primary,
    };
    // Apply the global dialog result to the local wizard draft.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLicenses((previous) => {
      let licenses = previous.licenses.some((item) => item.id === addedLicense.id)
        ? previous.licenses.map((item) => (item.id === addedLicense.id ? addedLicense : item))
        : [...previous.licenses, addedLicense];
      if (addedLicense.primary) licenses = licenses.map((item) => ({ ...item, primary: item.id === addedLicense.id }));
      else if (!licenses.some((item) => item.primary)) licenses = licenses.map((item, index) => ({ ...item, primary: index === 0 }));
      const files = stateLicenseResult.documentName
        ? [
            ...previous.files.filter((file) => file.id !== `license-doc-${stateLicenseResult.id}`),
            {
              id: `license-doc-${stateLicenseResult.id}`,
              name: stateLicenseResult.documentName,
              size: stateLicenseResult.documentSize,
              url: stateLicenseResult.documentUrl,
            },
          ]
        : previous.files;
      return { ...previous, licenses, files };
    });
    setErrors((previous) => {
      const next = { ...previous };
      delete next.licenses;
      return next;
    });
    dispatch(clearStateLicenseResult());
  }, [stateLicenseResult, dispatch]);

  const goToStep = (step: number) => {
    const route = PROFILE_STEP_ROUTES[step - 1];
    if (!route) return;
    setErrors({});
    router.push(route);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ---------- Validation ---------- */
  const runValidation = (step: number): Errors => {
    switch (step) {
      case 1:
        return validateRegistration(registration);
      case 2:
        return validateLicenses(licenses, { npi: registration.npi, dea: registration.dea });
      case 3:
        return validateLocationStep(location);
      case 4:
        return validateDocuments(documents);
      case 5:
        return confirmed ? {} : { confirm: "Please confirm that the information is accurate and complete." };
      default:
        return {};
    }
  };

  const showErrors = (errs: Errors, step: number) => {
    setErrors(errs);
    setToast({
      type: "error",
      title: "Validation Incomplete",
      message: `Please complete all required fields in ${STEPS[step - 1].title}.`,
    });
    const first = Object.keys(errs)[0];
    if (!first) return;
    // wait for the step to render before focusing
    setTimeout(() => {
      const el = document.getElementById(first);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      el?.focus?.();
    }, 50);
  };

  /* ---------- Draft / submit ---------- */
  const saveDraft = () => {
    if (isSaving) return;
    if (!registration.firstName.trim() || !registration.lastName.trim()) {
      goToStep(1);
      showErrors(
        {
          ...(registration.firstName.trim() ? {} : { firstName: "First name is required." }),
          ...(registration.lastName.trim() ? {} : { lastName: "Last name is required." }),
        },
        1,
      );
      return;
    }
    // TODO: call your API here
    console.log("Provider profile saved as draft:", { registration, licenses, location, documents });
    setToast({ type: "success", title: "Draft saved", message: "Your provider profile has been saved as a draft." });
  };

  const submit = async () => {
    if (isSaving) return;
    for (let step = 1; step <= STEPS.length; step++) {
      const errs = runValidation(step);
      if (Object.keys(errs).length) {
        goToStep(step);
        return showErrors(errs, step);
      }
    }
    setIsSaving(true);
    try {
      // TODO: call your API here
      console.log("Provider profile submitted for approval:", { registration, licenses, location, documents });
      router.push(DONE_ROUTE);
    } catch (error) {
      setToast({
        type: "error",
        title: "Could not submit profile",
        message: error instanceof Error ? error.message : "Something went wrong. Try again.",
      });
      setIsSaving(false);
    }
  };

  /* Top "Submit for Review": validate steps 1–4, then take the user to Review & Submit */
  const submitForReview = () => {
    for (let step = 1; step < STEPS.length; step++) {
      const errs = runValidation(step);
      if (Object.keys(errs).length) {
        goToStep(step);
        return showErrors(errs, step);
      }
    }
    if (isLast) void submit();
    else {
      goToStep(STEPS.length);
    }
  };

  /* ---------- Navigation ---------- */
  const handleNext = () => {
    const errs = runValidation(currentStep);
    if (Object.keys(errs).length) return showErrors(errs, currentStep);
    goToStep(currentStep + 1);
  };

  // Only completed (earlier) steps can be clicked.
  const handleStepClick = (id: number) => {
    if (id < currentStep) goToStep(id);
  };

  /* ---------- Current step ---------- */
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <ProfileRegistration values={registration} errors={errors} onChange={patchReg} />;
      case 2:
        return (
          <ProfileLicenses
            values={licenses}
            errors={errors}
            onChange={patchLicenses}
            identifiers={{ npi: registration.npi, dea: registration.dea }}
            onIdentifiersChange={patchReg}
          />
        );
      case 3:
        return <ProfileLocation values={location} errors={errors} onChange={patchLocation} />;
      case 4:
        return <ProfileDocuments values={documents} errors={errors} onChange={patchDocuments} />;
      case 5:
        return (
          <ProfileReview
            registration={registration}
            licenses={licenses}
            location={location}
            documents={documents}
            confirmed={confirmed}
            onConfirm={(v) => {
              setConfirmed(v);
              setErrors({});
            }}
            error={errors.confirm}
            onEditStep={goToStep}
          />
        );
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <SuccessToast
        isOpen={toast.type === "success"}
        onClose={() => setToast((p) => ({ ...p, type: null }))}
        title={toast.title}
        message={toast.message}
      />
      <ErrorToast
        isOpen={toast.type === "error"}
        onClose={() => setToast((p) => ({ ...p, type: null }))}
        title={toast.title}
        message={toast.message}
      />

      <div className="mx-auto w-full max-w-[1600px] flex-1 space-y-4 sm:space-y-5">
        {/* ---------- Header ---------- */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-xl font-bold tracking-tight text-heading sm:text-2xl">Provider Onboarding</h1>
          <div className="flex items-center gap-2 sm:gap-3">
            <ImportButton text="Save as Draft" icon={null} onClick={saveDraft} className="shrink-0 whitespace-nowrap px-3 sm:px-5" />
            <AddButton text="Submit for Review" icon={null} onClick={submitForReview} className="shrink-0 whitespace-nowrap px-3 sm:px-5" />
          </div>
        </div>

        <div className="grid min-w-0 grid-cols-1 overflow-clip rounded-[14px] border border-border bg-card xl:grid-cols-[280px_minmax(0,1fr)] 2xl:grid-cols-[320px_minmax(0,1fr)]">
          {/* ---------- Left rail ---------- */}
          <aside className="min-w-0 bg-card xl:border-r xl:border-divider">
            <div className="xl:sticky xl:top-0">
              <VerticalSteps
                steps={STEPS}
                current={currentStep}
                onStepClick={handleStepClick}
                className="border-b border-divider xl:border-b-0"
              />

              <section className={`${cardCls} mx-3 mb-3 bg-primary/[0.04] sm:mx-4 sm:mb-4`} aria-label="Onboarding and approval">
                <h2 className="mb-3 flex items-center gap-2.5 text-base font-semibold text-heading">
                  <ShieldCheck className="h-5 w-5 shrink-0 text-primary" />
                  Onboarding &amp; Approval
                </h2>
                <ol className="space-y-3">
                  {APPROVAL_STEPS.map((label, i) => (
                    <li key={label} className="flex items-center gap-3 text-sm text-heading">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                        {i < APPROVAL_STEPS.length - 1 ? <CheckCircle2 className="h-4 w-4" /> : <MoreHorizontal className="h-4 w-4" />}
                      </span>
                      {label}
                    </li>
                  ))}
                </ol>
              </section>
            </div>
          </aside>

          {/* ---------- Step content ---------- */}
          <main className="min-w-0 space-y-4 overflow-hidden p-4 sm:space-y-5 sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <h2 className="text-xl font-bold tracking-tight text-heading sm:text-2xl">{meta.heading}</h2>
                <p className="mt-0.5 text-sm text-body">{meta.description}</p>
              </div>
              <div className="w-full shrink-0 sm:w-[220px]">
                <p className="mb-1.5 text-xs font-medium text-heading sm:text-right">
                  Step {currentStep} of {STEPS.length}
                </p>
                <div className="h-2 w-full overflow-hidden rounded-full bg-primary/10" role="progressbar" aria-valuemin={1} aria-valuemax={STEPS.length} aria-valuenow={currentStep}>
                  <div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: `${(currentStep / STEPS.length) * 100}%` }} />
                </div>
              </div>
            </div>

            {renderStep()}
          </main>
        </div>
      </div>

      {/* ---------- Sticky bottom buttons ---------- */}
      <div className="sticky -bottom-4 z-[250] -mx-4 -mb-4 mt-4 border-t border-border bg-card px-4 py-4 sm:-bottom-6 sm:-mx-6 sm:-mb-6 sm:px-6 sm:py-5">
        <div className="mx-auto flex max-w-[1600px] items-center justify-center sm:justify-end gap-2 sm:gap-3">
          {isFirst ? (
            <span />
          ) : (
            <ImportButton text="Previous" icon={<ArrowLeft className="h-4 w-4" />} onClick={() => goToStep(currentStep - 1)} className="shrink-0 whitespace-nowrap px-3 sm:px-5" />
          )}

          {isLast ? (
            <AddButton
              text={isSaving ? "Submitting…" : "Submit for Approval"}
              icon={<Check className="h-4 w-4" />}
              onClick={submit}
              disabled={isSaving}
              className="shrink-0 whitespace-nowrap px-3 sm:px-5"
            />
          ) : (
            <AddButton text="Save & Continue" icon={<ArrowRight className="h-4 w-4" />} onClick={handleNext} className="shrink-0 whitespace-nowrap px-3 sm:px-5" />
          )}
        </div>
      </div>
    </div>
  );
};

export default ProviderProfile;