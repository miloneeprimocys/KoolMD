"use client";

import React, { useEffect, useState } from "react";
import { Archive, Download, FileImage, FileText, FolderOpen, Upload } from "lucide-react";

import Table from "@/components/Table";
import TableStatus from "@/components/TableStatus";
import { type TableColumn } from "@/components/Tableheader";
import Content from "@/components/Content";
import Tags from "@/components/Tags";
import AddButton from "@/components/Addbutton";
import FileDropzone from "@/components/Filedropzone";
import SignupDropdown from "@/components/SignupDropdown";
import IconAction from "@/components/IconAction";
import ReasonModal from "@/components/ReasonModal";
import ErrorToast from "@/components/ErrorToast";
import { PERMISSIONS } from "@/auth/permissions";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppHooks";
import { usePermission } from "@/hooks/usePermission";
import { patientRecordsService } from "@/redux/services/patientRecordsService";
import { selectPatientDocuments } from "@/redux/selectors/patientSelectors";
import { changeDocuments, fetchDocuments } from "@/redux/thunks/patientRecordsThunks";
import { toRequestError } from "@/redux/thunks/thunkHelpers";
import type { PatientDocument, PatientDocumentCategory } from "@/types/patient";
import { formatDateTime } from "@/utils/formatters";
import { formatFileSize, saveBlobAsFile } from "@/utils/download";
import { ACTIONS_COL, col, SectionCard } from "./sectionLayout";

/** Server upload limit (MAX_UPLOAD_SIZE_MB). */
const MAX_UPLOAD_MB = 10;

/** Categories the care team may file on a patient's record (API rule). */
const STAFF_UPLOAD_CATEGORIES: PatientDocumentCategory[] = [
  "CLINICAL_ATTACHMENT",
  "LAB_REPORT",
  "IMAGING",
  "REFERRAL",
  "IDENTITY",
  "INSURANCE_CARD",
  "OTHER",
];
const CATEGORY_LABELS: Record<PatientDocumentCategory, string> = {
  PATIENT_UPLOAD: "Uploaded by patient",
  IDENTITY: "ID",
  INSURANCE_CARD: "Insurance card",
  OTHER: "Other",
  CLINICAL_ATTACHMENT: "Clinical",
  LAB_REPORT: "Lab report",
  IMAGING: "Imaging",
  REFERRAL: "Referral",
};
const ALL_CATEGORIES = "";
const FILTER_OPTIONS = [
  { value: ALL_CATEGORIES, label: "All categories" },
  ...(Object.keys(CATEGORY_LABELS) as PatientDocumentCategory[]).map((value) => ({
    value,
    label: CATEGORY_LABELS[value],
  })),
];

const Documents = ({ patientId }: { patientId: string }) => {
  const dispatch = useAppDispatch();
  const record = useAppSelector(selectPatientDocuments);
  const canUpdate = usePermission(PERMISSIONS.PATIENT_UPDATE);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [uploadCategory, setUploadCategory] = useState<PatientDocumentCategory | "">("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadErrors, setUploadErrors] = useState<{ category?: string; file?: string }>({});
  const [isUploading, setIsUploading] = useState(false);
  const [documentToArchive, setDocumentToArchive] = useState<PatientDocument | null>(null);
  const [toastError, setToastError] = useState<{ title: string; message: string } | null>(null);

  useEffect(() => {
    dispatch(fetchDocuments(patientId));
  }, [dispatch, patientId]);

  const documents = record.patientId === patientId ? record.data : null;
  const visibleDocuments =
    documents?.filter((document) => !categoryFilter || document.category === categoryFilter) ?? [];

  const upload = async () => {
    const errors: typeof uploadErrors = {};
    if (!uploadCategory) errors.category = "Choose a category.";
    if (!uploadFile) errors.file = "Choose a file to upload.";
    setUploadErrors(errors);
    if (!uploadCategory || !uploadFile) return;

    setIsUploading(true);
    const result = await dispatch(
      changeDocuments({ patientId, kind: "upload", category: uploadCategory, file: uploadFile }),
    );
    setIsUploading(false);
    if (changeDocuments.fulfilled.match(result)) {
      setUploadFile(null);
      setUploadCategory("");
    } else {
      setToastError({
        title: "Upload failed",
        message: result.payload?.message ?? "The file could not be uploaded.",
      });
    }
  };

  const download = async (document: PatientDocument) => {
    try {
      const { blob, fileName } = await patientRecordsService.downloadDocument(patientId, document.id);
      saveBlobAsFile(blob, fileName ?? document.originalFileName);
    } catch (error) {
      setToastError({ title: "Download failed", message: toRequestError(error).message });
    }
  };

  const archive = async (document: PatientDocument, reason: string): Promise<string | null> => {
    const result = await dispatch(
      changeDocuments({ patientId, kind: "archive", documentId: document.id, reason }),
    );
    return changeDocuments.fulfilled.match(result)
      ? null
      : (result.payload?.message ?? "The document could not be archived.");
  };

  const columns: TableColumn[] = [
    col("name", "File"),
    col("category", "Category"),
    col("date", "Uploaded"),
    col("source", "Source"),
    { ...ACTIONS_COL, width: 96 },
  ];

  const rows = visibleDocuments.map((document) => {
    const Icon = document.contentType.startsWith("image/") ? FileImage : FileText;
    return {
      name: (
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="h-4 w-4" />
          </span>
          <Content title={document.originalFileName} description={formatFileSize(document.sizeBytes)} truncate />
        </div>
      ),
      category: <Tags text={CATEGORY_LABELS[document.category]} tone="info" />,
      date: <Content title={formatDateTime(document.createdAt)} truncate />,
      source: <Content title={document.isUploadedByPatient ? "Patient" : "Care team"} truncate />,
      actions: (
        <div className="flex w-full items-center justify-center gap-1">
          <IconAction
            icon={Download}
            label={`Download ${document.originalFileName}`}
            onClick={() => download(document)}
          />
          {canUpdate && (
            <IconAction
              icon={Archive}
              tone="danger"
              label={`Archive ${document.originalFileName}`}
              onClick={() => setDocumentToArchive(document)}
            />
          )}
        </div>
      ),
    };
  });

  const renderTable = () => {
    if (record.patientId === patientId && record.status === "failed" && !documents) {
      return (
        <TableStatus
          variant="error"
          message={record.error?.message}
          onRetry={() => dispatch(fetchDocuments(patientId))}
        />
      );
    }
    if (!documents) return <TableStatus variant="loading" message="Loading documents…" />;
    if (rows.length === 0) {
      return (
        <TableStatus
          variant="empty"
          message={categoryFilter ? "No documents in this category." : "No documents yet."}
        />
      );
    }
    return <Table columns={columns} rows={rows} bordered={false} />;
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      <ErrorToast
        isOpen={toastError !== null}
        onClose={() => setToastError(null)}
        title={toastError?.title}
        message={toastError?.message}
      />

      {canUpdate && (
        <SectionCard
          className="!h-auto"
          icon={Upload}
          tone="blue"
          title="Upload Document"
          subtitle={`PDF, JPG or PNG, up to ${MAX_UPLOAD_MB} MB.`}
        >
          <div className="grid gap-4 md:grid-cols-[minmax(0,240px)_minmax(0,1fr)_auto] md:items-start">
            <SignupDropdown
              name="uploadCategory"
              label="Category"
              placeholder="Select category"
              options={STAFF_UPLOAD_CATEGORIES.map((value) => ({ value, label: CATEGORY_LABELS[value] }))}
              value={uploadCategory}
              onChange={(value) => {
                setUploadCategory(value as PatientDocumentCategory);
                setUploadErrors((previous) => ({ ...previous, category: undefined }));
              }}
              error={uploadErrors.category}
            />
            <FileDropzone
              title="your document here"
              file={uploadFile}
              onChange={(file) => {
                setUploadFile(file);
                setUploadErrors((previous) => ({ ...previous, file: undefined }));
              }}
              error={uploadErrors.file}
              maxSizeMB={MAX_UPLOAD_MB}
              compact
            />
            <AddButton
              text={isUploading ? "Uploading…" : "Upload"}
              icon={null}
              onClick={upload}
              disabled={isUploading}
              className="md:mt-7"
            />
          </div>
        </SectionCard>
      )}

      <SectionCard
        className="!h-auto"
        icon={FolderOpen}
        tone="violet"
        title="Documents"
        subtitle="Archived documents are kept for retention but no longer listed."
        action={
          <div className="w-48">
            <SignupDropdown
              name="categoryFilter"
              options={FILTER_OPTIONS}
              value={categoryFilter}
              onChange={setCategoryFilter}
            />
          </div>
        }
      >
        <div className="overflow-hidden rounded-xl border border-border">{renderTable()}</div>
      </SectionCard>

      {documentToArchive && (
        <ReasonModal
          title="Archive Document"
          subtitle={`${documentToArchive.originalFileName} will be hidden from the list but kept for retention.`}
          submitText="Archive"
          reasonLabel="Reason for archiving"
          onSubmit={({ reason }) => archive(documentToArchive, reason)}
          onClose={() => setDocumentToArchive(null)}
        />
      )}
    </div>
  );
};

export default Documents;
