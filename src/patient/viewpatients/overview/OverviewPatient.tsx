"use client";

import React from "react";
import {
  CalendarDays,
  Clock,
  Globe,
  Hash,
  Heart,
  Mail,
  MapPin,
  Phone,
  Plus,
  ShieldCheck,
  User,
  UserCheck,
  Users,
  type LucideIcon,
} from "lucide-react";

import Tags, { type TagTone } from "@/components/Tags";
import AddButton from "@/components/Addbutton";
import ImportButton from "@/components/ImportButton";
import EditButton from "@/components/EditButton";
import { useAppDispatch } from "@/hooks/useAppHooks";
import { showModal } from "@/redux/slices/dialogslice";
import type {
  EmergencyContact,
  PatientAppointment,
  PatientDetail,
  PatientInsurance,
  PatientStatus,
} from "@/types/patient";
import {
  calculateAgeInYears,
  formatDateOnly,
  formatDateTime,
  formatLanguage,
  humanizeEnum,
} from "@/utils/formatters";

const NOT_PROVIDED = "Not provided";

type FieldItem = { icon: LucideIcon; label: string; value: string };

const STATUS_TONES: Record<PatientStatus, TagTone> = {
  ACTIVE: "success",
  INACTIVE: "danger",
  DECEASED: "neutral",
};

const orNotProvided = (value: string | null | undefined) =>
  value && value.trim() !== "" ? value : NOT_PROVIDED;

/** "12 Main St, Apt 4, Austin, TX 78701" — or "Not provided" when no part is set. */
const formatAddress = (patient: PatientDetail) => {
  const stateAndZip = [patient.stateCode, patient.postalCode].filter(Boolean).join(" ");
  return orNotProvided(
    [patient.addressLine1, patient.addressLine2, patient.city, stateAndZip].filter(Boolean).join(", "),
  );
};

const hasProvidedValue = (value: string) => value.trim() !== "" && value !== NOT_PROVIDED;

/* ---------- Small building blocks ---------- */
const IconBadge = ({
  icon: Icon,
  size = "md",
}: {
  icon: LucideIcon;
  size?: "sm" | "md" | "lg";
}) => {
  const box = size === "sm" ? "h-8 w-8" : size === "lg" ? "h-10 w-10" : "h-9 w-9";
  return (
    <span className={`flex ${box} shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary`}>
      <Icon className="h-4 w-4" />
    </span>
  );
};

/**
 * Pass `flex-1` in className to let a card stretch to fill its column.
 * Content stays top-aligned; extra height becomes blank space at the bottom.
 */
const Card = ({
  icon,
  title,
  action,
  children,
  className = "",
}: {
  icon: LucideIcon;
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) => (
  <section className={`flex min-w-0 flex-col rounded-[8px] border border-border/40 bg-card ${className}`}>
    <header className="flex items-center justify-between gap-3 px-4 py-3.5 sm:px-5 sm:py-4">
      <div className="flex min-w-0 items-center gap-3">
        <IconBadge icon={icon} />
        <h3 className="truncate text-sm font-semibold text-heading sm:text-base">{title}</h3>
      </div>
      {action}
    </header>
    <div className="flex flex-1 flex-col px-4 pb-4 sm:px-5 sm:pb-5">{children}</div>
  </section>
);

const isMuted = (v: string) => v === NOT_PROVIDED;

const Field = ({ icon, label, value }: { icon: LucideIcon; label: string; value: string }) => (
  <li className="flex items-center gap-3">
    <IconBadge icon={icon} size="sm" />
    <div className="min-w-0">
      <p className="text-xs text-body">{label}</p>
      <p className={`break-words text-sm ${isMuted(value) ? "text-body" : "font-semibold text-heading"}`}>
        {value}
      </p>
    </div>
  </li>
);

const EmptyState = ({
  icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action: React.ReactNode;
}) => (
  <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border px-4 py-6 text-center">
    <div className="mb-2">
      <IconBadge icon={icon} size="lg" />
    </div>
    <p className="text-sm font-semibold text-heading">{title}</p>
    <p className="mb-4 mt-0.5 text-xs text-body">{description}</p>
    {action}
  </div>
);

/** One row of a list card (emergency contact, insurance, appointment). */
const ListRow = ({
  title,
  description,
  tag,
}: {
  title: string;
  description: string;
  tag?: React.ReactNode;
}) => (
  <li className="flex items-start justify-between gap-3 rounded-xl border border-border/60 px-3.5 py-3">
    <div className="min-w-0">
      <p className="break-words text-sm font-semibold text-heading">{title}</p>
      <p className="mt-0.5 break-words text-xs text-body">{description}</p>
    </div>
    {tag}
  </li>
);

/* ---------- Component ---------- */
type Props = {
  patient: PatientDetail;
  emergencyContacts: EmergencyContact[];
  insurances: PatientInsurance[];
  recentAppointments: PatientAppointment[];
  /** Set when appointments could not be loaded (the rest of the overview still shows). */
  recentAppointmentsError: string | null;
  onEdit?: (section: string) => void;
};

const OverviewPatient = ({
  patient,
  emergencyContacts,
  insurances,
  recentAppointments,
  recentAppointmentsError,
  onEdit,
}: Props) => {
  const dispatch = useAppDispatch();

  const contactFields: FieldItem[] = [
    { icon: Phone, label: "Phone Number", value: orNotProvided(patient.phoneNumber) },
    { icon: Mail, label: "Email Address", value: orNotProvided(patient.email) },
    { icon: MapPin, label: "Address", value: formatAddress(patient) },
  ];

  const personalFields: FieldItem[] = [
    {
      icon: CalendarDays,
      label: "Date of Birth",
      value: `${formatDateOnly(patient.dateOfBirth)} (${calculateAgeInYears(patient.dateOfBirth)} years)`,
    },
    { icon: User, label: "Gender", value: humanizeEnum(patient.administrativeGender) },
    { icon: Globe, label: "Preferred Language", value: formatLanguage(patient.preferredLanguage) },
    { icon: Heart, label: "Gender Identity", value: orNotProvided(patient.genderIdentity) },
  ];

  const accountFields: FieldItem[] = [
    { icon: Hash, label: "Patient ID", value: patient.medicalRecordNumber },
    { icon: CalendarDays, label: "Created Date", value: formatDateTime(patient.createdAt) },
    { icon: Clock, label: "Last Updated", value: formatDateTime(patient.updatedAt) },
    { icon: UserCheck, label: "Online Account", value: patient.hasPortalAccount ? "Yes" : "No" },
  ];


  return (
  <div className="flex flex-col gap-4 sm:gap-5">
    {/* ---- Row 1: 3 columns of cards ---- */}
    <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 2xl:grid-cols-3">
      {/* Column 1 */}
      <div className="flex min-w-0 flex-col gap-4 sm:gap-5">
        <Card
          className="flex-1"
          icon={Phone}
          title="Contact Information"
          action={
            contactFields.some((item) => hasProvidedValue(item.value)) ? (
              <EditButton section="Contact Information" onEdit={() => dispatch(showModal("EditContactInformation"))} />
            ) : undefined
          }
        >
          <ul className="space-y-4">
            {contactFields.map((c) => (
              <Field key={c.label} {...c} />
            ))}
          </ul>
        </Card>

        <Card
          className="flex-1"
          icon={Users}
          title="Emergency Contact"
        >
          {emergencyContacts.length > 0 ? (
            <ul className="space-y-2.5">
              {emergencyContacts.map((contact) => (
                <ListRow
                  key={contact.id}
                  title={contact.fullName}
                  description={[humanizeEnum(contact.relationship), contact.phoneNumber, contact.email]
                    .filter(Boolean)
                    .join(" • ")}
                  tag={contact.isPrimary ? <Tags text="Primary" tone="success" /> : undefined}
                />
              ))}
            </ul>
          ) : (
            <EmptyState
              icon={Users}
              title="No emergency contact added"
              description="Add emergency contact information for this patient."
              action={
                <ImportButton text="Add Emergency Contact" icon={<Plus className="h-4 w-4" />} onClick={() => {}} />
              }
            />
          )}
        </Card>
      </div>

      {/* Column 2 */}
      <div className="flex min-w-0 flex-col gap-4 sm:gap-5">
        <Card
          className="flex-1"
          icon={User}
          title="Personal Information"
          action={
            personalFields.some((item) => hasProvidedValue(item.value)) ? (
              <EditButton section="Personal Information" onEdit={onEdit} />
            ) : undefined
          }
        >
          <ul className="grid grid-cols-1 gap-x-4 gap-y-5 sm:grid-cols-2">
            {personalFields.map((p) => (
              <Field key={p.label} {...p} />
            ))}
          </ul>
        </Card>

        <Card
          className="flex-1"
          icon={ShieldCheck}
          title="Insurance Information"
        >
          {insurances.length > 0 ? (
            <ul className="space-y-2.5">
              {insurances.map((insurance) => (
                <ListRow
                  key={insurance.id}
                  title={[insurance.payerName, insurance.planName].filter(Boolean).join(" — ")}
                  description={[
                    `${humanizeEnum(insurance.coveragePriority)} coverage`,
                    `Member ID ${insurance.memberId}`,
                    insurance.groupNumber ? `Group ${insurance.groupNumber}` : null,
                  ]
                    .filter(Boolean)
                    .join(" • ")}
                  tag={
                    <Tags
                      text={humanizeEnum(insurance.status)}
                      tone={insurance.status === "ACTIVE" ? "success" : "neutral"}
                    />
                  }
                />
              ))}
            </ul>
          ) : (
            <EmptyState
              icon={ShieldCheck}
              title="No insurance added"
              description="Add insurance details to manage billing and claims."
              action={
                <ImportButton text="Add Insurance Information" icon={<Plus className="h-4 w-4" />} onClick={() => {}} />
              }
            />
          )}
        </Card>
      </div>

      {/* Column 3 */}
      <div className="flex min-w-0 flex-col gap-4 sm:gap-5 md:col-span-2 2xl:col-span-1">
        <Card
          className="flex-1"
          icon={UserCheck}
          title="Account Status"
          action={<Tags text={humanizeEnum(patient.status)} tone={STATUS_TONES[patient.status]} />}
        >
          <ul className="space-y-4">
            {accountFields.map((a) => (
              <li key={a.label} className="flex items-center justify-between gap-3">
                <p className="flex min-w-0 items-center gap-3 text-xs text-body sm:text-sm">
                  <IconBadge icon={a.icon} size="sm" />
                  {a.label}
                </p>
                <p
                  className={`min-w-0 break-words text-right text-xs sm:text-sm ${
                    isMuted(a.value) ? "text-body" : "font-semibold text-heading"
                  }`}
                >
                  {a.value}
                </p>
              </li>
            ))}
          </ul>
        </Card>

        <Card
          className="flex-1"
          icon={CalendarDays}
          title="Recent Appointments"
        >
          {recentAppointmentsError ? (
            <p className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-xs text-body">
              Appointments could not be loaded: {recentAppointmentsError}
            </p>
          ) : recentAppointments.length > 0 ? (
            <ul className="space-y-2.5">
              {recentAppointments.map((appointment) => (
                <ListRow
                  key={appointment.id}
                  title={appointment.appointmentType.name}
                  description={[
                    formatDateTime(appointment.startsAt, appointment.timeZone),
                    `Dr. ${appointment.practitioner.firstName} ${appointment.practitioner.lastName}`,
                    humanizeEnum(appointment.consultationMode),
                  ].join(" • ")}
                  tag={<Tags text={humanizeEnum(appointment.status)} tone="neutral" />}
                />
              ))}
            </ul>
          ) : (
            <EmptyState
              icon={CalendarDays}
              title="No appointments yet"
              description="This patient does not have any appointments scheduled."
              action={<AddButton text="Book Appointment" onClick={() => {}} />}
            />
          )}
        </Card>
      </div>
    </div>

    {/* ---- Row 2: full-width HIPAA banner ---- */}
    {/* <div className="flex items-start gap-3 rounded-[8px] border border-primary/20 bg-primary/5 dark:bg-primary/20 p-4 sm:p-5">
      <IconBadge icon={ShieldCheck} size="lg" />
      <div className="min-w-0">
        <p className="text-sm font-semibold text-heading">HIPAA Privacy Reminder</p>
        <p className="mt-1 text-xs leading-relaxed text-body">
          This patient&apos;s information is protected under HIPAA regulations. Ensure all access and
          communications comply with privacy policies.
        </p>
      </div>
    </div> */}
  </div>
  );
};

export default OverviewPatient;