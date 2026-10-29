"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";

import AddButton from "@/components/Addbutton";
import Table from "@/components/Table";
import { type TableColumn } from "@/components/Tableheader";
import Content from "@/components/Content";
import Tags from "@/components/Tags";
import Actions from "@/components/Actions";
import { cardCls } from "@/providers/Shared";

/* ---------------------------------------------------------------- */
/*  Static rules (replace with API data)                             */
/* ---------------------------------------------------------------- */
type Rule = { id: string; name: string; description: string; severity: "Error" | "Warning"; enabled: boolean };

const INITIAL_RULES: Rule[] = [
  { id: "1", name: "Required Patient", description: "Patient reference is required", severity: "Error", enabled: true },
  { id: "2", name: "Required Code", description: "Observation code is required", severity: "Error", enabled: true },
  { id: "3", name: "Valid Value Type", description: "Value must match data type", severity: "Error", enabled: true },
  { id: "4", name: "Effective Date", description: "Effective date cannot be in future", severity: "Warning", enabled: true },
  { id: "5", name: "Reference Range", description: "Validate against reference range", severity: "Warning", enabled: true },
  { id: "6", name: "Unit Required", description: "Unit is required for Quantity", severity: "Error", enabled: true },
  { id: "7", name: "Category Required", description: "Category must be provided", severity: "Error", enabled: true },
];

const COLUMNS: TableColumn[] = [
  { key: "name", label: "Rule Name" },
  { key: "description", label: "Description" },
  { key: "severity", label: "Severity" },
  { key: "status", label: "Status" },
  { key: "actions", label: "Actions", header: <div className="flex w-full items-center justify-center">Actions</div> },
];

const Switch = ({ on, label, onToggle }: { on: boolean; label: string; onToggle: () => void }) => (
  <button
    type="button"
    role="switch"
    aria-checked={on}
    aria-label={label}
    onClick={onToggle}
    className={`relative h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${
      on ? "bg-primary" : "bg-border"
    }`}
  >
    <span
      className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
        on ? "translate-x-5" : "translate-x-0"
      }`}
    />
  </button>
);

const FhirValidationRules = () => {
  const [rules, setRules] = useState<Rule[]>(INITIAL_RULES);

  const toggle = (id: string) => setRules((prev) => prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)));

  const rows = rules.map((r) => ({
    name: <Content title={r.name} />,
    description: <Content title={r.description} />,
    severity: <Tags text={r.severity} tone={r.severity === "Error" ? "danger" : "warning"} size="xs" />,
    status: <Switch on={r.enabled} label={`${r.name} ${r.enabled ? "enabled" : "disabled"}`} onToggle={() => toggle(r.id)} />,
    actions: (
      <div className="flex w-full items-center justify-center">
        <Actions actions={["more"]} size="sm" />
      </div>
    ),
  }));

  return (
    <section className={`${cardCls} space-y-4`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-heading">Observation - Validation Rules</h3>
          <p className="text-xs text-body sm:text-sm">Set validation rules for the resource.</p>
        </div>
        <AddButton
          text="Add Rule"
          icon={<Plus className="h-4 w-4" />}
          onClick={() => {
            /* TODO: open add rule form */
          }}
          className="whitespace-nowrap"
        />
      </div>

      <div className="overflow-hidden rounded-[14px] border border-border bg-card">
        <Table columns={COLUMNS} rows={rows} bordered={false} />
      </div>
    </section>
  );
};

export default FhirValidationRules;