"use client";

import React, { useLayoutEffect, useRef, useState } from "react";
import {
  AlertCircle,
  BookOpen,
  Check,
  ChevronDown,
  Copy,
  FileText,
  HelpCircle,
  Info,
  PlugZap,
  RefreshCw,
  Send,
  Server,
  X,
  XCircle,
  Eye,
  type LucideIcon,
} from "lucide-react";

import Tags, { type TagTone } from "@/components/Tags";
import ImportButton from "@/components/ImportButton";
import SearchAndFilter from "@/components/Searchandfilter";
import { cardCls } from "@/providers/Shared";

/* ---------------------------------------------------------------- */
/*  Shared helpers (used by every step file)                        */
/* ---------------------------------------------------------------- */

/** Small "i" icon with a tooltip – used in table headers / field labels. */
export const InfoHint = ({ text }: { text: string }) => (
  <span title={text} className="inline-flex cursor-help text-body">
    <Info className="h-3.5 w-3.5" />
  </span>
);

/** Wrap form fields that sit inside a table cell (hides their label). */
export const FieldCell = ({ children }: { children: React.ReactNode }) => (
  <div className="min-w-[150px] [&_label]:sr-only">{children}</div>
);

/** Section title + subtitle + optional action(s) – same look as the other pages. */
export const StepHeader = ({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle: string;
  actions?: React.ReactNode;
}) => (
  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
    <div>
      <h3 className="text-base font-semibold text-heading sm:text-lg">{title}</h3>
      <p className="mt-0.5 text-xs text-body sm:text-sm">{subtitle}</p>
    </div>
    {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
  </div>
);

/** Two-column step layout: content on the left, <IntegrationSidebar/> on the right. */
export const StepLayout = ({
  children,
  sidebar,
}: {
  children: React.ReactNode;
  sidebar: React.ReactNode;
}) => {
  const leftRef = useRef<HTMLElement>(null);
  const sidebarRef = useRef<HTMLElement>(null);
  const [leftIsShorter, setLeftIsShorter] = useState(false);

  useLayoutEffect(() => {
    const measureColumns = () => {
      if (window.innerWidth < 1536) {
        setLeftIsShorter(false);
        return;
      }

      const leftHeight = leftRef.current?.scrollHeight;
      const sidebarHeight = sidebarRef.current?.scrollHeight;
      if (leftHeight == null || sidebarHeight == null || leftHeight === 0 || sidebarHeight === 0) return;
      setLeftIsShorter(leftHeight < sidebarHeight);
    };

    const observer = new ResizeObserver(measureColumns);
    if (leftRef.current) observer.observe(leftRef.current);
    if (sidebarRef.current) observer.observe(sidebarRef.current);
    window.addEventListener("resize", measureColumns);
    measureColumns();

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measureColumns);
    };
  }, []);

  return (
    <div className="grid items-start gap-4 sm:gap-5 2xl:grid-cols-[minmax(0,1fr)_380px] 2xl:items-stretch">
      <section
        ref={leftRef}
        className={`${cardCls} min-w-0 space-y-4 sm:p-6 ${leftIsShorter ? "2xl:sticky 2xl:top-4 2xl:self-start" : ""}`}
      >
        {children}
      </section>
      <aside
        ref={sidebarRef}
        className="sticky top-4 self-start space-y-4 sm:space-y-5"
      >
        {sidebar}
      </aside>
    </div>
  );
};

/* ---------- Copy to clipboard ---------- */
const useCopy = (text: string) => {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard not available */
    }
  };
  return { copied, copy };
};

/** JSON / code block. `lineNumbers` adds a gutter, `copy` adds the icon button. */
export const CodeBlock = ({
  code,
  lineNumbers = false,
  copy = false,
}: {
  code: string;
  lineNumbers?: boolean;
  copy?: boolean;
}) => {
  const { copied, copy: doCopy } = useCopy(code);
  const lines = code.split("\n");
  return (
    <div className="relative overflow-x-auto rounded-xl border border-border bg-primary/5 p-3">
      {copy && (
        <button
          type="button"
          aria-label="Copy"
          onClick={doCopy}
          className="absolute right-2.5 top-2.5 flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-primary transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </button>
      )}
      <pre className="font-mono text-[11px] leading-5 text-heading sm:text-xs">
        {lines.map((line, i) => (
          <div key={i} className="flex gap-3">
            {lineNumbers && (
              <span className="w-4 shrink-0 select-none text-right text-body/60">{i + 1}</span>
            )}
            <span className="whitespace-pre">{line}</span>
          </div>
        ))}
      </pre>
    </div>
  );
};

/** Code block with a title row and a "Copy" text button. */
export const CodeSection = ({ title, code }: { title: string; code: string }) => {
  const { copied, copy } = useCopy(code);
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-semibold text-heading">{title}</p>
        <button
          type="button"
          onClick={copy}
          className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <CodeBlock code={code} lineNumbers />
    </div>
  );
};

/* ---------------------------------------------------------------- */
/*  Progress ring (same circle on every mapping step)               */
/* ---------------------------------------------------------------- */
export const ProgressRing = ({ percent, size = 96 }: { percent: number; size?: number }) => {
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className="stroke-primary/15" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - percent / 100)}
          className="stroke-primary transition-all duration-500"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-heading">
        {percent}%
      </span>
    </div>
  );
};

/* ---------------------------------------------------------------- */
/*  Activity log types (shared with Activitylogs.tsx)               */
/* ---------------------------------------------------------------- */
export type LogDetails = {
  requestId: string;
  orderId: string;
  patient: string;
  provider: string;
  endpoint: string;
  environment: string;
  payload: string;
  response: string;
};

export type ActivityLog = {
  id: number;
  date: string;
  type: string;
  description: string;
  status: "Success" | "Warning" | "Failed";
  responseTime: string;
  user: string;
  details?: LogDetails;
};

export const LOG_STATUS_TONE: Record<ActivityLog["status"], TagTone> = {
  Success: "success",
  Warning: "warning",
  Failed: "danger",
};

export const ACTIVITY_ICON: Record<string, { icon: LucideIcon; tone: string }> = {
  "Test Connection": { icon: PlugZap, tone: "text-primary" },
  "Lab Order Sent": { icon: Send, tone: "text-primary" },
  "Results Received": { icon: FileText, tone: "text-success" },
  "Status Update": { icon: RefreshCw, tone: "text-primary" },
  "Mapping Sync": { icon: RefreshCw, tone: "text-primary" },
  "API Request": { icon: Server, tone: "text-primary" },
};

const DEFAULT_DETAILS: LogDetails = {
  requestId: "REQ-20261016-000123",
  orderId: "ORD12345",
  patient: "John Smith (MRN: P001234)",
  provider: "Dr. Emily Carter (NPI: 1234567890)",
  endpoint: "POST /fhir/ServiceRequest",
  environment: "Production",
  payload: `{
  "resourceType": "ServiceRequest",
  "subject": {
    "reference": "Patient/P001234"
  },
  "code": {
    "text": "Complete Blood Count"
  },
  "requester": {
    "reference": "Practitioner/1234567890"
  }
}`,
  response: `{
  "status": "success",
  "orderId": "LAB987654",
  "message": "Order created successfully"
}`,
};

/* ---------------------------------------------------------------- */
/*  Sidebar pieces                                                  */
/* ---------------------------------------------------------------- */
const SideCard = ({
  title,
  action,
  children,
}: {
  title: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
}) => (
  <section className={`${cardCls} sm:p-6`}>
    <div className="mb-4 flex items-center justify-between gap-3">
      <h3 className="text-base font-semibold text-heading">{title}</h3>
      {action}
    </div>
    {children}
  </section>
);

const Guidelines = ({ items, children }: { items: string[]; children?: React.ReactNode }) => (
  <section className="rounded-2xl border border-primary/15 bg-primary/5 dark:bg-primary/25 p-4 sm:p-5">
    <div className="flex items-start gap-3">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-white">
        <Info className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="text-sm font-semibold text-heading">Mapping Guidelines</h3>
        <ul className="mt-2 list-disc space-y-1.5 pl-4 text-xs text-body">
          {items.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
        {children}
      </div>
    </div>
  </section>
);

const GuideButton = () => (
  <ImportButton
    text="View Integration Guide"
    icon={<BookOpen className="h-4 w-4" />}
    className="mt-4 w-full"
    onClick={() => {}}
  />
);

const Progress = ({
  percent,
  heading,
  lines,
}: {
  percent: number;
  heading: string;
  lines: { dot: string; text: string }[];
}) => (
  <SideCard title="Mapping Progress">
    <div className="flex items-center gap-4">
      <ProgressRing percent={percent} />
      <div className="min-w-0 space-y-1.5">
        <p className="text-sm font-semibold text-heading">{heading}</p>
        {lines.map((l) => (
          <p key={l.text} className="flex items-center gap-2 text-xs text-body">
            <span className={`h-2 w-2 shrink-0 rounded-full ${l.dot}`} />
            {l.text}
          </p>
        ))}
      </div>
    </div>
  </SideCard>
);

const FIELD_PROGRESS = {
  percent: 85,
  heading: "17 of 20 fields mapped",
  lines: [
    { dot: "bg-success", text: "12 Required fields mapped" },
    { dot: "bg-success", text: "5 Optional fields mapped" },
    { dot: "bg-border", text: "3 Fields remaining" },
  ],
};

const ORDER_FIELD_GROUPS: { name: string; fields: string[] }[] = [
  { name: "Patient Information", fields: ["Patient ID", "Patient First Name", "Patient Last Name", "Patient DOB", "Patient Gender", "Patient Phone", "Patient Address", "Patient Note"] },
  { name: "Order Information", fields: ["Client Order Number", "Order Priority", "Order Date", "Test Code (LOINC)", "Diagnosis/Indication", "Internal Comment"] },
  { name: "Specimen Information", fields: ["Specimen Type", "Collection Date Time", "Fasting Indicator", "Specimen Source"] },
  { name: "Provider Information", fields: ["Provider ID", "Provider Name", "Provider NPI"] },
  { name: "Additional Fields", fields: ["Billing Code", "Insurance ID", "Location Code", "Department", "Reference Number"] },
];

/** External statuses shown in the Status Mapping sidebar (also the table rows). */
export const EXTERNAL_STATUS_TONE: Record<string, TagTone> = {
  ORDER_RECEIVED: "info",
  IN_PROGRESS: "warning",
  PARTIAL_RESULTS: "violet",
  COMPLETED: "success",
  FINAL: "success",
  CANCELLED: "danger",
  REJECTED: "danger",
  ON_HOLD: "neutral",
  SCHEDULED: "info",
  SAMPLE_COLLECTED: "violet",
};

const SAMPLE_RESULT = `{
  "resultId": "RS123456",
  "testCode": "CBC",
  "testName": "Complete Blood Count",
  "resultValue": "13.2",
  "units": "g/dL",
  "referenceRange": "12.0 - 16.0",
  "abnormalFlag": "N",
  "resultStatus": "Final",
  "resultDate": "2026-10-17",
  "specimenType": "Whole Blood",
  "collectionDate": "2026-10-17 08:30",
  "notes": "Hemoglobin within normal range"
}`;

/* ---------------------------------------------------------------- */
/*  Component                                                       */
/* ---------------------------------------------------------------- */
export type SidebarVariant =
  | "configuration"
  | "mapping"
  | "order"
  | "result"
  | "status"
  | "test"
  | "logs";

type Props = {
  variant: SidebarVariant;
  /** logs variant: the selected log + close handler */
  log?: ActivityLog | null;
  onCloseLog?: () => void;
};

const IntegrationSidebar = ({ variant, log, onCloseLog }: Props) => {
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  switch (variant) {
    /* ---------- Configuration ---------- */
    case "configuration":
      return (
        <>
          <SideCard title="Integration Status" action={<Tags text="Connected" tone="success" />}>
            <dl className="space-y-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-body">Last Connected</dt>
                <dd className="text-heading">Oct 16, 2026, 10:25 AM</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-body">Last Sync</dt>
                <dd className="text-heading">Oct 16, 2026, 10:25 AM</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-body">Status</dt>
                <dd><Tags text="Healthy" tone="success" /></dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-body">Version</dt>
                <dd className="text-heading">v1.0.0</dd>
              </div>
            </dl>
          </SideCard>

          <SideCard title="Supported Features">
            <ul className="space-y-2.5 text-sm text-heading">
              {[
                "Lab order creation and transmission",
                "Lab result retrieval (FHIR DiagnosticReport)",
                "Patient/provider mapping",
                "Order status updates",
                "External result mapping",
              ].map((f) => (
                <li key={f} className="flex items-start gap-2.5">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-body" />
                  {f}
                </li>
              ))}
            </ul>
          </SideCard>

          <SideCard
            title={
              <span className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-primary" /> Need Help?
              </span>
            }
          >
            <p className="text-xs text-body">Follow the integration guide for step-by-step instructions.</p>
            <GuideButton />
          </SideCard>
        </>
      );

    /* ---------- Patient / Provider mapping ---------- */
    case "mapping":
      return (
        <>
          <Progress {...FIELD_PROGRESS} />
          <SideCard
            title={
              <span className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" /> Sample Data
              </span>
            }
          >
            <p className="text-xs text-body">
              View a sample of incoming data from the lab system to verify your mappings.
            </p>
            <ImportButton
              text="View Sample Data"
              icon={<FileText className="h-4 w-4" />}
              className="mt-4 w-full"
              onClick={() => {}}
            />
          </SideCard>
          <Guidelines
            items={[
              "Required fields must be mapped for successful integration.",
              "Use Auto Map to automatically match fields based on field names.",
              "You can set default values for optional fields.",
              "Test the connection after completing the mapping.",
            ]}
          />
        </>
      );

    /* ---------- Lab order mapping ---------- */
    case "order":
      return (
        <>
          <Progress {...FIELD_PROGRESS} />
          <SideCard title="Common Lab Order Fields (M13)">
            <SearchAndFilter
              placeholder="Search lab fields..."
              filters={[]}
              onSearch={() => {}}
              onFilterChange={() => {}}
              showDateRange={false}
            />
            <ul className="mt-3 divide-y divide-divider">
              {ORDER_FIELD_GROUPS.map((g) => {
                const open = openGroup === g.name;
                return (
                  <li key={g.name}>
                    <button
                      type="button"
                      aria-expanded={open}
                      onClick={() => setOpenGroup(open ? null : g.name)}
                      className="flex w-full cursor-pointer items-center justify-between gap-2 py-2.5 text-left text-sm text-heading focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                    >
                      {g.name} ({g.fields.length})
                      <ChevronDown className={`h-4 w-4 text-body transition-transform ${open ? "rotate-180" : ""}`} />
                    </button>
                    <div
                      className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
                        open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                      }`}
                    >
                      <div className="min-h-0 overflow-hidden">
                        <ul className="mb-2 list-disc space-y-1 pl-5 text-xs text-body marker:text-body">
                          {g.fields.map((f) => (
                            <li key={f}>{f}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </SideCard>
          <Guidelines
            items={[
              "Map all required fields to create lab orders successfully.",
              "Use default values for optional fields if needed.",
              "Field names may vary based on your lab configuration.",
              "Test the mapping by creating a sample order.",
            ]}
          >
            <GuideButton />
          </Guidelines>
        </>
      );

    /* ---------- Result mapping ---------- */
    case "result":
      return (
        <>
          <Progress {...FIELD_PROGRESS} />
          <SideCard title="Sample Result Data (M13)">
            <CodeBlock code={SAMPLE_RESULT} copy />
          </SideCard>
          <Guidelines
            items={[
              "Map each lab result field to the appropriate KOOLMD field.",
              "Use the sample data to verify your mappings.",
              "Set default values for optional fields if needed.",
              "Ensure data type compatibility (Text, Number, Date, etc.).",
              "Test the connection after completing the mapping.",
            ]}
          />
        </>
      );

    /* ---------- Status mapping ---------- */
    case "status":
      return (
        <>
          <Progress
            percent={100}
            heading="10 of 10 statuses mapped"
            lines={[
              { dot: "bg-success", text: "10 Active mappings" },
              { dot: "bg-success", text: "0 Inactive mappings" },
              { dot: "bg-border", text: "0 Unmapped statuses" },
            ]}
          />
          <SideCard title="External Statuses (M13)">
            <SearchAndFilter
              placeholder="Search external statuses..."
              filters={[]}
              onSearch={() => {}}
              onFilterChange={() => {}}
              showDateRange={false}
            />
            <ul className="mt-3 space-y-1.5">
              {Object.entries(EXTERNAL_STATUS_TONE).map(([name, tone]) => (
                <li key={name}>
                  <Tags text={name} tone={tone} />
                </li>
              ))}
            </ul>
          </SideCard>
          <Guidelines
            items={[
              "Map each external status to the appropriate KOOLMD order status.",
              "Use 'All' or specific order types (Diagnostic, Pathology, Radiology, etc.).",
              "Enable/disable mappings based on your lab workflow.",
              "Unmapped statuses will be treated as 'In Progress' by default.",
            ]}
          />
        </>
      );

    /* ---------- Test connection ---------- */
    case "test":
      return (
        <>
          <SideCard title="Test Checklist">
            <ul className="space-y-3 text-sm text-heading">
              {[
                "Endpoint reachable",
                "Authentication valid",
                "API responding",
                "Sample data retrieved",
                "Field mappings working",
              ].map((t) => (
                <li key={t} className="flex items-center gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-success text-white">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </SideCard>

          <SideCard
            title={
              <span className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-primary" /> Need Help?
              </span>
            }
          >
            <p className="text-xs text-body">If the connection test fails, check the following:</p>
            <ul className="mt-2 list-disc space-y-1.5 pl-4 text-xs text-body">
              <li>Verify the base URL and endpoints</li>
              <li>Check client ID and secret</li>
              <li>Ensure network access and firewall rules</li>
              <li>Validate API permissions</li>
              <li>Review the integration guide for troubleshooting steps</li>
            </ul>
            <GuideButton />
          </SideCard>
        </>
      );

    /* ---------- Activity log details ---------- */
    case "logs": {
      if (!log) return null;
      const d = log.details ?? DEFAULT_DETAILS;
      const meta = ACTIVITY_ICON[log.type] ?? ACTIVITY_ICON["API Request"];
      const Icon =
        log.status === "Failed" ? XCircle : log.status === "Warning" ? AlertCircle : meta.icon;
      const iconTone =
        log.status === "Failed" ? "text-danger" : log.status === "Warning" ? "text-warning" : meta.tone;

      const rows: { label: string; value: React.ReactNode }[] = [
        { label: "Date & Time", value: log.date },
        { label: "Request ID", value: d.requestId },
        { label: "Order ID", value: d.orderId },
        { label: "Patient", value: d.patient },
        { label: "Provider", value: d.provider },
        { label: "Activity Type", value: log.type },
        { label: "Status", value: <Tags text={log.status} tone={LOG_STATUS_TONE[log.status]} /> },
        { label: "Response Time", value: log.responseTime },
        { label: "Triggered By", value: log.user },
        { label: "Endpoint", value: d.endpoint },
        { label: "Environment", value: d.environment },
      ];

      return (
        <section className={`${cardCls} sm:p-6`}>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="text-base font-semibold text-heading">Log Details</h3>
            {onCloseLog && (
              <button
                type="button"
                aria-label="Close log details"
                onClick={onCloseLog}
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-body transition-colors hover:bg-heading/5 hover:text-heading focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Icon className={`h-4 w-4 ${iconTone}`} />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-heading">{log.type}</p>
                <p className="text-xs text-body">{log.description}</p>
              </div>
            </div>
            <Tags text={log.status} tone={LOG_STATUS_TONE[log.status]} />
          </div>

          <dl className="mt-4 divide-y divide-divider">
            {rows.map((r) => (
              <div key={r.label} className="grid grid-cols-[120px_minmax(0,1fr)] gap-3 py-2 text-xs sm:text-[13px]">
                <dt className="text-body">{r.label}</dt>
                <dd className="min-w-0 break-words text-heading">{r.value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-5 space-y-4">
            <CodeSection title="Request Payload" code={d.payload} />
            <CodeSection title="Response" code={d.response} />
          </div>
        </section>
      );
    }
  }
};

export default IntegrationSidebar;
