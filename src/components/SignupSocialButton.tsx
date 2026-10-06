"use client";

import React, { ButtonHTMLAttributes, ReactNode } from "react";
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa";

type Provider = "google" | "apple";

interface SignupSocialButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  provider?: Provider;
  /** Delay idle animations so the two buttons alternate phases */
  delay?: string;
  children?: ReactNode;
}

const ICONS: Record<Provider, ReactNode> = {
  google: <FcGoogle className="h-5 w-5" />,
  apple: <FaApple className="h-5 w-5" />,
};

const LABELS: Record<Provider, string> = {
  google: "Continue with Google",
  apple: "Continue with Apple",
};

const SignupSocialButton: React.FC<SignupSocialButtonProps> = ({
  provider = "google",
  delay = "0s",
  children,
  className = "",
  ...rest
}) => {
  const isApple = provider === "apple";

return (
  <button
    {...rest}
    type="button"
    className={`
      group relative flex h-11 items-center justify-center gap-2
      overflow-hidden rounded-xl
      border border-border bg-card
      text-xs font-semibold text-heading
      cursor-pointer
      transition-all duration-300 ease-out
      animate-[softFloat_4s_ease-in-out_infinite]
      hover:-translate-y-0.5
      hover:border-primary/60
      hover:shadow-md hover:shadow-primary/15
      hover:[animation-play-state:paused]
      active:translate-y-0 active:scale-[0.98]
      focus:outline-none
      ${className}
    `}
  >
    {/* Continuous gradient wash */}
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 rounded-xl
                 bg-gradient-to-br from-primary/5 to-primary/10
                 opacity-0 animate-[washBreath_4s_ease-in-out_infinite]
                 group-hover:[animation-play-state:paused]"
    />

    {/* Bottom accent line */}
    <span
      aria-hidden="true"
      className="pointer-events-none absolute bottom-0 left-1/2 h-[2px]
                 -translate-x-1/2 rounded-full
                 bg-gradient-to-r from-primary to-primary-hover
                 animate-[lineGrow_4s_ease-in-out_infinite]
                 group-hover:w-2/3 group-hover:[animation-play-state:paused]"
    />

    {/* Icon with wiggle — Google rotates one way, Apple the other */}
    <span
      className={`
        relative transition-transform duration-300
        animate-[iconWiggle_4s_ease-in-out_infinite]
        group-hover:scale-110
        ${isApple ? "group-hover:rotate-6" : "group-hover:-rotate-6"}
        group-hover:[animation-play-state:paused]
      `}
    >
      {ICONS[provider]}
    </span>

    <span className="relative">{children ?? LABELS[provider]}</span>
  </button>
);
};

export default SignupSocialButton;