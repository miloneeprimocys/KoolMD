"use client";

import React from "react";
import { BarChart3, CalendarDays, Eye, FileText, Lock, MoreVertical, Send } from "lucide-react";

import EditButton from "@/components/EditButton";
import RadioCheckButtonh from "@/components/RadioCheckButtonh";
import Table from "@/components/Table";
import { type TableColumn } from "@/components/Tableheader";
import Content from "@/components/Content";
import Tags from "@/components/Tags";
import { cardCls, type StepProps } from "@/providers/Shared";
import {
  PRIORITY_TONE,
  formatDate,
  getPatient,
  initials,
  typeLabel,
  type ReferralValues,
} from "./Referraldetails";
import { ProviderAvatar, getProvider } from "./Providerreason";
import { DocIcon } from "./Attachdocuments";

/* ---------------------------------------------------------------- */
/*  Static content                                                   */
/* ---------------------------------------------------------------- */
/** Edit-button section title → step number to jump back to. */
const SECTION_STEP: Record<string, number> = {
  "Patient Information": 1,
  "Receiving Provider": 2,
  "Referral Details": 1,
  "Clinical Information": 1,
  "Attached Documents": 3,
};

const NEXT_STEPS = [
  { Icon: Send, tone: "bg-primary/10 text-primary", title: "Referral sent", text: "The provider will receive the referral and attached documents." },
  { Icon: FileText, tone: "bg-success/10 text-success", title: "Provider review", text: "You will be notified once the provider reviews and updates the status." },
  { Icon: CalendarDays, tone: "bg-warning/10 text-warning", title: "Appointment booking", text: "The provider's office may contact the patient to schedule an appointment." },
  { Icon: BarChart3, tone: "bg-violet/10 text-violet", title: "Track status", text: "You can track the referral status in the Referrals list." },
];

const checkboxCls =
  "mt-0.5 h-4 w-4 cursor-pointer rounded border-border accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30";

const DOC_COLUMNS: TableColumn[] = [
  { key: "name", label: "Document Name" },
  { key: "type", label: "Type" },
  { key: "size", label: "Size" },
  { key: "date", label: "Uploaded On" },
  {
    key: "actions",
    label: "Actions",
    header: <div className="flex w-full items-center justify-center">Actions</div>,
  },
];

/* ---------------------------------------------------------------- */
/*  Small pieces                                                     */
/* ---------------------------------------------------------------- */
const ReviewCard = ({
  title,
  onEdit,
  className = "",
  children,
}: {
  title: string;
  onEdit: (section: string) => void;
  className?: string;
  children: React.ReactNode;
}) => (
  <section className={`${cardCls} min-w-0 sm:p-6 ${className}`}>
    <header className="mb-4 flex items-center justify-between gap-3">
      <h3 className="text-base font-semibold text-heading sm:text-lg">{title}</h3>
      <EditButton section={title} onEdit={onEdit} />
    </header>
    {children}
  </section>
);

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <dt className="text-xs text-body">{label}</dt>
    <dd className="mt-0.5 break-words text-sm font-medium text-heading">{children || "—"}</dd>
  </div>
);

/* ---------------------------------------------------------------- */
/*  Component                                                        */
/* ---------------------------------------------------------------- */
type Props = StepProps<ReferralValues> & {
  /** Jump back to a step (1–3) */
  onEdit: (step: number) => void;
};

const ReviewSend = ({ values: v, onChange, onEdit }: Props) => {
  const patient = getPatient(v.patient);
  const provider = getProvider(v.provider);
  const handleEdit = (section: string) => onEdit(SECTION_STEP[section] ?? 1);

  const docRows = v.documents.map((d) => ({
    name: (
      <div className="flex min-w-0 items-center gap-3">
        <DocIcon kind={d.kind} className="h-8 w-8" />
        <span className="truncate text-sm font-medium text-heading">{d.name}</span>
      </div>
    ),
    type: <Content title={d.category} truncate />,
    size: <Content title={d.size} />,
    date: <Content title={d.date} />,
    actions: (
      <div className="flex w-full items-center justify-center gap-1">
        <button
          type="button"
          aria-label={`View ${d.name}`}
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-body transition-colors hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
        >
          <Eye className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label="More options"
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-body transition-colors hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
        >
          <MoreVertical className="h-4 w-4" />
        </button>
      </div>
    ),
  }));

  return (
    <div className="grid items-start gap-4 sm:gap-5 2xl:grid-cols-[minmax(0,1fr)_340px]">
      {/* ================= LEFT: review cards ================= */}
      <div className="min-w-0 space-y-4 sm:space-y-5">
        <div className="grid gap-4 sm:gap-5 lg:grid-cols-2">
          {/* Patient */}
          <ReviewCard title="Patient Information" onEdit={handleEdit}>
            {patient ? (
              <div className="flex items-start gap-4">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-pink/15 text-base font-semibold text-pink">
                  {initials(patient.name)}
                </span>
                <div className="min-w-0 space-y-0.5">
                  <p className="text-sm font-semibold text-heading">{patient.name}</p>
                  <p className="text-xs text-body">
                    {patient.age}
                    {patient.gender} • {patient.mrn}
                  </p>
                  <p className="text-xs text-body">
                    {patient.dob} <span className="mx-1 text-border">|</span> {patient.phone}
                  </p>
                  <p className="pt-1 text-xs text-body">{patient.address}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-body">No patient selected.</p>
            )}
          </ReviewCard>

          {/* Provider */}
          <ReviewCard title="Receiving Provider" onEdit={handleEdit}>
            {provider ? (
              <div className="flex items-start gap-4">
                <ProviderAvatar name={provider.name} className="h-14 w-14 text-base" />
                <div className="min-w-0 space-y-0.5">
                  <p className="text-sm font-semibold text-heading">{provider.name}</p>
                  <p className="text-xs text-body">{provider.specialty}</p>
                  <p className="text-xs font-medium text-heading">{provider.clinic}</p>
                  <p className="pt-1 text-xs text-body">{provider.address} 85004</p>
                  <p className="text-xs text-body">{provider.phone}</p>
                  <p className="break-all text-xs text-body">{provider.email}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-body">No provider selected.</p>
            )}
          </ReviewCard>
        </div>

        {/* Referral details */}
        <ReviewCard title="Referral Details" onEdit={handleEdit}>
          <dl className="grid gap-x-6 gap-y-4 md:grid-cols-3">
            <div className="space-y-4">
              <Field label="Referral Specialty">{v.specialty}</Field>
              <Field label="Referral Type">{typeLabel(v.referralType)}</Field>
              <Field label="Reason for Referral">{v.reason}</Field>
            </div>
            <div className="space-y-4">
              <Field label="Priority">
                {v.priority ? <Tags text={v.priority} tone={PRIORITY_TONE[v.priority] ?? "neutral"} /> : null}
              </Field>
              <Field label="Referral Location">{v.location || provider?.clinic}</Field>
              <Field label="Requested Appointment Date">{formatDate(v.appointmentDate)}</Field>
            </div>
            <div className="space-y-4 md:border-l md:border-divider md:pl-6">
              <Field label="Specific Consultation Request">{v.consultationRequest}</Field>
              <Field label="Follow-up Tracking">
                {v.followUp ? "Yes, track follow-up status." : "No follow-up tracking."}
              </Field>
              <Field label="Additional Notes">{v.notes}</Field>
            </div>
          </dl>
        </ReviewCard>

        {/* Clinical information */}
        <ReviewCard title="Clinical Information" onEdit={handleEdit}>
          <dl className="grid gap-x-6 gap-y-4 md:grid-cols-3">
            <Field label="Relevant Medical History">{v.history}</Field>
            <div className="md:border-l md:border-divider md:pl-6">
              <Field label="Current Medications">{v.medications}</Field>
            </div>
            <div className="md:border-l md:border-divider md:pl-6">
              <Field label="Allergies">{patient?.allergies}</Field>
            </div>
          </dl>
        </ReviewCard>

        {/* Attached documents */}
        <ReviewCard title="Attached Documents" onEdit={handleEdit}>
          {/* Heading count sits next to the title via the card title above */}
          <p className="-mt-2 mb-3 text-xs text-body">{v.documents.length} document(s) attached</p>
          <div className="w-full min-w-0 overflow-hidden rounded-[14px] border border-border bg-card">
            {docRows.length > 0 ? (
              <Table columns={DOC_COLUMNS} rows={docRows} bordered={false} />
            ) : (
              <p className="px-4 py-8 text-center text-sm text-body">No documents attached.</p>
            )}
          </div>
        </ReviewCard>
      </div>

      {/* ================= RIGHT: ready to send ================= */}
      <aside className={`${cardCls} space-y-5 sm:p-6 xl:sticky xl:top-0`}>
        <div className="flex items-start gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Send className="h-6 w-6" />
          </span>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-primary">Ready to Send Referral</h3>
            <p className="mt-1 text-xs text-body">
              Review all details before sending. The referral will be sent to {provider?.name ?? "the selected provider"} via
              the secure referral system.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-xl bg-success/10 p-4">
          <Lock className="mt-0.5 h-4 w-4 shrink-0 text-success" />
          <p className="text-xs text-heading">
            Patient documents and clinical information will be shared securely with the selected provider.
          </p>
        </div>

        <div>
          <h4 className="mb-4 text-sm font-semibold text-heading">What happens next?</h4>
          <ol className="relative space-y-5 before:absolute before:bottom-6 before:left-[19px] before:top-6 before:w-px before:bg-divider">
            {NEXT_STEPS.map(({ Icon, tone, title, text }) => (
              <li key={title} className="relative flex items-start gap-3">
                <span className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${tone}`}>
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-heading">{title}</p>
                  <p className="mt-0.5 text-xs text-body">{text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <label className="flex cursor-pointer items-start gap-3 border-t border-divider pt-4">
          <RadioCheckButtonh
            type="checkbox"
            checked={v.notifyPatient}
            onChange={() => onChange({ notifyPatient: !v.notifyPatient })}
            aria-label="Notify patient that referral has been sent"
            className={checkboxCls}
          />
          <span className="min-w-0">
            <span className="block text-sm font-medium text-heading">Notify patient that referral has been sent</span>
            <span className="block text-xs text-body">An automated notification will be sent to the patient.</span>
          </span>
        </label>
      </aside>
    </div>
  );
};

export default ReviewSend;