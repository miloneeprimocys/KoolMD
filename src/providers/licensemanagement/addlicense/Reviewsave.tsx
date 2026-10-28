"use client";

import React, { useEffect, useMemo, useState } from "react";
import { FileText } from "lucide-react";

import Tags from "@/components/Tags";
import EditButton from "@/components/EditButton";
import MaximizeImage from "@/components/MaximizeImage";
import { SectionCard } from "../../Shared";
import {
  PROVIDERS,
  STATUS_TONES,
  fmtDate,
  stateLabel,
  type LicenseValues,
} from "./Licenseinformation";
import type { DocumentValues } from "./Supportingdocuments";
import type { VerificationValues } from "./Licenseverification";

/* ---------- Types ---------- */
export type LicenseDetailsData = {
  provider: { name: string; providerType: string; specialty: string; npi: string; dea: string; status: string };
  state: string; // display text, e.g. "California (CA)"
  licenseNumber: string;
  licenseType: string;
  issueDate: string; // yyyy-mm-dd
  expiryDate: string; // yyyy-mm-dd
  status: string;
  verificationStatus: string;
  licenseSource: string;
  lastVerifiedOn?: string; // yyyy-mm-dd
  notes: string;
  document?: { name: string; uploadedOn: string; previewUrl?: string; mimeType?: string };
};

const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="grid grid-cols-1 gap-0.5 py-1.5 sm:grid-cols-[150px_minmax(0,1fr)] sm:gap-4">
    <dt className="text-xs text-body sm:text-sm">{label}</dt>
    <dd className="min-w-0 break-words text-sm font-medium text-heading">{children}</dd>
  </div>
);

/* ---------- Reusable details layout (Review step + ViewLicense) ---------- */
type DetailsProps = {
  data: LicenseDetailsData;
  /** Rendered under the license document (e.g. verification timeline in ViewLicense). */
  below?: React.ReactNode;
  /** Replaces the right-aligned header action of the provider block. */
  action?: React.ReactNode;
};

export const LicenseDetails = ({ data: d, below, action }: DetailsProps) => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [zoom, setZoom] = useState(100);
  const initials = d.provider.name
    .replace(/^Dr\.\s*/i, "")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
      <MaximizeImage
        open={previewOpen && Boolean(d.document?.previewUrl)}
        onClose={() => setPreviewOpen(false)}
        title={d.document?.name ?? "License document"}
        zoom={zoom}
        onZoomChange={setZoom}
        onDownload={() => {
          if (!d.document?.previewUrl) return;
          const anchor = document.createElement("a");
          anchor.href = d.document.previewUrl;
          anchor.download = d.document.name;
          anchor.click();
        }}
      >
        {d.document?.previewUrl &&
          (d.document.mimeType === "application/pdf" ? (
            <iframe
              src={d.document.previewUrl}
              title={d.document.name}
              className="h-full min-h-[70vh] w-full rounded-lg border-0 bg-white"
              style={{ transform: `scale(${zoom / 100})`, transformOrigin: "center" }}
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={d.document.previewUrl}
              alt={d.document.name}
              className="max-h-full max-w-full object-contain transition-transform"
              style={{ transform: `scale(${zoom / 100})` }}
            />
          ))}
      </MaximizeImage>
      {/* Left */}
      <div className="min-w-0 rounded-xl border border-border bg-card p-4 sm:p-5">
        <h4 className="mb-3 text-sm font-semibold text-heading sm:text-base">Provider Information</h4>
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-base font-semibold text-primary">
            {initials}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-base font-semibold text-heading">{d.provider.name}</p>
            <p className="text-xs text-body">
              {d.provider.providerType} | {d.provider.specialty}
            </p>
            <p className="text-xs text-body">
              NPI: {d.provider.npi} | DEA: {d.provider.dea}
            </p>
          </div>
          {action ?? <Tags text={d.provider.status} tone={STATUS_TONES[d.provider.status] ?? "neutral"} />}
        </div>

        <h4 className="mb-2 mt-6 text-sm font-semibold text-heading sm:text-base">License Information</h4>
        <dl className="divide-y divide-divider">
          <Row label="State">{d.state}</Row>
          <Row label="License Number">{d.licenseNumber}</Row>
          <Row label="License Type">{d.licenseType}</Row>
          <Row label="Issue Date">{fmtDate(d.issueDate)}</Row>
          <Row label="Expiry Date">{fmtDate(d.expiryDate)}</Row>
          <Row label="Status">
            <Tags text={d.status} tone={STATUS_TONES[d.status] ?? "neutral"} />
          </Row>
          <Row label="Verification Status">
            <Tags text={d.verificationStatus} tone={STATUS_TONES[d.verificationStatus] ?? "neutral"} />
          </Row>
          <Row label="License Source">{d.licenseSource || "—"}</Row>
          <Row label="Last Verified On">{fmtDate(d.lastVerifiedOn)}</Row>
          <Row label="Notes">{d.notes || "—"}</Row>
        </dl>
      </div>

      {/* Right */}
      <div className="flex min-w-0 flex-col gap-4">
        <div className="rounded-xl border border-border bg-card p-3">
          <h4 className="mb-2 px-1 text-sm font-semibold text-heading">License Document</h4>
          <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-lg border border-border bg-surface-start/40">
            {d.document?.previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={d.document.previewUrl} alt="License preview" className="h-full w-full object-cover" />
            ) : (
              <FileText className="h-12 w-12 text-body" />
            )}
          </div>
          {d.document && (
            <div className="mt-3 flex items-center justify-between gap-3 px-1">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-heading">{d.document.name}</p>
                <p className="text-xs text-body">Uploaded on {fmtDate(d.document.uploadedOn)}</p>
              </div>
              <button
                type="button"
                disabled={!d.document.previewUrl}
                onClick={() => {
                  setZoom(100);
                  setPreviewOpen(true);
                }}
                className="cursor-pointer text-sm font-medium text-primary hover:underline disabled:cursor-not-allowed disabled:opacity-50"
              >
                View
              </button>
            </div>
          )}
        </div>
        {below}
      </div>
    </div>
  );
};

/* ---------- Step 4 ---------- */
type Props = {
  license: LicenseValues;
  docs: DocumentValues;
  verification: VerificationValues;
  onEditStep: (step: number) => void;
};

const ReviewSave = ({ license, docs, verification, onEditStep }: Props) => {
  const doc = docs.docs.find((x) => x.type === "License Certificate") ?? docs.docs[0];

  const previewUrl = useMemo(() => (doc?.file ? URL.createObjectURL(doc.file) : undefined), [doc]);

  useEffect(() => {
    if (!previewUrl) return;
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const provider = PROVIDERS.find((p) => p.id === license.providerId) ?? PROVIDERS[0];

  const data: LicenseDetailsData = {
    provider: { ...provider, status: license.status },
    state: stateLabel(license.state),
    licenseNumber: license.licenseNumber,
    licenseType: license.licenseType,
    issueDate: license.issueDate,
    expiryDate: license.expiryDate,
    status: license.status,
    verificationStatus: verification.verificationStatus,
    licenseSource: verification.licenseSource,
    lastVerifiedOn: verification.verifiedOn,
    notes: license.notes,
    document: doc
      ? { name: doc.name, uploadedOn: doc.uploadedDate, previewUrl, mimeType: doc.file?.type }
      : undefined,
  };

  return (
    <SectionCard step={4} title="License Details" subtitle="Review the information before saving.">
      <LicenseDetails
        data={data}
        action={<EditButton section="License Details" onEdit={() => onEditStep(1)} />}
      />
    </SectionCard>
  );
};

export default ReviewSave;
