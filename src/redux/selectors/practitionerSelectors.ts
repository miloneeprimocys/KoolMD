import type { RootState } from "@/redux/store";

export const selectPractitionerListQuery = (state: RootState) => state.practitioners.query;
export const selectPractitionerList = (state: RootState) => state.practitioners.list;
export const selectPractitionerStats = (state: RootState) => state.practitioners.stats;
export const selectSpecialties = (state: RootState) => state.practitioners.specialties.items;
