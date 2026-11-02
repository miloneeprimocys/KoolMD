"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  Ban,
  Briefcase,
  Cigarette,
  Dumbbell,
  ExternalLink,
  FileText,
  Heart,
  HeartPulse,
  Pencil,
  Plus,
  Ruler,
  Scale,
  Scissors,
  Stethoscope,
  Syringe,
  Users,
  Utensils,
  Wine,
  type LucideIcon,
} from "lucide-react";

import Table from "@/components/Table";
import TableStatus from "@/components/TableStatus";
import Content from "@/components/Content";
import Tags, { type TagTone } from "@/components/Tags";
import ImportButton from "@/components/ImportButton";
import EditButton from "@/components/EditButton";
import IconAction from "@/components/IconAction";
import ReasonModal from "@/components/ReasonModal";
import { PERMISSIONS } from "@/auth/permissions";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppHooks";
import { usePermission } from "@/hooks/usePermission";
import { selectPatientMedicalHistory } from "@/redux/selectors/patientSelectors";
import {
  changeMedicalHistory,
  fetchMedicalHistory,
  type HistoryListSection,
} from "@/redux/thunks/patientRecordsThunks";
import type {
  FamilyHistoryEntry,
  PatientCondition,
  PatientImmunization,
  PatientMedicalHistory,
  SurgicalHistoryEntry,
} from "@/types/patient";
import { formatDateOnly, formatDateTime, humanizeEnum } from "@/utils/formatters";
import { ACTIONS_COL, col, ScrollArea, SectionCard } from "../sectionLayout";
import ConditionModal from "./ConditionModal";
import FamilyHistoryModal from "./FamilyHistoryModal";
import ImmunizationModal from "./ImmunizationModal";
import LifestyleModal, { ALCOHOL_LABELS, EXERCISE_LABELS, TOBACCO_LABELS } from "./LifestyleModal";
import SurgeryModal from "./SurgeryModal";

/** LOINC codes of the vitals shown in the lifestyle card. */
const LOINC = { height: "8302-2", weight: "29463-7", bmi: "39156-5" } as const;

const CONDITION_TONES: Record<PatientCondition["clinicalStatus"], TagTone> = {
  ACTIVE: "danger",
  RESOLVED: "success",
  INACTIVE: "neutral",
};

const dateOrDash = (date: string | null) => (date ? formatDateOnly(date) : "—");
const textOrDash = (text: string | null) => text ?? "—";
const isError = (status: string) => status === "ENTERED_IN_ERROR";
const errorTag = <Tags text="Entered in error" tone="neutral" />;

/** Which editor is open on the tab; `null` item = add a new one. */
type OpenEditor =
  | { kind: "condition"; item: PatientCondition | null }
  | { kind: "surgery"; item: SurgicalHistoryEntry | null }
  | { kind: "family"; item: FamilyHistoryEntry | null }
  | { kind: "immunization"; item: PatientImmunization | null }
  | { kind: "lifestyle" }
  | { kind: "enteredInError"; section: Exclude<HistoryListSection, "conditions">; entryId: string; label: string }
  | null;

const AddAction = ({ text, onClick }: { text: string; onClick: () => void }) => (
  <ImportButton className="text-primary" text={text} icon={<Plus className="h-4 w-4" />} onClick={onClick} />
);

const LifestyleRow = ({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) => (
  <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-center gap-3">
    <p className="flex min-w-0 items-center gap-2.5 text-xs text-body sm:text-sm">
      <Icon className="h-4 w-4 shrink-0" />
      <span className="truncate">{label}</span>
    </p>
    <p
      className={`min-w-0 truncate text-sm ${value === "Not recorded" ? "text-body" : "font-medium text-heading"}`}
      title={value}
    >
      {value}
    </p>
  </div>
);

const MedicalHistory = ({ patientId }: { patientId: string }) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const record = useAppSelector(selectPatientMedicalHistory);
  const canWriteConditions = usePermission(PERMISSIONS.CONDITION_WRITE);
  const canWriteHistory = usePermission(PERMISSIONS.MEDICAL_HISTORY_WRITE);
  const canReadEncounters = usePermission(PERMISSIONS.ENCOUNTER_READ);
  const [openEditor, setOpenEditor] = useState<OpenEditor>(null);

  useEffect(() => {
    dispatch(fetchMedicalHistory(patientId));
  }, [dispatch, patientId]);

  const data: PatientMedicalHistory | null = record.patientId === patientId ? record.data : null;

  if (!data) {
    const failed = record.patientId === patientId && record.status === "failed";
    return (
      <div className="rounded-[14px] border border-border bg-card">
        {failed ? (
          <TableStatus
            variant="error"
            message={record.error?.message}
            onRetry={() => dispatch(fetchMedicalHistory(patientId))}
          />
        ) : (
          <TableStatus variant="loading" message="Loading medical history…" />
        )}
      </div>
    );
  }

  /** Edit + "entered in error" buttons for a history entry the viewer may change. */
  const entryActions = (
    entryId: string,
    status: string,
    label: string,
    section: Exclude<HistoryListSection, "conditions">,
    onEdit: () => void,
  ) =>
    canWriteHistory && !isError(status) ? (
      <div className="flex w-full items-center justify-center gap-1">
        <IconAction icon={Pencil} label={`Edit ${label}`} onClick={onEdit} />
        <IconAction
          icon={Ban}
          tone="danger"
          label={`Mark ${label} as entered in error`}
          onClick={() => setOpenEditor({ kind: "enteredInError", section, entryId, label })}
        />
      </div>
    ) : null;

  const table = (columns: ReturnType<typeof col>[], rows: Record<string, React.ReactNode>[], empty: string, withActions: boolean) =>
    rows.length === 0 ? (
      <TableStatus variant="empty" message={empty} />
    ) : (
      <ScrollArea>
        <Table columns={withActions ? [...columns, ACTIONS_COL] : columns} rows={rows} />
      </ScrollArea>
    );

  /* ---------- Rows ---------- */
  const conditionRows = data.conditions.map((condition) => ({
    name: <Content title={condition.display} description={condition.code} truncate />,
    date: <Content title={dateOrDash(condition.onsetDate)} truncate />,
    status:
      condition.verificationStatus === "ENTERED_IN_ERROR" ? (
        errorTag
      ) : (
        <Tags text={humanizeEnum(condition.clinicalStatus)} tone={CONDITION_TONES[condition.clinicalStatus]} />
      ),
    notes: <Content title={textOrDash(condition.note)} truncate />,
    actions: (
      <div className="flex w-full items-center justify-center">
        <IconAction
          icon={Pencil}
          label={`Update ${condition.display}`}
          onClick={() => setOpenEditor({ kind: "condition", item: condition })}
        />
      </div>
    ),
  }));

  const surgeryRows = data.surgicalHistory.map((entry) => ({
    name: <Content title={entry.procedureName} description={entry.facilityName ?? undefined} truncate />,
    date: <Content title={dateOrDash(entry.performedDate)} truncate />,
    reason: isError(entry.status) ? errorTag : <Content title={textOrDash(entry.reason)} truncate />,
    notes: <Content title={textOrDash(isError(entry.status) ? entry.statusReason : entry.note)} truncate />,
    actions: entryActions(entry.id, entry.status, entry.procedureName, "surgicalHistory", () =>
      setOpenEditor({ kind: "surgery", item: entry }),
    ),
  }));

  const familyRows = data.familyHistory.map((entry) => ({
    name: <Content title={entry.conditionName} truncate />,
    relation: (
      <Content
        title={humanizeEnum(entry.relationship)}
        description={entry.relationDetails ?? undefined}
        truncate
      />
    ),
    age: isError(entry.status) ? errorTag : <Content title={entry.onsetAge?.toString() ?? "—"} truncate />,
    notes: <Content title={textOrDash(isError(entry.status) ? entry.statusReason : entry.note)} truncate />,
    actions: entryActions(entry.id, entry.status, entry.conditionName, "familyHistory", () =>
      setOpenEditor({ kind: "family", item: entry }),
    ),
  }));

  const immunizationRows = data.immunizations.map((immunization) => ({
    name: (
      <Content title={immunization.vaccineName} description={immunization.manufacturer ?? undefined} truncate />
    ),
    date: <Content title={formatDateOnly(immunization.administeredDate)} truncate />,
    dose: isError(immunization.status) ? (
      errorTag
    ) : immunization.status === "NOT_DONE" ? (
      <Tags text="Not given" tone="warning" />
    ) : (
      <Content title={textOrDash(immunization.doseLabel)} truncate />
    ),
    notes: (
      <Content
        title={textOrDash(immunization.status === "COMPLETED" ? immunization.note : immunization.statusReason)}
        truncate
      />
    ),
    actions: entryActions(immunization.id, immunization.status, immunization.vaccineName, "immunizations", () =>
      setOpenEditor({ kind: "immunization", item: immunization }),
    ),
  }));

  const visitRows = (data.recentEncounters ?? []).map((encounter) => ({
    date: <Content title={formatDateTime(encounter.startedAt)} truncate />,
    provider: (
      <Content title={`Dr. ${encounter.practitioner.firstName} ${encounter.practitioner.lastName}`} truncate />
    ),
    status: (
      <Tags
        text={encounter.isLocked ? "Signed" : humanizeEnum(encounter.status)}
        tone={encounter.isLocked ? "success" : encounter.status === "IN_PROGRESS" ? "warning" : "neutral"}
      />
    ),
    actions: (
      <div className="flex w-full items-center justify-center">
        <IconAction
          icon={ExternalLink}
          label="Open visit"
          onClick={() => router.push(`/view-encounter?id=${encodeURIComponent(encounter.id)}`)}
        />
      </div>
    ),
  }));

  /* ---------- Lifestyle ---------- */
  const social = data.socialHistory;
  const vital = (code: string) => data.latestVitals?.find((reading) => reading.code === code);
  const vitalText = (code: string) => {
    const reading = vital(code);
    return reading?.value != null ? `${reading.value} ${reading.unit ?? ""}`.trim() : "Not recorded";
  };
  const notRecorded = (text: string | null | undefined) => text ?? "Not recorded";
  const lifestyleLeft = [
    { icon: Cigarette, label: "Tobacco", value: social ? TOBACCO_LABELS[social.tobaccoUse] : "Not recorded" },
    { icon: Wine, label: "Alcohol", value: social ? ALCOHOL_LABELS[social.alcoholUse] : "Not recorded" },
    {
      icon: Dumbbell,
      label: "Exercise",
      value: social?.exerciseFrequency ? EXERCISE_LABELS[social.exerciseFrequency] : "Not recorded",
    },
    { icon: Utensils, label: "Diet", value: notRecorded(social?.diet) },
    { icon: Briefcase, label: "Occupation", value: notRecorded(social?.occupation) },
  ];
  const lifestyleRight = [
    { icon: Heart, label: "Marital Status", value: social?.maritalStatus ? humanizeEnum(social.maritalStatus) : "Not recorded" },
    { icon: Ruler, label: "Height", value: vitalText(LOINC.height) },
    { icon: Scale, label: "Weight", value: vitalText(LOINC.weight) },
    { icon: Activity, label: "BMI", value: vitalText(LOINC.bmi) },
  ];

  /* ---------- Entered in error ---------- */
  const markEnteredInError = async (
    section: Exclude<HistoryListSection, "conditions">,
    entryId: string,
    reason: string,
  ): Promise<string | null> => {
    const result = await dispatch(
      changeMedicalHistory({ patientId, kind: "enteredInError", section, entryId, reason }),
    );
    return changeMedicalHistory.fulfilled.match(result)
      ? null
      : (result.payload?.message ?? "The entry could not be updated.");
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:gap-5 xl:grid-cols-2">
      <div className="flex min-w-0 flex-col gap-4 sm:gap-5">
        <SectionCard
          icon={HeartPulse}
          tone="red"
          title="Medical Conditions"
          subtitle="Problem list (ICD-10-CM)."
          action={
            canWriteConditions ? (
              <AddAction text="Add Condition" onClick={() => setOpenEditor({ kind: "condition", item: null })} />
            ) : undefined
          }
        >
          {table(
            [col("name", "Condition"), col("date", "Onset"), col("status", "Status"), col("notes", "Notes")],
            conditionRows,
            "No conditions on the problem list.",
            canWriteConditions,
          )}
        </SectionCard>

        <SectionCard
          icon={Users}
          tone="blue"
          title="Family History"
          action={
            canWriteHistory ? (
              <AddAction text="Add Family History" onClick={() => setOpenEditor({ kind: "family", item: null })} />
            ) : undefined
          }
        >
          {table(
            [col("name", "Condition"), col("relation", "Relative"), col("age", "Age at Diagnosis"), col("notes", "Notes")],
            familyRows,
            "No family history recorded.",
            canWriteHistory,
          )}
        </SectionCard>

        <SectionCard
          icon={Syringe}
          tone="violet"
          title="Immunization History"
          action={
            canWriteHistory ? (
              <AddAction text="Add Immunization" onClick={() => setOpenEditor({ kind: "immunization", item: null })} />
            ) : undefined
          }
        >
          {table(
            [col("name", "Vaccine"), col("date", "Date"), col("dose", "Dose"), col("notes", "Notes")],
            immunizationRows,
            "No immunizations recorded.",
            canWriteHistory,
          )}
        </SectionCard>
      </div>

      <div className="flex min-w-0 flex-col gap-4 sm:gap-5">
        <SectionCard
          icon={Scissors}
          tone="violet"
          title="Surgical History"
          action={
            canWriteHistory ? (
              <AddAction text="Add Surgery" onClick={() => setOpenEditor({ kind: "surgery", item: null })} />
            ) : undefined
          }
        >
          {table(
            [col("name", "Procedure"), col("date", "Date"), col("reason", "Reason"), col("notes", "Notes")],
            surgeryRows,
            "No surgeries recorded.",
            canWriteHistory,
          )}
        </SectionCard>

        <SectionCard
          icon={FileText}
          tone="blue"
          title="Lifestyle & Social History"
          subtitle={social ? `Updated ${formatDateTime(social.updatedAt)}` : undefined}
          action={
            canWriteHistory ? (
              <EditButton section="Lifestyle & Social History" onEdit={() => setOpenEditor({ kind: "lifestyle" })} />
            ) : undefined
          }
        >
          <div className="hide-scrollbar min-h-0 flex-1 overflow-y-auto">
            <div className="grid grid-cols-1 gap-x-8 gap-y-3.5 sm:grid-cols-2">
              <div className="grid gap-3.5">
                {lifestyleLeft.map((row) => (
                  <LifestyleRow key={row.label} {...row} />
                ))}
              </div>
              <div className="grid gap-3.5">
                {lifestyleRight.map((row) => (
                  <LifestyleRow key={row.label} {...row} />
                ))}
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          icon={Stethoscope}
          tone="blue"
          title="Visit History"
          subtitle="Clinical notes are written and signed inside each visit."
        >
          {data.recentEncounters === null ? (
            <TableStatus variant="empty" message="Visit history is not available to you." />
          ) : (
            table(
              [col("date", "Date"), col("provider", "Provider"), col("status", "Status")],
              visitRows,
              "No visits yet.",
              canReadEncounters,
            )
          )}
        </SectionCard>
      </div>

      {openEditor?.kind === "condition" && (
        <ConditionModal
          key={openEditor.item?.id ?? "new"}
          patientId={patientId}
          condition={openEditor.item}
          onClose={() => setOpenEditor(null)}
        />
      )}
      {openEditor?.kind === "surgery" && (
        <SurgeryModal
          key={openEditor.item?.id ?? "new"}
          patientId={patientId}
          entry={openEditor.item}
          onClose={() => setOpenEditor(null)}
        />
      )}
      {openEditor?.kind === "family" && (
        <FamilyHistoryModal
          key={openEditor.item?.id ?? "new"}
          patientId={patientId}
          entry={openEditor.item}
          onClose={() => setOpenEditor(null)}
        />
      )}
      {openEditor?.kind === "immunization" && (
        <ImmunizationModal
          key={openEditor.item?.id ?? "new"}
          patientId={patientId}
          immunization={openEditor.item}
          onClose={() => setOpenEditor(null)}
        />
      )}
      {openEditor?.kind === "lifestyle" && (
        <LifestyleModal patientId={patientId} socialHistory={social} onClose={() => setOpenEditor(null)} />
      )}
      {openEditor?.kind === "enteredInError" && (
        <ReasonModal
          title="Mark as Entered in Error"
          subtitle={`${openEditor.label} stays in the record for staff but is hidden from the patient.`}
          submitText="Mark as Error"
          reasonLabel="What was wrong"
          onSubmit={({ reason }) => markEnteredInError(openEditor.section, openEditor.entryId, reason)}
          onClose={() => setOpenEditor(null)}
        />
      )}
    </div>
  );
};

export default MedicalHistory;
