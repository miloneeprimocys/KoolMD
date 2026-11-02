"use client";

import React, { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Plus } from "lucide-react";

import AddButton from "@/components/Addbutton";
import ImportButton from "@/components/ImportButton";
import Breadcrumb from "@/components/Breadcrumb";
import AddSteps from "@/components/Addsteps";
import ErrorToast from "@/components/ErrorToast";
import Table from "@/components/Table";
import { type TableColumn } from "@/components/Tableheader";
import Content from "@/components/Content";
import Tags from "@/components/Tags";
import { cardCls } from "@/providers/Shared";

import { PatientHeader } from "../medicationlist/Medicationlistpage";
import SelectMedicationModal from "../medicationlist/Selectmedicationmodal";
import ReviewExisting, { ALL_ROWS, SOURCES } from "./Reviewexisting";
import PatientConfirmation, { getAnswer, type Answer, type ConfirmRow } from "./Patientconfirmation";

const STEPS = [
  { id: 1, title: "Review Medications", subtitle: "See all sources" },
  { id: 2, title: "Patient Confirmation", subtitle: "Confirm what they take" },
  { id: 3, title: "Summary", subtitle: "Review and complete" },
];

const TONE = { Taking: "success", "Taking as needed": "warning", "Not taking": "danger" } as const;

const ReconcileMedications = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const startStep = Math.min(Math.max(Number(searchParams.get("step")) || 1, 1), STEPS.length);

  const [currentStep, setCurrentStep] = useState(startStep);
  const [selected, setSelected] = useState<Set<string>>(new Set(SOURCES.current.map((r) => r.id)));
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [picker, setPicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ open: false, title: "", message: "" });

  const confirmRows: ConfirmRow[] = useMemo(
    () => ALL_ROWS.filter((r) => selected.has(r.id)).map((r) => ({ id: r.id, name: r.name, dosage: r.dosage })),
    [selected],
  );

  const handleNext = () => {
    if (currentStep === 1 && selected.size === 0) {
      setToast({ open: true, title: "No medications selected", message: "Select at least one medication to continue." });
      return;
    }
    setCurrentStep((s) => s + 1);
  };

  const handleComplete = async () => {
    if (saving) return;
    setSaving(true);
    try {
      // TODO: call your API here
      console.log("Reconciliation completed:", confirmRows.map((r) => ({ ...r, ...getAnswer(r, answers) })));
      router.push("/medication/reconciliation-list");
    } catch (error) {
      setToast({
        open: true,
        title: "Could not complete reconciliation",
        message: error instanceof Error ? error.message : "Something went wrong. Try again.",
      });
      setSaving(false);
    }
  };

  const summaryColumns: TableColumn[] = [
    { key: "medication", label: "Medication" },
    { key: "dosage", label: "Dosage" },
    { key: "status", label: "Status" },
    { key: "notes", label: "Notes" },
  ];
  const summaryRows = confirmRows.map((r) => {
    const a = getAnswer(r, answers);
    return {
      medication: <Content title={r.name} />,
      dosage: <Content title={r.dosage} />,
      status: <Tags text={a.status} tone={TONE[a.status as keyof typeof TONE]} size="xs" />,
      notes: <Content title={a.note || "-"} />,
    };
  });

  const isFirst = currentStep === 1;
  const isLast = currentStep === STEPS.length;

  return (
    <div className="flex min-h-screen flex-col">
      <ErrorToast isOpen={toast.open} onClose={() => setToast((p) => ({ ...p, open: false }))} title={toast.title} message={toast.message} />

      <div className="mx-auto w-full max-w-[1600px] flex-1">
        <div className="space-y-4 sm:space-y-5">
          <Breadcrumb items={[{ label: "Reconciliation", href: "/medication/reconciliation-list" }, { label: "Reconcile Medications" }]} />
          <PatientHeader />
          <h2 className="text-lg font-semibold text-heading sm:text-xl 2xl:text-2xl">Reconcile Medications</h2>

          <AddSteps steps={STEPS} current={currentStep} onStepClick={(id: number) => id < currentStep && setCurrentStep(id)} />

          <div className={`${cardCls} sm:p-6`}>
            {currentStep === 1 && <ReviewExisting selected={selected} onSelectedChange={setSelected} />}
            {currentStep === 2 && (
              <PatientConfirmation rows={confirmRows} answers={answers} onAnswer={(id, a) => setAnswers((p) => ({ ...p, [id]: a }))} />
            )}
            {currentStep === 3 && (
              <div className="overflow-hidden rounded-[14px] border border-border bg-card">
                <Table columns={summaryColumns} rows={summaryRows} bordered={false} />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="sticky -bottom-4 z-[250] -mx-4 -mb-4 mt-4 border-t border-border bg-card px-4 py-4 sm:-bottom-6 sm:-mx-6 sm:-mb-6 sm:px-6 sm:py-5">
        <div className="mx-auto flex max-w-[1600px] items-center justify-center sm:justify-end gap-2 sm:gap-3">
          {isFirst ? (
            <ImportButton text="Cancel" icon={null} onClick={() => router.push("/medication/reconciliation-list")} className="shrink-0 px-3 sm:px-5" />
          ) : (
            <ImportButton text="Previous" icon={<ArrowLeft className="h-4 w-4" />} onClick={() => setCurrentStep((s) => s - 1)} className="shrink-0 whitespace-nowrap px-3 sm:px-5" />
          )}
          <div className="flex items-center gap-2 sm:gap-3">
            {currentStep === 2 && (
              <ImportButton text="Add Medication" icon={<Plus className="h-4 w-4" />} onClick={() => setPicker(true)} className="shrink-0 whitespace-nowrap px-3 sm:px-5" />
            )}
            {isLast ? (
              <AddButton text={saving ? "Completing…" : "Complete Reconciliation"} icon={<Check className="h-4 w-4" />} onClick={handleComplete} disabled={saving} className="shrink-0 whitespace-nowrap px-3 sm:px-5" />
            ) : (
              <AddButton text="Next" icon={<ArrowRight className="h-4 w-4" />} onClick={handleNext} className="shrink-0 whitespace-nowrap px-3 sm:px-5" />
            )}
          </div>
        </div>
      </div>

      <SelectMedicationModal
        open={picker}
        onClose={() => setPicker(false)}
        onSelect={(m) => {
          setPicker(false);
          router.push(`/medication/reconciliation-list/add?med=${m.id}`);
        }}
      />
    </div>
  );
};

export default ReconcileMedications;
