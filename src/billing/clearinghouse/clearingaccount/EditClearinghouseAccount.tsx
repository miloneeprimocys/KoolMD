"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";

import Breadcrumb from "@/components/Breadcrumb";
import TableStatus from "@/components/TableStatus";

import { ACCOUNTS, ROUTES } from "./ClearinghouseAccounts";
import { AccountForm } from "./AddClearinghouseAccount";

const EditClearinghouseAccount = () => {
  const router = useRouter();
  const id = useSearchParams().get("id");
  const account = ACCOUNTS.find((a) => a.id === id); // TODO: fetch by id from your API

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-4 sm:space-y-5">
      <Breadcrumb
        items={[
          { label: "Billing", href: "/payment/payment-gateway" },
          { label: "Payers", href: ROUTES.list },
          { label: "Accounts", href: ROUTES.list },
          { label: "Edit Account" },
        ]}
      />

      <h2 className="text-lg font-semibold text-heading sm:text-xl 2xl:text-2xl">Edit Clearinghouse Account</h2>

      {account ? (
        <AccountForm
          key={account.id}
          initial={{
            clearinghouse: account.clearinghouse,
            name: account.name,
            environment: account.environment,
            clientId: account.clientId,
            clientSecret: account.clientSecret,
            payerIds: account.payerIds,
          }}
          saveText="Save Changes"
          onCancel={() => router.push(ROUTES.list)}
          onSave={(values) => {
            console.log("update clearinghouse account", account.id, values); // TODO: call your API here
            router.push(ROUTES.list);
          }}
        />
      ) : (
        <div className="overflow-hidden rounded-[14px] border border-border bg-card">
          <TableStatus variant="empty" message="Account not found." />
        </div>
      )}
    </div>
  );
};

export default EditClearinghouseAccount;