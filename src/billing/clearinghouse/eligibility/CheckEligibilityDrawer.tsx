"use client";

import React, { useEffect, useState } from "react";
import { Search, Send } from "lucide-react";

import AddButton from "@/components/Addbutton";
import ImportButton from "@/components/ImportButton";
import SignupDropdown, { type DropdownOption } from "@/components/SignupDropdown";
import DatePicker from "@/components/Datepicker";
import RadioCheckButtonh from "@/components/RadioCheckButtonh";
import CommonRightSection from "@/components/CommonRightSection";
import { Req, Opt, labelCls } from "@/providers/Shared";

import { PATIENTS, PAYERS, getPatient, getPayerById } from "./checkeligibility/Patientinsurance";
import type { EligibilityRecord } from "./EligibilityVerification";

const PATIENT_OPTIONS: DropdownOption[] = PATIENTS.map((p) => ({
  value: p.id,
  label: `${p.name} (#${p.code})`,
  keywords: [p.name, p.code],
}));
const INSURANCE_OPTIONS: DropdownOption[] = PAYERS.map((p) => ({ value: p.id, label: p.name }));

type Props = {
  open: boolean;
  onClose: () => void;
  onCloseStart: () => void;
  record?: EligibilityRecord | null;
};

type Form = {
  patientId: string;
  insurance: string;
  payerId: string;
  serviceDate: string;
  includeSpecific: "no" | "yes";
  saveHistory: boolean;
};

const initialForm = (): Form => ({
  patientId: "pt125",
  insurance: "bcbs",
  payerId: "00324",
  serviceDate: "2024-04-15",
  includeSpecific: "no",
  saveHistory: true,
});

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="border-t border-divider pt-5 text-base font-semibold text-heading first:border-t-0 first:pt-0">
    {children}
  </h3>
);

const CheckEligibilityDrawer = ({ open, onClose, onCloseStart, record }: Props) => {
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);
  const [form, setForm] = useState<Form>(initialForm());
  const [errors, setErrors] = useState<Partial<Record<"patientId" | "insurance" | "payerId" | "serviceDate", string>>>({});

  useEffect(() => {
    if (!open) return;
    if (record) {
      // Edit mode: populate form with record data
      setForm({
        patientId: "pt125", // TODO: map from record.patientCode
        insurance: record.payerId,
        payerId: record.payerId,
        serviceDate: record.serviceISO,
        includeSpecific: "no",
        saveHistory: true,
      });
    } else {
      // New request mode
      setForm(initialForm());
    }
    setErrors({});
    setClosing(false);
    const frame = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(frame);
  }, [open, record]);

  const close = () => {
    if (closing) return;
    setClosing(true);
    setVisible(false);
    onCloseStart();
    window.setTimeout(() => {
      onClose();
      setClosing(false);
    }, 300);
  };

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  if (!open) return null;

  const set = <K extends keyof Form>(key: K, value: Form[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const patient = getPatient(form.patientId);
  const payer = getPayerById(form.insurance);
  const payerIdOptions: DropdownOption[] = [{ value: payer.payerId, label: `${payer.payerId} (Default)` }];

  const handleSubmit = () => {
    const next: typeof errors = {};
    if (!form.patientId) next.patientId = "Select a patient.";
    if (!form.insurance) next.insurance = "Select an insurance.";
    if (!form.payerId) next.payerId = "Select a payer ID.";
    if (!form.serviceDate) next.serviceDate = "Service date is required.";
    setErrors(next);
    if (Object.keys(next).length) return;

    console.log("submit eligibility request", form); // TODO: call your API here
    close();
  };

  return (
    <CommonRightSection
      label="Check Eligibility"
      ariaModal
      open={visible}
      closing={closing}
      onClose={close}
      panelClassName="2xl:max-w-[460px]"
      header={
        <div>
          <h2 className="text-base font-semibold text-heading">{record ? "Edit Eligibility" : "Check Eligibility"}</h2>
          <p className="mt-0.5 text-xs text-body">
            {record ? "Edit the insurance eligibility request." : "Submit an insurance eligibility request through the configured clearinghouse."}
          </p>
        </div>
      }
    >
      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-4 sm:p-5">
        {/* Patient & insurance */}
        <SectionTitle>Patient &amp; Insurance</SectionTitle>
        <SignupDropdown
          name="drawerPatient"
          label={<>Patient<Req /></>}
          placeholder="Search patient by name or ID..."
          icon={<Search className="h-4 w-4" />}
          options={PATIENT_OPTIONS}
          value={form.patientId}
          onChange={(v) => set("patientId", v)}
          error={errors.patientId}
        />
        <div className="rounded-xl bg-primary/5 p-3 text-xs text-body">
          <p>
            DOB: <span className="font-medium text-heading">{patient.dob}</span>
            <span className="mx-2">Gender: <span className="font-medium text-heading">{patient.gender}</span></span>
          </p>
          <p className="mt-1">
            Phone: <span className="font-medium text-heading">{patient.phone}</span>
          </p>
        </div>

        <SignupDropdown
          name="drawerInsurance"
          label={<>Insurance<Req /></>}
          placeholder="Search or select insurance..."
          options={INSURANCE_OPTIONS}
          value={form.insurance}
          onChange={(v) => {
            set("insurance", v);
            set("payerId", getPayerById(v).payerId);
          }}
          error={errors.insurance}
        />
        <SignupDropdown
          name="drawerPayerId"
          label={<>Payer ID<Req /></>}
          placeholder="Select payer ID"
          searchable={false}
          options={payerIdOptions}
          value={form.payerId}
          onChange={(v) => set("payerId", v)}
          error={errors.payerId}
        />

        {/* Request details */}
        <SectionTitle>Request Details</SectionTitle>
        <DatePicker
          name="drawerServiceDate"
          label={<>Service Date<Req /></>}
          placeholder="mm/dd/yyyy"
          value={form.serviceDate}
          onChange={(v) => set("serviceDate", v)}
          error={errors.serviceDate}
          portalZIndex={400}
        />

        {/* Additional options */}
        <SectionTitle>Additional Options</SectionTitle>
        <div role="radiogroup" aria-label="Include specific service">
          <p className={labelCls}>Include Specific Service</p>
          <div className="space-y-2.5">
            {(
              [
                ["no", "No (General Eligibility)"],
                ["yes", "Yes (Check Specific Service)"],
              ] as const
            ).map(([value, label]) => (
              <label key={value} className="flex w-fit cursor-pointer items-center gap-3 text-sm text-heading">
                <RadioCheckButtonh
                  type="radio"
                  name="drawerIncludeSpecific"
                  value={value}
                  checked={form.includeSpecific === value}
                  onChange={() => set("includeSpecific", value)}
                />
                {label}
              </label>
            ))}
          </div>
        </div>
        <label className="flex w-fit cursor-pointer items-start gap-3 text-sm text-heading">
          <RadioCheckButtonh
            type="checkbox"
            className="mt-0.5"
            checked={form.saveHistory}
            onChange={(e) => set("saveHistory", e.target.checked)}
          />
          Save request to patient&apos;s eligibility history
        </label>
      </div>

      {/* Footer */}
      <div className="flex shrink-0 items-center justify-between gap-3 border-t border-border bg-card p-4 sm:p-5">
        <ImportButton text="Cancel" icon={null} onClick={close} />
        <AddButton
          text="Submit Request"
          icon={<Send className="h-4 w-4" />}
          onClick={handleSubmit}
          className="whitespace-nowrap"
        />
      </div>
    </CommonRightSection>
  );
};

export default CheckEligibilityDrawer;