import type { PaginatedResult } from "@/types/api";
import type {
  ChangePatientStatusPayload,
  CompleteOwnPatientProfilePayload,
  CreateEmergencyContactPayload,
  CreateInsurancePayload,
  CreatePatientPayload,
  EmergencyContact,
  PatientAppointment,
  PatientDetail,
  PatientInsurance,
  PatientListQuery,
  PatientStats,
  PatientSummary,
  UpdateEmergencyContactPayload,
  UpdateInsurancePayload,
  UpdatePatientPayload,
} from "@/types/patient";
import { apiPaginatedRequest, apiRequest, toQueryString } from "./apiClient";

export const patientService = {
  listPatients(query: PatientListQuery, signal?: AbortSignal): Promise<PaginatedResult<PatientSummary>> {
    return apiPaginatedRequest<PatientSummary>(`/patients${toQueryString({ ...query })}`, {
      isAuthenticated: true,
      signal,
    });
  },

  getPatient(patientId: string, signal?: AbortSignal): Promise<PatientDetail> {
    return apiRequest<PatientDetail>(`/patients/${patientId}`, { isAuthenticated: true, signal });
  },

  listEmergencyContacts(patientId: string, signal?: AbortSignal): Promise<EmergencyContact[]> {
    return apiRequest<EmergencyContact[]>(`/patients/${patientId}/emergency-contacts`, {
      isAuthenticated: true,
      signal,
    });
  },

  updateEmergencyContact(
    patientId: string,
    contactId: string,
    payload: UpdateEmergencyContactPayload,
  ): Promise<EmergencyContact> {
    return apiRequest<EmergencyContact>(`/patients/${patientId}/emergency-contacts/${contactId}`, {
      method: "PATCH",
      body: payload,
      isAuthenticated: true,
    });
  },

  deleteEmergencyContact(patientId: string, contactId: string): Promise<unknown> {
    return apiRequest<unknown>(`/patients/${patientId}/emergency-contacts/${contactId}`, {
      method: "DELETE",
      isAuthenticated: true,
    });
  },

  createInsurance(patientId: string, payload: CreateInsurancePayload): Promise<PatientInsurance> {
    return apiRequest<PatientInsurance>(`/patients/${patientId}/insurances`, {
      method: "POST",
      body: payload,
      isAuthenticated: true,
    });
  },

  updateInsurance(
    patientId: string,
    insuranceId: string,
    payload: UpdateInsurancePayload,
  ): Promise<PatientInsurance> {
    return apiRequest<PatientInsurance>(`/patients/${patientId}/insurances/${insuranceId}`, {
      method: "PATCH",
      body: payload,
      isAuthenticated: true,
    });
  },

  listInsurances(patientId: string, signal?: AbortSignal): Promise<PatientInsurance[]> {
    return apiRequest<PatientInsurance[]>(`/patients/${patientId}/insurances`, {
      isAuthenticated: true,
      signal,
    });
  },

  /** Newest first. */
  listRecentAppointments(
    patientId: string,
    limit: number,
    signal?: AbortSignal,
  ): Promise<PaginatedResult<PatientAppointment>> {
    return patientService.listPatientAppointments({ patientId, page: 1, limit, sortOrder: "desc" }, signal);
  },

  /** `GET /appointments` for one patient; `statuses` is comma-separated, `from`/`to` are ISO times. */
  listPatientAppointments(
    query: {
      patientId: string;
      page: number;
      limit: number;
      sortOrder: "asc" | "desc";
      statuses?: string;
      from?: string;
      to?: string;
    },
    signal?: AbortSignal,
  ): Promise<PaginatedResult<PatientAppointment>> {
    return apiPaginatedRequest<PatientAppointment>(`/appointments${toQueryString(query)}`, {
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

  updatePatient(patientId: string, payload: UpdatePatientPayload): Promise<PatientDetail> {
    return apiRequest<PatientDetail>(`/patients/${patientId}`, {
      method: "PATCH",
      body: payload,
      isAuthenticated: true,
    });
  },

  changePatientStatus(patientId: string, payload: ChangePatientStatusPayload): Promise<PatientDetail> {
    return apiRequest<PatientDetail>(`/patients/${patientId}/status`, {
      method: "POST",
      body: payload,
      isAuthenticated: true,
    });
  },

  invitePatientToPortal(patientId: string): Promise<PatientDetail> {
    return apiRequest<PatientDetail>(`/patients/${patientId}/portal-invitation`, {
      method: "POST",
      isAuthenticated: true,
    });
  },

  completeOwnProfile(payload: CompleteOwnPatientProfilePayload): Promise<PatientDetail> {
    return apiRequest<PatientDetail>("/patients/me", {
      method: "POST",
      body: payload,
      isAuthenticated: true,
    });
  },
};
