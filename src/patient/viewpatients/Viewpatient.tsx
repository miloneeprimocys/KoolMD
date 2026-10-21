"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Pencil } from "lucide-react";

import Breadcrumb from "@/components/Breadcrumb";
import Tags from "@/components/Tags";
import AddButton from "@/components/Addbutton";
import ImportButton from "@/components/ImportButton";

import Overview from "./OverviewPatient";
import MedicalHistory from "./medicalhistory/Medicalhistory";
import Medications from "./Medications";
import Allergies from "./Allergies";
import Documents from "./Documents";
import Appointments from "./Appointments";
import PatientRightSection, {
  type PatientDetailSelection,
} from "./Rightsection";

/* ---------- Static data (replace with API data later) ---------- */
const PATIENT = {
  name: "milonee primocys",
  age: "21 years",
  gender: "Female",
  status: "Active",
  id: "KMD-0000003",
  dob: "Jul 11, 2005",
  dobAge: "(21 years)",
  language: "Not provided",
};

const initials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0]?.toUpperCase())
    .slice(0, 2)
    .join("");

/* ---------- Tabs ---------- */
type TabKey =
  | "overview"
  | "history"
  | "medications"
  | "allergies"
  | "documents"
  | "appointments";

const TABS: { key: TabKey; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "history", label: "Medical History" },
  { key: "medications", label: "Medications" },
  { key: "allergies", label: "Allergies" },
  { key: "documents", label: "Documents" },
  { key: "appointments", label: "Appointments" },
];

/* ---------- Component ---------- */
const ViewPatient = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const patientId = searchParams.get("id");
  const [tab, setTab] = useState<TabKey>("overview");
  const [detailSelection, setDetailSelection] = useState<PatientDetailSelection | null>(null);
  const [isPanelClosing, setIsPanelClosing] = useState(false);

  const stats: { label: string; value: string; sub?: string; muted?: boolean }[] = [
    { label: "Patient ID", value: PATIENT.id },
    { label: "Date of Birth", value: PATIENT.dob, sub: PATIENT.dobAge },
    { label: "Gender", value: PATIENT.gender },
    { label: "Preferred Language", value: PATIENT.language, muted: true },
  ];

  return (
    <div
      className={`mx-auto w-full max-w-[1600px] space-y-4 transition-[padding] duration-300 ease-out sm:space-y-5 ${
        detailSelection && !isPanelClosing ? "2xl:pr-[440px]" : ""
      }`}
    >
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Patients", href: "/patients" },
          { label: PATIENT.name },
        ]}
      />

      {/* Title + actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-heading sm:text-xl 2xl:text-2xl">
            Patient Details
          </h2>
          <p className="mt-0.5 text-xs text-body sm:text-sm">
            View and manage patient information, medical history, appointments and more.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          {/* <ImportButton
            text="Back to Patients"
            icon={<ArrowLeft className="h-4 w-4" />}
            onClick={() => router.push("/patients")}
          /> */}
          {patientId && (
            <AddButton
              text="Edit Patient"
              icon={<Pencil className="h-4 w-4" />}
              onClick={() =>
                router.push(`/edit-patient?id=${encodeURIComponent(patientId)}`)
              }
              className="w-fit whitespace-nowrap"
            />
          )}
        </div>
      </div>

      {/* Profile card */}
      <div className="rounded-[14px] border border-border bg-card p-3.5 sm:p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:gap-6">
          <div className="flex items-center gap-3 sm:gap-4 xl:w-[320px] xl:shrink-0">
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

          <dl className="grid min-w-0 flex-1 grid-cols-2 gap-4 xl:grid-cols-4 xl:gap-0 xl:divide-x xl:divide-divider">
            {stats.map((s) => (
              <div key={s.label} className="min-w-0 xl:px-6 xl:first:pl-0 xl:last:pr-0">
                <dt className="text-xs text-body">{s.label}</dt>
                <dd
                  className={`mt-1 break-words text-sm ${
                    s.muted ? "text-body" : "font-semibold text-heading"
                  }`}
                >
                  {s.value}
                </dd>
                {s.sub && <dd className="text-xs text-body">{s.sub}</dd>}
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* Tabs */}
      <div
        role="tablist"
        aria-label="Patient sections"
        className="flex gap-4 overflow-x-auto border-b border-border hide-scrollbar sm:gap-6"
      >
        {TABS.map((t) => {
          const isActive = t.key === tab;
          return (
            <button
              key={t.key}
              role="tab"
              type="button"
              aria-selected={isActive}
              onClick={() => {
                setTab(t.key);
                setDetailSelection(null);
                setIsPanelClosing(false);
              }}
              className={`-mb-px cursor-pointer whitespace-nowrap border-b-2 px-1 pb-2.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 sm:pb-3 sm:text-sm ${
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-body hover:text-heading"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Active tab */}
      <div role="tabpanel">
        {tab === "overview" && <Overview />}
        {tab === "history" && <MedicalHistory />}
        {tab === "medications" && <Medications />}
        {tab === "allergies" && <Allergies />}
        {tab === "documents" && (
          <Documents
            onViewDocument={(details) => {
              setIsPanelClosing(false);
              setDetailSelection({ kind: "document", details });
            }}
          />
        )}
        {tab === "appointments" && (
          <Appointments
            onViewAppointment={(details) => {
              setIsPanelClosing(false);
              setDetailSelection({ kind: "appointment", details });
            }}
          />
        )}
      </div>
      <PatientRightSection
        selection={detailSelection}
        onCloseStart={() => setIsPanelClosing(true)}
        onClose={() => {
          setDetailSelection(null);
          setIsPanelClosing(false);
        }}
      />
    </div>
  );
};

export default ViewPatient;