"use client";

import React, { useState } from "react";
import { Eye, RotateCcw } from "lucide-react";

import Table from "@/components/Table";
import { type TableColumn } from "@/components/Tableheader";
import Content from "@/components/Content";
import ImportButton from "@/components/ImportButton";
import SignupDropdown from "@/components/SignupDropdown";
import { toOptions } from "@/providers/Shared";
import IntegrationSidebar, {
  FieldCell,
  InfoHint,
  StepHeader,
  StepLayout,
} from "./Integrationsidebar";
import { DefaultValueCell, type DefaultKind } from "./Mapping";

const M13_FIELDS = [
  "Client Order Number",
  "Patient ID",
  "Patient First Name",
  "Patient Last Name",
  "Patient DOB",
  "Patient Gender",
  "Provider ID",
  "Test Code (LOINC)",
  "Collection Date Time",
  "Specimen Type",
  "Fasting Indicator",
  "Order Priority",
  "Diagnosis/Indication",
  "Patient Note",
  "Internal Comment",
];

type Row = {
  id: string;
  field: string;
  required?: boolean;
  hint: string;
  map: string;
  kind: DefaultKind;
  options?: string[];
  fallback?: string;
};

const ROWS: Row[] = [
  { id: "order-id", field: "Order ID", required: true, hint: "Unique order identifier", map: "Client Order Number", kind: "none" },
  { id: "patient-id", field: "Patient ID", required: true, hint: "Patient MRN", map: "Patient ID", kind: "none" },
  { id: "first", field: "Patient First Name", required: true, hint: "Patient given name", map: "Patient First Name", kind: "none" },
  { id: "last", field: "Patient Last Name", required: true, hint: "Patient family name", map: "Patient Last Name", kind: "none" },
  { id: "dob", field: "Date of Birth", required: true, hint: "Format YYYY-MM-DD", map: "Patient DOB", kind: "date" },
  { id: "gender", field: "Gender", required: true, hint: "Administrative gender", map: "Patient Gender", kind: "select", options: ["Male", "Female", "Other", "Unknown"] },
  { id: "provider", field: "Ordering Provider", required: true, hint: "Ordering provider identifier", map: "Provider ID", kind: "select", options: ["Dr. Emily Carter", "Dr. James Miller", "Dr. Sarah Wilson"] },
  { id: "test", field: "Test Code", required: true, hint: "LOINC test code", map: "Test Code (LOINC)", kind: "text" },
  { id: "collection", field: "Collection Date & Time", hint: "When the specimen is collected", map: "Collection Date Time", kind: "date" },
  { id: "specimen", field: "Specimen Type", hint: "Type of specimen", map: "Specimen Type", kind: "select", options: ["Whole Blood (EDTA)", "Serum", "Plasma", "Urine"], fallback: "Whole Blood (EDTA)" },
  { id: "fasting", field: "Fasting Required", hint: "Fasting indicator", map: "Fasting Indicator", kind: "select", options: ["Yes", "No", "Not Specified"], fallback: "No" },
  { id: "priority", field: "Priority", hint: "Order priority", map: "Order Priority", kind: "select", options: ["Routine", "STAT", "Urgent"], fallback: "Routine" },
  { id: "clinical", field: "Clinical Indication", hint: "Diagnosis / reason for test", map: "Diagnosis/Indication", kind: "text" },
  { id: "pnotes", field: "Patient Notes", hint: "Notes visible to the patient", map: "Patient Note", kind: "text" },
  { id: "inotes", field: "Internal Notes", hint: "Notes for clinical staff only", map: "Internal Comment", kind: "text" },
];

const COLUMNS: TableColumn[] = [
  { key: "field", label: "KOOLMD Field" },
  { key: "map", label: "M13 Lab Field" },
  { key: "def", label: "Default Value (Optional)" },
];

const initialMaps = () => Object.fromEntries(ROWS.map((r) => [r.id, r.map]));
const initialDefaults = () =>
  Object.fromEntries(ROWS.filter((r) => r.fallback).map((r) => [r.id, r.fallback as string]));

const LabOrderMapping = () => {
  const [maps, setMaps] = useState<Record<string, string>>(initialMaps());
  const [defaults, setDefaults] = useState<Record<string, string>>(initialDefaults());

  const rows = ROWS.map((r) => ({
    field: (
      <span className="flex items-center justify-between gap-2">
        <Content title={r.field} />
        <span className="flex items-center gap-1.5">
          {r.required && <span className="text-danger">*</span>}
          <InfoHint text={r.hint} />
        </span>
      </span>
    ),
    map: (
      <FieldCell>
        <SignupDropdown
          name={`lo-map-${r.id}`}
          label={r.field}
          placeholder="Select field"
          searchable={false}
          triggerClassName="!h-10 !min-h-10 !rounded-lg !px-3 !pr-8 !text-xs"
          options={toOptions(M13_FIELDS)}
          value={maps[r.id] ?? ""}
          onChange={(v) => setMaps((p) => ({ ...p, [r.id]: v }))}
          portalMenu
          portalMenuZIndex={30}
        />
      </FieldCell>
    ),
    def: (
      <DefaultValueCell
        id={`lo-def-${r.id}`}
        kind={r.kind === "none" ? "text" : r.kind}
        options={r.options}
        value={defaults[r.id] ?? ""}
        onChange={(v) => setDefaults((p) => ({ ...p, [r.id]: v }))}
      />
    ),
  }));

  return (
    <StepLayout sidebar={<IntegrationSidebar variant="order" />}>
      <StepHeader
        title="Lab Order Mapping"
        subtitle="Map KOOLMD lab order fields to the corresponding fields in the lab system (M13)."
        actions={
          <>
            <ImportButton text="Preview Order Format" icon={<Eye className="h-4 w-4" />} onClick={() => {}} />
            <ImportButton
              text="Reset Mapping"
              icon={<RotateCcw className="h-4 w-4" />}
              onClick={() => {
                setMaps(initialMaps());
                setDefaults(initialDefaults());
              }}
            />
          </>
        }
      />
      <div className="w-full min-w-0 rounded-[14px] border border-border bg-card">
        <Table columns={COLUMNS} rows={rows} bordered={false} />
      </div>
    </StepLayout>
  );
};

export default LabOrderMapping;
