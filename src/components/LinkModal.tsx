"use client";

import React, { FormEvent, useEffect, useRef, useState } from "react";
import { Image as ImageIcon, Link2, Upload } from "lucide-react";
import ModalShell from "@/components/Modalshell";
import SignupField from "@/components/SignupField";

export type LinkModalMode = "link" | "image";

interface LinkModalProps {
  open: boolean;
  mode: LinkModalMode;
  selectedText?: string;
  onClose: () => void;
  onInsertLink: (text: string, url: string) => void;
  onInsertImage: (src: string, alt: string) => void;
}

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const normalizeUrl = (value: string, allowedProtocols: string[]) => {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const candidate = /^[a-z][a-z\d+.-]*:/i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const url = new URL(candidate);
    return allowedProtocols.includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
};

const LinkModal = ({
  open,
  mode,
  selectedText = "",
  onClose,
  onInsertLink,
  onInsertImage,
}: LinkModalProps) => {
  const [text, setText] = useState(selectedText);
  const [url, setUrl] = useState("");
  const [alt, setAlt] = useState("");
  const [uploadedImage, setUploadedImage] = useState("");
  const [error, setError] = useState("");
  const [textError, setTextError] = useState("");
  const [urlError, setUrlError] = useState("");
  const urlInputRef = useRef<HTMLInputElement>(null);
  const textInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setText(selectedText);
    setUrl("");
    setAlt("");
    setUploadedImage("");
    setError("");
    setTextError("");
    setUrlError("");
    const focusTimer = window.setTimeout(() => {
      if (mode === "link" && !selectedText.trim()) textInputRef.current?.focus();
      else urlInputRef.current?.focus();
    }, 0);
    return () => window.clearTimeout(focusTimer);
  }, [open, mode, selectedText]);

  if (!open) return null;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    setError("");
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Choose an image file.");
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setError("Images must be 5 MB or smaller.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        setError("Could not read this image file.");
        return;
      }
      setUploadedImage(reader.result);
      setUrl("");
      setAlt((current) => current || file.name.replace(/\.[^.]+$/, ""));
      setError("");
    };
    reader.onerror = () => setError("Could not read this image file.");
    reader.readAsDataURL(file);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setTextError("");
    setUrlError("");

    if (mode === "link") {
      const safeUrl = normalizeUrl(url, ["http:", "https:", "mailto:", "tel:"]);
      if (!text.trim()) {
        setTextError("Enter the text to display for this link.");
      }
      if (!safeUrl) {
        setUrlError("Enter a valid HTTP, HTTPS, email, or phone link.");
      }
      if (!text.trim() || !safeUrl) return;
      onInsertLink(text.trim(), safeUrl);
      onClose();
      return;
    }

    const safeUrl = uploadedImage || normalizeUrl(url, ["http:", "https:"]);
    if (!safeUrl) {
      setUrlError("Enter a valid image URL or upload an image.");
      return;
    }
    onInsertImage(safeUrl, alt.trim());
    onClose();
  };

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      titleId="input-actions-modal-title"
      title={
        <span className="flex items-center gap-2">
          {mode === "link" ? <Link2 className="h-5 w-5 text-primary" /> : <ImageIcon className="h-5 w-5 text-primary" />}
          {mode === "link" ? "Insert link" : "Insert image"}
        </span>
      }
      width={512}
      footer={
        <div className="flex justify-end gap-3 border-t border-divider pt-4">
          <button
            type="button"
            onClick={onClose}
            className="h-10 cursor-pointer rounded-lg border border-border px-4 text-sm font-medium text-heading transition-colors hover:bg-primary/5"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="link-modal-form"
            className="h-10 cursor-pointer rounded-lg bg-primary px-5 text-sm font-medium text-white transition-colors hover:bg-primary/90"
          >
            Insert {mode === "link" ? "link" : "image"}
          </button>
        </div>
      }
    >
      <form id="link-modal-form" onSubmit={handleSubmit} className="space-y-4">
        {mode === "link" ? (
          <>
            <SignupField
              ref={textInputRef}
              id="link-modal-text"
              label="Link text"
              value={text}
              onChange={(event) => {
                setText(event.target.value);
                setTextError("");
              }}
              placeholder="Text to display"
              error={textError}
            />
            <SignupField
              ref={urlInputRef}
              id="link-modal-url"
              label="URL"
              value={url}
              onChange={(event) => {
                setUrl(event.target.value);
                setUrlError("");
              }}
              placeholder="https://example.com"
              inputMode="url"
              error={urlError}
            />
            <p className="-mt-2 text-xs text-body">HTTP, HTTPS, email, and phone links are supported.</p>
          </>
        ) : (
          <>
            <SignupField
              ref={urlInputRef}
              id="link-modal-image-url"
              label="Image URL"
              value={url}
              onChange={(event) => {
                setUrl(event.target.value);
                setUploadedImage("");
                setUrlError("");
              }}
              placeholder="https://example.com/image.jpg"
              inputMode="url"
              error={urlError}
            />
            <div className="flex items-center gap-3 text-xs text-body">
              <span className="h-px flex-1 bg-divider" />
              or upload an image
              <span className="h-px flex-1 bg-divider" />
            </div>
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-border px-4 py-3 text-sm font-medium text-label transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary">
              <Upload className="h-4 w-4" />
              {uploadedImage ? "Choose a different image" : "Upload image (up to 5 MB)"}
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="sr-only"
                aria-label="Upload image"
              />
            </label>
            {uploadedImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={uploadedImage} alt="Selected upload preview" className="max-h-40 max-w-full rounded-lg object-contain" />
            )}
            <SignupField
              id="link-modal-image-alt"
              label={<>Alternative text <span className="font-normal text-body">(optional)</span></>}
              value={alt}
              onChange={(event) => setAlt(event.target.value)}
              placeholder="Describe the image"
            />
          </>
        )}

        {error && <p role="alert" className="text-sm text-danger">{error}</p>}
      </form>
    </ModalShell>
  );
};

export default LinkModal;
