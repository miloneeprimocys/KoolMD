import type { RootState } from "@/redux/store";

export const selectProviderDetail = (state: RootState) => state.providerDetail.detail;
export const selectAddLicenseRequest = (state: RootState) => state.providerDetail.addLicense;
export const selectUploadDocumentRequest = (state: RootState) =>
  state.providerDetail.uploadDocument;
