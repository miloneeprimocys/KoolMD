"use client";

import React, { ButtonHTMLAttributes, ReactNode } from "react";
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa";

type Provider = "google" | "apple";

interface SignupSocialButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  provider?: Provider;
  /** Set to `null` to render a plain button with no provider icon */
  showIcon?: boolean;
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
  showIcon = true,
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
        group relative flex h-11 w-full items-center justify-center gap-2
        overflow-hidden rounded-xl
        border border-border bg-card
        text-sm font-semibold text-heading
        cursor-pointer
        transition-all duration-300 ease-out
       
        hover:border-primary/40
        hover:shadow-sm hover:shadow-primary/10
        active:translate-y-0 active:scale-[0.98]
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25
        disabled:cursor-not-allowed disabled:opacity-60
        ${className}
      `}
    >
      {/* Gradient wash — lighter on hover */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-xl
                   bg-gradient-to-br from-primary/[0.04] to-primary/[0.08]
                   opacity-0 transition-opacity duration-300
                   group-hover:opacity-100"
      />

      {/* Bottom accent line — grows on hover */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-1/2 h-[2px] w-0
                   -translate-x-1/2 rounded-full
                   bg-gradient-to-r from-primary to-primary-hover
                   transition-all duration-500 ease-out
                   group-hover:w-2/3"
      />

      {/* Icon — optional; scales and rotates slightly on hover */}
      {showIcon && (
        <span
          className={`
            relative transition-transform duration-300
            group-hover:scale-110
            ${isApple ? "group-hover:rotate-6" : "group-hover:-rotate-6"}
          `}
        >
          {ICONS[provider]}
        </span>
      )}

      <span className="relative">{children ?? LABELS[provider]}</span>
    </button>
  );
};

export default SignupSocialButton;