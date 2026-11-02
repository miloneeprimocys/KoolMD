"use client";

import React from "react";

import ImportButton from "@/components/ImportButton";
import ModalShell from "@/components/Modalshell";

export type DetailField = { label: string; value: React.ReactNode };

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  fields: DetailField[];
}

const DetailsModal = ({ open, onClose, title, subtitle, fields }: Props) => (
  <ModalShell
    open={open}
    onClose={onClose}
    title={title}
    subtitle={subtitle}
    width={560}
    footer={
      <div className="flex justify-end">
        <ImportButton text="Close" icon={null} onClick={onClose} />
      </div>
    }
  >
    <dl>
      {fields.map((f) => (
        <div
          key={f.label}
          className="grid grid-cols-1 gap-0.5 border-t border-divider py-3 first:border-t-0 first:pt-0 sm:grid-cols-[160px_minmax(0,1fr)] sm:gap-4"
        >
          <dt className="text-xs text-body sm:text-sm">{f.label}</dt>
          <dd className="min-w-0 break-words text-sm font-medium text-heading">{f.value}</dd>
        </div>
      ))}
    </dl>
  </ModalShell>
);

export default DetailsModal;