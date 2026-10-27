"use client";

import React, { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertTriangle, FileText, Mail, Phone, Plus } from "lucide-react";

import Breadcrumb from "@/components/Breadcrumb";
import AddButton from "@/components/Addbutton";
import ImportButton from "@/components/ImportButton";
import { cardCls } from "@/providers/Shared";
import LabOrders from "./Laborders";
import Results from "./Results";

/* ---------- Static patient (replace with API data later) ---------- */
export const LAB_PATIENT = {
name: "John Smith",
code: "PT-1008",
gender: "Male",
age: "35 years",
dob: "12 Mar 1989",
phone: "+1 234 567 8900",
email: "john.smith@email.com",
allergy: "Penicillin",
};

const initials = (name: string) =>
name
  .split(" ")
  .map((n) => n[0]?.toUpperCase())
  .slice(0, 2)
  .join("");

/* Avatar + name + phone / email / allergies, with dividers between columns.
  Used in the page profile card and in the "Patient Information" step. */
export const LabPatientInfo = () => {
const fields: { label: string; icon: React.ReactNode; value: string; danger?: boolean }[] = [
  { label: "Phone", icon: <Phone className="h-4 w-4 text-primary" />, value: LAB_PATIENT.phone },
  { label: "Email", icon: <Mail className="h-4 w-4 text-primary" />, value: LAB_PATIENT.email },
  {
    label: "Allergies",
    icon: <AlertTriangle className="h-4 w-4 text-danger" />,
    value: LAB_PATIENT.allergy,
    danger: true,
  },
];

return (
  <div className="flex min-w-0 flex-1 flex-col gap-4 2xl:flex-row 2xl:items-center 2xl:gap-0">
    <div className="flex items-center gap-3 sm:gap-4 xl:w-[320px] xl:shrink-0">
      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-base font-semibold text-primary sm:h-[72px] sm:w-[72px] sm:text-xl">
        {initials(LAB_PATIENT.name)}
      </span>
      <div className="min-w-0 space-y-1">
        <h3 className="truncate text-base font-semibold text-heading sm:text-lg">
          {LAB_PATIENT.name} ({LAB_PATIENT.code})
        </h3>
        <p className="text-xs text-body sm:text-sm">
          {LAB_PATIENT.gender} • {LAB_PATIENT.age} • DOB: {LAB_PATIENT.dob}
        </p>
      </div>
    </div>

    <dl className="grid min-w-0 flex-1 grid-cols-1 gap-4 sm:grid-cols-3 xl:gap-0">
      {fields.map((f, i) => (
        <div
          key={f.label}
          className={`min-w-0 border-border ${i > 0 ? "sm:border-l sm:pl-5" : ""} xl:border-l xl:pl-6`}
        >
          <dt className="text-xs text-body">{f.label}</dt>
          <dd
            className={`mt-1.5 flex items-center gap-2 break-words text-sm font-medium ${
              f.danger ? "text-danger" : "text-heading"
            }`}
          >
            {f.icon}
            {f.value}
          </dd>
        </div>
      ))}
    </dl>
  </div>
);
};

/* ---------- Tabs ---------- */
type TabKey = "lab-orders" | "results" | "diagnostic" | "observations" | "history";

const TABS: { key: TabKey; label: string }[] = [
{ key: "lab-orders", label: "Lab Orders" },
{ key: "results", label: "Results" },
{ key: "diagnostic", label: "Diagnostic Report" },
{ key: "observations", label: "Observations" },
{ key: "history", label: "Result History" },
];

/* Title / subtitle change with the tab (Results has its own heading) */
const HEADING: Record<"lab-orders" | "results", { title: string; subtitle: string }> = {
"lab-orders": {
  title: "Lab Orders & Results",
  subtitle: "Manage laboratory orders, view results and track status.",
},
results: {
  title: "Lab Results",
  subtitle: "View and manage laboratory results for the patient.",
},
};

/* ---------- Page ---------- */
const LabResults = () => {
const router = useRouter();
const searchParams = useSearchParams();
const requestedTab = searchParams.get("tab");
const tab: TabKey = TABS.some((item) => item.key === requestedTab)
  ? (requestedTab as TabKey)
  : "lab-orders";

useEffect(() => {
  if (!TABS.some((item) => item.key === requestedTab)) {
    router.replace("/lab-results?tab=lab-orders", { scroll: false });
  }
}, [requestedTab, router]);

const changeTab = (key: TabKey) => {
  router.push(`/lab-results?tab=${key}`, { scroll: false });
};

const isResults = tab === "results";
const heading = HEADING[isResults ? "results" : "lab-orders"];
const tabLabel = TABS.find((t) => t.key === tab)?.label ?? "Lab Orders";

return (
  <div className="mx-auto w-full max-w-[1600px] space-y-4 sm:space-y-5">
    <Breadcrumb
      items={[
        { label: "Lab Results", href: "/lab-results" },
        { label: "Patient Details", href: "/patients" },
        { label: tabLabel },
      ]}
    />

    {/* Title + actions */}
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h2 className="text-lg font-semibold text-heading sm:text-xl 2xl:text-2xl">
          {heading.title}
        </h2>
        <p className="mt-0.5 text-sm text-body">{heading.subtitle}</p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        {isResults ? (
          <ImportButton
            text="Order New Lab"
            icon={<FileText className="h-4 w-4" />}
            onClick={() => router.push("/new-laborder")}
          />
        ) : (
          <>
            <ImportButton
              text="Order History"
              icon={<FileText className="h-4 w-4" />}
              onClick={() => changeTab("history")}
            />
            <AddButton
              text="New Lab Order"
              icon={<Plus className="h-4 w-4" />}
              onClick={() => router.push("/new-laborder")}
            />
          </>
        )}
      </div>
    </div>

    {/* Patient profile card */}
    <div className={`${cardCls} !p-3.5 sm:!p-5`}>
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
        <LabPatientInfo />
        <ImportButton
          text="View Patient Profile"
          icon={null}
          onClick={() => router.push("/view-patient")}
        />
      </div>
    </div>

    {/* Tabs */}
    <div
      role="tablist"
      aria-label="Lab sections"
      className="flex gap-4 overflow-x-auto border-b border-border hide-scrollbar sm:gap-6"
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
    <div role="tabpanel">
      {tab === "lab-orders" && <LabOrders />}
      {tab === "results" && <Results />}
      {tab !== "lab-orders" && tab !== "results" && (
        <div className={`${cardCls} py-12 text-center`}>
          <p className="text-sm font-semibold text-heading">{tabLabel}</p>
          <p className="mt-1 text-xs text-body">This section will be added here.</p>
        </div>
      )}
    </div>
  </div>
);
};

export default LabResults;
