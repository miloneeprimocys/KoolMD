import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { PaginationMeta, RequestStatus } from "@/types/api";
import type {
  AdministrativeGender,
  PatientListQuery,
  PatientStats,
  PatientStatus,
  PatientSummary,
} from "@/types/patient";
import { createPatient, fetchPatients, fetchPatientStats } from "@/redux/thunks/patientThunks";
import { toQueryKey, type RequestError } from "@/redux/thunks/thunkHelpers";
import { logoutUser } from "@/redux/thunks/authThunks";
import { sessionExpired } from "./authSlice";

export const PATIENTS_PAGE_SIZE = 10;

export interface PatientsState {
  /** Current filters / page — kept in the store so they survive leaving and re-opening the page. */
  query: PatientListQuery;
  list: {
    items: PatientSummary[];
    pagination: PaginationMeta | null;
    status: RequestStatus;
    error: RequestError | null;
    /** Query the current items belong to (dedupes identical requests). */
    queryKey: string | null;
    /** Latest request; responses from older, superseded requests are ignored. */
    activeRequestId: string | null;
    fetchedAt: number | null;
  };
  stats: {
    data: PatientStats | null;
    status: RequestStatus;
    error: RequestError | null;
    fetchedAt: number | null;
  };
  create: {
    status: RequestStatus;
    error: RequestError | null;
  };
}

const initialQuery: PatientListQuery = {
  page: 1,
  limit: PATIENTS_PAGE_SIZE,
  search: "",
  status: "",
  administrativeGender: "",
  sortBy: "lastName",
  sortOrder: "asc", // A → Z (backend default is desc)
};

const initialState: PatientsState = {
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
  create: { status: "idle", error: null },
};

const patientsSlice = createSlice({
  name: "patients",
  initialState,
  reducers: {
    /** Any filter change goes back to page 1. */
    setPatientSearch(state, action: PayloadAction<string>) {
      state.query.search = action.payload;
      state.query.page = 1;
    },
    setPatientStatusFilter(state, action: PayloadAction<PatientStatus | "">) {
      state.query.status = action.payload;
      state.query.page = 1;
    },
    setPatientGenderFilter(state, action: PayloadAction<AdministrativeGender | "">) {
      state.query.administrativeGender = action.payload;
      state.query.page = 1;
    },
    setPatientPage(state, action: PayloadAction<number>) {
      state.query.page = action.payload;
    },
    resetCreatePatientRequest(state) {
      state.create = initialState.create;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPatients.pending, (state, action) => {
        state.list.status = "pending";
        state.list.error = null;
        state.list.queryKey = toQueryKey(action.meta.arg);
        state.list.activeRequestId = action.meta.requestId;
      })
      .addCase(fetchPatients.fulfilled, (state, action) => {
        if (action.meta.requestId !== state.list.activeRequestId) return;
        state.list.items = action.payload.items;
        state.list.pagination = action.payload.pagination;
        state.list.status = "succeeded";
        state.list.fetchedAt = Date.now();
      })
      .addCase(fetchPatients.rejected, (state, action) => {
        if (action.meta.requestId !== state.list.activeRequestId) return;
        state.list.status = "failed";
        state.list.error = action.payload ?? null;
      })

      .addCase(fetchPatientStats.pending, (state) => {
        state.stats.status = "pending";
        state.stats.error = null;
      })
      .addCase(fetchPatientStats.fulfilled, (state, action) => {
        state.stats.data = action.payload;
        state.stats.status = "succeeded";
        state.stats.fetchedAt = Date.now();
      })
      .addCase(fetchPatientStats.rejected, (state, action) => {
        state.stats.status = "failed";
        state.stats.error = action.payload ?? null;
      })

      .addCase(createPatient.pending, (state) => {
        state.create = { status: "pending", error: null };
      })
      .addCase(createPatient.fulfilled, (state) => {
        state.create = { status: "succeeded", error: null };
        // New patient changes the list and the counts — force a fresh load next time.
        state.list.fetchedAt = null;
        state.stats.fetchedAt = null;
      })
      .addCase(createPatient.rejected, (state, action) => {
        state.create = { status: "failed", error: action.payload ?? null };
      })

      // Patient data is PHI — never keep it in memory after sign-out.
      .addCase(logoutUser.fulfilled, () => initialState)
      .addCase(sessionExpired, () => initialState);
  },
});

export const {
  setPatientSearch,
  setPatientStatusFilter,
  setPatientGenderFilter,
  setPatientPage,
  resetCreatePatientRequest,
} = patientsSlice.actions;

export default patientsSlice.reducer;
