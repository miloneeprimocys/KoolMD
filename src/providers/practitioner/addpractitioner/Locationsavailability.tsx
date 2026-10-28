"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";

import SignupField, { FieldError } from "@/components/SignupField";
import SignupDropdown from "@/components/SignupDropdown";
import RadioCheckButtonh from "@/components/RadioCheckButtonh";
import AddButton from "@/components/Addbutton";
import ImportButton from "@/components/ImportButton";
import Table from "@/components/Table";
import TableStatus from "@/components/TableStatus";
import { type TableColumn } from "@/components/Tableheader";
import Tags from "@/components/Tags";
import Actions from "@/components/Actions";
import { ReqLabel, toOptions } from "@/components/Modalshell";
import TimePicker from "@/components/Timepicker";

type Errors = Record<string, string>;

/* ---------- Constants ---------- */
export const LOCATION_TYPES = ["Primary", "Secondary", "Telemedicine"] as const;
export type LocationType = (typeof LOCATION_TYPES)[number];

export const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
export const DURATIONS = ["15 minutes", "30 minutes", "45 minutes", "60 minutes"];

const TYPE_OPTIONS = toOptions([...LOCATION_TYPES]);
const DURATION_OPTIONS = toOptions(DURATIONS);
const TELEMEDICINE_ADDRESS = "Online (Virtual)";

/** "09:00" → "09:00 AM" */
export const formatTime = (time: string) => {
  if (!time) return "—";
  const [h, m] = time.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${String(hour).padStart(2, "0")}:${String(m).padStart(2, "0")} ${suffix}`;
};

/* ---------- Values ---------- */
export type LocationItem = {
  id: string;
  name: string;
  address: string;
  type: LocationType;
};

export interface LocationValues {
  locations: LocationItem[];
  days: string[];
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  duration: string;
}

export const initialLocations = (): LocationValues => ({
  locations: [],
  days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
  startTime: "09:00",
  endTime: "17:00",
  duration: "30 minutes",
});

/* ---------- Validation ---------- */
export const validateLocations = (v: LocationValues): Errors => {
  const e: Errors = {};

  if (v.locations.length === 0) e.locations = "Add at least one practice location.";
  else if (!v.locations.some((l) => l.type === "Primary"))
    e.locations = "Mark one location as Primary.";

  if (v.days.length === 0) e.days = "Select at least one working day.";
  if (!v.startTime) e.startTime = "Start time is required.";
  if (!v.endTime) e.endTime = "End time is required.";
  else if (v.startTime && v.endTime <= v.startTime) e.endTime = "End time must be after the start time.";
  if (!v.duration) e.duration = "Select an appointment duration.";

  return e;
};

/* ---------- Component ---------- */
type Props = {
  values: LocationValues;
  errors: Errors;
  onChange: (patch: Partial<LocationValues>) => void;
};

type Draft = Omit<LocationItem, "id"> & { id?: string };
const emptyDraft = (): Draft => ({ name: "", address: "", type: "Secondary" });

const LocationsAvailability = ({ values: v, errors, onChange }: Props) => {
  const [draft, setDraft] = useState<Draft | null>(null);
  const [draftErrors, setDraftErrors] = useState<Errors>({});

  const patchDraft = (patch: Partial<Draft>) => {
    setDraft((prev) => (prev ? { ...prev, ...patch } : prev));
    setDraftErrors({});
  };

  const saveDraft = () => {
    if (!draft) return;
    const isVirtual = draft.type === "Telemedicine";
    const e: Errors = {};
    if (!draft.name.trim()) e.name = "Location name is required.";
    if (!isVirtual && !draft.address.trim()) e.address = "Address is required.";
    setDraftErrors(e);
    if (Object.keys(e).length) return;

    const item: LocationItem = {
      id: draft.id ?? `loc${Date.now().toString(36)}`,
      name: draft.name.trim(),
      address: isVirtual ? TELEMEDICINE_ADDRESS : draft.address.trim(),
      type: draft.type,
    };

    // Only one Primary location: demote the others when this one is Primary.
    const others = v.locations
      .filter((l) => l.id !== item.id)
      .map((l) => (item.type === "Primary" && l.type === "Primary" ? { ...l, type: "Secondary" as const } : l));
    const next = draft.id
      ? v.locations.map((l) => (l.id === item.id ? item : l)).map((l) =>
          l.id !== item.id && item.type === "Primary" && l.type === "Primary" ? { ...l, type: "Secondary" as const } : l,
        )
      : [...others, item];

    onChange({ locations: next });
    setDraft(null);
  };

  const removeLocation = (id: string) => onChange({ locations: v.locations.filter((l) => l.id !== id) });

  const toggleDay = (day: string) =>
    onChange({ days: v.days.includes(day) ? v.days.filter((d) => d !== day) : [...v.days, day] });

  /* ---------- Table ---------- */
  const columns: TableColumn[] = [
    { key: "name", label: "Location Name" },
    { key: "address", label: "Address" },
    { key: "type", label: "Type" },
    { key: "status", label: "Status" },
    {
      key: "actions",
      label: "Actions",
      header: <div className="flex w-full items-center justify-center">Actions</div>,
    },
  ];

  const rows = v.locations.map((l) => ({
    name: <span className="text-sm text-heading">{l.name}</span>,
    address: <span className="text-sm text-heading">{l.address}</span>,
    type: <span className="text-sm text-heading">{l.type}</span>,
    status: <Tags text="Active" tone="success" />,
    actions: (
      <div className="flex w-full items-center justify-center">
        <Actions
          actions={["edit", "delete"]}
          size="sm"
          onAction={(action) => {
            if (action === "edit") {
              setDraft({ ...l });
              setDraftErrors({});
            } else if (action === "delete") removeLocation(l.id);
          }}
        />
      </div>
    ),
  }));

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Practice locations */}
      <section className="rounded-[14px] border border-border bg-card p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-base font-semibold text-heading">Practice Locations</h3>
          {!draft && (
            <AddButton
              text="Add Location"
              icon={<Plus className="h-4 w-4" />}
              onClick={() => {
                setDraft(emptyDraft());
                setDraftErrors({});
              }}
              className="whitespace-nowrap"
            />
          )}
        </div>

        {draft && (
          <div className="mb-4 rounded-xl border border-primary/40 bg-primary/[0.03] p-3 sm:p-4">
            <p className="mb-3 text-sm font-semibold text-heading">{draft.id ? "Edit Location" : "New Location"}</p>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <SignupField
                name="locationName"
                label={<ReqLabel>Location Name</ReqLabel>}
                placeholder="e.g. Main Clinic"
                value={draft.name}
                onChange={(e) => patchDraft({ name: e.target.value })}
                error={draftErrors.name}
              />
              <SignupField
                name="locationAddress"
                label={<ReqLabel>Address</ReqLabel>}
                placeholder={draft.type === "Telemedicine" ? TELEMEDICINE_ADDRESS : "Street, City, State"}
                value={draft.type === "Telemedicine" ? TELEMEDICINE_ADDRESS : draft.address}
                onChange={(e) => patchDraft({ address: e.target.value })}
                disabled={draft.type === "Telemedicine"}
                error={draftErrors.address}
              />
              <SignupDropdown
                name="locationType"
                label={<ReqLabel>Type</ReqLabel>}
                placeholder="Select type"
                searchable={false}
                options={TYPE_OPTIONS}
                value={draft.type}
                onChange={(val) => patchDraft({ type: val as LocationType })}
              />
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <ImportButton text="Cancel" icon={null} onClick={() => setDraft(null)} />
              <AddButton text={draft.id ? "Update Location" : "Save Location"} onClick={saveDraft} />
            </div>
          </div>
        )}

        <div id="locations" className="overflow-hidden rounded-[14px] border border-border bg-card">
          {v.locations.length === 0 ? (
            <TableStatus variant="empty" message="No practice locations added yet." />
          ) : (
            <Table columns={columns} rows={rows} bordered={false} />
          )}
        </div>
        <FieldError message={errors.locations} />
      </section>

      {/* Working hours */}
      <section className="rounded-[14px] border border-border bg-card p-4 sm:p-6">
        <h3 className="mb-4 text-base font-semibold text-heading">Working Hours</h3>

        <div id="days" className="mb-4 flex flex-wrap items-center gap-x-6 gap-y-3">
          {WEEK_DAYS.map((day) => (
            <label key={day} className="flex cursor-pointer items-center gap-2.5 text-sm text-heading">
              <RadioCheckButtonh type="checkbox" checked={v.days.includes(day)} onChange={() => toggleDay(day)} />
              {day}
            </label>
          ))}
        </div>
        <FieldError message={errors.days} />

        <div className="mt-2 grid gap-4 sm:grid-cols-3">
          <TimePicker
            name="startTime"
            label={<ReqLabel>Start Time</ReqLabel>}
            placeholder="Select start time"
            value={v.startTime}
            onChange={(val) => onChange({ startTime: val })}
            error={errors.startTime}
            maxTime={v.endTime || undefined}
          />
          <TimePicker
            name="endTime"
            label={<ReqLabel>End Time</ReqLabel>}
            placeholder="Select end time"
            value={v.endTime}
            onChange={(val) => onChange({ endTime: val })}
            error={errors.endTime}
            minTime={v.startTime || undefined}
          />
          <SignupDropdown
            name="duration"
            label={<ReqLabel>Appointment Duration</ReqLabel>}
            placeholder="Select duration"
            searchable={false}
            options={DURATION_OPTIONS}
            value={v.duration}
            onChange={(val) => onChange({ duration: val })}
            error={errors.duration}
          />
        </div>
      </section>
    </div>
  );
};

export default LocationsAvailability;