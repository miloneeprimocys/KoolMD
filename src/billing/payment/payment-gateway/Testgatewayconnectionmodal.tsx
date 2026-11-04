"use client";

import React, { useState } from "react";
import { CheckCircle2, PlugZap } from "lucide-react";
import AddButton from "@/components/Addbutton";
import ImportButton from "@/components/ImportButton";
import ModalShell from "@/components/Modalshell";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppHooks";
import { hideModal } from "@/redux/slices/dialogslice";

const TestGatewayConnectionModal = () => {
  const dispatch = useAppDispatch();
  const open = useAppSelector((state) => state.dialog.TestPaymentGatewayConnection);
  const [result, setResult] = useState<"ready" | "demo-complete">("ready");
  const close = () => {
    setResult("ready");
    dispatch(hideModal("TestPaymentGatewayConnection"));
  };
  const runTest = () => setResult("demo-complete");

  return (
    <ModalShell
      open={open}
      onClose={close}
      title="Test Payment Gateway Connection"
      subtitle="Verify that the configured gateway credentials are ready to process requests."
      width={520}
      footer={(
        <div className="flex justify-end gap-3">
          <ImportButton text="Close" icon={null} onClick={close} />
          <AddButton text={result === "ready" ? "Run Test" : "Run Again"} icon={<PlugZap className="h-4 w-4" />} onClick={runTest} />
        </div>
      )}
    >
      <div className={`rounded-xl border p-4 ${result === "demo-complete" ? "border-success/30 bg-success/5" : "border-primary/20 bg-primary/5"}`}>
        <div className="flex items-start gap-3">
          {result === "demo-complete" ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" /> : <PlugZap className="mt-0.5 h-5 w-5 shrink-0 text-primary" />}
          <div>
            <p className="text-sm font-semibold text-heading">{result === "demo-complete" ? "Demo check complete" : "Ready to test"}</p>
            <p className="mt-1 text-sm text-body">
              {result === "demo-complete"
                ? "The test interaction completed. Live gateway validation is not connected yet."
                : "Run a test to check the configured gateway connection."}
            </p>
          </div>
        </div>
      </div>
      <dl className="grid grid-cols-[130px_minmax(0,1fr)] gap-x-3 gap-y-2 rounded-xl border border-border p-4 text-sm">
        <dt className="text-body">Gateway</dt><dd className="font-medium text-heading">Stripe</dd>
        <dt className="text-body">Mode</dt><dd className="font-medium text-heading">Live Mode</dd>
        <dt className="text-body">Credentials</dt><dd className="font-medium text-heading">Configured</dd>
      </dl>
    </ModalShell>
  );
};

export default TestGatewayConnectionModal;
