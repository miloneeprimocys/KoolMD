"use client";

import React, { useState } from "react";
import { Trash2 } from "lucide-react";

import ImportButton from "@/components/ImportButton";
import DeleteButton from "@/components/DeleteButton";
import ModalShell from "@/components/Modalshell";
import Tags from "@/components/Tags";
import type { PayerId } from "./Payerids";

type Props = {
  open: boolean;
  onClose: () => void;
  payer: PayerId | null;
  /** Your delete call. Return `false` (or throw) to keep the modal open. */
  onConfirm?: (id: string) => Promise<boolean | void>;
  /** Called after a successful delete. */
  onDeleted?: (id: string) => void;
};

const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="grid grid-cols-[120px_minmax(0,1fr)] items-center gap-3 text-sm sm:grid-cols-[140px_minmax(0,1fr)]">
    <dt className="text-body">{label}</dt>
    <dd className="font-medium text-heading">{children}</dd>
  </div>
);

const DeletePayerId = ({ open, onClose, payer, onConfirm, onDeleted }: Props) => {
  const [loading, setLoading] = useState(false);

  if (!payer) return null;

  const close = () => {
    if (!loading) onClose();
  };

  const handleDelete = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const ok = onConfirm
        ? await onConfirm(payer.id)
        : await new Promise<boolean>((resolve) => setTimeout(() => resolve(true), 500));
      if (ok === false) return;
      onDeleted?.(payer.id);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalShell
      open={open}
      onClose={close}
      title="Delete Payer ID"
      titleId="delete-payer-id-title"
      width={560}
      footer={
        <div className="flex items-center justify-center gap-3 sm:justify-end">
          <ImportButton text="Cancel" icon={null} onClick={close} />
          <DeleteButton
            text="Delete Payer ID"
            onClick={handleDelete}
            loading={loading}
            loadingText="Deleting…"
            className="sm:w-auto sm:min-w-[170px]"
          />
        </div>
      }
    >
      {/* Warning */}
      <div className="flex items-start gap-4 rounded-xl border border-danger/20 bg-danger/10 p-4">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-danger/15 text-danger">
          <Trash2 className="h-6 w-6" />
        </span>
        <div className="min-w-0">
          <h4 className="text-base font-semibold text-danger">Are you sure you want to delete this payer ID?</h4>
          <p className="mt-1 text-sm leading-relaxed text-body">
            This action cannot be undone. Deleting this payer ID will remove it from this clearinghouse account, and
            it will no longer be used for eligibility verification or claim submission.
          </p>
        </div>
      </div>

      {/* Payer summary */}
      <div className="rounded-xl border border-border bg-primary/[0.04] p-4">
        <p className="text-base font-semibold text-heading">{payer.name}</p>
        <p className="text-xs text-body">Payer ID: {payer.payerId}</p>

        <dl className="mt-4 space-y-3">
          <Row label="Payer Type">{payer.type}</Row>
          <Row label="Eligibility">{payer.eligibility ? "Yes" : "No"}</Row>
          <Row label="Claims">{payer.claims ? "Yes" : "No"}</Row>
          <Row label="Status">
            <Tags text={payer.status} tone={payer.status === "Active" ? "success" : "danger"} />
          </Row>
          <Row label="Added On">
            {payer.addedDate}, {payer.addedTime}
          </Row>
        </dl>
      </div>
    </ModalShell>
  );
};

export default DeletePayerId;