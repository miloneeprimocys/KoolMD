"use client";

import React from "react";
import {
  BriefcaseMedical,
  Building2,
  FileText,
  Plus,
  ShieldCheck,
  Trash2,
  Video,
} from "lucide-react";

import SignupField from "@/components/SignupField";
import SignupDropdown from "@/components/SignupDropdown";
import {
  AddressFields,
  AddressValues,
  ChipSelect,
  Errors,
  Opt,
  PROVIDER_TYPES,
  Req,
  SPECIALTIES,
  SectionCard,
  StepProps,
  Switch,
  TextArea,
  US_STATE_OPTIONS,
  emptyAddress,
  getSubspecialtyOptions,
  uid,
  validateAddress,
} from "./Shared";

/* ---------- Values ---------- */
export interface LocationRow {
  id: string;
  name: string;
  address: AddressValues;
}

export interface PracticeValues {
  primarySpecialty: string;
  subspecialty: string;
  providerType: string;
  years: string;
  practiceType: "single" | "multiple";
  locations: LocationRow[];
  telemedicine: boolean;
  jurisdictions: string[];
  bio: string;
}

export const initialPractice = (): PracticeValues => ({
  primarySpecialty: "",
  subspecialty: "",
  providerType: "",
  years: "",
  practiceType: "single",
  locations: [{ id: "loc-1", name: "", address: emptyAddress() }],
  telemedicine: true,
  jurisdictions: [],
  bio: "",
});

const BIO_MAX = 500;

/* ---------- Validation ---------- */
export const validatePractice = (v: PracticeValues): Errors => {
  const e: Errors = {};

  if (!v.primarySpecialty) e.primarySpecialty = "Primary specialty is required.";
  if (!v.providerType) e.providerType = "Provider type is required.";

  if (v.years.trim() && Number(v.years) > 60)
    e.years = "Enter a value between 0 and 60.";

  const active = v.practiceType === "single" ? v.locations.slice(0, 1) : v.locations;
  active.forEach((loc, i) => {
    if (!loc.name.trim()) e[`loc${i}_name`] = "Practice name is required.";
    Object.assign(e, validateAddress(loc.address, `loc${i}_`));
  });

  if (v.telemedicine && v.jurisdictions.length === 0)
    e.jurisdictions = "Select at least one jurisdiction.";

  return e;
};

/* ---------- Component ---------- */
const PracticeInfo = ({
  values: v,
  errors,
  onChange,
}: StepProps<PracticeValues>) => {
  const subOptions = getSubspecialtyOptions(v.primarySpecialty);
  const multiple = v.practiceType === "multiple";
  const shown = multiple ? v.locations : v.locations.slice(0, 1);

  const updateLocation = (index: number, patch: Partial<LocationRow>) =>
    onChange({
      locations: v.locations.map((l, i) => (i === index ? { ...l, ...patch } : l)),
    });

  return (
    <div className="space-y-4 sm:space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-heading sm:text-xl">
          Practice Information
        </h2>
        <p className="mt-0.5 text-sm text-body">
          Add provider specialty details, practice locations and telemedicine
          settings.
        </p>
      </div>

      {/* Specialty details */}
      <SectionCard
        icon={<BriefcaseMedical className="h-4 w-4" />}
        title="Specialty Details"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <SignupDropdown
            name="primarySpecialty"
            label="Primary Specialty *"
            placeholder="Select specialty"
            options={SPECIALTIES}
            value={v.primarySpecialty}
            onChange={(val) =>
              onChange({ primarySpecialty: val, subspecialty: "" })
            }
            error={errors.primarySpecialty}
          />
          <SignupDropdown
            key={`sub-${v.primarySpecialty}`}
            name="subspecialty"
            label="Subspecialty"
            placeholder={
              !v.primarySpecialty
                ? "Select specialty first"
                : subOptions.length
                  ? "Select subspecialty"
                  : "No subspecialties"
            }
            options={subOptions}
            value={v.subspecialty}
            onChange={(val) => onChange({ subspecialty: val })}
            disabled={subOptions.length === 0}
          />
          <SignupDropdown
            name="providerType"
            label="Provider Type *"
            placeholder="Select provider type"
            options={PROVIDER_TYPES}
            value={v.providerType}
            onChange={(val) => onChange({ providerType: val })}
            error={errors.providerType}
          />
          <SignupField
            name="years"
            label="Years of Experience"
            placeholder="0"
            inputMode="numeric"
            value={v.years}
            onChange={(e) =>
              onChange({ years: e.target.value.replace(/\D/g, "").slice(0, 2) })
            }
            trailing={<span className="text-sm text-body">years</span>}
            error={errors.years}
          />
        </div>
      </SectionCard>

      {/* Practice locations */}
      <SectionCard
        icon={<Building2 className="h-4 w-4" />}
        title="Practice Locations"
      >
        <fieldset className="mb-4">
          <legend className="mb-2 text-sm font-medium text-label">
            Practice Type<Req />
          </legend>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {(
              [
                { value: "single", label: "Single Location" },
                { value: "multiple", label: "Multiple Locations" },
              ] as const
            ).map((opt) => (
              <label
                key={opt.value}
                className="flex cursor-pointer items-center gap-2 text-sm text-heading"
              >
                <input
                  type="radio"
                  name="practiceType"
                  checked={v.practiceType === opt.value}
                  onChange={() => onChange({ practiceType: opt.value })}
                  className="h-4 w-4 cursor-pointer accent-primary"
                />
                {opt.label}
              </label>
            ))}
          </div>
        </fieldset>

        {shown.map((loc, i) => (
          <div
            key={loc.id}
            className={i > 0 ? "mt-5 border-t border-divider pt-5" : undefined}
          >
            {multiple && (
              <div className="mb-3 flex items-center justify-between">
                <h4 className="text-sm font-semibold text-heading">
                  Location {i + 1}
                </h4>
                {v.locations.length > 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      onChange({
                        locations: v.locations.filter((l) => l.id !== loc.id),
                      })
                    }
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-danger transition-colors hover:bg-danger/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Remove
                  </button>
                )}
              </div>
            )}

            <div className="mb-4">
              <SignupField
                name={`loc${i}_name`}
                label={<>Practice Name<Req /></>}
                placeholder="Enter practice name"
                value={loc.name}
                onChange={(e) => updateLocation(i, { name: e.target.value })}
                error={errors[`loc${i}_name`]}
              />
            </div>

            <AddressFields
              prefix={`loc${i}_`}
              values={loc.address}
              errors={errors}
              onChange={(patch) =>
                updateLocation(i, { address: { ...loc.address, ...patch } })
              }
            />
          </div>
        ))}

        {multiple && (
          <button
            type="button"
            onClick={() =>
              onChange({
                locations: [
                  ...v.locations,
                  { id: uid(), name: "", address: emptyAddress() },
                ],
              })
            }
            className="mt-4 inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-primary/20 bg-primary/10 px-4 text-sm font-medium text-primary transition-all duration-200 hover:border-primary/40 hover:bg-primary/15 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            Add Location
          </button>
        )}
      </SectionCard>

      {/* Telemedicine */}
      <SectionCard
        icon={<Video className="h-4 w-4" />}
        title="Telemedicine Settings"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="mb-2 text-sm font-medium text-label">
              Offer Telemedicine Consultations
            </p>
            <Switch
              checked={v.telemedicine}
              onChange={(c) => onChange({ telemedicine: c })}
              label="Offer telemedicine consultations"
            />
          </div>
          {v.telemedicine && (
            <ChipSelect
              name="jurisdictions"
              label="Telemedicine Jurisdictions *"
              placeholder="Select states"
              options={US_STATE_OPTIONS}
              value={v.jurisdictions}
              onChange={(val) => onChange({ jurisdictions: val })}
              error={errors.jurisdictions}
            />
          )}
        </div>
      </SectionCard>

      {/* Additional information */}
      <SectionCard
        icon={<FileText className="h-4 w-4" />}
        title="Additional Information"
      >
        <TextArea
          name="bio"
          label={<>Professional Bio<Opt /></>}
          placeholder="Tell patients about your experience, approach to care and areas of focus."
          maxLength={BIO_MAX}
          value={v.bio}
          onChange={(val) => onChange({ bio: val })}
        />
      </SectionCard>

      {/* HIPAA card (sits below the left-side content) */}
      <section className="flex items-start gap-4 rounded-2xl border border-primary/20 bg-primary/5 p-4 sm:p-5">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <ShieldCheck className="h-6 w-6" />
        </span>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-heading">HIPAA Compliant</h3>
          <p className="mt-1 text-xs leading-relaxed text-body sm:text-sm">
            All practice information is encrypted and stored securely in
            compliance with HIPAA regulations.
          </p>
        </div>
      </section>
    </div>
  );
};

export default PracticeInfo;