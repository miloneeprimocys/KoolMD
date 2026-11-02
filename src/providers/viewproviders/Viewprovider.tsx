"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import Breadcrumb from "@/components/Breadcrumb";
import Tags from "@/components/Tags";
import SuccessToast from "@/components/SuccessToast";
import ErrorToast from "@/components/ErrorToast";
import TableStatus from "@/components/TableStatus";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppHooks";
import { practitionerService } from "@/redux/services/practitionerService";
import { selectOrganizationLocations } from "@/redux/selectors/practitionerSelectors";
import {
  selectAddLicenseRequest,
  selectProviderDetail,
  selectUploadDocumentRequest,
} from "@/redux/selectors/providerDetailSelectors";
import { resetProviderMutations } from "@/redux/slices/providerDetailSlice";
import { fetchLocations } from "@/redux/thunks/practitionerThunks";
import {
  addProviderLicense,
  fetchProviderDetail,
  uploadProviderDocument,
} from "@/redux/thunks/providerDetailThunks";
import { toRequestError } from "@/redux/thunks/thunkHelpers";
import { saveBlobAsFile } from "@/utils/download";
import Overview from "./Overview";
import Licenses, { type LicenseRow } from "./ViewLicenses";
import Documents, { type DocumentRow } from "./Documents";
import History, { type VerificationRow } from "./History";
import RightSection, {
  type PanelState,
  type SavedLicensePayload,
  type SavedDocumentPayload,
} from "./Rightsection";
import {
  toDocumentRows,
  toLicenseRows,
  toLicenseTypeFromLabel,
  toProviderSummary,
  toVerificationRows,
} from "./providerDetailMappers";

/* ---------- Tabs ---------- */
type TabKey = "overview" | "licenses" | "documents" | "history";

const initials = (name: string) =>
  name
    .replace(/^Dr\.?\s+/i, "")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");

/** "California (CA)" → "CA"; "Federal (US)" → undefined (no state). */
const toStateCode = (stateLabel: string) => {
  const code = /\(([A-Z]{2})\)$/.exec(stateLabel)?.[1];
  return code && code !== "US" ? code : undefined;
};

type ToastState = { type: "success" | "error" | null; title: string; message: string };

/* ---------- Component ---------- */
const ViewProvider = () => {
  const dispatch = useAppDispatch();
  const providerId = useSearchParams().get("id");
  const providerDetail = useAppSelector(selectProviderDetail);
  const organizationLocations = useAppSelector(selectOrganizationLocations);
  const addLicenseRequest = useAppSelector(selectAddLicenseRequest);
  const uploadDocumentRequest = useAppSelector(selectUploadDocumentRequest);

  const [tab, setTab] = useState<TabKey>("overview");
  const [panel, setPanel] = useState<PanelState>(null);
  const [isPanelClosing, setIsPanelClosing] = useState(false);
  const [toast, setToast] = useState<ToastState>({ type: null, title: "", message: "" });

  /* The thunk skips repeat loads of the same provider; locations are a once-per-session catalog. */
  useEffect(() => {
    if (providerId) dispatch(fetchProviderDetail(providerId));
  }, [dispatch, providerId]);

  useEffect(() => {
    dispatch(fetchLocations());
  }, [dispatch]);

  useEffect(() => {
    if (panel) setIsPanelClosing(false);
  }, [panel]);

  useEffect(() => () => void dispatch(resetProviderMutations()), [dispatch]);

  /* Only use store data that belongs to the provider in the URL. */
  const isCurrentProvider = providerDetail.practitionerId === providerId;
  const practitioner = isCurrentProvider ? providerDetail.practitioner : null;
  const { licenses, documents } = providerDetail;

  const providerSummary = useMemo(
    () => (practitioner ? toProviderSummary(practitioner, licenses, organizationLocations) : null),
    [practitioner, licenses, organizationLocations],
  );
  const licenseRows = useMemo(() => toLicenseRows(licenses, documents), [licenses, documents]);
  const documentRows = useMemo(() => toDocumentRows(documents, licenses), [documents, licenses]);
  const verificationRows = useMemo(
    () => toVerificationRows(licenses, documents),
    [licenses, documents],
  );

  const providerName = providerSummary?.name ?? "Provider";

  const TABS: {
    key: TabKey;
    label: string;
    crumb: string;
    title: string;
    subtitle: string;
  }[] = useMemo(
    () => [
      {
        key: "overview",
        label: "Overview",
        crumb: "Profile",
        title: "Provider Profile",
        subtitle: "View and manage provider information, licenses, documents and availability.",
      },
      {
        key: "licenses",
        label: "Licenses & Certifications",
        crumb: "License Management",
        title: "Provider License Management",
        subtitle: `Manage professional licenses, certifications and credentials for ${providerName}.`,
      },
      {
        key: "documents",
        label: "Documents",
        crumb: "Documents",
        title: "Provider Documents",
        subtitle: `Manage and store important documents for ${providerName}.`,
      },
      {
        key: "history",
        label: "Verification History",
        crumb: "Verification History",
        title: "Verification History",
        subtitle: `Track the status and history of all credential and license verifications for ${providerName}.`,
      },
    ],
    [providerName],
  );

  const active = TABS.find((t) => t.key === tab)!;

  const changeTab = (key: TabKey) => {
    setTab(key);
    setPanel(null);
  };

  const closePanel = useCallback(() => {
    setIsPanelClosing(false);
    setPanel(null);
  }, []);

  const openVerification = useCallback(
    (row: VerificationRow) => setPanel({ type: "verification", row }),
    [],
  );

  /* License row → its verification record (same id). */
  const handleViewLicense = useCallback(
    (license: LicenseRow) => {
      const verificationRow = verificationRows.find((row) => row.id === license.id);
      if (verificationRow) setPanel({ type: "verification", row: verificationRow });
    },
    [verificationRows],
  );

  /* Document row → the license it proves, or a file-only record. */
  const handleViewDocument = useCallback(
    (documentRow: DocumentRow) => {
      const linkedLicense = licenses.find((license) => license.documentId === documentRow.id);
      const verificationRow = linkedLicense
        ? verificationRows.find((row) => row.id === linkedLicense.id)
        : undefined;
      setPanel({
        type: "verification",
        row: verificationRow ?? {
          id: documentRow.id,
          name: documentRow.name,
          sub: documentRow.file,
          type: documentRow.type,
          submittedOn: documentRow.uploadedOn,
          verifiedOn: "—",
          status: "In Progress",
          statusTone: "neutral",
          verifiedBy: "—",
          nextRenewal: documentRow.expiryDate,
          iconTone: documentRow.iconTone,
          detail: {
            documentType: documentRow.type,
            licenseNumber: "—",
            jurisdiction: "—",
            issuedDate: documentRow.issuedOn,
            expirationDate: documentRow.expiryDate,
            verifiedBy: "—",
            method: "Credential file",
            notes: documentRow.notes ?? "—",
            fileName: documentRow.file,
            fileSize: documentRow.fileSize ?? "—",
            documentId: documentRow.id,
            timeline: [{ label: "Uploaded", date: documentRow.uploadedOn }],
          },
        },
      });
    },
    [licenses, verificationRows],
  );

  const handleSaveLicense = async (data: SavedLicensePayload): Promise<boolean> => {
    if (!providerId) return false;
    const { licenseType, defaultIssuingAuthority } = toLicenseTypeFromLabel(data.type);
    const saveResult = await dispatch(
      addProviderLicense({
        practitionerId: providerId,
        file: data.file,
        license: {
          licenseType,
          licenseNumber: data.number.trim().toUpperCase().replace(/\s+/g, ""),
          stateCode: toStateCode(data.state),
          issuingAuthority: data.authority.trim() || defaultIssuingAuthority,
          issueDate: data.issue || undefined,
          expirationDate: data.expiry,
        },
      }),
    );
    if (addProviderLicense.fulfilled.match(saveResult)) {
      setToast({
        type: "success",
        title: "License Saved",
        message: `${data.type} (#${data.number}) was added and is awaiting verification.`,
      });
      return true;
    }
    if (saveResult.payload) {
      setToast({ type: "error", title: "Could not save license", message: saveResult.payload.message });
    }
    return false;
  };

  const handleSaveDocument = async (data: SavedDocumentPayload): Promise<boolean> => {
    if (!providerId || !data.file) return false;
    const uploadResult = await dispatch(
      uploadProviderDocument({
        practitionerId: providerId,
        category: data.type === "License" ? "LICENSE" : "PRACTITIONER_CREDENTIAL",
        file: data.file,
      }),
    );
    if (uploadProviderDocument.fulfilled.match(uploadResult)) {
      setToast({
        type: "success",
        title: "Document Uploaded",
        message: `${data.file.name} was added to the provider's documents.`,
      });
      return true;
    }
    if (uploadResult.payload) {
      setToast({ type: "error", title: "Could not upload document", message: uploadResult.payload.message });
    }
    return false;
  };

  /* Files are served only to authorised staff — fetched with the session, then saved locally. */
  const handleDownloadDocument = useCallback(
    async (documentId: string) => {
      if (!providerId) return;
      try {
        const { blob, fileName } = await practitionerService.downloadDocument(providerId, documentId);
        const knownName = documents.find((document) => document.id === documentId)?.originalFileName;
        saveBlobAsFile(blob, fileName ?? knownName ?? "document");
      } catch (error) {
        setToast({ type: "error", title: "Download failed", message: toRequestError(error).message });
      }
    },
    [providerId, documents],
  );

  const closeToast = () => setToast((previous) => ({ ...previous, type: null }));

  /* ---------- Page states ---------- */
  const renderPageState = (content: React.ReactNode) => (
    <div className="mx-auto w-full max-w-[1600px] space-y-4">
      <Breadcrumb items={[{ label: "Providers", href: "/providers" }, { label: "Provider" }]} />
      <div className="rounded-[14px] border border-border bg-card">{content}</div>
    </div>
  );

  if (!providerId) {
    return renderPageState(
      <TableStatus variant="empty" message="No provider selected. Open a provider from the Providers list." />,
    );
  }
  if (isCurrentProvider && providerDetail.status === "failed" && !practitioner) {
    const isNotFound = providerDetail.error?.status === 404 || providerDetail.error?.status === 400;
    return renderPageState(
      <div>
        <TableStatus
          variant="error"
          message={isNotFound ? "This provider does not exist." : providerDetail.error?.message}
          onRetry={isNotFound ? undefined : () => dispatch(fetchProviderDetail(providerId))}
        />
        <p className="pb-6 text-center text-sm">
          <Link href="/providers" className="font-semibold text-link hover:underline">
            Back to Providers
          </Link>
        </p>
      </div>,
    );
  }
  if (!practitioner || !providerSummary) {
    return renderPageState(<TableStatus variant="loading" message="Loading provider…" />);
  }

  return (
    <div className="relative w-full">
      <SuccessToast
        isOpen={toast.type === "success"}
        onClose={closeToast}
        title={toast.title}
        message={toast.message}
      />
      <ErrorToast
        isOpen={toast.type === "error"}
        onClose={closeToast}
        title={toast.title}
        message={toast.message}
      />

      {/* Main content — smoothly gives margin/space to the right panel when docked on 2xl+ */}
      <div
        className={`mx-auto min-w-0 w-full max-w-[1600px] space-y-4 sm:space-y-5 transition-all duration-300 ease-out ${
          panel && !isPanelClosing ? "2xl:pr-[460px]" : ""
        }`}
      >
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: "Providers", href: "/providers" },
            {
              label: providerSummary.name,
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
              {initials(providerSummary.name)}
            </span>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-heading transition-colors duration-200 group-hover:text-primary sm:text-lg">
                {providerSummary.name}
                {providerSummary.credential ? `, ${providerSummary.credential}` : ""}
              </h3>
              <p className="text-xs text-body sm:text-sm">{providerSummary.specialty} • {providerSummary.clinic}</p>
              <p className="mt-0.5 text-xs text-body sm:text-sm">
                NPI: {providerSummary.npi}
                <span className="mx-1.5 text-border sm:mx-2">|</span>
                DEA: {providerSummary.dea}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-6">
            <Tags text={providerSummary.status} tone={providerSummary.statusTone} />
          
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
          {tab === "overview" && <Overview />}
          {tab === "licenses" && (
            <Licenses
              items={licenseRows}
              onAddLicense={() => setPanel({ type: "license" })}
              onViewLicense={handleViewLicense}
            />
          )}
          {tab === "documents" && (
            <Documents
              items={documentRows}
              onUploadDocument={() => setPanel({ type: "document" })}
              onViewDocument={handleViewDocument}
            />
          )}
          {tab === "history" && (
            <History
              items={verificationRows}
              selectedId={panel?.type === "verification" ? panel.row.id : null}
              onSelect={openVerification}
            />
          )}
        </div>
      </div>

      {/* Right section drawer: touches right, top, bottom margins with scrollable content */}
      <RightSection
        panel={panel}
        provider={providerSummary}
        onClose={closePanel}
        onCloseStart={() => setIsPanelClosing(true)}
        onSaveLicense={handleSaveLicense}
        onSaveDocument={handleSaveDocument}
        onDownloadDocument={handleDownloadDocument}
        isSaving={addLicenseRequest.status === "pending" || uploadDocumentRequest.status === "pending"}
      />
    </div>
  );
};

export default ViewProvider;