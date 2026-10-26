"use client";

import React, { useState } from "react";

import DeleteButton from "@/components/DeleteButton";
import DeleteDialog from "@/components/Deletedialog";
import { formatPrice, type MembershipPlan } from "./Viewmembershipplan";

type Props = {
  open: boolean;
  onClose: () => void;
  plan: MembershipPlan | null;
  /** Your delete call. Return `false` (or throw) to keep the dialog open. */
  onConfirm?: (id: string) => Promise<boolean | void>;
  /** Called after a successful delete. */
  onDeleted?: (id: string) => void;
};

const DeletePlan = ({ open, onClose, plan, onConfirm, onDeleted }: Props) => {
  const [loading, setLoading] = useState(false);

  if (!plan) return null;

  const handleDelete = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const ok = onConfirm
        ? await onConfirm(plan.id)
        : await new Promise<boolean>((resolve) => setTimeout(() => resolve(true), 600));
      if (ok === false) return;
      onDeleted?.(plan.id);
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
          text="Delete Plan"
          onClick={handleDelete}
          loading={loading}
          loadingText="Deleting…"
          className="sm:w-auto sm:min-w-[170px]"
        />
      }
      title="Delete Membership Plan?"
      description="Are you sure you want to delete this membership plan? This action cannot be undone and the plan will be permanently removed from the system."
      details={[
        { label: "Plan Name", value: plan.name },
        { label: "Type", value: plan.type },
        { label: "Price", value: `${formatPrice(plan.price)} / ${plan.cycle}` },
        { label: "Status", value: plan.status },
        { label: "Active Members", value: String(plan.members) },
      ]}
      cancelText="Cancel"
      confirmText="Delete Plan"
      loadingText="Deleting…"
    />
  );
};

export default DeletePlan;