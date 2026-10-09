import { configureStore } from "@reduxjs/toolkit";
import authReducer, { sessionExpired } from "./slices/authSlice";
import { registerSessionExpiredHandler } from "./services/apiClient";

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});

// API client lives outside React — let it sign the user out when refresh fails.
registerSessionExpiredHandler(() => store.dispatch(sessionExpired()));

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
