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
