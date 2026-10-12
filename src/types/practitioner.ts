import type { SortOrder } from "./api";

/** Practitioner contracts mirrored from the backend (`src/modules/practitioners/dto`). */

export type PractitionerOnboardingStatus =
  | "DRAFT"
  | "PENDING_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "SUSPENDED";

export type PractitionerSortField = "lastName" | "createdAt" | "submittedAt";

export interface SpecialtySummary {
  id: string;
  code: string;
  name: string;
}

export interface PractitionerLocationSummary {
  locationId: string;
  code: string;
  name: string;
}

export interface Practitioner {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string | null;
  clinicianType: string | null;
  /** e.g. "MD", "DO", "NP" */
  credentials: string | null;
  npi: string | null;
  isAcceptingNewPatients: boolean;
  offersTelemedicine: boolean;
  onboardingStatus: PractitionerOnboardingStatus;
  primarySpecialty: SpecialtySummary | null;
  specialties: SpecialtySummary[];
  locations: PractitionerLocationSummary[];
  createdAt: string;
}

export interface PractitionerStats {
  totalPractitioners: number;
  approvedPractitioners: number;
  pendingReviewPractitioners: number;
  draftPractitioners: number;
  inactivePractitioners: number;
}

export interface PractitionerListQuery {
  page: number;
  limit: number;
  /** Name, email or NPI — backend requires at least 2 characters */
  search: string;
  onboardingStatus: PractitionerOnboardingStatus | "";
  specialtyId: string;
  sortBy: PractitionerSortField;
  sortOrder: SortOrder;
}

export type ClinicianType =
  | "PHYSICIAN"
  | "NURSE_PRACTITIONER"
  | "PHYSICIAN_ASSISTANT"
  | "PSYCHOLOGIST"
  | "THERAPIST"
  | "OTHER";

/** Body of `POST /practitioners` (backend `CreatePractitionerDto`). */
export interface CreatePractitionerPayload {
  email: string;
  firstName: string;
  lastName: string;
  /** E.164 */
  phoneNumber?: string;
  clinicianType: ClinicianType;
  /** e.g. "MD", "PA-C" */
  credentials?: string;
  npi: string;
  bio?: string;
  yearsOfExperience?: number;
  offersTelemedicine: boolean;
  languages?: string[];
  specialtyIds: string[];
  primarySpecialtyId: string;
  locationIds: string[];
}

export type LicenseType =
  | "STATE_MEDICAL"
  | "DEA"
  | "STATE_CONTROLLED_SUBSTANCE"
  | "BOARD_CERTIFICATION"
  | "OTHER";

export interface CreateLicensePayload {
  licenseType: LicenseType;
  licenseNumber: string;
  /** Required for STATE_MEDICAL, DEA and STATE_CONTROLLED_SUBSTANCE */
  stateCode?: string;
  issuingAuthority?: string;
  /** "YYYY-MM-DD" */
  issueDate?: string;
  /** "YYYY-MM-DD" */
  expirationDate: string;
  /** Uploaded LICENSE / PRACTITIONER_CREDENTIAL document */
  documentId?: string;
}

export type PractitionerDocumentCategory = "LICENSE" | "PRACTITIONER_CREDENTIAL";

export interface PractitionerDocument {
  id: string;
  category: string;
  originalFileName: string;
  contentType: string;
  sizeBytes: number;
  /** false = uploaded by an administrator */
  uploadedByPractitioner: boolean;
  createdAt: string;
}

export type LicenseVerificationStatus = "PENDING" | "VERIFIED" | "REJECTED";

/** `GET /practitioners/:id/licenses` item. */
export interface PractitionerLicense {
  id: string;
  licenseType: LicenseType;
  licenseNumber: string;
  stateCode: string | null;
  issuingAuthority: string | null;
  /** "YYYY-MM-DD" */
  issueDate: string | null;
  expirationDate: string;
  isExpired: boolean;
  /** Negative when already expired */
  daysUntilExpiration: number;
  verificationStatus: LicenseVerificationStatus;
  verifiedAt: string | null;
  verificationNote: string | null;
  documentId: string | null;
  createdAt: string;
}

/** Organization location (`GET /locations`). */
export interface OrganizationLocation {
  id: string;
  code: string;
  name: string;
  locationType: "CLINIC" | "OFFICE" | "VIRTUAL";
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  stateCode: string | null;
  postalCode: string | null;
  countryCode: string;
  timeZone: string;
}

export type AvailabilityMode = "IN_PERSON" | "TELEMEDICINE" | "BOTH";

/** Weekly working window (`POST /practitioners/:id/schedules`). */
export interface CreateSchedulePayload {
  /** ISO weekday: 1 = Monday … 7 = Sunday */
  dayOfWeek: number;
  /** "HH:MM" */
  startTime: string;
  endTime: string;
  availabilityMode: AvailabilityMode;
  /** Required for IN_PERSON / BOTH */
  locationId?: string;
  /** Required when there is no location */
  timeZone?: string;
  slotIntervalMinutes?: number;
  /** "YYYY-MM-DD" */
  effectiveFrom: string;
}

/** Time off (`POST /practitioners/:id/schedule-blocks`). */
export interface CreateScheduleBlockPayload {
  /** ISO date-time (UTC) */
  startsAt: string;
  endsAt: string;
  reason?: string;
}

/** A weekly window to create, plus where it came from (for warnings / form error keys). */
export interface PlannedSchedule {
  payload: CreateSchedulePayload;
  /** e.g. "Main Clinic" or "Telemedicine" */
  sourceLabel: string;
  /** Form error key of the day row, e.g. "loc_<locationId>_mon" or "tele_mon" */
  errorKey: string;
}
