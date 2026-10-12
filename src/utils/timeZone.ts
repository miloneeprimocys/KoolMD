/** Minutes the given IANA time zone is ahead of UTC at `instant` (DST-aware). */
function getTimeZoneOffsetMinutes(timeZone: string, instant: Date): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(instant);
  const valueOf = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value);
  const wallClockAsUtc = Date.UTC(
    valueOf("year"),
    valueOf("month") - 1,
    valueOf("day"),
    valueOf("hour"),
    valueOf("minute"),
    valueOf("second"),
  );
  return Math.round((wallClockAsUtc - instant.getTime()) / 60_000);
}

/** Midnight at the start of `dateOnly` ("YYYY-MM-DD") in `timeZone`, as a UTC ISO string. */
export function startOfDayInTimeZoneIso(dateOnly: string, timeZone: string): string {
  const [year, month, day] = dateOnly.split("-").map(Number);
  const midnightAsUtc = Date.UTC(year, month - 1, day);
  const offsetMinutes = getTimeZoneOffsetMinutes(timeZone, new Date(midnightAsUtc));
  return new Date(midnightAsUtc - offsetMinutes * 60_000).toISOString();
}

/** "YYYY-MM-DD" of the day after `dateOnly`. */
export function addOneDay(dateOnly: string): string {
  const [year, month, day] = dateOnly.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day + 1)).toISOString().slice(0, 10);
}

/** Today's date in the browser's local time zone, "YYYY-MM-DD". */
export function todayDateOnly(): string {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}
