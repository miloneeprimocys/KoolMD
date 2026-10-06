import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface AuthState {
  variant: "login" | "signup";
}

const initialState: AuthState = {
  variant: "login",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthVariant(state, action: PayloadAction<"login" | "signup">) {
      state.variant = action.payload;
    },
  },
});

export const { setAuthVariant } = authSlice.actions;

export default authSlice.reducer;
