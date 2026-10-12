import { parsePhoneNumberFromString } from "libphonenumber-js";
import { State } from "country-state-city";
import type { TagTone } from "@/components/Tags";
import type {
  LicenseType,
  OrganizationLocation,
  Practitioner,
  PractitionerDocument,
  PractitionerLicense,
  PractitionerOnboardingStatus,
} from "@/types/practitioner";
import { formatDateOnly } from "@/utils/formatters";
import type { DocumentRow } from "./Documents";
import type { VerificationRow, VerificationStatus } from "./History";
import type { LicenseRow } from "./ViewLicenses";

/** Licenses expiring within this many days are flagged "Expiring Soon". */
const EXPIRING_SOON_DAYS = 60;

const NOT_AVAILABLE = "—";

/* ---------------------------------------------------------------- */
/*  Labels                                                          */
/* ---------------------------------------------------------------- */
/** Backend license type → label used in the tables, filters and the Add License form. */
export const LICENSE_TYPE_LABELS: Record<LicenseType, string> = {
  STATE_MEDICAL: "State Medical License",
  DEA: "DEA Registration",
  STATE_CONTROLLED_SUBSTANCE: "State Controlled Substance",
  BOARD_CERTIFICATION: "Board Certification",
  OTHER: "Other Credential",
};

/** Life-support courses are stored as OTHER with the course name as issuing authority. */
const OTHER_CREDENTIAL_LABELS = ["BLS Certification", "ACLS Certification", "PALS Certification"];

export function getLicenseTypeLabel(license: Pick<PractitionerLicense, "licenseType" | "issuingAuthority">) {
  if (license.licenseType === "OTHER") {
    const courseLabel = OTHER_CREDENTIAL_LABELS.find((label) =>
      license.issuingAuthority?.toUpperCase().startsWith(label.split(" ")[0]),
    );
    if (courseLabel) return courseLabel;
  }
  return LICENSE_TYPE_LABELS[license.licenseType];
}

/** Add License form label → backend license type (+ issuing authority for courses). */
export function toLicenseTypeFromLabel(label: string): {
  licenseType: LicenseType;
  defaultIssuingAuthority?: string;
} {
  const licenseType = (Object.keys(LICENSE_TYPE_LABELS) as LicenseType[]).find(
    (type) => LICENSE_TYPE_LABELS[type] === label,
  );
  if (licenseType) return { licenseType };
  if (OTHER_CREDENTIAL_LABELS.includes(label)) {
    return { licenseType: "OTHER", defaultIssuingAuthority: label.split(" ")[0] };
  }
  return { licenseType: "OTHER" };
}

const ONBOARDING_STATUS_DISPLAY: Record<PractitionerOnboardingStatus, { label: string; tone: TagTone }> = {
  APPROVED: { label: "Active", tone: "success" },
  PENDING_REVIEW: { label: "Pending Approval", tone: "warning" },
  DRAFT: { label: "Draft", tone: "neutral" },
  REJECTED: { label: "Rejected", tone: "danger" },
  SUSPENDED: { label: "Suspended", tone: "danger" },
};

const US_STATE_NAME_BY_CODE = new Map(
  State.getStatesOfCountry("US").map((state) => [state.isoCode, state.name]),
);

/* ---------------------------------------------------------------- */
/*  Formatting helpers                                              */
/* ---------------------------------------------------------------- */
const DATE_TIME_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

const formatTimestampDate = (isoTimestamp: string) => formatDateOnly(isoTimestamp.slice(0, 10));
const formatTimestamp = (isoTimestamp: string) => DATE_TIME_FORMATTER.format(new Date(isoTimestamp));

export function formatFileSize(sizeBytes: number): string {
  if (sizeBytes < 1024) return `${sizeBytes} B`;
  if (sizeBytes < 1024 * 1024) return `${Math.round(sizeBytes / 1024)} KB`;
  return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
}

const formatPhone = (phoneNumber: string | null) =>
  phoneNumber
    ? (parsePhoneNumberFromString(phoneNumber)?.formatInternational() ?? phoneNumber)
    : NOT_AVAILABLE;

function getExpiryStatus(license: PractitionerLicense): Pick<LicenseRow, "status" | "statusTone"> {
  if (license.isExpired) return { status: "Expired", statusTone: "danger" };
  if (license.daysUntilExpiration <= EXPIRING_SOON_DAYS) {
    return { status: "Expiring Soon", statusTone: "warning" };
  }
  return { status: "Active", statusTone: "success" };
}

const getJurisdiction = (license: PractitionerLicense) =>
  license.stateCode
    ? `${US_STATE_NAME_BY_CODE.get(license.stateCode) ?? license.stateCode} (${license.stateCode})`
    : "Federal (US)";

/* ---------------------------------------------------------------- */
/*  Provider summary (header card + profile panel)                  */
/* ---------------------------------------------------------------- */
export interface ProviderSummary {
  name: string;
  credential: string;
  specialty: string;
  npi: string;
  dea: string;
  clinic: string;
  city: string;
  email: string;
  phone: string;
  address: string;
  status: string;
  statusTone: TagTone;
}

export function toProviderSummary(
  practitioner: Practitioner,
  licenses: PractitionerLicense[],
  organizationLocations: OrganizationLocation[],
): ProviderSummary {
  const primaryLocationId = practitioner.locations[0]?.locationId;
  const primaryLocation = organizationLocations.find((location) => location.id === primaryLocationId);
  const deaLicense = licenses.find((license) => license.licenseType === "DEA");
  const statusDisplay = ONBOARDING_STATUS_DISPLAY[practitioner.onboardingStatus];

  return {
    name: `Dr. ${practitioner.firstName} ${practitioner.lastName}`,
    credential: practitioner.credentials ?? "",
    specialty:
      practitioner.primarySpecialty?.name ?? practitioner.specialties[0]?.name ?? NOT_AVAILABLE,
    npi: practitioner.npi ?? NOT_AVAILABLE,
    dea: deaLicense?.licenseNumber ?? NOT_AVAILABLE,
    clinic: practitioner.locations.map((location) => location.name).join(", ") || NOT_AVAILABLE,
    city: [primaryLocation?.city, primaryLocation?.stateCode].filter(Boolean).join(", "),
    email: practitioner.email,
    phone: formatPhone(practitioner.phoneNumber),
    address: primaryLocation
      ? [
          primaryLocation.addressLine1,
          primaryLocation.addressLine2,
          primaryLocation.city,
          [primaryLocation.stateCode, primaryLocation.postalCode].filter(Boolean).join(" "),
        ]
          .filter(Boolean)
          .join(", ") || "Virtual (telemedicine)"
      : NOT_AVAILABLE,
    status: statusDisplay?.label ?? practitioner.onboardingStatus,
    statusTone: statusDisplay?.tone ?? "neutral",
  };
}

/* ---------------------------------------------------------------- */
/*  Tabs                                                            */
/* ---------------------------------------------------------------- */
const documentById = (documents: PractitionerDocument[], documentId: string | null) =>
  documentId ? documents.find((document) => document.id === documentId) : undefined;

export function toLicenseRows(
  licenses: PractitionerLicense[],
  documents: PractitionerDocument[],
): LicenseRow[] {
  return licenses.map((license) => {
    const linkedDocument = documentById(documents, license.documentId);
    const typeLabel = getLicenseTypeLabel(license);
    return {
      id: license.id,
      type: typeLabel,
      subType: license.issuingAuthority ?? typeLabel,
      number: license.licenseNumber,
      state: license.stateCode
        ? (US_STATE_NAME_BY_CODE.get(license.stateCode) ?? license.stateCode)
        : "Federal",
      stateCode: license.stateCode ? `(${license.stateCode})` : "(US)",
      issueDate: license.issueDate ? formatDateOnly(license.issueDate) : NOT_AVAILABLE,
      expiryDate: formatDateOnly(license.expirationDate),
      ...getExpiryStatus(license),
      iconTone: license.licenseType === "DEA" ? "violet" : license.licenseType === "STATE_MEDICAL" ? "blue" : "green",
      authority: license.issuingAuthority ?? undefined,
      notes: license.verificationNote ?? undefined,
      fileName: linkedDocument?.originalFileName,
      fileSize: linkedDocument ? formatFileSize(linkedDocument.sizeBytes) : undefined,
    };
  });
}

/** Document types the backend can store (category LICENSE or PRACTITIONER_CREDENTIAL). */
export const UPLOADABLE_DOCUMENT_TYPES = ["License", "Professional Credential"];

export function toDocumentRows(
  documents: PractitionerDocument[],
  licenses: PractitionerLicense[],
): DocumentRow[] {
  return documents
    .filter((document) => document.category !== "PROFILE_PHOTO")
    .map((document) => {
      const linkedLicense = licenses.find((license) => license.documentId === document.id);
      const expiryStatus = linkedLicense
        ? getExpiryStatus(linkedLicense)
        : { status: "Active" as const, statusTone: "success" as const };
      const isLicense = document.category === "LICENSE";
      return {
        id: document.id,
        name: linkedLicense ? `${getLicenseTypeLabel(linkedLicense)} — ${getJurisdiction(linkedLicense)}` : document.originalFileName,
        file: document.originalFileName,
        type: linkedLicense ? getLicenseTypeLabel(linkedLicense) : isLicense ? "License" : "Professional Credential",
        category: isLicense ? "Medical" : "Certifications",
        issuedOn: linkedLicense?.issueDate ? formatDateOnly(linkedLicense.issueDate) : NOT_AVAILABLE,
        expiryDate: linkedLicense ? formatDateOnly(linkedLicense.expirationDate) : NOT_AVAILABLE,
        ...expiryStatus,
        uploadedOn: formatTimestampDate(document.createdAt),
        iconTone: isLicense ? "blue" : "green",
        notes: document.uploadedByPractitioner ? "Uploaded by the provider." : "Uploaded by an administrator.",
        fileSize: formatFileSize(document.sizeBytes),
      };
    });
}

const VERIFICATION_DISPLAY: Record<
  PractitionerLicense["verificationStatus"],
  { status: VerificationStatus; tone: TagTone }
> = {
  VERIFIED: { status: "Verified", tone: "success" },
  PENDING: { status: "In Progress", tone: "warning" },
  REJECTED: { status: "Failed", tone: "danger" },
};

/** Verification history = each license's verification state (backend: license verification). */
export function toVerificationRows(
  licenses: PractitionerLicense[],
  documents: PractitionerDocument[],
): VerificationRow[] {
  return licenses.map((license) => {
    const linkedDocument = documentById(documents, license.documentId);
    const typeLabel = getLicenseTypeLabel(license);
    const display = license.isExpired
      ? { status: "Expired" as const, tone: "danger" as const }
      : VERIFICATION_DISPLAY[license.verificationStatus];
    const isDecided = license.verificationStatus !== "PENDING" && license.verifiedAt;
    const verifiedBy = isDecided ? "Credentialing team" : NOT_AVAILABLE;

    return {
      id: license.id,
      name: `${typeLabel} - ${getJurisdiction(license)}`,
      sub: `License #${license.licenseNumber}`,
      type: typeLabel,
      submittedOn: formatTimestampDate(license.createdAt),
      verifiedOn: isDecided ? formatTimestampDate(license.verifiedAt!) : NOT_AVAILABLE,
      status: display.status,
      statusTone: display.tone,
      verifiedBy,
      nextRenewal: formatDateOnly(license.expirationDate),
      iconTone: license.licenseType === "DEA" ? "violet" : license.licenseType === "STATE_MEDICAL" ? "blue" : "green",
      detail: {
        documentType: typeLabel,
        licenseNumber: license.licenseNumber,
        jurisdiction: getJurisdiction(license),
        issuedDate: license.issueDate ? formatDateOnly(license.issueDate) : NOT_AVAILABLE,
        expirationDate: formatDateOnly(license.expirationDate),
        verifiedBy,
        method: "Primary source verification",
        notes:
          license.verificationNote ??
          (license.verificationStatus === "PENDING"
            ? "Awaiting verification by the credentialing team."
            : NOT_AVAILABLE),
        fileName: linkedDocument?.originalFileName ?? "No file attached",
        fileSize: linkedDocument ? formatFileSize(linkedDocument.sizeBytes) : NOT_AVAILABLE,
        documentId: linkedDocument?.id,
        timeline: [
          { label: "Submitted", date: formatTimestamp(license.createdAt) },
          isDecided
            ? {
                label: license.verificationStatus === "VERIFIED" ? "Verified" : "Rejected",
                date: formatTimestamp(license.verifiedAt!),
              }
            : { label: "Awaiting verification", date: NOT_AVAILABLE },
        ],
      },
    };
  });
}
