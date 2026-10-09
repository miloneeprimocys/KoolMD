/** Mirrors backend rules (PASSWORD_MIN_LENGTH / PASSWORD_MAX_LENGTH in password.service.ts). */
export const PASSWORD_MIN_LENGTH = 12;
export const PASSWORD_MAX_LENGTH = 128;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PERSONAL_TERM_LENGTH = 4;

export function validateEmail(email: string): string | undefined {
  if (!email.trim()) return "Please enter your email address.";
  if (!EMAIL_PATTERN.test(email.trim())) return "Please enter a valid email address.";
  return undefined;
}

export function validateRequiredText(value: string, fieldLabel: string): string | undefined {
  return value.trim() ? undefined : `Please enter your ${fieldLabel}.`;
}

interface PasswordOwnerDetails {
  email?: string;
  firstName?: string;
  lastName?: string;
}

/** Strength rules for a NEW password (sign-up / reset). Login only checks presence. */
export function validateNewPassword(
  password: string,
  ownerDetails: PasswordOwnerDetails = {},
): string | undefined {
  if (!password) return "Please create a password.";
  if (password.length < PASSWORD_MIN_LENGTH)
    return `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`;
  if (password.length > PASSWORD_MAX_LENGTH)
    return `Password must be at most ${PASSWORD_MAX_LENGTH} characters.`;

  const normalizedPassword = password.toLowerCase();
  const personalTerms = [
    ownerDetails.email?.split("@")[0],
    ownerDetails.firstName,
    ownerDetails.lastName,
  ]
    .map((term) => term?.trim().toLowerCase() ?? "")
    .filter((term) => term.length >= MIN_PERSONAL_TERM_LENGTH);
  if (personalTerms.some((term) => normalizedPassword.includes(term)))
    return "Password must not contain your name or email.";

  return undefined;
}

/** Drops `undefined` entries so `Object.keys(errors).length` means "has errors". */
export function compactErrors<TField extends string>(
  errors: Partial<Record<TField, string | undefined>>,
): Partial<Record<TField, string>> {
  return Object.fromEntries(
    Object.entries(errors).filter(([, message]) => Boolean(message)),
  ) as Partial<Record<TField, string>>;
}
