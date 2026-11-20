"use client";

import React, { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

import AddButton from "@/components/Addbutton";
import EditButton from "@/components/EditButton";
import ImportButton from "@/components/ImportButton";
import { cardCls, type Errors } from "@/providers/Shared";

import type { Provider } from "../FindProvider";
import type { BookingValues } from "../BookAppointment";
import AppointmentSummary, { PaymentCard, TOTAL, money, type PaymentMethod } from "../AppointmentSummary";
import IntakeReasonSymptoms, { initialReason, validateReason, type ReasonValues } from "./IntakeReasonSymptoms";
import IntakeMedicalHistory, { initialHistory, validateHistory, type HistoryValues } from "./IntakeMedicalHistory";
import IntakeMedications, { initialMedications, validateMedications, type MedicationsValues } from "./IntakeMedications";
import IntakeAdditionalInfo, { initialAdditional, validateAdditional, type AdditionalValues } from "./IntakeAdditionalInfo";
import Tabs from "@/components/Tabs";

/* ---------------------------------------------------------------- */
/*  Tabs                                                             */
/* ---------------------------------------------------------------- */
const TABS = [
  { id: 1, label: "Reason & Symptoms" },
  { id: 2, label: "Medical History" },
  { id: 3, label: "Medications" },
  { id: 4, label: "Additional Info" },
];

const SUBTITLES: Record<number, string> = {
  1: "Provide a few details about your health to help your provider prepare for your appointment.",
  2: "Share your medical history to help your provider better understand your health.",
  3: "Share your current medications to help your provider make informed care decisions.",
  4: "Share a few more details about your lifestyle and health for better, safer care.",
};

const NEXT_LABEL: Record<number, string> = {
  1: "Continue to Medical History",
  2: "Continue to Medications",
  3: "Continue to Additional Info",
  4: "Review & Pay",
};

const joinOrDash = (list: string[]) => (list.length ? list.join(", ") : "None");

/* ---------------------------------------------------------------- */
/*  Step 3: Intake & Payment                                         */
/* ---------------------------------------------------------------- */
const IntakePayment = ({
  provider,
  booking,
  onBack,
  onComplete,
}: {
  provider: Provider;
  booking: BookingValues;
  onBack: () => void;
  /** Called after "Confirm & Pay" (or "Save & Finish Later"). */
  onComplete: (paid: boolean) => void;
}) => {
  const [tab, setTab] = useState(1);
  const [phase, setPhase] = useState<"form" | "payment">("form");
  const [method, setMethod] = useState<PaymentMethod>("card");

  const [reason, setReason] = useState<ReasonValues>(() => initialReason(booking.reason));
  const [history, setHistory] = useState<HistoryValues>(initialHistory);
  const [meds, setMeds] = useState<MedicationsValues>(initialMedications);
  const [additional, setAdditional] = useState<AdditionalValues>(initialAdditional);
  const [errors, setErrors] = useState<Errors>({});

  // The reason picked on the booking step is the source of truth.
  useEffect(() => {
    setReason((prev) => ({ ...prev, reason: booking.reason }));
  }, [booking.reason]);

  const patch = <T,>(setter: React.Dispatch<React.SetStateAction<T>>) => (p: Partial<T>) => {
    setter((prev) => ({ ...prev, ...p }));
    setErrors({});
  };

  const next = () => {
    const errs =
      tab === 1
        ? validateReason(reason)
        : tab === 2
          ? validateHistory(history)
          : tab === 3
            ? validateMedications(meds)
            : validateAdditional(additional);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    if (tab === 4) setPhase("payment");
    else setTab((t) => t + 1);
  };

  const openTab = (id: number) => {
    setErrors({});
    setTab(id);
    setPhase("form");
  };

  const inPayment = phase === "payment";
  const title = "Complete Intake & Payment";
  const subtitle = inPayment
    ? "Review your details and confirm the payment to book your appointment."
    : SUBTITLES[tab];

  const recap: { id: number; title: string; lines: string[] }[] = [
    {
      id: 1,
      title: "Reason & Symptoms",
      lines: [
        `Reason: ${reason.reason || "—"}`,
        `Symptoms: ${joinOrDash(reason.symptoms)}`,
        `Started: ${reason.onset || "—"} · Severity: ${reason.severity || "—"}`,
      ],
    },
    {
      id: 2,
      title: "Medical History",
      lines: [`Conditions: ${joinOrDash(history.conditions)}`, `Major surgeries / hospitalizations: ${history.surgeries === "yes" ? "Yes" : "No"}`],
    },
    {
      id: 3,
      title: "Medications",
      lines:
        meds.takes === "yes" && meds.meds.length
          ? meds.meds.map((m) => `${m.name} ${m.dosage} · ${m.frequency}`)
          : ["Not taking any medications"],
    },
    {
      id: 4,
      title: "Additional Info",
      lines: [
        `Smoking: ${additional.smoke === "yes" ? additional.smokeFreq : "No"} · Alcohol: ${
          additional.alcohol === "yes" ? additional.alcoholFreq : "No"
        }`,
        `Allergies: ${additional.hasAllergies === "yes" ? joinOrDash(additional.allergies) : "None"}`,
        `Family history: ${joinOrDash(additional.family)}`,
      ],
    },
  ];

  return (
    <div className={`space-y-4 sm:space-y-5 ${tab === 3 ? "flex min-h-full flex-1 flex-col" : ""}`}>
      <div>
        <h2 className="text-lg font-semibold text-heading sm:text-xl 2xl:text-2xl">{title}</h2>
        <p className="mt-0.5 text-sm text-body">{subtitle}</p>
      </div>

      <div className={`grid min-w-0 items-start gap-4 sm:gap-5 xl:grid-cols-[minmax(0,1fr)_340px] ${tab === 3 ? "flex-1" : ""}`}>
        {/* ---------- Left: tabs + form / review ---------- */}
        <div className="min-w-0 space-y-4">
          <Tabs ariaLabel="Intake sections"
          >
            {TABS.map((t) => {
              const complete = inPayment || t.id < tab;
              const current = !inPayment && t.id === tab;
              const clickable = complete || current;
              return (
                <button
                  key={t.id}
                  role="tab"
                  type="button"
                  aria-selected={current}
                  disabled={!clickable}
                  onClick={() => openTab(t.id)}
                  className={`-mb-px flex shrink-0 cursor-pointer items-center gap-2 whitespace-nowrap border-b-2 px-3 pb-2.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:cursor-default sm:pb-3 sm:text-sm ${
                    current
                      ? "border-primary text-primary"
                      : clickable
                        ? "border-transparent text-heading hover:text-primary"
                        : "border-transparent text-body"
                  }`}
                >
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-semibold ${
                      complete
                        ? "bg-primary text-on-primary"
                        : current
                          ? "border border-primary text-primary"
                          : "border border-border text-body"
                    }`}
                  >
                    {complete ? <Check className="h-3 w-3" /> : t.id}
                  </span>
                  {t.label}
                </button>
              );
            })}
          </Tabs>

          {inPayment ? (
            <section className={`${cardCls} space-y-4 sm:p-6`}>
              <h3 className="text-base font-semibold text-heading">Review Your Details</h3>
              <ul className="divide-y divide-divider">
                {recap.map((r) => (
                  <li key={r.id} className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-heading">{r.title}</p>
                      {r.lines.map((l) => (
                        <p key={l} className="break-words text-xs text-body">
                          {l}
                        </p>
                      ))}
                    </div>
                    <EditButton section={r.title} onEdit={() => openTab(r.id)} hideIcon />
                  </li>
                ))}
              </ul>
            </section>
          ) : (
            <section className={`${cardCls} sm:p-6`}>
              {tab === 1 && <IntakeReasonSymptoms values={reason} errors={errors} onChange={patch(setReason)} />}
              {tab === 2 && <IntakeMedicalHistory values={history} errors={errors} onChange={patch(setHistory)} />}
              {tab === 3 && <IntakeMedications values={meds} errors={errors} onChange={patch(setMeds)} />}
              {tab === 4 && <IntakeAdditionalInfo values={additional} errors={errors} onChange={patch(setAdditional)} />}
            </section>
          )}

        </div>

        {/* ---------- Right: summary (+ payment) ---------- */}
        <div className="min-w-0 space-y-4">
          <AppointmentSummary provider={provider} booking={booking} mode="intake" />
          {inPayment && (
            <PaymentCard method={method} onMethod={setMethod} />
          )}
        </div>
      </div>

      {!inPayment ? (
        <div className="sticky -bottom-4 z-[200] -mx-4 -mb-4 mt-4 border-t border-border bg-card px-4 py-4 sm:-bottom-6 sm:-mb-6 sm:-mx-6 sm:px-6 sm:py-5">
          <div className="mx-auto flex max-w-[1600px] flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
            {tab > 1 ? (
              <ImportButton text="Previous" icon={<ArrowLeft className="h-4 w-4" />} onClick={() => openTab(tab - 1)} />
            ) : (
              <ImportButton text="Back to Booking" icon={<ArrowLeft className="h-4 w-4" />} onClick={onBack} />
            )}
            <AddButton text={NEXT_LABEL[tab]} icon={<ArrowRight className="h-4 w-4" />} onClick={next} />
          </div>
        </div>
      ) : (
        <div className="sticky -bottom-4 z-[200] -mx-4 -mb-4 mt-4 border-t border-border bg-card px-4 py-4 sm:-bottom-6 sm:-mb-6 sm:-mx-6 sm:px-6 sm:py-5">
          <div className="mx-auto flex max-w-[1600px] flex-col gap-2 sm:flex-row sm:justify-end sm:gap-3">
            <ImportButton
              text="Save & Finish Later"
              icon={null}
              onClick={() => {
                // TODO: save the draft intake + booking to your API
                onComplete(false);
              }}
              className="sm:min-w-48"
            />
            <AddButton
              text={`Confirm & Pay ${money(TOTAL)}`}
              icon={<ArrowRight className="h-4 w-4" />}
              onClick={() => {
                // TODO: create the appointment, save the intake, start the payment with `method`
                onComplete(true);
              }}
              className="whitespace-nowrap sm:min-w-48"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default IntakePayment;