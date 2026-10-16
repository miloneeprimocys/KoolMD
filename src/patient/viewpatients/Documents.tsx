"use client";

import React, { useState } from "react";
import {
  Download,
  Eye,
  FileImage,
  FileText,
  FlaskConical,
  FolderOpen,
  MoreVertical,
  Pill,
  ShieldCheck,
  UserRound,
  type LucideIcon,
} from "lucide-react";

import Table from "@/components/Table";
import { type TableColumn } from "@/components/Tableheader";
import Content from "@/components/Content";
import Tags from "@/components/Tags";
import FileDropzone from "@/components/Filedropzone";
import { DENSE, TONES, type Tone } from "./medicalhistory/Medicalhistory";
import type { PatientDocumentDetails } from "./Rightsection";

type DocumentRow = PatientDocumentDetails & {
  icon: LucideIcon;
  tone: Tone;
  uploadedRole: string;
};

const DOCUMENTS: DocumentRow[] = [
  { name: "Insurance_Card.pdf", format: "PDF", icon: FileText, tone: "red", category: "Insurance", uploadedBy: "Admin User", uploadedRole: "245 KB", date: "Oct 6, 2026, 10:30 AM", size: "245 KB", status: "Verified", statusTone: "success", notes: "—" },
  { name: "Driver_License.jpg", format: "JPG", icon: FileImage, tone: "blue", category: "ID & Demographics", uploadedBy: "Admin User", uploadedRole: "1.2 MB", date: "Oct 3, 2026, 09:15 AM", size: "1.2 MB", status: "Verified", statusTone: "success", notes: "—" },
  { name: "Consent_Form.pdf", format: "PDF", icon: FileText, tone: "red", category: "Consent Forms", uploadedBy: "Dr. Sarah Lee", uploadedRole: "320 KB", date: "Sep 28, 2026, 02:40 PM", size: "320 KB", status: "Verified", statusTone: "success", notes: "Signed consent form." },
  { name: "Lab_Report.pdf", format: "PDF", icon: FlaskConical, tone: "orange", category: "Lab Results", uploadedBy: "Dr. James Wilson", uploadedRole: "540 KB", date: "Sep 12, 2026, 11:05 AM", size: "540 KB", status: "Pending", statusTone: "warning", notes: "Awaiting verification." },
  { name: "Xray_Result.jpg", format: "JPG", icon: FileImage, tone: "blue", category: "Medical Records", uploadedBy: "Dr. Emily Davis", uploadedRole: "1.8 MB", date: "Aug 9, 2026, 09:45 AM", size: "1.8 MB", status: "Verified", statusTone: "success", notes: "—" },
  { name: "Discharge_Summary.pdf", format: "PDF", icon: FileText, tone: "red", category: "Medical Records", uploadedBy: "Dr. Sarah Lee", uploadedRole: "420 KB", date: "Jul 22, 2026, 01:10 PM", size: "420 KB", status: "Verified", statusTone: "success", notes: "—" },
  { name: "Vaccination_Record.pdf", format: "PDF", icon: FileText, tone: "blue", category: "Other", uploadedBy: "Admin User", uploadedRole: "310 KB", date: "Jun 10, 2026, 04:30 PM", size: "310 KB", status: "Verified", statusTone: "success", notes: "—" },
];


const columns: TableColumn[] = [
  { key: "name", label: "File Name", className: DENSE },
  { key: "category", label: "Category", className: DENSE },
  { key: "date", label: "Date Uploaded", className: DENSE },
  { key: "uploadedBy", label: "Uploaded By", className: DENSE },
  { key: "status", label: "Status", className: DENSE },
  {
    key: "actions",
    label: "Actions",
    className: DENSE,
    width: 112,
    header: <div className="flex w-full items-center justify-center">Actions</div>,
  },
];

const Documents = ({
  onViewDocument,
}: {
  onViewDocument: (details: PatientDocumentDetails) => void;
}) => {
  const [activeCategory, setActiveCategory] = useState("All Documents");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const filteredDocuments =
    activeCategory === "All Documents"
      ? DOCUMENTS
      : DOCUMENTS.filter((document) => document.category === activeCategory);

  const rows = filteredDocuments.map((document) => ({
    name: (
      <div className="flex min-w-0 items-center gap-2.5">
        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${TONES[document.tone]}`}>
          <document.icon className="h-4 w-4" />
        </span>
        <Content title={document.name} description={document.uploadedRole} truncate />
      </div>
    ),
    category: <Tags text={document.category} tone="info" />,
    date: <Content title={document.date.split(", ").slice(0, 2).join(", ")} description={document.date.split(", ").slice(2).join(", ")} truncate />,
    uploadedBy: <Content title={document.uploadedBy} truncate />,
    status: <Tags text={document.status} tone={document.statusTone} />,
    actions: (
      <div className="flex w-full items-center justify-center gap-0.5">
        <button
          type="button"
          aria-label={`View ${document.name}`}
          title="View"
          onClick={() => onViewDocument(document)}
          className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-label transition-colors hover:bg-primary/10 hover:text-primary"
        >
          <Eye className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          aria-label={`Download ${document.name}`}
          title="Download"
          className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-label transition-colors hover:bg-primary/10 hover:text-primary"
        >
          <Download className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          aria-label={`More actions for ${document.name}`}
          title="More actions"
          className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-label transition-colors hover:bg-primary/10 hover:text-primary"
        >
          <MoreVertical className="h-3.5 w-3.5" />
        </button>
      </div>
    ),
  }));

  return (
    <div className="space-y-4 sm:space-y-5">
    
      <FileDropzone
        title="your document here"
        file={uploadFile}
        onChange={setUploadFile}
        selectedFileClassName="mx-auto max-w-2xl"
      />

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <Table columns={columns} rows={rows} bordered={false} />
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-divider px-4 py-3 text-xs text-body">
          <span>Showing 1 to {filteredDocuments.length} of 12 documents</span>
          <div className="flex items-center gap-2">
            <button type="button" aria-label="Previous page" className="rounded-md px-2 py-1 text-body hover:bg-primary/10">‹</button>
            <span className="rounded-md bg-primary/10 px-2.5 py-1 font-medium text-primary">1</span>
            <span className="px-1">2</span>
            <button type="button" aria-label="Next page" className="rounded-md px-2 py-1 text-body hover:bg-primary/10">›</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Documents;
