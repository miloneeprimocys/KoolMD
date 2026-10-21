"use client";

import React, { useState } from "react";
import { CalendarX } from "lucide-react";

import DeleteButton from "@/components/DeleteButton";
import DeleteDialog from "@/components/Deletedialog";

/* ---------- Types + sample data ---------- */
export type AppointmentToCancel = {
  id: string; // patient id + slot, or your real appointment id
  patient: string;
  patientId: string;
  age: number;
  gender: string;
  provider: string;
  specialty: string;
  type: string; // "Video Visit" | "In-person"
  dateTime: string; // e.g. "Oct 17, 2026, 10:00 AM - 10:30 AM"
  reason: string;
};

const SAMPLE: AppointmentToCancel = {
  id: "APT-1008",
  patient: "John Smith",
  patientId: "PT-1008",
  age: 35,
  gender: "Male",
  provider: "Dr. Emily Carter",
  specialty: "Internal Medicine",
  type: "Video Visit",
  dateTime: "Oct 17, 2026, 10:00 AM - 10:30 AM",
  reason: "Follow up consultation",
};

type Props = {
  open: boolean;
  onClose: () => void;
  /** Appointment being cancelled (falls back to the sample so the dialog always renders). */
  appointment?: AppointmentToCancel;
  /**
   * Your cancel call. Return `false` (or throw) to keep the dialog open;
   * anything else closes it. When omitted, a short fake delay is used (static mode).
   */
  onConfirm?: (id: string) => Promise<boolean | void>;
  /** Called after a successful cancel — use it to refresh the list / show a toast. */
  onCancelled?: (id: string) => void;
};

/* ---------- Component ---------- */
const CancelAppointment = ({
  open,
  onClose,
  appointment = SAMPLE,
  onConfirm,
  onCancelled,
}: Props) => {
  const [loading, setLoading] = useState(false);

  const handleCancel = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const ok = onConfirm
        ? await onConfirm(appointment.id)
        : await new Promise<boolean>((resolve) => setTimeout(() => resolve(true), 600));
      if (ok === false) return;
      onCancelled?.(appointment.id);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DeleteDialog
      open={open}
      onClose={onClose}
      onConfirm={handleCancel}
      loading={loading}
      icon={<CalendarX className="h-7 w-7" />}
      confirmButton={
        <DeleteButton
          text="Cancel Appointment"
          onClick={handleCancel}
          loading={loading}
          loadingText="Cancelling…"
          className="sm:w-auto sm:min-w-[170px]"
        />
      }
      title="Cancel Appointment?"
      description="Are you sure you want to cancel this appointment? The time slot will be released and the patient will be notified by email and/or SMS."
      details={[
        { label: "Patient", value: `${appointment.patient} (${appointment.patientId})` },
        { label: "Age / Gender", value: `${appointment.age} years, ${appointment.gender}` },
        { label: "Provider", value: `${appointment.provider} (${appointment.specialty})` },
        { label: "Appointment Type", value: appointment.type },
        { label: "Date & Time", value: appointment.dateTime },
        { label: "Reason for Visit", value: appointment.reason },
      ]}
      cancelText="Keep Appointment"
      confirmText="Cancel Appointment"
      loadingText="Cancelling…"
    />
  );
};

export default CancelAppointment;