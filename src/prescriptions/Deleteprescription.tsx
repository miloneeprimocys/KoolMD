"use client";

import React, { useState } from "react";

import DeleteButton from "@/components/DeleteButton";
import DeleteDialog from "@/components/Deletedialog";
import type { PrescriptionToDelete } from "@/redux/slices/dialogslice";

/* ---------- Types + sample data ---------- */
export type { PrescriptionToDelete } from "@/redux/slices/dialogslice";

const SAMPLE: PrescriptionToDelete = {
  id: "RX-000125",
  patient: "milonee primocys",
  age: 21,
  gender: "Female",
  medication: "Amoxicillin 500 mg",
  prescribedDate: "Oct 6, 2026",
  prescribedBy: "Dr. Sarah Johnson",
};

type Props = {
  open: boolean;
  onClose: () => void;
  /** Prescription being deleted (falls back to the sample so the dialog always renders). */
  prescription?: PrescriptionToDelete;
  /**
   * Your delete call. Return `false` (or throw) to keep the dialog open;
   * anything else closes it. When omitted, a short fake delay is used (static mode).
   */
  onConfirm?: (id: string) => Promise<boolean | void>;
  /** Called after a successful delete — use it to refresh the list / show a toast. */
  onDeleted?: (id: string) => void;
};

/* ---------- Component ---------- */
const DeletePrescription = ({
  open,
  onClose,
  prescription = SAMPLE,
  onConfirm,
  onDeleted,
}: Props) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const ok = onConfirm
        ? await onConfirm(prescription.id)
        : await new Promise<boolean>((resolve) => setTimeout(() => resolve(true), 600));
      if (ok === false) return;
      onDeleted?.(prescription.id);
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
          text="Delete Prescription"
          onClick={handleDelete}
          loading={loading}
          loadingText="Deleting…"
          className="sm:w-auto sm:min-w-[170px]"
        />
      }
      title="Delete Prescription?"
      description="Are you sure you want to delete this prescription? This action cannot be undone and the prescription will be permanently removed from the system."
      details={[
        { label: "Prescription ID", value: prescription.id },
        {
          label: "Patient",
          value: `${prescription.patient} (${prescription.age} years, ${prescription.gender})`,
        },
        { label: "Medication", value: prescription.medication },
        { label: "Prescribed Date", value: prescription.prescribedDate },
        { label: "Prescribed By", value: prescription.prescribedBy },
      ]}
      cancelText="Cancel"
      confirmText="Delete Prescription"
      loadingText="Deleting…"
    />
  );
};

export default DeletePrescription;