"use client";

import React, { useState } from "react";

import AddButton from "@/components/Addbutton";
import SignupField from "@/components/SignupField";
import Tags from "@/components/Tags";
import LinkComponent from "@/components/LinkComponent";
import { cardCls } from "@/providers/Shared";
import { OBSERVATION_META, OBS_STATUS_TONE, type ObservationRow } from "./Fhirobservations";

/* ---------------------------------------------------------------- */
/*  Observation view model (shared by Details / JSON / Related)      */
/* ---------------------------------------------------------------- */
export type HistoryEntry = { time: string; title: string; description: string; by: string };

export type ObservationView = {
  effective: string;
  patientLabel: string;
  encounterId: string;
  category: string;
  codeLabel: string;
  valueText: string;
  components: { label: string; value: string }[];
  rangeText: string;
  performer: string;
  source: string;
  notes: string;
  lastUpdated: string;
  history: HistoryEntry[];
};

/** "10:15 AM" → "10:16 AM" */
const addMinute = (time: string) => {
  const m = /^(\d{1,2}):(\d{2}) (AM|PM)$/.exec(time);
  if (!m) return time;
  let h = Number(m[1]) % 12;
  if (m[3] === "PM") h += 12;
  let total = h * 60 + Number(m[2]) + 1;
  total %= 24 * 60;
  const hh = Math.floor(total / 60);
  const mm = String(total % 60).padStart(2, "0");
  return `${String(hh % 12 === 0 ? 12 : hh % 12).padStart(2, "0")}:${mm} ${hh < 12 ? "AM" : "PM"}`;
};

export const PERFORMER = { name: "Dr. Sarah Wilson", code: "PR-001" };

export const getObservationView = (obs: ObservationRow): ObservationView => {
  const meta = OBSERVATION_META[obs.observation];
  const isBp = obs.observation === "Blood Pressure";
  const [systolic, diastolic] = isBp ? obs.value.split("/") : [];
  const updatedTime = addMinute(obs.time);
  const by = PERFORMER.name;

  const source = isBp
    ? "Device (Automated BP Monitor)"
    : meta?.category === "Laboratory"
      ? "Laboratory (LIS)"
      : "Device (Vital signs monitor)";

  const history: HistoryEntry[] = [
    {
      time: `${obs.date}, ${updatedTime}`,
      title: "Updated",
      description: isBp ? `Value updated from 120/78 to ${obs.value} ${meta.unit}` : "Observation reviewed and verified",
      by,
    },
    { time: `${obs.date}, ${obs.time}`, title: "Created", description: "Observation recorded", by },
  ];
  if (source.startsWith("Device")) {
    history.push({
      time: `${obs.date}, ${obs.time}`,
      title: "Device Data",
      description: "Imported from device: Omron HEM-7156",
      by: "System",
    });
  }

  return {
    effective: `${obs.date}, ${obs.time}`,
    patientLabel: `${obs.patient} (${obs.patientCode})`,
    encounterId: obs.encounterId,
    category: meta?.category ?? "—",
    codeLabel: meta ? `${meta.display} (LOINC: ${meta.loinc})` : obs.observation,
    valueText: `${obs.value} ${obs.unit}`.trim(),
    components: isBp
      ? [
          { label: "Systolic", value: `${systolic} ${meta.unit}` },
          { label: "Diastolic", value: `${diastolic} ${meta.unit}` },
        ]
      : [],
    rangeText: meta ? `${meta.range} ${meta.unit}` : "—",
    performer: `${PERFORMER.name} (${PERFORMER.code})`,
    source,
    notes: isBp ? "Patient seated, right arm, adult cuff." : "No additional notes.",
    lastUpdated: `${obs.date}, ${updatedTime} by ${by}`,
    history,
  };
};

/* ---------------------------------------------------------------- */
/*  Small pieces                                                     */
/* ---------------------------------------------------------------- */
export const DetailRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="grid grid-cols-1 gap-0.5 py-2 sm:grid-cols-[160px_minmax(0,1fr)] sm:gap-4">
    <dt className="text-xs text-body sm:text-sm">{label}</dt>
    <dd className="min-w-0 break-words text-sm text-heading">{children}</dd>
  </div>
);

type SideTab = "history" | "comments";

type Comment = { id: number; author: string; time: string; text: string };

const INITIAL_COMMENTS: Comment[] = [
  { id: 1, author: "Dr. Sarah Wilson", time: "Oct 28, 2026, 10:20 AM", text: "Reading is within the target range for this patient." },
  { id: 2, author: "Priya Shah (Nurse)", time: "Oct 28, 2026, 10:12 AM", text: "Patient was seated and relaxed for 5 minutes before the measurement." },
];

/* ---------------------------------------------------------------- */
/*  Details tab                                                      */
/* ---------------------------------------------------------------- */
const FhirDetails = ({ observation }: { observation: ObservationRow }) => {
  const view = getObservationView(observation);
  const [sideTab, setSideTab] = useState<SideTab>("history");
  const [comments, setComments] = useState<Comment[]>(INITIAL_COMMENTS);
  const [draft, setDraft] = useState("");

  const postComment = () => {
    if (!draft.trim()) return;
    // TODO: call your API here
    setComments((prev) => [
      { id: Date.now(), author: PERFORMER.name, time: "Just now", text: draft.trim() },
      ...prev,
    ]);
    setDraft("");
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] xl:items-start">
      {/* ---------- Details ---------- */}
      <section className={`${cardCls} min-w-0 sm:!p-6`}>
        <dl className="divide-y divide-divider">
          <DetailRow label="Status">
            <Tags text="Final" tone="success" size="xs" />
          </DetailRow>
          <DetailRow label="Effective Date & Time">{view.effective}</DetailRow>
          <DetailRow label="Patient">
            <LinkComponent>{view.patientLabel}</LinkComponent>
          </DetailRow>
          <DetailRow label="Encounter">
            <LinkComponent>{view.encounterId}</LinkComponent>
          </DetailRow>
          <DetailRow label="Category">{view.category}</DetailRow>
          <DetailRow label="Code">{view.codeLabel}</DetailRow>
          <DetailRow label="Value">
            <span className="flex flex-wrap items-center gap-2">
              <span className="font-semibold">{view.valueText}</span>
              {observation.status !== "Normal" && (
                <Tags text={observation.status} tone={OBS_STATUS_TONE[observation.status]} size="xs" />
              )}
            </span>
          </DetailRow>
          {view.components.length > 0 && (
            <DetailRow label="Components">
              <ul className="list-disc space-y-1 pl-5">
                {view.components.map((c) => (
                  <li key={c.label}>
                    {c.label}: {c.value}
                  </li>
                ))}
              </ul>
            </DetailRow>
          )}
          <DetailRow label="Reference Range">{view.rangeText}</DetailRow>
          <DetailRow label="Performer">
            <LinkComponent>{view.performer}</LinkComponent>
          </DetailRow>
          <DetailRow label="Source">{view.source}</DetailRow>
          <DetailRow label="Notes">{view.notes}</DetailRow>
          <DetailRow label="Last Updated">{view.lastUpdated}</DetailRow>
        </dl>
      </section>

      {/* ---------- History / comments ---------- */}
      <section className={`${cardCls} min-w-0 sm:!p-6`}>
        <div role="tablist" aria-label="Activity" className="mb-5 flex flex-wrap gap-2">
          {(
            [
              ["history", "History"],
              ["comments", `Comments (${comments.length})`],
            ] as const
          ).map(([key, label]) => {
            const active = sideTab === key;
            return (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setSideTab(key)}
                className={`cursor-pointer rounded-lg border px-4 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${
                  active
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "border-border bg-card text-heading hover:border-primary/40"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {sideTab === "history" ? (
          <ol>
            {view.history.map((h, i) => (
              <li key={`${h.title}-${i}`} className="relative flex gap-4 pb-6 last:pb-0">
                {i !== view.history.length - 1 && (
                  <span className="absolute left-[5px] top-4 h-full w-px bg-primary/40" aria-hidden />
                )}
                <span className="relative z-10 mt-1 h-3 w-3 shrink-0 rounded-full bg-primary" aria-hidden />
                <div className="min-w-0 space-y-0.5">
                  <p className="text-[13px] text-body">{h.time}</p>
                  <p className="text-sm font-semibold text-heading">{h.title}</p>
                  <p className="text-[13px] text-body">{h.description}</p>
                  <p className="text-[13px] text-body">by {h.by}</p>
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <div className="space-y-4">
            <ul className="space-y-3">
              {comments.map((c) => (
                <li key={c.id} className="rounded-xl border border-border bg-primary/[0.03] p-3">
                  <p className="text-sm font-semibold text-heading">{c.author}</p>
                  <p className="text-xs text-body">{c.time}</p>
                  <p className="mt-1.5 text-sm text-heading">{c.text}</p>
                </li>
              ))}
            </ul>
            <SignupField
              name="observationComment"
              placeholder="Add a comment..."
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              maxLength={300}
              multiline
              rows={3}
            />
            <div className="flex justify-end">
              <AddButton text="Post Comment" icon={null} onClick={postComment} />
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default FhirDetails;
