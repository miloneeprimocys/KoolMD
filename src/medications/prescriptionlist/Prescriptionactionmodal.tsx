"use client";

import React, { useState } from "react";

import ModalShell, { ReqLabel } from "@/components/Modalshell";
import { TextArea } from "@/providers/Shared";

export type RxActionMode = "cancel" | "discontinue" | "note";

const CONFIG: Record<RxActionMode, { title: string; label: string; placeholder: string; submit: string; error: string }> = {
  cancel: {
    title: "Cancel Prescription",
    label: "Reason for cancellation",
    placeholder: "Enter reason for cancelling this prescription...",
    submit: "Cancel Prescription",
    error: "Reason is required",
  },
  discontinue: {
    title: "Mark as Discontinued",
    label: "Reason for discontinuation",
    placeholder: "Enter reason for discontinuing this medication...",
    submit: "Mark as Discontinued",
    error: "Reason is required",
  },
  note: {
    title: "Add Note",
    label: "Note",
    placeholder: "Enter note...",
    submit: "Save Note",
    error: "Note is required",
  },
};

interface Props {
  open: boolean;
  mode: RxActionMode;
  medication: string;
  onClose: () => void;
  onConfirm: (text: string) => void;
}

const PrescriptionActionModal = ({ open, mode, medication, onClose, onConfirm }: Props) => {
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const cfg = CONFIG[mode];

  const handleClose = () => {
    onClose();
    setText("");
    setError("");
  };

  const handleSubmit = () => {
    if (!text.trim()) {
      setError(cfg.error);
      return;
    }
    onConfirm(text.trim());
    setText("");
    setError("");
  };

  return (
    <ModalShell
      open={open}
      onClose={handleClose}
      onSubmit={handleSubmit}
      title={cfg.title}
      subtitle={medication}
      submitText={cfg.submit}
      width={520}
    >
      <TextArea
        name="rxAction"
        label={<ReqLabel>{cfg.label}</ReqLabel>}
        placeholder={cfg.placeholder}
        value={text}
        onChange={(v) => {
          setText(v);
          setError("");
        }}
        maxLength={500}
        rows={5}
        error={error}
      />
    </ModalShell>
  );
};

export default PrescriptionActionModal;