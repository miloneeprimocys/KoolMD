"use client";

import React, { useMemo, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { User } from "lucide-react";
import { parsePhoneNumberFromString, CountryCode } from "libphonenumber-js";

import SignupField from "@/components/SignupField";
import SignupDropdown, { DropdownOption } from "@/components/SignupDropdown";
import AddButton from "@/components/Addbutton";
import ImportButton from "@/components/ImportButton";
import Breadcrumb from "@/components/Breadcrumb";
import DatePicker from "@/components/Datepicker";
import SuccessToast from "@/components/SuccessToast";
import ErrorToast from "@/components/ErrorToast";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppHooks";
import { selectCreatePatientRequest, selectPatientDetail, selectUpdatePatientRequest } from "@/redux/selectors/patientSelectors";
import { createPatient, updatePatient } from "@/redux/thunks/patientThunks";
import { fetchPatientDetail } from "@/redux/thunks/patientDetailThunks";
import type { AdministrativeGender, CreatePatientPayload, UpdatePatientPayload } from "@/types/patient";

import {
  COUNTRY_OPTIONS,
  DEFAULT_COUNTRY,
  PhoneField,
  getCityOptions,
  getStateOptions,
  postalLabelFor,
  validatePhone,
} from "../providers/Shared";

/* ---------- Static data ---------- */
/** Values are the backend `AdministrativeGender` enum. */
const GENDERS: DropdownOption[] = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "OTHER", label: "Other" },
  { value: "UNKNOWN", label: "Prefer not to say" },
];

/** Values are BCP 47 tags, as the backend expects. */
const LANGUAGES: DropdownOption[] = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "hi", label: "Hindi" },
];

/** Backend address rules (USPS state code, ZIP) apply to US addresses only. */
const US_COUNTRY_CODE = "US";

/** Backend validation field → form field, so server errors show under the right input. */
const FORM_FIELD_BY_API_FIELD: Record<string, keyof FormValues> = {
  firstName: "firstName",
  lastName: "lastName",
  dateOfBirth: "dob",
  administrativeGender: "gender",
  phoneNumber: "phone",
  email: "email",
  preferredLanguage: "language",
  addressLine1: "address1",
  addressLine2: "address2",
  city: "city",
  stateCode: "state",
  postalCode: "zip",
  countryCode: "country",
};

/* ---------- Shared styles ---------- */
const checkboxCls =
  "mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-border accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30";
const cardCls = "rounded-2xl border border-border bg-card p-4 sm:p-5";

/* ---------- Small helpers ---------- */
const Req = () => <span className="text-danger"> *</span>;
const Opt = () => <span className="font-normal text-body"> (Optional)</span>;

/* Numbered section header */
const SectionHeader = ({
  step,
  title,
  subtitle,
}: {
  step: number;
  title: string;
  subtitle: string;
}) => (
  <div className="mb-4 flex items-center gap-3">
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
      {step}
    </span>
    <div className="min-w-0">
      <h3 className="text-base font-semibold text-heading">{title}</h3>
      <p className="text-xs text-body">{subtitle}</p>
    </div>
  </div>
);

/* ---------- Validation types ---------- */
interface FormValues {
  firstName: string;
  lastName: string;
  middleName: string;
  dob: string;
  gender: string;
  phoneCountry: string;
  phone: string;
  email: string;
  language: string;
  emergencyName: string;
  emergencyPhoneCountry: string;
  emergencyPhone: string;
  address1: string;
  address2: string;
  country: string;
  state: string;
  city: string;
  zip: string;
  preferredName: string;
  genderIdentity: string;
  preferredContactMethod: string;
  allowEmailNotifications: string | boolean;
  allowSmsNotifications: string | boolean;
}

type FormErrors = Partial<Record<keyof FormValues, string>>;

/* ---------- Page ---------- */
const AddPatient = () => {
  const router = useRouter();
  const pathname = usePathname();
  const isEditMode = pathname === "/edit-patient";
  const dispatch = useAppDispatch();
  const createPatientRequest = useAppSelector(selectCreatePatientRequest);
  const updatePatientRequest = useAppSelector(selectUpdatePatientRequest);
  const isSaving = createPatientRequest.status === "pending" || updatePatientRequest.status === "pending";
  const searchParams = useSearchParams();
  const patientId = searchParams.get("id");
  const patientDetail = useAppSelector(selectPatientDetail);
  const [values, setValues] = React.useState<FormValues>({
    firstName: "",
    lastName: "",
    middleName: "",
    dob: "",
    gender: "",
    phoneCountry: DEFAULT_COUNTRY,
    phone: "",
    email: "",
    language: "",
    emergencyName: "",
    emergencyPhoneCountry: DEFAULT_COUNTRY,
    emergencyPhone: "",
    address1: "",
    address2: "",
    country: DEFAULT_COUNTRY,
    state: "",
    city: "",
    zip: "",
    preferredName: "",
    genderIdentity: "",
    preferredContactMethod: "",
    allowEmailNotifications: false,
    allowSmsNotifications: false,
  });

  const [errors, setErrors] = React.useState<FormErrors>({});
  const [submitted, setSubmitted] = React.useState(false);
  const [isInitialized, setIsInitialized] = React.useState(false);
  const [toast, setToast] = React.useState<{
    type: "success" | "error" | null;
    title: string;
    message: string;
    action?: { label: string; onClick: () => void };
  }>({
    type: null,
    title: "",
    message: "",
  });

  /* ---------- Load patient data in edit mode ---------- */
  useEffect(() => {
    if (isEditMode && patientId && !isInitialized) {
      dispatch(fetchPatientDetail(patientId));
    }
  }, [dispatch, isEditMode, patientId, isInitialized]);

  useEffect(() => {
    if (isEditMode && patientDetail.patient && patientDetail.patientId === patientId && !isInitialized) {
      const patient = patientDetail.patient;
      setValues({
        firstName: patient.firstName || "",
        lastName: patient.lastName || "",
        middleName: patient.middleName || "",
        dob: patient.dateOfBirth || "",
        gender: patient.administrativeGender || "",
        phoneCountry: DEFAULT_COUNTRY,
        phone: patient.phoneNumber || "",
        email: patient.email || "",
        language: patient.preferredLanguage || "",
        emergencyName: "",
        emergencyPhoneCountry: DEFAULT_COUNTRY,
        emergencyPhone: "",
        address1: patient.addressLine1 || "",
        address2: patient.addressLine2 || "",
        country: patient.countryCode || DEFAULT_COUNTRY,
        state: patient.stateCode || "",
        city: patient.city || "",
        zip: patient.postalCode || "",
        preferredName: patient.preferredName || "",
        genderIdentity: patient.genderIdentity || "",
        preferredContactMethod: patient.preferredContactMethod || "",
        allowEmailNotifications: patient.allowEmailNotifications,
        allowSmsNotifications: patient.allowSmsNotifications,
      });
      setIsInitialized(true);
    }
  }, [isEditMode, patientDetail, patientId, isInitialized]);

  /* ---------- Dependent dropdown options ---------- */
  const stateOptions: DropdownOption[] = useMemo(
    () => getStateOptions(values.country),
    [values.country],
  );

  const cityOptions: DropdownOption[] = useMemo(
    () => getCityOptions(values.country, values.state),
    [values.country, values.state],
  );

  const postalLabel = postalLabelFor(values.country);

  /* ---------- Field setters ---------- */
  const clearError = (field: keyof FormValues) => {
    if (submitted) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const setField = (field: keyof FormValues, value: string | boolean) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    clearError(field);
  };

  const handleCountryChange = (iso: string) => {
    setValues((prev) => ({
      ...prev,
      country: iso,
      state: "",
      city: "",
      zip: "",
      phoneCountry: iso,
      emergencyPhoneCountry: iso,
    }));
    clearError("country");
    clearError("state");
    clearError("city");
    clearError("zip");
  };

  const handleStateChange = (iso: string) => {
    setValues((prev) => ({ ...prev, state: iso, city: "" }));
    clearError("state");
    clearError("city");
  };

  /* ---------- Validation ---------- */
  const validate = (vals: FormValues): FormErrors => {
    const errs: FormErrors = {};

    if (!vals.firstName.trim()) errs.firstName = "First name is required.";
    else if (vals.firstName.trim().length < 2)
      errs.firstName = "First name must be at least 2 characters.";

    if (!vals.lastName.trim()) errs.lastName = "Last name is required.";
    else if (vals.lastName.trim().length < 2)
      errs.lastName = "Last name must be at least 2 characters.";

    if (!vals.dob.trim()) errs.dob = "Date of birth is required.";
    if (!vals.gender) errs.gender = "Gender is required.";

    // Use shared phone validator
    const phoneErr = validatePhone(vals.phone, vals.phoneCountry, true);
    if (phoneErr) errs.phone = phoneErr;

    if (!vals.email.trim()) errs.email = "Email address is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(vals.email.trim()))
      errs.email = "Enter a valid email address.";

    const altPhoneErr = validatePhone(
      vals.emergencyPhone,
      vals.emergencyPhoneCountry,
      false,
    );
    if (altPhoneErr) errs.emergencyPhone = altPhoneErr;

    if (!vals.country) errs.country = "Country is required.";

    if (vals.zip.trim() && vals.country) {
      const zip = vals.zip.trim();
      const label = postalLabelFor(vals.country);
      // basic format check — full postcode validation is done in Shared.validateAddress
      if (!/^[A-Za-z0-9\s-]{3,10}$/.test(zip))
        errs.zip = `Enter a valid ${label.toLowerCase()}.`;
    }

    return errs;
  };

  const toE164 = (national: string, iso: string) =>
    parsePhoneNumberFromString(national, iso as CountryCode)?.number ?? "";

  /** Form values → `POST /patients` body (empty optional fields are left out). */
  const buildCreatePatientPayload = (confirmNotDuplicate: boolean): CreatePatientPayload => {
    const isUsAddress = values.country === US_COUNTRY_CODE;
    const optional = (value: string) => value.trim() || undefined;
    const toBool = (val: string | boolean): boolean => val === true || val === "true";
    return {
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      middleName: values.middleName.trim() || undefined,
      dateOfBirth: values.dob,
      administrativeGender: values.gender as AdministrativeGender,
      phoneNumber: toE164(values.phone, values.phoneCountry) || undefined,
      email: optional(values.email),
      preferredLanguage: values.language || undefined,
      addressLine1: optional(values.address1),
      addressLine2: optional(values.address2),
      city: optional(values.city),
      stateCode: isUsAddress ? values.state || undefined : undefined,
      postalCode: isUsAddress ? optional(values.zip) : undefined,
      countryCode: values.country || undefined,
      confirmNotDuplicate: confirmNotDuplicate || undefined,
      preferredName: values.preferredName.trim() || undefined,
      genderIdentity: values.genderIdentity.trim() || undefined,
      preferredContactMethod: (values.preferredContactMethod as any) || undefined,
      allowEmailNotifications: toBool(values.allowEmailNotifications),
      allowSmsNotifications: toBool(values.allowSmsNotifications),
    };
  };

  /** Form values → `PATCH /patients/:id` body. */
  const buildUpdatePatientPayload = (): UpdatePatientPayload => {
    const isUsAddress = values.country === US_COUNTRY_CODE;
    const optional = (value: string) => value.trim() || undefined;
    const toBool = (val: string | boolean): boolean => val === true || val === "true";
    return {
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      middleName: values.middleName.trim() || null,
      dateOfBirth: values.dob,
      administrativeGender: values.gender as AdministrativeGender,
      phoneNumber: toE164(values.phone, values.phoneCountry) || null,
      email: optional(values.email) || null,
      preferredLanguage: values.language || undefined,
      addressLine1: optional(values.address1) || null,
      addressLine2: optional(values.address2) || null,
      city: optional(values.city) || null,
      stateCode: isUsAddress ? values.state || null : null,
      postalCode: isUsAddress ? optional(values.zip) || null : null,
      countryCode: values.country || undefined,
      preferredName: values.preferredName.trim() || null,
      genderIdentity: values.genderIdentity.trim() || null,
      preferredContactMethod: (values.preferredContactMethod as any) || undefined,
      allowEmailNotifications: toBool(values.allowEmailNotifications),
      allowSmsNotifications: toBool(values.allowSmsNotifications),
    };
  };

  const scrollToField = (field: string) => {
    const fieldElement = document.getElementById(field);
    fieldElement?.scrollIntoView({ behavior: "smooth", block: "center" });
    fieldElement?.focus?.();
  };

  const savePatient = async (confirmNotDuplicate = false) => {
    if (isEditMode && !patientId) {
      setToast({ type: "error", title: "Error", message: "Patient ID is required for editing." });
      return;
    }

    let saveResult;
    if (isEditMode) {
      saveResult = await dispatch(updatePatient({ patientId, payload: buildUpdatePatientPayload() }));
    } else {
      const emergencyPhone = values.emergencyPhone
        ? toE164(values.emergencyPhone, values.emergencyPhoneCountry)
        : "";
      saveResult = await dispatch(
        createPatient({
          patient: buildCreatePatientPayload(confirmNotDuplicate),
          emergencyContact:
            values.emergencyName.trim() && emergencyPhone
              ? { fullName: values.emergencyName.trim(), relationship: "OTHER", phoneNumber: emergencyPhone }
              : undefined,
        }),
      );
    }

    if (isEditMode) {
      if (updatePatient.fulfilled.match(saveResult)) {
        setToast({ type: "success", title: "Success", message: "Patient updated successfully." });
        router.push(`/view-patient?id=${encodeURIComponent(patientId)}`);
        return;
      }
      if (updatePatient.rejected.match(saveResult)) {
        const requestError = saveResult.payload;
        if (requestError) {
          const serverFieldErrors: FormErrors = {};
          for (const [apiField, message] of Object.entries(requestError.fieldErrors ?? {})) {
            const formField = FORM_FIELD_BY_API_FIELD[apiField];
            if (formField) serverFieldErrors[formField] = message;
          }
          if (Object.keys(serverFieldErrors).length) {
            setErrors(serverFieldErrors);
            scrollToField(Object.keys(serverFieldErrors)[0]);
          }
          setToast({ type: "error", title: "Could not save patient", message: requestError.message });
        }
        return;
      }
    } else {
      if (createPatient.fulfilled.match(saveResult)) {
        const { emergencyContactError } = saveResult.payload;
        if (emergencyContactError) {
          setToast({
            type: "error",
            title: "Patient saved, emergency contact not saved",
            message: emergencyContactError.message,
          });
          return;
        }
        router.push("/patients");
        return;
      }
      if (createPatient.rejected.match(saveResult)) {
        const requestError = saveResult.payload;
        if (!requestError) return;

        if (requestError.errorCode === "POSSIBLE_DUPLICATE_PATIENT") {
          setToast({
            type: "error",
            title: "Possible duplicate patient",
            message: "A patient with the same name and date of birth already exists.",
            action: { label: "Save anyway", onClick: () => savePatient(true) },
          });
          return;
        }

        const serverFieldErrors: FormErrors = {};
        for (const [apiField, message] of Object.entries(requestError.fieldErrors ?? {})) {
          const formField = FORM_FIELD_BY_API_FIELD[apiField];
          if (formField) serverFieldErrors[formField] = message;
        }
        if (Object.keys(serverFieldErrors).length) {
          setErrors(serverFieldErrors);
          scrollToField(Object.keys(serverFieldErrors)[0]);
        }
        setToast({ type: "error", title: "Could not save patient", message: requestError.message });
        return;
      }
    }
  };

  const submitForm = () => {
    if (isSaving) return;
    setSubmitted(true);
    const errs = validate(values);
    setErrors(errs);

    if (Object.keys(errs).length === 0) {
      savePatient();
    } else {
      scrollToField(Object.keys(errs)[0]);
      const errorCount = Object.keys(errs).length;
      setToast({
        type: "error",
        title: "Validation Error",
        message: `Please fill out all required fields (${errorCount} missing or invalid).`,
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitForm();
  };

  // Reset initialization when navigating away from edit mode
  useEffect(() => {
    if (!isEditMode && isInitialized) {
      setIsInitialized(false);
    }
  }, [isEditMode, isInitialized]);

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-4 sm:space-y-5">
      {/* Success and Error Toasts */}
      <SuccessToast
        isOpen={toast.type === "success"}
        onClose={() => setToast((prev) => ({ ...prev, type: null }))}
        title={toast.title}
        message={toast.message}
      />
      <ErrorToast
        isOpen={toast.type === "error"}
        onClose={() => setToast((prev) => ({ ...prev, type: null, action: undefined }))}
        title={toast.title}
        message={toast.message}
        action={toast.action}
      />
      <Breadcrumb
        items={[
          { label: "Patients", href: "/patients" },
          { label: isEditMode ? "Edit Patient" : "Add Patient" },
        ]}
      />

      {/* Title + actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-heading sm:text-xl 2xl:text-2xl">
            {isEditMode ? "Edit Patient" : "Add Patient"}
          </h2>
          <p className="mt-0.5 text-sm text-body">
            Create a new patient record in the system.
          </p>
        </div>

        <div className="flex flex-row gap-2">
          <ImportButton
            text="Cancel"
            icon={null}
            className="flex-1 sm:flex-none"
            onClick={() => router.push("/patients")}
          />
          <AddButton
            text={isSaving ? "Saving…" : "Save Patient"}
            icon={null}
            className="flex-1 sm:flex-none"
            onClick={submitForm}
            disabled={isSaving}
          />
        </div>
      </div>

      <div className="grid items-start gap-4 sm:gap-5 xl:grid-cols-[minmax(0,1fr)_340px] 2xl:grid-cols-[minmax(0,1fr)_380px]">
        {/* ================= LEFT: FORM ================= */}
        <form
          className={`${cardCls} min-w-0 sm:p-6`}
          onSubmit={handleSubmit}
          noValidate
        >
          {/* 1. Basic information */}
          <section>
            <SectionHeader
              step={1}
              title="Basic Information"
              subtitle="Enter the patient's personal details."
            />
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <SignupField
                name="firstName"
                label={<>First Name<Req /></>}
                placeholder="Enter first name"
                value={values.firstName}
                onChange={(e) => setField("firstName", e.target.value)}
                error={errors.firstName}
              />
              <SignupField
                name="lastName"
                label={<>Last Name<Req /></>}
                placeholder="Enter last name"
                value={values.lastName}
                onChange={(e) => setField("lastName", e.target.value)}
                error={errors.lastName}
              />
              <DatePicker
                name="dob"
                label={<>Date of Birth<Req /></>}
                placeholder="dd-mm-yyyy"
                value={values.dob}
                onChange={(v) => setField("dob", v)}
                maxDate={new Date().toISOString().split("T")[0]}
                error={errors.dob}
              />
              <SignupDropdown
                name="gender"
                label="Gender *"
                placeholder="Select gender"
                options={GENDERS}
                value={values.gender}
                onChange={(v) => setField("gender", v)}
                error={errors.gender}
              />
              <PhoneField
                name="phone"
                label={<>Phone Number<Req /></>}
                placeholder="Enter phone number"
                value={values.phone}
                onChange={(v) => setField("phone", v)}
                countryCode={values.phoneCountry}
                onCountryChange={(iso) => setField("phoneCountry", iso)}
                error={errors.phone}
              />
              <SignupField
                name="email"
                type="email"
                label={<>Email Address<Req /></>}
                placeholder="Enter email address"
                value={values.email}
                onChange={(e) => setField("email", e.target.value)}
                error={errors.email}
              />
            </div>
          </section>

          <hr className="my-6 border-divider" />

          {/* 2. Additional information */}
          <section>
            <SectionHeader
              step={2}
              title="Additional Information"
              subtitle="Additional details to complete the patient profile."
            />
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <SignupField
                name="middleName"
                label="Middle Name"
                placeholder="Enter middle name"
                value={values.middleName}
                onChange={(e) => setField("middleName", e.target.value)}
                error={errors.middleName}
              />
              <SignupField
                name="preferredName"
                label="Preferred Name"
                placeholder="Enter preferred name"
                value={values.preferredName}
                onChange={(e) => setField("preferredName", e.target.value)}
                error={errors.preferredName}
              />
              <SignupField
                name="genderIdentity"
                label="Gender Identity"
                placeholder="Enter gender identity"
                value={values.genderIdentity}
                onChange={(e) => setField("genderIdentity", e.target.value)}
                error={errors.genderIdentity}
              />
              <SignupDropdown
                name="language"
                label="Preferred Language"
                placeholder="Select language"
                options={LANGUAGES}
                value={values.language}
                onChange={(v) => setField("language", v)}
                error={errors.language}
              />
              {!isEditMode && (
                <>
                  <SignupField
                    name="emergencyName"
                    label="Emergency Contact Name"
                    placeholder="Enter contact name"
                    value={values.emergencyName}
                    onChange={(e) => setField("emergencyName", e.target.value)}
                    error={errors.emergencyName}
                  />
                  <PhoneField
                    name="emergencyPhone"
                    label="Emergency Contact Number"
                    placeholder="Enter phone number"
                    value={values.emergencyPhone}
                    onChange={(v) => setField("emergencyPhone", v)}
                    countryCode={values.emergencyPhoneCountry}
                    onCountryChange={(iso) =>
                      setField("emergencyPhoneCountry", iso)
                    }
                    error={errors.emergencyPhone}
                  />
                </>
              )}
            </div>
          </section>

          <hr className="my-6 border-divider" />

          {/* 3. Address information */}
          <section>
            <SectionHeader
              step={3}
              title="Address Information"
              subtitle="Patient's residential address."
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <SignupField
                name="address1"
                label="Address Line 1"
                placeholder="Enter address line 1"
                value={values.address1}
                onChange={(e) => setField("address1", e.target.value)}
                error={errors.address1}
              />
              <SignupField
                name="address2"
                label="Address Line 2"
                placeholder="Enter address line 2"
                value={values.address2}
                onChange={(e) => setField("address2", e.target.value)}
                error={errors.address2}
              />
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <SignupDropdown
                name="country"
                label="Country *"
                placeholder="Select country"
                options={COUNTRY_OPTIONS}
                value={values.country}
                onChange={handleCountryChange}
                error={errors.country}
              />
              <SignupDropdown
                key={`state-${values.country}`}
                name="state"
                label="State"
                placeholder={
                  stateOptions.length ? "Select state" : "No states available"
                }
                options={stateOptions}
                value={values.state}
                onChange={handleStateChange}
                disabled={stateOptions.length === 0}
                error={errors.state}
              />
              <SignupDropdown
                key={`city-${values.country}-${values.state}`}
                name="city"
                label="City"
                placeholder={
                  stateOptions.length && !values.state
                    ? "Select state first"
                    : cityOptions.length
                      ? "Select city"
                      : "No cities available"
                }
                options={cityOptions}
                value={values.city}
                onChange={(v) => setField("city", v)}
                disabled={
                  cityOptions.length === 0 ||
                  (stateOptions.length > 0 && !values.state)
                }
                error={errors.city}
              />
              <SignupField
                name="zip"
                label={postalLabel}
                placeholder={`Enter ${postalLabel.toLowerCase()}`}
                value={values.zip}
                onChange={(e) => setField("zip", e.target.value)}
                error={errors.zip}
              />
            </div>
          </section>

          <hr className="my-6 border-divider" />

          {/* 4. Communication preferences */}
          <section>
            <SectionHeader
              step={4}
              title="Communication Preferences"
              subtitle="How the patient prefers to be contacted."
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={values.allowEmailNotifications === true || values.allowEmailNotifications === "true"}
                  onChange={(e) => setField("allowEmailNotifications", e.target.checked)}
                  className={checkboxCls}
                />
                <span className="text-sm text-heading">Allow email notifications</span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={values.allowSmsNotifications === true || values.allowSmsNotifications === "true"}
                  onChange={(e) => setField("allowSmsNotifications", e.target.checked)}
                  className={checkboxCls}
                />
                <span className="text-sm text-heading">Allow SMS notifications</span>
              </label>
            </div>
          </section>
        </form>

        {/* ================= RIGHT: SIDEBAR ================= */}
        <aside className="space-y-4 sm:space-y-5">
          {/* Profile placeholder */}
          <section className={cardCls}>
            <h3 className="text-sm font-semibold text-heading">Profile</h3>
            <div className="mt-4 flex items-center gap-4">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full border-2 border-border bg-shape-sky/40 text-body sm:h-28 sm:w-28">
                <User className="h-10 w-10 text-body" strokeWidth={1.5} />
              </div>
              <div className="flex flex-col">
                <p className="text-sm font-medium text-heading">Patient Profile</p>
                <p className="mt-1 text-xs text-body">Complete the form to add or edit patient information.</p>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
};

export default AddPatient;