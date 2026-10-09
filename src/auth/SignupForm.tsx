"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, Users, User, ShieldCheck } from "lucide-react";

import SignupField from "@/components/SignupField";
import SignupDropdown from "@/components/SignupDropdown";
import SignupSocialButton from "@/components/SignupSocialButton";
import ErrorToast from "@/components/ErrorToast";
import { useAppDispatch } from "@/hooks/useAppHooks";
import { useAuthRequest } from "@/hooks/useAuthRequest";
import { registerAccount } from "@/redux/thunks/authThunks";
import type { SignupAccountType } from "@/types/auth";
import AuthCard from "./AuthCard";
import SubmitButtonContent from "./SubmitButtonContent";
import {
  PASSWORD_MIN_LENGTH,
  compactErrors,
  validateEmail,
  validateNewPassword,
  validateRequiredText,
} from "./authValidation";

/** Admins/staff are invited by an administrator — only these can self-register. */
const ACCOUNT_TYPE_OPTIONS: { value: SignupAccountType; label: string }[] = [
  { value: "patient", label: "Patient" },
  { value: "provider", label: "Provider / Doctor" },
];

type SignupField = "accountType" | "firstName" | "lastName" | "email" | "password";
type SignupErrors = Partial<Record<SignupField, string>>;

interface SignupFormValues {
  accountType: SignupAccountType | "";
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

const EMPTY_SIGNUP_FORM: SignupFormValues = {
  accountType: "",
  firstName: "",
  lastName: "",
  email: "",
  password: "",
};

const ALL_FIELDS_TOUCHED: Record<SignupField, boolean> = {
  accountType: true,
  firstName: true,
  lastName: true,
  email: true,
  password: true,
};

/** DOM id of each field's input, in on-screen order — used to focus the first invalid one. */
const FIELD_ELEMENT_IDS: Record<SignupField, string> = {
  accountType: "role",
  firstName: "firstName",
  lastName: "lastName",
  email: "email",
  password: "password",
};

const focusFirstInvalidField = (errors: SignupErrors) => {
  const firstInvalidField = (Object.keys(FIELD_ELEMENT_IDS) as SignupField[]).find(
    (field) => errors[field],
  );
  if (!firstInvalidField) return;
  const fieldElement = document.getElementById(FIELD_ELEMENT_IDS[firstInvalidField]);
  fieldElement?.scrollIntoView({ behavior: "smooth", block: "center" });
  fieldElement?.focus({ preventScroll: true });
};

const validateSignupForm = (formValues: SignupFormValues): SignupErrors =>
  compactErrors<SignupField>({
    accountType: formValues.accountType ? undefined : "Please select your role.",
    firstName: validateRequiredText(formValues.firstName, "first name"),
    lastName: validateRequiredText(formValues.lastName, "last name"),
    email: validateEmail(formValues.email),
    password: validateNewPassword(formValues.password, formValues),
  });

const SignupForm = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const registerRequest = useAuthRequest("register");

  const [formValues, setFormValues] = useState<SignupFormValues>(EMPTY_SIGNUP_FORM);
  const [showPassword, setShowPassword] = useState(false);
  const [touchedFields, setTouchedFields] = useState<Partial<Record<SignupField, boolean>>>({});
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Derived on render — no extra state, no sync effects.
  const validationErrors = validateSignupForm(formValues);

  const updateField = <TField extends SignupField>(field: TField, value: SignupFormValues[TField]) =>
    setFormValues((previous) => ({ ...previous, [field]: value }));

  const handleBlur = (field: SignupField) =>
    setTouchedFields((previous) => ({ ...previous, [field]: true }));

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setTouchedFields(ALL_FIELDS_TOUCHED);
    if (Object.keys(validationErrors).length || !formValues.accountType) {
      focusFirstInvalidField(validationErrors);
      return;
    }

    const registerResult = await dispatch(
      registerAccount({
        accountType: formValues.accountType,
        firstName: formValues.firstName.trim(),
        lastName: formValues.lastName.trim(),
        email: formValues.email.trim(),
        password: formValues.password,
      }),
    );
    if (registerAccount.fulfilled.match(registerResult)) router.push("/auth/verify-email");
  };

  const getFieldError = (field: SignupField) =>
    (touchedFields[field] ? validationErrors[field] : undefined) ??
    registerRequest.fieldErrors[field];

  return (
    <AuthCard>
      <ErrorToast
        isOpen={registerRequest.isFailed}
        onClose={registerRequest.clearRequest}
        title="Could not create account"
        message={registerRequest.error?.message}
      />

      {/* Top-right sign-in link */}
      <div className="mb-5 text-right text-xs text-body">
        Already have an account?{" "}
        <button
          type="button"
          onClick={() => router.push("/auth/login")}
          className="font-semibold text-link transition-colors duration-200 hover:text-primary hover:underline cursor-pointer"
        >
          Sign In
        </button>
      </div>

      {/* Heading */}
      <div className="animate-[fadeSlide_0.5s_cubic-bezier(0.16,1,0.3,1)_both] [animation-delay:0.05s]">
        <h2 className="text-3xl font-semibold tracking-tight text-heading sm:text-[2rem]">
          Create Account
        </h2>
        <p className="mt-1.5 text-sm text-body sm:text-[0.95rem]">
          Get started with{" "}
          <span className="font-semibold text-heading">KOOLMD</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-7 space-y-3" noValidate>
        {/* ---------- Role ---------- */}
        <div
          className={`animate-[fadeSlide_0.5s_cubic-bezier(0.16,1,0.3,1)_both] [animation-delay:0.1s] ${
            isDropdownOpen ? "relative z-50" : ""
          }`}
        >
          <SignupDropdown
            id="role"
            name="role"
            label="Select Your Role"
            placeholder="Choose your role"
            icon={<Users className="h-[18px] w-[18px]" />}
            value={formValues.accountType}
            onChange={(selectedValue) =>
              updateField("accountType", selectedValue as SignupAccountType)
            }
            onBlur={() => handleBlur("accountType")}
            onOpenChange={setIsDropdownOpen}
            options={ACCOUNT_TYPE_OPTIONS}
            error={getFieldError("accountType")}
          />
        </div>

        {/* ---------- First + Last name ---------- */}
        <div className="animate-[fadeSlide_0.5s_cubic-bezier(0.16,1,0.3,1)_both] [animation-delay:0.13s]">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <SignupField
              id="firstName"
              name="firstName"
              label="First Name"
              placeholder="Enter your first name"
              autoComplete="given-name"
              icon={<User className="h-[18px] w-[18px]" />}
              value={formValues.firstName}
              onChange={(event) => updateField("firstName", event.target.value)}
              onBlur={() => handleBlur("firstName")}
              error={getFieldError("firstName")}
            />

            <SignupField
              id="lastName"
              name="lastName"
              label="Last Name"
              placeholder="Enter your last name"
              autoComplete="family-name"
              icon={<User className="h-[18px] w-[18px]" />}
              value={formValues.lastName}
              onChange={(event) => updateField("lastName", event.target.value)}
              onBlur={() => handleBlur("lastName")}
              error={getFieldError("lastName")}
            />
          </div>
        </div>

        {/* ---------- Email ---------- */}
        <div className="animate-[fadeSlide_0.5s_cubic-bezier(0.16,1,0.3,1)_both] [animation-delay:0.16s]">
          <SignupField
            id="email"
            name="email"
            type="email"
            label="Email Address"
            placeholder="you@example.com"
            autoComplete="email"
            icon={<Mail className="h-[18px] w-[18px]" />}
            value={formValues.email}
            onChange={(event) => updateField("email", event.target.value)}
            onBlur={() => handleBlur("email")}
            error={getFieldError("email")}
          />
        </div>

        {/* ---------- Password ---------- */}
        <div className="animate-[fadeSlide_0.5s_cubic-bezier(0.16,1,0.3,1)_both] [animation-delay:0.19s]">
          <SignupField
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            label="Password"
            placeholder="Create a strong password"
            autoComplete="new-password"
            icon={<Lock className="h-[18px] w-[18px]" />}
            value={formValues.password}
            onChange={(event) => updateField("password", event.target.value)}
            onBlur={() => handleBlur("password")}
            error={getFieldError("password")}
            hint={`Use at least ${PASSWORD_MIN_LENGTH} characters. Avoid your name, email or common passwords.`}
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
        </div>

     {/* ---------- Submit ---------- */}
<div className="pt-2 animate-[fadeSlide_0.5s_cubic-bezier(0.16,1,0.3,1)_both] [animation-delay:0.22s]">
  <SignupSocialButton
    type="submit"
    showIcon={false}
    provider="google"
    disabled={registerRequest.isPending}
    className="!h-12 !text-sm"
  >
    <SubmitButtonContent
      isLoading={registerRequest.isPending}
      label="Create Account"
      loadingLabel="Creating account…"
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

export default SignupForm;