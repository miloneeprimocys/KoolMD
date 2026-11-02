const DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

const NUMBER_FORMATTER = new Intl.NumberFormat("en-US");

/** "1990-01-15" → "Jan 15, 1990". Date-only values are formatted in UTC so they never shift a day. */
export function formatDateOnly(dateOnly: string): string {
  const parsedDate = new Date(`${dateOnly}T00:00:00Z`);
  return Number.isNaN(parsedDate.getTime()) ? dateOnly : DATE_FORMATTER.format(parsedDate);
}

/** Whole years between a "YYYY-MM-DD" birth date and today. */
export function calculateAgeInYears(dateOfBirth: string, today = new Date()): number {
  const [birthYear, birthMonth, birthDay] = dateOfBirth.split("-").map(Number);
  let age = today.getFullYear() - birthYear;
  const hasHadBirthdayThisYear =
    today.getMonth() + 1 > birthMonth ||
    (today.getMonth() + 1 === birthMonth && today.getDate() >= birthDay);
  if (!hasHadBirthdayThisYear) age -= 1;
  return age;
}

export function formatCount(value: number): string {
  return NUMBER_FORMATTER.format(value);
}

/** "PENDING_REVIEW" → "Pending Review" */
export function humanizeEnum(value: string): string {
  return value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

const DATE_TIME_OPTIONS: Intl.DateTimeFormatOptions = {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
};

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat("en-US", DATE_TIME_OPTIONS);

/** ISO timestamp → "Oct 6, 2026, 10:30 AM" in the viewer's time zone (or `timeZone` when given). */
export function formatDateTime(isoTimestamp: string, timeZone?: string): string {
  const parsedDate = new Date(isoTimestamp);
  if (Number.isNaN(parsedDate.getTime())) return isoTimestamp;
  const formatter = timeZone
    ? new Intl.DateTimeFormat("en-US", { ...DATE_TIME_OPTIONS, timeZone })
    : DATE_TIME_FORMATTER;
  return formatter.format(parsedDate);
}

const LANGUAGE_NAMES = new Intl.DisplayNames(["en"], { type: "language" });

/** BCP 47 tag → "English"; falls back to the tag itself. */
export function formatLanguage(languageTag: string): string {
  try {
    return LANGUAGE_NAMES.of(languageTag) ?? languageTag;
  } catch {
    return languageTag;
  }
}
