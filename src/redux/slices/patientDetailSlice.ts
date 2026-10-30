import { createSlice, isAnyOf } from "@reduxjs/toolkit";
import type { RequestStatus } from "@/types/api";
import type {
  EmergencyContact,
  PatientAppointment,
  PatientDetail,
  PatientInsurance,
} from "@/types/patient";
import {
  deleteEmergencyContact,
  fetchPatientDetail,
  saveEmergencyContact,
  saveInsurance,
} from "@/redux/thunks/patientDetailThunks";
import {
  changePatientStatus,
  invitePatientToPortal,
  updatePatient,
} from "@/redux/thunks/patientThunks";
import type { RequestError } from "@/redux/thunks/thunkHelpers";
import { logoutUser } from "@/redux/thunks/authThunks";
import { sessionExpired } from "./authSlice";

export interface PatientDetailState {
  detail: {
    /** Patient the data below belongs to. */
    patientId: string | null;
    patient: PatientDetail | null;
    emergencyContacts: EmergencyContact[];
    insurances: PatientInsurance[];
    recentAppointments: PatientAppointment[];
    recentAppointmentsError: RequestError | null;
    status: RequestStatus;
    error: RequestError | null;
    /** Latest request; responses for a previously opened patient are ignored. */
    activeRequestId: string | null;
    fetchedAt: number | null;
  };
}

const emptyPatientData = {
  patient: null,
  emergencyContacts: [],
  insurances: [],
  recentAppointments: [],
  recentAppointmentsError: null,
};

const initialState: PatientDetailState = {
  detail: {
    patientId: null,
    ...emptyPatientData,
    status: "idle",
    error: null,
    activeRequestId: null,
    fetchedAt: null,
  },
};

const patientDetailSlice = createSlice({
  name: "patientDetail",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPatientDetail.pending, (state, action) => {
        const isOtherPatient = state.detail.patientId !== action.meta.arg;
        state.detail = {
          ...state.detail,
          // Never show the previous patient's data while another one loads.
          ...(isOtherPatient ? emptyPatientData : {}),
          patientId: action.meta.arg,
          status: "pending",
          error: null,
          activeRequestId: action.meta.requestId,
        };
      })
      .addCase(fetchPatientDetail.fulfilled, (state, action) => {
        if (action.meta.requestId !== state.detail.activeRequestId) return;
        state.detail = {
          ...state.detail,
          ...action.payload,
          status: "succeeded",
          fetchedAt: Date.now(),
        };
      })
      .addCase(fetchPatientDetail.rejected, (state, action) => {
        if (action.meta.requestId !== state.detail.activeRequestId) return;
        state.detail.status = "failed";
        state.detail.error = action.payload ?? null;
      })

      .addCase(saveInsurance.fulfilled, (state, action) => {
        if (state.detail.patientId === action.meta.arg.patientId) {
          state.detail.insurances = action.payload;
        }
      })

      // Patient data is PHI — never keep it in memory after sign-out.
      .addCase(logoutUser.fulfilled, () => initialState)
      .addCase(sessionExpired, () => initialState)

      // Profile changes return the saved patient: show it at once instead of the cached copy.
      .addMatcher(
        isAnyOf(updatePatient.fulfilled, changePatientStatus.fulfilled, invitePatientToPortal.fulfilled),
        (state, action) => {
          if (state.detail.patientId === action.meta.arg.patientId) {
            state.detail.patient = action.payload;
          }
        },
      )
      .addMatcher(
        isAnyOf(saveEmergencyContact.fulfilled, deleteEmergencyContact.fulfilled),
        (state, action) => {
          if (state.detail.patientId === action.meta.arg.patientId) {
            state.detail.emergencyContacts = action.payload;
          }
        },
      );
  },
});

export default patientDetailSlice.reducer;
