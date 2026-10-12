import { createAsyncThunk } from "@reduxjs/toolkit";
import type {
  CreateLicensePayload,
  Practitioner,
  PractitionerDocument,
  PractitionerDocumentCategory,
  PractitionerLicense,
} from "@/types/practitioner";
import { practitionerService } from "@/redux/services/practitionerService";
import type { ProviderDetailState } from "@/redux/slices/providerDetailSlice";
import { isFresh, toRequestError, type RequestError } from "./thunkHelpers";

interface ProviderDetailThunkConfig {
  state: { providerDetail: ProviderDetailState };
  rejectValue: RequestError;
}

export interface ProviderDetailBundle {
  practitioner: Practitioner;
  licenses: PractitionerLicense[];
  documents: PractitionerDocument[];
}

/**
 * Profile, licenses and documents in parallel. Skipped when the same provider is already loading
 * or was loaded moments ago (StrictMode, re-renders, coming back to the page).
 */
export const fetchProviderDetail = createAsyncThunk<
  ProviderDetailBundle,
  string,
  ProviderDetailThunkConfig
>(
  "providerDetail/fetch",
  async (practitionerId, { rejectWithValue, signal }) => {
    try {
      const [practitioner, licenses, documents] = await Promise.all([
        practitionerService.getPractitioner(practitionerId, signal),
        practitionerService.listLicenses(practitionerId, signal),
        practitionerService.listDocuments(practitionerId, signal),
      ]);
      return { practitioner, licenses, documents };
    } catch (error) {
      return rejectWithValue(toRequestError(error));
    }
  },
  {
    condition: (practitionerId, { getState }) => {
      const { detail } = getState().providerDetail;
      if (detail.practitionerId !== practitionerId) return true;
      return (
        detail.status !== "pending" && !(detail.status === "succeeded" && isFresh(detail.fetchedAt))
      );
    },
  },
);

export interface AddProviderLicenseRequest {
  practitionerId: string;
  license: Omit<CreateLicensePayload, "documentId">;
  /** Proof file — uploaded first, then linked to the license. */
  file: File | null;
}

export const addProviderLicense = createAsyncThunk<
  { licenses: PractitionerLicense[]; documents: PractitionerDocument[] },
  AddProviderLicenseRequest,
  ProviderDetailThunkConfig
>(
  "providerDetail/addLicense",
  async ({ practitionerId, license, file }, { rejectWithValue }) => {
    try {
      const document = file
        ? await practitionerService.uploadDocument(practitionerId, "LICENSE", file)
        : null;
      await practitionerService.addLicense(practitionerId, { ...license, documentId: document?.id });
      // Re-read both lists so the tabs show exactly what the server stored.
      const [licenses, documents] = await Promise.all([
        practitionerService.listLicenses(practitionerId),
        practitionerService.listDocuments(practitionerId),
      ]);
      return { licenses, documents };
    } catch (error) {
      return rejectWithValue(toRequestError(error));
    }
  },
  { condition: (_, { getState }) => getState().providerDetail.addLicense.status !== "pending" },
);

export interface UploadProviderDocumentRequest {
  practitionerId: string;
  category: PractitionerDocumentCategory;
  file: File;
}

export const uploadProviderDocument = createAsyncThunk<
  PractitionerDocument[],
  UploadProviderDocumentRequest,
  ProviderDetailThunkConfig
>(
  "providerDetail/uploadDocument",
  async ({ practitionerId, category, file }, { rejectWithValue }) => {
    try {
      await practitionerService.uploadDocument(practitionerId, category, file);
      return await practitionerService.listDocuments(practitionerId);
    } catch (error) {
      return rejectWithValue(toRequestError(error));
    }
  },
  {
    condition: (_, { getState }) => getState().providerDetail.uploadDocument.status !== "pending",
  },
);
