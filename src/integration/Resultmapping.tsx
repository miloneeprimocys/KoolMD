"use client";

import React, { useMemo, useState } from "react";
import { Eye, RotateCcw } from "lucide-react";

import Table from "@/components/Table";
import { type TableColumn } from "@/components/Tableheader";
import Content from "@/components/Content";
import ImportButton from "@/components/ImportButton";
import SearchAndFilter from "@/components/Searchandfilter";
import SignupDropdown from "@/components/SignupDropdown";
import TogglableSwitch from "@/components/Togglableswitch";
import { toOptions } from "@/providers/Shared";
import IntegrationSidebar, {
  FieldCell,
  InfoHint,
  StepHeader,
  StepLayout,
} from "./Integrationsidebar";
import { DefaultValueCell, type DefaultKind } from "./Mapping";

const KOOLMD_FIELDS = [
  "Result ID",
  "Test Code (LOINC)",
  "Test Name",
  "Result Value",
  "Result Unit",
  "Reference Range",
  "Abnormal Flag",
  "Result Status",
  "Result Date & Time",
  "Specimen Type",
  "Collection Date & Time",
  "Result Note",
];

const CATEGORIES = ["Identification", "Result", "Specimen", "Notes"];

type Row = {
  id: string;
  field: string;
  category: string;
  sample: string;
  map: string;
  type: "Text" | "Number" | "Date";
  kind: DefaultKind;
  options?: string[];
  fallback?: string;
};

const ROWS: Row[] = [
  { id: "r1", field: "Result ID", category: "Identification", sample: "RS123456", map: "Result ID", type: "Text", kind: "none" },
  { id: "r2", field: "Test Code", category: "Identification", sample: "CBC", map: "Test Code (LOINC)", type: "Text", kind: "none" },
  { id: "r3", field: "Test Name", category: "Identification", sample: "Complete Blood Count", map: "Test Name", type: "Text", kind: "none" },
  { id: "r4", field: "Result Value", category: "Result", sample: "13.2", map: "Result Value", type: "Number", kind: "none" },
  { id: "r5", field: "Units", category: "Result", sample: "g/dL", map: "Result Unit", type: "Text", kind: "none" },
  { id: "r6", field: "Reference Range", category: "Result", sample: "12.0 - 16.0", map: "Reference Range", type: "Text", kind: "none" },
  { id: "r7", field: "Abnormal Flag", category: "Result", sample: "N", map: "Abnormal Flag", type: "Text", kind: "select", options: ["Normal", "Abnormal", "Critical"], fallback: "Normal" },
  { id: "r8", field: "Result Status", category: "Result", sample: "Final", map: "Result Status", type: "Text", kind: "select", options: ["Preliminary", "Final", "Corrected"], fallback: "Final" },
  { id: "r9", field: "Result Date", category: "Result", sample: "2026-10-17", map: "Result Date & Time", type: "Date", kind: "date" },
  { id: "r10", field: "Specimen Type", category: "Specimen", sample: "Whole Blood", map: "Specimen Type", type: "Text", kind: "none" },
  { id: "r11", field: "Collection Date", category: "Specimen", sample: "2026-10-17 08:30", map: "Collection Date & Time", type: "Date", kind: "date" },
  { id: "r12", field: "Notes / Comments", category: "Notes", sample: "Hemoglobin within normal range", map: "Result Note", type: "Text", kind: "none" },
];

const COLUMNS: TableColumn[] = [
  { key: "n", label: "#", className: "w-10" },
  {
    key: "field",
    label: "Lab Result Field (M13)",
    header: (
      <span className="inline-flex items-center gap-1.5">
        Lab Result Field (M13) <InfoHint text="Field name sent by the lab system" />
      </span>
    ),
  },
  { key: "sample", label: "Sample Value" },
  { key: "map", label: "Map to KOOLMD Field" },
  { key: "type", label: "Data Type" },
  { key: "def", label: "Default Value (Optional)" },
];

const initialMaps = () => Object.fromEntries(ROWS.map((r) => [r.id, r.map]));
const initialDefaults = () =>
  Object.fromEntries(ROWS.filter((r) => r.fallback).map((r) => [r.id, r.fallback as string]));

const ResultMapping = () => {
  const [maps, setMaps] = useState<Record<string, string>>(initialMaps());
  const [defaults, setDefaults] = useState<Record<string, string>>(initialDefaults());
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [unmappedOnly, setUnmappedOnly] = useState(false);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return ROWS.filter((r) => {
      if (category && r.category !== category) return false;
      if (unmappedOnly && maps[r.id]) return false;
      if (q && !`${r.field} ${r.sample}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [search, category, unmappedOnly, maps]);

  const rows = visible.map((r) => ({
    n: <Content title={String(ROWS.indexOf(r) + 1)} />,
    field: (
      <span className="flex items-center justify-between gap-2">
        <Content title={r.field} />
        <InfoHint text={`${r.category} field`} />
      </span>
    ),
    sample: <span className="text-sm text-primary">{r.sample}</span>,
    map: (
      <FieldCell>
        <SignupDropdown
          name={`rm-map-${r.id}`}
          label={r.field}
          placeholder="Select field"
          searchable={false}
          triggerClassName="!h-10 !min-h-10 !rounded-lg !px-3 !pr-8 !text-xs"
          options={toOptions(KOOLMD_FIELDS)}
          value={maps[r.id] ?? ""}
          onChange={(v) => setMaps((p) => ({ ...p, [r.id]: v }))}
          portalMenu
          portalMenuZIndex={30}
        />
      </FieldCell>
    ),
    type: <Content title={r.type} />,
    def: (
      <DefaultValueCell
        id={`rm-def-${r.id}`}
        kind={r.kind === "none" ? "text" : r.kind}
        options={r.options}
        value={defaults[r.id] ?? ""}
        onChange={(v) => setDefaults((p) => ({ ...p, [r.id]: v }))}
      />
    ),
  }));

  return (
    <StepLayout sidebar={<IntegrationSidebar variant="result" />}>
      <StepHeader
        title="Result Mapping"
        subtitle="Map lab result fields from the external system to KOOLMD result fields (M13)."
        actions={
          <>
            <ImportButton text="View Sample Results" icon={<Eye className="h-4 w-4" />} onClick={() => {}} />
            <ImportButton
              text="Reset Mapping"
              icon={<RotateCcw className="h-4 w-4" />}
              onClick={() => {
                setMaps(initialMaps());
                setDefaults(initialDefaults());
                setSearch("");
                setCategory("");
                setUnmappedOnly(false);
              }}
            />
          </>
        }
      />

      {/* Search + category filter + unmapped toggle */}
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
        <div className="min-w-0 flex-1">
          <SearchAndFilter
            placeholder="Search result fields..."
            value={search}
            onSearch={setSearch}
            filters={[{ label: "All Categories", options: CATEGORIES }]}
            selectedFilters={{ "All Categories": category }}
            onFilterChange={(_label: string, option: string) => setCategory(option)}
            showDateRange={false}
          />
        </div>
        <TogglableSwitch
          id="unmapped-only"
          checked={unmappedOnly}
          onChange={(v: boolean) => setUnmappedOnly(v)}
          ariaLabel="Show unmapped only"
          label={<span className="text-sm text-heading">Show Unmapped Only</span>}
        />
      </div>

      <div className="w-full min-w-0 rounded-[14px] border border-border bg-card">
        {rows.length > 0 ? (
          <Table columns={COLUMNS} rows={rows} bordered={false} />
        ) : (
          <p className="px-4 py-10 text-center text-sm text-body">No result fields match your filters.</p>
        )}
      </div>
    </StepLayout>
  );
};

export default ResultMapping;
