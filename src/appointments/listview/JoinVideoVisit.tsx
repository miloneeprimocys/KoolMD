"use client";

import React, { useState } from "react";
import { Calendar, Clock, FileText, Info, Mic, Stethoscope, Video } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppHooks";
import { hideModal } from "@/redux/slices/dialogslice";

import ModalShell, { ModalCheckboxGroup } from "@/components/Modalshell";

/* ---------- Types + sample data ---------- */
export type JoinVideoAppointment = {
  id: string;
  patientName: string;
  patientId: string;
  gender: string;
  age: number;
  provider: string;
  specialty: string;
  date: string; // e.g. "Oct 17, 2026"
  time: string; // e.g. "10:00 AM - 10:30 AM"
  duration: string; // e.g. "30 minutes"
  reason: string;
  status: string;
};

export type JoinVideoValues = {
  camera: boolean;
  microphone: boolean;
};

const SAMPLE: JoinVideoAppointment = {
  id: "APT-1008",
  patientName: "John Smith",
  patientId: "PT-1008",
  gender: "Male",
  age: 35,
  provider: "Dr. Emily Carter",
  specialty: "Internal Medicine",
  date: "Oct 17, 2026",
  time: "10:00 AM - 10:30 AM",
  duration: "30 minutes",
  reason: "Follow up consultation",
  status: "Confirmed",
};

const DEVICE_OPTIONS = [
  { value: "camera", label: "Turn on camera" },
  { value: "microphone", label: "Turn on microphone" },
];

/* ---------- Small row ---------- */
const DetailRow = ({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
}) => (
  <div className="flex items-start gap-3">
    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
      <Icon className="h-4 w-4" />
    </span>
    <div className="min-w-0">
      <p className="text-xs text-body">{label}</p>
      <p className="break-words text-sm font-semibold text-heading">{value}</p>
    </div>
  </div>
);

/* ---------- Component ---------- */
const JoinVideoVisit = ({
  appointment = SAMPLE,
  onJoin,
}: {
  appointment?: JoinVideoAppointment | null;
  /** Called when the visit starts. Start your video session here. */
  onJoin?: (appointment: JoinVideoAppointment, devices: JoinVideoValues) => void;
}) => {
  const dispatch = useAppDispatch();
  const open = useAppSelector((s) => s.dialog.JoinVideoVisit);

  const data = appointment ?? SAMPLE;
  const [devices, setDevices] = useState<string[]>(["camera", "microphone"]);

  const handleClose = () => {
    dispatch(hideModal("JoinVideoVisit"));
  };

  const handleJoin = () => {
    const values: JoinVideoValues = {
      camera: devices.includes("camera"),
      microphone: devices.includes("microphone"),
    };

    // TODO: start the video session here (e.g. router.push to your call room)
    console.log("Joining video visit:", data.id, values);
    onJoin?.(data, values);
    handleClose();
  };

  const initials = data.patientName
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("");

  return (
    <ModalShell
      open={open}
      onClose={handleClose}
      onSubmit={handleJoin}
      title="Join Video Visit"
      subtitle="Review the appointment details and check your devices before joining."
      submitText="Join Video Visit"
      width={640}
    >
      {/* Patient summary */}
      <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-primary/5 px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-heading">
              {data.patientName} ({data.patientId})
            </p>
            <p className="truncate text-xs text-body">
              {data.gender} • {data.age} years
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Video className="h-4 w-4" />
          </span>
          <div className="hidden text-left sm:block">
            <p className="text-sm font-semibold text-heading">Video Consultation</p>
            <p className="text-xs text-body">{data.duration.replace("minutes", "min")}</p>
          </div>
        </div>
      </div>

      {/* Appointment details */}
      <div className="grid grid-cols-1 gap-x-4 gap-y-4 rounded-xl border border-border p-4 sm:grid-cols-2">
        <DetailRow icon={Stethoscope} label="Provider" value={`${data.provider} (${data.specialty})`} />
        <DetailRow icon={Calendar} label="Date" value={data.date} />
        <DetailRow icon={Clock} label="Time" value={data.time} />
        <DetailRow icon={FileText} label="Reason for Visit" value={data.reason} />
      </div>

      {/* Device settings */}
      <div className="rounded-xl border border-border p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-heading">
          <Mic className="h-4 w-4 text-primary" />
          Video consultation settings
        </div>
        <ModalCheckboxGroup
          label="Join with"
          value={devices}
          onChange={setDevices}
          options={DEVICE_OPTIONS}
          className="flex flex-wrap gap-x-6 gap-y-2"
        />
      </div>

      {/* Info */}
      <div className="flex items-start gap-2.5 rounded-xl bg-primary/5 px-4 py-3 text-xs text-body sm:text-sm">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <span>
          The patient will see that you have joined. Make sure you are in a quiet, private place with a stable
          internet connection.
        </span>
      </div>
    </ModalShell>
  );
};

export default JoinVideoVisit;