"use client";

import React, { useRef, useState } from "react";
import { FileText, Info, Upload, UploadCloud, X } from "lucide-react";

import ImportButton from "@/components/ImportButton";
import RadioCheckButtonh from "@/components/RadioCheckButtonh";
import { FieldError } from "@/components/SignupField";
import ModalShell, {
  FormGrid,
  FullRow,
  ModalDateField,
  ReqLabel,
  SignupDropdown,
  SignupField,
} from "@/components/Modalshell";
import { US_STATE_OPTIONS, toOptions, todayISO, uid } from "@/providers/Shared";

/* ---------- Values ---------- */
export type StateLicenseValues = {
  id: string;
  state: string;
  type: string;
  number: string;
  authority: string;
  issue: string;
  expiry: string;
  /** Newly chosen file (null when keeping the stored one). */
  document: File | null;
  /** Name of the chosen / already stored document. */
  documentName: string;
  primary: boolean;
};
type Errors = Partial<Record<keyof StateLicenseValues, string>>;

const emptyLicense = (): StateLicenseValues => ({
  id: uid(),
  state: "",
  type: "Medical License",
  number: "",
  authority: "",
  issue: "",
  expiry: "",
  document: null,
  documentName: "",
  primary: false,
});

/* ---------- Options ---------- */
const STATE_OPTIONS = US_STATE_OPTIONS.map((s) => ({ value: s.value, label: `${s.label} (${s.value})` }));
const LICENSE_TYPES = toOptions(["Medical License", "Nursing License", "Controlled Substance License", "Telemedicine License"]);

const MAX_FILE_MB = 10;
const ACCEPTED = ["application/pdf", "image/jpeg", "image/png"];

/* ---------- Props ---------- */
interface Props {
  open: boolean;
  onClose: () => void;
  /** Pass a license to edit it; omit to add a new one. */
  initial?: StateLicenseValues | null;
  /** Licenses already added (used to block duplicates). */
  existing?: { id: string; state: string; number: string }[];
  /** Your save call. Throw to keep the modal open and show the message. */
  onSave?: (values: StateLicenseValues) => void | Promise<void>;
}

/* ---------- Body (mounted only while open, so state is fresh every time) ---------- */
const LicenseModalBody = ({ onClose, initial, existing = [], onSave }: Omit<Props, "open">) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [values, setValues] = useState<StateLicenseValues>(initial ?? emptyLicense());
  const [errors, setErrors] = useState<Errors>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const set = <K extends keyof StateLicenseValues>(key: K, val: StateLicenseValues[K]) => {
    setValues((p) => ({ ...p, [key]: val }));
    setErrors((p) => ({ ...p, [key]: undefined }));
  };

  const pickFile = (file?: File) => {
    if (!file) return;
    if (!ACCEPTED.includes(file.type)) return setErrors((p) => ({ ...p, document: "Only PDF, JPG or PNG files are accepted." }));
    if (file.size > MAX_FILE_MB * 1024 * 1024) return setErrors((p) => ({ ...p, document: `The file must be under ${MAX_FILE_MB} MB.` }));
    setValues((p) => ({ ...p, document: file, documentName: file.name }));
    setErrors((p) => ({ ...p, document: undefined }));
  };

  const validate = (): Errors => {
    const e: Errors = {};
    if (!values.state) e.state = "State is required";
    if (!values.type) e.type = "License type is required";
    if (!values.number.trim()) e.number = "License number is required";
    else if (
      values.state &&
      existing.some((l) => l.id !== values.id && l.state === values.state && l.number.toLowerCase() === values.number.trim().toLowerCase())
    ) {
      e.number = "This license is already added";
    }
    if (!values.authority.trim()) e.authority = "Issuing authority is required";
    if (!values.issue) e.issue = "Issue date is required";
    else if (values.issue > todayISO()) e.issue = "Issue date cannot be in the future";
    if (!values.expiry) e.expiry = "Expiry date is required";
    else if (values.issue && values.expiry <= values.issue) e.expiry = "Expiry must be after the issue date";
    if (!values.document && !values.documentName) e.document = "License document is required";
    return e;
  };

  const handleSave = async () => {
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length) return;

    setIsSaving(true);
    setSaveError(null);
    try {
      // TODO: call your API here
      await onSave?.({ ...values, number: values.number.trim(), authority: values.authority.trim() });
      onClose();
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "The license could not be saved.");
      setIsSaving(false);
    }
  };

  return (
    <ModalShell
      open
      onClose={() => !isSaving && onClose()}
      onSubmit={handleSave}
      isSubmitting={isSaving}
      errorMessage={saveError}
      titleId="state-license-title"
      title={
        <span className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <FileText className="h-5 w-5" />
          </span>
          {initial ? "Edit State License" : "Add State License"}
        </span>
      }
      subtitle="Add a state medical license. You can add multiple licenses for different states."
      submitText={initial ? "Save Changes" : "Add License"}
      width={760}
    >
      <FormGrid>
        <SignupDropdown
          name="state"
          label={<ReqLabel>State / Jurisdiction</ReqLabel>}
          placeholder="Select state"
          options={STATE_OPTIONS}
          value={values.state}
          onChange={(v) => set("state", v)}
          error={errors.state}
          portalMenu
          portalMenuZIndex={1000}
        />
        <SignupDropdown
          name="type"
          label={<ReqLabel>License Type</ReqLabel>}
          placeholder="Select license type"
          searchable={false}
          options={LICENSE_TYPES}
          value={values.type}
          onChange={(v) => set("type", v)}
          error={errors.type}
          portalMenu
          portalMenuZIndex={1000}
        />
        <SignupField
          name="number"
          label={<ReqLabel>License Number</ReqLabel>}
          placeholder="Enter license number"
          value={values.number}
          onChange={(e) => set("number", e.target.value)}
          error={errors.number}
          maxLength={30}
          autoComplete="off"
        />
        <SignupField
          name="authority"
          label={<ReqLabel>Issuing Authority</ReqLabel>}
          placeholder="e.g. Medical Board of California"
          value={values.authority}
          onChange={(e) => set("authority", e.target.value)}
          error={errors.authority}
          maxLength={150}
          autoComplete="off"
        />
        <ModalDateField id="issue" label={<ReqLabel>Issue Date</ReqLabel>} value={values.issue} max={todayISO()} onChange={(v) => set("issue", v)} error={errors.issue} />
        <ModalDateField id="expiry" label={<ReqLabel>Expiry Date</ReqLabel>} value={values.expiry} min={values.issue} onChange={(v) => set("expiry", v)} error={errors.expiry} />

        {/* License document */}
        <FullRow>
          <div id="document" className="rounded-xl bg-primary/5 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <span className="flex h-16 w-16 shrink-0 items-center justify-center self-start rounded-xl border border-dashed border-primary/50 text-primary sm:self-center">
                <UploadCloud className="h-7 w-7" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-heading">License Document <span className="text-danger">*</span></p>
                <p className="text-xs text-body">Upload a copy of your state medical license.</p>
                <p className="text-xs text-body">Accepted formats: PDF, JPG, PNG (Max {MAX_FILE_MB} MB).</p>
                {values.documentName && (
                  <p className="mt-2 flex w-fit max-w-full items-center gap-2 rounded-lg bg-card px-2.5 py-1 text-xs font-medium text-heading">
                    <FileText className="h-3.5 w-3.5 shrink-0 text-primary" />
                    <span className="truncate">{values.documentName}</span>
                    <button
                      type="button"
                      aria-label="Remove document"
                      onClick={() => setValues((p) => ({ ...p, document: null, documentName: "" }))}
                      className="flex h-4 w-4 shrink-0 cursor-pointer items-center justify-center rounded text-body hover:bg-danger/10 hover:text-danger"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </p>
                )}
              </div>
              <ImportButton
                text={values.documentName ? "Replace File" : "Upload File"}
                icon={<Upload className="h-4 w-4" />}
                onClick={() => fileRef.current?.click()}
                className="shrink-0 whitespace-nowrap"
              />
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={(e) => {
                  pickFile(e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
            </div>
            <FieldError message={errors.document} />
          </div>
        </FullRow>

        <FullRow>
          <label className="flex w-fit cursor-pointer items-center gap-2 text-sm font-medium text-heading">
            <RadioCheckButtonh type="checkbox" checked={values.primary} onChange={(e) => set("primary", e.target.checked)} />
            Set as Primary License
            <span title="Your primary license is the one shown first on your profile." className="inline-flex cursor-help text-body">
              <Info className="h-4 w-4" aria-label="Your primary license is the one shown first on your profile." />
            </span>
          </label>
        </FullRow>
      </FormGrid>
    </ModalShell>
  );
};

/* ---------- Public component ---------- */
const AddStateLicenseModal = ({ open, ...rest }: Props) => (open ? <LicenseModalBody {...rest} /> : null);

export default AddStateLicenseModal;