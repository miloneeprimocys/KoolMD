"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { FileText, Upload } from "lucide-react";

import AddButton from "@/components/Addbutton";
import Table from "@/components/Table";
import TableStatus from "@/components/TableStatus";
import { type TableColumn } from "@/components/Tableheader";
import Content from "@/components/Content";
import Actions from "@/components/Actions";
import SignupDropdown from "@/components/SignupDropdown";
import { FieldError } from "@/components/SignupField";
import MaximizeImage from "@/components/MaximizeImage";
import { Errors, SectionCard, toOptions, todayISO, uid } from "../../Shared";
import { fmtDate } from "./Licenseinformation";

export const DOC_TYPES = [
  "License Certificate",
  "DEA Certificate",
  "NPI Confirmation",
  "Board Certification",
  "CV / Resume",
  "Background Check",
];

export type DocItem = {
  id: string;
  name: string;
  type: string;
  uploadedDate: string; // yyyy-mm-dd
  uploadedBy: string;
  file?: File;
};

export interface DocumentValues {
  docs: DocItem[];
}

export const initialDocuments = (): DocumentValues => ({ docs: [] });

export const validateDocuments = (v: DocumentValues): Errors => {
  const e: Errors = {};
  if (!v.docs.some((d) => d.type === "License Certificate"))
    e.docs = "Upload at least one License Certificate.";
  return e;
};

const MAX_MB = 10;

type Props = {
  values: DocumentValues;
  errors: Errors;
  onChange: (patch: Partial<DocumentValues>) => void;
  onFileError?: (message: string) => void;
};

const SupportingDocuments = ({ values, errors, onChange, onFileError }: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [docType, setDocType] = useState(DOC_TYPES[0]);
  const [previewDocument, setPreviewDocument] = useState<DocItem | null>(null);
  const [zoom, setZoom] = useState(100);

  const previewUrl = useMemo(
    () => (previewDocument?.file ? URL.createObjectURL(previewDocument.file) : null),
    [previewDocument],
  );

  useEffect(() => {
    if (!previewUrl) return;
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const added: DocItem[] = [];
    Array.from(files).forEach((file) => {
      if (file.size > MAX_MB * 1024 * 1024) {
        onFileError?.(`${file.name} is larger than ${MAX_MB} MB.`);
        return;
      }
      added.push({ id: uid(), name: file.name, type: docType, uploadedDate: todayISO(), uploadedBy: "Admin", file });
    });
    if (added.length) onChange({ docs: [...values.docs, ...added] });
    if (inputRef.current) inputRef.current.value = "";
  };

  const openFile = (d: DocItem) => {
    if (!d.file) return;
    setPreviewDocument(d);
    setZoom(100);
  };

  const downloadFile = (d: DocItem) => {
    if (!d.file) return;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(d.file);
    a.download = d.name;
    a.click();
  };

  const columns: TableColumn[] = [
    { key: "name", label: "Document Name" },
    { key: "type", label: "Type" },
    { key: "uploadedDate", label: "Uploaded Date" },
    { key: "uploadedBy", label: "Uploaded By" },
    { key: "actions", label: "Actions", header: <div className="flex w-full items-center justify-center">Actions</div> },
  ];

  const rows = values.docs.map((d) => ({
    name: (
      <span className="flex min-w-0 items-center gap-2 text-sm font-medium text-primary">
        <FileText className="h-4 w-4 shrink-0 text-danger" />
        <span className="truncate">{d.name}</span>
      </span>
    ),
    type: <Content title={d.type} />,
    uploadedDate: <Content title={fmtDate(d.uploadedDate)} />,
    uploadedBy: <Content title={d.uploadedBy} />,
    actions: (
      <div className="flex w-full items-center justify-center">
        <Actions
          actions={["view", "download", "delete"]}
          onAction={(action) => {
            if (action === "view") openFile(d);
            else if (action === "download") downloadFile(d);
            else if (action === "delete") onChange({ docs: values.docs.filter((x) => x.id !== d.id) });
          }}
        />
      </div>
    ),
  }));

  return (
    <>
      <MaximizeImage
        open={Boolean(previewDocument && previewUrl)}
        onClose={() => setPreviewDocument(null)}
        title={previewDocument?.name ?? "Document preview"}
        zoom={zoom}
        onZoomChange={setZoom}
        onDownload={() => previewDocument && downloadFile(previewDocument)}
      >
        {previewDocument && previewUrl &&
          (previewDocument.file?.type === "application/pdf" ? (
            <iframe
              src={previewUrl}
              title={previewDocument.name}
              className="h-full min-h-[70vh] w-full rounded-lg border-0 bg-white"
              style={{ transform: `scale(${zoom / 100})`, transformOrigin: "center" }}
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt={previewDocument.name}
              className="max-h-full max-w-full object-contain transition-transform"
              style={{ transform: `scale(${zoom / 100})` }}
            />
          ))}
      </MaximizeImage>

      <SectionCard
      step={2}
      title="Supporting Documents"
      subtitle="Manage all documents related to this license."
      action={
        <AddButton
          text="Upload Document"
          icon={<Upload className="h-4 w-4" />}
          onClick={() => inputRef.current?.click()}
          className="shrink-0 whitespace-nowrap px-3 sm:px-5"
        />
      }
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept=".pdf,.png,.jpg,.jpeg"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      <div className="mb-4 max-w-sm">
        <SignupDropdown
          name="docType"
          label="Document Type (for next upload)"
          searchable={false}
          options={toOptions(DOC_TYPES)}
          value={docType}
          onChange={setDocType}
        />
      </div>

      <div id="docs" className="overflow-hidden rounded-[14px] border border-border bg-card">
        {values.docs.length === 0 ? (
          <TableStatus variant="empty" message="No documents uploaded yet." />
        ) : (
          <Table columns={columns} rows={rows} bordered={false} />
        )}
      </div>
      <FieldError message={errors.docs} />
      </SectionCard>
    </>
  );
};

export default SupportingDocuments;

