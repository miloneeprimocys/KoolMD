"use client";

import React from "react";
import { Plus } from "lucide-react";

import AddButton from "@/components/Addbutton";
import Table from "@/components/Table";
import { type TableColumn } from "@/components/Tableheader";
import Content from "@/components/Content";
import Tags from "@/components/Tags";
import Actions from "@/components/Actions";
import { cardCls } from "@/providers/Shared";

/* ---------------------------------------------------------------- */
/*  Static mappings (replace with API data)                          */
/* ---------------------------------------------------------------- */
type Mapping = { id: string; field: string; fhir: string; type: string; status: "Mapped" | "Pending" };

const MAPPINGS: Mapping[] = [
  { id: "1", field: "patient_id", fhir: "subject (Patient)", type: "Reference", status: "Mapped" },
  { id: "2", field: "encounter_id", fhir: "encounter (Encounter)", type: "Reference", status: "Mapped" },
  { id: "3", field: "category", fhir: "category (CodeableConcept)", type: "CodeableConcept", status: "Mapped" },
  { id: "4", field: "observation_code", fhir: "code (CodeableConcept)", type: "CodeableConcept", status: "Mapped" },
  { id: "5", field: "value", fhir: "value[x]", type: "Quantity", status: "Mapped" },
  { id: "6", field: "unit", fhir: "value[x].unit", type: "string", status: "Mapped" },
  { id: "7", field: "effective_date", fhir: "effectiveDateTime", type: "dateTime", status: "Mapped" },
  { id: "8", field: "reference_range", fhir: "referenceRange", type: "Quantity", status: "Pending" },
  { id: "9", field: "notes", fhir: "note (Annotation)", type: "string", status: "Mapped" },
];

const COLUMNS: TableColumn[] = [
  { key: "field", label: "Internal Field" },
  { key: "fhir", label: "FHIR Field (Path)" },
  { key: "type", label: "Data Type" },
  { key: "status", label: "Mapping Status" },
  { key: "actions", label: "Actions", header: <div className="flex w-full items-center justify-center">Actions</div> },
];

const FhirResourceMapping = () => {
  const rows = MAPPINGS.map((m) => ({
    field: <Content title={m.field} />,
    fhir: <Content title={m.fhir} />,
    type: <Content title={m.type} />,
    status: <Tags text={m.status} tone={m.status === "Mapped" ? "success" : "warning"} size="xs" />,
    actions: (
      <div className="flex w-full items-center justify-center">
        <Actions actions={["edit"]} size="sm" onAction={() => console.log("edit mapping", m.id) /* TODO */} />
      </div>
    ),
  }));

  return (
    <section className={`${cardCls} space-y-4`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-heading">Observation - Field Mappings</h3>
          <p className="text-xs text-body sm:text-sm">Configure internal field mappings to FHIR fields.</p>
        </div>
        <AddButton
          text="Add Mapping"
          icon={<Plus className="h-4 w-4" />}
          onClick={() => {
            /* TODO: open add mapping form */
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

export default FhirResourceMapping;