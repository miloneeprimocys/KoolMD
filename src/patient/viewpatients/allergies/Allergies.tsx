"use client";

import React, { useEffect, useState } from "react";
import { AlertCircle, Flower2, Nut, Pill, ShieldAlert, ShieldCheck, type LucideIcon } from "lucide-react";

import Table from "@/components/Table";
import TableStatus from "@/components/TableStatus";
import { type TableColumn } from "@/components/Tableheader";
import Content from "@/components/Content";
import Tags, { type TagTone } from "@/components/Tags";
import AddButton from "@/components/Addbutton";
import ImportButton from "@/components/ImportButton";
import Actions from "@/components/Actions";
import { PERMISSIONS } from "@/auth/permissions";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppHooks";
import { usePermission } from "@/hooks/usePermission";
import { selectPatientAllergies } from "@/redux/selectors/patientSelectors";
import { fetchAllergies, setNoKnownAllergies } from "@/redux/thunks/patientRecordsThunks";
import type {
  AllergyCategory,
  AllergyClinicalStatus,
  AllergySeverity,
  PatientAllergy,
} from "@/types/patient";
import { formatDateOnly, humanizeEnum } from "@/utils/formatters";
import { ACTIONS_COL, DENSE, SectionCard } from "../sectionLayout";
import AllergyModal from "./AllergyModal";

const CATEGORY_ICONS: Record<AllergyCategory, LucideIcon> = {
  MEDICATION: Pill,
  FOOD: Nut,
  ENVIRONMENTAL: Flower2,
  OTHER: AlertCircle,
};

const SEVERITY_TONES: Record<AllergySeverity, TagTone> = {
  SEVERE: "danger",
  MODERATE: "warning",
  MILD: "info",
  UNKNOWN: "neutral",
};

const STATUS_TONES: Record<AllergyClinicalStatus, TagTone> = {
  ACTIVE: "danger",
  INACTIVE: "neutral",
  RESOLVED: "success",
};

const col = (key: string, label: string): TableColumn => ({ key, label, className: DENSE });

/** Which allergy editor is open: `null` = record a new one. */
type OpenEditor = { allergy: PatientAllergy | null } | null;

const Allergies = ({ patientId }: { patientId: string }) => {
  const dispatch = useAppDispatch();
  const record = useAppSelector(selectPatientAllergies);
  const canUpdate = usePermission(PERMISSIONS.ALLERGY_UPDATE);
  const [openEditor, setOpenEditor] = useState<OpenEditor>(null);
  const [isTogglingNka, setIsTogglingNka] = useState(false);
  const [nkaError, setNkaError] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchAllergies(patientId));
  }, [dispatch, patientId]);

  const data = record.patientId === patientId ? record.data : null;
  const allergies = data?.allergies ?? [];
  const hasActiveAllergy = allergies.some((allergy) => allergy.clinicalStatus === "ACTIVE");

  const toggleNoKnownAllergies = async (hasNoKnownAllergies: boolean) => {
    setIsTogglingNka(true);
    setNkaError(null);
    const result = await dispatch(setNoKnownAllergies({ patientId, hasNoKnownAllergies }));
    setIsTogglingNka(false);
    if (setNoKnownAllergies.rejected.match(result)) {
      setNkaError(result.payload?.message ?? "Could not update the allergy status.");
    }
  };

  const columns: TableColumn[] = [
    col("allergen", "Allergen"),
    col("category", "Category"),
    col("reaction", "Reaction"),
    col("severity", "Severity"),
    col("onset", "Onset Date"),
    col("status", "Status"),
    col("notes", "Notes"),
    ...(canUpdate ? [ACTIONS_COL] : []),
  ];

  const rows = allergies.map((allergy) => {
    const Icon = CATEGORY_ICONS[allergy.category];
    return {
      allergen: (
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-danger/10 text-danger">
            <Icon className="h-4 w-4" />
          </span>
          <Content title={allergy.allergen} truncate />
        </div>
      ),
      category: <Content title={humanizeEnum(allergy.category)} truncate />,
      reaction: <Content title={allergy.reaction ?? "—"} truncate />,
      severity: <Tags text={humanizeEnum(allergy.severity)} tone={SEVERITY_TONES[allergy.severity]} />,
      onset: <Content title={allergy.onsetDate ? formatDateOnly(allergy.onsetDate) : "—"} truncate />,
      status: (
        <Tags text={humanizeEnum(allergy.clinicalStatus)} tone={STATUS_TONES[allergy.clinicalStatus]} />
      ),
      notes: <Content title={allergy.notes ?? "—"} truncate />,
      actions: (
        <div className="flex w-full items-center justify-center">
          <Actions actions={["edit"]} size="sm" onAction={() => setOpenEditor({ allergy })} />
        </div>
      ),
    };
  });

  const renderBody = () => {
    if (record.patientId === patientId && record.status === "failed" && !data) {
      return (
        <TableStatus
          variant="error"
          message={record.error?.message}
          onRetry={() => dispatch(fetchAllergies(patientId))}
        />
      );
    }
    if (!data) return <TableStatus variant="loading" message="Loading allergies…" />;
    if (allergies.length === 0) {
      return (
        <TableStatus
          variant="empty"
          message={
            data.hasNoKnownAllergies
              ? "No known allergies (confirmed)."
              : "No allergies recorded. Record one, or confirm the patient has no known allergies."
          }
        />
      );
    }
    return <Table columns={columns} rows={rows} />;
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      <SectionCard
        className="!h-auto"
        icon={ShieldAlert}
        tone="red"
        title="Allergies"
        subtitle="Allergies are never deleted — mark them Inactive or Resolved instead."
        action={
          canUpdate ? <AddButton text="Add Allergy" onClick={() => setOpenEditor({ allergy: null })} /> : undefined
        }
      >
        {renderBody()}
      </SectionCard>

      {data && (
        <SectionCard
          className="!h-auto"
          icon={ShieldCheck}
          tone="green"
          title="No Known Allergies"
          subtitle="Confirming NKA tells the care team the patient was asked and has no allergies."
          action={
            canUpdate ? (
              data.hasNoKnownAllergies ? (
                <ImportButton
                  text={isTogglingNka ? "Saving…" : "Withdraw Confirmation"}
                  icon={null}
                  disabled={isTogglingNka}
                  onClick={() => toggleNoKnownAllergies(false)}
                />
              ) : (
                <ImportButton
                  text={isTogglingNka ? "Saving…" : "Confirm No Known Allergies"}
                  icon={null}
                  disabled={isTogglingNka || hasActiveAllergy}
                  onClick={() => toggleNoKnownAllergies(true)}
                />
              )
            ) : undefined
          }
        >
          <p className="text-sm text-body">
            {data.hasNoKnownAllergies
              ? "Confirmed: this patient has no known allergies."
              : hasActiveAllergy
                ? "Not available while the patient has active allergies."
                : "Not confirmed yet."}
          </p>
          {nkaError && (
            <p role="alert" className="mt-2 text-sm text-danger">
              {nkaError}
            </p>
          )}
        </SectionCard>
      )}

      {openEditor && (
        <AllergyModal
          key={openEditor.allergy?.id ?? "new"}
          patientId={patientId}
          allergy={openEditor.allergy}
          onClose={() => setOpenEditor(null)}
        />
      )}
    </div>
  );
};

export default Allergies;
