"use client";

import React from "react";

import Tags from "@/components/Tags";
import EditButton from "@/components/EditButton";

/* ---------- Static data (replace with API data later) ---------- */
const PERSONAL: { label: string; value: string }[] = [
  { label: "Full Name", value: "Dr. Michael Brown" },
  { label: "Gender", value: "Male" },
  { label: "Date of Birth", value: "Apr 12, 1982 (42 years)" },
  { label: "Provider Type", value: "Physician (MD)" },
];
const SPECIALTIES = ["Internal Medicine", "Primary Care", "Preventive Care"];
const BIO =
  "Board-certified Internal Medicine physician with 10+ years of experience in Primary Care, Preventive Medicine and Chronic Disease Management.";

const PROFESSIONAL: { label: string; value: string }[] = [
  { label: "NPI Number", value: "1234567890" },
  { label: "DEA Number", value: "AB1234567" },
  { label: "State License", value: "MD123456 (California)" },
  { label: "Board Certification", value: "American Board of Internal Medicine" },
  { label: "Years of Experience", value: "10+ years" },
];
const LANGUAGES = ["English", "Spanish"];

const CONTACT: { label: string; value: string }[] = [
  { label: "Phone", value: "+1 415 555 0198" },
  { label: "Email", value: "michael.brown@sunrisehealth.com" },
  { label: "Address", value: "1234 Medical Center Dr, Suite 500, Los Angeles, CA 90025, USA" },
];

const PRACTICE: { label: string; value: string }[] = [
  { label: "Practice Name", value: "Sunrise Medical Group" },
  { label: "Practice Location", value: "Los Angeles, CA" },
  { label: "Department", value: "Internal Medicine" },
  { label: "Tax ID", value: "98-7654321" },
];

/* ---------- Small building blocks ---------- */
type CardProps = {
  title: string;
  onEdit?: (section: string) => void;
  children: React.ReactNode;
};

const Card = ({ title, onEdit, children }: CardProps) => (
  <section className="flex min-w-0 flex-1 flex-col rounded-[8px] border border-border/40 bg-card">
    <header className="flex items-center justify-between gap-3 px-4 py-3.5 sm:px-5 sm:py-4">
      <h3 className="text-sm font-semibold text-heading sm:text-base">{title}</h3>
      <EditButton section={title} onEdit={onEdit} />
    </header>
    <div className="px-4 pb-2 sm:px-5 sm:pb-3">{children}</div>
  </section>
);

/** Label above value on phones, label | value side by side from sm up. */
const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="grid grid-cols-1 gap-0.5 border-t border-divider py-3 first:border-t-0 first:pt-0 sm:grid-cols-[150px_minmax(0,1fr)] sm:items-start sm:gap-4">
    <dt className="text-xs text-body sm:text-sm">{label}</dt>
    <dd className="min-w-0 break-words text-sm font-medium text-heading">{children}</dd>
  </div>
);

const TagList = ({ items }: { items: string[] }) => (
  <div className="flex flex-wrap gap-2">
    {items.map((t) => (
      <Tags key={t} text={t} tone="info" />
    ))}
  </div>
);

/* ---------- Component ---------- */
type Props = {
  /** Called with the card title when a card's Edit button is clicked. */
  onEdit?: (section: string) => void;
  /** Profile photo URL. Falls back to initials when empty. */
  photoUrl?: string;
  /** Signature image URL. Falls back to the typed name when empty. */
  signatureUrl?: string;
};

const Overview = ({ onEdit, photoUrl, signatureUrl }: Props) => (
  <div className="grid grid-cols-1 gap-4 sm:gap-5 xl:grid-cols-2">
    {/* Left column */}
    <div className="flex min-w-0 flex-col gap-4 sm:gap-5">
      <Card title="Personal Information" onEdit={onEdit}>
        <dl>
          {PERSONAL.map((r) => (
            <Row key={r.label} label={r.label}>
              {r.value}
            </Row>
          ))}
          <Row label="Specialties">
            <TagList items={SPECIALTIES} />
          </Row>
          <Row label="Bio">
            <span className="font-normal leading-relaxed">{BIO}</span>
          </Row>
        </dl>
      </Card>

      <Card title="Professional Information" onEdit={onEdit}>
        <dl>
          {PROFESSIONAL.map((r) => (
            <Row key={r.label} label={r.label}>
              {r.value}
            </Row>
          ))}
          <Row label="Languages">
            <TagList items={LANGUAGES} />
          </Row>
        </dl>
      </Card>
    </div>

    {/* Right column */}
    <div className="flex min-w-0 flex-col gap-4 sm:gap-5">
      <Card title="Contact Information" onEdit={onEdit}>
        <dl>
          {CONTACT.map((r) => (
            <Row key={r.label} label={r.label}>
              {r.value}
            </Row>
          ))}
        </dl>
      </Card>

      <Card title="Practice Information" onEdit={onEdit}>
        <dl>
          {PRACTICE.map((r) => (
            <Row key={r.label} label={r.label}>
              {r.value}
            </Row>
          ))}
        </dl>
      </Card>

      <Card title="Profile Photo & Signature" onEdit={onEdit}>
        <div className="flex flex-col gap-4 pb-3 sm:flex-row sm:items-start">
          {/* Photo: always a square */}
          <div className="w-32 shrink-0">
            <div className="aspect-square w-full overflow-hidden rounded-xl border border-border bg-primary/10">
              {photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photoUrl} alt="Profile photo" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-3xl font-semibold text-primary">
                  MB
                </div>
              )}
            </div>
            <p className="mt-2 text-sm font-medium text-heading">Profile Photo</p>
            <p className="text-xs text-body">JPG, PNG (Max 2MB)</p>
          </div>

          {/* Signature: takes the remaining width */}
          <div className="min-w-0 flex-1">
            <div className="flex h-32 items-center justify-center overflow-hidden rounded-xl border border-dashed border-border bg-card p-3">
              {signatureUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={signatureUrl} alt="Digital signature" className="max-h-full max-w-full object-contain" />
              ) : (
                <span className="truncate font-serif text-2xl italic text-heading">Michael Brown</span>
              )}
            </div>
            <p className="mt-2 text-sm font-medium text-heading">Digital Signature</p>
            <p className="text-xs text-body">JPG, PNG (Max 2MB)</p>
          </div>
        </div>
      </Card>
    </div>
  </div>
);

export default Overview;