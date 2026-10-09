import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { CurrentUser } from "@/types/auth";
import {
  loginUser,
  logoutUser,
  registerAccount,
  requestPasswordReset,
  resendVerificationEmail,
  resetPassword,
  restoreSession,
  verifyEmail,
  type AuthRequestError,
} from "@/redux/thunks/authThunks";

/* ---------------------------------------------------------------- */
/*  State shape                                                     */
/* ---------------------------------------------------------------- */
/**
 * idle         → app just loaded, nothing checked yet
 * restoring    → trying the stored refresh token
 * authenticated / unauthenticated → resolved
 */
export type SessionStatus = "idle" | "restoring" | "authenticated" | "unauthenticated";

export type RequestStatus = "idle" | "pending" | "succeeded" | "failed";

export type AuthRequestKey =
  | "login"
  | "logout"
  | "register"
  | "verifyEmail"
  | "resendVerification"
  | "forgotPassword"
  | "resetPassword";

export interface AuthRequestState {
  status: RequestStatus;
  successMessage: string | null;
  error: AuthRequestError | null;
}

export interface AuthState {
  sessionStatus: SessionStatus;
  currentUser: CurrentUser | null;
  /** Email waiting for verification — carried from sign-up / blocked login to the verify screen. */
  pendingVerificationEmail: string | null;
  requests: Record<AuthRequestKey, AuthRequestState>;
}

const idleRequestState: AuthRequestState = {
  status: "idle",
  successMessage: null,
  error: null,
};

const initialState: AuthState = {
  sessionStatus: "idle",
  currentUser: null,
  pendingVerificationEmail: null,
  requests: {
    login: idleRequestState,
    logout: idleRequestState,
    register: idleRequestState,
    verifyEmail: idleRequestState,
    resendVerification: idleRequestState,
    forgotPassword: idleRequestState,
    resetPassword: idleRequestState,
  },
};

/* ---------------------------------------------------------------- */
/*  Helpers                                                         */
/* ---------------------------------------------------------------- */
function markRequestSucceeded(
  state: AuthState,
  requestKey: AuthRequestKey,
  successMessage: string | null = null,
) {
  state.requests[requestKey] = { status: "succeeded", successMessage, error: null };
}

function signOutLocally(state: AuthState) {
  state.sessionStatus = "unauthenticated";
  state.currentUser = null;
}

/** Thunks whose pending / rejected lifecycle is tracked generically under `requests`. */
const TRACKED_REQUEST_THUNKS = [
  [loginUser, "login"],
  [logoutUser, "logout"],
  [registerAccount, "register"],
  [verifyEmail, "verifyEmail"],
  [resendVerificationEmail, "resendVerification"],
  [requestPasswordReset, "forgotPassword"],
  [resetPassword, "resetPassword"],
] as const;

/* ---------------------------------------------------------------- */
/*  Slice                                                           */
/* ---------------------------------------------------------------- */
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    /** Fired by the API client when refresh fails mid-session. */
    sessionExpired(state) {
      signOutLocally(state);
    },
    resetAuthRequest(state, action: PayloadAction<AuthRequestKey>) {
      state.requests[action.payload] = idleRequestState;
    },
    setPendingVerificationEmail(state, action: PayloadAction<string | null>) {
      state.pendingVerificationEmail = action.payload;
    },
  },
  extraReducers: (builder) => {
    for (const [requestThunk, requestKey] of TRACKED_REQUEST_THUNKS) {
      builder
        .addCase(requestThunk.pending, (state) => {
          state.requests[requestKey] = { ...idleRequestState, status: "pending" };
        })
        .addCase(requestThunk.rejected, (state, action) => {
          state.requests[requestKey] = {
            status: "failed",
            successMessage: null,
            error: action.payload ?? {
              message: action.error.message ?? "Something went wrong. Please try again.",
              errorCode: "UNKNOWN_ERROR",
              status: 0,
              fieldErrors: {},
            },
          };
        });
    }

    builder
      /* ---------- Session restore ---------- */
      .addCase(restoreSession.pending, (state) => {
        state.sessionStatus = "restoring";
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.currentUser = action.payload;
        state.sessionStatus = action.payload ? "authenticated" : "unauthenticated";
      })
      .addCase(restoreSession.rejected, signOutLocally)

      /* ---------- Login / logout ---------- */
      .addCase(loginUser.fulfilled, (state, action) => {
        markRequestSucceeded(state, "login");
        state.currentUser = action.payload;
        state.sessionStatus = "authenticated";
        state.pendingVerificationEmail = null;
      })
      .addCase(logoutUser.fulfilled, () => ({
        ...initialState,
        sessionStatus: "unauthenticated" as const,
      }))

      /* ---------- Registration & verification ---------- */
      .addCase(registerAccount.fulfilled, (state, action) => {
        markRequestSucceeded(state, "register", action.payload);
        state.pendingVerificationEmail = action.meta.arg.email;
      })
      .addCase(verifyEmail.fulfilled, (state, action) => {
        markRequestSucceeded(state, "verifyEmail", action.payload);
        state.pendingVerificationEmail = null;
      })
      .addCase(resendVerificationEmail.fulfilled, (state, action) => {
        markRequestSucceeded(state, "resendVerification", action.payload);
      })

      /* ---------- Password recovery ---------- */
      .addCase(requestPasswordReset.fulfilled, (state, action) => {
        markRequestSucceeded(state, "forgotPassword", action.payload);
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        markRequestSucceeded(state, "resetPassword", action.payload);
      });
  },
});

export const { sessionExpired, resetAuthRequest, setPendingVerificationEmail } =
  authSlice.actions;

export default authSlice.reducer;
