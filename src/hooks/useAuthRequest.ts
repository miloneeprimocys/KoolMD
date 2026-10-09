import { useCallback, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppHooks";
import { selectAuthRequest } from "@/redux/selectors/authSelectors";
import { resetAuthRequest, type AuthRequestKey } from "@/redux/slices/authSlice";

/**
 * Subscribes to one auth request's lifecycle and clears it when the screen unmounts,
 * so a stale error / success never shows up the next time the screen opens.
 */
export function useAuthRequest(requestKey: AuthRequestKey) {
  const dispatch = useAppDispatch();
  const requestState = useAppSelector(selectAuthRequest(requestKey));

  const clearRequest = useCallback(() => {
    dispatch(resetAuthRequest(requestKey));
  }, [dispatch, requestKey]);

  useEffect(() => clearRequest, [clearRequest]);

  return {
    ...requestState,
    isPending: requestState.status === "pending",
    isSucceeded: requestState.status === "succeeded",
    isFailed: requestState.status === "failed",
    fieldErrors: requestState.error?.fieldErrors ?? {},
    clearRequest,
  };
}
