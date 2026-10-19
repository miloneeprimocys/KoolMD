"use client";

import RadioCheckButtonh from "@/components/RadioCheckButtonh";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search } from "lucide-react";

import { useAppDispatch, useAppSelector } from "@/hooks/useAppHooks";
import { hideModal } from "@/redux/slices/dialogslice";

import ModalShell, {
  ModalDateField,
  ReqLabel,
  SignupDropdown,
  SignupField,
  toOptions,
  todayISO,
} from "@/components/Modalshell";
import { FieldError } from "@/components/SignupField";
import AddButton from "@/components/Addbutton";
import ImportButton from "@/components/ImportButton";
import TogglableSwitch from "@/components/Togglableswitch";
import Table from "@/components/Table";
import { type TableColumn } from "@/components/Tableheader";
import Pagination from "@/components/Pagination";
import { TableSelectAllCheckbox } from "@/components/TableSelection";
import { QUESTIONNAIRES, checkboxCls } from "./Questionnairelist";

/* ---------- Static data (replace with API data later) ---------- */
type PatientRow = { id: string; name: string; dob: string; gender: "Male" | "Female" };

const p = (id: string, name: string, dob: string, gender: PatientRow["gender"]): PatientRow => ({
  id,
  name,
  dob,
  gender,
});

const PATIENTS: PatientRow[] = [
  p("KMD-0000003", "milonee primocys", "Jul 11, 2005", "Female"),
  p("KMD-0000008", "Rohan Mehta", "Mar 5, 1988", "Male"),
  p("KMD-0000012", "Priya Sharma", "Feb 14, 1990", "Female"),
  p("KMD-0000019", "Amit Patel", "Aug 22, 1978", "Male"),
  p("KMD-0000021", "Neha Shah", "Jan 9, 1992", "Female"),
  p("KMD-0000023", "Diya Shah", "Apr 18, 2000", "Female"),
  p("KMD-0000026", "Manish Trivedi", "Nov 2, 1973", "Male"),
  p("KMD-0000028", "Pooja Vora", "Jun 30, 1987", "Female"),
  p("KMD-0000031", "Vikram Singh", "Sep 12, 1984", "Male"),
  p("KMD-0000034", "Anjali Joshi", "Dec 25, 1995", "Female"),
  p("KMD-0000037", "Karan Desai", "May 7, 1996", "Male"),
  p("KMD-0000040", "Sneha Kapoor", "Oct 1, 1991", "Female"),
  p("KMD-0000042", "Rahul Verma", "Jan 21, 1982", "Male"),
  p("KMD-0000045", "Isha Nair", "Jul 4, 1999", "Female"),
  p("KMD-0000047", "Arjun Reddy", "Aug 16, 1976", "Male"),
  p("KMD-0000050", "Meera Iyer", "Mar 29, 1989", "Female"),
  p("KMD-0000052", "Siddharth Rao", "Feb 3, 1993", "Male"),
  p("KMD-0000055", "Tanvi Bhatt", "Sep 9, 2002", "Female"),
  p("KMD-0000058", "Nikhil Gupta", "Nov 19, 1980", "Male"),
  p("KMD-0000060", "Kavya Menon", "Jun 14, 1997", "Female"),
  p("KMD-0000063", "Harsh Pandya", "Apr 2, 1985", "Male"),
  p("KMD-0000066", "Riya Sethi", "Dec 8, 1994", "Female"),
  p("KMD-0000069", "Yash Chauhan", "Jul 27, 1979", "Male"),
  p("KMD-0000071", "Divya Pillai", "May 22, 1990", "Female"),
];

const QUESTIONNAIRE_OPTIONS = QUESTIONNAIRES.filter((q) => q.status === "Active").map((q) => ({
  value: q.id,
  label: q.name,
}));

const REMINDER_OPTIONS = toOptions([
  "No reminder",
  "1 day before due date",
  "2 days before due date",
  "3 days before due date",
  "1 week before due date",
]);

const PAGE_SIZE = 5;

const addDays = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const initials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0]?.toUpperCase())
    .slice(0, 2)
    .join("");

/* ---------- Small pieces ---------- */
const Section = ({
  step,
  title,
  action,
  children,
}: {
  step: number;
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) => (
  <section className="rounded-xl border border-border bg-primary/[0.03] p-3 sm:p-4">
    <div className="mb-3 flex flex-wrap items-center justify-between gap-0">
      <div className="flex items-center gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-on-primary">
          {step}
        </span>
        <h4 className="text-sm font-semibold text-heading sm:text-base -mt-1 sm:mt-0">{title}</h4>
      </div>
      {action}
    </div>
    {children}
  </section>
);

/* ---------- Form model ---------- */
type Errors = { questionnaire?: string; patients?: string; dueDate?: string };

/* ---------- Component ---------- */
const AssignQuestionnaireModal = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const open = useAppSelector((s) => s.dialog.AssignQuestionnaire);
  const targetId = useAppSelector((s) => s.dialog.assignQuestionnaireId);

  const [questionnaire, setQuestionnaire] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [patientSearch, setPatientSearch] = useState("");
  const [page, setPage] = useState(1);
  const [dueDate, setDueDate] = useState("");
  const [reminder, setReminder] = useState("2 days before due date");
  const [notify, setNotify] = useState(true);
  const [allowResume, setAllowResume] = useState(true);
  const [errors, setErrors] = useState<Errors>({});

  /* Fresh form every time the modal opens (preselects the questionnaire it was opened for). */
  useEffect(() => {
    if (!open) return;
    setQuestionnaire(targetId ?? QUESTIONNAIRES[0].id);
    setSelected(new Set(["KMD-0000003", "KMD-0000008"]));
    setPatientSearch("");
    setPage(1);
    setDueDate(addDays(7));
    setReminder("2 days before due date");
    setNotify(true);
    setAllowResume(true);
    setErrors({});
  }, [open, targetId]);

  const handleClose = () => dispatch(hideModal("AssignQuestionnaire"));

  /* ---------- Patients table ---------- */
  const filtered = useMemo(() => {
    const q = patientSearch.trim().toLowerCase();
    return q ? PATIENTS.filter((pt) => `${pt.name} ${pt.id}`.toLowerCase().includes(q)) : PATIENTS;
  }, [patientSearch]);

  const totalPages = Math.max(Math.ceil(filtered.length / PAGE_SIZE), 1);
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const onPageSelected = visible.filter((pt) => selected.has(pt.id)).length;
  const allOnPage = visible.length > 0 && onPageSelected === visible.length;
  const someOnPage = onPageSelected > 0 && !allOnPage;

  const togglePatient = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setErrors((e) => ({ ...e, patients: undefined }));
  };

  const togglePage = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      visible.forEach((pt) => (allOnPage ? next.delete(pt.id) : next.add(pt.id)));
      return next;
    });
    setErrors((e) => ({ ...e, patients: undefined }));
  };

  /** "Add Multiple Patients" — selects every patient matching the current search. */
  const addAllMatching = () => {
    setSelected((prev) => new Set([...prev, ...filtered.map((pt) => pt.id)]));
    setErrors((e) => ({ ...e, patients: undefined }));
  };

  const columns: TableColumn[] = [
    {
      key: "select",
      label: "",
      className: "w-10",
      header: (
        <TableSelectAllCheckbox
          checked={allOnPage}
          indeterminate={someOnPage}
          onChange={togglePage}
          className={checkboxCls}
        />
      ),
    },
    { key: "name", label: "Patient Name" },
    { key: "id", label: "Patient ID" },
    { key: "dob", label: "Date of Birth" },
    { key: "gender", label: "Gender" },
  ];

  const rows = visible.map((pt) => ({
    select: (
      <RadioCheckButtonh
        type="checkbox"
        checked={selected.has(pt.id)}
        onChange={() => togglePatient(pt.id)}
        aria-label={`Select ${pt.name}`}
        className={checkboxCls}
      />
    ),
    name: (
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-shape-sky/40 text-[11px] font-semibold text-heading">
          {initials(pt.name)}
        </span>
        <span className="truncate text-sm font-medium text-heading">{pt.name}</span>
      </div>
    ),
    id: <span className="whitespace-nowrap text-sm text-heading">{pt.id}</span>,
    dob: <span className="whitespace-nowrap text-sm text-heading">{pt.dob}</span>,
    gender: <span className="text-sm text-heading">{pt.gender}</span>,
  }));

  /* ---------- Submit ---------- */
  const handleSubmit = () => {
    const e: Errors = {};
    if (!questionnaire) e.questionnaire = "Please select a questionnaire";
    if (selected.size === 0) e.patients = "Select at least one patient";
    if (!dueDate) e.dueDate = "Due date is required";
    else if (dueDate < todayISO()) e.dueDate = "Due date cannot be in the past";
    setErrors(e);
    if (Object.keys(e).length) return;

    // TODO: call your API here
    console.log("Questionnaire assigned:", {
      questionnaireId: questionnaire,
      patientIds: [...selected],
      dueDate,
      reminder,
      notifyPatient: notify,
      allowSaveAndResume: allowResume,
    });
    handleClose();
  };

  return (
    <ModalShell
      open={open}
      onClose={handleClose}
      onSubmit={handleSubmit}
      title="Assign Questionnaire"
      subtitle="Select a questionnaire and assign it to patients."
      submitText="Assign Questionnaire"
      width={760}
      footer={
        <div className="flex items-center justify-between gap-2 sm:justify-end sm:gap-3">
          <ImportButton
            text="Cancel"
            icon={null}
            onClick={handleClose}
            className="shrink-0 px-3 sm:px-5"
          />
          <AddButton
            text="Assign Questionnaire"
            icon={null}
            onClick={handleSubmit}
            className="shrink-0 whitespace-nowrap px-3 text-xs sm:px-5 sm:text-sm"
          />
        </div>
      }
    >
      <div className="space-y-4">
        {/* 1. Select questionnaire */}
        <Section
          step={1}
          title="Select Questionnaire"
          action={
            <div className="w-full pl-10 sm:w-auto sm:pl-0">
              <button
                type="button"
                onClick={() => {
                  if (!questionnaire) return;
                  handleClose();
                  router.push(`/edit-questionnaire?id=${questionnaire}`);
                }}
                className="cursor-pointer text-xs font-medium text-primary transition-colors hover:text-primary-hover hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 sm:text-sm"
              >
                View Questionnaire
              </button>
            </div>
          }
        >
          <SignupDropdown
            id="aq-questionnaire"
            name="questionnaire"
            label={<ReqLabel>Questionnaire</ReqLabel>}
            placeholder="Select questionnaire"
            options={QUESTIONNAIRE_OPTIONS}
            value={questionnaire}
            onChange={(v) => {
              setQuestionnaire(v);
              setErrors((er) => ({ ...er, questionnaire: undefined }));
            }}
            error={errors.questionnaire}
            portalMenu
          />
        </Section>

        {/* 2. Select patients */}
        <Section
          step={2}
          title="Select Patients"
          action={
            <span className="text-xs text-body sm:text-sm">
              {selected.size} selected
            </span>
          }
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
            <div className="min-w-0 flex-1">
              <SignupField
                name="patientSearch"
                icon={<Search className="h-4 w-4" />}
                placeholder="Search patients by name or patient ID..."
                value={patientSearch}
                onChange={(e) => {
                  setPatientSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <ImportButton
              className="shrink-0 whitespace-nowrap text-primary"
              text="Add Multiple Patients"
              icon={<Plus className="h-4 w-4" />}
              onClick={addAllMatching}
            />
          </div>

          <div className="mt-1 overflow-hidden rounded-xl border border-border bg-card">
            {visible.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-body">No patients match your search.</p>
            ) : (
              <Table columns={columns} rows={rows} bordered={false} />
            )}
          </div>
          <FieldError message={errors.patients} />

          {filtered.length > 0 && (
            <div className="mt-3">
              <Pagination
                page={page}
                totalPages={totalPages}
                totalItems={filtered.length}
                pageSize={PAGE_SIZE}
                itemLabel="patients"
                onChange={setPage}
              />
            </div>
          )}
        </Section>

        {/* 3. Scheduling & settings */}
        <Section step={3} title="Scheduling & Settings">
          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.2fr)] md:items-start">
            <ModalDateField
              id="aq-due-date"
              label={<ReqLabel>Due Date</ReqLabel>}
              value={dueDate}
              min={todayISO()}
              onChange={(v) => {
                setDueDate(v);
                setErrors((er) => ({ ...er, dueDate: undefined }));
              }}
              error={errors.dueDate}
            />
            <SignupDropdown
              id="aq-reminder"
              name="reminder"
              label="Send Reminder"
              placeholder="Select reminder"
              searchable={false}
              options={REMINDER_OPTIONS}
              value={reminder}
              onChange={setReminder}
              portalMenu
            />
            <div className="space-y-3 md:pt-9">
              <TogglableSwitch checked={notify} onChange={setNotify} label="Send notification to patient" />
              <TogglableSwitch checked={allowResume} onChange={setAllowResume} label="Allow patient to save and resume later" />
            </div>
          </div>
        </Section>
      </div>
    </ModalShell>
  );
};

export default AssignQuestionnaireModal;