"use client";

import React, { useState } from "react";
import { Eye, RotateCcw } from "lucide-react";

import Table from "@/components/Table";
import { type TableColumn } from "@/components/Tableheader";
import Content from "@/components/Content";
import ImportButton from "@/components/ImportButton";
import SignupDropdown from "@/components/SignupDropdown";
import Tags, { type TagTone } from "@/components/Tags";
import TogglableSwitch from "@/components/Togglableswitch";
import { toOptions } from "@/providers/Shared";
import IntegrationSidebar, {
  FieldCell,
  InfoHint,
  StepHeader,
  StepLayout,
} from "./Integrationsidebar";

const KOOLMD_STATUSES = [
  "Received",
  "In Progress",
  "Partial Results",
  "Completed",
  "Final",
  "Cancelled",
  "Rejected",
  "On Hold",
  "Scheduled",
  "Sample Collected",
];
const ORDER_TYPES = ["All", "Diagnostic", "Pathology", "Radiology"];
const STATUS_TONES: Record<string, TagTone> = {
  Received: "info",
  "In Progress": "warning",
  "Partial Results": "violet",
  Completed: "success",
  Final: "success",
  Cancelled: "danger",
  Rejected: "danger",
  "On Hold": "neutral",
  Scheduled: "info",
  "Sample Collected": "violet",
};

type Row = { id: string; external: string; desc: string; map: string; orderType: string };

const ROWS: Row[] = [
  { id: "s1", external: "ORDER_RECEIVED", desc: "Lab has received the order", map: "Received", orderType: "All" },
  { id: "s2", external: "IN_PROGRESS", desc: "Specimen is being processed", map: "In Progress", orderType: "All" },
  { id: "s3", external: "PARTIAL_RESULTS", desc: "Some test results are available", map: "Partial Results", orderType: "Diagnostic" },
  { id: "s4", external: "COMPLETED", desc: "All test results are available", map: "Completed", orderType: "All" },
  { id: "s5", external: "FINAL", desc: "Final and verified results", map: "Final", orderType: "All" },
  { id: "s6", external: "CANCELLED", desc: "Order cancelled at lab", map: "Cancelled", orderType: "All" },
  { id: "s7", external: "REJECTED", desc: "Specimen rejected by lab", map: "Rejected", orderType: "All" },
  { id: "s8", external: "ON_HOLD", desc: "Order is on hold", map: "On Hold", orderType: "All" },
  { id: "s9", external: "SCHEDULED", desc: "Specimen collection scheduled", map: "Scheduled", orderType: "All" },
  { id: "s10", external: "SAMPLE_COLLECTED", desc: "Specimen collected", map: "Sample Collected", orderType: "All" },
];

const COLUMNS: TableColumn[] = [
  { key: "n", label: "#", className: "w-10" },
  {
    key: "external",
    label: "External Status (M13)",
    header: (
      <span className="inline-flex items-center gap-1.5">
        External Status (M13) <InfoHint text="Status code sent by the lab system" />
      </span>
    ),
  },
  { key: "desc", label: "Description" },
  {
    key: "map",
    label: "Map to KOOLMD Status",
    header: (
      <span className="inline-flex items-center gap-1.5">
        Map to KOOLMD Status <InfoHint text="Order status used inside KOOLMD" />
      </span>
    ),
  },
  { key: "orderType", label: "Order Type" },
  {
    key: "active",
    label: "Active",
    header: <div className="flex w-full items-center justify-center">Active</div>,
  },
];

const initialMaps = () => Object.fromEntries(ROWS.map((r) => [r.id, r.map]));
const initialTypes = () => Object.fromEntries(ROWS.map((r) => [r.id, r.orderType]));

const StatusMapping = () => {
  const [maps, setMaps] = useState<Record<string, string>>(initialMaps());
  const [types, setTypes] = useState<Record<string, string>>(initialTypes());
  // bumping this re-mounts the (uncontrolled) switches so "Reset" turns them all back on
  const [resetKey, setResetKey] = useState(0);

  const rows = ROWS.map((r, i) => ({
    n: <Content title={String(i + 1)} />,
    external: <Content title={r.external} />,
    desc: <Content title={r.desc} truncate />,
    map: (
      <FieldCell>
        <SignupDropdown
          name={`st-map-${r.id}`}
          label={r.external}
          placeholder="Select status"
          searchable={false}
          triggerClassName="!h-10 !min-h-10 !rounded-lg !px-3 !pr-8 !text-xs"
          options={toOptions(KOOLMD_STATUSES)}
          value={maps[r.id] ?? ""}
          onChange={(v) => setMaps((p) => ({ ...p, [r.id]: v }))}
          renderSelected={(option) => (
            <Tags text={option.label} tone={STATUS_TONES[option.value] ?? "neutral"} size="xs" />
          )}
          portalMenu
          portalMenuZIndex={30}
        />
      </FieldCell>
    ),
    orderType: (
      <FieldCell>
        <SignupDropdown
          name={`st-type-${r.id}`}
          label="Order type"
          placeholder="Select type"
          searchable={false}
          triggerClassName="!h-10 !min-h-10 !rounded-lg !px-3 !pr-8 !text-xs"
          options={toOptions(ORDER_TYPES)}
          value={types[r.id] ?? ""}
          onChange={(v) => setTypes((p) => ({ ...p, [r.id]: v }))}
          portalMenu
          portalMenuZIndex={30}
        />
      </FieldCell>
    ),
    active: (
      <div className="flex w-full items-center justify-center">
        <TogglableSwitch
          key={`${r.id}-${resetKey}`}
          id={`st-active-${r.id}`}
          defaultChecked
          ariaLabel={`${r.external} active`}
        />
      </div>
    ),
  }));

  return (
    <StepLayout sidebar={<IntegrationSidebar variant="status" />}>
      <StepHeader
        title="Status Mapping"
        subtitle="Map lab order and result statuses from the external system to KOOLMD statuses."
        actions={
          <>
            <ImportButton
              text="View Status List"
              icon={<Eye className="h-4 w-4" />}
              onClick={() => {}}
              className="min-w-0 flex-1 !px-2 !text-xs sm:flex-none sm:!px-5 sm:!text-sm"
            />
            <ImportButton
              text="Reset Mapping"
              icon={<RotateCcw className="h-4 w-4" />}
              className="min-w-0 flex-1 !px-2 !text-xs sm:flex-none sm:!px-5 sm:!text-sm"
              onClick={() => {
                setMaps(initialMaps());
                setTypes(initialTypes());
                setResetKey((k) => k + 1);
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

export default StatusMapping;
