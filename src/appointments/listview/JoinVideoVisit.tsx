"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  CalendarDays,
  Info,
  Mic,
  MicOff,
  Settings,
  Video,
  VideoOff,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppHooks";
import { hideModal } from "@/redux/slices/dialogslice";

import AddButton from "@/components/Addbutton";
import ModalShell from "@/components/Modalshell";
import TypeTag from "@/components/TypeTag";

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

const STATUS_DOT: Record<string, string> = {
  Confirmed: "bg-success",
  Scheduled: "bg-primary",
  Pending: "bg-warning",
};
const STATUS_TEXT: Record<string, string> = {
  Confirmed: "text-success",
  Scheduled: "text-primary",
  Pending: "text-warning",
};

const initialsOf = (name: string) =>
  name
    .replace(/^Dr\.?\s+/i, "")
    .split(" ")
    .map((w) => w[0]?.toUpperCase())
    .slice(0, 2)
    .join("");

/* ---------- Small pieces ---------- */
const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-xl border border-border bg-card p-4 ${className}`}>{children}</div>
);

const Avatar = ({ name }: { name: string }) => (
  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
    {initialsOf(name)}
  </span>
);

const ControlButton = ({
  label,
  off = false,
  onClick,
  children,
}: {
  label: string;
  off?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}) => (
  <div className="flex shrink-0 flex-col items-center gap-1.5">
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={off}
      className={`flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full text-white backdrop-blur-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 sm:h-14 sm:w-14 ${
        off ? "bg-danger/90 hover:bg-danger" : "bg-black/55 hover:bg-black/70"
      }`}
    >
      {children}
    </button>
    <span className="whitespace-nowrap text-[10px] font-medium text-label sm:text-xs">{label}</span>
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

  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [mediaError, setMediaError] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);

  /* Start the local camera / mic preview while the modal is open */
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    let active: MediaStream | null = null;

    setMicOn(true);
    setCamOn(true);
    setMediaError("");

    const start = async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) throw new Error("unsupported");
        const media = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (cancelled) {
          media.getTracks().forEach((t) => t.stop());
          return;
        }
        active = media;
        setStream(media);
      } catch {
        if (!cancelled) {
          setMediaError("We couldn't access your camera or microphone. Check your browser permissions.");
        }
      }
    };
    start();

    return () => {
      cancelled = true;
      active?.getTracks().forEach((t) => t.stop());
      setStream(null);
    };
  }, [open]);

  /* Attach the stream to the <video> element */
  useEffect(() => {
    if (videoRef.current) videoRef.current.srcObject = stream;
  }, [stream, open]);

  /* Mic / camera toggles control the tracks */
  useEffect(() => {
    stream?.getVideoTracks().forEach((t) => (t.enabled = camOn));
    stream?.getAudioTracks().forEach((t) => (t.enabled = micOn));
  }, [stream, camOn, micOn]);

  const handleClose = () => {
    dispatch(hideModal("JoinVideoVisit"));
  };

  const handleJoin = () => {
    const values: JoinVideoValues = { camera: camOn, microphone: micOn };

    // TODO: start the video session here (e.g. router.push to your call room)
    console.log("Joining waiting room:", data.id, values);
    onJoin?.(data, values);
    handleClose();
  };

  /* "Oct 17, 2026" → "Saturday, Oct 17, 2026" */
  const parsed = new Date(data.date);
  const weekday = Number.isNaN(parsed.getTime())
    ? ""
    : parsed.toLocaleDateString("en-US", { weekday: "long" });
  const dateLabel = weekday ? `${weekday}, ${data.date}` : data.date;
  const timeLabel = `${data.time.replace(" - ", " – ")} (${data.duration})`;

  const showPlaceholder = !camOn || !!mediaError;

  return (
    <ModalShell
      open={open}
      onClose={handleClose}
      title="Join Video Visit"
      subtitle="Let's make sure everything is ready for your consultation."
      width={1000}
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        {/* ================= LEFT: preview ================= */}
        <div className="min-w-0 space-y-4">
          <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-primary/15">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`h-full w-full -scale-x-100 object-cover ${showPlaceholder ? "invisible" : ""}`}
            />

            {showPlaceholder && (
              <div className="absolute mb-10 inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center text-label">
                <VideoOff className="h-10 w-10 -translate-y-4 sm:translate-y-0" />
                <p className="hidden max-w-[320px] text-sm sm:block">
                  {mediaError || "Your camera is off. Turn it on to preview yourself."}
                </p>
              </div>
            )}

            {/* Controls */}
            <div className="absolute inset-x-0 bottom-3 flex items-start justify-center gap-3 px-2 sm:bottom-5 sm:gap-6 sm:px-4">
              <ControlButton label={micOn ? "Mic On" : "Mic Off"} off={!micOn} onClick={() => setMicOn((v) => !v)}>
                {micOn ? <Mic className="h-5 w-5 sm:h-6 sm:w-6" /> : <MicOff className="h-5 w-5 sm:h-6 sm:w-6" />}
              </ControlButton>
              <ControlButton label={camOn ? "Camera On" : "Camera Off"} off={!camOn} onClick={() => setCamOn((v) => !v)}>
                {camOn ? <Video className="h-5 w-5 sm:h-6 sm:w-6" /> : <VideoOff className="h-5 w-5 sm:h-6 sm:w-6" />}
              </ControlButton>
              <ControlButton label="Settings">
                <Settings className="h-5 w-5 sm:h-6 sm:w-6" />
              </ControlButton>
            </div>
          </div>

          {/* Info */}
          <div className="flex items-start gap-3 rounded-xl bg-primary/5 px-4 py-3">
            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary">
              <Info className="h-4 w-4" />
            </span>
            <div className="min-w-0 text-xs sm:text-sm">
              <p className="font-semibold text-heading">Make sure your camera and microphone are working properly.</p>
              <p className="text-body">You will be placed in a waiting room until the provider joins.</p>
            </div>
          </div>

          <div className="mx-auto w-full sm:max-w-[420px]">
            <AddButton
              text="Join Waiting Room"
              icon={<Video className="h-4 w-4" />}
              onClick={handleJoin}
              className="w-full justify-center whitespace-nowrap"
            />
          </div>
        </div>

        {/* ================= RIGHT: details ================= */}
        <div className="min-w-0 space-y-4">
          <Card>
            <h4 className="text-sm font-semibold text-heading">Appointment Details</h4>

            <div className="mt-3 flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <CalendarDays className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-heading">{dateLabel}</p>
                <p className="text-xs text-body">{timeLabel}</p>
              </div>
            </div>

            <TypeTag type="Video Visit" className="mt-3 text-base" />

            <p className="mt-2.5 flex items-center gap-2 text-sm text-heading">
              <Video className="h-4 w-4 shrink-0 text-body" />
              {data.reason}
            </p>

            <p className={`mt-2 flex items-center gap-2 text-sm font-medium ${STATUS_TEXT[data.status] ?? "text-body"}`}>
              <span className={`h-2.5 w-2.5 rounded-full ${STATUS_DOT[data.status] ?? "bg-body"}`} />
              {data.status}
            </p>
          </Card>

          <Card className="space-y-4">
            <div>
              <h4 className="mb-3 text-sm font-semibold text-heading">Patient</h4>
              <div className="flex items-center gap-3">
                <Avatar name={data.patientName} />
                <div className="min-w-0">
                  <p className="truncate text-sm sm:text-[15px] font-semibold text-heading mb-0.5">
                    {data.patientName} ({data.patientId})
                  </p>
                  <p className="text-xs sm:text-[13px] text-body">
                    {data.gender} • {data.age} years
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="mb-3 text-sm font-semibold text-heading">Provider</h4>
              <div className="flex items-center gap-3">
                <Avatar name={data.provider} />
                <div className="min-w-0">
                  <p className="truncate text-sm sm:text-[15px] font-semibold text-heading mb-0.5">
                    {data.provider}
                  </p>
                  <p className="text-xs sm:text-[13px] text-body">{data.specialty}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </ModalShell>
  );
};

export default JoinVideoVisit;
