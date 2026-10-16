"use client";

import React, { useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import Breadcrumb from "@/components/Breadcrumb";
import Tags from "@/components/Tags";
import ImportButton from "@/components/ImportButton";
import SuccessToast from "@/components/SuccessToast";
import ErrorToast from "@/components/ErrorToast";

import PrescriptionDetailsSection, {
  type MedicationEntry,
  type MedicationErrors,
} from "./PrescriptionDetailsSection";
import PrescriptionSidebar from "./PrescriptionSidebar";

/* ---------- Static data ---------- */
const PATIENT = {
  id: "KMD-0000003",
  name: "milonee primocys",
  age: "21 years",
  gender: "Female",
  status: "Active",
  dob: "Jul 11, 2005",
  dobAge: "(21 years)",
  allergies: 2,
  provider: "Dr. Sarah Johnson",
};

const toOptions = (items: string[]) => items.map((v) => ({ value: v, label: v }));

const ENCOUNTERS = [
  { value: "enc-1", label: "Oct 6, 2026 - Follow up Visit" },
  { value: "enc-2", label: "Sep 12, 2026 - Lab Review" },
  { value: "enc-3", label: "Aug 20, 2026 - Annual Checkup" },
];

const DIAGNOSES = toOptions([
  "Asthma",
  "Allergic Rhinitis",
  "Hypertension",
  "Type 2 Diabetes",
  "Upper Respiratory Infection",
  "GERD",
  "Migraine",
]);

const MEDICATION_CATALOG = [
  { name: "Paracetamol 500 mg", form: "Tablet", category: "Analgesic • Antipyretic" },
  { name: "Ibuprofen 400 mg", form: "Tablet", category: "NSAID" },
  { name: "Amoxicillin 500 mg", form: "Capsule", category: "Antibiotic" },
  { name: "Cetirizine 10 mg", form: "Tablet", category: "Antihistamine" },
  { name: "Omeprazole 20 mg", form: "Capsule", category: "Proton Pump Inhibitor" },
];

const MEDICATION_OPTIONS = MEDICATION_CATALOG.map((m) => ({ value: m.name, label: m.name }));

const CATEGORY_ALL = "all";
const ROUTES = toOptions(["Oral", "Intravenous", "Intramuscular", "Subcutaneous", "Topical", "Inhalation"]);
const FREQUENCIES = toOptions([
  "Once daily",
  "Twice daily",
  "Three times daily",
  "Four times daily",
  "Every 8 hours",
  "As needed",
]);
const UNITS = toOptions(["Tabs", "Caps", "ml", "mg", "Units"]);
const REFILLS = toOptions(["0", "1", "2", "3", "4", "5"]);

/* ---------- Helpers ---------- */
const blankMedication = (id: string, overrides: Partial<MedicationEntry> = {}): MedicationEntry => ({
  id,
  medication: "",
  dose: "",
  route: "Oral",
  frequency: "Once daily",
  duration: "7 days",
  quantity: "",
  unit: "Tabs",
  refills: "0",
  instructions: "",
  ...overrides,
});

const initials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0]?.toUpperCase())
    .slice(0, 2)
    .join("");

/* ---------- Page ---------- */
const AddPrescription = () => {
  const router = useRouter();
  const pathname = usePathname();
  const isEditMode = pathname === "/edit-prescription";
  const searchParams = useSearchParams();
  const patientId =
    searchParams.get("patientId") ?? (isEditMode ? null : searchParams.get("id"));

  const idSeed = useRef(1);
  const nextId = () => `med-${idSeed.current++}`;
  const medListRef = useRef<HTMLDivElement | null>(null);

  const [encounter, setEncounter] = useState("enc-1");
  const [diagnosis, setDiagnosis] = useState("");
  const [medications, setMedications] = useState<MedicationEntry[]>(() => [blankMedication("med-0")]);
  const [notes, setNotes] = useState("");
  const [encounterError, setEncounterError] = useState<string | undefined>();
  const [errors, setErrors] = useState<Record<string, MedicationErrors>>({});

  const [sendEnabled, setSendEnabled] = useState(true);
  const [channels, setChannels] = useState({ portal: true, email: false, sms: false });

  const [catalogSearch, setCatalogSearch] = useState("");
  const [catalogCategory, setCatalogCategory] = useState(CATEGORY_ALL);

  const [toast, setToast] = useState<{ type: "success" | "error" | null; title: string; message: string }>({
    type: null,
    title: "",
    message: "",
  });

  /* ---------- Medication blocks ---------- */
  const updateMedication = (id: string, patch: Partial<MedicationEntry>) => {
    setMedications((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
    setErrors((prev) => {
      if (!prev[id]) return prev;
      const next = { ...prev[id] };
      (Object.keys(patch) as (keyof MedicationEntry)[]).forEach((key) => {
        delete next[key as keyof MedicationErrors];
      });
      return { ...prev, [id]: next };
    });
  };

  const addMedicationBlock = () => setMedications((prev) => [...prev, blankMedication(nextId())]);

  const removeMedicationBlock = (id: string) => {
    setMedications((prev) => (prev.length > 1 ? prev.filter((m) => m.id !== id) : prev));
    setErrors((prev) => {
      const { [id]: _removed, ...rest } = prev;
      return rest;
    });
  };

  const addFromCatalog = (name: string) => {
    setMedications((prev) => {
      const emptyBlock = prev.find((m) => !m.medication);
      if (emptyBlock) {
        return prev.map((m) => (m.id === emptyBlock.id ? { ...m, medication: name } : m));
      }
      return [...prev, blankMedication(nextId(), { medication: name })];
    });
  };

  const scrollToMedicationList = () =>
    medListRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  /* ---------- Submit ---------- */
  const handleSave = () => {
    const nextErrors: Record<string, MedicationErrors> = {};
    let firstInvalidId: string | null = null;

    medications.forEach((m) => {
      const e: MedicationErrors = {};
      if (!m.medication) e.medication = "Select a medication.";
      if (!m.dose.trim()) e.dose = "Dose is required.";
      if (!m.route) e.route = "Route is required.";
      if (!m.frequency) e.frequency = "Frequency is required.";
      if (!m.duration.trim()) e.duration = "Duration is required.";
      if (!m.quantity.trim()) e.quantity = "Quantity is required.";
      else if (!/^[1-9]\d*$/.test(m.quantity.trim())) e.quantity = "Enter a whole number.";
      if (!m.instructions.trim()) e.instructions = "Instructions are required.";
      if (Object.keys(e).length) {
        nextErrors[m.id] = e;
        firstInvalidId ??= m.id;
      }
    });

    const missingEncounter = !encounter ? "Select an encounter." : undefined;
    setEncounterError(missingEncounter);
    setErrors(nextErrors);

    if (missingEncounter || firstInvalidId) {
      setToast({
        type: "error",
        title: "Validation Incomplete",
        message: "Please complete all required fields before saving the prescription.",
      });
      if (firstInvalidId) {
        document.getElementById(`medication-${firstInvalidId}`)?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
      return;
    }

    const payload = {
      patientId: patientId ?? PATIENT.id,
      encounterId: encounter,
      diagnosis: diagnosis || undefined,
      medications: medications.map(({ id: _id, ...rest }) => rest),
      notes: notes.trim() || undefined,
      sendVia: sendEnabled
        ? (Object.keys(channels) as (keyof typeof channels)[]).filter((k) => channels[k])
        : [],
    };

    console.log("Prescription saved:", payload);
    setToast({
      type: "success",
      title: "Prescription Saved Successfully",
      message: `Prescription for ${PATIENT.name} has been created.`,
    });
  };

  const backtoPrescriptions = () =>
    router.push("/prescriptions");

  const stats: { label: string; value: string; sub?: string; link?: string }[] = [
    { label: "Patient ID", value: PATIENT.id },
    { label: "Date of Birth", value: PATIENT.dob, sub: PATIENT.dobAge },
    { label: "Gender", value: PATIENT.gender },
    { label: "Allergies", value: String(PATIENT.allergies), link: "(View)" },
    { label: "Primary Provider", value: PATIENT.provider },
  ];

  return (
    <div className="mx-auto min-w-0 w-full max-w-[1600px] space-y-4 sm:space-y-5">
      <SuccessToast
        isOpen={toast.type === "success"}
        onClose={() => setToast((p) => ({ ...p, type: null }))}
        title={toast.title}
        message={toast.message}
      />
      <ErrorToast
        isOpen={toast.type === "error"}
        onClose={() => setToast((p) => ({ ...p, type: null }))}
        title={toast.title}
        message={toast.message}
      />

      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Patients", href: "/patients" },
          { label: PATIENT.name, href: patientId ? `/view-patient?id=${patientId}` : "/patients" },
          { label: "Prescriptions", href: "/prescriptions" },
          { label: isEditMode ? "Edit Prescription" : "Add Prescription" },
        ]}
      />

      {/* Title + actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-heading sm:text-xl 2xl:text-2xl">
            {isEditMode ? "Edit Prescription" : "Add Prescription"}
          </h2>
          <p className="mt-0.5 text-sm text-body">
            {isEditMode ? "Update the patient's prescription." : "Create a new prescription for the patient."}
          </p>
        </div>
        <ImportButton
          text="Back to Prescriptions"
          icon={<ArrowLeft className="h-4 w-4" />}
          onClick={backtoPrescriptions}
          className="w-fit whitespace-nowrap"
        />
      </div>

      {/* Patient card — unchanged */}
      <div className="rounded-[14px] border border-border bg-card p-3.5 sm:p-5">
        <div className="flex flex-col gap-4 2xl:flex-row 2xl:items-center 2xl:gap-6">
          <div className="flex items-center gap-3 sm:gap-4 2xl:w-[300px] 2xl:shrink-0">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-base font-semibold text-primary sm:h-20 sm:w-20 sm:text-xl">
              {initials(PATIENT.name)}
            </span>
            <div className="min-w-0 space-y-1">
              <h3 className="truncate text-base font-semibold text-heading sm:text-xl">{PATIENT.name}</h3>
              <p className="text-xs text-body sm:text-sm">
                {PATIENT.age} • {PATIENT.gender}
              </p>
              <Tags text={PATIENT.status} tone="success" />
            </div>
          </div>

          <dl className="grid min-w-0 flex-1 grid-cols-2 gap-4 md:grid-cols-5 md:gap-0">
            {stats.map((s, index) => (
              <div
                key={s.label}
                className={`min-w-0 px-4 md:px-5 md:first:pl-0 md:last:pr-0 ${
                  index % 2 === 1 ? "border-l border-divider" : ""
                } ${index > 0 ? "md:border-l md:border-divider" : ""}`}
              >
                <dt className="text-xs text-body">{s.label}</dt>
                <dd className="mt-1 break-words text-sm font-semibold text-heading">
                  {s.value}
                  {s.link && (
                    <button
                      type="button"
                      onClick={() => router.push("/view-patient?id=" + (patientId ?? "") + "&tab=allergies")}
                      className="ml-1.5 cursor-pointer font-medium text-primary hover:underline focus-visible:outline-none"
                    >
                      {s.link}
                    </button>
                  )}
                </dd>
                {s.sub && <dd className="text-xs text-body">{s.sub}</dd>}
              </div>
            ))}
          </dl>
        </div>
      </div>

      <div className="grid min-w-0 grid-cols-1 items-start gap-4 sm:gap-5 2xl:grid-cols-[minmax(0,1fr)_400px]">
        {/* LEFT */}
        <PrescriptionDetailsSection
          encounters={ENCOUNTERS}
          diagnoses={DIAGNOSES}
          medicationOptions={MEDICATION_OPTIONS}
          routes={ROUTES}
          frequencies={FREQUENCIES}
          units={UNITS}
          refills={REFILLS}
          encounter={encounter}
          setEncounter={setEncounter}
          encounterError={encounterError}
          setEncounterError={setEncounterError}
          diagnosis={diagnosis}
          setDiagnosis={setDiagnosis}
          medications={medications}
          errors={errors}
          updateMedication={updateMedication}
          addMedicationBlock={addMedicationBlock}
          removeMedicationBlock={removeMedicationBlock}
          notes={notes}
          setNotes={setNotes}
          sendEnabled={sendEnabled}
          setSendEnabled={setSendEnabled}
          channels={channels}
          setChannels={setChannels}
          onCancel={backtoPrescriptions}
          onSave={handleSave}
          onScrollToMedicationList={scrollToMedicationList}
        />

        {/* RIGHT */}
        <PrescriptionSidebar
          medListRef={medListRef}
          catalogSearch={catalogSearch}
          setCatalogSearch={setCatalogSearch}
          catalogCategory={catalogCategory}
          setCatalogCategory={setCatalogCategory}
          onAddFromCatalog={addFromCatalog}
          patientId={patientId}
        />
      </div>
    </div>
  );
};

export default AddPrescription;