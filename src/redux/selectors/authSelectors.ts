import type { RootState } from "@/redux/store";
import type { AuthRequestKey } from "@/redux/slices/authSlice";

export const selectSessionStatus = (state: RootState) => state.auth.sessionStatus;

export const selectCurrentUser = (state: RootState) => state.auth.currentUser;

const NO_PERMISSIONS: string[] = [];

/** Stable array reference (same until the user changes) — safe to use as a memo dependency. */
export const selectPermissionCodes = (state: RootState) =>
  state.auth.currentUser?.permissionCodes ?? NO_PERMISSIONS;

export const selectIsAuthenticated = (state: RootState) =>
  state.auth.sessionStatus === "authenticated";

export const selectPendingVerificationEmail = (state: RootState) =>
  state.auth.pendingVerificationEmail;

/** Returns the stored object itself, so components re-render only when that request changes. */
export const selectAuthRequest = (requestKey: AuthRequestKey) => (state: RootState) =>
  state.auth.requests[requestKey];
