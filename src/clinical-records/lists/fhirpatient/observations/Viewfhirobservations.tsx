"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {  ChevronDown, FlaskConical, HeartPulse, Pencil } from "lucide-react";

import Breadcrumb from "@/components/Breadcrumb";
import ImportButton from "@/components/ImportButton";
import Tags from "@/components/Tags";
import { cardCls } from "@/providers/Shared";

import {
  ADD_OBSERVATION_ROUTE,
  OBSERVATIONS,
  OBSERVATION_META,
  VIEW_OBSERVATION_ROUTE,
  VIEW_PATIENT_ROUTE,
} from "./Fhirobservations";
import FhirDetails, { DetailRow, PERFORMER, getObservationView } from "./Fhirdetails";

/* ---------------------------------------------------------------- */
/*  Tabs                                                             */
/* ---------------------------------------------------------------- */
type TabKey = "details" | "code" | "related" | "json";

const TABS: { key: TabKey; label: string }[] = [
  { key: "details", label: "Details" },
  { key: "code", label: "Code & Reference" },
  { key: "related", label: "Related Resources" },
  { key: "json", label: "FHIR JSON" },
];

/** "Blood Pressure" → "Blood pressure" (keeps SpO2, HbA1c, "(Hgb)" as written) */
const sentenceCase = (s: string) =>
  s
    .split(" ")
    .map((w, i) => (i === 0 || /[A-Z].*[A-Z]|\d|[()]/.test(w) ? w : w.toLowerCase()))
    .join(" ");

/* ---------------------------------------------------------------- */
/*  Code & Reference tab                                             */
/* ---------------------------------------------------------------- */
const CodeReference = ({ observationId }: { observationId: string }) => {
  const obs = OBSERVATIONS.find((o) => o.id === observationId) ?? OBSERVATIONS[0];
  const meta = OBSERVATION_META[obs.observation];
  const view = getObservationView(obs);

  return (
    <section className={`${cardCls} min-w-0 sm:!p-6`}>
      <dl className="divide-y divide-divider">
        <DetailRow label="Code System">LOINC (http://loinc.org)</DetailRow>
        <DetailRow label="Code">{meta.loinc}</DetailRow>
        <DetailRow label="Display">{meta.display}</DetailRow>
        <DetailRow label="Category">
          {meta.category} (http://terminology.hl7.org/CodeSystem/observation-category)
        </DetailRow>
        <DetailRow label="Unit">{meta.unit} (UCUM)</DetailRow>
        <DetailRow label="Reference Range">{view.rangeText}</DetailRow>
        <DetailRow label="Subject">Patient/{obs.patientCode}</DetailRow>
        <DetailRow label="Encounter">Encounter/{obs.encounterId}</DetailRow>
        <DetailRow label="Performer">
          Practitioner/{PERFORMER.code} ({PERFORMER.name})
        </DetailRow>
      </dl>
    </section>
  );
};

/* ---------------------------------------------------------------- */
/*  Page                                                             */
/* ---------------------------------------------------------------- */
const ViewFhirObservations = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const observation = OBSERVATIONS.find((o) => o.id === searchParams.get("id")) ?? OBSERVATIONS[0];
  const meta = OBSERVATION_META[observation.observation];

  const requestedTab = searchParams.get("tab");
  const tab: TabKey = TABS.some((t) => t.key === requestedTab) ? (requestedTab as TabKey) : "details";

  const changeTab = (key: TabKey) => {
    router.push(`${VIEW_OBSERVATION_ROUTE}?id=${observation.id}&tab=${key}`, { scroll: false });
  };

  const backToList = () => router.push(`${VIEW_PATIENT_ROUTE}?tab=observations`);

  /* ---------- More actions menu ---------- */
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);


  const MENU: { label: string; danger?: boolean; onClick: () => void }[] = [
    { label: "Copy Observation ID", onClick: () => void navigator.clipboard?.writeText(observation.obsId) },
  
    { label: "Print", onClick: () => window.print() },
    { label: "Delete Observation", danger: true, onClick: () => console.log("delete observation", observation.id) /* TODO: call your API here */ },
  ];

  const TileIcon = meta?.category === "Laboratory" ? FlaskConical : HeartPulse;

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-4 sm:space-y-5">
      <Breadcrumb
        items={[
          { label: "Clinical Records", href: "/fhir-model" },
          { label: "Observation", href: `${VIEW_PATIENT_ROUTE}?tab=observations` },
          { label: "View" },
        ]}
      />
      {/* ---------- Title + actions ---------- */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
        
          <h2 className="text-lg font-semibold text-heading sm:text-xl 2xl:text-2xl">Observation Details</h2>
        </div>

        <div className="flex items-center gap-2">
          <ImportButton
            text="Edit"
            icon={<Pencil className="h-4 w-4" />}
            onClick={() => router.push(`${ADD_OBSERVATION_ROUTE}?id=${observation.id}`)}
            className="whitespace-nowrap"
          />
          <div ref={menuRef} className="relative">
            <ImportButton
              text="More Actions"
              icon={<ChevronDown className="h-4 w-4" />}
              onClick={() => setMenuOpen((o) => !o)}
              className="whitespace-nowrap"
            />
            {menuOpen && (
              <ul
                role="menu"
                className="absolute right-0 top-full z-[60] mt-1.5 w-52 rounded-xl border border-border bg-card p-1 shadow-2xl ring-1 ring-border/60"
              >
                {MENU.map((item) => (
                  <li key={item.label} role="none">
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        item.onClick();
                        setMenuOpen(false);
                      }}
                      className={`w-full cursor-pointer rounded-lg px-3 py-2 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${
                        item.danger ? "text-danger hover:bg-danger/10" : "text-heading hover:bg-primary/10"
                      }`}
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* ---------- Summary ---------- */}
      <div className={`${cardCls} !p-3.5 sm:!p-5`}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary sm:h-14 sm:w-14">
              <TileIcon className="h-6 w-6" />
            </span>
            <div className="min-w-0 space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-semibold text-heading">{observation.observation}</h3>
                <Tags text="Final" tone="success" size="xs" />
              </div>
              <p className="text-xs text-body sm:text-sm">
                {sentenceCase(observation.observation)} measurement (LOINC: {meta?.loinc})
              </p>
            </div>
          </div>
          <div className="shrink-0 sm:text-right">
            <p className="text-xs text-body">Observation ID</p>
            <p className="text-sm font-medium text-heading">{observation.obsId}</p>
          </div>
        </div>
      </div>

    

      {/* ---------- Active tab ---------- */}
      <div role="tabpanel">
        {tab === "details" && <FhirDetails observation={observation} />}
      </div>
    </div>
  );
};

export default ViewFhirObservations;