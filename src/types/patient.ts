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
  preferredName?: string;
  genderIdentity?: string;
  preferredContactMethod?: ContactMethod;
  allowEmailNotifications?: boolean;
  allowSmsNotifications?: boolean;
}

export interface CreateEmergencyContactPayload {
  fullName: string;
  relationship: ContactRelationship;
  phoneNumber: string;
  isPrimary?: boolean;
}

/** Body of `PATCH /patients/:id` (backend `UpdatePatientDto`). */
export interface UpdatePatientPayload {
  firstName?: string;
  lastName?: string;
  middleName?: string | null;
  dateOfBirth?: string;
  administrativeGender?: AdministrativeGender;
  genderIdentity?: string | null;
  preferredName?: string | null;
  phoneNumber?: string | null;
  email?: string | null;
  preferredLanguage?: string;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  stateCode?: string | null;
  postalCode?: string | null;
  countryCode?: string;
  preferredContactMethod?: ContactMethod;
  allowEmailNotifications?: boolean;
  allowSmsNotifications?: boolean;
}

/** Body of `POST /patients/:id/status` (backend `ChangePatientStatusDto`). */
export interface ChangePatientStatusPayload {
  status: PatientStatus;
  reason: string;
  dateOfDeath?: string;
}

/** Body of `POST /patients/me` (backend `CompleteOwnPatientProfileDto`). */
export interface CompleteOwnPatientProfilePayload {
  dateOfBirth: string;
  administrativeGender: AdministrativeGender;
  preferredName?: string | null;
  phoneNumber?: string | null;
  email?: string | null;
  preferredLanguage?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  stateCode?: string;
  postalCode?: string;
  countryCode?: string;
  preferredContactMethod?: ContactMethod;
  allowEmailNotifications?: boolean;
  allowSmsNotifications?: boolean;
}

export type ContactMethod = "EMAIL" | "SMS" | "PHONE" | "PORTAL";

/** `GET /patients/:id` (backend `PatientResponseDto`). */
export interface PatientDetail extends PatientSummary {
  genderIdentity: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  stateCode: string | null;
  postalCode: string | null;
  countryCode: string;
  /** BCP 47 tag, e.g. "en" */
  preferredLanguage: string;
  preferredContactMethod: ContactMethod;
  allowEmailNotifications: boolean;
  allowSmsNotifications: boolean;
  hasNoKnownAllergies: boolean;
  statusReason: string | null;
  deceasedAt: string | null;
  hasPortalAccount: boolean;
  /** ISO timestamp */
  createdAt: string;
  /** ISO timestamp */
  updatedAt: string;
}

/** `GET /patients/:id/emergency-contacts` (backend `EmergencyContactResponseDto`). */
export interface EmergencyContact {
  id: string;
  fullName: string;
  relationship: ContactRelationship;
  phoneNumber: string;
  email: string | null;
  isPrimary: boolean;
}

export type CoveragePriority = "PRIMARY" | "SECONDARY" | "TERTIARY";

/** `GET /patients/:id/insurances` (backend `InsuranceResponseDto`). */
export interface PatientInsurance {
  id: string;
  coveragePriority: CoveragePriority;
  payerName: string;
  planName: string | null;
  memberId: string;
  groupNumber: string | null;
  /** "YYYY-MM-DD" */
  effectiveDate: string | null;
  /** "YYYY-MM-DD" */
  terminationDate: string | null;
  status: "ACTIVE" | "INACTIVE";
}

/** The fields of an appointment (`GET /appointments?patientId=`) the patient screens use. */
export interface PatientAppointment {
  id: string;
  status: string;
  consultationMode: string;
  /** ISO timestamp */
  startsAt: string;
  timeZone: string;
  practitioner: { id: string; firstName: string; lastName: string; credentials: string | null };
  appointmentType: { id: string; code: string; name: string };
}
