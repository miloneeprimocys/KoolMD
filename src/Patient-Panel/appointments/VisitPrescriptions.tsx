"use client";

import React, { useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  CalendarCheck,
  CalendarPlus,
  CheckCircle2,
  ChevronRight,
  Clock,
  Download,
  FileText,
  FlaskConical,
  Pill,
  Share2,
  Stethoscope,
  Video,
  ClipboardList,
} from "lucide-react";

import AddButton from "@/components/Addbutton";
import ImportButton from "@/components/ImportButton";
import Table from "@/components/Table";
import { type TableColumn } from "@/components/Tableheader";
import Content from "@/components/Content";
import Tags from "@/components/Tags";
import { cardCls } from "@/providers/Shared";

/* ---------------------------------------------------------------- */
/*  Static data (replace with API / redux selector)                  */
/* ---------------------------------------------------------------- */
type Medication = { name: string; kind: string; dosage: string; duration: string };

type Prescription = {
  id: string;
  date: string;
  reason: string;
  status: "Active" | "Completed";
  diagnosis: string;
  medications: Medication[];
  instructions: string[];
};

type Visit = {
  doctor: string;
  specialty: string;
  date: string;
  time: string;
  type: string;
  results: number;
  prescriptions: Prescription[];
};

const VISITS: Record<string, Visit> = {
  "PV-1008": {
    doctor: "Dr. John Carter", specialty: "Internal Medicine",
    date: "Mon, Sep 28, 2026", time: "10:00 AM – 10:30 AM (30 min)", type: "Video Consultation", results: 3,
    prescriptions: [
      {
        id: "PR-00456", date: "Sep 28, 2026", reason: "Persistent cough and congestion", status: "Active",
        diagnosis: "Upper respiratory tract infection (common cold)",
        medications: [
          { name: "Amoxicillin 500 mg", kind: "Antibiotic", dosage: "1 capsule, 3 times daily", duration: "7 days" },
          { name: "Cough Relief Syrup", kind: "Cough suppressant", dosage: "10 ml, twice daily", duration: "5 days" },
        ],
        instructions: [
          "Take medications after meals.",
          "Stay well-hydrated and get adequate rest.",
          "If symptoms persist for more than 7 days, please follow up.",
        ],
      },
      {
        id: "PR-00421", date: "Aug 20, 2026", reason: "Follow-up: Respiratory infection", status: "Completed",
        diagnosis: "Acute bronchitis",
        medications: [{ name: "Azithromycin 250 mg", kind: "Antibiotic", dosage: "1 tablet daily", duration: "5 days" }],
        instructions: ["Complete the full course even if you feel better.", "Avoid dairy products within 2 hours of the dose."],
      },
    ],
  },
  "PV-1007": {
    doctor: "Dr. Sarah Miller", specialty: "Dermatology",
    date: "Wed, Aug 20, 2026", time: "3:00 PM – 3:30 PM (30 min)", type: "Video Consultation", results: 1,
    prescriptions: [
      {
        id: "PR-00398", date: "Aug 20, 2026", reason: "Skin rash and itching", status: "Completed",
        diagnosis: "Contact dermatitis",
        medications: [{ name: "Hydrocortisone Cream 1%", kind: "Topical corticosteroid", dosage: "Thin layer, twice daily", duration: "7 days" }],
        instructions: ["Apply only to the affected area.", "Avoid scratching.", "Stop use if irritation increases."],
      },
    ],
  },
};

const BASE = "/my-appointments";

const COLUMNS: TableColumn[] = [
  { key: "medication", label: "Medication" },
  { key: "dosage", label: "Dosage & Frequency" },
  { key: "duration", label: "Duration" },
];

const initialsOf = (name: string) =>
  name
    .replace(/^Dr\.\s*/i, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

/* ---------------------------------------------------------------- */
/*  Page                                                             */
/* ---------------------------------------------------------------- */
const VisitPrescriptions = () => {
  const router = useRouter();
  const id = useSearchParams().get("id") ?? "PV-1008";
  const visit = VISITS[id] ?? VISITS["PV-1008"];
  const visitId = VISITS[id] ? id : "PV-1008";

  const [selectedId, setSelectedId] = useState(visit.prescriptions[0].id);
  const [notice, setNotice] = useState<string | null>(null);
  const detailRef = useRef<HTMLElement>(null);

  const selected = visit.prescriptions.find((p) => p.id === selectedId) ?? visit.prescriptions[0];

  const select = (prescriptionId: string) => {
    setSelectedId(prescriptionId);
    setNotice(null);
    // Below lg the detail sits under the list – bring it into view.
    if (window.matchMedia("(max-width: 1023px)").matches) {
      requestAnimationFrame(() => detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
    }
  };

  const tabs = [
    { key: "prescriptions", label: `Prescriptions (${visit.prescriptions.length})`, Icon: FileText, href: `${BASE}/visit-prescriptions?id=${visitId}` },
    { key: "results", label: `Results (${visit.results})`, Icon: FlaskConical, href: `${BASE}/visit-results?id=${visitId}` },
    { key: "follow-up", label: "Follow-Up", Icon: CalendarCheck, href: `${BASE}/visit-follow-up?id=${visitId}` },
  ];

  const rows = selected.medications.map((m) => ({
    medication: (
      <div className="flex items-center gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Pill className="h-4 w-4" />
        </span>
        <Content title={m.name} description={m.kind} />
      </div>
    ),
    dosage: <Content title={m.dosage} />,
    duration: <Content title={m.duration} />,
  }));

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-4 sm:space-y-5">
      <button
        type="button"
        onClick={() => router.push(`${BASE}/visit-summary?id=${visitId}`)}
        className="flex cursor-pointer items-center gap-1.5 text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Visit Summary
      </button>

      <div>
        <h2 className="text-lg font-semibold text-heading sm:text-xl 2xl:text-2xl">Visit Summary</h2>
        <p className="mt-0.5 text-sm text-body">A summary of your consultation with {visit.doctor}.</p>
      </div>

      {/* Doctor + visit */}
      <section className={`${cardCls} flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:p-5`}>
        <div className="flex min-w-0 items-center gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-base font-semibold text-primary">
            {initialsOf(visit.doctor)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-base font-semibold text-heading">{visit.doctor}</p>
            <p className="text-sm text-body">{visit.specialty}</p>
          </div>
        </div>
        <div className="space-y-1.5 text-sm text-heading sm:border-l sm:border-divider sm:pl-6">
          <p className="flex items-center gap-2.5"><Calendar className="h-4 w-4 shrink-0 text-primary" />{visit.date}</p>
          <p className="flex items-center gap-2.5"><Clock className="h-4 w-4 shrink-0 text-primary" />{visit.time}</p>
          <p className="flex items-center gap-2.5"><Video className="h-4 w-4 shrink-0 text-primary" />{visit.type}</p>
        </div>
        <Tags text="Completed" tone="success" size="xs" />
      </section>

      {/* Tabs */}
      <nav aria-label="Visit sections" className="grid grid-cols-3 gap-1 rounded-2xl border border-border bg-card p-1.5">
        {tabs.map(({ key, label, Icon, href }) => {
          const active = key === "prescriptions";
          return (
            <button
              key={key}
              type="button"
              aria-current={active ? "page" : undefined}
              onClick={() => !active && router.push(href)}
              className={`flex min-w-0 cursor-pointer items-center justify-center gap-2 rounded-xl px-2 py-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 sm:px-4 ${
                active ? "bg-primary font-semibold text-on-primary" : "text-heading hover:bg-primary/5"
              }`}
            >
              <Icon className="hidden h-4 w-4 shrink-0 sm:block" />
              <span className="truncate">{label}</span>
            </button>
          );
        })}
      </nav>

      <div className="grid items-start gap-4 sm:gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
        {/* List */}
        <section className="space-y-3">
          <h3 className="text-base font-semibold text-heading">Prescriptions ({visit.prescriptions.length})</h3>
          <ul className="space-y-2.5">
            {visit.prescriptions.map((p) => {
              const active = p.id === selected.id;
              return (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => select(p.id)}
                    aria-current={active}
                    className={`flex w-full cursor-pointer items-center gap-3 rounded-xl border px-3 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${
                      active ? "border-primary/30 bg-primary/10" : "border-border bg-card hover:bg-primary/5"
                    }`}
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-card text-primary">
                      <FileText className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm font-semibold text-heading">Prescription #{p.id}</span>
                        <span className="shrink-0 text-xs text-body">{p.date}</span>
                      </span>
                      <span className="block truncate text-xs text-body">{p.reason}</span>
                    </span>
                    <ChevronRight className="h-4 w-4 shrink-0 text-heading" />
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Detail */}
        <section ref={detailRef} className={`${cardCls} min-w-0 space-y-5 scroll-mt-24 sm:p-6`}>
          <div className="flex items-center justify-between gap-3">
            <h3 className="min-w-0 truncate text-base font-semibold text-heading sm:text-lg">Prescription #{selected.id}</h3>
            <Tags text={selected.status} tone={selected.status === "Active" ? "success" : "neutral"} size="xs" />
          </div>

          {notice && (
            <div role="status" className="flex items-start gap-3 rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-sm text-heading">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
              {notice}
            </div>
          )}

          <div className="border-b border-divider pb-4">
            <h4 className="flex items-center gap-2.5 text-sm font-semibold text-heading">
              <Stethoscope className="h-5 w-5 text-primary" />
              Diagnosis
            </h4>
            <p className="mt-1 pl-[30px] text-sm text-heading">{selected.diagnosis}</p>
          </div>

          <div>
            <h4 className="mb-3 flex items-center gap-2.5 text-sm font-semibold text-heading">
              <Pill className="h-5 w-5 text-primary" />
              Prescribed Medications ({selected.medications.length})
            </h4>
            <div className="overflow-hidden rounded-[14px] border border-border bg-card">
              <Table columns={COLUMNS} rows={rows} bordered={false} />
            </div>
          </div>

          <div>
            <h4 className="mb-2 flex items-center gap-2.5 text-sm font-semibold text-heading">
              <ClipboardList className="h-5 w-5 text-primary" />
              Instructions
            </h4>
            <ul className="list-disc space-y-1.5 pl-9 text-sm text-heading marker:text-heading">
              {selected.instructions.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-3">
            <AddButton
              text="Download Prescription (PDF)"
              icon={<Download className="h-4 w-4" />}
              onClick={() => {
                // TODO: download the prescription PDF from the API
                setNotice(`Prescription #${selected.id} is being downloaded as a PDF.`);
              }}
              className="whitespace-nowrap"
            />
            <ImportButton
              text="Share with Pharmacy"
              icon={<Share2 className="h-4 w-4" />}
              onClick={() => {
                // TODO: share the prescription with the patient's pharmacy
                setNotice(`Prescription #${selected.id} was shared with your pharmacy.`);
              }}
              className="whitespace-nowrap"
            />
            <ImportButton
              text="Book Follow-Up"
              icon={<CalendarPlus className="h-4 w-4" />}
              onClick={() => router.push("/find-provider")}
              className="whitespace-nowrap"
            />
          </div>
        </section>
      </div>
    </div>
  );
};

export default VisitPrescriptions;