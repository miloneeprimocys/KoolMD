"use client";

import React from "react";
import { CalendarDays, Clock, Mail, MapPin, Phone } from "lucide-react";

import EditButton from "@/components/EditButton";

/* ---------- Types ---------- */
export type PractitionerOverviewData = {
  fullName: string;
  dob: string; // display text, e.g. "05/14/1990 (34 yrs)"
  gender: string;
  providerType: string;
  specialty: string;
  npi: string;
  dea: string;
  email: string;
  phone: string;
  language: string;
  address: string;
  locations: { name: string; type: string }[];
  workingDays: string;
  appointmentDuration: string;
};

/* ---------- Small building blocks ---------- */
type CardProps = {
  title: string;
  /** Replaces the default Edit button in the header. */
  action?: React.ReactNode;
  onEdit?: (section: string) => void;
  children: React.ReactNode;
};

const Card = ({ title, action, onEdit, children }: CardProps) => (
  <section className="flex min-w-0 flex-1 flex-col rounded-[8px] border border-border/40 bg-card">
    <header className="flex items-center justify-between gap-3 px-4 py-3.5 sm:px-5 sm:py-4">
      <h3 className="text-sm font-semibold text-heading sm:text-base">{title}</h3>
      {action ?? <EditButton section={title} onEdit={onEdit} />}
    </header>
    <div className="px-4 pb-2 sm:px-5 sm:pb-3">{children}</div>
  </section>
);

/** Label above value on phones, label | value side by side from sm up. */
const Row = ({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) => (
  <div className="grid grid-cols-1 gap-0.5 border-t border-divider py-3 first:border-t-0 first:pt-0 sm:grid-cols-[150px_minmax(0,1fr)] sm:items-start sm:gap-4">
    <dt className="flex items-center gap-2 text-xs text-body sm:text-sm">
      {Icon && <Icon className="h-4 w-4 shrink-0 text-primary" />}
      {label}
    </dt>
    <dd className="min-w-0 break-words text-sm font-medium text-heading">{children}</dd>
  </div>
);

/* ---------- Component ---------- */
type Props = {
  data: PractitionerOverviewData;
  /** Called with the card title when a card's Edit button is clicked. */
  onEdit?: (section: string) => void;
  /** Opens the "Locations & Availability" tab. */
  onViewAllHours?: () => void;
};

const PractitionerOverview = ({ data, onEdit, onViewAllHours }: Props) => (
  <div className="grid grid-cols-1 gap-4 sm:gap-5 xl:grid-cols-2">
    {/* Left column */}
    <div className="flex min-w-0 flex-col gap-4 sm:gap-5">
      <Card title="Basic Information" onEdit={onEdit}>
        <dl>
          <Row label="Full Name">{data.fullName}</Row>
          <Row label="Date of Birth">{data.dob}</Row>
          <Row label="Gender">{data.gender}</Row>
          <Row label="Provider Type">{data.providerType}</Row>
          <Row label="Specialty">{data.specialty}</Row>
          <Row label="NPI Number">{data.npi}</Row>
          <Row label="DEA Number">{data.dea}</Row>
          <Row label="Email">{data.email}</Row>
          <Row label="Phone">{data.phone}</Row>
          <Row label="Preferred Language">{data.language}</Row>
        </dl>
      </Card>
    </div>

    {/* Right column */}
    <div className="flex min-w-0 flex-col gap-4 sm:gap-5">
      <Card title="Contact Information" onEdit={onEdit}>
        <dl>
          <Row label="Address" icon={MapPin}>
            {data.address}
          </Row>
          <Row label="Phone" icon={Phone}>
            {data.phone}
          </Row>
          <Row label="Email" icon={Mail}>
            {data.email}
          </Row>
        </dl>
      </Card>

      <Card
        title="Working Hours"
        action={
          <EditButton
            section="Working Hours"
            variant="viewAll"
            label="View All"
            hideIcon
            onEdit={() => onViewAllHours?.()}
          />
        }
      >
        <dl>
          <Row label="Locations">
            <ul className="space-y-2">
              {data.locations.map((l) => (
                <li key={l.name} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                  <span className="min-w-0 truncate">
                    {l.name} <span className="font-normal text-body">({l.type})</span>
                  </span>
                </li>
              ))}
            </ul>
          </Row>
          <Row label="Working Days" icon={CalendarDays}>
            {data.workingDays}
          </Row>
          <Row label="Appointment Duration" icon={Clock}>
            {data.appointmentDuration}
          </Row>
        </dl>
      </Card>
    </div>
  </div>
);

export default PractitionerOverview;