"use client";

import React, { useEffect, useState } from "react";

import ModalShell, { ModalTextarea } from "@/components/Modalshell";

type RequestAccessModalProps = {
  open: boolean;
  moduleName: string | null;
  onClose: () => void;
  onSubmit: (reason: string) => void;
};

const RequestAccessModal = ({ open, moduleName, onClose, onSubmit }: RequestAccessModalProps) => {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (open) setReason("");
  }, [open, moduleName]);

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      onSubmit={() => onSubmit(reason.trim())}
      title="Request Access"
      subtitle="Provide a reason for requesting access to this module."
      submitText="Submit Request"
      width={520}
    >
      <div className="space-y-4">
        <div className="rounded-xl border border-border bg-primary/[0.04] px-4 py-3">
          <p className="text-xs font-medium text-body">Module</p>
          <p className="mt-1 text-sm font-semibold text-heading">{moduleName ?? "Restricted module"}</p>
        </div>
        <ModalTextarea
          id="access-request-reason"
          label="Reason for request"
          value={reason}
          onChange={setReason}
          placeholder="Explain why you need access..."
          maxLength={500}
        />
      </div>
    </ModalShell>
  );
};

export default RequestAccessModal;
