"use client";

import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { FileText, Image as ImageIcon, Loader2, Music, Paperclip, Plus, Send, Smile, Video, X, type LucideIcon } from "lucide-react";

import AddButton from "@/components/Addbutton";
import ErrorToast from "@/components/ErrorToast";
import SignupField from "@/components/SignupField";
import EmojiPicker from "@/components/EmojiPicker";
import { type Attachment, type AttachmentKind } from "./MessageList";

/* ---------------------------------------------------------------- */
/*  Types + limits                                                   */
/* ---------------------------------------------------------------- */
export type ComposerHandle = {
  /** Used by the chat for drag & drop. */
  addFiles: (files: File[]) => void;
};

export type SendPayload = { text: string; attachments: Attachment[] };

type Props = {
  onSend: (payload: SendPayload) => void;
  /** Clicking a tray tile opens the chat's full-screen viewer on that file. */
  onPreview?: (items: Attachment[], index: number) => void;
};

type Item = {
  id: string;
  name: string;
  size: string;
  ext: string;
  kind: AttachmentKind;
  /** Object URL used for the thumbnail and, once sent, for viewing / downloading. */
  url: string;
  progress: number;
  status: "uploading" | "done";
};

const MAX_FILES = 10;
const MAX_MB = 25;
const BLOCKED_EXTENSIONS = new Set(["exe", "bat", "cmd", "msi", "scr", "vbs", "sh", "com", "js"]);

const UPLOAD_OPTIONS: { key: string; label: string; hint: string; accept: string; Icon: LucideIcon }[] = [
  { key: "photo", label: "Photo", hint: "JPG, PNG, WebP", accept: "image/*", Icon: ImageIcon },
  { key: "video", label: "Video", hint: "MP4, MOV, WebM", accept: "video/*", Icon: Video },
  { key: "document", label: "Document", hint: "PDF, Word, Excel, TXT", accept: ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.rtf", Icon: FileText },
  { key: "audio", label: "Audio", hint: "MP3, WAV, M4A", accept: "audio/*", Icon: Music },
];

const KIND_ICONS: Record<AttachmentKind, LucideIcon> = { image: ImageIcon, video: Video, audio: Music, document: FileText };

const extOf = (name: string) => (name.includes(".") ? name.split(".").pop()!.toLowerCase() : "");

const kindOf = (file: File): AttachmentKind =>
  file.type.startsWith("image/") ? "image" : file.type.startsWith("video/") ? "video" : file.type.startsWith("audio/") ? "audio" : "document";

const formatSize = (bytes: number) =>
  bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;

/* ---------------------------------------------------------------- */
/*  Component                                                        */
/* ---------------------------------------------------------------- */
const MessageComposer = forwardRef<ComposerHandle, Props>(({ onSend, onPreview }, ref) => {
  const [draft, setDraft] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [menu, setMenu] = useState<"attach" | "emoji" | null>(null);

  const fileRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const timers = useRef<Map<string, ReturnType<typeof setInterval>>>(new Map());
  const itemsRef = useRef<Item[]>([]);
  itemsRef.current = items;

  const uploading = items.some((i) => i.status === "uploading");
  const canSend = !uploading && (draft.trim().length > 0 || items.length > 0);

  /* ---------- Upload (simulated – replace with your API call) ---------- */
  const startUpload = (id: string) => {
    // TODO: replace with a real upload (XHR / axios with onUploadProgress) and update progress from it.
    const timer = setInterval(() => {
      setItems((prev) =>
        prev.map((i) => {
          if (i.id !== id || i.status === "done") return i;
          const progress = Math.min(100, i.progress + 6 + Math.random() * 14);
          return { ...i, progress, status: progress >= 100 ? "done" : "uploading" };
        }),
      );
    }, 250);
    timers.current.set(id, timer);
  };

  /* Stop the timer of every finished upload. */
  useEffect(() => {
    items.forEach((i) => {
      if (i.status === "done" && timers.current.has(i.id)) {
        clearInterval(timers.current.get(i.id));
        timers.current.delete(i.id);
      }
    });
  }, [items]);

  /* Cleanup: stop timers and free the previews of files that were never sent. */
  useEffect(
    () => () => {
      timers.current.forEach((t) => clearInterval(t));
      timers.current.clear();
      itemsRef.current.forEach((i) => URL.revokeObjectURL(i.url));
    },
    [],
  );

  /* ---------- Adding / removing files ---------- */
  const addFiles = (files: File[]) => {
    if (files.length === 0) return;
    const problems: string[] = [];
    const accepted: Item[] = [];
    const room = MAX_FILES - itemsRef.current.length;

    files.forEach((file) => {
      const ext = extOf(file.name);
      if (BLOCKED_EXTENSIONS.has(ext)) {
        problems.push(`${file.name}: this file type is not allowed.`);
      } else if (file.size > MAX_MB * 1024 * 1024) {
        problems.push(`${file.name} is larger than ${MAX_MB} MB.`);
      } else if (accepted.length >= room) {
        problems.push(`You can attach up to ${MAX_FILES} files per message.`);
      } else {
        accepted.push({
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          name: file.name,
          size: formatSize(file.size),
          ext,
          kind: kindOf(file),
          url: URL.createObjectURL(file),
          progress: 0,
          status: "uploading",
        });
      }
    });

    setErrorMessage(problems.length > 0 ? Array.from(new Set(problems)).join(" ") : null);
    if (accepted.length > 0) {
      setItems((prev) => [...prev, ...accepted]);
      accepted.forEach((a) => startUpload(a.id));
    }
  };

  useImperativeHandle(ref, () => ({ addFiles }));

  const removeItem = (id: string) => {
    const timer = timers.current.get(id);
    if (timer) {
      clearInterval(timer);
      timers.current.delete(id);
    }
    const item = itemsRef.current.find((i) => i.id === id);
    if (item) URL.revokeObjectURL(item.url);
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const clearAll = () => {
    itemsRef.current.forEach((i) => removeItem(i.id));
    setErrorMessage(null);
  };

  const pickType = (accept: string) => {
    setMenu(null);
    const input = fileRef.current;
    if (!input) return;
    input.accept = accept;
    input.click();
  };

  /* ---------- Emoji ---------- */
  const insertEmoji = (emoji: string) => {
    const el = inputRef.current;
    const start = el?.selectionStart ?? draft.length;
    const end = el?.selectionEnd ?? start;
    setDraft(draft.slice(0, start) + emoji + draft.slice(end));
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(start + emoji.length, start + emoji.length);
    });
  };

  /* ---------- Send ---------- */
  const submit = () => {
    if (!canSend) return;
    const attachments: Attachment[] = items.map(({ name, size, kind, url }) => ({ name, size, kind, url }));
    onSend({ text: draft.trim(), attachments });
    setItems([]); // the object URLs now belong to the sent message – do not revoke them
    setDraft("");
    setErrorMessage(null);
    setMenu(null);
  };

  return (
    <div className="relative shrink-0 border-t border-border">
      <ErrorToast
        isOpen={errorMessage !== null}
        onClose={() => setErrorMessage(null)}
        title="Attachment could not be added"
        message={errorMessage ?? undefined}
      />

      {/* Click-away layer for the two pop-ups */}
      {menu && <div className="fixed inset-0 z-10" onClick={() => setMenu(null)} aria-hidden="true" />}

      {/* Attachment tray */}
      {items.length > 0 && (
        <div className="px-3 pt-3 sm:px-4 sm:pt-4">
          <div className="mb-1 flex items-center justify-between gap-3 text-xs text-body">
            <span>
              {items.length} attachment{items.length > 1 ? "s" : ""}
              {uploading ? " · Uploading…" : " · Ready to send"}
            </span>
            <button
              type="button"
              onClick={clearAll}
              className="cursor-pointer font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
            >
              Clear all
            </button>
          </div>

          <ul className="custom-scrollbar flex gap-3 overflow-x-auto pb-2 pr-2 pt-2">
            {items.map((item, index) => {
              const KindIcon = KIND_ICONS[item.kind];
              return (
                <li key={item.id} className="relative w-[72px] shrink-0">
                  <button
                    type="button"
                    disabled={item.status === "uploading" || !onPreview}
                    onClick={() => onPreview?.(items.map(({ name, size, kind, url }) => ({ name, size, kind, url })), index)}
                    aria-label={`Preview ${item.name}`}
                    className="relative block h-[72px] w-[72px] cursor-pointer overflow-hidden rounded-xl border border-border bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:cursor-default"
                  >
                    {item.kind === "image" ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.url} alt={item.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-primary">
                        <KindIcon className="h-6 w-6" />
                        <span className="text-[10px] font-semibold uppercase">{item.ext || item.kind}</span>
                      </div>
                    )}

                    {item.status === "uploading" && (
                      <>
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5 bg-black/45 text-on-primary">
                          <Loader2 className="h-5 w-5 animate-spin" />
                          <span className="text-[10px] font-semibold">{Math.round(item.progress)}%</span>
                        </div>
                        <div className="absolute inset-x-0 bottom-0 h-1 bg-black/30">
                          <div className="h-full bg-primary transition-[width] duration-200" style={{ width: `${item.progress}%` }} />
                        </div>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    aria-label={item.status === "uploading" ? `Cancel upload of ${item.name}` : `Remove ${item.name}`}
                    onClick={() => removeItem(item.id)}
                    className="absolute -right-1.5 -top-1.5 flex h-5 w-5 cursor-pointer items-center justify-center rounded-full border border-border bg-card text-heading shadow hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                  >
                    <X className="h-3 w-3" />
                  </button>
                  <p className="mt-1 truncate text-[11px] text-body" title={item.name}>
                    {item.name}
                  </p>
                </li>
              );
            })}

            {items.length < MAX_FILES && (
              <li className="shrink-0">
                <button
                  type="button"
                  aria-label="Add more files"
                  onClick={() => setMenu("attach")}
                  className="flex h-[72px] w-[72px] cursor-pointer items-center justify-center rounded-xl border border-dashed border-primary/50 bg-primary/5 text-primary transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Emoji picker */}
      {menu === "emoji" && (
        <EmojiPicker
          onSelect={insertEmoji}
          onClose={() => setMenu(null)}
          className="absolute bottom-full left-3 right-3 z-20 mb-2 sm:left-auto sm:right-4 sm:w-[22rem]"
        />
      )}

      {/* Input row */}
      <form
        className="flex items-start gap-2 p-3 sm:p-4"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <input
          ref={fileRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            addFiles(Array.from(e.target.files ?? []));
            e.target.value = "";
          }}
        />

        {/* Attach */}
        <div className="relative shrink-0">
          <button
            type="button"
            aria-label="Attach file"
            aria-expanded={menu === "attach"}
            onClick={() => setMenu(menu === "attach" ? null : "attach")}
            className={`flex h-12 w-12 cursor-pointer items-center justify-center rounded-xl border bg-card transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${
              menu === "attach" ? "border-primary text-primary" : "border-border text-heading hover:border-primary/50 hover:text-primary"
            }`}
          >
            <Paperclip className="h-[18px] w-[18px]" />
          </button>

          {menu === "attach" && (
            <div role="menu" className="absolute bottom-full left-0 z-20 mb-2 w-60 overflow-hidden rounded-2xl border border-border bg-card p-1.5 shadow-2xl ring-1 ring-border/60">
              {UPLOAD_OPTIONS.map(({ key, label, hint, accept, Icon }) => (
                <button
                  key={key}
                  type="button"
                  role="menuitem"
                  onClick={() => pickType(accept)}
                  className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-2.5 py-2.5 text-left transition-colors hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-[18px] w-[18px]" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-heading">{label}</span>
                    <span className="block truncate text-xs text-body">{hint}</span>
                  </span>
                </button>
              ))}
              <p className="px-3 pb-1.5 pt-1 text-[11px] text-body">Up to {MAX_FILES} files · {MAX_MB} MB each</p>
            </div>
          )}
        </div>

        {/* Text */}
        <div className="min-w-0 flex-1">
          <SignupField
            ref={inputRef}
            name="messageDraft"
            placeholder={items.length > 0 ? "Add a caption..." : "Type a secure message..."}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            onPaste={(e) => {
              const files = Array.from(e.clipboardData.files);
              if (files.length > 0) {
                e.preventDefault();
                addFiles(files);
              }
            }}
            autoComplete="off"
            trailing={
              <button
                type="button"
                aria-label="Add emoji"
                aria-expanded={menu === "emoji"}
                onClick={() => setMenu(menu === "emoji" ? null : "emoji")}
                className={`flex cursor-pointer items-center transition-colors ${menu === "emoji" ? "text-primary" : "text-body hover:text-primary"}`}
              >
                <Smile className="h-[18px] w-[18px]" />
              </button>
            }
          />
        </div>

        {/* Send */}
        <AddButton
          text={uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          ariaLabel={uploading ? "Uploading attachments" : "Send message"}
          icon={null}
          onClick={submit}
          disabled={!canSend}
          className="h-12 shrink-0 px-4"
        />
      </form>
    </div>
  );
});

MessageComposer.displayName = "MessageComposer";

export default MessageComposer;