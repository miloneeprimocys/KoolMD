"use client";

import React from "react";
import { useSelector } from "react-redux";
import LeftSection from "./LeftSection";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";
import AccountCreated from "./AccountCreated";

interface AuthPageProps {
  variant: "login" | "signup";
}

/**
 * Common wrapper – renders LeftSection + LoginForm/SignupForm side by side.
 * Gets the variant from the route.
 *
 * Layout:
 *  - < lg : Left hidden (per LeftSection), right column scrolls independently.
 *  - ≥ lg : Both sides visible, right column centered vertically when the
 *           form fits, and scrolls smoothly from the top when it doesn't.
 */
const AuthPage = ({ variant }: AuthPageProps) => {
  return (
    <>
    <AccountCreated/>
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
          {variant === "login" ? <LoginForm /> : <SignupForm />}
        </div>
      </div>
    </main>
    </>
  );
};

export default AuthPage;