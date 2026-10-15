"use client";

import React, { useState } from "react";
import { FileText, Plus } from "lucide-react";

import ImportButton from "@/components/ImportButton";
import InputActions from "@/components/InputActions";
import {
  StepHeader,
  TextAreaField,
  checkboxCls,
  ghostBtn,
} from "@/components/Verticalsteps";

/* ---------- Static data ---------- */
const TABS = ["SOAP Note", "Free Text Note", "Previous Notes"] as const;
type Tab = (typeof TABS)[number];

const ROS = [
  "Constitutional", "Eyes", "ENT", "Cardiovascular",
  "Respiratory", "Gastrointestinal", "Genitourinary", "Musculoskeletal",
  "Integumentary", "Neurological", "Psychiatric", "Endocrine",
];

const PREVIOUS = [
  { date: "Sep 12, 2026", title: "Lab Review", provider: "Dr. Emily Davis" },
  { date: "Aug 20, 2026", title: "Annual Checkup", provider: "Dr. Sarah Lee" },
  { date: "Jul 14, 2026", title: "Allergy Consultation", provider: "Dr. Sarah Lee" },
];

const UsePrevious = () => (
  <button type="button" className={ghostBtn}>
    <Plus className="h-3.5 w-3.5" />
    Use Previous
  </button>
);

/* ---------- Component ---------- */
const ClinicalNotes = () => {
  const [tab, setTab] = useState<Tab>("SOAP Note");
  const [subjective, setSubjective] = useState(
    "Patient reports nasal congestion and occasional cough for the past 5 days. Symptoms started gradually and have been worsening at night. No fever. Reports mild headache and fatigue. Denies shortness of breath or chest pain.",
  );
  const [objective, setObjective] = useState(
    "Vitals stable. Mild nasal congestion. Throat mildly erythematous. Lungs clear bilaterally.\nNo wheezing. No lymphadenopathy.",
  );
  const [ros, setRos] = useState<string[]>(["ENT", "Respiratory"]);
  const [extra, setExtra] = useState("");
  const [freeText, setFreeText] = useState("");

  const toggleRos = (name: string) =>
    setRos((prev) => (prev.includes(name) ? prev.filter((r) => r !== name) : [...prev, name]));

  return (
    <div className="min-w-0">
      <StepHeader
        title="Clinical Notes"
        subtitle="Document the patient's history, examination findings and clinical notes."
        action={
          <ImportButton text="Use Template" icon={<FileText className="h-4 w-4" />} onClick={() => {}} />
        }
      />

      {/* Sub tabs */}
      <div
        role="tablist"
        aria-label="Note type"
        className="custom-scrollbar mb-5 flex min-w-0 gap-5 overflow-x-auto overflow-y-hidden border-b border-border"
      >
        {TABS.map((t) => {
          const on = t === tab;
          return (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => setTab(t)}
              className={`-mb-px cursor-pointer whitespace-nowrap border-b-2 px-1 pb-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${
                on ? "border-primary text-primary" : "border-transparent text-body hover:text-heading"
              }`}
            >
              {t}
            </button>
          );
        })}
      </div>

      {tab === "SOAP Note" && (
        <div className="space-y-6">
          <div>
            <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
              <div>
                <p className="text-sm font-medium text-label">Subjective (S)</p>
                <p className="text-xs text-body">Patient&apos;s chief complaint, history of present illness, relevant history.</p>
              </div>
              <UsePrevious />
            </div>
            <InputActions value={subjective} onChange={setSubjective} rows={4} />
          </div>

          <div>
            <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
              <div>
                <p className="text-sm font-medium text-label">Objective (O)</p>
                <p className="text-xs text-body">Physical examination findings, vital signs and objective data.</p>
              </div>
              <UsePrevious />
            </div>
            <InputActions value={objective} onChange={setObjective} rows={3} />
          </div>

          <div>
            <p className="text-sm font-medium text-label">Review of Systems (ROS)</p>
            <p className="mb-3 text-xs text-body">System-wise review based on patient&apos;s symptoms.</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3 xl:grid-cols-4">
              {ROS.map((r) => (
                <label key={r} className="flex cursor-pointer items-center gap-2.5 text-sm text-heading">
                  <input
                    type="checkbox"
                    checked={ros.includes(r)}
                    onChange={() => toggleRos(r)}
                    className={checkboxCls}
                  />
                  {r}
                </label>
              ))}
            </div>
          </div>

          <TextAreaField
            label="Additional Notes"
            optional
            placeholder="Add any additional clinical notes, observations or comments here..."
            rows={3}
            value={extra}
            onChange={setExtra}
          />
        </div>
      )}

      {tab === "Free Text Note" && (
        <div>
          <p className="mb-2 text-sm font-medium text-label">Free Text Note</p>
          <InputActions
            value={freeText}
            onChange={setFreeText}
            rows={9}
            placeholder="Write the clinical note here..."
          />
        </div>
      )}

      {tab === "Previous Notes" && (
        <ul className="min-w-0 space-y-3">
          {PREVIOUS.map((n) => (
            <li
              key={n.date}
              className="flex min-h-[88px] min-w-0 items-center gap-3 rounded-xl border border-border p-4 transition-colors hover:border-primary/40"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FileText className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-heading">{n.title}</p>
                <p className="text-xs text-body">
                  {n.date} • {n.provider}
                </p>
              </div>
              <UsePrevious />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ClinicalNotes;