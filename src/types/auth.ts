/**
 * Auth contracts mirrored from the KOOLMD ERP backend (`src/modules/auth/dto`).
 * Keep these in sync with the backend DTOs.
 */

export type UserStatus =
  | "PENDING_VERIFICATION"
  | "ACTIVE"
  | "SUSPENDED"
  | "DEACTIVATED";

export type SystemRoleCode =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "PRACTITIONER"
  | "PRACTITIONER_APPLICANT"
  | "RECEPTIONIST"
  | "STAFF"
  | "PATIENT";

export interface CurrentUser {
  id: string;
  email: string;
  phoneNumber: string | null;
  firstName: string;
  lastName: string;
  status: UserStatus;
  roleCodes: string[];
  permissionCodes: string[];
}

export interface AuthTokens {
  accessToken: string;
  tokenType: "Bearer";
  /** Access token lifetime in seconds */
  accessTokenExpiresIn: number;
  /** Single-use; rotated on every refresh */
  refreshToken: string;
  /** ISO date — absolute session expiry */
  refreshTokenExpiresAt: string;
}

export interface LoginResponse extends AuthTokens {
  user: CurrentUser;
}

export interface MessageResponse {
  message: string;
}

/* ---------------------------------------------------------------- */
/*  Request payloads                                                */
/* ---------------------------------------------------------------- */
export interface LoginCredentials {
  email: string;
  password: string;
}

/** Public sign-up is allowed only for patients and providers (admins are invited). */
export type SignupAccountType = "patient" | "provider";

export interface RegisterAccountPayload {
  accountType: SignupAccountType;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface VerifyEmailPayload {
  email: string;
  /** 6-digit code from the verification email */
  code: string;
}

export interface ResetPasswordPayload {
  token: string;
  newPassword: string;
}
