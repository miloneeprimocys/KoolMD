"use client";

import React, { useEffect, useRef } from "react";
import { FileText, Upload } from "lucide-react";

import { FieldError } from "@/components/SignupField";
import Content from "@/components/Content";
import Actions from "@/components/Actions";

type Errors = Record<string, string>;

/* ---------- Constants ---------- */
export const MAX_FILE_MB = 5;
const ACCEPT = ".pdf,.doc,.docx";
const ALLOWED_EXT = ["pdf", "doc", "docx"];

export const REQUIRED_DOCS: { key: string; label: string; required: boolean }[] = [
  { key: "medicalLicense", label: "Medical License (State)", required: true },
  { key: "dea", label: "DEA Certificate", required: false },
  { key: "npi", label: "NPI Confirmation", required: true },
  { key: "boardCert", label: "Board Certification", required: true },
  { key: "cv", label: "CV / Resume", required: true },
  { key: "background", label: "Background Check", required: true },
  { key: "insurance", label: "Professional Liability Insurance", required: true },
];

/* ---------- Values ---------- */
export type DocState = {
  fileName: string;
  file?: File;
  status: "uploading" | "uploaded";
  progress: number;
  uploadedAt: string; // yyyy-mm-dd
};

export interface CredentialValues {
  docs: Record<string, DocState | undefined>;
}

export const initialCredentials = (): CredentialValues => ({ docs: {} });

/* ---------- Validation ---------- */
export const validateCredentials = (v: CredentialValues): Errors => {
  const e: Errors = {};
  for (const d of REQUIRED_DOCS) {
    const doc = v.docs[d.key];
    if (d.required && !doc) e[`doc_${d.key}`] = `${d.label} is required.`;
    else if (doc?.status === "uploading") e[`doc_${d.key}`] = "Wait for the upload to finish.";
  }
  return e;
};

/* ---------- Component ---------- */
type Props = {
  values: CredentialValues;
  errors: Errors;
  onChange: (patch: Partial<CredentialValues>) => void;
  /** Surface file validation problems (size / type) as a toast in the parent. */
  onFileError?: (message: string) => void;
};

const todayIso = () => new Date().toISOString().slice(0, 10);

const CredentialsDocuments = ({ values: v, errors, onChange, onFileError }: Props) => {
  const timers = useRef<Record<string, ReturnType<typeof setInterval>>>({});
  const docsRef = useRef(v.docs);
  docsRef.current = v.docs;

  const setDoc = (key: string, doc: DocState | undefined) =>
    onChange({ docs: { ...docsRef.current, [key]: doc } });

  /* Uploads are simulated here. Replace the interval with your real upload call
     and update `progress` from its progress events. */
  const startUpload = (key: string, file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (!ALLOWED_EXT.includes(ext)) {
      onFileError?.("Only PDF, DOC or DOCX files are allowed.");
      return;
    }
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      onFileError?.(`File is larger than ${MAX_FILE_MB}MB.`);
      return;
    }

    clearInterval(timers.current[key]);
    let progress = 0;
    setDoc(key, { fileName: file.name, file, status: "uploading", progress, uploadedAt: todayIso() });

    timers.current[key] = setInterval(() => {
      progress += 20;
      if (progress >= 100) {
        clearInterval(timers.current[key]);
        setDoc(key, { fileName: file.name, file, status: "uploaded", progress: 100, uploadedAt: todayIso() });
      } else {
        setDoc(key, { fileName: file.name, file, status: "uploading", progress, uploadedAt: todayIso() });
      }
    }, 250);
  };

  const cancelUpload = (key: string) => {
    clearInterval(timers.current[key]);
    setDoc(key, undefined);
  };

  /* Leaving the step mid-upload: stop timers and treat in-flight files as uploaded. */
  useEffect(() => {
    const activeTimers = timers.current;
    const stuck = Object.entries(docsRef.current).filter(([, d]) => d?.status === "uploading");
    if (stuck.length) {
      const next = { ...docsRef.current };
      for (const [key, d] of stuck) next[key] = { ...d!, status: "uploaded", progress: 100 };
      onChange({ docs: next });
    }
    return () => Object.values(activeTimers).forEach(clearInterval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const viewDoc = (doc: DocState) => {
    if (!doc.file) return;
    const url = URL.createObjectURL(doc.file);
    window.open(url, "_blank", "noopener,noreferrer");
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  };

  return (
    <section className="rounded-[14px] border border-border bg-card p-4 sm:p-6">
      <h3 className="mb-4 text-base font-semibold text-heading">Required Documents</h3>

      <ul className="divide-y divide-border rounded-xl border border-border">
        {REQUIRED_DOCS.map((d) => {
          const doc = v.docs[d.key];
          const error = errors[`doc_${d.key}`];
          const inputId = `doc_${d.key}`;

          return (
            <li key={d.key} id={inputId} className="px-3 py-3 sm:px-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                {/* Label */}
                <p className="text-sm text-heading md:w-56 md:shrink-0">
                  {d.label}
                  {d.required && <span className="ml-0.5 text-danger">*</span>}
                </p>

                {/* File / upload button */}
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  {doc ? (
                    <>
                      <Content
                        title={doc.fileName}
                        description={
                          doc.status === "uploading"
                            ? `${doc.progress}% uploading`
                            : `Uploaded on ${doc.uploadedAt.slice(5, 7)}/${doc.uploadedAt.slice(8, 10)}/${doc.uploadedAt.slice(0, 4)}`
                        }
                        icon={<FileText className="h-4 w-4 shrink-0 text-primary" />}
                        size="md"
                      />
                    </>
                  ) : (
                    <>
                      <input
                        id={`file-${d.key}`}
                        type="file"
                        accept={ACCEPT}
                        className="sr-only"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) startUpload(d.key, file);
                          e.target.value = ""; // allow re-selecting the same file
                        }}
                      />
                      <label
                        htmlFor={`file-${d.key}`}
                        className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border bg-card px-3 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/5 focus-within:ring-2 focus-within:ring-primary/30 ${
                          error ? "border-danger" : "border-border"
                        }`}
                      >
                        <Upload className="h-4 w-4" />
                        Upload Document
                      </label>
                      <span className="text-xs text-body">PDF, DOC, DOCX (Max {MAX_FILE_MB}MB)</span>
                    </>
                  )}
                </div>

                {/* Row actions */}
                <div className="flex shrink-0 items-center justify-end md:w-24">
                  {doc?.status === "uploaded" && (
                    <Actions
                      actions={doc.file ? ["view", "delete"] : ["delete"]}
                      size="sm"
                      onAction={(action) => {
                        if (action === "view") viewDoc(doc);
                        else if (action === "delete") setDoc(d.key, undefined);
                      }}
                    />
                  )}
                  {doc?.status === "uploading" && (
                    <Actions
                      actions={["more"]}
                      size="sm"
                      onAction={() => cancelUpload(d.key)}
                    />
                  )}
                </div>
              </div>
              <FieldError message={error} />
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default CredentialsDocuments;