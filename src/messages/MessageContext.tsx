"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Archive,
  ArrowUpRight,
  Download,
  FileText,
  Folder,
  HeartPulse,
  Image as ImageIcon,
  Mail,
  Music,
  Paperclip,
  Phone,
  Play,
  ShieldAlert,
  ShieldCheck,
  Star,
  User,
  UserCog,
  UserX,
  Video,
  X,
  type LucideIcon,
} from "lucide-react";

import ImportButton from "@/components/ImportButton";
import MaximizeImage from "@/components/MaximizeImage"; // adjust path if needed
import Tags from "@/components/Tags";
import { type Attachment, type Conversation } from "./MessageList";

type Props = {
  conversation: Conversation;
  /** `closePanel` from RightSubSection (animates the panel out). */
  onClose: () => void;
  onToggleStar: () => void;
  onToggleArchive: () => void;
};

const PROFILE_HREF = "/patients"; // TODO: point to /view-patient?id=<patient id> once the API gives you one

const FILE_ICONS: Record<string, LucideIcon> = { image: ImageIcon, video: Video, audio: Music, document: FileText };

type FileTab = "photos" | "videos" | "files";

const initialsOf = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

const download = (a: Attachment) => {
  if (!a.url) return;
  const link = document.createElement("a");
  link.href = a.url;
  link.download = a.name;
  document.body.appendChild(link);
  link.click();
  link.remove();
};

const SectionTitle = ({ Icon, children, extra }: { Icon: LucideIcon; children: React.ReactNode; extra?: React.ReactNode }) => (
  <div className="mb-3 flex items-center justify-between gap-3">
    <h4 className="flex items-center gap-2 text-sm font-semibold text-heading">
      <Icon className="h-[18px] w-[18px] text-primary" />
      {children}
    </h4>
    {extra}
  </div>
);

const InfoRow = ({ Icon, label, value }: { Icon: LucideIcon; label: string; value: string }) => (
  <li className="flex items-start gap-3 px-3 py-2.5">
    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
      <Icon className="h-4 w-4" />
    </span>
    <span className="min-w-0 flex-1">
      <span className="block text-xs text-body">{label}</span>
      <span className="block break-words text-sm font-medium text-heading">{value}</span>
    </span>
  </li>
);

/** Content inside the full-screen viewer. */
const ViewerContent = ({ a, zoom }: { a: Attachment; zoom: number }) => {
  const height = `${(70 * zoom) / 100}vh`;
  const maxWidth = zoom <= 100 ? "100%" : "none";

  if (a.kind === "image" && a.url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={a.url} alt={a.name} style={{ height, maxWidth, width: "auto" }} className="m-auto object-contain" />;
  }
  if (a.kind === "video" && a.url) {
    return <video key={a.url} src={a.url} controls autoPlay playsInline style={{ height, maxWidth }} className="m-auto bg-black" />;
  }
  if (a.kind === "audio" && a.url) {
    return <audio key={a.url} src={a.url} controls autoPlay className="m-auto w-full max-w-md" />;
  }
  if (a.kind === "document" && a.url && a.name.toLowerCase().endsWith(".pdf")) {
    return <iframe src={a.url} title={a.name} className="m-auto h-[70vh] w-full rounded-lg bg-card" />;
  }

  const Icon = FILE_ICONS[a.kind] ?? FileText;
  return (
    <div className="m-auto flex max-w-xs flex-col items-center gap-3 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Icon className="h-8 w-8" />
      </span>
      <p className="break-all text-sm font-semibold text-heading">{a.name}</p>
      <p className="text-xs text-body">
        {a.size} · {a.url ? "Preview isn't available for this file type." : "This file is stored on the server."}
        {a.url ? " Download it to open it." : ""}
      </p>
    </div>
  );
};

const MessageContext = ({ conversation, onClose, onToggleStar, onToggleArchive }: Props) => {
  const router = useRouter();
  const { patient } = conversation;

  /* ---------- Shared files (tabs + viewer) ---------- */
  const sharedFiles = conversation.messages.flatMap((m) => m.attachments ?? []);
  const photos = sharedFiles.filter((f) => f.kind === "image");
  const videos = sharedFiles.filter((f) => f.kind === "video");
  const others = sharedFiles.filter((f) => f.kind === "audio" || f.kind === "document");

  const [tab, setTab] = useState<FileTab>("photos");
  const [viewer, setViewer] = useState<{ items: Attachment[]; index: number } | null>(null);
  const [zoom, setZoom] = useState(100);
  const current = viewer ? viewer.items[viewer.index] : null;

  const tabs: { key: FileTab; label: string; items: Attachment[]; Icon: LucideIcon }[] = [
    { key: "photos", label: "Photos", items: photos, Icon: ImageIcon },
    { key: "videos", label: "Videos", items: videos, Icon: Video },
    { key: "files", label: "Files", items: others, Icon: FileText },
  ];
  const activeItems = tabs.find((t) => t.key === tab)!.items;

  const openViewer = (items: Attachment[], index: number) => {
    setZoom(100);
    setViewer({ items, index });
  };

  const step = (delta: number) => {
    setZoom(100);
    setViewer((v) => (v ? { ...v, index: Math.min(v.items.length - 1, Math.max(0, v.index + delta)) } : v));
  };

  useEffect(() => {
    if (!viewer) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") step(-1);
      if (e.key === "ArrowRight") step(1);
      if (e.key === "Escape") setViewer(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [viewer]);

  /* Close the viewer when another conversation is selected. */
  useEffect(() => setViewer(null), [conversation.id]);

  const canZoom = !!current && (current.kind === "image" || current.kind === "video");

  return (
    <div className="flex min-h-full flex-col">
      {/* Header – same height as the chat header so the columns line up */}
      <div className="flex h-[63px] shrink-0 items-center justify-between gap-3 border-b border-border px-4 sm:px-5">
        <h3 className="flex items-center gap-2 text-base font-semibold text-heading">
          <User className="h-[18px] w-[18px] text-primary" />
          Patient Context
        </h3>
        <button
          type="button"
          aria-label="Close patient context"
          onClick={onClose}
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-body transition-colors hover:bg-primary/5 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-5 p-4 sm:p-5">
        {!patient ? (
          <div className="flex flex-col items-center gap-3 rounded-xl bg-primary/5 px-4 py-8 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <UserX className="h-5 w-5" />
            </span>
            <p className="text-sm text-body">No patient is linked to this conversation.</p>
          </div>
        ) : (
          <>
            {/* Patient card */}
            <div className="rounded-xl bg-primary/5 p-4">
              <div className="flex items-center gap-4">
                <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-border bg-primary/10 text-lg font-semibold text-primary">
                  {initialsOf(patient.name)}
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-base font-semibold text-heading">{patient.name}</p>
                    <Tags text={patient.status} tone={patient.status === "Active" ? "success" : "danger"} size="xs" />
                  </div>
                  <p className="mt-0.5 text-xs text-body">
                    MRN: {patient.mrn} <span className="px-1 text-border">|</span> Age: {patient.age}
                  </p>
                  <p className="text-xs text-body">
                    {patient.gender} <span className="px-1 text-border">|</span> DOB: {patient.dob}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => router.push(PROFILE_HREF)}
                className="mt-3 flex cursor-pointer items-center gap-1 text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
              >
                View Patient Record
                <ArrowUpRight className="h-4 w-4" />
              </button>
            </div>

            {/* Contact & coverage */}
            <ul className="divide-y divide-divider overflow-hidden rounded-xl border border-border">
              <InfoRow Icon={UserCog} label="Primary Provider" value={patient.provider} />
              <InfoRow Icon={Phone} label="Phone" value={patient.phone} />
              <InfoRow Icon={Mail} label="Email" value={patient.email} />
              <InfoRow Icon={ShieldCheck} label="Insurance" value={patient.insurance} />
            </ul>

            {/* Alerts */}
            <div>
              <SectionTitle Icon={ShieldAlert}>Allergies & Conditions</SectionTitle>
              <div className="space-y-3">
                <div>
                  <p className="mb-1.5 text-xs text-body">Allergies</p>
                  <div className="flex flex-wrap gap-1.5">
                    {patient.allergies.length === 0 ? (
                      <span className="text-sm text-heading">No known allergies</span>
                    ) : (
                      patient.allergies.map((a) => <Tags key={a} text={a} tone="danger" size="xs" />)
                    )}
                  </div>
                </div>
                <div>
                  <p className="mb-1.5 text-xs text-body">Active conditions</p>
                  <div className="flex flex-wrap gap-1.5">
                    {patient.conditions.length === 0 ? (
                      <span className="text-sm text-heading">None recorded</span>
                    ) : (
                      patient.conditions.map((c) => <Tags key={c} text={c} tone="info" size="xs" />)
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Vitals */}
            <div>
              <SectionTitle Icon={HeartPulse}>Latest Vitals</SectionTitle>
              <div className="grid grid-cols-2 gap-2">
                {patient.vitals.map((v) => (
                  <div key={v.label} className="rounded-xl border border-border px-3 py-2.5">
                    <p className="text-xs text-body">{v.label}</p>
                    <p className="mt-0.5 text-sm font-semibold text-heading">{v.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Related EMR */}
            <div>
              <SectionTitle Icon={Folder}>Related EMR</SectionTitle>
              <ul className="divide-y divide-divider overflow-hidden rounded-xl border border-border">
                {patient.related.map(({ Icon, title, subtitle, href }) => (
                  <li key={title}>
                    <button
                      type="button"
                      onClick={() => router.push(href)}
                      className="flex w-full cursor-pointer items-center gap-3 bg-card px-3 py-3 text-left transition-colors hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/30"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="h-[18px] w-[18px]" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-heading">{title}</span>
                        <span className="block truncate text-xs text-body">{subtitle}</span>
                      </span>
                      <ArrowUpRight className="h-4 w-4 shrink-0 text-body" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}

        {/* Shared in this conversation */}
        <div>
          <SectionTitle Icon={Paperclip} extra={<span className="text-xs text-body">{sharedFiles.length}</span>}>
            Shared Files
          </SectionTitle>

          {/* Tabs */}
          <div role="tablist" className="mb-3 grid grid-cols-3 gap-1 rounded-xl bg-primary/5 p-1">
            {tabs.map(({ key, label, items, Icon }) => {
              const active = tab === key;
              return (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setTab(key)}
                  className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${
                    active ? "bg-card text-primary shadow-sm" : "text-body hover:text-primary"
                  }`}
                >
                  {label}
                  <span className={active ? "text-primary" : "text-body"}>({items.length})</span>
                </button>
              );
            })}
          </div>

          {activeItems.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border px-4 py-5 text-center text-xs text-body">
              {tab === "photos" && "Photos shared in this chat will appear here."}
              {tab === "videos" && "Videos shared in this chat will appear here."}
              {tab === "files" && "Documents and audio shared in this chat will appear here."}
            </p>
          ) : tab === "photos" ? (
            <ul className="grid grid-cols-3 gap-2">
              {photos.map((f, i) => (
                <li key={`${f.name}-${i}`}>
                  <button
                    type="button"
                    onClick={() => openViewer(photos, i)}
                    aria-label={`Open ${f.name}`}
                    className="relative block aspect-square w-full cursor-pointer overflow-hidden rounded-lg border border-border bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                  >
                    {f.url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={f.url} alt={f.name} className="h-full w-full object-cover transition-transform hover:scale-105" />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-primary">
                        <ImageIcon className="h-6 w-6" />
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          ) : tab === "videos" ? (
            <ul className="grid grid-cols-3 gap-2">
              {videos.map((f, i) => (
                <li key={`${f.name}-${i}`}>
                  <button
                    type="button"
                    onClick={() => openViewer(videos, i)}
                    aria-label={`Play ${f.name}`}
                    className="relative block aspect-square w-full cursor-pointer overflow-hidden rounded-lg border border-border bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                  >
                    {f.url && <video src={f.url} preload="metadata" muted playsInline className="h-full w-full object-cover" />}
                    <span className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-on-primary">
                        <Play className="h-3.5 w-3.5 fill-current" />
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <ul className="divide-y divide-divider overflow-hidden rounded-xl border border-border">
              {others.map((f, i) => {
                const Icon = FILE_ICONS[f.kind] ?? FileText;
                return (
                  <li key={`${f.name}-${i}`} className="flex items-center gap-1 pr-1.5">
                    <button
                      type="button"
                      onClick={() => openViewer(others, i)}
                      aria-label={`Open ${f.name}`}
                      className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/30"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="h-[18px] w-[18px]" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-heading">{f.name}</span>
                        <span className="block text-xs text-body">{f.size}</span>
                      </span>
                    </button>
                    {f.url && (
                      <a
                        href={f.url}
                        download={f.name}
                        aria-label={`Download ${f.name}`}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-body transition-colors hover:bg-primary/5 hover:text-primary"
                      >
                        <Download className="h-4 w-4" />
                      </a>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Conversation details + actions */}
        <div>
          <SectionTitle Icon={User}>Conversation</SectionTitle>
          <ul className="mb-3 divide-y divide-divider overflow-hidden rounded-xl border border-border">
            <InfoRow Icon={User} label="With" value={`${conversation.name} · ${conversation.role}`} />
            <InfoRow Icon={FileText} label="Messages" value={String(conversation.messages.length)} />
          </ul>
          <div className="flex flex-row gap-2">
            <ImportButton
              text={conversation.starred ? "Unstar" : "Star"}
              icon={<Star className={`h-4 w-4 ${conversation.starred ? "fill-current" : ""}`} />}
              className="flex-1"
              onClick={onToggleStar}
            />
            <ImportButton
              text={conversation.archived ? "Unarchive" : "Archive"}
              icon={<Archive className="h-4 w-4" />}
              className="flex-1"
              onClick={onToggleArchive}
            />
          </div>
        </div>
      </div>

      {/* Full-screen viewer */}
      <MaximizeImage
        open={viewer !== null}
        onClose={() => setViewer(null)}
        title={current?.name ?? ""}
        zoom={zoom}
        onZoomChange={setZoom}
        minZoom={50}
        maxZoom={300}
        zoomStep={25}
        showZoom={canZoom}
        pageLabel={viewer && viewer.items.length > 1 ? `${viewer.index + 1} / ${viewer.items.length}` : undefined}
        onPrevious={() => step(-1)}
        onNext={() => step(1)}
        previousDisabled={!viewer || viewer.index === 0}
        nextDisabled={!viewer || viewer.index === viewer.items.length - 1}
        onDownload={current?.url ? () => download(current) : undefined}
      >
        {current && <ViewerContent a={current} zoom={zoom} />}
      </MaximizeImage>
    </div>
  );
};

export default MessageContext;