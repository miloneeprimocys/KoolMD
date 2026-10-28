"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
    AlignLeft,
    Calendar,
    CheckSquare,
    ChevronDown,
    ChevronUp,
    CircleDot,
    Eye,
    FileText,
    GripVertical,
    Hash,
    Heading,
    Info,
    Paperclip,
    Save,
    SlidersHorizontal,
    ToggleLeft,
    Type,
    Plus,
    X,
    type LucideIcon,
} from "lucide-react";

import Breadcrumb from "@/components/Breadcrumb";
import AddButton from "@/components/Addbutton";
import AddInternalButton from "@/components/AddInternalButton";
import ImportButton from "@/components/ImportButton";
import EditButton from "@/components/EditButton";
import Tags from "@/components/Tags";
import Actions from "@/components/Actions";
import RadioCheckButtonh from "@/components/RadioCheckButtonh";
import SignupField, { FieldError } from "@/components/SignupField";
import SignupDropdown from "@/components/SignupDropdown";
import { OptLabel, ReqLabel, toOptions } from "@/components/Modalshell";

import { CATEGORY_TONE } from "./Questionnairelist";

const LIST_ROUTE = "/questionnaires";
const CATEGORY_OPTIONS = toOptions(Object.keys(CATEGORY_TONE));

/* ---------------------------------------------------------------- */
/*  Question types                                                   */
/* ---------------------------------------------------------------- */
type QType =
    | "short"
    | "long"
    | "choice"
    | "checkbox"
    | "yesno"
    | "date"
    | "number"
    | "scale"
    | "dropdown"
    | "file"
    | "header"
    | "instruction";

const QUESTION_TYPES: { key: QType; label: string; icon: LucideIcon; tone: string }[] = [
    { key: "short", label: "Text (Short Answer)", icon: Type, tone: "bg-violet/80 text-on-primary" },
    { key: "long", label: "Text (Long Answer)", icon: AlignLeft, tone: "bg-primary/80 text-on-primary" },
    { key: "choice", label: "Multiple Choice", icon: CircleDot, tone: "bg-violet/80 text-on-primary" },
    { key: "checkbox", label: "Checkbox", icon: CheckSquare, tone: "bg-primary/80 text-on-primary" },
    { key: "yesno", label: "Yes / No", icon: ToggleLeft, tone: "bg-violet/80 text-on-primary" },
    { key: "date", label: "Date", icon: Calendar, tone: "bg-warning/80 text-heading" },
    { key: "number", label: "Number", icon: Hash, tone: "bg-violet/80 text-on-primary" },
    { key: "scale", label: "Scale (1–5)", icon: SlidersHorizontal, tone: "bg-warning/80 text-heading" },
    { key: "dropdown", label: "Dropdown", icon: ChevronDown, tone: "bg-primary/80 text-on-primary" },
    { key: "file", label: "File Upload", icon: Paperclip, tone: "bg-primary/80 text-on-primary" },
    { key: "header", label: "Section Header", icon: Heading, tone: "bg-violet/80 text-on-primary" },
    { key: "instruction", label: "Instruction Text", icon: Info, tone: "bg-primary/80 text-on-primary" },
];

const TYPE_OPTIONS = QUESTION_TYPES.map((t) => ({ value: t.key, label: t.label }));
const getType = (key: QType) => QUESTION_TYPES.find((t) => t.key === key) ?? QUESTION_TYPES[0];
/** Section headers and instruction text are not answerable questions. */
const isInput = (type: QType) => type !== "header" && type !== "instruction";

const TypeIcon = ({ type }: { type: QType }) => {
    const t = getType(type);
    const Icon = t.icon;
    return (
        <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${t.tone}`}>
            <Icon className="h-3.5 w-3.5" />
        </span>
    );
};

/* ---------------------------------------------------------------- */
/*  Types + sample data                                              */
/* ---------------------------------------------------------------- */
type Question = {
    id: string;
    type: QType;
    text: string;
    required: boolean;
    options: string[]; // choice / checkbox / dropdown
    min: string; // number
    max: string; // number
    lowLabel: string; // scale
    highLabel: string; // scale
    fileTypes: string; // file upload
};

const hasOptions = (type: QType) => type === "choice" || type === "checkbox" || type === "dropdown";

type Section = {
    id: string;
    title: string;
    description: string;
    open: boolean;
    questions: Question[];
};

const mk = (id: string, type: QType, text: string, required: boolean, extra: Partial<Question> = {}): Question => ({
    id,
    type,
    text,
    required,
    options: hasOptions(type) ? ["Option 1", "Option 2"] : [],
    min: "",
    max: "",
    lowLabel: "",
    highLabel: "",
    fileTypes: "",
    ...extra,
});

const INITIAL_SECTIONS: Section[] = [
    {
        id: "s1",
        title: "Personal Information",
        description: "Collect basic demographic information.",
        open: true,
        questions: [
            mk("q1", "short", "What is your full name?", true),
            mk("q2", "date", "What is your date of birth?", true),
            mk("q3", "choice", "What is your gender?", true, { options: ["Male", "Female", "Other", "Prefer not to say"] }),
            mk("q4", "short", "What is your preferred phone number?", false),
        ],
    },
    {
        id: "s2",
        title: "Medical History",
        description: "Past medical conditions and current health status.",
        open: true,
        questions: [
            mk("q5", "checkbox", "Do you have any allergies?", true, { options: ["Food", "Drug", "Pollen", "None"] }),
            mk("q6", "long", "What is your medical history?", false),
            mk("q7", "yesno", "Are you currently taking any medications?", false),
        ],
    },
    {
        id: "s3",
        title: "Lifestyle & Habits",
        description: "Lifestyle and wellness information.",
        open: false,
        questions: [
            mk("q8", "yesno", "Do you smoke?", false),
            mk("q9", "choice", "How often do you exercise?", false, { options: ["Daily", "Weekly", "Rarely", "Never"] }),
            mk("q10", "choice", "How would you describe your diet?", false, { options: ["Vegetarian", "Non-vegetarian", "Vegan", "Other"] }),
        ],
    },
    {
        id: "s4",
        title: "Consent & Acknowledgement",
        description: "Patient consent and agreement.",
        open: false,
        questions: [
            mk("q11", "checkbox", "I consent to treatment.", true, { options: ["I agree"] }),
            mk("q12", "short", "Signature (type your full name)", true),
        ],
    },
];

type Errors = { name?: string; category?: string; builder?: string };

/* ---------------------------------------------------------------- */
/*  Section kebab menu                                               */
/* ---------------------------------------------------------------- */
const SectionMenu = ({
    onRename,
    onDelete,
    canDelete,
}: {
    onRename: () => void;
    onDelete: () => void;
    canDelete: boolean;
}) => {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [open]);

    return (
        <div ref={ref} className="relative">
            <Actions actions={["more"]} onAction={() => setOpen((o) => !o)} />
            {open && (
                <div className="absolute right-0 top-full z-30 mt-1 w-44 rounded-lg border border-border bg-card py-1 shadow-lg">
                    <button
                        type="button"
                        onClick={() => {
                            setOpen(false);
                            onRename();
                        }}
                        className="flex w-full cursor-pointer items-center px-3 py-2 text-left text-sm text-heading transition-colors hover:bg-primary/5"
                    >
                        Rename Section
                    </button>
                    <button
                        type="button"
                        disabled={!canDelete}
                        onClick={() => {
                            setOpen(false);
                            onDelete();
                        }}
                        className="flex w-full cursor-pointer items-center px-3 py-2 text-left text-sm text-danger transition-colors hover:bg-danger/10 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        Delete Section
                    </button>
                </div>
            )}
        </div>
    );
};

/* ---------------------------------------------------------------- */
/*  Page                                                             */
/* ---------------------------------------------------------------- */
const CreateQuestionnaire = () => {
    const router = useRouter();
    const idSeed = useRef(100);

    const [name, setName] = useState("New Patient Intake");
    const [category, setCategory] = useState("Intake");
    const [version, setVersion] = useState("v1.0");
    const [description, setDescription] = useState(
        "Collect initial demographic, medical and lifestyle information from new patients.",
    );
    const [sections, setSections] = useState<Section[]>(INITIAL_SECTIONS);
    const [errors, setErrors] = useState<Errors>({});

    const [renamingId, setRenamingId] = useState<string | null>(null);
    const [activeSectionId, setActiveSectionId] = useState(INITIAL_SECTIONS[0].id);

    /* Inline question editing */
    const [editing, setEditing] = useState<{ sectionId: string; id: string } | null>(null);
    const [editError, setEditError] = useState<string | undefined>();

    /* Drag to reorder inside a section (the grip arms the row) */
    const [armedId, setArmedId] = useState<string | null>(null);
    const dragFrom = useRef<{ sectionId: string; index: number } | null>(null);
    const [dragOver, setDragOver] = useState<string | null>(null);

    const totalQuestions = sections.reduce((sum, s) => sum + s.questions.filter((q) => isInput(q.type)).length, 0);
    const allOpen = sections.every((s) => s.open);

    /* ---------- Section helpers ---------- */
    const patchSection = (id: string, patch: Partial<Section>) =>
        setSections((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));

    const addSection = () => {
        const id = `s${Date.now().toString(36)}`;
        setSections((prev) => [
            ...prev,
            { id, title: `New Section ${prev.length + 1}`, description: "Describe this section.", open: true, questions: [] },
        ]);
        setActiveSectionId(id);
        setRenamingId(id);
        setErrors((p) => ({ ...p, builder: undefined }));
    };

    const deleteSection = (id: string) => {
        setSections((prev) => {
            const next = prev.filter((s) => s.id !== id);
            if (activeSectionId === id && next[0]) setActiveSectionId(next[0].id);
            return next;
        });
    };

    const toggleAll = () => setSections((prev) => prev.map((s) => ({ ...s, open: !allOpen })));

    /* ---------- Question helpers ---------- */
    const addQuestion = (sectionId: string, type: QType = "short") => {
        const id = `q${idSeed.current++}`;
        setActiveSectionId(sectionId);
        setSections((prev) =>
            prev.map((s) =>
                s.id === sectionId ? { ...s, open: true, questions: [...s.questions, mk(id, type, "", false)] } : s,
            ),
        );
        setEditing({ sectionId, id });
        setEditError(undefined);
        setErrors((p) => ({ ...p, builder: undefined }));
    };

    const updateQuestion = (sectionId: string, id: string, patch: Partial<Question>) => {
        setSections((prev) =>
            prev.map((s) =>
                s.id === sectionId ? { ...s, questions: s.questions.map((q) => (q.id === id ? { ...q, ...patch } : q)) } : s,
            ),
        );
        if ("text" in patch) setEditError(undefined);
    };

    const removeQuestion = (sectionId: string, id: string) => {
        setSections((prev) =>
            prev.map((s) => (s.id === sectionId ? { ...s, questions: s.questions.filter((q) => q.id !== id) } : s)),
        );
        if (editing?.id === id) setEditing(null);
    };
    const changeType = (sectionId: string, q: Question, type: QType) => {
        const patch: Partial<Question> = { type };
        // seed options when switching to an option-based type
        if (hasOptions(type) && q.options.length === 0) patch.options = ["Option 1", "Option 2"];
        if (type === "header" || type === "instruction") patch.required = false;
        updateQuestion(sectionId, q.id, patch);
    };

    const setOption = (sectionId: string, q: Question, i: number, value: string) =>
        updateQuestion(sectionId, q.id, { options: q.options.map((o, idx) => (idx === i ? value : o)) });

    const addOption = (sectionId: string, q: Question) =>
        updateQuestion(sectionId, q.id, { options: [...q.options, `Option ${q.options.length + 1}`] });

    const removeOption = (sectionId: string, q: Question, i: number) =>
        updateQuestion(sectionId, q.id, { options: q.options.filter((_, idx) => idx !== i) });
    const finishEdit = () => {
        if (!editing) return;
        const question = sections.find((s) => s.id === editing.sectionId)?.questions.find((q) => q.id === editing.id);
        if (!question?.text.trim()) {
            setEditError("Question text is required");
            return;
        }
        if (hasOptions(question.type)) {
            const cleaned = question.options.map((o) => o.trim()).filter(Boolean);
            const min = question.type === "checkbox" ? 1 : 2;
            if (cleaned.length < min) {
                setEditError(`Add at least ${min} option${min > 1 ? "s" : ""}`);
                return;
            }
            updateQuestion(editing.sectionId, question.id, { options: cleaned });
        }
        setEditError(undefined);
        setEditing(null);
    };

    const dropOn = (sectionId: string, to: number) => {
        const from = dragFrom.current;
        dragFrom.current = null;
        setDragOver(null);
        setArmedId(null);
        if (!from || from.sectionId !== sectionId || from.index === to) return;
        setSections((prev) =>
            prev.map((s) => {
                if (s.id !== sectionId) return s;
                const next = [...s.questions];
                const [moved] = next.splice(from.index, 1);
                next.splice(to, 0, moved);
                return { ...s, questions: next };
            }),
        );
    };

    /* ---------- Save / publish ---------- */
    const submit = (mode: "draft" | "publish") => {
        const e: Errors = {};
        if (!name.trim()) e.name = "Questionnaire name is required";
        if (mode === "publish") {
            if (!category) e.category = "Select a category";
            if (totalQuestions === 0) e.builder = "Add at least one question before publishing";
        }
        setErrors(e);
        if (Object.keys(e).length) return;

        // TODO: call your API here
        console.log(mode === "draft" ? "Questionnaire saved as draft:" : "Questionnaire published:", {
            name,
            category,
            version,
            description,
            sections,
        });
        router.push(LIST_ROUTE);
    };

    return (
        <div className="mx-auto w-full max-w-[1600px] space-y-4 sm:space-y-5">
            <Breadcrumb
                items={[
                    { label: "Dashboard", href: "/dashboard" },
                    { label: "Questionnaires", href: LIST_ROUTE },
                    { label: "Create Questionnaire" },
                ]}
            />

            {/* Title + actions */}
            <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-heading sm:text-xl 2xl:text-2xl">Create Questionnaire</h2>
                    <p className="mt-0.5 text-sm text-body">
                        Build a new questionnaire form for patients. Add questions, organize sections and configure settings.
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <ImportButton text="Cancel" icon={null} onClick={() => router.push(LIST_ROUTE)} />

                    <AddButton
                        text="Publish"
                        icon={<Plus className="h-4 w-4" />}
                        onClick={() => submit("publish")}
                        className="whitespace-nowrap"
                    />
                </div>
            </div>

            {/* ================= Basic information ================= */}
            {/* <section className="rounded-[14px] border border-border bg-card p-4 sm:p-6">
        <div className="mb-4 flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <FileText className="h-4 w-4" />
          </span>
          <h3 className="text-base font-semibold text-heading">Basic Information</h3>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_160px_minmax(0,1.4fr)]">
          <SignupField
            name="questionnaireName"
            label={<ReqLabel>Questionnaire Name</ReqLabel>}
            placeholder="Enter questionnaire name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setErrors((p) => ({ ...p, name: undefined }));
            }}
            error={errors.name}
          />
          <SignupDropdown
            name="questionnaireCategory"
            label={<ReqLabel>Category</ReqLabel>}
            placeholder="Select category"
            options={CATEGORY_OPTIONS}
            value={category}
            onChange={(v) => {
              setCategory(v);
              setErrors((p) => ({ ...p, category: undefined }));
            }}
            error={errors.category}
          />
          <SignupField
            name="questionnaireVersion"
            label="Version"
            placeholder="v1.0"
            value={version}
            onChange={(e) => setVersion(e.target.value)}
          />
          <SignupField
            name="questionnaireDescription"
            multiline
            rows={4}
            maxLength={500}
            label={<OptLabel>Description</OptLabel>}
            placeholder="Describe what this questionnaire is for"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
      </section> */}

            {/* ================= Builder ================= */}
            <section className="rounded-[14px] border border-border bg-card p-4 sm:p-6">
                <div className="mb-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <FileText className="h-4 w-4" />
                        </span>
                        <h3 className="text-base font-semibold text-heading">Questionnaire Builder</h3>
                    </div>
                    <EditButton
                        section="Questionnaire Builder"
                        variant="viewAll"
                        label={allOpen ? "Collapse All" : "Expand All"}
                        hideIcon
                        onEdit={toggleAll}
                    />
                </div>

                <div className="grid items-start gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
                    {/* Palette */}
                    <div className="lg:sticky lg:top-4 lg:self-start lg:max-h-[calc(100dvh-2rem)] lg:overflow-y-auto hide-scrollbar">
                        <p className="mb-3 text-sm font-semibold text-heading">Add Question</p>
                        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
                            {QUESTION_TYPES.map((t) => (
                                <button
                                    key={t.key}
                                    type="button"
                                    onClick={() => addQuestion(activeSectionId, t.key)}
                                    className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg border border-border bg-card px-3 py-2 text-left text-sm text-heading transition-colors hover:border-primary/40 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                                >
                                    <TypeIcon type={t.key} />
                                    <span className="truncate">{t.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Sections */}
                    <div className="min-w-0 space-y-3">
                        {sections.map((section, sIndex) => {
                            const renaming = renamingId === section.id;
                            return (
                                <div
                                    key={section.id}
                                    onClick={() => setActiveSectionId(section.id)}
                                    className={`rounded-xl border bg-primary/[0.03] ${activeSectionId === section.id ? "border-primary/40" : "border-border"
                                        }`}
                                >
                                    {/* Section header */}
                                    <div className="flex items-center gap-3 p-3 sm:p-4">
                                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                            <FileText className="h-4 w-4" />
                                        </span>

                                        {renaming ? (
                                            <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-2">
                                                <SignupField
                                                    name={`sectionTitle-${section.id}`}
                                                    placeholder="Section title"
                                                    value={section.title}
                                                    onChange={(e) => patchSection(section.id, { title: e.target.value })}
                                                />
                                                <SignupField
                                                    name={`sectionDescription-${section.id}`}
                                                    placeholder="Section description"
                                                    value={section.description}
                                                    onChange={(e) => patchSection(section.id, { description: e.target.value })}
                                                />
                                            </div>
                                        ) : (
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-semibold text-heading">
                                                    {sIndex + 1}. {section.title}
                                                </p>
                                                <p className="truncate text-xs text-body">{section.description}</p>
                                            </div>
                                        )}

                                        {renaming ? (
                                            <ImportButton text="Done" icon={null} onClick={() => setRenamingId(null)} className="shrink-0" />
                                        ) : (
                                            <>
                                                <span className="hidden shrink-0 text-xs text-body sm:inline">
                                                    {section.questions.length} Question{section.questions.length === 1 ? "" : "s"}
                                                </span>
                                                <button
                                                    type="button"
                                                    aria-label={section.open ? "Collapse section" : "Expand section"}
                                                    aria-expanded={section.open}
                                                    onClick={() => patchSection(section.id, { open: !section.open })}
                                                    className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-body transition-colors hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                                                >
                                                    {section.open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                                </button>
                                                <SectionMenu
                                                    canDelete={sections.length > 1}
                                                    onRename={() => setRenamingId(section.id)}
                                                    onDelete={() => deleteSection(section.id)}
                                                />
                                            </>
                                        )}
                                    </div>

                                    {/* Questions */}
                                    {section.open && (
                                        <div className="space-y-2 px-3 pb-3 sm:px-4 sm:pb-4">
                                            <ul className="space-y-2">
                                                {section.questions.map((q, qIndex) => {
                                                    const key = `${section.id}:${qIndex}`;
                                                    const isEditing = editing?.id === q.id;

                                                    /* ---- Inline editor ---- */
                                                    if (isEditing) {
                                                        return (
                                                            <li key={q.id} className="rounded-lg border border-primary/40 bg-card p-3">
                                                                <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
                                                                    <SignupField
                                                                        name={`questionText-${q.id}`}
                                                                        label={<ReqLabel>{q.type === "header" ? "Heading Text" : q.type === "instruction" ? "Instruction Text" : "Question Text"}</ReqLabel>}
                                                                        placeholder="Enter your question"
                                                                        value={q.text}
                                                                        error={editError === "Question text is required" ? editError : undefined}
                                                                        onChange={(e) => updateQuestion(section.id, q.id, { text: e.target.value })}
                                                                        autoFocus
                                                                    />
                                                                    <SignupDropdown
                                                                        name={`questionType-${q.id}`}
                                                                        label="Question Type"
                                                                        placeholder="Select type"
                                                                        searchable={false}
                                                                        options={TYPE_OPTIONS}
                                                                        value={q.type}
                                                                        onChange={(v) => changeType(section.id, q, v as QType)}
                                                                    />
                                                                </div>
                                                                {/* ---- Options (choice / checkbox / dropdown) ---- */}
                                                                {hasOptions(q.type) && (
                                                                    <div className="mt-3 space-y-2">
                                                                        <p className="text-sm font-semibold text-heading">Options</p>
                                                                        {q.options.map((opt, i) => (
                                                                            <div key={i} className="flex items-center gap-2">
                                                                                <span className="w-5 shrink-0 text-xs text-body">{i + 1}.</span>
                                                                                <div className="min-w-0 flex-1">
                                                                                    <SignupField
                                                                                        name={`option-${q.id}-${i}`}
                                                                                        placeholder={`Option ${i + 1}`}
                                                                                        value={opt}
                                                                                        onChange={(e) => setOption(section.id, q, i, e.target.value)}
                                                                                    />
                                                                                </div>
                                                                                <button
                                                                                    type="button"
                                                                                    aria-label={`Remove option ${i + 1}`}
                                                                                    disabled={q.options.length <= 1}
                                                                                    onClick={() => removeOption(section.id, q, i)}
                                                                                    className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-body transition-colors hover:bg-danger/10 hover:text-danger disabled:cursor-not-allowed disabled:opacity-40"
                                                                                >
                                                                                    <X className="h-4 w-4" />
                                                                                </button>
                                                                            </div>
                                                                        ))}
                                                                        <ImportButton
                                                                            text="Add Option"
                                                                            icon={<Plus className="h-4 w-4" />}
                                                                            onClick={() => addOption(section.id, q)}
                                                                            className="w-fit text-primary"
                                                                        />
                                                                        <FieldError message={editError?.startsWith("Add at least") ? editError : undefined} />
                                                                    </div>
                                                                )}

                                                                {/* ---- Number: min / max ---- */}
                                                                {q.type === "number" && (
                                                                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                                                                        <SignupField
                                                                            name={`min-${q.id}`}
                                                                            label="Minimum value"
                                                                            placeholder="e.g. 0"
                                                                            value={q.min}
                                                                            onChange={(e) => updateQuestion(section.id, q.id, { min: e.target.value })}
                                                                        />
                                                                        <SignupField
                                                                            name={`max-${q.id}`}
                                                                            label="Maximum value"
                                                                            placeholder="e.g. 100"
                                                                            value={q.max}
                                                                            onChange={(e) => updateQuestion(section.id, q.id, { max: e.target.value })}
                                                                        />
                                                                    </div>
                                                                )}

                                                                {/* ---- Scale: end labels ---- */}
                                                                {q.type === "scale" && (
                                                                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                                                                        <SignupField
                                                                            name={`low-${q.id}`}
                                                                            label="Label for 1"
                                                                            placeholder="e.g. Not at all"
                                                                            value={q.lowLabel}
                                                                            onChange={(e) => updateQuestion(section.id, q.id, { lowLabel: e.target.value })}
                                                                        />
                                                                        <SignupField
                                                                            name={`high-${q.id}`}
                                                                            label="Label for 5"
                                                                            placeholder="e.g. Extremely"
                                                                            value={q.highLabel}
                                                                            onChange={(e) => updateQuestion(section.id, q.id, { highLabel: e.target.value })}
                                                                        />
                                                                    </div>
                                                                )}

                                                                {/* ---- File upload: allowed types ---- */}
                                                                {q.type === "file" && (
                                                                    <div className="mt-3">
                                                                        <SignupField
                                                                            name={`fileTypes-${q.id}`}
                                                                            label="Allowed file types"
                                                                            placeholder="e.g. PDF, JPG, PNG"
                                                                            value={q.fileTypes}
                                                                            onChange={(e) => updateQuestion(section.id, q.id, { fileTypes: e.target.value })}
                                                                        />
                                                                    </div>
                                                                )}

                                                                {/* ---- Yes/No: fixed preview ---- */}
                                                                {q.type === "yesno" && (
                                                                    <p className="mt-3 text-xs text-body">Patients will see two choices: Yes and No.</p>
                                                                )}
                                                                <div className="mt-3 flex items-center justify-between gap-3">
                                                                    {isInput(q.type) ? (
                                                                        <label className="flex cursor-pointer items-center gap-2.5 text-sm text-heading">
                                                                            <RadioCheckButtonh
                                                                                type="checkbox"
                                                                                checked={q.required}
                                                                                onChange={(e) => updateQuestion(section.id, q.id, { required: e.target.checked })}
                                                                            />
                                                                            Required question
                                                                        </label>
                                                                    ) : (
                                                                        <span />
                                                                    )}
                                                                    <ImportButton text="Done" icon={null} onClick={finishEdit} className="shrink-0" />
                                                                </div>
                                                            </li>
                                                        );
                                                    }

                                                    /* ---- Row ---- */
                                                    return (
                                                        <li
                                                            key={q.id}
                                                            draggable={armedId === q.id}
                                                            onDragStart={() => (dragFrom.current = { sectionId: section.id, index: qIndex })}
                                                            onDragOver={(e) => {
                                                                e.preventDefault();
                                                                setDragOver(key);
                                                            }}
                                                            onDrop={() => dropOn(section.id, qIndex)}
                                                            onDragEnd={() => {
                                                                dragFrom.current = null;
                                                                setDragOver(null);
                                                                setArmedId(null);
                                                            }}
                                                            className={`flex items-center gap-3 rounded-lg border px-3 py-2 ${dragOver === key ? "border-primary bg-primary/10" : "border-border bg-card"
                                                                }`}
                                                        >
                                                            <button
                                                                type="button"
                                                                aria-label={`Drag to reorder question ${qIndex + 1}`}
                                                                onMouseDown={() => setArmedId(q.id)}
                                                                onMouseUp={() => setArmedId(null)}
                                                                className="shrink-0 cursor-grab text-body focus-visible:outline-none"
                                                            >
                                                                <GripVertical className="h-4 w-4" />
                                                            </button>
                                                            <span className="w-5 shrink-0 text-xs text-body">{qIndex + 1}.</span>
                                                            <TypeIcon type={q.type} />
                                                            <div className="min-w-0 flex-1">
                                                                <p className="truncate text-sm font-semibold text-heading">{q.text || "Untitled question"}</p>
                                                                {hasOptions(q.type) && q.options.length > 0 && (
                                                                    <p className="truncate text-xs text-body">{q.options.join(" · ")}</p>
                                                                )}
                                                                {q.type === "number" && (q.min || q.max) && (
                                                                    <p className="truncate text-xs text-body">Range: {q.min || "–"} to {q.max || "–"}</p>
                                                                )}
                                                                {q.type === "file" && q.fileTypes && <p className="truncate text-xs text-body">Allowed: {q.fileTypes}</p>}
                                                            </div>
                                                            <span className="hidden shrink-0 text-xs text-body md:inline">{getType(q.type).label}</span>
                                                            {isInput(q.type) && (
                                                                <Tags
                                                                    text={q.required ? "Required" : "Optional"}
                                                                    tone={q.required ? "danger" : "neutral"}
                                                                    size="xs"
                                                                />
                                                            )}
                                                            <Actions
                                                                actions={["edit", "delete"]}
                                                                size="sm"
                                                                onAction={(action) => {
                                                                    if (action === "edit") {
                                                                        setEditing({ sectionId: section.id, id: q.id });
                                                                        setEditError(undefined);
                                                                    } else if (action === "delete") removeQuestion(section.id, q.id);
                                                                }}
                                                            />
                                                        </li>
                                                    );
                                                })}
                                            </ul>

                                            <AddInternalButton
                                                text="Add Question"
                                                onClick={() => addQuestion(section.id)}
                                                className="h-10! w-full justify-center"
                                            />
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        <FieldError message={errors.builder} />

                        <ImportButton
                            text="Add Section"
                            icon={<Plus className="h-4 w-4" />}
                            onClick={addSection}
                            className="w-fit text-primary"
                        />
                    </div>
                </div>
            </section>
        </div>
    );
};

export default CreateQuestionnaire;