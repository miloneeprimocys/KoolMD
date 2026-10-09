"use client";

import React, { useMemo, useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, User, Camera, Trash2, RefreshCw } from "lucide-react";
import { parsePhoneNumberFromString, CountryCode } from "libphonenumber-js";

import SignupField, { FieldError } from "@/components/SignupField";
import SignupDropdown, { DropdownOption } from "@/components/SignupDropdown";
import AddButton from "@/components/Addbutton";
import AddInternalButton from "@/components/AddInternalButton";
import ImportButton from "@/components/ImportButton";
import Breadcrumb from "@/components/Breadcrumb";
import DatePicker from "@/components/Datepicker";
import SuccessToast from "@/components/SuccessToast";
import ErrorToast from "@/components/ErrorToast";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppHooks";
import { selectCreatePatientRequest } from "@/redux/selectors/patientSelectors";
import { createPatient } from "@/redux/thunks/patientThunks";
import type { AdministrativeGender, CreatePatientPayload } from "@/types/patient";

import {
  COUNTRY_OPTIONS,
  DEFAULT_COUNTRY,
  FlagIcon,
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

const MARITAL: DropdownOption[] = [
  { value: "Single", label: "Single" },
  { value: "Married", label: "Married" },
  { value: "Divorced", label: "Divorced" },
  { value: "Widowed", label: "Widowed" },
];

const BLOOD: DropdownOption[] = [
  { value: "A+", label: "A+" },
  { value: "A-", label: "A-" },
  { value: "B+", label: "B+" },
  { value: "B-", label: "B-" },
  { value: "AB+", label: "AB+" },
  { value: "AB-", label: "AB-" },
  { value: "O+", label: "O+" },
  { value: "O-", label: "O-" },
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

const ROLES = [
  { id: "patient", label: "Patient", desc: "Can book appointments, access records and communicate with providers.", checked: true },
  { id: "practitioner", label: "Practitioner / MD", desc: "Can manage calendar, patient charts, prescriptions and consultations.", checked: false },
  { id: "receptionist", label: "Receptionist / Staff", desc: "Can manage booking, check ins, communications and billing.", checked: false },
  { id: "admin", label: "Administrator", desc: "Full access to manage platform records and settings.", checked: false },
];

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
  dob: string;
  gender: string;
  phoneCountry: string;
  phone: string;
  email: string;
  patientId: string;
  marital: string;
  blood: string;
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
}

type FormErrors = Partial<Record<keyof FormValues, string>>;

/* ---------- Page ---------- */
const AddPatient = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const createPatientRequest = useAppSelector(selectCreatePatientRequest);
  const isSaving = createPatientRequest.status === "pending";
  const [values, setValues] = React.useState<FormValues>({
    firstName: "",
    lastName: "",
    dob: "",
    gender: "",
    phoneCountry: DEFAULT_COUNTRY,
    phone: "",
    email: "",
    patientId: "",
    marital: "",
    blood: "",
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
  });

  const [errors, setErrors] = React.useState<FormErrors>({});
  const [submitted, setSubmitted] = React.useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
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

  /* ---------- Profile photo handling ---------- */
  useEffect(() => {
    if (photo) {
      const objectUrl = URL.createObjectURL(photo);
      setPhotoPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setPhotoPreview(null);
    }
  }, [photo]);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/jpg", "image/webp"].includes(file.type)) {
      setToast({
        type: "error",
        title: "Invalid File Type",
        message: "Please select a JPG, PNG, or WebP image file.",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setToast({
        type: "error",
        title: "File Size Exceeded",
        message: "Profile image must be less than 5MB.",
      });
      return;
    }

    setPhoto(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemovePhoto = () => {
    setPhoto(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

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

  const setField = (field: keyof FormValues, value: string) => {
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
    return {
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
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
    };
  };

  const scrollToField = (field: string) => {
    const fieldElement = document.getElementById(field);
    fieldElement?.scrollIntoView({ behavior: "smooth", block: "center" });
    fieldElement?.focus?.();
  };

  const savePatient = async (confirmNotDuplicate = false) => {
    const emergencyPhone = values.emergencyPhone
      ? toE164(values.emergencyPhone, values.emergencyPhoneCountry)
      : "";
    const saveResult = await dispatch(
      createPatient({
        patient: buildCreatePatientPayload(confirmNotDuplicate),
        emergencyContact:
          values.emergencyName.trim() && emergencyPhone
            ? { fullName: values.emergencyName.trim(), relationship: "OTHER", phoneNumber: emergencyPhone }
            : undefined,
      }),
    );

    if (createPatient.fulfilled.match(saveResult)) {
      const { emergencyContactError } = saveResult.payload;
      if (emergencyContactError) {
        // Patient exists now — stay here so the user sees what was not saved.
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

    const requestError = saveResult.payload;
    if (!requestError) return; // skipped: a save is already in progress

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
  };

  const submitForm = () => {
    if (createPatientRequest.status === "pending") return;
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
          { label: "Add Patient" },
        ]}
      />

      {/* Title + actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-heading sm:text-xl 2xl:text-2xl">
            Add Patient
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

      <div className="grid items-start gap-4 sm:gap-5 xl:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_380px]">
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
                name="patientId"
                label={<>Patient ID<Opt /></>}
                placeholder="Auto-generated if left blank"
                value={values.patientId}
                onChange={(e) => setField("patientId", e.target.value)}
                error={errors.patientId}
              />
              <SignupDropdown
                name="marital"
                label="Marital Status"
                placeholder="Select marital status"
                options={MARITAL}
                value={values.marital}
                onChange={(v) => setField("marital", v)}
                error={errors.marital}
              />
              <SignupDropdown
                name="blood"
                label="Blood Type"
                placeholder="Select blood type"
                options={BLOOD}
                value={values.blood}
                onChange={(v) => setField("blood", v)}
                error={errors.blood}
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
                label={<>Address Line 2<Opt /></>}
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
        </form>

        {/* ================= RIGHT: SIDEBAR ================= */}
        <aside className="space-y-4 sm:space-y-5">
          {/* Profile photo */}
          <section className={cardCls}>
            <h3 className="text-sm font-semibold text-heading">Profile Photo</h3>
            
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png, image/jpeg, image/jpg, image/webp"
              onChange={handlePhotoSelect}
              className="hidden"
              id="patient-photo-upload"
            />

            <div className="mt-4 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              {/* Avatar circle / Image preview */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="group relative flex h-24 w-24 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-border bg-shape-sky/40 text-body transition-all duration-200 hover:border-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 sm:h-28 sm:w-28"
                title={photoPreview ? "Click to change photo" : "Click to upload photo"}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
              >
                {photoPreview ? (
                  <>
                    <img
                      src={photoPreview}
                      alt="Patient avatar preview"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    {/* Hover overlay with camera icon */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/45 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                      <Camera className="h-5 w-5 text-white" />
                      <span className="mt-0.5 text-[10px] font-medium text-white">Change</span>
                    </div>
                  </>
                ) : (
                  <>
                    <User className="h-10 w-10 text-body transition-transform duration-200 group-hover:scale-105" strokeWidth={1.5} />
                    {/* Hover overlay */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/25 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                      <Camera className="h-5 w-5 text-white" />
                      <span className="mt-0.5 text-[10px] font-medium text-white">Upload</span>
                    </div>
                  </>
                )}
              </div>

              {/* Action buttons and format info */}
              <div className="flex flex-col gap-1.5">
                {photoPreview ? (
                  <div className="flex items-center gap-3 text-xs font-medium">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="cursor-pointer text-primary transition-colors hover:text-primary-hover hover:underline focus-visible:outline-none"
                    >
                      Change Photo
                    </button>
                    <span className="text-body/30" aria-hidden="true">•</span>
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="cursor-pointer text-danger transition-colors hover:text-danger/80 hover:underline focus-visible:outline-none"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <AddInternalButton
                    text="Upload Photo"
                    icon={<ImagePlus className="h-4 w-4" />}
                    onClick={() => fileInputRef.current?.click()}
                    className="!h-10"
                  />
                )}
                <p className="text-xs text-body">JPG, PNG up to 5MB</p>
              </div>
            </div>
          </section>

          {/* Assign roles */}
          <section className={cardCls}>
            <h3 className="text-sm font-semibold text-heading">Assign Role(s)</h3>
            <p className="mt-1 text-xs text-body">
              Select which role(s) this user will have access to.
            </p>

            <div className="mt-4 space-y-4">
              {ROLES.map((r) => (
                <label
                  key={r.id}
                  htmlFor={`role-${r.id}`}
                  className="flex cursor-pointer items-start gap-3"
                >
                  <input
                    id={`role-${r.id}`}
                    type="checkbox"
                    defaultChecked={r.checked}
                    className={checkboxCls}
                  />
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-heading">
                      {r.label}
                    </span>
                    <span className="mt-0.5 block text-xs leading-relaxed text-body">
                      {r.desc}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </section>

          {/* Status */}
          <section className={cardCls}>
            <h3 className="text-sm font-semibold text-heading">Status</h3>
            <label
              htmlFor="status"
              className="mt-4 flex cursor-pointer items-start gap-3"
            >
              <span className="relative mt-0.5 inline-flex shrink-0">
                <input
                  id="status"
                  type="checkbox"
                  defaultChecked
                  className="peer sr-only"
                />
                <span className="h-6 w-11 rounded-full bg-divider transition-colors duration-200 peer-checked:bg-primary peer-focus-visible:ring-4 peer-focus-visible:ring-primary/25" />
                <span className="pointer-events-none absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-card shadow transition-transform duration-200 peer-checked:translate-x-5" />
              </span>
              <span>
                <span className="block text-sm font-medium text-heading">
                  Active
                </span>
                <span className="mt-0.5 block text-xs text-body">
                  Inactive users will not be able to access the platform.
                </span>
              </span>
            </label>
          </section>
        </aside>
      </div>
    </div>
  );
};

export default AddPatient;