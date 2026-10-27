"use client";

import React, { useEffect, useState } from "react";
import { Building2, FileText, Info, Send, Shield, User } from "lucide-react";

import Table from "@/components/Table";
import { type TableColumn } from "@/components/Tableheader";
import StickyColumns from "@/components/StickyColumns";
import Tags from "@/components/Tags";
import EditButton from "@/components/EditButton";
import Content from "@/components/Content";
import { SectionCard, cardCls } from "@/providers/Shared";

import { PayerLogo, getPatient, getPayerById, initials, type PatientInsuranceValues } from "./Patientinsurance";
import { formatDateLong, getCpt, getPos, getProvider, type ServiceDetailsValues } from "./Servicedetails";

const LINE_COLUMNS: TableColumn[] = [
  { key: "number", label: "#" },
  { key: "cpt", label: "CPT/HCPCS Code" },
  { key: "description", label: "Description" },
  { key: "modifiers", label: "Modifiers" },
  { key: "units", label: "Units" },
  { key: "diagnosis", label: "Diagnosis Code" },
];

const NEXT_STEPS = [
  "Request will be sent to the clearinghouse",
  "We will receive and process the response",
  "Eligibility results will be displayed",
  "This request will be saved to the patient's eligibility history",
];

type Props = {
  patientInsurance: PatientInsuranceValues;
  service: ServiceDetailsValues;
  onEdit: (step: number) => void;
};

const Field = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="grid grid-cols-[120px_minmax(0,1fr)] gap-3 text-sm">
    <dt className="text-body">{label}</dt>
    <dd className="min-w-0 break-words font-medium text-heading">{value}</dd>
  </div>
);

const ReviewSubmit = ({ patientInsurance, service, onEdit }: Props) => {
  const patient = getPatient(patientInsurance.patientId);
  const payer = getPayerById(patientInsurance.insurance);
  const firstLine = service.lines[0];
  /* Highlights the "What happens next?" steps one by one, then loops */
  const [activeStep, setActiveStep] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setActiveStep((s) => (s + 1) % NEXT_STEPS.length), 1800);
    return () => window.clearInterval(id);
  }, []);
  const lineRows = service.lines.map((l, i) => ({
    number: <span className="text-sm text-body">{i + 1}</span>,
    cpt: <Content title={l.cpt} />,
    description: (
      <Content
        title={getCpt(l.cpt)?.description ?? "—"}
        truncate
        className="max-w-[320px]"
      />
    ),
    modifiers: <Content title={l.modifiers.filter(Boolean).join(", ") || "—"} />,
    units: <Content title={l.units} />,
    diagnosis: <Content title={l.diagnosis || "—"} />,
  }));

  return (
        <StickyColumns columnsClass="2xl:grid-cols-[minmax(0,1fr)_360px] 22xl:grid-cols-[minmax(0,1fr)_380px]" breakpoint="xl">
      {/* LEFT SECTION */}
      <div className="min-w-0 space-y-4 sm:space-y-5">
        {/* Patient */}
        <SectionCard icon={<User className="h-4 w-4" />} title="Patient Information" action={<EditButton section="patient" onEdit={() => onEdit(1)} />}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-4 rounded-xl bg-primary/5 p-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-base font-semibold text-primary">
                {initials(patient.name)}
              </span>
              <div className="min-w-0 space-y-0.5">
                <h3 className="truncate text-base font-semibold text-heading">{patient.name}</h3>
                <p className="text-xs text-body">#{patient.code}</p>
                <p className="text-xs text-body">
                  DOB: {patient.dob} <span className="mx-1.5 text-border">|</span> Gender: {patient.gender}
                </p>
              </div>
            </div>
            <dl className="space-y-3 self-center">
              <Field label="Phone" value={patient.phone} />
              <Field label="Address" value={patient.address} />
            </dl>
          </div>
        </SectionCard>

        {/* Insurance */}
        <SectionCard icon={<Shield className="h-4 w-4" />} title="Insurance Information" action={<EditButton section="insurance" onEdit={() => onEdit(1)} />}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-start gap-4">
              <PayerLogo name={payer.name} size="h-12 w-12" />
              <div className="min-w-0 space-y-1 text-sm text-body">
                <p className="text-base font-semibold text-heading">{payer.name}</p>
                <p>
                  Payer ID: <span className="font-medium text-heading">{patientInsurance.payerId}</span> (Default)
                </p>
                <p>
                  Member ID: <span className="font-medium text-heading">{patientInsurance.memberId || "—"}</span>
                </p>
                <p>
                  Group Number: <span className="font-medium text-heading">{patientInsurance.groupNumber || "—"}</span>
                </p>
              </div>
            </div>
            <dl className="space-y-3 sm:border-l sm:border-divider sm:pl-5">
              <Field label="Plan Name" value={patientInsurance.planName || "—"} />
              <Field label="Policy Holder" value={patientInsurance.policyHolder} />
              <Field label="Effective Date" value="Jan 01, 2024" />
              <Field label="Relation to Patient" value={patientInsurance.policyHolder} />
            </dl>
          </div>
        </SectionCard>

        {/* Service details */}
        <SectionCard icon={<FileText className="h-4 w-4" />} title="Service Details" action={<EditButton section="service" onEdit={() => onEdit(2)} />}>
          <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-4">
            {[
              ["Service Date", formatDateLong(service.serviceDate)],
              ["Place of Service", getPos(service.placeOfService)?.label ?? "—"],
              ["Rendering Provider", getProvider(service.provider)?.label ?? "—"],
              ["Diagnosis Code", firstLine?.diagnosis || "—"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl border border-border px-4 py-3">
                <p className="text-xs text-body">{label}</p>
                <p className="mt-1 text-sm font-medium text-heading">{value}</p>
              </div>
            ))}
          </div>

          <h4 className="mb-3 mt-5 text-sm font-semibold text-heading">Service Lines ({service.lines.length})</h4>
          <div className="overflow-x-auto rounded-xl border border-border">
            {service.lines.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-body">No service lines added.</p>
            ) : (
              <Table columns={LINE_COLUMNS} rows={lineRows} bordered={false} />
            )}
          </div>

          {service.notes.trim() && (
            <div className="mt-4 rounded-xl bg-primary/5 p-4">
              <p className="text-xs text-body">Additional Information</p>
              <p className="mt-1 text-sm text-heading">{service.notes}</p>
            </div>
          )}
        </SectionCard>

        {/* Additional options */}
        <SectionCard icon={<FileText className="h-4 w-4" />} title="Additional Options" action={<EditButton section="additional" onEdit={() => onEdit(2)} />}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs text-body">Include Specific Service</p>
              <p className="mt-1 text-sm font-medium text-heading">
                {service.includeSpecific === "yes" ? "Yes (Check Specific Service)" : "No (General Eligibility)"}
              </p>
            </div>
            <div className="sm:border-l sm:border-divider sm:pl-5">
              <p className="text-xs text-body">Save to Patient History</p>
              <p className="mt-1 text-sm font-medium text-heading">{service.saveHistory ? "Yes" : "No"}</p>
            </div>
          </div>
        </SectionCard>
      </div>

       {/* RIGHT SECTION */}
      <div className="min-w-0 space-y-4 sm:space-y-5">
        {/* Ready to submit */}
        <section className={`${cardCls} min-w-0 space-y-4 sm:p-6`}>
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Send className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-base font-semibold text-heading">Ready to Submit?</h3>
              <p className="mt-0.5 text-xs text-body">
                This will send a real-time eligibility request through the configured clearinghouse.
              </p>
            </div>
          </div>
          <div className="flex gap-3 rounded-xl bg-primary/10 p-4">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <p className="text-xs text-body">
              Coverage and benefit information depends on the payer and clearinghouse support. Response time may vary.
            </p>
          </div>
        </section>

        {/* Clearinghouse account + what happens next */}
        <section className={`${cardCls} min-w-0 !p-0`}>
          <div className="space-y-4 p-5">
            <div className="flex items-center justify-between gap-3">
              <h4 className="flex items-start  gap-2 text-sm font-semibold text-heading">
                <Building2 className="h-4 w-4 mt-0.5 text-body" />
                Selected Clearinghouse Account
              </h4>
              <EditButton
                section="clearinghouse"
                variant="viewAll"
                label="Change"
                onEdit={() => console.log("change clearinghouse account") /* TODO: open account picker */}
              />
            </div>

            <div className="flex items-start gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-border text-heading">
                <Building2 className="h-6 w-6" />
              </span>
              <div className="min-w-0 space-y-1.5">
                <p className="text-sm font-semibold text-heading">Change Healthcare</p>
                <p className="flex items-center gap-1.5 text-xs font-medium text-success">
                  <span className="h-2 w-2 rounded-full bg-success" aria-hidden="true" />
                  Connected
                </p>
                <dl className="space-y-1 text-xs">
                  <div className="grid grid-cols-[90px_minmax(0,1fr)] gap-2">
                    <dt className="text-body">Environment:</dt>
                    <dd className="font-medium text-heading">Production</dd>
                  </div>
                  <div className="grid grid-cols-[90px_minmax(0,1fr)] gap-2">
                    <dt className="text-body">Account:</dt>
                    <dd className="font-medium text-heading">CH - Main Account</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>

          <div className="border-t border-divider p-5">
            <h4 className="mb-4 text-sm font-semibold text-heading">What happens next?</h4>
                     <ol>
              {NEXT_STEPS.map((text, i) => {
                const isActive = i === activeStep;
                const isDone = i < activeStep;
                const isLast = i === NEXT_STEPS.length - 1;
                return (
                  <li key={text} className={`relative flex items-start gap-3 text-xs ${isLast ? "" : "pb-5"}`}>
                    {/* Dotted connector to the next step */}
                    {!isLast && (
                      <span
                        aria-hidden="true"
                        className={`absolute left-3 top-6 bottom-0 -translate-x-1/2 border-l border-dashed transition-colors duration-500 ${
                          isDone ? "border-primary" : "border-border"
                        }`}
                      />
                    )}
                    <span
                      className={`relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold transition-all duration-500 ${
                        isActive
                          ? "bg-primary text-on-primary ring-4 ring-primary/20"
                          : isDone
                            ? "border border-primary bg-card text-primary"
                            : "border border-border bg-card text-body"
                      }`}
                    >
                      {i + 1}
                    </span>
                    <span
                      className={`pt-1 transition-colors duration-500 ${
                        isActive ? "font-medium text-heading" : "text-body"
                      }`}
                    >
                      {text}
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>
        </section>
      </div>
    </StickyColumns>
  );
};

export default ReviewSubmit;