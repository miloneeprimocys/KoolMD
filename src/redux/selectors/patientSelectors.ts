import type { RootState } from "@/redux/store";

export const selectPatientListQuery = (state: RootState) => state.patients.query;
export const selectPatientList = (state: RootState) => state.patients.list;
export const selectPatientStats = (state: RootState) => state.patients.stats;
export const selectCreatePatientRequest = (state: RootState) => state.patients.create;
