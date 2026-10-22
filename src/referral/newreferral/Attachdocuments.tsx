"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  Eye,
  FileText,
  FlaskConical,
  Image as ImageIcon,
  Mail,
  MapPin,
  Phone,
  Pill,
  Trash2,
  User,
} from "lucide-react";

import FileDropzone from "@/components/Filedropzone";
import RadioCheckButtonh from "@/components/RadioCheckButtonh";
import SuccessToast from "@/components/SuccessToast";
import { cardCls, todayISO, type StepProps } from "@/providers/Shared";
import { PatientSummaryCard, formatDate, getPatient, type ReferralValues } from "./Referraldetails";
import { ProviderAvatar, getProvider } from "./Providerreason";

/* ---------------------------------------------------------------- */
/*  Types + static data                                              */
/* ---------------------------------------------------------------- */
export type DocKind = "pdf" | "image" | "doc";

export type AttachedDoc = {
  id: string;
  name: string;
  size: string;
  date: string;
  category: string;
  kind: DocKind;
  /** set when the document was added from the "Common Documents" list */
  commonId?: string;
};

export const INITIAL_DOCS: AttachedDoc[] = [
  { id: "d1", name: "Consultation_Note_2026-10-20.pdf", size: "245 KB", date: "Oct 20, 2026", category: "Encounter Notes", kind: "pdf", commonId: "encounter" },
  { id: "d2", name: "Lab_Results_2026-10-18.jpg", size: "1.2 MB", date: "Oct 18, 2026", category: "Lab Results", kind: "image" },
  { id: "d3", name: "Medication_List.pdf", size: "180 KB", date: "Oct 18, 2026", category: "Medication List", kind: "doc" },
];

type CommonDoc = {
  id: string;
  label: string;
  sub: string;
  Icon: React.ElementType;
  tone: string;
  kind: DocKind;
  size: string;
};

const COMMON_DOCS: CommonDoc[] = [
  { id: "encounter", label: "Encounter Notes", sub: "Last visit notes and clinical summary", Icon: FileText, tone: "bg-primary/10 text-primary", kind: "pdf", size: "245 KB" },
  { id: "lab", label: "Lab Results", sub: "Recent lab reports and test results", Icon: FlaskConical, tone: "bg-pink/15 text-pink", kind: "pdf", size: "320 KB" },
  { id: "imaging", label: "Imaging Reports", sub: "X-ray, MRI, CT, Ultrasound reports", Icon: ImageIcon, tone: "bg-success/10 text-success", kind: "pdf", size: "1.1 MB" },
  { id: "meds", label: "Medication List", sub: "Current medications", Icon: Pill, tone: "bg-warning/10 text-warning", kind: "pdf", size: "180 KB" },
  { id: "allergy", label: "Allergy Information", sub: "Documented allergies and reactions", Icon: AlertTriangle, tone: "bg-danger/10 text-danger", kind: "pdf", size: "90 KB" },
  { id: "demographics", label: "Patient Demographics", sub: "Patient summary and insurance details", Icon: User, tone: "bg-primary/10 text-primary", kind: "pdf", size: "110 KB" },
];

const checkboxCls =
  "h-4 w-4 cursor-pointer rounded border-border accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30";

const formatSize = (bytes: number) =>
  bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;

const kindOf = (file: File): DocKind =>
  file.type.startsWith("image/") ? "image" : file.type === "application/pdf" ? "pdf" : "doc";

/* ---------------------------------------------------------------- */
/*  Reusable file-type icon (also used on the review step)           */
/* ---------------------------------------------------------------- */
const KIND_STYLE: Record<DocKind, { Icon: React.ElementType; cls: string }> = {
  pdf: { Icon: FileText, cls: "bg-danger/10 text-danger" },
  image: { Icon: ImageIcon, cls: "bg-success/10 text-success" },
  doc: { Icon: FileText, cls: "bg-primary/10 text-primary" },
};

export const DocIcon = ({ kind, className = "h-10 w-10" }: { kind: DocKind; className?: string }) => {
  const { Icon, cls } = KIND_STYLE[kind];
  return (
    <span className={`flex shrink-0 items-center justify-center rounded-lg ${cls} ${className}`}>
      <Icon className="h-5 w-5" />
    </span>
  );
};

/* ---------------------------------------------------------------- */
/*  Component                                                        */
/* ---------------------------------------------------------------- */
const AttachDocuments = ({ values: v, onChange }: StepProps<ReferralValues>) => {
  const [uploadNotice, setUploadNotice] = useState<{ id: number; fileName: string } | null>(null);
  const [removalNotice, setRemovalNotice] = useState<{ id: number; message: string } | null>(null);
  const patient = getPatient(v.patient);
  const provider = getProvider(v.provider);
  const docs = v.documents;

  /* One file at a time (FileDropzone is single-file); each pick is appended to the list. */
  const addFile = (file: File | null) => {
    if (!file) return;
    const doc: AttachedDoc = {
      id: `${Date.now()}-${file.name}`,
      name: file.name,
      size: formatSize(file.size),
      date: formatDate(todayISO()),
      category: "Uploaded",
      kind: kindOf(file),
    };
    onChange({ documents: [...docs, doc] });
    setUploadNotice({ id: Date.now(), fileName: file.name });
  };

  const showRemovalNotice = (message: string) => {
    setRemovalNotice({ id: Date.now(), message });
  };

  const removeDoc = (id: string) => {
    const removedDoc = docs.find((doc) => doc.id === id);
    if (!removedDoc) return;
    onChange({ documents: docs.filter((doc) => doc.id !== id) });
    showRemovalNotice(`${removedDoc.name} was removed from the referral.`);
  };

  const toggleCommon = (c: CommonDoc) => {
    if (docs.some((d) => d.commonId === c.id)) {
      const removedDoc = docs.find((d) => d.commonId === c.id);
      onChange({ documents: docs.filter((d) => d.commonId !== c.id) });
      showRemovalNotice(`${removedDoc?.name ?? c.label} was removed from the referral.`);
      return;
    }
    onChange({
      documents: [
        ...docs,
        {
          id: `${c.id}-${Date.now()}`,
          name: `${c.label.replace(/\s+/g, "_")}_${todayISO()}.pdf`,
          size: c.size,
          date: formatDate(todayISO()),
          category: c.label,
          kind: c.kind,
          commonId: c.id,
        },
      ],
    });
  };

  return (
    <>
      <div className="space-y-4 sm:space-y-5">
      {/* ================= Patient + provider summary ================= */}
      <div className="grid gap-4 sm:gap-5 lg:grid-cols-2">
        {patient ? (
          <PatientSummaryCard patient={patient} className="border border-border/60" />
        ) : (
          <div className={`${cardCls} text-sm text-body`}>No patient selected.</div>
        )}

        <div className="flex flex-col gap-4 rounded-xl border border-border/60 bg-primary/[0.06] dark:bg-primary/15 p-4 sm:flex-row sm:items-center">
          {provider ? (
            <>
              <div className="flex min-w-0 items-center gap-4">
                <ProviderAvatar name={provider.name} className="h-14 w-14 text-base" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-heading">{provider.name}</p>
                  <p className="text-xs text-body">{provider.specialty}</p>
                  <p className="text-xs font-medium text-heading">{provider.clinic}</p>
                </div>
              </div>
              <div className="min-w-0 space-y-1.5 border-t border-divider pt-3 text-xs text-body sm:ml-auto sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0">
                <p className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                  {provider.address} 85004
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 shrink-0 text-primary" />
                  {provider.phone}
                </p>
                <p className="flex items-center gap-2 break-all">
                  <Mail className="h-3.5 w-3.5 shrink-0 text-primary" />
                  {provider.email}
                </p>
              </div>
            </>
          ) : (
            <p className="text-sm text-body">No provider selected.</p>
          )}
        </div>
      </div>

      <div className="grid items-start gap-4 sm:gap-5 2xl:grid-cols-[minmax(0,1fr)_380px]">
        {/* ================= LEFT: upload + attached ================= */}
        <section className={`${cardCls} min-w-0 sm:p-6`}>
          <div className="mb-4">
            <h3 className="text-base font-semibold text-heading sm:text-lg">Attach Supporting Documents</h3>
            <p className="mt-0.5 text-xs text-body sm:text-sm">
              Upload relevant clinical documents to include with this referral. You can attach multiple files.
            </p>
          </div>

          <FileDropzone title="files here" file={null} onChange={addFile} maxSizeMB={10} />

          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between gap-3">
              <h4 className="text-sm font-semibold text-heading">Attached Documents ({docs.length})</h4>
              {docs.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    onChange({ documents: [] });
                    showRemovalNotice(`${docs.length} documents were removed from the referral.`);
                  }}
                  className="cursor-pointer text-xs font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 sm:text-sm"
                >
                  Remove All
                </button>
              )}
            </div>

            {docs.length > 0 ? (
              <ul className="divide-y divide-divider overflow-hidden rounded-xl border border-border">
                {docs.map((d) => (
                  <li key={d.id} className="flex items-center gap-3 px-3 py-3 sm:px-4">
                    <DocIcon kind={d.kind} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-heading">{d.name}</p>
                      <p className="text-xs text-body">
                        {d.size} <span className="mx-1 text-border">|</span> {d.date}{" "}
                        <span className="mx-1 text-border">|</span> {d.category}
                      </p>
                    </div>
                    <button
                      type="button"
                      aria-label={`View ${d.name}`}
                      className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-body transition-colors hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      aria-label={`Remove ${d.name}`}
                      title="Remove"
                      onClick={() => removeDoc(d.id)}
                      className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-body transition-colors hover:bg-danger/10 hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-body">
                No documents attached yet.
              </p>
            )}
          </div>
        </section>

        {/* ================= RIGHT: common documents ================= */}
        <aside className={`${cardCls} sm:p-6`}>
          <h3 className="text-base font-semibold text-heading sm:text-lg">Common Documents</h3>
          <p className="mt-0.5 text-xs text-body sm:text-sm">Quickly add common patient documents.</p>

          <ul className="mt-4 space-y-3">
            {COMMON_DOCS.map((c) => {
              const checked = docs.some((d) => d.commonId === c.id);
              return (
                <li key={c.id}>
                  <label className="flex cursor-pointer items-center gap-3">
                    <RadioCheckButtonh
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleCommon(c)}
                      aria-label={c.label}
                      className={checkboxCls}
                    />
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${c.tone}`}>
                      <c.Icon className="h-5 w-5" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-heading">{c.label}</span>
                      <span className="block text-xs text-body">{c.sub}</span>
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </aside>
      </div>
      </div>
      <SuccessToast
        key={uploadNotice?.id ?? "no-upload"}
        isOpen={Boolean(uploadNotice)}
        onClose={() => setUploadNotice(null)}
        title="Document added successfully"
        message={uploadNotice ? `${uploadNotice.fileName} was added to the referral.` : undefined}
      />
      <SuccessToast
        key={removalNotice?.id ?? "no-removal"}
        isOpen={Boolean(removalNotice)}
        onClose={() => setRemovalNotice(null)}
        title="Document removed successfully"
        message={removalNotice?.message}
      />
    </>
  );
};

export default AttachDocuments;
