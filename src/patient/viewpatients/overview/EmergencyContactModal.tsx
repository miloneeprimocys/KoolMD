"use client";

import React, { useState } from "react";
import ModalShell, {
  FormGrid,
  FullRow,
  ModalCheckboxGroup,
  OptLabel,
  ReqLabel,
  SignupDropdown,
  SignupField,
} from "@/components/Modalshell";
import { useAppDispatch } from "@/hooks/useAppHooks";
import { saveEmergencyContact } from "@/redux/thunks/patientDetailThunks";
import { DEFAULT_COUNTRY, PhoneField, validatePhone } from "@/providers/Shared";
import type { ContactRelationship, EmergencyContact } from "@/types/patient";
import { humanizeEnum } from "@/utils/formatters";
import { fromE164, toE164 } from "@/utils/phone";

const RELATIONSHIPS: ContactRelationship[] = [
  "SPOUSE",
  "PARENT",
  "CHILD",
  "SIBLING",
  "GUARDIAN",
  "FRIEND",
  "OTHER",
];
const RELATIONSHIP_OPTIONS = RELATIONSHIPS.map((value) => ({ value, label: humanizeEnum(value) }));
const PRIMARY_OPTION = [{ value: "primary", label: "Primary emergency contact" }];
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FormValues = {
  fullName: string;
  relationship: ContactRelationship | "";
  phoneCountry: string;
  phone: string;
  email: string;
  isPrimary: boolean;
};
type FormErrors = Partial<Record<keyof FormValues, string>>;

const FORM_FIELD_BY_API_FIELD: Record<string, keyof FormValues> = {
  fullName: "fullName",
  relationship: "relationship",
  phoneNumber: "phone",
  email: "email",
};

const toFormValues = (contact: EmergencyContact | null, isFirstContact: boolean): FormValues => {
  const phone = fromE164(contact?.phoneNumber, DEFAULT_COUNTRY);
  return {
    fullName: contact?.fullName ?? "",
    relationship: contact?.relationship ?? "",
    phoneCountry: phone.countryIso,
    phone: phone.nationalNumber,
    email: contact?.email ?? "",
    // The first contact of a patient is primary by default.
    isPrimary: contact?.isPrimary ?? isFirstContact,
  };
};

interface EmergencyContactModalProps {
  patientId: string;
  /** Contact being edited; null adds a new one. */
  contact: EmergencyContact | null;
  isFirstContact: boolean;
  onClose: () => void;
}

/**
 * Adds or edits one emergency contact of a patient. Mount it only while open (with a `key`
 * per contact) so every opening starts from the contact's current values.
 */
const EmergencyContactModal = ({
  patientId,
  contact,
  isFirstContact,
  onClose,
}: EmergencyContactModalProps) => {
  const dispatch = useAppDispatch();
  const [values, setValues] = useState<FormValues>(() => toFormValues(contact, isFirstContact));
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const setField = <K extends keyof FormValues>(key: K, value: FormValues[K]) => {
    setValues((previous) => ({ ...previous, [key]: value }));
    setErrors((previous) => ({ ...previous, [key]: undefined }));
  };

  const validate = (): FormErrors => {
    const nextErrors: FormErrors = {};
    if (!values.fullName.trim()) nextErrors.fullName = "Full name is required.";
    if (!values.relationship) nextErrors.relationship = "Relationship is required.";
    const phoneError = validatePhone(values.phone, values.phoneCountry, true);
    if (phoneError) nextErrors.phone = phoneError;
    if (values.email.trim() && !EMAIL_PATTERN.test(values.email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }
    return nextErrors;
  };

  const handleClose = () => {
    if (!isSaving) onClose();
  };

  const handleSave = async () => {
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length || !values.relationship) return;

    const common = {
      fullName: values.fullName.trim(),
      relationship: values.relationship,
      phoneNumber: toE164(values.phone, values.phoneCountry),
      isPrimary: values.isPrimary,
    };
    const email = values.email.trim();

    setIsSaving(true);
    setSaveError(null);
    const result = await dispatch(
      contact
        ? saveEmergencyContact({
            patientId,
            contactId: contact.id,
            payload: { ...common, email: email || null },
          })
        : saveEmergencyContact({
            patientId,
            payload: { ...common, ...(email ? { email } : {}) },
          }),
    );
    setIsSaving(false);

    if (saveEmergencyContact.fulfilled.match(result)) {
      onClose();
      return;
    }
    const serverErrors: FormErrors = {};
    for (const [apiField, message] of Object.entries(result.payload?.fieldErrors ?? {})) {
      const formField = FORM_FIELD_BY_API_FIELD[apiField];
      if (formField) serverErrors[formField] = message;
    }
    setErrors(serverErrors);
    setSaveError(result.payload?.message ?? "The emergency contact could not be saved.");
  };

  return (
    <ModalShell
      open
      onClose={handleClose}
      onSubmit={handleSave}
      title={contact ? "Edit Emergency Contact" : "Add Emergency Contact"}
      subtitle="Who should be contacted in an emergency."
      submitText={contact ? "Save Changes" : "Add Contact"}
      isSubmitting={isSaving}
      errorMessage={saveError}
    >
      <FormGrid>
        <FullRow>
          <SignupField
            name="fullName"
            label={<ReqLabel>Full Name</ReqLabel>}
            placeholder="Enter full name"
            value={values.fullName}
            onChange={(event) => setField("fullName", event.target.value)}
            error={errors.fullName}
            maxLength={200}
          />
        </FullRow>
        <FullRow>
          <SignupDropdown
            name="relationship"
            label={<ReqLabel>Relationship</ReqLabel>}
            placeholder="Select relationship"
            options={RELATIONSHIP_OPTIONS}
            value={values.relationship}
            onChange={(value) => setField("relationship", value as ContactRelationship)}
            error={errors.relationship}
            portalMenu
            portalMenuZIndex={1000}
          />
        </FullRow>
        <FullRow>
          <PhoneField
            name="phone"
            label={<ReqLabel>Phone Number</ReqLabel>}
            placeholder="Enter phone number"
            value={values.phone}
            onChange={(value) => setField("phone", value)}
            countryCode={values.phoneCountry}
            onCountryChange={(iso) => setField("phoneCountry", iso)}
            error={errors.phone}
          />
        </FullRow>
        <FullRow>
          <SignupField
            name="email"
            type="email"
            label={<OptLabel>Email Address</OptLabel>}
            placeholder="Enter email address"
            value={values.email}
            onChange={(event) => setField("email", event.target.value)}
            error={errors.email}
          />
        </FullRow>
        <FullRow>
          <ModalCheckboxGroup
            label="Priority"
            options={PRIMARY_OPTION}
            value={values.isPrimary ? ["primary"] : []}
            onChange={(selected) => setField("isPrimary", selected.includes("primary"))}
          />
        </FullRow>
      </FormGrid>
    </ModalShell>
  );
};

export default EmergencyContactModal;
