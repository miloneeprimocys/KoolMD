"use client";

import React, { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, ExternalLink, Info, Loader2, Play } from "lucide-react";

import AddButton from "@/components/Addbutton";
import RadioCheckButtonh from "@/components/RadioCheckButtonh";
import SignupDropdown from "@/components/SignupDropdown";
import Tags from "@/components/Tags";
import { toOptions } from "@/providers/Shared";
import IntegrationSidebar, {
  CodeBlock,
  InfoHint,
  StepLayout,
} from "./Integrationsidebar";

const ENVIRONMENTS = toOptions(["Production", "Sandbox", "Staging"]);
const ENDPOINTS = toOptions(["Auto Detect (Recommended)", "Metadata (/metadata)", "Patient (/Patient)", "ServiceRequest (/ServiceRequest)"]);

const TEST_TYPES = [
  { value: "basic", label: "Basic Connection Test", desc: "Verify API connection and authentication" },
  { value: "sample", label: "Fetch Sample Data", desc: "Retrieve sample lab orders and results" },
];

const STEPS = [
  { title: "1. Resolve Endpoint", desc: "Endpoint: https://lab.example.com/fhir", time: "423 ms" },
  { title: "2. Authentication", desc: "OAuth 2.0 authentication successful", time: "612 ms" },
  { title: "3. API Connection", desc: "Successfully connected to FHIR R4 API", time: "385 ms" },
  { title: "4. Fetch Sample Data", desc: "Retrieved 5 lab orders and 5 result records", time: "1.2 s" },
  { title: "5. Validate Mappings", desc: "All required fields mapped correctly", time: "221 ms" },
];

const RESPONSE = `{
  "status": "success",
  "message": "Connection established successfully",
  "version": "4.0.1",
  "server": "LabSystem FHIR Server",
  "sampleData": {
    "labOrders": 5,
    "labResults": 5
  }
}`;

const checkboxCls =
  "mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-border accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30";

type Status = "idle" | "running" | "success";

const formatNow = () =>
  new Date().toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const TestConnection = () => {
  const [testType, setTestType] = useState("basic");
  const [environment, setEnvironment] = useState("Production");
  const [endpoint, setEndpoint] = useState("Auto Detect (Recommended)");
  const [validate, setValidate] = useState(true);
  const [status, setStatus] = useState<Status>("success");
  const [completedAt, setCompletedAt] = useState("Oct 16, 2026, 10:25 AM");
  const [showResponse, setShowResponse] = useState(true);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const runTest = () => {
    if (status === "running") return;
    setStatus("running");
    // TODO: call your test-connection API here
    timer.current = setTimeout(() => {
      setCompletedAt(formatNow());
      setStatus("success");
    }, 1500);
  };

  // "Validate mappings" off → hide that step
  const steps = validate ? STEPS : STEPS.slice(0, 4);

  return (
    <StepLayout sidebar={<IntegrationSidebar variant="test" />}>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
        {/* ================= Form ================= */}
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-semibold text-heading sm:text-lg">Test Connection</h3>
            <p className="mt-0.5 text-xs text-body sm:text-sm">
              Verify the connection and data exchange with the lab system.
            </p>
          </div>

          <div className="flex items-start gap-2.5 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-xs text-body sm:text-[13px]">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span>
              This test will validate the connection, authentication, and optionally send a test request
              to fetch sample data.
            </span>
          </div>

          <div role="radiogroup" aria-label="Test type">
            <p className="mb-3 flex items-center gap-1.5 text-sm font-medium text-label">
              Test Type <InfoHint text="Choose how deep the test should go" />
            </p>
            <div className="space-y-3">
              {TEST_TYPES.map((t) => (
                <label key={t.value} className="flex cursor-pointer items-start gap-3">
                  <RadioCheckButtonh
                    type="radio"
                    name="testType"
                    value={t.value}
                    checked={testType === t.value}
                    onChange={() => setTestType(t.value)}
                    className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                  />
                  <span>
                    <span className="block text-sm font-medium text-heading">{t.label}</span>
                    <span className="mt-0.5 block text-xs text-body">{t.desc}</span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          <SignupDropdown
            name="environment"
            label="Environment"
            placeholder="Select environment"
            searchable={false}
            options={ENVIRONMENTS}
            value={environment}
            onChange={setEnvironment}
          />
          <SignupDropdown
            name="endpoint"
            label="Test Endpoint"
            placeholder="Select endpoint"
            searchable={false}
            options={ENDPOINTS}
            value={endpoint}
            onChange={setEndpoint}
          />

          <label htmlFor="validate-mappings" className="flex cursor-pointer items-start gap-3">
            <RadioCheckButtonh
              id="validate-mappings"
              type="checkbox"
              checked={validate}
              onChange={() => setValidate((v) => !v)}
              className={checkboxCls}
            />
            <span>
              <span className="block text-sm font-medium text-heading">Validate Mappings</span>
              <span className="mt-0.5 block text-xs text-body">Test field mappings with sample data</span>
            </span>
          </label>

          <AddButton
            text={status === "running" ? "Running…" : "Run Test"}
            icon={status === "running" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            onClick={runTest}
            disabled={status === "running"}
          />
        </div>

        {/* ================= Result ================= */}
        <div className="min-w-0 space-y-3">
          {status === "idle" && (
            <p className="rounded-xl border border-dashed border-border px-4 py-12 text-center text-sm text-body">
              Run a test to see the connection results here.
            </p>
          )}

          {status === "running" && (
            <div className="flex items-center justify-center gap-3 rounded-xl border border-border px-4 py-12 text-sm text-body">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              Testing connection to the lab system…
            </div>
          )}

          {status === "success" && (
            <>
              <div className="overflow-hidden rounded-xl border border-border">
                <div className="flex items-center justify-between gap-3 border-b border-success/20 bg-success/10 px-4 py-3.5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-success text-white">
                      <Check className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-heading">Connection Successful</p>
                      <p className="text-xs text-body">Successfully connected to the lab system.</p>
                    </div>
                  </div>
                  <div className="hidden text-right text-xs text-body sm:block">
                    <p>Test completed at</p>
                    <p className="text-heading">{completedAt}</p>
                  </div>
                </div>

                <ul className="divide-y divide-divider">
                  {steps.map((s) => (
                    <li key={s.title} className="flex items-center justify-between gap-3 px-4 py-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-success text-white">
                          <Check className="h-3.5 w-3.5" />
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-heading">{s.title}</p>
                          <p className="truncate text-xs text-body">{s.desc}</p>
                        </div>
                      </div>
                      <Tags text={s.time} tone="success" />
                    </li>
                  ))}
                </ul>
              </div>

              {/* Response details */}
              <div className="rounded-xl border border-border">
                <div className="flex items-center justify-between gap-1 px-2.5 py-3 sm:gap-3 sm:px-4">
                  <button
                    type="button"
                    aria-expanded={showResponse}
                    onClick={() => setShowResponse((o) => !o)}
                    className="flex shrink-0 cursor-pointer items-center gap-1 whitespace-nowrap text-xs font-semibold text-heading focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 sm:gap-2 sm:text-sm"
                  >
                    <ChevronDown className={`h-3.5 w-3.5 text-body transition-transform sm:h-4 sm:w-4 ${showResponse ? "" : "-rotate-90"}`} />
                    Response Details
                  </button>
                  <button
                    type="button"
                    className="inline-flex shrink-0 cursor-pointer items-center gap-1 whitespace-nowrap text-[10px] font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 sm:gap-1.5 sm:text-xs"
                  >
                    View Full Response <ExternalLink className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  </button>
                </div>
                {showResponse && (
                  <div className="px-4 pb-4">
                    <CodeBlock code={RESPONSE} />
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </StepLayout>
  );
};

export default TestConnection;
