"use client";

import RadioCheckButtonh from "@/components/RadioCheckButtonh";
import React, { useState } from "react";

import AddInternalButton from "@/components/AddInternalButton";
import Actions from "@/components/Actions";
import Table from "@/components/Table";
import { type TableColumn } from "@/components/Tableheader";
import Content from "@/components/Content";
import Tags from "@/components/Tags";
import SignupDropdown, { DropdownOption } from "@/components/SignupDropdown";
import { StepHeader, checkboxCls } from "@/components/Verticalsteps";

/* ---------- Static data ---------- */
const PRIORITY_OPTIONS: DropdownOption[] = [
  { value: "Routine", label: "Routine" },
  { value: "Urgent", label: "Urgent" },
  { value: "STAT", label: "STAT" },
];

const LABS = [
  { name: "Complete Blood Count (CBC)", note: "Evaluate for infection", priority: "Routine" },
  { name: "Basic Metabolic Panel (BMP)", note: "Monitor electrolytes", priority: "Routine" },
  { name: "C-Reactive Protein (CRP)", note: "Assess inflammation", priority: "STAT" },
];

const IMAGING = [{ name: "Chest X-Ray (PA & Lateral)", note: "Persistent cough", priority: "Routine" }];

const MEDS = [
  { name: "Amoxicillin 500 mg", form: "Tablet", dose: "1 tablet, TID", duration: "5 days", instructions: "Take after food." },
  { name: "Paracetamol 500 mg", form: "Tablet", dose: "1 tablet, TID (as needed)", duration: "3 days", instructions: "For fever or pain." },
];

const dense = "!px-3";

const ORDER_COLUMNS: TableColumn[] = [
  { key: "select", label: "", className: "w-10 !px-3" },
  { key: "test", label: "Test Name", className: dense },
  { key: "note", label: "Indication / Notes", className: dense },
  { key: "priority", label: "Priority", className: dense },
  { key: "status", label: "Status", className: dense },
  {
    key: "actions",
    label: "Actions",
    className: dense,
    width: 96,
    header: <div className="flex w-full items-center justify-center">Actions</div>,
  },
];

const MED_COLUMNS: TableColumn[] = [
  { key: "select", label: "", className: "w-10 !px-3" },
  { key: "med", label: "Medication", className: dense },
  { key: "dose", label: "Dose & Frequency", className: dense },
  { key: "duration", label: "Duration", className: dense },
  { key: "instructions", label: "Instructions", className: dense },
  {
    key: "actions",
    label: "Actions",
    className: dense,
    width: 96,
    header: <div className="flex w-full items-center justify-center">Actions</div>,
  },
];

/* ---------- Small pieces ---------- */
const RowActions = () => (
  <div className="flex w-full justify-center">
    <Actions actions={["edit", "delete"]} />
  </div>
);

/** STAT shows a red tag, everything else is an editable dropdown. */
const PriorityCell = ({ id, initial }: { id: string; initial: string }) => {
  const [value, setValue] = useState(initial);
  return initial === "STAT" ? (
    <Tags text="STAT" tone="danger" />
  ) : (
    <SignupDropdown
      className="!w-[112px] sm:!w-[130px]"
      name={`priority-${id}`}
      options={PRIORITY_OPTIONS}
      value={value}
      onChange={setValue}
      searchable={false}
      triggerClassName="!h-10 !min-h-10 !rounded-lg !border-border !px-3 !pr-8"
      portalMenu
    />
  );
};

const OrderBox = ({
  title,
  count,
  addText,
  children,
}: {
  title: string;
  count: number;
  addText: string;
  children: React.ReactNode;
}) => (
  <section className="min-w-0 sm:rounded-xl sm:border sm:border-border">
    <header className="flex flex-wrap items-center justify-between gap-3 px-2 sm:px-4 py-3">
      <h4 className="text-sm font-semibold text-heading">
        {title} ({count})
      </h4>
      <AddInternalButton
        text={addText}
        className="!h-8 !gap-1.5 !px-3 !text-xs sm:!h-9 sm:!px-3.5 sm:!text-xs"
      />
    </header>
    <div className="min-w-0 px-1 pb-3 sm:px-4 sm:pb-4">{children}</div>
  </section>
);

/* ---------- Component ---------- */
const OrdersPrescriptions = () => {
  const orderRows = (list: typeof LABS, prefix: string) =>
    list.map((o, i) => ({
      select: <RadioCheckButtonh type="checkbox" aria-label={`Select ${o.name}`} className={checkboxCls} />,
      test: <Content title={o.name} />,
      note: <Content title={o.note} />,
      priority: <PriorityCell id={`${prefix}-${i}`} initial={o.priority} />,
      status: <Tags text="Ordered" tone="info" />,
      actions: <RowActions />,
    }));

  const medRows = MEDS.map((m) => ({
    select: <RadioCheckButtonh type="checkbox" aria-label={`Select ${m.name}`} className={checkboxCls} />,
    med: <Content title={m.name} description={m.form} />,
    dose: <Content title={m.dose} />,
    duration: <Content title={m.duration} />,
    instructions: <Content title={m.instructions} />,
    actions: <RowActions />,
  }));

  return (
    <div className="min-w-0">
      <StepHeader
        title="Orders & Prescriptions"
        subtitle="Add lab orders, imaging orders and prescribe medications for this encounter."
      />

      <div className="space-y-5">
        <OrderBox title="Lab Orders" count={LABS.length} addText="Add Lab Order">
          <Table columns={ORDER_COLUMNS} rows={orderRows(LABS, "lab")} selectable />
        </OrderBox>

        <OrderBox title="Imaging Orders" count={IMAGING.length} addText="Add Imaging Order">
          <Table columns={ORDER_COLUMNS} rows={orderRows(IMAGING, "img")} selectable />
        </OrderBox>

        <OrderBox title="Medications / Prescriptions" count={MEDS.length} addText="Add Medication">
          <Table columns={MED_COLUMNS} rows={medRows} selectable />
        </OrderBox>
      </div>
    </div>
  );
};

export default OrdersPrescriptions;