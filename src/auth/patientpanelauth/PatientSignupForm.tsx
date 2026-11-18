"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";

import SignupSocialButton from "@/components/SignupSocialButton";
import ImportButton from "@/components/ImportButton";
import ErrorToast from "@/components/ErrorToast";
import { useAppDispatch } from "@/hooks/useAppHooks";
import { useAuthRequest } from "@/hooks/useAuthRequest";
import { registerAccount } from "@/redux/thunks/authThunks";
import { type Errors } from "@/providers/Shared";
import AuthCard from "../AuthCard";
import SubmitButtonContent from "../SubmitButtonContent";
import PatientAccountDetails, { initialAccount, splitName, validateAccount, type AccountValues } from "./PatientAccountDetails";
import PatientCompleteProfile, { initialProfile, validateProfile, type ProfileValues } from "./PatientCompleteProfile";
import PatientPreferences, { initialPreferences, validatePreferences, type PreferencesValues } from "./PatientPreferences";

const STEPS = [
  { title: "Account Details", heading: "Create Your Account", subtitle: "Let's get you started with a few basic details." },
  { title: "Complete Profile", heading: "Complete Your Profile", subtitle: "Tell us about yourself so we can provide a better care experience." },
  { title: "Preferences", heading: "Set Your Preferences", subtitle: "Customize your care experience and communication." },
];

/* ---------- Step indicator ---------- */
const Stepper = ({ current }: { current: number }) => (
  <ol className="mb-6 flex items-start" aria-label="Sign up progress">
    {STEPS.map((s, i) => {
      const n = i + 1;
      const done = n < current;
      const active = n === current;
      return (
        <React.Fragment key={s.title}>
          <li className="flex flex-col items-center gap-1.5" aria-current={active ? "step" : undefined}>
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-colors duration-300 ${
                done || active ? "bg-primary text-on-primary" : "bg-primary/10 text-body"
              }`}
            >
              {done ? <Check className="h-4 w-4" /> : n}
            </span>
            <span className={`hidden text-[11px] font-medium sm:block ${active ? "text-primary" : "text-body"}`}>{s.title}</span>
          </li>
          {n < STEPS.length && (
            <span className={`mx-2 mt-4 h-0.5 flex-1 rounded transition-colors duration-300 ${done ? "bg-primary" : "bg-divider"}`} />
          )}
        </React.Fragment>
      );
    })}
  </ol>
);

const PatientSignupForm = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const registerRequest = useAuthRequest("register");

  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Errors>({});
  const [account, setAccount] = useState<AccountValues>(initialAccount());
  const [profile, setProfile] = useState<ProfileValues>(initialProfile());
  const [prefs, setPrefs] = useState<PreferencesValues>(initialPreferences());

  const isFirst = currentStep === 1;
  const isLast = currentStep === STEPS.length;

  /* Server-side field errors (e.g. email already used) live on step 1 */
  const fe = (registerRequest.fieldErrors ?? {}) as Record<string, string | undefined>;
  const serverErrors: Errors = {};
  if (fe.email) serverErrors.email = fe.email;
  if (fe.password) serverErrors.password = fe.password;
  if (fe.firstName ?? fe.lastName) serverErrors.fullName = (fe.firstName ?? fe.lastName) as string;

  useEffect(() => {
    if (fe.firstName || fe.lastName || fe.email || fe.password) setCurrentStep(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [registerRequest.fieldErrors]);

  /* Clear an error as soon as its field changes */
  const patcher =
    <V extends object>(set: React.Dispatch<React.SetStateAction<V>>) =>
    (patch: Partial<V>) => {
      set((prev) => ({ ...prev, ...patch }));
      setErrors((prev) => {
        const next = { ...prev };
        Object.keys(patch).forEach((k) => delete next[k]);
        return next;
      });
    };

  const validateStep = (step: number): Errors =>
    step === 1 ? validateAccount(account) : step === 2 ? validateProfile(profile) : validatePreferences(prefs);

  const focusFirst = (errs: Errors) => {
    const first = Object.keys(errs)[0];
    if (!first) return;
    const el = document.getElementById(first);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
    el?.focus?.({ preventScroll: true });
  };

  const goBack = () => {
    setErrors({});
    setCurrentStep((s) => Math.max(s - 1, 1));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (registerRequest.isPending) return;

    const errs = validateStep(currentStep);
    if (Object.keys(errs).length) {
      setErrors(errs);
      focusFirst(errs);
      return;
    }
    setErrors({});
    if (!isLast) {
      setCurrentStep((s) => s + 1);
      return;
    }

    const { firstName, lastName } = splitName(account.fullName);
    // Extra fields (phone, profile, preferences) go to your API: extend the registerAccount payload type.
    const payload = {
      accountType: "patient" as const,
      firstName,
      lastName,
      email: account.email.trim(),
      password: account.password,
      phone: account.phone.trim(),
      phoneCountry: account.phoneCountry,
      profile,
      preferences: prefs,
    };
    const result = await dispatch(registerAccount(payload));
    if (registerAccount.fulfilled.match(result)) router.push("/auth/verify-email");
  };

  const step = STEPS[currentStep - 1];
  const shownErrors: Errors = { ...serverErrors, ...errors };

  return (
    <AuthCard>
      <ErrorToast
        isOpen={registerRequest.isFailed}
        onClose={registerRequest.clearRequest}
        title="Could not create account"
        message={registerRequest.error?.message}
      />

      <div className="mb-5 text-right text-xs text-body">
        Already have an account?{" "}
        <button
          type="button"
          onClick={() => router.push("/auth/login")}
          className="cursor-pointer font-semibold text-link transition-colors duration-200 hover:text-primary hover:underline"
        >
          Sign In
        </button>
      </div>

      <Stepper current={currentStep} />

      <div key={currentStep} className="animate-[fadeSlide_0.5s_cubic-bezier(0.16,1,0.3,1)_both]">
        <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          Step {currentStep} of {STEPS.length}
        </span>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-heading sm:text-[2rem]">{step.heading}</h2>
        <p className="mt-1.5 text-sm text-body sm:text-[0.95rem]">{step.subtitle}</p>
      </div>

      <form onSubmit={handleSubmit} className="mt-7 space-y-3" noValidate>
        <div key={`step-${currentStep}`} className="relative z-10 animate-[fadeSlide_0.5s_cubic-bezier(0.16,1,0.3,1)_both] [animation-delay:0.08s]">
          {currentStep === 1 && <PatientAccountDetails values={account} errors={shownErrors} onChange={patcher(setAccount)} />}
          {currentStep === 2 && <PatientCompleteProfile values={profile} errors={shownErrors} onChange={patcher(setProfile)} />}
          {currentStep === 3 && <PatientPreferences values={prefs} errors={shownErrors} onChange={patcher(setPrefs)} />}
        </div>

        {/* ---------- Actions ---------- */}
        <div className="flex items-center gap-3 pt-2">
          {!isFirst && (
            <ImportButton text="Back" icon={null} onClick={goBack} className="h-12 shrink-0 px-6" />
          )}
          <div className="min-w-0 flex-1">
            <SignupSocialButton
              type="submit"
              showIcon={false}
              provider="google"
              disabled={registerRequest.isPending}
              className="!h-12 !text-sm"
            >
              <SubmitButtonContent
                isLoading={registerRequest.isPending}
                label={isLast ? "Complete Registration" : "Continue"}
                loadingLabel="Creating account…"
              />
            </SignupSocialButton>
          </div>
        </div>
      </form>

      {isFirst && (
        <>
          <div className="my-5 flex items-center gap-4">
            <span className="h-px flex-1 bg-divider" />
            <span className="text-xs font-medium text-body">OR</span>
            <span className="h-px flex-1 bg-divider" />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <SignupSocialButton provider="google" />
            <SignupSocialButton provider="apple" />
          </div>
        </>
      )}
    </AuthCard>
  );
};

export default PatientSignupForm;