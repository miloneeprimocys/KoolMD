"use client";

import RadioCheckButtonh from "@/components/RadioCheckButtonh";
import React, { useRef } from "react";
import { ClipboardList, Trash2 } from "lucide-react";

import SignupField, { FieldError } from "@/components/SignupField";
import SignupDropdown, { type DropdownOption } from "@/components/SignupDropdown";
import ImportButton from "@/components/ImportButton";
import AddButton from "@/components/Addbutton";
import AddInternalButton from "@/components/AddInternalButton";

/* ---------- Types (shared — move to a types file if preferred) ---------- */
export type MedicationEntry = {
  id: string;
  medication: string;
  dose: string;
  route: string;
  frequency: string;
  duration: string;
  quantity: string;
  unit: string;
  refills: string;
  instructions: string;
};
export type MedicationField = Exclude<keyof MedicationEntry, "id" | "unit" | "refills">;
export type MedicationErrors = Partial<Record<MedicationField, string>>;

/* ---------- Helpers (shared) ---------- */
export const Req = () => <span className="text-danger"> *</span>;
export const Opt = () => <span className="font-normal text-body"> (Optional)</span>;

export const checkboxCls =
  "h-4 w-4 shrink-0 cursor-pointer rounded border-border accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-50";

const PANEL_TONES = {
  blue: "bg-primary/10 text-primary",
  red: "bg-danger/10 text-danger",
} as const;

/** Card with an icon header — same look as SectionCard, but auto height. */
export const Panel = ({
  icon: Icon,
  tone = "blue",
  title,
  action,
  children,
  className = "",
}: {
  icon: React.ComponentType<{ className?: string }>;
  tone?: keyof typeof PANEL_TONES;
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) => (
  <section className={`min-w-0 rounded-[14px] border border-border bg-card ${className}`}>
    <header className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5  sm:py-4">
      <div className="flex min-w-0 items-center gap-3">
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${PANEL_TONES[tone]}`}>
          <Icon className="h-[18px] w-[18px]" />
        </span>
        <h3 className="text-sm font-semibold text-heading sm:text-base">{title}</h3>
      </div>
      {action}
    </header>
    <div className="px-4 pb-4 sm:px-5 sm:pb-5">{children}</div>
  </section>
);

/** Textarea with a live character counter (same look as SignupField). */
export const CounterTextarea = ({
  id,
  label,
  value,
  onChange,
  placeholder,
  error,
  max = 500,
  heightCls = "h-28",
}: {
  id: string;
  label: React.ReactNode;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: string;
  max?: number;
  heightCls?: string;
}) => (
  <div className="w-full">
    <label htmlFor={id} className="mb-2 block text-sm font-medium text-label">
      {label}
    </label>
    <div className="relative">
      <textarea
        id={id}
        name={id}
        value={value}
        maxLength={max}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={`${heightCls} w-full resize-none rounded-xl border bg-card px-4 pb-7 pt-3 text-sm text-heading outline-none transition-colors duration-200 placeholder:text-placeholder ${
          error ? "border-danger" : "border-border hover:border-primary/50 focus:border-primary"
        }`}
      />
      <span className="pointer-events-none absolute bottom-2.5 right-3.5 text-[11px] text-body">
        {value.length}/{max}
      </span>
    </div>
    <FieldError message={error} />
  </div>
);

/* ---------- Props ---------- */
type Props = {
  encounters: DropdownOption[];
  diagnoses: DropdownOption[];
  medicationOptions: DropdownOption[];
  routes: DropdownOption[];
  frequencies: DropdownOption[];
  units: DropdownOption[];
  refills: DropdownOption[];

  encounter: string;
  setEncounter: (v: string) => void;
  encounterError?: string;
  setEncounterError: (v?: string) => void;

  diagnosis: string;
  setDiagnosis: (v: string) => void;

  medications: MedicationEntry[];
  errors: Record<string, MedicationErrors>;
  updateMedication: (id: string, patch: Partial<MedicationEntry>) => void;
  addMedicationBlock: () => void;
  removeMedicationBlock: (id: string) => void;

  notes: string;
  setNotes: (v: string) => void;

  sendEnabled: boolean;
  setSendEnabled: (v: boolean) => void;
  channels: { portal: boolean; email: boolean; sms: boolean };
  setChannels: React.Dispatch<React.SetStateAction<{ portal: boolean; email: boolean; sms: boolean }>>;

  onCancel: () => void;
  onSave: () => void;
  onScrollToMedicationList: () => void;
};

const PrescriptionDetailsSection = ({
  encounters,
  diagnoses,
  medicationOptions,
  routes,
  frequencies,
  units,
  refills,
  encounter,
  setEncounter,
  encounterError,
  setEncounterError,
  diagnosis,
  setDiagnosis,
  medications,
  errors,
  updateMedication,
  addMedicationBlock,
  removeMedicationBlock,
  notes,
  setNotes,
  sendEnabled,
  setSendEnabled,
  channels,
  setChannels,
  onCancel,
  onSave,
  onScrollToMedicationList,
}: Props) => {
  return (
    <Panel
      icon={ClipboardList}
      title="Prescription Details"
      action={
        <ImportButton
          className="text-primary"
          text="Add from Medication List"
          onClick={onScrollToMedicationList}
        />
      }
    >
      <div className="min-w-0 space-y-4">
        <div className="grid min-w-0 gap-4 sm:grid-cols-2 [&>*]:min-w-0">
          <SignupDropdown
            name="encounter"
            label={<>Encounter<Req /></>}
            placeholder="Select encounter"
            options={encounters}
            value={encounter}
            onChange={(v) => {
              setEncounter(v);
              setEncounterError(undefined);
            }}
            searchable={false}
            error={encounterError}
          />
          <SignupDropdown
            name="diagnosis"
            label={<>Diagnosis<Opt /></>}
            placeholder="Search or select diagnosis..."
            options={diagnoses}
            value={diagnosis}
            onChange={setDiagnosis}
          />
        </div>

        {/* Medication blocks */}
        {medications.map((m, index) => {
          const e = errors[m.id] ?? {};
          return (
            <div
              key={m.id}
              id={`medication-${m.id}`}
              className="min-w-0 space-y-3 rounded-xl bg-primary/[0.04] p-3 sm:p-4"
            >
              <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <SignupDropdown
                    name={`medication-${m.id}`}
                    label={<>Medication<Req /></>}
                    placeholder="Search or select medication..."
                    options={medicationOptions}
                    value={m.medication}
                    onChange={(v) => updateMedication(m.id, { medication: v })}
                    error={e.medication}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeMedicationBlock(m.id)}
                  disabled={medications.length === 1}
                  aria-label={`Remove medication ${index + 1}`}
                  className="mt-7 flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-danger/40 bg-card text-danger transition-colors hover:bg-danger/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger/30 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-card"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4 [&>*]:min-w-0">
                <SignupField
                  name={`dose-${m.id}`}
                  label={<>Dose<Req /></>}
                  placeholder="e.g. 500 mg"
                  value={m.dose}
                  onChange={(ev) => updateMedication(m.id, { dose: ev.target.value })}
                  error={e.dose}
                />
                <SignupDropdown
                  name={`route-${m.id}`}
                  label={<>Route<Req /></>}
                  placeholder="Select route"
                  options={routes}
                  value={m.route}
                  onChange={(v) => updateMedication(m.id, { route: v })}
                  searchable={false}
                  error={e.route}
                />
                <SignupDropdown
                  name={`frequency-${m.id}`}
                  label={<>Frequency<Req /></>}
                  placeholder="Select frequency"
                  options={frequencies}
                  value={m.frequency}
                  onChange={(v) => updateMedication(m.id, { frequency: v })}
                  searchable={false}
                  error={e.frequency}
                />
                <SignupField
                  name={`duration-${m.id}`}
                  label={<>Duration<Req /></>}
                  placeholder="e.g. 7 days"
                  value={m.duration}
                  onChange={(ev) => updateMedication(m.id, { duration: ev.target.value })}
                  error={e.duration}
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="mb-2 text-sm font-medium text-label">
                    Quantity<Req />
                  </p>
                  <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_112px] gap-2">
                    <SignupField
                      name={`quantity-${m.id}`}
                      type="number"
                      min={1}
                      placeholder="e.g. 14"
                      value={m.quantity}
                      onChange={(ev) => updateMedication(m.id, { quantity: ev.target.value })}
                      error={e.quantity}
                    />
                    <SignupDropdown
                      name={`unit-${m.id}`}
                      placeholder="Unit"
                      options={units}
                      value={m.unit}
                      onChange={(v) => updateMedication(m.id, { unit: v })}
                      searchable={false}
                    />
                  </div>
                </div>
                <SignupDropdown
                  name={`refills-${m.id}`}
                  label="Refills"
                  placeholder="Select refills"
                  options={refills}
                  value={m.refills}
                  onChange={(v) => updateMedication(m.id, { refills: v })}
                  searchable={false}
                />
              </div>

              <CounterTextarea
                id={`instructions-${m.id}`}
                label={<>Instructions<Req /></>}
                placeholder="e.g. Take 1 tablet once daily after food"
                value={m.instructions}
                onChange={(v) => updateMedication(m.id, { instructions: v })}
                error={e.instructions}
                heightCls="h-24"
              />
            </div>
          );
        })}

        {/* Add another medication */}
        <AddInternalButton
          text="Add Another Medication"
          onClick={addMedicationBlock}
          className="w-full justify-center bg-primary/5"
        />

        <CounterTextarea
          id="prescription-notes"
          label={<>Additional Notes<Opt /></>}
          placeholder="Add any additional instructions for the patient (e.g. general advice, follow-up, etc.)"
          value={notes}
          onChange={setNotes}
          heightCls="h-24"
        />

        {/* Delivery + actions */}
        <div className="flex flex-col gap-4 border-t border-border pt-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-heading">
            <label className="flex cursor-pointer items-center gap-2">
              <RadioCheckButtonh
                type="checkbox"
                checked={sendEnabled}
                onChange={(ev) => setSendEnabled(ev.target.checked)}
                className={checkboxCls}
              />
              Send prescription to patient via
            </label>
            {(
              [
                ["portal", "Patient Portal"],
                ["email", "Email"],
                ["sms", "SMS"],
              ] as const
            ).map(([key, label]) => (
              <label
                key={key}
                className={`flex items-center gap-2 ${sendEnabled ? "cursor-pointer" : "cursor-not-allowed opacity-60"}`}
              >
                <RadioCheckButtonh
                  type="checkbox"
                  disabled={!sendEnabled}
                  checked={channels[key]}
                  onChange={(ev) => setChannels((prev) => ({ ...prev, [key]: ev.target.checked }))}
                  className={checkboxCls}
                />
                {label}
              </label>
            ))}
          </div>

          <div className="flex gap-2">
            <ImportButton text="Cancel" icon={null} onClick={onCancel} className="flex-1 whitespace-nowrap sm:flex-none" />
            <AddButton text="Save Prescription" icon={null} onClick={onSave} className="flex-1 whitespace-nowrap sm:flex-none" />
          </div>
        </div>
      </div>
    </Panel>
  );
};

export default PrescriptionDetailsSection;