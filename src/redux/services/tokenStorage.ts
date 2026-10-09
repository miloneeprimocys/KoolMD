import type { AuthTokens } from "@/types/auth";

const REFRESH_TOKEN_STORAGE_KEY = "koolmd.refreshToken";

/**
 * Access token lives only in memory (never persisted, never in Redux) so it can't
 * leak through storage or Redux DevTools. The refresh token is persisted so a page
 * reload can restore the session.
 */
let accessTokenInMemory: string | null = null;

export const tokenStorage = {
  getAccessToken(): string | null {
    return accessTokenInMemory;
  },

  getRefreshToken(): string | null {
    try {
      return window.localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
    } catch {
      return null;
    }
  },

  saveTokens(tokens: Pick<AuthTokens, "accessToken" | "refreshToken">): void {
    accessTokenInMemory = tokens.accessToken;
    try {
      window.localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, tokens.refreshToken);
    } catch {
      // Storage unavailable (private mode) — session simply won't survive a reload.
    }
  },

  clearTokens(): void {
    accessTokenInMemory = null;
    try {
      window.localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
    } catch {
      // ignore
    }
  },
};
