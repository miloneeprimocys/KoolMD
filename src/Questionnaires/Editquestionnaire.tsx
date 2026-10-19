"use client";

import RadioCheckButtonh from "@/components/RadioCheckButtonh";
import React, { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FileText, ListChecks, Pencil, Plus, Save, Settings, Trash2, type LucideIcon } from "lucide-react";

import Breadcrumb from "@/components/Breadcrumb";
import AddButton from "@/components/Addbutton";
import ImportButton from "@/components/ImportButton";
import TogglableSwitch from "@/components/Togglableswitch";
import Tags, { type TagTone } from "@/components/Tags";
import Table from "@/components/Table";
import TableStatus from "@/components/TableStatus";
import { type TableColumn } from "@/components/Tableheader";
import Pagination from "@/components/Pagination";
import SuccessToast from "@/components/SuccessToast";
import ErrorToast from "@/components/ErrorToast";
import DatePicker from "@/components/Datepicker";
import GlobalSearch from "@/components/GlobalSearch";
import { TableSelectAllCheckbox, useTableSelection } from "@/components/TableSelection";
import SignupField from "@/components/SignupField";
import SignupDropdown from "@/components/SignupDropdown";
import { ModalTextarea, ReqLabel, toOptions } from "@/components/Modalshell";

import { QUESTIONNAIRES, checkboxCls } from "./Questionnairelist";

/* ---------- Static data (replace with API data later) ---------- */
type QuestionType = "Single Choice" | "Multiple Choice" | "Text" | "Rating";

type QuestionRow = {
  id: string;
  text: string;
  type: QuestionType;
  required: boolean;
  active: boolean;
};

const q = (id: string, text: string, type: QuestionType, required: boolean): QuestionRow => ({
  id,
  text,
  type,
  required,
  active: true,
});

const INITIAL_QUESTIONS: QuestionRow[] = [
  q("1", "What is your current age?", "Single Choice", true),
  q("2", "Do you have any chronic conditions?", "Multiple Choice", true),
  q("3", "Are you currently taking any medications?", "Text", false),
  q("4", "How would you rate your overall health?", "Rating", true),
  q("5", "Do you experience any allergies?", "Multiple Choice", true),
  q("6", "Do you smoke or use tobacco?", "Single Choice", true),
  q("7", "How often do you exercise?", "Single Choice", false),
  q("8", "Please describe any current symptoms.", "Text", false),
  q("9", "Have you had any surgeries in the past?", "Single Choice", true),
  q("10", "How many hours do you sleep per night?", "Single Choice", false),
  q("11", "Do you have a family history of heart disease?", "Single Choice", true),
  q("12", "Is there anything else you would like us to know?", "Text", false),
];

const DESCRIPTIONS: Record<string, string> = {
  q1: "General health and lifestyle questionnaire for new and existing patients.",
};

const CATEGORY_OPTIONS = toOptions(
  Array.from(new Set(QUESTIONNAIRES.map((x) => x.category))),
);

const REMINDER_OPTIONS = toOptions([
  "No reminder",
  "1 day before due date",
  "2 days before due date",
  "3 days before due date",
  "1 week before due date",
]);

const TYPE_TONES: Record<QuestionType, TagTone> = {
  "Single Choice": "info",
  "Multiple Choice": "violet",
  Text: "neutral",
  Rating: "warning",
};

const PAGE_SIZE = 5;

/* ---------- Small pieces ---------- */
const Card = ({
  icon: Icon,
  title,
  subtitle,
  action,
  children,
}: {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) => (
  <section className="min-w-0 rounded-[14px] border border-border bg-card">
    <header className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-5">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-heading sm:text-base">{title}</h3>
          <p className="mt-0.5 text-xs text-body">{subtitle}</p>
        </div>
      </div>
      {action}
    </header>
    <div className="px-4 pb-4 sm:px-5 sm:pb-5">{children}</div>
  </section>
);

/* ---------- Page ---------- */
const EditQuestionnaire = () => {
  const router = useRouter();
  const id = useSearchParams().get("id");
  const source = QUESTIONNAIRES.find((x) => x.id === id) ?? QUESTIONNAIRES[0];

  /* Basic information */
  const [name, setName] = useState(source.name);
  const [category, setCategory] = useState(source.category);
  const [active, setActive] = useState(source.status === "Active");
  const [description, setDescription] = useState(DESCRIPTIONS[source.id] ?? source.description);
  const [errors, setErrors] = useState<{ name?: string; category?: string }>({});

  /* Questions */
  const [questions, setQuestions] = useState<QuestionRow[]>(INITIAL_QUESTIONS);
  const [questionSearch, setQuestionSearch] = useState("");
  const [page, setPage] = useState(1);

  /* Settings */
  const [dueDate, setDueDate] = useState("2026-10-20");
  const [reminder, setReminder] = useState("2 days before due date");
  const [notify, setNotify] = useState(true);
  const [allowResume, setAllowResume] = useState(true);

  const [toast, setToast] = useState<{ type: "success" | "error" | null; title: string; message: string }>({
    type: null,
    title: "",
    message: "",
  });

  /* ---------- Questions table ---------- */
  const filtered = useMemo(() => {
    const term = questionSearch.trim().toLowerCase();
    return term ? questions.filter((x) => x.text.toLowerCase().includes(term)) : questions;
  }, [questions, questionSearch]);

  const totalPages = Math.max(Math.ceil(filtered.length / PAGE_SIZE), 1);
  const safePage = Math.min(page, totalPages);
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const { selectedKeys, allSelected, someSelected, toggleRow, toggleAll } = useTableSelection(
    visible.map((x) => x.id),
  );

  const setRequired = (qid: string, required: boolean) =>
    setQuestions((prev) => prev.map((x) => (x.id === qid ? { ...x, required } : x)));

  const deleteQuestion = (qid: string) => setQuestions((prev) => prev.filter((x) => x.id !== qid));

  const columns: TableColumn[] = [
    {
      key: "select",
      label: "",
      className: "w-10",
      header: (
        <TableSelectAllCheckbox
          checked={allSelected}
          indeterminate={someSelected}
          onChange={toggleAll}
          className={checkboxCls}
        />
      ),
    },
    { key: "number", label: "#" },
    { key: "question", label: "Question" },
    { key: "type", label: "Type" },
    { key: "required", label: "Required" },
    { key: "status", label: "Status" },
    {
      key: "actions",
      label: "Actions",
      header: <div className="flex w-full items-center justify-center">Actions</div>,
    },
  ];

  const iconBtn =
    "flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-border bg-card transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30";

  const rows = visible.map((x, index) => ({
    select: (
      <RadioCheckButtonh
        type="checkbox"
        checked={selectedKeys.has(x.id)}
        onChange={() => toggleRow(x.id)}
        aria-label={`Select question ${x.text}`}
        className={checkboxCls}
      />
    ),
    number: <span className="text-sm text-heading">{(safePage - 1) * PAGE_SIZE + index + 1}</span>,
    question: <span className="text-sm text-heading">{x.text}</span>,
    type: <Tags text={x.type} tone={TYPE_TONES[x.type]} />,
    required: (
      <TogglableSwitch checked={x.required} onChange={(v) => setRequired(x.id, v)} ariaLabel={`Required: ${x.text}`} />
    ),
    status: <Tags text={x.active ? "Active" : "Inactive"} tone={x.active ? "success" : "neutral"} />,
    actions: (
      <div className="flex w-full items-center justify-center gap-2">
        <button
          type="button"
          aria-label={`Edit question ${x.text}`}
          onClick={() => console.log("edit question", x.id) /* TODO: open edit-question modal */}
          className={`${iconBtn} text-primary hover:bg-primary/10`}
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          aria-label={`Delete question ${x.text}`}
          onClick={() => deleteQuestion(x.id)}
          className={`${iconBtn} text-body hover:border-danger/40 hover:bg-danger/10 hover:text-danger`}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    ),
  }));

  /* ---------- Save ---------- */
  const handleSave = () => {
    const e: { name?: string; category?: string } = {};
    if (!name.trim()) e.name = "Questionnaire name is required.";
    else if (name.trim().length < 3) e.name = "Name must be at least 3 characters.";
    if (!category) e.category = "Category is required.";
    setErrors(e);

    if (Object.keys(e).length) {
      setToast({
        type: "error",
        title: "Validation Incomplete",
        message: "Please complete all required fields before saving.",
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // TODO: call your API here
    console.log("Questionnaire updated:", {
      id: source.id,
      name: name.trim(),
      category,
      active,
      description: description.trim(),
      questions,
      settings: { dueDate, reminder, notifyPatient: notify, allowSaveAndResume: allowResume },
    });
    setToast({
      type: "success",
      title: "Questionnaire Updated",
      message: `${name.trim()} has been updated successfully.`,
    });
  };

  const goBack = () => router.push("/questionnaires");

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
          { label: "Edit Questionnaire" },
        ]}
      />

      {/* Title + actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-heading sm:text-xl 2xl:text-2xl">Edit Questionnaire</h2>
          <p className="mt-0.5 text-sm text-body">
            Update the details, questions or settings for this questionnaire.
          </p>
        </div>
        <div className="flex flex-row gap-2">
          <ImportButton text="Cancel" icon={null} onClick={goBack} className="flex-1 sm:flex-none" />
          <AddButton
            text="Save Changes"
            icon={<Save className="h-4 w-4" />}
            onClick={handleSave}
            className="flex-1 whitespace-nowrap sm:flex-none"
          />
        </div>
      </div>

      {/* Basic information */}
      <Card
        icon={FileText}
        title="Basic Information"
        subtitle="Update the questionnaire name, category and description."
      >
        <div className="grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1.3fr)_minmax(0,1fr)]">
          <div>
            <SignupField
              name="questionnaireName"
              label={<ReqLabel>Questionnaire Name</ReqLabel>}
              placeholder="Enter questionnaire name"
              maxLength={100}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErrors((er) => ({ ...er, name: undefined }));
              }}
              error={errors.name}
            />
            <p className="text-right text-[11px] text-body">{name.length}/100</p>
          </div>
          <SignupDropdown
            name="questionnaireCategory"
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
          <div>
            <p className="mb-2 text-sm font-medium text-label">Status</p>
            <div className="flex h-12 items-center justify-between rounded-xl border border-border bg-card px-3">
              <Tags text={active ? "Active" : "Inactive"} tone={active ? "success" : "neutral"} />
              <TogglableSwitch checked={active} onChange={setActive} ariaLabel="Questionnaire active" />
            </div>
          </div>
        </div>

        <div className="mt-2">
          <ModalTextarea
            id="questionnaire-description"
            label="Description"
            placeholder="Describe what this questionnaire is for"
            value={description}
            onChange={setDescription}
          />
        </div>
      </Card>

      {/* Questions */}
      <Card
        icon={ListChecks}
        title="Questions"
        subtitle="Add, edit or remove questions from this questionnaire."
        action={
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
            <div className="sm:w-64">
              <GlobalSearch
                placeholder="Search questions..."
                width="sm"
                onSearch={(value) => {
                  setQuestionSearch(value);
                  setPage(1);
                }}
              />
            </div>
            <AddButton
              text="Add Question"
              icon={<Plus className="h-4 w-4" />}
              onClick={() => console.log("add question") /* TODO: open add-question modal */}
              className="whitespace-nowrap"
            />
          </div>
        }
      >
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          {visible.length === 0 ? (
            <TableStatus variant="empty" message="No questions found." />
          ) : (
            <Table columns={columns} rows={rows} bordered={false} />
          )}
        </div>

        {filtered.length > 0 && (
          <div className="mt-3">
            <Pagination
              page={safePage}
              totalPages={totalPages}
              totalItems={filtered.length}
              pageSize={PAGE_SIZE}
              itemLabel="questions"
              onChange={setPage}
            />
          </div>
        )}
      </Card>

      {/* Settings */}
      <Card
        icon={Settings}
        title="Settings"
        subtitle="Configure scheduling, notifications and other options for this questionnaire."
      >
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.4fr)] md:items-start">
          <DatePicker
            name="questionnaireDueDate"
            label="Due Date"
            value={dueDate}
            onChange={setDueDate}
            align="auto"
          />
          <SignupDropdown
            name="questionnaireReminder"
            label="Send Reminder"
            placeholder="Select reminder"
            searchable={false}
            options={REMINDER_OPTIONS}
            value={reminder}
            onChange={setReminder}
          />
          <div className="space-y-3 md:pt-9">
            <TogglableSwitch checked={notify} onChange={setNotify} label="Send notification to patient" />
            <TogglableSwitch checked={allowResume} onChange={setAllowResume} label="Allow patient to save and resume later" />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default EditQuestionnaire;