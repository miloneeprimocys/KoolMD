import type { ReactNode } from "react";

/** Shared card shell for every auth screen (login, sign-up, verify, password recovery). */
const AuthCard = ({ children }: { children: ReactNode }) => (
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
    {children}
  </div>
);

export default AuthCard;
