"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, ShieldCheck } from "lucide-react";
import SignupField from "@/components/SignupField";
import SignupSocialButton from "@/components/SignupSocialButton";
import ErrorToast from "@/components/ErrorToast";
import { useAppDispatch } from "@/hooks/useAppHooks";
import { useAuthRequest } from "@/hooks/useAuthRequest";
import { loginUser, resendVerificationEmail } from "@/redux/thunks/authThunks";
import { setPendingVerificationEmail } from "@/redux/slices/authSlice";
import AuthCard from "./AuthCard";
import SubmitButtonContent from "./SubmitButtonContent";
import { compactErrors, validateEmail } from "./authValidation";

type LoginField = "email" | "password";
type LoginErrors = Partial<Record<LoginField, string>>;

const validateLoginForm = (email: string, password: string): LoginErrors =>
  compactErrors<LoginField>({
    email: validateEmail(email),
    password: password ? undefined : "Please enter your password.",
  });

/**
 * Field values stay in local state (typing must not touch the global store);
 * the API lifecycle lives in Redux. On success the RouteGuard redirects to the dashboard.
 */
const LoginForm = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const loginRequest = useAuthRequest("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [touchedFields, setTouchedFields] = useState<Partial<Record<LoginField, boolean>>>({});

  // Derived on render — no extra state, no sync effects.
  const validationErrors = validateLoginForm(email, password);

  const handleBlur = (field: LoginField) =>
    setTouchedFields((previous) => ({ ...previous, [field]: true }));

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setTouchedFields({ email: true, password: true });
    if (Object.keys(validationErrors).length) return;

    dispatch(loginUser({ email: email.trim(), password }));
  };

  /** Unverified account: email a fresh code (the old one has likely expired) and open the OTP screen. */
  const handleGoToEmailVerification = () => {
    const unverifiedEmail = email.trim();
    dispatch(setPendingVerificationEmail(unverifiedEmail));
    dispatch(resendVerificationEmail(unverifiedEmail));
    router.push("/auth/verify-email");
  };

  const getFieldError = (field: LoginField) =>
    (touchedFields[field] ? validationErrors[field] : undefined) ??
    loginRequest.fieldErrors[field];

  const isEmailNotVerified = loginRequest.error?.errorCode === "EMAIL_NOT_VERIFIED";

  return (
    <AuthCard>
      <ErrorToast
        isOpen={loginRequest.isFailed}
        onClose={loginRequest.clearRequest}
        title="Sign in failed"
        message={loginRequest.error?.message}
        action={
          isEmailNotVerified
            ? { label: "Verify email", onClick: handleGoToEmailVerification }
            : undefined
        }
      />

      {/* Heading */}
      <div className="animate-[fadeSlide_0.5s_cubic-bezier(0.16,1,0.3,1)_both] [animation-delay:0.05s]">
        <h2 className="text-3xl font-semibold tracking-tight text-heading sm:text-[2rem]">
          Sign In
        </h2>
        <p className="mt-1.5 text-sm text-body sm:text-[0.95rem]">
          Welcome back to{" "}
          <span className="font-semibold text-heading">KOOLMD</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-7 space-y-3" noValidate>
        {/* ---------- Email ---------- */}
        <div className="animate-[fadeSlide_0.5s_cubic-bezier(0.16,1,0.3,1)_both] [animation-delay:0.1s]">
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
            onBlur={() => handleBlur("email")}
            error={getFieldError("email")}
          />
        </div>

        {/* ---------- Password ---------- */}
        <div className="animate-[fadeSlide_0.5s_cubic-bezier(0.16,1,0.3,1)_both] [animation-delay:0.15s]">
          <SignupField
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            label="Password"
            placeholder="Enter your password"
            autoComplete="current-password"
            icon={<Lock className="h-[18px] w-[18px]" />}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            onBlur={() => handleBlur("password")}
            error={getFieldError("password")}
            trailing={
              <button
                type="button"
                onClick={() => setShowPassword((isVisible) => !isVisible)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="cursor-pointer rounded-md p-1 text-label transition-all duration-200 hover:scale-110 hover:text-primary active:scale-95"
              >
                {showPassword ? (
                  <Eye className="h-[18px] w-[18px]" />
                ) : (
                  <EyeOff className="h-[18px] w-[18px]" />
                )}
              </button>
            }
          />

          {/* Forgot password — right-aligned under the input */}
          {!getFieldError("password") && (
            <div className="mt-2 text-right">
              <Link
                href="/auth/forgot-password"
                className="text-xs font-medium text-link transition-colors duration-200 hover:text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>
          )}
        </div>

      {/* ---------- Submit ---------- */}
<div className="pt-2 animate-[fadeSlide_0.5s_cubic-bezier(0.16,1,0.3,1)_both] [animation-delay:0.2s]">
<SignupSocialButton
  type="submit"
  showIcon={false}
  provider="google"
  disabled={loginRequest.isPending}
  className="!h-12 !text-sm"
>
  <SubmitButtonContent
    isLoading={loginRequest.isPending}
    label="Sign In"
    loadingLabel="Signing In…"
  />
</SignupSocialButton>
</div>
      </form>

      {/* ---------- Divider ---------- */}
      <div className="my-5 flex items-center gap-4">
        <span className="h-px flex-1 bg-divider" />
        <span className="text-xs font-medium text-body">OR</span>
        <span className="h-px flex-1 bg-divider" />
      </div>

      {/* ---------- Social ---------- */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <SignupSocialButton provider="google" />
        <SignupSocialButton provider="apple" />
      </div>

      {/* ---------- Register link ---------- */}
      <p className="mt-6 text-center text-xs text-body">
        Don&apos;t have an account?{" "}
        <button
          type="button"
          onClick={() => router.push("/auth/register")}
          className="font-semibold text-link transition-colors duration-200 hover:text-primary hover:underline cursor-pointer"
        >
          Create Account
        </button>
      </p>

      {/* ---------- HIPAA notice ---------- */}
      <div className="mt-6 flex items-center justify-center gap-2 border-t border-divider pt-5">
        <ShieldCheck className="h-4 w-4 shrink-0 text-primary animate-[hipaaPulse_3s_ease-in-out_infinite]" />
        <p className="text-[11px] leading-snug text-body sm:text-xs">
          Your information is protected and{" "}
          <span className="font-semibold text-heading">HIPAA compliant</span>.
        </p>
      </div>
    </AuthCard>
  );
};

export default LoginForm;