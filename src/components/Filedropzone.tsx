"use client";

import React, { useRef, useState } from "react";
import { FileText, X } from "lucide-react";
import { FieldError } from "./SignupField";

const ALLOWED = ["application/pdf", "image/jpeg", "image/png"];
const MAX_BYTES = 5 * 1024 * 1024;

interface FileDropzoneProps {
  /** Text after "Drag and drop", e.g. "your medical license here" */
  title: string;
  file: File | null;
  onChange: (file: File | null) => void;
  error?: string;
  className?: string;
}

const formatSize = (bytes: number) =>
  bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;

const FileDropzone = ({
  title,
  file,
  onChange,
  error,
  className = "",
}: FileDropzoneProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [localError, setLocalError] = useState("");

  const handleFiles = (files: FileList | null) => {
    const f = files?.[0];
    if (!f) return;
    if (!ALLOWED.includes(f.type)) {
      setLocalError("Only PDF, JPG or PNG files are allowed.");
      return;
    }
    if (f.size > MAX_BYTES) {
      setLocalError("File is larger than 5MB.");
      return;
    }
    setLocalError("");
    onChange(f);
  };

  const message = localError || error;

  return (
    <div className={`w-full ${className}`}>
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={`flex min-h-[150px] cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed px-4 py-6 text-center outline-none transition-colors duration-200 focus-visible:ring-4 focus-visible:ring-primary/20 ${
          message
            ? "border-danger bg-danger/5"
            : dragging
              ? "border-primary bg-primary/10"
              : "border-border bg-primary/5 hover:border-primary/60"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          className="hidden"
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = ""; // allow re-selecting the same file
          }}
        />

        {file ? (
          <div className="flex w-full max-w-xs items-center gap-3 rounded-lg border border-border bg-card px-3 py-2 text-left">
            <FileText className="h-5 w-5 shrink-0 text-primary" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-heading">
                {file.name}
              </span>
              <span className="block text-xs text-body">
                {formatSize(file.size)}
              </span>
            </span>
            <button
              type="button"
              aria-label="Remove file"
              onClick={(e) => {
                e.stopPropagation();
                setLocalError("");
                onChange(null);
              }}
              className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-body transition-colors hover:bg-danger/10 hover:text-danger"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <>
            <FileText className="h-6 w-6 text-label" strokeWidth={1.5} />
            <p className="mt-2 text-sm font-semibold text-heading">
              Drag and drop {title}
            </p>
            <p className="text-xs text-body">or click to browse</p>
            <p className="mt-1 text-[11px] text-body">
              PDF, JPG or PNG (Max 5MB)
            </p>
          </>
        )}
      </div>
      <FieldError message={message} />
    </div>
  );
};

export default FileDropzone;