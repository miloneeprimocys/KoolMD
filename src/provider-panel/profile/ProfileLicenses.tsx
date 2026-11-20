"use client";

import React, { useRef, useState } from "react";
import { FileText, GraduationCap, Paperclip, Plus, Trash2, Upload, X, CheckCircle2 } from "lucide-react";

import EditButton from "@/components/EditButton";
import SignupField, { FieldError } from "@/components/SignupField";
import SignupDropdown from "@/components/SignupDropdown";
import DatePicker from "@/components/Datepicker";
import AddButton from "@/components/Addbutton";
import ImportButton from "@/components/ImportButton";
import Table from "@/components/Table";
import TableStatus from "@/components/TableStatus";
import { type TableColumn } from "@/components/Tableheader";
import Content from "@/components/Content";
import Tags, { type TagTone } from "@/components/Tags";
import { iconBtn } from "@/components/Verticalsteps";
import { useAppDispatch } from "@/hooks/useAppHooks";
import { showAddStateLicense } from "@/redux/slices/dialogslice";
import {
  ChipSelect,
  Req,
  SectionCard,
  US_STATE_OPTIONS,
  toOptions,
  todayISO,
  uid,
  type Errors,
  type StepProps,
} from "@/providers/Shared";
import { ProviderIdentifiersCard, validateIdentifiers } from "./ProfileRegistration";

/* ---------------------------------------------------------------- */
/*  Values + validation (used by ProviderProfile and ProfileReview)  */
/* ---------------------------------------------------------------- */
export type LicenseRow = {
  id: string;
  state: string;
  number: string;
  type: string;
  issue: string;
  expiry: string;
  authority?: string;
  primary?: boolean;
};

export type CredentialFile = { id: string; name: string; size: string; url?: string };

export interface LicensesValues {
  licenses: LicenseRow[];
  credentials: string[];
  certOrg: string;
  certExpiry: string;
  files: CredentialFile[];
}

/** Static starting values (replace with the provider's saved licenses). */
export const initialLicenses = (): LicensesValues => ({
  licenses: [
    { id: "lic-1", state: "CA", number: "A123456", type: "Medical License", issue: "2020-04-01", expiry: "2030-03-31" },
    { id: "lic-2", state: "TX", number: "TX987654", type: "Medical License", issue: "2021-06-15", expiry: "2031-06-14" },
    { id: "lic-3", state: "NY", number: "NY456789", type: "Medical License", issue: "2019-01-10", expiry: "2029-01-09" },
  ],
  credentials: ["ABIM – Internal Medicine", "ACLS – Advanced Cardiac Life Support"],
  certOrg: "American Board of Internal Medicine",
  certExpiry: "2029-03-31",
  files: [
    { id: "cf-1", name: "CA_Medical_License.pdf", size: "2.4 MB" },
    { id: "cf-2", name: "TX_Medical_License.pdf", size: "2.1 MB" },
    { id: "cf-3", name: "Board_Certification.pdf", size: "3.8 MB" },
    { id: "cf-4", name: "DEA_Registration.pdf", size: "1.2 MB" },
  ],
});

export const validateLicenses = (v: LicensesValues, identifiers: { npi: string; dea: string }): Errors => {
  const e: Errors = { ...validateIdentifiers(identifiers.npi, identifiers.dea) };
  if (v.licenses.length === 0) e.licenses = "Add at least one state license.";
  if (v.credentials.length > 0) {
    if (!v.certOrg.trim()) e.certOrg = "Certifying organization is required.";
    if (!v.certExpiry) e.certExpiry = "Certification expiry is required.";
  }
  return e;
};

/* ---------------------------------------------------------------- */
/*  Helpers                                                          */
/* ---------------------------------------------------------------- */
const STATE_LABELS = Object.fromEntries(US_STATE_OPTIONS.map((s) => [s.value, s.label]));
export const stateLabel = (code: string) => (STATE_LABELS[code] ? `${STATE_LABELS[code]} (${code})` : code);

export const formatDate = (iso: string) =>
  iso ? new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }) : "—";

const licenseStatus = (expiry: string): { label: string; tone: TagTone } => {
  const today = todayISO();
  if (expiry < today) return { label: "Expired", tone: "danger" };
  const soon = new Date();
  soon.setDate(soon.getDate() + 90);
  const soonISO = `${soon.getFullYear()}-${String(soon.getMonth() + 1).padStart(2, "0")}-${String(soon.getDate()).padStart(2, "0")}`;
  return expiry <= soonISO ? { label: "Expiring soon", tone: "warning" } : { label: "Valid", tone: "success" };
};

const CREDENTIAL_OPTIONS = toOptions([
  "ABIM – Internal Medicine",
  "ABFM – Family Medicine",
  "ABP – Pediatrics",
  "ACLS – Advanced Cardiac Life Support",
  "BLS – Basic Life Support",
  "PALS – Pediatric Advanced Life Support",
]);
const LICENSE_TYPES = toOptions(["Medical License", "Nursing License", "Controlled Substance License", "Telemedicine License"]);

const COLUMNS: TableColumn[] = [
  { key: "state", label: "State / Jurisdiction" },
  { key: "number", label: "License Number" },
  { key: "type", label: "License Type" },
  { key: "issue", label: "Issue Date" },
  { key: "expiry", label: "Expiry Date" },
  { key: "status", label: "Status" },
  { key: "actions", label: "Actions", header: <div className="flex w-full items-center justify-center">Actions</div> },
];

const MAX_FILE_MB = 10;
const ACCEPTED = ["application/pdf", "image/jpeg", "image/png"];

const formatSize = (bytes: number) =>
  bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;

/* ---------------------------------------------------------------- */
/*  Add / edit license modal                                         */
/* ---------------------------------------------------------------- */
const LicenseModal = ({
  initial,
  existing,
  onClose,
  onSave,
}: {
  initial: LicenseRow | null;
  existing: LicenseRow[];
  onClose: () => void;
  onSave: (row: LicenseRow) => void;
}) => {
  const [form, setForm] = useState<LicenseRow>(
    initial ?? { id: uid(), state: "", number: "", type: "Medical License", issue: "", expiry: "" },
  );
  const [errors, setErrors] = useState<Errors>({});

  const set = <K extends keyof LicenseRow>(key: K, value: LicenseRow[K]) => {
    setForm((p) => ({ ...p, [key]: value }));
    setErrors((p) => {
      const next = { ...p };
      delete next[`lic_${key}`];
      return next;
    });
  };

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const err: Errors = {};
    if (!form.state) err.lic_state = "State is required.";
    if (!form.number.trim()) err.lic_number = "License number is required.";
    if (!form.type) err.lic_type = "License type is required.";
    if (!form.issue) err.lic_issue = "Issue date is required.";
    if (!form.expiry) err.lic_expiry = "Expiry date is required.";
    else if (form.issue && form.expiry <= form.issue) err.lic_expiry = "Expiry must be after the issue date.";
    if (
      form.state &&
      form.number.trim() &&
      existing.some((l) => l.id !== form.id && l.state === form.state && l.number.toLowerCase() === form.number.trim().toLowerCase())
    ) {
      err.lic_number = "This license is already added.";
    }
    setErrors(err);
    if (Object.keys(err).length === 0) onSave({ ...form, number: form.number.trim() });
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 p-4" onMouseDown={onClose} role="presentation">
      <form
        role="dialog"
        aria-modal="true"
        aria-label={initial ? "Edit state license" : "Add state license"}
        onSubmit={submit}
        noValidate
        onMouseDown={(e) => e.stopPropagation()}
        className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-border bg-card p-5 shadow-2xl sm:p-6"
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-base font-semibold text-heading">{initial ? "Edit State License" : "Add State License"}</h3>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-body hover:bg-primary/5 hover:text-primary"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <SignupDropdown
            name="lic_state"
            label={<>State / Jurisdiction<Req /></>}
            placeholder="Select state"
            options={US_STATE_OPTIONS}
            value={form.state}
            onChange={(v) => set("state", v)}
            error={errors.lic_state}
            portalMenu
            portalMenuZIndex={400}
          />
          <SignupField
            name="lic_number"
            label={<>License Number<Req /></>}
            placeholder="Enter license number"
            value={form.number}
            onChange={(e) => set("number", e.target.value)}
            error={errors.lic_number}
            maxLength={30}
            autoComplete="off"
          />
          <SignupDropdown
            name="lic_type"
            label={<>License Type<Req /></>}
            placeholder="Select type"
            options={LICENSE_TYPES}
            value={form.type}
            onChange={(v) => set("type", v)}
            error={errors.lic_type}
            portalMenu
            portalMenuZIndex={400}
            searchable={false}
          />
          <span className="hidden sm:block" />
          <DatePicker
            name="lic_issue"
            label={<>Issue Date<Req /></>}
            placeholder="dd-mm-yyyy"
            value={form.issue}
            onChange={(v) => set("issue", v)}
            maxDate={todayISO()}
            error={errors.lic_issue}
          />
          <DatePicker
            name="lic_expiry"
            label={<>Expiry Date<Req /></>}
            placeholder="dd-mm-yyyy"
            value={form.expiry}
            onChange={(v) => set("expiry", v)}
            error={errors.lic_expiry}
          />
        </div>

        <div className="mt-6 flex flex-row justify-end gap-2 sm:gap-3">
          <ImportButton text="Cancel" icon={null} className="flex-1 sm:flex-none" onClick={onClose} />
          <AddButton text={initial ? "Save Changes" : "Add License"} icon={null} className="flex-1 sm:flex-none" onClick={() => submit()} />
        </div>
        <button type="submit" className="hidden" aria-hidden tabIndex={-1} />
      </form>
    </div>
  );
};

/* ---------------------------------------------------------------- */
/*  Step 2 – Licenses & Credentials                                  */
/* ---------------------------------------------------------------- */
type Props = StepProps<LicensesValues> & {
  /** NPI / DEA live with the registration data (they are also shown on step 1). */
  identifiers: { npi: string; dea: string };
  onIdentifiersChange: (patch: { npi?: string; dea?: string }) => void;
};

const ProfileLicenses = ({ values, errors, onChange, identifiers, onIdentifiersChange }: Props) => {
  const dispatch = useAppDispatch();
  const [editing, setEditing] = useState<LicenseRow | null>(null);
  const [fileError, setFileError] = useState<string | undefined>();
  const fileRef = useRef<HTMLInputElement>(null);

  const saveLicense = (row: LicenseRow) => {
    // TODO: dispatch(saveStateLicense(row))
    const exists = values.licenses.some((l) => l.id === row.id);
    onChange({ licenses: exists ? values.licenses.map((l) => (l.id === row.id ? row : l)) : [...values.licenses, row] });
    setEditing(null);
  };

  const removeLicense = (id: string) => onChange({ licenses: values.licenses.filter((l) => l.id !== id) });

  const addFiles = (files: File[]) => {
    const problems: string[] = [];
    const accepted: CredentialFile[] = [];
    files.forEach((f) => {
      if (!ACCEPTED.includes(f.type)) problems.push(`${f.name}: only PDF, JPG or PNG files are accepted.`);
      else if (f.size > MAX_FILE_MB * 1024 * 1024) problems.push(`${f.name} is larger than ${MAX_FILE_MB} MB.`);
      else accepted.push({ id: uid(), name: f.name, size: formatSize(f.size), url: URL.createObjectURL(f) });
    });
    setFileError(problems.length ? problems.join(" ") : undefined);
    if (accepted.length) onChange({ files: [...values.files, ...accepted] });
  };

  const removeFile = (id: string) => {
    const file = values.files.find((f) => f.id === id);
    if (file?.url) URL.revokeObjectURL(file.url);
    onChange({ files: values.files.filter((f) => f.id !== id) });
  };

  const rows = values.licenses.map((l) => {
    const status = licenseStatus(l.expiry);
    return {
      state: <Content title={stateLabel(l.state)} />,
      number: <Content title={l.number} />,
      type: <Content title={l.type} />,
      issue: <Content title={formatDate(l.issue)} />,
      expiry: <Content title={formatDate(l.expiry)} />,
      status: <Tags text={status.label} tone={status.tone} size="xs" />,
      actions: (
        <div className="flex w-full items-center justify-center gap-1">
          <EditButton section={`${stateLabel(l.state)} license`} onEdit={() => setEditing(l)} />
          <button type="button" aria-label={`Delete ${stateLabel(l.state)} license`} onClick={() => removeLicense(l.id)} className={`${iconBtn} text-danger hover:bg-danger/10`}>
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    };
  });

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="grid gap-4 sm:gap-5 2xl:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <ProviderIdentifiersCard npi={identifiers.npi} dea={identifiers.dea} errors={errors} onChange={onIdentifiersChange} />

        {/* Board certifications */}
        <SectionCard icon={<GraduationCap className="h-4 w-4" />} title="Board Certifications / Credentials">
          <div className="space-y-4">
            <ChipSelect
              name="credentials"
              label="Certification / Credential"
              options={CREDENTIAL_OPTIONS}
              value={values.credentials}
              onChange={(v) => onChange({ credentials: v })}
              placeholder="Select certifications"
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <SignupField
                name="certOrg"
                label="Certifying Organization"
                placeholder="Enter organization"
                value={values.certOrg}
                onChange={(e) => onChange({ certOrg: e.target.value })}
                error={errors.certOrg}
                maxLength={150}
                autoComplete="off"
              />
              <DatePicker
                name="certExpiry"
                label="Certification Expiry"
                placeholder="dd-mm-yyyy"
                value={values.certExpiry}
                onChange={(v) => onChange({ certExpiry: v })}
                error={errors.certExpiry}
              />
            </div>
          </div>
        </SectionCard>
      </div>

      {/* State licenses */}
      <SectionCard
        icon={<FileText className="h-4 w-4" />}
        title="State Licenses"
        subtitle="Add one or more state medical licenses. You can manage multiple licenses if you are licensed in multiple states."
        action={
          <ImportButton text="Add State License" icon={<Plus className="h-4 w-4" />} onClick={() => dispatch(showAddStateLicense())} className="shrink-0 whitespace-nowrap" />
        }
      >
        <div className="overflow-hidden rounded-[14px] border border-border bg-card">
          {values.licenses.length === 0 ? (
            <TableStatus variant="empty" message="No state licenses added yet." />
          ) : (
            <Table columns={COLUMNS} rows={rows} bordered={false} />
          )}
        </div>
        <FieldError message={errors.licenses} />
      </SectionCard>

      {/* Credential documents */}
      <SectionCard
        icon={<Paperclip className="h-4 w-4" />}
        title="Upload Credential Documents"
        subtitle="Upload your licenses, board certifications and other relevant credentials for verification."
      >
        <input
          ref={fileRef}
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png"
          className="hidden"
          onChange={(e) => {
            addFiles(Array.from(e.target.files ?? []));
            e.target.value = "";
          }}
        />
        <ul className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-4">
          {values.files.map((f) => (
            <li key={f.id} className="relative flex items-start gap-3 rounded-xl border border-border bg-card p-3.5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-danger/10 text-danger">
                <FileText className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-heading" title={f.name}>
                  {f.name}
                </span>
                <span className="block text-xs text-body">{f.size}</span>
              </span>
              <CheckCircle2 className="h-4 w-4 shrink-0 text-success" aria-label="Uploaded" />
              <button
                type="button"
                aria-label={`Remove ${f.name}`}
                onClick={() => removeFile(f.id)}
                className="absolute -right-2 -top-2 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border border-border bg-card text-body shadow hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
          <li>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex h-full min-h-[76px] w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-primary/50 bg-primary/5 text-sm font-medium text-primary transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
            >
              <Upload className="h-4 w-4" />
              Upload File
            </button>
          </li>
        </ul>
        <p className="mt-2 text-xs text-body">PDF, JPG or PNG · up to {MAX_FILE_MB} MB each</p>
        <FieldError message={fileError} />
      </SectionCard>

      {editing && (
        <LicenseModal
          initial={editing}
          existing={values.licenses}
          onClose={() => setEditing(null)}
          onSave={saveLicense}
        />
      )}
    </div>
  );
};

export default ProfileLicenses;