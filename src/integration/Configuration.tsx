"use client";

import React, { useState } from "react";
import { BookOpen, Plug } from "lucide-react";

import SignupField from "@/components/SignupField";
import SignupDropdown from "@/components/SignupDropdown";
import AddButton from "@/components/Addbutton";
import ImportButton from "@/components/ImportButton";
import DisconnectButton from "@/components/DisconnectButton";
import RadioCheckButtonh from "@/components/RadioCheckButtonh";
import { Opt, Req, TextArea, toOptions, type Errors } from "@/providers/Shared";
import IntegrationSidebar, { StepLayout } from "./Integrationsidebar";

/* ---------- Options ---------- */
const ADAPTERS = toOptions(["FHIR R4 (Recommended)", "FHIR STU3", "HL7 v2", "Custom REST API"]);
const AUTH_TYPES = toOptions(["OAuth 2.0", "API Key", "Basic Auth", "Bearer Token"]);

const SETTINGS: { key: keyof SettingsValues; label: string; desc: string }[] = [
  { key: "orderTransmission", label: "Enable Lab Order Transmission", desc: "Send lab orders from KOOLMD to the lab system." },
  { key: "resultRetrieval", label: "Enable Result Retrieval", desc: "Automatically fetch lab results and store in patient chart." },
  { key: "autoMatch", label: "Auto Match Patients", desc: "Match patients using MRN, DOB and name." },
  { key: "fhirDiagnosticReport", label: "Use FHIR DiagnosticReport", desc: "Retrieve results using FHIR DiagnosticReport resource." },
  { key: "statusUpdates", label: "Enable Status Updates", desc: "Update order status (in progress, completed, etc.)." },
  { key: "notifications", label: "Enable Notifications", desc: "Send notifications when results are received." },
];

/* ---------- Values + validation ---------- */
type SettingsValues = {
  orderTransmission: boolean;
  resultRetrieval: boolean;
  autoMatch: boolean;
  fhirDiagnosticReport: boolean;
  statusUpdates: boolean;
  notifications: boolean;
};

export type ConfigurationValues = SettingsValues & {
  name: string;
  baseUrl: string;
  adapter: string;
  authType: string;
  description: string;
  clientId: string;
  clientSecret: string;
  tokenUrl: string;
  scope: string;
};

export const initialConfiguration = (): ConfigurationValues => ({
  name: "Lab Integration (M13)",
  baseUrl: "https://lab.example.com/fhir",
  adapter: "FHIR R4 (Recommended)",
  authType: "OAuth 2.0",
  description: "",
  clientId: "",
  clientSecret: "secret-placeholder",
  tokenUrl: "https://lab.example.com/oauth/token",
  scope: "patient/*.read lab/*.read",
  orderTransmission: true,
  resultRetrieval: true,
  autoMatch: true,
  fhirDiagnosticReport: true,
  statusUpdates: true,
  notifications: false,
});

const isUrl = (v: string) => {
  try {
    new URL(v);
    return true;
  } catch {
    return false;
  }
};

export const validateConfiguration = (v: ConfigurationValues): Errors => {
  const e: Errors = {};
  if (!v.name.trim()) e.name = "Integration name is required.";
  if (!v.baseUrl.trim()) e.baseUrl = "Base URL is required.";
  else if (!isUrl(v.baseUrl.trim())) e.baseUrl = "Enter a valid URL (https://…).";
  if (!v.adapter) e.adapter = "Adapter type is required.";
  if (!v.authType) e.authType = "Authentication type is required.";
  if (!v.clientId.trim()) e.clientId = "Client ID is required.";
  if (!v.clientSecret.trim()) e.clientSecret = "Client secret is required.";
  if (!v.tokenUrl.trim()) e.tokenUrl = "Token URL is required.";
  else if (!isUrl(v.tokenUrl.trim())) e.tokenUrl = "Enter a valid URL (https://…).";
  return e;
};

/* ---------- Numbered section header ---------- */
const Section = ({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) => (
  <section>
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h3 className="text-base font-semibold text-heading sm:text-lg">{title}</h3>
        <p className="mt-0.5 text-xs text-body sm:text-sm">{subtitle}</p>
      </div>
      {action}
    </div>
    {children}
  </section>
);

const checkboxCls =
  "mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-border accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30";

/* ---------- Component ---------- */
const Configuration = ({
  onSave,
  onDisconnect,
}: {
  onSave?: (values: ConfigurationValues) => void;
  onDisconnect?: () => void;
}) => {
  const [values, setValues] = useState<ConfigurationValues>(initialConfiguration());
  const [errors, setErrors] = useState<Errors>({});

  const set = <K extends keyof ConfigurationValues>(key: K, val: ConfigurationValues[K]) => {
    setValues((p) => ({ ...p, [key]: val }));
    setErrors((p) => ({ ...p, [key]: "" }));
  };

  const handleSave = () => {
    const errs = validateConfiguration(values);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    // TODO: call your API here
    console.log("Configuration saved:", values);
    onSave?.(values);
  };

  return (
    <StepLayout sidebar={<IntegrationSidebar variant="configuration" />}>
      {/* 1. Integration details */}
      <Section
        title="1. Integration Details"
        subtitle="Set up the basic configuration for the lab integration."
        action={
          <ImportButton
            text="View Setup Guide"
            icon={<BookOpen className="h-4 w-4" />}
            onClick={() => {}}
          />
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <SignupField
            name="name"
            label={<>Integration Name<Req /></>}
            placeholder="Enter integration name"
            value={values.name}
            onChange={(e) => set("name", e.target.value)}
            error={errors.name}
          />
          <SignupField
            name="baseUrl"
            label={<>Base URL<Req /></>}
            placeholder="https://lab.example.com/fhir"
            value={values.baseUrl}
            onChange={(e) => set("baseUrl", e.target.value)}
            error={errors.baseUrl}
          />
          <SignupDropdown
            name="adapter"
            label={<>Adapter Type<Req /></>}
            placeholder="Select adapter type"
            searchable={false}
            options={ADAPTERS}
            value={values.adapter}
            onChange={(v) => set("adapter", v)}
            error={errors.adapter}
          />
          <SignupDropdown
            name="authType"
            label={<>Authentication Type<Req /></>}
            placeholder="Select authentication type"
            searchable={false}
            options={AUTH_TYPES}
            value={values.authType}
            onChange={(v) => set("authType", v)}
            error={errors.authType}
          />
        </div>
        <div className="mt-4">
          <TextArea
            name="description"
            label={<>Description<Opt /></>}
            placeholder="Enter integration description..."
            value={values.description}
            onChange={(v) => set("description", v)}
            rows={3}
          />
        </div>
      </Section>

      <hr className="border-divider" />

      {/* 2. Authentication */}
      <Section
        title="2. Authentication"
        subtitle="Configure authentication details to connect with the lab system."
        action={
          <ImportButton
            text="Test Connection"
            icon={<Plug className="h-4 w-4" />}
            onClick={() => {}}
          />
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <SignupField
            name="clientId"
            label={<>Client ID<Req /></>}
            placeholder="Enter client ID"
            value={values.clientId}
            onChange={(e) => set("clientId", e.target.value)}
            error={errors.clientId}
          />
          <SignupField
            name="clientSecret"
            type="password"
            label={<>Client Secret<Req /></>}
            placeholder="Enter client secret"
            value={values.clientSecret}
            onChange={(e) => set("clientSecret", e.target.value)}
            error={errors.clientSecret}
          />
          <SignupField
            name="tokenUrl"
            label={<>Token URL<Req /></>}
            placeholder="https://lab.example.com/oauth/token"
            value={values.tokenUrl}
            onChange={(e) => set("tokenUrl", e.target.value)}
            error={errors.tokenUrl}
          />
          <SignupField
            name="scope"
            label={<>Scope<Opt /></>}
            placeholder="patient/*.read lab/*.read"
            value={values.scope}
            onChange={(e) => set("scope", e.target.value)}
          />
        </div>
      </Section>

      <hr className="border-divider" />

      {/* 3. Integration settings */}
      <Section
        title="3. Integration Settings"
        subtitle="Configure additional settings for lab order and result handling."
      >
        <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
          {SETTINGS.map((s) => (
            <label key={s.key} htmlFor={`cfg-${s.key}`} className="flex cursor-pointer items-start gap-3">
              <RadioCheckButtonh
                id={`cfg-${s.key}`}
                type="checkbox"
                checked={values[s.key]}
                onChange={() => set(s.key, !values[s.key])}
                className={checkboxCls}
              />
              <span className="min-w-0">
                <span className="block text-sm font-medium text-heading">{s.label}</span>
                <span className="mt-0.5 block text-xs text-body">{s.desc}</span>
              </span>
            </label>
          ))}
        </div>
      </Section>

      {/* Actions */}
      <div className="flex flex-col-reverse gap-3 border-t border-divider pt-4 sm:flex-row sm:items-center sm:justify-between">
        <DisconnectButton
          text="Disconnect Integration"
          onClick={() => onDisconnect?.()}
        />
        <div className="flex gap-2">
          <ImportButton text="Cancel" icon={null} onClick={() => setValues(initialConfiguration())} />
          <AddButton text="Save Changes" icon={null} onClick={handleSave} />
        </div>
      </div>
    </StepLayout>
  );
};

export default Configuration;
