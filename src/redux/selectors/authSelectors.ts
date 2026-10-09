import type { RootState } from "@/redux/store";
import type { AuthRequestKey } from "@/redux/slices/authSlice";

export const selectSessionStatus = (state: RootState) => state.auth.sessionStatus;

export const selectCurrentUser = (state: RootState) => state.auth.currentUser;

export const selectIsAuthenticated = (state: RootState) =>
  state.auth.sessionStatus === "authenticated";

export const selectPendingVerificationEmail = (state: RootState) =>
  state.auth.pendingVerificationEmail;

/** Returns the stored object itself, so components re-render only when that request changes. */
export const selectAuthRequest = (requestKey: AuthRequestKey) => (state: RootState) =>
  state.auth.requests[requestKey];
