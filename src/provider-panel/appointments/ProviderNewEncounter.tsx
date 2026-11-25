"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CalendarCheck, ClipboardList, FlaskConical, Pencil, Pill, Plus, Search, Stethoscope, Trash2, Video, X } from "lucide-react";

import AddButton from "@/components/Addbutton";
import DatePicker from "@/components/Datepicker";
import ErrorToast from "@/components/ErrorToast";
import ImportButton from "@/components/ImportButton";
import SignupDropdown from "@/components/SignupDropdown";
import SignupField from "@/components/SignupField";
import SuccessToast from "@/components/SuccessToast";
import { Req, cardCls, toOptions, uid, type Errors } from "@/providers/Shared";
import AddOrderModal, { type PlacedOrder } from "@/provider-panel/appointments/consulting/AddOrderModal";
import AddMedicationModal from "@/provider-panel/appointments/consulting/AddMedicationModal";
import type { Medication as PrescribedMedication } from "@/provider-panel/appointments/consulting/MedicationsTab";

/* ---------------------------------------------------------------- */
/*  Static data (replace with API data)                              */
/* ---------------------------------------------------------------- */
const PATIENT = { name: "Emily Carter", age: "32 years", sex: "Female", mrn: "KM-002487", date: "Nov 26, 2026", time: "10:00 AM", type: "Follow-up Visit", reason: "Headache Management" };

const VISIT_TYPES = toOptions(["Follow-up Visit", "Initial Consultation", "Annual Wellness Visit", "Chronic Care Visit"]);
const LOCATIONS = toOptions(["Telemedicine", "In-Person"]);
const NOTE_FORMATS = toOptions(["SOAP (Standard)", "SOAP (Brief)", "Free Text"]);

const todayISO = () => {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")}`;
};

type Medication = { id: string; name: string; instructions: string };

const checkboxCls =
  "h-4 w-4 shrink-0 cursor-pointer rounded border-border accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30";
const iconBtn =
  "flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30";

const Letter = ({ children }: { children: string }) => (
  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-semibold text-primary">{children}</span>
);

const Heading = ({ icon: Icon, title, action }: { icon: typeof Stethoscope; title: string; action?: React.ReactNode }) => (
  <div className="flex items-center justify-between gap-3">
    <h3 className="flex min-w-0 items-center gap-2 text-sm font-semibold text-heading">
      <Icon className="h-4 w-4 shrink-0 text-primary" />
      <span className="truncate">{title}</span>
    </h3>
    {action}
  </div>
);

/* ---------------------------------------------------------------- */
/*  Page                                                             */
/* ---------------------------------------------------------------- */
const ProviderNewEncounter = () => {
  const router = useRouter();

  const [date, setDate] = useState("2026-11-26");
  const [visitType, setVisitType] = useState("Follow-up Visit");
  const [location, setLocation] = useState("Telemedicine");
  const [noteFormat, setNoteFormat] = useState("SOAP (Standard)");
  const [subjective, setSubjective] = useState("");
  const [objective, setObjective] = useState("");
  const [assessment, setAssessment] = useState("");
  const [plan, setPlan] = useState("");

  const [diagnosisInput, setDiagnosisInput] = useState("");
  const [diagnoses, setDiagnoses] = useState<string[]>(["G43.009 – Migraine, unspecified"]);
  const [labTest, setLabTest] = useState(false);
  const [imaging, setImaging] = useState(false);
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [medicationModalOpen, setMedicationModalOpen] = useState(false);

  const [medications, setMedications] = useState<Medication[]>([{ id: "m1", name: "Sumatriptan 50 mg", instructions: "Take 1 tablet as needed for migraine" }]);
  const [medForm, setMedForm] = useState<{ open: boolean; editingId: string | null; name: string; instructions: string }>({ open: false, editingId: null, name: "", instructions: "" });
  const [treatmentPlan, setTreatmentPlan] = useState("• Continue Sumatriptan 50 mg as needed.\n• Maintain headache diary.\n• Follow up in 4 weeks.");

  const [complete, setComplete] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [toast, setToast] = useState<{ ok: boolean; title: string; message: string } | null>(null);

  const clearError = (key: string) => setErrors((p) => ({ ...p, [key]: "" }));

  const addDiagnosis = () => {
    const v = diagnosisInput.trim();
    if (v && !diagnoses.includes(v)) setDiagnoses((d) => [...d, v]);
    setDiagnosisInput("");
  };

  const saveMedication = () => {
    const name = medForm.name.trim();
    if (!name) return;
    const entry = { id: medForm.editingId ?? uid(), name, instructions: medForm.instructions.trim() };
    setMedications((list) => (medForm.editingId ? list.map((m) => (m.id === entry.id ? entry : m)) : [...list, entry]));
    setMedForm({ open: false, editingId: null, name: "", instructions: "" });
  };

  const saveDraft = () => {
    // TODO: call your API here (no validation for drafts)
    setToast({ ok: true, title: "Draft saved", message: "The encounter draft has been saved." });
  };

  const signEncounter = () => {
    const e: Errors = {};
    if (!date) e.date = "Encounter date is required.";
    else if (date > todayISO()) e.date = "Encounter date can't be in the future.";
    if (!visitType) e.visitType = "Visit type is required.";
    setErrors(e);
    const count = Object.keys(e).length;
    if (count) {
      setToast({ ok: false, title: "Check the form", message: `${count} field${count > 1 ? "s need" : " needs"} attention.` });
      return;
    }
    // TODO: call your API here
    setToast({ ok: true, title: "Encounter signed", message: complete ? "The encounter was signed and marked as complete." : "The encounter was signed." });
  };

  return (
    <div className="mx-auto w-full min-w-0 max-w-[1600px] space-y-4 sm:space-y-5">
      <SuccessToast isOpen={toast?.ok === true} onClose={() => setToast(null)} title={toast?.title} message={toast?.message} />
      <ErrorToast isOpen={toast?.ok === false} onClose={() => setToast(null)} title={toast?.title} message={toast?.message} />

      <button
        type="button"
        onClick={() => router.back()}
        className="flex cursor-pointer items-center gap-1.5 text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Encounters
      </button>

      <div>
        <h2 className="text-lg font-semibold text-heading sm:text-xl 2xl:text-2xl">New Encounter</h2>
        <p className="mt-0.5 text-sm text-body">Create a new encounter and document the patient visit.</p>
      </div>

      {/* Patient header */}
      <div className={`${cardCls} !p-3.5 sm:!p-5`}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-base font-semibold text-primary">EC</span>
            <div>
              <h3 className="text-base font-semibold text-heading sm:text-xl">{PATIENT.name}</h3>
              <p className="text-xs text-body sm:text-sm">
                {PATIENT.age} • {PATIENT.sex} • MRN: {PATIENT.mrn}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 border-t border-divider pt-3 sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <CalendarCheck className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-heading">{PATIENT.date}</p>
              <p className="text-xs text-body sm:text-sm">{PATIENT.time}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 border-t border-divider pt-3 sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Video className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-heading">{PATIENT.type}</p>
              <p className="text-xs text-body sm:text-sm">{PATIENT.reason}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid min-w-0 items-start gap-4 sm:gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        {/* ================= LEFT ================= */}
        <div className="min-w-0 space-y-4 sm:space-y-5">
          <section className={`${cardCls} min-w-0 space-y-4 sm:p-5`}>
            <h3 className="text-base font-semibold text-heading">Encounter Information</h3>
            <div className="grid gap-4 sm:grid-cols-3">
              <DatePicker
                name="encounterDate"
                label={<>Encounter Date<Req /></>}
                placeholder="dd-mm-yyyy"
                value={date}
                onChange={(v) => {
                  setDate(v);
                  clearError("date");
                }}
                maxDate={todayISO()}
                error={errors.date || undefined}
              />
              <SignupDropdown
                name="visitType"
                label={<>Visit Type<Req /></>}
                placeholder="Select visit type"
                options={VISIT_TYPES}
                value={visitType}
                onChange={(v) => {
                  setVisitType(v);
                  clearError("visitType");
                }}
                error={errors.visitType || undefined}
                searchable={false}
              />
              <SignupDropdown name="location" label="Location" placeholder="Select location" options={LOCATIONS} value={location} onChange={setLocation} searchable={false} />
            </div>
          </section>

          <section className={`${cardCls} min-w-0 space-y-4 sm:p-5`}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-base font-semibold text-heading">Clinical Notes (SOAP)</h3>
              <div className="w-full sm:w-56">
                <SignupDropdown name="noteFormat" options={NOTE_FORMATS} value={noteFormat} onChange={setNoteFormat} searchable={false} />
              </div>
            </div>
            {(
              [
                ["S", "subjective", "Subjective", "Patient’s reported symptoms, history and concerns...", subjective, setSubjective],
                ["O", "objective", "Objective", "Examination findings, vitals and observations...", objective, setObjective],
                ["A", "assessment", "Assessment", "Clinical impression, diagnosis (or differential diagnosis)...", assessment, setAssessment],
                ["P", "plan", "Plan", "Treatment plan, medications, orders and follow-up...", plan, setPlan],
              ] as const
            ).map(([letter, name, label, placeholder, value, setValue]) => (
              <div key={name} className="grid min-w-0 grid-cols-[2.25rem_minmax(0,1fr)] gap-x-3 gap-y-2">
                <Letter>{letter}</Letter>
                <label htmlFor={name} className="self-center text-sm font-medium text-label">{label}</label>
                <div className="col-span-2 min-w-0">
                  <SignupField id={name} name={name} aria-label={label} multiline rows={2} value={value} onChange={(e) => setValue(e.target.value)} placeholder={placeholder} />
                </div>
              </div>
            ))}
          </section>
        </div>

        {/* ================= RIGHT ================= */}
        <aside className="min-w-0 space-y-4 sm:space-y-5">
          <section className={`${cardCls} min-w-0 space-y-3 !p-3.5 sm:!p-4`}>
            <Heading icon={Stethoscope} title="Diagnosis" />
            <SignupField
              name="diagnosisSearch"
              placeholder="Search and add diagnosis (ICD-10)..."
              icon={<Search className="h-4 w-4" />}
              value={diagnosisInput}
              onChange={(e) => setDiagnosisInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addDiagnosis();
                }
              }}
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
          </section>

          <section className={`${cardCls} min-w-0 space-y-3 !p-3.5 sm:!p-4`}>
            <Heading
              icon={FlaskConical}
              title="Orders"
              action={<ImportButton text="Add Order" icon={<Plus className="h-4 w-4" />} onClick={() => setOrderModalOpen(true)} className="whitespace-nowrap" />}
            />
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              <label className="flex cursor-pointer items-center gap-2.5 text-sm text-heading">
                <input type="checkbox" checked={labTest} onChange={(e) => setLabTest(e.target.checked)} className={checkboxCls} />
                Lab Test
              </label>
              <label className="flex cursor-pointer items-center gap-2.5 text-sm text-heading">
                <input type="checkbox" checked={imaging} onChange={(e) => setImaging(e.target.checked)} className={checkboxCls} />
                Imaging
              </label>
            </div>
          </section>

          <section className={`${cardCls} min-w-0 space-y-3 !p-3.5 sm:!p-4`}>
            <Heading
              icon={Pill}
              title="Medications"
              action={
                <ImportButton
                  text="Add Medication"
                  icon={<Plus className="h-4 w-4" />}
                  onClick={() => setMedicationModalOpen(true)}
                  className="whitespace-nowrap"
                />
              }
            />
            {medications.length > 0 && (
              <ul className="space-y-2">
                {medications.map((m) => (
                  <li key={m.id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Pill className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-heading">{m.name}</span>
                      <span className="block truncate text-xs text-body">{m.instructions}</span>
                    </span>
                    <button
                      type="button"
                      aria-label={`Edit ${m.name}`}
                      onClick={() => setMedForm({ open: true, editingId: m.id, name: m.name, instructions: m.instructions })}
                      className={`${iconBtn} text-primary hover:bg-primary/10`}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      aria-label={`Remove ${m.name}`}
                      onClick={() => setMedications((list) => list.filter((x) => x.id !== m.id))}
                      className={`${iconBtn} text-danger hover:bg-danger/10`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {medForm.open && (
              <div className="space-y-3 rounded-xl border border-border p-3">
                <SignupField name="medName" label="Medication" placeholder="e.g. Sumatriptan 50 mg" value={medForm.name} onChange={(e) => setMedForm((p) => ({ ...p, name: e.target.value }))} autoComplete="off" />
                <SignupField name="medInstructions" label="Instructions" placeholder="e.g. Take 1 tablet as needed" value={medForm.instructions} onChange={(e) => setMedForm((p) => ({ ...p, instructions: e.target.value }))} autoComplete="off" />
                <div className="flex justify-end gap-2">
                  <ImportButton text="Cancel" icon={null} onClick={() => setMedForm({ open: false, editingId: null, name: "", instructions: "" })} />
                  <AddButton text={medForm.editingId ? "Update" : "Add"} icon={null} onClick={saveMedication} />
                </div>
              </div>
            )}
          </section>

          <section className={`${cardCls} min-w-0 space-y-3 !p-3.5 sm:!p-4`}>
            <Heading icon={ClipboardList} title="Treatment Plan / Follow-up" />
            <SignupField name="treatmentPlan" multiline rows={4} value={treatmentPlan} onChange={(e) => setTreatmentPlan(e.target.value)} placeholder="Add the treatment plan and follow-up" />
          </section>
        </aside>
      </div>

      {/* ---------- Footer ---------- */}
      <div className={`${cardCls} flex flex-col gap-3 !p-3.5 sm:flex-row sm:items-center sm:justify-between sm:!p-4`}>
        <label className="flex cursor-pointer items-center gap-2.5 text-sm text-heading">
          <input type="checkbox" checked={complete} onChange={(e) => setComplete(e.target.checked)} className={checkboxCls} />
          Mark as complete
        </label>
        <div className="flex gap-2 sm:gap-3">
          <ImportButton text="Save Draft" icon={null} onClick={saveDraft} className="whitespace-nowrap" />
          <AddButton text="Sign Encounter" icon={<Pencil className="h-4 w-4" />} onClick={signEncounter} className="whitespace-nowrap" />
        </div>
      </div>

      <AddOrderModal
        open={orderModalOpen}
        onClose={() => setOrderModalOpen(false)}
        onSubmitOrders={(orders: PlacedOrder[]) => {
          setLabTest(orders.some((order) => order.type === "Lab Test"));
          setImaging(orders.some((order) => order.type === "Imaging"));
        }}
      />
      <AddMedicationModal
        open={medicationModalOpen}
        onClose={() => setMedicationModalOpen(false)}
        onAdd={(medication: PrescribedMedication) => {
          const instructions = [medication.dosage, medication.frequency, medication.notes].filter(Boolean).join(" · ");
          setMedications((current) => [{ id: medication.id, name: `${medication.name} ${medication.strength}`.trim(), instructions }, ...current]);
          setMedicationModalOpen(false);
        }}
      />
    </div>
  );
};

export default ProviderNewEncounter;
