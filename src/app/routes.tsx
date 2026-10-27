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
import BookNewAppointment from "@/appointments/Booknewappointment";
import Encounters from "@/encounters/Encounters";
import NewEncounter from "@/encounters/newencounters/Newencounter";
import ViewEncounters from "@/encounters/viewencounters/Viewencounters";
import Prescriptions from "@/prescriptions/Prescriptions";
import Addprescription from "@/prescriptions/addprescription/Addprescription";
import ViewPrescriptions from "@/prescriptions/viewprescription/Viewprescriptions";
import LabResults from "@/labresults/Labresults";
import NewLabOrder from "@/labresults/newlaborder/Newlaborder";
import Billing from "@/billing/payment/payment-gateway/Billing";
import ClearinghouseAccounts from "@/billing/clearinghouse/clearingaccount/ClearinghouseAccounts";
import AddClearinghouseAccount from "@/billing/clearinghouse/clearingaccount/AddClearinghouseAccount";
import EditClearinghouseAccount from "@/billing/clearinghouse/clearingaccount/EditClearinghouseAccount";
import ViewClearinghouseAccount from "@/billing/clearinghouse/clearingaccount/viewaccount/Viewclearingaccounts";
import EditPayerId from "@/billing/clearinghouse/clearingaccount/viewaccount/Editpayerid";
import EligibilityVerification from "@/billing/clearinghouse/eligibility/EligibilityVerification";
import CheckEligibility from "@/billing/clearinghouse/eligibility/checkeligibility/CheckEligibility";
import Claims from "@/billing/clearinghouse/claims/Claims";
import SubmitClaim from "@/billing/clearinghouse/claims/Submitclaim";
import ViewClaims from "@/billing/clearinghouse/claims/Viewclaims";
import Invoice from "@/billing/manage/invoice/Invoice";
import CreateInvoice from "@/billing/manage/invoice/createinvoice/CreateInvoice";
import MembershipPlans from "@/billing/membership/membership-plans/Membershipplans";
import CreateMembershipPlan from "@/billing/membership/membership-plans/createplan/Createmembershipplan";
import MembershipHistory from "@/billing/membership/history/Membershiphistory";
import CancelMembership from "@/billing/membership/history/Cancelmembership";
import Payments from "@/billing/manage/payments/Payments";
import Refunds from "@/billing/manage/refunds/Refunds";
import CreateRefund from "@/billing/manage/refunds/CreateRefund";
import PaymentMethods from "@/billing/manage/payment-method/PaymentMethods";
import QuestionnairesPage from "@/Questionnaires/Questionnairespage";
import Administration from "@/administration/chatunlock/Administration";
import Integration from "@/settings/integration/Integration";
import ReferralManagement from "@/referral/referralmanagement/Referralmanagement";
import NewReferral from "@/referral/referralmanagement/newreferral/Newreferral";
import BasicImagingReferral from "@/referral/basicimaging/Basicimagingreferral";
import Efax from "@/referral/efax/Efax";
import NewEfax from "@/referral/efax/newefax/Newefax";
import ProviderMarketPlace, { ProviderMarketplaceProfilePage } from "@/referral/providermarketplace/Providermarketplace";
import EditQuestionnaire from "@/Questionnaires/Editquestionnaire";
import ViewResponse from "@/Questionnaires/response/Viewresponse";
import AddTemplate from "@/Questionnaires/template/Addtemplate";
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
  "book-appointment": {
    component: BookNewAppointment,
    title: "Book Appointment",
    access: "protected",
    requiredPermission: PERMISSIONS.APPOINTMENT_READ,
  },
  "edit-appointment": {
    component: BookNewAppointment,
    title: "Edit Appointment",
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
  "edit-encounter": {
    component: NewEncounter,
    title: "Edit Encounter",
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
  "lab-results": {
    component: LabResults,
    title: "Lab Results",
    access: "protected",
  },
  billing: {
    component: Billing,
    title: "Billing & Payments",
    access: "protected",
  },
  "billing/payment-gateway": {
    component: Billing,
    title: "Billing & Payments",
    access: "protected",
  },
  "billing/payment-gateway/supported-methods": {
    component: Billing,
    title: "Billing & Payments",
    access: "protected",
  },
  "billing/payment-gateway/transaction-history": {
    component: Billing,
    title: "Billing & Payments",
    access: "protected",
  },
  "billing/payment-gateway/refund-settings": {
    component: Billing,
    title: "Billing & Payments",
    access: "protected",
  },
  "payment/membership-plans": {
    component: MembershipPlans,
    title: "Billing & Payments",
    access: "protected",
  },
  "billing/membership-history": {
    component: MembershipHistory,
    title: "Billing & Payments",
    access: "protected",
  },
  "billing/membership-history/cancel": {
    component: CancelMembership,
    title: "Billing & Payments",
    access: "protected",
  },
  "payment/membership-plans/create": {
    component: CreateMembershipPlan,
    title: "Billing & Payments",
    access: "protected",
  },
  "payment/membership-plans/edit": {
    component: CreateMembershipPlan,
    title: "Billing & Payments",
    access: "protected",
  },
  "billing/invoice": {
    component: Invoice,
    title: "Billing & Payments",
    access: "protected",
  },
  "billing/invoice/create": {
    component: CreateInvoice,
    title: "Billing & Payments",
    access: "protected",
  },
  "billing/payments": {
    component: Payments,
    title: "Billing & Payments",
    access: "protected",
  },
  "billing/refunds": {
    component: Refunds,
    title: "Billing & Payments",
    access: "protected",
  },
  "billing/refunds/create": {
    component: CreateRefund,
    title: "Billing & Payments",
    access: "protected",
  },
  "billing/payment-methods": {
    component: PaymentMethods,
    title: "Billing & Payments",
    access: "protected",
  },
  "payment/payment-gateway": {
    component: Billing,
    title: "Billing & Payments",
    access: "protected",
  },
  "payment/payment-gateway/supported-methods": {
    component: Billing,
    title: "Billing & Payments",
    access: "protected",
  },
  "payment/payment-gateway/transaction-history": {
    component: Billing,
    title: "Billing & Payments",
    access: "protected",
  },
  "payment/payment-gateway/refund-settings": {
    component: Billing,
    title: "Billing & Payments",
    access: "protected",
  },
  "membership/plans": {
    component: MembershipPlans,
    title: "Billing & Payments",
    access: "protected",
  },
  "membership/plans/create": {
    component: CreateMembershipPlan,
    title: "Billing & Payments",
    access: "protected",
  },
  "membership/plans/edit": {
    component: CreateMembershipPlan,
    title: "Billing & Payments",
    access: "protected",
  },
  "membership/history": {
    component: MembershipHistory,
    title: "Billing & Payments",
    access: "protected",
  },
  "membership/history/cancel": {
    component: CancelMembership,
    title: "Billing & Payments",
    access: "protected",
  },
  "manage/invoice": {
    component: Invoice,
    title: "Billing & Payments",
    access: "protected",
  },
  "manage/invoice/create": {
    component: CreateInvoice,
    title: "Billing & Payments",
    access: "protected",
  },
  "manage/payments": {
    component: Payments,
    title: "Billing & Payments",
    access: "protected",
  },
  "manage/refunds": {
    component: Refunds,
    title: "Billing & Payments",
    access: "protected",
  },
  "manage/refunds/create": {
    component: CreateRefund,
    title: "Billing & Payments",
    access: "protected",
  },
  "manage/payment-methods": {
    component: PaymentMethods,
    title: "Billing & Payments",
    access: "protected",
  },
  "payers/accounts": {
    component: ClearinghouseAccounts,
    title: "Clearinghouse",
    access: "protected",
  },
  "payers/eligibility-verification": {
    component: EligibilityVerification,
    title: "Clearinghouse",
    access: "protected",
  },
  "payers/eligibility-verification/check": {
    component: CheckEligibility,
    title: "Clearinghouse",
    access: "protected",
  },
  "payers/claims": {
    component: Claims,
    title: "Claims",
    access: "protected",
  },
  "payers/claims/submit": {
    component: SubmitClaim,
    title: "Submit Claim",
    access: "protected",
  },
  "payers/claims/view": {
    component: ViewClaims,
    title: "View Claim",
    access: "protected",
  },
  "payers/add-accounts": {
    component: AddClearinghouseAccount,
    title: "Clearinghouse",
    access: "protected",
  },
  "payers/edit-accounts": {
    component: EditClearinghouseAccount,
    title: "Clearinghouse",
    access: "protected",
  },
  "payers/view-accounts": {
    component: ViewClearinghouseAccount,
    title: "Clearinghouse",
    access: "protected",
  },
  "payers/edit-payer-ids": {
    component: EditPayerId,
    title: "Clearinghouse",
    access: "protected",
  },
  "new-laborder": {
    component: NewLabOrder,
    title: "New Lab Order",
    access: "protected",
  },
  questionnaires: {
    component: QuestionnairesPage,
    title: "Questionnaires",
    access: "protected",
  },
  "settings/integration": {
    component: Integration,
    title: "Integrations",
    access: "protected",
  },
  "referral/management": {
    component: ReferralManagement,
    title: "Referrals",
    access: "protected",
  },
  efax: {
    component: Efax,
    title: "eFax",
    access: "protected",
  },
  "referral/efax": {
    component: Efax,
    title: "eFax",
    access: "protected",
  },
  "new-efax": {
    component: NewEfax,
    title: "New Fax",
    access: "protected",
  },
  "referral/efax/new-efax": {
    component: NewEfax,
    title: "New Fax",
    access: "protected",
  },
  "referral/management/new-referral": {
    component: NewReferral,
    title: "New Referral",
    access: "protected",
  },
  "referral/basic-imaging": {
    component: BasicImagingReferral,
    title: "Basic Imaging Referral",
    access: "protected",
  },
  "referral/provider-marketplace": {
    component: ProviderMarketPlace,
    title: "Provider Marketplace",
    access: "protected",
  },
  "referral/provider-marketplace/viewprofile": {
    component: ProviderMarketplaceProfilePage,
    title: "Provider Profile",
    access: "protected",
  },
  "administration/chatunlock": {
    component: Administration,
    title: "Administration",
    access: "protected",
  },
  "edit-questionnaire": {
    component: EditQuestionnaire,
    title: "Edit Questionnaire",
    access: "protected",
  },
  "view-response": {
    component: ViewResponse,
    title: "View Response",
    access: "protected",
  },
  "edit-response": {
    component: ViewResponse,
    title: "Edit Response",
    access: "protected",
  },
  "add-template": {
    component: AddTemplate,
    title: "Add Template",
    access: "protected",
  },
};
