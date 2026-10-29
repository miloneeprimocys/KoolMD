"use client";

import React from "react";

import EditButton from "@/components/EditButton";
import RadioCheckButtonh from "@/components/RadioCheckButtonh";
import type { PatientSummary } from "./Selectpatient";
import { getReasonLabel, getTypeLabel, type AppointmentDetailsValues } from "./Appointmentdetails";
import {
  durationFor,
  formatLongDate,
  getProvider,
  slotRange,
  type ProviderTimeValues,
} from "./Providertime";

type Props = {
  patient: PatientSummary | null;
  details: AppointmentDetailsValues;
  schedule: ProviderTimeValues;
  sendConfirmation: boolean;
  onSendConfirmationChange: (value: boolean) => void;
  /** Jump back to a step to edit it. */
  onEdit: (step: number) => void;
};

const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="grid grid-cols-1 border-t border-border sm:grid-cols-[200px_minmax(0,1fr)]">
    <dt className="bg-primary/[0.03] px-4 py-3 text-sm text-body sm:border-r sm:border-border">{label}</dt>
    <dd className="min-w-0 break-words px-4 py-3 text-sm text-heading">{children}</dd>
  </div>
);

const Confirmation = ({ patient, details, schedule, sendConfirmation, onSendConfirmationChange, onEdit }: Props) => {
  const provider = getProvider(schedule.provider);
  const minutes = durationFor(details.longerDuration);

  return (
    <div>
      <h3 className="mb-4 text-base font-semibold text-heading">Review Appointment Details</h3>

      <div className="overflow-hidden rounded-xl border border-border">
        {/* Patient */}
        <div className="bg-primary/[0.06] px-4 py-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-heading">Patient</p>
            <EditButton
              section="patient"
              onEdit={() => onEdit(1)}
              label="Edit"
            />
          </div>
          {patient ? (
            <div className="mt-2 flex items-center gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                {patient.initials}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-heading">{patient.name}</p>
                <p className="text-xs text-body">
                  DOB: {patient.dob} ({patient.age}) <span className="mx-1.5 text-border">|</span> MRN: {patient.mrn}
                </p>
              </div>
            </div>
          ) : (
            <p className="mt-2 text-sm text-body">No patient selected.</p>
          )}
        </div>

        <dl>
          <Row label="Appointment Type">{getTypeLabel(details.type)}</Row>
          <Row label="Reason for Visit">{getReasonLabel(details.reason)}</Row>
          <Row label="Provider">
            {provider?.name ?? "—"} {provider && <span className="text-body">({provider.specialty})</span>}
          </Row>
          <Row label="Date & Time">
            {formatLongDate(schedule.date)} <span className="mx-1.5 text-border">|</span>{" "}
            {slotRange(schedule.time, minutes)} ({minutes} minutes)
          </Row>
          <Row label="Location">{schedule.location || "—"}</Row>
          <Row label="Notes">{details.notes.trim() || "-"}</Row>
        </dl>
      </div>

      <label className="mt-4 flex w-fit cursor-pointer items-center gap-2.5 text-sm text-heading">
        <RadioCheckButtonh
          type="checkbox"
          checked={sendConfirmation}
          onChange={(e) => onSendConfirmationChange(e.target.checked)}
        />
        Send confirmation to patient
      </label>
    </div>
  );
};

export default Confirmation;