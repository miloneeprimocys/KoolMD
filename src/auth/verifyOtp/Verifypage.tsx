"use client";

import React from "react";
import VerifyLeftSection from "./Verifyleftsection";
import VerifyOTP from "./VerifyOTP";

/**
 * Common wrapper – renders VerifyLeftSection + VerifyOTP side by side.
 *
 * Layout (same as AuthPage):
 *  - < lg : left panel hidden, right column scrolls on its own.
 *  - ≥ lg : both sides visible, card centered vertically when it fits,
 *           scrolls from the top when it doesn't.
 */
const VerifyPage = () => {
  return (
    <main className="flex h-screen w-full overflow-hidden bg-page">
      {/* Left panel — hidden below lg by its own classes */}
      <VerifyLeftSection />

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
        <div className="mx-auto my-auto w-full max-w-lg py-8">
          <VerifyOTP />
        </div>
      </div>
    </main>
  );
};

export default VerifyPage;