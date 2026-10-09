"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Download,
  FileText,
  X,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileBadge,
  ShieldCheck,
} from "lucide-react";

import AddButton from "@/components/Addbutton";
import ImportButton from "@/components/ImportButton";
import Tags from "@/components/Tags";
import SignupField from "@/components/SignupField";
import SignupDropdown, { DropdownOption } from "@/components/SignupDropdown";
import FileDropzone from "@/components/Filedropzone";
import DatePicker from "@/components/Datepicker";

import { LICENSE_TYPES, LICENSE_STATES } from "./ViewLicenses";
import { DOCUMENT_TYPES } from "./Documents";
import type { VerificationDetail, VerificationRow } from "./History";
import type { ProviderRow } from "@/providers/Providers";

/* ---------- Public types ---------- */
export type PanelState =
  | { type: "license" }
  | { type: "document" }
  | { type: "verification"; row: VerificationRow }
  | { type: "profile" }
  | null;

export type SavedLicensePayload = {
  type: string;
  number: string;
  state: string;
  authority: string;
  issue: string;
  expiry: string;
  notes: string;
  file: File | null;
};

export type SavedDocumentPayload = {
  name: string;
  type: string;
  issue: string;
  expiry: string;
  notes: string;
  file: File | null;
};

type Props = {
  panel: PanelState;
  onClose: () => void;
  onSaveLicense?: (data: SavedLicensePayload) => void;
  onSaveDocument?: (data: SavedDocumentPayload) => void;
  provider?: ProviderRow;
};

/* ---------- Add License ---------- */
const LicenseForm = ({
  onCancel,
  onSave,
}: {
  onCancel: () => void;
  onSave: (data: SavedLicensePayload) => void;
}) => {
  const [v, setV] = useState({
    type: "",
    number: "",
    state: "",
    authority: "",
    issue: "",
    expiry: "",
    notes: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (patch: Partial<typeof v>) => {
    setV((p) => ({ ...p, ...patch }));
    // Clear errors on edit
    setErrors((prev) => {
      const updated = { ...prev };
      Object.keys(patch).forEach((k) => delete updated[k]);
      return updated;
    });
  };

  const licenseTypeOptions: DropdownOption[] = useMemo(
    () => LICENSE_TYPES.map((t) => ({ value: t, label: t })),
    []
  );

  const stateOptions: DropdownOption[] = useMemo(
    () => LICENSE_STATES.map((s) => ({ value: s, label: s })),
    []
  );

  const submit = () => {
    const e: Record<string, string> = {};
    if (!v.type) e.type = "License type is required";
    if (!v.number.trim()) e.number = "License number is required";
    if (!v.state) e.state = "State / jurisdiction is required";
    if (!v.issue) e.issue = "Issue date is required";
    if (!v.expiry) e.expiry = "Expiration date is required";
    else if (v.issue && v.expiry < v.issue) e.expiry = "Must be after issue date";
    if (!file) e.file = "License document is required";

    setErrors(e);
    if (Object.keys(e).length) return;

    onSave({ ...v, file });
  };

  return (
    <>
      <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5 hide-scrollbar">
        {/* License Type */}
        <SignupDropdown
          label="License Type *"
          placeholder="Select license type"
          options={licenseTypeOptions}
          value={v.type}
          onChange={(val) => set({ type: val })}
          error={errors.type}
        />

        {/* License Number */}
        <SignupField
          label="License Number *"
          placeholder="Enter license number"
          value={v.number}
          onChange={(e) => set({ number: e.target.value })}
          error={errors.number}
        />

        {/* State / Jurisdiction */}
        <SignupDropdown
          label="State / Jurisdiction *"
          placeholder="Select state/jurisdiction"
          options={stateOptions}
          value={v.state}
          onChange={(val) => set({ state: val })}
          error={errors.state}
        />

        {/* Issuing Authority */}
        <SignupField
          label="Issuing Authority"
          placeholder="Enter issuing authority"
          value={v.authority}
          onChange={(e) => set({ authority: e.target.value })}
        />

        {/* Issue Date + Expiration Date in 2 columns */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <DatePicker
            label="Issue Date *"
            placeholder="Select date"
            value={v.issue}
            onChange={(val) => set({ issue: val })}
            error={errors.issue}
            align="left"
          />
          <DatePicker
            label="Expiration Date *"
            placeholder="Select date"
            value={v.expiry}
            onChange={(val) => set({ expiry: val })}
            minDate={v.issue || undefined}
            error={errors.expiry}
            align="right"
          />
        </div>

        {/* Upload License Document */}
        <div>
          <label className="mb-2 block text-sm font-medium text-label">
            Upload License Document <span className="text-danger">*</span>
          </label>
          <FileDropzone
            title="your license document here"
            file={file}
            onChange={(f) => {
              setFile(f);
              if (f) setErrors((prev) => ({ ...prev, file: "" }));
            }}
            error={errors.file}
          />
        </div>

        {/* Notes */}
        <div>
          <label htmlFor="lic-notes" className="mb-2 block text-sm font-medium text-label">
            Notes <span className="font-normal text-body">(Optional)</span>
          </label>
          <textarea
            id="lic-notes"
            rows={3}
            value={v.notes}
            onChange={(e) => set({ notes: e.target.value })}
            placeholder="Add any additional notes"
            className="w-full rounded-xl border border-border bg-card p-3 text-sm text-heading placeholder:text-placeholder outline-none transition-colors duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none hover:border-primary/50"
          />
        </div>
      </div>

      {/* Sticky Bottom Actions */}
      <PanelFooter cancel={onCancel} submit={submit} submitText="Save License" />
    </>
  );
};

/* ---------- Upload Document ---------- */
const DocumentForm = ({
  onCancel,
  onSave,
}: {
  onCancel: () => void;
  onSave: (data: SavedDocumentPayload) => void;
}) => {
  const [v, setV] = useState({
    name: "",
    type: "",
    issue: "",
    expiry: "",
    notes: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (patch: Partial<typeof v>) => {
    setV((p) => ({ ...p, ...patch }));
    setErrors((prev) => {
      const updated = { ...prev };
      Object.keys(patch).forEach((k) => delete updated[k]);
      return updated;
    });
  };

  const documentTypeOptions: DropdownOption[] = useMemo(
    () => DOCUMENT_TYPES.map((t) => ({ value: t, label: t })),
    []
  );

  const pickFile = (f: File | null) => {
    setFile(f);
    if (f) {
      setErrors((prev) => ({ ...prev, file: "" }));
      if (!v.name) {
        set({ name: f.name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ") });
      }
    }
  };

  const submit = () => {
    const e: Record<string, string> = {};
    if (!file) e.file = "Select a file to upload";
    if (!v.name.trim()) e.name = "Document name is required";
    if (!v.type) e.type = "Document type is required";
    if (v.issue && v.expiry && v.expiry < v.issue) {
      e.expiry = "Must be after issue date";
    }

    setErrors(e);
    if (Object.keys(e).length) return;

    onSave({ ...v, file });
  };

  return (
    <>
      <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5 hide-scrollbar">
        {/* Upload Box at top */}
        <div>
          <FileDropzone
            title="your document here"
            file={file}
            onChange={pickFile}
            error={errors.file}
          />
        </div>

        {/* Document Name */}
        <SignupField
          label="Document Name *"
          placeholder="Enter document name"
          value={v.name}
          onChange={(e) => set({ name: e.target.value })}
          error={errors.name}
        />

        {/* Document Type */}
        <SignupDropdown
          label="Document Type *"
          placeholder="Select document type"
          options={documentTypeOptions}
          value={v.type}
          onChange={(val) => set({ type: val })}
          error={errors.type}
        />

        {/* Issue Date + Expiry Date in 2 columns */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <DatePicker
            label="Issue Date"
            placeholder="Select date"
            value={v.issue}
            onChange={(val) => set({ issue: val })}
            align="left"
          />
          <DatePicker
            label="Expiry Date"
            placeholder="Select date"
            value={v.expiry}
            onChange={(val) => set({ expiry: val })}
            minDate={v.issue || undefined}
            error={errors.expiry}
            align="right"
          />
        </div>

        {/* Notes */}
        <div>
          <label htmlFor="doc-notes" className="mb-2 block text-sm font-medium text-label">
            Notes <span className="font-normal text-body">(Optional)</span>
          </label>
          <textarea
            id="doc-notes"
            rows={4}
            value={v.notes}
            onChange={(e) => set({ notes: e.target.value })}
            placeholder="Add any additional notes..."
            className="w-full rounded-xl border border-border bg-card p-3 text-sm text-heading placeholder:text-placeholder outline-none transition-colors duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none hover:border-primary/50"
          />
        </div>
      </div>

      {/* Sticky Bottom Actions */}
      <PanelFooter cancel={onCancel} submit={submit} submitText="Upload Document" />
    </>
  );
};

/* ---------- Verification Details ---------- */
const buildDetail = (row: VerificationRow): VerificationDetail => {
  if (row.detail) return row.detail;
  const finalLabel = row.status === "Verified" ? "Verified" : row.status;
  return {
    documentType: row.type,
    licenseNumber: row.sub.replace(/^(License|Policy)?\s*#/, ""),
    jurisdiction: "California (CA)",
    issuedDate: row.submittedOn,
    expirationDate: row.nextRenewal,
    verifiedBy: row.verifiedBy,
    method: "Online Verification (NPI/State Board)",
    notes: "License verified and active. No restrictions found.",
    fileName: `${row.name.toLowerCase().replace(/[^a-z0-9]+/g, "_")}.pdf`,
    fileSize: "2.4 MB",
    timeline: [
      { label: "Document Submitted", date: `${row.submittedOn} 10:30 AM` },
      { label: "Under Review", date: `${row.submittedOn} 02:15 PM` },
      { label: finalLabel, date: `${row.verifiedOn} 09:20 AM` },
    ],
  };
};

const DetailItem = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-xs text-body">{label}</p>
    <p className="mt-0.5 text-sm font-semibold text-heading break-words">{value || "-"}</p>
  </div>
);

const VerificationDetails = ({ row }: { row: VerificationRow }) => {
  const d = buildDetail(row);
  const last = d.timeline.length - 1;

  return (
    <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5 hide-scrollbar">
      {/* Document header badge */}
      <div className="flex items-center gap-3.5 rounded-2xl border border-border/80 bg-surface-start/50 p-3.5 dark:bg-card">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <FileText className="h-6 w-6" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-heading">{row.name}</p>
          <p className="text-xs text-body">{row.sub}</p>
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center justify-between rounded-xl border border-border/80 bg-card p-3.5 shadow-xs">
        <span className="text-sm font-medium text-heading">Status</span>
        <Tags text={row.status} tone={row.statusTone} />
      </div>

      {/* Verification Timeline */}
      <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-xs">
        <p className="mb-4 text-sm font-semibold text-heading">Verification Timeline</p>
        <ol className="space-y-4">
          {d.timeline.map((t, i) => {
            const isCompleted = i <= last;
            const isVerifiedStep = t.label.toLowerCase().includes("verified");
            const isFailedStep = t.label.toLowerCase().includes("failed");

            return (
              <li key={t.label + i} className="relative flex gap-3.5 last:pb-0">
                {i !== last && (
                  <span
                    className="absolute left-[7px] top-3.5 h-[calc(100%+16px)] w-0.5 bg-border"
                    aria-hidden
                  />
                )}
                <span
                  className={`relative z-10 mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 bg-card ${
                    isVerifiedStep && row.status === "Verified"
                      ? "border-success bg-success text-white"
                      : isFailedStep
                      ? "border-danger bg-danger text-white"
                      : "border-primary bg-primary text-white"
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-white" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-heading">{t.label}</p>
                  <p className="mt-0.5 text-xs text-body">{t.date}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      {/* Details List */}
      <div className="space-y-3.5 rounded-2xl border border-border/80 bg-card p-4 shadow-xs">
        <DetailItem label="Document Type" value={d.documentType} />
        <DetailItem label="License Number" value={d.licenseNumber} />
        <DetailItem label="State / Jurisdiction" value={d.jurisdiction} />
        <DetailItem label="Issued Date" value={d.issuedDate} />
        <DetailItem label="Expiration Date" value={d.expirationDate} />
        <DetailItem label="Verified By" value={d.verifiedBy} />
        <DetailItem label="Verification Method" value={d.method} />
      </div>

      {/* Notes */}
      <div>
        <p className="mb-1.5 text-xs text-body">Notes</p>
        <div className="rounded-xl border border-border bg-surface-start/50 p-3.5 text-xs leading-relaxed text-heading dark:bg-card">
          {d.notes}
        </div>
      </div>

      {/* File Attachment */}
      <div className="flex items-center gap-3.5 rounded-2xl border border-border/80 bg-card p-3.5 shadow-xs">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-danger/10 text-danger">
          <FileText className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold text-heading">{d.fileName}</p>
          <p className="text-[11px] text-body">{d.fileSize}</p>
        </div>
        <button
          type="button"
          aria-label={`Download ${d.fileName}`}
          onClick={() => console.log("Downloading", d.fileName)}
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary transition-colors hover:bg-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
        >
          <Download className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

/* ---------- Provider Profile ---------- */
const ProviderProfile = ({
  provider,
  onClose,
}: {
  provider?: ProviderRow;
  onClose: () => void;
}) => {
  const p = provider || {
    name: "Dr. Michael Brown",
    credential: "MD",
    specialty: "Internal Medicine",
    npi: "1234567890",
    dea: "AB1234567",
    clinic: "Main Clinic",
    city: "New York, NY",
    email: "michael.brown@koolmd.com",
    phone: "+1 (555) 123-4567",
    address: "123 Medical Center Dr, New York, NY 10001",
    status: "Active",
  };

  const init = p.name
    .replace(/^Dr\.?\s+/i, "")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");

  return (
    <>
      <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5 hide-scrollbar">
        {/* Profile Avatar Header */}
        <div className="rounded-2xl border border-border/80 bg-surface-start/40 p-5 text-center dark:bg-card">
          <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary ring-4 ring-primary/10">
            {init}
          </div>
          <h3 className="text-base font-semibold text-heading sm:text-lg">{p.name}</h3>
          <p className="mt-0.5 text-xs text-body">{p.credential} - {p.specialty}</p>
        </div>

        {/* NPI, DEA, Specialty */}
        <div className="space-y-3 rounded-2xl border border-border/80 bg-card p-4 shadow-xs">
          <DetailItem label="NPI Number" value={p.npi} />
          <DetailItem label="DEA Number" value={p.dea || "N/A"} />
          <DetailItem label="Specialty" value={p.specialty} />
          <DetailItem label="Status" value={`${p.status} Provider`} />
        </div>

        {/* Contact Information */}
        <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-xs">
          <p className="mb-3 text-sm font-semibold text-heading">Contact Information</p>
          <div className="space-y-3">
            <DetailItem
              label="Email"
              value={p.email || `${p.name.toLowerCase().replace(/[^a-z0-9]+/g, ".")}@koolmd.com`}
            />
            <DetailItem label="Phone" value={p.phone || "+1 (555) 123-4567"} />
          </div>
        </div>

        {/* Practice Location */}
        <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-xs">
          <p className="mb-3 text-sm font-semibold text-heading">Practice Location</p>
          <div className="space-y-3">
            <DetailItem label="Clinic" value={p.clinic} />
            <DetailItem label="Address" value={p.address || `${p.clinic}, ${p.city}`} />
          </div>
        </div>
      </div>
      <PanelFooter cancel={onClose} submit={() => {}} submitText="" showSubmit={false} />
    </>
  );
};

/* ---------- Footer ---------- */
const PanelFooter = ({
  cancel,
  submit,
  submitText,
  showSubmit = true,
}: {
  cancel: () => void;
  submit: () => void;
  submitText: string;
  showSubmit?: boolean;
}) => (
  <div className={`grid gap-3 border-t border-border bg-card px-6 py-4 shrink-0 ${showSubmit ? "grid-cols-2" : "grid-cols-1"}`}>
    <ImportButton text="Cancel" icon={null} onClick={cancel} />
    {showSubmit && <AddButton text={submitText} icon={null} onClick={submit} />}
  </div>
);

/* ---------- RightSection Component ---------- */
const META = {
  license: {
    title: "Add License",
    subtitle: "Add a new professional license or credential.",
  },
  document: {
    title: "Upload Document",
    subtitle: "Manage and upload important credential documents.",
  },
  verification: {
    title: "Verification Details",
    subtitle: "",
  },
  profile: {
    title: "Provider Profile",
    subtitle: "View detailed provider information.",
  },
} as const;

const RightSection = ({
  panel,
  onClose,
  onSaveLicense,
  onSaveDocument,
  provider,
}: Props) => {
  // Close on Escape
  useEffect(() => {
    if (!panel) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [panel, onClose]);

  if (!panel) return null;
  const meta = META[panel.type];

  return (
    <>
      {/* Backdrop for md, lg, xl screens (below Mainheader, hidden on 2xl+) */}
      <div
        className="fixed top-14 xl:top-16 inset-x-0 bottom-0 z-[140] bg-black/40 backdrop-blur-xs transition-opacity duration-300 2xl:hidden"
        onClick={onClose}
        aria-hidden
      />

      {/* Right Drawer touched to right, top (BELOW Mainheader), and bottom margins */}
      <aside
        aria-label={meta.title}
        key={panel.type === "verification" ? `v-${panel.row.id}` : panel.type}
        className="fixed top-14 xl:top-16 right-0 bottom-0 z-[150] flex h-[calc(100vh-3.5rem)] xl:h-[calc(100vh-4rem)] w-full max-w-[420px] 2xl:max-w-[460px] flex-col border-l border-border bg-card shadow-2xl transition-all duration-300 animate-in slide-in-from-right"
      >
        {/* Sticky Header */}
        <header className="sticky top-0 z-20 flex items-start justify-between gap-3 border-b border-border bg-card px-6 py-4.5 shrink-0">
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-semibold text-heading sm:text-lg">
              {meta.title}
            </h3>
            {meta.subtitle && (
              <p className="mt-0.5 text-xs text-body leading-normal">{meta.subtitle}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close panel"
            className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-body transition-colors hover:bg-heading/5 hover:text-heading focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        {/* Dynamic Content */}
        {panel.type === "license" && (
          <LicenseForm
            onCancel={onClose}
            onSave={(data) => {
              onSaveLicense?.(data);
              onClose();
            }}
          />
        )}
        {panel.type === "document" && (
          <DocumentForm
            onCancel={onClose}
            onSave={(data) => {
              onSaveDocument?.(data);
              onClose();
            }}
          />
        )}
        {panel.type === "verification" && (
          <VerificationDetails row={panel.row} />
        )}
        {panel.type === "profile" && <ProviderProfile provider={provider} onClose={onClose} />}
      </aside>
    </>
  );
};

export default RightSection;