"use client";

import React from "react";
import { Check, X } from "lucide-react";

import AddButton from "@/components/Addbutton";
import ModalShell from "@/components/Modalshell";

export type TestResult = {
  success: boolean;
  clearinghouse: string;
  environment: string;
  clientId: string;
  testedAt: string;
};

type Props = {
  open: boolean;
  result: TestResult | null;
  onClose: () => void;
};

/** "abc123xyz789" → "abc123***" */
const maskId = (id: string) => `${id.slice(0, 6)}***`;

const TestConnection = ({ open, result, onClose }: Props) => {
  if (!result) return null;

  const ok = result.success;

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title="Test Connection"
      titleId="test-connection-title"
      width={480}
      footer={
        <div className="flex justify-end">
          <AddButton text="Close" icon={null} onClick={onClose} />
        </div>
      }
    >
      <div className="text-center">
        <span
          className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full text-on-primary ${
            ok ? "bg-success" : "bg-danger"
          }`}
        >
          {ok ? <Check className="h-7 w-7" strokeWidth={3} /> : <X className="h-7 w-7" strokeWidth={3} />}
        </span>
        <h4 className={`mt-3 text-base font-semibold ${ok ? "text-success" : "text-danger"}`}>
          {ok ? "Connection Successful" : "Connection Failed"}
        </h4>
        <p className="mt-1 text-sm text-body">
          {ok
            ? `Successfully connected to ${result.clearinghouse}.`
            : `Could not connect to ${result.clearinghouse}. Check your credentials and try again.`}
        </p>
      </div>

      <dl className="mt-5 space-y-3 rounded-xl bg-primary/[0.05] p-4 text-sm">
        <div className="grid grid-cols-[120px_minmax(0,1fr)] gap-3">
          <dt className="text-body">Environment</dt>
          <dd className="font-medium text-heading">{result.environment}</dd>
        </div>
        <div className="grid grid-cols-[120px_minmax(0,1fr)] gap-3">
          <dt className="text-body">Client ID</dt>
          <dd className="font-medium text-heading">{maskId(result.clientId)}</dd>
        </div>
        <div className="grid grid-cols-[120px_minmax(0,1fr)] gap-3">
          <dt className="text-body">Last Tested</dt>
          <dd className="font-medium text-heading">{result.testedAt}</dd>
        </div>
      </dl>
    </ModalShell>
  );
};

export default TestConnection;