"use client";

import React, { useState } from "react";

import DeleteButton from "@/components/DeleteButton";
import DeleteDialog from "@/components/Deletedialog";
import Tags from "@/components/Tags";
import { withNote, type Medication } from "./ViewMedication";

type Props = {
  open: boolean;
  onClose: () => void;
  medication: Medication | null;
  /** Your delete call. Return `false` (or throw) to keep the dialog open. */
  onConfirm?: (id: string) => Promise<boolean | void>;
  /** Called after a successful delete. */
  onDeleted?: (id: string) => void;
};

const DeleteMedication = ({ open, onClose, medication, onConfirm, onDeleted }: Props) => {
  const [loading, setLoading] = useState(false);

  if (!medication) return null;

  const handleDelete = async () => {
    if (loading) return;
    setLoading(true);
    try {
      // TODO: replace the fallback with your delete-medication API call
      const ok = onConfirm
        ? await onConfirm(medication.id)
        : await new Promise<boolean>((resolve) => setTimeout(() => resolve(true), 400));
      if (ok === false) return;
      onDeleted?.(medication.id);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DeleteDialog
      open={open}
      onClose={onClose}
      onConfirm={handleDelete}
      loading={loading}
      confirmButton={
        <DeleteButton
          text="Delete Medication"
          onClick={handleDelete}
          loading={loading}
          loadingText="Deleting…"
          className="sm:w-auto sm:min-w-[190px]"
        />
      }
      title="Delete Medication?"
      description={
        <>
          This will permanently remove <span className="font-semibold text-heading">{medication.name}</span> from the
          patient&apos;s current medications list.
        </>
      }
      details={[
        { label: "Medication", value: medication.name },
        { label: "Condition", value: medication.condition || "—" },
        { label: "Dosage", value: withNote(medication.dosage, medication.dosageNote) },
        {
          label: "Status",
          value: <Tags text={medication.status} tone={medication.status === "Active" ? "success" : "neutral"} />,
        },
      ]}
      cancelText="Cancel"
      confirmText="Delete Medication"
      loadingText="Deleting…"
    />
  );
};

export default DeleteMedication;