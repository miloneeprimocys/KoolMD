import type { PaginatedResult } from "@/types/api";
import type {
  CreateLicensePayload,
  CreatePractitionerPayload,
  CreateScheduleBlockPayload,
  CreateSchedulePayload,
  OrganizationLocation,
  Practitioner,
  PractitionerDocument,
  PractitionerLicense,
  PractitionerDocumentCategory,
  PractitionerListQuery,
  PractitionerStats,
  SpecialtySummary,
} from "@/types/practitioner";
import { apiBlobRequest, apiPaginatedRequest, apiRequest, toQueryString } from "./apiClient";

export const practitionerService = {
  listPractitioners(
    query: PractitionerListQuery,
    signal?: AbortSignal,
  ): Promise<PaginatedResult<Practitioner>> {
    return apiPaginatedRequest<Practitioner>(`/practitioners${toQueryString({ ...query })}`, {
      isAuthenticated: true,
      signal,
    });
  },

  getPractitionerStats(): Promise<PractitionerStats> {
    return apiRequest<PractitionerStats>("/practitioners/stats", { isAuthenticated: true });
  },

  getPractitioner(practitionerId: string, signal?: AbortSignal): Promise<Practitioner> {
    return apiRequest<Practitioner>(`/practitioners/${practitionerId}`, {
      isAuthenticated: true,
      signal,
    });
  },

  listLicenses(practitionerId: string, signal?: AbortSignal): Promise<PractitionerLicense[]> {
    return apiRequest<PractitionerLicense[]>(`/practitioners/${practitionerId}/licenses`, {
      isAuthenticated: true,
      signal,
    });
  },

  listDocuments(practitionerId: string, signal?: AbortSignal): Promise<PractitionerDocument[]> {
    return apiRequest<PractitionerDocument[]>(`/practitioners/${practitionerId}/documents`, {
      isAuthenticated: true,
      signal,
    });
  },

  downloadDocument(practitionerId: string, documentId: string) {
    return apiBlobRequest(`/practitioners/${practitionerId}/documents/${documentId}/content`);
  },

  /** Staff onboarding: invited user account + DRAFT profile + specialties + locations. */
  createPractitioner(payload: CreatePractitionerPayload): Promise<Practitioner> {
    return apiRequest<Practitioner>("/practitioners", {
      method: "POST",
      body: payload,
      isAuthenticated: true,
    });
  },

  /** Multipart upload; field order matters to the backend: "category" before "file". */
  uploadDocument(
    practitionerId: string,
    category: PractitionerDocumentCategory,
    file: File,
  ): Promise<PractitionerDocument> {
    const formData = new FormData();
    formData.append("category", category);
    formData.append("file", file);
    return apiRequest<PractitionerDocument>(`/practitioners/${practitionerId}/documents`, {
      method: "POST",
      body: formData,
      isAuthenticated: true,
    });
  },

  addLicense(practitionerId: string, payload: CreateLicensePayload): Promise<unknown> {
    return apiRequest<unknown>(`/practitioners/${practitionerId}/licenses`, {
      method: "POST",
      body: payload,
      isAuthenticated: true,
    });
  },

  addTelemedicineJurisdiction(practitionerId: string, stateCode: string): Promise<unknown> {
    return apiRequest<unknown>(`/practitioners/${practitionerId}/telemedicine-jurisdictions`, {
      method: "POST",
      body: { stateCode },
      isAuthenticated: true,
    });
  },

  addSchedule(practitionerId: string, payload: CreateSchedulePayload): Promise<unknown> {
    return apiRequest<unknown>(`/practitioners/${practitionerId}/schedules`, {
      method: "POST",
      body: payload,
      isAuthenticated: true,
    });
  },

  addScheduleBlock(practitionerId: string, payload: CreateScheduleBlockPayload): Promise<unknown> {
    return apiRequest<unknown>(`/practitioners/${practitionerId}/schedule-blocks`, {
      method: "POST",
      body: payload,
      isAuthenticated: true,
    });
  },

  /** Active organization locations (practice locations to assign a provider to). */
  listLocations(): Promise<OrganizationLocation[]> {
    return apiPaginatedRequest<OrganizationLocation>("/locations?limit=100", {
      isAuthenticated: true,
    }).then((result) => result.items);
  },

  /** Active specialty catalog (public endpoint) — used for the specialty filter. */
  listSpecialties(): Promise<SpecialtySummary[]> {
    return apiRequest<SpecialtySummary[]>("/specialties");
  },
};
