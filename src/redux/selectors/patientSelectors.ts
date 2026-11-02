import type { RootState } from "@/redux/store";

export const selectPatientListQuery = (state: RootState) => state.patients.query;
export const selectPatientList = (state: RootState) => state.patients.list;
export const selectPatientStats = (state: RootState) => state.patients.stats;
export const selectCreatePatientRequest = (state: RootState) => state.patients.create;
export const selectUpdatePatientRequest = (state: RootState) => state.patients.update;
export const selectPatientDetail = (state: RootState) => state.patientDetail.detail;
export const selectPatientAllergies = (state: RootState) => state.patientRecords.allergies;
export const selectPatientMedications = (state: RootState) => state.patientRecords.medications;
export const selectPatientMedicalHistory = (state: RootState) => state.patientRecords.medicalHistory;
export const selectPatientDocuments = (state: RootState) => state.patientRecords.documents;
