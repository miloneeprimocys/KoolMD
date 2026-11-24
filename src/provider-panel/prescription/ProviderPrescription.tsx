"use client";

import React, { useState } from "react";

import AddButton from "@/components/Addbutton";
import ImportButton from "@/components/ImportButton";
import Breadcrumb from "@/components/Breadcrumb";
import ErrorToast from "@/components/ErrorToast";
import Tabs from "@/components/Tabs";
import { cardCls, type Errors } from "@/providers/Shared";
import PrescriptionTab, { initialPrescription, validatePrescription, type PrescriptionValues } from "./PrescriptionTab";
import ReferralTab, { initialReferral, validateReferral, type ReferralValues } from "./ReferralTab";

/* Static patient + encounter (replace with the selected encounter) */
const PATIENT = { name: "Aarti Sharma", initials: "AS", mrn: "100234", age: 32, gender: "Female", encounterDate: "Oct 12, 2026" };

type TabKey = "prescription" | "referral";
const TABS: { key: TabKey; label: string }[] = [
  { key: "prescription", label: "Prescription" },
  { key: "referral", label: "Referral" },
];

const ProviderPrescription = () => {
  const [tab, setTab] = useState<TabKey>("prescription");
  const [rx, setRx] = useState<PrescriptionValues>(initialPrescription);
  const [referral, setReferral] = useState<ReferralValues>(initialReferral);
  const [errors, setErrors] = useState<Errors>({});
  const [toast, setToast] = useState<{ title: string; message: string } | null>(null);

  const switchTab = (next: TabKey) => {
    setTab(next);
    setErrors({});
  };

  const patchRx = (p: Partial<PrescriptionValues>) => {
    setRx((prev) => ({ ...prev, ...p }));
    setErrors({});
  };
  const patchReferral = (p: Partial<ReferralValues>) => {
    setReferral((prev) => ({ ...prev, ...p }));
    setErrors((prev) => {
      const next = { ...prev };
      Object.keys(p).forEach((k) => delete next[k]);
      return next;
    });
  };

  const saveDraft = () => {
    // TODO: call your API here (no validation for drafts)
    setToast({ title: "Draft saved", message: tab === "prescription" ? "Prescription draft saved." : "Referral draft saved." });
  };

  const submit = () => {
    const e = tab === "prescription" ? validatePrescription(rx) : validateReferral(referral);
    setErrors(e);
    const count = Object.keys(e).length;
    if (count) {
      setToast({ title: "Check the form", message: `${count} field${count > 1 ? "s need" : " needs"} attention.` });
      return;
    }
    // TODO: call your API here
    setToast({ title: tab === "prescription" ? "Prescription issued" : "Referral sent", message: `For ${PATIENT.name}.` });
  };

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-4 sm:space-y-5">
      <ErrorToast isOpen={toast !== null} onClose={() => setToast(null)} title={toast?.title} message={toast?.message} />
      <Breadcrumb items={[{ label: "Dashboard", href: "/dashboard" }, { label: "Encounters", href: "/encounters" }, { label: "Prescribe or Refer" }]} />

      <div>
        <h2 className="text-lg font-semibold text-heading sm:text-xl 2xl:text-2xl">
          {tab === "prescription" ? "Create Prescription" : "Create Referral"}
        </h2>
        <p className="mt-0.5 text-sm text-body">Prescribe medication or refer the patient to a specialist.</p>
      </div>

      <section className={`${cardCls} min-w-0 space-y-4 sm:p-6`}>
        {/* Patient + encounter */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
              {PATIENT.initials}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-heading">{PATIENT.name}</p>
              <p className="text-xs text-body">
                MRN: {PATIENT.mrn} • {PATIENT.age} years • {PATIENT.gender}
              </p>
            </div>
          </div>
          <p className="text-xs text-body">Encounter: {PATIENT.encounterDate}</p>
        </div>

        <Tabs ariaLabel="Prescribe or refer">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={tab === t.key}
              onClick={() => switchTab(t.key)}
              className={`-mb-px shrink-0 cursor-pointer whitespace-nowrap border-b-2 px-1 pb-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${
                tab === t.key ? "border-primary text-primary" : "border-transparent text-body hover:text-heading"
              }`}
            >
              {t.label}
            </button>
          ))}
        </Tabs>

        {tab === "prescription" ? (
          <PrescriptionTab values={rx} errors={errors} onChange={patchRx} />
        ) : (
          <ReferralTab values={referral} errors={errors} onChange={patchReferral} />
        )}

        <div className="flex justify-end gap-2 sm:gap-3">
          <ImportButton text="Save as Draft" icon={null} onClick={saveDraft} />
          <AddButton text={tab === "prescription" ? "Issue Prescription" : "Send Referral"} icon={null} onClick={submit} className="whitespace-nowrap" />
        </div>
      </section>
    </div>
  );
};

export default ProviderPrescription;