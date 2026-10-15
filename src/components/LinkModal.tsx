"use client";

import React, { FormEvent, useEffect, useRef, useState } from "react";
import { Image as ImageIcon, Link2, Upload, X } from "lucide-react";

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
  const urlInputRef = useRef<HTMLInputElement>(null);
  const textInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setText(selectedText);
    setUrl("");
    setAlt("");
    setUploadedImage("");
    setError("");
    const focusTimer = window.setTimeout(() => {
      if (mode === "link" && !selectedText.trim()) textInputRef.current?.focus();
      else urlInputRef.current?.focus();
    }, 0);
    return () => window.clearTimeout(focusTimer);
  }, [open, mode, selectedText]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

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

    if (mode === "link") {
      const safeUrl = normalizeUrl(url, ["http:", "https:", "mailto:", "tel:"]);
      if (!text.trim()) {
        setError("Enter the text to display for this link.");
        return;
      }
      if (!safeUrl) {
        setError("Enter a valid HTTP, HTTPS, email, or phone link.");
        return;
      }
      onInsertLink(text.trim(), safeUrl);
      onClose();
      return;
    }

    const safeUrl = uploadedImage || normalizeUrl(url, ["http:", "https:"]);
    if (!safeUrl) {
      setError("Enter a valid image URL or upload an image.");
      return;
    }
    onInsertImage(safeUrl, alt.trim());
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div aria-hidden="true" className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="input-actions-modal-title"
        className="relative z-10 w-full max-w-lg rounded-2xl border border-border bg-card p-5 text-heading shadow-2xl sm:p-6"
      >
        <header className="mb-5 flex items-center justify-between border-b border-divider pb-4">
          <h2 id="input-actions-modal-title" className="flex items-center gap-2 text-lg font-semibold">
            {mode === "link" ? <Link2 className="h-5 w-5 text-primary" /> : <ImageIcon className="h-5 w-5 text-primary" />}
            {mode === "link" ? "Insert link" : "Insert image"}
          </h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-body hover:bg-primary/10 hover:text-primary"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "link" ? (
            <>
              <label className="block text-sm font-medium text-label">
                Link text
                <input
                  ref={textInputRef}
                  value={text}
                  onChange={(event) => setText(event.target.value)}
                  placeholder="Text to display"
                  className="mt-2 h-11 w-full rounded-xl border border-border bg-card px-3 text-sm text-heading outline-none placeholder:text-placeholder focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </label>
              <label className="block text-sm font-medium text-label">
                URL
                <input
                  ref={urlInputRef}
                  value={url}
                  onChange={(event) => setUrl(event.target.value)}
                  placeholder="https://example.com"
                  inputMode="url"
                  className="mt-2 h-11 w-full rounded-xl border border-border bg-card px-3 text-sm text-heading outline-none placeholder:text-placeholder focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </label>
              <p className="-mt-2 text-xs text-body">HTTP, HTTPS, email, and phone links are supported.</p>
            </>
          ) : (
            <>
              <label className="block text-sm font-medium text-label">
                Image URL
                <input
                  ref={urlInputRef}
                  value={url}
                  onChange={(event) => {
                    setUrl(event.target.value);
                    setUploadedImage("");
                  }}
                  placeholder="https://example.com/image.jpg"
                  inputMode="url"
                  className="mt-2 h-11 w-full rounded-xl border border-border bg-card px-3 text-sm text-heading outline-none placeholder:text-placeholder focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </label>
              <div className="flex items-center gap-3 text-xs text-body">
                <span className="h-px flex-1 bg-divider" />
                or upload an image
                <span className="h-px flex-1 bg-divider" />
              </div>
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-border px-4 py-3 text-sm font-medium text-label transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary">
                <Upload className="h-4 w-4" />
                {uploadedImage ? "Choose a different image" : "Upload image (up to 5 MB)"}
                <input type="file" accept="image/*" onChange={handleFileChange} className="sr-only" />
              </label>
              {uploadedImage && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={uploadedImage} alt="Selected upload preview" className="max-h-40 max-w-full rounded-lg object-contain" />
              )}
              <label className="block text-sm font-medium text-label">
                Alternative text <span className="font-normal text-body">(optional)</span>
                <input
                  value={alt}
                  onChange={(event) => setAlt(event.target.value)}
                  placeholder="Describe the image"
                  className="mt-2 h-11 w-full rounded-xl border border-border bg-card px-3 text-sm text-heading outline-none placeholder:text-placeholder focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </label>
            </>
          )}

          {error && <p role="alert" className="text-sm text-danger">{error}</p>}

          <footer className="flex justify-end gap-3 border-t border-divider pt-4">
            <button
              type="button"
              onClick={onClose}
              className="h-10 cursor-pointer rounded-lg border border-border px-4 text-sm font-medium text-heading transition-colors hover:bg-primary/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-10 cursor-pointer rounded-lg bg-primary px-5 text-sm font-medium text-white transition-colors hover:bg-primary/90"
            >
              Insert {mode === "link" ? "link" : "image"}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
};

export default LinkModal;
