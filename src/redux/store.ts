import { configureStore } from "@reduxjs/toolkit";
import authReducer, { sessionExpired } from "./slices/authSlice";
import patientsReducer from "./slices/patientsSlice";
import practitionersReducer from "./slices/practitionersSlice";
import providerDetailReducer from "./slices/providerDetailSlice";
import dialogReducer from "./slices/dialogslice";
import { registerSessionExpiredHandler } from "./services/apiClient";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    patients: patientsReducer,
    practitioners: practitionersReducer,
    providerDetail: providerDetailReducer,
    dialog: dialogReducer,
  },
});

// API client lives outside React — let it sign the user out when refresh fails.
registerSessionExpiredHandler(() => store.dispatch(sessionExpired()));

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
