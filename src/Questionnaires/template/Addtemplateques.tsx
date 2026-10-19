"use client";

import RadioCheckButtonh from "@/components/RadioCheckButtonh";
import React, { useEffect, useState } from "react";
import {
  AlignLeft,
  Calendar,
  CheckSquare,
  ChevronDown,
  CircleDot,
  Hash,
  Paperclip,
  Plus,
  Star,
  ToggleLeft,
  Trash2,
  Type,
  type LucideIcon,
} from "lucide-react";

import ImportButton from "@/components/ImportButton";
import ModalShell, {
  ModalTextarea,
  OptLabel,
  ReqLabel,
  SignupField,
} from "@/components/Modalshell";

/* ---------------------------------------------------------------- */
/*  Shared question model (also used by AddTemplate.tsx)             */
/* ---------------------------------------------------------------- */
export type QuestionTypeKey =
  | "short"
  | "paragraph"
  | "choice"
  | "checkbox"
  | "dropdown"
  | "date"
  | "number"
  | "rating"
  | "yesno"
  | "file";

export type TemplateQuestion = {
  id: string;
  type: QuestionTypeKey;
  text: string;
  helpText: string;
  required: boolean;
  conditionalLogic: boolean;
  validation: boolean;
  placeholder: string;
  charLimit: string;
  options: string[];
};

type TypeTone = "violet" | "blue" | "orange";

export const TYPE_TONE_CLS: Record<TypeTone, string> = {
  violet: "bg-violet/80 text-on-primary",
  blue: "bg-primary/80 text-on-primary",
  orange: "bg-warning/80 text-heading",
};

export const QUESTION_TYPES: {
  key: QuestionTypeKey;
  label: string;
  hint: string;
  description: string;
  icon: LucideIcon;
  tone: TypeTone;
}[] = [
  { key: "short", label: "Short Answer", hint: "Single line text input", description: "Single line text input for brief answers.", icon: Type, tone: "violet" },
  { key: "paragraph", label: "Paragraph", hint: "Multi-line text input", description: "Multi-line text input for longer answers.", icon: AlignLeft, tone: "blue" },
  { key: "choice", label: "Multiple Choice", hint: "Single select options", description: "Patient picks exactly one option.", icon: CircleDot, tone: "violet" },
  { key: "checkbox", label: "Checkboxes", hint: "Multiple select options", description: "Patient can pick several options.", icon: CheckSquare, tone: "blue" },
  { key: "dropdown", label: "Dropdown", hint: "Select from a list", description: "Patient selects one option from a dropdown list.", icon: ChevronDown, tone: "blue" },
  { key: "date", label: "Date", hint: "Date picker", description: "Patient chooses a date.", icon: Calendar, tone: "orange" },
  { key: "number", label: "Number", hint: "Numeric input", description: "Numeric input only.", icon: Hash, tone: "violet" },
  { key: "rating", label: "Rating (1–5)", hint: "Star or scale rating", description: "Patient rates from 1 to 5 stars.", icon: Star, tone: "orange" },
  { key: "yesno", label: "Yes / No", hint: "True / false selection", description: "A simple yes or no answer.", icon: ToggleLeft, tone: "violet" },
  { key: "file", label: "File Upload", hint: "Upload documents", description: "Patient uploads PDF, JPG or PNG files.", icon: Paperclip, tone: "blue" },
];

export const getQuestionType = (key: QuestionTypeKey) =>
  QUESTION_TYPES.find((t) => t.key === key) ?? QUESTION_TYPES[0];

export const isChoiceType = (key: QuestionTypeKey) =>
  key === "choice" || key === "checkbox" || key === "dropdown";

export const blankQuestion = (type: QuestionTypeKey, id: string): TemplateQuestion => ({
  id,
  type,
  text: "",
  helpText: "",
  required: type === "short",
  conditionalLogic: false,
  validation: false,
  placeholder: "",
  charLimit: type === "short" ? "100" : type === "paragraph" ? "500" : "",
  options: isChoiceType(type) ? ["Option 1", "Option 2"] : [],
});

export const TypeIcon = ({
  type,
  size = "h-9 w-9",
  iconSize = "h-4 w-4",
}: {
  type: QuestionTypeKey;
  size?: string;
  iconSize?: string;
}) => {
  const t = getQuestionType(type);
  const Icon = t.icon;
  return (
    <span className={`flex ${size} shrink-0 items-center justify-center rounded-lg ${TYPE_TONE_CLS[t.tone]}`}>
      <Icon className={iconSize} />
    </span>
  );
};

const checkboxCls =
  "h-4 w-4 shrink-0 cursor-pointer rounded border-border accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30";

type Errors = { text?: string; options?: string; charLimit?: string };

/* ---------------------------------------------------------------- */
/*  Modal                                                            */
/* ---------------------------------------------------------------- */
const AddTemplateQuestionModal = ({
  open,
  onClose,
  onSave,
  question,
  initialType,
  newId,
}: {
  open: boolean;
  onClose: () => void;
  /** Receives the finished question (new or edited). */
  onSave: (question: TemplateQuestion) => void;
  /** Pass a question to edit it; omit for a new one. */
  question?: TemplateQuestion | null;
  /** Type preselected for a new question. */
  initialType?: QuestionTypeKey;
  /** Id generator for new questions. */
  newId?: () => string;
}) => {
  const [values, setValues] = useState<TemplateQuestion>(() => blankQuestion("short", "new"));
  const [errors, setErrors] = useState<Errors>({});
  const idSeed = React.useRef(100);

  const isEdit = Boolean(question);

  /* Fresh (or pre-filled) form every time the modal opens */
  useEffect(() => {
    if (!open) return;
    setValues(
      question
        ? { ...question, options: [...question.options] }
        : blankQuestion(
            initialType ?? "short",
            newId?.() ?? `q${Date.now().toString(36)}-${idSeed.current++}`,
          ),
    );
    setErrors({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, question, initialType]);

  const set = <K extends keyof TemplateQuestion>(key: K, val: TemplateQuestion[K]) => {
    setValues((prev) => ({ ...prev, [key]: val }));
    setErrors({});
  };

  const changeType = (type: QuestionTypeKey) => {
    setValues((prev) => ({
      ...prev,
      type,
      options: isChoiceType(type) ? (prev.options.length >= 2 ? prev.options : ["Option 1", "Option 2"]) : prev.options,
      charLimit:
        type === "short" ? prev.charLimit || "100" : type === "paragraph" ? prev.charLimit || "500" : prev.charLimit,
    }));
    setErrors({});
  };

  const setOption = (index: number, value: string) =>
    set("options", values.options.map((o, i) => (i === index ? value : o)));

  const addOption = () => set("options", [...values.options, `Option ${values.options.length + 1}`]);

  const removeOption = (index: number) =>
    set("options", values.options.filter((_, i) => i !== index));

  const handleSave = () => {
    const e: Errors = {};
    if (!values.text.trim()) e.text = "Question text is required";

    const cleanOptions = values.options.map((o) => o.trim()).filter(Boolean);
    if (isChoiceType(values.type) && cleanOptions.length < 2) e.options = "Add at least two options";

    if (values.charLimit.trim()) {
      const n = Number(values.charLimit);
      if (!Number.isInteger(n) || n < 1 || n > 5000) e.charLimit = "Enter a whole number from 1 to 5000";
    }

    setErrors(e);
    if (Object.keys(e).length) return;

    onSave({
      ...values,
      text: values.text.trim(),
      helpText: values.helpText.trim(),
      options: isChoiceType(values.type) ? cleanOptions : [],
    });
    onClose();
  };

  const current = getQuestionType(values.type);
  const hasTextSettings = values.type === "short" || values.type === "paragraph";

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      onSubmit={handleSave}
      title={isEdit ? "Edit Question" : "Add Question"}
      submitText={isEdit ? "Save Question" : "Add Question"}
      width={900}
    >
      <div className="grid gap-4 md:grid-cols-[250px_minmax(0,1fr)]">
        {/* Type list */}
        <div className="space-y-1.5 rounded-xl border border-border bg-primary/[0.03] p-2">
          {QUESTION_TYPES.map((t) => {
            const active = t.key === values.type;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => changeType(t.key)}
                aria-pressed={active}
                className={`flex w-full cursor-pointer items-center gap-3 rounded-lg border px-2.5 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${
                  active ? "border-primary/40 bg-primary/10" : "border-transparent hover:bg-primary/5"
                }`}
              >
                <TypeIcon type={t.key} />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-heading">{t.label}</span>
                  <span className="block truncate text-[11px] text-body">{t.hint}</span>
                </span>
              </button>
            );
          })}
        </div>

        {/* Question details */}
        <div className="min-w-0 space-y-4 rounded-xl border border-border p-4">
          <div>
            <h4 className="text-base font-semibold text-heading">Question Details</h4>
            <p className="mt-3 text-sm font-medium text-label">Question Type</p>
            <div className="mt-2 flex items-center gap-3">
              <TypeIcon type={values.type} size="h-12 w-12" iconSize="h-5 w-5" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-heading">{current.label}</p>
                <p className="text-xs text-body">{current.description}</p>
              </div>
            </div>
          </div>

          <SignupField
            name="questionText"
            label={<ReqLabel>Question Text</ReqLabel>}
            placeholder="Enter your question"
            value={values.text}
            onChange={(e) => set("text", e.target.value)}
            error={errors.text}
          />

          <ModalTextarea
            id="question-help-text"
            label={<OptLabel>Help Text</OptLabel>}
            placeholder="Provide a short description or example to help the patient."
            value={values.helpText}
            onChange={(v) => set("helpText", v)}
            maxLength={300}
          />

          <div className="space-y-2.5">
            {(
              [
                ["required", "Required question"],
                ["conditionalLogic", "Add conditional logic"],
                ["validation", "Add validation"],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="flex cursor-pointer items-center gap-2.5 text-sm text-heading">
                <RadioCheckButtonh
                  type="checkbox"
                  checked={values[key]}
                  onChange={(e) => set(key, e.target.checked)}
                  className={checkboxCls}
                />
                {label}
              </label>
            ))}
          </div>

          {/* Settings (depend on the type) */}
          <div className="space-y-3">
            <h4 className="text-base font-semibold text-heading">Settings</h4>

            {isChoiceType(values.type) && (
              <div>
                <p className="mb-2 text-sm font-medium text-label">
                  <ReqLabel>Options</ReqLabel>
                </p>
                <div className="space-y-2">
                  {values.options.map((option, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="min-w-0 flex-1">
                        <SignupField
                          name={`option-${index}`}
                          placeholder={`Option ${index + 1}`}
                          value={option}
                          onChange={(e) => setOption(index, e.target.value)}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeOption(index)}
                        disabled={values.options.length <= 2}
                        aria-label={`Remove option ${index + 1}`}
                        className="flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-border text-body transition-colors hover:border-danger/40 hover:bg-danger/10 hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger/30 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border disabled:hover:bg-transparent disabled:hover:text-body"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
                {errors.options && <p className="mt-1 text-[11px] font-medium text-danger">{errors.options}</p>}
                <ImportButton
                  className="mt-2 w-fit text-primary"
                  text="Add Option"
                  icon={<Plus className="h-4 w-4" />}
                  onClick={addOption}
                />
              </div>
            )}

            {(hasTextSettings || values.type === "number") && (
              <SignupField
                name="placeholder"
                label={<OptLabel>Placeholder Text</OptLabel>}
                placeholder="Type your answer..."
                value={values.placeholder}
                onChange={(e) => set("placeholder", e.target.value)}
              />
            )}

            {hasTextSettings && (
              <SignupField
                name="charLimit"
                type="number"
                min={1}
                max={5000}
                label={<OptLabel>Character Limit</OptLabel>}
                placeholder="e.g. 100"
                value={values.charLimit}
                onChange={(e) => set("charLimit", e.target.value)}
                error={errors.charLimit}
              />
            )}

            {values.type === "file" && (
              <p className="rounded-lg bg-primary/5 px-3 py-2 text-xs text-body">
                Accepted files: PDF, JPG, PNG (Max 10 MB).
              </p>
            )}

            {!isChoiceType(values.type) &&
              !hasTextSettings &&
              values.type !== "number" &&
              values.type !== "file" && (
                <p className="text-sm text-body">No additional settings for this question type.</p>
              )}
          </div>
        </div>
      </div>
    </ModalShell>
  );
};

export default AddTemplateQuestionModal;