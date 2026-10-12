import { createSlice } from "@reduxjs/toolkit";
import type { RequestStatus } from "@/types/api";
import type {
  Practitioner,
  PractitionerDocument,
  PractitionerLicense,
} from "@/types/practitioner";
import {
  addProviderLicense,
  fetchProviderDetail,
  uploadProviderDocument,
} from "@/redux/thunks/providerDetailThunks";
import type { RequestError } from "@/redux/thunks/thunkHelpers";
import { logoutUser } from "@/redux/thunks/authThunks";
import { sessionExpired } from "./authSlice";

interface MutationState {
  status: RequestStatus;
  error: RequestError | null;
}

export interface ProviderDetailState {
  detail: {
    /** Provider the data below belongs to. */
    practitionerId: string | null;
    practitioner: Practitioner | null;
    licenses: PractitionerLicense[];
    documents: PractitionerDocument[];
    status: RequestStatus;
    error: RequestError | null;
    /** Latest request; responses for a previously opened provider are ignored. */
    activeRequestId: string | null;
    fetchedAt: number | null;
  };
  addLicense: MutationState;
  uploadDocument: MutationState;
}

const idleMutation: MutationState = { status: "idle", error: null };

const initialState: ProviderDetailState = {
  detail: {
    practitionerId: null,
    practitioner: null,
    licenses: [],
    documents: [],
    status: "idle",
    error: null,
    activeRequestId: null,
    fetchedAt: null,
  },
  addLicense: idleMutation,
  uploadDocument: idleMutation,
};

const providerDetailSlice = createSlice({
  name: "providerDetail",
  initialState,
  reducers: {
    resetProviderMutations(state) {
      state.addLicense = idleMutation;
      state.uploadDocument = idleMutation;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProviderDetail.pending, (state, action) => {
        const isOtherProvider = state.detail.practitionerId !== action.meta.arg;
        state.detail = {
          ...state.detail,
          // Never show the previous provider's data while another one loads.
          ...(isOtherProvider ? { practitioner: null, licenses: [], documents: [] } : {}),
          practitionerId: action.meta.arg,
          status: "pending",
          error: null,
          activeRequestId: action.meta.requestId,
        };
      })
      .addCase(fetchProviderDetail.fulfilled, (state, action) => {
        if (action.meta.requestId !== state.detail.activeRequestId) return;
        state.detail.practitioner = action.payload.practitioner;
        state.detail.licenses = action.payload.licenses;
        state.detail.documents = action.payload.documents;
        state.detail.status = "succeeded";
        state.detail.fetchedAt = Date.now();
      })
      .addCase(fetchProviderDetail.rejected, (state, action) => {
        if (action.meta.requestId !== state.detail.activeRequestId) return;
        state.detail.status = "failed";
        state.detail.error = action.payload ?? null;
      })

      .addCase(addProviderLicense.pending, (state) => {
        state.addLicense = { status: "pending", error: null };
      })
      .addCase(addProviderLicense.fulfilled, (state, action) => {
        state.addLicense = { status: "succeeded", error: null };
        if (state.detail.practitionerId === action.meta.arg.practitionerId) {
          state.detail.licenses = action.payload.licenses;
          state.detail.documents = action.payload.documents;
        }
      })
      .addCase(addProviderLicense.rejected, (state, action) => {
        state.addLicense = { status: "failed", error: action.payload ?? null };
      })

      .addCase(uploadProviderDocument.pending, (state) => {
        state.uploadDocument = { status: "pending", error: null };
      })
      .addCase(uploadProviderDocument.fulfilled, (state, action) => {
        state.uploadDocument = { status: "succeeded", error: null };
        if (state.detail.practitionerId === action.meta.arg.practitionerId) {
          state.detail.documents = action.payload;
        }
      })
      .addCase(uploadProviderDocument.rejected, (state, action) => {
        state.uploadDocument = { status: "failed", error: action.payload ?? null };
      })

      // Credentials are sensitive — drop them on sign-out.
      .addCase(logoutUser.fulfilled, () => initialState)
      .addCase(sessionExpired, () => initialState);
  },
});

export const { resetProviderMutations } = providerDetailSlice.actions;

export default providerDetailSlice.reducer;
