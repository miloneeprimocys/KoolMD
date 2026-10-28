"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, Pencil } from "lucide-react";

import Breadcrumb from "@/components/Breadcrumb";
import Tags from "@/components/Tags";
import ImportButton from "@/components/ImportButton";
import TableStatus from "@/components/TableStatus";
import ErrorToast from "@/components/ErrorToast";

import PractitionerOverview, { type PractitionerOverviewData } from "./Practitioneroverview";
import PractitionerLicenses, { type PractitionerLicense } from "./Practitionerlicenses";
import PractitionerDocuments, { type PractitionerDocument } from "./Practitionerdocuments";

/* ---------- Sample data (replace with your API using the `id` query param) ---------- */
const SAMPLE_OVERVIEW: PractitionerOverviewData = {
  fullName: "Dr. Sarah Mitchell",
  dob: "05/14/1990 (34 yrs)",
  gender: "Female",
  providerType: "MD (Doctor of Medicine)",
  specialty: "Internal Medicine",
  npi: "1234567890",
  dea: "AB1234567",
  email: "sarah.mitchell@healthcare.com",
  phone: "(555) 123-4567",
  language: "English",
  address: "123 Main St, Apt 4B, San Jose, CA 95110",
  locations: [
    { name: "Main Clinic", type: "Primary" },
    { name: "Downtown Clinic", type: "Secondary" },
    { name: "Telemedicine", type: "Virtual" },
  ],
  workingDays: "Mon – Fri",
  appointmentDuration: "30 minutes",
};

const SAMPLE_LICENSES: PractitionerLicense[] = [
  { id: "l1", state: "CA", number: "A123456", issueDate: "2020-01-15", expiryDate: "2025-01-14", status: "Active" },
  { id: "l2", state: "TX", number: "B987654", issueDate: "2021-03-10", expiryDate: "2026-03-09", status: "Active" },
  { id: "l3", state: "NY", number: "C456789", issueDate: "2019-05-01", expiryDate: "2024-04-30", status: "Expiring Soon" },
];

const SAMPLE_DOCUMENTS: PractitionerDocument[] = [
  { id: "d1", fileName: "CA_License.pdf", type: "Medical License", uploadedAt: "2024-01-15" },
  { id: "d2", fileName: "DEA_Certificate.pdf", type: "DEA Certificate", uploadedAt: "2024-01-10" },
  { id: "d3", fileName: "NPI_Letter.pdf", type: "NPI Confirmation", uploadedAt: "2024-01-05" },
  { id: "d4", fileName: "Board_Certification.pdf", type: "Board Certification", uploadedAt: "2024-01-08" },
  { id: "d5", fileName: "CV_Resume.pdf", type: "CV / Resume", uploadedAt: "2024-01-02" },
  { id: "d6", fileName: "Background_Check.pdf", type: "Background Check", uploadedAt: "2024-01-02" },
  { id: "d7", fileName: "Liability_Insurance.pdf", type: "Professional Liability Insurance", uploadedAt: "2024-01-01" },
];

/* ---------- Tabs ---------- */
type TabKey = "overview" | "licenses" | "locations" | "credentials" | "appointments" | "history";

const TABS: { key: TabKey; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "licenses", label: "Licenses" },
  { key: "credentials", label: "Credentials" },
];

const initials = (name: string) =>
  name
    .replace(/^Dr\.?\s+/i, "")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");

/* ---------- "More" menu ---------- */
const MoreMenu = ({ onSelect }: { onSelect: (action: string) => void }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const items = ["Deactivate Practitioner", "Export Profile"];

  return (
    <div ref={ref} className="relative">
      <ImportButton
        text="More"
        icon={<ChevronDown className="h-4 w-4" />}
        onClick={() => setOpen((o) => !o)}
        className="whitespace-nowrap"
      />
      {open && (
        <div className="absolute right-0 top-full z-30 mt-1 w-52 rounded-lg border border-border bg-card py-1 shadow-lg">
          {items.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                setOpen(false);
                onSelect(item);
              }}
              className="flex w-full cursor-pointer items-center px-3 py-2 text-left text-sm text-heading transition-colors hover:bg-primary/5"
            >
              {item}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

/* ---------- Component ---------- */
const ViewPractitioner = () => {
  const router = useRouter();
  const practitionerId = useSearchParams().get("id"); // TODO: fetch the practitioner by this id

  const [tab, setTab] = useState<TabKey>("overview");
  const [licenses, setLicenses] = useState<PractitionerLicense[]>(SAMPLE_LICENSES);
  const [jurisdictions, setJurisdictions] = useState<string[]>(["CA", "TX", "NY"]);
  const [documents, setDocuments] = useState<PractitionerDocument[]>(SAMPLE_DOCUMENTS);
  const [errorMessage, setErrorMessage] = useState<{ title: string; message: string } | null>(null);

  const overview = SAMPLE_OVERVIEW;

  const viewDocument = (doc: PractitionerDocument) => {
    if (!doc.file) {
      // Sample / API-backed files: swap this for your download call.
      setErrorMessage({ title: "Preview unavailable", message: `${doc.fileName} can't be opened in this demo.` });
      return;
    }
    const url = URL.createObjectURL(doc.file);
    window.open(url, "_blank", "noopener,noreferrer");
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  };

  const handleMore = (action: string) => {
    // TODO: wire these to your API
    console.log(action, practitionerId);
  };

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-4 sm:space-y-5">
      <ErrorToast
        isOpen={errorMessage !== null}
        onClose={() => setErrorMessage(null)}
        title={errorMessage?.title ?? ""}
        message={errorMessage?.message ?? ""}
      />

      <Breadcrumb
        items={[
          { label: "Practitioners", href: "/practitioners" },
          { label: overview.fullName },
        ]}
      />

      {/* Summary card */}
      <div className="flex flex-col gap-3 rounded-[14px] border border-border bg-card p-3.5 sm:p-5 lg:flex-row lg:items-center lg:justify-between lg:gap-4">
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary sm:h-16 sm:w-16 sm:text-lg">
            {initials(overview.fullName)}
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-sm font-semibold text-heading sm:text-lg">{overview.fullName}</h2>
              <Tags text="Active" tone="success" />
            </div>
            <p className="mt-0.5 text-xs text-body sm:text-sm">
              {overview.providerType.split(" ")[0]}
              <span className="mx-1.5 text-border sm:mx-2">|</span>
              {overview.specialty}
              <span className="mx-1.5 text-border sm:mx-2">|</span>
              DEA: {overview.dea}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <ImportButton
            text="Edit"
            icon={<Pencil className="h-4 w-4" />}
            onClick={() => router.push(`/edit-practitioner?id=${practitionerId ?? ""}`)}
            className="whitespace-nowrap"
          />
          <ImportButton
            text="View Documents"
            icon={null}
            onClick={() => setTab("credentials")}
            className="whitespace-nowrap"
          />
          <MoreMenu onSelect={handleMore} />
        </div>
      </div>

      {/* Tabs */}
      <div
        role="tablist"
        aria-label="Practitioner sections"
        className="flex gap-4 overflow-x-auto border-b border-border hide-scrollbar sm:gap-6"
      >
        {TABS.map((t) => {
          const isActive = t.key === tab;
          return (
            <button
              key={t.key}
              role="tab"
              type="button"
              aria-selected={isActive}
              onClick={() => setTab(t.key)}
              className={`-mb-px cursor-pointer whitespace-nowrap border-b-2 px-1 pb-2.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 sm:pb-3 sm:text-sm ${
                isActive ? "border-primary text-primary" : "border-transparent text-body hover:text-heading"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Active tab */}
      <div role="tabpanel">
        {tab === "overview" && (
          <PractitionerOverview data={overview} onViewAllHours={() => setTab("locations")} />
        )}
        {tab === "licenses" && (
          <PractitionerLicenses
            licenses={licenses}
            jurisdictions={jurisdictions}
            onLicensesChange={setLicenses}
            onJurisdictionsChange={setJurisdictions}
          />
        )}
        {tab === "credentials" && (
          <PractitionerDocuments
            documents={documents}
            onDocumentsChange={setDocuments}
            onView={viewDocument}
            onError={(message) => setErrorMessage({ title: "Upload failed", message })}
          />
        )}
        {(tab === "locations" || tab === "appointments" || tab === "history") && (
          <div className="rounded-[14px] border border-border bg-card">
            <TableStatus
              variant="empty"
              message={`${TABS.find((t) => t.key === tab)?.label} isn't available yet.`}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewPractitioner;