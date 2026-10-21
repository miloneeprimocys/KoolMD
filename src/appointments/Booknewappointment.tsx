"use client";

import React, { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  CalendarDays,
  Clock,
  FileText,
  MoreHorizontal,
  Phone,
  Settings,
  User,
  Video,
  type LucideIcon,
} from "lucide-react";
import { FaArrowLeft } from "react-icons/fa6";
import SignupField from "@/components/SignupField";
import SignupDropdown, { type DropdownOption } from "@/components/SignupDropdown";
import DatePicker from "@/components/Datepicker";
import AddButton from "@/components/Addbutton";
import ImportButton from "@/components/ImportButton";
import SuccessToast from "@/components/SuccessToast";
import ErrorToast from "@/components/ErrorToast";
import RadioCheckButtonh from "@/components/RadioCheckButtonh";
import { ModalTextarea } from "@/components/Modalshell";

/* ---------------------------------------------------------------- */
/*  Static data                                                      */
/* ---------------------------------------------------------------- */
const PATIENTS: DropdownOption[] = [
  { value: "PT-1001", label: "John Smith • PT-1001 • +1 555 123 4567" },
  { value: "PT-1002", label: "Maria Lopez • PT-1002 • +1 555 234 5678" },
  { value: "PT-1003", label: "Priya Shah • PT-1003 • +1 555 345 6789" },
  { value: "PT-1004", label: "Liam Carter • PT-1004 • +1 555 456 7890" },
  { value: "PT-1005", label: "Olivia Bennett • PT-1005 • +1 555 567 8901" },
];

const PROVIDERS = [
  { value: "emily", name: "Dr. Emily Carter", specialty: "Family Medicine" },
  { value: "sarah", name: "Dr. Sarah Wilson", specialty: "Internal Medicine" },
  { value: "michael", name: "Dr. Michael Chen", specialty: "Cardiology" },
  { value: "james", name: "Dr. James Miller", specialty: "Pediatrics" },
];
const PROVIDER_OPTIONS: DropdownOption[] = PROVIDERS.map((p) => ({
  value: p.value,
  label: `${p.name} • ${p.specialty}`,
}));

const TYPES: { value: string; label: string; icon: LucideIcon }[] = [
  { value: "in-person", label: "In-person", icon: User },
  { value: "video", label: "Video Visit", icon: Video },
  { value: "phone", label: "Phone Call", icon: Phone },
  { value: "other", label: "Other", icon: MoreHorizontal },
];

/** 8:00 AM – 6:00 PM in 15-minute steps. */
const TIME_OPTIONS: DropdownOption[] = Array.from({ length: 41 }, (_, i) => {
  const mins = 8 * 60 + i * 15;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  const label = `${String(h % 12 === 0 ? 12 : h % 12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${
    h < 12 ? "AM" : "PM"
  }`;
  return { value: label, label };
});

const DURATIONS: DropdownOption[] = [
  { value: "15", label: "15 minutes" },
  { value: "30", label: "30 minutes" },
  { value: "45", label: "45 minutes" },
  { value: "60", label: "60 minutes" },
  { value: "90", label: "90 minutes" },
];

const STATUSES: DropdownOption[] = ["Confirmed", "Scheduled", "Pending"].map((v) => ({ value: v, label: v }));
const STATUS_DOT: Record<string, string> = {
  Confirmed: "bg-success",
  Scheduled: "bg-primary",
  Pending: "bg-warning",
};

const LOCATIONS: DropdownOption[] = [
  "Main Clinic - New York",
  "Downtown Clinic - New York",
  "Virtual / Telemedicine",
].map((v) => ({ value: v, label: v }));

const initials = (name: string) =>
  name
    .replace(/^Dr\.?\s+/i, "")
    .split(" ")
    .map((n) => n[0]?.toUpperCase())
    .slice(0, 2)
    .join("");

const todayISO = () => new Date().toISOString().slice(0, 10);

/* ---------------------------------------------------------------- */
/*  Small pieces                                                     */
/* ---------------------------------------------------------------- */
const Req = () => <span className="text-danger"> *</span>;

const SectionTitle = ({ icon: Icon, children }: { icon: LucideIcon; children: React.ReactNode }) => (
  <h3 className="mb-4 flex items-center gap-2.5 text-base font-semibold text-heading">
    <Icon className="h-[18px] w-[18px] text-primary" />
    {children}
  </h3>
);

const labelCls = "mb-2 block text-sm font-medium text-label";

type Errors = Record<string, string>;

/* ---------------------------------------------------------------- */
/*  Page                                                             */
/* ---------------------------------------------------------------- */
type Props = {
  /** Back / Cancel. When omitted the browser history is used (route mode). */
  onBack?: () => void;
};

const BookNewAppointment = ({ onBack }: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const isEditMode = pathname === "/edit-appointment";
  const goBack = () => (onBack ? onBack() : router.back());

  /* Patient */
  const [patientMode, setPatientMode] = useState<"existing" | "new">("existing");
  const [patient, setPatient] = useState("");
  const [newPatient, setNewPatient] = useState({ first: "", last: "", phone: "", email: "" });

  /* Appointment details */
  const [provider, setProvider] = useState("emily");
  const [type, setType] = useState("in-person");
  const [date, setDate] = useState(todayISO);
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState("30");

  /* Reason + options */
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("Confirmed");
  const [location, setLocation] = useState("Main Clinic - New York");
  const [notify, setNotify] = useState(true);

  const [errors, setErrors] = useState<Errors>({});
  const [toast, setToast] = useState<{ type: "success" | "error" | null; title: string; message: string }>({
    type: null,
    title: "",
    message: "",
  });

  const clear = (key: string) => setErrors((prev) => (prev[key] ? { ...prev, [key]: "" } : prev));

  const selectedProvider = PROVIDERS.find((p) => p.value === provider);

  /* ---------- Submit ---------- */
  const submit = () => {
    const e: Errors = {};

    if (patientMode === "existing") {
      if (!patient) e.patient = "Select a patient.";
    } else {
      if (!newPatient.first.trim()) e.firstName = "First name is required.";
      if (!newPatient.last.trim()) e.lastName = "Last name is required.";
      if (!newPatient.phone.trim()) e.phone = "Phone number is required.";
    }
    if (!provider) e.provider = "Select a provider.";
    if (!date) e.date = "Select a date.";
    if (!time) e.time = "Select a time.";
    if (!duration) e.duration = "Select a duration.";
    if (!reason.trim()) e.reason = "Reason for visit is required.";
    if (!location) e.location = "Select a location.";

    setErrors(e);
    const keys = Object.keys(e);
    if (keys.length) {
      setToast({
        type: "error",
        title: "Validation Incomplete",
        message: "Please complete all required fields before creating the appointment.",
      });
      const field = { patient: "patient", firstName: "firstName", lastName: "lastName", phone: "phone", provider: "provider", date: "appointmentDate", time: "time", duration: "duration", reason: "reason", location: "location" }[keys[0]] ?? keys[0];
      const el = document.getElementById(field);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      el?.focus?.();
      return;
    }

    // TODO: call your API here
    console.log("Appointment created:", {
      patient: patientMode === "existing" ? patient : newPatient,
      provider,
      type,
      date,
      time,
      duration: Number(duration),
      reason: reason.trim(),
      notes: notes.trim() || undefined,
      status,
      location,
      sendConfirmation: notify,
    });
    setToast({
      type: "success",
      title: "Appointment Created",
      message: `${selectedProvider?.name ?? "Provider"} • ${date} at ${time} has been scheduled.`,
    });
  };

  return (
    <div className="mx-auto min-w-0 w-full max-w-[1600px] space-y-4 sm:space-y-5">
      <SuccessToast
        isOpen={toast.type === "success"}
        onClose={() => setToast((t) => ({ ...t, type: null }))}
        title={toast.title}
        message={toast.message}
      />
      <ErrorToast
        isOpen={toast.type === "error"}
        onClose={() => setToast((t) => ({ ...t, type: null }))}
        title={toast.title}
        message={toast.message}
      />

      {/* Title + back action */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-heading sm:text-xl 2xl:text-2xl">
            {isEditMode ? "Edit Appointment" : "New Appointment"}
          </h2>
          <p className="mt-0.5 text-sm text-body">
            Schedule a new patient appointment for in-person or video consultation.
          </p>
        </div>
        <ImportButton
          text="Back"
          icon={<FaArrowLeft className="h-3.5 w-3.5" />}
          onClick={goBack}
          className="shrink-0 self-start whitespace-nowrap py-1! "
        />
      </div>

      <form
        noValidate
        onSubmit={(ev) => {
          ev.preventDefault();
          submit();
        }}
        className="min-w-0 rounded-2xl border border-border bg-card p-4 sm:p-6"
      >
        {/* 1. Patient information */}
        <section>
          <SectionTitle icon={User}>1. Patient Information</SectionTitle>

          <div role="radiogroup" aria-label="Patient type" className="grid gap-3 sm:grid-cols-2">
            {(
              [
                ["existing", "Existing Patient"],
                ["new", "New Patient"],
              ] as const
            ).map(([key, label]) => {
              const on = patientMode === key;
              return (
                <label
                  key={key}
                  className={`flex h-12 cursor-pointer items-center gap-3 rounded-xl border px-4 text-sm font-medium transition-colors ${
                    on
                      ? "border-primary bg-primary/10 text-heading"
                      : "border-border bg-card text-body hover:border-primary/40"
                  }`}
                >
                  <RadioCheckButtonh
                    type="radio"
                    name="patientMode"
                    checked={on}
                    onChange={() => {
                      setPatientMode(key);
                      setErrors({});
                    }}
                    className="rounded-full"
                  />
                  {label}
                </label>
              );
            })}
          </div>

          <div className="mt-4">
            {patientMode === "existing" ? (
              <SignupDropdown
                name="patient"
                label={<>Search Patient<Req /></>}
                placeholder="Search by name, phone, email or patient ID..."
                options={PATIENTS}
                value={patient}
                onChange={(v) => {
                  setPatient(v);
                  clear("patient");
                }}
                error={errors.patient || undefined}
            />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                <SignupField
                  name="firstName"
                  label={<>First Name<Req /></>}
                  placeholder="Enter first name"
                  value={newPatient.first}
                  onChange={(e) => {
                    setNewPatient((p) => ({ ...p, first: e.target.value }));
                    clear("firstName");
                  }}
                  error={errors.firstName || undefined}
                />
                <SignupField
                  name="lastName"
                  label={<>Last Name<Req /></>}
                  placeholder="Enter last name"
                  value={newPatient.last}
                  onChange={(e) => {
                    setNewPatient((p) => ({ ...p, last: e.target.value }));
                    clear("lastName");
                  }}
                  error={errors.lastName || undefined}
                />
                <SignupField
                  name="phone"
                  type="tel"
                  label={<>Phone Number<Req /></>}
                  placeholder="Enter phone number"
                  value={newPatient.phone}
                  onChange={(e) => {
                    setNewPatient((p) => ({ ...p, phone: e.target.value }));
                    clear("phone");
                  }}
                  error={errors.phone || undefined}
                />
                <SignupField
                  name="email"
                  type="email"
                  label={<>Email Address<span className="font-normal text-body"> (Optional)</span></>}
                  placeholder="Enter email address"
                  value={newPatient.email}
                  onChange={(e) => setNewPatient((p) => ({ ...p, email: e.target.value }))}
                />
              </div>
            )}
          </div>
        </section>

        <hr className="my-6 border-divider" />

        {/* 2. Appointment details */}
        <section>
          <SectionTitle icon={CalendarDays}>2. Appointment Details</SectionTitle>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <SignupDropdown
              name="provider"
              label={<>Provider<Req /></>}
              placeholder="Select provider"
              options={PROVIDER_OPTIONS}
              value={provider}
              onChange={(v) => {
                setProvider(v);
                clear("provider");
              }}
              triggerClassName="!pl-14"
              icon={
                selectedProvider ? (
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
                    {initials(selectedProvider.name)}
                  </span>
                ) : undefined
              }
              error={errors.provider || undefined}
            />

            {/* Appointment type */}
            <div className="w-full min-w-0 max-w-full sm:col-span-2">
              <p className={labelCls}>
                Appointment Type<Req />
              </p>
              <div className="w-full min-w-0 max-w-full overflow-x-auto overscroll-x-contain rounded-xl custom-scrollbar">
                <div
                  role="radiogroup"
                  aria-label="Appointment type"
                  className="flex h-12 w-max min-w-full overflow-hidden rounded-xl border border-border bg-card sm:w-full"
                >
                  {TYPES.map((t, i) => {
                  const on = type === t.value;
                  return (
                    <button
                      key={t.value}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      onClick={() => setType(t.value)}
                      className={`flex min-w-[108px] flex-1 shrink-0 cursor-pointer items-center justify-center gap-2 px-3 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/30 sm:min-w-0 sm:text-sm ${
                        i > 0 ? "border-l border-border" : ""
                      } ${on ? "bg-primary/10 text-primary" : "text-body hover:bg-primary/5 hover:text-heading"}`}
                    >
                      <t.icon className="h-4 w-4 shrink-0" />
                      <span className="whitespace-nowrap">{t.label}</span>
                    </button>
                  );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <DatePicker
              name="appointmentDate"
              label={<>Date<Req /></>}
              placeholder="Select date"
              value={date}
              onChange={(v) => {
                setDate(v);
                clear("date");
              }}
              minDate={todayISO()}
              error={errors.date || undefined}
            />
            <SignupDropdown
              name="time"
              label={<>Time<Req /></>}
              placeholder="Select time"
              options={TIME_OPTIONS}
              value={time}
              onChange={(v) => {
                setTime(v);
                clear("time");
              }}
              icon={<Clock className="h-4 w-4 text-body" />}
              searchable={false}
              error={errors.time || undefined}
            />
            <SignupDropdown
              name="duration"
              label={<>Duration<Req /></>}
              placeholder="Select duration"
              options={DURATIONS}
              value={duration}
              onChange={(v) => {
                setDuration(v);
                clear("duration");
              }}
              searchable={false}
              error={errors.duration || undefined}
            />
          </div>
        </section>

        <hr className="my-6 border-divider" />

        {/* 3. Reason and details */}
        <section>
          <SectionTitle icon={FileText}>3. Reason and Details</SectionTitle>
          <div className="grid gap-4 md:grid-cols-2">
            <ModalTextarea
              id="reason"
              label={<>Reason for Visit<Req /></>}
              placeholder="e.g. Follow up, Consultation, Lab review..."
              value={reason}
              maxLength={250}
              onChange={(v) => {
                setReason(v);
                clear("reason");
              }}
              error={errors.reason || undefined}
            />
            <ModalTextarea
              id="appointmentNotes"
              label={<>Appointment Notes<span className="font-normal text-body"> (Optional)</span></>}
              placeholder="Add any additional notes..."
              value={notes}
              maxLength={250}
              onChange={setNotes}
            />
          </div>
        </section>

        <hr className="my-6 border-divider" />

        {/* 4. Additional options */}
        <section>
          <SectionTitle icon={Settings}>4. Additional Options</SectionTitle>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <SignupDropdown
              name="status"
              label="Appointment Status"
              placeholder="Select status"
              options={STATUSES}
              value={status}
              onChange={setStatus}
              icon={<span className={`block h-2.5 w-2.5 rounded-full ${STATUS_DOT[status] ?? "bg-body"}`} />}
              searchable={false}
            />
            <SignupDropdown
              name="location"
              label={<>Location<Req /></>}
              placeholder="Select location"
              options={LOCATIONS}
              value={location}
              onChange={(v) => {
                setLocation(v);
                clear("location");
              }}
              searchable={false}
              error={errors.location || undefined}
            />
            <div>
              <p className={labelCls}>Send Notifications</p>
              <label className="flex h-12 cursor-pointer items-center gap-2.5 text-sm text-heading">
                <RadioCheckButtonh
                  type="checkbox"
                  checked={notify}
                  onChange={(ev) => setNotify(ev.target.checked)}
                />
                Send confirmation to patient
              </label>
            </div>
          </div>
        </section>

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-3">
          <ImportButton
            text="Cancel"
            icon={null}
            onClick={goBack}
            className="flex-1 whitespace-nowrap sm:flex-none"
          />
          <AddButton
            text="Create"
            icon={null}
            onClick={submit}
            className="min-w-0 flex-1 whitespace-nowrap sm:flex-none"
          />
        </div>
      </form>
    </div>
  );
};

export default BookNewAppointment;
