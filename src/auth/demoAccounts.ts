/**
 * DEVELOPMENT ONLY — one-click demo sign-in on the login screen.
 *
 * NEXT_PUBLIC_* values are inlined into the browser bundle at build time, so these
 * credentials are visible to anyone who loads the page. Set them only in local/demo
 * environments; never in a production build. Each variable is referenced literally
 * because Next.js does not inline dynamic `process.env[name]` lookups.
 */
export interface DemoAccount {
  role: string;
  email: string;
  password: string;
}

const isDemoLoginEnabled = process.env.NEXT_PUBLIC_DEMO_LOGIN_ENABLED === "true";

const candidates: DemoAccount[] = [
  {
    role: "Super Admin",
    email: process.env.NEXT_PUBLIC_DEMO_SUPER_ADMIN_EMAIL ?? "",
    password: process.env.NEXT_PUBLIC_DEMO_SUPER_ADMIN_PASSWORD ?? "",
  },
  {
    role: "Doctor",
    email: process.env.NEXT_PUBLIC_DEMO_DOCTOR_EMAIL ?? "",
    password: process.env.NEXT_PUBLIC_DEMO_DOCTOR_PASSWORD ?? "",
  },
  {
    role: "Patient",
    email: process.env.NEXT_PUBLIC_DEMO_PATIENT_EMAIL ?? "",
    password: process.env.NEXT_PUBLIC_DEMO_PATIENT_PASSWORD ?? "",
  },
];

/** Accounts with both an email and a password configured; empty unless demo login is enabled. */
export const DEMO_ACCOUNTS: DemoAccount[] = isDemoLoginEnabled
  ? candidates.filter((account) => account.email && account.password)
  : [];
