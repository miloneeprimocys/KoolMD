"use client";

import React, { useState } from "react";

import DeleteButton from "@/components/DeleteButton";
import DeleteDialog from "@/components/Deletedialog";
import { itemAmount, money, type InvoiceItem } from "./AddCustomItem";

type Props = {
  open: boolean;
  onClose: () => void;
  item: InvoiceItem | null;
  /** Your delete call. Return `false` (or throw) to keep the dialog open. */
  onConfirm?: (id: string) => Promise<boolean | void>;
  /** Called after a successful delete. */
  onDeleted?: (id: string) => void;
};

const DeleteCustomItem = ({ open, onClose, item, onConfirm, onDeleted }: Props) => {
  const [loading, setLoading] = useState(false);

  if (!item) return null;

  const handleDelete = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const ok = onConfirm
        ? await onConfirm(item.id)
        : await new Promise<boolean>((resolve) => setTimeout(() => resolve(true), 400));
      if (ok === false) return;
      onDeleted?.(item.id);
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
          text="Delete Item"
          onClick={handleDelete}
          loading={loading}
          loadingText="Deleting…"
          className="sm:w-auto sm:min-w-[170px]"
        />
      }
      title="Delete Invoice Item?"
      description="Are you sure you want to remove this item from the invoice? The invoice total will be updated."
      details={[
        { label: "Item", value: item.service },
        { label: "Description", value: item.description },
        { label: "Quantity", value: String(item.qty) },
        { label: "Unit Price", value: money(item.unitPrice) },
        { label: "Amount", value: money(itemAmount(item)) },
      ]}
      cancelText="Cancel"
      confirmText="Delete Item"
      loadingText="Deleting…"
    />
  );
};

export default DeleteCustomItem;