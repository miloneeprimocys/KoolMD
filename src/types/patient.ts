import type { SortOrder } from "./api";

/** Patient contracts mirrored from the backend (`src/modules/patients/dto/patient.dto.ts`). */

export type PatientStatus = "ACTIVE" | "INACTIVE" | "DECEASED";

export type AdministrativeGender = "MALE" | "FEMALE" | "OTHER" | "UNKNOWN";

export type PatientSortField = "lastName" | "dateOfBirth" | "createdAt";

export interface PatientSummary {
  id: string;
  /** e.g. "KMD-0000042" */
  medicalRecordNumber: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  preferredName: string | null;
  /** "YYYY-MM-DD" */
  dateOfBirth: string;
  administrativeGender: AdministrativeGender;
  phoneNumber: string | null;
  email: string | null;
  status: PatientStatus;
}

export interface PatientStats {
  totalPatients: number;
  activePatients: number;
  inactivePatients: number;
  deceasedPatients: number;
  newPatientsLast30Days: number;
}

export interface PatientListQuery {
  page: number;
  limit: number;
  /** Name, MRN, email or phone — backend requires at least 2 characters */
  search: string;
  status: PatientStatus | "";
  administrativeGender: AdministrativeGender | "";
  sortBy: PatientSortField;
  sortOrder: SortOrder;
}

export type ContactRelationship =
  | "SPOUSE"
  | "PARENT"
  | "CHILD"
  | "SIBLING"
  | "GUARDIAN"
  | "FRIEND"
  | "OTHER";

/** Body of `POST /patients` (backend `CreatePatientDto`). Optional fields are omitted when empty. */
export interface CreatePatientPayload {
  firstName: string;
  lastName: string;
  middleName?: string;
  /** "YYYY-MM-DD" */
  dateOfBirth: string;
  administrativeGender: AdministrativeGender;
  /** E.164, e.g. +14155550123 */
  phoneNumber?: string;
  email?: string;
  /** BCP 47 tag, e.g. "en" */
  preferredLanguage?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  /** USPS code — US addresses only */
  stateCode?: string;
  /** US ZIP — US addresses only */
  postalCode?: string;
  /** ISO 3166-1 alpha-2 */
  countryCode?: string;
  /** Set after the user confirms a "possible duplicate" warning */
  confirmNotDuplicate?: boolean;
}

export interface CreateEmergencyContactPayload {
  fullName: string;
  relationship: ContactRelationship;
  phoneNumber: string;
  isPrimary?: boolean;
}
