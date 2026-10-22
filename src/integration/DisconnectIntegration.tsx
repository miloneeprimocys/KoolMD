"use client";

import React from "react";
import { Unplug } from "lucide-react";

import DeleteButton from "@/components/DeleteButton";
import DeleteDialog from "@/components/Deletedialog";

type DisconnectIntegrationProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

const DisconnectIntegration = ({
  open,
  onClose,
  onConfirm,
}: DisconnectIntegrationProps) => (
  <DeleteDialog
    open={open}
    onClose={onClose}
    onConfirm={onConfirm}
    icon={<Unplug className="h-7 w-7" />}
    title="Disconnect Integration?"
    description="Are you sure you want to disconnect Lab Integration (M13)? Lab orders and results will stop syncing until the integration is connected again. Your configuration and mappings will be retained."
    details={[
      { label: "Integration", value: "Lab Integration (M13)" },
      { label: "Adapter Type", value: "FHIR R4 (Recommended)" },
      { label: "Status", value: "Connected" },
    ]}
    cancelText="Keep Connected"
    confirmText="Disconnect Integration"
    confirmButton={
      <DeleteButton
        text="Disconnect Integration"
        icon={<Unplug className="h-4 w-4" />}
        onClick={onConfirm}
        className="sm:w-auto sm:min-w-[190px]"
      />
    }
  />
);

export default DisconnectIntegration;
