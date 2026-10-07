"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, Lock, Mail, ShieldCheck } from "lucide-react";
import { FiArrowRight } from "react-icons/fi";
import SignupField from "@/components/SignupField";
import SignupSocialButton from "@/components/SignupSocialButton";

type Errors = {
  email?: string;
  password?: string;
};

const LoginForm = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<{ [k: string]: boolean }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (): Errors => {
    const e: Errors = {};
    if (!email.trim()) e.email = "Please enter your email address.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      e.email = "Please enter a valid email address.";
    if (!password) e.password = "Please enter your password.";
    else if (password.length < 6)
      e.password = "Password must be at least 6 characters.";
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
    setTouched({ email: true, password: true });
    if (Object.keys(v).length) return;

    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 900));
    console.log({ email, password });
    setIsSubmitting(false);
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
            onChange={(e) => {
              setEmail(e.target.value);
              if (touched.email) setErrors(validate());
            }}
            onBlur={() => handleBlur("email")}
            error={showError("email")}
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
            onChange={(e) => {
              setPassword(e.target.value);
              if (touched.password) setErrors(validate());
            }}
            onBlur={() => handleBlur("password")}
            error={showError("password")}
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

          {/* Forgot password — right-aligned under the input */}
          {!(touched.password && errors.password) && (
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
  disabled={isSubmitting}
  className="!h-12 !text-sm"
>
  {isSubmitting ? (
    <span className="flex items-center gap-2">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
      Signing In…
    </span>
  ) : (
    <span className="flex items-center gap-2">
      Sign In
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
    </div>
  );
};

export default LoginForm;