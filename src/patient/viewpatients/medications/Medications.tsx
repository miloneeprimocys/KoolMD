"use client";

import React, { useEffect, useState } from "react";
import { Ban, CircleStop, Clock, Pencil, Pill } from "lucide-react";

import Table from "@/components/Table";
import TableStatus from "@/components/TableStatus";
import { type TableColumn } from "@/components/Tableheader";
import Content from "@/components/Content";
import Tags, { type TagTone } from "@/components/Tags";
import AddButton from "@/components/Addbutton";
import IconAction from "@/components/IconAction";
import ReasonModal from "@/components/ReasonModal";
import { todayISO } from "@/components/Modalshell";
import { PERMISSIONS } from "@/auth/permissions";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppHooks";
import { usePermission } from "@/hooks/usePermission";
import { selectPatientMedications } from "@/redux/selectors/patientSelectors";
import { changeMedication, fetchMedications } from "@/redux/thunks/patientRecordsThunks";
import type { MedicationStatement, MedicationStatementStatus } from "@/types/patient";
import { formatDateOnly, humanizeEnum } from "@/utils/formatters";
import { ACTIONS_COL, DENSE, ScrollArea, SectionCard } from "../sectionLayout";
import MedicationModal from "./MedicationModal";

const CURRENT_STATUSES: MedicationStatementStatus[] = ["ACTIVE", "ON_HOLD"];

const STATUS_TONES: Record<MedicationStatementStatus, TagTone> = {
  ACTIVE: "success",
  ON_HOLD: "warning",
  STOPPED: "danger",
  COMPLETED: "info",
  ENTERED_IN_ERROR: "neutral",
};

const SOURCE_LABELS: Record<MedicationStatement["informationSource"], string> = {
  PATIENT_REPORTED: "Patient reported",
  CLINICIAN_RECORDED: "Clinician recorded",
  PRESCRIPTION: "Prescribed",
};

const col = (key: string, label: string): TableColumn => ({ key, label, className: DENSE });
const dateOrDash = (date: string | null) => (date ? formatDateOnly(date) : "—");

/** What the user is doing to the list right now. */
type OpenAction =
  | { kind: "edit"; statement: MedicationStatement | null }
  | { kind: "stop" | "enteredInError"; statement: MedicationStatement }
  | null;

const Medications = ({ patientId }: { patientId: string }) => {
  const dispatch = useAppDispatch();
  const record = useAppSelector(selectPatientMedications);
  const canWrite = usePermission(PERMISSIONS.MEDICATION_WRITE);
  const [openAction, setOpenAction] = useState<OpenAction>(null);

  useEffect(() => {
    dispatch(fetchMedications(patientId));
  }, [dispatch, patientId]);

  const statements = record.patientId === patientId ? record.data : null;
  const current = statements?.filter((statement) => CURRENT_STATUSES.includes(statement.status)) ?? [];
  const history = statements?.filter((statement) => !CURRENT_STATUSES.includes(statement.status)) ?? [];

  const nameCell = (statement: MedicationStatement) => (
    <div className="flex min-w-0 items-center gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Pill className="h-4 w-4" />
      </span>
      <Content
        title={statement.medicationName}
        description={SOURCE_LABELS[statement.informationSource]}
        truncate
      />
    </div>
  );

  const statusTag = (statement: MedicationStatement) => (
    <Tags text={humanizeEnum(statement.status)} tone={STATUS_TONES[statement.status]} />
  );

  const rowActions = (statement: MedicationStatement, isCurrent: boolean) => (
    <div className="flex w-full items-center justify-center gap-1">
      {statement.status !== "ENTERED_IN_ERROR" && (
        <>
          <IconAction
            icon={Pencil}
            label={`Edit ${statement.medicationName}`}
            onClick={() => setOpenAction({ kind: "edit", statement })}
          />
          {isCurrent && (
            <IconAction
              icon={CircleStop}
              tone="danger"
              label={`Stop ${statement.medicationName}`}
              onClick={() => setOpenAction({ kind: "stop", statement })}
            />
          )}
          <IconAction
            icon={Ban}
            tone="danger"
            label={`Mark ${statement.medicationName} as entered in error`}
            onClick={() => setOpenAction({ kind: "enteredInError", statement })}
          />
        </>
      )}
    </div>
  );

  const currentColumns: TableColumn[] = [
    col("name", "Medication"),
    col("dosage", "Dosage & Frequency"),
    col("start", "Start Date"),
    col("status", "Status"),
    col("note", "Note"),
    ...(canWrite ? [ACTIONS_COL] : []),
  ];
  const historyColumns: TableColumn[] = [
    col("name", "Medication"),
    col("dosage", "Dosage & Frequency"),
    col("start", "Start Date"),
    col("end", "End Date"),
    col("status", "Status"),
    col("reason", "Reason"),
    ...(canWrite ? [ACTIONS_COL] : []),
  ];

  const currentRows = current.map((statement) => ({
    name: nameCell(statement),
    dosage: <Content title={statement.dosageText ?? "—"} truncate />,
    start: <Content title={dateOrDash(statement.startDate)} truncate />,
    status: statusTag(statement),
    note: <Content title={statement.note ?? "—"} truncate />,
    actions: rowActions(statement, true),
  }));
  const historyRows = history.map((statement) => ({
    name: nameCell(statement),
    dosage: <Content title={statement.dosageText ?? "—"} truncate />,
    start: <Content title={dateOrDash(statement.startDate)} truncate />,
    end: <Content title={dateOrDash(statement.endDate)} truncate />,
    status: statusTag(statement),
    reason: <Content title={statement.statusReason ?? "—"} truncate />,
    actions: rowActions(statement, false),
  }));

  const renderTable = (
    columns: TableColumn[],
    rows: Record<string, React.ReactNode>[],
    emptyMessage: string,
  ) => {
    if (record.patientId === patientId && record.status === "failed" && !statements) {
      return (
        <TableStatus
          variant="error"
          message={record.error?.message}
          onRetry={() => dispatch(fetchMedications(patientId))}
        />
      );
    }
    if (!statements) return <TableStatus variant="loading" message="Loading medications…" />;
    if (rows.length === 0) return <TableStatus variant="empty" message={emptyMessage} />;
    return (
      <ScrollArea>
        <Table columns={columns} rows={rows} />
      </ScrollArea>
    );
  };

  /** Runs a stop / entered-in-error change; resolves to an error message or null. */
  const submitReason = async (
    statement: MedicationStatement,
    kind: "stop" | "enteredInError",
    values: { reason: string; date: string },
  ): Promise<string | null> => {
    const result = await dispatch(
      kind === "stop"
        ? changeMedication({
            patientId,
            kind: "stop",
            statementId: statement.id,
            reason: values.reason,
            endDate: values.date || undefined,
          })
        : changeMedication({
            patientId,
            kind: "enteredInError",
            statementId: statement.id,
            reason: values.reason,
          }),
    );
    return changeMedication.fulfilled.match(result)
      ? null
      : (result.payload?.message ?? "The change could not be saved.");
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      <SectionCard
        className="!h-auto max-h-[500px]"
        icon={Pill}
        tone="blue"
        title="Current Medications"
        subtitle="Medications the patient is currently taking."
        action={
          canWrite ? (
            <AddButton text="Add Medication" onClick={() => setOpenAction({ kind: "edit", statement: null })} />
          ) : undefined
        }
      >
        {renderTable(currentColumns, currentRows, "No current medications.")}
      </SectionCard>

      <SectionCard
        className="!h-auto max-h-[420px]"
        icon={Clock}
        tone="violet"
        title="Medication History"
        subtitle="Stopped, completed and corrected entries. Entries are never deleted."
      >
        {renderTable(historyColumns, historyRows, "No medication history.")}
      </SectionCard>

      {openAction?.kind === "edit" && (
        <MedicationModal
          key={openAction.statement?.id ?? "new"}
          patientId={patientId}
          statement={openAction.statement}
          onClose={() => setOpenAction(null)}
        />
      )}
      {openAction?.kind === "stop" && (
        <ReasonModal
          title="Stop Medication"
          subtitle={openAction.statement.medicationName}
          submitText="Stop Medication"
          reasonLabel="Reason for stopping"
          dateLabel="End Date"
          minDate={openAction.statement.startDate || undefined}
          maxDate={todayISO()}
          onSubmit={(values) => submitReason(openAction.statement, "stop", values)}
          onClose={() => setOpenAction(null)}
        />
      )}
      {openAction?.kind === "enteredInError" && (
        <ReasonModal
          title="Mark as Entered in Error"
          subtitle={`${openAction.statement.medicationName} will stay in the history, marked as an error.`}
          submitText="Mark as Error"
          reasonLabel="What was wrong"
          onSubmit={(values) => submitReason(openAction.statement, "enteredInError", values)}
          onClose={() => setOpenAction(null)}
        />
      )}
    </div>
  );
};

export default Medications;
