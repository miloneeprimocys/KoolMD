"use client";

import React from "react";
import { FileText, Image as ImageIcon, Trash2 } from "lucide-react";

import SignupField from "@/components/SignupField";
import SignupDropdown from "@/components/SignupDropdown";
import DatePicker from "@/components/Datepicker";
import FileDropzone from "@/components/Filedropzone";
import Tags from "@/components/Tags";
import { ModalRadioGroup } from "@/components/Modalshell";
import { Opt, Req, TextArea, cardCls, todayISO, toOptions, type Errors, type StepProps } from "@/providers/Shared";
import type { ImagingDoc, ImagingValues } from "./Imagingpatient";

/* ---------------------------------------------------------------- */
/*  Static data                                                      */
/* ---------------------------------------------------------------- */
const SEVERITY_OPTIONS = toOptions(["Mild", "Moderate", "Severe"]);
const PREVIOUS_IMAGING_OPTIONS = toOptions(["None", "Yes – same body part", "Yes – other body part"]);
const SCHEDULE_OPTIONS = [
  { value: "now", label: "Send Now" },
  { value: "later", label: "Schedule for Later" },
];

const formatSize = (bytes: number) =>
  bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;

const categoryFor = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes("order")) return "Order Form";
  if (n.includes("note")) return "Clinical Notes";
  if (n.includes("insurance") || n.includes("card")) return "Insurance Card";
  return "Other";
};

/* ---------------------------------------------------------------- */
/*  Validation                                                       */
/* ---------------------------------------------------------------- */
export const validateImagingClinical = (v: ImagingValues): Errors => {
  const e: Errors = {};
  if (v.documents.length === 0) e.documents = "Upload at least one supporting document.";
  if (v.schedule === "later") {
    if (!v.scheduleDate) e.scheduleDate = "Select a date to schedule the order.";
    else if (v.scheduleDate < todayISO()) e.scheduleDate = "Schedule date cannot be in the past.";
  }
  return e;
};

/* ---------------------------------------------------------------- */
/*  Reusable file-type tile (also used on the review step)           */
/* ---------------------------------------------------------------- */
const KIND_STYLE: Record<ImagingDoc["kind"], { Icon: React.ElementType; cls: string }> = {
  pdf: { Icon: FileText, cls: "bg-danger/10 text-danger" },
  doc: { Icon: FileText, cls: "bg-primary/10 text-primary" },
  image: { Icon: ImageIcon, cls: "bg-success/10 text-success" },
};

export const DocTile = ({ kind, className = "h-10 w-10" }: { kind: ImagingDoc["kind"]; className?: string }) => {
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
const ImagingClinicalStep = ({ values: v, errors, onChange }: StepProps<ImagingValues>) => {
  /* FileDropzone is single-file: each pick is added to the list and the zone resets. */
  const addFile = (file: File | null) => {
    if (!file) return;
    const kind: ImagingDoc["kind"] = file.type.startsWith("image/")
      ? "image"
      : file.type === "application/pdf"
        ? "pdf"
        : "doc";
    onChange({
      documents: [
        ...v.documents,
        {
          id: `${Date.now()}-${file.name}`,
          name: file.name,
          size: formatSize(file.size),
          kind,
          category: categoryFor(file.name),
          previewUrl: kind === "image" ? URL.createObjectURL(file) : undefined,
        },
      ],
    });
  };

  const removeDoc = (id: string) => {
    const doc = v.documents.find((d) => d.id === id);
    if (doc?.previewUrl) URL.revokeObjectURL(doc.previewUrl);
    onChange({ documents: v.documents.filter((d) => d.id !== id) });
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Clinical information */}
      <section className={`${cardCls} space-y-4 sm:p-6`}>
        <div>
          <h3 className="text-base font-semibold text-heading sm:text-lg">Clinical Information</h3>
          <p className="mt-0.5 text-xs text-body sm:text-sm">
            Add relevant clinical details to support the imaging order.
          </p>
        </div>

        <TextArea
          name="history"
          label={<>Relevant History<Opt /></>}
          placeholder="e.g. Pain and swelling in the right knee for 2 weeks after a sports injury."
          value={v.history}
          onChange={(val) => onChange({ history: val })}
          maxLength={500}
          rows={3}
        />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <SignupField
            name="symptoms"
            label={<>Symptoms<Opt /></>}
            placeholder="e.g. Pain, Swelling, Limited ROM"
            value={v.symptoms}
            onChange={(e) => onChange({ symptoms: e.target.value })}
          />
          <SignupField
            name="onset"
            label={<>Onset / Duration<Opt /></>}
            placeholder="e.g. 10/08/2026 (2 weeks)"
            value={v.onset}
            onChange={(e) => onChange({ onset: e.target.value })}
          />
          <SignupDropdown
            name="severity"
            label={<>Severity<Opt /></>}
            placeholder="Select severity"
            searchable={false}
            options={SEVERITY_OPTIONS}
            value={v.severity}
            onChange={(val) => onChange({ severity: val })}
          />
        </div>

        <SignupField
          name="priorTreatment"
          label={<>Prior Treatment<Opt /></>}
          placeholder="e.g. Rest, Medication"
          value={v.priorTreatment}
          onChange={(e) => onChange({ priorTreatment: e.target.value })}
        />

        <div className="grid gap-4 md:grid-cols-2">
          <TextArea
            name="clinicalQuestions"
            label={<>Clinical Questions<Opt /></>}
            placeholder="e.g. Rule out fracture or ligament injury."
            value={v.clinicalQuestions}
            onChange={(val) => onChange({ clinicalQuestions: val })}
            maxLength={500}
            rows={3}
          />
          <TextArea
            name="specialInstructions"
            label={<>Special Instructions<Opt /></>}
            placeholder="e.g. Please compare with prior imaging if available."
            value={v.specialInstructions}
            onChange={(val) => onChange({ specialInstructions: val })}
            maxLength={500}
            rows={3}
          />
        </div>
      </section>

      {/* Order options */}
      <section className={`${cardCls} sm:p-6`}>
        <h3 className="mb-4 text-base font-semibold text-heading sm:text-lg">Order Options</h3>
        <div className="grid gap-x-6 gap-y-4 md:grid-cols-2 xl:grid-cols-3">
          <SignupDropdown
            name="previousImaging"
            label="Previous Imaging"
            placeholder="Select option"
            searchable={false}
            options={PREVIOUS_IMAGING_OPTIONS}
            value={v.previousImaging}
            onChange={(val) => onChange({ previousImaging: val })}
          />
          <ModalRadioGroup
            name="schedule"
            label="Schedule"
            value={v.schedule}
            onChange={(val) => onChange({ schedule: val })}
            options={SCHEDULE_OPTIONS}
            className="h-12"
          />
          {v.schedule === "later" && (
            <DatePicker
              name="scheduleDate"
              label={<>Schedule Date<Req /></>}
              placeholder="Select date"
              value={v.scheduleDate}
              onChange={(val) => onChange({ scheduleDate: val })}
              minDate={todayISO()}
              error={errors.scheduleDate}
            />
          )}
        </div>
      </section>

      {/* Supporting documents */}
      <section className={`${cardCls} sm:p-6`}>
        <div className="mb-4">
          <h3 className="text-base font-semibold text-heading sm:text-lg">Supporting Documents<Req /></h3>
          <p className="mt-0.5 text-xs text-body sm:text-sm">
            Upload the order form, clinical notes, insurance card or other files to send with the order.
          </p>
        </div>

        <FileDropzone title="files here" file={null} onChange={addFile} maxSizeMB={10} variant="attachment" />
        {errors.documents && <p role="alert" className="mt-2 text-sm text-danger">{errors.documents}</p>}

        <div className="mt-4">
          <h4 className="mb-2 text-sm font-semibold text-heading">Attached Documents ({v.documents.length})</h4>
          {v.documents.length > 0 ? (
            <ul className="max-h-72 divide-y divide-divider overflow-y-auto rounded-xl border border-border custom-scrollbar">
              {v.documents.map((d) => (
                <li key={d.id} className="flex items-center gap-3 px-3 py-3 sm:px-4">
                  <DocTile kind={d.kind} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-heading">{d.name}</p>
                    <p className="text-xs text-body">{d.size}</p>
                  </div>
                  <Tags text={d.category} tone="neutral" />
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
    </div>
  );
};

export default ImagingClinicalStep;
