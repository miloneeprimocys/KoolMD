"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Loader2,
  Mic,
  MicOff,
  Paperclip,
  Settings,
  Star,
  Video,
  VideoOff,
  Volume2,
  type LucideIcon,
} from "lucide-react";

import AddButton from "@/components/Addbutton";
import ImportButton from "@/components/ImportButton";
import SignupDropdown, { type DropdownOption } from "@/components/SignupDropdown";
import { cardCls } from "@/providers/Shared";

/* ---------------------------------------------------------------- */
/*  Static data (replace with API / redux selector)                  */
/* ---------------------------------------------------------------- */
const CONSULTATIONS: Record<
  string,
  { doctor: string; specialty: string; rating: string; reviews: number; date: string; time: string; type: string; reason: string }
> = {
  "APT-2001": {
    doctor: "Dr. John Carter", specialty: "Internal Medicine", rating: "4.9", reviews: 320,
    date: "Wed, Oct 14, 2026", time: "10:30 AM – 11:00 AM (30 min)", type: "Video Consultation", reason: "Persistent cough and congestion",
  },
};

const CHECKLIST = [
  "Ensure a stable internet connection",
  "Have your concerns or notes ready",
  "Be in a quiet, well-lit space",
  "Keep any relevant reports or test results handy",
];

const BACK_HREF = "/my-appointments";

const initialsOf = (name: string) =>
  name
    .replace(/^Dr\.\s*/i, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

const toOptions = (devices: MediaDeviceInfo[], fallbackLabel: string, fallbackName: string): DropdownOption[] =>
  devices.length > 0
    ? devices.map((d, i) => ({ value: d.deviceId, label: d.label || `${fallbackName} ${i + 1}` }))
    : [{ value: "default", label: fallbackLabel }];

/* ---------------------------------------------------------------- */
/*  Small pieces                                                     */
/* ---------------------------------------------------------------- */
const InfoRow = ({ Icon, label, value }: { Icon: LucideIcon; label: string; value: string }) => (
  <div className="flex items-start gap-3 border-b border-divider py-3 last:border-0">
    <Icon className="mt-0.5 h-[18px] w-[18px] shrink-0 text-primary" />
    <span className="w-28 shrink-0 text-sm text-body">{label}</span>
    <span className="min-w-0 flex-1 text-sm font-medium text-heading">{value}</span>
  </div>
);

const previewButtonCls =
  "flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-black/60 text-on-primary transition-colors hover:bg-black/75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60";

/* ---------------------------------------------------------------- */
/*  Page                                                             */
/* ---------------------------------------------------------------- */
const JoinConsultation = () => {
  const router = useRouter();
  const id = useSearchParams().get("id") ?? "APT-2001";
  const consultation = CONSULTATIONS[id] ?? CONSULTATIONS["APT-2001"];

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [access, setAccess] = useState<"pending" | "granted" | "denied" | "unsupported">("pending");
  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);

  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [mics, setMics] = useState<MediaDeviceInfo[]>([]);
  const [speakers, setSpeakers] = useState<MediaDeviceInfo[]>([]);
  const [cameraId, setCameraId] = useState("");
  const [micId, setMicId] = useState("");
  const [speakerId, setSpeakerId] = useState("");

  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [joining, setJoining] = useState(false);

  const devicesRef = useRef<HTMLDivElement>(null);

  /* ---------- Camera + microphone ---------- */
  const stopStream = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  const startStream = useCallback(async (nextCameraId?: string, nextMicId?: string) => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setAccess("unsupported");
      return;
    }
    stopStream();
    try {
      const media = await navigator.mediaDevices.getUserMedia({
        video: nextCameraId ? { deviceId: { exact: nextCameraId } } : true,
        audio: nextMicId ? { deviceId: { exact: nextMicId } } : true,
      });
      streamRef.current = media;
      setStream(media);
      setAccess("granted");
      setCameraOn(true);
      setMicOn(true);

      // Device names are only available once permission was granted.
      const devices = await navigator.mediaDevices.enumerateDevices();
      setCameras(devices.filter((d) => d.kind === "videoinput"));
      setMics(devices.filter((d) => d.kind === "audioinput"));
      setSpeakers(devices.filter((d) => d.kind === "audiooutput"));
      setCameraId((prev) => prev || media.getVideoTracks()[0]?.getSettings().deviceId || "");
      setMicId((prev) => prev || media.getAudioTracks()[0]?.getSettings().deviceId || "");
    } catch {
      setStream(null);
      setAccess("denied");
    }
  }, []);

  useEffect(() => {
    startStream();
    return stopStream;
  }, [startStream]);

  useEffect(() => {
    if (videoRef.current) videoRef.current.srcObject = stream;
  }, [stream, cameraOn]);

  const changeCamera = (value: string) => {
    setCameraId(value);
    if (value !== "default") startStream(value, micId || undefined);
  };
  const changeMic = (value: string) => {
    setMicId(value);
    if (value !== "default") startStream(cameraId || undefined, value);
  };

  const toggleCamera = () => {
    const next = !cameraOn;
    stream?.getVideoTracks().forEach((t) => (t.enabled = next));
    setCameraOn(next);
  };
  const toggleMic = () => {
    const next = !micOn;
    stream?.getAudioTracks().forEach((t) => (t.enabled = next));
    setMicOn(next);
  };

  /* ---------- Test audio & video ---------- */
  const runTest = async () => {
    if (testing) return;
    setTesting(true);
    setTestResult(null);

    const cameraWorks = !!stream?.getVideoTracks().some((t) => t.readyState === "live");
    let micHeard = false;

    try {
      const AudioCtx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();

      // A short tone through the speakers.
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      gain.gain.value = 0.08;
      osc.frequency.value = 440;
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.7);

      // Listen to the microphone for a few seconds.
      const micTrack = stream?.getAudioTracks()[0];
      if (micTrack) {
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 512;
        ctx.createMediaStreamSource(new MediaStream([micTrack])).connect(analyser);
        const data = new Uint8Array(analyser.fftSize);
        const end = Date.now() + 3000;
        while (Date.now() < end) {
          await new Promise((r) => setTimeout(r, 100));
          analyser.getByteTimeDomainData(data);
          const peak = data.reduce((max, v) => Math.max(max, Math.abs(v - 128)), 0);
          if (peak > 6) micHeard = true;
        }
      } else {
        await new Promise((r) => setTimeout(r, 1500));
      }
      await ctx.close();
    } catch {
      /* audio APIs not available – the result below reports it */
    }

    setTesting(false);
    if (!cameraWorks) {
      setTestResult({ ok: false, message: "We couldn't access your camera. Check the camera permission in your browser." });
    } else if (!micHeard) {
      setTestResult({ ok: false, message: "Your camera works, but we couldn't hear your microphone. Try speaking or pick another microphone." });
    } else {
      setTestResult({ ok: true, message: "Your camera and microphone are working. You're ready to join." });
    }
  };

  const join = () => {
    if (joining) return;
    setJoining(true);
    // TODO: start / join the video session with the selected devices (keep the stream, or stop it and let the call room open its own).
  };

  const cameraBlocked = access !== "granted";
  const showVideo = access === "granted" && cameraOn;

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-4 sm:space-y-5">
      <button
        type="button"
        onClick={() => router.push(BACK_HREF)}
        className="flex cursor-pointer items-center gap-1.5 text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Appointments
      </button>

      {/* Title */}
      <div className="flex items-start gap-3 sm:gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary sm:h-12 sm:w-12">
          <Video className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-heading sm:text-xl 2xl:text-2xl">Join Consultation</h2>
          <p className="mt-0.5 text-sm text-body">
            Your virtual consultation is ready. Please check your camera, microphone and join at the scheduled time.
          </p>
        </div>
      </div>

      {/* Preview + consultation details */}
      <div className="grid gap-4 sm:gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <section className={`${cardCls} sm:p-4`}>
          <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-card">
            {showVideo ? (
              <video ref={videoRef} autoPlay muted playsInline className="h-full w-full -scale-x-100 object-cover" />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-card px-6 text-center text-heading">
                {access === "pending" ? (
                  <Loader2 className="h-8 w-8 animate-spin" />
                ) : (
                  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <VideoOff className="h-7 w-7" />
                  </span>
                )}
                <p className="text-sm">
                  {access === "pending" && "Starting your camera…"}
                  {access === "denied" && "Camera and microphone access is blocked. Allow access in your browser to see your preview."}
                  {access === "unsupported" && "Your browser doesn't support camera access. Try a recent version of Chrome, Edge, Safari or Firefox."}
                  {access === "granted" && !cameraOn && "Your camera is turned off."}
                </p>
              </div>
            )}

            <span className="absolute left-3 top-3 flex items-center gap-2 rounded-lg bg-black/55 px-3 py-1.5 text-xs font-medium text-on-primary">
              <Video className="h-3.5 w-3.5" />
              Camera Preview
            </span>

            <div className="absolute inset-x-0 bottom-3 flex items-center justify-center gap-3">
              <button
                type="button"
                aria-label={micOn ? "Mute microphone" : "Unmute microphone"}
                aria-pressed={!micOn}
                disabled={cameraBlocked}
                onClick={toggleMic}
                className={`${previewButtonCls} disabled:cursor-not-allowed disabled:opacity-50`}
              >
                {micOn ? <Mic className="h-[18px] w-[18px]" /> : <MicOff className="h-[18px] w-[18px]" />}
              </button>
              <button
                type="button"
                aria-label={cameraOn ? "Turn camera off" : "Turn camera on"}
                aria-pressed={!cameraOn}
                disabled={cameraBlocked}
                onClick={toggleCamera}
                className={`${previewButtonCls} disabled:cursor-not-allowed disabled:opacity-50`}
              >
                {cameraOn ? <Video className="h-[18px] w-[18px]" /> : <VideoOff className="h-[18px] w-[18px]" />}
              </button>
              <button
                type="button"
                aria-label="Audio and video settings"
                onClick={() => devicesRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })}
                className={previewButtonCls}
              >
                <Settings className="h-[18px] w-[18px]" />
              </button>
            </div>
          </div>
        </section>

        <aside className={`${cardCls} sm:p-6`}>
          <h3 className="text-sm font-semibold text-heading">Consultation with</h3>
          <div className="mt-3 flex items-center gap-4">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-lg font-semibold text-primary">
              {initialsOf(consultation.doctor)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-base font-semibold text-heading">{consultation.doctor}</p>
              <p className="text-sm text-body">{consultation.specialty}</p>
              <p className="mt-0.5 flex items-center gap-1 text-xs text-body">
                <Star className="h-3.5 w-3.5 fill-current text-warning" />
                <span className="font-semibold text-heading">{consultation.rating}</span> ({consultation.reviews} reviews)
              </p>
            </div>
          </div>
          <div className="mt-3">
            <InfoRow Icon={Calendar} label="Date" value={consultation.date} />
            <InfoRow Icon={Clock} label="Time" value={consultation.time} />
            <InfoRow Icon={Video} label="Visit Type" value={consultation.type} />
            <InfoRow Icon={Paperclip} label="Reason for Visit" value={consultation.reason} />
          </div>
        </aside>
      </div>

      {/* Devices */}
      <div ref={devicesRef} className="grid gap-4 sm:gap-5 md:grid-cols-3">
        <section className={`${cardCls} space-y-3`}>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-heading">
            <Video className="h-[18px] w-[18px] text-primary" />
            Camera
          </h3>
          <SignupDropdown
            name="camera"
            placeholder="Select camera"
            options={toOptions(cameras, "Default camera", "Camera")}
            value={cameraId || (cameras.length === 0 ? "default" : "")}
            onChange={changeCamera}
            searchable={false}
            disabled={access !== "granted"}
          />
        </section>
        <section className={`${cardCls} space-y-3`}>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-heading">
            <Mic className="h-[18px] w-[18px] text-primary" />
            Microphone
          </h3>
          <SignupDropdown
            name="microphone"
            placeholder="Select microphone"
            options={toOptions(mics, "Default microphone", "Microphone")}
            value={micId || (mics.length === 0 ? "default" : "")}
            onChange={changeMic}
            searchable={false}
            disabled={access !== "granted"}
          />
        </section>
        <section className={`${cardCls} space-y-3`}>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-heading">
            <Volume2 className="h-[18px] w-[18px] text-primary" />
            Speaker
          </h3>
          <SignupDropdown
            name="speaker"
            placeholder="Select speaker"
            options={toOptions(speakers, "System default speakers", "Speaker")}
            value={speakerId || (speakers.length === 0 ? "default" : "")}
            onChange={setSpeakerId}
            searchable={false}
            disabled={access !== "granted"}
          />
        </section>
      </div>

      {testResult && (
        <div
          role="status"
          className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${
            testResult.ok ? "border-success/30 bg-success/10 text-heading" : "border-danger/30 bg-danger/5 text-heading"
          }`}
        >
          <CheckCircle2 className={`mt-0.5 h-4 w-4 shrink-0 ${testResult.ok ? "text-success" : "text-danger"}`} />
          {testResult.message}
        </div>
      )}

      {/* Before you join + actions */}
      <div className="grid items-center gap-4 sm:gap-5 lg:grid-cols-[minmax(0,1fr)_auto]">
        <section className={`${cardCls} bg-primary/5 sm:p-5`}>
          <h3 className="mb-3 text-sm font-semibold text-heading">Before you join:</h3>
          <ul className="grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
            {CHECKLIST.map((item) => (
              <li key={item} className="flex items-start gap-2 text-xs text-heading sm:text-sm">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
          <ImportButton
            text={testing ? "Testing… speak now" : "Test Audio & Video"}
            icon={testing ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            onClick={runTest}
            className="flex-1 whitespace-nowrap sm:flex-none"
          />
          <AddButton
            text={joining ? "Joining…" : "Join Consultation"}
            icon={<Video className="h-4 w-4" />}
            onClick={join}
            disabled={joining}
            className="flex-1 whitespace-nowrap sm:flex-none"
          />
        </div>
      </div>
    </div>
  );
};

export default JoinConsultation;