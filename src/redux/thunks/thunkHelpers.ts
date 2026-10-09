import { ApiError } from "@/redux/services/apiClient";

/** Serializable error stored in Redux (class instances are not). */
export interface RequestError {
  message: string;
  errorCode: string;
  status: number;
  /** First backend validation message per field, e.g. `{ phoneNumber: "..." }` */
  fieldErrors?: Record<string, string>;
}

export function toRequestError(error: unknown): RequestError {
  if (error instanceof ApiError) {
    const fieldErrors: Record<string, string> = {};
    for (const detail of error.details) {
      if (detail.field && !fieldErrors[detail.field]) fieldErrors[detail.field] = detail.message;
    }
    return { message: error.message, errorCode: error.errorCode, status: error.status, fieldErrors };
  }
  return { message: "Something went wrong. Please try again.", errorCode: "UNKNOWN_ERROR", status: 0 };
}

/** Results younger than this are reused instead of re-fetched (e.g. when re-opening a page). */
export const CACHE_TTL_MILLISECONDS = 30_000;

export const isFresh = (fetchedAt: number | null) =>
  fetchedAt !== null && Date.now() - fetchedAt < CACHE_TTL_MILLISECONDS;

/** Stable key for a list query — same filters ⇒ same key ⇒ no duplicate request. */
export const toQueryKey = (query: object) => JSON.stringify(query);
