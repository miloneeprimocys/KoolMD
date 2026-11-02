import { createAsyncThunk } from "@reduxjs/toolkit";
import type { PaginatedResult } from "@/types/api";
import type {
  ChangePatientStatusPayload,
  CompleteOwnPatientProfilePayload,
  CreateEmergencyContactPayload,
  CreatePatientPayload,
  PatientDetail,
  PatientListQuery,
  PatientStats,
  PatientSummary,
  UpdatePatientPayload,
} from "@/types/patient";
import { patientService } from "@/redux/services/patientService";
import type { PatientsState } from "@/redux/slices/patientsSlice";
import { isFresh, toQueryKey, toRequestError, type RequestError } from "./thunkHelpers";

interface PatientThunkConfig {
  state: { patients: PatientsState };
  rejectValue: RequestError;
}

/**
 * Skipped when the same query is already loading or was loaded moments ago — covers
 * StrictMode double effects, re-renders and navigating back to the page.
 */
export const fetchPatients = createAsyncThunk<
  PaginatedResult<PatientSummary>,
  PatientListQuery,
  PatientThunkConfig
>(
  "patients/fetchList",
  async (query, { rejectWithValue, signal }) => {
    try {
      return await patientService.listPatients(query, signal);
    } catch (error) {
      return rejectWithValue(toRequestError(error));
    }
  },
  {
    condition: (query, { getState }) => {
      const { list } = getState().patients;
      if (list.queryKey !== toQueryKey(query)) return true;
      return list.status !== "pending" && !(list.status === "succeeded" && isFresh(list.fetchedAt));
    },
  },
);

export const fetchPatientStats = createAsyncThunk<PatientStats, void, PatientThunkConfig>(
  "patients/fetchStats",
  async (_, { rejectWithValue }) => {
    try {
      return await patientService.getPatientStats();
    } catch (error) {
      return rejectWithValue(toRequestError(error));
    }
  },
  {
    condition: (_, { getState }) => {
      const { stats } = getState().patients;
      return stats.status !== "pending" && !(stats.status === "succeeded" && isFresh(stats.fetchedAt));
    },
  },
);

export interface CreatePatientRequest {
  patient: CreatePatientPayload;
  /** Added right after the patient is created, when the form has one. */
  emergencyContact?: CreateEmergencyContactPayload;
}

export interface CreatePatientResult {
  patient: PatientSummary;
  /** Patient was saved but the emergency contact was not (shown as a warning). */
  emergencyContactError: RequestError | null;
}

export const createPatient = createAsyncThunk<
  CreatePatientResult,
  CreatePatientRequest,
  PatientThunkConfig
>(
  "patients/create",
  async ({ patient, emergencyContact }, { rejectWithValue }) => {
    let createdPatient: PatientSummary;
    try {
      createdPatient = await patientService.createPatient(patient);
    } catch (error) {
      return rejectWithValue(toRequestError(error));
    }

    let emergencyContactError: RequestError | null = null;
    if (emergencyContact) {
      try {
        await patientService.addEmergencyContact(createdPatient.id, {
          ...emergencyContact,
          isPrimary: true,
        });
      } catch (error) {
        emergencyContactError = toRequestError(error);
      }
    }
    return { patient: createdPatient, emergencyContactError };
  },
  // Blocks double submits while a save is in flight.
  { condition: (_, { getState }) => getState().patients.create.status !== "pending" },
);

export const updatePatient = createAsyncThunk<
  PatientDetail,
  { patientId: string; payload: UpdatePatientPayload },
  PatientThunkConfig
>(
  "patients/update",
  async ({ patientId, payload }, { rejectWithValue }) => {
    try {
      return await patientService.updatePatient(patientId, payload);
    } catch (error) {
      return rejectWithValue(toRequestError(error));
    }
  },
);

export const changePatientStatus = createAsyncThunk<
  PatientDetail,
  { patientId: string; payload: ChangePatientStatusPayload },
  PatientThunkConfig
>(
  "patients/changeStatus",
  async ({ patientId, payload }, { rejectWithValue }) => {
    try {
      return await patientService.changePatientStatus(patientId, payload);
    } catch (error) {
      return rejectWithValue(toRequestError(error));
    }
  },
);

export const invitePatientToPortal = createAsyncThunk<
  PatientDetail,
  { patientId: string },
  PatientThunkConfig
>(
  "patients/inviteToPortal",
  async ({ patientId }, { rejectWithValue }) => {
    try {
      return await patientService.invitePatientToPortal(patientId);
    } catch (error) {
      return rejectWithValue(toRequestError(error));
    }
  },
);

export const completeOwnProfile = createAsyncThunk<
  PatientDetail,
  CompleteOwnPatientProfilePayload,
  PatientThunkConfig
>(
  "patients/completeOwnProfile",
  async (payload, { rejectWithValue }) => {
    try {
      return await patientService.completeOwnProfile(payload);
    } catch (error) {
      return rejectWithValue(toRequestError(error));
    }
  },
);
