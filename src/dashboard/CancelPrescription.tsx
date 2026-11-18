"use client";

import React, { useState } from "react";
import { XCircle } from "lucide-react";

import DeleteButton from "@/components/DeleteButton";
import DeleteDialog from "@/components/Deletedialog";
import { type Rx } from "./PrescriptionHistoryPage";

const SAMPLE: Rx = {
  id: "rx1",
  name: "Amoxicillin",
  dosage: "500 mg",
  date: "Oct 28, 2026",
  status: "Sent",
  prescribedBy: "Dr. Sarah Wilson",
};

type Props = {
  open: boolean;
  onClose: () => void;
  /** Prescription being changed (falls back to the sample so the dialog always renders). */
  prescription?: Rx;
  /** Your API call. Return `false` (or throw) to keep the dialog open. Omitted = short fake delay (static mode). */
  onConfirm?: (id: string) => Promise<boolean | void>;
  /** Called after success: update the list / show a toast. */
  onDone?: (id: string) => void;
};

const CancelPrescription = ({ open, onClose, prescription = SAMPLE, onConfirm, onDone }: Props) => {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const ok = onConfirm
        ? await onConfirm(prescription.id)
        : await new Promise<boolean>((resolve) => setTimeout(() => resolve(true), 600));
      if (ok === false) return;
      onDone?.(prescription.id);
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
      onConfirm={handleConfirm}
      loading={loading}
      icon={<XCircle className="h-7 w-7" />}
      confirmButton={
        <DeleteButton
          text="Cancel Prescription"
          onClick={handleConfirm}
          loading={loading}
          loadingText="Cancelling…"
          className="sm:w-auto sm:min-w-[170px]"
        />
      }
      title="Cancel Prescription?"
      description="Are you sure you want to cancel this prescription? The pharmacy will be notified and it will no longer be filled."
      details={[
        { label: "Medication", value: `${prescription.name} ${prescription.dosage}` },
        { label: "Prescribed Date", value: prescription.date },
        { label: "Prescribed By", value: prescription.prescribedBy },
        { label: "Current Status", value: prescription.status },
      ]}
      cancelText="Keep Prescription"
      confirmText="Cancel Prescription"
      loadingText="Cancelling…"
    />
  );
};

export default CancelPrescription;