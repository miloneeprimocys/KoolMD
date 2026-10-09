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
