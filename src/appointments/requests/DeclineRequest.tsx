"use client";

import React, { useState } from "react";
import { CircleX } from "lucide-react";

import DeleteButton from "@/components/DeleteButton";
import DeleteDialog from "@/components/Deletedialog";
import { SAMPLE_REQUEST, type RequestInfo } from "./ApproveRequest";

type Props = {
  open: boolean;
  onClose: () => void;
  /** Request being declined (falls back to the sample so the dialog always renders). */
  request?: RequestInfo;
  /**
   * Your decline call. Return `false` (or throw) to keep the dialog open;
   * anything else closes it. When omitted, a short fake delay is used (static mode).
   */
  onConfirm?: (id: string) => Promise<boolean | void>;
  /** Called after a successful decline — use it to refresh the list / show a toast. */
  onDeclined?: (id: string) => void;
};

const DeclineRequest = ({
  open,
  onClose,
  request = SAMPLE_REQUEST,
  onConfirm,
  onDeclined,
}: Props) => {
  const [loading, setLoading] = useState(false);

  const handleDecline = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const ok = onConfirm
        ? await onConfirm(request.id)
        : await new Promise<boolean>((resolve) => setTimeout(() => resolve(true), 600));
      if (ok === false) return;
      onDeclined?.(request.id);
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
      onConfirm={handleDecline}
      loading={loading}
      icon={<CircleX className="h-7 w-7" />}
      confirmButton={
        <DeleteButton
          text="Decline Request"
          onClick={handleDecline}
          loading={loading}
          loadingText="Declining…"
          className="sm:w-auto sm:min-w-[170px]"
        />
      }
      title="Decline Request?"
      description="Are you sure you want to decline this appointment request? The patient will be notified by email and/or SMS."
      details={[
        { label: "Patient", value: `${request.patient} (${request.patientId})` },
        { label: "Age / Gender", value: `${request.age} years, ${request.gender}` },
        { label: "Requested", value: `${request.type} (${request.dept})` },
        { label: "Preferred Provider", value: request.provider },
        { label: "Preferred Date & Time", value: `${request.dateLabel}, ${request.time}` },
        { label: "Submitted On", value: request.submittedOn },
      ]}
      cancelText="Keep Request"
      confirmText="Decline Request"
      loadingText="Declining…"
    />
  );
};

export default DeclineRequest;