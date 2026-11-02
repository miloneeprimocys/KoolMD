"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ClipboardList, FileText, History, UserCheck } from "lucide-react";

import Breadcrumb from "@/components/Breadcrumb";
import AddButton from "@/components/Addbutton";
import ImportButton from "@/components/ImportButton";
import { cardCls } from "@/providers/Shared";

import { PatientHeader } from "../medicationlist/Medicationlistpage";
import { SOURCES } from "./Reviewexisting";

const SOURCE_CARDS = [
  { title: "Current Medications", count: SOURCES.current.length, icon: <ClipboardList className="h-5 w-5" />, tone: "bg-success/10 text-success" },
  { title: "Prescription History", count: SOURCES.history.length, icon: <FileText className="h-5 w-5" />, tone: "bg-violet/15 text-violet" },
  { title: "Patient Reported", count: SOURCES.reported.length, icon: <UserCheck className="h-5 w-5" />, tone: "bg-primary/10 text-primary" },
];

const ReconciliationPage = () => {
  const router = useRouter();

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-4 sm:space-y-5">
      <Breadcrumb items={[{ label: "Medications", href: "/medication/medication-list" }, { label: "Reconciliation" }]} />

      <PatientHeader />

      <section className={`${cardCls} space-y-5`}>
        <div>
          <h3 className="text-base font-semibold text-heading sm:text-lg">Reconcile Medications</h3>
          <p className=" w-full text-sm text-body">
            Review the patient&apos;s current medication list and update which medications they are currently taking.
            Verify, modify or discontinue medications.
          </p>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold text-heading">Sources to Review</h4>
          <div className="grid gap-3 sm:grid-cols-3">
            {SOURCE_CARDS.map((s) => (
              <div key={s.title} className="flex flex-col gap-3 rounded-xl border border-border p-4">
                <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${s.tone}`}>{s.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-heading">{s.title}</p>
                  <p className="text-xs text-body">{s.count} medications</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border p-4">
          <h4 className="mb-3 text-sm font-semibold text-heading">Last Reconciled</h4>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <History className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-medium text-heading">Apr 12, 2024, 10:30 AM</p>
                <p className="text-xs text-body">by Dr. Sarah Wilson</p>
              </div>
            </div>
            <ImportButton text="View History" icon={null} onClick={() => {}} />
          </div>
        </div>

        <div className="flex justify-end">
          <AddButton text="Start Reconciliation" icon={<ArrowRight className="h-4 w-4" />} onClick={() => router.push("/medication/reconciliation-list/start")} className="whitespace-nowrap" />
        </div>
      </section>
    </div>
  );
};

export default ReconciliationPage;
