import type { PaginatedResult } from "@/types/api";
import type {
  CreateEmergencyContactPayload,
  CreatePatientPayload,
  PatientListQuery,
  PatientStats,
  PatientSummary,
} from "@/types/patient";
import { apiPaginatedRequest, apiRequest, toQueryString } from "./apiClient";

export const patientService = {
  listPatients(query: PatientListQuery, signal?: AbortSignal): Promise<PaginatedResult<PatientSummary>> {
    return apiPaginatedRequest<PatientSummary>(`/patients${toQueryString({ ...query })}`, {
      isAuthenticated: true,
      signal,
    });
  },

  getPatientStats(): Promise<PatientStats> {
    return apiRequest<PatientStats>("/patients/stats", { isAuthenticated: true });
  },

  createPatient(payload: CreatePatientPayload): Promise<PatientSummary> {
    return apiRequest<PatientSummary>("/patients", {
      method: "POST",
      body: payload,
      isAuthenticated: true,
    });
  },

  addEmergencyContact(patientId: string, payload: CreateEmergencyContactPayload): Promise<unknown> {
    return apiRequest<unknown>(`/patients/${patientId}/emergency-contacts`, {
      method: "POST",
      body: payload,
      isAuthenticated: true,
    });
  },
};
