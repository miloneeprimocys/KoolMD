// components/medication/MarkAsDiscontinued.tsx
"use client";

import React, { useState } from "react";
import { Ban } from "lucide-react";

import AddButton from "@/components/Addbutton";
import DeleteDialog from "@/components/Deletedialog";

export type PrescriptionToDiscontinue = {
    id: string;
    name: string;
    dosage: string;
    date: string;
    status: string;
    prescribedBy: string;
};

type Props = {
    open: boolean;
    onClose: () => void;
    prescription?: PrescriptionToDiscontinue;
    onConfirm?: (id: string) => Promise<boolean | void>;
    onDiscontinued?: (id: string) => void;
};

const MarkAsDiscontinued = ({ open, onClose, prescription, onConfirm, onDiscontinued }: Props) => {
    const [loading, setLoading] = useState(false);

    const handleConfirm = async () => {
        if (loading || !prescription) return;
        setLoading(true);
        try {
            const ok = onConfirm
                ? await onConfirm(prescription.id)
                : await new Promise<boolean>((r) => setTimeout(() => r(true), 600));
            if (ok === false) return;
            onDiscontinued?.(prescription.id);
            onClose();
        } catch (e) {
            console.error(e);
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
            icon={<Ban className="h-7 w-7" />}
            confirmButton={
                <AddButton
                    text={loading ? "Updating…" : "Mark as Discontinued"}
                    icon={null}
                    onClick={handleConfirm}
                    disabled={loading}
                    className="w-full sm:w-auto sm:min-w-[210px]"
                />
            }
            title="Mark Prescription as Discontinued?"
            description="This will mark the prescription as discontinued. The patient should stop taking this medication unless told otherwise by the provider."
            details={
                prescription
                    ? [
                        { label: "Medication", value: prescription.name },
                        { label: "Dosage", value: prescription.dosage },
                        { label: "Prescribed Date", value: prescription.date },
                        { label: "Prescribed By", value: prescription.prescribedBy },
                        { label: "Current Status", value: prescription.status },
                    ]
                    : []
            }
            cancelText="Keep Active"
            confirmText="Mark as Discontinued"
            loadingText="Updating…"
        />
    );
};

export default MarkAsDiscontinued;