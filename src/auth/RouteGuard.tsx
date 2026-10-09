"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/hooks/useAppHooks";
import { selectSessionStatus } from "@/redux/selectors/authSelectors";
import type { SessionStatus } from "@/redux/slices/authSlice";
import type { RouteAccess } from "@/app/routes";

export const LOGIN_PATH = "/auth/login";
export const HOME_PATH = "/dashboard";

function getRedirectPath(access: RouteAccess, sessionStatus: SessionStatus): string | null {
  if (access === "protected" && sessionStatus === "unauthenticated") return LOGIN_PATH;
  if (access === "guest" && sessionStatus === "authenticated") return HOME_PATH;
  return null;
}

const FullScreenLoader = () => (
  <div className="flex min-h-screen w-full items-center justify-center bg-page" role="status">
    <span className="h-8 w-8 animate-spin rounded-full border-[3px] border-primary/25 border-t-primary" />
    <span className="sr-only">Loading…</span>
  </div>
);

interface RouteGuardProps {
  access: RouteAccess;
  children: ReactNode;
}

/**
 * protected → signed-in users only · guest → signed-out users only (login, register…)
 * public    → everyone (email-verification / reset links must open in any state)
 */
const RouteGuard = ({ access, children }: RouteGuardProps) => {
  const router = useRouter();
  const sessionStatus = useAppSelector(selectSessionStatus);
  const redirectPath = getRedirectPath(access, sessionStatus);
  const isSessionResolving = sessionStatus === "idle" || sessionStatus === "restoring";

  useEffect(() => {
    if (redirectPath) router.replace(redirectPath);
  }, [redirectPath, router]);

  if (access === "public") return children;
  if (isSessionResolving || redirectPath) return <FullScreenLoader />;
  return children;
};

export default RouteGuard;
