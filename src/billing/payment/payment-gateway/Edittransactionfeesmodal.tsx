"use client";

import React, { useEffect, useState } from "react";
import ModalShell from "@/components/Modalshell";
import { SignupField } from "@/components/Modalshell";
import AddButton from "@/components/Addbutton";
import ImportButton from "@/components/ImportButton";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppHooks";
import { hideModal, savePaymentGatewayFees } from "@/redux/slices/dialogslice";
import { METHODS, type MethodId } from "./Supportedmethods";

type Fees = Record<MethodId, string>;

const EditTransactionFeesModal = () => {
  const dispatch = useAppDispatch();
  const open = useAppSelector((state) => state.dialog.EditPaymentGatewayFees);
  const savedFees = useAppSelector((state) => state.dialog.paymentGatewayFees);
  const [fees, setFees] = useState<Fees>(savedFees);

  useEffect(() => {
    if (open) setFees(savedFees);
  }, [open, savedFees]);

  const close = () => dispatch(hideModal("EditPaymentGatewayFees"));
  const save = () => dispatch(savePaymentGatewayFees(fees));

  return (
    <ModalShell
      open={open}
      onClose={close}
      title="Edit Transaction Fees"
      subtitle="Set the fee displayed for each supported payment method."
      width={640}
      footer={(
        <div className="flex justify-end gap-3">
          <ImportButton text="Cancel" icon={null} onClick={close} />
          <AddButton text="Save Fees" icon={null} onClick={save} />
        </div>
      )}
    >
      <div className="space-y-4">
        {METHODS.map((method) => (
          <SignupField
            key={method.id}
            name={`gateway-fee-${method.id}`}
            label={method.name}
            value={fees[method.id]}
            placeholder="Enter transaction fee"
            onChange={(event) => setFees((current) => ({ ...current, [method.id]: event.target.value }))}
          />
        ))}
      </div>
      <p className="rounded-lg bg-primary/5 px-3 py-2 text-xs text-body">These values are saved in the current session. Gateway fee synchronization is not connected yet.</p>
    </ModalShell>
  );
};

export default EditTransactionFeesModal;
