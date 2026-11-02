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

/** Body of `POST /patients/:id/emergency-contacts` (backend `CreateEmergencyContactDto`). */
export interface CreateEmergencyContactPayload {
  fullName: string;
  relationship: ContactRelationship;
  /** E.164 */
  phoneNumber: string;
  email?: string;
  /** Makes this the primary contact (the previous primary is unset). */
  isPrimary?: boolean;
}

/** Body of `PATCH /patients/:id/emergency-contacts/:contactId`. */
export type UpdateEmergencyContactPayload = Partial<Omit<CreateEmergencyContactPayload, "email">> & {
  email?: string | null;
};

export type SubscriberRelationship = "SELF" | "SPOUSE" | "CHILD" | "OTHER";

/** Body of `POST /patients/:id/insurances` (backend `CreateInsuranceDto`). */
export interface CreateInsurancePayload {
  coveragePriority: CoveragePriority;
  payerName: string;
  planName?: string;
  memberId: string;
  groupNumber?: string;
  /** Subscriber name and date of birth are required unless SELF. */
  subscriberRelationship: SubscriberRelationship;
  subscriberFirstName?: string;
  subscriberLastName?: string;
  /** "YYYY-MM-DD" */
  subscriberDateOfBirth?: string;
  /** "YYYY-MM-DD" */
  effectiveDate?: string;
  /** "YYYY-MM-DD" */
  terminationDate?: string;
}

/** Body of `PATCH /patients/:id/insurances/:insuranceId`; INACTIVE retires the coverage. */
export type UpdateInsurancePayload = {
  [K in keyof CreateInsurancePayload]?: CreateInsurancePayload[K] | null;
} & { status?: "ACTIVE" | "INACTIVE" };

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
  subscriberRelationship: SubscriberRelationship;
  subscriberFirstName: string | null;
  subscriberLastName: string | null;
  /** "YYYY-MM-DD" */
  subscriberDateOfBirth: string | null;
  /** "YYYY-MM-DD" */
  effectiveDate: string | null;
  /** "YYYY-MM-DD" */
  terminationDate: string | null;
  status: "ACTIVE" | "INACTIVE";
}

/** The fields of an appointment (`GET /appointments?patientId=`) the patient screens use. */
export type AppointmentStatus =
  | "SCHEDULED"
  | "CONFIRMED"
  | "CHECKED_IN"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW"
  | "RESCHEDULED";

export interface PatientAppointment {
  id: string;
  status: AppointmentStatus;
  consultationMode: "IN_PERSON" | "TELEMEDICINE";
  /** ISO timestamp */
  startsAt: string;
  /** ISO timestamp */
  endsAt: string;
  /** IANA zone the appointment was booked in. */
  timeZone: string;
  practitioner: { id: string; firstName: string; lastName: string; credentials: string | null };
  appointmentType: { id: string; code: string; name: string };
  location: { id: string; code: string; name: string } | null;
  reasonForVisit: string | null;
  cancellationReason: string | null;
}

/* ---------- Allergies (backend `allergy.dto.ts`) ---------- */

export type AllergyCategory = "MEDICATION" | "FOOD" | "ENVIRONMENTAL" | "OTHER";
export type AllergySeverity = "MILD" | "MODERATE" | "SEVERE" | "UNKNOWN";
/** Allergies are never deleted: they are marked INACTIVE or RESOLVED. */
export type AllergyClinicalStatus = "ACTIVE" | "INACTIVE" | "RESOLVED";

export interface PatientAllergy {
  id: string;
  allergen: string;
  category: AllergyCategory;
  reaction: string | null;
  severity: AllergySeverity;
  clinicalStatus: AllergyClinicalStatus;
  /** "YYYY-MM-DD" */
  onsetDate: string | null;
  notes: string | null;
  /** ISO timestamp */
  createdAt: string;
  /** ISO timestamp */
  updatedAt: string;
}

/** `GET /patients/:id/allergies` */
export interface PatientAllergies {
  hasNoKnownAllergies: boolean;
  allergies: PatientAllergy[];
}

/** Body of `POST /patients/:id/allergies`. */
export interface CreateAllergyPayload {
  allergen: string;
  category: AllergyCategory;
  reaction?: string;
  severity?: AllergySeverity;
  /** "YYYY-MM-DD" */
  onsetDate?: string;
  notes?: string;
}

/** Body of `PATCH /patients/:id/allergies/:allergyId` (allergen and category are fixed once recorded). */
export interface UpdateAllergyPayload {
  reaction?: string | null;
  severity?: AllergySeverity;
  clinicalStatus?: AllergyClinicalStatus;
  onsetDate?: string | null;
  notes?: string | null;
}

/* ---------- Medication list (backend `medication-list.dto.ts`) ---------- */

export type MedicationStatementStatus =
  | "ACTIVE"
  | "ON_HOLD"
  | "STOPPED"
  | "COMPLETED"
  | "ENTERED_IN_ERROR";
export type MedicationInformationSource = "PATIENT_REPORTED" | "CLINICIAN_RECORDED" | "PRESCRIPTION";
/** Statuses that can be set by editing; STOPPED and ENTERED_IN_ERROR have their own actions. */
export type EditableMedicationStatus = "ACTIVE" | "ON_HOLD" | "COMPLETED";

/** One entry of the patient's medication list. Entries are never deleted. */
export interface MedicationStatement {
  id: string;
  medicationId: string | null;
  /** Set when the entry came from a prescription (its dosage is then not editable). */
  medicationRequestId: string | null;
  medicationName: string;
  dosageText: string | null;
  status: MedicationStatementStatus;
  informationSource: MedicationInformationSource;
  /** "YYYY-MM-DD" */
  startDate: string | null;
  /** "YYYY-MM-DD" */
  endDate: string | null;
  statusReason: string | null;
  note: string | null;
  /** ISO timestamp */
  createdAt: string;
}

/** Body of `POST /patients/:id/medications` (catalog `medicationId` or free-text `medicationName`). */
export interface CreateMedicationStatementPayload {
  medicationId?: string;
  medicationName?: string;
  dosageText?: string;
  /** "YYYY-MM-DD" */
  startDate?: string;
  note?: string;
}

/** Body of `PATCH /patients/:id/medications/:statementId`. */
export interface UpdateMedicationStatementPayload {
  dosageText?: string | null;
  status?: EditableMedicationStatus;
  startDate?: string | null;
  endDate?: string | null;
  note?: string | null;
}

/* ---------- Problem list (backend `clinical.dto.ts`, conditions) ---------- */

export type ConditionClinicalStatus = "ACTIVE" | "RESOLVED" | "INACTIVE";
export type ConditionVerificationStatus = "CONFIRMED" | "PROVISIONAL" | "REFUTED" | "ENTERED_IN_ERROR";

export interface PatientCondition {
  id: string;
  /** ICD-10-CM */
  code: string;
  display: string;
  clinicalStatus: ConditionClinicalStatus;
  verificationStatus: ConditionVerificationStatus;
  /** "YYYY-MM-DD" */
  onsetDate: string | null;
  /** "YYYY-MM-DD" — set when resolved. */
  abatementDate: string | null;
  note: string | null;
}

export interface CreateConditionPayload {
  /** ICD-10-CM, e.g. "E11.9" */
  code: string;
  display: string;
  verificationStatus?: "CONFIRMED" | "PROVISIONAL";
  onsetDate?: string;
  note?: string;
}

export interface UpdateConditionPayload {
  clinicalStatus?: ConditionClinicalStatus;
  verificationStatus?: ConditionVerificationStatus;
  onsetDate?: string | null;
  abatementDate?: string | null;
  note?: string | null;
}

/* ---------- Medical history (backend `medical-history.dto.ts`) ---------- */

/** Entries are never deleted: a wrong one is marked ENTERED_IN_ERROR with a reason. */
export type HistoryEntryStatus = "RECORDED" | "ENTERED_IN_ERROR";

export interface SurgicalHistoryEntry {
  id: string;
  procedureName: string;
  /** "YYYY-MM-DD" */
  performedDate: string | null;
  surgeonName: string | null;
  facilityName: string | null;
  reason: string | null;
  outcome: string | null;
  complications: string | null;
  note: string | null;
  status: HistoryEntryStatus;
  statusReason: string | null;
}

export type SurgicalHistoryPayload = {
  procedureName: string;
  performedDate?: string | null;
  surgeonName?: string | null;
  facilityName?: string | null;
  reason?: string | null;
  outcome?: string | null;
  complications?: string | null;
  note?: string | null;
};

export type FamilyRelationship =
  | "MOTHER"
  | "FATHER"
  | "SISTER"
  | "BROTHER"
  | "DAUGHTER"
  | "SON"
  | "GRANDMOTHER"
  | "GRANDFATHER"
  | "AUNT"
  | "UNCLE"
  | "COUSIN"
  | "OTHER";

export interface FamilyHistoryEntry {
  id: string;
  relationship: FamilyRelationship;
  relationDetails: string | null;
  conditionName: string;
  onsetAge: number | null;
  /** The relative died of this condition; null = unknown. */
  causeOfDeath: boolean | null;
  note: string | null;
  status: HistoryEntryStatus;
  statusReason: string | null;
}

export type FamilyHistoryPayload = {
  relationship: FamilyRelationship;
  conditionName: string;
  relationDetails?: string | null;
  onsetAge?: number | null;
  causeOfDeath?: boolean | null;
  note?: string | null;
};

export type ImmunizationStatus = "COMPLETED" | "NOT_DONE" | "ENTERED_IN_ERROR";
export type ImmunizationRoute =
  | "INTRAMUSCULAR"
  | "SUBCUTANEOUS"
  | "INTRADERMAL"
  | "ORAL"
  | "INTRANASAL"
  | "OTHER";

export interface PatientImmunization {
  id: string;
  vaccineName: string;
  manufacturer: string | null;
  doseLabel: string | null;
  /** "YYYY-MM-DD" */
  administeredDate: string;
  administeredBy: string | null;
  lotNumber: string | null;
  route: ImmunizationRoute | null;
  /** "YYYY-MM-DD" */
  nextDoseDueDate: string | null;
  note: string | null;
  status: ImmunizationStatus;
  /** Why a dose was not given, or why the entry is an error. */
  statusReason: string | null;
}

export type ImmunizationPayload = {
  vaccineName: string;
  administeredDate: string;
  manufacturer?: string | null;
  doseLabel?: string | null;
  administeredBy?: string | null;
  lotNumber?: string | null;
  route?: ImmunizationRoute | null;
  nextDoseDueDate?: string | null;
  status?: "COMPLETED" | "NOT_DONE";
  /** Required when status is NOT_DONE. */
  statusReason?: string | null;
  note?: string | null;
};

export type TobaccoUse = "NEVER" | "FORMER" | "CURRENT" | "UNKNOWN";
export type AlcoholUse = "NONE" | "OCCASIONAL" | "REGULAR" | "UNKNOWN";
export type AlcoholFrequency = "DAILY" | "WEEKLY" | "MONTHLY" | "SPECIAL_OCCASIONS";
export type ExerciseFrequency =
  | "NONE"
  | "ONE_TO_TWO_PER_WEEK"
  | "THREE_TO_FOUR_PER_WEEK"
  | "FIVE_OR_MORE_PER_WEEK";
export type MaritalStatus =
  | "SINGLE"
  | "MARRIED"
  | "DOMESTIC_PARTNER"
  | "SEPARATED"
  | "DIVORCED"
  | "WIDOWED"
  | "UNKNOWN";

/** Lifestyle record; `PUT` replaces it as a whole (left-out fields are cleared). */
export interface SocialHistory {
  tobaccoUse: TobaccoUse;
  packsPerDay: number | null;
  tobaccoYears: number | null;
  alcoholUse: AlcoholUse;
  alcoholFrequency: AlcoholFrequency | null;
  drinksPerOccasion: number | null;
  exerciseFrequency: ExerciseFrequency | null;
  diet: string | null;
  occupation: string | null;
  maritalStatus: MaritalStatus | null;
  note: string | null;
  /** ISO timestamp */
  updatedAt: string;
}

export type SocialHistoryPayload = {
  tobaccoUse: TobaccoUse;
  alcoholUse: AlcoholUse;
  packsPerDay?: number;
  tobaccoYears?: number;
  alcoholFrequency?: AlcoholFrequency;
  drinksPerOccasion?: number;
  exerciseFrequency?: ExerciseFrequency;
  diet?: string;
  occupation?: string;
  maritalStatus?: MaritalStatus;
  note?: string;
};

/** Latest vital sign reading (`GET /patients/:id/vital-signs/latest`). */
export interface VitalSignReading {
  /** LOINC */
  code: string;
  display: string;
  value: number | null;
  unit: string | null;
  /** ISO timestamp */
  effectiveAt: string;
}

/** A visit in the patient's encounter history (`GET /encounters?patientId=`). */
export interface EncounterSummary {
  id: string;
  practitioner: { id: string; firstName: string; lastName: string };
  encounterClass: string;
  status: "IN_PROGRESS" | "COMPLETED" | "ENTERED_IN_ERROR";
  /** ISO timestamp */
  startedAt: string;
  isLocked: boolean;
}

/** Everything the Medical History tab shows, loaded together. */
export interface PatientMedicalHistory {
  conditions: PatientCondition[];
  surgicalHistory: SurgicalHistoryEntry[];
  familyHistory: FamilyHistoryEntry[];
  immunizations: PatientImmunization[];
  socialHistory: SocialHistory | null;
  /** Null when the viewer may not read vitals. */
  latestVitals: VitalSignReading[] | null;
  /** Null when the viewer may not read encounters. */
  recentEncounters: EncounterSummary[] | null;
}

/* ---------- Documents (backend `patient-document.dto.ts`) ---------- */

export type PatientDocumentCategory =
  | "PATIENT_UPLOAD"
  | "IDENTITY"
  | "INSURANCE_CARD"
  | "OTHER"
  | "CLINICAL_ATTACHMENT"
  | "LAB_REPORT"
  | "IMAGING"
  | "REFERRAL";

export interface PatientDocument {
  id: string;
  category: PatientDocumentCategory;
  originalFileName: string;
  contentType: string;
  sizeBytes: number;
  isUploadedByPatient: boolean;
  /** ISO timestamp */
  createdAt: string;
}
