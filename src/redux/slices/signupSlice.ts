import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface SignupFormState {
  role: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  showPassword: boolean;
  errors: {
    role?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
  };
  touched: { [k: string]: boolean };
  isSubmitting: boolean;
}

const initialState: SignupFormState = {
  role: "",
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  showPassword: false,
  errors: {},
  touched: {},
  isSubmitting: false,
};

const signupSlice = createSlice({
  name: "signup",
  initialState,
  reducers: {
    setRole(state, action: PayloadAction<string>) {
      state.role = action.payload;
    },
    setFirstName(state, action: PayloadAction<string>) {
      state.firstName = action.payload;
    },
    setLastName(state, action: PayloadAction<string>) {
      state.lastName = action.payload;
    },
    setEmail(state, action: PayloadAction<string>) {
      state.email = action.payload;
    },
    setPassword(state, action: PayloadAction<string>) {
      state.password = action.payload;
    },
    toggleShowPassword(state) {
      state.showPassword = !state.showPassword;
    },
    setErrors(state, action: PayloadAction<SignupFormState["errors"]>) {
      state.errors = action.payload;
    },
    setTouched(state, action: PayloadAction<{ [k: string]: boolean }>) {
      state.touched = action.payload;
    },
    setIsSubmitting(state, action: PayloadAction<boolean>) {
      state.isSubmitting = action.payload;
    },
    resetSignupForm() {
      return initialState;
    },
  },
});

export const {
  setRole,
  setFirstName,
  setLastName,
  setEmail,
  setPassword,
  toggleShowPassword,
  setErrors,
  setTouched,
  setIsSubmitting,
  resetSignupForm,
} = signupSlice.actions;

export default signupSlice.reducer;