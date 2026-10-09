import { createAsyncThunk } from "@reduxjs/toolkit";
import type { PaginatedResult } from "@/types/api";
import type {
  Practitioner,
  PractitionerListQuery,
  PractitionerStats,
  SpecialtySummary,
} from "@/types/practitioner";
import { practitionerService } from "@/redux/services/practitionerService";
import type { PractitionersState } from "@/redux/slices/practitionersSlice";
import { isFresh, toQueryKey, toRequestError, type RequestError } from "./thunkHelpers";

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
