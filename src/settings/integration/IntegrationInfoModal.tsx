"use client";

import React from "react";
import ModalShell from "@/components/Modalshell";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppHooks";
import { hideModal } from "@/redux/slices/dialogslice";
import type { IntegrationInfoKind } from "@/redux/slices/dialogslice";

const STATUS_ROWS = [
  ["ORDER_RECEIVED", "Lab has received the order", "Received"],
  ["IN_PROGRESS", "Specimen is being processed", "In Progress"],
  ["PARTIAL_RESULTS", "Some test results are available", "Partial Results"],
  ["COMPLETED", "All test results are available", "Completed"],
  ["FINAL", "Final and verified results", "Final"],
  ["CANCELLED", "Order cancelled at the lab", "Cancelled"],
  ["REJECTED", "Specimen rejected by the lab", "Rejected"],
  ["ON_HOLD", "Order is on hold", "On Hold"],
  ["SCHEDULED", "Specimen collection is scheduled", "Scheduled"],
  ["SAMPLE_COLLECTED", "Specimen has been collected", "Sample Collected"],
];

const GUIDE_STEPS = [
  { step: "Connection details", description: "Confirm the integration name, HTTPS base URL, FHIR adapter, and authentication type." },
  { step: "Authentication", description: "Enter the client ID, secret, token URL, and required scopes supplied by the laboratory." },
  { step: "Field mappings", description: "Review patient/provider, order, result, and status mappings. Required values must be mapped before sending data." },
  { step: "Validate", description: "Run the connection test and review the response before enabling order transmission or result retrieval." },
];

const MODAL_COPY: Record<IntegrationInfoKind, { title: string; subtitle: string }> = {
  documentation: { title: "M13 Integration Documentation", subtitle: "Reference for configuring the KOOLMD laboratory integration." },
  "setup-guide": { title: "Integration Setup Guide", subtitle: "Follow these steps to configure and validate the M13 connection." },
  "mapping-data": { title: "Sample Mapping Data", subtitle: "Example patient and provider records used to check field mappings." },
  "order-preview": { title: "Lab Order Preview", subtitle: "Example order payload using the current M13 field mapping." },
  "sample-results": { title: "Sample Lab Results", subtitle: "Example result data received from the external laboratory." },
  "status-list": { title: "Integration Status List", subtitle: "External M13 status values and their KOOLMD mappings." },
};

const SAMPLE_DATA: Partial<Record<IntegrationInfoKind, string>> = {
  "mapping-data": `{
  "patient": {
    "id": "KMD-000042",
    "firstName": "Jordan",
    "lastName": "Lee",
    "birthDate": "1989-03-12",
    "gender": "female",
    "phone": "+1-314-555-0182"
  },
  "provider": {
    "npi": "1234567890",
    "name": "Dr. Emily Carter",
    "email": "emily@clinic.com"
  }
}`,
  "order-preview": `{
  "resourceType": "ServiceRequest",
  "identifier": [{ "system": "KOOLMD", "value": "ORD-2026-00124" }],
  "status": "active",
  "intent": "order",
  "subject": { "reference": "Patient/KMD-000042" },
  "requester": { "reference": "Practitioner/1234567890" },
  "code": { "coding": [{ "system": "http://loinc.org", "code": "58410-2" }] },
  "priority": "routine",
  "specimen": [{ "display": "Whole Blood (EDTA)" }]
}`,
  "sample-results": `{
  "resourceType": "DiagnosticReport",
  "id": "RS123456",
  "status": "final",
  "code": { "coding": [{ "system": "http://loinc.org", "code": "58410-2", "display": "Complete Blood Count" }] },
  "subject": { "reference": "Patient/KMD-000042" },
  "effectiveDateTime": "2026-10-17T08:30:00Z",
  "result": [{
    "code": { "text": "Hemoglobin" },
    "value": "13.2",
    "unit": "g/dL",
    "referenceRange": "12.0 - 16.0",
    "abnormalFlag": "N"
  }]
}`,
};

const IntegrationInfoModal = () => {
  const dispatch = useAppDispatch();
  const open = useAppSelector((state) => state.dialog.IntegrationInfo);
  const kind = useAppSelector((state) => state.dialog.integrationInfoKind);
  const copy = kind ? MODAL_COPY[kind] : MODAL_COPY.documentation;
  const close = () => dispatch(hideModal("IntegrationInfo"));

  return (
    <ModalShell
      open={open}
      onClose={close}
      title={copy.title}
      subtitle={copy.subtitle}
      width={820}
    >
      {(kind === "documentation" || kind === "setup-guide") && (
        <div className="space-y-4">
          <section className="rounded-xl border border-border p-4">
            <h4 className="text-sm font-semibold text-heading">{kind === "documentation" ? "Integration overview" : "1. Configure the connection"}</h4>
            <p className="mt-2 text-sm leading-relaxed text-body">
              KOOLMD exchanges patient and provider data, laboratory orders, diagnostic results, and order status updates with the M13 lab endpoint using the selected FHIR adapter and authentication settings.
            </p>
          </section>
       
          <ol className="space-y-3">
            {GUIDE_STEPS.map(({ step, description }, index) => (
              <li key={step} className="flex gap-3 rounded-xl border border-border p-4">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">{index + 1}</span>
                <span><span className="block text-sm font-semibold text-heading">{step}</span><span className="mt-1 block text-sm text-body">{description}</span></span>
              </li>
            ))}
          </ol>
          <p className="rounded-lg bg-primary/5 px-3 py-2 text-xs text-body">Use the endpoint, credentials, and supported field requirements provided by your lab administrator.</p>
        </div>
      )}

      {kind && SAMPLE_DATA[kind] && (
        <div className="overflow-hidden rounded-xl border border-border">
          <div className="border-b border-border bg-primary/5 px-4 py-2.5 text-xs font-medium text-body">FHIR R4 · JSON sample</div>
          <pre className="max-h-[55vh] overflow-auto bg-card p-4 text-xs leading-relaxed text-heading"><code>{SAMPLE_DATA[kind]}</code></pre>
        </div>
      )}

      {kind === "status-list" && (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="bg-primary/5 text-xs text-body"><tr><th className="px-4 py-3 font-medium">External M13 Status</th><th className="px-4 py-3 font-medium">Meaning</th><th className="px-4 py-3 font-medium">KOOLMD Status</th></tr></thead>
            <tbody>{STATUS_ROWS.map(([external, meaning, mapped]) => <tr key={external} className="border-t border-divider"><td className="px-4 py-3 font-medium text-heading">{external}</td><td className="px-4 py-3 text-body">{meaning}</td><td className="px-4 py-3 text-heading">{mapped}</td></tr>)}</tbody>
          </table>
        </div>
      )}
    </ModalShell>
  );
};

export default IntegrationInfoModal;
