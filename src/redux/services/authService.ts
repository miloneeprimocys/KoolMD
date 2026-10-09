import type {
  CurrentUser,
  LoginCredentials,
  LoginResponse,
  MessageResponse,
  RegisterAccountPayload,
  ResetPasswordPayload,
  VerifyEmailPayload,
} from "@/types/auth";
import { apiRequest } from "./apiClient";

/** Patients self-register via /auth; providers via /practitioners (applicant role). */
const REGISTER_ENDPOINT_BY_ACCOUNT_TYPE: Record<RegisterAccountPayload["accountType"], string> = {
  patient: "/auth/register",
  provider: "/practitioners/register",
};

export const authService = {
  login(credentials: LoginCredentials) {
    return apiRequest<LoginResponse>("/auth/login", { method: "POST", body: credentials });
  },

  registerAccount({ accountType, ...registrationDetails }: RegisterAccountPayload) {
    return apiRequest<MessageResponse>(REGISTER_ENDPOINT_BY_ACCOUNT_TYPE[accountType], {
      method: "POST",
      body: registrationDetails,
    });
  },

  verifyEmail(payload: VerifyEmailPayload) {
    return apiRequest<MessageResponse>("/auth/verify-email", { method: "POST", body: payload });
  },

  resendVerificationEmail(email: string) {
    return apiRequest<MessageResponse>("/auth/resend-verification", {
      method: "POST",
      body: { email },
    });
  },

  requestPasswordReset(email: string) {
    return apiRequest<MessageResponse>("/auth/forgot-password", {
      method: "POST",
      body: { email },
    });
  },

  resetPassword(payload: ResetPasswordPayload) {
    return apiRequest<MessageResponse>("/auth/reset-password", {
      method: "POST",
      body: payload,
    });
  },

  getCurrentUser() {
    return apiRequest<CurrentUser>("/auth/me", { isAuthenticated: true });
  },

  logout() {
    return apiRequest<void>("/auth/logout", { method: "POST", isAuthenticated: true });
  },
};
