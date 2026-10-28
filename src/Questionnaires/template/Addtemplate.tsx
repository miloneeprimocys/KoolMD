"use client";

import RadioCheckButtonh from "@/components/RadioCheckButtonh";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Copy,
  Eye,
  GripVertical,
  Pencil,
  Plus,
  Star,
  Trash2,
  UploadCloud,
} from "lucide-react";

import Breadcrumb from "@/components/Breadcrumb";
import AddButton from "@/components/Addbutton";
import ImportButton from "@/components/ImportButton";
import DatePicker from "@/components/Datepicker";
import FileDropzone from "@/components/Filedropzone";
import TogglableSwitch from "@/components/Togglableswitch";
import Tags from "@/components/Tags";
import SuccessToast from "@/components/SuccessToast";
import ErrorToast from "@/components/ErrorToast";
import {
  ModalCheckboxGroup,
  ModalTextarea,
  ModalRadioGroup,
  ReqLabel,
  SignupDropdown,
  SignupField,
  toOptions,
} from "@/components/Modalshell";

import { CATEGORY_TONE } from "../Questionnairelist";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppHooks";
import {
  clearTemplateQuestionResult,
  showAddTemplateQuestion,
} from "@/redux/slices/dialogslice";
import {
  QUESTION_TYPES,
  TypeIcon,
  getQuestionType,
  isChoiceType,
  type QuestionTypeKey,
  type TemplateQuestion,
} from "./Addtemplateques";

/* ---------- Static data ---------- */
const CATEGORY_OPTIONS = toOptions(Object.keys(CATEGORY_TONE));
const STATUS_OPTIONS = toOptions(["Active", "Inactive"]);

const makeQuestion = (
  id: string,
  type: QuestionTypeKey,
  text: string,
  required: boolean,
  options: string[] = [],
): TemplateQuestion => ({
  id,
  type,
  text,
  helpText: "",
  required,
  conditionalLogic: false,
  validation: false,
  placeholder: "",
  charLimit: "",
  options,
});

const INITIAL_QUESTIONS: TemplateQuestion[] = [
  makeQuestion("q1", "short", "What is the reason for your visit?", true),
  makeQuestion("q2", "choice", "Do you have any allergies?", true, ["Yes", "No", "Not sure"]),
  makeQuestion("q3", "checkbox", "Select your current symptoms.", true, [
    "Headache",
    "Fever",
    "Cough",
    "Fatigue",
    "Other (please specify)",
  ]),
  makeQuestion("q4", "date", "When did your symptoms start?", false),
  makeQuestion("q5", "paragraph", "Please provide any additional information.", false),
  makeQuestion("q6", "file", "Upload any relevant medical documents (optional).", false),
];

const APPLICABLE = [
  { key: "allProviders", label: "All providers" },
  { key: "specificProviders", label: "Specific providers" },
  { key: "selfComplete", label: "Patient self-complete" },
  { key: "staffAssisted", label: "Staff assisted" },
] as const;
type ApplicableKey = (typeof APPLICABLE)[number]["key"];

const iconBtn =
  "flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-body transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30";

const Card = ({
  title,
  action,
  children,
  className = "",
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) => (
  <section className={`min-w-0 rounded-[14px] border border-border bg-card ${className}`}>
    <header className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-5">
      <h3 className="text-base font-semibold text-heading">{title}</h3>
      {action}
    </header>
    <div className="px-4 pb-4 sm:px-5 sm:pb-5">{children}</div>
  </section>
);

/* ---------- Live preview ---------- */
const PreviewField = ({ q }: { q: TemplateQuestion }) => {
  const placeholder = q.placeholder || "Type your answer...";
  const [selected, setSelected] = useState("");
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [rating, setRating] = useState(0);
  const [other, setOther] = useState("");
  const [textValue, setTextValue] = useState("");
  const [dateValue, setDateValue] = useState("");
  const [file, setFile] = useState<File | null>(null);

  switch (q.type) {
    case "short":
      return (
        <SignupField
          name={`preview-${q.id}`}
          aria-label={q.text}
          placeholder={placeholder}
          value={textValue}
          onChange={(event) => setTextValue(event.target.value)}
        />
      );
    case "number":
      return (
        <SignupField
          name={`preview-${q.id}`}
          type="number"
          aria-label={q.text}
          placeholder={q.placeholder || "Enter a number"}
          value={textValue}
          onChange={(event) => setTextValue(event.target.value)}
        />
      );
    case "paragraph":
      return (
        <ModalTextarea
          id={`preview-${q.id}`}
          label="Your answer"
          placeholder={placeholder}
          value={textValue}
          onChange={setTextValue}
          maxLength={Number(q.charLimit) || 500}
        />
      );
    case "date":
      return (
        <DatePicker
          name={`preview-${q.id}`}
          value={dateValue}
          onChange={setDateValue}
          label="Your answer"
          placeholder="dd-mm-yyyy"
        />
      );
    case "dropdown":
      return (
        <SignupDropdown
          name={`preview-${q.id}`}
          placeholder="Select an option"
          searchable={false}
          options={q.options.map((option) => ({ value: option, label: option }))}
          value={selected}
          onChange={setSelected}
        />
      );
    case "rating":
      return (
        <div className="flex gap-1 text-primary" role="group" aria-label={`Rate: ${q.text}`}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              aria-label={`${n} star${n === 1 ? "" : "s"}`}
              aria-pressed={rating === n}
              className="cursor-pointer rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
            >
              <Star className="h-5 w-5" fill={n <= rating ? "currentColor" : "none"} />
            </button>
          ))}
        </div>
      );
    case "yesno":
      return (
        <ModalRadioGroup
          name={`preview-${q.id}`}
          label="Select one"
          value={selected}
          onChange={setSelected}
          options={["Yes", "No"].map((option) => ({ value: option, label: option }))}
        />
      );
    case "choice":
      return (
        <ModalRadioGroup
          name={`preview-${q.id}`}
          label="Select one"
          value={selected}
          onChange={setSelected}
          options={q.options.map((option) => ({ value: option, label: option }))}
        />
      );
    case "checkbox":
      return (
        <>
          <ModalCheckboxGroup
            label="Select all that apply"
            value={selectedOptions}
            onChange={setSelectedOptions}
            options={q.options.map((option) => ({ value: option, label: option }))}
            className="flex flex-col items-start gap-2"
          />
          {q.options.filter((option) => /^other/i.test(option)).map((option) =>
            selectedOptions.includes(option) ? (
              <SignupField
                key={option}
                name={`preview-${q.id}-other`}
                aria-label={`${q.text} other`}
                placeholder="Please specify..."
                value={other}
                onChange={(event) => setOther(event.target.value)}
                className="mt-2"
              />
            ) : null,
          )}
        </>
      );
    case "file":
      return (
        <FileDropzone
          title="your document here"
          file={file}
          onChange={setFile}
          maxSizeMB={10}
          variant="attachment"
        />
      );
    default:
      return null;
  }
};

/* ---------- Page ---------- */
const AddTemplate = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const savedTemplateQuestion = useAppSelector((state) => state.dialog.templateQuestionResult);
  const idSeed = useRef(100);
  const newId = () => `q${idSeed.current++}`;
  const previewRef = useRef<HTMLDivElement | null>(null);

  /* Template details */
  const [name, setName] = useState("Pre-Visit Intake");
  const [category, setCategory] = useState("Intake");
  const [description, setDescription] = useState(
    "Collect essential patient information before the appointment to improve visit efficiency.",
  );
  const [status, setStatus] = useState("Active");
  const [applicable, setApplicable] = useState<Record<ApplicableKey, boolean>>({
    allProviders: true,
    specificProviders: false,
    selfComplete: true,
    staffAssisted: false,
  });
  const [errors, setErrors] = useState<{ name?: string; category?: string }>({});

  /* Questions */
  const [questions, setQuestions] = useState<TemplateQuestion[]>(INITIAL_QUESTIONS);
  const dragFrom = useRef<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);

  /* Preview */
  const [previewTab, setPreviewTab] = useState<"patient" | "staff">("patient");

  const [toast, setToast] = useState<{ type: "success" | "error" | null; title: string; message: string }>({
    type: null,
    title: "",
    message: "",
  });

  /* ---------- Question actions ---------- */
  const openNew = (type: QuestionTypeKey = "short") =>
    dispatch(showAddTemplateQuestion({ initialType: type }));
  const openEdit = (question: TemplateQuestion) =>
    dispatch(showAddTemplateQuestion({ question, initialType: question.type }));

  useEffect(() => {
    if (!savedTemplateQuestion) return;
    // The question form is hosted globally, so apply its saved result to this page's local draft.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQuestions((prev) =>
      prev.some((question) => question.id === savedTemplateQuestion.id)
        ? prev.map((question) =>
            question.id === savedTemplateQuestion.id ? savedTemplateQuestion : question,
          )
        : [...prev, savedTemplateQuestion],
    );
    dispatch(clearTemplateQuestionResult());
  }, [savedTemplateQuestion, dispatch]);

  const duplicateQuestion = (q: TemplateQuestion) =>
    setQuestions((prev) => {
      const index = prev.findIndex((x) => x.id === q.id);
      const copy = { ...q, id: newId(), options: [...q.options] };
      return [...prev.slice(0, index + 1), copy, ...prev.slice(index + 1)];
    });

  const deleteQuestion = (id: string) => setQuestions((prev) => prev.filter((x) => x.id !== id));

  const setRequired = (id: string, required: boolean) =>
    setQuestions((prev) => prev.map((x) => (x.id === id ? { ...x, required } : x)));

  const dropOn = (to: number) => {
    const from = dragFrom.current;
    dragFrom.current = null;
    setDragOver(null);
    if (from === null || from === to) return;
    setQuestions((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  };

  /* ---------- Save / publish ---------- */
  const submit = (mode: "draft" | "publish") => {
    const e: { name?: string; category?: string } = {};
    if (!name.trim()) e.name = "Template name is required.";
    if (mode === "publish" && !category) e.category = "Category is required.";
    setErrors(e);

    if (Object.keys(e).length) {
      setToast({
        type: "error",
        title: "Validation Incomplete",
        message: "Please complete the required template details.",
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (mode === "publish" && questions.length === 0) {
      setToast({
        type: "error",
        title: "No questions added",
        message: "Add at least one question before publishing the template.",
      });
      return;
    }

    // TODO: call your API here
    console.log(mode === "publish" ? "Template published:" : "Template saved as draft:", {
      name: name.trim(),
      category,
      description: description.trim(),
      status: mode === "draft" ? "Draft" : status,
      applicableTo: applicable,
      questions,
    });
    setToast({
      type: "success",
      title: mode === "publish" ? "Template Published" : "Draft Saved",
      message:
        mode === "publish"
          ? `${name.trim()} has been published.`
          : `${name.trim()} has been saved as a draft.`,
    });
  };

  return (
    <div className="mx-auto w-full min-w-0 max-w-[1600px] space-y-4 sm:space-y-5">
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
          { label: "Questionnaires", href: "/questionnaires" },
          { label: "Templates", href: "/questionnaires?tab=templates" },
          { label: "Add Template" },
        ]}
      />

      {/* Title + actions */}
      <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0">
          <h2 className="break-words text-lg font-semibold text-heading sm:text-xl 2xl:text-2xl">Add Questionnaire Template</h2>
          <p className="mt-0.5 text-sm text-body">
            Create a reusable questionnaire for patient intake, follow-ups or assessments.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ImportButton
            text="Cancel"
            icon={null}
            onClick={() => router.push("/questionnaires")}
            className="whitespace-nowrap"
          />
          {/* <ImportButton
            text="Save as Draft"
            icon={null}
            onClick={() => submit("draft")}
            className="whitespace-nowrap"
          /> */}
          <AddButton
            text="Publish Template"
            icon={null}
            onClick={() => submit("publish")}
            className="whitespace-nowrap"
          />
        </div>
      </div>

      <div className="grid items-start gap-4 sm:gap-5 xl:grid-cols-[minmax(0,1fr)_430px]">
        {/* ================= LEFT ================= */}
        <div className="min-w-0 space-y-4 sm:space-y-5">
          {/* Template details */}
          <Card title="Template Details">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <SignupField
                  name="templateName"
                  label={<ReqLabel>Template Name</ReqLabel>}
                  placeholder="Enter template name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setErrors((er) => ({ ...er, name: undefined }));
                  }}
                  error={errors.name}
                />
                <SignupDropdown
                  name="templateCategory"
                  label={<ReqLabel>Category</ReqLabel>}
                  placeholder="Select category"
                  searchable={false}
                  options={CATEGORY_OPTIONS}
                  value={category}
                  onChange={(v) => {
                    setCategory(v);
                    setErrors((er) => ({ ...er, category: undefined }));
                  }}
                  error={errors.category}
                />
              </div>

              <div className="space-y-4">
                <SignupDropdown
                  name="templateStatus"
                  label="Status"
                  placeholder="Select status"
                  searchable={false}
                  icon={
                    <span
                      className={`block h-2 w-2 rounded-full ${status === "Active" ? "bg-success" : "bg-body"}`}
                    />
                  }
                  options={STATUS_OPTIONS}
                  value={status}
                  onChange={setStatus}
                />
                <div>
                  <p className="mb-2 text-sm font-medium text-label">Applicable To</p>
                  <div className="space-y-2.5">
                    {APPLICABLE.map(({ key, label }) => (
                      <label key={key} className="flex cursor-pointer items-center gap-2.5 text-sm text-heading">
                        <RadioCheckButtonh
                          type="checkbox"
                          checked={applicable[key]}
                          onChange={(e) => setApplicable((prev) => ({ ...prev, [key]: e.target.checked }))}
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-2">
              <ModalTextarea
                id="template-description"
                label="Description"
                placeholder="Describe what this template is for"
                value={description}
                onChange={setDescription}
              />
            </div>
          </Card>

          {/* Questions */}
          <Card
            title="Questions"
            action={
              <div className="flex w-full min-w-0 flex-col gap-2 min-[420px]:flex-row min-[420px]:flex-wrap sm:w-auto">
                <ImportButton
                  text="Preview"
                  icon={<Eye className="h-4 w-4" />}
                  onClick={() => previewRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
                  className="w-full whitespace-nowrap min-[420px]:w-auto"
                />
                <AddButton
                  text="Add Question"
                  icon={<Plus className="h-4 w-4" />}
                  onClick={() => openNew("short")}
                  className="w-full whitespace-nowrap min-[420px]:w-auto"
                />
              </div>
            }
          >
            <div className="grid min-w-0 gap-4 md:grid-cols-[190px_minmax(0,1fr)]">
              {/* Palette */}
              <div className="min-w-0 self-start rounded-xl border border-border bg-primary/[0.03] p-2">
                <p className="px-2 pb-2 pt-1 text-xs font-semibold text-heading">Add Question</p>
                <div className="space-y-1">
                  {QUESTION_TYPES.map((t) => (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => openNew(t.key)}
                      className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-sm text-heading transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                    >
                      <TypeIcon type={t.key} size="h-7 w-7" />
                      <span className="truncate">{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Question list */}
              <ul className="min-w-0 space-y-2.5">
                {questions.length === 0 && (
                  <li className="rounded-xl border border-dashed border-border px-4 py-10 text-center text-sm text-body">
                    No questions yet. Pick a question type to get started.
                  </li>
                )}
                {questions.map((q, index) => {
                  const type = getQuestionType(q.type);
                  return (
                    <li
                      key={q.id}
                      draggable
                      onDragStart={() => (dragFrom.current = index)}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragOver(index);
                      }}
                      onDrop={() => dropOn(index)}
                      onDragEnd={() => {
                        dragFrom.current = null;
                        setDragOver(null);
                      }}
                      className={`grid min-w-0 grid-cols-[16px_24px_minmax(0,1fr)] items-start gap-2 rounded-xl border bg-card p-3 transition-colors sm:flex sm:gap-3 ${
                        dragOver === index ? "border-primary" : "border-border"
                      }`}
                    >
                      <span className="mt-1 cursor-grab text-body" aria-hidden>
                        <GripVertical className="h-4 w-4" />
                      </span>
                      <span className="mt-0.5 w-6 shrink-0 text-lg font-semibold text-heading">{index + 1}.</span>

                      <div className="min-w-0 sm:flex-1">
                        <p className="text-[11px] text-body">{type.label}</p>
                        <p className="break-words text-sm font-medium text-heading">{q.text}</p>
                        {isChoiceType(q.type) && (
                          <div className="mt-2 space-y-1">
                            {q.options.map((o) => (
                              <label key={o} className="flex items-center gap-2 text-xs text-body">
                                <RadioCheckButtonh
                                  type={q.type === "checkbox" ? "checkbox" : "radio"}
                                  disabled
                                />
                                {o}
                              </label>
                            ))}
                          </div>
                        )}
                        {q.type === "file" && (
                          <p className="mt-1 text-[11px] text-body">Accepted files: PDF, JPG, PNG (Max 10 MB)</p>
                        )}
                      </div>

                      <div className="col-span-3 flex min-w-0 flex-wrap items-center justify-end gap-1 sm:ml-auto sm:shrink-0">
                        <TogglableSwitch
                          checked={q.required}
                          onChange={(v) => setRequired(q.id, v)}
                          label="Required"
                          ariaLabel={`Required: ${q.text}`}
                          size="sm"
                          className="shrink-0 text-body"
                        />
                        <button
                          type="button"
                          aria-label={`Edit question ${index + 1}`}
                          onClick={() => openEdit(q)}
                          className={`${iconBtn} hover:bg-primary/10 hover:text-primary`}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          aria-label={`Duplicate question ${index + 1}`}
                          onClick={() => duplicateQuestion(q)}
                          className={`${iconBtn} hover:bg-primary/10 hover:text-primary`}
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          aria-label={`Delete question ${index + 1}`}
                          onClick={() => deleteQuestion(q.id)}
                          className={`${iconBtn} text-danger hover:bg-danger/10`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </Card>
        </div>

        {/* ================= RIGHT: live preview ================= */}
        <div ref={previewRef} className="scroll-mt-4 xl:sticky xl:top-4">
          <Card
            title="Live Preview"
            action={
              <div className="inline-flex overflow-hidden rounded-lg border border-border text-xs font-medium">
                {(
                  [
                    ["patient", "Patient View"],
                    ["staff", "Staff View"],
                  ] as const
                ).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setPreviewTab(key)}
                    aria-pressed={previewTab === key}
                    className={`cursor-pointer px-3 py-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${
                      previewTab === key ? "bg-primary text-on-primary" : "bg-card text-heading hover:bg-primary/10"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            }
          >
            <div className="max-h-[calc(100vh-9rem)] space-y-5 overflow-y-auto rounded-xl border border-border bg-card p-4 hide-scrollbar sm:p-5">
              <div>
                <h4 className="text-lg font-semibold text-heading">{name || "Untitled template"}</h4>
                {description && <p className="mt-1 text-sm text-body">{description}</p>}
              </div>

              {questions.length === 0 && <p className="text-sm text-body">Questions you add will appear here.</p>}

              {questions.map((q, index) => (
                <div key={q.id} className="space-y-2">
                  <p className="text-sm font-medium text-heading">
                    {index + 1}. {q.text}
                    {q.required && <span className="text-danger"> *</span>}
                  </p>
                  {q.helpText && <p className="text-xs text-body">{q.helpText}</p>}

                  {previewTab === "patient" ? (
                    <PreviewField q={q} />
                  ) : (
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                        {getQuestionType(q.type).label}
                      </span>
                      <Tags text={q.required ? "Required" : "Optional"} tone={q.required ? "danger" : "neutral"} />
                      {isChoiceType(q.type) && (
                        <span className="text-xs text-body">{q.options.length} options</span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Add / edit question modal */}
    </div>
  );
};

export default AddTemplate;
