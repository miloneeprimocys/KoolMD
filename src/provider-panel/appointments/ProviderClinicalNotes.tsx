"use client";

import React, { useState } from "react";
import { ChevronRight, FileText, History, Layers, Pencil, X } from "lucide-react";

import AddButton from "@/components/Addbutton";
import ErrorToast from "@/components/ErrorToast";
import ImportButton from "@/components/ImportButton";
import SignupDropdown from "@/components/SignupDropdown";
import SignupField from "@/components/SignupField";
import SuccessToast from "@/components/SuccessToast";
import { cardCls, toOptions } from "@/providers/Shared";

/* ---------------------------------------------------------------- */
/*  Static data (replace with API data)                              */
/* ---------------------------------------------------------------- */
const NOTE_FORMATS = toOptions(["SOAP (Standard)", "SOAP (Brief)", "Free Text"]);
const TEMPLATES = toOptions(["Follow-up Visit", "Initial Consultation", "Annual Wellness Visit"]);

const PREVIOUS_NOTES = [
  { date: "Oct 20, 2026", type: "Follow-up Visit" },
  { date: "Aug 14, 2026", type: "Initial Consultation" },
];

const checkboxCls =
  "h-4 w-4 shrink-0 cursor-pointer rounded border-border accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30";

const Letter = ({ children }: { children: string }) => (
  <span className="flex h-8 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">{children}</span>
);

/* ---------------------------------------------------------------- */
/*  Tab: Clinical Notes                                              */
/* ---------------------------------------------------------------- */
const ProviderClinicalNotes = () => {
  const [format, setFormat] = useState("SOAP (Standard)");
  const [template, setTemplate] = useState("Follow-up Visit");
  const [subjective, setSubjective] = useState("Persistent headaches for 2 weeks, mostly in the afternoon. Mild nausea. No visual changes.");
  const [objective, setObjective] = useState("Vitals stable. Neurological exam normal. No focal deficits.");
  const [diagnoses, setDiagnoses] = useState<string[]>(["G43.009 – Migraine, unspecified"]);
  const [diagnosisInput, setDiagnosisInput] = useState("");
  const [plan, setPlan] = useState("• Start Sumatriptan 50 mg as needed.\n• Maintain headache diary.\n• Follow up in 4 weeks.");
  const [complete, setComplete] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const addDiagnosis = () => {
    const v = diagnosisInput.trim();
    if (v && !diagnoses.includes(v)) setDiagnoses((d) => [...d, v]);
    setDiagnosisInput("");
  };

  const saveDraft = () => {
    // TODO: call your API here
    setSaved("Draft saved.");
  };

  const signAndSave = () => {
    if (!subjective.trim() || diagnoses.length === 0) {
      setError("Add the Subjective note and at least one diagnosis before signing.");
      return;
    }
    // TODO: call your API here
    setSaved(complete ? "Note signed and marked as complete." : "Note signed and saved.");
  };

  return (
    <div className="flex min-h-full flex-1 flex-col gap-4 sm:gap-5">
      <SuccessToast isOpen={saved !== null} onClose={() => setSaved(null)} title="Clinical note" message={saved ?? ""} />
      <ErrorToast isOpen={error !== null} onClose={() => setError(null)} title="Check the note" message={error ?? ""} />

      <div className="grid min-w-0 flex-1 items-start gap-4 sm:gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        {/* ---------- SOAP ---------- */}
        <section className={`${cardCls} min-w-0 space-y-4 sm:p-5`}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-base font-semibold text-heading">Clinical Notes</h3>
            <div className="w-full sm:w-56">
              <SignupDropdown name="noteFormat" options={NOTE_FORMATS} value={format} onChange={setFormat} searchable={false} />
            </div>
          </div>

          <div className="grid min-w-0 grid-cols-[2.25rem_minmax(0,1fr)] gap-x-3 gap-y-2">
            <Letter>S</Letter>
            <label htmlFor="subjective" className="self-center text-sm font-medium text-label">Subjective</label>
            <div className="col-span-2 min-w-0">
              <SignupField id="subjective" name="subjective" aria-label="Subjective" multiline rows={2} value={subjective} onChange={(e) => setSubjective(e.target.value)} placeholder="Patient’s reported symptoms, history and concerns..." />
            </div>
          </div>

          <div className="grid min-w-0 grid-cols-[2.25rem_minmax(0,1fr)] gap-x-3 gap-y-2">
            <Letter>O</Letter>
            <label htmlFor="objective" className="self-center text-sm font-medium text-label">Objective</label>
            <div className="col-span-2 min-w-0">
              <SignupField id="objective" name="objective" aria-label="Objective" multiline rows={2} value={objective} onChange={(e) => setObjective(e.target.value)} placeholder="Examination findings, vitals and observations..." />
            </div>
          </div>

          <div className="grid min-w-0 grid-cols-[2.25rem_minmax(0,1fr)] gap-x-3 gap-y-2">
            <Letter>A</Letter>
            <label htmlFor="assessment" className="self-center text-sm font-medium text-label">Assessment</label>
            <div className="col-span-2 min-w-0 space-y-2">
              <SignupField
                id="assessment"
                name="assessment"
                aria-label="Assessment"
                value={diagnosisInput}
                onChange={(e) => setDiagnosisInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addDiagnosis();
                  }
                }}
                placeholder="Clinical impression, diagnosis (press Enter to add)..."
                autoComplete="off"
              />
              {diagnoses.length > 0 && (
                <ul className="flex flex-wrap gap-2">
                  {diagnoses.map((d) => (
                    <li key={d} className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 py-1 pl-2.5 pr-1.5 text-xs font-medium text-heading">
                      {d}
                      <button
                        type="button"
                        aria-label={`Remove ${d}`}
                        onClick={() => setDiagnoses((list) => list.filter((x) => x !== d))}
                        className="flex h-4 w-4 cursor-pointer items-center justify-center rounded text-body transition-colors hover:bg-danger/10 hover:text-danger"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="grid min-w-0 grid-cols-[2.25rem_minmax(0,1fr)] gap-x-3 gap-y-2">
            <Letter>P</Letter>
            <label htmlFor="plan" className="self-center text-sm font-medium text-label">Plan</label>
            <div className="col-span-2 min-w-0">
              <SignupField id="plan" name="plan" aria-label="Plan" multiline rows={4} value={plan} onChange={(e) => setPlan(e.target.value)} placeholder="Treatment plan, medications, orders and follow-up..." />
            </div>
          </div>
        </section>

        {/* ---------- Side ---------- */}
        <aside className="min-w-0 space-y-4 sm:space-y-5">
          <section className={`${cardCls} min-w-0 space-y-3 !p-3.5 sm:!p-4`}>
            <h3 className="flex items-center gap-2 text-sm font-semibold text-heading">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Layers className="h-4 w-4" />
              </span>
              Note Templates
            </h3>
            <SignupDropdown name="noteTemplate" options={TEMPLATES} value={template} onChange={setTemplate} searchable={false} />
          </section>

          <section className={`${cardCls} min-w-0 space-y-3 !p-3.5 sm:!p-4`}>
            <h3 className="flex items-center gap-2 text-sm font-semibold text-heading">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <History className="h-4 w-4" />
              </span>
              Previous Clinical Notes
            </h3>
            <ul className="divide-y divide-divider">
              {PREVIOUS_NOTES.map((n) => (
                <li key={n.date}>
                  <button
                    type="button"
                    className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-2 py-2.5 text-left transition-colors hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <FileText className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-heading">{n.date}</span>
                      <span className="block text-xs text-body">{n.type}</span>
                    </span>
                    <ChevronRight className="h-4 w-4 shrink-0 text-body" />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>

      {/* ---------- Footer ---------- */}
      <div className="sticky -bottom-4 z-[200] -mx-4 -mb-4 mt-4 border-t border-border bg-card px-4 py-4 sm:-bottom-6 sm:-mx-6 sm:-mb-6 sm:px-6 sm:py-5">
        <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex cursor-pointer items-center gap-2.5 text-sm text-heading">
            <input type="checkbox" checked={complete} onChange={(e) => setComplete(e.target.checked)} className={checkboxCls} />
            Mark as complete
          </label>
          <div className="flex gap-2 sm:gap-3">
            <ImportButton text="Save Draft" icon={null} onClick={saveDraft} className="whitespace-nowrap" />
            <AddButton text="Sign & Save" icon={<Pencil className="h-4 w-4" />} onClick={signAndSave} className="whitespace-nowrap" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderClinicalNotes;
