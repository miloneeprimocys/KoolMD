import type { ComponentType } from "react";

import AuthPage from "@/auth/Authpage";
import VerifyPage from "@/auth/verifyEmail/Verifypage";
import Dashboard from "@/dashboard/Dashboard";
import Patient from "@/patient/Patient";
import AddPatient from "@/patient/AddPatient";
import Providers from "@/providers/Providers";
import AddProvider from "@/providers/AddProvider";
import { PERMISSIONS, type PermissionCode } from "@/auth/permissions";

/**
 * protected → signed-in only · guest → signed-out only · public → anyone
 */
export type RouteAccess = "protected" | "guest" | "public";
import ViewProvider from "@/providers/viewproviders/Viewprovider";

export interface RouteConfig {
  component: ComponentType;
  access: RouteAccess;
  /** If set, the page is wrapped in MainLayout with this title */
  title?: string;
  /** Protected pages only: signed-in users without it are sent to the dashboard. */
  requiredPermission?: PermissionCode;
}

const LoginPage = () => <AuthPage variant="login" />;
const SignupPage = () => <AuthPage variant="signup" />;
const ForgotPasswordPage = () => <AuthPage variant="forgot-password" />;
const ResetPasswordPage = () => <AuthPage variant="reset-password" />;

export const ROUTES: Record<string, RouteConfig> = {
  // Guest-only (signed-in users are sent to the dashboard)
  "": { component: LoginPage, access: "guest" },
  "auth/login": { component: LoginPage, access: "guest" },
  "auth/register": { component: SignupPage, access: "guest" },
  "auth/forgot-password": { component: ForgotPasswordPage, access: "guest" },

  // Public — opened from email links, must work in any session state
  "auth/verify-email": { component: VerifyPage, access: "public" },
  "auth/reset-password": { component: ResetPasswordPage, access: "public" },

  // App (inside MainLayout)
  dashboard: { component: Dashboard, title: "Dashboard", access: "protected" },
  patients: {
    component: Patient,
    title: "Patients",
    access: "protected",
    requiredPermission: PERMISSIONS.PATIENT_READ,
  },
  "add-patient": {
    component: AddPatient,
    title: "Add Patient",
    access: "protected",
    requiredPermission: PERMISSIONS.PATIENT_CREATE,
  },
  providers: {
    component: Providers,
    title: "Providers",
    access: "protected",
    requiredPermission: PERMISSIONS.PRACTITIONER_READ,
  },
  "add-provider": {
    component: AddProvider,
    title: "Add Provider",
    access: "protected",
    requiredPermission: PERMISSIONS.PRACTITIONER_MANAGE,
  },
  "view-provider": {
    component: ViewProvider,
    title: "View Provider",
    access: "protected",
    requiredPermission: PERMISSIONS.PRACTITIONER_READ,
  },
};
