"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CircleCheck, Eye, EyeOff, Lock, TriangleAlert } from "lucide-react";
import SignupField from "@/components/SignupField";
import SignupSocialButton from "@/components/SignupSocialButton";
import ErrorToast from "@/components/ErrorToast";
import { useAppDispatch } from "@/hooks/useAppHooks";
import { useAuthRequest } from "@/hooks/useAuthRequest";
import { resetPassword } from "@/redux/thunks/authThunks";
import AuthCard from "./AuthCard";
import SubmitButtonContent from "./SubmitButtonContent";
import { PASSWORD_MIN_LENGTH, compactErrors, validateNewPassword } from "./authValidation";
import { LOGIN_PATH } from "./RouteGuard";

const FADE_SLIDE_CLASS = "animate-[fadeSlide_0.5s_cubic-bezier(0.16,1,0.3,1)_both]";

type ResetPasswordField = "newPassword" | "confirmPassword";

const validateResetPasswordForm = (newPassword: string, confirmPassword: string) =>
  compactErrors<ResetPasswordField>({
    newPassword: validateNewPassword(newPassword),
    confirmPassword: !confirmPassword
      ? "Please confirm your new password."
      : confirmPassword !== newPassword
        ? "Passwords do not match."
        : undefined,
  });

const ResultMessage = ({
  icon,
  title,
  message,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  message: React.ReactNode;
  children: React.ReactNode;
}) => (
  <div className={`text-center ${FADE_SLIDE_CLASS}`}>
    <span className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary/15 text-primary">
      {icon}
    </span>
    <h2 className="text-2xl font-semibold tracking-tight text-heading sm:text-3xl">{title}</h2>
    <p className="mx-auto mt-2 max-w-sm text-sm text-body sm:text-[0.95rem]">{message}</p>
    <div className="mt-7">{children}</div>
  </div>
);

/** Handles both password-reset and invitation links (`/auth/reset-password?token=…`). */
const ResetPasswordForm = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const resetToken = useSearchParams().get("token");
  const resetPasswordRequest = useAuthRequest("resetPassword");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [touchedFields, setTouchedFields] = useState<
    Partial<Record<ResetPasswordField, boolean>>
  >({});

  const validationErrors = validateResetPasswordForm(newPassword, confirmPassword);

  const getFieldError = (field: ResetPasswordField) =>
    (touchedFields[field] ? validationErrors[field] : undefined) ??
    (field === "newPassword" ? resetPasswordRequest.fieldErrors.password : undefined);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setTouchedFields({ newPassword: true, confirmPassword: true });
    if (!resetToken || Object.keys(validationErrors).length) return;

    dispatch(resetPassword({ token: resetToken, newPassword }));
  };

  if (!resetToken) {
    return (
      <AuthCard>
        <ResultMessage
          icon={<TriangleAlert className="h-8 w-8" />}
          title="Invalid Reset Link"
          message="This password reset link is missing or incomplete. Please request a new one."
        >
          <Link
            href="/auth/forgot-password"
            className="text-sm font-semibold text-link hover:text-primary hover:underline"
          >
            Request a new link
          </Link>
        </ResultMessage>
      </AuthCard>
    );
  }

  if (resetPasswordRequest.isSucceeded) {
    return (
      <AuthCard>
        <ResultMessage
          icon={<CircleCheck className="h-8 w-8" />}
          title="Password Updated"
          message={resetPasswordRequest.successMessage}
        >
          <SignupSocialButton
            type="button"
            showIcon={false}
            provider="google"
            onClick={() => router.replace(LOGIN_PATH)}
            className="!h-12 !text-sm"
          >
            <SubmitButtonContent isLoading={false} label="Go to Sign In" loadingLabel="" />
          </SignupSocialButton>
        </ResultMessage>
      </AuthCard>
    );
  }

  const passwordVisibilityToggle = (
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
  );

  return (
    <AuthCard>
      <ErrorToast
        isOpen={resetPasswordRequest.isFailed}
        onClose={resetPasswordRequest.clearRequest}
        title="Could not reset password"
        message={resetPasswordRequest.error?.message}
      />

      <div className={`[animation-delay:0.05s] ${FADE_SLIDE_CLASS}`}>
        <h2 className="text-3xl font-semibold tracking-tight text-heading sm:text-[2rem]">
          Set New Password
        </h2>
        <p className="mt-1.5 text-sm text-body sm:text-[0.95rem]">
          Choose a strong password you haven&apos;t used before.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-7 space-y-3" noValidate>
        <div className={`[animation-delay:0.1s] ${FADE_SLIDE_CLASS}`}>
          <SignupField
            id="newPassword"
            name="newPassword"
            type={showPassword ? "text" : "password"}
            label="New Password"
            placeholder="Create a strong password"
            autoComplete="new-password"
            icon={<Lock className="h-[18px] w-[18px]" />}
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            onBlur={() => setTouchedFields((previous) => ({ ...previous, newPassword: true }))}
            error={getFieldError("newPassword")}
            hint={`Use at least ${PASSWORD_MIN_LENGTH} characters. Avoid your name, email or common passwords.`}
            trailing={passwordVisibilityToggle}
          />
        </div>

        <div className={`[animation-delay:0.15s] ${FADE_SLIDE_CLASS}`}>
          <SignupField
            id="confirmPassword"
            name="confirmPassword"
            type={showPassword ? "text" : "password"}
            label="Confirm Password"
            placeholder="Re-enter your new password"
            autoComplete="new-password"
            icon={<Lock className="h-[18px] w-[18px]" />}
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            onBlur={() =>
              setTouchedFields((previous) => ({ ...previous, confirmPassword: true }))
            }
            error={getFieldError("confirmPassword")}
          />
        </div>

        <div className={`pt-2 [animation-delay:0.2s] ${FADE_SLIDE_CLASS}`}>
          <SignupSocialButton
            type="submit"
            showIcon={false}
            provider="google"
            disabled={resetPasswordRequest.isPending}
            className="!h-12 !text-sm"
          >
            <SubmitButtonContent
              isLoading={resetPasswordRequest.isPending}
              label="Update Password"
              loadingLabel="Updating…"
            />
          </SignupSocialButton>
        </div>
      </form>
    </AuthCard>
  );
};

export default ResetPasswordForm;
