import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface VerifyOtpState {
  email: string;
}

const initialState: VerifyOtpState = {
  email: "",
};

const verifyOtpSlice = createSlice({
  name: "verifyOtp",
  initialState,
  reducers: {
    setVerifyOtpEmail(state, action: PayloadAction<string>) {
      state.email = action.payload;
    },
    clearVerifyOtpEmail(state) {
      state.email = "";
    },
  },
});

export const { setVerifyOtpEmail, clearVerifyOtpEmail } =
  verifyOtpSlice.actions;

export default verifyOtpSlice.reducer;
