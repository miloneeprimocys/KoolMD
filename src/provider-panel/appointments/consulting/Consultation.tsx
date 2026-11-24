"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft, CalendarCheck, Check, ChevronDown, Link2, Mic, MicOff, MoreVertical, Pencil, PhoneOff, Plus, Save, ScreenShare,
  Search, Signature, Stethoscope, Video, VideoOff, X, FlaskConical, type LucideIcon,
} from "lucide-react";

import AddButton from "@/components/Addbutton";
import DeleteDialog from "@/components/Deletedialog";
import ImportButton from "@/components/ImportButton";
import RadioCheckButtonh from "@/components/RadioCheckButtonh";
import SignupDropdown from "@/components/SignupDropdown";
import SuccessToast from "@/components/SuccessToast";
import { cardCls } from "@/providers/Shared";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppHooks";
import { clearConsultationOrderResult, showConsultationOrderModal } from "@/redux/slices/dialogslice";

import type { OrderTabKey, PlacedOrder } from "./AddOrderModal";

/* ---------------------------------------------------------------- */
/*  Static data (replace with API data by ?id=)                      */
/* ---------------------------------------------------------------- */
const PATIENT = { name: "Emily Carter", sex: "Female", age: "32 years", mrn: "KM-002487" };
const APPOINTMENT = { date: "Nov 26, 2026", time: "10:00 AM (30 min)", type: "Follow-up Visit", reason: "Headache Management" };

const ICD10 = [
  "G43.009 – Migraine, unspecified",
  "G43.109 – Migraine with aura",
  "G44.209 – Tension-type headache, unspecified",
  "R51.9 – Headache, unspecified",
  "R11.0 – Nausea",
  "I10 – Essential (primary) hypertension",
];

const FOLLOW_UP = ["1 week", "2 weeks", "4 weeks", "8 weeks", "3 months"].map((v) => ({ value: v, label: v }));

const TEMPLATES: Record<string, { s: string; o: string; a: string; p: string }> = {
  "Headache follow-up": {
    s: "Patient reports headaches since ___. Severity ___/10. Associated symptoms: ___.",
    o: "Vitals reviewed. Neuro exam: ___.",
    a: "Migraine, response to current treatment: ___.",
    p: "Continue current medication. Follow-up in ___.",
  },
  "General follow-up": { s: "", o: "", a: "", p: "" },
};
const TEMPLATE_OPTIONS = Object.keys(TEMPLATES).map((name) => ({ value: name, label: name }));

type ConsultMed = { id: string; name: string; instruction: string };
const INITIAL_MEDS: ConsultMed[] = [{ id: "m1", name: "Sumatriptan 50 mg", instruction: "Take 1 tablet as needed for migraine" }];

const initialsOf = (name: string) => name.split(" ").map((n) => n[0]?.toUpperCase()).slice(0, 2).join("");
const clock = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

/* ---------------------------------------------------------------- */
/*  Small pieces                                                     */
/* ---------------------------------------------------------------- */
const Section = ({ icon: Icon, title, action, children }: { icon: LucideIcon; title: string; action?: React.ReactNode; children: React.ReactNode }) => (
  <section className={`${cardCls} min-w-0 space-y-3 !p-3.5 sm:!p-4`}>
    <div className="flex items-center justify-between gap-2">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-heading">
        <Icon className="h-[18px] w-[18px] text-primary" />
        {title}
      </h3>
      {action}
    </div>
    {children}
  </section>
);

const iconBtnCls =
  "flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-border bg-card text-primary transition-colors hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30";

/** Call buttons: big white-glass circles on phones (WhatsApp style), small dark circles on desktop. */
const ctrlCls = (off: boolean) =>
  `flex h-14 w-14 shrink-0 cursor-pointer items-center justify-center rounded-full backdrop-blur transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 xl:h-11 xl:w-11 ${
    off ? "bg-white text-slate-900" : "bg-white/20 text-white hover:bg-white/30 xl:bg-black/60 xl:hover:bg-black/75"
  }`;

/* ---------------------------------------------------------------- */
/*  Page                                                             */
/* ---------------------------------------------------------------- */
const Consultation = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const orderResult = useAppSelector((state) => state.dialog.consultationOrderResult);
  const searchParams = useSearchParams();
  const appointmentId = searchParams.get("id") ?? "";
  const requestedFrom = searchParams.get("from");
  const backTab = requestedFrom === "upcoming" || requestedFrom === "past" ? requestedFrom : "today";
  const backHref = `/provider/appointments/view?id=${encodeURIComponent(appointmentId)}&from=${backTab}`;

  /* ----- call ----- */
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const callDragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    startLeft: number;
    startTop: number;
    moved: boolean;
  } | null>(null);
  const suppressCallClickRef = useRef(false);
  const [camOn, setCamOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [seconds, setSeconds] = useState(0);
  /** Phones/tablets only: false = full-screen call, true = small floating tile over the page. */
  const [minimized, setMinimized] = useState(false);
  const [smallScreen, setSmallScreen] = useState(false);
  const [callPosition, setCallPosition] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 1279px)");
    const update = () => setSmallScreen(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  const startCallDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!minimized || !smallScreen || event.button !== 0) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    callDragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startLeft: bounds.left,
      startTop: bounds.top,
      moved: false,
    };
    setCallPosition({ x: bounds.left, y: bounds.top });
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const moveCallTile = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = callDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const deltaX = event.clientX - drag.startX;
    const deltaY = event.clientY - drag.startY;
    if (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4) drag.moved = true;
    if (!drag.moved) return;

    const tile = event.currentTarget.getBoundingClientRect();
    const x = Math.min(Math.max(0, drag.startLeft + deltaX), window.innerWidth - tile.width);
    const y = Math.min(Math.max(0, drag.startTop + deltaY), window.innerHeight - tile.height);
    setCallPosition({ x, y });
  };

  const finishCallDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = callDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    suppressCallClickRef.current = drag.moved;
    if (drag.moved && smallScreen) {
      const bounds = event.currentTarget.getBoundingClientRect();
      const margin = 16;
      const left = margin;
      const right = Math.max(margin, window.innerWidth - bounds.width - margin);
      const top = margin;
      const bottom = Math.max(margin, window.innerHeight - bounds.height - margin);
      const corners = [
        { x: left, y: top },
        { x: right, y: top },
        { x: left, y: bottom },
        { x: right, y: bottom },
      ];
      const nearest = corners.reduce((closest, corner) => {
        const distance = (corner.x - bounds.left) ** 2 + (corner.y - bounds.top) ** 2;
        const closestDistance = (closest.x - bounds.left) ** 2 + (closest.y - bounds.top) ** 2;
        return distance < closestDistance ? corner : closest;
      });
      setCallPosition(nearest);
    }
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    callDragRef.current = null;
  };

  useEffect(() => {
    let cancelled = false;
    navigator.mediaDevices
      ?.getUserMedia({ video: true, audio: true })
      .then((s) => {
        if (cancelled) return s.getTracks().forEach((t) => t.stop());
        streamRef.current = s;
        if (videoRef.current) videoRef.current.srcObject = s;
      })
      .catch(() => {});
    const timer = setInterval(() => setSeconds((v) => v + 1), 1000);
    return () => {
      cancelled = true;
      clearInterval(timer);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  // Full-screen call on small screens: stop the page behind it from scrolling.
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const apply = () => { document.body.style.overflow = mq.matches && !minimized ? "hidden" : ""; };
    apply();
    mq.addEventListener("change", apply);
    return () => {
      mq.removeEventListener("change", apply);
      document.body.style.overflow = "";
    };
  }, [minimized]);

  const toggleCam = () => { const n = !camOn; streamRef.current?.getVideoTracks().forEach((t) => (t.enabled = n)); setCamOn(n); };
  const toggleMic = () => { const n = !micOn; streamRef.current?.getAudioTracks().forEach((t) => (t.enabled = n)); setMicOn(n); };

  /* ----- note ----- */
  const [noteTab, setNoteTab] = useState<"soap" | "previous">("soap");
  const [templateChoice, setTemplateChoice] = useState("");
  const [autoSave, setAutoSave] = useState(true); // TODO: debounce-save the note to your API when true
  const [soap, setSoap] = useState({ s: "", o: "", a: "", p: "" });

  /* ----- clinical ----- */
  const [diagnoses, setDiagnoses] = useState<string[]>([ICD10[0]]);
  const [dxSearch, setDxSearch] = useState("");
  const [orders, setOrders] = useState<PlacedOrder[]>([]);
  const [meds, setMeds] = useState<ConsultMed[]>(INITIAL_MEDS);
  const [followIn, setFollowIn] = useState("4 weeks");
  const [followNotes, setFollowNotes] = useState("");

  const openOrders = (tab: OrderTabKey) => dispatch(showConsultationOrderModal(tab));

  useEffect(() => {
    if (!orderResult) return;
    if (orderResult.orders?.length) setOrders((current) => [...current, ...orderResult.orders!]);
    if (orderResult.medication) {
      const medication = orderResult.medication;
      setMeds((current) => [...current, {
        id: medication.id,
        name: `${medication.name} ${medication.dosage}`,
        instruction: medication.notes || medication.frequency,
      }]);
    }
    dispatch(clearConsultationOrderResult());
  }, [dispatch, orderResult]);

  const [endOpen, setEndOpen] = useState(false);
  const [toast, setToast] = useState<{ title: string; message: string } | null>(null);

  const dxMatches = useMemo(() => {
    const q = dxSearch.trim().toLowerCase();
    return q ? ICD10.filter((d) => d.toLowerCase().includes(q) && !diagnoses.includes(d)) : [];
  }, [dxSearch, diagnoses]);

  const applyTemplate = (name: string) => { if (TEMPLATES[name]) setSoap(TEMPLATES[name]); };

  const save = (title: string, message: string) => setToast({ title, message }); // TODO: call your API
  const complete = () => {
    save("Encounter completed", "The encounter has been saved.");
    setTimeout(() => router.push(backHref), 1200);
  };
  const endCall = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    setEndOpen(false);
    router.push(backHref);
  };

  const hasType = (t: PlacedOrder["type"]) => orders.some((o) => o.type === t);

  /* One call box, three looks:
     phone expanded  -> full-screen overlay
     phone minimized -> small floating tile (tap to return)
     desktop (lg+)   -> normal 16:9 card in the page flow */
  const callBox = [
    "z-[200] overflow-hidden bg-slate-900 text-white",
    minimized
      ? "fixed bottom-4 right-4 h-40 w-28 rounded-2xl border border-white/30 shadow-2xl"
      : "fixed inset-0",
    "xl:relative xl:inset-auto xl:bottom-auto xl:right-auto xl:z-0 xl:aspect-video xl:h-auto xl:w-full xl:rounded-xl xl:border-0 xl:bg-[#eef5ff] xl:text-heading xl:shadow-none dark:xl:bg-[#0c1a5a]",
  ].join(" ");

  return (
    <div className={`mx-auto w-full min-w-0 max-w-[1600px] space-y-4 sm:space-y-5 ${minimized ? "" : ""}`}>
      <SuccessToast isOpen={!!toast} onClose={() => setToast(null)} title={toast?.title ?? ""} message={toast?.message ?? ""} />

      <button type="button" onClick={() => router.push(backHref)} className="flex cursor-pointer items-center gap-1.5 text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30">
        <ArrowLeft className="h-4 w-4" />
        Back to Appointment Details
      </button>

      {/* Header */}
      <div className={`${cardCls} !p-3.5 sm:!p-4`}>
        <div className="flex flex-col gap-4 2xl:flex-row 2xl:items-center 2xl:justify-between">
          <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-base font-semibold text-primary">{initialsOf(PATIENT.name)}</span>
              <div className="min-w-0">
                <h2 className="truncate text-base font-semibold text-heading sm:text-lg">{PATIENT.name}</h2>
                <p className="text-xs text-body sm:text-sm">{PATIENT.age} • {PATIENT.sex} • MRN: {PATIENT.mrn}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 border-t border-divider pt-3 sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0">
              <CalendarCheck className="h-5 w-5 shrink-0 text-primary" />
              <div><p className="text-sm font-semibold text-heading">{APPOINTMENT.date}</p><p className="text-xs text-body sm:text-sm">{APPOINTMENT.time}</p></div>
            </div>
            <div className="flex items-center gap-3 border-t border-divider pt-3 sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0">
              <Video className="h-5 w-5 shrink-0 text-primary" />
              <div><p className="text-sm font-semibold text-heading">{APPOINTMENT.type}</p><p className="text-xs text-body sm:text-sm">{APPOINTMENT.reason}</p></div>
            </div>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-2">
            {/* Round call buttons only on desktop; on phones they live inside the call screen */}
            <button type="button" aria-label={micOn ? "Mute microphone" : "Unmute microphone"} onClick={toggleMic} className={`${iconBtnCls} max-xl:hidden`}>{micOn ? <Mic className="h-[18px] w-[18px]" /> : <MicOff className="h-[18px] w-[18px]" />}</button>
            <button type="button" aria-label={camOn ? "Turn camera off" : "Turn camera on"} onClick={toggleCam} className={`${iconBtnCls} max-xl:hidden`}>{camOn ? <Video className="h-[18px] w-[18px]" /> : <VideoOff className="h-[18px] w-[18px]" />}</button>
            <button type="button" aria-label="Share screen" className={`${iconBtnCls} max-xl:hidden`}><ScreenShare className="h-[18px] w-[18px]" /></button>
            <button type="button" aria-label="More options" className={`${iconBtnCls} max-xl:hidden`}><MoreVertical className="h-[18px] w-[18px]" /></button>
            <button type="button" onClick={() => setEndOpen(true)} className="flex w-full cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-danger/40 px-4 py-2 text-sm font-medium text-danger transition-colors hover:bg-danger/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger/30 xl:w-auto">
              <PhoneOff className="h-4 w-4" />
              End Consultation
            </button>
          </div>
        </div>
      </div>

      <div className="grid min-w-0 gap-4 sm:gap-5 2xl:grid-cols-[minmax(0,1fr)_380px]">
        {/* ---------- Left: video + note ---------- */}
        <div className="min-w-0 space-y-4 sm:space-y-5">
          {/* On phones the card box disappears (contents) and only the fixed call box is left */}
          <section className={`${cardCls} !p-2 sm:!p-3 max-xl:contents`}>
            <div
              className={callBox}
              onPointerDown={startCallDrag}
              onPointerMove={moveCallTile}
              onPointerUp={finishCallDrag}
              onPointerCancel={finishCallDrag}
              style={minimized && smallScreen ? {
                ...(callPosition ? {
                  left: `${callPosition.x}px`,
                  top: `${callPosition.y}px`,
                  right: "auto",
                  bottom: "auto",
                } : {}),
                touchAction: "none",
              } : undefined}
            >
              {/* TODO: attach the patient's remote stream here */}
              <div className="flex h-full w-full flex-col items-center justify-center gap-3">
                <span className={`flex items-center justify-center rounded-full bg-white/15 font-semibold text-white xl:h-20 xl:w-20 xl:bg-primary/10 xl:text-2xl xl:text-primary ${minimized ? "h-12 w-12 text-base" : "h-28 w-28 text-4xl"}`}>
                  {initialsOf(PATIENT.name)}
                </span>
                {minimized && <p className="text-xs font-medium xl:hidden">{clock(seconds)}</p>}
                <p className={`text-sm ${minimized ? "max-xl:hidden" : ""}`}>Connected with {PATIENT.name}</p>
              </div>

              {/* Phone: top bar with minimize + name + timer */}
              <div className={`absolute inset-x-0 top-0 z-10 items-center gap-3 bg-gradient-to-b from-black/70 to-transparent p-3 pt-[calc(0.75rem+env(safe-area-inset-top))] xl:hidden ${minimized ? "hidden" : "flex"}`}>
                <button type="button" aria-label="Minimize call" onClick={() => setMinimized(true)} className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white/20 text-white backdrop-blur focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70">
                  <ChevronDown className="h-5 w-5" />
                </button>
                <div className="min-w-0">
                  <p className="truncate text-base font-semibold text-white">{PATIENT.name}</p>
                  <p className="flex items-center gap-1.5 text-xs text-white/80"><span className="h-2 w-2 rounded-full bg-success" />Live • {clock(seconds)}</p>
                </div>
              </div>

              {/* Desktop: badges */}
              <span className="absolute left-3 top-3 hidden items-center gap-2 rounded-lg bg-black/55 px-3 py-1.5 text-xs font-medium text-white xl:flex">
                <span className="h-2 w-2 rounded-full bg-success" />Live • {clock(seconds)}
              </span>
              <span className="absolute bottom-3 left-3 hidden rounded-lg bg-black/55 px-3 py-1.5 text-xs font-medium text-white xl:block">Patient</span>

              {/* Your camera: portrait tile top-right on phones (like WhatsApp), 16:9 on desktop */}
              <div className={`absolute z-10 overflow-hidden bg-black shadow-lg xl:right-3 xl:top-3 xl:block xl:aspect-video xl:h-auto xl:w-44 xl:rounded-xl xl:border-2 xl:border-white/70 ${minimized ? "hidden" : "right-3 top-[calc(4.75rem+env(safe-area-inset-top))] h-36 w-24 rounded-2xl border border-white/40"}`}>
                <video ref={videoRef} autoPlay muted playsInline className={`h-full w-full -scale-x-100 object-cover ${camOn ? "" : "invisible"}`} />
                {!camOn && <div className="absolute inset-0 flex items-center justify-center text-white"><VideoOff className="h-5 w-5" /></div>}
                <span className="absolute bottom-1 left-1 hidden rounded-md bg-black/55 px-2 py-0.5 text-[11px] text-white xl:block">You</span>
              </div>

              {/* Controls: big bar at the bottom of the screen on phones, small row on desktop */}
              <div className={`absolute inset-x-0 bottom-0 z-10 items-center justify-center gap-4 bg-gradient-to-t from-black/70 to-transparent p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] xl:bottom-3 xl:gap-3 xl:bg-none xl:p-0 ${minimized ? "hidden xl:flex" : "flex"}`}>
                <button type="button" aria-label={micOn ? "Mute microphone" : "Unmute microphone"} aria-pressed={!micOn} onClick={toggleMic} className={ctrlCls(!micOn)}>{micOn ? <Mic className="h-6 w-6 xl:h-[18px] xl:w-[18px]" /> : <MicOff className="h-6 w-6 xl:h-[18px] xl:w-[18px]" />}</button>
                <button type="button" aria-label={camOn ? "Turn camera off" : "Turn camera on"} aria-pressed={!camOn} onClick={toggleCam} className={ctrlCls(!camOn)}>{camOn ? <Video className="h-6 w-6 xl:h-[18px] xl:w-[18px]" /> : <VideoOff className="h-6 w-6 xl:h-[18px] xl:w-[18px]" />}</button>
                <button type="button" aria-label="Share screen" className={`${ctrlCls(false)} max-xl:hidden`}><ScreenShare className="h-[18px] w-[18px]" /></button>
                <button type="button" aria-label="End consultation" onClick={() => setEndOpen(true)} className="flex h-14 w-14 shrink-0 cursor-pointer items-center justify-center rounded-full bg-danger text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 xl:hidden">
                  <PhoneOff className="h-6 w-6" />
                </button>
              </div>

              {/* Phone, minimized: tap the tile to go back to the full-screen call */}
              {minimized && (
                <button
                  type="button"
                  aria-label="Return to call"
                  onClick={() => {
                    if (suppressCallClickRef.current) {
                      suppressCallClickRef.current = false;
                      return;
                    }
                    setMinimized(false);
                  }}
                  className="absolute inset-0 z-20 cursor-grab active:cursor-grabbing xl:hidden"
                />
              )}
            </div>
          </section>

          <section className={`${cardCls} space-y-4 !p-3.5 sm:!p-4`}>
            <div className="flex min-w-0 items-center gap-3 border-b border-divider">
              <div className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto whitespace-nowrap hide-scrollbar sm:gap-4" role="tablist">
                {([["soap", "SOAP Note"], ["previous", "Previous Notes"]] as const).map(([key, label]) => (
                  <button key={key} type="button" role="tab" aria-selected={noteTab === key} onClick={() => setNoteTab(key)} className={`-mb-px shrink-0 cursor-pointer whitespace-nowrap border-b-2 px-2 pb-2.5 text-sm transition-colors focus-visible:outline-none ${noteTab === key ? "border-primary font-semibold text-primary" : "border-transparent text-body hover:text-heading"}`}>
                    {label}
                  </button>
                ))}
                <div className="relative -mb-px w-36 shrink-0 pb-2.5 text-sm text-body">
                  <SignupDropdown
                    name="noteTemplate"
                    options={TEMPLATE_OPTIONS}
                    value={templateChoice}
                    onChange={(value) => {
                      setTemplateChoice(value);
                      applyTemplate(value);
                    }}
                    placeholder="Templates"
                    searchable={false}
                    bordered={false}
                    portalMenu
                    portalMenuZIndex={1000}
                    triggerClassName="!h-8 !rounded-lg !pl-0 !pr-7 !text-body hover:!bg-primary/5"
                  />
                </div>
              </div>
              <label className="flex shrink-0 cursor-pointer items-center gap-2 pb-2.5 text-sm text-heading">
                <RadioCheckButtonh type="checkbox" checked={autoSave} onChange={() => setAutoSave((v) => !v)} className="h-4 w-4 rounded accent-primary" />
                Auto Save
              </label>
            </div>

            {noteTab === "soap" ? (
              <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-4">
                {([["s", "S", "Subjective", "Patient's reported symptoms..."], ["o", "O", "Objective", "Examination findings..."], ["a", "A", "Assessment", "Clinical impression..."], ["p", "P", "Plan", "Treatment plan..."]] as const).map(([key, letter, label, ph]) => (
                  <div key={key} className="min-w-0">
                    <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-heading">
                      <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10 text-xs text-primary">{letter}</span>{label}
                    </p>
                    <textarea value={soap[key]} onChange={(e) => setSoap((p) => ({ ...p, [key]: e.target.value }))} placeholder={ph} className="h-28 w-full resize-none custom-scrollbar rounded-xl border border-border bg-card px-3 py-2 text-sm text-heading outline-none transition-colors placeholder:text-placeholder hover:border-primary/50 focus:border-primary" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-body">No previous notes for this patient yet.</p>
            )}
          </section>
        </div>

        {/* ---------- Right: clinical panels ---------- */}
        <aside className="flex min-w-0 flex-col gap-4 sm:gap-5">
          <Section icon={Stethoscope} title="Diagnosis (ICD-10)">
            <label className="flex h-11 items-center gap-2 rounded-xl border border-border bg-card px-3 transition-colors focus-within:border-primary hover:border-primary/50">
              <Search className="h-4 w-4 shrink-0 text-body" />
              <input value={dxSearch} onChange={(e) => setDxSearch(e.target.value)} placeholder="Search diagnosis..." className="min-w-0 flex-1 bg-transparent text-sm text-heading outline-none placeholder:text-placeholder" />
            </label>
            {dxMatches.length > 0 && (
              <ul className="overflow-hidden rounded-xl border border-border">
                {dxMatches.map((d) => (
                  <li key={d}><button type="button" onClick={() => { setDiagnoses((p) => [...p, d]); setDxSearch(""); }} className="w-full cursor-pointer px-3 py-2 text-left text-sm text-heading hover:bg-primary/5">{d}</button></li>
                ))}
              </ul>
            )}
            <div className="flex flex-wrap gap-2">
              {diagnoses.map((d) => (
                <span key={d} className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-heading">
                  {d}
                  <button type="button" aria-label={`Remove ${d}`} onClick={() => setDiagnoses((p) => p.filter((x) => x !== d))} className="cursor-pointer text-body hover:text-danger"><X className="h-3.5 w-3.5" /></button>
                </span>
              ))}
            </div>
          </Section>

          <Section icon={FlaskConical} title="Orders" action={<ImportButton text="Add Order" icon={<Plus className="h-4 w-4" />} onClick={() => openOrders("lab")} className="whitespace-nowrap" />}>
            <div className="flex items-center gap-5">
              {(["Lab Test", "Imaging"] as const).map((t) => (
                <span key={t} className="flex items-center gap-2 text-sm text-heading">
                  <span className={`flex h-4 w-4 items-center justify-center rounded border ${hasType(t) ? "border-primary bg-primary text-on-primary" : "border-border"}`}>{hasType(t) && <Check className="h-3 w-3" />}</span>
                  {t}
                </span>
              ))}
            </div>
            {orders.length > 0 && (
              <ul className="divide-y divide-divider">
                {orders.map((o, i) => (
                  <li key={`${o.name}-${i}`} className="flex items-center justify-between gap-2 py-2 text-sm">
                    <span className="min-w-0"><span className="block truncate font-medium text-heading">{o.name}</span><span className="block text-xs text-body">{o.type} • {o.priority}</span></span>
                    <button type="button" aria-label={`Remove ${o.name}`} onClick={() => setOrders((p) => p.filter((_, j) => j !== i))} className="cursor-pointer text-body hover:text-danger"><X className="h-4 w-4" /></button>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section icon={Link2} title="Medications" action={<ImportButton text="Add Medication" icon={<Plus className="h-4 w-4" />} onClick={() => openOrders("medications")} className="whitespace-nowrap" />}>
            {meds.length === 0 && <p className="text-sm text-body">No medications added.</p>}
            <ul className="space-y-2">
              {meds.map((m) => (
                <li key={m.id} className="flex items-start justify-between gap-2 rounded-xl bg-primary/5 px-3 py-2.5">
                  <span className="min-w-0"><span className="block text-sm font-semibold text-heading">{m.name}</span><span className="block text-xs text-body">{m.instruction}</span></span>
                  <span className="flex shrink-0 items-center gap-2 text-primary">
                    <button type="button" aria-label={`Edit ${m.name}`} onClick={() => openOrders("medications")} className="cursor-pointer"><Pencil className="h-4 w-4" /></button>
                    <button type="button" aria-label={`Remove ${m.name}`} onClick={() => setMeds((p) => p.filter((x) => x.id !== m.id))} className="cursor-pointer text-heading hover:text-danger"><X className="h-4 w-4" /></button>
                  </span>
                </li>
              ))}
            </ul>
          </Section>

          <Section icon={CalendarCheck} title="Follow-up">
            <div className="flex items-center gap-3">
              <span className="shrink-0 text-sm font-medium text-heading">Follow-up in</span>
              <div className="min-w-0 flex-1">
                <SignupDropdown name="followUp" placeholder="Select" options={FOLLOW_UP} value={followIn} onChange={setFollowIn} searchable={false} />
              </div>
            </div>
            <div>
              <p className="mb-2 text-sm font-medium text-heading">Notes</p>
              <textarea value={followNotes} onChange={(e) => setFollowNotes(e.target.value)} placeholder="Add follow-up instructions..." className="h-24 w-full resize-none custom-scrollbar rounded-xl border border-border bg-card px-3 py-2 text-sm text-heading outline-none transition-colors placeholder:text-placeholder hover:border-primary/50 focus:border-primary" />
            </div>
          </Section>

          <div className="grid grid-cols-2 gap-2">
            <ImportButton text="Save Draft" icon={<Save className="h-4 w-4" />} onClick={() => save("Draft saved", "Your consultation draft has been saved.")} className="w-full justify-center whitespace-nowrap" />
            <ImportButton text="Sign & Save" icon={<Signature className="h-4 w-4" />} onClick={() => save("Note signed", "The consultation note has been signed and saved.")} className="w-full justify-center whitespace-nowrap" />
            <AddButton text="Complete Encounter" icon={<Check className="h-4 w-4" />} onClick={complete} className="col-span-2 w-full justify-center whitespace-nowrap" />
          </div>
        </aside>
      </div>

      <DeleteDialog
        open={endOpen}
        onClose={() => setEndOpen(false)}
        onConfirm={endCall}
        title="End Consultation?"
        description="The video call will end. Unsaved notes will be lost, so save a draft first."
        details={[
          { label: "Patient", value: PATIENT.name },
          { label: "Duration", value: clock(seconds) },
        ]}
        confirmText="End Consultation"
      />
    </div>
  );
};

export default Consultation;
