"use client";

import React, { useState } from "react";
import ModalShell, {
  FormGrid,
  FullRow,
  ModalDateField,
  OptLabel,
  ReqLabel,
  SignupDropdown,
  SignupField,
} from "@/components/Modalshell";
import { useAppDispatch } from "@/hooks/useAppHooks";
import { saveInsurance } from "@/redux/thunks/patientDetailThunks";
import type {
  CoveragePriority,
  PatientInsurance,
  SubscriberRelationship,
} from "@/types/patient";
import { humanizeEnum } from "@/utils/formatters";

const COVERAGE_PRIORITIES: CoveragePriority[] = ["PRIMARY", "SECONDARY", "TERTIARY"];
const SUBSCRIBER_RELATIONSHIPS: SubscriberRelationship[] = ["SELF", "SPOUSE", "CHILD", "OTHER"];
const toOptions = (values: string[]) => values.map((value) => ({ value, label: humanizeEnum(value) }));
const STATUS_OPTIONS = toOptions(["ACTIVE", "INACTIVE"]);

/** Same rule as the API: letters, digits, spaces or dashes, at most 50. */
const IDENTIFIER_PATTERN = /^[A-Za-z0-9][A-Za-z0-9 -]{0,49}$/;
const IDENTIFIER_MESSAGE = "Use letters, digits, spaces or dashes (max 50).";

type FormValues = {
  coveragePriority: CoveragePriority | "";
  payerName: string;
  planName: string;
  memberId: string;
  groupNumber: string;
  subscriberRelationship: SubscriberRelationship;
  subscriberFirstName: string;
  subscriberLastName: string;
  subscriberDateOfBirth: string;
  effectiveDate: string;
  terminationDate: string;
  status: "ACTIVE" | "INACTIVE";
};
type FormErrors = Partial<Record<keyof FormValues, string>>;

const toFormValues = (insurance: PatientInsurance | null): FormValues => ({
  coveragePriority: insurance?.coveragePriority ?? "",
  payerName: insurance?.payerName ?? "",
  planName: insurance?.planName ?? "",
  memberId: insurance?.memberId ?? "",
  groupNumber: insurance?.groupNumber ?? "",
  subscriberRelationship: insurance?.subscriberRelationship ?? "SELF",
  subscriberFirstName: insurance?.subscriberFirstName ?? "",
  subscriberLastName: insurance?.subscriberLastName ?? "",
  subscriberDateOfBirth: insurance?.subscriberDateOfBirth ?? "",
  effectiveDate: insurance?.effectiveDate ?? "",
  terminationDate: insurance?.terminationDate ?? "",
  status: insurance?.status ?? "ACTIVE",
});

interface InsuranceModalProps {
  patientId: string;
  /** Coverage being edited; null adds a new one. */
  insurance: PatientInsurance | null;
  onClose: () => void;
}

/**
 * Adds or edits a patient's insurance coverage. Coverage is never deleted (claims refer to it):
 * set it to Inactive instead. Mount only while open, with a `key` per coverage.
 */
const InsuranceModal = ({ patientId, insurance, onClose }: InsuranceModalProps) => {
  const dispatch = useAppDispatch();
  const [values, setValues] = useState<FormValues>(() => toFormValues(insurance));
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const isSelf = values.subscriberRelationship === "SELF";

  const setField = <K extends keyof FormValues>(key: K, value: FormValues[K]) => {
    setValues((previous) => ({ ...previous, [key]: value }));
    setErrors((previous) => ({ ...previous, [key]: undefined }));
  };

  const validate = (): FormErrors => {
    const nextErrors: FormErrors = {};
    if (!values.coveragePriority) nextErrors.coveragePriority = "Coverage priority is required.";
    if (!values.payerName.trim()) nextErrors.payerName = "Insurance company is required.";
    if (!values.memberId.trim()) nextErrors.memberId = "Member ID is required.";
    else if (!IDENTIFIER_PATTERN.test(values.memberId.trim())) nextErrors.memberId = IDENTIFIER_MESSAGE;
    if (values.groupNumber.trim() && !IDENTIFIER_PATTERN.test(values.groupNumber.trim())) {
      nextErrors.groupNumber = IDENTIFIER_MESSAGE;
    }
    if (!isSelf) {
      if (!values.subscriberFirstName.trim()) nextErrors.subscriberFirstName = "First name is required.";
      if (!values.subscriberLastName.trim()) nextErrors.subscriberLastName = "Last name is required.";
      if (!values.subscriberDateOfBirth) nextErrors.subscriberDateOfBirth = "Date of birth is required.";
    }
    if (values.effectiveDate && values.terminationDate && values.terminationDate < values.effectiveDate) {
      nextErrors.terminationDate = "End date cannot be before the start date.";
    }
    return nextErrors;
  };

  const handleClose = () => {
    if (!isSaving) onClose();
  };

  const handleSave = async () => {
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length || !values.coveragePriority) return;

    const text = (value: string) => value.trim();
    // Subscriber details belong to someone else's policy only; SELF clears them.
    const subscriber = isSelf
      ? { subscriberFirstName: null, subscriberLastName: null, subscriberDateOfBirth: null }
      : {
          subscriberFirstName: text(values.subscriberFirstName),
          subscriberLastName: text(values.subscriberLastName),
          subscriberDateOfBirth: values.subscriberDateOfBirth,
        };

    setIsSaving(true);
    setSaveError(null);
    const result = await dispatch(
      insurance
        ? saveInsurance({
            patientId,
            insuranceId: insurance.id,
            payload: {
              coveragePriority: values.coveragePriority,
              payerName: text(values.payerName),
              planName: text(values.planName) || null,
              memberId: text(values.memberId),
              groupNumber: text(values.groupNumber) || null,
              subscriberRelationship: values.subscriberRelationship,
              ...subscriber,
              effectiveDate: values.effectiveDate || null,
              terminationDate: values.terminationDate || null,
              status: values.status,
            },
          })
        : saveInsurance({
            patientId,
            payload: {
              coveragePriority: values.coveragePriority,
              payerName: text(values.payerName),
              memberId: text(values.memberId),
              subscriberRelationship: values.subscriberRelationship,
              ...(text(values.planName) ? { planName: text(values.planName) } : {}),
              ...(text(values.groupNumber) ? { groupNumber: text(values.groupNumber) } : {}),
              ...(isSelf
                ? {}
                : {
                    subscriberFirstName: text(values.subscriberFirstName),
                    subscriberLastName: text(values.subscriberLastName),
                    subscriberDateOfBirth: values.subscriberDateOfBirth,
                  }),
              ...(values.effectiveDate ? { effectiveDate: values.effectiveDate } : {}),
              ...(values.terminationDate ? { terminationDate: values.terminationDate } : {}),
            },
          }),
    );
    setIsSaving(false);

    if (saveInsurance.fulfilled.match(result)) {
      onClose();
      return;
    }
    const serverErrors: FormErrors = {};
    for (const [apiField, message] of Object.entries(result.payload?.fieldErrors ?? {})) {
      if (apiField in values) serverErrors[apiField as keyof FormValues] = message;
    }
    setErrors(serverErrors);
    setSaveError(result.payload?.message ?? "The insurance could not be saved.");
  };

  return (
    <ModalShell
      open
      onClose={handleClose}
      onSubmit={handleSave}
      title={insurance ? "Edit Insurance" : "Add Insurance"}
      subtitle="Coverage used for eligibility checks and claims."
      submitText={insurance ? "Save Changes" : "Add Insurance"}
      isSubmitting={isSaving}
      errorMessage={saveError}
    >
      <FormGrid>
        <SignupDropdown
          name="coveragePriority"
          label={<ReqLabel>Coverage Priority</ReqLabel>}
          placeholder="Select priority"
          options={toOptions(COVERAGE_PRIORITIES)}
          value={values.coveragePriority}
          onChange={(value) => setField("coveragePriority", value as CoveragePriority)}
          error={errors.coveragePriority}
          portalMenu
          portalMenuZIndex={1000}
        />
        {insurance ? (
          <SignupDropdown
            name="status"
            label={<ReqLabel>Status</ReqLabel>}
            options={STATUS_OPTIONS}
            value={values.status}
            onChange={(value) => setField("status", value as FormValues["status"])}
            portalMenu
            portalMenuZIndex={1000}
          />
        ) : (
          <div className="hidden sm:block" />
        )}
        <SignupField
          name="payerName"
          label={<ReqLabel>Insurance Company</ReqLabel>}
          placeholder="e.g. Aetna"
          value={values.payerName}
          onChange={(event) => setField("payerName", event.target.value)}
          error={errors.payerName}
          maxLength={200}
        />
        <SignupField
          name="planName"
          label={<OptLabel>Plan Name</OptLabel>}
          placeholder="e.g. Choice POS II"
          value={values.planName}
          onChange={(event) => setField("planName", event.target.value)}
          error={errors.planName}
          maxLength={200}
        />
        <SignupField
          name="memberId"
          label={<ReqLabel>Member ID</ReqLabel>}
          placeholder="Enter member ID"
          value={values.memberId}
          onChange={(event) => setField("memberId", event.target.value)}
          error={errors.memberId}
          maxLength={50}
        />
        <SignupField
          name="groupNumber"
          label={<OptLabel>Group Number</OptLabel>}
          placeholder="Enter group number"
          value={values.groupNumber}
          onChange={(event) => setField("groupNumber", event.target.value)}
          error={errors.groupNumber}
          maxLength={50}
        />
        <ModalDateField
          id="effectiveDate"
          label={<OptLabel>Start Date</OptLabel>}
          value={values.effectiveDate}
          onChange={(value) => setField("effectiveDate", value)}
          error={errors.effectiveDate}
        />
        <ModalDateField
          id="terminationDate"
          label={<OptLabel>End Date</OptLabel>}
          value={values.terminationDate}
          onChange={(value) => setField("terminationDate", value)}
          error={errors.terminationDate}
          min={values.effectiveDate || undefined}
        />
        <FullRow>
          <SignupDropdown
            name="subscriberRelationship"
            label={<ReqLabel>Policy Holder</ReqLabel>}
            options={SUBSCRIBER_RELATIONSHIPS.map((value) => ({
              value,
              label: value === "SELF" ? "Patient (self)" : humanizeEnum(value),
            }))}
            value={values.subscriberRelationship}
            onChange={(value) => setField("subscriberRelationship", value as SubscriberRelationship)}
            portalMenu
            portalMenuZIndex={1000}
          />
        </FullRow>
        {!isSelf && (
          <>
            <SignupField
              name="subscriberFirstName"
              label={<ReqLabel>Policy Holder First Name</ReqLabel>}
              placeholder="Enter first name"
              value={values.subscriberFirstName}
              onChange={(event) => setField("subscriberFirstName", event.target.value)}
              error={errors.subscriberFirstName}
              maxLength={100}
            />
            <SignupField
              name="subscriberLastName"
              label={<ReqLabel>Policy Holder Last Name</ReqLabel>}
              placeholder="Enter last name"
              value={values.subscriberLastName}
              onChange={(event) => setField("subscriberLastName", event.target.value)}
              error={errors.subscriberLastName}
              maxLength={100}
            />
            <ModalDateField
              id="subscriberDateOfBirth"
              label={<ReqLabel>Policy Holder Date of Birth</ReqLabel>}
              value={values.subscriberDateOfBirth}
              onChange={(value) => setField("subscriberDateOfBirth", value)}
              error={errors.subscriberDateOfBirth}
              max={new Date().toISOString().slice(0, 10)}
            />
          </>
        )}
      </FormGrid>
    </ModalShell>
  );
};

export default InsuranceModal;
