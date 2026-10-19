"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Clock, FileText, Users } from "lucide-react";

import Breadcrumb from "@/components/Breadcrumb";
import AddButton from "@/components/Addbutton";
import StatCards, { type StatItem } from "@/components/Statcards";
import { useAppDispatch } from "@/hooks/useAppHooks";
import { showModal } from "@/redux/slices/dialogslice";

import QuestionnaireList, { QUESTIONNAIRES, type QuestionnaireRow } from "./Questionnairelist";
import ResponseList from "./response/Responselist";
import Templates from "./template/Templates";

/* ---------- Stats (shown on the Questionnaire List tab) ---------- */
const STATS: StatItem[] = [
  { label: "Total Questionnaires", value: "12", Icon: FileText, accent: "primary", tag: { text: "Active questionnaires", tone: "neutral" } },
  { label: "Responses Received", value: "246", Icon: Users, accent: "success", tag: { text: "All time", tone: "neutral" } },
  { label: "Pending Responses", value: "36", Icon: Clock, accent: "danger", tag: { text: "Not yet completed", tone: "neutral" } },
  { label: "Completed Responses", value: "210", Icon: CheckCircle2, accent: "success", tag: { text: "Completed by patients", tone: "neutral" } },
];

/* ---------- Tabs ---------- */
type TabKey = "list" | "responses" | "templates";

const TABS: { key: TabKey; label: string }[] = [
  { key: "list", label: "Questionnaire List" },
  { key: "responses", label: "Patient Responses" },
  { key: "templates", label: "Templates" },
];

/* ---------- Component ---------- */
const QuestionnairesPage = () => {
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const requestedTab = searchParams.get("tab");
  const tab: TabKey =
    requestedTab === "responses" || requestedTab === "templates" ? requestedTab : "list";
  const [activeQuestionnaire, setActiveQuestionnaire] = useState<QuestionnaireRow>(QUESTIONNAIRES[0]);

  const changeTab = (nextTab: TabKey) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", nextTab);
    window.history.pushState(null, "", `?${params.toString()}`);
  };

  const openResponses = (questionnaire: QuestionnaireRow) => {
    setActiveQuestionnaire(questionnaire);
    changeTab("responses");
  };

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-4 sm:space-y-5">
      {/* Breadcrumb */}
      <Breadcrumb items={[{ label: "Dashboard", href: "/dashboard" }, { label: "Questionnaires" }]} />

      {/* Title + actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-heading sm:text-lg 2xl:text-2xl">
            Questionnaire and Questionnaire Response
          </h2>
          <p className="mt-0.5 text-sm text-body">
            Manage patient questionnaires, send questionnaires and review responses.
          </p>
        </div>
        {tab === "list" && (
          <AddButton
            text="Assign Questionnaire"
            onClick={() => dispatch(showModal("AssignQuestionnaire"))}
            className="w-fit shrink-0 whitespace-nowrap"
          />
        )}
      </div>

      {/* Tabs */}
      <div
        role="tablist"
        aria-label="Questionnaire sections"
        className="hide-scrollbar flex gap-4 overflow-x-auto border-b border-border sm:gap-6"
      >
        {TABS.map((t) => {
          const isActive = t.key === tab;
          return (
            <button
              key={t.key}
              role="tab"
              type="button"
              aria-selected={isActive}
              onClick={() => changeTab(t.key)}
              className={`-mb-px cursor-pointer whitespace-nowrap border-b-2 px-1 pb-2.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 sm:pb-3 sm:text-sm ${
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-body hover:text-heading"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Active tab */}
      <div role="tabpanel" className="space-y-4 sm:space-y-5">
        {tab === "list" && (
          <>
            <StatCards stats={STATS} />
            <QuestionnaireList onViewResponses={openResponses} />
          </>
        )}

        {tab === "responses" && (
          <ResponseList questionnaire={activeQuestionnaire} onBack={() => changeTab("list")} />
        )}

        {tab === "templates" && <Templates />}
      </div>
    </div>
  );
};

export default QuestionnairesPage;