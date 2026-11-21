"use client";

import React, { useState } from "react";
import {
  CalendarDays,
  ChevronRight,
  ClipboardList,
  FileText,
  Pencil,
  Stethoscope,
  Target,
} from "lucide-react";

import AddButton from "@/components/Addbutton";
import EditButton from "@/components/EditButton";
import ErrorToast from "@/components/ErrorToast";
import InputActions from "@/components/InputActions";
import ImportButton from "@/components/ImportButton";
import RadioCheckButtonh from "@/components/RadioCheckButtonh";
import SuccessToast from "@/components/SuccessToast";
import Tags from "@/components/Tags";
import { ChipSelect, SectionCard, TextArea, cardCls, labelCls } from "@/providers/Shared";

/* ---------------------------------------------------------------- */
/*  Static data (replace with API data)                              */
/* ---------------------------------------------------------------- */
const NOTE_DATE = "Nov 26, 2026, 10:00 AM";

const ICD_OPTIONS = [
  { value: "G43.009", label: "G43.009 – Migraine, unspecified, not intractable" },
  { value: "R51.9", label: "R51.9 – Headache, unspecified" },
  { value: "G44.209", label: "G44.209 – Tension-type headache, unspecified" },
  { value: "R53.83", label: "R53.83 – Other fatigue" },
  { value: "R11.0", label: "R11.0 – Nausea" },
];

const TEMPLATES = [
  {
    title: "Follow-up Visit",
    subjective: "Patient returns for follow-up. Reports interval changes in symptoms: ",
    plan: "Continue current treatment.\nFollow up in 4 weeks or earlier if symptoms worsen.",
  },
  {
    title: "Initial Consultation",
    subjective: "New patient presenting with: ",
    plan: "Order baseline labs.\nReview results at next visit.",
  },
  {
    title: "Chronic Care Visit",
    subjective: "Chronic condition review. Medication adherence and side effects: ",
    plan: "Continue medication regimen.\nReinforce lifestyle measures.\nFollow up in 3 months.",
  },
];

const PREVIOUS_NOTES = [
  { date: "Oct 21, 2026", title: "Follow-up Visit", text: "Headache management, symptoms improving." },
  { date: "Aug 15, 2026", title: "Annual Wellness Visit", text: "Routine checkup, no significant concerns." },
];

const VISIT_SUMMARY = [
  { label: "Visit Type", value: "Follow-up Visit" },
  { label: "Status", value: <Tags text="In Progress" tone="violet" size="xs" /> },
  { label: "Attending Provider", value: "Dr. Sarah Miller" },
  { label: "Location", value: "Virtual Visit" },
];

const INITIAL_SUBJECTIVE =
  "Patient reports persistent headaches for the past 2 weeks, mostly in the afternoon, with mild nausea.\nDenies vomiting, vision changes or recent head injury.";
const INITIAL_OBJECTIVE = "Vitals stable. Neurological exam normal. No focal deficits. Mild tenderness over temporal region.";
const INITIAL_PLAN =
  "Continue current medication (Multivitamin).\nStart migraine management: Sumatriptan 50 mg as needed.\nMaintain headache diary and identify possible triggers.\nFollow up in 4 weeks or earlier if symptoms worsen.";

/* ---------------------------------------------------------------- */
/*  Tab: Clinical Notes                                              */
/* ---------------------------------------------------------------- */
const sectionIcon = (Icon: typeof FileText) => <Icon className="h-4 w-4" />;

const ClinicalNotes = () => {
  const [subjective, setSubjective] = useState(INITIAL_SUBJECTIVE);
  const [objective, setObjective] = useState(INITIAL_OBJECTIVE);
  const [diagnoses, setDiagnoses] = useState<string[]>(["G43.009"]);
  const [plan, setPlan] = useState(INITIAL_PLAN);
  const [complete, setComplete] = useState(false);
  const [errors, setErrors] = useState<{ subjective?: string; diagnoses?: string }>({});
  const [toast, setToast] = useState<{ type: "success" | "error" | null; title: string; message: string }>({
    type: null,
    title: "",
    message: "",
  });

  const closeToast = () => setToast((t) => ({ ...t, type: null }));

  const applyTemplate = (t: (typeof TEMPLATES)[number]) => {
    // Append, so nothing the clinician already typed is lost.
    setSubjective((s) => (s.trim() ? `${s}\n${t.subjective}` : t.subjective));
    setPlan((p) => (p.trim() ? `${p}\n${t.plan}` : t.plan));
  };

  const saveDraft = () => {
    // TODO: call your API – save draft
    console.log("Clinical note draft:", { subjective, objective, diagnoses, plan, complete });
    setToast({ type: "success", title: "Draft saved", message: "Your clinical note draft has been saved." });
  };

  const signAndSave = () => {
    const e: typeof errors = {};
    if (!subjective.trim()) e.subjective = "Add the patient's history of present illness.";
    if (diagnoses.length === 0) e.diagnoses = "Add at least one diagnosis before signing.";
    setErrors(e);
    if (Object.keys(e).length) {
      setToast({ type: "error", title: "Cannot sign note", message: "Please complete the highlighted sections." });
      return;
    }
    // TODO: call your API – sign & save (sanitize `objective` HTML on the server)
    console.log("Clinical note signed:", { subjective, objective, diagnoses, plan, complete });
    setToast({ type: "success", title: "Note signed", message: "The clinical note was signed and saved." });
  };

  return (
    <>
      <SuccessToast isOpen={toast.type === "success"} onClose={closeToast} title={toast.title} message={toast.message} />
      <ErrorToast isOpen={toast.type === "error"} onClose={closeToast} title={toast.title} message={toast.message} />

      <div className="grid min-w-0 items-start gap-4 sm:gap-5 2xl:grid-cols-[minmax(0,1fr)_340px]">
        {/* ================= LEFT: note ================= */}
        <section className={`${cardCls} min-w-0 space-y-4 sm:p-5`}>
          <header className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="flex items-center gap-2 text-base font-semibold text-heading">
              <FileText className="h-5 w-5 text-primary" />
              Clinical Note – Follow-up Visit
            </h3>
            <p className="flex items-center gap-1.5 text-xs text-body">
              <CalendarDays className="h-4 w-4" />
              Note Date: {NOTE_DATE}
            </p>
          </header>

          <SectionCard icon={sectionIcon(ClipboardList)} title="Subjective (History of Present Illness)">
            <TextArea
              name="subjective"
              value={subjective}
              onChange={(v) => {
                setSubjective(v);
                setErrors((p) => ({ ...p, subjective: undefined }));
              }}
              rows={3}
              error={errors.subjective}
            />
          </SectionCard>

          <SectionCard icon={sectionIcon(Stethoscope)} title="Objective (Exam Findings)">
            <InputActions value={objective} onChange={setObjective} rows={3} />
          </SectionCard>

          <SectionCard icon={sectionIcon(Target)} title="Assessment">
            <ChipSelect
              name="diagnoses"
              label="Diagnosis (ICD-10)"
              placeholder="Search or add diagnosis (ICD-10)"
              options={ICD_OPTIONS}
              value={diagnoses}
              onChange={(v) => {
                setDiagnoses(v);
                setErrors((p) => ({ ...p, diagnoses: undefined }));
              }}
              error={errors.diagnoses}
            />
          </SectionCard>

          <SectionCard icon={sectionIcon(ClipboardList)} title="Plan">
            <TextArea name="plan" value={plan} onChange={setPlan} rows={5} />
          </SectionCard>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <label className="flex cursor-pointer items-center gap-2.5 text-sm text-heading">
              <RadioCheckButtonh
                type="checkbox"
                checked={complete}
                onChange={(e) => setComplete(e.target.checked)}
                className="h-4 w-4 shrink-0 cursor-pointer rounded border-border accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
              />
              Mark note as complete
            </label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <ImportButton text="Save Draft" icon={null} onClick={saveDraft} className="whitespace-nowrap" />
              <AddButton text="Sign & Save" icon={<Pencil className="h-4 w-4" />} onClick={signAndSave} className="whitespace-nowrap" />
            </div>
          </div>
          <span className={`${labelCls} sr-only`}>Clinical note actions</span>
        </section>

        {/* ================= RIGHT ================= */}
        <aside className="min-w-0 space-y-4 sm:space-y-5">
          <section className={`${cardCls} space-y-3 !p-3.5 sm:!p-4`}>
            <header className="flex items-center justify-between gap-3">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-heading">
                <FileText className="h-4 w-4 text-primary" />
                Note Templates
              </h3>
              <EditButton section="Note Templates" variant="viewAll" onEdit={() => {}} />
            </header>
            <ul className="divide-y divide-divider">
              {TEMPLATES.map((t) => (
                <li key={t.title}>
                  <button
                    type="button"
                    onClick={() => applyTemplate(t)}
                    className="flex w-full cursor-pointer items-center gap-3 py-2.5 text-left text-sm text-heading transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                  >
                    <FileText className="h-4 w-4 shrink-0 text-primary" />
                    <span className="min-w-0 flex-1 truncate">{t.title}</span>
                    <ChevronRight className="h-4 w-4 shrink-0 text-body" />
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <section className={`${cardCls} space-y-3 !p-3.5 sm:!p-4`}>
            <header className="flex items-center justify-between gap-3">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-heading">
                <ClipboardList className="h-4 w-4 text-primary" />
                Previous Clinical Notes ({PREVIOUS_NOTES.length})
              </h3>
              <EditButton section="Previous Clinical Notes" variant="viewAll" onEdit={() => {}} />
            </header>
            <ul className="divide-y divide-divider">
              {PREVIOUS_NOTES.map((n) => (
                <li key={n.date} className="flex items-center gap-3 py-2.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <CalendarDays className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-heading">
                      {n.date} <span className="font-normal text-body">• {n.title}</span>
                    </span>
                    <span className="block truncate text-xs text-body">{n.text}</span>
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-body" />
                </li>
              ))}
            </ul>
          </section>

          <section className={`${cardCls} space-y-3 !p-3.5 sm:!p-4`}>
            <h3 className="flex items-center gap-2 text-sm font-semibold text-heading">
              <ClipboardList className="h-4 w-4 text-primary" />
              This Visit Summary
            </h3>
            <dl className="space-y-2.5">
              {VISIT_SUMMARY.map((r) => (
                <div key={r.label} className="flex items-center justify-between gap-3 text-sm">
                  <dt className="text-body">{r.label}</dt>
                  <dd className="font-medium text-heading">{r.value}</dd>
                </div>
              ))}
            </dl>
          </section>
        </aside>
      </div>
    </>
  );
};

export default ClinicalNotes;