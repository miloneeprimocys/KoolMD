import type { CurrentUser } from "@/types/auth";

/**
 * Permission codes mirrored from the backend (`src/modules/rbac/permission-catalog.ts`).
 * UI access follows permissions, not role names, so it always matches what the API allows
 * (SUPER_ADMIN holds every permission; PATIENT holds none).
 */
export const PERMISSIONS = {
  PATIENT_READ: "patient:read",
  PATIENT_CREATE: "patient:create",
  PRACTITIONER_READ: "practitioner:read",
  PRACTITIONER_MANAGE: "practitioner:manage",
  APPOINTMENT_READ: "appointment:read",
  ENCOUNTER_READ: "encounter:read",
  PRESCRIPTION_READ: "prescription:read",
  STAFF_READ: "staff:read",
} as const;

export type PermissionCode = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

/** `undefined` requirement = open to every signed-in user. */
export function hasPermission(
  user: Pick<CurrentUser, "permissionCodes"> | null,
  requiredPermission: PermissionCode | undefined,
): boolean {
  if (!requiredPermission) return true;
  return user?.permissionCodes.includes(requiredPermission) ?? false;
}
