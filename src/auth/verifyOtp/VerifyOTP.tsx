"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check } from "lucide-react";
import { FaEnvelopeOpenText } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";

import SignupButton from "@/components/SignupButton";
import { setAuthVariant } from "@/redux/slices/authSlice";
import { clearVerifyOtpEmail } from "@/redux/slices/verifyOtpSlice";
import { RootState } from "@/redux/store";

/* ---------------------------------------------------------------- */
/*  Config                                                          */
/* ---------------------------------------------------------------- */
const OTP_LENGTH = 6;
const RESEND_SECONDS = 60;

/* ---------------------------------------------------------------- */
/*  Component                                                       */
/* ---------------------------------------------------------------- */
const VerifyOTP = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const email = useSelector((state: RootState) => state.verifyOtp.email);
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);

  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  /* Focus first box on mount */
  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  /* Resend countdown */
  useEffect(() => {
    if (secondsLeft <= 0) return;
    const id = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [secondsLeft]);

  /* Helpers */
  const code = digits.join("");
  const isComplete = code.length === OTP_LENGTH && !digits.includes("");

  const setDigitAt = (index: number, value: string) => {
    setDigits((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
  ) => {
    const raw = e.target.value.replace(/\D/g, "");
    if (!raw) {
      setDigitAt(index, "");
      return;
    }
    /* Support paste of full code into the first box */
    if (raw.length > 1) {
      const chars = raw.slice(0, OTP_LENGTH - index).split("");
      setDigits((prev) => {
        const next = [...prev];
        chars.forEach((c, i) => {
          next[index + i] = c;
        });
        return next;
      });
      const lastIdx = Math.min(index + chars.length, OTP_LENGTH - 1);
      inputsRef.current[lastIdx]?.focus();
      return;
    }
    setDigitAt(index, raw);
    if (index < OTP_LENGTH - 1) inputsRef.current[index + 1]?.focus();
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (e.key === "Backspace") {
      if (digits[index]) {
        setDigitAt(index, "");
      } else if (index > 0) {
        inputsRef.current[index - 1]?.focus();
        setDigitAt(index - 1, "");
      }
      e.preventDefault();
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputsRef.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    } else if (e.key === "Enter" && isComplete) {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    if (!isComplete) return;
    setIsSubmitting(true);
    // TODO: replace with your verify-OTP API call
    await new Promise((r) => setTimeout(r, 900));
    console.log("OTP submitted:", code);
    setIsSubmitting(false);
  };

  const handleResend = () => {
    if (secondsLeft > 0) return;
    setDigits(Array(OTP_LENGTH).fill(""));
    setSecondsLeft(RESEND_SECONDS);
    inputsRef.current[0]?.focus();
  };

  const handleBack = () => {
    dispatch(clearVerifyOtpEmail());
    dispatch(setAuthVariant("signup"));
    router.push("/auth/register");
  };

  /* ---------------------------------------------------------------- */
  /*  Render                                                          */
  /* ---------------------------------------------------------------- */
 return (
  <div
    className="
      w-full max-w-md rounded-2xl border border-border
      bg-card p-7 shadow-xl shadow-shape-sky/25
      transition-shadow duration-500
      hover:shadow-2xl hover:shadow-shape-sky/40
      sm:max-w-lg sm:p-9 lg:p-10
      animate-[cardIn_0.5s_cubic-bezier(0.16,1,0.3,1)_both]
    "
  >
    {/* Back button */}
    <button
      type="button"
      onClick={handleBack}
      aria-label="Back"
      className="
        -ml-1 mb-6 inline-flex h-8 w-8 items-center justify-center
        rounded-lg text-heading transition-colors duration-200
        hover:bg-primary/5 hover:text-primary
        focus:outline-none cursor-pointer
      "
    >
      <ArrowLeft className="h-5 w-5" />
    </button>

    {/* ---------- Icon with pulse rings ---------- */}
    <div
      className="
        relative mx-auto mb-6 flex items-center justify-center
        h-28 w-28
        sm:h-32 sm:w-32
        lg:h-40 lg:w-40
        [animation-delay:0.05s]
        animate-[fadeSlide_0.5s_cubic-bezier(0.16,1,0.3,1)_both]
      "
    >
      {/* Outer pulse ring */}
      <span
        aria-hidden="true"
        className="
          absolute inset-0 rounded-full bg-primary/10
          animate-[verifyPulse_2.4s_ease-out_infinite]
        "
      />
      {/* Middle pulse ring (delayed) */}
      <span
        aria-hidden="true"
        className="
          absolute inset-3 sm:inset-4 rounded-full bg-primary/15
          [animation-delay:0.4s]
          animate-[verifyPulse_2.4s_ease-out_infinite]
        "
      />
      {/* Icon circle */}
      <span
        className="
          relative flex items-center justify-center rounded-full
          bg-primary/15 text-primary
          h-20 w-20
          sm:h-24 sm:w-24
          lg:h-28 lg:w-28
        "
      >
        <FaEnvelopeOpenText className="h-9 w-9 sm:h-10 sm:w-10 lg:h-12 lg:w-12" />
        {/* Green check badge */}
        <span
          className="
            absolute -bottom-0.5 -right-0.5 flex items-center justify-center
            rounded-full ring-2 ring-card
            bg-brand-green text-card
            h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8
            animate-[badgePop_0.35s_cubic-bezier(0.16,1,0.3,1)_both]
          "
        >
          <Check
            className="h-3.5 w-3.5 sm:h-4 sm:w-4 lg:h-5 lg:w-5"
            strokeWidth={3}
          />
        </span>
      </span>
    </div>

    {/* ---------- Heading ---------- */}
    <div
      className="
        text-center
        [animation-delay:0.1s]
        animate-[fadeSlide_0.5s_cubic-bezier(0.16,1,0.3,1)_both]
      "
    >
      <h2 className="text-2xl font-semibold tracking-tight text-heading sm:text-3xl">
        Verify Your Email Address
      </h2>
      <p className="mx-auto mt-2 max-w-sm text-sm text-body sm:text-[0.95rem]">
        We&apos;ve sent a {OTP_LENGTH}-digit verification code to{" "}
        <span className="font-semibold text-heading">{email}</span>
      </p>
    </div>

    {/* ---------- OTP boxes ---------- */}
    <div
      className="
        mt-7 flex items-center justify-center
        gap-1.5
        sm:gap-2.5
        lg:gap-3
        [animation-delay:0.15s]
        animate-[fadeSlide_0.5s_cubic-bezier(0.16,1,0.3,1)_both]
      "
    >
      {digits.map((d, i) => {
        const isActive =
          d === "" && digits.slice(0, i).every((x) => x !== "");
        return (
          <input
            key={i}
            ref={(el) => {
              inputsRef.current[i] = el;
            }}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={1}
            value={d}
            onChange={(e) => handleChange(e, i)}
            onKeyDown={(e) => handleKeyDown(e, i)}
            onFocus={(e) => e.target.select()}
            aria-label={`Digit ${i + 1}`}
            className={`
              h-11 w-10
              sm:h-13 sm:w-12
              lg:h-16 lg:w-14
              xl:h-17 xl:w-15
              rounded-lg sm:rounded-xl
              border bg-card text-center
              text-lg sm:text-xl lg:text-2xl
              font-semibold text-heading caret-primary
              outline-none transition-all duration-200
              focus:border-primary focus:ring-2 focus:ring-primary/15
              ${
                isActive && !d
                  ? "border-primary"
                  : d
                    ? "border-primary/50"
                    : "border-border hover:border-primary/40"
              }
            `}
          />
        );
      })}
    </div>

    {/* ---------- Resend ---------- */}
    <div
      className="
        mt-5 text-center text-xs leading-relaxed text-body
        [animation-delay:0.2s]
        animate-[fadeSlide_0.5s_cubic-bezier(0.16,1,0.3,1)_both]
      "
    >
      Didn&apos;t receive the code? Check your spam folder or{" "}
      {secondsLeft > 0 ? (
        <span className="font-semibold text-link">
          Resend Code (00:{String(secondsLeft).padStart(2, "0")})
        </span>
      ) : (
        <button
          type="button"
          onClick={handleResend}
          className="
            font-semibold text-link transition-colors duration-200
            hover:text-primary hover:underline cursor-pointer
          "
        >
          Resend Code
        </button>
      )}
    </div>

    {/* ---------- Submit ---------- */}
    <div
      className="
        mt-6
        [animation-delay:0.25s]
        animate-[fadeSlide_0.5s_cubic-bezier(0.16,1,0.3,1)_both]
      "
    >
      <SignupButton
        type="button"
        onClick={handleSubmit}
        text="Verify & Continue"
        loadingText="Verifying…"
        loading={isSubmitting}
        disabled={!isComplete}
      />
    </div>
  </div>
);
};

export default VerifyOTP;