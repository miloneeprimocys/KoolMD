"use client";

import React, { useEffect, useRef, useState } from "react";
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

const isImage = (file: File | null) =>
  file ? file.type.startsWith("image/") : false;

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
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  /* ---------- Build & clean object URL for image previews ---------- */
  useEffect(() => {
    if (file && isImage(file)) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreviewUrl(null);
    return undefined;
  }, [file]);

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
    <div className={`w-full min-w-0 ${className}`}>
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
        className={`relative flex h-full min-w-0 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed px-3 py-5 text-center outline-none transition-colors duration-200 focus-visible:ring-4 focus-visible:ring-primary/20 sm:px-4 sm:py-6 ${
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
            e.target.value = "";
          }}
        />

        {file ? (
          /* ---------- Selected: responsive card ---------- */
          <div className="flex w-full min-w-0 flex-col items-stretch gap-3 rounded-lg border border-border bg-card p-3 text-left sm:flex-row sm:items-center sm:gap-3 sm:p-2">
            {/* Thumbnail wrapper — relative so mobile ✕ can sit at its top-right */}
            <div className="relative mx-auto sm:mx-0 sm:shrink-0">
              <span className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-md border border-border bg-primary/5 sm:h-14 sm:w-14">
                {isImage(file) && previewUrl ? (
                  <img
                    src={previewUrl}
                    alt={file.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <FileText
                    className="h-7 w-7 text-primary sm:h-6 sm:w-6"
                    strokeWidth={1.75}
                  />
                )}
              </span>

              {/* Mobile-only ✕ — top-right corner of the thumbnail */}
              <button
                type="button"
                aria-label="Remove file"
                onClick={(e) => {
                  e.stopPropagation();
                  setLocalError("");
                  onChange(null);
                }}
                className="absolute -right-2 -top-2 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border border-border bg-card text-body shadow-sm transition-colors hover:bg-danger/10 hover:text-danger sm:hidden"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* File meta + desktop ✕ */}
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <span className="min-w-0 flex-1 text-center sm:text-left">
                <span className="block truncate text-sm font-medium text-heading">
                  {file.name}
                </span>
                <span className="block text-xs text-body">
                  {formatSize(file.size)}
                  {isImage(file) ? " · Image" : " · Document"}
                </span>
              </span>

              {/* Desktop-only ✕ */}
              <button
                type="button"
                aria-label="Remove file"
                onClick={(e) => {
                  e.stopPropagation();
                  setLocalError("");
                  onChange(null);
                }}
                className="hidden h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-body transition-colors hover:bg-danger/10 hover:text-danger sm:flex"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          /* ---------- Empty state ---------- */
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