"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mail, MailCheck } from "lucide-react";
import SignupField from "@/components/SignupField";
import SignupSocialButton from "@/components/SignupSocialButton";
import ErrorToast from "@/components/ErrorToast";
import { useAppDispatch } from "@/hooks/useAppHooks";
import { useAuthRequest } from "@/hooks/useAuthRequest";
import { requestPasswordReset } from "@/redux/thunks/authThunks";
import AuthCard from "./AuthCard";
import SubmitButtonContent from "./SubmitButtonContent";
import { validateEmail } from "./authValidation";
import { LOGIN_PATH } from "./RouteGuard";

const FADE_SLIDE_CLASS = "animate-[fadeSlide_0.5s_cubic-bezier(0.16,1,0.3,1)_both]";

const ForgotPasswordForm = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const forgotPasswordRequest = useAuthRequest("forgotPassword");

  const [email, setEmail] = useState("");
  const [isEmailTouched, setIsEmailTouched] = useState(false);

  const emailError =
    (isEmailTouched ? validateEmail(email) : undefined) ??
    forgotPasswordRequest.fieldErrors.email;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsEmailTouched(true);
    if (validateEmail(email)) return;

    dispatch(requestPasswordReset(email.trim()));
  };

  return (
    <AuthCard>
      <ErrorToast
        isOpen={forgotPasswordRequest.isFailed}
        onClose={forgotPasswordRequest.clearRequest}
        title="Request failed"
        message={forgotPasswordRequest.error?.message}
      />

      <button
        type="button"
        onClick={() => router.push(LOGIN_PATH)}
        aria-label="Back to sign in"
        className="-ml-1 mb-6 inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-heading transition-colors duration-200 hover:bg-primary/5 hover:text-primary focus:outline-none"
      >
        <ArrowLeft className="h-5 w-5" />
      </button>

      {forgotPasswordRequest.isSucceeded ? (
        <div className={`text-center ${FADE_SLIDE_CLASS}`}>
          <span className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary/15 text-primary">
            <MailCheck className="h-8 w-8" />
          </span>
          <h2 className="text-2xl font-semibold tracking-tight text-heading sm:text-3xl">
            Check Your Email
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-body sm:text-[0.95rem]">
            {forgotPasswordRequest.successMessage}
          </p>
        </div>
      ) : (
        <>
          <div className={`[animation-delay:0.05s] ${FADE_SLIDE_CLASS}`}>
            <h2 className="text-3xl font-semibold tracking-tight text-heading sm:text-[2rem]">
              Forgot Password
            </h2>
            <p className="mt-1.5 text-sm text-body sm:text-[0.95rem]">
              Enter your email and we&apos;ll send you a link to reset your password.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-7 space-y-3" noValidate>
            <div className={`[animation-delay:0.1s] ${FADE_SLIDE_CLASS}`}>
              <SignupField
                id="email"
                name="email"
                type="email"
                label="Email Address"
                placeholder="Enter your email address"
                autoComplete="email"
                icon={<Mail className="h-[18px] w-[18px]" />}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                onBlur={() => setIsEmailTouched(true)}
                error={emailError}
              />
            </div>

            <div className={`pt-2 [animation-delay:0.15s] ${FADE_SLIDE_CLASS}`}>
              <SignupSocialButton
                type="submit"
                showIcon={false}
                provider="google"
                disabled={forgotPasswordRequest.isPending}
                className="!h-12 !text-sm"
              >
                <SubmitButtonContent
                  isLoading={forgotPasswordRequest.isPending}
                  label="Send Reset Link"
                  loadingLabel="Sending…"
                />
              </SignupSocialButton>
            </div>
          </form>
        </>
      )}
    </AuthCard>
  );
};

export default ForgotPasswordForm;
