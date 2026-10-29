import { createAsyncThunk } from "@reduxjs/toolkit";
import type {
  EmergencyContact,
  PatientAppointment,
  PatientDetail,
  PatientInsurance,
} from "@/types/patient";
import { patientService } from "@/redux/services/patientService";
import type { PatientDetailState } from "@/redux/slices/patientDetailSlice";
import { isFresh, toRequestError, type RequestError } from "./thunkHelpers";

interface PatientDetailThunkConfig {
  state: { patientDetail: PatientDetailState };
  rejectValue: RequestError;
}

/** How many appointments the overview card shows. */
export const RECENT_APPOINTMENTS_LIMIT = 3;

export interface PatientDetailBundle {
  patient: PatientDetail;
  emergencyContacts: EmergencyContact[];
  insurances: PatientInsurance[];
  recentAppointments: PatientAppointment[];
  /** Appointments are optional for this screen: their failure must not hide the patient. */
  recentAppointmentsError: RequestError | null;
}

/**
 * Profile, emergency contacts, insurance and recent appointments in parallel. Skipped when the
 * same patient is already loading or was loaded moments ago (StrictMode, re-renders, coming back).
 */
export const fetchPatientDetail = createAsyncThunk<
  PatientDetailBundle,
  string,
  PatientDetailThunkConfig
>(
  "patientDetail/fetch",
  async (patientId, { rejectWithValue, signal }) => {
    const appointmentsRequest = patientService
      .listRecentAppointments(patientId, RECENT_APPOINTMENTS_LIMIT, signal)
      .then(
        (result) => ({ items: result.items, error: null }),
        (error: unknown) => ({ items: [] as PatientAppointment[], error: toRequestError(error) }),
      );
    try {
      const [patient, emergencyContacts, insurances, appointments] = await Promise.all([
        patientService.getPatient(patientId, signal),
        patientService.listEmergencyContacts(patientId, signal),
        patientService.listInsurances(patientId, signal),
        appointmentsRequest,
      ]);
      return {
        patient,
        emergencyContacts,
        insurances,
        recentAppointments: appointments.items,
        recentAppointmentsError: appointments.error,
      };
    } catch (error) {
      return rejectWithValue(toRequestError(error));
    }
  },
  {
    condition: (patientId, { getState }) => {
      const { detail } = getState().patientDetail;
      if (detail.patientId !== patientId) return true;
      return (
        detail.status !== "pending" && !(detail.status === "succeeded" && isFresh(detail.fetchedAt))
      );
    },
  },
);
