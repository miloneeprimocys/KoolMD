"use client";

import React, { useState } from "react";

import DeleteButton from "@/components/DeleteButton";
import DeleteDialog from "@/components/Deletedialog";
import type { LicenseToDelete } from "@/redux/slices/dialogslice";

type Props = {
  open: boolean;
  onClose: () => void;
  license: LicenseToDelete | null;
  onDeleted?: (id: string) => void;
};

const DeleteLicense = ({ open, onClose, license, onDeleted }: Props) => {
  const [loading, setLoading] = useState(false);

  if (!license) return null;

  const handleDelete = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      onDeleted?.(license.id);
      onClose();
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
          text="Delete License"
          onClick={handleDelete}
          loading={loading}
          loadingText="Deleting�"
          className="sm:w-auto sm:min-w-[170px]"
        />
      }
      title="Delete License?"
      description="Are you sure you want to delete this license? This action cannot be undone."
      details={[
        { label: "Provider", value: license.provider },
        { label: "License No.", value: license.licenseNumber },
        { label: "State", value: license.state },
        ...(license.licenseType ? [{ label: "Type", value: license.licenseType }] : []),
      ]}
      confirmText="Delete License"
      loadingText="Deleting�"
    />
  );
};

export default DeleteLicense;
