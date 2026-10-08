"use client";

import React, { ReactNode } from "react";
import {  X } from "lucide-react";

import SignupField from "@/components/SignupField";
import SignupDropdown from "@/components/SignupDropdown";
import DatePicker from "@/components/Datepicker";
import FileDropzone from "@/components/Filedropzone";
import AddInternalButton from "@/components/AddInternalButton";
import {
  Errors,
  Req,
  StepProps,
  US_STATE_OPTIONS,
  cardCls,
  toOptions,
  todayISO,
  uid,
} from "./Shared";

/* ---------- Values ---------- */
export interface CertRow {
  id: string;
  type: string;
  number: string;
  expiry: string;
}

export interface LicenseValues {
  medicalFile: File | null;
  medicalNumber: string;
  medicalState: string;
  medicalExpiry: string;
  deaFile: File | null;
  deaNumber: string;
  deaExpiry: string;
  certFile: File | null;
  certs: CertRow[];
}

export const initialLicenses = (): LicenseValues => ({
  medicalFile: null,
  medicalNumber: "",
  medicalState: "",
  medicalExpiry: "",
  deaFile: null,
  deaNumber: "",
  deaExpiry: "",
  certFile: null,
  certs: [{ id: "cert-1", type: "", number: "", expiry: "" }],
});

const CERT_TYPES = toOptions([
  "ABMS Board Certification",
  "AOA Board Certification",
  "ACLS",
  "BLS",
  "PALS",
]);

/* ---------- Validation ---------- */
export const validateLicenses = (v: LicenseValues): Errors => {
  const e: Errors = {};

  if (!v.medicalFile) e.medicalFile = "Upload your medical license.";
  if (!v.medicalNumber.trim()) e.medicalNumber = "License number is required.";
  if (!v.medicalState) e.medicalState = "Issuing state is required.";
  if (!v.medicalExpiry) e.medicalExpiry = "Expiration date is required.";

  if (!v.deaFile) e.deaFile = "Upload your DEA certificate.";
  if (!v.deaNumber.trim()) e.deaNumber = "DEA number is required.";
  else if (!/^[A-Za-z]{2}\d{7}$/.test(v.deaNumber.trim()))
    e.deaNumber = "DEA number is 2 letters followed by 7 digits.";
  if (!v.deaExpiry) e.deaExpiry = "Expiration date is required.";

  // Certifications are optional, but a started row must be complete
  v.certs.forEach((c) => {
    const started = c.type || c.number.trim() || c.expiry;
    if (!started) return;
    if (!c.type) e[`cert_${c.id}_type`] = "Select a certification type.";
    if (!c.number.trim()) e[`cert_${c.id}_number`] = "Enter the number.";
  });

  return e;
};

/* ---------- Layout helper ---------- */
const LicenseCard = ({
  title,
  description,
  badge,
  children,
  dropzone,
}: {
  title: string;
  description: string;
  badge: "Required" | "Optional";
  dropzone: ReactNode;
  children: ReactNode;
}) => (
  <section className={`${cardCls} sm:p-6`}>
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h3 className="text-base font-semibold text-heading">{title}</h3>
        <p className="mt-0.5 text-xs text-body">{description}</p>
      </div>
      <span
        className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-medium ${
          badge === "Required"
            ? "bg-primary/10 text-primary"
            : "bg-divider text-body"
        }`}
      >
        {badge}
      </span>
    </div>
    <div className="mt-4 grid gap-4 lg:gap-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
      {dropzone}
      <div>{children}</div>
    </div>
  </section>
);

/* ---------- Component ---------- */
const Licenses = ({ values: v, errors, onChange }: StepProps<LicenseValues>) => {
  const today = todayISO();

  const updateCert = (id: string, patch: Partial<CertRow>) =>
    onChange({
      certs: v.certs.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    });

  return (
    <div className="space-y-4 sm:space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-heading sm:text-xl">
          Licenses and Certificates
        </h2>
        <p className="mt-0.5 text-sm text-body">
          Upload your professional licenses, certifications and other required
          documents. All documents are securely stored and HIPAA compliant.
        </p>
      </div>

      {/* Medical license */}
      <LicenseCard
        title="Medical License"
        description="Upload your state medical license with license number and expiration date."
        badge="Required"
        dropzone={
          <FileDropzone
            title="your medical license here"
            file={v.medicalFile}
            onChange={(f) => onChange({ medicalFile: f })}
            error={errors.medicalFile}
          />
        }
      >
        <div className="grid gap-2 sm:grid-cols-2">
          <SignupField
            name="medicalNumber"
            label={<>License Number<Req /></>}
            placeholder="Enter license number"
            value={v.medicalNumber}
            onChange={(e) => onChange({ medicalNumber: e.target.value })}
            error={errors.medicalNumber}
          />
          <SignupDropdown
            name="medicalState"
            label="Issuing State *"
            placeholder="Select state"
            options={US_STATE_OPTIONS}
            value={v.medicalState}
            onChange={(val) => onChange({ medicalState: val })}
            error={errors.medicalState}
          />
          <div className="sm:col-span-2">
            <DatePicker
              name="medicalExpiry"
              label={<>Expiration Date<Req /></>}
              value={v.medicalExpiry}
              onChange={(val) => onChange({ medicalExpiry: val })}
              minDate={today}
              error={errors.medicalExpiry}
            />
          </div>
        </div>
      </LicenseCard>

      {/* DEA certificate */}
      <LicenseCard
        title="DEA Certificate"
        description="Upload your DEA certificate for controlled substance prescribing (if applicable)."
        badge="Required"
        dropzone={
          <FileDropzone
            title="your DEA certificate here"
            file={v.deaFile}
            onChange={(f) => onChange({ deaFile: f })}
            error={errors.deaFile}
          />
        }
      >
        <div className="grid gap-2 sm:grid-cols-2">
          <SignupField
            name="deaNumber"
            label={<>DEA Number<Req /></>}
            placeholder="e.g. AB1234567"
            value={v.deaNumber}
            onChange={(e) =>
              onChange({ deaNumber: e.target.value.toUpperCase().slice(0, 9) })
            }
            error={errors.deaNumber}
          />
          <DatePicker
            name="deaExpiry"
            label={<>Expiration Date<Req /></>}
            value={v.deaExpiry}
            onChange={(val) => onChange({ deaExpiry: val })}
            minDate={today}
            error={errors.deaExpiry}
          />
        </div>
      </LicenseCard>

      {/* Board certifications */}
      <LicenseCard
        title="Board Certifications"
        description="Upload your board certification documents (if applicable)."
        badge="Optional"
        dropzone={
          <FileDropzone
            title="certification documents here"
            file={v.certFile}
            onChange={(f) => onChange({ certFile: f })}
          />
        }
      >
        <div className="space-y-2">
          {v.certs.map((c, i) => (
            <div
              key={c.id}
              className={
                i > 0 ? "border-t border-divider pt-3" : undefined
              }
            >
              <div className="grid gap-2 sm:grid-cols-2">
                <SignupDropdown
                  name={`cert_${c.id}_type`}
                  label="Certification Type"
                  placeholder="Select certification type"
                  options={CERT_TYPES}
                  value={c.type}
                  onChange={(val) => updateCert(c.id, { type: val })}
                  error={errors[`cert_${c.id}_type`]}
                />
                <SignupField
                  name={`cert_${c.id}_number`}
                  label="Certification Number"
                  placeholder="Enter certification number"
                  value={c.number}
                  onChange={(e) =>
                    updateCert(c.id, { number: e.target.value })
                  }
                  error={errors[`cert_${c.id}_number`]}
                />
                <DatePicker
                  name={`cert_${c.id}_expiry`}
                  label="Expiration Date"
                  value={c.expiry}
                  onChange={(val) => updateCert(c.id, { expiry: val })}
                  minDate={today}
                />
                {v.certs.length > 1 && (
                  <div className="flex items-end pb-5">
                    <button
                      type="button"
                      onClick={() =>
                        onChange({ certs: v.certs.filter((x) => x.id !== c.id) })
                      }
                      className="inline-flex h-12 cursor-pointer items-center gap-2 rounded-xl px-3 text-sm font-medium text-danger transition-colors hover:bg-danger/10"
                    >
                      <X className="h-4 w-4" />
                      Remove
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

         <AddInternalButton
  text="Add Another Certification"
  onClick={() =>
    onChange({
      certs: [
        ...v.certs,
        { id: uid(), type: "", number: "", expiry: "" },
      ],
    })
  }
/>
        </div>
      </LicenseCard>
    </div>
  );
};

export default Licenses;