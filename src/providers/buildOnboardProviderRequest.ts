import { parsePhoneNumberFromString, type CountryCode } from "libphonenumber-js";
import type { OnboardProviderRequest, LicenseToAdd } from "@/redux/thunks/practitionerThunks";
import type {
  ClinicianType,
  CreateScheduleBlockPayload,
  PlannedSchedule,
} from "@/types/practitioner";
import { addOneDay, startOfDayInTimeZoneIso, todayDateOnly } from "@/utils/timeZone";
import type { AvailabilityValues } from "./Availability/Availability";
import { DAYS, type WeekSchedule } from "./Availability/Location";
import type { BasicValues } from "./Basicinformation";
import type { LicenseValues } from "./Licenses";
import type { PracticeValues } from "./Practiceinfo";

/** Form "Professional Type" → backend clinician type. */
const CLINICIAN_TYPE_BY_PROFESSIONAL_TYPE: Record<string, ClinicianType> = {
  MD: "PHYSICIAN",
  DO: "PHYSICIAN",
  NP: "NURSE_PRACTITIONER",
  PA: "PHYSICIAN_ASSISTANT",
  PSY: "PSYCHOLOGIST",
  RN: "OTHER",
};

/** Post-nominal credentials shown after the name. */
const CREDENTIALS_BY_PROFESSIONAL_TYPE: Record<string, string> = {
  MD: "MD",
  DO: "DO",
  NP: "NP",
  PA: "PA-C",
  PSY: "PhD",
  RN: "RN",
};

/** Titles that are prefixes, not credentials. */
const NAME_PREFIX_TITLES = new Set(["Dr.", "Prof."]);

/** Board certifications are their own license type; life-support courses are "OTHER". */
const BOARD_CERTIFICATION_TYPES = new Set(["ABMS Board Certification", "AOA Board Certification"]);

const toE164 = (phone: string, country: string) =>
  phone.trim()
    ? (parsePhoneNumberFromString(phone.trim(), country as CountryCode)?.number ?? undefined)
    : undefined;

/** Backend license numbers: uppercase letters, digits and dashes only. */
const normalizeLicenseNumber = (licenseNumber: string) =>
  licenseNumber.trim().toUpperCase().replace(/\s+/g, "");

const optionalText = (value: string) => value.trim() || undefined;

/** Backend slot intervals; other appointment durations fall back to 15-minute slots. */
const SLOT_INTERVAL_MINUTES = new Set([5, 10, 15, 20, 30, 60]);
const DEFAULT_SLOT_INTERVAL_MINUTES = 15;

const BLOCK_REASON_MAX_LENGTH = 500;

/** Complete shifts of every enabled day → one window each (ISO weekday 1 = Monday). */
function weekToWindows(week: WeekSchedule) {
  return DAYS.flatMap(({ key }, dayIndex) =>
    week[key].enabled
      ? week[key].shifts
          .filter((shift) => shift.start && shift.end)
          .map((shift) => ({
            dayKey: key,
            dayOfWeek: dayIndex + 1,
            startTime: shift.start,
            endTime: shift.end,
          }))
      : [],
  );
}

/**
 * Step 4 → weekly windows. In-person hours are per practice location; "same hours as in-person"
 * makes those windows BOTH, otherwise telemedicine gets its own location-less windows.
 */
export function planSchedules(
  availability: AvailabilityValues,
  offersTelemedicine: boolean,
): PlannedSchedule[] {
  const isTelemedicineOn = offersTelemedicine && availability.telemedicineEnabled;
  const durationMinutes = Number(availability.duration);
  const slotIntervalMinutes = SLOT_INTERVAL_MINUTES.has(durationMinutes)
    ? durationMinutes
    : DEFAULT_SLOT_INTERVAL_MINUTES;
  const effectiveFrom = todayDateOnly();
  const planned: PlannedSchedule[] = [];

  if (availability.inPersonEnabled) {
    const availabilityMode =
      isTelemedicineOn && availability.teleSameAsInPerson ? "BOTH" : "IN_PERSON";
    for (const location of availability.locations) {
      for (const window of weekToWindows(location.week)) {
        planned.push({
          sourceLabel: location.name,
          errorKey: `loc_${location.id}_${window.dayKey}`,
          payload: {
            dayOfWeek: window.dayOfWeek,
            startTime: window.startTime,
            endTime: window.endTime,
            availabilityMode,
            locationId: location.id,
            slotIntervalMinutes,
            effectiveFrom,
          },
        });
      }
    }
  }

  if (isTelemedicineOn && !availability.teleSameAsInPerson) {
    for (const window of weekToWindows(availability.teleSchedule)) {
      planned.push({
        sourceLabel: "Telemedicine",
        errorKey: `tele_${window.dayKey}`,
        payload: {
          dayOfWeek: window.dayOfWeek,
          startTime: window.startTime,
          endTime: window.endTime,
          availabilityMode: "TELEMEDICINE",
          timeZone: availability.timezone,
          slotIntervalMinutes,
          effectiveFrom,
        },
      });
    }
  }
  return planned;
}

/**
 * The backend rejects overlapping windows for one provider across ALL locations and telemedicine
 * (they can't be in two places at once). Returns form errors keyed by day row.
 */
export function findScheduleOverlaps(planned: PlannedSchedule[]): Record<string, string> {
  const errors: Record<string, string> = {};
  for (let i = 0; i < planned.length; i += 1) {
    for (let j = i + 1; j < planned.length; j += 1) {
      const first = planned[i];
      const second = planned[j];
      if (first.sourceLabel === second.sourceLabel) continue; // same-row overlaps: validateWeek
      const isSameDay = first.payload.dayOfWeek === second.payload.dayOfWeek;
      const isOverlapping =
        first.payload.startTime < second.payload.endTime &&
        second.payload.startTime < first.payload.endTime;
      if (isSameDay && isOverlapping) {
        errors[first.errorKey] ??= `Overlaps ${second.sourceLabel} hours on this day.`;
        errors[second.errorKey] ??= `Overlaps ${first.sourceLabel} hours on this day.`;
      }
    }
  }
  return errors;
}

/** Blocked dates are whole days in the provider's time zone; one block covers every location. */
function planScheduleBlocks(availability: AvailabilityValues): CreateScheduleBlockPayload[] {
  return availability.blocked
    .filter((blockedDate) => blockedDate.start)
    .map((blockedDate) => {
      const lastDay = blockedDate.type === "range" && blockedDate.end ? blockedDate.end : blockedDate.start;
      const reason = [blockedDate.reason, blockedDate.notes]
        .map((text) => text.trim())
        .filter(Boolean)
        .join(" — ")
        .slice(0, BLOCK_REASON_MAX_LENGTH);
      return {
        startsAt: startOfDayInTimeZoneIso(blockedDate.start, availability.timezone),
        endsAt: startOfDayInTimeZoneIso(addOneDay(lastDay), availability.timezone),
        reason: reason || undefined,
      };
    });
}

/** Turns the whole Add Provider form into the onboarding request. */
export function buildOnboardProviderRequest(
  basic: BasicValues,
  licenses: LicenseValues,
  practice: PracticeValues,
  availability: AvailabilityValues,
): OnboardProviderRequest {
  const primarySpecialtyId = practice.primarySpecialty || basic.specialty;
  const specialtyIds = [...new Set([primarySpecialtyId, basic.specialty].filter(Boolean))];

  const activeLocationRows =
    practice.practiceType === "single" ? practice.locations.slice(0, 1) : practice.locations;
  const locationIds = [
    ...new Set(activeLocationRows.map((row) => row.locationId).filter(Boolean)),
  ];

  const credentials =
    basic.title && !NAME_PREFIX_TITLES.has(basic.title)
      ? basic.title
      : CREDENTIALS_BY_PROFESSIONAL_TYPE[basic.professionalType];

  const yearsOfExperience = practice.years.trim() ? Number(practice.years) : undefined;

  const licensesToAdd: LicenseToAdd[] = [
    {
      label: "State medical license",
      file: licenses.medicalFile,
      license: {
        licenseType: "STATE_MEDICAL",
        licenseNumber: normalizeLicenseNumber(licenses.medicalNumber),
        stateCode: licenses.medicalState,
        expirationDate: licenses.medicalExpiry,
      },
    },
    {
      label: "DEA registration",
      file: licenses.deaFile,
      license: {
        licenseType: "DEA",
        licenseNumber: normalizeLicenseNumber(licenses.deaNumber),
        // The form collects one state; DEA registrations are state-specific.
        stateCode: licenses.medicalState,
        expirationDate: licenses.deaExpiry,
      },
    },
    ...licenses.certs
      .filter((cert) => cert.type && cert.number.trim() && cert.expiry)
      .map((cert, index) => ({
        label: cert.type,
        // The form has one shared certificate upload — attach it to the first certification.
        file: index === 0 ? licenses.certFile : null,
        license: {
          licenseType: BOARD_CERTIFICATION_TYPES.has(cert.type)
            ? ("BOARD_CERTIFICATION" as const)
            : ("OTHER" as const),
          licenseNumber: normalizeLicenseNumber(cert.number),
          issuingAuthority: cert.type,
          expirationDate: cert.expiry,
        },
      })),
  ];

  return {
    practitioner: {
      email: basic.email.trim(),
      firstName: basic.firstName.trim(),
      lastName: basic.lastName.trim(),
      phoneNumber: toE164(basic.phone, basic.phoneCountry),
      clinicianType: CLINICIAN_TYPE_BY_PROFESSIONAL_TYPE[basic.professionalType] ?? "OTHER",
      credentials,
      npi: basic.npi.trim(),
      bio: optionalText(practice.bio),
      yearsOfExperience,
      offersTelemedicine: practice.telemedicine,
      specialtyIds,
      primarySpecialtyId,
      locationIds,
    },
    licenses: licensesToAdd,
    // Practice step and Availability → Telemedicine both collect states; declare the union.
    telemedicineStateCodes: practice.telemedicine
      ? [...new Set([...practice.jurisdictions, ...availability.teleJurisdictions])]
      : [],
    schedules: planSchedules(availability, practice.telemedicine),
    scheduleBlocks: planScheduleBlocks(availability),
  };
}
