"use client";

import React, { useState } from "react";
import { Eye, Sparkles, Stethoscope, User } from "lucide-react";

import Table from "@/components/Table";
import { type TableColumn } from "@/components/Tableheader";
import Content from "@/components/Content";
import ImportButton from "@/components/ImportButton";
import SignupField from "@/components/SignupField";
import SignupDropdown from "@/components/SignupDropdown";
import DatePicker from "@/components/Datepicker";
import { toOptions } from "@/providers/Shared";
import IntegrationSidebar, {
  FieldCell,
  InfoHint,
  StepHeader,
  StepLayout,
} from "./Integrationsidebar";

/* ---------------------------------------------------------------- */
/*  Default-value cell (shared with Labordermapping / Resultmapping) */
/* ---------------------------------------------------------------- */
export type DefaultKind = "none" | "text" | "date" | "select";

export const DefaultValueCell = ({
  id,
  kind,
  value,
  onChange,
  options = [],
}: {
  id: string;
  kind: DefaultKind;
  value: string;
  onChange: (v: string) => void;
  options?: string[];
}) => {
  if (kind === "none") return <span className="text-xs text-body">Not applicable</span>;
  return (
    <FieldCell>
      {kind === "text" && (
        <SignupField
          name={id}
          label="Default value"
          className="[&_input]:!h-10 [&_input]:!min-h-10 [&_input]:!rounded-lg [&_input]:!px-3 [&_input]:!text-xs"
          placeholder="-"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      {kind === "date" && (
        <DatePicker
          name={id}
          label="Default value"
          placeholder="Select date"
          value={value}
          onChange={onChange}
          portalZIndex={30}
          mobilePortalZIndex={200}
          triggerZIndex={0}
        />
      )}
      {kind === "select" && (
        <SignupDropdown
          name={id}
          label="Default value"
          placeholder="Select value"
          searchable={false}
          triggerClassName="!h-10 !min-h-10 !rounded-lg !px-3 !pr-8 !text-xs"
          options={toOptions(options)}
          value={value}
          onChange={onChange}
          portalMenu
          menuScrollable={false}
          portalMenuZIndex={30}
        />
      )}
    </FieldCell>
  );
};

/* ---------------------------------------------------------------- */
/*  Data                                                            */
/* ---------------------------------------------------------------- */
type MapRow = {
  id: string;
  field: string;
  sample: string;
  map: string;
  kind: DefaultKind;
  options?: string[];
  fallback?: string;
};

const PATIENT_TARGETS = [
  "Patient MRN (Required)",
  "Patient First Name (Required)",
  "Patient Last Name (Required)",
  "Patient Date of Birth (Required)",
  "Patient Gender",
  "Patient Phone",
  "Patient Email",
];
const PROVIDER_TARGETS = [
  "Provider NPI (Required)",
  "Provider Name (Required)",
  "Provider Email",
  "Provider Phone",
];

const PATIENT_ROWS: MapRow[] = [
  { id: "p-id", field: "Patient ID", sample: "123456", map: "Patient MRN (Required)", kind: "none" },
  { id: "p-first", field: "First Name", sample: "John", map: "Patient First Name (Required)", kind: "none" },
  { id: "p-last", field: "Last Name", sample: "Smith", map: "Patient Last Name (Required)", kind: "none" },
  { id: "p-dob", field: "Date of Birth", sample: "1989-03-12", map: "Patient Date of Birth (Required)", kind: "date" },
  { id: "p-gender", field: "Gender", sample: "M", map: "Patient Gender", kind: "select", options: ["Male", "Female", "Other", "Unknown"] },
  { id: "p-phone", field: "Phone", sample: "+1 234 567 8900", map: "Patient Phone", kind: "text" },
];

const PROVIDER_ROWS: MapRow[] = [
  { id: "d-id", field: "Provider ID", sample: "P001", map: "Provider NPI (Required)", kind: "none" },
  { id: "d-name", field: "Provider Name", sample: "Dr. Emily Carter", map: "Provider Name (Required)", kind: "none" },
  { id: "d-email", field: "Provider Email", sample: "emily@clinic.com", map: "Provider Email", kind: "none" },
  { id: "d-phone", field: "Provider Phone", sample: "+1 987 654 3210", map: "Provider Phone", kind: "none" },
];

const COLUMNS: TableColumn[] = [
  {
    key: "field",
    label: "Lab Field (M13)",
    header: (
      <span className="inline-flex items-center gap-1.5">
        Lab Field (M13) <InfoHint text="Field name sent by the lab system" />
      </span>
    ),
  },
  { key: "sample", label: "Sample Value" },
  { key: "map", label: "Map to KOOLMD Field" },
  { key: "def", label: "Default Value (Optional)" },
];

/* ---------------------------------------------------------------- */
/*  Component                                                       */
/* ---------------------------------------------------------------- */
const initialMaps = () =>
  Object.fromEntries([...PATIENT_ROWS, ...PROVIDER_ROWS].map((r) => [r.id, r.map]));

const Mapping = () => {
  const [maps, setMaps] = useState<Record<string, string>>(initialMaps());
  const [defaults, setDefaults] = useState<Record<string, string>>({});

  const buildRows = (list: MapRow[], targets: string[]) =>
    list.map((r) => ({
      field: <Content title={r.field} />,
      sample: <span className="text-sm text-primary">{r.sample}</span>,
      map: (
        <FieldCell>
          <SignupDropdown
            name={`map-${r.id}`}
            label={r.field}
            placeholder="Select field"
            searchable={false}
            triggerClassName="!h-10 !min-h-10 !rounded-lg !px-3 !pr-8 !text-xs"
            options={toOptions(targets)}
            value={maps[r.id] ?? ""}
            onChange={(v) => setMaps((p) => ({ ...p, [r.id]: v }))}
            portalMenu
            menuScrollable={false}
            portalMenuZIndex={30}
          />
        </FieldCell>
      ),
      def: (
        <DefaultValueCell
          id={`def-${r.id}`}
          kind={r.kind === "none" ? "text" : r.kind}
          options={r.options}
          value={defaults[r.id] ?? ""}
          onChange={(v) => setDefaults((p) => ({ ...p, [r.id]: v }))}
        />
      ),
    }));

  const Block = ({
    icon: Icon,
    title,
    subtitle,
    list,
    targets,
  }: {
    icon: typeof User;
    title: string;
    subtitle: string;
    list: MapRow[];
    targets: string[];
  }) => (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </span>
          <div>
            <h4 className="text-sm font-semibold text-heading sm:text-base">{title}</h4>
            <p className="text-xs text-body sm:text-sm">{subtitle}</p>
          </div>
        </div>
        <ImportButton text="Preview Data" icon={<Eye className="h-4 w-4" />} onClick={() => {}} />
      </div>
      <div className="w-full min-w-0 rounded-[14px] border border-border bg-card">
        <Table columns={COLUMNS} rows={buildRows(list, targets)} bordered={false} />
      </div>
    </div>
  );

  return (
    <StepLayout sidebar={<IntegrationSidebar variant="mapping" />}>
      <StepHeader
        title="Field Mapping"
        subtitle="Map incoming lab data fields to the corresponding fields in KOOLMD. Required fields are mapped by default."
        actions={
          <>
           <ImportButton
              text="Auto Map"
              icon={<Sparkles className="h-4 w-4" />}
              onClick={() => setMaps(initialMaps())}
            />
            <ImportButton
              text="Reset"
              icon={null}
              onClick={() => {
                setMaps(initialMaps());
                setDefaults({});
              }}
            />
          </>
        }
      />

      <hr className="border-divider" />

      {Block({
        icon: User,
        title: "Patient Mapping",
        subtitle: "Map patient information from the lab system to KOOLMD patient fields.",
        list: PATIENT_ROWS,
        targets: PATIENT_TARGETS,
      })}

      <hr className="border-divider" />

      {Block({
        icon: Stethoscope,
        title: "Provider Mapping",
        subtitle: "Map ordering provider information from the lab system to KOOLMD provider fields.",
        list: PROVIDER_ROWS,
        targets: PROVIDER_TARGETS,
      })}
    </StepLayout>
  );
};

export default Mapping;
