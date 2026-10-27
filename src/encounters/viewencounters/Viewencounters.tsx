"use client";

import React, { useState, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Copy,
  Download,
  Eye,
  FileImage,
  FileText,
  Link2,
  MoreHorizontal,
  Paperclip,
  Pencil,
  Pill,
  Plus,
  Printer,
  Stethoscope,
  User,
  Video,
  type LucideIcon,
} from "lucide-react";

import Breadcrumb from "@/components/Breadcrumb";
import ImportButton from "@/components/ImportButton";
import EditButton from "@/components/EditButton";
import Table from "@/components/Table";
import { type TableColumn } from "@/components/Tableheader";
import Content from "@/components/Content";
import Tags, { type TagTone } from "@/components/Tags";
import TableStatus from "@/components/TableStatus";
import StickyColumns from "@/components/StickyColumns";
import SuccessToast from "@/components/SuccessToast";
import { cardCls } from "@/providers/Shared";

/* ---------------------------------------------------------------- */
/*  Static data (replace with API data later)                        */
/* ---------------------------------------------------------------- */
const ENCOUNTER = {
  id: "ENC-2026-000125",
  status: "Completed",
  dateRange: "Oct 9, 2026, 10:00 AM - 10:30 AM",
  patient: {
    initials: "MP",
    name: "milonee primocys",
    age: "21 years",
    gender: "Female",
    status: "Active",
    patientId: "KMD-0000003",
    dob: "Jul 11, 2005",
    dobAge: "(21 years)",
    primaryProvider: "Dr. Sarah Lee",
    language: "Not provided",
  },
  visit: {
    type: "Follow-up Visit",
    appointment: "Oct 9, 2026, 10:00 AM - 10:30 AM (30 minutes)",
    mode: "Video Visit (Telemedicine)",
    reason: "Follow up consultation",
    location: "In Clinic - Room 3",
    createdOn: "Oct 9, 2026, 09:45 AM",
    createdBy: "Dr. Sarah Lee",
    provider: "Dr. Sarah Lee",
    providerSpecialty: "Internal Medicine",
    providerInitials: "SL",
    meetingLink: "https://meet.koolmd.com/apt/ABCD1234",
    priority: "Routine",
    startTime: "Oct 9, 2026, 10:00 AM",
    endTime: "Oct 9, 2026, 10:30 AM",
    duration: "30 minutes",
  },
  clinical: {
    chiefComplaint: "Follow up for persistent cough and cold symptoms.",
    ros: "No chest pain. No shortness of breath. No nausea or vomiting.",
    hpi: "Patient reports cough for 2 weeks with mild fever in the initial days. Symptoms have improved but still experiencing occasional cough.",
    assessment: "Viral upper respiratory tract infection. Symptoms improving.",
    plan: "Continue current medication. Follow up in 2 weeks or earlier if symptoms worsen.",
  },
  patientInfo: [
    { label: "Patient ID", value: "KMD-0000003" },
    { label: "Name", value: "milonee primocys" },
    { label: "Date of Birth", value: "Jul 11, 2005 (21 years)" },
    { label: "Gender", value: "Female" },
    { label: "Phone", value: "+91 98765 43210" },
    { label: "Email", value: "milonee@gmail.com" },
    { label: "Address", value: "Ahmedabad, Gujarat, India" },
    { label: "Preferred Language", value: "Not provided" },
    { label: "Insurance", value: "Not provided" },
  ],
  followUp: {
    recommended: "Yes",
    date: "Oct 31, 2026",
    instructions: "Continue medication. Follow up in 2 weeks or earlier if symptoms worsen.",
    status: "Pending",
  },
};

const DIAGNOSES = [
  { code: "J06.9", description: "Acute upper respiratory infection, unspecified", type: "Primary", status: "Active" },
];

const ORDERS = [
  { type: "Lab", name: "CBC", details: "Complete blood count", status: "Completed" },
  { type: "Imaging", name: "Chest X-Ray", details: "For persistent cough", status: "Completed" },
];

/* TODO: replace with the prescriptions returned by your API */
const PRESCRIPTIONS = [
  { medication: "Cetirizine", dosage: "10 mg (Tablet)", frequency: "Once daily", duration: "7 days", status: "Active" },
  { medication: "Albuterol Inhaler", dosage: "2 puffs (90 mcg)", frequency: "As needed", duration: "14 days", status: "Active" },
];

type AttachmentKind = "pdf" | "image";
const ATTACHMENTS: {
  name: string;
  kind: AttachmentKind;
  type: string;
  tone: TagTone;
  size: string;
  uploadedOn: string;
  uploadedBy: string;
}[] = [
  { name: "Consent_Form.pdf", kind: "pdf", type: "Clinical Document", tone: "info", size: "245 KB", uploadedOn: "Oct 9, 2026, 10:15 AM", uploadedBy: "Dr. Sarah Lee" },
  { name: "Chest_Xray.png", kind: "image", type: "Imaging", tone: "violet", size: "1.8 MB", uploadedOn: "Oct 9, 2026, 10:32 AM", uploadedBy: "Dr. Sarah Lee" },
  { name: "Lab_Report_CBC.pdf", kind: "pdf", type: "Lab Result", tone: "success", size: "320 KB", uploadedOn: "Oct 9, 2026, 10:45 AM", uploadedBy: "Dr. Sarah Lee" },
];

const STATUS_TONE: Record<string, TagTone> = {
  Completed: "success",
  Active: "success",
  Pending: "warning",
};

/* ---------------------------------------------------------------- */
/*  Table columns                                                    */
/* ---------------------------------------------------------------- */
const DIAGNOSIS_COLUMNS: TableColumn[] = [
  { key: "no", label: "#", className: "w-10" },
  { key: "code", label: "ICD Code" },
  { key: "description", label: "Description" },
  { key: "type", label: "Type" },
  { key: "status", label: "Status" },
];

const ORDER_COLUMNS: TableColumn[] = [
  { key: "no", label: "#", className: "w-10" },
  { key: "type", label: "Type" },
  { key: "name", label: "Name" },
  { key: "details", label: "Details" },
  { key: "status", label: "Status" },
];

const PRESCRIPTION_COLUMNS: TableColumn[] = [
  { key: "no", label: "#", className: "w-10" },
  { key: "medication", label: "Medication" },
  { key: "dosage", label: "Dosage" },
  { key: "frequency", label: "Frequency" },
  { key: "duration", label: "Duration" },
  { key: "status", label: "Status" },
];

const ATTACHMENT_COLUMNS: TableColumn[] = [
  { key: "file", label: "File", className: "w-12" },
  { key: "name", label: "Name" },
  { key: "type", label: "Type" },
  { key: "size", label: "Size" },
  { key: "uploadedOn", label: "Uploaded On" },
  { key: "uploadedBy", label: "Uploaded By" },
  {
    key: "actions",
    label: "Actions",
    header: <div className="flex w-full items-center justify-center">Actions</div>,
  },
];

/* ---------------------------------------------------------------- */
/*  Small building blocks                                            */
/* ---------------------------------------------------------------- */
const SectionCard = ({
  icon: Icon,
  title,
  action,
  children,
}: {
  icon: LucideIcon;
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) => (
  <section className={`${cardCls} min-w-0 space-y-4 sm:p-5`}>
    <header className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </span>
        <h3 className="truncate text-sm font-semibold text-heading sm:text-base">{title}</h3>
      </div>
      {action}
    </header>
    {children}
  </section>
);

const Row = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="grid grid-cols-[120px_minmax(0,1fr)] items-start gap-3 text-sm sm:grid-cols-[150px_minmax(0,1fr)]">
    <dt className="text-body">{label}</dt>
    <dd className="min-w-0 break-words font-medium text-heading">{children}</dd>
  </div>
);

const TextBlock = ({ title, children }: { title: string; children: ReactNode }) => (
  <div className="min-w-0">
    <p className="text-sm font-semibold text-heading">{title}</p>
    <p className="mt-1 text-sm leading-relaxed text-body">{children}</p>
  </div>
);

const HeaderField = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="min-w-0">
    <p className="text-xs text-body">{label}</p>
    <p className="mt-1 text-sm font-semibold text-heading">{children}</p>
  </div>
);

const AddAction = ({ text, onClick }: { text: string; onClick: () => void }) => (
  <ImportButton text={text} icon={<Plus className="h-4 w-4" />} onClick={onClick} className="shrink-0 whitespace-nowrap" />
);

const iconBtn =
  "flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-body transition-colors hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30";

const tableWrap = "w-full min-w-0 overflow-hidden rounded-[14px] border border-border bg-card";

/* ---------------------------------------------------------------- */
/*  Page                                                             */
/* ---------------------------------------------------------------- */
type OrdersTab = "orders" | "prescriptions";

const ViewEncounter = () => {
  const router = useRouter();
  const encounterKey = useSearchParams().get("id");
  const [ordersTab, setOrdersTab] = useState<OrdersTab>("orders");
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error" | null; title: string; message: string }>({
    type: null,
    title: "",
    message: "",
  });

  const { patient, visit, clinical, patientInfo, followUp } = ENCOUNTER;

  // TODO: route to your edit screens / open your modals for each section
  const editSection = (section: string) => router.push(`/edit-encounter?id=${encounterKey}&section=${encodeURIComponent(section)}`);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(visit.meetingLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
      setToast({
        type: "success",
        title: "Link Copied",
        message: "The meeting link has been copied to your clipboard.",
      });
    } catch {
      setToast({
        type: "error",
        title: "Copy Failed",
        message: "Could not access the clipboard. Please copy the link manually.",
      });
    }
  };

  const breadcrumb = (
    <Breadcrumb
      items={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Patients", href: "/patients" },
        { label: "Encounters", href: "/encounters" },
        { label: "View Encounter" },
      ]}
    />
  );

  if (!encounterKey) {
    return (
      <div className="mx-auto w-full max-w-[1600px] space-y-4">
        {breadcrumb}
        <div className="rounded-[14px] border border-border bg-card">
          <TableStatus variant="empty" message="No encounter selected. Open one from the Encounters list." />
        </div>
      </div>
    );
  }

  /* ---------- Tables ---------- */
  const diagnosisRows = DIAGNOSES.map((d, i) => ({
    no: <span className="text-sm text-body">{i + 1}</span>,
    code: <Content title={d.code} />,
    description: <Content title={d.description} truncate />,
    type: <Tags text={d.type} tone="info" />,
    status: <Tags text={d.status} tone={STATUS_TONE[d.status] ?? "neutral"} />,
  }));

  const orderRows = ORDERS.map((o, i) => ({
    no: <span className="text-sm text-body">{i + 1}</span>,
    type: <Content title={o.type} />,
    name: <Content title={o.name} />,
    details: <Content title={o.details} truncate />,
    status: <Tags text={o.status} tone={STATUS_TONE[o.status] ?? "neutral"} />,
  }));

  const prescriptionRows = PRESCRIPTIONS.map((p, i) => ({
    no: <span className="text-sm text-body">{i + 1}</span>,
    medication: <Content title={p.medication} />,
    dosage: <Content title={p.dosage} />,
    frequency: <Content title={p.frequency} />,
    duration: <Content title={p.duration} />,
    status: <Tags text={p.status} tone={STATUS_TONE[p.status] ?? "neutral"} />,
  }));

  const attachmentRows = ATTACHMENTS.map((a) => {
    const FileIcon = a.kind === "pdf" ? FileText : FileImage;
    return {
      file: <FileIcon className={`h-5 w-5 ${a.kind === "pdf" ? "text-danger" : "text-primary"}`} />,
      name: <Content title={a.name} truncate />,
      type: <Tags text={a.type} tone={a.tone} />,
      size: <Content title={a.size} />,
      uploadedOn: <Content title={a.uploadedOn} />,
      uploadedBy: <Content title={a.uploadedBy} />,
      actions: (
        <div className="flex w-full items-center justify-center gap-1">
          <button type="button" aria-label={`View ${a.name}`} className={iconBtn} onClick={() => {}}>
            <Eye className="h-4 w-4" />
          </button>
          <button type="button" aria-label={`Download ${a.name}`} className={iconBtn} onClick={() => {}}>
            <Download className="h-4 w-4" />
          </button>
          <button type="button" aria-label={`More actions for ${a.name}`} className={iconBtn} onClick={() => {}}>
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      ),
    };
  });

  const ORDER_TABS: { key: OrdersTab; label: string }[] = [
    { key: "orders", label: `Orders (${ORDERS.length})` },
    { key: "prescriptions", label: `Prescriptions (${PRESCRIPTIONS.length})` },
  ];

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-4 sm:space-y-5">
      <SuccessToast
        isOpen={toast.type === "success"}
        onClose={() => setToast((t) => ({ ...t, type: null }))}
        title={toast.title}
        message={toast.message}
      />

      {breadcrumb}

      {/* Title + actions */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-3">
       
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-lg font-semibold text-heading sm:text-xl 2xl:text-2xl">Encounter Details</h2>
              <Tags text={ENCOUNTER.status} tone={STATUS_TONE[ENCOUNTER.status] ?? "neutral"} />
            </div>
            <p className="mt-0.5 text-xs text-body sm:text-sm">
              {ENCOUNTER.id} <span className="mx-1.5 text-border">•</span> {ENCOUNTER.dateRange}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <ImportButton
            text="Edit Encounter"
            icon={<Pencil className="h-4 w-4" />}
            onClick={() => editSection("Encounter")}
            className="whitespace-nowrap"
          />
          <ImportButton
            text="Print Summary"
            icon={<Printer className="h-4 w-4" />}
            onClick={() => window.print()}
            className="whitespace-nowrap"
          />
          <button
            type="button"
            aria-label="More actions"
            className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-border bg-card text-heading transition-colors hover:border-primary/50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Patient summary */}
      <div className={`${cardCls} flex flex-col gap-5 sm:p-5 xl:flex-row xl:items-center`}>
        <div className="flex min-w-0 items-center gap-4 xl:w-[300px] xl:shrink-0">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
            {patient.initials}
          </span>
          <div className="min-w-0">
            <h3 className="truncate text-lg font-semibold text-heading">{patient.name}</h3>
            <p className="text-sm text-body">
              {patient.age} <span className="mx-1 text-border">•</span> {patient.gender}
            </p>
            <div className="mt-1.5">
              <Tags text={patient.status} tone="success" />
            </div>
          </div>
        </div>

        <dl className="grid min-w-0 flex-1 grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3 xl:grid-cols-5 xl:[&>div]:border-l xl:[&>div]:border-border xl:[&>div]:pl-6">
          <HeaderField label="Patient ID">{patient.patientId}</HeaderField>
          <HeaderField label="Date of Birth">
            {patient.dob}
            <span className="block text-xs font-normal text-body">{patient.dobAge}</span>
          </HeaderField>
          <HeaderField label="Gender">{patient.gender}</HeaderField>
          <HeaderField label="Primary Provider">{patient.primaryProvider}</HeaderField>
          <HeaderField label="Preferred Language">{patient.language}</HeaderField>
        </dl>
      </div>

      <StickyColumns
        columnsClass="2xl:grid-cols-[minmax(0,1fr)_400px]"
        breakpoint="xl"
      >
        {/* ================= LEFT ================= */}
        <div className="flex min-w-0 flex-col gap-4 sm:gap-5">
          {/* Visit information */}
          <SectionCard icon={CalendarDays} title="Visit Information">
            <div className="grid gap-x-8 gap-y-4 lg:grid-cols-2 lg:[&>dl:first-child]:border-r lg:[&>dl:first-child]:border-border lg:[&>dl:first-child]:pr-8">
              <dl className="space-y-3">
                <Row label="Encounter ID">{ENCOUNTER.id}</Row>
                <Row label="Encounter Type">{visit.type}</Row>
                <Row label="Appointment Date & Time">{visit.appointment}</Row>
                <Row label="Visit Mode">
                  <span className="inline-flex items-center gap-2 text-primary">
                    <Video className="h-4 w-4" />
                    {visit.mode}
                  </span>
                </Row>
                <Row label="Status">
                  <Tags text={ENCOUNTER.status} tone={STATUS_TONE[ENCOUNTER.status] ?? "neutral"} />
                </Row>
                <Row label="Reason for Visit">{visit.reason}</Row>
                <Row label="Location">{visit.location}</Row>
                <Row label="Created On">{visit.createdOn}</Row>
                <Row label="Created By">{visit.createdBy}</Row>
              </dl>

              <dl className="space-y-3">
                <Row label="Provider">
                  <span className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      {visit.providerInitials}
                    </span>
                    <span className="min-w-0">
                      <span className="block font-semibold text-heading">{visit.provider}</span>
                      <span className="block text-xs font-normal text-body">{visit.providerSpecialty}</span>
                    </span>
                  </span>
                </Row>
                <Row label="Meeting Link">
                  <span className="flex items-center gap-2 rounded-lg border border-border bg-primary/[0.03] px-3 py-2">
                    <Link2 className="h-4 w-4 shrink-0 text-primary" />
                    <a
                      href={visit.meetingLink}
                      target="_blank"
                      rel="noreferrer"
                      className="min-w-0 flex-1 truncate text-xs font-medium text-link hover:underline"
                    >
                      {visit.meetingLink}
                    </a>
                    <button
                      type="button"
                      aria-label={copied ? "Link copied" : "Copy meeting link"}
                      onClick={copyLink}
                      className={`${iconBtn} !h-7 !w-7 shrink-0 ${copied ? "!text-success" : ""}`}
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </span>
                </Row>
                <Row label="Visit Priority">{visit.priority}</Row>
                <Row label="Start Time">{visit.startTime}</Row>
                <Row label="End Time">{visit.endTime}</Row>
                <Row label="Duration">{visit.duration}</Row>
              </dl>
            </div>
          </SectionCard>

          {/* Clinical information */}
          <SectionCard
            icon={FileText}
            title="Clinical Information"
            action={<EditButton section="Clinical Information" onEdit={editSection} />}
          >
            <div className="grid gap-x-8 gap-y-5 lg:grid-cols-2">
              <div className="space-y-5">
                <TextBlock title="Chief Complaint">{clinical.chiefComplaint}</TextBlock>
                <TextBlock title="Review of Systems (ROS)">{clinical.ros}</TextBlock>
              </div>
              <div className="space-y-5">
                <TextBlock title="History of Present Illness (HPI)">{clinical.hpi}</TextBlock>
                <TextBlock title="Assessment">{clinical.assessment}</TextBlock>
                <TextBlock title="Plan">{clinical.plan}</TextBlock>
              </div>
            </div>
          </SectionCard>

          {/* Diagnoses */}
          <SectionCard
            icon={Stethoscope}
            title="Diagnoses"
            action={<AddAction text="Add Diagnosis" onClick={() => editSection("Diagnoses")} />}
          >
            <div className={tableWrap}>
              {diagnosisRows.length > 0 ? (
                <Table columns={DIAGNOSIS_COLUMNS} rows={diagnosisRows} bordered={false} />
              ) : (
                <TableStatus variant="empty" message="No diagnoses added yet." />
              )}
            </div>
          </SectionCard>

          {/* Orders & prescriptions */}
          <SectionCard
            icon={Pill}
            title="Orders & Prescriptions"
            action={<AddAction text="Add Order" onClick={() => editSection("Orders")} />}
          >
            <div role="tablist" aria-label="Orders and prescriptions" className="flex gap-6 border-b border-border">
              {ORDER_TABS.map((t) => {
                const active = t.key === ordersTab;
                return (
                  <button
                    key={t.key}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setOrdersTab(t.key)}
                    className={`-mb-px cursor-pointer whitespace-nowrap border-b-2 px-1 pb-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${
                      active ? "border-primary text-primary" : "border-transparent text-body hover:text-heading"
                    }`}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>

            <div className={tableWrap} role="tabpanel">
              {ordersTab === "orders" ? (
                <Table columns={ORDER_COLUMNS} rows={orderRows} bordered={false} />
              ) : (
                <Table columns={PRESCRIPTION_COLUMNS} rows={prescriptionRows} bordered={false} />
              )}
            </div>
          </SectionCard>

          {/* Attachments */}
          <SectionCard
            icon={Paperclip}
            title={`Attachments (${ATTACHMENTS.length})`}
            action={<AddAction text="Add Attachment" onClick={() => editSection("Attachments")} />}
          >
            <div className={tableWrap}>
              {attachmentRows.length > 0 ? (
                <Table columns={ATTACHMENT_COLUMNS} rows={attachmentRows} bordered={false} />
              ) : (
                <TableStatus variant="empty" message="No attachments added yet." />
              )}
            </div>
          </SectionCard>
        </div>

        {/* ================= RIGHT ================= */}
        <div className="flex min-w-0 flex-col gap-4 sm:gap-5">
          <SectionCard
            icon={User}
            title="Patient Information"
            action={<EditButton section="Patient Information" onEdit={editSection} />}
          >
            <dl className="space-y-3">
              {patientInfo.map((r) => (
                <Row key={r.label} label={r.label}>
                  {r.value}
                </Row>
              ))}
            </dl>
          </SectionCard>

          <SectionCard
            icon={CalendarDays}
            title="Follow-up"
            action={<EditButton section="Follow-up" onEdit={editSection} />}
          >
            <dl className="space-y-3">
              <Row label="Follow-up Recommended">{followUp.recommended}</Row>
              <Row label="Follow-up Date">{followUp.date}</Row>
              <Row label="Instructions">{followUp.instructions}</Row>
              <Row label="Status">
                <Tags text={followUp.status} tone={STATUS_TONE[followUp.status] ?? "neutral"} />
              </Row>
            </dl>
          </SectionCard>
        </div>
      </StickyColumns>
    </div>
  );
};

export default ViewEncounter;