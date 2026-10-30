"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Pencil } from "lucide-react";

import Breadcrumb from "@/components/Breadcrumb";
import Tags, { type TagTone } from "@/components/Tags";
import AddButton from "@/components/Addbutton";
import TableStatus from "@/components/TableStatus";
import { PERMISSIONS } from "@/auth/permissions";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppHooks";
import { usePermission } from "@/hooks/usePermission";
import { selectPatientDetail } from "@/redux/selectors/patientSelectors";
import { fetchPatientDetail } from "@/redux/thunks/patientDetailThunks";
import type { PatientDetail, PatientStatus } from "@/types/patient";
import { calculateAgeInYears, formatDateOnly, formatLanguage, humanizeEnum } from "@/utils/formatters";

import Overview from "./overview/OverviewPatient";
import MedicalHistory from "./medicalhistory/Medicalhistory";
import Medications from "./medications/Medications";
import Allergies from "./allergies/Allergies";
import Documents from "./Documents";
import Appointments from "./Appointments";

const STATUS_TONES: Record<PatientStatus, TagTone> = {
  ACTIVE: "success",
  INACTIVE: "danger",
  DECEASED: "neutral",
};

const getPatientFullName = (patient: PatientDetail) =>
  [patient.firstName, patient.middleName, patient.lastName].filter(Boolean).join(" ");

const initials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0]?.toUpperCase())
    .slice(0, 2)
    .join("");

/* ---------- Tabs ---------- */
type TabKey = "overview" | "history" | "medications" | "allergies" | "documents" | "appointments";

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
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const patientId = searchParams.get("id");
  const patientDetail = useAppSelector(selectPatientDetail);
  const canUpdatePatient = usePermission(PERMISSIONS.PATIENT_UPDATE);
  const [tab, setTab] = useState<TabKey>("overview");

  useEffect(() => {
    if (patientId) dispatch(fetchPatientDetail(patientId));
  }, [dispatch, patientId]);

  const isCurrentPatient = patientDetail.patientId === patientId;
  const patient = isCurrentPatient ? patientDetail.patient : null;

  /* ---------- Page states ---------- */
  const renderPageState = (content: React.ReactNode) => (
    <div className="mx-auto w-full max-w-[1600px] space-y-4">
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Patients", href: "/patients" },
          { label: "Patient" },
        ]}
      />
      <div className="rounded-[14px] border border-border bg-card">{content}</div>
    </div>
  );

  if (!patientId) {
    return renderPageState(
      <TableStatus variant="empty" message="No patient selected. Open a patient from the Patients list." />,
    );
  }
  if (isCurrentPatient && patientDetail.status === "failed" && !patient) {
    const isNotFound = patientDetail.error?.status === 404 || patientDetail.error?.status === 400;
    return renderPageState(
      <div>
        <TableStatus
          variant="error"
          message={isNotFound ? "This patient does not exist." : patientDetail.error?.message}
          onRetry={isNotFound ? undefined : () => dispatch(fetchPatientDetail(patientId))}
        />
        <p className="pb-6 text-center text-sm">
          <Link href="/patients" className="font-semibold text-link hover:underline">
            Back to Patients
          </Link>
        </p>
      </div>,
    );
  }
  if (!patient) {
    return renderPageState(<TableStatus variant="loading" message="Loading patient…" />);
  }

  const fullName = getPatientFullName(patient);
  const age = `${calculateAgeInYears(patient.dateOfBirth)} years`;
  const genderLabel = humanizeEnum(patient.administrativeGender);
  const stats: { label: string; value: string; sub?: string }[] = [
    { label: "Patient ID", value: patient.medicalRecordNumber },
    { label: "Date of Birth", value: formatDateOnly(patient.dateOfBirth), sub: `(${age})` },
    { label: "Gender", value: genderLabel },
    { label: "Preferred Language", value: formatLanguage(patient.preferredLanguage) },
  ];

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-4 sm:space-y-5">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Patients", href: "/patients" },
          { label: fullName },
        ]}
      />

      {/* Title + actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-heading sm:text-xl 2xl:text-2xl">Patient Details</h2>
          <p className="mt-0.5 text-xs text-body sm:text-sm">
            View and manage patient information, medical history, appointments and more.
          </p>
        </div>
        {canUpdatePatient && (
          <AddButton
            text="Edit Patient"
            icon={<Pencil className="h-4 w-4" />}
            onClick={() => router.push(`/edit-patient?id=${encodeURIComponent(patientId)}`)}
            className="w-fit whitespace-nowrap"
          />
        )}
      </div>

      {/* Profile card */}
      <div className="rounded-[14px] border border-border bg-card p-3.5 sm:p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:gap-6">
          <div className="flex items-center gap-3 sm:gap-4 xl:w-[320px] xl:shrink-0">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-base font-semibold text-primary sm:h-20 sm:w-20 sm:text-xl">
              {initials(fullName)}
            </span>
            <div className="min-w-0 space-y-1">
              <h3 className="truncate text-base font-semibold text-heading sm:text-xl">{fullName}</h3>
              <p className="text-xs text-body sm:text-sm">
                {age} • {genderLabel}
              </p>
              <Tags text={humanizeEnum(patient.status)} tone={STATUS_TONES[patient.status]} />
            </div>
          </div>

          <dl className="grid min-w-0 flex-1 grid-cols-2 gap-4 xl:grid-cols-4 xl:gap-0 xl:divide-x xl:divide-divider">
            {stats.map((s) => (
              <div key={s.label} className="min-w-0 xl:px-6 xl:first:pl-0 xl:last:pr-0">
                <dt className="text-xs text-body">{s.label}</dt>
                <dd className="mt-1 break-words text-sm font-semibold text-heading">{s.value}</dd>
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
              id={`patient-tab-${t.key}`}
              role="tab"
              type="button"
              aria-selected={isActive}
              aria-controls="patient-tabpanel"
              onClick={() => setTab(t.key)}
              className={`-mb-px cursor-pointer whitespace-nowrap border-b-2 px-1 pb-2.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 sm:pb-3 sm:text-sm ${
                isActive ? "border-primary text-primary" : "border-transparent text-body hover:text-heading"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Active tab — each tab loads (and caches) its own data */}
      <div id="patient-tabpanel" role="tabpanel" aria-labelledby={`patient-tab-${tab}`}>
        {tab === "overview" && (
          <Overview
            patient={patient}
            emergencyContacts={patientDetail.emergencyContacts}
            insurances={patientDetail.insurances}
            recentAppointments={patientDetail.recentAppointments}
            recentAppointmentsError={patientDetail.recentAppointmentsError?.message ?? null}
          />
        )}
        {tab === "history" && <MedicalHistory patientId={patient.id} />}
        {tab === "medications" && <Medications patientId={patient.id} />}
        {tab === "allergies" && <Allergies patientId={patient.id} />}
        {tab === "documents" && <Documents patientId={patient.id} />}
        {tab === "appointments" && <Appointments patientId={patient.id} />}
      </div>
    </div>
  );
};

export default ViewPatient;
