import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { PaginationMeta, RequestStatus } from "@/types/api";
import type {
  Practitioner,
  PractitionerListQuery,
  PractitionerOnboardingStatus,
  PractitionerStats,
  SpecialtySummary,
} from "@/types/practitioner";
import {
  fetchPractitioners,
  fetchPractitionerStats,
  fetchSpecialties,
} from "@/redux/thunks/practitionerThunks";
import { toQueryKey, type RequestError } from "@/redux/thunks/thunkHelpers";
import { logoutUser } from "@/redux/thunks/authThunks";
import { sessionExpired } from "./authSlice";

export const PRACTITIONERS_PAGE_SIZE = 10;

export interface PractitionersState {
  /** Current filters / page — kept in the store so they survive leaving and re-opening the page. */
  query: PractitionerListQuery;
  list: {
    items: Practitioner[];
    pagination: PaginationMeta | null;
    status: RequestStatus;
    error: RequestError | null;
    queryKey: string | null;
    /** Latest request; responses from older, superseded requests are ignored. */
    activeRequestId: string | null;
    fetchedAt: number | null;
  };
  stats: {
    data: PractitionerStats | null;
    status: RequestStatus;
    error: RequestError | null;
    fetchedAt: number | null;
  };
  specialties: {
    items: SpecialtySummary[];
    status: RequestStatus;
  };
}

const initialQuery: PractitionerListQuery = {
  page: 1,
  limit: PRACTITIONERS_PAGE_SIZE,
  search: "",
  onboardingStatus: "",
  specialtyId: "",
  sortBy: "lastName",
  sortOrder: "asc", // A → Z (backend default is desc)
};

const initialState: PractitionersState = {
  query: initialQuery,
  list: {
    items: [],
    pagination: null,
    status: "idle",
    error: null,
    queryKey: null,
    activeRequestId: null,
    fetchedAt: null,
  },
  stats: { data: null, status: "idle", error: null, fetchedAt: null },
  specialties: { items: [], status: "idle" },
};

const practitionersSlice = createSlice({
  name: "practitioners",
  initialState,
  reducers: {
    /** Any filter change goes back to page 1. */
    setPractitionerSearch(state, action: PayloadAction<string>) {
      state.query.search = action.payload;
      state.query.page = 1;
    },
    setPractitionerStatusFilter(state, action: PayloadAction<PractitionerOnboardingStatus | "">) {
      state.query.onboardingStatus = action.payload;
      state.query.page = 1;
    },
    setPractitionerSpecialtyFilter(state, action: PayloadAction<string>) {
      state.query.specialtyId = action.payload;
      state.query.page = 1;
    },
    setPractitionerPage(state, action: PayloadAction<number>) {
      state.query.page = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPractitioners.pending, (state, action) => {
        state.list.status = "pending";
        state.list.error = null;
        state.list.queryKey = toQueryKey(action.meta.arg);
        state.list.activeRequestId = action.meta.requestId;
      })
      .addCase(fetchPractitioners.fulfilled, (state, action) => {
        if (action.meta.requestId !== state.list.activeRequestId) return;
        state.list.items = action.payload.items;
        state.list.pagination = action.payload.pagination;
        state.list.status = "succeeded";
        state.list.fetchedAt = Date.now();
      })
      .addCase(fetchPractitioners.rejected, (state, action) => {
        if (action.meta.requestId !== state.list.activeRequestId) return;
        state.list.status = "failed";
        state.list.error = action.payload ?? null;
      })

      .addCase(fetchPractitionerStats.pending, (state) => {
        state.stats.status = "pending";
        state.stats.error = null;
      })
      .addCase(fetchPractitionerStats.fulfilled, (state, action) => {
        state.stats.data = action.payload;
        state.stats.status = "succeeded";
        state.stats.fetchedAt = Date.now();
      })
      .addCase(fetchPractitionerStats.rejected, (state, action) => {
        state.stats.status = "failed";
        state.stats.error = action.payload ?? null;
      })

      .addCase(fetchSpecialties.pending, (state) => {
        state.specialties.status = "pending";
      })
      .addCase(fetchSpecialties.fulfilled, (state, action) => {
        state.specialties.items = action.payload;
        state.specialties.status = "succeeded";
      })
      .addCase(fetchSpecialties.rejected, (state) => {
        state.specialties.status = "failed";
      })

      .addCase(logoutUser.fulfilled, () => initialState)
      .addCase(sessionExpired, () => initialState);
  },
});

export const {
  setPractitionerSearch,
  setPractitionerStatusFilter,
  setPractitionerSpecialtyFilter,
  setPractitionerPage,
} = practitionersSlice.actions;

export default practitionersSlice.reducer;
