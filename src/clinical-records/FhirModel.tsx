"use client";

import React, { useState } from "react";
import {
  Activity,
  BookOpen,
  Building2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  FileText,
  Heart,
  MapPin,
  Pill,
  Plus,
  Search,
  Stethoscope,
  User,
  Users,
  type LucideIcon,
} from "lucide-react";

import Breadcrumb from "@/components/Breadcrumb";
import AddButton from "@/components/Addbutton";
import ImportButton from "@/components/ImportButton";
import TableStatus from "@/components/TableStatus";

import FhirPatient from "./lists/fhirpatient/Fhirpatient";
import FhirPractitioner from "./lists/Fhirpractitioner";
import FhirPractitionerRole from "./lists/Fhirpractitionerrole";
import FhirOrganization from "./lists/Fhirorganization";
import FhirLocation from "./lists/Fhirlocation";
import FhirAppointment from "./lists/Fhirappointment";
import FhirEncounter from "./lists/Fhirencounter";
import FhirObservation from "./lists/Fhirobservation";
import FhirCondition from "./lists/Fhircondition";
import FhirMedication from "./lists/Fhirmedication";
import FhirMedicationRequest from "./lists/Fhirmedicationrequest";
import FhirMedicationStatement from "./lists/Fhirmedicationstatement";

/* ---------------------------------------------------------------- */
/*  Resource registry                                                */
/*  `screen` is optional: resources without one show a placeholder.  */
/* ---------------------------------------------------------------- */
type ResourceKey =
  | "Patient"
  | "Practitioner"
  | "PractitionerRole"
  | "Organization"
  | "Location"
  | "Appointment"
  | "Encounter"
  | "Observation"
  | "Condition"
  | "Medication"
  | "MedicationRequest"
  | "MedicationStatement";

type Resource = {
  key: ResourceKey;
  label: string;
  description: string;
  icon: LucideIcon;
  tone: string;
  pageTitle: string;
  pageSubtitle: string;
  addLabel: string;
  screen?: React.ComponentType;
};

const RESOURCES: Resource[] = [
  {
    key: "Patient",
    label: "Patient",
    description: "Patient demographics and clinical data",
    icon: User,
    tone: "bg-primary/10 text-primary",
    pageTitle: "Patients",
    pageSubtitle: "View and manage patient demographic and administrative information (FHIR Resource: Patient).",
    addLabel: "Add Patient",
    screen: FhirPatient,
  },
  {
    key: "Practitioner",
    label: "Practitioner",
    description: "Healthcare providers",
    icon: Stethoscope,
    tone: "bg-success/10 text-success",
    pageTitle: "Practitioners",
    pageSubtitle: "View and manage healthcare providers (FHIR Resource: Practitioner).",
    addLabel: "Add Practitioner",
    screen: FhirPractitioner,
  },
  {
    key: "PractitionerRole",
    label: "PractitionerRole",
    description: "Roles and specialties of practitioners",
    icon: Users,
    tone: "bg-violet/10 text-violet",
    pageTitle: "Practitioner Roles",
    pageSubtitle: "View and manage roles and specialties of practitioners (FHIR Resource: PractitionerRole).",
    addLabel: "Add Practitioner Role",
    screen: FhirPractitionerRole,
  },
  {
    key: "Organization",
    label: "Organization",
    description: "Healthcare organizations",
    icon: Building2,
    tone: "bg-warning/10 text-warning",
    pageTitle: "Organizations",
    pageSubtitle: "View and manage healthcare organizations (FHIR Resource: Organization).",
    addLabel: "Add Organization",
    screen: FhirOrganization,
  },
  {
    key: "Location",
    label: "Location",
    description: "Physical locations and departments",
    icon: MapPin,
    tone: "bg-danger/10 text-danger",
    pageTitle: "Locations",
    pageSubtitle: "View and manage physical locations and departments (FHIR Resource: Location).",
    addLabel: "Add Location",
    screen: FhirLocation,
  },
  {
    key: "Appointment",
    label: "Appointment",
    description: "Patient appointments",
    icon: Calendar,
    tone: "bg-primary/10 text-primary",
    pageTitle: "Appointments",
    pageSubtitle: "View and manage patient appointments (FHIR Resource: Appointment).",
    addLabel: "Add Appointment",
    screen: FhirAppointment,
  },
  {
    key: "Encounter",
    label: "Encounter",
    description: "Clinical encounters and visits",
    icon: FileText,
    tone: "bg-violet/10 text-violet",
    pageTitle: "Encounters",
    pageSubtitle: "View and manage clinical encounters and visits (FHIR Resource: Encounter).",
    addLabel: "Add Encounter",
    screen: FhirEncounter,
  },
  {
    key: "Observation",
    label: "Observation",
    description: "Measurements and simple assertions",
    icon: Activity,
    tone: "bg-primary/10 text-primary",
    pageTitle: "Observations",
    pageSubtitle: "View and manage clinical observations and measurements (FHIR Resource: Observation).",
    addLabel: "Add Observation",
    screen: FhirObservation,
  },
  {
    key: "Condition",
    label: "Condition",
    description: "Problems, diagnoses and conditions",
    icon: Heart,
    tone: "bg-danger/10 text-danger",
    pageTitle: "Conditions",
    pageSubtitle: "View and manage patient conditions, diagnoses and clinical problems (FHIR Resource: Condition).",
    addLabel: "Add Condition",
    screen: FhirCondition,
  },
  {
    key: "Medication",
    label: "Medication",
    description: "Medication master data",
    icon: Pill,
    tone: "bg-violet/10 text-violet",
    pageTitle: "Medications",
    pageSubtitle: "View and manage medication master data (FHIR Resource: Medication).",
    addLabel: "Add Medication",
    screen: FhirMedication,
  },
  {
    key: "MedicationRequest",
    label: "MedicationRequest",
    description: "Request for a medication to be prescribed",
    icon: FileText,
    tone: "bg-warning/10 text-warning",
    pageTitle: "Medication Requests",
    pageSubtitle: "View and manage medication requests (FHIR Resource: MedicationRequest).",
    addLabel: "Create Medication Request",
    screen: FhirMedicationRequest,
  },
  {
    key: "MedicationStatement",
    label: "MedicationStatement",
    description: "Medication information provided by patient",
    icon: ClipboardList,
    tone: "bg-success/10 text-success",
    pageTitle: "Medication Statements",
    pageSubtitle: "View and manage medication statements (FHIR Resource: MedicationStatement).",
    addLabel: "Add Medication Statement",
    screen: FhirMedicationStatement,
  },
];

/* ---------------------------------------------------------------- */
/*  Component                                                        */
/* ---------------------------------------------------------------- */
const FhirModel = () => {
  const [activeKey, setActiveKey] = useState<ResourceKey>("Patient");
  const [resourceQuery, setResourceQuery] = useState("");

  /* Small screens only: "list" = sidebar list, "detail" = selected screen.
     On lg+ screens both are always visible, so this has no effect there. */
  const [mobileView, setMobileView] = useState<"list" | "detail">("list");

  const openResource = (key: ResourceKey) => {
    setActiveKey(key);
    setMobileView("detail");
  };

  const active = RESOURCES.find((r) => r.key === activeKey) ?? RESOURCES[0];
  const Screen = active.screen;

  const q = resourceQuery.trim().toLowerCase();
  const visibleResources = RESOURCES.filter(
    (r) => !q || r.label.toLowerCase().includes(q) || r.description.toLowerCase().includes(q),
  );

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-4 sm:space-y-5">
      <Breadcrumb
        items={[
          { label: "FHIR Model", href: "/fhir-model" },
          { label: "Resource List", href: "/fhir-model" },
          { label: active.label },
        ]}
      />

      {/* Back button (small screens, detail view only) */}
      {mobileView === "detail" && (
        <button
          type="button"
          onClick={() => setMobileView("list")}
          className="flex cursor-pointer items-center gap-1.5 text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 lg:hidden"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to FHIR Resources
        </button>
      )}

      {/* Title + actions (change with the selected resource) */}
      <div
        className={`${mobileView === "list" ? "hidden" : "flex"} flex-col gap-3 sm:flex-row sm:items-start sm:justify-between lg:flex`}
      >
        <div>
          <h2 className="text-lg font-semibold text-heading sm:text-xl 2xl:text-2xl">{active.pageTitle}</h2>
          <p className="mt-0.5 max-w-3xl text-xs text-body sm:text-sm">{active.pageSubtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <ImportButton
            text="View FHIR Spec"
            icon={<BookOpen className="h-4 w-4" />}
            onClick={() => {
              /* TODO: open FHIR docs for active.key */
            }}
            className="whitespace-nowrap px-4 text-primary"
          />
          <AddButton
            text={active.addLabel}
            icon={<Plus className="h-4 w-4" />}
            onClick={() => {
              /* TODO: open add form for active.key */
            }}
            className="whitespace-nowrap"
          />
        </div>
      </div>

      {/* grid-cols-1 + min-w-0 stop the sidebar from growing wider than a phone screen */}
      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        {/* ================= Left sidebar ================= */}
        <aside
          className={`${mobileView === "detail" ? "hidden" : "block"} w-full min-w-0 max-h-[100vh] overflow-y-auto rounded-[14px] border border-border bg-card p-3 sm:p-4 lg:sticky lg:top-4 lg:block lg:max-h-[calc(100dvh-2rem)] lg:overflow-y-auto hide-scrollbar`}
        >
          <p className="mb-3 text-sm font-semibold text-heading">FHIR Resources</p>

          <div className="relative mb-3">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-body" />
            <input
              type="text"
              value={resourceQuery}
              onChange={(e) => setResourceQuery(e.target.value)}
              placeholder="Search resources..."
              aria-label="Search resources"
              className="h-10 w-full rounded-lg border border-border bg-card pl-9 pr-3 text-sm text-heading placeholder:text-body focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
            />
          </div>

          <ul className="space-y-1">
            {visibleResources.map((r) => {
              const Icon = r.icon;
              const isActive = r.key === activeKey;
              return (
                <li key={r.key}>
                  <button
                    type="button"
                    onClick={() => openResource(r.key)}
                    aria-current={isActive ? "page" : undefined}
                    className={`flex w-full cursor-pointer items-center gap-3 rounded-lg border-l-2 px-2.5 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${
                      isActive ? "border-primary bg-primary/10" : "border-transparent hover:bg-primary/5"
                    }`}
                  >
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${r.tone}`}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-heading">{r.label}</span>
                      <span className="block truncate text-xs text-body">{r.description}</span>
                    </span>
                    <ChevronRight className={`h-4 w-4 shrink-0 ${isActive ? "text-primary" : "text-body"}`} />
                  </button>
                </li>
              );
            })}
            {visibleResources.length === 0 && (
              <li className="px-2 py-4 text-center text-xs text-body">No resources found.</li>
            )}
          </ul>
        </aside>

        {/* ================= Right content ================= */}
        <section
          className={`${mobileView === "list" ? "hidden" : "block"} min-w-0 rounded-[14px] border border-border bg-card p-4 sm:p-5 lg:block`}
        >
          {Screen ? (
            <Screen />
          ) : (
            <TableStatus variant="empty" message={`${active.label} screen is coming soon.`} />
          )}
        </section>
      </div>
    </div>
  );
};

export default FhirModel;