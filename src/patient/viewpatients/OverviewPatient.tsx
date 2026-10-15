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

import Tags from "@/components/Tags";
import AddButton from "@/components/Addbutton";
import ImportButton from "@/components/ImportButton";
import EditButton from "@/components/EditButton";

/* ---------- Static data (replace with API data later) ---------- */
const NOT_PROVIDED = "Not provided";

const CONTACT: { icon: LucideIcon; label: string; value: string }[] = [
  { icon: Phone, label: "Phone Number", value: "+91 1235874691" },
  { icon: Mail, label: "Email Address", value: "milonee.primocys@gmail.com" },
  { icon: MapPin, label: "Address", value: NOT_PROVIDED },
];

const PERSONAL: { icon: LucideIcon; label: string; value: string }[] = [
  { icon: CalendarDays, label: "Date of Birth", value: "Jul 11, 2005 (21 years)" },
  { icon: User, label: "Gender", value: "Female" },
  { icon: Globe, label: "Preferred Language", value: NOT_PROVIDED },
  { icon: Heart, label: "Marital Status", value: NOT_PROVIDED },
];

const ACCOUNT: { icon: LucideIcon; label: string; value: string }[] = [
  { icon: Hash, label: "Patient ID", value: "KMD-0000003" },
  { icon: CalendarDays, label: "Created Date", value: "Oct 6, 2026, 10:30 AM" },
  { icon: Clock, label: "Last Updated", value: "Oct 6, 2026, 10:30 AM" },
  { icon: UserCheck, label: "Assigned Provider", value: "Not assigned" },
];

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

const isMuted = (v: string) => v === NOT_PROVIDED || v === "Not assigned";

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

/* ---------- Component ---------- */
type Props = {
  onEdit?: (section: string) => void;
};

/**
 * Layout:
 *  Row 1 — 3 columns of cards:
 *    1) Contact + Emergency Contact
 *    2) Personal + Insurance
 *    3) Account Status + Recent Appointments
 *  Row 2 — full-width HIPAA Privacy Reminder banner
 */
const OverviewPatient = ({ onEdit }: Props) => (
  <div className="flex flex-col gap-4 sm:gap-5">
    {/* ---- Row 1: 3 columns of cards ---- */}
    <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 2xl:grid-cols-3">
      {/* Column 1 */}
      <div className="flex min-w-0 flex-col gap-4 sm:gap-5">
        <Card
          className="flex-1"
          icon={Phone}
          title="Contact Information"
          action={<EditButton section="Contact Information" onEdit={onEdit} />}
        >
          <ul className="space-y-4">
            {CONTACT.map((c) => (
              <Field key={c.label} {...c} />
            ))}
          </ul>
        </Card>

        <Card
          className="flex-1"
          icon={Users}
          title="Emergency Contact"
          action={<EditButton section="Emergency Contact" onEdit={onEdit} />}
        >
          <EmptyState
            icon={Users}
            title="No emergency contact added"
            description="Add emergency contact information for this patient."
            action={
              <ImportButton text="Add Emergency Contact" icon={<Plus className="h-4 w-4" />} onClick={() => {}} />
            }
          />
        </Card>
      </div>

      {/* Column 2 */}
      <div className="flex min-w-0 flex-col gap-4 sm:gap-5">
        <Card
          className="flex-1"
          icon={User}
          title="Personal Information"
          action={<EditButton section="Personal Information" onEdit={onEdit} />}
        >
          <ul className="grid grid-cols-1 gap-x-4 gap-y-5 sm:grid-cols-2">
            {PERSONAL.map((p) => (
              <Field key={p.label} {...p} />
            ))}
          </ul>
        </Card>

        <Card
          className="flex-1"
          icon={ShieldCheck}
          title="Insurance Information"
          action={<EditButton section="Insurance Information" onEdit={onEdit} />}
        >
          <EmptyState
            icon={ShieldCheck}
            title="No insurance added"
            description="Add insurance details to manage billing and claims."
            action={
              <ImportButton text="Add Insurance Information" icon={<Plus className="h-4 w-4" />} onClick={() => {}} />
            }
          />
        </Card>
      </div>

      {/* Column 3 */}
      <div className="flex min-w-0 flex-col gap-4 sm:gap-5 md:col-span-2 2xl:col-span-1">
        <Card
          className="flex-1"
          icon={UserCheck}
          title="Account Status"
          action={<Tags text="Active" tone="success" />}
        >
          <ul className="space-y-4">
            {ACCOUNT.map((a) => (
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
          action={
            <EditButton
              variant="viewAll"
              section="Recent Appointments"
              onEdit={() => {
                /* TODO: navigate to full appointments list */
              }}
            />
          }
        >
          <EmptyState
            icon={CalendarDays}
            title="No appointments yet"
            description="This patient does not have any appointments scheduled."
            action={<AddButton text="Book Appointment" onClick={() => {}} />}
          />
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

export default OverviewPatient;