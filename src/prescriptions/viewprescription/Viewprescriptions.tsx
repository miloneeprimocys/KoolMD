"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Ban,
  Check,
  ClipboardCheck,
  ClipboardList,
  Download,
  Eye,
  FileText,
  History,
  Mail,
  MoreVertical,
  Paperclip,
  Pencil,
  Pill,
  Printer,
  RefreshCw,
  Stethoscope,
  type LucideIcon,
} from "lucide-react";

import Breadcrumb from "@/components/Breadcrumb";
import Tags from "@/components/Tags";
import AddButton from "@/components/Addbutton";
import AddInternalButton from "@/components/AddInternalButton";
import ImportButton from "@/components/ImportButton";
import EditButton from "@/components/EditButton";
import { Panel } from "../addprescription/PrescriptionDetailsSection";
import { PRESCRIPTIONS } from "../Prescriptions";

/* ---------- Static data (replace with API data later) ---------- */
const PATIENT = {
  name: "milonee primocys",
  age: "21 years",
  gender: "Female",
  status: "Active",
  id: "KMD-0000003",
  dob: "Jul 11, 2005",
  dobAge: "(21 years)",
  blood: "B+",
  provider: "Dr. Sarah Johnson",
};

const RX = {
  id: "RX-000125",
  status: "Active",
  prescribedDate: "Oct 6, 2026",
  medication: "Amoxicillin 500 mg",
  dosage: "500 mg",
  route: "Oral",
  frequency: "Twice daily",
  prescribedBy: "Dr. Sarah Johnson",
  prescriberRole: "General Physician",
  encounter: "Oct 6, 2026 - Follow up Visit",
  duration: "7 days",
  quantity: "14 tablets",
  refills: "0",
  expiry: "Oct 13, 2026",
  instructions: "Take 1 tablet twice daily after food.",
  diagnosis: "Acute sinusitis",
  notes: "Advise to complete the full course. Contact clinic if symptoms persist or worsen.",
};

const MEDICATION_INFO: { label: string; value: string; link?: boolean }[] = [
  { label: "Medication Name", value: "Amoxicillin 500 mg" },
  { label: "Category", value: "Antibiotic", link: true },
  { label: "Form", value: "Tablet" },
  { label: "Strength", value: "500 mg" },
  { label: "NDC (if available)", value: "12345-6789" },
  { label: "Manufacturer", value: "Generic" },
  { label: "Therapeutic Class", value: "Penicillin" },
  { label: "DEA Schedule", value: "Not controlled" },
];

const HISTORY: { date: string; title: string; by?: string; done: boolean }[] = [
  { date: "Oct 6, 2026  10:30 AM", title: "Prescription created", by: "by Dr. Sarah Johnson", done: true },
  { date: "Oct 6, 2026  10:32 AM", title: "Sent to patient portal", by: "by System", done: true },
  { date: "Oct 13, 2026", title: "Expected completion date", done: false },
];

const initials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0]?.toUpperCase())
    .slice(0, 2)
    .join("");

/* ---------- Small building blocks ---------- */
/** label | value row with a thin divider between rows. */
const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="grid grid-cols-[130px_minmax(0,1fr)] items-start gap-3 border-t border-divider py-3 first:border-t-0 first:pt-0 last:pb-0">
    <dt className="text-xs text-body sm:text-sm">{label}</dt>
    <dd className="min-w-0 break-words text-sm font-semibold text-heading">{children}</dd>
  </div>
);

const InfoBlock = ({
  icon: Icon,
  tone,
  title,
  text,
}: {
  icon: LucideIcon;
  tone: "blue" | "violet";
  title: string;
  text: string;
}) => (
  <div className="flex items-start gap-3 rounded-[14px] border border-border bg-primary/[0.04] dark:bg-[#082858] p-4 sm:items-center sm:gap-4 sm:p-5">
    <span
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
        tone === "violet"
          ? "bg-violet-100 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400"
          : "bg-primary/10 text-primary"
      }`}
    >
      <Icon className="h-5 w-5" />
    </span>
    <div className="min-w-0">
      <p className="text-sm font-semibold text-heading">{title}</p>
      <p className="mt-0.5 text-sm text-body">{text}</p>
    </div>
  </div>
);

const iconBtn =
  "flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-label transition-colors hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30";

/* ---------- Page ---------- */
const ViewPrescriptions = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedPrescription = PRESCRIPTIONS.find(
    (prescription) => prescription.id === searchParams.get("id"),
  );
  const [age, gender] = selectedPrescription?.patientMeta.split(" • ") ?? [];
  const patient = {
    ...PATIENT,
    name: selectedPrescription?.patient ?? PATIENT.name,
    age: age ?? PATIENT.age,
    gender: gender ?? PATIENT.gender,
    provider: selectedPrescription?.provider ?? PATIENT.provider,
  };
  const prescription = {
    ...RX,
    id: selectedPrescription?.id ?? RX.id,
    status: selectedPrescription?.status ?? RX.status,
    prescribedDate: selectedPrescription
      ? (() => {
          const [year, month, day] = selectedPrescription.date.split("-").map(Number);
          return new Date(year, month - 1, day).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          });
        })()
      : RX.prescribedDate,
    medication: selectedPrescription?.medications.join(", ") ?? RX.medication,
    prescribedBy: selectedPrescription?.provider ?? RX.prescribedBy,
  };
  const medicationInfo = MEDICATION_INFO.map((item, index) =>
    index === 0 ? { ...item, value: prescription.medication } : item,
  );

  const stats: { label: string; value: string; sub?: string }[] = [
    { label: "Patient ID", value: patient.id },
    { label: "Date of Birth", value: patient.dob, sub: patient.dobAge },
    { label: "Gender", value: patient.gender },
    { label: "Blood Type", value: patient.blood },
    { label: "Primary Provider", value: patient.provider },
  ];

  return (
    <div className="mx-auto min-w-0 w-full max-w-[1600px] space-y-4 sm:space-y-5">
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Prescriptions", href: "/prescriptions" },
          { label: prescription.id },
        ]}
      />

      {/* Title + actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <h2 className="text-lg font-semibold text-heading sm:text-xl 2xl:text-2xl">View Prescription</h2>
        <div className="flex flex-wrap gap-2">
          <ImportButton
            text="Back to Prescriptions"
            icon={<ArrowLeft className="h-4 w-4" />}
            onClick={() => router.push("/prescriptions")}
            className="w-fit whitespace-nowrap"
          />
          <AddButton
            text="Edit Prescription"
            icon={<Pencil className="h-4 w-4" />}
            onClick={() => router.push(`/edit-prescription?id=${encodeURIComponent(prescription.id)}`)}
            className="w-fit whitespace-nowrap"
          />
        </div>
      </div>

      {/* Patient card */}
      <div className="rounded-[14px] border border-border bg-card p-3.5 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-6">
          <div className="flex items-center gap-3 sm:gap-4 lg:w-[300px] lg:shrink-0">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-base font-semibold text-primary sm:h-20 sm:w-20 sm:text-xl">
              {initials(patient.name)}
            </span>
            <div className="min-w-0 space-y-1">
              <h3 className="truncate text-base font-semibold text-heading sm:text-xl">{patient.name}</h3>
              <p className="text-xs text-body sm:text-sm">
                {patient.age} • {patient.gender}
              </p>
              <Tags text={PATIENT.status} tone="success" />
            </div>
          </div>

          <dl className="grid min-w-0 flex-1 grid-cols-2 gap-4 lg:grid-cols-5 lg:gap-0 lg:divide-x lg:divide-divider">
            {stats.map((s) => (
              <div key={s.label} className="min-w-0 lg:px-5 lg:first:pl-0 lg:last:pr-0">
                <dt className="text-xs text-body">{s.label}</dt>
                <dd className="mt-1 break-words text-sm font-semibold text-heading">{s.value}</dd>
                {s.sub && <dd className="text-xs text-body">{s.sub}</dd>}
              </div>
            ))}
          </dl>
        </div>
      </div>

      <div className="grid min-w-0 grid-cols-1 items-start gap-4 sm:gap-5 xl:grid-cols-[minmax(0,1fr)_360px] 2xl:grid-cols-[minmax(0,1fr)_400px]">
        {/* ================= LEFT ================= */}
        <div className="min-w-0 space-y-4 sm:space-y-5">
          <Panel
            icon={ClipboardList}
            title="Prescription Details"
            action={
              <Tags
                text={prescription.status}
                tone={
                  prescription.status === "Active"
                    ? "success"
                    : prescription.status === "Expired"
                      ? "danger"
                      : "neutral"
                }
              />
            }
          >
            <div className="grid gap-x-8 md:grid-cols-2">
              <dl>
                <Row label="Prescription ID">{prescription.id}</Row>
                <Row label="Prescribed Date">{prescription.prescribedDate}</Row>
                <Row label="Medication">{prescription.medication}</Row>
                <Row label="Dosage">{RX.dosage}</Row>
                <Row label="Route">{RX.route}</Row>
                <Row label="Frequency">{RX.frequency}</Row>
              </dl>
              <dl className="border-t border-divider pt-3 md:border-l md:border-t-0 md:pl-8 md:pt-0">
                <Row label="Prescribed By">
                  {prescription.prescribedBy}
                  <span className="block text-xs font-normal text-body">{RX.prescriberRole}</span>
                </Row>
                <Row label="Associated Encounter">
                  <button type="button" className="cursor-pointer text-left font-medium text-link hover:underline">
                    {RX.encounter}
                  </button>
                </Row>
                <Row label="Duration">{RX.duration}</Row>
                <Row label="Quantity">{RX.quantity}</Row>
                <Row label="Refills">{RX.refills}</Row>
                <Row label="Expiry Date">{RX.expiry}</Row>
              </dl>
            </div>
          </Panel>

          <div className="space-y-3">
            <InfoBlock icon={ClipboardCheck} tone="blue" title="Instructions" text={RX.instructions} />
            <InfoBlock icon={Stethoscope} tone="violet" title="Diagnosis" text={RX.diagnosis} />
            <InfoBlock icon={FileText} tone="blue" title="Additional Notes" text={RX.notes} />
          </div>

          <Panel
            icon={Paperclip}
            title="Attached Documents"
            action={<AddInternalButton className="h-10!" text="Add Document" onClick={() => {}} />}
          >
            <div className="flex items-center gap-3 rounded-xl border border-border p-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-500 dark:bg-red-950/40 dark:text-red-400">
                <FileText className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-heading">Prescription_RX-000125.pdf</p>
                <p className="text-xs text-body">PDF • 245 KB • Oct 6, 2026</p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button type="button" aria-label="View document" className={iconBtn}>
                  <Eye className="h-4 w-4" />
                </button>
                <button type="button" aria-label="Download document" className={iconBtn}>
                  <Download className="h-4 w-4" />
                </button>
                <button type="button" aria-label="More actions" className={iconBtn}>
                  <MoreVertical className="h-4 w-4" />
                </button>
              </div>
            </div>
          </Panel>
        </div>

        {/* ================= RIGHT ================= */}
        <aside className="min-w-0 space-y-4 sm:space-y-5">
          <Panel icon={Pill} title="Medication Information">
            <dl>
              {medicationInfo.map((m) => (
                <Row key={m.label} label={m.label}>
                  {m.link ? (
                    <button type="button" className="cursor-pointer font-medium text-link hover:underline">
                      {m.value}
                    </button>
                  ) : (
                    m.value
                  )}
                </Row>
              ))}
            </dl>
          </Panel>

          <Panel icon={ClipboardCheck} title="Prescription Actions">
            <div className="grid gap-3 sm:grid-cols-2">
              <ImportButton
                text="Print Prescription"
                icon={<Printer className="h-4 w-4" />}
                onClick={() => {}}
                className="w-full justify-center whitespace-nowrap text-primary"
              />
              <ImportButton
                text="Send to Patient"
                icon={<Mail className="h-4 w-4" />}
                onClick={() => {}}
                className="w-full justify-center whitespace-nowrap text-primary"
              />
              <ImportButton
                text="Renew / Refill"
                icon={<RefreshCw className="h-4 w-4" />}
                onClick={() => {}}
                className="w-full justify-center whitespace-nowrap text-primary"
              />
              <ImportButton
                text="Mark as Completed"
                icon={<Check className="h-4 w-4" />}
                onClick={() => {}}
                className="w-full justify-center whitespace-nowrap text-primary"
              />
            </div>
            <button
              type="button"
              className="mt-3 flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-danger/50 bg-danger/5 text-sm font-medium text-danger transition-colors hover:bg-danger/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger/30"
            >
              <Ban className="h-4 w-4" />
              Discontinue Prescription
            </button>
          </Panel>

          <Panel
            icon={History}
            title="Prescription History"
            action={
              <EditButton
                section="Prescription History"
                variant="viewAll"
                onEdit={() => router.push("/prescriptions")}
              />
            }
          >
            <ol>
              {HISTORY.map((h, i) => (
                <li key={h.title} className="relative pb-5 pl-6 last:pb-0">
                  {i < HISTORY.length - 1 && (
                    <span aria-hidden="true" className="absolute left-[5px] top-4 h-full w-px bg-border" />
                  )}
                  <span
                    aria-hidden="true"
                    className={`absolute left-0 top-1 h-[11px] w-[11px] rounded-full ${
                      h.done ? "bg-primary ring-4 ring-primary/15" : "border-2 border-border bg-card"
                    }`}
                  />
                  <p className="text-xs text-body">{h.date}</p>
                  <p className="text-sm font-semibold text-heading">{h.title}</p>
                  {h.by && <p className="text-xs text-body">{h.by}</p>}
                </li>
              ))}
            </ol>
          </Panel>
        </aside>
      </div>
    </div>
  );
};

export default ViewPrescriptions;