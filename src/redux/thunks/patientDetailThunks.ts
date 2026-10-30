import { createAsyncThunk } from "@reduxjs/toolkit";
import type {
  CreateEmergencyContactPayload,
  CreateInsurancePayload,
  EmergencyContact,
  PatientAppointment,
  PatientDetail,
  PatientInsurance,
  UpdateEmergencyContactPayload,
  UpdateInsurancePayload,
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

/* ---------- Emergency contacts ---------- */

export type SaveEmergencyContactRequest =
  | { patientId: string; contactId?: undefined; payload: CreateEmergencyContactPayload }
  | { patientId: string; contactId: string; payload: UpdateEmergencyContactPayload };

/**
 * Creates (no `contactId`) or updates a contact, then reloads the list: making one contact primary
 * unsets the previous one, so the server's list is the only reliable result.
 */
export const saveEmergencyContact = createAsyncThunk<
  EmergencyContact[],
  SaveEmergencyContactRequest,
  PatientDetailThunkConfig
>("patientDetail/saveEmergencyContact", async (request, { rejectWithValue }) => {
  try {
    if (request.contactId === undefined) {
      await patientService.addEmergencyContact(request.patientId, request.payload);
    } else {
      await patientService.updateEmergencyContact(request.patientId, request.contactId, request.payload);
    }
    return await patientService.listEmergencyContacts(request.patientId);
  } catch (error) {
    return rejectWithValue(toRequestError(error));
  }
});

export const deleteEmergencyContact = createAsyncThunk<
  EmergencyContact[],
  { patientId: string; contactId: string },
  PatientDetailThunkConfig
>("patientDetail/deleteEmergencyContact", async ({ patientId, contactId }, { rejectWithValue }) => {
  try {
    await patientService.deleteEmergencyContact(patientId, contactId);
    return await patientService.listEmergencyContacts(patientId);
  } catch (error) {
    return rejectWithValue(toRequestError(error));
  }
});

/* ---------- Insurance ---------- */

export type SaveInsuranceRequest =
  | { patientId: string; insuranceId?: undefined; payload: CreateInsurancePayload }
  | { patientId: string; insuranceId: string; payload: UpdateInsurancePayload };

/** Creates (no `insuranceId`) or updates coverage, then reloads the list (priority order). */
export const saveInsurance = createAsyncThunk<
  PatientInsurance[],
  SaveInsuranceRequest,
  PatientDetailThunkConfig
>("patientDetail/saveInsurance", async (request, { rejectWithValue }) => {
  try {
    if (request.insuranceId === undefined) {
      await patientService.createInsurance(request.patientId, request.payload);
    } else {
      await patientService.updateInsurance(request.patientId, request.insuranceId, request.payload);
    }
    return await patientService.listInsurances(request.patientId);
  } catch (error) {
    return rejectWithValue(toRequestError(error));
  }
});
