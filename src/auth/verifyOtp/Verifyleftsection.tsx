import React from "react";
import { Lock, Settings, ShieldCheck, type LucideIcon } from "lucide-react";

const Logo = () => (
  <svg
    viewBox="0 0 56 56"
    fill="none"
    aria-hidden="true"
    className="h-14 w-14 shrink-0 xl:h-16 xl:w-16 2xl:h-[72px] 2xl:w-[72px]"
  >
    <defs>
      <linearGradient id="vLeafL" x1="0" y1="1" x2="1" y2="0">
        <stop offset="0%" stopColor="var(--brand-teal, #14B8A6)" />
        <stop offset="100%" stopColor="var(--brand-sky, #38BDF8)" />
      </linearGradient>
      <linearGradient id="vLeafR" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="var(--brand-green, #22C55E)" />
        <stop offset="100%" stopColor="var(--brand-teal, #14B8A6)" />
      </linearGradient>
    </defs>
    <circle cx="28" cy="7" r="5.5" fill="var(--brand-sky, #38BDF8)" />
    <path d="M26 16C10 14 2 24 3 40c1 8 6 13 14 14C13 44 16 28 26 16Z" fill="url(#vLeafL)" />
    <path d="M30 16c16-2 24 8 23 24-1 8-6 13-14 14 4-10 1-26-9-38Z" fill="url(#vLeafR)" />
  </svg>
);

interface Feature {
  icon: LucideIcon;
  color: string;
  badgeClass: string;
  iconClass: string;
  title: string;
  desc: string;
}

const FEATURES: Feature[] = [
  {
    icon: Lock,
    color: "var(--primary, #2563EB)",
    badgeClass: "bg-primary/10",
    iconClass: "text-primary",
    title: "HIPAA Compliant",
    desc: "Your data is secure and private.",
  },
  {
    icon: ShieldCheck,
    color: "var(--brand-green, #22C55E)",
    badgeClass: "bg-brand-green/10",
    iconClass: "text-brand-green",
    title: "Trusted Healthcare Platform",
    desc: "Built for patients, providers and staff.",
  },
  {
    icon: Settings,
    color: "var(--purple, #8B5CF6)",
    badgeClass: "bg-purple-500/10",
    iconClass: "text-purple-500",
    title: "One Connected System",
    desc: "Appointments, records and care — all in one place.",
  },
];

const VerifyLeftSection = () => {
return (
  <section className="relative hidden min-h-screen flex-1 items-center justify-center overflow-hidden bg-gradient-to-br from-[var(--surface-start,#FFFFFF)] to-[var(--surface-end,#EEF5FF)] lg:flex">
    {/* ===== faint glow, top-right ===== */}
    <div
      aria-hidden="true"
      className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full opacity-[0.14] blur-3xl bg-[var(--shape-mint,#5EEAD4)]"
    />

    {/* ===== BOTTOM ARCS ===== */}
    <svg
      className="pointer-events-none absolute bottom-0 left-0 h-[32%] w-full select-none overflow-visible"
      viewBox="0 0 530 230"
      preserveAspectRatio="none"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="vArcMint" x1="0.2" y1="0" x2="0.6" y2="1">
          <stop offset="0%" stopColor="var(--shape-mint, #99F6E4)" stopOpacity="0.95" />
          <stop offset="100%" stopColor="var(--brand-teal, #14B8A6)" stopOpacity="0.45" />
        </linearGradient>
        <linearGradient id="vArcBlue" x1="0.3" y1="0" x2="0.7" y2="1">
          <stop offset="0%" stopColor="var(--shape-sky, #BAE6FD)" stopOpacity="0.7" />
          <stop offset="100%" stopColor="var(--shape-blue, #93C5FD)" stopOpacity="0.28" />
        </linearGradient>
      </defs>

      <path
        className="vl-arc vl-arc-3"
        d="M120 300C200 160 330 120 430 140C490 152 530 170 580 190V300Z"
        fill="var(--shape-sky, #BAE6FD)"
        opacity="0.35"
      />
      <path
        className="vl-arc vl-arc-2"
        d="M-40 300H30C70 110 170 55 260 60C380 66 480 140 580 180V300Z"
        fill="url(#vArcBlue)"
      />
      <path
        className="vl-arc vl-arc-3"
        d="M200 300C300 200 420 180 580 205V300Z"
        fill="var(--card, #FFFFFF)"
        opacity="0.5"
      />
      <path
        className="vl-arc vl-arc-1"
        d="M-40 -10C70 25 125 110 140 300H-40Z"
        fill="url(#vArcMint)"
      />
    </svg>

    {/* ===== CONTENT ===== */}
    <div className="relative z-10 w-full max-w-xl px-10 py-10 xl:px-14 2xl:max-w-2xl 2xl:px-16">
      {/* Brand */}
      <div className="vl-fade flex items-center gap-4 xl:gap-5">
        <Logo />
        <div>
          <h1 className="flex items-baseline text-4xl font-extrabold leading-none tracking-tight text-[var(--brand-navy,#0B1F4B)] xl:text-5xl 2xl:text-6xl">
            KOOL<span className="text-[var(--brand-teal,#0EA5E9)]">MD</span>
            <sup className="ml-1 align-super text-xs font-semibold text-[var(--body,#64748B)] xl:text-sm">
              ®
            </sup>
          </h1>
          <p className="mt-1.5 text-base font-semibold tracking-wide text-[var(--body,#64748B)] xl:text-lg 2xl:text-xl">
            Your Health. Our Priority.
          </p>
        </div>
      </div>

      <div className="my-8 h-1 w-16 rounded-full bg-[var(--accent-line,#2563EB)] xl:my-10 xl:w-20" />

      {/* Heading */}
      <h2 className="vl-fade [animation-delay:0.05s] text-4xl font-bold leading-[1.15] tracking-tight text-[var(--heading,#0B1F4B)] xl:text-5xl 2xl:text-[3.5rem]">
        You&apos;re Almost There
      </h2>
      <p className="vl-fade [animation-delay:0.1s] mt-5 max-w-md text-lg leading-relaxed text-[var(--body,#64748B)] xl:mt-6 xl:max-w-lg xl:text-xl 2xl:text-[1.35rem]">
        We&apos;ve sent a verification code to your email. Please check your inbox and enter the
        code to continue.
      </p>

      {/* Features */}
      <ul className="mt-10 space-y-6 xl:mt-12 xl:space-y-7">
        {FEATURES.map(({ icon: Icon, badgeClass, iconClass, title, desc }, i) => (
          <li
            key={title}
            className={`vl-fade vl-fade-${i + 1} flex items-center gap-4 xl:gap-5`}
          >
            <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full xl:h-14 xl:w-14">
              <span
                aria-hidden="true"
                className={`absolute inset-0 rounded-full ${badgeClass}`}
              />
              <Icon
                className={`relative h-5 w-5 xl:h-6 xl:w-6 ${iconClass}`}
                strokeWidth={2}
              />
            </span>
            <div>
              <p className="text-base font-semibold text-[var(--heading,#0B1F4B)] xl:text-lg">
                {title}
              </p>
              <p className="mt-0.5 text-sm text-[var(--body,#64748B)] xl:text-base">
                {desc}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  </section>
);
};

export default VerifyLeftSection;