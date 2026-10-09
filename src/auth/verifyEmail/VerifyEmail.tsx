"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check } from "lucide-react";
import { FaEnvelopeOpenText } from "react-icons/fa";
import SignupSocialButton from "@/components/SignupSocialButton";
import SuccessToast from "@/components/SuccessToast";
import ErrorToast from "@/components/ErrorToast";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppHooks";
import { useAuthRequest } from "@/hooks/useAuthRequest";
import { selectPendingVerificationEmail } from "@/redux/selectors/authSelectors";
import { setPendingVerificationEmail } from "@/redux/slices/authSlice";
import { resendVerificationEmail, verifyEmail } from "@/redux/thunks/authThunks";
import AuthCard from "../AuthCard";
import SubmitButtonContent from "../SubmitButtonContent";
import { LOGIN_PATH } from "../RouteGuard";

/* ---------------------------------------------------------------- */
/*  Config                                                          */
/* ---------------------------------------------------------------- */
/** Must match ONE_TIME_CODE_LENGTH in the backend's user-token.service.ts */
const OTP_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 60;

const FADE_SLIDE_CLASS = "animate-[fadeSlide_0.5s_cubic-bezier(0.16,1,0.3,1)_both]";
const EMPTY_DIGITS: string[] = Array(OTP_LENGTH).fill("");

/* ---------------------------------------------------------------- */
/*  Shared pieces                                                   */
/* ---------------------------------------------------------------- */
/** Envelope icon with pulse rings and a green check badge. */
const VerifyEmailIcon = () => (
  <div
    className={`relative mx-auto mb-6 flex h-28 w-28 items-center justify-center sm:h-32 sm:w-32 lg:h-40 lg:w-40 [animation-delay:0.05s] ${FADE_SLIDE_CLASS}`}
  >
    <span
      aria-hidden="true"
      className="absolute inset-0 rounded-full bg-primary/10 animate-[verifyPulse_2.4s_ease-out_infinite]"
    />
    <span
      aria-hidden="true"
      className="absolute inset-3 rounded-full bg-primary/15 [animation-delay:0.4s] animate-[verifyPulse_2.4s_ease-out_infinite] sm:inset-4"
    />
    <span className="relative flex h-20 w-20 items-center justify-center rounded-full bg-primary/15 text-primary sm:h-24 sm:w-24 lg:h-28 lg:w-28">
      <FaEnvelopeOpenText className="h-9 w-9 sm:h-10 sm:w-10 lg:h-12 lg:w-12" />
      <span className="absolute -bottom-0.5 -right-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-brand-green text-card ring-2 ring-card animate-[badgePop_0.35s_cubic-bezier(0.16,1,0.3,1)_both] sm:h-7 sm:w-7 lg:h-8 lg:w-8">
        <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4 lg:h-5 lg:w-5" strokeWidth={3} />
      </span>
    </span>
  </div>
);

const VerifyEmailHeading = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className={`text-center [animation-delay:0.1s] ${FADE_SLIDE_CLASS}`}>
    <h2 className="text-2xl font-semibold tracking-tight text-heading sm:text-3xl">{title}</h2>
    <p className="mx-auto mt-2 max-w-sm text-sm text-body sm:text-[0.95rem]">{children}</p>
  </div>
);

const GoToSignInButton = () => {
  const router = useRouter();
  return (
    <div className={`mt-7 [animation-delay:0.2s] ${FADE_SLIDE_CLASS}`}>
      <SignupSocialButton
        type="button"
        showIcon={false}
        provider="google"
        onClick={() => router.replace(LOGIN_PATH)}
        className="!h-12 !text-sm"
      >
        <SubmitButtonContent isLoading={false} label="Go to Sign In" loadingLabel="" />
      </SignupSocialButton>
    </div>
  );
};

/* ---------------------------------------------------------------- */
/*  OTP entry                                                       */
/* ---------------------------------------------------------------- */
const OtpVerificationForm = ({ pendingEmail }: { pendingEmail: string }) => {
  const dispatch = useAppDispatch();
  const verifyEmailRequest = useAuthRequest("verifyEmail");
  const resendRequest = useAuthRequest("resendVerification");

  const [digits, setDigits] = useState<string[]>(EMPTY_DIGITS);
  const [cooldownSecondsLeft, setCooldownSecondsLeft] = useState(RESEND_COOLDOWN_SECONDS);
  const digitInputsRef = useRef<Array<HTMLInputElement | null>>([]);

  const otpCode = digits.join("");
  const isCodeComplete = otpCode.length === OTP_LENGTH;

  /* Focus the first box on mount */
  useEffect(() => {
    digitInputsRef.current[0]?.focus();
  }, []);

  /* Resend countdown */
  useEffect(() => {
    if (cooldownSecondsLeft <= 0) return;
    const timeoutId = setTimeout(() => setCooldownSecondsLeft((seconds) => seconds - 1), 1000);
    return () => clearTimeout(timeoutId);
  }, [cooldownSecondsLeft]);

  const focusDigit = (index: number) => digitInputsRef.current[index]?.focus();

  const clearDigits = () => {
    setDigits(EMPTY_DIGITS);
    focusDigit(0);
  };

  const setDigitAt = (index: number, value: string) =>
    setDigits((previous) => previous.map((digit, digitIndex) => (digitIndex === index ? value : digit)));

  const handleDigitChange = (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const typedDigits = event.target.value.replace(/\D/g, "");
    if (!typedDigits) {
      setDigitAt(index, "");
      return;
    }
    /* Paste / autofill of the full code into any box */
    if (typedDigits.length > 1) {
      const pastedDigits = typedDigits.slice(0, OTP_LENGTH - index).split("");
      setDigits((previous) => {
        const next = [...previous];
        pastedDigits.forEach((digit, offset) => {
          next[index + offset] = digit;
        });
        return next;
      });
      focusDigit(Math.min(index + pastedDigits.length, OTP_LENGTH - 1));
      return;
    }
    setDigitAt(index, typedDigits);
    if (index < OTP_LENGTH - 1) focusDigit(index + 1);
  };

  const handleSubmit = async () => {
    if (!isCodeComplete) return;
    const verifyResult = await dispatch(verifyEmail({ email: pendingEmail, code: otpCode }));
    // Wrong / expired code: clear the boxes so the user can type it again.
    if (verifyEmail.rejected.match(verifyResult)) clearDigits();
  };

  const handleDigitKeyDown = (event: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (event.key === "Backspace") {
      event.preventDefault();
      if (digits[index]) {
        setDigitAt(index, "");
      } else if (index > 0) {
        setDigitAt(index - 1, "");
        focusDigit(index - 1);
      }
    } else if (event.key === "ArrowLeft" && index > 0) {
      focusDigit(index - 1);
    } else if (event.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      focusDigit(index + 1);
    } else if (event.key === "Enter") {
      handleSubmit();
    }
  };

  const handleResend = async () => {
    if (cooldownSecondsLeft > 0) return;
    const resendResult = await dispatch(resendVerificationEmail(pendingEmail));
    if (resendVerificationEmail.fulfilled.match(resendResult)) {
      setCooldownSecondsLeft(RESEND_COOLDOWN_SECONDS);
      clearDigits();
    }
  };

  if (verifyEmailRequest.isSucceeded) {
    return (
      <>
        <VerifyEmailIcon />
        <VerifyEmailHeading title="Email Verified">
          {verifyEmailRequest.successMessage}
        </VerifyEmailHeading>
        <GoToSignInButton />
      </>
    );
  }

  const firstEmptyDigitIndex = digits.indexOf("");

  return (
    <>
      <ErrorToast
        isOpen={verifyEmailRequest.isFailed}
        onClose={verifyEmailRequest.clearRequest}
        title="Verification failed"
        message={verifyEmailRequest.error?.message}
      />
      <SuccessToast
        isOpen={resendRequest.isSucceeded}
        onClose={resendRequest.clearRequest}
        title="Code sent"
        message={resendRequest.successMessage ?? undefined}
      />
      <ErrorToast
        isOpen={resendRequest.isFailed}
        onClose={resendRequest.clearRequest}
        title="Could not resend code"
        message={resendRequest.error?.message}
      />

      <VerifyEmailIcon />
      <VerifyEmailHeading title="Verify Your Email Address">
        We&apos;ve sent a {OTP_LENGTH}-digit verification code to{" "}
        <span className="font-semibold text-heading">{pendingEmail}</span>
      </VerifyEmailHeading>

      {/* ---------- OTP boxes ---------- */}
      <div
        className={`mt-7 flex items-center justify-center gap-1.5 sm:gap-2.5 lg:gap-3 [animation-delay:0.15s] ${FADE_SLIDE_CLASS}`}
      >
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(inputElement) => {
              digitInputsRef.current[index] = inputElement;
            }}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={OTP_LENGTH}
            value={digit}
            disabled={verifyEmailRequest.isPending}
            onChange={(event) => handleDigitChange(event, index)}
            onKeyDown={(event) => handleDigitKeyDown(event, index)}
            onFocus={(event) => event.target.select()}
            aria-label={`Digit ${index + 1}`}
            className={`
              h-11 w-10 sm:h-13 sm:w-12 lg:h-16 lg:w-14 xl:h-17 xl:w-15
              rounded-lg sm:rounded-xl border bg-card text-center
              text-lg sm:text-xl lg:text-2xl font-semibold text-heading caret-primary
              outline-none transition-all duration-200
              focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:opacity-60
              ${
                index === firstEmptyDigitIndex
                  ? "border-primary"
                  : digit
                    ? "border-primary/50"
                    : "border-border hover:border-primary/40"
              }
            `}
          />
        ))}
      </div>

      {/* ---------- Resend ---------- */}
      <div
        className={`mt-5 text-center text-xs leading-relaxed text-body [animation-delay:0.2s] ${FADE_SLIDE_CLASS}`}
      >
        Didn&apos;t receive the code? Check your spam folder or{" "}
        {cooldownSecondsLeft > 0 ? (
          <span className="font-semibold text-link">
            Resend Code (00:{String(cooldownSecondsLeft).padStart(2, "0")})
          </span>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            disabled={resendRequest.isPending}
            className="cursor-pointer font-semibold text-link transition-colors duration-200 hover:text-primary hover:underline disabled:cursor-not-allowed disabled:opacity-60"
          >
            {resendRequest.isPending ? "Sending…" : "Resend Code"}
          </button>
        )}
      </div>

      {/* ---------- Submit ---------- */}
      <div className={`mt-6 [animation-delay:0.25s] ${FADE_SLIDE_CLASS}`}>
        <SignupSocialButton
          type="button"
          showIcon={false}
          provider="google"
          onClick={handleSubmit}
          disabled={!isCodeComplete || verifyEmailRequest.isPending}
          className="!h-12 !text-sm"
        >
          <SubmitButtonContent
            isLoading={verifyEmailRequest.isPending}
            label="Verify & Continue"
            loadingLabel="Verifying…"
          />
        </SignupSocialButton>
      </div>
    </>
  );
};

/* ---------------------------------------------------------------- */
/*  Component                                                       */
/* ---------------------------------------------------------------- */
const VerifyEmail = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pendingEmail = useAppSelector(selectPendingVerificationEmail);

  const handleBack = () => {
    dispatch(setPendingVerificationEmail(null));
    router.push("/auth/register");
  };

  return (
    <AuthCard>
      <button
        type="button"
        onClick={handleBack}
        aria-label="Back"
        className="-ml-1 mb-6 inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-heading transition-colors duration-200 hover:bg-primary/5 hover:text-primary focus:outline-none"
      >
        <ArrowLeft className="h-5 w-5" />
      </button>

      {pendingEmail ? (
        <OtpVerificationForm pendingEmail={pendingEmail} />
      ) : (
        // Page reloaded / opened directly — we no longer know which email to verify.
        <>
          <VerifyEmailIcon />
          <VerifyEmailHeading title="Verify Your Email Address">
            Sign in with your email and password — if your email isn&apos;t verified yet,
            we&apos;ll send you a new code. New here?{" "}
            <Link href="/auth/register" className="font-semibold text-link hover:underline">
              Create an account
            </Link>
          </VerifyEmailHeading>
          <GoToSignInButton />
        </>
      )}
    </AuthCard>
  );
};

export default VerifyEmail;
