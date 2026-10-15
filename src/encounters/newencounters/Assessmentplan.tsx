"use client";

import React, { useState } from "react";
import { Plus, Search, Trash2 } from "lucide-react";

import Table from "@/components/Table";
import { type TableColumn } from "@/components/Tableheader";
import Content from "@/components/Content";
import InputActions from "@/components/InputActions";
import SignupDropdown, { DropdownOption } from "@/components/SignupDropdown";
import { ChipSelect, toOptions } from "@/providers/Shared";
import {
  StepHeader,
  TextAreaField,
  ghostBtn,
  iconBtn,
} from "@/components/Verticalsteps";

/* ---------- Static data ---------- */
type Dx = { id: number; code: string; name: string; type: string };

const INITIAL_DX: Dx[] = [
  { id: 1, code: "J06.9", name: "Acute upper respiratory infection, unspecified", type: "Primary" },
  { id: 2, code: "R05.1", name: "Acute cough", type: "Secondary" },
  { id: 3, code: "Z71.9", name: "Counseling, unspecified", type: "Secondary" },
];

const DX_TYPES: DropdownOption[] = [
  { value: "Primary", label: "Primary" },
  { value: "Secondary", label: "Secondary" },
];

const EDUCATION = toOptions([
  "Hydration",
  "Rest and sleep",
  "Hand hygiene",
  "When to seek medical care",
  "Medication adherence",
  "Diet and nutrition",
]);

const COLUMNS: TableColumn[] = [
  { key: "no", label: "#", className: "w-10 !px-3" },
  { key: "code", label: "ICD-10 Code", className: "!px-3" },
  { key: "name", label: "Diagnosis", className: "!px-3" },
  { key: "type", label: "Type", className: "!px-3" },
  {
    key: "actions",
    label: "Actions",
    className: "!px-3",
    width: 80,
    header: <div className="flex w-full items-center justify-center">Actions</div>,
  },
];

/* ---------- Component ---------- */
const AssessmentPlan = () => {
  const [dx, setDx] = useState<Dx[]>(INITIAL_DX);
  const [search, setSearch] = useState("");
  const [plan, setPlan] = useState(
    "Symptomatic treatment for upper respiratory infection. Encourage rest, increased fluid intake, and use of saline nasal spray. Monitor symptoms and return if worsening or not improving within 5 days.",
  );
  const [education, setEducation] = useState<string[]>([
    "Hydration",
    "Rest and sleep",
    "Hand hygiene",
    "When to seek medical care",
  ]);
  const [goals, setGoals] = useState("Resolution of cough and congestion within 5–7 days.");

  const addDiagnosis = () => {
    const name = search.trim();
    if (!name) return;
    setDx((prev) => [...prev, { id: Date.now(), code: "—", name, type: "Secondary" }]);
    setSearch("");
  };

  const rows = dx.map((d, i) => ({
    no: <Content title={String(i + 1)} />,
    code: <Content title={d.code} />,
    name: <Content title={d.name} />,
    type: (
      <SignupDropdown
        className="!w-[140px]"
        name={`dx-type-${d.id}`}
        options={DX_TYPES}
        value={d.type}
        onChange={(v) => setDx((prev) => prev.map((x) => (x.id === d.id ? { ...x, type: v } : x)))}
        searchable={false}
        triggerClassName="!h-10 !min-h-10 !rounded-lg !border-border !px-3 !pr-8"
        portalMenu
      />
    ),
    actions: (
      <div className="flex w-full items-center justify-center">
        <button
          type="button"
          aria-label={`Remove ${d.name}`}
          onClick={() => setDx((prev) => prev.filter((x) => x.id !== d.id))}
          className={`${iconBtn} text-danger hover:bg-danger/10`}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    ),
  }));

  return (
    <div className="min-w-0">
      <StepHeader
        title="Assessment & Plan"
        subtitle="Add diagnoses, treatment plan and management for this encounter."
      />

      <div className="space-y-6">
        {/* Diagnoses */}
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium text-label">Diagnoses (ICD-10)</p>
            <button type="button" onClick={addDiagnosis} className={ghostBtn}>
              <Plus className="h-3.5 w-3.5" />
              Add Diagnosis
            </button>
          </div>

          <div className="relative mb-3">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-body" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addDiagnosis();
                }
              }}
              placeholder="Search ICD-10 code or diagnosis name..."
              className="h-11 w-full rounded-xl border border-border bg-card pl-10 pr-3 text-sm text-heading outline-none transition-colors placeholder:text-placeholder hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="min-w-0">
            <Table columns={COLUMNS} rows={rows} />
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-label">Treatment Plan</p>
          <p className="mb-2 text-xs text-body">
            Outline the treatment approach and management for the patient.
          </p>
          <InputActions value={plan} onChange={setPlan} rows={4} image={false} />
        </div>

        <div>
          <p className="text-sm font-medium text-label">Patient Education</p>
          <p className="mb-2 text-xs text-body">Topics discussed with the patient.</p>
          <ChipSelect
            name="patientEducation"
            label=""
            placeholder="Select topics"
            options={EDUCATION}
            value={education}
            onChange={setEducation}
          />
        </div>

        <TextAreaField
          label="Care Plan Goals"
          optional
          placeholder="Describe the goals of the care plan"
          rows={3}
          value={goals}
          onChange={setGoals}
        />
      </div>
    </div>
  );
};

export default AssessmentPlan;