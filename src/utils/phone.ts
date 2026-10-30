import { parsePhoneNumberFromString, type CountryCode } from "libphonenumber-js";

/** National number + ISO country (form fields) → E.164 for the API; "" when it does not parse. */
export function toE164(nationalNumber: string, countryIso: string): string {
  if (!nationalNumber.trim()) return "";
  return parsePhoneNumberFromString(nationalNumber, countryIso as CountryCode)?.number ?? "";
}

/**
 * E.164 from the API → the form's country + national number, so "+919876543210" opens as
 * India / 98765 43210 instead of being treated as a US number.
 */
export function fromE164(
  e164: string | null | undefined,
  fallbackCountryIso: string,
): { countryIso: string; nationalNumber: string } {
  const parsed = e164 ? parsePhoneNumberFromString(e164) : undefined;
  if (!parsed) return { countryIso: fallbackCountryIso, nationalNumber: e164 ?? "" };
  return {
    countryIso: parsed.country ?? fallbackCountryIso,
    nationalNumber: parsed.formatNational(),
  };
}
