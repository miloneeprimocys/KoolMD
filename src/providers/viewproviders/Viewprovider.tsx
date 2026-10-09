"use client";

import React, { useCallback, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import Breadcrumb from "@/components/Breadcrumb";
import Tags from "@/components/Tags";
import SuccessToast from "@/components/SuccessToast";

import {
  PROVIDERS,
  type ProviderRow,
} from "@/providers/viewproviders/providerMockData";
import Licenses, {
  INITIAL_LICENSES,
  type LicenseRow,
} from "./ViewLicenses";
import Documents, {
  INITIAL_DOCUMENTS,
  type DocumentRow,
} from "./Documents";
import History, {
  INITIAL_VERIFICATIONS,
  type VerificationRow,
} from "./History";
import RightSection, {
  type PanelState,
  type SavedLicensePayload,
  type SavedDocumentPayload,
} from "./Rightsection";

/* ---------- Tabs ---------- */
type TabKey = "licenses" | "documents" | "history";

const initials = (name: string) =>
  name
    .replace(/^Dr\.?\s+/i, "")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");

/* ---------- Component ---------- */
const ViewProvider = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const providerId = searchParams?.get("id");

  // Dynamically resolve provider from query param
  const activeProvider: ProviderRow = React.useMemo(() => {
    if (!providerId) return PROVIDERS[0];
    const found = PROVIDERS.find(
      (p) => p.npi === providerId || p.name === providerId
    );
    return found || PROVIDERS[0];
  }, [providerId]);

  const [tab, setTab] = useState<TabKey>("licenses");
  const [panel, setPanel] = useState<PanelState>(null);
  const [toast, setToast] = useState({ open: false, title: "", message: "" });

  const TABS: {
    key: TabKey;
    label: string;
    crumb: string;
    title: string;
    subtitle: string;
  }[] = React.useMemo(
    () => [
      {
        key: "licenses",
        label: "Licenses & Certifications",
        crumb: "License Management",
        title: "Provider License Management",
        subtitle: `Manage professional licenses, certifications and credentials for ${activeProvider.name}.`,
      },
      {
        key: "documents",
        label: "Documents",
        crumb: "Documents",
        title: "Provider Documents",
        subtitle: `Manage and store important documents for ${activeProvider.name}.`,
      },
      {
        key: "history",
        label: "Verification History",
        crumb: "Verification History",
        title: "Verification History",
        subtitle: `Track the status and history of all credential and license verifications for ${activeProvider.name}.`,
      },
    ],
    [activeProvider.name]
  );

  // Shared state across all 3 tabs
  const [licenses, setLicenses] = useState<LicenseRow[]>(INITIAL_LICENSES);
  const [documents, setDocuments] = useState<DocumentRow[]>(INITIAL_DOCUMENTS);
  const [verifications, setVerifications] = useState<VerificationRow[]>(
    INITIAL_VERIFICATIONS
  );

  const active = TABS.find((t) => t.key === tab)!;

  const changeTab = (key: TabKey) => {
    setTab(key);
    setPanel(null);
  };

  const closePanel = useCallback(() => setPanel(null), []);

  const openVerification = useCallback(
    (row: VerificationRow) => setPanel({ type: "verification", row }),
    []
  );

  // View details for a license from the Licenses tab
  const handleViewLicense = useCallback(
    (lic: LicenseRow) => {
      // Find matching verification or build one
      const existing = verifications.find(
        (v) =>
          v.name.toLowerCase().includes(lic.type.toLowerCase()) ||
          v.sub.toLowerCase().includes(lic.number.toLowerCase())
      );

      if (existing) {
        setPanel({ type: "verification", row: existing });
      } else {
        const fallback: VerificationRow = {
          id: `v_${lic.id}`,
          name: `${lic.type} - ${lic.state}`,
          sub: `License #${lic.number}`,
          type: lic.type,
          submittedOn: lic.issueDate,
          verifiedOn: lic.issueDate,
          status: lic.status === "Active" ? "Verified" : "In Progress",
          statusTone: lic.statusTone,
          verifiedBy: lic.authority || "State Board",
          nextRenewal: lic.expiryDate,
          iconTone: lic.iconTone === "green" ? "green" : "blue",
          detail: {
            documentType: lic.type,
            licenseNumber: lic.number,
            jurisdiction: `${lic.state} ${lic.stateCode}`.trim(),
            issuedDate: lic.issueDate,
            expirationDate: lic.expiryDate,
            verifiedBy: lic.authority || "State Board",
            method: "Online Verification (NPI/State Board)",
            notes: lic.notes || "License verified and active in system records.",
            fileName: lic.fileName || `${lic.type.toLowerCase().replace(/[^a-z0-9]+/g, "_")}.pdf`,
            fileSize: lic.fileSize || "2.0 MB",
            timeline: [
              { label: "Document Submitted", date: `${lic.issueDate} 10:30 AM` },
              { label: "Under Review", date: `${lic.issueDate} 02:15 PM` },
              { label: "Verified", date: `${lic.issueDate} 04:45 PM` },
            ],
          },
        };
        setPanel({ type: "verification", row: fallback });
      }
    },
    [verifications]
  );

  // View details for a document from the Documents tab
  const handleViewDocument = useCallback(
    (doc: DocumentRow) => {
      const existing = verifications.find(
        (v) =>
          v.name.toLowerCase().includes(doc.name.toLowerCase()) ||
          v.sub.toLowerCase().includes(doc.file.toLowerCase())
      );

      if (existing) {
        setPanel({ type: "verification", row: existing });
      } else {
        const fallback: VerificationRow = {
          id: `v_${doc.id}`,
          name: doc.name,
          sub: doc.file,
          type: doc.type,
          submittedOn: doc.uploadedOn,
          verifiedOn: doc.uploadedOn,
          status: doc.status === "Active" ? "Verified" : "In Progress",
          statusTone: doc.statusTone,
          verifiedBy: "Admin Verification",
          nextRenewal: doc.expiryDate,
          iconTone: doc.iconTone,
          detail: {
            documentType: doc.type,
            licenseNumber: "N/A",
            jurisdiction: "Federal (US)",
            issuedDate: doc.issuedOn,
            expirationDate: doc.expiryDate,
            verifiedBy: "Admin Verification",
            method: "Document Upload Verification",
            notes: doc.notes || "Document verified and stored securely in provider credentials.",
            fileName: doc.file,
            fileSize: doc.fileSize || "1.8 MB",
            timeline: [
              { label: "Document Submitted", date: `${doc.uploadedOn} 09:00 AM` },
              { label: "Under Review", date: `${doc.uploadedOn} 11:30 AM` },
              { label: "Verified", date: `${doc.uploadedOn} 03:20 PM` },
            ],
          },
        };
        setPanel({ type: "verification", row: fallback });
      }
    },
    [verifications]
  );

  // Save new license from RightSection
  const handleSaveLicense = (data: SavedLicensePayload) => {
    const today = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const stateClean = data.state.replace(/\s*\([^)]*\)/, "");
    const stateCode = data.state.match(/\(([^)]+)\)/)?.[0] || "";
    const fileName = data.file ? data.file.name : `${data.type.toLowerCase().replace(/[^a-z0-9]+/g, "_")}.pdf`;
    const fileSize = data.file ? `${(data.file.size / (1024 * 1024)).toFixed(1)} MB` : "2.0 MB";

    const newLicense: LicenseRow = {
      id: `lic_${Date.now()}`,
      type: data.type,
      subType: data.authority || "Physician License",
      number: data.number,
      state: stateClean,
      stateCode: stateCode,
      issueDate: data.issue || today,
      expiryDate: data.expiry || "-",
      status: "Active",
      statusTone: "success",
      iconTone: "blue",
      authority: data.authority,
      notes: data.notes,
      fileName,
      fileSize,
    };

    setLicenses((prev) => [newLicense, ...prev]);

    // Add to Verification History list as well!
    const newVerification: VerificationRow = {
      id: `v_${Date.now()}`,
      name: `${data.type} - ${stateClean}`,
      sub: `License #${data.number}`,
      type: data.type,
      submittedOn: data.issue || today,
      verifiedOn: today,
      status: "Verified",
      statusTone: "success",
      verifiedBy: data.authority || "State Board",
      nextRenewal: data.expiry || "-",
      iconTone: "blue",
      detail: {
        documentType: data.type,
        licenseNumber: data.number,
        jurisdiction: data.state,
        issuedDate: data.issue || today,
        expirationDate: data.expiry || "-",
        verifiedBy: data.authority || "State Board",
        method: "Online Verification (NPI/State Board)",
        notes: data.notes || "License verified and active. No restrictions found.",
        fileName,
        fileSize,
        timeline: [
          { label: "Document Submitted", date: `${data.issue || today} 10:00 AM` },
          { label: "Under Review", date: `${today} 10:30 AM` },
          { label: "Verified", date: `${today} 11:15 AM` },
        ],
      },
    };

    setVerifications((prev) => [newVerification, ...prev]);

    setToast({
      open: true,
      title: "License Saved Successfully",
      message: `${data.type} (#${data.number}) has been saved and verified in the records.`,
    });
  };

  // Upload new document from RightSection
  const handleSaveDocument = (data: SavedDocumentPayload) => {
    const today = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const fileName = data.file ? data.file.name : `${data.name.toLowerCase().replace(/[^a-z0-9]+/g, "_")}.pdf`;
    const fileSize = data.file ? `${(data.file.size / (1024 * 1024)).toFixed(1)} MB` : "1.8 MB";

    let category: DocumentRow["category"] = "Others";
    if (data.type.includes("License") || data.type.includes("DEA")) category = "Medical";
    else if (data.type.includes("Certification")) category = "Certifications";
    else if (data.type.includes("Education")) category = "Education";
    else if (data.type.includes("Identification")) category = "Identification";

    const newDocument: DocumentRow = {
      id: `doc_${Date.now()}`,
      name: data.name,
      file: fileName,
      type: data.type,
      category,
      issuedOn: data.issue || today,
      expiryDate: data.expiry || "-",
      status: "Active",
      statusTone: "success",
      uploadedOn: today,
      iconTone: "blue",
      notes: data.notes,
      fileSize,
    };

    setDocuments((prev) => [newDocument, ...prev]);

    // Add to Verification History list as well!
    const newVerification: VerificationRow = {
      id: `v_${Date.now()}`,
      name: data.name,
      sub: fileName,
      type: data.type,
      submittedOn: data.issue || today,
      verifiedOn: today,
      status: "Verified",
      statusTone: "success",
      verifiedBy: "Admin Verification",
      nextRenewal: data.expiry || "-",
      iconTone: "blue",
      detail: {
        documentType: data.type,
        licenseNumber: "N/A",
        jurisdiction: "Federal (US)",
        issuedDate: data.issue || today,
        expirationDate: data.expiry || "-",
        verifiedBy: "Admin Verification",
        method: "Credential File Review",
        notes: data.notes || "Document verified and stored securely in provider records.",
        fileName,
        fileSize,
        timeline: [
          { label: "Document Submitted", date: `${today} 10:00 AM` },
          { label: "Under Review", date: `${today} 10:15 AM` },
          { label: "Verified", date: `${today} 11:00 AM` },
        ],
      },
    };

    setVerifications((prev) => [newVerification, ...prev]);

    setToast({
      open: true,
      title: "Document Uploaded Successfully",
      message: `${data.name} has been uploaded and added to provider documents and verification history.`,
    });
  };

  return (
    <div className="relative w-full">
      <SuccessToast
        isOpen={toast.open}
        onClose={() => setToast((p) => ({ ...p, open: false }))}
        title={toast.title}
        message={toast.message}
      />

      {/* Main content — smoothly gives margin/space to the right panel when docked on 2xl+ */}
      <div
        className={`mx-auto min-w-0 w-full max-w-[1600px] space-y-4 sm:space-y-5 transition-all duration-300 ${
          panel ? "2xl:pr-[460px]" : ""
        }`}
      >
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: "Providers", href: "/providers" },
            {
              label: activeProvider.name,
              onClick: () => setPanel({ type: "profile" }),
            },
            { label: active.crumb },
          ]}
        />

        {/* Title */}
        <div>
          <h2 className="text-base font-semibold text-heading sm:text-xl 2xl:text-2xl">
            {active.title}
          </h2>
          <p className="mt-0.5 text-xs text-body sm:text-sm">{active.subtitle}</p>
        </div>

        {/* Provider summary card */}
        <div className="flex flex-col gap-3 rounded-[14px] border border-border bg-card p-3.5 sm:flex-row sm:items-center sm:justify-between sm:p-5 sm:gap-4">
          <div
            className="flex items-center gap-3 sm:gap-4 cursor-pointer group"
            onClick={() => setPanel({ type: "profile" })}
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary transition-transform duration-200 group-hover:scale-105 group-hover:ring-4 group-hover:ring-primary/20 sm:h-16 sm:w-16 sm:text-lg">
              {initials(activeProvider.name)}
            </span>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-heading transition-colors duration-200 group-hover:text-primary sm:text-lg">
                {activeProvider.name}, {activeProvider.credential}
              </h3>
              <p className="text-xs text-body sm:text-sm">{activeProvider.specialty} • {activeProvider.clinic}</p>
              <p className="mt-0.5 text-xs text-body sm:text-sm">
                NPI: {activeProvider.npi}
                <span className="mx-1.5 text-border sm:mx-2">|</span>
                DEA: {activeProvider.dea}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-6">
            <Tags text={activeProvider.status} tone={activeProvider.statusTone || "success"} />
          
          </div>
        </div>

        {/* Tabs */}
        <div
          role="tablist"
          aria-label="Provider sections"
          className="flex gap-4 sm:gap-6 overflow-x-auto border-b border-border hide-scrollbar"
        >
          {TABS.map((t) => {
            const isActive = t.key === tab;
            return (
              <button
                key={t.key}
                role="tab"
                type="button"
                aria-selected={isActive}
                onClick={() => changeTab(t.key)}
                className={`-mb-px whitespace-nowrap border-b-2 px-1 pb-2.5 sm:pb-3 text-xs sm:text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 cursor-pointer ${
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-body hover:text-heading"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Active tab */}
        <div role="tabpanel">
          {tab === "licenses" && (
            <Licenses
              items={licenses}
              onAddLicense={() => setPanel({ type: "license" })}
              onViewLicense={handleViewLicense}
            />
          )}
          {tab === "documents" && (
            <Documents
              items={documents}
              onUploadDocument={() => setPanel({ type: "document" })}
              onViewDocument={handleViewDocument}
            />
          )}
          {tab === "history" && (
            <History
              items={verifications}
              selectedId={panel?.type === "verification" ? panel.row.id : null}
              onSelect={openVerification}
            />
          )}
        </div>
      </div>

      {/* Right section drawer: touches right, top, bottom margins with scrollable content */}
      <RightSection
        panel={panel}
        provider={activeProvider}
        onClose={closePanel}
        onSaveLicense={handleSaveLicense}
        onSaveDocument={handleSaveDocument}
      />
    </div>
  );
};

export default ViewProvider;