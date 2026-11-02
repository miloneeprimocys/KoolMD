"use client";

import React, { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import Breadcrumb from "@/components/Breadcrumb";
import AddButton from "@/components/Addbutton";
import ImportButton from "@/components/ImportButton";
import SignupField, { FieldError } from "@/components/SignupField";
import SignupDropdown from "@/components/SignupDropdown";
import DatePicker from "@/components/Datepicker";
import { SectionCard, TextArea, Req, Opt, labelCls, toOptions } from "@/providers/Shared";

import { OBSERVATIONS, OBSERVATION_META, VIEW_PATIENT_ROUTE } from "./Fhirobservations";

/* ---------------------------------------------------------------- */
/*  Options (replace with API data)                                  */
/* ---------------------------------------------------------------- */
const PATIENT_OPTIONS = Array.from(new Map(OBSERVATIONS.map((o) => [o.patientCode, o])).values()).map((o) => ({
  value: o.patientCode,
  label: `${o.patient} (${o.patientCode})`,
}));
const ENCOUNTER_OPTIONS = toOptions(Array.from(new Set(OBSERVATIONS.map((o) => o.encounterId))));
const CATEGORY_OPTIONS = toOptions(["Vital Signs", "Laboratory"]);

const observationsFor = (category: string) =>
  toOptions(Object.keys(OBSERVATION_META).filter((k) => OBSERVATION_META[k].category === category));

const nowLocal = () => {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};

type Errors = Partial<Record<"patient" | "encounter" | "category" | "observation" | "systolic" | "diastolic" | "value", string>>;

/* ---------------------------------------------------------------- */
/*  Page – used for BOTH "Add Observation" and "Edit Observation"    */
/*  Edit mode is on when the URL has ?id=...                          */
/* ---------------------------------------------------------------- */
const AddObservation = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");
  const existing = useMemo(() => OBSERVATIONS.find((o) => o.id === editId), [editId]);
  const isEdit = Boolean(existing);

  const [bpSys, bpDia] = existing?.observation === "Blood Pressure" ? existing.value.split("/") : ["", ""];

  const [patient, setPatient] = useState(existing?.patientCode ?? "");
  const [encounter, setEncounter] = useState(existing?.encounterId ?? "");
  const [category, setCategory] = useState(existing ? OBSERVATION_META[existing.observation]?.category ?? "" : "");
  const [observation, setObservation] = useState(existing?.observation ?? "");
  const [systolic, setSystolic] = useState(bpSys);
  const [diastolic, setDiastolic] = useState(bpDia);
  const [value, setValue] = useState(existing && existing.observation !== "Blood Pressure" ? existing.value : "");
  const [effectiveDate, setEffectiveDate] = useState(() => {
    const d = new Date();
    const p = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
  });
  const [effectiveTime, setEffectiveTime] = useState(() => {
    const d = new Date();
    const p = (n: number) => String(n).padStart(2, "0");
    return `${p(d.getHours())}:${p(d.getMinutes())}`;
  });
  const [notes, setNotes] = useState(isEdit ? "Patient seated, right arm, adult cuff." : "");
  const [errors, setErrors] = useState<Errors>({});

  const meta = OBSERVATION_META[observation];
  const isBP = observation === "Blood Pressure";
  const clear = (k: keyof Errors) => setErrors((p) => ({ ...p, [k]: undefined }));

  const goBack = () => router.push(`${VIEW_PATIENT_ROUTE}?id=1&tab=observations`);

  const submit = () => {
    const e: Errors = {};
    if (!patient) e.patient = "Select a patient";
    if (!encounter) e.encounter = "Select an encounter";
    if (!category) e.category = "Select a category";
    if (!observation) e.observation = "Select an observation";
    if (isBP) {
      if (!systolic.trim()) e.systolic = "Systolic is required";
      if (!diastolic.trim()) e.diastolic = "Diastolic is required";
    } else if (observation && !value.trim()) e.value = "Value is required";
    setErrors(e);
    if (Object.keys(e).length) return;

    // TODO: call your API here (PUT when isEdit, POST otherwise)
    console.log(isEdit ? "Observation updated:" : "Observation saved:", {
      id: editId,
      patient,
      encounter,
      category,
      observation,
      value: isBP ? `${systolic}/${diastolic}` : value,
      unit: meta?.unit,
      effective: `${effectiveDate}T${effectiveTime}`,
      notes,
    });
    goBack();
  };

  return (
    <div className="flex min-h-full w-full flex-col space-y-4 sm:space-y-5">
      <div className="flex-1 space-y-4 sm:space-y-5">
      <Breadcrumb
        items={[
          { label: "Clinical Records", href: "/fhir-model" },
          { label: "Observation", href: `${VIEW_PATIENT_ROUTE}?id=1&tab=observations` },
          { label: isEdit ? "Edit" : "Add" },
        ]}
      />

      {/* Title */}
      <div className="flex items-center gap-3">
    
        <h2 className="text-lg font-semibold text-heading sm:text-xl 2xl:text-2xl">
          {isEdit ? "Edit Observation" : "Add Observation"}
        </h2>
      </div>

      {/* Patient & Encounter */}
      <SectionCard step={1} title="Patient & Encounter">
        <div className="grid gap-4 md:grid-cols-2">
          <SignupDropdown
            name="patient"
            label={<>Patient<Req /></>}
            placeholder="Search patient by name or MRN..."
            options={PATIENT_OPTIONS}
            value={patient}
            onChange={(v) => {
              setPatient(v);
              clear("patient");
            }}
            error={errors.patient}
          />
          <SignupDropdown
            name="encounter"
            label={<>Encounter<Req /></>}
            placeholder="Select encounter"
            options={ENCOUNTER_OPTIONS}
            value={encounter}
            onChange={(v) => {
              setEncounter(v);
              clear("encounter");
            }}
            error={errors.encounter}
          />
        </div>
      </SectionCard>

      {/* Observation details */}
      <SectionCard step={2} title="Observation Details">
        <div className="grid gap-4 md:grid-cols-2">
          <SignupDropdown
            name="category"
            label={<>Category<Req /></>}
            placeholder="Select category"
            searchable={false}
            options={CATEGORY_OPTIONS}
            value={category}
            onChange={(v) => {
              setCategory(v);
              setObservation("");
              clear("category");
            }}
            error={errors.category}
          />
          <SignupDropdown
            key={`obs-${category}`}
            name="observation"
            label={<>Observation<Req /></>}
            placeholder={category ? "Select observation" : "Select category first"}
            options={observationsFor(category)}
            value={observation}
            onChange={(v) => {
              setObservation(v);
              clear("observation");
            }}
            disabled={!category}
            error={errors.observation}
          />
        </div>

        {observation && (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {isBP ? (
              <>
                <SignupField
                  name="systolic"
                  label={<>Systolic (mmHg)<Req /></>}
                  placeholder="e.g. 118"
                  value={systolic}
                  onChange={(e) => {
                    setSystolic(e.target.value);
                    clear("systolic");
                  }}
                  error={errors.systolic}
                />
                <SignupField
                  name="diastolic"
                  label={<>Diastolic (mmHg)<Req /></>}
                  placeholder="e.g. 76"
                  value={diastolic}
                  onChange={(e) => {
                    setDiastolic(e.target.value);
                    clear("diastolic");
                  }}
                  error={errors.diastolic}
                />
              </>
            ) : (
              <SignupField
                name="value"
                label={<>Value ({meta?.unit})<Req /></>}
                placeholder="Enter value"
                value={value}
                onChange={(e) => {
                  setValue(e.target.value);
                  clear("value");
                }}
                error={errors.value}
              />
            )}
          </div>
        )}

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <DatePicker
            name="effective"
            label={<>Effective Date &amp; Time<Req /></>}
            value={effectiveDate}
            onChange={setEffectiveDate}
            showTime
            time={effectiveTime}
            onTimeChange={setEffectiveTime}
          />

          <div className="w-full">
            <p className={labelCls}>Reference Range</p>
            <div className="flex min-h-12 items-center rounded-xl border border-border bg-primary/[0.03] px-4 py-2 text-sm text-body">
              {meta ? (
                isBP ? (
                  <span>
                    Systolic 90 - 120 · Diastolic 60 - 80 {meta.unit}
                  </span>
                ) : (
                  <span>
                    {meta.range} {meta.unit}
                  </span>
                )
              ) : (
                "Select an observation to see its reference range"
              )}
            </div>
          </div>
        </div>

        <div className="mt-4">
          <TextArea
            name="notes"
            label={<>Notes<Opt /></>}
            placeholder="Add any notes about this observation"
            value={notes}
            onChange={setNotes}
            maxLength={500}
            rows={3}
          />
        </div>
      </SectionCard>

      </div>
      <div className="sticky -bottom-4 sm:-bottom-6 z-[200] -mx-4 -mb-4 sm:-mb-6 mt-4 border-t border-border bg-card px-4 py-4 sm:-mx-6 sm:px-6 sm:py-5">
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <ImportButton text="Cancel" icon={null} onClick={() => router.back()} />
          <AddButton text={isEdit ? "Update" : "Save Observation"} icon={null} onClick={submit} />
        </div>
      </div>
    </div>
  );
};

export default AddObservation;