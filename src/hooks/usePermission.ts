import { hasPermission, type PermissionCode } from "@/auth/permissions";
import { selectCurrentUser } from "@/redux/selectors/authSelectors";
import { useAppSelector } from "./useAppHooks";

/**
 * Whether the signed-in user holds `permission` — for showing or hiding actions.
 * The API enforces the same rule, so this only keeps the UI from offering what would be refused.
 */
export function usePermission(permission: PermissionCode): boolean {
  const currentUser = useAppSelector(selectCurrentUser);
  return hasPermission(currentUser, permission);
}
