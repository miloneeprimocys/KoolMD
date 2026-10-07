"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  Users,
  User,
  ShieldCheck,
} from "lucide-react";
import { useDispatch } from "react-redux";

import SignupField from "@/components/SignupField";
import { ArrowRight } from "lucide-react";
import SignupDropdown from "@/components/SignupDropdown";
import SignupSocialButton from "@/components/SignupSocialButton";
import { setVerifyOtpEmail } from "@/redux/slices/verifyOtpSlice";

const ROLES = [
  { value: "patient", label: "Patient" },
  { value: "doctor", label: "Doctor" },
  { value: "admin", label: "Admin" },
];

type Errors = {
  role?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
};

const SignupForm = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [role, setRole] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<{ [k: string]: boolean }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const validate = (): Errors => {
    const e: Errors = {};
    if (!role) e.role = "Please select your role.";
    if (!firstName.trim()) e.firstName = "Please enter your first name.";
    if (!lastName.trim()) e.lastName = "Please enter your last name.";
    if (!email.trim()) e.email = "Please enter your email address.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      e.email = "Please enter a valid email address.";
    if (!password) e.password = "Please create a password.";
    else if (password.length < 8)
      e.password = "Password must be at least 8 characters.";
    else if (!/(?=.*[A-Za-z])(?=.*\d)/.test(password))
      e.password = "Use a mix of letters and numbers.";
    return e;
  };

  const handleBlur = (field: string) => {
    setTouched((t) => ({ ...t, [field]: true }));
    setErrors(validate());
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const v = validate();
    setErrors(v);
    setTouched({
      role: true,
      firstName: true,
      lastName: true,
      email: true,
      password: true,
    });
    if (Object.keys(v).length) return;

    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 900));
    dispatch(setVerifyOtpEmail(email));
    setIsSubmitting(false);
    router.push("/auth/verify-otp");
  };

  const showError = (field: keyof Errors) =>
    touched[field] && errors[field] ? errors[field] : undefined;

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
            value={role}
            onChange={(v) => {
              setRole(v);
              if (touched.role) setErrors(validate());
            }}
            onBlur={() => handleBlur("role")}
            onOpenChange={setIsDropdownOpen}
            options={ROLES}
            error={showError("role")}
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
              value={firstName}
              onChange={(e) => {
                setFirstName(e.target.value);
                if (touched.firstName) setErrors(validate());
              }}
              onBlur={() => handleBlur("firstName")}
              error={showError("firstName")}
            />

            <SignupField
              id="lastName"
              name="lastName"
              label="Last Name"
              placeholder="Enter your last name"
              autoComplete="family-name"
              icon={<User className="h-[18px] w-[18px]" />}
              value={lastName}
              onChange={(e) => {
                setLastName(e.target.value);
                if (touched.lastName) setErrors(validate());
              }}
              onBlur={() => handleBlur("lastName")}
              error={showError("lastName")}
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
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (touched.email) setErrors(validate());
            }}
            onBlur={() => handleBlur("email")}
            error={showError("email")}
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
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (touched.password) setErrors(validate());
            }}
            onBlur={() => handleBlur("password")}
            error={showError("password")}
            hint="Use at least 8 characters with a mix of letters, numbers and a symbol."
            trailing={
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
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
    disabled={isSubmitting}
    className="!h-12 !text-sm"
  >
    {isSubmitting ? (
      <span className="flex items-center gap-2">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
        Creating account…
      </span>
    ) : (
      <span className="flex items-center gap-2">
        Create Account
        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
      </span>
    )}
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
    </div>
  );
};

export default SignupForm;