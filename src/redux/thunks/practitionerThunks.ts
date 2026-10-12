import { createAsyncThunk } from "@reduxjs/toolkit";
import type { PaginatedResult } from "@/types/api";
import type {
  CreateLicensePayload,
  CreatePractitionerPayload,
  CreateScheduleBlockPayload,
  OrganizationLocation,
  PlannedSchedule,
  Practitioner,
  PractitionerListQuery,
  PractitionerStats,
  SpecialtySummary,
} from "@/types/practitioner";
import { practitionerService } from "@/redux/services/practitionerService";
import type { PractitionersState } from "@/redux/slices/practitionersSlice";
import { isFresh, toQueryKey, toRequestError, type RequestError } from "./thunkHelpers";

const WEEKDAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

interface PractitionerThunkConfig {
  state: { practitioners: PractitionersState };
  rejectValue: RequestError;
}

/** Skipped when the same query is already loading or was loaded moments ago. */
export const fetchPractitioners = createAsyncThunk<
  PaginatedResult<Practitioner>,
  PractitionerListQuery,
  PractitionerThunkConfig
>(
  "practitioners/fetchList",
  async (query, { rejectWithValue, signal }) => {
    try {
      return await practitionerService.listPractitioners(query, signal);
    } catch (error) {
      return rejectWithValue(toRequestError(error));
    }
  },
  {
    condition: (query, { getState }) => {
      const { list } = getState().practitioners;
      if (list.queryKey !== toQueryKey(query)) return true;
      return list.status !== "pending" && !(list.status === "succeeded" && isFresh(list.fetchedAt));
    },
  },
);

export const fetchPractitionerStats = createAsyncThunk<
  PractitionerStats,
  void,
  PractitionerThunkConfig
>(
  "practitioners/fetchStats",
  async (_, { rejectWithValue }) => {
    try {
      return await practitionerService.getPractitionerStats();
    } catch (error) {
      return rejectWithValue(toRequestError(error));
    }
  },
  {
    condition: (_, { getState }) => {
      const { stats } = getState().practitioners;
      return stats.status !== "pending" && !(stats.status === "succeeded" && isFresh(stats.fetchedAt));
    },
  },
);

/** Catalog rarely changes — loaded once per session. */
export const fetchSpecialties = createAsyncThunk<SpecialtySummary[], void, PractitionerThunkConfig>(
  "practitioners/fetchSpecialties",
  async (_, { rejectWithValue }) => {
    try {
      return await practitionerService.listSpecialties();
    } catch (error) {
      return rejectWithValue(toRequestError(error));
    }
  },
  {
    condition: (_, { getState }) => {
      const { specialties } = getState().practitioners;
      return specialties.status === "idle" || specialties.status === "failed";
    },
  },
);

/** Org locations rarely change — loaded once per session. */
export const fetchLocations = createAsyncThunk<OrganizationLocation[], void, PractitionerThunkConfig>(
  "practitioners/fetchLocations",
  async (_, { rejectWithValue }) => {
    try {
      return await practitionerService.listLocations();
    } catch (error) {
      return rejectWithValue(toRequestError(error));
    }
  },
  {
    condition: (_, { getState }) => {
      const { locations } = getState().practitioners;
      return locations.status === "idle" || locations.status === "failed";
    },
  },
);

/** A license plus the optional file that proves it (uploaded first, then linked). */
export interface LicenseToAdd {
  /** Human label used in warnings, e.g. "DEA registration" */
  label: string;
  license: Omit<CreateLicensePayload, "documentId">;
  file: File | null;
}

export interface OnboardProviderRequest {
  practitioner: CreatePractitionerPayload;
  licenses: LicenseToAdd[];
  telemedicineStateCodes: string[];
  /** Weekly windows; `sourceLabel` names the location (or "Telemedicine") in warnings. */
  schedules: PlannedSchedule[];
  scheduleBlocks: CreateScheduleBlockPayload[];
}

export interface OnboardProviderResult {
  practitioner: Practitioner;
  /** Steps that failed after the provider was created (shown as warnings). */
  followUpErrors: string[];
}

/**
 * Add Provider flow:
 *   1. create provider (account invite + DRAFT profile + specialties + locations) — must succeed
 *   2. upload each license file and add the license
 *   3. declare telemedicine states (needs a state license in that state)
 *   4. weekly working windows, then time off (blocked dates)
 * Steps 2-4 never undo step 1; their failures are returned so the user knows what to finish.
 * The profile stays DRAFT: only the provider may submit it for review (after accepting the invite).
 */
export const onboardProvider = createAsyncThunk<
  OnboardProviderResult,
  OnboardProviderRequest,
  PractitionerThunkConfig
>(
  "practitioners/onboard",
  async (
    { practitioner, licenses, telemedicineStateCodes, schedules, scheduleBlocks },
    { rejectWithValue },
  ) => {
    let createdPractitioner: Practitioner;
    try {
      createdPractitioner = await practitionerService.createPractitioner(practitioner);
    } catch (error) {
      return rejectWithValue(toRequestError(error));
    }
    const practitionerId = createdPractitioner.id;
    const followUpErrors: string[] = [];

    for (const { label, license, file } of licenses) {
      try {
        const document = file
          ? await practitionerService.uploadDocument(practitionerId, "LICENSE", file)
          : null;
        await practitionerService.addLicense(practitionerId, {
          ...license,
          documentId: document?.id,
        });
      } catch (error) {
        followUpErrors.push(`${label}: ${toRequestError(error).message}`);
      }
    }

    for (const stateCode of telemedicineStateCodes) {
      try {
        await practitionerService.addTelemedicineJurisdiction(practitionerId, stateCode);
      } catch (error) {
        followUpErrors.push(`Telemedicine (${stateCode}): ${toRequestError(error).message}`);
      }
    }

    for (const { payload, sourceLabel } of schedules) {
      try {
        await practitionerService.addSchedule(practitionerId, payload);
      } catch (error) {
        const windowLabel = `${WEEKDAY_NAMES[payload.dayOfWeek - 1]} ${payload.startTime}–${payload.endTime}`;
        followUpErrors.push(`${sourceLabel} ${windowLabel}: ${toRequestError(error).message}`);
      }
    }

    for (const block of scheduleBlocks) {
      try {
        await practitionerService.addScheduleBlock(practitionerId, block);
      } catch (error) {
        followUpErrors.push(`Blocked date: ${toRequestError(error).message}`);
      }
    }

    return { practitioner: createdPractitioner, followUpErrors };
  },
  // Blocks double submits while onboarding is in flight.
  { condition: (_, { getState }) => getState().practitioners.create.status !== "pending" },
);
