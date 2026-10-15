"use client";

import React, { useState } from "react";
import { Download, Eye, FileText, Image as ImageIcon, Trash2 } from "lucide-react";

import Table from "@/components/Table";
import { type TableColumn } from "@/components/Tableheader";
import Content from "@/components/Content";
import Tags, { type TagTone } from "@/components/Tags";
import FileDropzone from "@/components/Filedropzone";
import { StepHeader, checkboxCls, iconBtn } from "@/components/Verticalsteps";

/* ---------- Static data ---------- */
type FileType = "Clinical Document" | "Lab Result" | "Imaging" | "Other";

type Attachment = {
  id: string;
  name: string;
  sub: string;
  type: FileType;
  size: string;
  date: string;
  time: string;
  by: string;
};

const INITIAL: Attachment[] = [
  { id: "1", name: "Consent_Form.pdf", sub: "Patient consent form", type: "Clinical Document", size: "245 KB", date: "Oct 9, 2026", time: "10:15 AM", by: "Dr. Sarah Lee" },
  { id: "2", name: "Chest_Xray.png", sub: "Chest X-Ray", type: "Imaging", size: "1.8 MB", date: "Oct 9, 2026", time: "10:32 AM", by: "Dr. Sarah Lee" },
  { id: "3", name: "Lab_Report_CBC.pdf", sub: "Complete Blood Count", type: "Lab Result", size: "320 KB", date: "Oct 9, 2026", time: "10:45 AM", by: "Dr. Sarah Lee" },
  { id: "4", name: "Referral_Note.docx", sub: "Specialist referral", type: "Clinical Document", size: "128 KB", date: "Oct 9, 2026", time: "11:05 AM", by: "Dr. Sarah Lee" },
];

const TYPE_TONE: Record<FileType, TagTone> = {
  "Clinical Document": "info",
  "Lab Result": "success",
  Imaging: "violet",
  Other: "neutral",
};

const TABS: { label: string; type: FileType | null }[] = [
  { label: "All Files", type: null },
  { label: "Clinical Documents", type: "Clinical Document" },
  { label: "Lab Results", type: "Lab Result" },
  { label: "Imaging", type: "Imaging" },
  { label: "Other", type: "Other" },
];

const COLUMNS: TableColumn[] = [
  {
    key: "select",
    label: "",
    className: "w-10 !px-3",
  },
  { key: "name", label: "File Name", className: "!px-3" },
  { key: "type", label: "Type", className: "!px-3" },
  { key: "size", label: "Size", className: "!px-3" },
  { key: "uploaded", label: "Uploaded On", className: "!px-3" },
  { key: "by", label: "Uploaded By", className: "!px-3" },
  {
    key: "actions",
    label: "Actions",
    className: "!px-3",
    width: 120,
    header: <div className="flex w-full items-center justify-center">Actions</div>,
  },
];

const formatSize = (bytes: number) =>
  bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;

const FileTile = ({ name }: { name: string }) => {
  const ext = name.split(".").pop()?.toLowerCase();
  const isPdf = ext === "pdf";
  const isImg = ext === "png" || ext === "jpg" || ext === "jpeg";
  const Icon = isImg ? ImageIcon : FileText;
  return (
    <span
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
        isPdf ? "bg-red-100 text-red-500 dark:bg-red-950/40 dark:text-red-400" : "bg-primary/10 text-primary"
      }`}
    >
      <Icon className="h-4 w-4" />
    </span>
  );
};

/* ---------- Component ---------- */
const Attachments = () => {
  const [files, setFiles] = useState<Attachment[]>(INITIAL);
  const [tab, setTab] = useState("All Files");

  const countFor = (type: FileType | null) =>
    type ? files.filter((f) => f.type === type).length : files.length;

  const active = TABS.find((t) => t.label === tab) ?? TABS[0];
  const visible = active.type ? files.filter((f) => f.type === active.type) : files;

  /* The dropzone is single-file: each pick is added to the list and the zone resets. */
  const addFile = (file: File | null) => {
    if (!file) return;
    const now = new Date();
    setFiles((prev) => [
      {
        id: `${Date.now()}`,
        name: file.name,
        sub: "Uploaded file",
        type: "Other",
        size: formatSize(file.size),
        date: now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        time: now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        by: "Dr. Sarah Lee",
      },
      ...prev,
    ]);
  };

  const rows = visible.map((f) => ({
    select: <input type="checkbox" aria-label={`Select ${f.name}`} className={checkboxCls} />,
    name: (
      <div className="flex min-w-0 items-center gap-3">
        <FileTile name={f.name} />
        <Content title={f.name} description={f.sub} />
      </div>
    ),
    type: <Tags text={f.type} tone={TYPE_TONE[f.type]} />,
    size: <Content title={f.size} />,
    uploaded: <Content title={f.date} description={f.time} />,
    by: <Content title={f.by} />,
    actions: (
      <div className="flex w-full items-center justify-center gap-1">
        <button type="button" aria-label="View file" className={`${iconBtn} text-body hover:bg-heading/5 hover:text-heading`}>
          <Eye className="h-4 w-4" />
        </button>
        <button type="button" aria-label="Download file" className={`${iconBtn} text-primary hover:bg-primary/10`}>
          <Download className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label="Delete file"
          onClick={() => setFiles((prev) => prev.filter((x) => x.id !== f.id))}
          className={`${iconBtn} text-danger hover:bg-danger/10`}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    ),
  }));

  return (
    <div className="min-w-0">
      <StepHeader
        title="Attachments"
        subtitle="Upload and manage files related to this encounter (e.g., lab results, imaging, consent forms, documents)."
      />

      <div className="space-y-5">
        <FileDropzone title="files here" file={null} onChange={addFile} maxSizeMB={10} />

        {/* Filter tabs */}
        <div
          role="tablist"
          aria-label="Attachment types"
          className="custom-scrollbar flex min-w-0 gap-5 overflow-x-auto border-b border-border"
        >
          {TABS.map((t) => {
            const on = t.label === tab;
            return (
              <button
                key={t.label}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => setTab(t.label)}
                className={`-mb-px cursor-pointer whitespace-nowrap border-b-2 px-1 pb-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${
                  on ? "border-primary text-primary" : "border-transparent text-body hover:text-heading"
                }`}
              >
                {t.label} ({countFor(t.type)})
              </button>
            );
          })}
        </div>

        <div className="min-w-0">
          <Table columns={COLUMNS} rows={rows} selectable />
        </div>
      </div>
    </div>
  );
};

export default Attachments;