"use client";

import React from "react";
import { Info, Pill } from "lucide-react";

import Table from "@/components/Table";
import { type TableColumn } from "@/components/Tableheader";
import Content from "@/components/Content";
import Actions from "@/components/Actions";
import SignupDropdown from "@/components/SignupDropdown";
import SignupField from "@/components/SignupField";

export type ConfirmRow = { id: string; name: string; dosage: string };
export type Answer = { status: string; note: string };

const STATUSES = ["Taking", "Taking as needed", "Not taking"];

const STATUS_TONE: Record<string, { trigger: string; text: string }> = {
  Taking: { trigger: "!border-success/40 !bg-success/10", text: "text-success" },
  "Taking as needed": { trigger: "!border-warning/40 !bg-warning/10", text: "text-warning" },
  "Not taking": { trigger: "!border-danger/40 !bg-danger/10", text: "text-danger" },
};

/* Static starting answers (replace with API data) */
const DEFAULTS: Record<string, Answer> = {
  Lisinopril: { status: "Taking", note: "Patient taking regularly" },
  Metformin: { status: "Taking", note: "No issues" },
  Atorvastatin: { status: "Taking", note: "Continue" },
  "Albuterol Inhaler": { status: "Taking as needed", note: "Uses only during allergy" },
  Omeprazole: { status: "Not taking", note: "Stopped due to side effects" },
  "Vitamin D3": { status: "Taking", note: "Over the counter" },
};
export const getAnswer = (row: ConfirmRow, answers: Record<string, Answer>): Answer =>
  answers[row.id] ?? DEFAULTS[row.name] ?? { status: "Taking", note: "" };

interface Props {
  rows: ConfirmRow[];
  answers: Record<string, Answer>;
  onAnswer: (id: string, answer: Answer) => void;
}

const PatientConfirmation = ({ rows: list, answers, onAnswer }: Props) => {
  const columns: TableColumn[] = [
    { key: "medication", label: "Medication" },
    { key: "dosage", label: "Dosage" },
    { key: "status", label: "Status (Currently Taking?)" },
    { key: "notes", label: "Notes (Optional)" },
    { key: "actions", label: "Actions", header: <div className="flex w-full items-center justify-center">Actions</div> },
  ];

  const rows = list.map((r) => {
    const a = getAnswer(r, answers);
    return {
      medication: (
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Pill className="h-4 w-4" />
          </span>
          <Content title={r.name} />
        </div>
      ),
      dosage: <Content title={r.dosage} />,
      status: (
        <SignupDropdown
          name={`status-${r.id}`}
          placeholder={`Status for ${r.name}`}
          options={STATUSES.map((status) => ({ value: status, label: status }))}
          value={a.status}
          onChange={(status) => onAnswer(r.id, { ...a, status })}
          searchable={false}
          compact
          triggerClassName={`!h-8 !min-h-8 !rounded-lg !px-2.5 !pr-8 !text-xs font-medium ${STATUS_TONE[a.status]?.trigger ?? ""}`}
          chevronClassName={`${STATUS_TONE[a.status]?.text ?? ""} !bg-transparent`}
          renderSelected={(option) => <span className={STATUS_TONE[option.value]?.text ?? "text-heading"}>{option.label}</span>}
          renderOption={(option) => <span className={STATUS_TONE[option.value]?.text ?? "text-heading"}>{option.label}</span>}
        />
      ),
      notes: (
        <SignupField
          name={`notes-${r.id}`}
          aria-label={`Notes for ${r.name}`}
          value={a.note}
          maxLength={120}
          placeholder="Add note"
          onChange={(e) => onAnswer(r.id, { ...a, note: e.target.value })}
          className="min-w-[160px]"
          inputClassName="!h-8 !rounded-lg !px-2.5 !text-xs"
        />
      ),
      actions: (
        <div className="flex w-full items-center justify-center">
          <Actions actions={["more"]} size="sm" onAction={() => {}} />
        </div>
      ),
    };
  });

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2 rounded-xl border border-primary/30 bg-primary/5 p-3 text-xs text-primary sm:text-sm">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        Confirm with the patient which of the following medications they are currently taking.
      </div>
      <div className="overflow-hidden rounded-[14px] border border-border bg-card">
        <Table columns={columns} rows={rows} bordered={false} />
      </div>
    </div>
  );
};

export default PatientConfirmation;
