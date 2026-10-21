"use client";

import React from "react";
import { CalendarDays, Clock, FileText, MapPin, Stethoscope, User, Video } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppHooks";
import { hideModal } from "@/redux/slices/dialogslice";
import ModalShell from "@/components/Modalshell";

const PATIENT = {
  name: "Olivia Bennett",
  id: "PID-10234",
  age: 36,
  gender: "Female",
  appointment: "Follow Up",
  provider: "Dr. Sarah Wilson",
  specialty: "Internal Medicine",
  dateTime: "Oct 12, 2026 at 09:00 AM",
  checkIn: "08:55 AM",
  wait: "5 minutes",
  location: "Sunrise Medical Group – Los Angeles, CA",
  visitType: "In-person",
  reason: "Routine follow up and lab results review.",
  notes: "Patient completed intake forms.",
};

const Detail = ({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) => (
  <div className="flex min-w-0 items-start gap-3">
    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
      <Icon className="h-4 w-4" />
    </span>
    <div className="min-w-0">
      <p className="text-xs text-body">{label}</p>
      <p className="break-words text-sm font-semibold text-heading">{value}</p>
    </div>
  </div>
);

const StartConsultation = () => {
  const dispatch = useAppDispatch();
  const open = useAppSelector((state) => state.dialog.StartConsultation);
  const close = () => dispatch(hideModal("StartConsultation"));

  const start = () => {
    console.log("Starting consultation for:", PATIENT.id);
    close();
  };

  return (
    <ModalShell
      open={open}
      onClose={close}
      onSubmit={start}
      title="Start Consultation"
      subtitle="Review the checked-in patient and appointment details before starting."
      submitText="Start Consultation"
      width={640}
    >
      <div className="rounded-xl border border-border bg-primary/5 px-4 py-3">
        <p className="text-sm font-semibold text-heading">{PATIENT.name} ({PATIENT.id})</p>
        <p className="text-xs text-body">{PATIENT.age} years <span className="px-1">•</span> {PATIENT.gender}</p>
      </div>
      <div className="grid grid-cols-1 gap-4 rounded-xl border border-border p-4 sm:grid-cols-2">
        <Detail icon={CalendarDays} label="Appointment" value={`${PATIENT.appointment} · ${PATIENT.dateTime}`} />
        <Detail icon={User} label="Provider" value={`${PATIENT.provider} (${PATIENT.specialty})`} />
        <Detail icon={Clock} label="Check-in / Wait" value={`${PATIENT.checkIn} · ${PATIENT.wait}`} />
        <Detail icon={MapPin} label="Location" value={PATIENT.location} />
        <Detail icon={Stethoscope} label="Visit Type" value={PATIENT.visitType} />
        <Detail icon={FileText} label="Reason for Visit" value={PATIENT.reason} />
        <div className="sm:col-span-2">
          <Detail icon={FileText} label="Notes" value={PATIENT.notes} />
        </div>
      </div>
      <div className="flex items-start gap-2.5 rounded-xl bg-primary/5 px-4 py-3 text-xs text-body sm:text-sm">
        <Video className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <span>Starting marks this patient as in consultation.</span>
      </div>
    </ModalShell>
  );
};

export default StartConsultation;
