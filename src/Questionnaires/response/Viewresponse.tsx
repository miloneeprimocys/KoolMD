"use client";

import React, { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  FileText,
  Pencil,
  Save,
  ShieldCheck,
  Star,
  Timer,
  Users,
  type LucideIcon,
} from "lucide-react";

import Breadcrumb from "@/components/Breadcrumb";
import StickyColumns from "@/components/StickyColumns";
import AddButton from "@/components/Addbutton";
import ImportButton from "@/components/ImportButton";
import Tags, { type TagTone } from "@/components/Tags";
import SuccessToast from "@/components/SuccessToast";
import ErrorToast from "@/components/ErrorToast";
import {
  ModalCheckboxGroup,
  ModalRadioGroup,
  ModalTextarea,
} from "@/components/Modalshell";

/* ---------------------------------------------------------------- */
/*  Static data (replace with API data later)                        */
/* ---------------------------------------------------------------- */
const TOTAL_RESPONSES = 124;

const RESPONSE = {
  patient: "Milonee Primocys",
  patientId: "KMD-0000003",
  age: "21 years",
  gender: "Female",
  email: "milonee@example.com",
  phone: "+91 98765 43210",
  provider: "Dr. Sarah Johnson",
  specialty: "Family Medicine",
  submittedDate: "Oct 28, 2026",
  submittedTime: "10:24 AM",
  timeTaken: "4 min 32 sec",
};

type Answer =
  | { kind: "single"; options: string[]; selected: string }
  | { kind: "multiple"; options: string[]; selected: string[]; cols: 3 | 4 }
  | { kind: "text"; value: string }
  | { kind: "rating"; value: number; label: string };

type QA = { question: string; answer: Answer };

const ANSWERS: QA[] = [
  { question: "What is your current age?", answer: { kind: "single", options: ["Under 18", "18 – 30", "31 – 45", "46 – 60", "Over 60"], selected: "18 – 30" } },
  {
    question: "Do you have any chronic conditions?",
    answer: {
      kind: "multiple",
      options: ["Hypertension", "Diabetes", "Asthma", "Thyroid", "None of the above"],
      selected: ["Hypertension", "Thyroid"],
      cols: 3,
    },
  },
  {
    question: "Are you currently taking any medications?",
    answer: { kind: "text", value: "Yes, I take thyroid medication (Levothyroxine) daily." },
  },
  { question: "How would you rate your overall health?", answer: { kind: "rating", value: 4, label: "Good" } },
  {
    question: "Do you experience any allergies?",
    answer: {
      kind: "multiple",
      options: ["Dust", "Pollen", "Food", "None of the above"],
      selected: ["Dust", "Pollen"],
      cols: 4,
    },
  },
  { question: "How often do you exercise?", answer: { kind: "single", options: ["Every day", "4 – 6 times per week", "2 – 3 times per week", "Once a week", "Rarely"], selected: "2 – 3 times per week" } },
  { question: "What type of exercise do you usually do?", answer: { kind: "text", value: "Walking and yoga" } },
];

const TYPE_CHIP: Record<Answer["kind"], { label: string; tone: TagTone }> = {
  single: { label: "Single Choice", tone: "info" },
  multiple: { label: "Multiple Choice", tone: "violet" },
  text: { label: "Text", tone: "neutral" },
  rating: { label: "Rating", tone: "warning" },
};

/* Full class strings so Tailwind can detect them */
const COLS_CLS: Record<3 | 4, string> = {
  3: "sm:grid-cols-3",
  4: "sm:grid-cols-4",
};

const initials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0]?.toUpperCase())
    .slice(0, 2)
    .join("");

/* ---------------------------------------------------------------- */
/*  Small building blocks                                            */
/* ---------------------------------------------------------------- */
const Card = ({
  icon: Icon,
  title,
  subtitle,
  action,
  children,
  className = "",
}: {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) => (
  <section className={`min-w-0 rounded-[14px] border border-border bg-card ${className}`}>
    <header className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-5">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-[18px] w-[18px]" />
        </span>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-heading sm:text-base">{title}</h3>
          {subtitle && <p className="text-xs text-body">{subtitle}</p>}
        </div>
      </div>
      {action}
    </header>
    <div className="px-4 pb-4 sm:px-5 sm:pb-5">{children}</div>
  </section>
);

const Meta = ({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) => (
  <div className="flex items-center gap-2">
    <Icon className="h-4 w-4 shrink-0 text-body" />
    <div className="min-w-0">
      <p className="text-[11px] text-body">{label}</p>
      <p className="text-xs font-semibold text-heading sm:text-sm">{value}</p>
    </div>
  </div>
);

const answerBox = "rounded-lg bg-primary/[0.06] px-4 py-3";

const AnswerView = ({
  answer,
  editable,
  name,
  onChange,
}: {
  answer: Answer;
  editable: boolean;
  name: string;
  onChange: (answer: Answer) => void;
}) => {
  switch (answer.kind) {
    case "single":
      return (
        <div className={answerBox}>
          <ModalRadioGroup
            name={name}
            label="Answer"
            value={answer.selected}
            onChange={(selected) => onChange({ ...answer, selected })}
            options={(editable ? answer.options : [answer.selected]).map((option) => ({
              value: option,
              label: option,
            }))}
            disabled={!editable}
            className="flex-col items-start"
          />
        </div>
      );
    case "multiple":
      return (
        <ModalCheckboxGroup
          label="Answers"
          value={answer.selected}
          onChange={(selected) => onChange({ ...answer, selected })}
          options={answer.options.map((option) => ({ value: option, label: option }))}
          disabled={!editable}
          className={`grid grid-cols-2 gap-x-4 gap-y-3 rounded-lg bg-primary/[0.06] px-4 py-3 ${COLS_CLS[answer.cols]}`}
        />
      );
    case "text":
      return editable ? (
        <ModalTextarea
          id={`answer-${name}`}
          label="Answer"
          value={answer.value}
          onChange={(value) => onChange({ ...answer, value })}
          maxLength={5000}
        />
      ) : (
        <div className={`${answerBox} text-sm text-heading`}>{answer.value}</div>
      );
    case "rating":
      return (
        <div className="flex items-center gap-3">
          <div className="flex gap-1 text-primary" role={editable ? "group" : undefined} aria-label={`${answer.value} out of 5 stars`}>
            {[1, 2, 3, 4, 5].map((n) => (
              editable ? (
                <button
                  key={n}
                  type="button"
                  onClick={() => onChange({ ...answer, value: n, label: ["", "Poor", "Fair", "Good", "Very Good", "Excellent"][n] })}
                  aria-label={`Rate ${n} out of 5 stars`}
                  aria-pressed={answer.value === n}
                  className="cursor-pointer rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                >
                  <Star className="h-5 w-5" fill={n <= answer.value ? "currentColor" : "none"} />
                </button>
              ) : (
                <Star key={n} className="h-5 w-5" fill={n <= answer.value ? "currentColor" : "none"} />
              )
            ))}
          </div>
          <span className="text-sm text-body">{answer.label}</span>
        </div>
      );
  }
};

/* ---------------------------------------------------------------- */
/*  Page                                                             */
/* ---------------------------------------------------------------- */
const ViewResponse = () => {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const editable = pathname.endsWith("/edit-response");
  const [index, setIndex] = useState(1);
  const [completed, setCompleted] = useState(true);
  const [note, setNote] = useState("");
  const [answers, setAnswers] = useState<QA[]>(ANSWERS);
  const [toast, setToast] = useState<{ type: "success" | "error" | null; title: string; message: string }>({
    type: null,
    title: "",
    message: "",
  });

  const saveNote = () => {
    if (!note.trim()) {
      setToast({ type: "error", title: "Note is empty", message: "Write a note before saving." });
      return;
    }
    // TODO: call your API here
    setToast({ type: "success", title: "Note Saved", message: "Your internal note was saved for this response." });
    setNote("");
  };

  const updateAnswer = (answerIndex: number, answer: Answer) =>
    setAnswers((current) =>
      current.map((qa, index) => index === answerIndex ? { ...qa, answer } : qa),
    );

  const saveResponse = () => {
    // TODO: persist edited answers through the response API.
    setToast({
      type: "success",
      title: "Response Updated",
      message: "The patient response changes have been saved.",
    });
    const query = searchParams.toString();
    router.push(`/view-response${query ? `?${query}` : ""}`);
  };

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-4 sm:space-y-5">
      <SuccessToast
        isOpen={toast.type === "success"}
        onClose={() => setToast((t) => ({ ...t, type: null }))}
        title={toast.title}
        message={toast.message}
      />
      <ErrorToast
        isOpen={toast.type === "error"}
        onClose={() => setToast((t) => ({ ...t, type: null }))}
        title={toast.title}
        message={toast.message}
      />

      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Questionnaires", href: "/questionnaires" },
          { label: "Patient Responses", href: "/questionnaires?tab=responses" },
          { label: editable ? "Edit Response" : "View Response" },
        ]}
      />

      {/* Title + navigation */}
      <div className="flex flex-col gap-3 2xl:flex-row 2xl:items-start 2xl:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-heading sm:text-xl 2xl:text-2xl">
            {editable ? "Edit Patient Response" : "Patient Response"}
          </h2>
          <p className="mt-0.5 text-sm text-body">
            {editable ? "Update the submitted answers for this questionnaire." : "View the submitted answers for this questionnaire."}
          </p>
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
          <div className="flex items-center gap-2">
            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                aria-label="Previous Patient"
                title="Previous Patient"
                disabled={index <= 1}
                onClick={() => setIndex((i) => Math.max(1, i - 1))}
                className="group relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-border/90 bg-card/60 text-heading shadow-sm backdrop-blur-sm transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-40 sm:h-9 sm:w-9"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="whitespace-nowrap px-1 text-xs text-body sm:text-sm">
                {index} of {TOTAL_RESPONSES}
              </span>

              <button
                type="button"
                aria-label="Next Patient"
                title="Next Patient"
                disabled={index >= TOTAL_RESPONSES}
                onClick={() => setIndex((i) => Math.min(TOTAL_RESPONSES, i + 1))}
                className="group relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-border/90 bg-card/60 text-heading shadow-sm backdrop-blur-sm transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-40 sm:h-9 sm:w-9"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <ImportButton
              text="Print / Download"
              icon={<FileText className="h-4 w-4" />}
              onClick={() => window.print()}
              className="shrink-0 whitespace-nowrap gap-1 px-2 text-xs sm:gap-2 sm:px-5 sm:text-sm"
            />
          </div>
          {editable ? (
            <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto">
              <ImportButton
                text="Cancel"
                icon={null}
                onClick={() => router.push(`/view-response${searchParams.toString() ? `?${searchParams}` : ""}`)}
                className="w-full whitespace-nowrap px-2 text-xs sm:w-auto sm:px-5 sm:text-sm"
              />
              <AddButton
                text="Save Changes"
                icon={<Save className="h-4 w-4" />}
                onClick={saveResponse}
                className="w-full whitespace-nowrap px-2 text-xs sm:w-auto sm:px-5 sm:text-sm"
              />
            </div>
          ) : (
            <AddButton
              text="Edit Response"
              icon={<Pencil className="h-4 w-4" />}
              onClick={() => router.push(`/edit-response${searchParams.toString() ? `?${searchParams}` : ""}`)}
              className="whitespace-nowrap"
            />
          )}
        </div>
      </div>

      <StickyColumns columnsClass="2xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="min-w-0 space-y-4 sm:space-y-5">
          <Card icon={Users} title="Patient Information">
            <div className="grid gap-4 md:grid-cols-[minmax(0,1.3fr)_minmax(0,2fr)] md:items-center">
              <div className="flex min-w-0 items-center gap-4">
                <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-violet/15 text-lg font-semibold text-violet">
                  {initials(RESPONSE.patient)}
                </span>
                <div className="min-w-0 space-y-0.5">
                  <p className="truncate text-base font-semibold text-heading">{RESPONSE.patient}</p>
                  <p className="text-xs text-body">{RESPONSE.patientId}</p>
                  <p className="text-xs text-body">{RESPONSE.age} • {RESPONSE.gender}</p>
                  <p className="break-all text-xs text-body">{RESPONSE.email}</p>
                  <p className="text-xs text-body">{RESPONSE.phone}</p>
                </div>
              </div>
              <div className="grid gap-4 border-t border-divider pt-4 sm:grid-cols-3 md:border-l md:border-t-0 md:pl-5 md:pt-0">
                <div className="min-w-0">
                  <p className="mb-1.5 text-[11px] text-body">Assigned Provider</p>
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-shape-sky/40 text-[11px] font-semibold text-heading">
                      {initials(RESPONSE.provider.replace(/^Dr\.?\s+/i, ""))}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-heading">{RESPONSE.provider}</p>
                      <p className="truncate text-[11px] text-body">{RESPONSE.specialty}</p>
                    </div>
                  </div>
                </div>
                <Meta icon={CalendarDays} label="Submitted on" value={`${RESPONSE.submittedDate} ${RESPONSE.submittedTime}`} />
                <Meta icon={Timer} label="Time taken" value={RESPONSE.timeTaken} />
              </div>
            </div>
          </Card>

          <Card
            icon={FileText}
            title={editable ? "Edit Patient Answers" : "Patient Answers"}
            subtitle={editable ? "Update the patient’s submitted answers." : "Review the responses submitted by the patient."}
          >
            <ol className="divide-y divide-divider border-t border-divider">
              {answers.map((qa, i) => {
                const chip = TYPE_CHIP[qa.answer.kind];
                return (
                  <li key={qa.question} className="grid grid-cols-[28px_minmax(0,1fr)] gap-x-2 py-4 first:pt-5 last:pb-0">
                    <span className="text-sm font-semibold text-heading">{i + 1}.</span>
                    <div className="min-w-0 space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-heading">{qa.question}</p>
                        <Tags text={chip.label} tone={chip.tone} />
                      </div>
                      <AnswerView
                        answer={qa.answer}
                        editable={editable}
                        name={`response-${i}`}
                        onChange={(answer) => updateAnswer(i, answer)}
                      />
                    </div>
                  </li>
                );
              })}
            </ol>
          </Card>
        </div>

        <aside>
          {/* Response status */}
          <Card icon={ShieldCheck} title="Response Status">
            <div className="flex items-center justify-between gap-3">
              <Tags text={completed ? "Completed" : "Not Started"} tone={completed ? "success" : "neutral"} />
              <button
                type="button"
                onClick={() => setCompleted((c) => !c)}
                className="cursor-pointer text-xs font-medium text-link hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 sm:text-sm"
              >
                {completed ? "Mark as Not Started" : "Mark as Completed"}
              </button>
            </div>
          </Card>

          {/* Notes */}
          <Card icon={FileText} title="Notes">
            <ModalTextarea
              id="response-note"
              label="Internal note"
              value={note}
              onChange={setNote}
              placeholder="Add internal notes about this response..."
            />
            <div className="mt-3 flex justify-end">
              <AddButton text="Save Note" icon={null} onClick={saveNote} className="whitespace-nowrap" />
            </div>
          </Card>
        </aside>
      </StickyColumns>
    </div>
  );
};

export default ViewResponse;
