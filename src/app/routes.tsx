import type { ComponentType } from "react";

import AuthPage from "@/auth/Authpage";
import VerifyPage from "@/auth/verifyOtp/Verifypage";
import Dashboard from "@/dashboard/Dashboard";
import Patient from "@/patient/Patient";
import AddPatient from "@/patient/AddPatient";
import Providers from "@/providers/Providers";
import AddProvider from "@/providers/AddProvider";

export interface RouteConfig {
  component: ComponentType;
  /** If set, the page is wrapped in MainLayout with this title */
  title?: string;
}

export const ROUTES: Record<string, RouteConfig> = {
  // Public / auth
  "": { component: () => <AuthPage variant="login" /> },
  "auth/login": { component: () => <AuthPage variant="login" /> },
  "auth/register": { component: () => <AuthPage variant="signup" /> },
  "auth/verify-otp": { component: VerifyPage },

  // App (inside MainLayout)
  dashboard: { component: Dashboard, title: "Dashboard" },
  patients: { component: Patient, title: "Patients" },
  "add-patient": { component: AddPatient, title: "Add Patient" },
  providers: { component: Providers, title: "Providers" },
  "add-provider": { component: AddProvider, title: "Add Provider" },
};