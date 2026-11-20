"use client";

import React, { useState } from "react";
import { Building2, MapPin, MoreVertical, Phone, Plus, Star, Trash2 } from "lucide-react";

import EditButton from "@/components/EditButton";
import ImportButton from "@/components/ImportButton";
import Tags from "@/components/Tags";
import RadioCheckButtonh from "@/components/RadioCheckButtonh";
import SignupField, { FieldError } from "@/components/SignupField";
import SignupDropdown from "@/components/SignupDropdown";
import ModalShell from "@/components/Modalshell";
import { useAppDispatch } from "@/hooks/useAppHooks";
import { showAddPracticeLocation } from "@/redux/slices/dialogslice";
import {
  AddressFields,
  COUNTRY_PHONE_OPTIONS,
  PhoneField,
  Req,
  SPECIALTIES,
  SectionCard,
  emptyAddress,
  uid,
  validateAddress,
  validatePhone,
  type AddressValues,
  type Errors,
} from "@/providers/Shared";

/* ---------------------------------------------------------------- */
/*  Values + validation (used by ProfileLocation and ProfileReview)  */
/* ---------------------------------------------------------------- */
export type LocationRow = {
  id: string;
  name: string;
  type?: string;
  address: AddressValues;
  phoneCountry: string;
  phone: string;
  faxCountry?: string;
  fax?: string;
  department: string;
  primary: boolean;
};

/** Static starting values (replace with the provider's saved locations). */
export const initialLocations = (): LocationRow[] => [
  {
    id: "loc-1",
    name: "Riverside Medical Clinic",
    address: { address1: "123 Wellness Ave, Suite 200", address2: "", country: "US", state: "CA", city: "San Francisco", zip: "94107" },
    phoneCountry: "US",
    phone: "(415) 555-0100",
    department: "Internal Medicine",
    primary: true,
  },
  {
    id: "loc-2",
    name: "City Health Center",
    address: { address1: "560 Valley Rd", address2: "", country: "US", state: "CA", city: "San Jose", zip: "95128" },
    phoneCountry: "US",
    phone: "(408) 555-0234",
    department: "Internal Medicine",
    primary: false,
  },
];

export const validateLocations = (list: LocationRow[]): Errors => {
  if (list.length === 0) return { locations: "Add at least one practice location." };
  if (!list.some((l) => l.primary)) return { locations: "Mark one location as primary." };
  return {};
};

export const addressLabel = (a: AddressValues) =>
  [a.address1, a.address2, a.city, `${a.state} ${a.zip}`.trim()].filter(Boolean).join(", ");

export const phoneLabel = (country: string, phone: string) =>
  `${COUNTRY_PHONE_OPTIONS.find((c) => c.iso === country)?.dialCode ?? ""} ${phone}`.trim();

/* ---------------------------------------------------------------- */
/*  Photo placeholder                                                */
/* ---------------------------------------------------------------- */
export const LocationThumb = ({ className = "" }: { className?: string }) => (
  <span className={`flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-violet/30 text-primary ${className}`}>
    <Building2 className="h-8 w-8" />
  </span>
);

/* ---------------------------------------------------------------- */
/*  Row menu (Set as primary / Delete)                               */
/* ---------------------------------------------------------------- */
const RowMenu = ({ isPrimary, onPrimary, onDelete }: { isPrimary: boolean; onPrimary: () => void; onDelete: () => void }) => {
  const [open, setOpen] = useState(false);
  const item = "flex w-full cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs transition-colors hover:bg-primary/10";
  return (
    <div className="relative">
      <button
        type="button"
        aria-label="More actions"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-body transition-colors hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
      >
        <MoreVertical className="h-4 w-4" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <ul role="menu" className="absolute right-0 top-full z-20 mt-1 w-44 rounded-xl border border-border bg-card p-1 shadow-2xl">
            {!isPrimary && (
              <li>
                <button type="button" role="menuitem" className={`${item} text-heading`} onClick={() => { setOpen(false); onPrimary(); }}>
                  <Star className="h-3.5 w-3.5" /> Set as Primary
                </button>
              </li>
            )}
            <li>
              <button type="button" role="menuitem" className={`${item} text-danger`} onClick={() => { setOpen(false); onDelete(); }}>
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </button>
            </li>
          </ul>
        </>
      )}
    </div>
  );
};

/* ---------------------------------------------------------------- */
/*  Add / edit location modal (ModalShell)                           */
/* ---------------------------------------------------------------- */
const LocationModal = ({
  initial,
  onClose,
  onSave,
}: {
  initial: LocationRow | null;
  onClose: () => void;
  onSave: (row: LocationRow) => void;
}) => {
  const [form, setForm] = useState<LocationRow>(
    initial ?? { id: uid(), name: "", address: emptyAddress(), phoneCountry: "US", phone: "", department: "", primary: false },
  );
  const [errors, setErrors] = useState<Errors>({});

  const patch = (p: Partial<LocationRow>) => {
    setForm((prev) => ({ ...prev, ...p }));
    setErrors((prev) => {
      const next = { ...prev };
      Object.keys(p).forEach((k) => delete next[`loc_${k}`]);
      return next;
    });
  };

  const submit = () => {
    const e: Errors = {};
    if (!form.name.trim()) e.loc_name = "Location name is required.";
    if (!form.department) e.loc_department = "Department / specialty is required.";
    const phoneErr = validatePhone(form.phone, form.phoneCountry, true);
    if (phoneErr) e.loc_phone = phoneErr;
    Object.assign(e, validateAddress(form.address, "loc_"));
    setErrors(e);
    if (Object.keys(e).length === 0) onSave({ ...form, name: form.name.trim() });
  };

  return (
    <ModalShell
      open
      onClose={onClose}
      onSubmit={submit}
      title={initial ? "Edit Location" : "Add Location"}
      subtitle="Where you see patients in person."
      submitText={initial ? "Save Changes" : "Add Location"}
      width={760}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <SignupField
          name="loc_name"
          label={<>Location Name<Req /></>}
          placeholder="e.g. Riverside Medical Clinic"
          value={form.name}
          onChange={(e) => patch({ name: e.target.value })}
          error={errors.loc_name}
          maxLength={120}
          autoComplete="off"
        />
        <SignupDropdown
          name="loc_department"
          label={<>Department / Specialty<Req /></>}
          placeholder="Select department"
          options={SPECIALTIES}
          value={form.department}
          onChange={(v) => patch({ department: v })}
          error={errors.loc_department}
          portalMenu
          portalMenuZIndex={1000}
        />
        <PhoneField
          name="loc_phone"
          label={<>Phone<Req /></>}
          placeholder="Enter phone number"
          value={form.phone}
          onChange={(v) => patch({ phone: v })}
          countryCode={form.phoneCountry}
          onCountryChange={(iso) => patch({ phoneCountry: iso })}
          error={errors.loc_phone}
        />
        <label className="flex cursor-pointer items-center gap-2 self-end pb-3 text-sm text-heading">
          <RadioCheckButtonh type="checkbox" checked={form.primary} onChange={(e) => patch({ primary: e.target.checked })} />
          Set as primary location
        </label>
      </div>

      <AddressFields
        prefix="loc_"
        values={form.address}
        errors={errors}
        onChange={(a) => {
          setForm((prev) => ({ ...prev, address: { ...prev.address, ...a } }));
          setErrors((prev) => {
            const next = { ...prev };
            Object.keys(a).forEach((k) => delete next[`loc_${k}`]);
            return next;
          });
        }}
      />
    </ModalShell>
  );
};

/* ---------------------------------------------------------------- */
/*  Practice Locations tab                                           */
/* ---------------------------------------------------------------- */
interface Props {
  locations: LocationRow[];
  error?: string;
  onChange: (next: LocationRow[]) => void;
}

const PracticeLocations = ({ locations, error, onChange }: Props) => {
  const dispatch = useAppDispatch();
  const [editing, setEditing] = useState<LocationRow | null>(null);

  const save = (row: LocationRow) => {
    // TODO: dispatch(savePracticeLocation(row))
    const exists = locations.some((l) => l.id === row.id);
    let next = exists ? locations.map((l) => (l.id === row.id ? row : l)) : [...locations, row];
    if (row.primary) next = next.map((l) => ({ ...l, primary: l.id === row.id }));
    else if (!next.some((l) => l.primary)) next = next.map((l, i) => ({ ...l, primary: i === 0 }));
    onChange(next);
    setEditing(null);
  };

  const remove = (id: string) => {
    let next = locations.filter((l) => l.id !== id);
    if (next.length && !next.some((l) => l.primary)) next = next.map((l, i) => ({ ...l, primary: i === 0 }));
    onChange(next);
  };

  const makePrimary = (id: string) => onChange(locations.map((l) => ({ ...l, primary: l.id === id })));

  return (
    <SectionCard
      icon={<MapPin className="h-4 w-4" />}
      title="Practice Locations"
      subtitle="Add one or more locations where you see patients in person."
      action={<ImportButton text="Add Location" icon={<Plus className="h-4 w-4" />} onClick={() => dispatch(showAddPracticeLocation())} className="shrink-0 whitespace-nowrap" />}
    >
      {locations.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border px-4 py-10 text-center text-sm text-body">No practice locations added yet.</p>
      ) : (
        <ul id="locations" className="space-y-3">
          {locations.map((l) => (
            <li key={l.id} className="flex flex-col gap-4 rounded-xl border border-border bg-card p-3 sm:flex-row sm:items-center">
              <LocationThumb className="h-[84px] w-full sm:w-[130px]" />

              <div className="min-w-0 flex-1 space-y-1.5">
                <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-heading">
                  {l.name}
                  {l.primary && <Tags text="Primary" tone="success" size="xs" />}
                </p>
                <p className="flex items-start gap-2 text-xs text-body">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span className="break-words">{addressLabel(l.address)}</span>
                </p>
                <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-body">
                  <span className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 shrink-0" />{phoneLabel(l.phoneCountry, l.phone)}</span>
                  <span className="hidden h-3 w-px bg-border sm:block" />
                  <span className="flex items-center gap-2"><Building2 className="h-3.5 w-3.5 shrink-0" />{l.department}</span>
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-1 sm:pr-2">
                <EditButton section={l.name} onEdit={() => setEditing(l)} />
                <RowMenu isPrimary={l.primary} onPrimary={() => makePrimary(l.id)} onDelete={() => remove(l.id)} />
              </div>
            </li>
          ))}
        </ul>
      )}
      <FieldError message={error} />

      {editing && <LocationModal initial={editing} onClose={() => setEditing(null)} onSave={save} />}
    </SectionCard>
  );
};

export default PracticeLocations;