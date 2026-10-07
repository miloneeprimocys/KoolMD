"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, Mail, ShieldCheck, User } from "lucide-react";
import SignupSocialButton from "@/components/SignupSocialButton";

const Logo = () => (
  <Image
    src="/images/only_logo.svg"
    alt="KOOLMD Logo"
    width={44}
    height={44}
    className="shrink-0"
  />
);

/* tiny "+" sparkle used around the success badge */
const Sparkle = ({
  className = "",
  color = "var(--shape-blue)",
  size = 10,
}: {
  className?: string;
  color?: string;
  size?: number;
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 10 10"
    fill="none"
    aria-hidden="true"
    className={`absolute ${className}`}
  >
    <path d="M5 0v10M0 5h10" stroke={color} strokeWidth="2.4" strokeLinecap="round" />
  </svg>
);

const AccountCreated = () => {
  const router = useRouter();

  return (
    <main className="relative flex min-h-screen w-full flex-col overflow-hidden bg-gradient-to-br from-[var(--surface-start)] to-[var(--surface-end)]">
      {/* ===== BACKGROUND SHADING – soft circles, left / right edges ===== */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full select-none"
        viewBox="0 0 1256 704"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="acBlobBL" x1="0.2" y1="0" x2="0.8" y2="1">
            <stop offset="0%" stopColor="var(--shape-sky)" stopOpacity="0.45" />
            <stop offset="100%" stopColor="var(--shape-sky)" stopOpacity="0.1" />
          </linearGradient>
          <linearGradient id="acBlobBR" x1="0.2" y1="0" x2="0.8" y2="1">
            <stop offset="0%" stopColor="var(--shape-sky)" stopOpacity="0.1" />
            <stop offset="100%" stopColor="var(--shape-blue)" stopOpacity="0.28" />
          </linearGradient>
          <linearGradient id="acBlobTL" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--shape-sky)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="var(--shape-sky)" stopOpacity="0.08" />
          </linearGradient>
        </defs>

        {/* top-left soft arc */}
        <ellipse cx="60" cy="130" rx="260" ry="110" fill="url(#acBlobTL)" />

        {/* bottom-left big circle + small bubble */}
        <circle cx="-30" cy="700" r="215" fill="url(#acBlobBL)" />
        <circle cx="180" cy="540" r="44" fill="var(--shape-sky)" opacity="0.18" />
        <circle cx="260" cy="760" r="190" fill="var(--shape-sky)" opacity="0.14" />

        {/* right side – small bubble + big bottom-right circles */}
        <circle cx="1256" cy="285" r="68" fill="var(--shape-sky)" opacity="0.2" />
        <circle cx="1250" cy="780" r="260" fill="url(#acBlobBR)" />
        <circle cx="1100" cy="860" r="250" fill="var(--shape-sky)" opacity="0.16" />
      </svg>

      {/* ===== HEADER ===== */}
      <header className="relative z-10 flex items-start justify-between px-6 py-6 sm:px-10 lg:px-14">
        <div className="flex items-center gap-2.5">
          <Logo />
          <div>
            <p className="flex items-baseline text-2xl font-extrabold leading-none tracking-tight text-[var(--brand-navy)]">
              KOOL<span className="text-[var(--brand-teal)]">MD</span>
              <sup className="ml-0.5 align-super text-[8px] font-semibold text-[var(--body)]">®</sup>
            </p>
            <p className="mt-1 text-[10px] font-medium tracking-wide text-body">
              Your Health. Our Priority.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ShieldCheck className="h-7 w-7 shrink-0 text-primary" />
          <div className="hidden leading-tight sm:block">
            <p className="text-xs font-semibold text-heading">HIPAA Compliant</p>
            <p className="text-[10px] text-body">Secure. Private. Protected.</p>
          </div>
        </div>
      </header>

      {/* ===== CONTENT ===== */}
      <section className="relative z-10 flex flex-1 items-center justify-center px-6 pb-16">
        <div className="flex w-full max-w-md flex-col items-center text-center sm:max-w-lg animate-[cardIn_0.5s_cubic-bezier(0.16,1,0.3,1)_both]">
          {/* Success badge */}
          <div className="relative flex h-40 w-40 items-center justify-center">
            <span className="absolute inset-0 rounded-full bg-shape-mint/20" />
            <span className="absolute inset-4 rounded-full bg-shape-mint/30" />
            <span className="absolute inset-4 rounded-full bg-shape-mint/20 animate-ping [animation-duration:2.5s]" />
            <span className="relative flex h-[84px] w-[84px] items-center justify-center rounded-full bg-[var(--brand-green)] shadow-lg shadow-shape-mint/50">
              <Check className="h-10 w-10 text-white" strokeWidth={3} />
            </span>

            {/* sparkles */}
            <Sparkle className="left-1 top-9" color="var(--shape-blue)" size={9} />
            <Sparkle className="left-6 bottom-6" color="var(--shape-sky)" size={8} />
            <Sparkle className="right-3 top-10" color="var(--shape-sky)" size={8} />
            <Sparkle className="-right-2 top-[78px]" color="var(--shape-mint)" size={9} />
            <Sparkle className="right-6 bottom-5" color="var(--shape-blue)" size={9} />
          </div>

          {/* Heading */}
          <h1 className="mt-6 text-3xl font-bold tracking-tight text-heading sm:text-[2.1rem]">
            Account Created Successfully!
          </h1>
          <p className="mt-3 max-w-sm text-base leading-relaxed text-body sm:text-lg">
            Your KOOLMD account has been created and your email address has been verified.
          </p>

          {/* Account details card */}
          <div className="mt-8 w-full rounded-2xl border border-border bg-card px-5 py-1 text-left shadow-xl shadow-shape-sky/25 transition-shadow duration-500 hover:shadow-2xl hover:shadow-shape-sky/40">
            {/* Email row */}
            <div className="flex items-center gap-4 py-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-shape-sky/25 text-primary">
                <Mail className="h-[18px] w-[18px]" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-body">Email Address</p>
                <p className="truncate text-sm font-semibold text-heading">sarah.johnson@email.com</p>
              </div>
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-shape-mint/25 px-2.5 py-1.5 text-xs font-semibold text-[var(--brand-green)]">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[var(--brand-green)]">
                  <Check className="h-2.5 w-2.5 text-white" strokeWidth={4} />
                </span>
                Verified
              </span>
            </div>

            <div className="h-px w-full bg-divider" />

            {/* Account type row */}
            <div className="flex items-center gap-4 py-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-shape-sky/25 text-primary">
                <User className="h-[18px] w-[18px]" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-body">Account Type</p>
                <p className="text-sm font-semibold text-heading">Administrator</p>
              </div>
            </div>
          </div>

       {/* CTA */}
<div className="mt-8 w-full max-w-sm">
  <SignupSocialButton
    type="button"
    showIcon={false}
    provider="google"
    onClick={() => router.push("/dashboard")}
    className="!h-12 !text-sm"
  >
    <span className="flex items-center gap-2">
      Go to Dashboard
      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
    </span>
  </SignupSocialButton>
</div>
        </div>
      </section>
    </main>
  );
};

export default AccountCreated;