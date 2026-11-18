"use client";

import React, { useState } from "react";
import { Eye, EyeOff, Lock, Mail, User } from "lucide-react";

import SignupField from "@/components/SignupField";
import { PhoneField, validatePhone, type Errors, type StepProps } from "@/providers/Shared";
import {
  PASSWORD_MIN_LENGTH,
  compactErrors,
  validateEmail,
  validateNewPassword,
  validateRequiredText,
} from "../authValidation";

/* ---------- Values ---------- */
export interface AccountValues {
  fullName: string;
  phoneCountry: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export const initialAccount = (): AccountValues => ({
  fullName: "",
  phoneCountry: "IN",
  phone: "",
  email: "",
  password: "",
  confirmPassword: "",
});

export const splitName = (full: string) => {
  const parts = full.trim().split(/\s+/);
  return { firstName: parts[0] ?? "", lastName: parts.slice(1).join(" ") };
};

/* ---------- Validation ---------- */
type AccountField = "fullName" | "phone" | "email" | "password" | "confirmPassword";

export const validateAccount = (v: AccountValues): Errors => {
  const { firstName, lastName } = splitName(v.fullName);
  return compactErrors<AccountField>({
    fullName:
      validateRequiredText(v.fullName, "full name") ??
      (lastName ? undefined : "Enter your first and last name."),
    phone: validatePhone(v.phone, v.phoneCountry, true),
    email: validateEmail(v.email),
    password: validateNewPassword(v.password, { firstName, lastName, email: v.email }),
    confirmPassword: !v.confirmPassword
      ? "Please confirm your password."
      : v.confirmPassword !== v.password
        ? "Passwords do not match."
        : undefined,
  }) as Errors;
};

/* ---------- Component ---------- */
const EyeToggle = ({ shown, onClick }: { shown: boolean; onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={shown ? "Hide password" : "Show password"}
    className="cursor-pointer rounded-md p-1 text-label transition-all duration-200 hover:scale-110 hover:text-primary active:scale-95"
  >
    {shown ? <Eye className="h-[18px] w-[18px]" /> : <EyeOff className="h-[18px] w-[18px]" />}
  </button>
);

const PatientAccountDetails = ({ values: v, errors, onChange }: StepProps<AccountValues>) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <SignupField
          id="fullName"
          name="fullName"
          label="Full Name"
          placeholder="Enter your full name"
          autoComplete="name"
          icon={<User className="h-[18px] w-[18px]" />}
          value={v.fullName}
          onChange={(e) => onChange({ fullName: e.target.value })}
          error={errors.fullName}
        />
        <PhoneField
          name="phone"
          label="Phone Number"
          placeholder="Enter phone number"
          value={v.phone}
          onChange={(val) => onChange({ phone: val })}
          countryCode={v.phoneCountry}
          onCountryChange={(iso) => onChange({ phoneCountry: iso })}
          error={errors.phone}
        />
      </div>

      <SignupField
        id="email"
        name="email"
        type="email"
        label="Email Address"
        placeholder="you@example.com"
        autoComplete="email"
        icon={<Mail className="h-[18px] w-[18px]" />}
        value={v.email}
        onChange={(e) => onChange({ email: e.target.value })}
        error={errors.email}
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <SignupField
          id="password"
          name="password"
          type={showPassword ? "text" : "password"}
          label="Password"
          placeholder="Create a strong password"
          autoComplete="new-password"
          icon={<Lock className="h-[18px] w-[18px]" />}
          value={v.password}
          onChange={(e) => onChange({ password: e.target.value })}
          error={errors.password}
          hint={`Use at least ${PASSWORD_MIN_LENGTH} characters. Avoid your name, email or common passwords.`}
          trailing={<EyeToggle shown={showPassword} onClick={() => setShowPassword((s) => !s)} />}
        />
        <SignupField
          id="confirmPassword"
          name="confirmPassword"
          type={showConfirm ? "text" : "password"}
          label="Confirm Password"
          placeholder="Re-enter your password"
          autoComplete="new-password"
          icon={<Lock className="h-[18px] w-[18px]" />}
          value={v.confirmPassword}
          onChange={(e) => onChange({ confirmPassword: e.target.value })}
          error={errors.confirmPassword}
          trailing={<EyeToggle shown={showConfirm} onClick={() => setShowConfirm((s) => !s)} />}
        />
      </div>
    </div>
  );
};

export default PatientAccountDetails;