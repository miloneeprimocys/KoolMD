import { configureStore } from "@reduxjs/toolkit";
import signupReducer from "./slices/signupSlice";
import authReducer from "./slices/authSlice";
import verifyOtpReducer from "./slices/verifyOtpSlice";

export const store = configureStore({
  reducer: {
    signup: signupReducer,
    auth: authReducer,
    verifyOtp: verifyOtpReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;