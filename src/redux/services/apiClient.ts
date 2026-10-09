import type { AuthTokens } from "@/types/auth";
import { tokenStorage } from "./tokenStorage";

/** Same-origin path; the rewrite in `next.config.ts` proxies it to the backend (no CORS). */
const API_BASE_URL = "/api/v1";

const NETWORK_ERROR_CODE = "NETWORK_ERROR";
const NETWORK_ERROR_MESSAGE =
  "Unable to reach the server. Check your connection and try again.";
const UNKNOWN_ERROR_MESSAGE = "Something went wrong. Please try again.";

/** 401 codes that mean "access token is stale" — worth one refresh + retry. */
const REFRESHABLE_ERROR_CODES = new Set(["INVALID_ACCESS_TOKEN", "UNAUTHENTICATED"]);

/* ---------------------------------------------------------------- */
/*  Types                                                           */
/* ---------------------------------------------------------------- */
type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface ApiErrorDetail {
  field?: string;
  message: string;
}

interface ApiSuccessEnvelope<TData> {
  success: true;
  data: TData;
}

interface ApiErrorEnvelope {
  success: false;
  message: string;
  errorCode: string;
  details?: ApiErrorDetail[];
  requestId?: string;
}

export interface ApiRequestOptions {
  method?: HttpMethod;
  body?: unknown;
  /** Attach the bearer token and transparently refresh it on 401. */
  isAuthenticated?: boolean;
  signal?: AbortSignal;
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly errorCode: string,
    readonly details: ApiErrorDetail[] = [],
    readonly requestId?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }

  get isNetworkError(): boolean {
    return this.errorCode === NETWORK_ERROR_CODE;
  }
}

/* ---------------------------------------------------------------- */
/*  Session-expired hook (wired to Redux in store.ts)               */
/* ---------------------------------------------------------------- */
let sessionExpiredHandler: (() => void) | null = null;

export function registerSessionExpiredHandler(handler: () => void): void {
  sessionExpiredHandler = handler;
}

/* ---------------------------------------------------------------- */
/*  Low-level helpers                                               */
/* ---------------------------------------------------------------- */
async function sendRequest(
  path: string,
  { method = "GET", body, isAuthenticated = false, signal }: ApiRequestOptions,
): Promise<Response> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";

  const accessToken = tokenStorage.getAccessToken();
  if (isAuthenticated && accessToken) headers.Authorization = `Bearer ${accessToken}`;

  try {
    return await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw new ApiError(NETWORK_ERROR_MESSAGE, 0, NETWORK_ERROR_CODE);
  }
}

async function readJsonSafely<T>(response: Response): Promise<T | null> {
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

function toApiError(status: number, errorEnvelope: ApiErrorEnvelope | null): ApiError {
  return new ApiError(
    errorEnvelope?.message ?? UNKNOWN_ERROR_MESSAGE,
    status,
    errorEnvelope?.errorCode ?? "UNKNOWN_ERROR",
    errorEnvelope?.details ?? [],
    errorEnvelope?.requestId,
  );
}

async function parseResponse<TData>(response: Response): Promise<TData> {
  if (response.status === 204) return undefined as TData;

  const payload = await readJsonSafely<ApiSuccessEnvelope<TData> | ApiErrorEnvelope>(response);
  if (response.ok && payload?.success) return payload.data;

  throw toApiError(response.status, payload?.success === false ? payload : null);
}

/* ---------------------------------------------------------------- */
/*  Token refresh — single flight                                   */
/* ---------------------------------------------------------------- */
async function requestTokenRotation(refreshToken: string): Promise<AuthTokens> {
  const response = await sendRequest("/auth/refresh", {
    method: "POST",
    body: { refreshToken },
  });
  return parseResponse<AuthTokens>(response);
}

async function performTokenRefresh(): Promise<void> {
  const refreshTokenUsed = tokenStorage.getRefreshToken();
  if (!refreshTokenUsed) {
    throw new ApiError("Your session has expired. Please sign in again.", 401, "SESSION_EXPIRED");
  }

  try {
    tokenStorage.saveTokens(await requestTokenRotation(refreshTokenUsed));
  } catch (error) {
    // Another tab rotated the token first — retry once with the newest one it stored.
    const latestRefreshToken = tokenStorage.getRefreshToken();
    const wasRotatedElsewhere =
      error instanceof ApiError &&
      error.errorCode === "REFRESH_TOKEN_ALREADY_ROTATED" &&
      latestRefreshToken !== null &&
      latestRefreshToken !== refreshTokenUsed;

    if (wasRotatedElsewhere) {
      tokenStorage.saveTokens(await requestTokenRotation(latestRefreshToken));
      return;
    }
    throw error;
  }
}

let refreshInFlight: Promise<void> | null = null;

/**
 * Concurrent 401s share one refresh call. Refresh tokens are single-use, so parallel
 * refreshes would invalidate each other.
 */
export function refreshAccessToken(): Promise<void> {
  refreshInFlight ??= performTokenRefresh()
    .catch((error: unknown) => {
      if (!(error instanceof ApiError && error.isNetworkError)) tokenStorage.clearTokens();
      throw error;
    })
    .finally(() => {
      refreshInFlight = null;
    });
  return refreshInFlight;
}

/* ---------------------------------------------------------------- */
/*  Public request function                                         */
/* ---------------------------------------------------------------- */
export async function apiRequest<TData>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<TData> {
  let response = await sendRequest(path, options);

  if (response.status === 401 && options.isAuthenticated) {
    const errorEnvelope = await readJsonSafely<ApiErrorEnvelope>(response.clone());

    if (errorEnvelope && REFRESHABLE_ERROR_CODES.has(errorEnvelope.errorCode)) {
      try {
        await refreshAccessToken();
        response = await sendRequest(path, options);
      } catch (refreshError) {
        if (refreshError instanceof ApiError && refreshError.isNetworkError) throw refreshError;
      }
    }

    if (response.status === 401) {
      tokenStorage.clearTokens();
      sessionExpiredHandler?.();
    }
  }

  return parseResponse<TData>(response);
}
