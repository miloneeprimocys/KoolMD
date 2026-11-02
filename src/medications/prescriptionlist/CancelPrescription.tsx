// components/medication/CancelPrescription.tsx
"use client";

import React, { useState } from "react";
import { XCircle } from "lucide-react";

import DeleteButton from "@/components/DeleteButton";
import DeleteDialog from "@/components/Deletedialog";

export type PrescriptionToCancel = {
  id: string;
  name: string;
  dosage: string;
  date: string;
  status: string;
  prescribedBy: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  prescription?: PrescriptionToCancel;
  onConfirm?: (id: string) => Promise<boolean | void>;
  onCancelled?: (id: string) => void;
};

const CancelPrescription = ({ open, onClose, prescription, onConfirm, onCancelled }: Props) => {
  const [loading, setLoading] = useState(false);

  const handleCancel = async () => {
    if (loading || !prescription) return;
    setLoading(true);
    try {
      const ok = onConfirm
        ? await onConfirm(prescription.id)
        : await new Promise<boolean>((r) => setTimeout(() => r(true), 600));
      if (ok === false) return;
      onCancelled?.(prescription.id);
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DeleteDialog
      open={open}
      onClose={onClose}
      onConfirm={handleCancel}
      loading={loading}
      icon={<XCircle className="h-7 w-7" />}
      confirmButton={
        <DeleteButton
          text="Cancel Prescription"
          onClick={handleCancel}
          loading={loading}
          loadingText="Cancelling…"
          className="sm:w-auto sm:min-w-[190px]"
        />
      }
      title="Cancel Prescription?"
      description="Are you sure you want to cancel this prescription? The patient will be notified and the prescription will no longer be dispensable."
      details={
        prescription
          ? [
              { label: "Medication", value: prescription.name },
              { label: "Dosage", value: prescription.dosage },
              { label: "Prescribed Date", value: prescription.date },
              { label: "Prescribed By", value: prescription.prescribedBy },
              { label: "Current Status", value: prescription.status },
            ]
          : []
      }
      cancelText="Keep Prescription"
      confirmText="Cancel Prescription"
      loadingText="Cancelling…"
    />
  );
};

export default CancelPrescription;