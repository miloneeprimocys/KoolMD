"use client";

import React, { Suspense, type ComponentType } from "react";
import LeftSection from "./LeftSection";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";
import ForgotPasswordForm from "./ForgotPasswordForm";
import ResetPasswordForm from "./ResetPasswordForm";

export type AuthPageVariant = "login" | "signup" | "forgot-password" | "reset-password";

const FORM_BY_VARIANT: Record<AuthPageVariant, ComponentType> = {
  login: LoginForm,
  signup: SignupForm,
  "forgot-password": ForgotPasswordForm,
  "reset-password": ResetPasswordForm,
};

interface AuthPageProps {
  variant: AuthPageVariant;
}

/**
 * Common wrapper – renders LeftSection + the auth form for `variant` side by side.
 * Gets the variant from the route.
 *
 * Layout:
 *  - < lg : Left hidden (per LeftSection), right column scrolls independently.
 *  - ≥ lg : Both sides visible, right column centered vertically when the
 *           form fits, and scrolls smoothly from the top when it doesn't.
 */
const AuthPage = ({ variant }: AuthPageProps) => {
  const AuthForm = FORM_BY_VARIANT[variant];

  return (
    <main className="flex h-screen w-full overflow-hidden bg-page">
      {/* Left panel — hidden below lg by its own classes */}
      <LeftSection />

      {/* Right column — centered when short, scrollable when tall */}
      <div
        className="
          flex h-full flex-1 lg:flex-[1.15]
          overflow-y-auto
          px-4
          sm:px-6
          lg:px-10
        "
      >
        {/* my-auto = perfect vertical centering with balanced top/bottom space */}
        <div className="mx-auto my-auto w-full max-w-lg py-8">
          {/* Suspense: ResetPasswordForm reads ?token= via useSearchParams */}
          <Suspense fallback={null}>
            <AuthForm />
          </Suspense>
        </div>
      </div>
    </main>
  );
};

export default AuthPage;