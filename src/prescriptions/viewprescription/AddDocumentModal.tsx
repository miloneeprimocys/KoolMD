"use client";

import React, { useEffect, useState } from "react";
import { FileText, X } from "lucide-react";

import FileDropzone from "@/components/Filedropzone";
import ModalShell, {
  FormGrid,
  FullRow,
  ModalTextarea,
  OptLabel,
  ReqLabel,
  SignupDropdown,
  SignupField,
  toOptions,
} from "@/components/Modalshell";

const DOCUMENT_TYPES = toOptions([
  "Lab Report",
  "Imaging Report",
  "Prescription Copy",
  "Insurance Document",
  "Consent Form",
  "Other",
]);

const ALLOWED = ["pdf", "jpg", "jpeg", "png", "doc", "docx", "xls", "xlsx"];
const MAX_MB = 10;

export type DocumentValues = {
  title: string;
  type: string;
  description: string;
  file: File | null;
};
type Errors = Partial<Record<keyof DocumentValues, string>>;

const initial = (): DocumentValues => ({ title: "", type: "", description: "", file: null });

const formatSize = (bytes: number) =>
  bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;

type Props = {
  open: boolean;
  onClose: () => void;
  onSave?: (values: DocumentValues) => void;
};

const AddDocumentModal = ({ open, onClose, onSave }: Props) => {
  const [values, setValues] = useState<DocumentValues>(initial());
  const [errors, setErrors] = useState<Errors>({});

  useEffect(() => {
    if (!open) return;
    setValues(initial());
    setErrors({});
  }, [open]);

  const set = <K extends keyof DocumentValues>(key: K, val: DocumentValues[K]) => {
    setValues((p) => ({ ...p, [key]: val }));
    setErrors((p) => ({ ...p, [key]: undefined }));
  };

  const handleSave = () => {
    const e: Errors = {};
    if (!values.title.trim()) e.title = "Document title is required";
    if (!values.type) e.type = "Select a document type";
    if (!values.file) e.file = "Choose a file to upload";
    else {
      const ext = values.file.name.split(".").pop()?.toLowerCase() ?? "";
      if (!ALLOWED.includes(ext)) e.file = "Unsupported file format";
      else if (values.file.size > MAX_MB * 1024 * 1024) e.file = `File must be under ${MAX_MB} MB`;
    }
    setErrors(e);
    if (Object.keys(e).length) return;

    // TODO: call your upload API here
    console.log("Document added:", values);
    onSave?.(values);
    onClose();
  };

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      onSubmit={handleSave}
      title="Add Document"
      titleId="add-document-title"
      subtitle="Upload documents related to this prescription."
      submitText="Upload Document"
      width={620}
    >
      <FormGrid>
        <SignupField
          name="documentTitle"
          label={<ReqLabel>Document Title</ReqLabel>}
          placeholder="Enter document title"
          value={values.title}
          onChange={(e) => set("title", e.target.value)}
          error={errors.title}
        />
        <SignupDropdown
          name="documentType"
          label={<ReqLabel>Document Type</ReqLabel>}
          placeholder="Select document type"
          searchable={false}
          options={DOCUMENT_TYPES}
          value={values.type}
          onChange={(v) => set("type", v)}
          error={errors.type}
        />
        <FullRow>
          <ModalTextarea
            id="document-description"
            label={<OptLabel>Description</OptLabel>}
            placeholder="Enter description or notes about this document"
            value={values.description}
            onChange={(v) => set("description", v)}
            maxLength={250}
          />
        </FullRow>

        <FullRow>
          <FileDropzone
            variant="attachment"
            title={`Drag and drop file here, or choose a file. Supported formats: PDF, JPG, JPEG, PNG, DOC, DOCX, XLS, XLSX (Max ${MAX_MB} MB per file)`}
            file={values.file}
            onChange={(f: File | null) => set("file", f)}
            error={errors.file}
            maxSizeMB={MAX_MB}
          />
        </FullRow>

        {values.file && (
          <FullRow>
            <p className="mb-2 text-sm font-semibold text-heading">Selected File</p>
            <div className="flex items-center gap-3 rounded-xl border border-border p-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-danger/10 text-danger">
                <FileText className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-heading">{values.file.name}</p>
                <p className="text-xs text-body">{formatSize(values.file.size)}</p>
              </div>
              <button
                type="button"
                aria-label="Remove file"
                onClick={() => set("file", null)}
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-body transition-colors hover:bg-danger/10 hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger/30"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </FullRow>
        )}
      </FormGrid>
    </ModalShell>
  );
};

export default AddDocumentModal;