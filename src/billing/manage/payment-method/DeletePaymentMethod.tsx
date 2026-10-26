"use client";

import React, { useState } from "react";

import DeleteButton from "@/components/DeleteButton";
import DeleteDialog from "@/components/Deletedialog";
import type { Method } from "./PaymentMethods";

export type DeletablePaymentMethod = Pick<Method, "id" | "name" | "description" | "fee" | "active">;

type Props = {
  open: boolean;
  onClose: () => void;
  method: DeletablePaymentMethod | null;
  isDefault?: boolean;
  /** Your delete call. Return `false` (or throw) to keep the dialog open. */
  onConfirm?: (id: string) => Promise<boolean | void>;
  /** Called after a successful delete. */
  onDeleted?: (id: string) => void;
};

const DeletePaymentMethod = ({ open, onClose, method, isDefault = false, onConfirm, onDeleted }: Props) => {
  const [loading, setLoading] = useState(false);

  if (!method) return null;

  const handleDelete = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const ok = onConfirm
        ? await onConfirm(method.id)
        : await new Promise<boolean>((resolve) => setTimeout(() => resolve(true), 500));
      if (ok === false) return;
      onDeleted?.(method.id);
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
          text="Delete Method"
          onClick={handleDelete}
          loading={loading}
          loadingText="Deleting…"
          className="sm:w-auto sm:min-w-[170px]"
        />
      }
      title="Delete Payment Method?"
      description={
        isDefault
          ? "This is your default payment method. Deleting it cannot be undone and another method will need to be set as default."
          : "Are you sure you want to delete this payment method? This action cannot be undone and it will no longer be available for payments."
      }
      details={[
        { label: "Method", value: method.name },
        { label: "Description", value: method.description },
        { label: "Transaction Fee", value: method.fee },
        { label: "Status", value: method.active ? "Active" : "Inactive" },
      ]}
      cancelText="Cancel"
      confirmText="Delete Method"
      loadingText="Deleting…"
    />
  );
};

export default DeletePaymentMethod;
