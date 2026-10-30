"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { User } from "lucide-react";

import SignupField from "@/components/SignupField";
import SignupDropdown, { DropdownOption } from "@/components/SignupDropdown";
import AddButton from "@/components/Addbutton";
import ImportButton from "@/components/ImportButton";
import Breadcrumb from "@/components/Breadcrumb";
import DatePicker from "@/components/Datepicker";
import ErrorToast from "@/components/ErrorToast";
import TableStatus from "@/components/TableStatus";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppHooks";
import {
  selectCreatePatientRequest,
  selectPatientDetail,
  selectUpdatePatientRequest,
} from "@/redux/selectors/patientSelectors";
import { createPatient, updatePatient } from "@/redux/thunks/patientThunks";
import { fetchPatientDetail } from "@/redux/thunks/patientDetailThunks";
import type { RequestError } from "@/redux/thunks/thunkHelpers";
import type {
  AdministrativeGender,
  ContactMethod,
  CreatePatientPayload,
  PatientDetail,
  UpdatePatientPayload,
} from "@/types/patient";
import { fromE164, toE164 } from "@/utils/phone";
import {
  COUNTRY_OPTIONS,
  DEFAULT_COUNTRY,
  PhoneField,
  getCityOptions,
  getStateOptions,
  postalLabelFor,
  validatePhone,
} from "../providers/Shared";

/* ---------- Options ---------- */
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

/** "" lets the server pick (email if given, else phone, else portal). */
const CONTACT_METHODS: DropdownOption[] = [
  { value: "", label: "Automatic" },
  { value: "EMAIL", label: "Email" },
  { value: "SMS", label: "Text message" },
  { value: "PHONE", label: "Phone call" },
  { value: "PORTAL", label: "Patient portal" },
];

/** Backend address rules (USPS state code, ZIP) apply to US addresses only. */
const US_COUNTRY_CODE = "US";
const NAME_MAX_LENGTH = 100;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const US_ZIP_PATTERN = /^\d{5}(-\d{4})?$/;

/* ---------- Form model ---------- */
interface FormValues {
  firstName: string;
  middleName: string;
  lastName: string;
  preferredName: string;
  dob: string;
  gender: AdministrativeGender | "";
  genderIdentity: string;
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
  preferredContactMethod: ContactMethod | "";
  allowEmailNotifications: boolean;
  allowSmsNotifications: boolean;
}

type FormErrors = Partial<Record<keyof FormValues, string>>;

/** Same defaults as the API: email notifications on, SMS off until a phone is confirmed. */
const EMPTY_FORM: FormValues = {
  firstName: "",
  middleName: "",
  lastName: "",
  preferredName: "",
  dob: "",
  gender: "",
  genderIdentity: "",
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
  preferredContactMethod: "",
  allowEmailNotifications: true,
  allowSmsNotifications: false,
};

/** Saved patient → form values (phone split back into country + national number). */
const toFormValues = (patient: PatientDetail): FormValues => {
  const phone = fromE164(patient.phoneNumber, patient.countryCode || DEFAULT_COUNTRY);
  return {
    ...EMPTY_FORM,
    firstName: patient.firstName,
    middleName: patient.middleName ?? "",
    lastName: patient.lastName,
    preferredName: patient.preferredName ?? "",
    dob: patient.dateOfBirth,
    gender: patient.administrativeGender,
    genderIdentity: patient.genderIdentity ?? "",
    phoneCountry: phone.countryIso,
    phone: phone.nationalNumber,
    email: patient.email ?? "",
    language: patient.preferredLanguage,
    address1: patient.addressLine1 ?? "",
    address2: patient.addressLine2 ?? "",
    country: patient.countryCode || DEFAULT_COUNTRY,
    state: patient.stateCode ?? "",
    city: patient.city ?? "",
    zip: patient.postalCode ?? "",
    preferredContactMethod: patient.preferredContactMethod,
    allowEmailNotifications: patient.allowEmailNotifications,
    allowSmsNotifications: patient.allowSmsNotifications,
  };
};

/** Backend validation field → form field, so server errors show under the right input. */
const FORM_FIELD_BY_API_FIELD: Record<string, keyof FormValues> = {
  firstName: "firstName",
  middleName: "middleName",
  lastName: "lastName",
  preferredName: "preferredName",
  dateOfBirth: "dob",
  administrativeGender: "gender",
  genderIdentity: "genderIdentity",
  phoneNumber: "phone",
  email: "email",
  preferredLanguage: "language",
  addressLine1: "address1",
  addressLine2: "address2",
  city: "city",
  stateCode: "state",
  postalCode: "zip",
  countryCode: "country",
  preferredContactMethod: "preferredContactMethod",
};

const todayISO = () => {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
};

/** Client checks mirror the API rules; the server stays the authority (its errors map back). */
const validate = (values: FormValues, isEditMode: boolean): FormErrors => {
  const errors: FormErrors = {};
  if (!values.firstName.trim()) errors.firstName = "First name is required.";
  if (!values.lastName.trim()) errors.lastName = "Last name is required.";
  if (!values.dob) errors.dob = "Date of birth is required.";
  else if (values.dob > todayISO()) errors.dob = "Date of birth cannot be in the future.";
  if (!values.gender) errors.gender = "Gender is required.";

  const hasPhone = values.phone.trim() !== "";
  const hasEmail = values.email.trim() !== "";
  const phoneError = validatePhone(values.phone, values.phoneCountry, false);
  if (phoneError) errors.phone = phoneError;
  if (hasEmail && !EMAIL_PATTERN.test(values.email.trim())) errors.email = "Enter a valid email address.";
  if (!hasPhone && !hasEmail) errors.phone = "Enter a phone number or an email address.";

  // Contact preferences must be reachable (same rule as the API).
  if (values.preferredContactMethod === "EMAIL" && !hasEmail) {
    errors.email = "Email is required when the preferred contact method is email.";
  }
  if ((values.preferredContactMethod === "SMS" || values.preferredContactMethod === "PHONE") && !hasPhone) {
    errors.phone = "Phone number is required for this contact method.";
  }
  if (values.allowSmsNotifications && !hasPhone) {
    errors.phone = "Phone number is required to allow SMS notifications.";
  }

  if (!isEditMode) {
    const hasEmergencyName = values.emergencyName.trim() !== "";
    const hasEmergencyPhone = values.emergencyPhone.trim() !== "";
    if (hasEmergencyName && !hasEmergencyPhone) errors.emergencyPhone = "Enter the contact's phone number.";
    if (hasEmergencyPhone && !hasEmergencyName) errors.emergencyName = "Enter the contact's name.";
    const emergencyPhoneError = validatePhone(values.emergencyPhone, values.emergencyPhoneCountry, false);
    if (emergencyPhoneError) errors.emergencyPhone = emergencyPhoneError;
  }

  if (!values.country) errors.country = "Country is required.";
  if (values.country === US_COUNTRY_CODE && values.zip.trim() && !US_ZIP_PATTERN.test(values.zip.trim())) {
    errors.zip = "Enter a 5-digit ZIP code (or ZIP+4).";
  }
  return errors;
};

/* ---------- Small pieces ---------- */
const cardCls = "rounded-2xl border border-border bg-card p-4 sm:p-5";
const checkboxCls =
  "mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-border accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30";

const Req = () => <span className="text-danger"> *</span>;

const SectionHeader = ({ step, title, subtitle }: { step: number; title: string; subtitle: string }) => (
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

/* ---------- Page ---------- */
const AddPatient = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isEditMode = usePathname() === "/edit-patient";
  const patientId = useSearchParams().get("id");
  const createRequest = useAppSelector(selectCreatePatientRequest);
  const updateRequest = useAppSelector(selectUpdatePatientRequest);
  const patientDetail = useAppSelector(selectPatientDetail);
  const isSaving = createRequest.status === "pending" || updateRequest.status === "pending";

  const [values, setValues] = useState<FormValues>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [toast, setToast] = useState<{
    title: string;
    message: string;
    action?: { label: string; onClick: () => void };
  } | null>(null);
  /** Patient whose saved values fill the form (edit mode); re-filled when another patient opens. */
  const [prefilledPatientId, setPrefilledPatientId] = useState<string | null>(null);

  useEffect(() => {
    if (isEditMode && patientId) dispatch(fetchPatientDetail(patientId));
  }, [dispatch, isEditMode, patientId]);

  // Fill the form while rendering (not in an effect) so it never shows empty values for a frame.
  const loadedPatient =
    isEditMode && patientId && patientDetail.patientId === patientId ? patientDetail.patient : null;
  if (loadedPatient && prefilledPatientId !== loadedPatient.id) {
    setPrefilledPatientId(loadedPatient.id);
    setValues(toFormValues(loadedPatient));
    setErrors({});
  }

  const stateOptions = useMemo(() => getStateOptions(values.country), [values.country]);
  const cityOptions = useMemo(
    () => getCityOptions(values.country, values.state),
    [values.country, values.state],
  );
  const isUsAddress = values.country === US_COUNTRY_CODE;
  const postalLabel = postalLabelFor(values.country);

  /* ---------- Edit mode: wait for the patient before showing the form ---------- */
  if (isEditMode) {
    const pageState = (content: React.ReactNode) => (
      <div className="mx-auto w-full max-w-[1600px] space-y-4">
        <Breadcrumb items={[{ label: "Patients", href: "/patients" }, { label: "Edit Patient" }]} />
        <div className="rounded-[14px] border border-border bg-card">{content}</div>
      </div>
    );
    if (!patientId) {
      return pageState(<TableStatus variant="empty" message="No patient selected. Open a patient from the list." />);
    }
    if (!loadedPatient) {
      if (patientDetail.patientId === patientId && patientDetail.status === "failed") {
        return pageState(
          <div>
            <TableStatus
              variant="error"
              message={patientDetail.error?.message}
              onRetry={() => dispatch(fetchPatientDetail(patientId))}
            />
            <p className="pb-6 text-center text-sm">
              <Link href="/patients" className="font-semibold text-link hover:underline">
                Back to Patients
              </Link>
            </p>
          </div>,
        );
      }
      return pageState(<TableStatus variant="loading" message="Loading patient…" />);
    }
  }

  /* ---------- Field setters ---------- */
  const setField = <K extends keyof FormValues>(field: K, value: FormValues[K]) => {
    setValues((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => ({ ...previous, [field]: undefined }));
  };

  const handleCountryChange = (iso: string) => {
    setValues((previous) => ({ ...previous, country: iso, state: "", city: "", zip: "" }));
    setErrors((previous) => ({ ...previous, country: undefined, state: undefined, city: undefined, zip: undefined }));
  };

  const handleStateChange = (iso: string) => {
    setValues((previous) => ({ ...previous, state: iso, city: "" }));
    setErrors((previous) => ({ ...previous, state: undefined, city: undefined }));
  };

  /* ---------- Payloads ---------- */
  const optional = (value: string) => value.trim() || undefined;

  /** `POST /patients`: empty optional fields are left out. */
  const buildCreatePayload = (confirmNotDuplicate: boolean): CreatePatientPayload => ({
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    middleName: optional(values.middleName),
    preferredName: optional(values.preferredName),
    dateOfBirth: values.dob,
    administrativeGender: values.gender as AdministrativeGender,
    genderIdentity: optional(values.genderIdentity),
    phoneNumber: toE164(values.phone, values.phoneCountry) || undefined,
    email: optional(values.email),
    preferredLanguage: values.language || undefined,
    addressLine1: optional(values.address1),
    addressLine2: optional(values.address2),
    city: optional(values.city),
    stateCode: isUsAddress ? values.state || undefined : undefined,
    postalCode: isUsAddress ? optional(values.zip) : undefined,
    countryCode: values.country,
    preferredContactMethod: values.preferredContactMethod || undefined,
    allowEmailNotifications: values.allowEmailNotifications,
    allowSmsNotifications: values.allowSmsNotifications,
    ...(confirmNotDuplicate ? { confirmNotDuplicate: true } : {}),
  });

  /** `PATCH /patients/:id`: cleared optional fields are sent as null so they are removed. */
  const buildUpdatePayload = (): UpdatePatientPayload => ({
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    middleName: optional(values.middleName) ?? null,
    preferredName: optional(values.preferredName) ?? null,
    dateOfBirth: values.dob,
    administrativeGender: values.gender as AdministrativeGender,
    genderIdentity: optional(values.genderIdentity) ?? null,
    phoneNumber: toE164(values.phone, values.phoneCountry) || null,
    email: optional(values.email) ?? null,
    preferredLanguage: values.language || undefined,
    addressLine1: optional(values.address1) ?? null,
    addressLine2: optional(values.address2) ?? null,
    city: optional(values.city) ?? null,
    stateCode: isUsAddress ? values.state || null : null,
    postalCode: isUsAddress ? (optional(values.zip) ?? null) : null,
    countryCode: values.country,
    preferredContactMethod: values.preferredContactMethod || undefined,
    allowEmailNotifications: values.allowEmailNotifications,
    allowSmsNotifications: values.allowSmsNotifications,
  });

  /* ---------- Save ---------- */
  const scrollToField = (field: string) => {
    const element = document.getElementById(field);
    element?.scrollIntoView({ behavior: "smooth", block: "center" });
    element?.focus?.();
  };

  /** Shows the server's per-field messages under the matching inputs. */
  const showServerError = (requestError: RequestError) => {
    const serverErrors: FormErrors = {};
    for (const [apiField, message] of Object.entries(requestError.fieldErrors ?? {})) {
      const formField = FORM_FIELD_BY_API_FIELD[apiField];
      if (formField) serverErrors[formField] = message;
    }
    if (Object.keys(serverErrors).length) {
      setErrors(serverErrors);
      scrollToField(Object.keys(serverErrors)[0]);
    }
    setToast({ title: "Could not save patient", message: requestError.message });
  };

  const save = async (confirmNotDuplicate = false) => {
    if (isEditMode && loadedPatient) {
      const result = await dispatch(updatePatient({ patientId: loadedPatient.id, payload: buildUpdatePayload() }));
      if (updatePatient.fulfilled.match(result)) {
        router.push(`/view-patient?id=${encodeURIComponent(loadedPatient.id)}`);
      } else if (result.payload) {
        showServerError(result.payload);
      }
      return;
    }

    const emergencyPhone = toE164(values.emergencyPhone, values.emergencyPhoneCountry);
    const result = await dispatch(
      createPatient({
        patient: buildCreatePayload(confirmNotDuplicate),
        emergencyContact:
          values.emergencyName.trim() && emergencyPhone
            ? { fullName: values.emergencyName.trim(), relationship: "OTHER", phoneNumber: emergencyPhone }
            : undefined,
      }),
    );
    if (createPatient.fulfilled.match(result)) {
      // Always leave the form once the patient exists (staying would let a second click create a
      // duplicate). If the emergency contact failed, the patient page shows "Add Emergency Contact".
      router.push(`/view-patient?id=${encodeURIComponent(result.payload.patient.id)}`);
      return;
    }
    const requestError = result.payload;
    if (!requestError) return;
    if (requestError.errorCode === "POSSIBLE_DUPLICATE_PATIENT") {
      setToast({
        title: "Possible duplicate patient",
        message: "A patient with the same name and date of birth already exists.",
        action: { label: "Save anyway", onClick: () => save(true) },
      });
      return;
    }
    showServerError(requestError);
  };

  const submit = (event?: React.FormEvent) => {
    event?.preventDefault();
    if (isSaving) return;
    const validationErrors = validate(values, isEditMode);
    setErrors(validationErrors);
    const invalidFields = Object.keys(validationErrors);
    if (invalidFields.length) {
      scrollToField(invalidFields[0]);
      setToast({
        title: "Check the form",
        message: `${invalidFields.length} field${invalidFields.length > 1 ? "s need" : " needs"} attention.`,
      });
      return;
    }
    save();
  };

  const displayName = [values.firstName, values.lastName].filter((part) => part.trim()).join(" ");
  const title = isEditMode ? "Edit Patient" : "Add Patient";

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-4 sm:space-y-5">
      <ErrorToast
        isOpen={toast !== null}
        onClose={() => setToast(null)}
        title={toast?.title}
        message={toast?.message}
        action={toast?.action}
      />
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Patients", href: "/patients" },
          ...(isEditMode && loadedPatient
            ? [{ label: displayName || "Patient", href: `/view-patient?id=${encodeURIComponent(loadedPatient.id)}` }]
            : []),
          { label: title },
        ]}
      />

      {/* Title + actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-heading sm:text-xl 2xl:text-2xl">{title}</h2>
          <p className="mt-0.5 text-sm text-body">
            {isEditMode ? "Update patient details and communication preferences." : "Create a new patient record."}
          </p>
        </div>
        <div className="flex flex-row gap-2">
          <ImportButton
            text="Cancel"
            icon={null}
            className="flex-1 sm:flex-none"
            onClick={() =>
              router.push(loadedPatient ? `/view-patient?id=${encodeURIComponent(loadedPatient.id)}` : "/patients")
            }
          />
          <AddButton
            text={isSaving ? "Saving…" : "Save Patient"}
            icon={null}
            className="flex-1 sm:flex-none"
            onClick={() => submit()}
            disabled={isSaving}
          />
        </div>
      </div>

      <div className="grid items-start gap-4 sm:gap-5 xl:grid-cols-[minmax(0,1fr)_340px] 2xl:grid-cols-[minmax(0,1fr)_380px]">
        <form className={`${cardCls} min-w-0 sm:p-6`} onSubmit={submit} noValidate>
          {/* 1. Basic information */}
          <section>
            <SectionHeader step={1} title="Basic Information" subtitle="The patient's personal details." />
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <SignupField
                name="firstName"
                label={<>First Name<Req /></>}
                placeholder="Enter first name"
                value={values.firstName}
                onChange={(event) => setField("firstName", event.target.value)}
                error={errors.firstName}
                maxLength={NAME_MAX_LENGTH}
                autoComplete="off"
              />
              <SignupField
                name="lastName"
                label={<>Last Name<Req /></>}
                placeholder="Enter last name"
                value={values.lastName}
                onChange={(event) => setField("lastName", event.target.value)}
                error={errors.lastName}
                maxLength={NAME_MAX_LENGTH}
                autoComplete="off"
              />
              <DatePicker
                name="dob"
                label={<>Date of Birth<Req /></>}
                placeholder="dd-mm-yyyy"
                value={values.dob}
                onChange={(value) => setField("dob", value)}
                maxDate={todayISO()}
                error={errors.dob}
              />
              <SignupDropdown
                name="gender"
                label={<>Gender<Req /></>}
                placeholder="Select gender"
                options={GENDERS}
                value={values.gender}
                onChange={(value) => setField("gender", value as AdministrativeGender)}
                error={errors.gender}
              />
              <PhoneField
                name="phone"
                label="Phone Number"
                placeholder="Enter phone number"
                value={values.phone}
                onChange={(value) => setField("phone", value)}
                countryCode={values.phoneCountry}
                onCountryChange={(iso) => setField("phoneCountry", iso)}
                error={errors.phone}
              />
              <SignupField
                name="email"
                type="email"
                label="Email Address"
                placeholder="Enter email address"
                value={values.email}
                onChange={(event) => setField("email", event.target.value)}
                error={errors.email}
                hint={errors.email ? undefined : "A phone number or an email is required."}
                autoComplete="off"
              />
            </div>
          </section>

          <hr className="my-6 border-divider" />

          {/* 2. Additional information */}
          <section>
            <SectionHeader step={2} title="Additional Information" subtitle="Optional details for the profile." />
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <SignupField
                name="middleName"
                label="Middle Name"
                placeholder="Enter middle name"
                value={values.middleName}
                onChange={(event) => setField("middleName", event.target.value)}
                error={errors.middleName}
                maxLength={NAME_MAX_LENGTH}
              />
              <SignupField
                name="preferredName"
                label="Preferred Name"
                placeholder="Enter preferred name"
                value={values.preferredName}
                onChange={(event) => setField("preferredName", event.target.value)}
                error={errors.preferredName}
                maxLength={NAME_MAX_LENGTH}
              />
              <SignupField
                name="genderIdentity"
                label="Gender Identity"
                placeholder="Enter gender identity"
                value={values.genderIdentity}
                onChange={(event) => setField("genderIdentity", event.target.value)}
                error={errors.genderIdentity}
                maxLength={NAME_MAX_LENGTH}
              />
              <SignupDropdown
                name="language"
                label="Preferred Language"
                placeholder="Select language"
                options={LANGUAGES}
                value={values.language}
                onChange={(value) => setField("language", value)}
                error={errors.language}
              />
              {!isEditMode && (
                <>
                  <SignupField
                    name="emergencyName"
                    label="Emergency Contact Name"
                    placeholder="Enter contact name"
                    value={values.emergencyName}
                    onChange={(event) => setField("emergencyName", event.target.value)}
                    error={errors.emergencyName}
                    maxLength={200}
                  />
                  <PhoneField
                    name="emergencyPhone"
                    label="Emergency Contact Number"
                    placeholder="Enter phone number"
                    value={values.emergencyPhone}
                    onChange={(value) => setField("emergencyPhone", value)}
                    countryCode={values.emergencyPhoneCountry}
                    onCountryChange={(iso) => setField("emergencyPhoneCountry", iso)}
                    error={errors.emergencyPhone}
                  />
                </>
              )}
            </div>
          </section>

          <hr className="my-6 border-divider" />

          {/* 3. Address */}
          <section>
            <SectionHeader step={3} title="Address" subtitle="The patient's residential address." />
            <div className="grid gap-4 sm:grid-cols-2">
              <SignupField
                name="address1"
                label="Address Line 1"
                placeholder="Street address"
                value={values.address1}
                onChange={(event) => setField("address1", event.target.value)}
                error={errors.address1}
              />
              <SignupField
                name="address2"
                label="Address Line 2"
                placeholder="Apartment, suite, unit"
                value={values.address2}
                onChange={(event) => setField("address2", event.target.value)}
                error={errors.address2}
              />
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <SignupDropdown
                name="country"
                label={<>Country<Req /></>}
                placeholder="Select country"
                options={COUNTRY_OPTIONS}
                value={values.country}
                onChange={handleCountryChange}
                error={errors.country}
              />
              <SignupDropdown
                key={`state-${values.country}`}
                name="state"
                label={isUsAddress ? "State" : "State / Region"}
                placeholder={stateOptions.length ? "Select state" : "No states available"}
                options={stateOptions}
                value={values.state}
                onChange={handleStateChange}
                disabled={stateOptions.length === 0}
                error={errors.state}
                hint={isUsAddress ? undefined : "Used to find the city; stored for US addresses only."}
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
                onChange={(value) => setField("city", value)}
                disabled={cityOptions.length === 0 || (stateOptions.length > 0 && !values.state)}
                error={errors.city}
              />
              {isUsAddress && (
                <SignupField
                  name="zip"
                  label={postalLabel}
                  placeholder={`Enter ${postalLabel.toLowerCase()}`}
                  value={values.zip}
                  onChange={(event) => setField("zip", event.target.value)}
                  error={errors.zip}
                  maxLength={10}
                />
              )}
            </div>
          </section>

          <hr className="my-6 border-divider" />

          {/* 4. Communication preferences */}
          <section>
            <SectionHeader step={4} title="Communication Preferences" subtitle="How the patient prefers to be contacted." />
            <div className="grid gap-4 sm:grid-cols-2 sm:items-start">
              <SignupDropdown
                name="preferredContactMethod"
                label="Preferred Contact Method"
                options={CONTACT_METHODS}
                value={values.preferredContactMethod}
                onChange={(value) => setField("preferredContactMethod", value as FormValues["preferredContactMethod"])}
                error={errors.preferredContactMethod}
              />
              <div className="flex flex-col gap-3 sm:pt-8">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={values.allowEmailNotifications}
                    onChange={(event) => setField("allowEmailNotifications", event.target.checked)}
                    className={checkboxCls}
                  />
                  <span className="text-sm text-heading">Allow email notifications</span>
                </label>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={values.allowSmsNotifications}
                    onChange={(event) => setField("allowSmsNotifications", event.target.checked)}
                    className={checkboxCls}
                  />
                  <span className="text-sm text-heading">Allow SMS notifications</span>
                </label>
              </div>
            </div>
          </section>

          {/* Enter in any field submits the form */}
          <button type="submit" className="hidden" aria-hidden tabIndex={-1} />
        </form>

        {/* Summary */}
        <aside className={cardCls}>
          <h3 className="text-sm font-semibold text-heading">Profile</h3>
          <div className="mt-4 flex items-center gap-4">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-2 border-border bg-shape-sky/40 text-body sm:h-24 sm:w-24">
              <User className="h-9 w-9 text-body" strokeWidth={1.5} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-heading">{displayName || "New patient"}</p>
              <p className="mt-1 text-xs text-body">
                {loadedPatient ? `Patient ID ${loadedPatient.medicalRecordNumber}` : "A patient ID is assigned on save."}
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default AddPatient;
