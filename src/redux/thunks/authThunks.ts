import { createAsyncThunk } from "@reduxjs/toolkit";
import type {
  CurrentUser,
  LoginCredentials,
  RegisterAccountPayload,
  ResetPasswordPayload,
  VerifyEmailPayload,
} from "@/types/auth";
import { ApiError, refreshAccessToken } from "@/redux/services/apiClient";
import { authService } from "@/redux/services/authService";
import { tokenStorage } from "@/redux/services/tokenStorage";
import type { AuthRequestKey, AuthState } from "@/redux/slices/authSlice";

/* ---------------------------------------------------------------- */
/*  Shared thunk plumbing                                           */
/* ---------------------------------------------------------------- */
export interface AuthRequestError {
  message: string;
  errorCode: string;
  status: number;
  /** First backend validation message per field, e.g. `{ password: "Password is too common." }` */
  fieldErrors: Record<string, string>;
}

interface AuthThunkConfig {
  state: { auth: AuthState };
  rejectValue: AuthRequestError;
}

function toAuthRequestError(error: unknown): AuthRequestError {
  if (!(error instanceof ApiError)) {
    return {
      message: "Something went wrong. Please try again.",
      errorCode: "UNKNOWN_ERROR",
      status: 0,
      fieldErrors: {},
    };
  }

  const fieldErrors: Record<string, string> = {};
  for (const detail of error.details) {
    if (detail.field && !fieldErrors[detail.field]) fieldErrors[detail.field] = detail.message;
  }
  return {
    message: error.message,
    errorCode: error.errorCode,
    status: error.status,
    fieldErrors,
  };
}

/** Skips the dispatch while the same request is already in flight (double-click, StrictMode). */
const unlessRequestPending =
  (requestKey: AuthRequestKey) =>
  (_argument: unknown, { getState }: { getState: () => { auth: AuthState } }) =>
    getState().auth.requests[requestKey].status !== "pending";

/* ---------------------------------------------------------------- */
/*  Session                                                         */
/* ---------------------------------------------------------------- */

/** Runs once on app start: refresh token → new access token → current user. */
export const restoreSession = createAsyncThunk<CurrentUser | null, void, AuthThunkConfig>(
  "auth/restoreSession",
  async (_, { rejectWithValue }) => {
    if (!tokenStorage.getRefreshToken()) return null;
    try {
      await refreshAccessToken();
      return await authService.getCurrentUser();
    } catch (error) {
      return rejectWithValue(toAuthRequestError(error));
    }
  },
  { condition: (_, { getState }) => getState().auth.sessionStatus === "idle" },
);

export const loginUser = createAsyncThunk<CurrentUser, LoginCredentials, AuthThunkConfig>(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const loginResponse = await authService.login(credentials);
      tokenStorage.saveTokens(loginResponse);
      return loginResponse.user;
    } catch (error) {
      return rejectWithValue(toAuthRequestError(error));
    }
  },
  { condition: unlessRequestPending("login") },
);

/** Always signs out locally, even if the API call fails (token already invalid, offline…). */
export const logoutUser = createAsyncThunk<void, void, AuthThunkConfig>(
  "auth/logout",
  async () => {
    try {
      await authService.logout();
    } catch {
      // Best effort — local sign-out below is what matters to the user.
    } finally {
      tokenStorage.clearTokens();
    }
  },
  { condition: unlessRequestPending("logout") },
);

/* ---------------------------------------------------------------- */
/*  Registration & email verification                               */
/* ---------------------------------------------------------------- */
export const registerAccount = createAsyncThunk<string, RegisterAccountPayload, AuthThunkConfig>(
  "auth/register",
  async (registrationPayload, { rejectWithValue }) => {
    try {
      const { message } = await authService.registerAccount(registrationPayload);
      return message;
    } catch (error) {
      return rejectWithValue(toAuthRequestError(error));
    }
  },
  { condition: unlessRequestPending("register") },
);

export const verifyEmail = createAsyncThunk<string, VerifyEmailPayload, AuthThunkConfig>(
  "auth/verifyEmail",
  async (verifyEmailPayload, { rejectWithValue }) => {
    try {
      const { message } = await authService.verifyEmail(verifyEmailPayload);
      return message;
    } catch (error) {
      return rejectWithValue(toAuthRequestError(error));
    }
  },
  { condition: unlessRequestPending("verifyEmail") },
);

export const resendVerificationEmail = createAsyncThunk<string, string, AuthThunkConfig>(
  "auth/resendVerificationEmail",
  async (email, { rejectWithValue }) => {
    try {
      const { message } = await authService.resendVerificationEmail(email);
      return message;
    } catch (error) {
      return rejectWithValue(toAuthRequestError(error));
    }
  },
  { condition: unlessRequestPending("resendVerification") },
);

/* ---------------------------------------------------------------- */
/*  Password recovery                                               */
/* ---------------------------------------------------------------- */
export const requestPasswordReset = createAsyncThunk<string, string, AuthThunkConfig>(
  "auth/requestPasswordReset",
  async (email, { rejectWithValue }) => {
    try {
      const { message } = await authService.requestPasswordReset(email);
      return message;
    } catch (error) {
      return rejectWithValue(toAuthRequestError(error));
    }
  },
  { condition: unlessRequestPending("forgotPassword") },
);

export const resetPassword = createAsyncThunk<string, ResetPasswordPayload, AuthThunkConfig>(
  "auth/resetPassword",
  async (resetPasswordPayload, { rejectWithValue }) => {
    try {
      const { message } = await authService.resetPassword(resetPasswordPayload);
      return message;
    } catch (error) {
      return rejectWithValue(toAuthRequestError(error));
    }
  },
  { condition: unlessRequestPending("resetPassword") },
);
