import { createAsyncThunk } from "@reduxjs/toolkit";
import type {
  CreateAllergyPayload,
  CreateConditionPayload,
  CreateMedicationStatementPayload,
  FamilyHistoryEntry,
  FamilyHistoryPayload,
  ImmunizationPayload,
  MedicationStatement,
  PatientAllergies,
  PatientCondition,
  PatientDocument,
  PatientDocumentCategory,
  PatientImmunization,
  PatientMedicalHistory,
  SocialHistoryPayload,
  SurgicalHistoryEntry,
  SurgicalHistoryPayload,
  UpdateAllergyPayload,
  UpdateConditionPayload,
  UpdateMedicationStatementPayload,
} from "@/types/patient";
import { patientRecordsService, type HistoryListPath } from "@/redux/services/patientRecordsService";
import type { PatientRecordsState, RecordSection } from "@/redux/slices/patientRecordsSlice";
import { isFresh, toRequestError, type RequestError } from "./thunkHelpers";

export interface PatientRecordsThunkConfig {
  state: { patientRecords: PatientRecordsState };
  rejectValue: RequestError;
}

/**
 * Loads a section unless the same patient's copy is loading or fresh. Every list read is
 * audited by the API as a chart view, so tab switching must not refetch each time.
 */
const shouldFetch = (
  state: PatientRecordsState,
  section: RecordSection,
  patientId: string,
): boolean => {
  const current = state[section];
  if (current.patientId !== patientId) return true;
  return current.status !== "pending" && !(current.status === "succeeded" && isFresh(current.fetchedAt));
};

/* ---------- Allergies ---------- */

export const fetchAllergies = createAsyncThunk<PatientAllergies, string, PatientRecordsThunkConfig>(
  "patientRecords/fetchAllergies",
  async (patientId, { rejectWithValue, signal }) => {
    try {
      return await patientRecordsService.listAllergies(patientId, signal);
    } catch (error) {
      return rejectWithValue(toRequestError(error));
    }
  },
  { condition: (patientId, { getState }) => shouldFetch(getState().patientRecords, "allergies", patientId) },
);

export type SaveAllergyRequest =
  | { patientId: string; allergyId?: undefined; payload: CreateAllergyPayload }
  | { patientId: string; allergyId: string; payload: UpdateAllergyPayload };

/** Creates (no `allergyId`) or updates an allergy, then reloads the list (recording clears "no known allergies"). */
export const saveAllergy = createAsyncThunk<PatientAllergies, SaveAllergyRequest, PatientRecordsThunkConfig>(
  "patientRecords/saveAllergy",
  async (request, { rejectWithValue }) => {
    try {
      if (request.allergyId === undefined) {
        await patientRecordsService.createAllergy(request.patientId, request.payload);
      } else {
        await patientRecordsService.updateAllergy(request.patientId, request.allergyId, request.payload);
      }
      return await patientRecordsService.listAllergies(request.patientId);
    } catch (error) {
      return rejectWithValue(toRequestError(error));
    }
  },
);

export const setNoKnownAllergies = createAsyncThunk<
  PatientAllergies,
  { patientId: string; hasNoKnownAllergies: boolean },
  PatientRecordsThunkConfig
>("patientRecords/setNoKnownAllergies", async ({ patientId, hasNoKnownAllergies }, { rejectWithValue }) => {
  try {
    return await patientRecordsService.setNoKnownAllergies(patientId, hasNoKnownAllergies);
  } catch (error) {
    return rejectWithValue(toRequestError(error));
  }
});

/* ---------- Medication list ---------- */

export const fetchMedications = createAsyncThunk<MedicationStatement[], string, PatientRecordsThunkConfig>(
  "patientRecords/fetchMedications",
  async (patientId, { rejectWithValue, signal }) => {
    try {
      return await patientRecordsService.listMedications(patientId, signal);
    } catch (error) {
      return rejectWithValue(toRequestError(error));
    }
  },
  { condition: (patientId, { getState }) => shouldFetch(getState().patientRecords, "medications", patientId) },
);

/** Every change to one entry: the list is reloaded afterwards (order depends on status). */
export type ChangeMedicationRequest = { patientId: string } & (
  | { kind: "create"; payload: CreateMedicationStatementPayload }
  | { kind: "update"; statementId: string; payload: UpdateMedicationStatementPayload }
  | { kind: "stop"; statementId: string; reason: string; endDate?: string }
  | { kind: "enteredInError"; statementId: string; reason: string }
);

export const changeMedication = createAsyncThunk<
  MedicationStatement[],
  ChangeMedicationRequest,
  PatientRecordsThunkConfig
>("patientRecords/changeMedication", async (request, { rejectWithValue }) => {
  const { patientId } = request;
  try {
    switch (request.kind) {
      case "create":
        await patientRecordsService.createMedication(patientId, request.payload);
        break;
      case "update":
        await patientRecordsService.updateMedication(patientId, request.statementId, request.payload);
        break;
      case "stop":
        await patientRecordsService.stopMedication(patientId, request.statementId, {
          reason: request.reason,
          ...(request.endDate ? { endDate: request.endDate } : {}),
        });
        break;
      case "enteredInError":
        await patientRecordsService.markMedicationEnteredInError(
          patientId,
          request.statementId,
          request.reason,
        );
        break;
    }
    return await patientRecordsService.listMedications(patientId);
  } catch (error) {
    return rejectWithValue(toRequestError(error));
  }
});

/* ---------- Medical history ---------- */

/** How many recent visits the Medical History tab lists. */
export const RECENT_ENCOUNTERS_LIMIT = 10;

/** Resolves to null when the request fails (e.g. the viewer may not read that part of the chart). */
const optional = <TData>(request: Promise<TData>): Promise<TData | null> =>
  request.catch(() => null);

export const fetchMedicalHistory = createAsyncThunk<
  PatientMedicalHistory,
  string,
  PatientRecordsThunkConfig
>(
  "patientRecords/fetchMedicalHistory",
  async (patientId, { rejectWithValue, signal }) => {
    const service = patientRecordsService;
    try {
      const [conditions, surgicalHistory, familyHistory, immunizations, socialHistory, latestVitals, recentEncounters] =
        await Promise.all([
          service.listHistory<PatientCondition>(patientId, "conditions", signal),
          service.listHistory<SurgicalHistoryEntry>(patientId, "surgical-history", signal),
          service.listHistory<FamilyHistoryEntry>(patientId, "family-history", signal),
          service.listHistory<PatientImmunization>(patientId, "immunizations", signal),
          service.getSocialHistory(patientId, signal),
          optional(service.getLatestVitals(patientId, signal)),
          optional(service.listRecentEncounters(patientId, RECENT_ENCOUNTERS_LIMIT, signal)),
        ]);
      return {
        conditions,
        surgicalHistory,
        familyHistory,
        immunizations,
        socialHistory,
        latestVitals,
        recentEncounters,
      };
    } catch (error) {
      return rejectWithValue(toRequestError(error));
    }
  },
  {
    condition: (patientId, { getState }) =>
      shouldFetch(getState().patientRecords, "medicalHistory", patientId),
  },
);

/** List sections of the Medical History tab and their API paths. */
const HISTORY_PATHS = {
  conditions: "conditions",
  surgicalHistory: "surgical-history",
  familyHistory: "family-history",
  immunizations: "immunizations",
} as const satisfies Record<string, HistoryListPath>;
export type HistoryListSection = keyof typeof HISTORY_PATHS;

/** One change on the Medical History tab; only the affected section is reloaded afterwards. */
export type ChangeMedicalHistoryRequest = { patientId: string } & (
  | { kind: "createCondition"; payload: CreateConditionPayload }
  | { kind: "updateCondition"; entryId: string; payload: UpdateConditionPayload }
  | { kind: "createEntry"; section: Exclude<HistoryListSection, "conditions">; payload: SurgicalHistoryPayload | FamilyHistoryPayload | ImmunizationPayload }
  | { kind: "updateEntry"; section: Exclude<HistoryListSection, "conditions">; entryId: string; payload: Partial<SurgicalHistoryPayload | FamilyHistoryPayload | ImmunizationPayload> }
  | { kind: "enteredInError"; section: Exclude<HistoryListSection, "conditions">; entryId: string; reason: string }
  | { kind: "putSocialHistory"; payload: SocialHistoryPayload }
);

/** Which section changed and its fresh content. */
export type MedicalHistoryChange = Partial<PatientMedicalHistory>;

export const changeMedicalHistory = createAsyncThunk<
  MedicalHistoryChange,
  ChangeMedicalHistoryRequest,
  PatientRecordsThunkConfig
>("patientRecords/changeMedicalHistory", async (request, { rejectWithValue }) => {
  const { patientId } = request;
  const service = patientRecordsService;
  try {
    switch (request.kind) {
      case "putSocialHistory":
        return { socialHistory: await service.putSocialHistory(patientId, request.payload) };
      case "createCondition":
        await service.createHistoryEntry(patientId, "conditions", request.payload);
        return { conditions: await service.listHistory<PatientCondition>(patientId, "conditions") };
      case "updateCondition":
        await service.updateHistoryEntry(patientId, "conditions", request.entryId, request.payload);
        return { conditions: await service.listHistory<PatientCondition>(patientId, "conditions") };
      case "createEntry":
        await service.createHistoryEntry(patientId, HISTORY_PATHS[request.section], request.payload);
        break;
      case "updateEntry":
        await service.updateHistoryEntry(patientId, HISTORY_PATHS[request.section], request.entryId, request.payload);
        break;
      case "enteredInError":
        await service.markHistoryEntryEnteredInError(
          patientId,
          HISTORY_PATHS[request.section],
          request.entryId,
          request.reason,
        );
        break;
    }
    const section = request.section;
    return { [section]: await service.listHistory(patientId, HISTORY_PATHS[section]) };
  } catch (error) {
    return rejectWithValue(toRequestError(error));
  }
});

/* ---------- Documents ---------- */

export const fetchDocuments = createAsyncThunk<PatientDocument[], string, PatientRecordsThunkConfig>(
  "patientRecords/fetchDocuments",
  async (patientId, { rejectWithValue, signal }) => {
    try {
      return await patientRecordsService.listDocuments(patientId, signal);
    } catch (error) {
      return rejectWithValue(toRequestError(error));
    }
  },
  { condition: (patientId, { getState }) => shouldFetch(getState().patientRecords, "documents", patientId) },
);

export type ChangeDocumentsRequest = { patientId: string } & (
  | { kind: "upload"; category: PatientDocumentCategory; file: File }
  | { kind: "archive"; documentId: string; reason: string }
);

/** Uploads or archives a document, then reloads the list. */
export const changeDocuments = createAsyncThunk<
  PatientDocument[],
  ChangeDocumentsRequest,
  PatientRecordsThunkConfig
>("patientRecords/changeDocuments", async (request, { rejectWithValue }) => {
  try {
    if (request.kind === "upload") {
      await patientRecordsService.uploadDocument(request.patientId, request.category, request.file);
    } else {
      await patientRecordsService.archiveDocument(request.patientId, request.documentId, request.reason);
    }
    return await patientRecordsService.listDocuments(request.patientId);
  } catch (error) {
    return rejectWithValue(toRequestError(error));
  }
});
