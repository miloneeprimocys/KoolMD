import type { CurrentUser } from "@/types/auth";

/**
 * Permission codes mirrored from the backend (`src/modules/rbac/permission-catalog.ts`).
 * UI access follows permissions, not role names, so it always matches what the API allows
 * (SUPER_ADMIN holds every permission; PATIENT holds none).
 */
export const PERMISSIONS = {
  PATIENT_READ: "patient:read",
  PATIENT_CREATE: "patient:create",
  /** Demographics, emergency contacts, insurance and documents. */
  PATIENT_UPDATE: "patient:update",
  PATIENT_MANAGE_STATUS: "patient:manage-status",
  ALLERGY_READ: "allergy:read",
  ALLERGY_UPDATE: "allergy:update",
  CONDITION_READ: "condition:read",
  CONDITION_WRITE: "condition:write",
  /** Surgical and family history, immunizations, lifestyle. */
  MEDICAL_HISTORY_READ: "medical-history:read",
  MEDICAL_HISTORY_WRITE: "medical-history:write",
  MEDICATION_READ: "medication:read",
  MEDICATION_WRITE: "medication:write",
  PRACTITIONER_READ: "practitioner:read",
  PRACTITIONER_MANAGE: "practitioner:manage",
  APPOINTMENT_READ: "appointment:read",
  ENCOUNTER_READ: "encounter:read",
  PRESCRIPTION_READ: "prescription:read",
  QUESTIONNAIRE_READ: "questionnaire:read",
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
