import { createSlice, type ActionReducerMapBuilder, type AsyncThunk } from "@reduxjs/toolkit";
import type { RequestStatus } from "@/types/api";
import type {
  MedicationStatement,
  PatientAllergies,
  PatientDocument,
  PatientMedicalHistory,
} from "@/types/patient";
import {
  changeDocuments,
  changeMedicalHistory,
  changeMedication,
  fetchAllergies,
  fetchDocuments,
  fetchMedicalHistory,
  fetchMedications,
  saveAllergy,
  setNoKnownAllergies,
  type PatientRecordsThunkConfig,
} from "@/redux/thunks/patientRecordsThunks";
import type { RequestError } from "@/redux/thunks/thunkHelpers";
import { logoutUser } from "@/redux/thunks/authThunks";
import { sessionExpired } from "./authSlice";

/** One patient's copy of a record list, with its load state. */
export interface RecordState<TData> {
  /** Patient the data belongs to. */
  patientId: string | null;
  data: TData | null;
  status: RequestStatus;
  error: RequestError | null;
  /** Latest request; responses for a previously opened patient are ignored. */
  activeRequestId: string | null;
  fetchedAt: number | null;
}

export interface PatientRecordsState {
  allergies: RecordState<PatientAllergies>;
  medications: RecordState<MedicationStatement[]>;
  medicalHistory: RecordState<PatientMedicalHistory>;
  documents: RecordState<PatientDocument[]>;
}

export type RecordSection = keyof PatientRecordsState;
type SectionData<TSection extends RecordSection> = NonNullable<PatientRecordsState[TSection]["data"]>;

const emptyRecord = <TData>(): RecordState<TData> => ({
  patientId: null,
  data: null,
  status: "idle",
  error: null,
  activeRequestId: null,
  fetchedAt: null,
});

const initialState: PatientRecordsState = {
  allergies: emptyRecord(),
  medications: emptyRecord(),
  medicalHistory: emptyRecord(),
  documents: emptyRecord(),
};

/** pending / fulfilled / rejected of a section's fetch thunk (argument = patient id). */
function addFetchCases<TSection extends RecordSection>(
  builder: ActionReducerMapBuilder<PatientRecordsState>,
  section: TSection,
  thunk: AsyncThunk<SectionData<TSection>, string, PatientRecordsThunkConfig>,
) {
  builder
    .addCase(thunk.pending, (state, action) => {
      const record = state[section];
      // Never show another patient's records while this one loads.
      if (record.patientId !== action.meta.arg) record.data = null;
      record.patientId = action.meta.arg;
      record.status = "pending";
      record.error = null;
      record.activeRequestId = action.meta.requestId;
    })
    .addCase(thunk.fulfilled, (state, action) => {
      const record = state[section];
      if (action.meta.requestId !== record.activeRequestId) return;
      record.data = action.payload;
      record.status = "succeeded";
      record.fetchedAt = Date.now();
    })
    .addCase(thunk.rejected, (state, action) => {
      const record = state[section];
      if (action.meta.requestId !== record.activeRequestId) return;
      record.status = "failed";
      record.error = action.payload ?? null;
    });
}

/** A change returns the reloaded list: replace the copy if it belongs to the same patient. */
function addReloadCase<TSection extends RecordSection, TArg extends { patientId: string }>(
  builder: ActionReducerMapBuilder<PatientRecordsState>,
  section: TSection,
  thunk: AsyncThunk<SectionData<TSection>, TArg, PatientRecordsThunkConfig>,
) {
  builder.addCase(thunk.fulfilled, (state, action) => {
    const record = state[section];
    if (record.patientId !== action.meta.arg.patientId) return;
    record.data = action.payload;
    record.status = "succeeded";
    record.fetchedAt = Date.now();
  });
}

const patientRecordsSlice = createSlice({
  name: "patientRecords",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    addFetchCases(builder, "allergies", fetchAllergies);
    addReloadCase(builder, "allergies", saveAllergy);
    addReloadCase(builder, "allergies", setNoKnownAllergies);

    addFetchCases(builder, "medications", fetchMedications);
    addReloadCase(builder, "medications", changeMedication);

    addFetchCases(builder, "medicalHistory", fetchMedicalHistory);

    addFetchCases(builder, "documents", fetchDocuments);
    addReloadCase(builder, "documents", changeDocuments);

    builder
      // A change returns only the section it touched: merge it into the loaded tab data.
      .addCase(changeMedicalHistory.fulfilled, (state, action) => {
        const record = state.medicalHistory;
        if (record.patientId !== action.meta.arg.patientId || !record.data) return;
        record.data = { ...record.data, ...action.payload };
        record.fetchedAt = Date.now();
      })
      // Clinical data is PHI — never keep it in memory after sign-out.
      .addCase(logoutUser.fulfilled, () => initialState)
      .addCase(sessionExpired, () => initialState);
  },
});

export default patientRecordsSlice.reducer;
