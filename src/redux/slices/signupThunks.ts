import { AppDispatch, RootState } from "@/redux/store";
import {
  setErrors,
  setTouched,
  setIsSubmitting,
  resetSignupForm,
} from "./signupSlice";

export const validateSignup =
  () => (dispatch: AppDispatch, getState: () => RootState) => {
    const { role, firstName, lastName, email, password } = getState().signup;
    const e: {
      role?: string;
      firstName?: string;
      lastName?: string;
      email?: string;
      password?: string;
    } = {};

    if (!role) e.role = "Please select your role.";
    if (!firstName.trim()) e.firstName = "Please enter your first name.";
    if (!lastName.trim()) e.lastName = "Please enter your last name.";
    if (!email.trim()) e.email = "Please enter your email address.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      e.email = "Please enter a valid email address.";
    if (!password) e.password = "Please create a password.";
    else if (password.length < 8)
      e.password = "Password must be at least 8 characters.";
    else if (!/(?=.*[A-Za-z])(?=.*\d)/.test(password))
      e.password = "Use a mix of letters and numbers.";

    dispatch(setErrors(e));
    return e;
  };

export const submitSignup =
  () => async (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(
      setTouched({
        role: true,
        firstName: true,
        lastName: true,
        email: true,
        password: true,
      }),
    );

    const errors = dispatch(validateSignup() as any);
    if (errors && Object.keys(errors).length) return;

    dispatch(setIsSubmitting(true));
    const { role, firstName, lastName, email, password } = getState().signup;
    await new Promise((r) => setTimeout(r, 900));
    console.log({ role, firstName, lastName, email, password });
    dispatch(setIsSubmitting(false));
    dispatch(resetSignupForm());
  };