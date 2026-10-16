import type { ComponentType } from "react";

import AuthPage from "@/auth/Authpage";
import VerifyPage from "@/auth/verifyEmail/Verifypage";
import Dashboard from "@/dashboard/Dashboard";
import Patient from "@/patient/Patient";
import AddPatient from "@/patient/AddPatient";
import ViewPatient from "@/patient/viewpatients/Viewpatient";
import Providers from "@/providers/Providers";
import AddProvider from "@/providers/AddProvider";
import ViewProvider from "@/providers/viewproviders/Viewprovider";
import AppointmentScheduling from "@/appointments/Appointmentscheduling";
import Encounters from "@/encounters/Encounters";
import NewEncounter from "@/encounters/newencounters/Newencounter";
import ViewEncounters from "@/encounters/viewencounters/Viewencounters";
import Prescriptions from "@/prescriptions/Prescriptions";
import Addprescription from "@/prescriptions/addprescription/Addprescription";
import ViewPrescriptions from "@/prescriptions/viewprescription/Viewprescriptions";
import { PERMISSIONS, type PermissionCode } from "@/auth/permissions";

/**
 * protected → signed-in only · guest → signed-out only · public → anyone
 */
export type RouteAccess = "protected" | "guest" | "public";

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
  "edit-patient": {
    component: AddPatient,
    title: "Edit Patient",
    access: "protected",
    requiredPermission: PERMISSIONS.PATIENT_READ,
  },
  "view-patient": {
    component: ViewPatient,
    title: "View Patient",
    access: "protected",
    requiredPermission: PERMISSIONS.PATIENT_READ,
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
  appointments: {
    component: AppointmentScheduling,
    title: "Appointments",
    access: "protected",
    requiredPermission: PERMISSIONS.APPOINTMENT_READ,
  },
  encounters: {
    component: Encounters,
    title: "Encounters",
    access: "protected",
    requiredPermission: PERMISSIONS.ENCOUNTER_READ,
  },
  "new-encounter": {
    component: NewEncounter,
    title: "New Encounter",
    access: "protected",
    requiredPermission: PERMISSIONS.ENCOUNTER_READ,
  },
  "view-encounter": {
    component: ViewEncounters,
    title: "View Encounter",
    access: "protected",
    requiredPermission: PERMISSIONS.ENCOUNTER_READ,
  },
  prescriptions: {
    component: Prescriptions,
    title: "Prescriptions",
    access: "protected",
    requiredPermission: PERMISSIONS.PRESCRIPTION_READ,
  },
  "add-prescription": {
    component: Addprescription,
    title: "Add Prescription",
    access: "protected",
    requiredPermission: PERMISSIONS.PRESCRIPTION_READ,
  },
  "edit-prescription": {
    component: Addprescription,
    title: "Edit Prescription",
    access: "protected",
    requiredPermission: PERMISSIONS.PRESCRIPTION_READ,
  },
  "view-prescription": {
    component: ViewPrescriptions,
    title: "View Prescription",
    access: "protected",
    requiredPermission: PERMISSIONS.PRESCRIPTION_READ,
  },
};
