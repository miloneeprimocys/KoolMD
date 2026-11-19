"use client";

import React, { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowLeft, CheckCheck, Download, FileText, Image as ImageIcon, Info, Music, Paperclip, Phone, Play, Video } from "lucide-react";

import MaximizeImage from "@/components/MaximizeImage"; // TODO: adjust to where your MaximizeImage component lives
import MessageComposer, { isRichText, plainTextOf, sanitizeRichText, type ComposerHandle, type SendPayload } from "./MessageComposer";
import { ConversationAvatar, type Attachment, type ChatMessage, type Conversation } from "./MessageList";
import { FaChevronDown } from "react-icons/fa";

type Props = {
  conversation: Conversation;
  /** Whether the right "Patient Context" panel is open. */
  infoOpen: boolean;
  /** Below xl the chat is full screen; this returns to the list. */
  onBack: () => void;
  onToggleInfo: () => void;
  onOpenInfo: () => void;
  onSend: (payload: SendPayload) => void;
  showInfo?: boolean;
};

const iconButtonCls =
  "flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-heading transition-colors hover:bg-primary/5 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30";

const KIND_ICONS = { image: ImageIcon, video: Video, audio: Music, document: FileText } as const;

/* ---------------------------------------------------------------- */
/*  Emoji-only messages (1–3 emoji) are shown big, without a bubble  */
/* ---------------------------------------------------------------- */
const EMOJI_UNIT = new RegExp(
  "(?:\\p{Extended_Pictographic}[\\uFE0F\\u{1F3FB}-\\u{1F3FF}]?(?:\\u200D\\p{Extended_Pictographic}[\\uFE0F\\u{1F3FB}-\\u{1F3FF}]?)*|\\p{Regional_Indicator}{2}|[0-9#*]\\uFE0F?\\u20E3)",
  "gu",
);

/** Number of emoji when the text is made of nothing but emoji (and spaces); otherwise 0. */
const emojiOnlyCount = (text?: string): number => {
  const trimmed = text?.trim();
  if (!trimmed) return 0;
  const matches = trimmed.match(EMOJI_UNIT) ?? [];
  const rest = trimmed.replace(EMOJI_UNIT, "").replace(/\s/g, "");
  return rest.length === 0 ? matches.length : 0;
};

const BIG_EMOJI_SIZE: Record<number, string> = { 1: "text-6xl", 2: "text-5xl", 3: "text-4xl" };

/* ---------------------------------------------------------------- */
/*  Splitting one message into WhatsApp-style bubbles                */
/*  photos (one grid) → each video → each audio → each document      */
/* ---------------------------------------------------------------- */
type Segment = { type: "images"; items: Attachment[] } | { type: "single"; item: Attachment };

const buildSegments = (attachments: Attachment[]): Segment[] => {
  const of = (kind: Attachment["kind"]) => attachments.filter((a) => a.kind === kind);
  const images = of("image");
  const segments: Segment[] = [];
  if (images.length > 0) segments.push({ type: "images", items: images });
  [...of("video"), ...of("audio"), ...of("document")].forEach((item) => segments.push({ type: "single", item }));
  return segments;
};

const download = (a: Attachment) => {
  if (!a.url) return;
  const link = document.createElement("a");
  link.href = a.url;
  link.download = a.name;
  document.body.appendChild(link);
  link.click();
  link.remove();
};

/* ---------------------------------------------------------------- */
/*  Pieces                                                           */
/* ---------------------------------------------------------------- */
const MessageMeta = ({ time, mine }: { time: string; mine: boolean }) => (
  <p className={`flex items-center gap-1 pb-1 pt-1 text-xs text-body ${mine ? "justify-end" : ""}`}>
    {time}
    {mine && <CheckCheck className="h-3.5 w-3.5 text-primary" />}
  </p>
);

const Bubble = ({ mine, wide = false, children }: { mine: boolean; wide?: boolean; children: React.ReactNode }) => (
  <div
    className={`min-w-0 max-w-full rounded-2xl px-1.5 pt-1 pb-1.5 text-sm text-heading ${
      mine ? "rounded-br-none bg-primary/10" : "rounded-bl-none bg-surface-start/70"
    } ${wide ? "w-72" : ""}`}
  >
    {children}
  </div>
);

/** One line of the chat: optional avatar + bubble(s). */
const Row = ({
  conversation,
  mine,
  showAvatar,
  children,
}: {
  conversation: Conversation;
  mine: boolean;
  showAvatar: boolean;
  children: React.ReactNode;
}) => (
  <div className={`flex items-end gap-2 ${mine ? "justify-end" : "justify-start"}`}>
    {!mine && (showAvatar ? <ConversationAvatar conversation={conversation} size="sm" /> : <span className="w-9 shrink-0" aria-hidden="true" />)}
    {children}
  </div>
);

/** Message text: editor HTML (bold, italic, lists, links…) or plain text for older messages. */
const MessageText = ({ text, className = "" }: { text: string; className?: string }) =>
  isRichText(text) ? (
    <div
      className={`break-words [&_a]:text-primary [&_a]:underline [&_h1]:text-base [&_h1]:font-bold [&_h2]:text-[15px] [&_h2]:font-bold [&_h3]:font-bold [&_ol]:my-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-0 [&_p:empty]:min-h-[1.25em] [&_ul]:my-1 [&_ul]:list-disc [&_ul]:pl-5 ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitizeRichText(text) }}
    />
  ) : (
    <p className={`whitespace-pre-wrap break-words ${className}`}>{text}</p>
  );

/** Up to 4 photos in a grid; the 4th shows "+N" when there are more (like WhatsApp). */
const PhotoGrid = ({ items, onOpen }: { items: Attachment[]; onOpen: (a: Attachment) => void }) => {
  const shown = items.slice(0, 4);
  const extra = items.length - shown.length;

  return (
    <div className="grid grid-cols-2 gap-1">
      {shown.map((a, i) => {
        const isFirstOfThree = items.length === 3 && i === 0;
        const span = isFirstOfThree ? "col-span-2 aspect-[2/1]" : "aspect-square";
        const single = items.length === 1;
        const tileCls = `relative block overflow-hidden rounded-lg ${single ? "col-span-2 max-h-72" : span}`;
        const overlay = i === 3 && extra > 0;

        const content = (
          <>
            {a.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={a.url} alt={a.name} className={`w-full object-cover ${single ? "max-h-72" : "h-full"}`} />
            ) : (
              <span className="flex h-full min-h-24 w-full items-center justify-center bg-primary/10 text-primary">
                <ImageIcon className="h-8 w-8" />
              </span>
            )}
            {overlay && (
              <span className="absolute inset-0 flex items-center justify-center bg-black/55 text-2xl font-normal text-on-primary">
                +{extra}
              </span>
            )}
          </>
        );

        return a.url ? (
          <button
            key={`${a.name}-${i}`}
            type="button"
            onClick={() => onOpen(a)}
            aria-label={overlay ? `Open ${a.name} and ${extra} more photos` : `Open ${a.name}`}
            className={`${tileCls} cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30`}
          >
            {content}
          </button>
        ) : (
          <div key={`${a.name}-${i}`} className={tileCls}>
            {content}
          </div>
        );
      })}
    </div>
  );
};

const VideoTile = ({ a, onOpen }: { a: Attachment; onOpen: (a: Attachment) => void }) => (
  <button
    type="button"
    onClick={() => onOpen(a)}
    aria-label={`Play ${a.name}`}
    className="relative block aspect-video w-full cursor-pointer overflow-hidden rounded-xl bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
  >
    {a.url && <video src={a.url} preload="metadata" muted playsInline className="h-full w-full object-cover" />}
    <span className="absolute inset-0 flex items-center justify-center bg-black/30">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-black/60 text-on-primary">
        <Play className="h-5 w-5 fill-current" />
      </span>
    </span>
    <span className="absolute bottom-1.5 left-2 right-2 truncate text-left text-xs text-on-primary">{a.name}</span>
  </button>
);

const DocumentCard = ({ a, onOpen }: { a: Attachment; onOpen: (a: Attachment) => void }) => {
  const Icon = KIND_ICONS[a.kind];
  return (
    <div className="flex items-center gap-2 rounded-xl border border-primary/30 bg-card/60 py-2.5 pl-3 pr-1.5">
      <button
        type="button"
        onClick={() => onOpen(a)}
        className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-heading">{a.name}</span>
          <span className="block text-xs text-body">{a.size}</span>
        </span>
      </button>
      {a.url ? (
        <a href={a.url} download={a.name} aria-label={`Download ${a.name}`} className={iconButtonCls}>
          <Download className="h-[18px] w-[18px]" />
        </a>
      ) : (
        <button
          type="button"
          aria-label={`Download ${a.name}`}
          onClick={() => {
            // TODO: download the stored file
          }}
          className={iconButtonCls}
        >
          <Download className="h-[18px] w-[18px]" />
        </button>
      )}
    </div>
  );
};

/** Content shown inside the full-screen viewer. */
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

  const Icon = KIND_ICONS[a.kind];
  return (
    <div className="m-auto flex max-w-xs flex-col items-center gap-3 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Icon className="h-8 w-8" />
      </span>
      <p className="break-all text-sm font-semibold text-heading">{a.name}</p>
      <p className="text-xs text-body">
        {a.size} · {a.url ? "Preview isn't available for this file type. Download it to open it." : "This file is stored on the server. Download it to open it."}
      </p>
    </div>
  );
};

/* ---------------------------------------------------------------- */
/*  Chat                                                             */
/* ---------------------------------------------------------------- */
const MessageChat = ({ conversation, infoOpen, onBack, onToggleInfo, onOpenInfo, onSend, showInfo = true }: Props) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<ComposerHandle>(null);
  const dragDepth = useRef(0);
  const [dragging, setDragging] = useState(false);
  const [showScrollToLatest, setShowScrollToLatest] = useState(false);
  const isAtLatestRef = useRef(true);
  const previousConversationIdRef = useRef(conversation.id);

  /* Full-screen viewer (MaximizeImage) */
  const [viewer, setViewer] = useState<{ items: Attachment[]; index: number } | null>(null);
  const [zoom, setZoom] = useState(100);
  const current = viewer ? viewer.items[viewer.index] : null;

  /** Every photo and video in this conversation – the viewer steps through them. */
  const mediaItems = conversation.messages
    .flatMap((m) => m.attachments ?? [])
    .filter((a) => a.kind === "image" || a.kind === "video");

  const openViewer = (items: Attachment[], index: number) => {
    setZoom(100);
    setViewer({ items, index: Math.max(0, index) });
  };

  /** Click on something in a sent bubble. */
  const openAttachment = (a: Attachment) => {
    const mediaIndex = mediaItems.indexOf(a);
    if (mediaIndex >= 0) openViewer(mediaItems, mediaIndex);
    else openViewer([a], 0);
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

  const scrollToLatest = (behavior: ScrollBehavior = "auto") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior });
    isAtLatestRef.current = true;
    setShowScrollToLatest(false);
  };

  const onMessagesScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const atLatest = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    isAtLatestRef.current = atLatest;
    setShowScrollToLatest(!atLatest);
  };

  /* Keep the newest message in view when opening a conversation or adding a message. */
  useEffect(() => {
    const conversationChanged = previousConversationIdRef.current !== conversation.id;
    previousConversationIdRef.current = conversation.id;
    if (!conversationChanged && !isAtLatestRef.current) return;

    const frame = requestAnimationFrame(() => scrollToLatest());
    return () => cancelAnimationFrame(frame);
  }, [conversation.id, conversation.messages.length]);

  /* A chat can mount while hidden below xl; scroll once it becomes visible. */
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) scrollToLatest();
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;
    const observer = new ResizeObserver(() => {
      if (isAtLatestRef.current) scrollToLatest();
    });
    observer.observe(content);
    return () => observer.disconnect();
  }, []);

  /* ---------- Drag & drop ---------- */
  const hasFiles = (e: React.DragEvent) => Array.from(e.dataTransfer.types).includes("Files");

  const onDragEnter = (e: React.DragEvent) => {
    if (!hasFiles(e)) return;
    e.preventDefault();
    dragDepth.current += 1;
    setDragging(true);
  };
  const onDragOver = (e: React.DragEvent) => {
    if (hasFiles(e)) e.preventDefault();
  };
  const onDragLeave = (e: React.DragEvent) => {
    if (!hasFiles(e)) return;
    dragDepth.current = Math.max(0, dragDepth.current - 1);
    if (dragDepth.current === 0) setDragging(false);
  };
  const onDrop = (e: React.DragEvent) => {
    if (!hasFiles(e)) return;
    e.preventDefault();
    dragDepth.current = 0;
    setDragging(false);
    composerRef.current?.addFiles(Array.from(e.dataTransfer.files));
  };

  /* ---------- Rendering of one message ---------- */
  const renderMessage = (m: ChatMessage) => {
    const mine = m.from === "me";
    const segments = buildSegments(m.attachments ?? []);

    /* Text only */
    if (segments.length === 0) {
      const emojiCount = emojiOnlyCount(plainTextOf(m.text));
      if (emojiCount >= 1 && emojiCount <= 3) {
        return (
          <Row conversation={conversation} mine={mine} showAvatar>
            <div className="min-w-0 max-w-[85%] sm:max-w-[75%]">
              <p className={`leading-tight ${BIG_EMOJI_SIZE[emojiCount]} ${mine ? "text-right" : ""}`}>{plainTextOf(m.text)}</p>
              <MessageMeta time={m.time} mine={mine} />
            </div>
          </Row>
        );
      }
      return (
        <Row conversation={conversation} mine={mine} showAvatar>
          <div className={`flex w-fit min-w-0 max-w-[85%] flex-col sm:max-w-[75%] ${mine ? "items-end" : "items-start"}`}>
            <Bubble mine={mine}>{m.text && <MessageText text={m.text} className="px-2 pt-1" />}</Bubble>
            <MessageMeta time={m.time} mine={mine} />
          </div>
        </Row>
      );
    }

    /* With files – one bubble per group, the caption goes with the first one */
    return (
      <div className="space-y-1.5">
        {segments.map((segment, i) => (
          <Row key={i} conversation={conversation} mine={mine} showAvatar={i === 0}>
            <div className={`flex w-fit min-w-0 max-w-[85%] flex-col sm:max-w-[75%] ${mine ? "items-end" : "items-start"}`}>
              <Bubble mine={mine} wide>
                {segment.type === "images" ? (
                  <PhotoGrid items={segment.items} onOpen={openAttachment} />
                ) : segment.item.kind === "video" ? (
                  <VideoTile a={segment.item} onOpen={openAttachment} />
                ) : segment.item.kind === "audio" ? (
                  segment.item.url ? (
                    <audio controls src={segment.item.url} className="w-full" />
                  ) : (
                    <DocumentCard a={segment.item} onOpen={openAttachment} />
                  )
                ) : (
                  <DocumentCard a={segment.item} onOpen={openAttachment} />
                )}
                {i === 0 && m.text && <MessageText text={m.text} className="px-2 pt-2" />}
              </Bubble>
              <MessageMeta time={m.time} mine={mine} />
            </div>
          </Row>
        ))}
      </div>
    );
  };

  return (
    <div
      className="relative flex min-h-0 min-w-0 flex-1 flex-col"
      onDragEnter={onDragEnter}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {/* Header */}
      <div className="flex h-[63px] shrink-0 items-center justify-between gap-2 border-b border-border px-2 sm:px-4">
        <div className="flex min-w-0 items-center gap-1 sm:gap-2">
          <button type="button" aria-label="Back to messages" onClick={onBack} className={`${iconButtonCls} xl:hidden`}>
            <ArrowLeft className="h-5 w-5" />
          </button>
          {showInfo ? (
            <button
              type="button"
              onClick={onOpenInfo}
              className="flex min-w-0 cursor-pointer items-center gap-3 rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
            >
              <ConversationAvatar conversation={conversation} />
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-heading">{conversation.name}</span>
                <span className="block truncate text-xs text-body">{conversation.role}</span>
              </span>
            </button>
          ) : (
            <div className="flex min-w-0 items-center gap-3">
              <ConversationAvatar conversation={conversation} />
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-heading">{conversation.name}</span>
                <span className="block truncate text-xs text-body">{conversation.role}</span>
              </span>
            </div>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          <button type="button" aria-label="Start video call" className={`${iconButtonCls} hidden sm:flex`}>
            <Video className="h-[18px] w-[18px]" />
          </button>
          <button type="button" aria-label="Start voice call" className={iconButtonCls}>
            <Phone className="h-[18px] w-[18px]" />
          </button>
          {showInfo && (
            <button
              type="button"
              aria-label={infoOpen ? "Hide patient context" : "Show patient context"}
              aria-pressed={infoOpen}
              onClick={onToggleInfo}
              className={`${iconButtonCls} ${infoOpen ? "bg-primary/10 text-primary" : ""}`}
            >
              <Info className="h-[18px] w-[18px]" />
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="relative min-h-0 flex-1">
        <div ref={scrollRef} onScroll={onMessagesScroll} className="custom-scrollbar h-full min-h-0 overflow-y-auto px-3 py-4 sm:px-5">
          <div ref={contentRef} className="space-y-4">
            {conversation.messages.length === 0 && (
              <p className="py-10 text-center text-sm text-body">No messages yet. Send the first secure message below.</p>
            )}

            {conversation.messages.map((m, i) => {
              const showDay = i === 0 || conversation.messages[i - 1].day !== m.day;
              return (
                <React.Fragment key={m.id}>
                  {showDay && (
                    <div className="flex justify-center">
                      <span className="rounded-full bg-surface-start/70 px-4 py-1 text-xs text-body">{m.day}</span>
                    </div>
                  )}
                  {renderMessage(m)}
                </React.Fragment>
              );
            })}
          </div>
        </div>
        {showScrollToLatest && (
          <button
            type="button"
            aria-label="Scroll to latest messages"
            title="Scroll to latest messages"
            onClick={() => scrollToLatest("smooth")}
            className="absolute bottom-3 cursor-pointer right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-primary shadow-md transition-colors hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <FaChevronDown  className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Composer */}
      <MessageComposer ref={composerRef} onSend={onSend} onPreview={openViewer} />

      {/* Drop overlay */}
      {dragging && (
        <div className="pointer-events-none absolute inset-0 z-30 flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-primary bg-card/90 text-primary backdrop-blur-xs">
          <Paperclip className="h-8 w-8" />
          <p className="text-sm font-semibold">Drop files to attach</p>
          <p className="text-xs text-body">Photos, videos, documents and audio</p>
        </div>
      )}

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

export default MessageChat;