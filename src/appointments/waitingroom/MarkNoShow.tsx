"use client";

import React from "react";
import { UserX } from "lucide-react";
import { hideModal } from "@/redux/slices/dialogslice";
import { useAppDispatch } from "@/hooks/useAppHooks";
import DeleteDialog from "@/components/Deletedialog";

const PATIENT = {
  name: "Olivia Bennett",
  id: "PID-10234",
  age: 36,
  gender: "Female",
  appointment: "Follow Up",
  dateTime: "Oct 12, 2026 at 09:00 AM",
  provider: "Dr. Sarah Wilson (Internal Medicine)",
  checkIn: "08:55 AM",
  wait: "5 minutes",
  reason: "Routine follow up and lab results review.",
};

const MarkNoShow = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const dispatch = useAppDispatch();
  const confirm = () => {
    console.log("Marked as no show:", PATIENT.id);
    dispatch(hideModal("MarkNoShow"));
  };

  return (
    <DeleteDialog
      open={open}
      onClose={onClose}
      onConfirm={confirm}
      icon={<UserX className="h-7 w-7" />}
      title="Mark Patient as No Show?"
      description="This will mark the appointment as a no show and remove the patient from the waiting room."
      details={[
        { label: "Patient", value: `${PATIENT.name} (${PATIENT.id})` },
        { label: "Age / Gender", value: `${PATIENT.age} years, ${PATIENT.gender}` },
        { label: "Appointment", value: `${PATIENT.appointment} · ${PATIENT.dateTime}` },
        { label: "Provider", value: PATIENT.provider },
        { label: "Check-in / Wait", value: `${PATIENT.checkIn} · ${PATIENT.wait}` },
        { label: "Reason for Visit", value: PATIENT.reason },
      ]}
      cancelText="Keep in Waiting Room"
      confirmText="Mark as No Show"
    />
  );
};

export default MarkNoShow;
