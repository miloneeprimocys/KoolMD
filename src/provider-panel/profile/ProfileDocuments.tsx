"use client";

import React, { useRef, useState } from "react";
import {
  Award,
  BadgeCheck,
  Check,
  CheckCircle2,
  Contact,
  Download,
  FileText,
  GraduationCap,
  Info,
  Paperclip,
  Shield,
  ShieldCheck,
  Trash2,
  Upload,
  type LucideIcon,
} from "lucide-react";

import ImportButton from "@/components/ImportButton";
import Tags from "@/components/Tags";
import { FieldError } from "@/components/SignupField";
import { iconBtn } from "@/components/Verticalsteps";
import { SectionCard, todayISO, uid, type Errors, type StepProps } from "@/providers/Shared";
import { formatDate } from "./ProfileLicenses";

/* ---------------------------------------------------------------- */
/*  Values + validation (used by ProviderProfile and ProfileReview)  */
/* ---------------------------------------------------------------- */
export type DocFile = { id: string; typeKey: string; name: string; size: string; uploaded: string; url?: string };

export interface DocumentsValues {
  files: DocFile[];
}

const DOC_TYPES: { key: string; title: string; desc: string; required: boolean; Icon: LucideIcon }[] = [
  { key: "government-id", title: "Government-Issued ID", desc: "Driver's license, passport or national ID", required: true, Icon: Contact },
  { key: "license", title: "Medical License(s)", desc: "Active state medical license(s)", required: true, Icon: BadgeCheck },
  { key: "degree", title: "Medical Degree / Qualification", desc: "MD, DO, or equivalent medical degree", required: true, Icon: GraduationCap },
  { key: "board", title: "Board Certification", desc: "Specialty board certification (if applicable)", required: false, Icon: Award },
  { key: "dea", title: "DEA Registration", desc: "DEA certificate (if applicable)", required: false, Icon: ShieldCheck },
  { key: "insurance", title: "Professional Liability Insurance", desc: "Malpractice insurance (if applicable)", required: false, Icon: Shield },
  { key: "cv", title: "CV / Resume", desc: "Current curriculum vitae or professional resume", required: false, Icon: FileText },
  { key: "additional", title: "Additional Documents", desc: "Any other supporting credentials or certificates", required: false, Icon: Paperclip },
];

const REQUIRED = DOC_TYPES.filter((d) => d.required);

/** Static starting values (replace with the provider's uploaded documents). */
export const initialDocuments = (): DocumentsValues => ({
  files: [
    { id: "d-1", typeKey: "government-id", name: "Government_ID.pdf", size: "2.4 MB", uploaded: "Oct 12, 2026" },
    { id: "d-2", typeKey: "license", name: "CA_Medical_License.pdf", size: "3.1 MB", uploaded: "Oct 12, 2026" },
    { id: "d-3", typeKey: "degree", name: "Medical_Degree.pdf", size: "4.2 MB", uploaded: "Oct 12, 2026" },
    { id: "d-4", typeKey: "board", name: "Board_Certification.pdf", size: "1.8 MB", uploaded: "Oct 12, 2026" },
    { id: "d-5", typeKey: "cv", name: "CV_Resume.pdf", size: "2.6 MB", uploaded: "Oct 12, 2026" },
  ],
});

export const validateDocuments = (v: DocumentsValues): Errors => {
  const missing = REQUIRED.filter((d) => !v.files.some((f) => f.typeKey === d.key)).map((d) => d.title);
  return missing.length ? { docs: `Upload the required documents: ${missing.join(", ")}.` } : {};
};

/* ---------------------------------------------------------------- */
/*  Helpers                                                          */
/* ---------------------------------------------------------------- */
const MAX_FILE_MB = 10;
const ACCEPTED = ["application/pdf", "image/jpeg", "image/png"];
const formatSize = (bytes: number) =>
  bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;

const GUIDELINES = [
  "Ensure documents are clear, valid and not expired.",
  "Upload all pages (front and back, if applicable).",
  `File size should be up to ${MAX_FILE_MB} MB per file.`,
  "Accepted formats: PDF, JPG, PNG.",
];

/* ---------------------------------------------------------------- */
/*  Step 4 – Documents                                               */
/* ---------------------------------------------------------------- */
const ProfileDocuments = ({ values, errors, onChange }: StepProps<DocumentsValues>) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const pendingType = useRef("additional");
  const [fileError, setFileError] = useState<string | undefined>();

  const openPicker = (key: string) => {
    pendingType.current = key;
    if (inputRef.current) {
      inputRef.current.multiple = key === "additional";
      inputRef.current.click();
    }
  };

  const addFiles = (files: File[]) => {
    const typeKey = pendingType.current;
    const problems: string[] = [];
    const accepted: DocFile[] = [];
    files.forEach((f) => {
      if (!ACCEPTED.includes(f.type)) problems.push(`${f.name}: only PDF, JPG or PNG files are accepted.`);
      else if (f.size > MAX_FILE_MB * 1024 * 1024) problems.push(`${f.name} is larger than ${MAX_FILE_MB} MB.`);
      else accepted.push({ id: uid(), typeKey, name: f.name, size: formatSize(f.size), uploaded: formatDate(todayISO()), url: URL.createObjectURL(f) });
    });
    setFileError(problems.length ? problems.join(" ") : undefined);
    if (!accepted.length) return;
    // One file per document type, except "Additional Documents"
    const kept = typeKey === "additional" ? values.files : values.files.filter((f) => f.typeKey !== typeKey);
    onChange({ files: [...kept, ...accepted] });
  };

  const removeFile = (id: string) => {
    const file = values.files.find((f) => f.id === id);
    if (file?.url) URL.revokeObjectURL(file.url);
    onChange({ files: values.files.filter((f) => f.id !== id) });
  };

  const download = (f: DocFile) => {
    // TODO: call your API here to download the stored file
    if (f.url) window.open(f.url, "_blank");
    else console.log("Download document:", f.id);
  };

  return (
    <div id="docs" className="grid items-start gap-4 sm:gap-5 2xl:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        className="hidden"
        onChange={(e) => {
          addFiles(Array.from(e.target.files ?? []));
          e.target.value = "";
        }}
      />

      {/* Required documents */}
      <SectionCard
        icon={<FileText className="h-4 w-4" />}
        title="Required Documents"
        subtitle={`Upload the following documents. Accepted formats: PDF, JPG, PNG (Max ${MAX_FILE_MB} MB per file).`}
      >
        <ul className="space-y-2.5">
          {DOC_TYPES.map(({ key, title, desc, required, Icon }) => {
            const uploaded = values.files.some((f) => f.typeKey === key);
            const missing = required && !uploaded && !!errors.docs;
            return (
              <li key={key} className="flex flex-col gap-3 rounded-xl border border-border bg-card p-3 sm:flex-row sm:items-center">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-heading">
                      {title}
                      {required && <span className="text-danger"> *</span>}
                    </span>
                    <span className="block text-xs text-body">{desc}</span>
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3 sm:justify-end">
                  <Tags text={required ? "Required" : "Optional"} tone={missing ? "danger" : required ? "success" : "neutral"} size="xs" />
                  <ImportButton
                    text={uploaded && key !== "additional" ? "Replace File" : "Upload File"}
                    icon={<Upload className="h-4 w-4" />}
                    onClick={() => openPicker(key)}
                    className="shrink-0 whitespace-nowrap !h-10 !px-3 !text-xs"
                  />
                </div>
              </li>
            );
          })}
        </ul>
        <FieldError message={errors.docs ?? fileError} />
      </SectionCard>

      {/* Right column */}
      <div className="min-w-0 space-y-4 sm:space-y-5">
        <SectionCard icon={<CheckCircle2 className="h-4 w-4" />} title={`Uploaded Documents (${values.files.length})`}>
          {values.files.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-body">No documents uploaded yet.</p>
          ) : (
            <ul className="divide-y divide-divider">
              {values.files.map((f) => (
                <li key={f.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-danger/10 text-danger">
                    <FileText className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-heading" title={f.name}>{f.name}</span>
                    <span className="block text-[11px] text-body">{f.size} • Uploaded {f.uploaded}</span>
                  </span>
                  <span className="hidden sm:block"><Tags text="Uploaded" tone="success" size="xs" /></span>
                  <button type="button" aria-label={`Download ${f.name}`} onClick={() => download(f)} className={`${iconBtn} text-primary hover:bg-primary/10`}>
                    <Download className="h-4 w-4" />
                  </button>
                  <button type="button" aria-label={`Delete ${f.name}`} onClick={() => removeFile(f.id)} className={`${iconBtn} text-danger hover:bg-danger/10`}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard icon={<Info className="h-4 w-4" />} title="Document Guidelines">
          <ul className="space-y-2.5">
            {GUIDELINES.map((g) => (
              <li key={g} className="flex items-start gap-2.5 text-sm text-heading">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                {g}
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>
    </div>
  );
};

export default ProfileDocuments;