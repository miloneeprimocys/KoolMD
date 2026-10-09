import type { PaginatedResult } from "@/types/api";
import type {
  Practitioner,
  PractitionerListQuery,
  PractitionerStats,
  SpecialtySummary,
} from "@/types/practitioner";
import { apiPaginatedRequest, apiRequest, toQueryString } from "./apiClient";

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

  /** Active specialty catalog (public endpoint) — used for the specialty filter. */
  listSpecialties(): Promise<SpecialtySummary[]> {
    return apiRequest<SpecialtySummary[]>("/specialties");
  },
};
