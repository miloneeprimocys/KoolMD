"use client";

import React, { useState } from "react";
import { CalendarClock, FileText, ShieldCheck, User, type LucideIcon } from "lucide-react";

import ImportButton from "@/components/ImportButton";
import EditButton from "@/components/EditButton";
import Tags, { type TagTone } from "@/components/Tags";

import type { BasicValues } from "./Basicinformation";
import {
  formatDate,
  getLicenseStatus,
  stateLabel,
  type LicenseValues,
} from "./Licensesjurisdictions";
import { formatTime, type LocationValues } from "./Locationsavailability";
import { REQUIRED_DOCS, type CredentialValues } from "./Credentialsdocuments";

/* ---------- Sections ---------- */
type SectionKey = "basic" | "licenses" | "locations" | "credentials";

const SECTIONS: { key: SectionKey; label: string; icon: LucideIcon; step: number }[] = [
  { key: "basic", label: "Basic Information", icon: User, step: 1 },
  { key: "licenses", label: "Licenses & Jurisdictions", icon: ShieldCheck, step: 2 },
  { key: "locations", label: "Locations & Availability", icon: CalendarClock, step: 3 },
  { key: "credentials", label: "Credentials & Documents", icon: FileText, step: 4 },
];

const LICENSE_TONES: Record<string, TagTone> = {
  Active: "success",
  "Expiring Soon": "warning",
  Expired: "danger",
};

/* ---------- Small building blocks ---------- */
const DetailRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="grid grid-cols-[minmax(0,140px)_minmax(0,1fr)] gap-3 py-2 text-sm sm:grid-cols-[180px_minmax(0,1fr)]">
    <dt className="text-body">{label}</dt>
    <dd className="min-w-0 break-words font-medium text-heading">{value || "—"}</dd>
  </div>
);

const DetailList = ({ children }: { children: React.ReactNode }) => (
  <dl className="divide-y divide-border rounded-xl border border-border px-4">{children}</dl>
);

const initialsOf = (first: string, last: string) =>
  `${first.trim().charAt(0)}${last.trim().charAt(0)}`.toUpperCase() || "—";

/* ---------- Component ---------- */
type Props = {
  basic: BasicValues;
  licenses: LicenseValues;
  locations: LocationValues;
  credentials: CredentialValues;
  /** Jump back to a step to edit it. */
  onEditStep: (step: number) => void;
};

const ReviewSubmit = ({ basic, licenses, locations, credentials, onEditStep }: Props) => {
  const [active, setActive] = useState<SectionKey>("basic");
  const current = SECTIONS.find((s) => s.key === active)!;

  const gender = basic.gender || "—";
  const providerShort = basic.providerType || "—";

  const renderBody = () => {
    switch (active) {
      case "basic":
        return (
          <>
            <div className="mb-4 flex items-center gap-4">
              <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xl font-semibold text-primary">
                {initialsOf(basic.firstName, basic.lastName)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-base font-semibold text-heading">
                  Dr. {basic.firstName} {basic.lastName}
                </p>
                <p className="truncate text-sm text-body">{providerShort}</p>
                <p className="truncate text-sm text-body">{basic.specialty || "—"}</p>
              </div>
              <Tags text="Active" tone="success" />
            </div>
            <DetailList>
              <DetailRow label="NPI Number" value={basic.npi} />
              <DetailRow label="DEA Number" value={basic.dea} />
              <DetailRow label="Date of Birth" value={formatDate(basic.dob)} />
              <DetailRow label="Gender" value={gender} />
              <DetailRow label="Email" value={basic.email} />
              <DetailRow label="Phone" value={basic.phone} />
              <DetailRow label="Preferred Language" value={basic.language} />
            </DetailList>
          </>
        );

      case "licenses":
        return (
          <div className="space-y-4">
            <DetailList>
              {licenses.licenses.length === 0 ? (
                <DetailRow label="State Licenses" value="None added" />
              ) : (
                licenses.licenses.map((l) => {
                  const status = getLicenseStatus(l.expiryDate);
                  return (
                    <DetailRow
                      key={l.id}
                      label={stateLabel(l.state)}
                      value={
                        <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                          <span>{l.number}</span>
                          <span className="text-xs font-normal text-body">
                            {formatDate(l.issueDate)} – {formatDate(l.expiryDate)}
                          </span>
                          <Tags text={status} tone={LICENSE_TONES[status]} size="xs" />
                        </span>
                      }
                    />
                  );
                })
              )}
            </DetailList>
            <DetailList>
              <DetailRow
                label="Telemedicine Jurisdictions"
                value={licenses.jurisdictions.length ? licenses.jurisdictions.map(stateLabel).join(", ") : ""}
              />
            </DetailList>
          </div>
        );

      case "locations":
        return (
          <div className="space-y-4">
            <DetailList>
              {locations.locations.map((l) => (
                <DetailRow
                  key={l.id}
                  label={l.name}
                  value={
                    <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span>{l.address}</span>
                      <span className="text-xs font-normal text-body">{l.type}</span>
                    </span>
                  }
                />
              ))}
            </DetailList>
            <DetailList>
              <DetailRow label="Working Days" value={locations.days.join(", ")} />
              <DetailRow
                label="Working Hours"
                value={`${formatTime(locations.startTime)} – ${formatTime(locations.endTime)}`}
              />
              <DetailRow label="Appointment Duration" value={locations.duration} />
            </DetailList>
          </div>
        );

      case "credentials":
        return (
          <DetailList>
            {REQUIRED_DOCS.map((d) => {
              const doc = credentials.docs[d.key];
              return (
                <DetailRow
                  key={d.key}
                  label={d.label}
                  value={
                    doc ? (
                      <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span>{doc.fileName}</span>
                        <Tags text="Uploaded" tone="success" size="xs" />
                      </span>
                    ) : (
                      <Tags text={d.required ? "Missing" : "Not provided"} tone={d.required ? "danger" : "neutral"} size="xs" />
                    )
                  }
                />
              );
            })}
          </DetailList>
        );
    }
  };

  return (
    <div className="grid items-start gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
      {/* Section nav */}
      <nav
        aria-label="Review sections"
        className="flex gap-2 overflow-x-auto rounded-[14px] border border-border bg-card p-2 lg:flex-col lg:overflow-visible"
      >
        {SECTIONS.map((s) => {
          const Icon = s.icon;
          const isActive = s.key === active;
          return (
            <button
              key={s.key}
              type="button"
              aria-current={isActive ? "true" : undefined}
              onClick={() => setActive(s.key)}
              className={`flex shrink-0 cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${
                isActive ? "bg-primary/10 font-semibold text-primary" : "text-heading hover:bg-primary/5"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="whitespace-nowrap">{s.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Section content */}
      <section className="min-w-0 rounded-[14px] border border-border bg-card p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-base font-semibold text-heading">{current.label}</h3>
          <EditButton
            section={current.key}
            onEdit={() => onEditStep(current.step)}
          />
        </div>
        {renderBody()}
      </section>
    </div>
  );
};

export default ReviewSubmit;