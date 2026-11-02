import type {
  CreateAllergyPayload,
  CreateMedicationStatementPayload,
  EncounterSummary,
  MedicationStatement,
  PatientAllergies,
  PatientAllergy,
  PatientDocument,
  PatientDocumentCategory,
  SocialHistory,
  SocialHistoryPayload,
  UpdateAllergyPayload,
  UpdateMedicationStatementPayload,
  VitalSignReading,
} from "@/types/patient";
import { apiBlobRequest, apiPaginatedRequest, apiRequest, toQueryString } from "./apiClient";

/** Patient sub-resources that share list / create / update / entered-in-error endpoints. */
export type HistoryListPath = "conditions" | "surgical-history" | "family-history" | "immunizations";

/** Clinical records of one patient shown on the View Patient tabs. */
export const patientRecordsService = {
  /* ---------- Allergies ---------- */

  listAllergies(patientId: string, signal?: AbortSignal): Promise<PatientAllergies> {
    return apiRequest<PatientAllergies>(`/patients/${patientId}/allergies`, {
      isAuthenticated: true,
      signal,
    });
  },

  createAllergy(patientId: string, payload: CreateAllergyPayload): Promise<PatientAllergy> {
    return apiRequest<PatientAllergy>(`/patients/${patientId}/allergies`, {
      method: "POST",
      body: payload,
      isAuthenticated: true,
    });
  },

  updateAllergy(
    patientId: string,
    allergyId: string,
    payload: UpdateAllergyPayload,
  ): Promise<PatientAllergy> {
    return apiRequest<PatientAllergy>(`/patients/${patientId}/allergies/${allergyId}`, {
      method: "PATCH",
      body: payload,
      isAuthenticated: true,
    });
  },

  setNoKnownAllergies(patientId: string, hasNoKnownAllergies: boolean): Promise<PatientAllergies> {
    return apiRequest<PatientAllergies>(`/patients/${patientId}/allergies/no-known-allergies`, {
      method: "PUT",
      body: { hasNoKnownAllergies },
      isAuthenticated: true,
    });
  },

  /* ---------- Medication list ---------- */

  /** Current entries first, then history. */
  listMedications(patientId: string, signal?: AbortSignal): Promise<MedicationStatement[]> {
    return apiRequest<MedicationStatement[]>(`/patients/${patientId}/medications`, {
      isAuthenticated: true,
      signal,
    });
  },

  createMedication(
    patientId: string,
    payload: CreateMedicationStatementPayload,
  ): Promise<MedicationStatement> {
    return apiRequest<MedicationStatement>(`/patients/${patientId}/medications`, {
      method: "POST",
      body: payload,
      isAuthenticated: true,
    });
  },

  updateMedication(
    patientId: string,
    statementId: string,
    payload: UpdateMedicationStatementPayload,
  ): Promise<MedicationStatement> {
    return apiRequest<MedicationStatement>(`/patients/${patientId}/medications/${statementId}`, {
      method: "PATCH",
      body: payload,
      isAuthenticated: true,
    });
  },

  stopMedication(
    patientId: string,
    statementId: string,
    payload: { reason: string; endDate?: string },
  ): Promise<MedicationStatement> {
    return apiRequest<MedicationStatement>(`/patients/${patientId}/medications/${statementId}/stop`, {
      method: "POST",
      body: payload,
      isAuthenticated: true,
    });
  },

  markMedicationEnteredInError(
    patientId: string,
    statementId: string,
    reason: string,
  ): Promise<MedicationStatement> {
    return apiRequest<MedicationStatement>(
      `/patients/${patientId}/medications/${statementId}/entered-in-error`,
      { method: "POST", body: { reason }, isAuthenticated: true },
    );
  },

  /* ---------- Medical history lists (problem list, surgeries, family, immunizations) ---------- */

  listHistory<TItem>(patientId: string, path: HistoryListPath, signal?: AbortSignal): Promise<TItem[]> {
    return apiRequest<TItem[]>(`/patients/${patientId}/${path}`, { isAuthenticated: true, signal });
  },

  createHistoryEntry(patientId: string, path: HistoryListPath, payload: object): Promise<unknown> {
    return apiRequest<unknown>(`/patients/${patientId}/${path}`, {
      method: "POST",
      body: payload,
      isAuthenticated: true,
    });
  },

  updateHistoryEntry(
    patientId: string,
    path: HistoryListPath,
    entryId: string,
    payload: object,
  ): Promise<unknown> {
    return apiRequest<unknown>(`/patients/${patientId}/${path}/${entryId}`, {
      method: "PATCH",
      body: payload,
      isAuthenticated: true,
    });
  },

  /** Not available for conditions (they use verificationStatus ENTERED_IN_ERROR via update). */
  markHistoryEntryEnteredInError(
    patientId: string,
    path: Exclude<HistoryListPath, "conditions">,
    entryId: string,
    reason: string,
  ): Promise<unknown> {
    return apiRequest<unknown>(`/patients/${patientId}/${path}/${entryId}/entered-in-error`, {
      method: "POST",
      body: { reason },
      isAuthenticated: true,
    });
  },

  /* ---------- Documents ---------- */

  listDocuments(patientId: string, signal?: AbortSignal): Promise<PatientDocument[]> {
    return apiRequest<PatientDocument[]>(`/patients/${patientId}/documents`, {
      isAuthenticated: true,
      signal,
    });
  },

  /** Multipart upload; the backend reads "category" before "file", so the order matters. */
  uploadDocument(
    patientId: string,
    category: PatientDocumentCategory,
    file: File,
  ): Promise<PatientDocument> {
    const formData = new FormData();
    formData.append("category", category);
    formData.append("file", file);
    return apiRequest<PatientDocument>(`/patients/${patientId}/documents`, {
      method: "POST",
      body: formData,
      isAuthenticated: true,
    });
  },

  /** Files are served only with the session (access is audited), then saved locally. */
  downloadDocument(patientId: string, documentId: string) {
    return apiBlobRequest(`/patients/${patientId}/documents/${documentId}/content`);
  },

  /** Hides a document (kept for retention); the reason is audited. */
  archiveDocument(patientId: string, documentId: string, reason: string): Promise<unknown> {
    return apiRequest<unknown>(`/patients/${patientId}/documents/${documentId}/archive`, {
      method: "POST",
      body: { reason },
      isAuthenticated: true,
    });
  },

  /* ---------- Lifestyle, vitals, visits ---------- */

  getSocialHistory(patientId: string, signal?: AbortSignal): Promise<SocialHistory | null> {
    return apiRequest<SocialHistory | null>(`/patients/${patientId}/social-history`, {
      isAuthenticated: true,
      signal,
    });
  },

  putSocialHistory(patientId: string, payload: SocialHistoryPayload): Promise<SocialHistory> {
    return apiRequest<SocialHistory>(`/patients/${patientId}/social-history`, {
      method: "PUT",
      body: payload,
      isAuthenticated: true,
    });
  },

  getLatestVitals(patientId: string, signal?: AbortSignal): Promise<VitalSignReading[]> {
    return apiRequest<VitalSignReading[]>(`/patients/${patientId}/vital-signs/latest`, {
      isAuthenticated: true,
      signal,
    });
  },

  /** Most recent visits first. */
  async listRecentEncounters(
    patientId: string,
    limit: number,
    signal?: AbortSignal,
  ): Promise<EncounterSummary[]> {
    const result = await apiPaginatedRequest<EncounterSummary>(
      `/encounters${toQueryString({ patientId, page: 1, limit, sortOrder: "desc" })}`,
      { isAuthenticated: true, signal },
    );
    return result.items;
  },
};
