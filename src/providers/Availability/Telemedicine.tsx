"use client";

import React from "react";

import SignupDropdown, { DropdownOption } from "@/components/SignupDropdown";
import { FieldError } from "@/components/SignupField";
import { ChipSelect, Errors, US_STATE_OPTIONS } from "../Shared";
import { WeekEditor, WeekSchedule, defaultWeek, validateWeek } from "./Location";

/* ---------------------------------------------------------------- */
/*  Types + defaults                                                */
/* ---------------------------------------------------------------- */
export interface TelemedicineValues {
  teleSameAsInPerson: boolean;
  teleJurisdictions: string[];
  teleAppointmentType: string;
  teleSchedule: WeekSchedule;
}

export const initialTelemedicine = (): TelemedicineValues => ({
  teleSameAsInPerson: true,
  teleJurisdictions: [],
  teleAppointmentType: "video",
  teleSchedule: defaultWeek("tele"),
});

const TELE_TYPES: DropdownOption[] = [
  { value: "video", label: "Video Consultation" },
  { value: "phone", label: "Phone Consultation" },
  { value: "chat", label: "Chat Consultation" },
];

/* ---------------------------------------------------------------- */
/*  Validation (only call when telemedicine is enabled)             */
/* ---------------------------------------------------------------- */
export const validateTelemedicine = (
  v: TelemedicineValues,
  inPersonEnabled: boolean,
  e: Errors,
) => {
  if (v.teleJurisdictions.length === 0)
    e.teleJurisdictions = "Select at least one jurisdiction.";

  if (!v.teleSameAsInPerson) validateWeek(v.teleSchedule, "tele", e);
  else if (!inPersonEnabled)
    e.tele_week =
      "Turn on in-person availability or set different hours for telemedicine.";
};

/* ---------------------------------------------------------------- */
/*  Component                                                       */
/* ---------------------------------------------------------------- */
interface TelemedicineTabProps {
  values: TelemedicineValues;
  inPersonEnabled: boolean;
  errors: Errors;
  onChange: (patch: Partial<TelemedicineValues>) => void;
}

const TelemedicineTab = ({
  values: v,
  inPersonEnabled,
  errors,
  onChange,
}: TelemedicineTabProps) => (
  <div>
    <h3 className="text-base font-semibold text-heading">
      Telemedicine Schedule
    </h3>
    <p className="mb-4 mt-0.5 text-xs text-body">
      Set your availability for video consultations. You can use your in-person
      hours or set different hours.
    </p>

    <div className="mb-4 grid gap-3 sm:grid-cols-2">
      {[
        {
          same: true,
          title: "Use same hours as in-person",
          desc: "Telemedicine will use the same weekly hours as your location schedule.",
        },
        {
          same: false,
          title: "Set different hours for telemedicine",
          desc: "Configure separate working hours for telemedicine consultations.",
        },
      ].map((o) => (
        <label key={o.title} className="flex cursor-pointer items-start gap-3">
          <input
            type="radio"
            name="teleSame"
            checked={v.teleSameAsInPerson === o.same}
            onChange={() => onChange({ teleSameAsInPerson: o.same })}
            className="mt-0.5 h-4 w-4 cursor-pointer accent-primary"
          />
          <span>
            <span className="block text-sm font-semibold text-heading">
              {o.title}
            </span>
            <span className="block text-xs text-body">{o.desc}</span>
          </span>
        </label>
      ))}
    </div>

    <div className="grid gap-2 sm:grid-cols-2">
      <ChipSelect
        name="teleJurisdictions"
        label="Select Telemedicine Jurisdictions *"
        placeholder="Select states"
        options={US_STATE_OPTIONS}
        value={v.teleJurisdictions}
        onChange={(val) => onChange({ teleJurisdictions: val })}
        error={errors.teleJurisdictions}
      />
      <SignupDropdown
        name="teleAppointmentType"
        label="Default Telemedicine Appointment Type"
        placeholder="Select type"
        options={TELE_TYPES}
        value={v.teleAppointmentType}
        onChange={(val) => onChange({ teleAppointmentType: val })}
      />
    </div>

    {v.teleSameAsInPerson ? (
      <>
        <FieldError message={errors.tele_week} />
        <p className="mt-2 rounded-xl bg-primary/5 px-4 py-3 text-sm text-body">
          Telemedicine follows your Location Schedule.
        </p>
      </>
    ) : (
      <div className="mt-2">
        <WeekEditor
          week={v.teleSchedule}
          prefix="tele"
          errors={errors}
          onChange={(w) => onChange({ teleSchedule: w })}
        />
      </div>
    )}
  </div>
);

export default TelemedicineTab;