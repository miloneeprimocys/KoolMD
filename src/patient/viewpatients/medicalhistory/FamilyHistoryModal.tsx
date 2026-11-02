"use client";

import React, { useState } from "react";
import ModalShell, {
  FormGrid,
  FullRow,
  ModalTextarea,
  OptLabel,
  ReqLabel,
  SignupDropdown,
  SignupField,
} from "@/components/Modalshell";
import type { FamilyHistoryEntry, FamilyRelationship } from "@/types/patient";
import { humanizeEnum } from "@/utils/formatters";
import { useHistoryChange } from "./useHistoryChange";

export const FAMILY_RELATIONSHIPS: FamilyRelationship[] = [
  "MOTHER",
  "FATHER",
  "SISTER",
  "BROTHER",
  "DAUGHTER",
  "SON",
  "GRANDMOTHER",
  "GRANDFATHER",
  "AUNT",
  "UNCLE",
  "COUSIN",
  "OTHER",
];
const RELATIONSHIP_OPTIONS = FAMILY_RELATIONSHIPS.map((value) => ({ value, label: humanizeEnum(value) }));
/** "" = unknown (sent as null). */
const CAUSE_OF_DEATH_OPTIONS = [
  { value: "", label: "Unknown" },
  { value: "true", label: "Yes" },
  { value: "false", label: "No" },
];

interface FamilyHistoryModalProps {
  patientId: string;
  /** Entry being edited; null records a new one. */
  entry: FamilyHistoryEntry | null;
  onClose: () => void;
}

/** Records or corrects a relative's condition. Mount only while open, with a `key` per entry. */
const FamilyHistoryModal = ({ patientId, entry, onClose }: FamilyHistoryModalProps) => {
  const { save, isSaving, saveError, fieldErrors } = useHistoryChange();
  const [relationship, setRelationship] = useState<FamilyRelationship | "">(entry?.relationship ?? "");
  const [relationDetails, setRelationDetails] = useState(entry?.relationDetails ?? "");
  const [conditionName, setConditionName] = useState(entry?.conditionName ?? "");
  const [onsetAge, setOnsetAge] = useState(entry?.onsetAge?.toString() ?? "");
  const [causeOfDeath, setCauseOfDeath] = useState(
    entry?.causeOfDeath === null || entry?.causeOfDeath === undefined ? "" : String(entry.causeOfDeath),
  );
  const [note, setNote] = useState(entry?.note ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSave = async () => {
    const nextErrors: Record<string, string> = {};
    if (!relationship) nextErrors.relationship = "Relationship is required.";
    if (!conditionName.trim()) nextErrors.conditionName = "Condition is required.";
    const age = onsetAge.trim() === "" ? null : Number(onsetAge);
    if (age !== null && (!Number.isInteger(age) || age < 0 || age > 130)) {
      nextErrors.onsetAge = "Enter an age between 0 and 130.";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length || !relationship) return;

    const optional = (value: string) => value.trim() || (entry ? null : undefined);
    const payload = {
      relationship,
      conditionName: conditionName.trim(),
      relationDetails: optional(relationDetails),
      onsetAge: age ?? (entry ? null : undefined),
      causeOfDeath: causeOfDeath === "" ? (entry ? null : undefined) : causeOfDeath === "true",
      note: optional(note),
    };
    const saved = entry
      ? await save({ patientId, kind: "updateEntry", section: "familyHistory", entryId: entry.id, payload })
      : await save({ patientId, kind: "createEntry", section: "familyHistory", payload });
    if (saved) onClose();
  };

  const errorFor = (field: string) => errors[field] ?? fieldErrors[field];

  return (
    <ModalShell
      open
      onClose={() => !isSaving && onClose()}
      onSubmit={handleSave}
      title={entry ? "Edit Family History" : "Add Family History"}
      subtitle="A condition of a blood relative."
      submitText={entry ? "Save Changes" : "Add Family History"}
      isSubmitting={isSaving}
      errorMessage={saveError}
    >
      <FormGrid>
        <SignupDropdown
          name="relationship"
          label={<ReqLabel>Relative</ReqLabel>}
          placeholder="Select relative"
          options={RELATIONSHIP_OPTIONS}
          value={relationship}
          onChange={(value) => setRelationship(value as FamilyRelationship)}
          error={errorFor("relationship")}
          portalMenu
          portalMenuZIndex={1000}
        />
        <SignupField
          name="relationDetails"
          label={<OptLabel>Relation Details</OptLabel>}
          placeholder="e.g. Maternal"
          value={relationDetails}
          onChange={(event) => setRelationDetails(event.target.value)}
          error={errorFor("relationDetails")}
          maxLength={200}
        />
        <FullRow>
          <SignupField
            name="conditionName"
            label={<ReqLabel>Condition</ReqLabel>}
            placeholder="e.g. Type 2 diabetes"
            value={conditionName}
            onChange={(event) => setConditionName(event.target.value)}
            error={errorFor("conditionName")}
            maxLength={300}
          />
        </FullRow>
        <SignupField
          name="onsetAge"
          type="number"
          label={<OptLabel>Age at Diagnosis</OptLabel>}
          placeholder="e.g. 55"
          value={onsetAge}
          onChange={(event) => setOnsetAge(event.target.value)}
          error={errorFor("onsetAge")}
          min={0}
          max={130}
        />
        <SignupDropdown
          name="causeOfDeath"
          label={<OptLabel>Cause of Death</OptLabel>}
          options={CAUSE_OF_DEATH_OPTIONS}
          value={causeOfDeath}
          onChange={setCauseOfDeath}
          portalMenu
          portalMenuZIndex={1000}
        />
        <FullRow>
          <ModalTextarea
            id="note"
            label={<OptLabel>Notes</OptLabel>}
            value={note}
            onChange={setNote}
            error={errorFor("note")}
            maxLength={2000}
          />
        </FullRow>
      </FormGrid>
    </ModalShell>
  );
};

export default FamilyHistoryModal;
