"use client";

import React, { useState } from "react";

import DeleteButton from "@/components/DeleteButton";
import DeleteDialog from "@/components/Deletedialog";
import Tags from "@/components/Tags";
import { SEVERITY_TONE, formatDate, type Allergy } from "./ViewAllergy";

type Props = {
  open: boolean;
  onClose: () => void;
  allergy: Allergy | null;
  /** Your delete call. Return `false` (or throw) to keep the dialog open. */
  onConfirm?: (id: string) => Promise<boolean | void>;
  /** Called after a successful delete. */
  onDeleted?: (id: string) => void;
};

const DeleteAllergy = ({ open, onClose, allergy, onConfirm, onDeleted }: Props) => {
  const [loading, setLoading] = useState(false);

  if (!allergy) return null;

  const handleDelete = async () => {
    if (loading) return;
    setLoading(true);
    try {
      // TODO: replace the fallback with your delete-allergy API call
      const ok = onConfirm
        ? await onConfirm(allergy.id)
        : await new Promise<boolean>((resolve) => setTimeout(() => resolve(true), 400));
      if (ok === false) return;
      onDeleted?.(allergy.id);
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
          text="Delete Allergy"
          onClick={handleDelete}
          loading={loading}
          loadingText="Deleting…"
          className="sm:w-auto sm:min-w-[170px]"
        />
      }
      title="Delete Allergy?"
      description={
        <>
          Are you sure you want to delete this allergy? This will permanently remove{" "}
          <span className="font-semibold text-heading">{allergy.allergen}</span> from the patient&apos;s allergy list.
          This action cannot be undone.
        </>
      }
      details={[
        { label: "Allergen", value: allergy.allergen },
        { label: "Type", value: allergy.type },
        { label: "Reaction", value: allergy.reaction || "—" },
        { label: "Severity", value: <Tags text={allergy.severity} tone={SEVERITY_TONE[allergy.severity]} /> },
        { label: "Date Identified", value: formatDate(allergy.dateIdentified) },
      ]}
      cancelText="Cancel"
      confirmText="Delete Allergy"
      loadingText="Deleting…"
    />
  );
};

export default DeleteAllergy;